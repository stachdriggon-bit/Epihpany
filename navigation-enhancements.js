/* Navigation polish: route history, deep links, accessible dropdowns and global search.
   Kept separate from app.js so learning/game logic remains untouched. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const labels = {
    home: 'Start learning', stories: 'Stories', arcade: 'Arcade', thinklab: 'Think Lab',
    world: 'World', lifeskills: 'Life Skills', words: 'Words', mytools: 'My Tools',
    trophies: 'Trophies', progress: 'Progress', profile: 'Profile'
  };
  let restoringHistory = false;
  let searchReturnFocus = null;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function currentView() {
    const active = $('.view.is-active');
    return active ? active.id.replace(/-view$/, '') : 'home';
  }
  function routeFor(view) { return '#' + (view === 'home' ? 'home' : view); }
  function syncCurrentNav(view) {
    $$('[data-view]').forEach(button => {
      const active = button.dataset.view === view;
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    $$('.nav-group').forEach(group => {
      const activeChild = $('[data-view="' + view + '"]', group);
      group.classList.toggle('has-active-view', !!activeChild);
      const summary = $('summary', group);
      if (summary) {
        if (activeChild) summary.setAttribute('aria-current', 'page');
        else summary.removeAttribute('aria-current');
      }
    });
    const mobileLabel = $('#mobile-current-section');
    if (mobileLabel) mobileLabel.textContent = labels[view] || view;
    const crumb = $('#navigation-breadcrumb');
    if (crumb) {
      crumb.hidden = view === 'home';
      crumb.replaceChildren();
      const home = document.createElement('button');
      home.type = 'button'; home.className = 'breadcrumb-link'; home.textContent = 'Home';
      home.addEventListener('click', () => navigate('home'));
      crumb.append(home);
      const sep = document.createElement('span'); sep.setAttribute('aria-hidden', 'true'); sep.textContent = '›'; crumb.append(sep);
      const current = document.createElement('span'); current.setAttribute('aria-current', 'page'); current.textContent = labels[view] || view; crumb.append(current);
    }
  }
  function closeMenus(except) {
    $$('.nav-group[open], .mobile-menu[open], .tools-menu[open]').forEach(menu => {
      if (menu !== except) menu.open = false;
    });
  }
  function navigate(view, options = {}) {
    if (!labels[view]) return;
    if (options.history !== false && !restoringHistory) {
      const target = routeFor(view);
      if (location.hash !== target) history.pushState({ epiphanyView: view }, '', target);
    }
    const targetButton = $('[data-view="' + view + '"]');
    if (targetButton) targetButton.click();
    else {
      $$('.view').forEach(section => section.classList.toggle('is-active', section.id === view + '-view'));
      syncCurrentNav(view);
    }
    closeMenus();
    syncCurrentNav(view);
  }
  function routeFromHash() {
    const raw = location.hash.slice(1);
    if (!raw || raw.startsWith('word=') || raw.startsWith('word%3D')) return;
    const view = decodeURIComponent(raw).split(/[/?&]/)[0];
    if (!labels[view]) return;
    restoringHistory = true;
    navigate(view, { history: false });
    restoringHistory = false;
  }

  function setupMobileLabel() {
    const summary = $('.mobile-menu > summary');
    if (summary && !$('#mobile-current-section')) {
      const label = document.createElement('span');
      label.id = 'mobile-current-section'; label.className = 'mobile-current-section';
      label.textContent = labels[currentView()] || 'Start learning';
      label.setAttribute('aria-live', 'polite');
      summary.append(label);
      summary.setAttribute('aria-label', 'Open navigation menu');
    }
  }
  function setupBreadcrumb() {
    const header = $('.top');
    if (!header || $('#navigation-breadcrumb')) return;
    const crumb = document.createElement('nav');
    crumb.id = 'navigation-breadcrumb'; crumb.className = 'navigation-breadcrumb';
    crumb.setAttribute('aria-label', 'Breadcrumb'); crumb.hidden = true;
    header.insertAdjacentElement('afterend', crumb);
  }

  function setupSearch() {
    const tools = $('.top-right');
    if (!tools || $('#global-search-toggle')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.id = 'global-search-toggle'; toggle.className = 'icon-btn';
    toggle.setAttribute('aria-label', 'Search Epiphany'); toggle.title = 'Search';
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15 15 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    tools.insertBefore(toggle, tools.firstChild);

    const overlay = document.createElement('div');
    overlay.id = 'global-search-dialog'; overlay.className = 'global-search-overlay'; overlay.hidden = true;
    overlay.innerHTML = '<section class="global-search-panel" role="dialog" aria-modal="true" aria-labelledby="global-search-title"><div class="global-search-head"><h2 id="global-search-title">Search Epiphany</h2><button type="button" class="icon-btn" id="global-search-close" aria-label="Close search">×</button></div><label class="global-search-field"><span class="sr-only">Search stories, words and games</span><input id="global-search-query" type="search" autocomplete="off" placeholder="Search stories, words, games…"></label><p class="global-search-hint">Search content and jump directly to a section.</p><div id="global-search-results" class="global-search-results" role="listbox" aria-label="Search results"><p class="global-search-empty">Start typing to search.</p></div></section>';
    document.body.append(overlay);
    const input = $('#global-search-query', overlay);
    const results = $('#global-search-results', overlay);
    function open() {
      searchReturnFocus = document.activeElement;
      overlay.hidden = false; document.body.classList.add('no-scroll');
      input.value = ''; renderResults(''); setTimeout(() => input.focus(), 0);
    }
    function close() {
      overlay.hidden = true; document.body.classList.remove('no-scroll');
      if (searchReturnFocus && searchReturnFocus.isConnected) searchReturnFocus.focus({ preventScroll: true });
    }
    function renderResults(query) {
      results.replaceChildren();
      const q = normalize(query);
      if (!q) { const p = document.createElement('p'); p.className = 'global-search-empty'; p.textContent = 'Start typing to search.'; results.append(p); return; }
      const found = [];
      // Navigation labels are always searchable, even before lazy sections load.
      Object.entries(labels).forEach(([view, label]) => {
        if (normalize(label).includes(q)) found.push({ title: label, detail: 'Open section', view, score: 1 });
      });
      // Search all currently-rendered section content, including hidden views.
      $$('.view').forEach(section => {
        const view = section.id.replace(/-view$/, '');
        const candidates = $$('h1,h2,h3,.word b,.word strong,.tile h3,.story-card h3,[data-story-title],.story-card,.word,.tile,button', section);
        candidates.forEach(el => {
          if (el.closest('#global-search-dialog') || el.closest('[hidden]')) return;
          const title = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
          if (title.length < 2 || title.length > 180 || !normalize(title).includes(q)) return;
          if (found.some(item => item.view === view && item.title === title)) return;
          found.push({ title, detail: labels[view] || view, view, score: el.matches('h1,h2,h3,.word b,.tile h3,.story-card h3,[data-story-title]') ? 0 : 2, element: el });
        });
      });
      found.sort((a,b) => a.score - b.score);
      found.slice(0, 12).forEach(item => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'global-search-result'; button.setAttribute('role','option');
        const strong = document.createElement('strong'); strong.textContent = item.title;
        const small = document.createElement('small'); small.textContent = item.detail;
        button.append(strong, small);
        button.addEventListener('click', () => {
          close();
          navigate(item.view);
          if (item.element && item.element.isConnected) setTimeout(() => item.element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
        });
        results.append(button);
      });
      if (!found.length) { const p = document.createElement('p'); p.className = 'global-search-empty'; p.textContent = 'No matches yet. Try another word or section name.'; results.append(p); }
    }
    toggle.addEventListener('click', open);
    $('#global-search-close', overlay).addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    input.addEventListener('input', () => renderResults(input.value));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !overlay.hidden) close();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (overlay.hidden) open(); else close(); }
    });
  }

  function setupDropdowns() {
    const desktop = () => window.matchMedia('(min-width: 901px)').matches;
    $$('.nav-group').forEach(group => {
      group.addEventListener('mouseenter', () => { if (desktop()) { closeMenus(group); group.open = true; } });
      group.addEventListener('mouseleave', () => { if (desktop()) group.open = false; });
      const summary = $('summary', group);
      if (summary) summary.addEventListener('click', () => {
        // Let the native <details> action toggle the clicked group; only close siblings here.
        closeMenus(group);
      });
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-group, .mobile-menu, .tools-menu')) closeMenus();
      const mobile = $('.mobile-menu');
      if (mobile && mobile.open && event.target.closest('.mobile-menu nav [data-view]')) mobile.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const opened = $('.nav-group[open], .mobile-menu[open], .tools-menu[open]');
        closeMenus();
        if (opened) $('summary', opened)?.focus({ preventScroll: true });
      }
    });
  }

  // Intercept navigation before app.js handles the same click, so each route gets a history entry.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button || !labels[button.dataset.view]) return;
    if (!restoringHistory && location.hash !== routeFor(button.dataset.view)) {
      history.pushState({ epiphanyView: button.dataset.view }, '', routeFor(button.dataset.view));
    }
    setTimeout(() => syncCurrentNav(button.dataset.view), 0);
  }, true);
  window.addEventListener('popstate', () => routeFromHash());
  window.addEventListener('hashchange', () => routeFromHash());

  function init() {
    setupMobileLabel(); setupBreadcrumb(); setupSearch(); setupDropdowns();
    const view = currentView();
    syncCurrentNav(view);
    routeFromHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();