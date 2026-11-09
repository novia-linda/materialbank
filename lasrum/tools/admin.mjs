import fs from 'node:fs';
import {initializeApp,cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
const raw=process.env.FIREBASE_SERVICE_ACCOUNT|| (process.env.GOOGLE_APPLICATION_CREDENTIALS ? fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS,'utf8') : '');
if(!raw)throw Error('Ange GOOGLE_APPLICATION_CREDENTIALS till din privata nyckelfil eller FIREBASE_SERVICE_ACCOUNT i GitHub Secrets.');
initializeApp({credential:cert(JSON.parse(raw))});
export const db=getFirestore();export const auth=getAuth();
export const keyFor=id=>Buffer.from(id).toString('hex');
export async function putUserItems(uid,items){
 for(let n=0;n<items.length;n+=400){const batch=db.batch();for(const item of items.slice(n,n+400))batch.set(db.collection('users').doc(uid).collection('feed').doc(keyFor(item.id)),item);await batch.commit();}
}
