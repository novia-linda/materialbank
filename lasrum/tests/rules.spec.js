import fs from 'node:fs';import {test,after,before} from 'node:test';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc} from 'firebase/firestore';
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-lasrum',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}});await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await setDoc(doc(db,'access/owner'),{role:'owner'});await setDoc(doc(db,'feed/item'),{title:'test'});});});
after(async()=>env?.cleanup());
test('anonymous and unapproved signed-in users cannot read content',async()=>{await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'feed/item')));await assertFails(getDoc(doc(env.authenticatedContext('stranger').firestore(),'feed/item')));});
test('owner reads content but cannot change server feed or access',async()=>{const db=env.authenticatedContext('owner').firestore();await assertSucceeds(getDoc(doc(db,'feed/item')));await assertFails(setDoc(doc(db,'feed/item'),{title:'changed'}));await assertFails(setDoc(doc(db,'access/stranger'),{role:'owner'}));});
test('owner notes are scoped and validated',async()=>{const db=env.authenticatedContext('owner').firestore(),note={itemId:'i',mark:{read:false,favorite:true,note:'Hej',tags:['AI']},archive:{}};await assertSucceeds(setDoc(doc(db,'users/owner/marks/i'),note));await assertFails(setDoc(doc(db,'users/stranger/marks/i'),note));await assertFails(setDoc(doc(db,'users/owner/marks/i'),{...note,mark:{...note.mark,note:'x'.repeat(20001)}}));});

test('owner settings save, strangers cannot read private notes',async()=>{const db=env.authenticatedContext('owner').firestore();await assertSucceeds(setDoc(doc(db,'users/owner/settings/main'),{version:1,theme:'dark',tags:[],sources:[],categories:[],seedIds:[]}));await assertFails(getDoc(doc(env.authenticatedContext('stranger').firestore(),'users/owner/marks/i')));});
