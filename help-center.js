
/* EPIPHANY Help & Guide — independent overlay that preserves the current section. */
(() => {
  'use strict';
  const overlay = document.getElementById('help-center-dialog');
  if (!overlay) return;
  const triggers = Array.from(document.querySelectorAll('[data-help-open]'));
  let returnFocus = null;
  const language = () => {
    try { return localStorage.getItem('epiphany-help-language-choice') === 'ar' ? 'ar' : 'en'; }
    catch (_) { return 'en'; }
  };
  function applyLanguage() {
    const lang = language();
    overlay.dataset.language = lang;
    overlay.dir = lang === 'ar' ? 'rtl' : 'ltr';
    overlay.querySelectorAll('[data-help-en]').forEach(node => { node.hidden = lang === 'ar'; });
    overlay.querySelectorAll('[data-help-ar]').forEach(node => { node.hidden = lang !== 'ar'; });
    const close = overlay.querySelector('.help-center-close');
    if (close) close.setAttribute('aria-label', lang === 'ar' ? 'إغلاق مركز المساعدة' : 'Close help center');
  }
  function open(trigger) {
    returnFocus = trigger || document.activeElement;
    applyLanguage();
    overlay.hidden = false;
    document.body.classList.add('help-center-open');
    overlay.querySelector('.help-center-close')?.focus({preventScroll:true});
  }
  function close(restore = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('help-center-open');
    if (restore && returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll:true});
  }
  triggers.forEach(trigger => trigger.addEventListener('click', () => open(trigger)));
  overlay.addEventListener('click', event => {
    if (event.target.closest('[data-help-close]')) { close(); return; }
    const replay = event.target.closest('[data-help-replay]');
    if (replay) {
      close();
      if (window.EPIPHANY_GUIDANCE && typeof window.EPIPHANY_GUIDANCE.start === 'function') window.EPIPHANY_GUIDANCE.start();
      return;
    }
    const section = event.target.closest('[data-help-view]');
    if (section) {
      const view = section.dataset.helpView;
      close(false);
      const destination = document.querySelector('[data-view="' + view + '"]');
      if (destination) destination.click();
    }
  });
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const controls = Array.from(overlay.querySelectorAll('button:not([disabled])')).filter(node => node.offsetParent !== null);
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.EPIPHANY_HELP = { open: () => open(document.activeElement), close: () => close() };
})();
