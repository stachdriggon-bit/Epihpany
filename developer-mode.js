(function(){
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const allowed=()=>!!(window.EpiphanyAuth&&typeof window.EpiphanyAuth.isDeveloper==='function'&&window.EpiphanyAuth.isDeveloper());
  function showSection(name){
    if(!allowed())return;
    $$('[data-dev-section]').forEach(button=>button.classList.toggle('is-active',button.dataset.devSection===name));
    $$('[data-dev-panel]').forEach(panel=>panel.classList.toggle('is-active',panel.dataset.devPanel===name));
    if(name==='diagnostics')refreshDiagnostics();
  }
  function refreshEntry(){
    const button=$('#open-developer-mode');
    if(button)button.hidden=!allowed();
  }
  function refreshDiagnostics(){
    const email=window.EpiphanyAuth?.getDeveloperEmail?.()||'Not signed in';
    const set=(id,value)=>{const el=$('#'+id);if(el)el.textContent=value;};
    set('developer-diagnostic-account',email);
    set('developer-diagnostic-access',allowed()?'Authorized':'Not authorized');
    const cloud=window.EPIPHANY_SUPABASE_CONFIG?.url?'Cloud-only (Supabase)':'Cloud URL not configured';
    set('developer-diagnostic-cloud',cloud);
    let storage='Available';
    try{const key='__epiphany_dev_check__';localStorage.setItem(key,'1');localStorage.removeItem(key);}catch{storage='Blocked'};
    set('developer-diagnostic-storage',storage);
  }
  const developerStyles = [
    'asset-manager.css?v=asset-manager-20261030-1',
    'artwork-manager.css?v=artwork-manager-20261030-1',
    'card-image-editor.css?v=card-image-editor-20261031-1'
  ];
  const developerScripts = [
    'asset-manager.js?v=asset-manager-20261030-1',
    'artwork-manager.js?v=published-art-refresh-20261030-1',
    'card-image-editor.js?v=card-image-editor-20261031-1'
  ];
  let developerToolsPromise = null;
  function loadStyle(href){
    if(document.querySelector('link[data-developer-resource="'+href+'"]'))return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const link=document.createElement('link');
      link.rel='stylesheet';link.href=href;link.dataset.developerResource=href;
      link.onload=resolve;link.onerror=()=>{link.remove();reject(new Error('Could not load developer styles.'));};
      document.head.appendChild(link);
    });
  }
  function loadScript(src){
    if(document.querySelector('script[data-developer-resource="'+src+'"]'))return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;script.async=false;script.dataset.developerResource=src;
      script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('Could not load a developer tool.'));};
      document.head.appendChild(script);
    });
  }
  function loadDeveloperTools(){
    if(!developerToolsPromise){
      developerToolsPromise=Promise.all(developerStyles.map(loadStyle))
        .then(()=>developerScripts.reduce((chain,src)=>chain.then(()=>loadScript(src)),Promise.resolve()))
        .catch(error=>{developerToolsPromise=null;throw error;});
    }
    return developerToolsPromise;
  }
  async function open(){
    if(!allowed())return;
    const overlay=$('#developer-overlay');if(!overlay)return;
    const trigger=$('#open-developer-mode');
    if(trigger)trigger.disabled=true;
    try{
      await loadDeveloperTools();
      if(!allowed())return;
      overlay.hidden=false;document.body.classList.add('developer-mode-open');showSection('overview');
      const close=$('#close-developer-mode');close?.focus();
    }catch(error){
      console.warn('[EPIPHANY] Developer tools could not be loaded.',error);
      const status=$('#developer-diagnostic-access');
      if(status)status.textContent='Developer tools could not load. Please try again.';
    }finally{
      if(trigger)trigger.disabled=false;
    }
  }
  function close(){
    const overlay=$('#developer-overlay');if(!overlay)return;
    overlay.hidden=true;document.body.classList.remove('developer-mode-open');
    $('#open-developer-mode')?.focus();
  }
  function init(){
    const lab=$('#developer-lab');
    if(lab){
      $('#developer-tools-host')?.appendChild(lab);
    }
    refreshEntry();
    $('#open-developer-mode')?.addEventListener('click',open);
    $('#close-developer-mode')?.addEventListener('click',close);
    $('#developer-overlay')?.addEventListener('click',event=>{if(event.target.id==='developer-overlay')close();});
    $$('[data-dev-section]').forEach(button=>button.addEventListener('click',()=>showSection(button.dataset.devSection)));
    $$('[data-dev-open]').forEach(button=>button.addEventListener('click',()=>showSection(button.dataset.devOpen)));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#developer-overlay')?.hidden)close();});
    document.addEventListener('epiphany-auth-changed',()=>{refreshEntry();if(!allowed()&&!$('#developer-overlay')?.hidden)close();});
    window.addEventListener('storage',refreshEntry);
    refreshDiagnostics();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();