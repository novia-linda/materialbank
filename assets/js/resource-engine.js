/* =========================================================
   MATERIALBANK · RESURSMOTOR
   Vanlig JavaScript-logik. Ingen AI används.
   Data: assets/js/resources-data.js (genereras från sidmetadata).
   ========================================================= */
(function(){
  'use strict';

  const allResources = (window.MATERIALBANK_RESOURCES || [])
    .filter(r => (r.status || 'published') === 'published');

  const labels = {
    guide:'Guide', case:'Företagscase', video:'Video', article:'Artikel', collection:'Samling',
    'kom-igang':'Kom igång', 'nasta-steg':'Nästa steg', fordjupning:'Fördjupning',
    microsoft:'Microsoft', google:'Google', verktygsoberoende:'Verktygsoberoende',
    lara:'Lära', prova:'Prova', inspireras:'Inspireras', forsta:'Förstå', skapa:'Skapa',
    'ai-agenter':'AI-agenter', 'visuellt-material':'Visuellt material', videoTopic:'Video',
    inspiration:'Inspiration', kommunikation:'Text & kommunikation', data:'Data & analys',
    effektivisering:'Spara tid', marknadsforing:'Marknadsföring', 'ai-bilder':'AI-bilder',
    'ansvarsfull-ai':'Ansvarsfull AI'
  };

  const state = {
    topics:new Set(),
    platform:'any',
    intent:'any',
    time:'any',
    query:'',
    ranked:[],
    playlist:[]
  };

  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];

  function esc(value){
    return String(value ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function norm(value){
    return String(value || '').toLocaleLowerCase('sv')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9åäö\s-]/g,' ')
      .replace(/\s+/g,' ').trim();
  }

  function absoluteUrl(value){
    try { return new URL(value, document.baseURI).href; }
    catch(e){ return value; }
  }

  function searchable(r){
    return norm([
      r.title, r.summary,
      ...(r.topics || []), ...(r.keywords || []), ...(r.platforms || []), ...(r.intents || [])
    ].join(' '));
  }

  function score(r){
    let s = r.featured ? .6 : 0;
    const reasons = [];
    const q = norm(state.query);
    const hay = searchable(r);

    if(q){
      const tokens = q.split(' ').filter(x => x.length > 1);
      if(hay.includes(q)){ s += 8; reasons.push('sökord'); }
      const title = norm(r.title);
      const keys = norm((r.keywords || []).join(' '));
      tokens.forEach(t => {
        if(title.includes(t)) s += 4;
        else if(keys.includes(t)) s += 3;
        else if(hay.includes(t)) s += 1.5;
      });
      if(tokens.length && !tokens.some(t => hay.includes(t))) s -= 8;
    }

    if(state.topics.size){
      const matches = [...state.topics].filter(t => (r.topics || []).includes(t));
      if(matches.length){
        s += matches.length * 6;
        reasons.push(...matches.map(t => topicLabel(t)));
      } else s -= 4;
    }

    if(state.platform !== 'any'){
      const platforms = r.platforms || [];
      if(platforms.includes(state.platform)){
        s += 5; reasons.push(labels[state.platform] || state.platform);
      } else if(platforms.includes('verktygsoberoende')){
        s += 2; reasons.push('Verktygsoberoende');
      } else s -= 4;
    }

    if(state.intent !== 'any'){
      if((r.intents || []).includes(state.intent)){
        s += 4; reasons.push(labels[state.intent] || state.intent);
      } else s -= 1.5;
    }

    if(state.time !== 'any'){
      const max = Number(state.time);
      if(Number(r.duration || 0) <= max){
        s += 2; reasons.push(`≤ ${max} min`);
      } else s -= 3;
    }

    return {score:s, reasons:[...new Set(reasons)].slice(0,4)};
  }

  function topicLabel(value){
    const map = {
      'ai-agenter':'AI-agenter', 'visuellt-material':'Visuellt material', video:'Video',
      inspiration:'Inspiration', kommunikation:'Text & kommunikation', data:'Data & analys',
      effektivisering:'Spara tid', marknadsforing:'Marknadsföring', 'ai-bilder':'AI-bilder',
      'ansvarsfull-ai':'Ansvarsfull AI'
    };
    return map[value] || value;
  }

  function resourcePlatform(r){
    const p = r.platforms || [];
    if(p.includes('microsoft') && p.includes('google')) return 'Microsoft · Google';
    if(p.includes('microsoft')) return 'Microsoft';
    if(p.includes('google')) return 'Google';
    return 'Verktygsoberoende';
  }

  function hasSelections(){
    return Boolean(state.query.trim() || state.topics.size || state.platform !== 'any' || state.intent !== 'any' || state.time !== 'any');
  }

  function buildPlaylist(){
    state.query = ($('#resource-search')?.value || '').trim();
    state.ranked = allResources
      .map(r => ({...r, _match:score(r)}))
      .sort((a,b) => b._match.score - a._match.score || Number(a.duration||99) - Number(b.duration||99) || a.title.localeCompare(b.title,'sv'));

    let pool = state.ranked;
    if(hasSelections()){
      pool = pool.filter(r => r._match.score > -2);
    }

    // Keep the list short enough to feel like a recommendation, not a search dump.
    state.playlist = pool.slice(0,6);
    render();
    $('#results-anchor')?.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function card(r, inList){
    const reasons = r._match?.reasons?.length
      ? `<p class="engine-match"><strong>Matchar:</strong> ${esc(r._match.reasons.join(' · '))}</p>`
      : '';
    const type = labels[r.type] || r.type || 'Resurs';
    const level = labels[r.level] || r.level || '';
    const url = absoluteUrl(r.url || '#');
    return `<article class="engine-card" data-id="${esc(r.id)}">
      <div class="engine-card-top">
        <span class="tag">${esc(type)}</span>
        <span class="tag">${esc(level)}</span>
        <span class="tag">${esc(r.duration || '?')} min</span>
      </div>
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.summary)}</p>
      ${reasons}
      <p class="engine-platform">${esc(resourcePlatform(r))}</p>
      <div class="engine-actions">
        <a class="btn" href="${esc(url)}">Öppna →</a>
        <button class="btn secondary" type="button" data-engine-action="${inList ? 'remove' : 'add'}" data-id="${esc(r.id)}">${inList ? 'Ta bort' : 'Lägg till'}</button>
      </div>
    </article>`;
  }

  function render(){
    const list = $('#playlist-results');
    const more = $('#more-results');
    const count = $('#result-count');
    if(!list || !more) return;

    if(state.playlist.length){
      list.innerHTML = state.playlist.map(r => card(r,true)).join('');
      if(count) count.textContent = `${state.playlist.length} resurser i din lista`;
    } else {
      list.innerHTML = '<div class="engine-empty"><strong>Inga tydliga träffar.</strong><br>Prova färre filter eller ett annat sökord.</div>';
      if(count) count.textContent = '';
    }

    const others = state.ranked.filter(r => !state.playlist.some(x => x.id === r.id)).slice(0,8);
    more.innerHTML = others.map(r => card(r,false)).join('');
    bindListButtons();
    renderSelections();
  }

  function bindListButtons(){
    $$('[data-engine-action="remove"]').forEach(btn => btn.addEventListener('click', () => {
      state.playlist = state.playlist.filter(r => r.id !== btn.dataset.id);
      render();
    }));
    $$('[data-engine-action="add"]').forEach(btn => btn.addEventListener('click', () => {
      const r = state.ranked.find(x => x.id === btn.dataset.id);
      if(r && !state.playlist.some(x => x.id === r.id)) state.playlist.push(r);
      render();
    }));
  }

  function renderSelections(){
    const out = $('#selection-summary');
    if(!out) return;
    const items=[];
    if(state.query.trim()) items.push(`Sök: ${state.query.trim()}`);
    items.push(...[...state.topics].map(topicLabel));
    if(state.platform !== 'any') items.push(labels[state.platform] || state.platform);
    if(state.intent !== 'any') items.push(labels[state.intent] || state.intent);
    if(state.time !== 'any') items.push(`Max ${state.time} min`);
    out.innerHTML = items.length ? items.map(x => `<span class="tag">${esc(x)}</span>`).join('') : '<span class="small-note">Inga filter valda – motorn visar en blandning av aktuella resurser.</span>';
  }

  function reset(){
    state.topics.clear(); state.platform='any'; state.intent='any'; state.time='any'; state.query='';
    const input=$('#resource-search'); if(input) input.value='';
    $$('.engine-option').forEach(b => b.classList.remove('is-active'));
    $$('.engine-option[data-value="any"]').forEach(b => b.classList.add('is-active'));
    state.ranked=[]; state.playlist=[];
    renderSelections();
    const list=$('#playlist-results');
    if(list) list.innerHTML='<div class="engine-empty">Skriv ett sökord eller gör några val ovan och klicka på <strong>Visa mina förslag</strong>.</div>';
    const more=$('#more-results'); if(more) more.innerHTML='';
    const count=$('#result-count'); if(count) count.textContent='';
  }

  function initOptions(){
    $$('.engine-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const group=btn.dataset.group, value=btn.dataset.value;
        if(group==='topic'){
          btn.classList.toggle('is-active');
          btn.classList.contains('is-active') ? state.topics.add(value) : state.topics.delete(value);
        } else {
          $$(`.engine-option[data-group="${group}"]`).forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          state[group]=value;
        }
        renderSelections();
      });
    });
  }

  function init(){
    initOptions();
    $('#build-resource-list')?.addEventListener('click', buildPlaylist);
    $('#clear-resource-filters')?.addEventListener('click', reset);
    $('#resource-search')?.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); buildPlaylist(); } });
    $('#copy-playlist')?.addEventListener('click', async e => {
      const lines=state.playlist.map((r,i)=>`${i+1}. ${r.title} — ${absoluteUrl(r.url)}`).join('\n');
      if(!lines) return;
      const btn=e.currentTarget;
      try{
        await navigator.clipboard.writeText(lines);
        btn.textContent='Kopierat ✓';
        setTimeout(()=>btn.textContent='Kopiera länklista',1600);
      } catch(err){
        const ta=document.createElement('textarea'); ta.value=lines; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
    });
    $('#print-playlist')?.addEventListener('click', ()=>window.print());
    renderSelections();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
