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
    let cloud='Local artwork active';
    try{if(localStorage.getItem('epiphany-character-art-cloud-ready')==='1')cloud='Cloud artwork enabled';}catch{}
    set('developer-diagnostic-cloud',cloud);
    let storage='Available';
    try{const key='__epiphany_dev_check__';localStorage.setItem(key,'1');localStorage.removeItem(key);}catch{storage='Blocked'};
    set('developer-diagnostic-storage',storage);
  }
  function open(){
    if(!allowed())return;
    const overlay=$('#developer-overlay');if(!overlay)return;
    overlay.hidden=false;document.body.classList.add('developer-mode-open');showSection('overview');
    const close=$('#close-developer-mode');close?.focus();
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
      const uploadRow=$('#developer-upload-character-art')?.closest('.developer-lab-actions');
      if(uploadRow)$('#developer-assets-host')?.appendChild(uploadRow);
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