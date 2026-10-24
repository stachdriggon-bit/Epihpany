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
  function setStoryBreadcrumb(title) {
    const crumb = $('#navigation-breadcrumb');
    if (!crumb || !title) return;
    syncCurrentNav('stories');
    const current = crumb.querySelector('[aria-current="page"]');
    if (current) {
      current.removeAttribute('aria-current');
      current.className = 'breadcrumb-link';
      current.setAttribute('role', 'button');
      current.tabIndex = 0;
      current.addEventListener('click', () => navigate('stories'));
      current.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate('stories'); } });
    }
    const sep = document.createElement('span'); sep.setAttribute('aria-hidden', 'true'); sep.textContent = '›';
    const leaf = document.createElement('span'); leaf.setAttribute('aria-current', 'page'); leaf.textContent = title;
    crumb.append(sep, leaf);
  }
  function openDeepStory(id, attempt = 0) {
    const card = $('[data-story-open="' + CSS.escape(id) + '"]');
    if (card) {
      if ($('#game')?.hidden) card.click();
      setStoryBreadcrumb(card.querySelector('strong')?.textContent || id);
      return;
    }
    if (attempt < 24) setTimeout(() => openDeepStory(id, attempt + 1), 150);
  }
  function routeFromHash() {
    const raw = location.hash.slice(1);
    if (!raw || raw.startsWith('word=') || raw.startsWith('word%3D')) return;
    const parts = decodeURIComponent(raw).split('/');
    const view = parts[0].split(/[?&]/)[0];
    if (!labels[view]) return;
    if (view === 'stories' && !parts[1] && $('#game') && !$('#game').hidden && $('.story-reader')) {
      $('#game-close')?.click();
    }
    if (currentView() !== view) {
      restoringHistory = true;
      navigate(view, { history: false });
      restoringHistory = false;
    } else syncCurrentNav(view);
    if (view === 'stories' && parts[1]) openDeepStory(parts[1]);
  }

  function setupMobileLabel() {
    const summary = $('.mobile-menu > summary');
    if (summary && !$('#mobile-current-section')) {
      const label = document.createElement('small');
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
      // Search is the only place where loading story metadata early is useful.
      if (typeof window.EPIPHANY_LAZY_LOAD === 'function' && typeof STORIES === 'undefined') {
        window.EPIPHANY_LAZY_LOAD('stories').then(() => renderResults(input.value)).catch(() => {});
      }
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
      // Story titles are searchable even before the Story Library has been opened.
      if (typeof STORIES !== 'undefined' && Array.isArray(STORIES)) {
        STORIES.forEach(story => {
          const title = String(story.title || '');
          const searchable = normalize([title, story.level, story.topic, story.description].filter(Boolean).join(' '));
          if (title && searchable.includes(q)) found.push({ title, detail: 'Story · ' + String(story.level || ''), view: 'stories', storyId: story.id, score: 0 });
        });
      }
      // Game names and descriptions are searchable from the shared search.
      if (typeof GAMES !== 'undefined' && GAMES && typeof GAMES === 'object') {
        Object.entries(GAMES).forEach(([id, game]) => {
          const title = String(game.title || game.name || id).replace(/[-_]/g, ' ');
          const searchable = normalize([title, game.description, game.subtitle, id].filter(Boolean).join(' '));
          if (title && searchable.includes(q)) found.push({ title, detail: 'Game · Arcade', view: 'arcade', score: 1 });
        });
      }
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
          if (item.storyId) {
            setTimeout(() => {
              const storyCard = $('[data-story-open="' + CSS.escape(item.storyId) + '"]');
              if (storyCard) storyCard.click();
            }, 180);
          } else if (item.element && item.element.isConnected) {
            setTimeout(() => item.element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
          }
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
    const logo = event.target.closest('#logo');
    if (logo) {
      event.preventDefault();
      navigate('home');
      return;
    }
    const storyCard = event.target.closest('[data-story-open]');
    if (storyCard) {
      const id = storyCard.dataset.storyOpen;
      if (id && location.hash !== '#stories/' + encodeURIComponent(id)) {
        history.pushState({ epiphanyView: 'stories', epiphanyStoryId: id }, '', '#stories/' + encodeURIComponent(id));
      }
      setTimeout(() => setStoryBreadcrumb(storyCard.querySelector('strong')?.textContent || id), 0);
      return;
    }
    const button = event.target.closest('[data-view]');
    if (!button || !labels[button.dataset.view]) return;
    if (!restoringHistory && location.hash !== routeFor(button.dataset.view)) {
      history.pushState({ epiphanyView: button.dataset.view }, '', routeFor(button.dataset.view));
    }
    setTimeout(() => syncCurrentNav(button.dataset.view), 0);
  }, true);
  window.addEventListener('popstate', () => routeFromHash());
  window.addEventListener('hashchange', () => routeFromHash());


  function setupFinalPolish() {
    // A pointer click should not leave a purple keyboard-focus ring on a heading.
    document.addEventListener('pointerdown', () => document.body.classList.add('navigation-pointer'), { passive: true });
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab' || event.key.startsWith('Arrow') || event.key === 'Enter' || event.key === ' ') {
        document.body.classList.remove('navigation-pointer');
      }
    });

    // Hide the sticky header while scrolling down; reveal it on upward movement.
    const header = $('.top');
    let lastY = window.scrollY || 0;
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const modalOpen = !!$('.game:not([hidden]), .global-search-overlay:not([hidden]), .help-language-modal:not([hidden])');
        if (header) {
          if (y < 90 || y < lastY - 3 || modalOpen) header.classList.remove('is-hidden-on-scroll');
          else if (y > lastY + 5 && y > 140) header.classList.add('is-hidden-on-scroll');
        }
        lastY = y;
        scrollTicking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', () => header?.classList.remove('is-hidden-on-scroll'), { passive: true });

    // Convert lazy-feature failures into a useful, retryable message inside that section.
    const groupViews = { stories: 'stories', world: 'world', arcade: 'arcade', thinklab: 'thinklab', lifeskills: 'lifeskills' };
    if (typeof window.EPIPHANY_LAZY_LOAD === 'function' && !window.__epiphanyLoadErrorHandlerInstalled) {
      const originalLoad = window.EPIPHANY_LAZY_LOAD;
      window.EPIPHANY_LAZY_LOAD = function (group, ...args) {
        return originalLoad.call(this, group, ...args).catch(error => {
          const viewName = groupViews[group];
          const view = viewName && $('#' + viewName + '-view');
          if (view && view.classList.contains('is-active')) {
            let panel = $('#load-error-' + viewName);
            if (!panel) {
              panel = document.createElement('section');
              panel.id = 'load-error-' + viewName;
              panel.className = 'section-load-error';
              panel.setAttribute('role', 'alert');
              panel.innerHTML = '<span class="load-error-icon" aria-hidden="true">↻</span><div><h2>Could not load this section</h2><p>Something interrupted loading. Your progress is safe. Check your connection, then try again.</p><button type="button" class="btn btn-go" data-retry-section="' + viewName + '">Try again</button></div>';
              const page = $('.page', view) || view;
              const intro = $('.intro', page);
              if (intro) intro.insertAdjacentElement('afterend', panel);
              else page.prepend(panel);
              panel.querySelector('[data-retry-section]').addEventListener('click', async event => {
                const button = event.currentTarget;
                button.disabled = true;
                button.textContent = 'Trying again…';
                try {
                  await originalLoad.call(window, group);
                  // Reloading restores the current hash and reruns the section initializer cleanly.
                  window.location.reload();
                } catch (_) {
                  button.disabled = false;
                  button.textContent = 'Try again';
                }
              });
            }
          }
          throw error;
        });
      };
      window.__epiphanyLoadErrorHandlerInstalled = true;
    }
  }

  function init() {
    setupMobileLabel(); setupBreadcrumb(); setupSearch(); setupDropdowns(); setupFinalPolish();
    const view = currentView();
    syncCurrentNav(view);
    routeFromHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();