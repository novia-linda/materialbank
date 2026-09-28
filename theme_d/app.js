/* Nordic Freight Test Lab v2. Data files are separate from this engine.
   No Gemini calls, analytics, backend writes or teacher-key uploads are made. */
(() => {
  'use strict';
  const STORAGE_KEY = 'nf-knowledge-test-lab-v2';
  const SCHEMA = 2;
  const $ = id => document.getElementById(id);
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = (v, limit = 12000) => typeof v === 'string' ? v.slice(0, limit) : '';
  const now = () => new Date().toISOString();
  const safeName = () => (state?.groupName || 'group').replace(/[^a-z0-9_-]/gi,'-').slice(0,60);
  const resultLabel = v => ({correct:'Correct',partial:'Partly correct',incorrect:'Incorrect / no answer','':'Not tested'}[v] || 'Not tested');
  const validResult = v => ['correct','partial','incorrect'].includes(v) ? v : '';
  let state = null, bank = null, index = 0, teacherKey = null, teacherIndex = 0, loading = false;
  let localSaveOK = true;
  let config = null;

  function message(text, bad = false) {
    $('appMessage').textContent = text; $('appMessage').hidden = !text;
    $('appMessage').className = 'app-message no-print' + (bad ? ' warning' : '');
  }
  function storageRead() {
    try {const raw=localStorage.getItem(STORAGE_KEY);return raw ? JSON.parse(raw) : null;}
    catch (_) {return null;}
  }
  function save() {
    if (!state) return;
    state.updatedAt = now();
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(state));localSaveOK=true;$('saveStatus').textContent='Saved in this browser';}
    catch (_) {localSaveOK=false;$('saveStatus').textContent='Autosave unavailable - download a backup';message('This browser cannot save locally. Use Save backup before leaving the page.',true);}
  }
  function download(name, content, type='application/json;charset=utf-8') {
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function empty(q) {return {questionText:q.question,revision:q.revision||1,firstResult:'',retestResult:'',answer:'',sources:[],evidence:{},verifiedBy:'',issues:[],improvement:'',retest:'',verified:false,verifiedAt:null,reviewNotice:''};}
  function emptyExperiment() {return {method:'',reference:'',change:'',wait:'',result:'',answer:'',manual:'',notes:''};}
  function roles(size) {return ['Policy & Gem','Shipment register','Email knowledge','Phone knowledge','Packing guide'].slice(0,size);}
  function newState(size,b) {
    return {schemaVersion:SCHEMA,caseId:b.caseId,questionSet:String(size),questionBankVersion:b.version,groupName:clean($('groupNameInput').value,80),members:[],startedAt:now(),updatedAt:now(),questions:Object.fromEntries(b.questions.map(q=>[q.id,empty(q)])),experiment:emptyExperiment(),archivedQuestions:{}};
  }
  async function fetchBank(size) {
    if (!['4','5'].includes(String(size))) throw new Error('Choose a group of four or five.');
    const response=await fetch(`data/questions-${size}.json`,{cache:'no-store'});
    if(!response.ok)throw new Error(`Question bank could not be loaded (${response.status}).`);
    const b=await response.json();
    if(b.schemaVersion!==SCHEMA || b.groupSize!==Number(size) || !Array.isArray(b.questions) || !b.questions.length || b.questions.length>100 || !Array.isArray(b.sourceOptions))throw new Error('The question bank has an invalid format.');
    const ids=b.questions.map(q=>q.id);
    if(new Set(ids).size!==ids.length || b.questions.some(q=>!q.id || typeof q.question!=='string'))throw new Error('Question IDs must be unique and question text must be present.');
    if(!b.caseId || !b.version)throw new Error('Case ID and bank version are required.');
    return b;
  }
  function normalise(saved,b) {
    if(!saved || saved.schemaVersion!==SCHEMA || saved.caseId!==b.caseId || saved.questionSet!==String(b.groupSize) || typeof saved.questions!=='object')throw new Error('This is not a compatible progress backup for this case. Prototype backups cannot be marked complete in the new case.');
    const allowedSources=new Set(b.sourceOptions.map(x=>x.id));const out=newState(saved.questionSet,b);
    out.groupName=clean(saved.groupName,80);out.startedAt=clean(saved.startedAt,60)||now();out.members=Array.isArray(saved.members)?saved.members.slice(0,b.groupSize).map(x=>clean(x,80)):[];
    const ex=saved.experiment||{};for(const k of Object.keys(out.experiment))out.experiment[k]=clean(ex[k]);
    out.archivedQuestions=saved.archivedQuestions && typeof saved.archivedQuestions==='object'?saved.archivedQuestions:{};
    for(const q of b.questions){
      const old=saved.questions[q.id];if(!old || typeof old!=='object')continue;
      const s=empty(q);
      for(const key of ['answer','verifiedBy','improvement','retest'])s[key]=clean(old[key]);
      s.firstResult=validResult(old.firstResult);s.retestResult=validResult(old.retestResult);
      s.sources=Array.isArray(old.sources)?[...new Set(old.sources.filter(id=>allowedSources.has(id)))]:[];
      s.evidence=Object.fromEntries(s.sources.map(id=>[id,clean(old.evidence?.[id],2000)]));
      s.issues=Array.isArray(old.issues)?old.issues.filter(id=>(b.issueOptions||[]).some(i=>i.id===id)):[];
      const changed=old.questionText!==q.question || (old.revision||1)!==(q.revision||1);
      s.reviewNotice=changed?'This question changed. Previous notes were kept; check and test it again.':clean(old.reviewNotice,300);
      if(changed){out.archivedQuestions[q.id+'@'+(saved.questionBankVersion||'previous')]=old;s.firstResult='';s.retestResult='';}
      s.verified=Boolean(old.verified) && !changed && ready(s);s.verifiedAt=s.verified?clean(old.verifiedAt,60):null;
      out.questions[q.id]=s;
    }
    for(const id of Object.keys(saved.questions))if(!b.questions.some(q=>q.id===id))out.archivedQuestions[id]=saved.questions[id];
    return out;
  }
  function status(s) {return s.retestResult || s.firstResult;}
  function ready(s) {
    return Boolean(validResult(s.firstResult) && status(s)==='correct' && s.answer.trim() && s.sources.length && s.sources.every(id=>s.evidence[id]?.trim()) && s.verifiedBy.trim() &&
      (!['partial','incorrect'].includes(s.firstResult) || (s.retestResult==='correct' && s.retest.trim() && s.improvement.trim())));
  }
  function verifiedCount(){return bank.questions.filter(q=>state.questions[q.id].verified&&ready(state.questions[q.id])).length;}
  function savedNotice(){
    const saved=storageRead();$('savedSessionNotice').hidden=!saved;
    if(saved)$('savedSessionText').textContent=`${saved.groupName||'Unnamed group'} | ${saved.questionSet} people | saved ${saved.updatedAt ? new Date(saved.updatedAt).toLocaleString() : 'earlier'}`;
  }
  function show(screen){for(const id of ['startScreen','labScreen','reportScreen','experimentScreen'])$(id).hidden=id!==screen;$('headerActions').hidden=screen==='startScreen';$('resetBtn').hidden=!storageRead()&&!state;window.scrollTo({top:0,behavior:'instant'});}
  async function start(size){
    if(loading)return;
    if(storageRead()&&!confirm('Starting a new group replaces this browser\'s current session. Save a backup first if you need it. Continue?'))return;
    loading=true;message('Loading question bank...');
    try{const b=await fetchBank(size);bank=b;state=newState(size,b);index=0;save();openLab();if(localSaveOK)message('');}
    catch(e){message(e.message+' Open this app on GitHub Pages (HTTPS), not by double-clicking index.html.',true);}
    finally{loading=false;}
  }
  async function resume(){
    const saved=storageRead();if(!saved)return;
    try{bank=await fetchBank(saved.questionSet);state=normalise(saved,bank);index=0;save();openLab();if(localSaveOK)message(saved.questionBankVersion!==bank.version?'The bank version changed. Check any highlighted questions.':'');}
    catch(e){message(e.message,true);}
  }
  function openLab(){
    if(!state||!bank)return;show('labScreen');
    $('sessionEyebrow').textContent=`${state.groupName||'Group'} | ${state.questionSet} people`;
    $('questionBankVersion').textContent=bank.version;
    $('snapshotText').textContent=`Use the case snapshot: ${bank.snapshot}.`;
    renderNav();renderQuestion();progress();
    $('memberFields').innerHTML=roles(+state.questionSet).map((r,i)=>`<label class="field"><span>Person ${i+1} - ${esc(r)}</span><input type="text" data-member="${i}" maxlength="80" value="${esc(state.members[i]||'')}" placeholder="Name or initials (optional)"></label>`).join('');
    $('memberFields').querySelectorAll('[data-member]').forEach(el=>el.addEventListener('input',()=>{state.members[+el.dataset.member]=el.value;save();}));
  }
  function renderNav(){
    $('questionGrid').innerHTML=bank.questions.map((q,i)=>{const s=state.questions[q.id];return `<button type="button" class="qnav ${s.verified?'is-done':status(s)&&status(s)!=='correct'?'is-attention':''}" data-index="${i}" aria-current="${i===index}" aria-label="Question ${i+1}, ${s.verified?'verified':status(s)&&status(s)!=='correct'?'needs attention':'not verified'}">${i+1}</button>`;}).join('');
    $('questionGrid').querySelectorAll('[data-index]').forEach(el=>el.onclick=()=>{index=+el.dataset.index;renderNav();renderQuestion();$('questionWorkspace').scrollIntoView({block:'start',behavior:'smooth'});});
  }
  function progress(){const n=verifiedCount(),total=bank.questions.length;$('verifiedCount').textContent=`${n} / ${total}`;$('progressBar').style.width=(100*n/total)+'%';$('readinessText').textContent=n===total?'All questions verified by your group. Ready for the teacher question check.':'A confident answer is not evidence. Check the original passage for every question.';}
  function renderQuestion(){
    const q=bank.questions[index],s=state.questions[q.id];const failed=['partial','incorrect'].includes(s.firstResult);
    $('questionWorkspace').innerHTML=`<article class="question-card">
      <header class="question-card-header"><div class="question-number"><span>Question ${index+1} of ${bank.questions.length}</span><span>${s.verified?'Verified':'To check'}</span></div>
      <h2>${esc(q.question)}</h2><button class="btn btn-outline" id="copyQuestionBtn" type="button">Copy question</button><span id="copyMessage" class="step-help" role="status"></span>
      ${s.reviewNotice?`<p class="warning">${esc(s.reviewNotice)}</p>`:''}</header>
      <div class="question-card-body">
        <section class="work-step"><div class="step-label"><strong>1</strong><strong>Ask the Gem and record its answer</strong></div>
        <p class="step-help">Paste the question into your Gem. This lab does not contact Gemini or check answers automatically.</p>
        <label class="field"><span>Answer from the first test <small>(short summary or paste)</small></span><textarea id="answerField" maxlength="12000">${esc(s.answer)}</textarea></label></section>
        <section class="work-step"><div class="step-label"><strong>2</strong><strong>Verify against the original material</strong></div>
        <p class="step-help">Tick only sources your group actually checked. A generated FAQ or a Gem citation alone is not original evidence.</p>
        <div class="source-chips">${bank.sourceOptions.map(src=>`<label class="option-label"><input type="checkbox" name="source" value="${esc(src.id)}" ${s.sources.includes(src.id)?'checked':''}><span>${esc(src.label)}</span></label>`).join('')}</div>
        <div id="evidenceFields">${s.sources.map(id=>`<label class="field evidence-field"><span>Exact evidence in ${esc(bank.sourceOptions.find(x=>x.id===id)?.label||id)}</span><input type="text" data-evidence="${esc(id)}" maxlength="2000" value="${esc(s.evidence[id]||'')}" placeholder="Original ID or section + the fact it confirms"></label>`).join('')}</div>
        <label class="field evidence-field"><span>Who checked the original? <small>(person number, name or initials)</small></span><input type="text" id="verifierField" maxlength="160" value="${esc(s.verifiedBy)}" placeholder="e.g. Person 3 and Person 4"></label>
        <fieldset><legend>How did the first answer compare with the original evidence?</legend><div class="option-grid">${['correct','partial','incorrect'].map(v=>`<label class="option-label status-${v}"><input type="radio" name="firstResult" value="${v}" ${s.firstResult===v?'checked':''}><span>${resultLabel(v)}</span></label>`).join('')}</div></fieldset></section>
        <section class="work-step" ${failed?'':'hidden'}><div class="step-label"><strong>3</strong><strong>Find the gap, improve and retest</strong></div>
        <div class="diagnostic-box"><h3>Every core question has a supported answer in the original materials.</h3><p>The useful answer may be a rule, a recorded fact or a handover. If your summary missed something, return to the original source.</p>
        <div class="source-chips">${(bank.issueOptions||[]).map(it=>`<label class="option-label"><input type="checkbox" name="issue" value="${esc(it.id)}" ${s.issues.includes(it.id)?'checked':''}><span>${esc(it.label)}</span></label>`).join('')}</div>
        <label class="field evidence-field"><span>What did you change or try?</span><textarea id="improvementField" maxlength="12000">${esc(s.improvement)}</textarea></label>
        <p class="step-help">Change the reusable knowledge or instructions, not just the current chat. Ask the same question in a fresh Gem conversation. Do not give the answer inside your test prompt.</p>
        <label class="field"><span>Latest retest answer / observation</span><textarea id="retestField" maxlength="12000">${esc(s.retest)}</textarea></label>
        <fieldset><legend>Latest retest result</legend><div class="option-grid">${['correct','partial','incorrect'].map(v=>`<label class="option-label"><input type="radio" name="retestResult" value="${v}" ${s.retestResult===v?'checked':''}><span>${resultLabel(v)}</span></label>`).join('')}</div></fieldset></div></section>
      </div><footer class="question-actions"><div><button type="button" class="btn btn-dark" id="verifyQuestionBtn">${s.verified?'Reopen question':'Mark as verified'}</button><p class="verify-message" id="verifyMessage" role="status"></p></div><div class="pager"><button type="button" class="btn btn-outline" id="prevQuestionBtn" ${index===0?'disabled':''}>Previous</button><button type="button" class="btn btn-outline" id="nextQuestionBtn">${index===bank.questions.length-1?'Update experiment':'Next question'}</button></div></footer></article>`;
    const edit=()=>{s.verified=false;s.verifiedAt=null;s.reviewNotice='';save();renderNav();progress();verifyHint();};
    for(const [id,key] of [['answerField','answer'],['verifierField','verifiedBy'],['improvementField','improvement'],['retestField','retest']])$(id)?.addEventListener('input',e=>{s[key]=e.target.value;edit();});
    document.querySelectorAll('[data-evidence]').forEach(el=>el.addEventListener('input',()=>{s.evidence[el.dataset.evidence]=el.value;edit();}));
    for(const name of ['firstResult','retestResult'])document.querySelectorAll(`input[name="${name}"]`).forEach(el=>el.addEventListener('change',()=>{s[name]=el.value;if(name==='firstResult'&&el.value==='correct')s.retestResult='';edit();renderQuestion();}));
    document.querySelectorAll('input[name="source"]').forEach(el=>el.addEventListener('change',()=>{s.sources=[...document.querySelectorAll('input[name="source"]:checked')].map(e=>e.value);edit();renderQuestion();}));
    document.querySelectorAll('input[name="issue"]').forEach(el=>el.addEventListener('change',()=>{s.issues=[...document.querySelectorAll('input[name="issue"]:checked')].map(e=>e.value);edit();}));
    $('verifyQuestionBtn').onclick=()=>{
      if(s.verified){s.verified=false;s.verifiedAt=null;}else if(ready(s)){s.verified=true;s.verifiedAt=now();}else{verifyHint(true);return;}
      save();renderNav();progress();renderQuestion();
    };
    $('copyQuestionBtn').onclick=async()=>{
      try{await navigator.clipboard.writeText(q.question);$('copyMessage').textContent=' Copied.';}
      catch(_){const el=document.createElement('textarea');el.value=q.question;document.body.append(el);el.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}el.remove();$('copyMessage').textContent=ok?' Copied.':' Select the question text and copy it manually.';}
    };
    $('prevQuestionBtn').onclick=()=>{if(index>0){index--;renderNav();renderQuestion();}};
    $('nextQuestionBtn').onclick=()=>{if(index<bank.questions.length-1){index++;renderNav();renderQuestion();}else openExperiment();};
    verifyHint();
  }
  function verifyHint(clicked=false){
    const s=state.questions[bank.questions[index].id];const el=$('verifyMessage');if(!el)return;
    el.textContent=s.verified?'Verified by your group (not automatically graded).':ready(s)?'Answer, evidence and checker recorded. You can verify this question.':'To verify: record an answer, a correct final result, exact evidence for every selected source and who checked it. Failed first tests also need an improvement and a correct retest.';
    el.className='verify-message'+(s.verified?' ok':clicked?' warn':'');
    if($('verifyQuestionBtn'))$('verifyQuestionBtn').textContent=s.verified?'Reopen question':'Mark as verified';
  }
  function openExperiment(){
    if(!state)return;show('experimentScreen');const e=state.experiment;
    $('experimentForm').innerHTML=`<label class="field"><span>How is the shipment source attached?</span><select data-ex="method"><option value="">Choose...</option>${['Google Sheet selected from Drive','Drive text document maintained manually','Uploaded XLSX / TXT snapshot','Could not attach the source'].map(v=>`<option ${e.method===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
    ${[['reference','New ShipmentID used','e.g. NF-1099'],['change','What did you add or change?','Record the new value and the time you saved it.'],['wait','How long did you wait?','Record the actual wait; one minute is only a trial interval.'],['answer','Question asked and answer observed','Use a fresh chat. Do not include the new data in the prompt.'],['manual','Did you re-upload or reattach anything?','Separate automatic reading from a manual refresh.'],['notes','What does this show?','Explain what worked, failed or remained unclear.']].map(([key,label,ph])=>`<label class="field"><span>${label}</span><textarea data-ex="${key}" placeholder="${ph}" maxlength="12000">${esc(e[key])}</textarea></label>`).join('')}
    <label class="field"><span>Did the Gem use the new information?</span><select data-ex="result"><option value="">Choose...</option>${['Yes, without re-uploading','Yes, after manual replacement / reattachment','Not yet','Partly / unclear','Could not test because access or quota blocked it'].map(v=>`<option ${e.result===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`;
    $('experimentForm').querySelectorAll('[data-ex]').forEach(el=>el.addEventListener('input',()=>{state.experiment[el.dataset.ex]=el.value;save();}));
  }
  function reportMarkup(){
    const n=verifiedCount(),total=bank.questions.length;
    const firstCorrect=bank.questions.filter(q=>state.questions[q.id].firstResult==='correct').length;
    const needsWork=bank.questions.filter(q=>['partial','incorrect'].includes(state.questions[q.id].firstResult)).length;
    const detail=(k,v)=>`<dt>${esc(k)}</dt><dd>${esc(v||'Not recorded').replaceAll('\n','<br>')}</dd>`;
    return `<header class="report-header"><p class="eyebrow">AI for Business / Theme D / ${esc(bank.version)}</p><h1>Knowledge Assistant Test Report</h1><p><strong>${esc(state.groupName||'Unnamed group')}</strong> | ${state.questionSet} people | ${esc(new Date().toLocaleString())}</p><p>Exercise snapshot: ${esc(bank.snapshot)}</p></header>
    <div class="report-stats"><div><strong>${n}/${total}</strong><span>Group-verified</span></div><div><strong>${firstCorrect}</strong><span>Correct on first test</span></div><div><strong>${needsWork}</strong><span>Needed improvement</span></div></div>
    <p><strong>${n===total?'Ready for the teacher question check.':'Work in progress: unresolved questions remain.'}</strong> These are student-recorded judgements, not automatic assessment of the Gem.</p>
    <h2>Knowledge experts</h2><dl class="report-meta">${roles(+state.questionSet).map((r,i)=>detail(`Person ${i+1}: ${r}`,state.members[i]||'Not entered')).join('')}</dl>
    ${bank.questions.map((q,i)=>{const s=state.questions[q.id];return `<section class="report-question"><h3>${i+1}. ${esc(q.question)}</h3><dl class="report-meta">${detail('Question ID',q.id)}${detail('First result',resultLabel(s.firstResult))}${detail('First answer',s.answer)}${detail('Final result',resultLabel(status(s)))}${detail('Verified',s.verified?'Yes':'No')}${detail('Checked by',s.verifiedBy)}${s.sources.map(id=>detail(bank.sourceOptions.find(x=>x.id===id)?.label||id,s.evidence[id])).join('')}${s.issues.length?detail('Possible problem',s.issues.map(id=>bank.issueOptions.find(x=>x.id===id)?.label||id).join('; ')):''}${s.improvement?detail('Improvement / action',s.improvement):''}${s.retest?detail('Retest answer',s.retest):''}</dl></section>`;}).join('')}
    <section class="report-question"><h2>Updated-source experiment (separate)</h2><p>Automatic synchronisation is not required for completion of the core questions.</p><dl class="report-meta">${Object.entries({method:'Connection method',reference:'New reference',change:'Change / time saved',wait:'Wait interval',answer:'Question and answer',result:'Observed result',manual:'Manual actions',notes:'Conclusion'}).map(([k,label])=>detail(label,state.experiment[k])).join('')}</dl></section>`;
  }
  function openReport(){if(!state)return;save();$('reportSheet').innerHTML=reportMarkup();show('reportScreen');}
  const REPORT_CSS=`body{font:11pt/1.5 Arial,sans-serif;color:#29313a;max-width:900px;margin:30px auto;padding:20px}h1,h2,h3{color:#3f5962;line-height:1.2}h1{font-size:25pt}h3{font-size:13pt}.eyebrow{font-size:9pt;letter-spacing:.08em}.report-question{border-top:1px solid #c8d6d8;margin-top:20px;padding-top:15px;break-inside:avoid}.report-meta{display:grid;grid-template-columns:170px 1fr;gap:5px 14px}.report-meta dt{font-weight:bold}.report-meta dd{margin:0;overflow-wrap:anywhere}.report-stats{display:flex;gap:28px;background:#eef4f5;padding:15px}.report-stats strong,.report-stats span{display:block}.report-stats strong{font-size:22pt}@page{size:A4;margin:16mm}@media print{body{max-width:none;margin:0;padding:0;font-size:10pt}}`;
  function exportReport(){const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nordic Freight test report</title><style>'+REPORT_CSS+'</style><body>'+reportMarkup()+'</body></html>';download(`NF-D-${safeName()}-report.html`,html,'text/html;charset=utf-8');}
  async function readJsonFile(file){if(file.size>3000000)throw new Error('Choose a JSON file smaller than 3 MB.');return JSON.parse(await file.text());}
  async function restore(file){
    try{const data=await readJsonFile(file);const b=await fetchBank(data.questionSet);const next=normalise(data,b);if((state||storageRead())&&!confirm('Replace this browser session with the selected backup?'))return;bank=b;state=next;index=0;save();openLab();if(localSaveOK)message('Backup restored.');}
    catch(e){message('Backup could not be restored: '+e.message,true);}
  }
  function clearTeacher(){teacherKey=null;teacherIndex=0;$('teacherKeyInput').value='';$('teacherKeyStatus').textContent='No answer key loaded';$('teacherPanel').hidden=true;$('teacherAnswerView').textContent='';}
  async function loadTeacher(file){
    try{
      const k=await readJsonFile(file);
      if(k.schemaVersion!==SCHEMA||k.caseId!=='nordic-freight-theme-d'||!['4','5'].includes(k.questionSet)||!Array.isArray(k.answers)||!k.answers.length||k.answers.some(a=>typeof a.question!=='string'||typeof a.expectedAnswer!=='string'))throw new Error('Invalid answer-key structure.');
      teacherKey=k;teacherIndex=0;$('teacherKeyStatus').textContent=`${k.questionSet}-person key | ${k.version}`;$('teacherQuestionCount').textContent=`${k.answers.length} questions`;$('teacherPanel').hidden=false;
      $('teacherSelect').innerHTML=k.answers.map((a,i)=>`<option value="${i}">${i+1}. ${esc(a.question)}</option>`).join('');
      renderTeacher();
    }catch(e){clearTeacher();$('teacherKeyStatus').textContent='Could not load key: '+e.message;}
  }
  function renderTeacher(){
    if(!teacherKey)return;const a=teacherKey.answers[teacherIndex];$('teacherSelect').value=String(teacherIndex);
    const mismatch=bank && (bank.groupSize!==Number(teacherKey.questionSet)||bank.version!==teacherKey.version||bank.questions.length!==teacherKey.answers.length||bank.questions.some((q,i)=>q.id!==teacherKey.answers[i]?.id||q.question!==teacherKey.answers[i]?.question));
    $('teacherAnswerView').innerHTML=(mismatch?'<p class="app-message warning">This key does not match the active student question bank. Check the group size, version and question order before using it for that group.</p>':'')+`<div class="teacher-answer"><p class="eyebrow">${esc(teacherKey.questionSet)} people | Question ${teacherIndex+1} | ${esc(a.id)}</p><h3>${esc(a.question)}</h3><dl class="report-meta">${[['Expected answer',a.expectedAnswer],['Sources',Array.isArray(a.sources)?a.sources.join(' + '):a.sources],['Exact evidence',a.evidence],['Expert',a.expert],['Follow-up',a.followUp],['Teaching note',a.note]].map(([key,value])=>`<dt>${esc(key)}</dt><dd>${esc(value||'-')}</dd>`).join('')}</dl></div>`;
  }
  function bind(id,event,fn){$(id)?.addEventListener(event,fn);}
  document.querySelectorAll('[data-group-size]').forEach(b=>b.onclick=()=>start(b.dataset.groupSize));
  bind('continueSavedBtn','click',resume);
  for(const id of ['restoreBackupInput','restoreStartInput'])bind(id,'change',async e=>{if(e.target.files[0])await restore(e.target.files[0]);e.target.value='';});
  bind('saveBackupBtn','click',()=>{save();download(`NF-D-${safeName()}-${state.questionSet}-backup.json`,JSON.stringify(state,null,2));});
  bind('reportBtn','click',openReport);bind('backToLabBtn','click',openLab);bind('experimentBackBtn','click',openLab);bind('experimentReportBtn','click',openReport);bind('experimentBtn','click',openExperiment);
  bind('printReportBtn','click',()=>window.print());bind('downloadHtmlReportBtn','click',exportReport);
  for(const id of ['teacherModeBtn','teacherStartBtn'])bind(id,'click',()=>{$('teacherDialog').showModal();});
  bind('teacherKeyInput','change',e=>{if(e.target.files[0])loadTeacher(e.target.files[0]);});
  bind('teacherSelect','change',e=>{teacherIndex=+e.target.value;renderTeacher();});
  bind('randomTeacherQuestionBtn','click',()=>{if(teacherKey){teacherIndex=Math.floor(Math.random()*teacherKey.answers.length);renderTeacher();}});
  bind('clearTeacherBtn','click',clearTeacher);
  bind('resetBtn','click',()=>$('resetDialog').showModal());
  bind('confirmResetBtn','click',()=>{try{localStorage.removeItem(STORAGE_KEY);}catch(_){}state=null;bank=null;index=0;clearTeacher();$('resetDialog').close();$('groupNameInput').value='';show('startScreen');savedNotice();message('Session cleared. Downloaded files have not been deleted.');});
  bind('brandHome','click',e=>{e.preventDefault();show('startScreen');savedNotice();});
  window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY&&state)message('This session was changed in another tab. Avoid editing the same test in two tabs. Save a backup before reloading.',true);else savedNotice();});
  window.addEventListener('pageshow',savedNotice);
  window.addEventListener('beforeunload',e=>{if(state&&!localSaveOK){e.preventDefault();e.returnValue='';}});
  async function loadConfig(){
    try{
      const r=await fetch('data/config.json',{cache:'no-store'});if(!r.ok)throw new Error('not available');config=await r.json();
      const safeUrl=value=>{const u=new URL(value,location.href);if(!['https:','http:'].includes(u.protocol))throw new Error('Unsupported document link');return u.href;};
      if(Array.isArray(config.materials))$('materialsLinks').innerHTML=config.materials.map(m=>'<a href="'+esc(safeUrl(m.url))+'" target="_blank" rel="noopener">'+esc(m.label)+'</a>').join('');
    }catch(_){$('materialsLinks').textContent='Use the materials links in the task instructions.';}
  }
  for(const id of ['teacherDialog','resetDialog']){bind(id,'click',e=>{if(e.target===$(id)){const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();}});}
  loadConfig();
  savedNotice();
})();
