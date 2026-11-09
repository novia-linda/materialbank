import Parser from 'rss-parser';
import {db,keyFor,putUserItems} from './admin.mjs';
import {feedFor,normalize,text} from './sources.mjs';
const now=new Date().toISOString(),parser=new Parser({customFields:{item:['media:thumbnail']}});
const accounts=await db.collection('access').get();
const approved=accounts.docs.filter(d=>d.data().status==='approved');
if(!approved.length)throw Error('Inga godkända konton finns.');
let rsshub;
for(const account of approved){
 const uid=account.id,settingsRef=db.doc('users/'+uid+'/settings/main'),settingsSnap=await settingsRef.get();
 if(!settingsSnap.exists)continue;
 const settings=settingsSnap.data(),sources=settings.sources||[],feedRef=db.collection('users').doc(uid).collection('feed');
 const all=await feedRef.get(),existing=new Map(all.docs.map(d=>[d.data().id,d.data()]));
 console.log('Konto '+uid+': '+sources.length+' källor');
 for(const source of sources){
  try{
   let posts;
   if(new URL(source.url).hostname.replace(/^www\./,'')==='instagram.com'){
    const user=new URL(source.url).pathname.split('/').filter(Boolean)[0];
    if(!/^[\w.]+$/.test(user||'')||['p','reel','stories','explore'].includes(user))throw Error('Ange en profillänk.');
    if(!rsshub){process.env.REQUEST_RETRY='0';process.env.REQUEST_TIMEOUT='20000';process.env.INSTAGRAM_COOKIE='';rsshub=await import('rsshub');await rsshub.init({NODE_ENV:'production',INSTAGRAM_COOKIE:'',REQUEST_RETRY:0,REQUEST_TIMEOUT:20000});}
    const result=await rsshub.request('/instagram/user/'+user);if(result.error||!result.item?.length)throw Error('RSSHub returnerade inga inlägg.');
    posts=result.item.filter(p=>/^https:\/\/www\.instagram\.com\/(p|reel)\/[\w-]+\/?$/.test(p.link||''));
   }else{
    const response=await fetch(feedFor(source),{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'LindasLasrum/1.0'}});
    if(!response.ok)throw Error('HTTP '+response.status);const xml=await response.text();if(xml.length>15000000)throw Error('Flödet är för stort.');posts=(await parser.parseString(xml)).items;
   }
   if(!posts?.length)throw Error('Inga inlägg hittades.');
   const items=posts.slice(0,40).map(p=>normalize(source,p,now,existing));
   await putUserItems(uid,items);for(const item of items)existing.set(item.id,item);
   Object.assign(source,{status:'ok',checkedAt:now,message:items.length+' inlägg behandlade. Senaste lyckade hämtning '+now});
   console.log(source.name+': '+items.length+' inlägg');
  }catch(error){Object.assign(source,{status:'error',checkedAt:now,message:'Hämtningen misslyckades. Tidigare innehåll behålls. '+text(error.message).slice(0,180)});console.log(source.name+': misslyckades; tidigare innehåll behålls');}
  await db.doc('users/'+uid+'/sourceStatus/'+keyFor(source.id)).set({sourceId:source.id,url:source.url,status:source.status,checkedAt:source.checkedAt||now,message:source.message||''});
 }
 for(const source of sources){
  const rows=[...existing.values()].filter(item=>item.sourceId===source.id).sort((a,b)=>(Date.parse(b.publishedAt||b.fetchedAt)||0)-(Date.parse(a.publishedAt||a.fetchedAt)||0));
  for(const item of rows.slice(150))await feedRef.doc(keyFor(item.id)).delete();
 }
}
console.log('Klart. Se hämtningsstatus under Källor i varje läsrum.');process.exit(0);
