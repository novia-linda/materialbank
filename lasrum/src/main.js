import './style.css';
import {shell} from './shell.js';
import {startReader} from './reader.js';
import {records,difference,keyFor} from './model.js';
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signOut,setPersistence,browserLocalPersistence} from 'firebase/auth';
import {getFirestore,getDoc,getDocs,doc,collection,writeBatch,setDoc} from 'firebase/firestore';
const $=s=>document.querySelector(s),env=import.meta.env;
const config={apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID};
let dirty=false,latest,committed=new Map(),running=false,cloud,auth,uid,admin=false;
const message=t=>{$('#syncStatus').textContent=t;};
const show=id=>{for(const name of ['auth','pending','denied','session','adminPanel','app'])$('#'+name).hidden=name!==id;};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
async function flush(){
 if(running||!latest)return;running=true;$('#retry').hidden=true;
 try{while(latest){const target=latest;latest=null;const changes=difference(committed,target);for(let offset=0;offset<changes.length;offset+=400){const chunk=changes.slice(offset,offset+400),batch=writeBatch(cloud);for(const {key,json} of chunk){const ref=doc(cloud,'users',uid,...key.split('/'));if(json===undefined)batch.delete(ref);else batch.set(ref,JSON.parse(json));}await batch.commit();for(const {key,json} of chunk){if(json===undefined)committed.delete(key);else committed.set(key,json);}}}dirty=false;message('Sparat i Firebase');}
 catch{latest=latest||pendingTarget;dirty=true;message('Kunde inte spara. Håll sidan öppen och försök igen.');$('#retry').hidden=false;}finally{running=false;}
}
let pendingTarget;
function save(state){try{pendingTarget=records(state);latest=pendingTarget;dirty=true;message('Sparar…');flush();}catch(error){dirty=true;message(error.message);}}
$('#retry').onclick=flush;
$('#logout').onclick=async()=>{if(dirty&&!confirm('Det finns osparade ändringar. Logga ut ändå?'))return;dirty=false;await signOut(auth);};
$('#pendingLogout').onclick=()=>signOut(auth);$('#deniedLogout').onclick=()=>signOut(auth);
function setPendingText(){const name=auth.currentUser?.displayName;$('#pendingMessage').textContent=(name?name+', din förfrågan':'Din förfrågan')+' har skickats till Linda. Du kan återkomma hit när du fått klartecken.';}
async function checkUser(user){
 uid=user.uid;admin=false;show('pending');$('#pendingMessage').textContent='Kontrollerar ditt konto…';
 try{
  const accessRef=doc(cloud,'access',uid);let snap=await getDoc(accessRef);
  if(!snap.exists()){
   await setDoc(accessRef,{email:user.email,displayName:user.displayName||'Google-användare',status:'pending',requestedAt:new Date().toISOString()});
   setPendingText();return;
  }
  const access=snap.data();
  if(access.status==='pending'){setPendingText();return;}
  if(access.status!=='approved'){show('denied');return;}
  admin=access.role==='admin';
  const [meta,settingsSnap,feedSnap,marksSnap,statusSnap]=await Promise.all([getDoc(doc(cloud,'meta','seed')),getDoc(doc(cloud,'users',uid,'settings','main')),getDocs(collection(cloud,'users',uid,'feed')),getDocs(collection(cloud,'users',uid,'marks')),getDocs(collection(cloud,'users',uid,'sourceStatus'))]);
  if(!meta.exists()||!settingsSnap.exists())throw Error('Kontot har godkänts men grundinställningarna saknas. Be administratören öppna Hantera åtkomst igen.');
  const statusById=new Map(statusSnap.docs.map(s=>[s.data().sourceId,s.data()]));
  const configured=settingsSnap.data();
  configured.sources=configured.sources.map(s=>{const status=statusById.get(s.id);return status?.url===s.url?{...s,status:status.status,message:status.message,checkedAt:status.checkedAt}:s;});
  const saved={...configured,marks:{},archives:{}};
  for(const s of marksSnap.docs){const value=s.data();saved.marks[value.itemId]=value.mark;if(value.archive?.id)saved.archives[value.itemId]=value.archive;}
  const seed={...meta.data(),...configured,items:feedSnap.docs.map(d=>d.data())};
  committed=records(saved);$('#app').innerHTML=shell;show('session');$('#adminPanel').hidden=!admin;message('Hämtat från Firebase');startReader(seed,saved,save);
  if(admin){$('#managePeople').onclick=showRequests;await countPending();}
 }catch(error){show('pending');$('#pendingMessage').textContent=error.message||'Det gick inte att läsa kontot. Kontrollera anslutningen och försök igen.';}
}
async function countPending(){try{const rows=await getDocs(collection(cloud,'access'));const n=rows.docs.filter(d=>d.data().status==='pending').length;$('#pendingCount').textContent=n?' · '+n+' väntar':'';}catch{}}
async function showRequests(){
 const dialog=$('#adminDialog'),list=$('#accessRequests');$('#adminStatus').textContent='Hämtar förfrågningar…';list.innerHTML='';dialog.showModal();
 try{
  const rows=await getDocs(collection(cloud,'access')),pending=rows.docs.filter(s=>s.data().status==='pending');
  $('#adminStatus').textContent=pending.length?pending.length+' väntar på ditt beslut.':'Inga nya förfrågningar.';
  for(const snap of pending){const d=snap.data(),row=document.createElement('article');row.className='access-request';const info=document.createElement('div'),title=document.createElement('strong'),email=document.createElement('small');title.textContent=d.displayName||'Google-användare';email.textContent=d.email||'';info.append(title,email);const approve=document.createElement('button'),deny=document.createElement('button');approve.textContent='Godkänn';deny.textContent='Avvisa';deny.className='deny';approve.onclick=()=>approveUser(snap.id,d,approve,deny);deny.onclick=()=>denyUser(snap.id,d,approve,deny);row.append(info,approve,deny);list.append(row);}
  await countPending();
 }catch{$('#adminStatus').textContent='Kunde inte läsa förfrågningarna. Kontrollera adminbehörigheten.';}
}
async function approveUser(target,d,approve,deny){
 approve.disabled=true;deny.disabled=true;$('#adminStatus').textContent='Godkänner och skapar ett eget flöde…';
 try{
  const [meta,settings,feed]=await Promise.all([getDoc(doc(cloud,'meta','seed')),getDoc(doc(cloud,'users',uid,'settings','main')),getDocs(collection(cloud,'users',uid,'feed'))]);
  if(!meta.exists()||!settings.exists())throw Error('Startmaterialet saknas.');
  const batch=writeBatch(cloud),access=doc(cloud,'access',target);
  batch.update(access,{status:'approved',role:'reader',approvedAt:new Date().toISOString()});
  const initial={version:1,theme:'dark',tags:['Till undervisningen','Prova själv','Läs igen'],sources:meta.data().sources,categories:meta.data().categories,seedIds:meta.data().sources.map(s=>s.id)};
  batch.set(doc(cloud,'users',target,'settings','main'),initial);
  const initialSources=new Set(initial.sources.map(s=>s.id)),perSource=new Map();
  const starterItems=feed.docs.map(s=>s.data()).filter(item=>initialSources.has(item.sourceId)).sort((a,b)=>(Date.parse(b.publishedAt||b.fetchedAt)||0)-(Date.parse(a.publishedAt||a.fetchedAt)||0)).filter(item=>{const count=perSource.get(item.sourceId)||0;if(count>=40)return false;perSource.set(item.sourceId,count+1);return true;});
  for(const item of starterItems)batch.set(doc(cloud,'users',target,'feed',keyFor(item.id)),item);
  await batch.commit();$('#adminStatus').textContent='Godkänd. Ett eget flöde har skapats.';await showRequests();
 }catch(error){$('#adminStatus').textContent='Kunde inte godkänna: '+(error.code||error.message);approve.disabled=false;deny.disabled=false;}
}
async function denyUser(target,d,approve,deny){
 approve.disabled=true;deny.disabled=true;
 try{const batch=writeBatch(cloud);batch.update(doc(cloud,'access',target),{status:'denied',role:'reader',approvedAt:new Date().toISOString()});await batch.commit();await showRequests();}
 catch(error){$('#adminStatus').textContent='Kunde inte avvisa: '+(error.code||error.message);approve.disabled=false;deny.disabled=false;}
}
$('#closeAdmin').onclick=()=>$('#adminDialog').close();$('#checkApproval').onclick=async()=>{const user=auth.currentUser;if(user)await checkUser(user);};
if(Object.values(config).some(v=>!v)){$('#authStatus').textContent='Firebase är inte konfigurerat ännu. Följ STARTA-HAR.md i GitHub-projektet.';$('#googleLogin').hidden=true;}
else{
 const app=initializeApp(config);auth=getAuth(app);cloud=getFirestore(app);$('#authStatus').textContent='';
 $('#googleLogin').onclick=async()=>{const button=$('#googleLogin');button.disabled=true;$('#authStatus').textContent='Öppnar Google-inloggningen…';try{await setPersistence(auth,browserLocalPersistence);const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});if(matchMedia('(max-width: 700px)').matches)await signInWithRedirect(auth,provider);else await signInWithPopup(auth,provider);}catch{$('#authStatus').textContent='Google-inloggningen avbröts eller misslyckades. Försök igen.';button.disabled=false;}};
 getRedirectResult(auth).catch(()=>{$('#authStatus').textContent='Google-inloggningen kunde inte slutföras. Försök igen.';});
 onAuthStateChanged(auth,user=>{if(!user){show('auth');return;}checkUser(user);});
}
