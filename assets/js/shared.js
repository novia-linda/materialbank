/* =========================================================
   MATERIALBANK · SHARED JAVASCRIPT
   One file for interactions and optional project/funder branding.
   ========================================================= */
(function(){
  'use strict';

  /* Resolve shared assets from the site root even when a page lives in a subfolder. */
  const SCRIPT_URL = document.currentScript ? new URL(document.currentScript.src, document.baseURI) : null;
  const SITE_ROOT = SCRIPT_URL ? new URL('../../', SCRIPT_URL) : new URL('./', document.baseURI);
  const resolveSiteUrl = value => {
    if(!value) return value;
    try { return new URL(value, SITE_ROOT).href; } catch(e) { return value; }
  };

  /* ---------------------------------------------------------
     FUTURE PROJECT / FUNDER BRANDING
     Leave disabled for the current Novia-only look.

     When project requirements are known, edit ONLY this block.
     Example logo item:
       {
         src: 'assets/brand/eu-funded.png',
         alt: 'Funded by the European Union',
         href: 'https://example.org'
       }
     --------------------------------------------------------- */
  const PROJECT_BRANDING = {
    strip: {
      enabled: false,
      text: ''
    },
    footer: {
      enabled: false,
      text: '',
      logos: []
    }
  };


  /* ---------------------------------------------------------
     GLOBAL MATERIALBANK NAVIGATION
     The same black navigation bar is injected on every page.
     Edit the labels/targets here once to update the whole site.
     --------------------------------------------------------- */
  function initGlobalSiteHeader(){
    const items=[
      ['Företag berättar','foretag-berattar.html'],
      ['Så här gör du','sa-har-gor-du.html'],
      ['Studerande + Företag','foretagscase/index.html'],
      ['Säkerhet','sakerhet.html'],
      ['Kunskapsverkstäder','kunskapsverkstader.html']
    ];
    const header=document.querySelector('header.site-header, header.sitebar') || document.createElement('header');
    header.className='site-header global-site-header';
    const links=items.map(([label,target])=>`<a href="${resolveSiteUrl(target)}">${label}</a>`).join('');
    header.innerHTML=`
      <div class="container header-inner">
        <a class="brand" href="${resolveSiteUrl('index.html')}"><span class="brand-mark"></span><span>AI i praktiken<small>AI Boost · materialbank</small></span></a>
        <nav class="main-nav" aria-label="Huvudnavigation">
          ${links}
          <a class="nav-cta" href="${resolveSiteUrl('hitta.html')}">Hitta rätt material</a>
        </nav>
        <button class="mobile-menu" type="button" aria-label="Öppna meny" aria-expanded="false">Meny</button>
      </div>`;
    if(!header.isConnected){
      const skip=document.querySelector('.skip-link, .skip');
      if(skip && skip.nextSibling) skip.parentNode.insertBefore(header,skip.nextSibling);
      else document.body.insertBefore(header,document.body.firstChild);
    }
  }

  function initMobileNavigation(){
    const menuBtn=document.querySelector('.mobile-menu');
    const nav=document.querySelector('.main-nav');
    if(!menuBtn || !nav) return;
    menuBtn.addEventListener('click',()=>{
      const open=nav.dataset.open==='true';
      nav.dataset.open=String(!open);
      menuBtn.setAttribute('aria-expanded',String(!open));
      menuBtn.textContent=!open?'Stäng':'Meny';
      if(!open){
        nav.style.display='flex';
        nav.style.position='absolute';
        nav.style.top='64px';
        nav.style.left='0';
        nav.style.right='0';
        nav.style.background='#101214';
        nav.style.padding='18px 20px 24px';
        nav.style.flexDirection='column';
        nav.style.alignItems='flex-start';
        nav.style.borderTop='1px solid rgba(255,255,255,.1)';
      }else{
        nav.removeAttribute('style');
      }
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      if(window.matchMedia('(max-width:980px)').matches){
        nav.dataset.open='false';
        nav.removeAttribute('style');
        menuBtn.setAttribute('aria-expanded','false');
        menuBtn.textContent='Meny';
      }
    }));
  }

  function initAgentCandidateCheck(){
    const boxes=[...document.querySelectorAll('.agent-check')];
    const out=document.getElementById('result');
    if(!boxes.length || !out) return;
    function update(){
      const n=boxes.filter(b=>b.checked).length;
      if(n===0) out.textContent='Kryssa i rutorna ovan. Två eller tre ja betyder ofta att uppgiften är värd att testa som en enkel agent.';
      else if(n===1) out.textContent='En signal finns. Fundera ännu på om uppgiften verkligen återkommer och om resultatet går att beskriva tydligt.';
      else out.textContent='Bra kandidat. Nästa steg är att skriva ner agentens uppgift, input, kunskap, regler och output.';
    }
    boxes.forEach(b=>b.addEventListener('change',update));
  }

  function initInstructionBuilder(){
    const get=id=>document.getElementById(id);
    const build=get('build');
    if(!build) return;
    const task=get('task'), input=get('input'), knowledge=get('knowledge'), rules=get('rules'), output=get('output');
    const box=get('output-box'), assembled=get('assembled'), status=get('copy-status'), clear=get('clear'), copy=get('copy');
    if(!task || !input || !knowledge || !rules || !output || !box || !assembled) return;
    const clean=v=>v.trim()||'[Fyll i här]';

    build.addEventListener('click',()=>{
      assembled.textContent=`UPPGIFT\n${clean(task.value)}\n\nINPUT FRÅN ANVÄNDAREN\n${clean(input.value)}\n\nKUNSKAP\n${clean(knowledge.value)}\n\nREGLER\n${clean(rules.value)}\n\nOUTPUT\n${clean(output.value)}`;
      box.classList.add('show');
      if(status) status.textContent='';
      box.scrollIntoView({behavior:'smooth',block:'nearest'});
    });

    if(clear){
      clear.addEventListener('click',()=>{
        [task,input,knowledge,rules,output].forEach(x=>x.value='');
        box.classList.remove('show');
        if(status) status.textContent='';
      });
    }

    if(copy){
      copy.addEventListener('click',async()=>{
        try{
          await navigator.clipboard.writeText(assembled.textContent);
          if(status) status.textContent='Kopierat.';
        }catch(e){
          if(status) status.textContent='Markera texten ovan och kopiera manuellt.';
        }
      });
    }
  }

  function initLightboxes(){
    const buttons=[...document.querySelectorAll('.image-button')];
    if(!buttons.length) return;
    const dlg=document.getElementById('lightbox') || document.getElementById('dlg') || document.querySelector('dialog');
    if(!dlg) return;
    const img=dlg.querySelector('img');
    const close=dlg.querySelector('.close');
    if(!img) return;

    buttons.forEach(btn=>{
      btn.addEventListener('click',()=>{
        const src=btn.dataset.image || btn.dataset.img || btn.querySelector('img')?.getAttribute('src');
        const alt=btn.dataset.alt || btn.querySelector('img')?.getAttribute('alt') || '';
        if(!src) return;
        img.src=src;
        img.alt=alt;
        if(typeof dlg.showModal==='function') dlg.showModal();
      });
    });
    if(close) close.addEventListener('click',()=>dlg.close());
    dlg.addEventListener('click',e=>{if(e.target===dlg) dlg.close();});
  }

  function initCopyButtons(){
    const buttons=[...document.querySelectorAll('[data-copy-target]')];
    if(!buttons.length) return;
    buttons.forEach(button=>{
      button.addEventListener('click',async()=>{
        const id=button.getAttribute('data-copy-target');
        const target=id ? document.getElementById(id) : null;
        if(!target) return;
        const text=target.innerText || target.textContent || '';
        const status=button.parentElement ? button.parentElement.querySelector('.copy-status') : null;
        try{
          await navigator.clipboard.writeText(text.trim());
          if(status) status.textContent='Kopierat.';
        }catch(e){
          if(status) status.textContent='Markera texten och kopiera manuellt.';
        }
      });
    });
  }


  function initChoiceGroups(){
    const groups=[...document.querySelectorAll('[data-choice-group]')];
    if(!groups.length) return;
    groups.forEach(group=>{
      const buttons=[...group.querySelectorAll('[data-choice]')];
      const panels=[...group.querySelectorAll('[data-choice-panel]')];
      if(!buttons.length || !panels.length) return;

      group.classList.add('choice-enhanced');
      panels.forEach(panel=>panel.hidden=true);
      buttons.forEach(button=>button.setAttribute('aria-pressed','false'));

      const selectChoice=key=>{
        buttons.forEach(button=>{
          const active=button.dataset.choice===key;
          button.classList.toggle('is-active',active);
          button.setAttribute('aria-pressed',active?'true':'false');
        });
        panels.forEach(panel=>{
          panel.hidden=panel.dataset.choicePanel!==key;
        });
        const activePanel=panels.find(panel=>panel.dataset.choicePanel===key);
        if(activePanel) activePanel.scrollIntoView({behavior:'smooth',block:'nearest'});
      };

      buttons.forEach(button=>button.addEventListener('click',()=>selectChoice(button.dataset.choice)));
      const defaultChoice=group.dataset.choiceDefault;
      if(defaultChoice) selectChoice(defaultChoice);
    });
  }

  function injectProjectBranding(){
    if(PROJECT_BRANDING.strip.enabled && PROJECT_BRANDING.strip.text){
      const strip=document.createElement('div');
      strip.className='project-strip';
      strip.innerHTML='<div class="project-strip-inner"><span></span></div>';
      strip.querySelector('span').textContent=PROJECT_BRANDING.strip.text;
      document.body.insertBefore(strip,document.body.firstChild);
    }

    const cfg=PROJECT_BRANDING.footer;
    if(!cfg.enabled || (!cfg.text && !cfg.logos.length)) return;
    const footer=document.createElement('footer');
    footer.className='project-footer';
    const inner=document.createElement('div');
    inner.className='project-footer-inner';
    if(cfg.text){
      const p=document.createElement('p');
      p.className='project-footer-copy';
      p.textContent=cfg.text;
      inner.appendChild(p);
    }
    if(cfg.logos.length){
      const logos=document.createElement('div');
      logos.className='project-logos';
      cfg.logos.forEach(item=>{
        const img=document.createElement('img');
        img.src=resolveSiteUrl(item.src);
        img.alt=item.alt || '';
        if(item.href){
          const a=document.createElement('a');
          a.href=item.href;
          a.target='_blank';
          a.rel='noopener';
          a.appendChild(img);
          logos.appendChild(a);
        }else{
          logos.appendChild(img);
        }
      });
      inner.appendChild(logos);
    }
    footer.appendChild(inner);
    document.body.appendChild(footer);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initGlobalSiteHeader();
    initMobileNavigation();
    initAgentCandidateCheck();
    initInstructionBuilder();
    initLightboxes();
    initCopyButtons();
    initChoiceGroups();
    injectProjectBranding();
  });
})();
