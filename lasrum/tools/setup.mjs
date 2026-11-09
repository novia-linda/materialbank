import fs from 'node:fs';
import readline from 'node:readline/promises';
import {Writable} from 'node:stream';
import {db,auth,putItems} from './admin.mjs';
// Password is read without echo. Never passed as a command-line argument or saved.
const muted=new Writable({write(chunk,encoding,callback){callback();}});
const rl=readline.createInterface({input:process.stdin,output:muted,terminal:true});
const email=process.env.LOGIN_EMAIL||'linda@lasrum.invalid';
process.stdout.write('Välj lösenord (minst 12 tecken, visas inte): ');
const password=await rl.question('');process.stdout.write('\n');rl.close();
if(password.length<12)throw Error('Lösenordet måste ha minst 12 tecken.');
let user;try{user=await auth.getUserByEmail(email);if(process.env.RESET_PASSWORD==='1'){await auth.updateUser(user.uid,{password});console.log('Lösenordet har ändrats.');}else console.log('Kontot finns redan. Befintligt lösenord behålls.');}catch(error){if(error.code!=='auth/user-not-found')throw error;user=await auth.createUser({email,password,displayName:'Linda',emailVerified:false});}
const data=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url),'utf8'));
await db.doc('access/'+user.uid).set({role:'owner'});
const settings=db.doc('users/'+user.uid+'/settings/main');
if(!(await settings.get()).exists)await settings.set({version:1,theme:'dark',tags:['Till undervisningen','Prova själv','Läs igen'],sources:data.sources,categories:data.categories,seedIds:data.sources.map(s=>s.id)});
if(!(await db.doc('meta/seed').get()).exists){const {items,...meta}=data;await putItems(items);await db.doc('meta/seed').set(meta);}
console.log('Kontot och startmaterialet är klara. UID:',user.uid);
