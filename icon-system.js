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
    'odd-one-out':'<circle cx="6.5" cy="7" r="3.2"/><rect x="14.2" y="3.8" width="6.4" height="6.4" rx="1.2"/><path d="m6.5 14 3.4 6H3.1z"/><path d="M14.5 16.5h6M17.5 13.5v6"/>',
    'bold-translator':'<path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h8a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 14 13H9l-4 3v-3.4a2.5 2.5 0 0 1-1.5-2.1z"/><path d="M9 8h4M11 6v4M17 14h3.5M19 12l2 2-2 2M15 19h-3.5M13 17l-2 2 2 2"/>',
    'word-ladder':'<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="8.5" width="7" height="7" rx="1.4"/><rect x="3" y="17" width="7" height="4" rx="1"/><path d="M10 6.5h2a2 2 0 0 1 2 2v1M14 12h-2a2 2 0 0 0-2 2v3"/>',
    'sound-maze':'<path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 10v4"/><path d="M3 19h5l3-3 3 2 3-5 4 1"/>',
    'word-connections':'<circle cx="5" cy="5" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M7.2 5h9.6M5 7.2v9.6M19 7.2v9.6M7.2 19h9.6M7 7l10 10M17 7 7 17"/>',
    'sentence-scramble':'<path d="M4 5h7M4 10h5M4 15h7M4 20h4"/><path d="m15 5 2 2 3-3M14 14l3-3 3 3M14 20h6"/>',
    'word-forge':'<path d="M4 18h16l-2 3H6zM7 18l2-5h6l2 5M8 5l3-2 5 5-3 3z"/><path d="m14 9 5 5M5 10l2 2M18 3l.8 1.8L21 5.5l-2.2.7L18 8l-.8-1.8L15 5.5l2.2-.7z"/>',
    'chain-reaction':'<circle cx="5" cy="12" r="2.3"/><circle cx="12" cy="5" r="2.3"/><circle cx="19" cy="12" r="2.3"/><circle cx="12" cy="19" r="2.3"/><path d="m6.7 10.3 3.6-3.6M13.7 6.7l3.6 3.6M17.3 13.7l-3.6 3.6M10.3 17.3l-3.6-3.6"/><path d="M12 9v6M9 12h6"/>' ,
    'crossword-quest':'<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><path d="M9 9h6v6H9z"/>',
    'word-hunt':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 8h5M8 11h3M8 14h4"/>',
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
    if (first) first.textContent = first.textContent.replace(/^\s*[\p{Extended_Pictographic}\p{S}\p{P}]+\s*/u, '');
  }
  function apply(root = document) {
    const all = selector => {
      const nodes = [...root.querySelectorAll(selector)];
      if (root.nodeType === 1 && root.matches(selector)) nodes.unshift(root);
      return nodes;
    };
    all('[data-view]').forEach(button => {
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
    all('.nav-group > summary').forEach(summary => {
      if (summary.querySelector('.ep-nav-icon')) return;
      const label = summary.querySelector('span:nth-of-type(2)')?.textContent.trim() || '';
      summary.querySelector('span[aria-hidden="true"]')?.remove();
      if (!groupIcons[label]) return;
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon ep-nav-group-icon';
      icon.innerHTML = svg(groupIcons[label]);
      summary.insertBefore(icon, summary.firstChild);
    });
    const mobileGroupIcons = {LEARN:'book-open',PLAY:'gamepad-2',COLLECT:'sparkles',DISCOVER:'map',ME:'user-round'};
    all('.mobile-nav-group > summary').forEach(summary => {
      if (summary.querySelector('.ep-nav-icon')) return;
      const label = summary.querySelector('.mobile-nav-label')?.textContent.trim() || '';
      if (!mobileGroupIcons[label]) return;
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon ep-nav-group-icon';
      icon.innerHTML = svg(mobileGroupIcons[label]);
      summary.insertBefore(icon, summary.firstChild);
    });
    all('.mobile-nav-home').forEach(button => {
      if (button.querySelector('.ep-nav-icon')) return;
      stripLeadingGlyph(button);
      const icon = document.createElement('span');
      icon.className = 'ep-nav-icon';
      icon.innerHTML = svg('house');
      button.insertBefore(icon, button.firstChild);
    });
    all('.nav-help').forEach(button => {
      const old = button.querySelector('.help-nav-icon');
      if (!old || button.querySelector('.ep-nav-icon')) return;
      old.replaceWith(document.createRange().createContextualFragment(svg('circle-help').replace('ep-icon-svg','ep-nav-icon ep-icon-svg')));
    });
    all('.notification-bell').forEach(button => {
      if (button.querySelector('.ep-icon-svg')) return;
      button.innerHTML = svg('bell') + (button.querySelector('#notification-count')?.outerHTML || '');
    });
    all('.utility-btn').forEach(button => {
      if (button.querySelector('.ep-icon-svg')) return;
      button.innerHTML = svg('settings');
    });
    // Think Lab already owns a dedicated icon slot on every case card.
    // Replace that single glyph in-place; never prepend a second icon to the button.
    const thinkLabIcons = {
      odd:'odd-one-out', translator:'bold-translator', wordladder:'word-ladder',
      maze:'sound-maze', connections:'word-connections', scramble:'sentence-scramble',
      forge:'word-forge', chain:'chain-reaction', crossword:'crossword-quest', wordhunt:'word-hunt'
    };
    const thinkLabSelector = root === document ? '#think-lab-content .tl-case[data-think-game]' : '.tl-case[data-think-game]';
    all(thinkLabSelector).forEach(card => {
      const iconName = thinkLabIcons[card.dataset.thinkGame];
      const slot = card.querySelector('.tl-case-icon');
      if (!iconName || !slot) return;
      const iconMarkup = svg(iconName);
      // MutationObserver watches the document subtree. Rewriting identical SVG markup
      // would emit another childList mutation and create an endless observer loop.
      // Track the rendered icon by name. innerHTML is not a stable comparison for SVG:
      // browsers normalize self-closing SVG elements when serializing the DOM.
      if (slot.dataset.epIcon !== iconName) {
        slot.innerHTML = iconMarkup;
        slot.dataset.epIcon = iconName;
      }
      if (slot.getAttribute('aria-hidden') !== 'true') slot.setAttribute('aria-hidden','true');
      slot.classList.add('ep-thinklab-icon');
    });
    // Arcade cards have no existing dedicated icon slot, so add one only there.
    const arcadeSelector = '#arcade-mini-games [class*="game"], #arcade-library [class*="game"]';
    all(arcadeSelector).forEach(card => {
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
  const relevantAncestors = '.tl-case,[data-view],.nav-group,.mobile-nav-group,.mobile-nav-home,.nav-help,.notification-bell,.utility-btn,#arcade-mini-games,#arcade-library';
  const observer = new MutationObserver(records => {
    const scopes = new Set();
    records.forEach(record => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      const ancestor = target?.closest?.(relevantAncestors);
      if (ancestor) scopes.add(ancestor);
      record.addedNodes.forEach(node => { if (node.nodeType === 1) scopes.add(node); });
    });
    scopes.forEach(scope => apply(scope));
  });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  window.EpiphanyIcons = Object.freeze({render:svg, names:Object.freeze(Object.keys(paths)), views:Object.freeze({...views})});
})();