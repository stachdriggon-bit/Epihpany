/* Epiphany notification center. Local-first; server delivery is configured separately. */
(() => {
  'use strict';
  const STORE = 'epiphany-notifications-v1';
  const PREFS = 'epiphany-notification-preferences-v1';
  const $ = id => document.getElementById(id);
  const defaults = {inSite:true, browser:false, emailDaily:false, emailWeekly:false};
  const read = (key, fallback) => { try { const value=JSON.parse(localStorage.getItem(key)||'null'); return value ?? fallback; } catch { return fallback; } };
  let items = read(STORE, []);
  let prefs = {...defaults, ...read(PREFS, {})};
  if (!Array.isArray(items)) items = [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(items.slice(0,60))); localStorage.setItem(PREFS, JSON.stringify(prefs)); } catch {} };
  const unread = () => items.filter(item => !item.read).length;
  function render() {
    const badge = $('notification-count'), list = $('notification-list'), empty = $('notification-empty'), permission = $('notification-permission');
    if (badge) { badge.textContent = unread() > 99 ? '99+' : String(unread()); badge.hidden = unread() === 0; }
    if (list) list.innerHTML = items.length ? items.map(item => '<article class="ep-notification '+(item.read?'is-read':'')+'"><span class="ep-notification-icon" aria-hidden="true">'+(item.kind==='weekly'?'🗓️':item.kind==='achievement'?'🏆':'✨')+'</span><div><strong>'+esc(item.title)+'</strong><p>'+esc(item.body)+'</p><time>'+esc(item.dateLabel || '')+'</time></div>'+(item.read?'':'<button type="button" data-notification-read="'+esc(item.id)+'" aria-label="Mark as read">✓</button>')+'</article>').join('') : '';
    if (empty) empty.hidden = items.length > 0;
    if (permission) {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      permission.textContent = !supported ? 'Browser notifications are not supported in this browser.' : Notification.permission === 'granted' ? 'Browser notifications are enabled on this device.' : Notification.permission === 'denied' ? 'Browser notifications are blocked in browser settings.' : 'Allow optional browser notifications on this device.';
      const btn = $('notification-enable-browser');
      if (btn) { btn.disabled = !supported || Notification.permission === 'granted' || Notification.permission === 'denied'; btn.textContent = Notification.permission === 'granted' ? 'Enabled' : Notification.permission === 'denied' ? 'Blocked in browser' : 'Enable browser alerts'; }
    }
    document.querySelectorAll('[data-notification-pref]').forEach(input => { input.checked = !!prefs[input.dataset.notificationPref]; });
  }
  async function showBrowser(item) {
    if (!prefs.browser || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg && reg.showNotification) await reg.showNotification(item.title, {body:item.body, icon:'./icon.svg', badge:'./icon.svg', tag:item.id, data:{url:'./#progress-view'}});
      else new Notification(item.title, {body:item.body, tag:item.id});
    } catch (error) { console.warn('Epiphany browser notification failed:', error); }
  }
  function add({id,kind='daily',title,body}) {
    if (!prefs.inSite || !id || items.some(item => item.id === id)) return;
    const item = {id,kind,title,body,read:false,createdAt:new Date().toISOString(),dateLabel:new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date())};
    items.unshift(item); items = items.slice(0,60); save(); render(); showBrowser(item);
  }
  function close() { const panel=$('notification-panel'); if(panel) panel.hidden=true; const btn=$('notification-bell'); if(btn) btn.setAttribute('aria-expanded','false'); }
  function toggle() { const panel=$('notification-panel'), btn=$('notification-bell'); if(!panel)return; panel.hidden=!panel.hidden; btn?.setAttribute('aria-expanded',String(!panel.hidden)); if(!panel.hidden) render(); }
  document.addEventListener('click', async event => {
    if (event.target.closest('#notification-bell')) { toggle(); return; }
    if (event.target.closest('#notification-close')) { close(); return; }
    if (event.target.closest('#notification-read-all')) { items=items.map(item=>({...item,read:true})); save(); render(); return; }
    const readButton=event.target.closest('[data-notification-read]');
    if(readButton){items=items.map(item=>item.id===readButton.dataset.notificationRead?{...item,read:true}:item);save();render();return;}
    if (event.target.closest('#notification-enable-browser')) {
      if (!('Notification' in window)) return;
      try { const result=await Notification.requestPermission(); prefs.browser=result==='granted'; save(); render(); if(result==='granted') add({id:'browser-alerts-enabled',kind:'daily',title:'Browser alerts are ready',body:'EPIPHANY can show optional challenge reminders while you are using the site.'}); }
      catch(error){console.warn('Notification permission request failed:',error);}
      return;
    }
    const pref=event.target.closest('[data-notification-pref]');
    if(pref){prefs[pref.dataset.notificationPref]=pref.checked;save();render();}
    if(!event.target.closest('#notification-panel') && !event.target.closest('#notification-bell')) close();
  });
  window.EpiphanyNotifications = {
    dailyReset(dateKey) { add({id:'daily-reset-'+dateKey,kind:'daily',title:'A new daily challenge is ready!',body:'Your daily quest has refreshed. Play a quick round and earn XP.'}); },
    weeklyReset(weekKey) { add({id:'weekly-reset-'+weekKey,kind:'weekly',title:'Your weekly challenge has renewed!',body:'A fresh weekly challenge is waiting. Build your streak one quest at a time.'}); },
    announce(title, body, id) { add({id:id||('notice-'+Date.now()),kind:'achievement',title,body}); },
    close
  };
  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('storage', event => { if(event.key===STORE){items=read(STORE,[]);render();} if(event.key===PREFS){prefs={...defaults,...read(PREFS,{})};render();} });
})();
