'use strict';
(()=>{
const $=id=>document.getElementById(id);
const state={images:[],active:-1,tool:'select',drawing:null,crop:null,chosen:-1,dragging:null,undo:[],redo:[],lastLog:'',published:null,busy:false,zoomGuidesVisible:true,theme:'course',markColor:'#7d9c85',previewZoom:null,panView:false,panDrag:null};
const canvas=$('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:false});
const FIELDS={fileName:$('fileName'),altText:$('altText')};
const DEFAULT_MARK_COLORS={novia:'#ff1325',course:'#7d9c85'};
function setTheme(theme){
 theme=theme==='novia'?'novia':'course';state.theme=theme;document.documentElement.dataset.theme=theme;
 document.querySelectorAll('[data-theme-choice]').forEach(b=>{const active=b.dataset.themeChoice===theme;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 state.markColor=DEFAULT_MARK_COLORS[theme];$('color').value=state.markColor;
 syncPaletteSelection();
 document.querySelector('meta[name=theme-color]').content=theme==='novia'?'#fafafa':'#f5f5f1';
 try{localStorage.setItem('bildbibliotek-theme',theme);}catch(_){}
}
function setupTheme(){let saved='course';try{saved=localStorage.getItem('bildbibliotek-theme')||'course';}catch(_){}setTheme(saved);document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.themeChoice)));}

// Exact color-role values from Notion Design, 2026-11-20.
// The design concepts are optional visual palettes; the course profiles carry semantic roles.
const COLOR_PALETTES=[
 {name:'Novia · Officiell baspalett',kind:'novia',colors:[['Novia-röd','#FF1325'],['Svart','#000000'],['Vit','#FFFFFF'],['Märkesgrå','#E5E5E5'],['Linjegrå','#CCCCCC']]},
 {name:'Novia · Neutrala gråtoner',kind:'novia',colors:[['Nästan vit','#FAFAFA'],['Ljusgrå','#EAEAEA'],['Mörk grå','#3D3D3D'],['Mörk linjegrå','#4C4C4C'],['Mellangrå','#7F7F7F']]},
  {name:'DES-01 · Nordisk Salvia',source:'https://app.notion.com/p/415814b52e62815f81f4c3edd5e0b68a',colors:[['Text','#31433A'],['Salvia','#7D9C85'],['Ljus salvia','#D9E6DC'],['Sand','#EBDDD0'],['Linje','#CCD9CF']]},
  {name:'DES-02 · Terrakotta Redaktionell',source:'https://app.notion.com/p/415814b52e6281678c71ec04341d7c92',colors:[['Text','#463A33'],['Terrakotta','#BD7758'],['Ljus terrakotta','#E8CAB7'],['Puder','#F3E6DD'],['Linje','#E1D6CE']]},
  {name:'DES-03 · Blå Klarhet',source:'https://app.notion.com/p/415814b52e628186bd3bc102373c6752',colors:[['Text','#213E55'],['Blå','#3F80B1'],['Aqua','#BCE0EA'],['Ljusblå','#E7F3FA'],['Linje','#CEDDE6']]},
  {name:'DES-04 · Monokrom Atelier',source:'https://app.notion.com/p/415814b52e6281309815e406cbd55c70',colors:[['Text','#282A29'],['Grafit','#35393B'],['Grå','#D9DBD7'],['Ljusgrå','#EFEFEA'],['Linje','#D5D8D3']]},
  {name:'DES-05 · Pastellmoduler',source:'https://app.notion.com/p/415814b52e62812193afccae6351450c',colors:[['Text','#373544'],['Violett','#8E7BB8'],['Mint','#B7DED0'],['Rosa','#E4ADB6'],['Linje','#DEDCE8']]},
  {name:'DES-06 · Mörk Fokus',source:'https://app.notion.com/p/415814b52e628164af74f0e8348a5b28',colors:[['Mörk bas','#14212B'],['Ljust kort','#F5F8F7'],['Lime','#A8D970'],['Mint','#6ECBC1'],['Blågrå','#3C5360']]},
  {name:'PROF-02 · Affärssystem Fyrfärg',source:'https://app.notion.com/p/415814b52e62812c8ccac3f57dd7162f',colors:[['Text','#344247'],['Netvisor','#9DCAB4'],['Odoo','#72C4CA'],['Databaser','#9B8AC3'],['BI','#4C78C9']]},
  {name:'PROF-03 · IT-verktyg Mjuk Nordisk',source:'https://app.notion.com/p/415814b52e6281648eacf52e753f891a',colors:[['IT-tjänster','#8F9CA2'],['Excel','#95BFAE'],['Word','#739FC8'],['Access','#C27A7E'],['PowerPoint','#E39A70']]},
  {name:'PROF-04 · MBA AI Temafärger',source:'https://app.notion.com/p/415814b52e62818da9a7f6ed20fbe623',colors:[['Part 1','#A2C7C8'],['Theme A','#A2B7C8'],['Theme B','#9FABCB'],['Theme C','#AAA2C8'],['Stöd','#AAC8A2']]},
];

const text=(id,s)=>$(id).textContent=s;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const normalize=(s,backup='image')=>(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||backup;
const slugPath=s=>(s||'').split('/').map(v=>normalize(v,'')).filter(Boolean).join('/').slice(0,160)||'kursmaterial';
const nowStamp=()=>new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)+'-'+Math.random().toString(16).slice(2,6);
const current=()=>state.images[state.active]||null;
const clone=s=>JSON.parse(JSON.stringify(s));
const notify=(msg,isError=false)=>{text('publishStatus',msg);$('publishStatus').className='publish-status '+(isError?'error':'');};
function canvasData(img){let c=document.createElement('canvas');c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png');}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Kunde inte l\u00e4sa bilden.'));im.src=src;});}
function readFile(f){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(f);});}
async function addImageFile(file){if(!file||!file.type.startsWith('image/'))return;const data=await readFile(file);const image=await loadImage(data);if(image.naturalWidth>6500||image.naturalHeight>6500||image.naturalWidth*image.naturalHeight>26000000)throw Error('Bilden \u00e4r mycket stor. Anv\u00e4nd ett mindre sk\u00e4rmklipp.');const item={id:nowStamp(),name:normalize(file.name.replace(/\.[^.]+$/,'')),alt:'',src:canvasData(image),img:image,shapes:[],crop:null,steps:1};state.images.push(item);selectImage(state.images.length-1);}
async function addFiles(files){let n=0;for(const file of Array.from(files||[])){try{await addImageFile(file);n++;}catch(e){alert((file?.name||'Bild')+': '+e.message);}}if(n)notify(n+' bild(er) tillagda. Inget har publicerats.');}

const PREVIEW_MIN=.02,PREVIEW_MAX=4;
function clampView(v,a,b){return Math.max(a,Math.min(b,v));}
function previewFitScale(){
 const it=current(),host=$('canvasHost');if(!it||!host)return 1;
 return clampView(Math.min(1,(host.clientWidth-36)/it.img.naturalWidth,(host.clientHeight-36)/it.img.naturalHeight),PREVIEW_MIN,PREVIEW_MAX);
}
function previewScale(){return state.previewZoom===null?previewFitScale():state.previewZoom;}
function updatePreviewControls(){
 const enabled=!!current();
 for(const id of ['previewZoomOut','previewZoomIn','previewZoomSlider','previewZoomFit','previewZoomActual','previewPan'])$(id).disabled=!enabled;
 const scale=enabled?previewScale():1;
 $('previewZoomValue').textContent=enabled?(scale<.1?(scale*100).toFixed(1):Math.round(scale*100))+' %':'–';
 $('previewZoomSlider').value=String(clampView(Math.round(scale*100),2,400));
 $('previewZoomFit').classList.toggle('is-active',enabled&&state.previewZoom===null);
 $('previewZoomFit').setAttribute('aria-pressed',String(enabled&&state.previewZoom===null));
 $('previewPan').classList.toggle('is-active',enabled&&state.panView);
 $('previewPan').setAttribute('aria-pressed',String(enabled&&state.panView));
 $('canvasHost').classList.toggle('pan-view',enabled&&state.panView);
}
function applyPreviewScale(){
 const it=current(),host=$('canvasHost'),stage=$('canvasStage');
 if(!it||stage.hidden){updatePreviewControls();return;}
 const scale=previewScale();
 const w=Math.max(1,Math.round(it.img.naturalWidth*scale)),h=Math.max(1,Math.round(it.img.naturalHeight*scale));
 canvas.style.width=w+'px';canvas.style.height=h+'px';
 stage.style.width=Math.max(host.clientWidth,w+36)+'px';
 stage.style.height=Math.max(host.clientHeight,h+36)+'px';
 updatePreviewControls();
}
function setPreviewZoom(value,clientX,clientY){
 if(!current())return;
 const host=$('canvasHost'),before=canvas.getBoundingClientRect(),hostRect=host.getBoundingClientRect();
 const x=Number.isFinite(clientX)?clientX:hostRect.left+host.clientWidth/2;
 const y=Number.isFinite(clientY)?clientY:hostRect.top+host.clientHeight/2;
 const relX=before.width?clampView((x-before.left)/before.width,0,1):.5;
 const relY=before.height?clampView((y-before.top)/before.height,0,1):.5;
 state.previewZoom=clampView(Number(value)||previewFitScale(),PREVIEW_MIN,PREVIEW_MAX);
 applyPreviewScale();
 const after=canvas.getBoundingClientRect();
 host.scrollLeft+=after.left+relX*after.width-x;
 host.scrollTop+=after.top+relY*after.height-y;
}
function changePreviewZoom(factor,x,y){setPreviewZoom(previewScale()*factor,x,y);}
function fitPreview(){if(!current())return;state.previewZoom=null;applyPreviewScale();$('canvasHost').scrollLeft=0;$('canvasHost').scrollTop=0;}
function updatePanView(){updatePreviewControls();if(!state.panView)$('canvasHost').classList.remove('is-panning');}
function togglePanView(){if(!current())return;const next=!state.panView;if(next)setTool('select');state.panView=next;state.panDrag=null;updatePanView();if(next)closePreviewZoomPanel();}

function closePreviewZoomPanel(returnFocus=false){
 const panel=$('previewZoomPanel'),toggle=$('previewZoomToggle');
 if(!panel||panel.hidden)return;
 panel.hidden=true;toggle.setAttribute('aria-expanded','false');
 toggle.setAttribute('aria-label','Visa visningszoom');toggle.title='Visa visningszoom';
 if(returnFocus)toggle.focus();
}
function togglePreviewZoomPanel(){
 const panel=$('previewZoomPanel'),toggle=$('previewZoomToggle'),open=panel.hidden;
 panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Dölj visningszoom':'Visa visningszoom');
 toggle.title=open?'Dölj visningszoom':'Visa visningszoom';
}
function initPreviewControls(){
 $('previewZoomToggle').addEventListener('click',togglePreviewZoomPanel);
 $('previewZoomClose').addEventListener('click',()=>closePreviewZoomPanel(true));
 document.addEventListener('pointerdown',e=>{if(!$('canvasPreview').contains(e.target))closePreviewZoomPanel();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('previewZoomPanel').hidden){e.preventDefault();closePreviewZoomPanel(true);}});
 $('previewZoomIn').addEventListener('click',()=>changePreviewZoom(1.25));
 $('previewZoomOut').addEventListener('click',()=>changePreviewZoom(.8));
 $('previewZoomSlider').addEventListener('input',e=>setPreviewZoom(Number(e.target.value)/100));
 $('previewZoomFit').addEventListener('click',fitPreview);
 $('previewZoomActual').addEventListener('click',()=>setPreviewZoom(1));
 $('previewPan').addEventListener('click',togglePanView);
 const host=$('canvasHost');
 host.addEventListener('wheel',e=>{if(!current()||!(e.ctrlKey||e.metaKey))return;e.preventDefault();changePreviewZoom(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY);},{passive:false});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(current())applyPreviewScale();}).observe(host);
 else window.addEventListener('resize',()=>{if(current())applyPreviewScale();});
 updatePreviewControls();
}
function clearHistory(){state.undo=[];state.redo=[];state.chosen=-1;}
function saveHistory(){const it=current();if(!it)return;state.undo.push({id:it.id,src:it.src,shapes:clone(it.shapes),crop:it.crop?clone(it.crop):null,steps:it.steps});if(state.undo.length>35)state.undo.shift();state.redo=[];}
async function restoreSnapshot(s){const it=current();if(!it||s.id!==it.id)return;it.src=s.src;it.img=await loadImage(s.src);it.shapes=clone(s.shapes);it.crop=s.crop?clone(s.crop):null;it.steps=s.steps;state.chosen=-1;render();}
async function undo(){const it=current();if(!it||!state.undo.length)return;const s=state.undo.pop();state.redo.push({id:it.id,src:it.src,shapes:clone(it.shapes),crop:it.crop,steps:it.steps});await restoreSnapshot(s);}
async function redo(){const it=current();if(!it||!state.redo.length)return;const s=state.redo.pop();state.undo.push({id:it.id,src:it.src,shapes:clone(it.shapes),crop:it.crop,steps:it.steps});await restoreSnapshot(s);}
function selectImage(index){closePreviewZoomPanel();if(index<0||index>=state.images.length){state.active=-1;state.previewZoom=null;state.panView=false;state.panDrag=null;$('canvasStage').hidden=true;$('canvas').hidden=true;$('empty').hidden=false;renderList();renderLayers();updateZoomPanel();updatePreviewControls();return;}state.active=index;clearHistory();state.drawing=null;state.crop=null;state.previewZoom=null;state.panView=false;state.panDrag=null;const it=current();FIELDS.fileName.value=it.name;FIELDS.altText.value=it.alt;$('empty').hidden=true;$('canvasStage').hidden=false;$('canvas').hidden=false;$('removeImage').disabled=false;$('applyCrop').disabled=true;$('cancelCrop').disabled=true;$('stepStart').value=it.steps||1;renderList();render();$('canvasHost').scrollLeft=0;$('canvasHost').scrollTop=0;}
function renderList(){const list=$('imageList');list.replaceChildren();state.images.forEach((it,i)=>{const b=document.createElement('button');b.className='image-item'+(i===state.active?' active':'');b.type='button';const im=document.createElement('img');im.src=it.src;const x=document.createElement('div');const title=document.createElement('strong');title.textContent=it.name||'image';const detail=document.createElement('small');detail.textContent=(it.img?.naturalWidth||'')+' x '+(it.img?.naturalHeight||'')+' px';x.append(title,detail);b.append(im,x);b.addEventListener('click',()=>selectImage(i));list.append(b);});text('count',state.images.length+' bilder');if(!state.images.length){const p=document.createElement('p');p.className='muted small';p.textContent='Inga bilder \u00e4nnu.';list.append(p);$('removeImage').disabled=true;}}
function point(evt){const r=canvas.getBoundingClientRect();return{x:(evt.clientX-r.left)*canvas.width/r.width,y:(evt.clientY-r.top)*canvas.height/r.height};}

function textLayout(s,W,measureCtx=ctx){
 const size=s.font||Math.max(23,Math.round(W/45));
 const lines=String(s.text||'').split('\n');
 measureCtx.save();
 measureCtx.font='bold '+size+'px Segoe UI,Arial';
 const widest=Math.max(20,...lines.map(line=>measureCtx.measureText(line).width));
 measureCtx.restore();
 const pad=size*.32;
 return {size,lines,pad,width:widest+2*pad,height:size*1.35*lines.length+pad*2};
}
function bbox(s){if(s.kind==='text'){const m=textLayout(s,canvas.width||current()?.img?.naturalWidth||1600);return{left:s.x,top:s.y,right:s.x+m.width,bottom:s.y+m.height};}if(s.kind==='shortcut'){const l=shortcutLayout(s,canvas.width||1600);return{left:s.x,top:s.y,right:s.x+l.width,bottom:s.y+l.height};}return {left:Math.min(s.x,s.x2??s.x),top:Math.min(s.y,s.y2??s.y),right:Math.max(s.x,s.x2??s.x),bottom:Math.max(s.y,s.y2??s.y)};}

function shortcutLayout(s,W){
 const steps=Array.isArray(s.steps)&&s.steps.length?s.steps:[['Ctrl','Shift','S']];
 let size=Math.max(13,Math.min(56,Number(s.font)||Math.round(W/60)));
 function calc(fs){
  const pad=Math.round(fs*.51),gap=Math.round(fs*.16),keyHeight=Math.round(fs*1.48),parts=[];
  steps.forEach((keys,j)=>{if(j)parts.push({type:'between',label:'→',width:fs*1.36});
   (keys||[]).forEach((k,i)=>{if(i)parts.push({type:'plus',label:'+',width:fs*.7});const label=String(k).slice(0,16);parts.push({type:'key',label,width:Math.max(fs*1.36,fs*(.97+label.length*.64))});});});
  return{fs,pad,gap,keyHeight,parts,width:Math.round(pad*2+parts.reduce((sum,p)=>sum+p.width,0)+gap*Math.max(0,parts.length-1)),height:Math.round(keyHeight+pad*2)};
 }
 let l=calc(size);for(let i=0;i<24&&l.width>W*.93&&size>12;i++){size=Math.max(12,size*.91);l=calc(size);}
 return l;
}
function shortcutSummary(s){return(Array.isArray(s.steps)?s.steps:[]).map(a=>a.join(' + ')).join(' → ')||'Tangentbordsgenväg';}

function zoomLens(s,W,H){
 const b=bbox(s),midX=(b.left+b.right)/2,midY=(b.top+b.bottom)/2;
 const r=Math.max(24,Math.min(W*.2,H*.24,Math.max(80,Math.min(W,H)*.15)));
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 const clearance=Math.min(r+10,Math.min(W,H)/2);
 let x=b.right+r+20<W-r-10?b.right+r+20:b.left-r-20>r+10?b.left-r-20:W-r-12;
 let y=clamp(midY,clearance,H-clearance);
 return {cx:clamp(Number.isFinite(s.lensX)?s.lensX:x,clearance,W-clearance),cy:clamp(Number.isFinite(s.lensY)?s.lensY:y,clearance,H-clearance),r,midX,midY};
}
function isOverZoomLens(s,p){const l=zoomLens(s,canvas.width,canvas.height);return Math.hypot(p.x-l.cx,p.y-l.cy)<=l.r+12;}
function zoomHandlePoints(s){const b=bbox(s),mx=(b.left+b.right)/2,my=(b.top+b.bottom)/2;return [
 ['nw',b.left,b.top],['n',mx,b.top],['ne',b.right,b.top],['e',b.right,my],
 ['se',b.right,b.bottom],['s',mx,b.bottom],['sw',b.left,b.bottom],['w',b.left,my]];}
function screenToImagePx(px=1){const r=canvas.getBoundingClientRect();return px*(canvas.width/(r.width||canvas.width));}
function zoomHandleAt(s,p){const limit=screenToImagePx(12);for(const [name,x,y] of zoomHandlePoints(s)){if(Math.hypot(x-p.x,y-p.y)<=limit)return name;}return null;}
function pointInSource(s,p){const b=bbox(s);return p.x>=b.left&&p.x<=b.right&&p.y>=b.top&&p.y<=b.bottom;}
function hit(s,p){if(s.hidden)return false;if(s.kind==='zoom')return isOverZoomLens(s,p);const b=bbox(s);const margin=Math.max(1,screenToImagePx(6));const r=s.kind==='number'?Math.max(24,canvas.width/60)+margin:margin;return p.x>=b.left-r&&p.x<=b.right+r&&p.y>=b.top-r&&p.y<=b.bottom+r;}
// Everything in this helper is editor-only. drawIn() never invokes it on an export canvas.
function drawZoomGuides(c,s,W,H){
 const b=bbox(s),l=zoomLens(s,W,H),px=screenToImagePx();c.save();
 c.strokeStyle='#78858c';c.fillStyle='rgba(120,133,140,.05)';c.lineWidth=Math.max(1.3,px);
 c.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);
 c.strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top);
 const handle=Math.max(7,px*8);c.fillStyle='#fff';c.lineWidth=Math.max(1,px);
 for(const [,x,y] of zoomHandlePoints(s)){c.fillRect(x-handle/2,y-handle/2,handle,handle);c.strokeRect(x-handle/2,y-handle/2,handle,handle);}
 c.setLineDash([Math.max(3,px*5),Math.max(3,px*4)]);c.strokeStyle='#78858c';c.lineWidth=Math.max(1,px);
 c.beginPath();c.arc(l.cx,l.cy,l.r+Math.max(5,px*5),0,Math.PI*2);c.stroke();
 c.restore();
}
function moveZoomSource(s,dx,dy,W,H){const b=bbox(s);dx=Math.max(-b.left,Math.min(W-b.right,dx));dy=Math.max(-b.top,Math.min(H-b.bottom,dy));return {...s,x:s.x+dx,x2:s.x2+dx,y:s.y+dy,y2:s.y2+dy};}
function resizeZoomSource(s,handle,p,W,H){const b=bbox(s),min=Math.max(12,screenToImagePx(10)),v={left:b.left,right:b.right,top:b.top,bottom:b.bottom};
 if(handle.includes('w'))v.left=Math.max(0,Math.min(b.right-min,p.x));
 if(handle.includes('e'))v.right=Math.min(W,Math.max(b.left+min,p.x));
 if(handle.includes('n'))v.top=Math.max(0,Math.min(b.bottom-min,p.y));
 if(handle.includes('s'))v.bottom=Math.min(H,Math.max(b.top+min,p.y));
 return {...s,x:v.left,y:v.top,x2:v.right,y2:v.bottom};
}
function updateZoomPanel(){const s=current()?.shapes?.[state.chosen];const active=!!s&&s.kind==='zoom';$('zoomPanel').hidden=!active;$('showZoomSource').checked=state.zoomGuidesVisible;}
function resetSelectedZoom(){const it=current(),s=it?.shapes?.[state.chosen];if(!s||s.kind!=='zoom')return;saveHistory();const l=zoomLens(s,it.img.naturalWidth,it.img.naturalHeight),w=l.r,h=l.r;const b=bbox(s),mx=(b.left+b.right)/2,my=(b.top+b.bottom)/2;const x=Math.max(0,Math.min(it.img.naturalWidth-w,mx-w/2)),y=Math.max(0,Math.min(it.img.naturalHeight-h,my-h/2));it.shapes[state.chosen]={...s,x,y,x2:x+w,y2:y+h};render();}
function drawShape(c,s,W,H,base){const x=s.x,y=s.y,x2=s.x2??x,y2=s.y2??y;const w=Math.max(2,s.width||7);const col=s.color||'#cc583f';c.save();c.lineWidth=w;c.lineJoin='round';c.strokeStyle=col;c.fillStyle=col;
 switch(s.kind){case'arrow':{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();const ang=Math.atan2(y2-y,x2-x),hd=Math.max(14,w*4.4);c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-hd*Math.cos(ang-.52),y2-hd*Math.sin(ang-.52));c.lineTo(x2-hd*Math.cos(ang+.52),y2-hd*Math.sin(ang+.52));c.closePath();c.fill();break;}
 case'box':case'ellipse':{const b=bbox(s);c.beginPath();if(s.kind==='box')c.roundRect(b.left,b.top,b.right-b.left,b.bottom-b.top,Math.min(12,w*2));else c.ellipse((b.left+b.right)/2,(b.top+b.bottom)/2,Math.max(1,(b.right-b.left)/2),Math.max(1,(b.bottom-b.top)/2),0,0,Math.PI*2);c.stroke();break;}
 
 case 'shortcut':{
  const l=shortcutLayout(s,W),left=x,top=y;
  c.fillStyle='rgba(25,35,49,.95)';c.strokeStyle=col;c.lineWidth=Math.max(2,w*.48);
  c.beginPath();c.roundRect(left,top,l.width,l.height,Math.max(7,l.fs*.32));c.fill();c.stroke();
  let pos=left+l.pad;
  c.font='600 '+l.fs+'px Segoe UI,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';
  for(const part of l.parts){
   if(part.type==='key'){
    c.fillStyle='#fff';c.strokeStyle='#d6dce4';c.lineWidth=Math.max(1,l.fs*.065);
    c.beginPath();c.roundRect(pos,top+l.pad,part.width,l.keyHeight,Math.max(4,l.fs*.20));c.fill();c.stroke();
    c.fillStyle='#1c2936';c.fillText(part.label,pos+part.width/2,top+l.pad+l.keyHeight/2+1);
   }else{c.fillStyle='#fff';c.fillText(part.label,pos+part.width/2,top+l.pad+l.keyHeight/2+1);}
   pos+=part.width+l.gap;
  }
  break;
 }
 case'number':{const r=Math.max(24,W/60),fs=Math.max(18,Math.round(r*.95));c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.lineWidth=Math.max(3,w/2);c.strokeStyle='#fff';c.stroke();c.fillStyle='#fff';c.font='bold '+fs+'px Segoe UI,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(s.number||1),x,y+1);break;}
 case'text':{const m=textLayout(s,W,c),{size,lines,pad}=m;c.font='bold '+size+'px Segoe UI,Arial';c.fillStyle='#fff';c.globalAlpha=.93;c.fillRect(x,y,m.width,m.height);c.globalAlpha=1;c.lineWidth=Math.max(2,w/2);c.strokeStyle=col;c.strokeRect(x,y,m.width,m.height);c.fillStyle='#243c38';lines.forEach((line,i)=>c.fillText(line,x+pad,y+pad+size*(i*1.35+1)));break;}
 case'highlight':{const b=bbox(s);c.fillStyle=col;c.globalAlpha=.22;c.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);c.globalAlpha=.9;c.lineWidth=Math.max(2,w/2);c.strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top);break;}
 case'mask':{const b=bbox(s);c.fillStyle='#232b2e';c.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);break;}
 case'spotlight':{const b=bbox(s);c.beginPath();c.rect(0,0,W,H);c.rect(b.left,b.top,Math.max(1,b.right-b.left),Math.max(1,b.bottom-b.top));c.fillStyle='rgba(6,20,24,.53)';c.fill('evenodd');c.strokeStyle='#fff';c.lineWidth=Math.max(3,w/2);c.strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top);break;}
case'zoom':{
  const b=bbox(s),sw=b.right-b.left,sh=b.bottom-b.top;if(sw<3||sh<3)break;
  const {cx,cy,r,midX,midY}=zoomLens(s,W,H);
  // Source rectangle defines the crop. Fit with ONE scale factor: no stretching.
  // At the initial 2x default, the rectangle is r by r and the lens diameter is 2r.
  const scale=Math.min((2*r)/sw,(2*r)/sh);
  c.save();c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.clip();
  c.fillStyle='#fff';c.fillRect(cx-r,cy-r,2*r,2*r);
  if(base){c.translate(cx,cy);c.scale(scale,scale);
    c.beginPath();c.rect(b.left-midX,b.top-midY,sw,sh);c.clip();
    c.drawImage(base,-midX,-midY,W,H);}
  c.restore();c.lineWidth=Math.max(3,Math.min(8,w));c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();
  break;
 }

 }c.restore();}
function drawIn(c,it,temporary=null){const W=it.img.naturalWidth,H=it.img.naturalHeight;c.clearRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(0,0,W,H);c.drawImage(it.img,0,0);
 for(let i=0;i<it.shapes.length;i++){
  const sh=it.shapes[i];if(sh.hidden)continue;drawShape(c,sh,W,H,it.img);
  if(i===state.chosen&&c===ctx&&sh.kind!=='zoom'){
   const b=bbox(sh);c.save();c.strokeStyle='#3b94aa';c.lineWidth=Math.max(2,W/600);c.setLineDash([12,6]);c.strokeRect(b.left-9,b.top-9,Math.max(18,b.right-b.left+18),Math.max(18,b.bottom-b.top+18));c.restore();
  }
 }
 if(temporary&&temporary.kind!=='crop')drawShape(c,temporary,W,H,it.img);
 // Editing source frames are NEVER rendered on the export canvas.
 if(c===ctx&&state.zoomGuidesVisible){
  const selected=it.shapes[state.chosen];if(selected&&!selected.hidden&&selected.kind==='zoom')drawZoomGuides(c,selected,W,H);
  else if(temporary?.kind==='zoom'){const b=bbox(temporary);c.save();c.strokeStyle='#78858c';c.lineWidth=Math.max(1,screenToImagePx());c.strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top);c.restore();}
 }
 const cr=state.crop||(temporary?.kind==='crop'?temporary:null);if(cr&&c===ctx){const b=bbox(cr);c.save();c.strokeStyle='#f0ad3c';c.lineWidth=Math.max(3,W/350);c.setLineDash([18,12]);c.strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top);c.restore();}
}
function render(){const it=current();if(!it)return;canvas.width=it.img.naturalWidth;canvas.height=it.img.naturalHeight;drawIn(ctx,it,state.drawing);text('imageInfo',it.img.naturalWidth+' x '+it.img.naturalHeight+' px | '+it.shapes.length+' markeringar');renderLayers();updateZoomPanel();applyPreviewScale();}

const SHAPE_LABELS={arrow:'Pil',box:'Ruta',ellipse:'Ring',number:'Steg',text:'Text',shortcut:'Genväg',highlight:'Markering',spotlight:'Fokus',zoom:'Zoom',mask:'Maskering'};
const SHAPE_SYMBOLS={arrow:'↗',box:'□',ellipse:'○',number:'①',text:'T',shortcut:'⌨',highlight:'▧',spotlight:'◉',zoom:'⊕',mask:'■'};
function syncSelectedControls(){
 const it=current(),s=it?.shapes?.[state.chosen];
 if(!s)return;
 if(/^#[a-fA-F0-9]{6}$/.test(s.color||'')){$('color').value=s.color;syncPaletteSelection();}
 if(s.width){$('stroke').value=s.width;text('strokeValue',s.width);}
}
function selectShape(i){const it=current();if(!it)return;state.chosen=Math.max(-1,Math.min(i,it.shapes.length-1));setTool('select');syncSelectedControls();render();}
function renderLayers(){
 const it=current(),list=$('layerList');if(!list)return;list.replaceChildren();
 const count=it?.shapes.length||0;text('layerCount',count+' objekt');
 $('layerUp').disabled=!it||state.chosen<0||state.chosen>=count-1;
 $('layerDown').disabled=!it||state.chosen<=0;
 $('layerDelete').disabled=!it||state.chosen<0;
 $('layerEditText').disabled=!it||!['text','shortcut'].includes(it.shapes[state.chosen]?.kind);
 $('layerEditText').textContent=it?.shapes?.[state.chosen]?.kind==='shortcut'?'Redigera genväg':'Ändra text';
 if(it){for(let i=it.shapes.length-1;i>=0;i--){
  const s=it.shapes[i],row=document.createElement('div');row.className='layer-row'+(i===state.chosen?' selected':'');
  const choose=document.createElement('button');choose.type='button';choose.className='layer-choose';choose.setAttribute('aria-pressed',String(i===state.chosen));
  const chip=document.createElement('span');chip.className='layer-chip';chip.textContent=SHAPE_SYMBOLS[s.kind]||'•';chip.style.color=s.color||'#31433A';
  const label=document.createElement('span');label.className='layer-name';label.textContent=(SHAPE_LABELS[s.kind]||s.kind)+(s.kind==='number'?' '+(s.number||1):s.kind==='text'?' · '+String(s.text||'').slice(0,24):s.kind==='shortcut'?' · '+shortcutSummary(s).slice(0,44):'');
  choose.append(chip,label);choose.title='Markera '+label.textContent;choose.addEventListener('click',()=>selectShape(i));
  const vis=document.createElement('button');vis.type='button';vis.className='layer-visibility';vis.textContent=s.hidden?'◌':'◉';vis.title=s.hidden?'Visa objekt':'Dölj objekt';vis.setAttribute('aria-label',vis.title);
  vis.addEventListener('click',()=>{saveHistory();s.hidden=!s.hidden;render();});
  row.append(choose,vis);list.append(row);
 }}
 const bg=document.createElement('div');bg.className='layer-background';bg.innerHTML='<span aria-hidden="true">▧</span><span>Bakgrundsbild · låst</span>';list.append(bg);
}
function reorderShape(step){const it=current(),i=state.chosen;if(!it||i<0)return;const j=i+step;if(j<0||j>=it.shapes.length)return;saveHistory();[it.shapes[i],it.shapes[j]]=[it.shapes[j],it.shapes[i]];state.chosen=j;render();}
function recolorSelected(value){const it=current(),s=it?.shapes?.[state.chosen];state.markColor=value.toLowerCase();$('color').value=state.markColor;syncPaletteSelection();if(s && (s.color||'').toLowerCase()!==state.markColor){saveHistory();s.color=state.markColor;render();}}
function updateSelectedStroke(){const it=current(),s=it?.shapes?.[state.chosen];if(!s)return;const value=Number($('stroke').value);if(s.width!==value){saveHistory();s.width=value;render();}}
function editSelectedText(){const it=current(),s=it?.shapes?.[state.chosen];if(!s||s.kind!=='text')return;const updated=prompt('Ändra textetikett',s.text||'');if(updated!==null && updated.trim() && updated!==s.text){saveHistory();s.text=updated.slice(0,120);render();}}

const SHORTCUT_MODS=['Ctrl','Shift','Alt','Win','Cmd'];
let shortcutDraft=null,shortcutEditing=-1;
function shortcutKeyName(key){
 const names={Control:'Ctrl',Shift:'Shift',Alt:'Alt',Meta:'Cmd',Escape:'Esc',' ':'Space',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',PageUp:'PgUp',PageDown:'PgDn'};
 return names[key]||((key||'').length===1?key.toUpperCase():key);
}
function populateShortcutKeys(){
 const keys=['',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',...'0123456789','Enter','Esc','Space','Tab','Backspace','Delete','←','→','↑','↓','Home','End','PgUp','PgDn','Insert','Ctrl','Shift','Alt','Win','Cmd','+','-','/','.'];
 for(let i=1;i<=12;i++)keys.push('F'+i);
 const sel=$('shortcutKey');sel.replaceChildren();
 keys.forEach(key=>{const o=document.createElement('option');o.value=key;o.textContent=key||'Välj tangent';sel.append(o);});
}
function shortcutPending(){
 if(!shortcutDraft?.key)return [];
 return [...SHORTCUT_MODS.filter(m=>shortcutDraft.mods.includes(m)&&m!==shortcutDraft.key),shortcutDraft.key];
}
function shortcutSteps(){
 if(!shortcutDraft)return [];
 const p=shortcutPending();return shortcutDraft.mode==='combo'?(p.length?[p]:[]):[...shortcutDraft.steps,...(p.length?[p]:[])];
}
function redrawShortcutEditor(){
 if(!shortcutDraft)return;
 document.querySelectorAll('[data-shortcut-mod]').forEach(b=>{const on=shortcutDraft.mods.includes(b.dataset.shortcutMod);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 $('shortcutKey').value=shortcutDraft.key;$('shortcutSize').value=shortcutDraft.font;$('shortcutSizeValue').textContent=shortcutDraft.font+' px';
 const seq=shortcutDraft.mode==='sequence';$('shortcutAddStep').hidden=!seq;$('shortcutSteps').hidden=!seq;$('shortcutAddStep').disabled=!shortcutPending().length||shortcutDraft.steps.length>=9;
 const list=$('shortcutSteps');list.replaceChildren();
 if(seq)shortcutDraft.steps.forEach((step,i)=>{const row=document.createElement('div');row.className='shortcut-step';const label=document.createElement('span');label.textContent='Steg '+(i+1)+': '+step.join(' + ');const remove=document.createElement('button');remove.type='button';remove.className='button mini';remove.textContent='Ta bort';remove.addEventListener('click',()=>{shortcutDraft.steps.splice(i,1);redrawShortcutEditor();});row.append(label,remove);list.append(row);});
 const preview=$('shortcutPreview');preview.replaceChildren();
 const steps=shortcutSteps();if(!steps.length)preview.textContent='Välj en tangent för att se förhandsvisningen.';
 else steps.forEach((step,i)=>{if(i){const arrow=document.createElement('span');arrow.className='shortcut-separator';arrow.textContent='→';preview.append(arrow);}step.forEach((key,j)=>{if(j){const plus=document.createElement('span');plus.className='shortcut-separator';plus.textContent='+';preview.append(plus);}const k=document.createElement('kbd');k.textContent=key;preview.append(k);});});
 $('shortcutSave').disabled=!steps.length;
}
function openShortcutEditor(index=-1){
 const it=current();if(!it){alert('Välj eller klistra in en bild först.');return;}
 const old=it.shapes[index]?.kind==='shortcut'?it.shapes[index]:null;
 shortcutEditing=old?index:-1;
 const mode=old?.mode==='sequence'?'sequence':'combo',steps=old?.steps?.map(a=>[...a])||[],first=steps[0]||['Ctrl','Shift','S'];
 shortcutDraft={mode,steps:mode==='sequence'?steps:[],mods:mode==='combo'?first.slice(0,-1).filter(k=>SHORTCUT_MODS.includes(k)):[],key:mode==='combo'?first[first.length-1]||'S':'',font:Math.max(16,Math.min(52,Number(old?.font)||Math.max(20,Math.round(it.img.naturalWidth/60))))};
 document.querySelectorAll('[name="shortcutMode"]').forEach(r=>r.checked=r.value===mode);
 $('shortcutHeading').textContent=old?'Redigera tangentbordsgenväg':'Lägg till tangentbordsgenväg';
 redrawShortcutEditor();$('shortcutDialog').showModal();
}
function saveShortcutEditor(){
 const it=current(),steps=shortcutSteps();if(!it||!steps.length)return;
 const props={kind:'shortcut',mode:shortcutDraft.mode,steps:steps.map(a=>[...a]),font:shortcutDraft.font,color:$('color').value,width:Number($('stroke').value)};
 saveHistory();
 if(shortcutEditing>=0&&it.shapes[shortcutEditing]?.kind==='shortcut'){it.shapes[shortcutEditing]={...it.shapes[shortcutEditing],...props};state.chosen=shortcutEditing;}
 else{const W=it.img.naturalWidth,H=it.img.naturalHeight,l=shortcutLayout(props,W);it.shapes.push({...props,x:Math.round(W*.035),y:Math.max(Math.round(H*.015),Math.round(H-l.height-H*.035))});state.chosen=it.shapes.length-1;}
 $('shortcutDialog').close();shortcutDraft=null;setTool('select');render();
}
function initializeShortcutEditor(){
 populateShortcutKeys();
 $('shortcutTool').addEventListener('click',()=>openShortcutEditor());
 $('shortcutSave').addEventListener('click',saveShortcutEditor);
 $('shortcutCancel').addEventListener('click',()=>$('shortcutDialog').close());
 $('shortcutClose').addEventListener('click',()=>$('shortcutDialog').close());
 $('shortcutDialog').addEventListener('close',()=>{shortcutDraft=null;shortcutEditing=-1;});
 document.querySelectorAll('[name="shortcutMode"]').forEach(r=>r.addEventListener('change',()=>{if(!r.checked||!shortcutDraft)return;
  if(r.value==='sequence'){shortcutDraft.steps=[];shortcutDraft.mods=[];shortcutDraft.key='';}
  else{const first=shortcutDraft.steps[0]||['Ctrl','Shift','S'];shortcutDraft.mods=first.slice(0,-1).filter(k=>SHORTCUT_MODS.includes(k));shortcutDraft.key=first[first.length-1]||'S';shortcutDraft.steps=[];}
  shortcutDraft.mode=r.value;redrawShortcutEditor();
 }));
 document.querySelectorAll('[data-shortcut-mod]').forEach(b=>b.addEventListener('click',()=>{if(!shortcutDraft)return;const m=b.dataset.shortcutMod;shortcutDraft.mods=shortcutDraft.mods.includes(m)?shortcutDraft.mods.filter(v=>v!==m):[...shortcutDraft.mods,m];redrawShortcutEditor();}));
 $('shortcutKey').addEventListener('change',e=>{if(shortcutDraft){shortcutDraft.key=e.target.value;redrawShortcutEditor();}});
 $('shortcutSize').addEventListener('input',e=>{if(shortcutDraft){shortcutDraft.font=Number(e.target.value);redrawShortcutEditor();}});
 $('shortcutAddStep').addEventListener('click',()=>{const a=shortcutPending();if(!a.length||shortcutDraft.steps.length>=9)return;shortcutDraft.steps.push(a);shortcutDraft.mods=[];shortcutDraft.key='';redrawShortcutEditor();});
 $('shortcutCapture').addEventListener('keydown',e=>{if(!shortcutDraft)return;if(['Control','Shift','Alt','Meta'].includes(e.key)){e.stopPropagation();return;}
  e.preventDefault();e.stopPropagation();const key=shortcutKeyName(e.key);if(!key||key==='Unidentified')return;
  const mods=[...(e.ctrlKey?['Ctrl']:[]),...(e.shiftKey?['Shift']:[]),...(e.altKey?['Alt']:[]),...(e.metaKey?['Cmd']:[])];
  if(shortcutDraft.mode==='sequence'){if(shortcutDraft.steps.length<10)shortcutDraft.steps.push([...mods,key]);shortcutDraft.mods=[];shortcutDraft.key='';}
  else{shortcutDraft.mods=mods;shortcutDraft.key=key;if(!Array.from($('shortcutKey').options).some(o=>o.value===key)){const opt=document.createElement('option');opt.value=key;opt.textContent=key;$('shortcutKey').append(opt);}}
  redrawShortcutEditor();
 });
}

function syncPaletteSelection(){
 const active=$('color')?.value?.toLowerCase();
 document.querySelectorAll('.palette-swatch').forEach(btn=>{const on=btn.dataset.color.toLowerCase()===active;btn.classList.toggle('current',on);btn.setAttribute('aria-pressed',String(on));});
}
function buildPalettes(){const container=$('paletteRows');container.replaceChildren();for(const palette of COLOR_PALETTES){
 const row=document.createElement('div');row.className='palette-row'+(palette.kind==='novia'?' novia-palette':'');
 const header=document.createElement(palette.source?'a':'strong');header.textContent=palette.name;
 if(palette.source){header.href=palette.source;header.target='_blank';header.rel='noopener noreferrer';header.title='Se färgvärden och designguide i Notion';}
 else header.title='Novias officiella färgprofil';
 const swatches=document.createElement('div');swatches.className='palette-swatches';
 for(const [label,hex] of palette.colors){const btn=document.createElement('button');btn.type='button';btn.className='palette-swatch';btn.style.backgroundColor=hex;btn.title=label+' · '+hex;btn.setAttribute('aria-label',palette.name+' – '+label+' '+hex);btn.dataset.color=hex;btn.addEventListener('click',()=>recolorSelected(hex));swatches.append(btn);}
 row.append(header,swatches);container.append(row);
 }syncPaletteSelection();}

function setTool(tool){canvas.style.cursor='';if(state.panView){state.panView=false;state.panDrag=null;updatePanView();}state.tool=tool;state.drawing=null;if(tool!=='select'){state.chosen=-1;$('color').value=state.markColor||DEFAULT_MARK_COLORS[state.theme];syncPaletteSelection();}
 document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));
 const map={number:'Klicka för att placera 1, 2, 3 ...',text:'Klicka för att lägga till text',zoom:'Klicka för 2× zoom, eller dra ett eget källområde',spotlight:'Dra för att framhäva en del',mask:'Täck hela den hemliga texten',select:'Markera en zoomlins – dra källrutan eller dess handtag för att justera utsnittet'};
 text('toolTip',map[tool]||'Dra med musen över bilden.');render();}
function dragShape(s,dx,dy){return{...s,x:s.x+dx,y:s.y+dy,x2:s.x2===undefined?undefined:s.x2+dx,y2:s.y2===undefined?undefined:s.y2+dy,lensX:Number.isFinite(s.lensX)?s.lensX+dx:s.lensX,lensY:Number.isFinite(s.lensY)?s.lensY+dy:s.lensY};}
function mouseDown(e){const it=current();if(!it)return;canvas.setPointerCapture?.(e.pointerId);if(state.panView){const host=$('canvasHost');state.panDrag={x:e.clientX,y:e.clientY,left:host.scrollLeft,top:host.scrollTop};host.classList.add('is-panning');return;}const p=point(e),tool=state.tool;
 if(tool==='select'){
  const prev=state.chosen;let chosen=-1,mode='shape',handle=null;
  const selected=it.shapes[prev];
  if(selected&&!selected.hidden&&selected.kind==='zoom'&&state.zoomGuidesVisible){
    handle=zoomHandleAt(selected,p);
    if(handle){chosen=prev;mode='resize';}else if(isOverZoomLens(selected,p)){chosen=prev;mode='lens';}else if(pointInSource(selected,p)){chosen=prev;mode='source';}
  }
  if(chosen<0&&selected&&selected.kind!=='zoom'&&hit(selected,p)){chosen=prev;mode='shape';}
   if(chosen<0){for(let i=it.shapes.length-1;i>=0;i--){if(hit(it.shapes[i],p)){chosen=i;mode=it.shapes[i].kind==='zoom'?'lens':'shape';break;}}}
  state.chosen=chosen;
  if(chosen>=0){saveHistory();state.dragging={point:p,base:clone(it.shapes[chosen]),mode,handle};syncSelectedControls();}
  render();return;
 }
 if(tool==='number'||tool==='text'){if(tool==='number'){saveHistory();const n=Math.max(1,Number($('stepStart').value)||1);it.shapes.push({kind:'number',x:p.x,y:p.y,color:$('color').value,width:Number($('stroke').value),number:n});it.steps=n+1;$('stepStart').value=it.steps;state.chosen=-1;render();}else{const s=prompt('Text för etiketten (kort text):');if(!s)return;saveHistory();it.shapes.push({kind:'text',x:p.x,y:p.y,text:s.slice(0,120),color:$('color').value,width:Number($('stroke').value)});state.chosen=it.shapes.length-1;setTool('select');text('toolTip','Textrutan är vald. Dra den med musen till rätt plats, eller använd piltangenterna.');}return;}
 state.drawing={kind:tool,x:p.x,y:p.y,x2:p.x,y2:p.y,color:$('color').value,width:Number($('stroke').value)};render();
}
function mouseMove(e){const it=current();if(!it)return;if(state.panView){if(state.panDrag){const host=$('canvasHost');host.scrollLeft=state.panDrag.left-(e.clientX-state.panDrag.x);host.scrollTop=state.panDrag.top-(e.clientY-state.panDrag.y);}return;}const p=point(e);
 if(state.dragging&&state.chosen>=0){const d=state.dragging,b=d.base,dx=p.x-d.point.x,dy=p.y-d.point.y;
  if(d.mode==='lens'){
   const l=zoomLens(b,canvas.width,canvas.height);it.shapes[state.chosen]={...b,lensX:l.cx+dx,lensY:l.cy+dy};
  }else if(d.mode==='source')it.shapes[state.chosen]=moveZoomSource(b,dx,dy,canvas.width,canvas.height);
  else if(d.mode==='resize')it.shapes[state.chosen]=resizeZoomSource(b,d.handle,p,canvas.width,canvas.height);
  else it.shapes[state.chosen]=dragShape(b,dx,dy);
  render();return;
 }
 if(state.drawing){state.drawing.x2=p.x;state.drawing.y2=p.y;render();return;}
 if(state.tool==='select'&&!state.panView){canvas.style.cursor=it.shapes.some(s=>hit(s,p))?'move':'default';}
}
function constrainedRect(s){const t=$('cropRatio').value;if(t==='free')return s;const [w,h]=t.split(':').map(Number),ratio=w/h;const p={...s};let dx=p.x2-p.x,dy=p.y2-p.y,sx=Math.sign(dx)||1,sy=Math.sign(dy)||1;dx=Math.abs(dx);dy=Math.abs(dy);if(dx/dy>ratio)dx=dy*ratio;else dy=dx/ratio;p.x2=Math.min(canvas.width,Math.max(0,p.x+sx*dx));p.y2=Math.min(canvas.height,Math.max(0,p.y+sy*dy));return p;}
function mouseUp(e){const it=current();if(!it)return;if(state.panDrag){state.panDrag=null;$('canvasHost').classList.remove('is-panning');return;}if(state.panView)return;
 if(state.dragging){state.dragging=null;render();return;}if(!state.drawing)return;
 const s=state.drawing;state.drawing=null;
 if(s.kind==='crop'){state.crop=constrainedRect(s);$('applyCrop').disabled=false;$('cancelCrop').disabled=false;render();return;}
 if(s.kind==='zoom'){
  // A click adds a genuine 2x source by default; dragging chooses an arbitrary source crop.
  const l=zoomLens(s,canvas.width,canvas.height);
  if(Math.hypot(s.x2-s.x,s.y2-s.y)<8){const width=l.r,height=l.r;s.x=Math.max(0,Math.min(canvas.width-width,s.x-width/2));s.y=Math.max(0,Math.min(canvas.height-height,s.y-height/2));s.x2=s.x+width;s.y2=s.y+height;}
  else {const b=bbox(s);s.x=b.left;s.y=b.top;s.x2=b.right;s.y2=b.bottom;}
  const lens=zoomLens(s,canvas.width,canvas.height);s.lensX=lens.cx;s.lensY=lens.cy;
  saveHistory();it.shapes.push(s);state.chosen=it.shapes.length-1;state.tool='select';
  document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool==='select'));
  text('toolTip','Zoom vald: flytta källrutan, dra i dess handtag eller flytta den runda linsen.');render();return;
 }
 if(Math.hypot(s.x2-s.x,s.y2-s.y)<8){render();return;}
 saveHistory();it.shapes.push(s);state.chosen=-1;render();
}
async function applyCrop(){const it=current(),s=state.crop;if(!it||!s)return;const b=bbox(s),x=Math.max(0,Math.round(b.left)),y=Math.max(0,Math.round(b.top)),w=Math.min(it.img.naturalWidth-x,Math.round(b.right-b.left)),h=Math.min(it.img.naturalHeight-y,Math.round(b.bottom-b.top));if(w<24||h<24){alert('V\u00e4lj ett st\u00f6rre omr\u00e5de.');return;}saveHistory();const off=document.createElement('canvas');off.width=w;off.height=h;off.getContext('2d').drawImage(it.img,x,y,w,h,0,0,w,h);it.src=off.toDataURL('image/png');it.img=await loadImage(it.src);it.shapes=it.shapes.filter(s=>{const bb=bbox(s);return bb.right>x&&bb.bottom>y&&bb.left<x+w&&bb.top<y+h;}).map(s=>dragShape(s,-x,-y));state.crop=null;$('applyCrop').disabled=true;$('cancelCrop').disabled=true;render();renderList();}
function cancelCrop(){state.crop=null;$('applyCrop').disabled=true;$('cancelCrop').disabled=true;render();}
function removeShape(){const it=current();if(!it||state.chosen<0)return;saveHistory();it.shapes.splice(state.chosen,1);state.chosen=-1;render();}
function sizeOut(it){const s=$('sizePreset').value,W=it.img.naturalWidth,H=it.img.naturalHeight;if(s==='original')return[W,H];if(s==='width1200')return[1200,Math.max(1,Math.round(H*1200/W))];if(s==='custom'){const w=Number($('customW').value),h=Number($('customH').value);if(!Number.isInteger(w)||!Number.isInteger(h)||w<64||h<64||w>5000||h>5000)throw Error('Ange pixlar mellan 64 och 5000.');return[w,h];}return s.split('x').map(Number);}
function toBlob(canvas,type){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Kunde inte exportera bilden.')),type==='png'?'image/png':'image/jpeg',type==='png'?undefined:.92));}
async function exportOne(it){const W=it.img.naturalWidth,H=it.img.naturalHeight,[outW,outH]=sizeOut(it);const src=document.createElement('canvas');src.width=W;src.height=H;drawIn(src.getContext('2d'),it);const target=document.createElement('canvas');target.width=outW;target.height=outH;const dst=target.getContext('2d');dst.fillStyle='#ffffff';dst.fillRect(0,0,outW,outH);const fit=$('fitMode').value;const scale=fit==='cover'?Math.max(outW/W,outH/H):Math.min(outW/W,outH/H);const dW=W*scale,dH=H*scale;dst.drawImage(src,(outW-dW)/2,(outH-dH)/2,dW,dH);return{blob:await toBlob(target,$('fileType').value),width:outW,height:outH,extension:$('fileType').value==='png'?'png':'jpg'};}
function download(blob,filename){const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function saveImage(){const it=current();if(!it)return;try{const x=await exportOne(it);download(x.blob,it.name+'.'+x.extension);notify('Bilden sparades lokalt: '+it.name+'.'+x.extension);}catch(e){alert(e.message);}}
function saveProject(){const it=current();if(!it)return;const project={app:'github-bildbibliotek',version:3,date:new Date().toISOString(),item:{name:it.name,alt:it.alt,src:it.src,shapes:it.shapes,steps:it.steps}};download(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),it.name+'.bildprojekt.json');notify('Redigerbart projekt sparat lokalt.');}
async function openProject(file){const d=JSON.parse(await file.text());if(d.app!=='github-bildbibliotek'||d.version!==3||!d.item||!d.item.src.startsWith('data:image/'))throw Error('Filen \u00e4r inte ett Bildbibliotek-projekt av version 3.');const image=await loadImage(d.item.src);state.images.push({id:nowStamp(),name:normalize(d.item.name),alt:d.item.alt||'',src:d.item.src,img:image,shapes:d.item.shapes||[],steps:d.item.steps||1,crop:null});selectImage(state.images.length-1);}
function encode64(buffer){const bytes=new Uint8Array(buffer);let ret='';const size=16384;for(let i=0;i<bytes.length;i+=size)ret+=String.fromCharCode(...bytes.subarray(i,i+size));return btoa(ret);}
function githubHeaders(token){return{'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};}
async function githubCall(base,route,token,method='GET',data){let response;try{response=await fetch(base+route,{method,headers:githubHeaders(token),body:data?JSON.stringify(data):undefined,cache:'no-store'});}catch(e){throw Error('Kunde inte n\u00e5 GitHub. Kontrollera n\u00e4tverket och webbl\u00e4sarens till\u00e5telser.');}const info=await response.json().catch(()=>({}));if(!response.ok)throw Error('GitHub '+response.status+': '+String(info.message||response.statusText).slice(0,250));return info;}
// Explicit authentication check; nothing is stored in localStorage, cookies or service worker.
let connectedUser='';
let isConnected=false;
async function connectGithub(e){
 if(e)e.preventDefault();
 const token=$('token').value.trim(), typed=$('githubUsername').value.trim();
 if(!token||!typed){text('connectStatus','Fyll i GitHub-användare och åtkomstnyckel.');return;}
 const button=$('connectGithub');button.disabled=true;
 text('connectStatus','Kontrollerar åtkomst hos GitHub …');
 try{
  const response=await githubCall('https://api.github.com','/user',token);
  if(response.login?.toLowerCase()!==typed.toLowerCase())throw Error('GitHub-kontot motsvarar inte användarnamnet.');
  connectedUser=response.login;isConnected=true;
  text('connectStatus','Ansluten som '+connectedUser+'. Nu kan du publicera bilder.');
  text('loginBadge','Ansluten');
  text('netStatus','GitHub anslutet');
 }catch(err){isConnected=false;connectedUser='';text('loginBadge','Inte ansluten');text('connectStatus',err.message||'Anslutningen misslyckades.');}
 finally{button.disabled=false;}
}
function disconnectGithub(){connectedUser='';isConnected=false;$('token').value='';text('loginBadge','Inte ansluten');text('connectStatus','Nyckeln har rensats från fältet. Chrome kan fylla i den igen.');text('netStatus','Arbetar lokalt');}
function repoInfo(){const repo=$('repo').value.trim().match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);if(!repo)throw Error('Repository ska se ut som anv\u00e4ndare/repo.');const branch=$('branch').value.trim();if(!/^[\w./-]{1,100}$/.test(branch)||branch.includes('..')||branch.startsWith('/'))throw Error('Ogiltigt branch-namn.');return {owner:repo[1],repo:repo[2],branch};}
async function publish(){if(state.busy)return;if(!state.images.length){alert('L\u00e4gg till minst en bild.');return;}const token=$('token').value.trim();if(!token){alert('En begr\u00e4nsad GitHub-token beh\u00f6vs f\u00f6r publicering. Du kan alltid spara bilden lokalt utan token.');return;}if(!isConnected){alert('Anslut först till GitHub med knappen ovan.');return;}if(!$('publicOk').checked){alert('Kontrollera och bekr\u00e4fta att bilderna kan publiceras offentligt.');return;}let info;try{info=repoInfo();}catch(e){alert(e.message);return;}state.busy=true;$('publish').disabled=true;notify('F\u00f6rbereder bilder...');const git='https://api.github.com/repos/'+info.owner+'/'+info.repo;const folder='notion-bilder/'+slugPath($('project').value)+'/'+nowStamp();let entries=[];
 try{
  const finalFiles=[];for(let i=0;i<state.images.length;i++){const it=state.images[i];const x=await exportOne(it);if(x.blob.size>9000000)throw Error(it.name+' \u00e4r \u00f6ver 9 MB. V\u00e4lj JPEG eller mindre bild.');let filename=String(i+1).padStart(2,'0')+'-'+normalize(it.name)+'.'+x.extension;finalFiles.push({it,...x,filename,path:folder+'/'+filename});}
  const ref=await githubCall(git,'/git/ref/heads/'+info.branch,token);const head=ref.object.sha;const latest=await githubCall(git,'/git/commits/'+head,token);
  for(let i=0;i<finalFiles.length;i++){const f=finalFiles[i];notify('Laddar upp '+(i+1)+' / '+finalFiles.length+': '+f.filename);const encoded=encode64(await f.blob.arrayBuffer());const blob=await githubCall(git,'/git/blobs',token,'POST',{content:encoded,encoding:'base64'});entries.push({path:f.path,mode:'100644',type:'blob',sha:blob.sha});}
  const rawBase='https://raw.githubusercontent.com/'+info.owner+'/'+info.repo+'/'+info.branch+'/';const lines=['# Senaste bilduppladdningen','','Skapad: '+new Date().toLocaleString('sv-SE'),'Repo: '+info.owner+'/'+info.repo,'Projekt: '+$('project').value.trim(),'Batch: '+folder,'','## Bilder'];const manifest=[];
  for(const f of finalFiles){const url=rawBase+f.path.split('/').map(encodeURIComponent).join('/');lines.push('','### '+f.it.name,'- Fil: `'+f.path+'`','- Storlek: '+f.width+' x '+f.height+' px','- Beskrivning: '+(f.it.alt||f.it.name),'- Bildl\u00e4nk: '+url,'- Markdown: `!['+(f.it.alt||f.it.name).replace(/\]/g,'')+']('+url+')`','- HTML: `<img src="'+url+'" alt="'+(f.it.alt||f.it.name).replace(/"/g,'')+'">`');manifest.push({name:f.it.name,description:f.it.alt,filename:f.filename,path:f.path,url,width:f.width,height:f.height});}
  lines.push('','## Prompt till ChatGPT','','H\u00e4mta senaste bilduppladdningen i `'+info.owner+'/'+info.repo+'` och bygg en Notion SOURCE + renderer-instruktion. Jag beskriver stegen och du kopplar de uppladdade bilderna till r\u00e4tt instruktion.');
  const md=lines.join('\n')+'\n',manifestObj={schema:'github-bildbibliotek-03',created:new Date().toISOString(),repository:info.owner+'/'+info.repo,branch:info.branch,batch:folder,images:manifest};
  const logItems=[{path:folder+'/uppladdningslogg.md',content:md},{path:folder+'/manifest.json',content:JSON.stringify(manifestObj,null,2)},{path:'notion-bilder/senaste-uppladdning.md',content:md}];
  for(const log of logItems){const blob=await githubCall(git,'/git/blobs',token,'POST',{content:log.content,encoding:'utf-8'});entries.push({path:log.path,mode:'100644',type:'blob',sha:blob.sha});}
  const tree=await githubCall(git,'/git/trees',token,'POST',{base_tree:latest.tree.sha,tree:entries});const commit=await githubCall(git,'/git/commits',token,'POST',{message:'Add '+finalFiles.length+' course screenshot(s) and Bildbibliotek log',tree:tree.sha,parents:[head]});
  await githubCall(git,'/git/refs/heads/'+info.branch,token,'PATCH',{sha:commit.sha,force:false});
  state.lastLog=md;state.published=manifestObj;$('logPreview').textContent=md;$('copyLog').disabled=false;$('downloadLog').disabled=false;$('netStatus').textContent='Publicerat p\u00e5 GitHub';notify('Klart! '+manifest.length+' bild(er) och en logg har lagts i en gemensam commit.');
 }catch(e){notify('Ingen bekr\u00e4ftad publicering: '+e.message,true);}finally{state.busy=false;$('publish').disabled=false;}
}
function init(){setupTheme();renderList();buildPalettes();renderLayers();initializeShortcutEditor();initPreviewControls();
 $('showZoomSource').addEventListener('change',e=>{state.zoomGuidesVisible=e.target.checked;render();});
 $('resetZoom').addEventListener('click',resetSelectedZoom);
 $('toggleLayers').addEventListener('click',()=>{const el=$('layersPanel');el.hidden=!el.hidden;$('toggleLayers').setAttribute('aria-expanded',String(!el.hidden));$('toggleLayers').textContent=el.hidden?'+ Visa lager':'− Dölj lager';});
 $('layerUp').addEventListener('click',()=>reorderShape(1));$('layerDown').addEventListener('click',()=>reorderShape(-1));
 $('layerDelete').addEventListener('click',removeShape);$('layerEditText').addEventListener('click',()=>{if(current()?.shapes?.[state.chosen]?.kind==='shortcut')openShortcutEditor(state.chosen);else editSelectedText();});
 $('togglePalettes').addEventListener('click',()=>{const el=$('palettePanel');el.hidden=!el.hidden;$('togglePalettes').setAttribute('aria-expanded',String(!el.hidden));$('togglePalettes').textContent=el.hidden?'+ Färgpaletter':'− Dölj paletter';});
 $('color').addEventListener('change',e=>recolorSelected(e.target.value));$('stroke').addEventListener('change',updateSelectedStroke);
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));canvas.addEventListener('pointerdown',mouseDown);canvas.addEventListener('pointermove',mouseMove);canvas.addEventListener('pointerup',mouseUp);canvas.addEventListener('pointercancel',()=>{state.dragging=null;state.drawing=null;state.panDrag=null;$('canvasHost').classList.remove('is-panning');render();});$('applyCrop').addEventListener('click',applyCrop);$('cancelCrop').addEventListener('click',cancelCrop);$('undo').addEventListener('click',undo);$('redo').addEventListener('click',redo);$('removeShape').addEventListener('click',removeShape);$('stroke').addEventListener('input',()=>text('strokeValue',$('stroke').value));$('imageInput').addEventListener('change',async e=>{await addFiles(e.target.files);e.target.value='';});$('addImages').addEventListener('click',()=>$('imageInput').click());$('emptyPick').addEventListener('click',()=>$('imageInput').click());$('pasteImage').addEventListener('click',async()=>{try{if(!navigator.clipboard?.read)throw Error('Anv\u00e4nd Ctrl+V i appen eller v\u00e4lj en bild.');const items=await navigator.clipboard.read();for(const it of items){for(const type of it.types){if(type.startsWith('image/')){const blob=await it.getType(type);await addFiles([new File([blob],'skarmklipp-'+nowStamp()+'.png',{type:blob.type})]);return;}}}throw Error('Ingen bild hittades i urklipp.');}catch(e){alert(e.message||'Anv\u00e4nd Ctrl+V i appen.');}});
 document.addEventListener('paste',async e=>{for(const it of e.clipboardData?.items||[]){if(it.type.startsWith('image/')){e.preventDefault();const f=it.getAsFile();if(f)await addFiles([new File([f], 'skarmklipp-'+nowStamp()+'.png',{type:f.type})]);return;}}});
 document.addEventListener('keydown',e=>{if($('shortcutDialog').open)return;const tg=e.target?.tagName;const editing=['INPUT','TEXTAREA','SELECT'].includes(tg);if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!editing){e.preventDefault();undo();return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'&&!editing){e.preventDefault();redo();return;}if(editing||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Delete'||e.key==='Backspace'){removeShape();return;}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&state.tool==='select'&&state.chosen>=0){
   const it=current();if(it){e.preventDefault();const s=it.shapes[state.chosen],d=e.shiftKey?10:1;
   const dx=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,dy=e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0;
   saveHistory();it.shapes[state.chosen]=dragShape(s,dx,dy);render();return;}}
 if(e.key.toLowerCase()==='k'){openShortcutEditor();return;}
  const tools={v:'select',a:'arrow',r:'box',o:'ellipse',n:'number',t:'text',h:'highlight',s:'spotlight',z:'zoom',m:'mask',c:'crop'};if(tools[e.key.toLowerCase()])setTool(tools[e.key.toLowerCase()]);});
 FIELDS.fileName.addEventListener('input',()=>{if(current()){current().name=normalize(FIELDS.fileName.value);renderList();}});FIELDS.altText.addEventListener('input',()=>{if(current())current().alt=FIELDS.altText.value.slice(0,300);});$('removeImage').addEventListener('click',()=>{if(state.active<0)return;state.images.splice(state.active,1);selectImage(Math.min(state.images.length-1,state.active));});$('downloadImage').addEventListener('click',saveImage);$('saveProject').addEventListener('click',saveProject);$('openProject').addEventListener('click',()=>$('projectInput').click());$('projectInput').addEventListener('change',async e=>{try{if(e.target.files?.length)await openProject(e.target.files[0]);}catch(err){alert(err.message);}e.target.value='';});$('githubAuth').addEventListener('submit',connectGithub);$('disconnectGithub').addEventListener('click',disconnectGithub);$('token').addEventListener('input',()=>{isConnected=false;text('loginBadge','Inte ansluten');});$('githubUsername').addEventListener('input',()=>{isConnected=false;text('loginBadge','Inte ansluten');});$('publish').addEventListener('click',publish);$('copyLog').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(state.lastLog);notify('Loggen kopierad.');}catch(e){alert('Kunde inte kopiera. Markera texten i loggrutan och kopiera den manuellt.');}});$('downloadLog').addEventListener('click',()=>download(new Blob([state.lastLog],{type:'text/markdown;charset=utf-8'}),'senaste-uppladdning.md'));
 $('openHelp').onclick=()=>$('helpDialog').showModal();$('closeHelp').onclick=()=>$('helpDialog').close();$('sizePreset').onchange=()=>{if($('sizePreset').value==='custom'){ $('customW').focus();}};
 const host=$('canvasHost');host.addEventListener('dragover',e=>e.preventDefault());host.addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer?.files?.length)addFiles(e.dataTransfer.files);});
}
init();
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;$('installApp').hidden=false;});
$('installApp').addEventListener('click',async()=>{if(!deferredInstall)return;await deferredInstall.prompt();deferredInstall=null;$('installApp').hidden=true;});
window.addEventListener('appinstalled',()=>{$('installApp').hidden=true;});
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost' || location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
window.__testBildbibliotek={state,loadImage,addFiles,addImageFile,exportOne,drawShape,render,selectImage,selectShape,renderLayers,zoomLens,zoomHandleAt,resizeZoomSource,moveZoomSource,setTheme,recolorSelected,reorderShape,buildPalettes,shortcutLayout,shortcutSummary,openShortcutEditor,textLayout,bbox,hit,mouseDown,mouseMove,mouseUp,previewFitScale,previewScale,setPreviewZoom,changePreviewZoom,fitPreview,togglePanView,togglePreviewZoomPanel,closePreviewZoomPanel,publish,undo,redo,sizeOut,repoInfo,connectGithub,disconnectGithub,get isConnected(){return isConnected;}};
})();
