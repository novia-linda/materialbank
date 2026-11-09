import fs from 'node:fs';
import {test,after,before} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,getDocs,setDoc,collection,writeBatch} from 'firebase/firestore';
let env;
const profile=(db,uid)=>doc(db,'access',uid);
const note={itemId:'i',mark:{read:false,favorite:true,note:'Hej',tags:['AI']},archive:{}};
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-lasrum',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}});
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await setDoc(profile(db,'admin'),{role:'admin',status:'approved',email:'admin@example.com'});await setDoc(profile(db,'reader'),{role:'reader',status:'approved',email:'reader@example.com'});await setDoc(profile(db,'pending'),{role:'reader',status:'pending',email:'pending@example.com'});await setDoc(doc(db,'meta/seed'),{categories:[],sources:[]});await setDoc(doc(db,'users/reader/feed/item'),{id:'item',title:'reader item'});await setDoc(doc(db,'users/admin/feed/item'),{id:'item',title:'admin item'});});
});
after(async()=>env?.cleanup());
test('a Google account can request access only for itself',async()=>{
 const db=env.authenticatedContext('new-user',{email:'new@example.com',email_verified:true}).firestore();
 await assertSucceeds(setDoc(profile(db,'new-user'),{email:'new@example.com',displayName:'New',status:'pending',requestedAt:'now'}));
 await assertFails(setDoc(profile(db,'someone-else'),{email:'new@example.com',displayName:'New',status:'pending',requestedAt:'now'}));
 await assertFails(setDoc(profile(db,'bad-email'),{email:'other@example.com',displayName:'New',status:'pending',requestedAt:'now'}));
});
test('pending and denied accounts cannot read personal feeds',async()=>{
 const pending=env.authenticatedContext('pending').firestore(),stranger=env.authenticatedContext('stranger').firestore();
 await assertFails(getDoc(doc(pending,'users/pending/feed/item')));
 await assertFails(getDoc(doc(stranger,'users/reader/feed/item')));
 await assertFails(getDoc(doc(pending,'meta/seed')));
 await assertFails(getDoc(doc(pending,'users/pending/sourceStatus/one')));
});
test('an admin can approve a pending account and seed its own workspace',async()=>{
 const db=env.authenticatedContext('admin').firestore(),batch=writeBatch(db);
 batch.update(profile(db,'pending'),{status:'approved',role:'reader',approvedAt:'today'});
 batch.set(doc(db,'users/pending/settings/main'),{version:1,theme:'dark',tags:[],sources:[],categories:[],seedIds:[]});
 batch.set(doc(db,'users/pending/feed/welcome'),{id:'welcome',title:'welcome'});
 await assertSucceeds(batch.commit());
 const pendingDb=env.authenticatedContext('pending').firestore();
 await assertSucceeds(getDoc(doc(pendingDb,'users/pending/feed/welcome')));
 await assertFails(getDoc(doc(pendingDb,'users/reader/feed/item')));
});
test('each approved reader sees only their own settings, marks, and feed',async()=>{
 const reader=env.authenticatedContext('reader').firestore();
 await assertSucceeds(getDoc(doc(reader,'users/reader/feed/item')));
 await assertSucceeds(getDoc(doc(reader,'meta/seed')));
 await assertSucceeds(setDoc(doc(reader,'users/reader/marks/i'),note));
 await assertFails(getDoc(doc(reader,'users/admin/feed/item')));
 await assertFails(setDoc(doc(reader,'users/admin/marks/i'),note));
 await assertFails(setDoc(doc(reader,'access/stranger'),{email:'x',status:'approved',role:'admin'}));
 await assertFails(setDoc(doc(reader,'users/reader/feed/private'),{id:'private'}));
 await assertFails(setDoc(doc(reader,'users/reader/sourceStatus/one'),{sourceId:'one',status:'ok'}));
 await assertFails(setDoc(doc(reader,'users/reader/marks/long'),{...note,mark:{...note.mark,note:'x'.repeat(20001)}}));
});
test('an admin can list pending requests but cannot see another user’s notes',async()=>{
 const admin=env.authenticatedContext('admin').firestore();
 await assertSucceeds(getDocs(collection(admin,'access')));
 await assertFails(getDoc(doc(admin,'users/reader/marks/i')));
});
