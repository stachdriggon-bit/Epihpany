/* EPIPHANY icon system — lightweight outline SVGs, shared across navigation and activity cards. */
(() => {
  'use strict';
  const paths = {
    house:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    'book-open':'<path d="M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5A2.5 2.5 0 0 1 21 23z"/>',
    'book-text':'<path d="M5 3h14a2 2 0 0 1 2 2v16H7a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2zM7 17h14M8 7h8M8 11h8"/>',
    'messages-square':'<path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-7.5A7.5 7.5 0 0 1 10.5 7H13a8 8 0 0 1 8 4.5z"/><path d="M7 3h7a6 6 0 0 1 6 6"/>',
    toolbox:'<path d="M3 7h18v13H3zM8 7V4h8v3M3 12h18M10 12v2h4v-2"/>',
    'gamepad-2':'<path d="M6 11h4m-2-2v4m7-2h.01M18 10h.01M7 6h10a5 5 0 0 1 4.8 6.4l-1.2 4A3 3 0 0 1 16 18l-2-2h-4l-2 2a3 3 0 0 1-4.6-1.6l-1.2-4A5 5 0 0 1 7 6z"/>',
    'brain-circuit':'<path d="M12 18V5a3 3 0 0 0-5.8-1A4 4 0 0 0 4 11a4 4 0 0 0 2 7.5A3.5 3.5 0 0 0 12 18zM12 18V5a3 3 0 0 1 5.8-1A4 4 0 0 1 20 11a4 4 0 0 1-2 7.5A3.5 3.5 0 0 1 12 18zM8 8h.01M16 8h.01M8 14h.01M16 14h.01M12 11h.01"/>',
    'search-check':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10.5l1.8 1.8L13 9"/>',
    sparkles:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    library:'<path d="M4 4h12v16H4zM8 4v16M16 7h4v13h-4M10 8h3M10 12h3"/>',
    map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    'scroll-text':'<path d="M8 3h10a2 2 0 0 1 2 2v15H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h2zM8 3v17M11 8h6M11 12h6M11 16h4"/>',
    orbit:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(35 12 12)"/>',
    'chart-no-axes-combined':'<path d="M3 3v18h18M7 14l4-4 4 3 6-7M17 6h4v4"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6"/>',
    'user-round':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    'circle-help':'<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-1.2 1.1-2.1 1.5-2.1 3M12 17h.01"/>',
    shapes:'<rect x="3" y="4" width="8" height="8" rx="1.5"/><circle cx="17" cy="8" r="4"/><path d="m12 20 4-7 4 7z"/>',
    languages:'<path d="M4 5h12M10 3v2m-4 0c0 5 3 8 7 10M13 5c-.5 4-3 7-7 9M15 21l4-10 4 10M16.5 17h5"/>',
    network:'<circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="m7 11 10-5M7 13l10 5"/>',
    'audio-waveform':'<path d="M2 12h2l2-7 4 14 4-14 4 14 2-7h2"/>',
    workflow:'<rect x="3" y="3" width="7" height="5" rx="1"/><rect x="14" y="16" width="7" height="5" rx="1"/><path d="M6.5 8v4a2 2 0 0 0 2 2h7a2 2 0 0 1 2 2M17.5 14v2"/>',
    'text-cursor-input':'<path d="M4 7V4h16v3M4 17v3h16v-3M12 4v16M8 12h8"/>',
    hammer:'<path d="m14 6 4 4M5 21l9-9M3 7l4-4 8 8-4 4zM14 11l7 7-4 4-7-7"/>',
    'git-branch':'<circle cx="6" cy="4" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12M18 8a6 6 0 0 1-6 6H8"/>',
    'circle-check':'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2z"/>',
    flame:'<path d="M12 2.5c.9 3.2 5.6 5.6 5.6 10.6a5.6 5.6 0 0 1-11.2 0c0-2 .9-3.6 2.2-4.8.2 1.3.9 2.1 1.8 2.5C10 7.6 10.6 4.9 12 2.5z"/>'
  };
  const views = {
    home:'house', stories:'book-open', words:'book-text', lifeskills:'messages-square',
    mytools:'toolbox', arcade:'gamepad-2', thinklab:'brain-circuit', casebound:'search-check',
    summon:'sparkles', collection:'library', world:'map', chronicle:'scroll-text',
    resonance:'orbit', progress:'chart-no-axes-combined', trophies:'trophy', profile:'user-round'
  };
  const gameNames = [
    [/odd one out/i,'shapes'],[/bold translator/i,'languages'],[/word ladder/i,'network'],
    [/sound maze/i,'audio-waveform'],[/word connections/i,'workflow'],
    [/sentence scramble/i,'text-cursor-input'],[/word forge/i,'hammer'],[/chain reaction/i,'git-branch']
  ];
  function svg(name) {
    const path = paths[name];
    if (!path) return '';
    return '<svg class="ep-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+path+'</g></svg>';
  }
  function stripLeadingGlyph(node) {
    const first = [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
    if (first) first.textContent = first.textContent.replace(/^\\s*[\\p{Extended_Pictographic}\\p{S}\\p{P}]+\\s*/u, '');
  }
  function apply() {
    document.querySelectorAll('[data-view]').forEach(button => {
      const name = views[button.dataset.view];
      if (!name) return;
      stripLeadingGlyph(button);
      if (button.querySelector('.ep-nav-icon')) return;
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon';
      icon.innerHTML = svg(name);
      button.insertBefore(icon, button.firstChild);
    });
    const groupIcons = {Learn:'book-open',Play:'gamepad-2',Collect:'sparkles',Discover:'map',Me:'user-round'};
    document.querySelectorAll('.nav-group > summary').forEach(summary => {
      if (summary.querySelector('.ep-nav-icon')) return;
      const label = summary.querySelector('span:nth-of-type(2)')?.textContent.trim() || '';
      stripLeadingGlyph(summary);
      if (!groupIcons[label]) return;
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon ep-nav-group-icon';
      icon.innerHTML = svg(groupIcons[label]);
      summary.insertBefore(icon, summary.firstChild);
    });
    const mobileGroupIcons = {LEARN:'book-open',PLAY:'gamepad-2',COLLECT:'sparkles',DISCOVER:'map',ME:'user-round'};
    document.querySelectorAll('.mobile-nav-group > summary').forEach(summary => {
      if (summary.querySelector('.ep-nav-icon')) return;
      const label = summary.querySelector('.mobile-nav-label')?.textContent.trim() || '';
      if (!mobileGroupIcons[label]) return;
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon ep-nav-group-icon';
      icon.innerHTML = svg(mobileGroupIcons[label]);
      summary.insertBefore(icon, summary.firstChild);
    });
    document.querySelectorAll('.mobile-nav-home').forEach(button => {
      if (button.querySelector('.ep-nav-icon')) return;
      stripLeadingGlyph(button);
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon';
      icon.innerHTML = svg('house');
      button.insertBefore(icon, button.firstChild);
    });
    document.querySelectorAll('.nav-help').forEach(button => {
      const old = button.querySelector('.help-nav-icon');
      if (!old || button.querySelector('.ep-nav-icon')) return;
      old.replaceWith(document.createRange().createContextualFragment(svg('circle-help').replace('ep-icon-svg','ep-nav-icon ep-icon-svg')));
    });
    document.querySelectorAll('.notification-bell').forEach(button => {
      if (button.querySelector('.ep-icon-svg')) return;
      button.innerHTML = svg('bell') + (button.querySelector('#notification-count')?.outerHTML || '');
    });
    document.querySelectorAll('.utility-btn').forEach(button => {
      if (button.querySelector('.ep-icon-svg')) return;
      button.innerHTML = svg('settings');
    });
    document.querySelectorAll('#arcade-mini-games [class*="game"], #arcade-library [class*="game"], #think-lab-content button, #casebound-content button').forEach(card => {
      if (card.querySelector('.ep-activity-icon')) return;
      const label = (card.innerText || card.getAttribute('aria-label') || '').trim();
      const match = gameNames.find(([pattern]) => pattern.test(label));
      if (!match) return;
      const icon = document.createElement('span');
      icon.className = 'ep-activity-icon';
      icon.innerHTML = svg(match[1]);
      card.insertBefore(icon, card.firstChild);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once:true});
  else apply();
  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, {childList:true,subtree:true});
  window.EpiphanyIcons = Object.freeze({render:svg, names:Object.freeze(Object.keys(paths)), views:Object.freeze({...views})});
})();