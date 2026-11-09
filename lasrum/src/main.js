import './style.css';
import {shell} from './shell.js';
import {startReader} from './reader.js';
import {records,difference} from './model.js';
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence} from 'firebase/auth';
import {getFirestore,getDoc,getDocs,doc,collection,writeBatch} from 'firebase/firestore';
const $=s=>document.querySelector(s), env=import.meta.env;
const config={apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID};
let dirty=false,latest,committed=new Map(),running=false,cloud,auth,uid;
const message=t=>{$('#syncStatus').textContent=t;};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
async function flush(){
 if(running||!latest)return;
 running=true;$('#retry').hidden=true;
 try{
  while(latest){
   const target=latest;latest=null;
   const changes=difference(committed,target);
   for(let offset=0;offset<changes.length;offset+=400){
    const chunk=changes.slice(offset,offset+400),batch=writeBatch(cloud);
    for(const {key,json} of chunk){const ref=doc(cloud,'users',uid,...key.split('/'));if(json===undefined)batch.delete(ref);else batch.set(ref,JSON.parse(json));}
    await batch.commit();
    for(const {key,json} of chunk){if(json===undefined)committed.delete(key);else committed.set(key,json);}
   }
  }
  dirty=false;message('Sparat i Firebase');
 }catch(error){
  latest=latest||pendingTarget;dirty=true;message('Kunde inte spara. Håll sidan öppen och försök igen.');$('#retry').hidden=false;
 }finally{running=false;}
}
let pendingTarget;
function save(state){
 try{pendingTarget=records(state);latest=pendingTarget;dirty=true;message('Sparar…');flush();}
 catch(error){dirty=true;message(error.message);}
}
$('#retry').onclick=flush;
$('#logout').onclick=async()=>{if(dirty&&!confirm('Det finns osparade ändringar. Logga ut ändå?'))return;dirty=false;await signOut(auth);location.reload();};
if(Object.values(config).some(v=>!v)||!env.VITE_LOGIN_EMAIL||!env.VITE_LOGIN_USERNAME){
 $('#authStatus').textContent='Firebase är inte konfigurerat ännu. Följ STARTA-HAR.md i GitHub-projektet.';$('#login').hidden=true;
}else{
 const app=initializeApp(config);auth=getAuth(app);cloud=getFirestore(app);
 $('#authStatus').textContent='';
 $('#login').onsubmit=async e=>{e.preventDefault();const button=$('#login button');button.disabled=true;$('#authStatus').textContent='Loggar in…';try{
  if($('#username').value.trim().toLowerCase()!==env.VITE_LOGIN_USERNAME.toLowerCase())throw Error('Fel inloggning');
  await setPersistence(auth,browserLocalPersistence);
  await signInWithEmailAndPassword(auth,env.VITE_LOGIN_EMAIL,$('#password').value);$('#password').value='';
 }catch{$('#authStatus').textContent='Inloggningen misslyckades. Kontrollera uppgifterna och anslutningen.';}finally{button.disabled=false;}};
 onAuthStateChanged(auth,async user=>{
  if(!user){$('#auth').hidden=false;$('#app').hidden=true;$('#session').hidden=true;$('#authStatus').textContent='';return;}
  uid=user.uid;
  try{
   const access=await getDoc(doc(cloud,'access',uid));if(!access.exists())throw Error('Ingen åtkomst');
   const [meta,feed,settings,marks]=await Promise.all([getDoc(doc(cloud,'meta','seed')),getDocs(collection(cloud,'feed')),getDoc(doc(cloud,'users',uid,'settings','main')),getDocs(collection(cloud,'users',uid,'marks'))]);
   if(!meta.exists()||!settings.exists())throw Error('Kör initieringen enligt STARTA-HAR.md.');
   const seed={...meta.data(),items:feed.docs.map(d=>d.data())};
   const saved={...settings.data(),marks:{},archives:{}};
   for(const snapshot of marks.docs){const data=snapshot.data();saved.marks[data.itemId]=data.mark;if(data.archive?.id)saved.archives[data.itemId]=data.archive;}
   committed=records(saved);$('#app').innerHTML=shell;$('#auth').hidden=true;$('#app').hidden=false;$('#session').hidden=false;message('Hämtat från Firebase');
   startReader(seed,saved,save);
  }catch(error){$('#authStatus').textContent='Kontot saknar åtkomst eller databasen är inte färdig. Se installationsguiden. '+(error.code||'');await signOut(auth);$('#authStatus').textContent='Kontot saknar åtkomst eller databasen är inte färdig. Se installationsguiden.';}
 });
}
