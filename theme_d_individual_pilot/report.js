/* One-page (or, if needed, two-page) evidence report renderer. No network, third-party runtime or font files.
   PDF 1.4: standard Helvetica text, vector marks, JPEG screenshots. UTF-8 content
   not available in WinAnsi is rendered as a small high-resolution text image.
   All report text is checked for fit; nothing is silently clipped. */
(function () {
'use strict';
const WIDTHS = {"Helvetica":{" ":278,"!":278,"\"":355,"#":556,"$":556,"%":889,"&":667,"'":191,"(":333,")":333,"*":389,"+":584,",":278,"-":333,".":278,"/":278,"0":556,"1":556,"2":556,"3":556,"4":556,"5":556,"6":556,"7":556,"8":556,"9":556,":":278,";":278,"<":584,"=":584,">":584,"?":556,"@":1015,"A":667,"B":667,"C":722,"D":722,"E":667,"F":611,"G":778,"H":722,"I":278,"J":500,"K":667,"L":556,"M":833,"N":722,"O":778,"P":667,"Q":778,"R":722,"S":667,"T":611,"U":722,"V":667,"W":944,"X":667,"Y":667,"Z":611,"[":278,"\\":278,"]":278,"^":469,"_":556,"`":333,"a":556,"b":556,"c":500,"d":556,"e":556,"f":278,"g":556,"h":556,"i":222,"j":222,"k":500,"l":222,"m":833,"n":556,"o":556,"p":556,"q":556,"r":333,"s":500,"t":278,"u":556,"v":500,"w":722,"x":500,"y":500,"z":500,"{":334,"|":260,"}":334,"~":584,"\u007f":761,"\u20ac":556,"\u201a":222,"\u0192":556,"\u201e":333,"\u2026":1000,"\u2020":556,"\u2021":556,"\u02c6":333,"\u2030":1000,"\u0160":667,"\u2039":333,"\u0152":1000,"\u017d":611,"\u2018":222,"\u2019":222,"\u201c":333,"\u201d":333,"\u2022":350,"\u2013":556,"\u2014":1000,"\u02dc":333,"\u2122":1000,"\u0161":500,"\u203a":333,"\u0153":944,"\u017e":500,"\u0178":667,"\u00a0":278,"\u00a1":333,"\u00a2":556,"\u00a3":556,"\u00a4":556,"\u00a5":556,"\u00a6":260,"\u00a7":556,"\u00a8":333,"\u00a9":737,"\u00aa":370,"\u00ab":556,"\u00ac":584,"\u00ad":333,"\u00ae":737,"\u00af":333,"\u00b0":400,"\u00b1":584,"\u00b2":333,"\u00b3":333,"\u00b4":333,"\u00b5":556,"\u00b6":537,"\u00b7":278,"\u00b8":333,"\u00b9":333,"\u00ba":365,"\u00bb":556,"\u00bc":834,"\u00bd":834,"\u00be":834,"\u00bf":611,"\u00c0":667,"\u00c1":667,"\u00c2":667,"\u00c3":667,"\u00c4":667,"\u00c5":667,"\u00c6":1000,"\u00c7":722,"\u00c8":667,"\u00c9":667,"\u00ca":667,"\u00cb":667,"\u00cc":278,"\u00cd":278,"\u00ce":278,"\u00cf":278,"\u00d0":722,"\u00d1":722,"\u00d2":778,"\u00d3":778,"\u00d4":778,"\u00d5":778,"\u00d6":778,"\u00d7":584,"\u00d8":778,"\u00d9":722,"\u00da":722,"\u00db":722,"\u00dc":722,"\u00dd":667,"\u00de":667,"\u00df":611,"\u00e0":556,"\u00e1":556,"\u00e2":556,"\u00e3":556,"\u00e4":556,"\u00e5":556,"\u00e6":889,"\u00e7":500,"\u00e8":556,"\u00e9":556,"\u00ea":556,"\u00eb":556,"\u00ec":278,"\u00ed":278,"\u00ee":278,"\u00ef":278,"\u00f0":556,"\u00f1":556,"\u00f2":556,"\u00f3":556,"\u00f4":556,"\u00f5":556,"\u00f6":556,"\u00f7":584,"\u00f8":611,"\u00f9":556,"\u00fa":556,"\u00fb":556,"\u00fc":556,"\u00fd":500,"\u00fe":556,"\u00ff":500},"Helvetica-Bold":{" ":278,"!":333,"\"":474,"#":556,"$":556,"%":889,"&":722,"'":238,"(":333,")":333,"*":389,"+":584,",":278,"-":333,".":278,"/":278,"0":556,"1":556,"2":556,"3":556,"4":556,"5":556,"6":556,"7":556,"8":556,"9":556,":":333,";":333,"<":584,"=":584,">":584,"?":611,"@":975,"A":722,"B":722,"C":722,"D":722,"E":667,"F":611,"G":778,"H":722,"I":278,"J":556,"K":722,"L":611,"M":833,"N":722,"O":778,"P":667,"Q":778,"R":722,"S":667,"T":611,"U":722,"V":667,"W":944,"X":667,"Y":667,"Z":611,"[":333,"\\":278,"]":333,"^":584,"_":556,"`":333,"a":556,"b":611,"c":556,"d":611,"e":556,"f":333,"g":611,"h":611,"i":278,"j":278,"k":556,"l":278,"m":889,"n":611,"o":611,"p":611,"q":611,"r":389,"s":556,"t":333,"u":611,"v":556,"w":778,"x":556,"y":556,"z":500,"{":389,"|":280,"}":389,"~":584,"\u007f":761,"\u20ac":556,"\u201a":278,"\u0192":556,"\u201e":500,"\u2026":1000,"\u2020":556,"\u2021":556,"\u02c6":333,"\u2030":1000,"\u0160":667,"\u2039":333,"\u0152":1000,"\u017d":611,"\u2018":278,"\u2019":278,"\u201c":500,"\u201d":500,"\u2022":350,"\u2013":556,"\u2014":1000,"\u02dc":333,"\u2122":1000,"\u0161":556,"\u203a":333,"\u0153":944,"\u017e":500,"\u0178":667,"\u00a0":278,"\u00a1":333,"\u00a2":556,"\u00a3":556,"\u00a4":556,"\u00a5":556,"\u00a6":280,"\u00a7":556,"\u00a8":333,"\u00a9":737,"\u00aa":370,"\u00ab":556,"\u00ac":584,"\u00ad":333,"\u00ae":737,"\u00af":333,"\u00b0":400,"\u00b1":584,"\u00b2":333,"\u00b3":333,"\u00b4":333,"\u00b5":611,"\u00b6":556,"\u00b7":278,"\u00b8":333,"\u00b9":333,"\u00ba":365,"\u00bb":556,"\u00bc":834,"\u00bd":834,"\u00be":834,"\u00bf":611,"\u00c0":722,"\u00c1":722,"\u00c2":722,"\u00c3":722,"\u00c4":722,"\u00c5":722,"\u00c6":1000,"\u00c7":722,"\u00c8":667,"\u00c9":667,"\u00ca":667,"\u00cb":667,"\u00cc":278,"\u00cd":278,"\u00ce":278,"\u00cf":278,"\u00d0":722,"\u00d1":722,"\u00d2":778,"\u00d3":778,"\u00d4":778,"\u00d5":778,"\u00d6":778,"\u00d7":584,"\u00d8":778,"\u00d9":722,"\u00da":722,"\u00db":722,"\u00dc":722,"\u00dd":667,"\u00de":667,"\u00df":611,"\u00e0":556,"\u00e1":556,"\u00e2":556,"\u00e3":556,"\u00e4":556,"\u00e5":556,"\u00e6":889,"\u00e7":556,"\u00e8":556,"\u00e9":556,"\u00ea":556,"\u00eb":556,"\u00ec":278,"\u00ed":278,"\u00ee":278,"\u00ef":278,"\u00f0":611,"\u00f1":611,"\u00f2":611,"\u00f3":611,"\u00f4":611,"\u00f5":611,"\u00f6":611,"\u00f7":584,"\u00f8":611,"\u00f9":611,"\u00fa":611,"\u00fb":611,"\u00fc":611,"\u00fd":556,"\u00fe":611,"\u00ff":556}};
const W=595.28,H=841.89,M=28,CW=W-2*M;
const C={ink:'#29313A',body:'#4F5962',strong:'#3F5962',accent:'#8DAEB6',soft:'#EEF4F5',line:'#D9D1C5',warm:'#D8C4BE',white:'#FFFFFF',good:'#24634B',warn:'#9B6500',bad:'#AE3737'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/\r\n/g,'\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/\u00a0/g,' ');
const measureCanvas=document.createElement('canvas');const mc=measureCanvas.getContext('2d');
function width(s,size=9,font='regular'){
 const m=WIDTHS[font==='bold'?'Helvetica-Bold':'Helvetica'];
 let n=0;
 for(const ch of s){if(m[ch]===undefined){mc.font=(font==='bold'?'bold ':'')+size+'px Arial';return mc.measureText(s).width;}n+=m[ch];}
 return n*size/1000;
}
function wrap(s,w,size=9,font='regular'){
 s=clean(s);if(!s)return [];
 const out=[];
 for(const paragraph of s.split('\n')){
  if(!paragraph){out.push('');continue;}
  let line='';
  for(const word of paragraph.split(/\s+/)){
   if(width((line?line+' ':'')+word,size,font)<=w){line+=(line?' ':'')+word;continue;}
   if(line){out.push(line);line='';}
   if(width(word,size,font)<=w){line=word;continue;}
   for(const ch of word){if(width(line+ch,size,font)>w&&line){out.push(line);line='';}line+=ch;}
  }
  if(line)out.push(line);
 }
 return out;
}
function summary(model){
 const {level,state}=model;let documented=0,checked=0,good=0;
 level.questions.forEach(q=>{let t=state.tests[q.id]||{};if(t.answer?.trim()&&t.first)documented++;
  if(t.readOriginal&&t.sources?.length&&t.sources.every(k=>(t.refs[k]||'').trim()))checked++;
  if((t.retested?t.latest:t.first)==='correct')good++;
 });
 return {documented,checked,good,total:level.questions.length,images:state.images.filter(Boolean).length};
}
function createPrimerScene(model){
 const {level,state}=model,sc={width:W,height:H,ops:[],issues:[],model};
 const rect=(x,y,w,h,fill,stroke)=>sc.ops.push({t:'rect',x,y,w,h,fill,stroke});
 const text=(s,x,y,size=10,font='regular',color=C.ink)=>sc.ops.push({t:'text',s:clean(s),x,y,size,font,color});
 const line=(x1,y1,x2,y2)=>sc.ops.push({t:'line',x1,y1,x2,y2,color:C.line,th:.6});
 function para(s,x,y,w,size=10,maxLines=10,label='Text'){
  const lines=wrap(s,w,size);if(lines.length>maxLines)sc.issues.push(label+' is too long. A few words are enough for this practice.');
  lines.forEach((v,i)=>text(v,x,y+i*(size+3),size));return lines.length*(size+3);
 }
 [C.strong,C.accent,'#C8D6D8',C.warm].forEach((co,i)=>rect(M+i*CW/4,16,CW/4,4,co));
 text('AI FOR BUSINESS / TECHNICAL PRACTICE',M,31,7.3,'bold',C.strong);
 text('B / IMAGES FIRST',W-M-width('B / IMAGES FIRST',7.3,'bold'),31,7.3,'bold',C.strong);
 text('Your demo PDF',M,51,24);
 text('DO NOT SUBMIT',M,85,11,'bold',C.bad);
 text('Only a tool check. No assessment and no Moodle submission.',M,104,9,'regular',C.body);
 para('Name: '+(state.student||'[not entered]'),M,130,330,9,2,'Name');
 text(new Date().toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'}),W-M-80,130,9,'regular',C.body);
 text('01  Your two practice images',M,165,10.2,'bold',C.strong);
 for(let i=0;i<2;i++){
  const y=i===0?184:291,by=y+13,bh=80;
  text('Image '+(i+1)+' / Any image is fine for this practice',M,y,8.4,'bold');
  rect(M,by,CW,bh,'#F6F8F8',C.line);const img=state.images[i];
  if(img){const scale=Math.min((CW-4)/img.w,(bh-4)/img.h),w=img.w*scale,h=img.h*scale;sc.ops.push({t:'image',data:img.data,x:M+(CW-w)/2,y:by+(bh-h)/2,w,h});}
  else text('No image added yet',M+12,by+32,10,'regular',C.body);
 }
 text('02  The words you typed',M,402,10.2,'bold',C.strong);
 let y=424;
 for(const [label,value] of [['Demo text 1',state.improvement],['Demo text 2',state.reflection]]){
  const height=Math.max(42,wrap(value||'[not entered]',CW-132,10).length*13+16);
  rect(M,y,112,height,C.soft,C.line);rect(M+112,y,CW-112,height,C.white,C.line);
  text(label,M+10,y+12,9,'bold',C.strong);para(value||'[not entered]',M+122,y+12,CW-132,10,6,label);y+=height;
 }
 y+=24;text('03  Your checkbox test',M,y,10.2,'bold',C.strong);y+=22;
 rect(M,y,11,11,state.checklist?.[0]?C.strong:C.white,C.strong);
 if(state.checklist?.[0])sc.ops.push({t:'poly',pts:[[M+2,y+5],[M+4.5,y+8],[M+9,y+2.5]],color:C.white,th:1.3});
 text(state.checklist?.[0]?'I am trying a checkbox.':'Checkbox not ticked yet.',M+19,y,10);y+=33;
 text('Can you see your name, both images and your words?',M,y,11,'bold',C.strong);y+=21;
 text('That is the whole test. You can now use the tool for Level 1.',M,y,9.5);
 if(y>787)sc.issues.push('Please shorten the demo text. Just a few words are enough.');
 line(M,805,W-M,805);
 text('TECHNICAL PRACTICE / DO NOT SUBMIT / Not assessed',M,812,7,'bold',C.bad);
 text('DEMO / 1 of 1',W-M-55,812,7,'regular',C.body);
 text(model.complete?'Name, images, demo text and checkbox recorded.':'Some practice fields are empty. You can still use this PDF to test the download.',M,826,6.8,'regular',C.body);
 return sc;
}

/* Automatic fit, in this order:
   1. Reduce the variable text (test rows and closing notes) in small steps down to TEXT_SCALE_MIN.
   2. Reduce the left and right page margins down to MARGIN_MIN.
   3. If it still does not fit, continue on a second page at normal size. This is allowed and
      is shown to the student as information, not as an error.
   Only if the text does not fit even on two pages is the student asked to shorten it. */
const TEXT_SCALE_MIN=0.88,TEXT_SCALE_STEP=0.02,MARGIN_NORMAL=28,MARGIN_MIN=20,MARGIN_STEP=4,BOTTOM=789;
const TWO_PAGE_NOTICE='Your report has a lot of text, so the PDF has two pages. This is OK.';
function createScene(model){
 if(model.level.id==='primer')return createPrimerScene(model);
 let sc;
 for(let k=1;k>=TEXT_SCALE_MIN-1e-9;k=Math.round((k-TEXT_SCALE_STEP)*100)/100){sc=buildScene(model,k,MARGIN_NORMAL,false);if(!sc.issues.length)return sc;}
 for(let m=MARGIN_NORMAL-MARGIN_STEP;m>=MARGIN_MIN;m-=MARGIN_STEP){sc=buildScene(model,TEXT_SCALE_MIN,m,false);if(!sc.issues.length)return sc;}
 sc=buildScene(model,1,MARGIN_NORMAL,true);
 if(!sc.issues.length&&sc.pages>1)sc.notices.push(TWO_PAGE_NOTICE);
 return sc;
}
function buildScene(model,k,m,twoPage){
 const M=m,CW=W-2*m;
 const {config,level,state}=model,sc={width:W,height:H,ops:[],issues:[],notices:[],model,textScale:k,margin:m,pages:1};
 let pg=0;
 const rect=(x,y,w,h,fill,stroke)=>sc.ops.push({t:'rect',x,y,w,h,fill,stroke,p:pg});
 const line=(x1,y1,x2,y2,color=C.line,th=.6)=>sc.ops.push({t:'line',x1,y1,x2,y2,color,th,p:pg});
 const text=(s,x,y,size=9,font='regular',color=C.ink)=>sc.ops.push({t:'text',s:clean(s),x,y,size,font,color,p:pg});
 function para(s,x,y,w,size=9,font='regular',leading=11.5,maxLines=99,label='Text'){
  let ls=wrap(s,w,size,font);if(ls.length>maxLines)sc.issues.push(label+' is too long for the report. Shorten it (currently '+ls.length+' lines; space for '+maxLines+').');
  ls.forEach((s,i)=>text(s,x,y+i*leading,size,font));return ls.length*leading;
 }
 const section=(num,title,y)=>{text(num,M,y,7.5,'bold',C.strong);text(title,M+24,y,10.2,'bold',C.strong);};
 function icon(status,x,y,size=9){
  // Same monochrome shapes as the approved UI, drawn as vectors for every PDF reader.
  if(status==='correct'){
   line(x+.5,y+size*.53,x+size*.37,y+size*.88,C.strong,1.35);
   line(x+size*.37,y+size*.88,x+size-.3,y+.5,C.strong,1.35);
  }else if(status==='partial'){
   line(x+size/2,y+.4,x+size/2,y+size*.64,C.strong,1.35);
   rect(x+size/2-.65,y+size*.86,1.3,1.3,C.strong);
  }else if(status==='incorrect'){
   line(x+1,y+1,x+size-1,y+size-1,C.strong,1.35);
   line(x+size-1,y+1,x+1,y+size-1,C.strong,1.35);
  }else{line(x+1,y+size/2,x+size-1,y+size/2,C.body,1);}
 }

 const s=summary(model);const isPrimer=level.id==='primer';
 const title=isPrimer?'Technical practice':('Level '+level.id+'  '+level.title);
 [C.strong,C.accent,'#C8D6D8',C.warm].forEach((co,i)=>rect(M+i*CW/4,16,CW/4,4,co));
 text('AI FOR BUSINESS / INDIVIDUAL REPORT',M,31,7.3,'bold',C.strong);
 text('B / EVIDENCE FIRST',W-M-width('B / EVIDENCE FIRST',7.3,'bold'),31,7.3,'bold',C.strong);
 text(title,M,51,isPrimer?21:20,'regular');
 para('Student: '+(state.student||'[not entered]'),M,80,260,8.6,'regular',10,2,'Student name');
 para('Assistant: '+(state.assistant||'[not entered]'),M+276,80,260,8.6,'regular',10,2,'Assistant name');
 text('Case: '+config.caseLabel,M,101,7.8,'regular',C.body);
 const date=new Date().toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'});
 text('Report date: '+date,M+276,101,7.8,'regular',C.body);
 rect(M,116,CW,22,C.soft);
 text(s.documented+'/'+s.total+' tests documented',M+9,123,8.3);
 text(s.checked+'/'+s.total+' source checks',M+192,123,8.3);
 text(s.images+'/2 screenshots',M+378,123,8.3);
 const completeness=(model.complete?'Required fields recorded':'Draft - some fields are incomplete');
 text(isPrimer?'TECHNICAL PRACTICE - DO NOT SUBMIT':completeness+' | Student self-check, not automatic marking',M,146,7.5,'regular',isPrimer?C.bad:C.body);
 section('01','Evidence of my work',165);
 for(let i=0;i<2;i++){
  let capY=i===0?184:291,boxY=capY+13,boxH=80;
  para('Screenshot '+(i+1)+' / '+level.screenshots[i].title,M,capY,CW,8.4,'bold',10,1,'Screenshot heading');
  rect(M,boxY,CW,boxH,'#F6F8F8',C.line);
  let img=state.images[i];
  if(img){
   let scale=Math.min((CW-4)/img.w,(boxH-4)/img.h),iw=img.w*scale,ih=img.h*scale;
   sc.ops.push({t:'image',data:img.data,x:M+(CW-iw)/2,y:boxY+(boxH-ih)/2,w:iw,h:ih,p:pg});
  }else{
   text(isPrimer&&i===1?'Optional practice image - not added':'No screenshot attached',M+12,boxY+31,10,'regular',C.body);
  }
 }
 section('02','Test results and original evidence',402);
 const wf=(CW-56)/483.28,widths=[94*wf,234*wf,155.28*wf,28,28];let xs=[M];widths.forEach(w=>xs.push(xs[xs.length-1]+w));
 const aMax=twoPage?8:5,eMax=twoPage?10:6,noteMax=twoPage?14:9;
 let y=419,headH=22;
 const tableHead=()=>{rect(M,y,CW,headH,C.soft);['Test / short question','Assistant answer - summary','Original evidence','1st','Last'].forEach((h,i)=>text(h,xs[i]+7,y+7,7.1,'bold',C.strong));y+=headH;};
 const newPage=()=>{
  pg=1;sc.pages=2;
  [C.strong,C.accent,'#C8D6D8',C.warm].forEach((co,i)=>rect(M+i*CW/4,16,CW/4,4,co));
  text('AI FOR BUSINESS / INDIVIDUAL REPORT',M,31,7.3,'bold',C.strong);
  text(title+' (continued)',M,48,13,'regular');
  text('Student: '+(state.student||'[not entered]'),M,68,8.6,'regular',C.body);
  y=92;
 };
 tableHead();
 for(const q of level.questions){
  const t=state.tests[q.id]||{},labelLines=wrap(q.label,widths[0]-14,8.4*k),aLines=wrap(t.answer||'[not recorded]',widths[1]-14,8.8*k);
  const sourceDefs=Object.fromEntries(config.sources.map(v=>[v.id,v]));
  const evid=(t.sources||[]).map(k=>sourceDefs[k]?.short+': '+(t.refs[k]||'[location missing]')).join('\n');
  const eLines=wrap(evid||'[not recorded]',widths[2]-14,8.1*k);
  const rh=Math.max(33*k,12+Math.max(11*k+labelLines.length*10*k,aLines.length*10.5*k,eLines.length*9.8*k));
  if(twoPage&&pg===0&&y+rh>BOTTOM){newPage();tableHead();}
  if(t.first&&t.first!=='correct')rect(M,y,CW,rh,'#F5EFEC');
  text(q.id,xs[0]+7,y+6,8.1*k,'bold');labelLines.forEach((v,i)=>text(v,xs[0]+7,y+6+11*k+i*10*k,8.4*k));
  aLines.forEach((v,i)=>text(v,xs[1]+7,y+6+i*10.5*k,8.8*k));eLines.forEach((v,i)=>text(v,xs[2]+7,y+6+i*9.8*k,8.1*k));
  icon(t.first,xs[3]+9,y+(rh-9)/2);icon(t.retested?t.latest:t.first,xs[4]+9,y+(rh-9)/2);
  if(t.sources?.length&&!t.readOriginal)text('Not yet checked',xs[2]+7,y+rh-8,6.6,'regular',C.bad);
  y+=rh;line(M,y,W-M,y);
  if(aLines.length>aMax)sc.issues.push(q.id+': shorten the answer summary.');
  if(eLines.length>eMax)sc.issues.push(q.id+': use short source IDs and exact sections, not full quotations.');
 }
 if(twoPage&&pg===0&&y+20>BOTTOM)newPage();
 y+=10;icon('correct',M,y,8);text('Correct',M+12,y,7.2);icon('partial',M+66,y,8);text('Partly correct',M+78,y,7.2);icon('incorrect',M+154,y,8);text('Incorrect / no answer',M+166,y,7.2);text('1st / Last = student-reported results',M+334,y,7.0,'regular',C.body);
 y+=24;
 const mid=M+(CW+18)/2,colW=(CW-18)/2;
 let left=state.improvement||'[not recorded]';
 if(level.experiment){
  const labels={auto:'New information found without re-upload',notyet:'New information not found',manual:'Found after manual re-upload only',unclear:'Result unclear',untested:'Not tested'};
  const exp=state.experiment||{};left+='\nUpdate: '+(labels[exp.outcome]||'Not recorded')+(exp.wait?' (about '+exp.wait+' min).':'.')+(exp.note?' '+exp.note:'');
 }
 const notesH=18+Math.max(wrap(left,colW,9*k).length,wrap(state.reflection||'[not recorded]',colW,9*k).length)*11.5*k;
 if(twoPage&&pg===0&&y+notesH>BOTTOM)newPage();
 text('03  '+(level.experiment?'Changes & update experiment':'What I checked or improved'),M,y,9.4,'bold',C.strong);
 text('04  Reflection & handover',mid,y,9.4,'bold',C.strong);y+=18;
 let lh=para(left,M,y,colW,9*k,'regular',11.5*k,noteMax,'Changes / experiment note');
 let rh=para(state.reflection||'[not recorded]',mid,y,colW,9*k,'regular',11.5*k,noteMax,'Reflection');
 let bottom=y+Math.max(lh,rh);
 if(isPrimer){
  let cc=Object.values(state.checklist||{}).filter(Boolean).length;
  text('Practice checklist: '+cc+'/'+config.primerChecklist.length+' confirmed. Demo PDF only - no Moodle submission.',M,bottom+18,8.0,'regular',C.strong);
  bottom+=33;
 }
 if(bottom>BOTTOM)sc.issues.push('This report needs '+Math.ceil(bottom-BOTTOM)+' points more space'+(twoPage?', even on two pages':'')+'. Shorten the longest answer, source reference or closing note. Text will not be cut off.');
 for(let p=0;p<sc.pages;p++){
  pg=p;
  line(M,805,W-M,805);
  text(config.pilot?'PILOT ONLY / Dummy questions - not an assessed student submission.':'AI for Business / Theme D',M,812,6.9,'regular',C.body);
  text((isPrimer?'DEMO':('D'+level.id))+' / '+(p+1)+' of '+sc.pages,W-M-45,812,7,'regular',C.body);
  text('Original sources checked by the student. Uploaded screenshots are supporting evidence, not automatic proof.',M,826,6.4,'regular',C.body);
 }
 return sc;
}
function svg(sc){
 const out=[];
 for(let p=0;p<(sc.pages||1);p++){if(p)out.push('<div class="page-gap" style="height:14px;background:#e6e9e9"></div>');out.push(svgPage(sc,p));}
 return out.join('');
}
function svgPage(sc,page){
 let out=['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Theme D evidence report"><rect width="100%" height="100%" fill="white"/>'];
 for(const o of sc.ops){
  if((o.p||0)!==page)continue;
  if(o.t==='rect')out.push('<rect x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h+'" fill="'+(o.fill||'none')+'" stroke="'+(o.stroke||'none')+'" stroke-width=".6"/>');
  if(o.t==='line')out.push('<line x1="'+o.x1+'" y1="'+o.y1+'" x2="'+o.x2+'" y2="'+o.y2+'" stroke="'+o.color+'" stroke-width="'+o.th+'"/>');
  if(o.t==='poly')out.push('<'+(o.close?'polygon':'polyline')+' points="'+o.pts.map(v=>v.join(',')).join(' ')+'" fill="'+(o.fill||'none')+'" stroke="'+o.color+'" stroke-width="'+o.th+'"/>');
  if(o.t==='text')out.push('<text x="'+o.x+'" y="'+(o.y+o.size*.82)+'" font-family="Arial,Helvetica,sans-serif" font-size="'+o.size+'" font-weight="'+(o.font==='bold'?700:400)+'" fill="'+o.color+'" xml:space="preserve">'+esc(o.s)+'</text>');
  if(o.t==='image')out.push('<image x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h+'" href="'+o.data+'"/>');
 }
 return out.join('')+'</svg>';
}
function html(sc){
 const title='Theme D - '+(sc.model.level.id==='primer'?'Practice report':'Level '+sc.model.level.id);
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+esc(title)+'</title><style>body{margin:0;background:#e6e9e9;font-family:Arial,sans-serif;color:#29313a}nav{padding:16px;text-align:center}button{padding:12px 20px;cursor:pointer}main{width:210mm;max-width:100%;margin:auto;background:white}svg{display:block;width:100%;height:auto}@page{size:A4;margin:0}@media print{body{background:white}nav{display:none}main{width:210mm;max-width:none}.page-gap{display:none}svg{width:210mm;height:297mm;break-after:page}svg:last-of-type{break-after:auto}}</style><nav><button onclick="window.print()">Print / Save as PDF</button><p>Fallback report. Check that all text and images are readable. Use the course submission instructions. The technical-practice PDF must not be submitted.</p></nav><main>'+svg(sc)+'</main></html>';
}
const special=[0x20ac,0,0x201a,0x0192,0x201e,0x2026,0x2020,0x2021,0x02c6,0x2030,0x0160,0x2039,0x0152,0,0x017d,0,0,0x2018,0x2019,0x201c,0x201d,0x2022,0x2013,0x2014,0x02dc,0x2122,0x0161,0x203a,0x0153,0,0x017e,0x0178];
function byte(ch){let cp=ch.codePointAt(0);if(cp>=32&&cp<=126||cp>=160&&cp<=255)return cp;let idx=special.indexOf(cp);return idx<0?null:idx+128;}
function pdfString(s){return '('+Array.from(s).map(ch=>{let b=byte(ch);if(b===null)throw Error('Unsupported text');if(b===40||b===41||b===92)return '\\'+String.fromCharCode(b);return b>126?'\\'+b.toString(8).padStart(3,'0'):String.fromCharCode(b);}).join('')+')';}
function hexMeta(s){return '<FEFF'+Array.from(s).map(ch=>{let cp=ch.codePointAt(0);if(cp<=65535)return cp.toString(16).padStart(4,'0');cp-=65536;return (0xd800+(cp>>10)).toString(16)+(0xdc00+(cp&1023)).toString(16);}).join('')+'>';}
const ascii=s=>new TextEncoder().encode(s);
function concat(parts){let n=parts.reduce((a,b)=>a+b.length,0),out=new Uint8Array(n),offset=0;parts.forEach(p=>{out.set(p,offset);offset+=p.length;});return out;}
function n(v){return Number(v.toFixed(3));}
function rgb(hex){return hex.replace('#','').match(/../g).map(v=>n(parseInt(v,16)/255)).join(' ');}
function imgElement(data){return new Promise((resolve,reject)=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('A screenshot cannot be decoded. Replace that image.'));i.src=data;});}
async function jpeg(data){const i=await imgElement(data),c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const cx=c.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,c.width,c.height);cx.drawImage(i,0,0);let b64=c.toDataURL('image/jpeg',.94).split(',')[1],raw=atob(b64);return {bytes:Uint8Array.from(raw,ch=>ch.charCodeAt(0)),w:c.width,h:c.height};}
async function pdf(sc){
 if(sc.issues.length)throw new Error(sc.issues.join('\n'));
 let objs=[null,null],fonts={regular:3,bold:4};
 objs.push(ascii('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));
 objs.push(ascii('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'));
 const add=o=>{objs.push(o);return objs.length;};let images=[],cmds=[];const cache=new Map(),contentIds=[];
 async function putImage(data,x,y,w,h){
  let rec=cache.get(data);
  if(!rec){let j=await jpeg(data);let id=add(concat([ascii('<< /Type /XObject /Subtype /Image /Width '+j.w+' /Height '+j.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+j.bytes.length+' >>\nstream\n'),j.bytes,ascii('\nendstream')]));rec={name:'I'+images.length,id};images.push(rec);cache.set(data,rec);}
  cmds.push('q '+[w,0,0,h,x,H-y-h].map(n).join(' ')+' cm /'+rec.name+' Do Q');
 }
 for(let p=0;p<(sc.pages||1);p++){
 cmds=[];
 for(const o of sc.ops){
  if((o.p||0)!==p)continue;
  if(o.t==='rect'){cmds.push('q '+(o.fill?rgb(o.fill)+' rg ':'')+(o.stroke?rgb(o.stroke)+' RG .6 w ':'')+[o.x,H-o.y-o.h,o.w,o.h].map(n).join(' ')+' re '+(o.fill&&o.stroke?'B':o.fill?'f':'S')+' Q');}
  if(o.t==='line')cmds.push('q '+rgb(o.color)+' RG '+o.th+' w '+n(o.x1)+' '+n(H-o.y1)+' m '+n(o.x2)+' '+n(H-o.y2)+' l S Q');
  if(o.t==='poly')cmds.push('q '+rgb(o.color)+' RG '+(o.fill?rgb(o.fill)+' rg ':'')+o.th+' w '+o.pts.map((v,i)=>n(v[0])+' '+n(H-v[1])+(i?' l':' m')).join(' ')+(o.close?' h':'')+' '+(o.fill?'B':'S')+' Q');
  if(o.t==='text'){
   if(Array.from(o.s).every(ch=>byte(ch)!==null))cmds.push('BT /'+(o.font==='bold'?'FB':'FR')+' '+o.size+' Tf '+rgb(o.color)+' rg 1 0 0 1 '+n(o.x)+' '+n(H-o.y-o.size*.82)+' Tm '+pdfString(o.s)+' Tj ET');
   else{
    const c=document.createElement('canvas'),tw=Math.ceil(width(o.s,o.size,o.font))+3;c.width=tw*4;c.height=Math.ceil(o.size*1.45)*4;let cx=c.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,c.width,c.height);cx.scale(4,4);cx.font=(o.font==='bold'?'bold ':'')+o.size+'px Arial';cx.fillStyle=o.color;cx.textBaseline='alphabetic';cx.fillText(o.s,0,o.size*.82);await putImage(c.toDataURL('image/png'),o.x,o.y,tw,c.height/4);
   }
  }
  if(o.t==='image')await putImage(o.data,o.x,o.y,o.w,o.h);
 }
 const content=ascii(cmds.join('\n'));contentIds.push(add(concat([ascii('<< /Length '+content.length+' >>\nstream\n'),content,ascii('\nendstream')])));
 }
 const pageIds=contentIds.map(c=>add(ascii('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /FR 3 0 R /FB 4 0 R >> /XObject << '+images.map(v=>'/'+v.name+' '+v.id+' 0 R').join(' ')+' >> >> /Contents '+c+' 0 R >>')));
 objs[0]=ascii('<< /Type /Catalog /Pages 2 0 R >>');objs[1]=ascii('<< /Type /Pages /Kids ['+pageIds.map(v=>v+' 0 R').join(' ')+'] /Count '+pageIds.length+' >>');
 const info=add(ascii('<< /Title '+hexMeta(sc.model.level.id==='primer'?'Technical practice - DO NOT SUBMIT':'Theme D Level '+sc.model.level.id+' - Pilot report')+' /Author '+hexMeta(sc.model.state.student||'Student')+' /Creator (AI for Business Evidence Lab) >>'));
 let parts=[ascii('%PDF-1.4\n% Evidence Lab\n')],offset=parts[0].length,offsets=[0];
 objs.forEach((o,i)=>{offsets.push(offset);let data=concat([ascii((i+1)+' 0 obj\n'),o,ascii('\nendobj\n')]);parts.push(data);offset+=data.length;});
 let xref='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';offsets.slice(1).forEach(v=>xref+=String(v).padStart(10,'0')+' 00000 n \n');xref+='trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R /Info '+info+' 0 R >>\nstartxref\n'+offset+'\n%%EOF';parts.push(ascii(xref));return concat(parts);
}
window.ReportEngine={createScene,pdf,svg,html,summary,wrap,width};
})();
