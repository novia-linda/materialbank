import Parser from 'rss-parser';
import {db,keyFor,putItems} from './admin.mjs';
import {feedFor,normalize,text} from './sources.mjs';
const now=new Date().toISOString(),parser=new Parser({customFields:{item:['media:thumbnail']}});
const owners=await db.collection('access').get();if(owners.size!==1)throw Error('Piloten kräver exakt en ägare.');
const config=await db.doc('users/'+owners.docs[0].id+'/settings/main').get(),sources=config.data()?.sources||[];
const meta=(await db.doc('meta/seed').get()).data()||{};
const all=await db.collection('feed').get(),existing=new Map(all.docs.map(d=>[d.data().id,d.data()]));
let rsshub;
for(const s of sources){
 try{
  let posts;
  if(new URL(s.url).hostname.replace(/^www\./,'')==='instagram.com'){
   const user=new URL(s.url).pathname.split('/').filter(Boolean)[0];
   if(!/^[\w.]+$/.test(user||'')||['p','reel','stories','explore'].includes(user))throw Error('Ange en profillänk.');
   if(!rsshub){process.env.REQUEST_RETRY='0';process.env.REQUEST_TIMEOUT='20000';process.env.INSTAGRAM_COOKIE='';rsshub=await import('rsshub');await rsshub.init({NODE_ENV:'production',INSTAGRAM_COOKIE:'',REQUEST_RETRY:0,REQUEST_TIMEOUT:20000});}
   const result=await rsshub.request('/instagram/user/'+user);if(result.error||!result.item?.length)throw Error('RSSHub returnerade inga inlägg.');
   posts=result.item.filter(p=>/^https:\/\/www\.instagram\.com\/(p|reel)\/[\w-]+\/?$/.test(p.link||''));
  }else{
   const response=await fetch(feedFor(s),{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'LindasLasrum/1.0'}});
   if(!response.ok)throw Error('HTTP '+response.status);const xml=await response.text();if(xml.length>15000000)throw Error('Flödet är för stort.');posts=(await parser.parseString(xml)).items;
  }
  if(!posts?.length)throw Error('Inga inlägg hittades.');
  const items=posts.slice(0,40).map(p=>normalize(s,p,now,existing));await putItems(items);for(const i of items)existing.set(i.id,i);
  Object.assign(s,{status:'ok',checkedAt:now,message:items.length+' inlägg behandlade. Senaste lyckade hämtning '+now});console.log(s.name+': '+items.length+' inlägg');
 }catch(error){Object.assign(s,{status:'error',checkedAt:now,message:'Hämtningen misslyckades. Tidigare innehåll behålls. '+text(error.message).slice(0,180)});console.log(s.name+': misslyckades; tidigare innehåll behålls');}
}
await db.doc('meta/seed').set({...meta,sources,categories:config.data().categories,fetchedAt:now});
for(const s of sources){
 const rows=[...existing.values()].filter(i=>i.sourceId===s.id).sort((a,b)=>(Date.parse(b.publishedAt||b.fetchedAt)||0)-(Date.parse(a.publishedAt||a.fetchedAt)||0));
 for(const item of rows.slice(150))await db.doc('feed/'+keyFor(item.id)).delete();
}
console.log('Klart. Se hämtningsstatus under Källor.');process.exit(0);
