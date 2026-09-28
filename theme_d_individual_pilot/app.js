/* Theme D individual pilot. All interaction and export run on the device.
   Automatic network requests load the public question JSON and optional teacher
   example images. Teacher examples are never part of a student draft or report.
   Original evidence is checked by the student, never automatically marked. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STATUS={correct:{icon:'\u2713',label:'Correct'},partial:{icon:'!',label:'Partly correct'},incorrect:{icon:'\u00d7',label:'Incorrect / no answer'}};
let config,level,state,db=null,current='primer',timer=null,queue=Promise.resolve(),revision=0,savedRevision=-1,exportedRevision=-1,previewScene=null,toastTimer,crop=null,booted=false;
const memory={};const clientId=Math.random().toString(36).slice(2);let channel;
const teacherExampleCache=new Map(),examplePageStamp=Date.now().toString(36);
let exampleReturnFocus=null;
function say(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
function safeAction(fn){return (...args)=>Promise.resolve().then(()=>fn(...args)).catch(showError);}
function showError(err){console.error(err);say(err.message||String(err));$('fit-message').hidden=false;$('fit-message').className='notice danger';$('fit-message').textContent=err.message||String(err);}
function blank(l){return {student:'',assistant:l.id==='primer'?'Practice':'',...(l.id==='primer'?{primerFormat:'simple-tech-v1'}:{}),tests:Object.fromEntries(l.questions.map(q=>[q.id,{answer:'',first:'',latest:'',retested:false,sources:[],refs:{},readOriginal:false,fix:''}])),images:[null,null],improvement:'',reflection:'',checklist:{},experiment:{performed:false,outcome:'',wait:'',note:''},pdfChecked:false,updatedAt:null};}
const dbKey=id=>config.appId+'|'+config.contentVersion+'|'+location.pathname+'|'+id+(id==='primer'?'|simple-tech-v1':'');
function openDB(){return new Promise(resolve=>{
 try{const r=indexedDB.open('AIIB-Individual-Evidence-Lab',1);let done=false;const fallback=setTimeout(()=>{if(!done){done=true;resolve(null);}},3500);
 r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('levels'))r.result.createObjectStore('levels');};
 r.onsuccess=()=>{clearTimeout(fallback);if(done){r.result.close();return;}done=true;resolve(r.result);};
 r.onerror=()=>{clearTimeout(fallback);if(!done){done=true;resolve(null);}};r.onblocked=()=>{clearTimeout(fallback);if(!done){done=true;resolve(null);}};
 }catch{resolve(null);}
});}
function readDB(id){if(!db)return Promise.resolve(null);return new Promise(resolve=>{try{let r=db.transaction('levels').objectStore('levels').get(dbKey(id));r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null);}catch{resolve(null);}});}
function writeDB(id,snapshot){if(!db)return Promise.reject(Error('Local storage is unavailable. Keep this tab open and download a backup.'));return new Promise((resolve,reject)=>{try{let tr=db.transaction('levels','readwrite');tr.objectStore('levels').put(snapshot,dbKey(id));tr.oncomplete=resolve;tr.onerror=()=>reject(tr.error||Error('Local save failed.'));tr.onabort=()=>reject(tr.error||Error('Local save was interrupted.'));}catch(e){reject(e);}});}
function save(){
 if(!booted||!state)return;clearTimeout(timer);const id=current,snapshot=JSON.parse(JSON.stringify(state)),rev=revision;
 queue=queue.catch(()=>{}).then(()=>writeDB(id,snapshot)).then(()=>{
  if(current===id&&revision===rev){savedRevision=rev;$('save-status').classList.remove('error');$('save-status').textContent='Saved on this device at '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
  if(channel)channel.postMessage({client:clientId,key:dbKey(id),time:Date.now()});
 }).catch(e=>{if(current===id){$('save-status').classList.add('error');$('save-status').textContent=e.message+' Your current work is still in this tab.';}});
 return queue;
}
function changed(){revision++;exportedRevision=-1;state.pdfChecked=false;$('pdf-checked').checked=false;state.updatedAt=new Date().toISOString();memory[current]=state;$('save-status').classList.remove('error');$('save-status').textContent=db?'Saving on this device...':'Local storage unavailable - download a backup.';clearTimeout(timer);timer=setTimeout(save,450);updateProgress();}
function validity(){
 if(level.id==='primer'){
  const parts=[{label:'Name entered',n:Number(!!state.student.trim()),d:1},
   {label:'Images added',n:state.images.filter(Boolean).length,d:2},
   {label:'Demo text filled in',n:Number(!!state.improvement.trim())+Number(!!state.reflection.trim()),d:2},
   {label:'Checkbox tried',n:Number(state.checklist[0]===true),d:1}];
  return {parts,issues:[],complete:parts.every(p=>p.n>=p.d)};
 }
 let done=0,checked=0,issues=[];
 level.questions.forEach(q=>{let t=state.tests[q.id];if(t.answer.trim()&&t.first&&(!t.retested||t.latest))done++;
 if(t.readOriginal&&t.sources.length&&t.sources.every(k=>(t.refs[k]||'').trim()))checked++;
 if((t.first==='partial'||t.first==='incorrect')&&!t.fix.trim())issues.push(q.id+': record the action taken or the remaining limitation.');
 });
 const required=level.screenshots.map((s,i)=>s.required?i:-1).filter(i=>i>=0);
 let imageCount=required.filter(i=>!!state.images[i]).length;
 const checks=Object.values(state.checklist).filter(Boolean).length;
 let parts=[{label:'Tests documented',n:done,d:level.questions.length},{label:'Original sources checked',n:checked,d:level.questions.length},{label:'Required screenshots',n:imageCount,d:required.length},{label:'Short closing notes',n:Number(!!state.improvement.trim())+Number(!!state.reflection.trim()),d:2}];
 if(level.id==='primer')parts.push({label:'Practice checklist',n:checks,d:config.primerChecklist.length});
 if(level.experiment){const e=state.experiment,recorded=e.outcome&&((e.outcome==='untested'&&e.note.trim())||(e.outcome!=='untested'&&e.performed));parts.push({label:'Update attempt or limitation',n:Number(!!recorded),d:1});}
 if(!state.student.trim())issues.push('Add your name.');if(!state.assistant.trim())issues.push('Add the assistant name.');
 return {parts,issues,complete:parts.every(p=>p.n>=p.d)&&!issues.length};
}
function updateProgress(){
 if(!state)return;const v=validity();
 $('progress-items').innerHTML=v.parts.map(p=>'<div class="progress-item"><span>'+esc(p.label)+'</span><strong>'+p.n+'/'+p.d+'</strong></div>').join('');
 let n=v.parts.reduce((a,p)=>a+p.n,0),d=v.parts.reduce((a,p)=>a+p.d,0);$('meter-fill').style.width=(n/d*100)+'%';
 $('test-count').textContent=level.id==='primer'?'':v.parts[0].n+'/'+level.questions.length+' recorded';
 $('completion-list').innerHTML=v.parts.map(p=>'<div class="completion-entry">'+(p.n>=p.d?'\u2713':'\u25cb')+' '+esc(p.label)+' <em>'+p.n+'/'+p.d+'</em></div>').join('')+v.issues.map(t=>'<p class="unverified-note">'+esc(t)+'</p>').join('');
 $('improvement-count').textContent=level.id==='primer'?'A few words are enough.':state.improvement.length+'/240 characters';$('reflection-count').textContent=level.id==='primer'?'Any words are fine.':state.reflection.length+'/260 characters';$('primer-finished').hidden=!(level.id==='primer'&&state.pdfChecked&&v.complete);
 level.questions.forEach(q=>{let t=state.tests[q.id],node=document.querySelector('[data-badge="'+q.id+'"]');if(node){const s=t.retested?t.latest:t.first;node.textContent=STATUS[s]?.icon||'\u2014';node.title=STATUS[s]?.label||'Not tested';}
 let cnt=document.querySelector('[data-counter="'+q.id+'"]');if(cnt)cnt.textContent=t.answer.length+'/250 characters. Summarise the answer; do not paste a whole chat.';
 });
}
function resultInputs(q,which,value){return '<fieldset class="result-group"><legend>'+(which==='first'?'First attempt':'Latest retest')+'</legend><div class="result-options">'+Object.entries(STATUS).map(([id,s])=>'<label class="result-option"><input type="radio" name="'+q.id+'-'+which+'" data-q="'+q.id+'" data-status="'+which+'" value="'+id+'" '+(value===id?'checked':'')+'><span><b class="status-symbol" aria-hidden="true">'+s.icon+'</b> '+s.label+'</span></label>').join('')+'</div></fieldset>';}
function renderQuestion(q,i){const t=state.tests[q.id];return '<details class="q-card" '+(i===0?'open':'')+'><summary><span class="q-id">'+q.id+'</span><span class="q-label">'+esc(q.label)+'</span><span class="q-status" data-badge="'+q.id+'" aria-label="Current result">'+(STATUS[t.retested?t.latest:t.first]?.icon||'\u2014')+'</span></summary><div class="q-body"><div class="question-prompt"><button type="button" data-copy="'+q.id+'" class="secondary">Copy question</button>'+esc(q.question)+'</div>'+resultInputs(q,'first',t.first)+'<label>Assistant answer - short summary<textarea data-q="'+q.id+'" data-field="answer" rows="3" maxlength="250" placeholder="Include the important fact and condition. If no answer was given, record that.">'+esc(t.answer)+'</textarea><span class="counter" data-counter="'+q.id+'"></span></label><div class="retest-area"><label class="check"><input type="checkbox" data-q="'+q.id+'" data-retest '+(t.retested?'checked':'')+'>I retested this question.</label><div data-latest="'+q.id+'" '+(t.retested?'':'hidden')+'>'+resultInputs(q,'latest',t.latest)+'</div><label>Action or remaining limitation <span class="small">(working note; include the main improvement in the closing note)</span><input data-q="'+q.id+'" data-field="fix" maxlength="130" value="'+esc(t.fix)+'" placeholder="Required if the first attempt was partial or incorrect."></label></div><h3 style="margin-top:20px;font-size:14px">Where did you verify the answer?</h3><p class="small">Choose original sources you actually read. Multiple sources are allowed. Exact references appear in the PDF.</p><div class="source-options">'+level.sourceIds.map(id=>{let source=config.sources.find(s=>s.id===id);return '<label class="check"><input data-q="'+q.id+'" data-source="'+id+'" type="checkbox" '+(t.sources.includes(id)?'checked':'')+'>'+esc(source.label)+'</label>';}).join('')+'</div><div class="ref-fields" data-refs="'+q.id+'">'+renderRefs(q)+'</div><label class="check evidence-read"><input type="checkbox" data-q="'+q.id+'" data-read '+(t.readOriginal?'checked':'')+'>I read the original source and checked what it supports. I did not rely only on the assistant\'s citation.</label></div></details>';}
function renderRefs(q){let t=state.tests[q.id];return t.sources.map(k=>'<label>'+esc(config.sources.find(s=>s.id===k).label)+' - exact location<input data-q="'+q.id+'" data-ref="'+k+'" maxlength="70" value="'+esc(t.refs[k]||'')+'" placeholder="For example, P03; E04; or ORD-1042, Status"></label>').join('');}
function renderImages(){
 const simple=level.id==='primer';
 $('image-slots').innerHTML=level.screenshots.map((s,i)=>{let img=state.images[i];return '<div class="image-slot"><h3>'+(simple?'Image ':'Screenshot ')+(i+1)+' - '+esc(s.title)+(s.required?'':' (optional)')+'</h3><p class="small">'+esc(s.help)+'</p><div class="teacher-example-link" data-example-holder="'+i+'" hidden><button type="button" class="secondary example-button" data-teacher-example="'+i+'" aria-haspopup="dialog" aria-controls="example-dialog">See an example</button></div><div class="image-drop" data-drop="'+i+'" tabindex="0" role="group" aria-label="Screenshot '+(i+1)+' upload area. Drop a file here, or focus and paste a screenshot.">'+(img?'<img src="'+img.data+'" alt="Screenshot '+(i+1)+' preview" data-full-image="'+i+'">':'<span>Drop an image here, or focus this box and paste a screenshot.<br>You can also choose a file below.</span>')+'</div><label class="small">Choose '+(simple?'image ':'screenshot ')+(i+1)+'<input data-image-file="'+i+'" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="image-tools">'+((simple||config.pilot)?'<button data-dummy-image="'+i+'" class="secondary">'+(simple?'Use a demo image':'Use a dummy image')+'</button>':'')+''+(img?'<button data-crop="'+i+'" class="secondary">Crop for readability</button><button data-open-image="'+i+'" class="quiet">View larger</button><button data-remove-image="'+i+'" class="quiet">Remove</button>':'')+'</div><p class="image-message">'+(img?esc(img.name)+' | '+img.w+' x '+img.h+' px. '+(simple?'Added. You do not need to crop it for this practice.':(img.w/img.h<3?'This is a tall image for the wide PDF area. Consider cropping or check the A4 preview.':'Check text readability in the A4 preview.')):(simple?'Any non-private image is fine. The content is not assessed.':'Keep important text; remove irrelevant browser space.'))+'</p></div>';}).join('');
 bindImageEvents();
 attachTeacherExamples();
}
// Optional guidance images: fixed local filenames, no directory listing or manifest.
// Loading a guide must never mark a task complete, change a draft, or add evidence.
function teacherExampleFile(lid,index){
 const l=config.levels.find(v=>v.id===lid),slot=l?.screenshots[index];
 if(!slot||slot.exampleFile===false)return null;
 const fallback=(lid==='primer'?'primer':'level-'+lid)+'-screen-'+(index+1)+'.png';
 const file=slot.exampleFile||fallback;
 if(typeof file!=='string'||!/^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp)$/.test(file))return null;
 return file;
}
function probeTeacherExample(lid,index){
 const file=teacherExampleFile(lid,index);if(!file)return Promise.resolve(null);
 let url;try{url=new URL('examples/'+file,document.baseURI);}catch{return Promise.resolve(null);}
 if(!['https:','http:','file:'].includes(url.protocol))return Promise.resolve(null);
 // A page-specific query retries images after a teacher upload and page refresh.
 // Positive and negative results are cached only within this open page.
 url.searchParams.set('example',examplePageStamp);
 const key=url.href;if(teacherExampleCache.has(key))return teacherExampleCache.get(key);
 const task=new Promise(resolve=>{
  const image=new Image();let finished=false;
  const finish=ok=>{if(finished)return;finished=true;clearTimeout(timeout);image.onload=null;image.onerror=null;
   resolve(ok&&image.naturalWidth>0&&image.naturalHeight>0?{image,url:key,file}:null);};
  const timeout=setTimeout(()=>finish(false),10000);
  image.onload=()=>finish(true);image.onerror=()=>finish(false);image.decoding='async';image.referrerPolicy='no-referrer';image.src=key;
 });
 teacherExampleCache.set(key,task);return task;
}
function attachTeacherExamples(){
 const lid=current;
 level.screenshots.forEach((_,i)=>{
  const holder=document.querySelector('[data-example-holder="'+i+'"]');
  if(!holder)return;
  probeTeacherExample(lid,i).then(result=>{
   // An earlier level may finish loading after the student has switched levels.
   if(holder.isConnected&&current===lid&&result)holder.hidden=false;
  }).catch(()=>{}); // Optional guidance never blocks the reporting workflow.
 });
}
async function showTeacherExample(index,trigger){
 const lid=current,slot=level.screenshots[index],result=await probeTeacherExample(lid,index);
 if(!result||current!==lid){if(trigger?.isConnected)trigger.closest('[data-example-holder]').hidden=true;return;}
 const label=(lid==='primer'?'Technical practice':'Level '+lid)+' / Screenshot '+(index+1);
 $('example-title').textContent=label+' - Teacher example';
 $('example-caption').textContent=slot.exampleDescription||slot.help;
 result.image.alt=label+': '+slot.title+'. Teacher example, not student evidence.';
 result.image.className='teacher-example-image';
 $('example-image-host').replaceChildren(result.image);
 $('example-full-link').href=result.url;
 exampleReturnFocus=trigger;$('example-dialog').showModal();
}
function closeTeacherExample(){if($('example-dialog').open)$('example-dialog').close();}

function renderMode(){
 const simple=level.id==='primer';document.body.classList.toggle('is-primer',simple);
 $('hero-kicker').textContent=simple?'A QUICK TECHNICAL CHECK':'BUILD. TEST. VERIFY. REPORT.';
 $('hero-title').textContent=simple?'Try it. Nothing to get wrong.':'Make your evidence visible.';
 $('hero-description').textContent=simple?'Just a name, two images, a few words and one click. Then open your demo PDF.':'A workspace for one level at a time. Check original sources, add your screenshots and create a one-page report.';
 $('pilot-notice').hidden=simple||!config.pilot;$('assistant-label').hidden=simple;$('teacher-tools').hidden=simple||!config.pilot;$('tests-panel').hidden=simple;
 $('primer-text-help').hidden=!simple;
 $('images-kicker').textContent=simple?'01 / TRY TWO IMAGES':'02 / SHOW YOUR WORK';
 $('images-title').textContent=simple?'Add any two images':'Add screenshot evidence';
 $('images-help').textContent=simple?'Use any two non-private images or screenshots. Their content does not matter. You can also use the demo image buttons below.':'Your report uses two wide image areas at the top. Crop to the relevant text for readability; the app never crops an uploaded image without your approval.';
 $('images-privacy').textContent=simple?'PNG, JPG or WebP. Images stay in this browser and your downloaded files. Nothing is submitted.':'PNG, JPG or WebP. Use a screenshot of your work, not private customer information or an account menu. Images stay in this browser and your downloaded files.';
 $('notes-kicker').textContent=simple?'02 / TRY TYPING AND CLICKING':'03 / EXPLAIN THE RESULT';
 $('notes-title').textContent=simple?'Write a few words':'Keep the conclusion short';
 $('improvement').rows=simple?2:5;$('reflection').rows=simple?2:5;
 $('improvement').placeholder=simple?'For example: Just testing':'A short, concrete explanation for the report.';
 $('reflection').placeholder=simple?'For example: Hello':'What did you learn or what remains uncertain?';
 $('export-kicker').textContent=simple?'03 / DOWNLOAD AND OPEN':'04 / REVIEW AND FINISH';
 $('export-title').textContent=simple?'See your demo PDF':'Your evidence-first report';
 $('export-help').textContent=simple?'Download the demo PDF and open it. Can you see your name, both images and your words? That is the whole test.':'Check the A4 preview before you download. Incomplete work can also be exported as a clearly marked draft.';
 $('pdf-check-label').textContent=simple?'I opened the demo PDF and can see my name, both images and my words.':'I opened the downloaded PDF and checked that the text and both required screenshots are readable.';
 $('progress-kicker').textContent=simple?'YOUR QUICK CHECK':'THIS LEVEL';
 $('progress-help').textContent=simple?'Only a technical check. No questions to solve and no right or wrong text.':'These indicators check documentation, not the correctness of your answers.';
 $('jump-export').textContent=simple?'Go to demo PDF':'Review & download';
 $('saving-help').textContent=simple?'This is a local draft, not cloud storage. Download your demo PDF before you finish.':'No cloud account. No upload to this website. A local draft is not a long-term backup.';
 $('backup-help').textContent=simple?'Only needed if you want to stop and continue later. A backup includes your text and images.':'Backup files include text and screenshots. PDFs are for submission, not for restoring an editable draft.';
 $('sitting-help').innerHTML=simple?'<strong>This practice takes only a few minutes.</strong> Type a few words, add two images and open the demo PDF. Do not submit it.':'<strong>One level, one sitting.</strong> Aim to finish a level, download and check its PDF, then upload it to Moodle before you leave.';
}

function render(){
 renderMode();
 $('level-nav').innerHTML=config.levels.map(l=>'<button class="level-button" data-level="'+l.id+'" '+(l.id===current?'aria-current="page"':'')+'><span>'+(l.id==='primer'?'Start here':'Level '+l.id)+'</span><strong>'+esc(l.shortTitle)+'</strong></button>').join('');
 $('level-kicker').textContent=level.id==='primer'?'ABOUT 2-3 MINUTES / NO SUBMISSION':'LEVEL '+level.id+' / INDIVIDUAL WORK';
 $('level-instructions').href=level.instructions||'instructions/00-Start-here.html';$('level-instructions').textContent=level.id==='primer'?'Read the Theme D overview':'Open Level '+level.id+' instructions and files';$('level-title').textContent=level.title;$('level-description').textContent=level.description;$('version').textContent='UI '+(config.uiVersion||'1.2');$('aside-title').textContent=level.id==='primer'?'Technical practice':'Level '+level.id;
 $('primer-note').hidden=level.id!=='primer';$('primer-checks').hidden=level.id!=='primer';$('experiment-block').hidden=!level.experiment;
 $('student').value=state.student;$('assistant').value=state.assistant;$('improvement').value=state.improvement;$('reflection').value=state.reflection;
 $('improvement-label').textContent=level.improvementPrompt;$('reflection-label').textContent=level.reflectionPrompt;
 $('checklist-items').innerHTML=config.primerChecklist.map((s,i)=>'<label class="check"><input type="checkbox" data-checklist="'+i+'" '+(state.checklist[i]?'checked':'')+'>'+esc(s)+'</label>').join('');
 $('question-list').innerHTML=level.id==='primer'?'':level.questions.map(renderQuestion).join('');
 const e=state.experiment;$('exp-performed').checked=e.performed;$('exp-outcome').value=e.outcome;$('exp-wait').value=e.wait;$('exp-note').value=e.note;$('pdf-checked').checked=state.pdfChecked;
 $('submission-note').textContent=level.id==='primer'?'This is a technical test only. Do not submit the demo PDF to Moodle.':'Download and open this level\'s PDF, then add it to the Theme D Moodle submission. Keep earlier PDFs there. You may return before the deadline to add further levels; no earlier draft is required in this app.';
 $('download-pdf').textContent=level.id==='primer'?'Download demo PDF':'Download Level '+level.id+' PDF';
 $('fit-message').hidden=true;$('export-feedback').hidden=true;
 renderImages();updateProgress();connectionStatus();
}
async function switchLevel(id){
 if(!config.levels.some(l=>l.id===id))id='primer';if(state){memory[current]=state;await save();}
 current=id;level=config.levels.find(l=>l.id===id);
 if(memory[id])state=memory[id];else{let raw=await readDB(id);try{state=raw?validateState(raw,level):blank(level);}catch{state=blank(level);say('An older local draft could not be loaded. Restore a compatible backup.');}memory[id]=state;}
 revision=0;savedRevision=0;exportedRevision=-1;
 history.replaceState(null,'','#'+id);render();$('save-status').classList.toggle('error',!db);$('save-status').textContent=db?(state.updatedAt?'Local draft restored on this device.':'A new level workspace. No earlier report required.'):'Local storage unavailable. Keep this tab open and use backup.';
}
function validateConfig(c){
 if(c.schemaVersion!==1||typeof c.appId!=='string'||!Array.isArray(c.levels)||!Array.isArray(c.sources))throw Error('Unsupported question file.');
 const ids=new Set();for(const l of c.levels){if(ids.has(l.id))throw Error('Duplicate level ID.');ids.add(l.id);if(!Array.isArray(l.questions)||(l.id!=='primer'&&!l.questions.length)||l.screenshots?.length!==2)throw Error('Question file needs questions and two screenshot slots per level.');let qs=new Set();for(const q of l.questions){if(qs.has(q.id))throw Error('Duplicate question ID: '+q.id);qs.add(q.id);if(['1','2','3'].includes(l.id)&&c.protectedChangeTopics?.includes(q.topic))throw Error('A Level 4 policy-change topic appears in an earlier test: '+q.id);}}
}
function validateState(raw,l){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid backup contents.');let s=blank(l);
 const str=(v,max,label)=>{if(v===undefined||v===null)return '';if(typeof v!=='string'||v.length>max)throw Error('Invalid or oversized '+label+'.');return v;};
 for(const [k,max] of [['student',70],['assistant',70],['improvement',240],['reflection',260]])s[k]=str(raw[k],max,k);
 for(const q of l.questions){let r=raw.tests?.[q.id];if(!r)continue;let t=s.tests[q.id];for(const [k,max] of [['answer',250],['fix',130]])t[k]=str(r[k],max,q.id+' '+k);for(const k of ['first','latest']){if(r[k]&&!STATUS[r[k]])throw Error('Invalid test result.');t[k]=r[k]||'';}t.retested=r.retested===true;t.readOriginal=r.readOriginal===true;
 if(r.sources!==undefined&&!Array.isArray(r.sources))throw Error('Invalid source list.');t.sources=[...new Set(r.sources||[])].filter(k=>l.sourceIds.includes(k));for(const k of t.sources)t.refs[k]=str(r.refs?.[k],70,'source reference');}
 if(raw.images!==undefined&&!Array.isArray(raw.images))throw Error('Invalid screenshot list.');s.images=[0,1].map(i=>{let r=raw.images?.[i];if(!r)return null;for(const k of ['data','original']){if(r[k]&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(r[k]))throw Error('Backup contains an invalid image.');if(r[k]?.length>22000000)throw Error('A backup image is too large.');}if(!r.data||!Number.isFinite(r.w)||!Number.isFinite(r.h)||r.w<=0||r.h<=0||r.w*r.h>28000000)throw Error('Invalid screenshot dimensions.');return {data:r.data,original:r.original||r.data,w:r.w,h:r.h,name:str(r.name,220,'image name')};});
 for(let i=0;i<config.primerChecklist.length;i++)s.checklist[i]=raw.checklist?.[i]===true;
 const e=raw.experiment||{};s.experiment={performed:e.performed===true,outcome:['','auto','notyet','manual','unclear','untested'].includes(e.outcome)?e.outcome:'',wait:str(e.wait,5,'wait'),note:str(e.note,90,'observation')};
 if(l.id==='primer'&&raw.primerFormat!=='simple-tech-v1'){s.improvement='';s.reflection='';s.checklist={};s.primerFormat='simple-tech-v1';}
 s.pdfChecked=raw.pdfChecked===true&&(l.id!=='primer'||raw.primerFormat==='simple-tech-v1');s.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:null;return s;
}
function download(data,type,name){const blob=data instanceof Blob?data:new Blob([data],{type}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
async function backup(){await save();const data={format:'AIIB-LEVEL-BACKUP',schemaVersion:1,appId:config.appId,contentVersion:config.contentVersion,levelId:current,exportedAt:new Date().toISOString(),state};download(JSON.stringify(data),'application/json','Theme-D-'+(current==='primer'?'DEMO':'Level-'+current)+'-backup.json');say('Backup download started. Keep this file to restore text and images.');}
async function restore(file){if(!file)return;if(file.size>55*1024*1024)throw Error('Backup is too large. Choose a backup under 55 MB.');let data;try{data=JSON.parse(await file.text());}catch{throw Error('This is not a valid backup JSON file. Your current work has not changed.');}
 if(data.format!=='AIIB-LEVEL-BACKUP'||data.schemaVersion!==1||data.appId!==config.appId||data.contentVersion!==config.contentVersion)throw Error('This backup belongs to a different app or question version. Your current work has not changed.');
 const l=config.levels.find(l=>l.id===data.levelId);if(!l)throw Error('Unknown backup level.');const incoming=validateState(data.state,l);
 for(const img of incoming.images.filter(Boolean)){let im=await loadImage(img.data);if(im.naturalWidth!==img.w||im.naturalHeight!==img.h)throw Error('Screenshot dimensions do not match this backup.');}
 if(!confirm('Restore '+(l.id==='primer'?'the primer':'Level '+l.id)+'? This replaces the local draft for that level only. Other levels stay unchanged.'))return;
 await save();memory[l.id]=incoming;if(current===l.id){state=incoming;revision++;render();await save();}else{await switchLevel(l.id);revision++;await save();}say('Backup restored, including screenshots.');}
function loadImage(data){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('This image could not be read. Choose PNG, JPG or WebP.'));i.src=data;});}
async function addImage(file,i){if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPG or WebP image.');if(file.size>12*1024*1024)throw Error('Choose a screenshot under 12 MB, or crop it first.');
 const data=await new Promise((resolve,reject)=>{let r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('The image file could not be opened.'));r.readAsDataURL(file);});
 const img=await loadImage(data);if(img.naturalWidth*img.naturalHeight>28000000)throw Error('The image is too large. Crop it in your screenshot tool first.');
 const c=document.createElement('canvas'),scale=Math.min(1,2400/img.naturalWidth,2400/img.naturalHeight);c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);const cx=c.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,c.width,c.height);cx.drawImage(img,0,0,c.width,c.height);let cleaned=c.toDataURL('image/png');if(cleaned.length>5500000)cleaned=c.toDataURL('image/jpeg',.9);
 state.images[i]={data:cleaned,original:cleaned,w:c.width,h:c.height,name:file.name||'Pasted screenshot'};changed();renderImages();say('Screenshot added locally. Check it in the A4 preview.');}
function practiceImage(i){
 const c=document.createElement('canvas');c.width=1600;c.height=360;const x=c.getContext('2d');
 x.fillStyle=i?'#eef4f5':'#fbfaf7';x.fillRect(0,0,1600,360);x.fillStyle=i?'#8daeb6':'#d8c4be';x.fillRect(0,0,18,360);
 x.fillStyle='#3f5962';x.font='bold 44px Arial';x.fillText('Demo image '+(i+1),60,105);
 x.font='32px Arial';x.fillText('Any picture is fine for this technical check.',60,180);
 x.font='24px Arial';x.fillText('Nothing to answer. Nothing to submit.',60,255);
 const data=c.toDataURL('image/png');return {data,original:data,w:c.width,h:c.height,name:'demo-image-'+(i+1)+'.png'};
}
function dummyImage(i){if(level.id==='primer')return practiceImage(i);const c=document.createElement('canvas');c.width=1600;c.height=240;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,1600,240);x.fillStyle='#eef4f5';x.fillRect(0,0,1600,50);x.fillStyle='#3f5962';x.font='bold 20px Arial';x.fillText('DUMMY SCREENSHOT '+(i+1)+' / SAMPLE INTERFACE - NOT A REAL GEM',24,33);x.fillStyle='#f7f8f8';x.fillRect(0,50,1600,57);x.fillStyle='#29313a';x.font='28px Arial';x.fillText(level.screenshots[i].title,24,87);x.font='24px Arial';const q=level.questions[level.id==='4'&&i===1?3:Math.min(i,level.questions.length-1)];const text=i===0?'Sample evidence: '+Object.entries(q.example.evidence).map(([k,v])=>v).join(' + '):'Sample response: '+q.example.answer;const lines=ReportEngine.wrap(text,1470,24);lines.slice(0,3).forEach((s,n)=>x.fillText(s,24,149+n*34));let data=c.toDataURL('image/png');return {data,original:data,w:c.width,h:c.height,name:'dummy-screenshot-'+(i+1)+'.png'};}
function fillDummy(){if(!config.pilot&&current!=='primer'){say('Use your own answers and screenshots for assessed levels.');return;}if(!confirm('Fill this level with dummy examples? This replaces only the current level.'))return;state=blank(level);state.student='Alex Example';state.assistant='Customer Support Helper';level.questions.forEach(q=>{let e=q.example;state.tests[q.id]={answer:e.answer,first:e.first,latest:e.latest||'',retested:!!e.latest,sources:Object.keys(e.evidence),refs:{...e.evidence},readOriginal:true,fix:e.fix||''};});state.improvement=level.exampleImprovement;state.reflection=level.exampleReflection;state.images=[dummyImage(0),dummyImage(1)];if(level.experiment)state.experiment={performed:true,outcome:'notyet',wait:'2',note:current==='4'?'The new column value was not visible in this attempt.':'The new record was not visible in this attempt.'};if(current==='primer')config.primerChecklist.forEach((_,i)=>state.checklist[i]=true);memory[current]=state;render();changed();say('Dummy examples added. Edit them or replace an image to test the app.');}
function bindImageEvents(){
 document.querySelectorAll('[data-drop]').forEach(el=>{const i=Number(el.dataset.drop);el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('dragging');});el.addEventListener('dragleave',()=>el.classList.remove('dragging'));el.addEventListener('drop',safeAction(async e=>{e.preventDefault();el.classList.remove('dragging');await addImage(e.dataTransfer.files[0],i);}));el.addEventListener('paste',safeAction(async e=>{const f=Array.from(e.clipboardData.items).find(i=>i.type.startsWith('image/'));if(f){e.preventDefault();await addImage(f.getAsFile(),i);}}));});
}
async function openCrop(i){const source=state.images[i];if(!source)return;const img=await loadImage(source.original||source.data),cv=$('crop-canvas'),scale=Math.min(1,820/img.naturalWidth,460/img.naturalHeight);cv.width=Math.round(img.naturalWidth*scale);cv.height=Math.round(img.naturalHeight*scale);crop={index:i,img,scale,rect:{x:0,y:0,w:cv.width,h:cv.height},start:null};paintCrop();$('crop-dialog').showModal();}
function paintCrop(){if(!crop)return;const cv=$('crop-canvas'),x=cv.getContext('2d'),r=crop.rect;x.clearRect(0,0,cv.width,cv.height);x.drawImage(crop.img,0,0,cv.width,cv.height);x.fillStyle='rgba(20,33,39,.55)';x.fillRect(0,0,cv.width,r.y);x.fillRect(0,r.y+r.h,cv.width,cv.height-r.y-r.h);x.fillRect(0,r.y,r.x,r.h);x.fillRect(r.x+r.w,r.y,cv.width-r.x-r.w,r.h);x.strokeStyle='#ffffff';x.lineWidth=2;x.strokeRect(r.x+1,r.y+1,r.w-2,r.h-2);}
function cropPos(e){let cv=$('crop-canvas'),r=cv.getBoundingClientRect();return {x:Math.max(0,Math.min(cv.width,(e.clientX-r.left)*cv.width/r.width)),y:Math.max(0,Math.min(cv.height,(e.clientY-r.top)*cv.height/r.height))};}
function applyCrop(full=false){if(!crop)return;let r=full?{x:0,y:0,w:$('crop-canvas').width,h:$('crop-canvas').height}:crop.rect;if(r.w<15||r.h<15)throw Error('Choose a larger screenshot area.');const old=state.images[crop.index],c=document.createElement('canvas');c.width=Math.round(r.w/crop.scale);c.height=Math.round(r.h/crop.scale);c.getContext('2d').drawImage(crop.img,r.x/crop.scale,r.y/crop.scale,r.w/crop.scale,r.h/crop.scale,0,0,c.width,c.height);state.images[crop.index]={...old,data:c.toDataURL('image/png'),w:c.width,h:c.height};$('crop-dialog').close();crop=null;changed();renderImages();}
function getModel(){return {config,level,state,complete:validity().complete};}
function scene(){const sc=ReportEngine.createScene(getModel());const msg=sc.issues.length?sc.issues:(sc.notices||[]);$('fit-message').hidden=!msg.length;if(msg.length){$('fit-message').className=sc.issues.length?'notice danger':'notice';$('fit-message').textContent=msg.join(' ');}return sc;}
function showPreview(){previewScene=scene();if(previewScene.issues.length)throw Error(previewScene.issues.join('\n'));$('preview-sheet').innerHTML=ReportEngine.svg(previewScene);$('preview-dialog').showModal();}
async function exportPDF(){const sc=scene();if(sc.issues.length)throw Error(sc.issues.join('\n'));const button=$('download-pdf');button.disabled=true;try{const bytes=await ReportEngine.pdf(sc);const name=current==='primer'?'DEMO-Do-Not-Submit.pdf':level.filename||('D'+current+'-Evidence-Report.pdf');download(bytes,'application/pdf',name);exportedRevision=revision;$('export-feedback').hidden=false;$('export-feedback').className='notice';$('export-feedback').textContent='PDF download started. Open '+name+' and check the text and screenshots before you finish. '+(current==='primer'?'Do not submit this demo.':'Add the checked PDF to your Moodle submission and keep your own copy.');say('PDF download started. Open the file and check it.');}finally{button.disabled=false;}}
function primerHTML(){
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Technical practice - DO NOT SUBMIT</title><style>body{font:16px/1.5 Arial;color:#29313a;max-width:850px;margin:30px auto;padding:20px}section{border-bottom:1px solid #ccc;padding:14px 0}img{max-width:100%;max-height:240px;object-fit:contain}button{padding:12px}@media print{button{display:none}@page{size:A4;margin:15mm}}</style><button onclick="print()">Print / Save as PDF</button><h1>Technical practice - DO NOT SUBMIT</h1><p>This is only a test of the reporting tool. Do not upload it to Moodle.</p><p>Name: '+esc(state.student||'[not entered]')+'</p>'+state.images.map((v,i)=>'<section><h2>Image '+(i+1)+'</h2>'+(v?'<img src="'+v.data+'" alt="Practice image '+(i+1)+'">':'Not added')+'</section>').join('')+'<section><h2>Demo text 1</h2><p>'+esc(state.improvement||'[not entered]')+'</p><h2>Demo text 2</h2><p>'+esc(state.reflection||'[not entered]')+'</p><p>Checkbox: '+(state.checklist[0]?'Ticked':'Not ticked yet')+'</p></section><p>Can you see your name, images and words? That is the whole test.</p></html>';
}
function fullHTML(){if(level.id==='primer')return primerHTML();const m=getModel();let rows=level.questions.map(q=>{let t=state.tests[q.id];return '<section><h3>'+q.id+' - '+esc(q.label)+'</h3><p>'+esc(q.question)+'</p><p><b>Answer:</b> '+esc(t.answer||'Not recorded')+'</p><p><b>First / latest:</b> '+esc(STATUS[t.first]?.label||'Not tested')+' / '+esc(STATUS[t.retested?t.latest:t.first]?.label||'Not tested')+'</p><p><b>Original evidence:</b> '+t.sources.map(k=>esc(config.sources.find(s=>s.id===k).label+': '+(t.refs[k]||''))).join('; ')+'</p><p><b>Original source read:</b> '+(t.readOriginal?'Yes':'No')+'</p><p><b>Working note:</b> '+esc(t.fix)+'</p></section>';}).join('');return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Theme D full report fallback</title><style>body{font:15px/1.5 Arial;color:#29313a;max-width:850px;margin:30px auto;padding:20px}section{border-bottom:1px solid #ccc;padding:12px 0;break-inside:avoid}img{max-width:100%;max-height:380px;object-fit:contain}button{padding:12px}@media print{button{display:none}@page{size:A4;margin:15mm}}</style><button onclick="print()">Print / Save as PDF</button><h1>Theme D - '+esc(level.title)+' - fallback</h1><p><b>Alternative report - CS-D-1.0</b></p><p>Student: '+esc(state.student)+' | Assistant: '+esc(state.assistant)+'</p>'+state.images.map((v,i)=>'<section><h2>Screenshot '+(i+1)+'</h2>'+(v?'<img src="'+v.data+'" alt="Screenshot '+(i+1)+'">':'Not attached')+'</section>').join('')+rows+'<section><h2>Changes</h2><p>'+esc(state.improvement)+'</p><h2>Reflection</h2><p>'+esc(state.reflection)+'</p>'+(level.experiment?'<p>Update attempt: '+(state.experiment.performed?'Yes':'No')+'. Result: '+esc(state.experiment.outcome)+'. Wait: '+esc(state.experiment.wait)+' min. '+esc(state.experiment.note)+'</p>':'')+'</section><p>Student-reported results, not automatic marking.</p></html>';}
function exportHTML(open=false){const sc=scene(),text=sc.issues.length?fullHTML():ReportEngine.html(sc);if(open){let w=window.open('','_blank');if(!w){download(text,'text/html','Theme-D-report-fallback.html');say('The popup was blocked. An HTML file was downloaded instead.');return;}w.opener=null;w.document.open();w.document.write(text);w.document.close();}else{download(text,'text/html','Theme-D-report-fallback.html');say('HTML report download started. Open it to print or keep a readable copy.');}}
function connectionStatus(){if(!booted)return;$('connection').className='connection'+(!navigator.onLine?' offline':'');$('connection').textContent=navigator.onLine?(level.id==='primer'?'Practice tools loaded. Everything for this quick check is on this page.':'Report tools loaded. No cloud saving. A working internet connection is still needed for Gemini and Moodle.'):'Device reports offline. Keep this tab open. You can continue this report and download PDF or backup locally. Do not refresh.';}
async function copyQuestion(id){const text=level.questions.find(q=>q.id===id).question;try{await navigator.clipboard.writeText(text);say('Question copied.');}catch{const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();say(ok?'Question copied.':'Select the question text and copy it manually.');}}
function attachEvents(){
 $('level-nav').addEventListener('click',safeAction(async e=>{let b=e.target.closest('[data-level]');if(b){await switchLevel(b.dataset.level);$('workspace').focus({preventScroll:true});}}));
 for(const id of ['student','assistant','improvement','reflection'])$(id).addEventListener('input',()=>{state[id]=$(id).value;changed();});
 $('question-list').addEventListener('input',e=>{const q=e.target.dataset.q;if(!q)return;let t=state.tests[q];if(e.target.dataset.field){t[e.target.dataset.field]=e.target.value;if(e.target.dataset.field==='answer'){t.readOriginal=false;const check=document.querySelector('[data-q="'+q+'"][data-read]');if(check)check.checked=false;}}if(e.target.dataset.ref)t.refs[e.target.dataset.ref]=e.target.value;changed();});
 $('question-list').addEventListener('change',e=>{const q=e.target.dataset.q;if(!q)return;let t=state.tests[q];
 if(e.target.dataset.status){t[e.target.dataset.status]=e.target.value;t.readOriginal=false;document.querySelector('[data-q="'+q+'"][data-read]').checked=false;}
 if(e.target.hasAttribute('data-retest')){t.retested=e.target.checked;document.querySelector('[data-latest="'+q+'"]').hidden=!t.retested;}
 if(e.target.hasAttribute('data-read'))t.readOriginal=e.target.checked;
 if(e.target.dataset.source){const id=e.target.dataset.source;if(e.target.checked){if(!t.sources.includes(id))t.sources.push(id);}else{t.sources=t.sources.filter(v=>v!==id);delete t.refs[id];}t.readOriginal=false;document.querySelector('[data-q="'+q+'"][data-read]').checked=false;document.querySelector('[data-refs="'+q+'"]').innerHTML=renderRefs(level.questions.find(v=>v.id===q));}
 changed();});
 $('question-list').addEventListener('click',safeAction(async e=>{let b=e.target.closest('[data-copy]');if(b)await copyQuestion(b.dataset.copy);}));
 $('checklist-items').addEventListener('change',e=>{if(e.target.dataset.checklist!==undefined){state.checklist[e.target.dataset.checklist]=e.target.checked;changed();}});
 $('image-slots').addEventListener('change',safeAction(async e=>{if(e.target.dataset.imageFile!==undefined)await addImage(e.target.files[0],Number(e.target.dataset.imageFile));}));
 $('image-slots').addEventListener('click',safeAction(async e=>{let b=e.target.closest('button')||e.target;if(b.dataset.teacherExample!==undefined){await showTeacherExample(+b.dataset.teacherExample,b);return;}if(b.dataset.dummyImage!==undefined){let i=+b.dataset.dummyImage;state.images[i]=dummyImage(i);changed();renderImages();}
 if(b.dataset.crop!==undefined)await openCrop(+b.dataset.crop);
 if(b.dataset.removeImage!==undefined){state.images[+b.dataset.removeImage]=null;changed();renderImages();}
 if(b.dataset.openImage!==undefined||b.dataset.fullImage!==undefined){const img=state.images[+(b.dataset.openImage??b.dataset.fullImage)],w=window.open('','_blank');if(w){w.opener=null;w.document.write('<!doctype html><title>Screenshot preview</title><img alt="Your screenshot" style="max-width:100%" src="'+img.data+'">');w.document.close();}}
 }));
 for(const [id,field,type] of [['exp-performed','performed','checkbox'],['exp-outcome','outcome','select'],['exp-wait','wait','number'],['exp-note','note','text']])$(id).addEventListener(type==='text'||type==='number'?'input':'change',()=>{state.experiment[field]=type==='checkbox'?$(id).checked:$(id).value;changed();});
 $('pdf-checked').addEventListener('change',()=>{state.pdfChecked=$('pdf-checked').checked;revision++;save();updateProgress();});
 $('start-level-one').addEventListener('click',safeAction(async()=>{await switchLevel('1');$('workspace').focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'});}));
 $('fill-dummy').addEventListener('click',fillDummy);$('backup').addEventListener('click',safeAction(backup));$('restore').addEventListener('click',()=>$('backup-file').click());$('backup-file').addEventListener('change',safeAction(async e=>{try{await restore(e.target.files[0]);}finally{e.target.value='';}}));
 $('preview-report').addEventListener('click',safeAction(showPreview));$('download-pdf').addEventListener('click',safeAction(exportPDF));$('preview-download').addEventListener('click',safeAction(exportPDF));$('preview-html').addEventListener('click',()=>exportHTML(false));$('download-html').addEventListener('click',()=>exportHTML(false));$('open-print').addEventListener('click',()=>exportHTML(true));
 $('close-example').addEventListener('click',closeTeacherExample);
 $('example-dialog').addEventListener('close',()=>{
  $('example-image-host').replaceChildren();
  if(exampleReturnFocus?.isConnected)exampleReturnFocus.focus({preventScroll:true});
  exampleReturnFocus=null;
 });
 $('example-dialog').addEventListener('click',e=>{
  if(e.target!==$('example-dialog'))return;
  const r=$('example-dialog').getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeTeacherExample();
 });
 $('close-preview').addEventListener('click',()=>$('preview-dialog').close());$('preview-dialog').addEventListener('click',e=>{if(e.target===$('preview-dialog')){const r=$('preview-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('preview-dialog').close();}});
 $('jump-export').addEventListener('click',()=>$('export-panel').scrollIntoView({behavior:'smooth'}));$('help-top').addEventListener('click',()=>{$('help-panel').open=true;$('help-panel').scrollIntoView({behavior:'smooth'});});
 $('reset-level').addEventListener('click',safeAction(async()=>{if(!confirm('Clear the draft for '+(current==='primer'?'the primer':'Level '+current)+' on this browser? Download a backup first if needed. Other levels are not affected.'))return;state=blank(level);memory[current]=state;render();changed();await save();say('Only this level was cleared.');}));
 const cv=$('crop-canvas');cv.addEventListener('pointerdown',e=>{if(!crop)return;cv.setPointerCapture(e.pointerId);crop.start=cropPos(e);});cv.addEventListener('pointermove',e=>{if(!crop?.start)return;const p=cropPos(e),s=crop.start;crop.rect={x:Math.min(p.x,s.x),y:Math.min(p.y,s.y),w:Math.abs(p.x-s.x),h:Math.abs(p.y-s.y)};paintCrop();});cv.addEventListener('pointerup',()=>{if(crop)crop.start=null;});cv.addEventListener('pointercancel',()=>{if(crop)crop.start=null;});$('apply-crop').addEventListener('click',safeAction(()=>applyCrop(false)));$('reset-crop').addEventListener('click',safeAction(()=>applyCrop(true)));$('close-crop').addEventListener('click',()=>{$('crop-dialog').close();crop=null;});
 window.addEventListener('offline',connectionStatus);window.addEventListener('online',connectionStatus);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});window.addEventListener('pagehide',save);
 window.addEventListener('beforeunload',e=>{if(booted&&revision>savedRevision){e.preventDefault();e.returnValue='';}});
 window.addEventListener('hashchange',safeAction(async()=>{let id=location.hash.slice(1);if(id!==current)await switchLevel(id);}));
}
async function boot(){
 try{const embedded=$('embedded-data');if(embedded)config=JSON.parse(embedded.textContent);else{const res=await fetch('data/questions.json',{cache:'no-store'});if(!res.ok)throw Error('Question file not found. Check that data/questions.json was uploaded with the app.');config=await res.json();}
 validateConfig(config);db=await openDB();booted=true;attachEvents();await switchLevel(location.hash.slice(1)||'primer');$('initial-loading').hidden=true;$('workspace').hidden=false;
 try{channel=new BroadcastChannel(config.appId+'-drafts');channel.onmessage=e=>{if(e.data?.client!==clientId&&e.data?.key===dbKey(current)){say('Another tab saved this level. Use one editing tab to avoid overwriting a draft. Download a backup if needed.');}};}catch{}
 }catch(e){$('initial-loading').hidden=true;$('load-error').hidden=false;$('load-error').textContent='The workspace could not start: '+e.message+' For local testing, use the separate single-file preview, or open the hosted GitHub Pages version.';console.error(e);}
}
window.EvidenceApp={getModel,scene,exportPDF,backup,restore,fillDummy,addImage,switchLevel,validity,save};
boot();
})();
