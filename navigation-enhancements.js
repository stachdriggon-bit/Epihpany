/* Navigation polish: route history, deep links, accessible dropdowns and global search.
   Kept separate from app.js so learning/game logic remains untouched. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const labels = {
    home: 'Start learning', stories: 'Stories', chronicle: 'World Archive', resonance: 'The Resonance', summon: 'Card Portal', arcade: 'Arcade', thinklab: 'Think Lab',
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
      home.type = 'button'; home.className = 'breadcrumb-link breadcrumb-parent breadcrumb-back'; home.textContent = 'Home'; home.setAttribute('aria-label', 'Back to Home');
      home.addEventListener('click', () => navigate('home'));
      crumb.append(home);
      const sep = document.createElement('span'); sep.setAttribute('aria-hidden', 'true'); sep.textContent = '›'; crumb.append(sep);
      const current = document.createElement('span'); current.className = 'breadcrumb-current'; current.setAttribute('aria-current', 'page'); current.textContent = labels[view] || view; crumb.append(current);
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
    const leaf = document.createElement('span'); leaf.className = 'breadcrumb-current'; leaf.setAttribute('aria-current', 'page'); leaf.textContent = title;
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
    let raw = location.hash.slice(1);
    if (raw.startsWith('word=') || raw.startsWith('word%3D')) return;
    if (!raw) raw = 'home';           // the very first history entry has no hash: that is the home page
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
      if (summary) summary.addEventListener('click', event => {
        closeMenus(group);
        // On desktop the pointer already opened the menu on hover, so a click must keep it open
        // (the native <details> toggle would close it again and the menu would seem broken).
        if (desktop()) { event.preventDefault(); group.open = true; }
      });
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-group, .mobile-menu, .tools-menu')) closeMenus();
      const mobile = $('.mobile-menu');
      if (mobile && mobile.open && event.target.closest('.mobile-menu nav [data-view]')) mobile.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      // Close the active game layer before handling ordinary navigation menus.
      const game = $('#game');
      if (game && !game.hidden) {
        const closeGame = $('#game-close');
        if (closeGame) { event.preventDefault(); closeGame.click(); return; }
      }
      // The notification panel is also a dismissible overlay for keyboard users.
      const notifications = $('#notification-panel');
      if (notifications && !notifications.hidden) {
        const closeNotifications = $('#notification-close');
        if (closeNotifications) { event.preventDefault(); closeNotifications.click(); return; }
      }
      const opened = $('.nav-group[open], .mobile-menu[open], .tools-menu[open]');
      closeMenus();
      if (opened) $('summary', opened)?.focus({ preventScroll: true });
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

    // Keep the header geometry stable during wheel scrolling.
    // Hiding/collapsing this header changes its height and can trigger scroll anchoring,
    // causing repeated hide/reveal flicker. The header now remains visible and fixed in size.
    const header = $('.top');
    header?.classList.remove('is-hidden-on-scroll');
    window.addEventListener('scroll', () => {
      if (header?.classList.contains('is-hidden-on-scroll')) {
        header.classList.remove('is-hidden-on-scroll');
      }
    }, { passive: true });
    window.addEventListener('resize', () => {
      header?.classList.remove('is-hidden-on-scroll');
    }, { passive: true });

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

  // Every way of changing page (top tabs, menus, buttons, search, code) toggles .is-active on a .view.
  // Watching that single signal keeps the address bar and the browser Back button in sync no matter
  // which handler ran. (app.js stops the click event for the top tabs, so click-based tracking missed them.)
  function setupHistorySync() {
    if (!location.hash) history.replaceState({ epiphanyView: 'home' }, '', '#home');
    const observer = new MutationObserver(() => {
      const view = currentView();
      const target = routeFor(view);
      const onStoryRoute = view === 'stories' && location.hash.startsWith('#stories/');
      if (!restoringHistory && location.hash !== target && !onStoryRoute) {
        history.pushState({ epiphanyView: view }, '', target);
      }
      syncCurrentNav(view);
    });
    $$('.view').forEach(section => observer.observe(section, { attributes: true, attributeFilter: ['class'] }));
  }



  function setupExpandableDescriptions() {
    $$('.view .intro .lead').forEach((paragraph, index) => {
      if (paragraph.dataset.expandableReady || paragraph.textContent.trim().length < 155) return;
      paragraph.dataset.expandableReady = 'true';
      paragraph.classList.add('description-collapsed');
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'description-toggle';
      toggle.textContent = 'More'; toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', paragraph.id || ('intro-description-' + index));
      if (!paragraph.id) paragraph.id = 'intro-description-' + index;
      paragraph.insertAdjacentElement('afterend', toggle);
      toggle.addEventListener('click', () => {
        const expanded = paragraph.classList.toggle('description-collapsed') === false;
        toggle.textContent = expanded ? 'Less' : 'More';
        toggle.setAttribute('aria-expanded', String(expanded));
      });
    });
  }

  function setupGentleProgressCopy() {
    const update = () => {
      const streakChip = $('.chip-streak');
      const streak = $('#chip-streak');
      if (streakChip && streak) {
        const count = Number(streak.textContent.trim()) || 0;
        streakChip.hidden = count < 1;
        streakChip.setAttribute('aria-label', count ? count + ' day streak' : 'Start your streak today');
      }
      const homeStreak = $('#home-streak');
      if (homeStreak) {
        const value = Number(homeStreak.textContent.trim()) || 0;
        if (value === 0) {
          if (homeStreak.textContent.trim() !== 'Start today') homeStreak.textContent = 'Start today';
          homeStreak.setAttribute('aria-label', 'Start your streak today');
          homeStreak.closest('.progress-item')?.classList.add('is-new-start');
        } else {
          homeStreak.setAttribute('aria-label', value + ' day streak');
          homeStreak.closest('.progress-item')?.classList.remove('is-new-start');
        }
      }
      const ringText = $('#ring-text');
      if (ringText && /^0\s*\/\s*\d+$/.test(ringText.textContent.trim())) {
        ringText.textContent = 'Start today';
        ringText.setAttribute('aria-label', 'Start today’s learning goal');
      }
    };
    update();
    const observer = new MutationObserver(update);
    ['#chip-streak','#home-streak','#ring-text'].forEach(selector => {
      const node = $(selector);
      if (node) observer.observe(node, {childList:true,characterData:true,subtree:true});
    });
  }

  function setupCalmNavigation() {
    const gameTop = $('.game-top');
    const close = $('#game-close');
    if (gameTop && close && !$('#game-finish-here')) {
      const finish = document.createElement('button');
      finish.type = 'button'; finish.id = 'game-finish-here'; finish.className = 'btn btn-link';
      finish.textContent = 'Finish here';
      finish.setAttribute('aria-label', 'Finish here and leave this activity');
      finish.title = 'You can stop at any step. Completed answers are saved as you go.';
      close.insertAdjacentElement('afterend', finish);
      finish.addEventListener('click', () => close.click());
    }

    const tools = $('.tools-panel');
    if (tools && !$('#quick-nav-customize')) {
      const customize = document.createElement('button');
      customize.type = 'button'; customize.id = 'quick-nav-customize'; customize.className = 'tools-action';
      customize.textContent = '☆ Customize quick navigation';
      const install = $('#install-app', tools);
      (install || tools.lastElementChild)?.insertAdjacentElement('beforebegin', customize);
      customize.addEventListener('click', openQuickNavPicker);
    }
    renderQuickNav();
  }

  const QUICK_NAV_DEFAULT = ['arcade','words','world'];
  const QUICK_NAV_OPTIONS = [
    ['arcade','Arcade','✦'],['stories','Stories','▤'],['thinklab','Think Lab','⌕'],
    ['world','World','◎'],['lifeskills','Life Skills','✳'],['words','Words','Aa'],
    ['mytools','My Tools','✎'],['trophies','Trophies','◇'],['progress','Progress','↗']
  ];
  function getQuickNav() {
    try {
      const value = JSON.parse(localStorage.getItem('epiphany-quick-nav') || 'null');
      if (Array.isArray(value) && value.length === 3 && value.every(id => QUICK_NAV_OPTIONS.some(x => x[0] === id)) && new Set(value).size === 3) return value;
    } catch (_) {}
    return QUICK_NAV_DEFAULT.slice();
  }
  function renderQuickNav() {
    const nav = $('.bottom-nav');
    if (!nav) return;
    const selected = getQuickNav();
    const ids = ['home',...selected,'profile'];
    const labels = {home:['Home','⌂'],profile:['Me','♙']};
    nav.innerHTML = ids.map(id => {
      const option = QUICK_NAV_OPTIONS.find(x => x[0] === id);
      const label = labels[id] || [option[1],option[2]];
      return '<button type="button" data-view="'+id+'" aria-label="'+label[0]+'"><span aria-hidden="true">'+label[1]+'</span><small>'+label[0]+'</small></button>';
    }).join('');
    syncCurrentNav(currentView());
  }
  function openQuickNavPicker() {
    let dialog = $('#quick-nav-picker');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'quick-nav-picker'; dialog.className = 'global-search-overlay'; dialog.hidden = true;
      dialog.innerHTML = '<section class="global-search-panel quick-nav-panel" role="dialog" aria-modal="true" aria-labelledby="quick-nav-title"><div class="global-search-head"><h2 id="quick-nav-title">Your quick navigation</h2><button type="button" class="icon-btn" data-quick-nav-close aria-label="Close">×</button></div><p>Choose three destinations. Home and Profile stay available.</p><div id="quick-nav-options" class="quick-nav-options"></div><p id="quick-nav-count" role="status"></p><div class="quick-nav-actions"><button type="button" class="btn" id="quick-nav-save">Save choices</button><button type="button" class="btn btn-link" data-quick-nav-close>Cancel</button></div></section>';
      document.body.append(dialog);
      dialog.querySelectorAll('[data-quick-nav-close]').forEach(el => el.addEventListener('click', () => {dialog.hidden = true;document.body.classList.remove('no-scroll');}));
      dialog.addEventListener('change', event => {
        if (!event.target.matches('input[type=checkbox]')) return;
        const checked = $('input[type=checkbox]:checked', dialog);
        if (checked.length > 3) { event.target.checked = false; }
        const count = $('input[type=checkbox]:checked', dialog).length;
        $('#quick-nav-count', dialog).textContent = count + ' of 3 selected';
        $('#quick-nav-save', dialog).disabled = count !== 3;
      });
      $('#quick-nav-save', dialog).addEventListener('click', () => {
        const chosen = $('input[type=checkbox]:checked', dialog).map(input => input.value);
        if (chosen.length !== 3) return;
        try { localStorage.setItem('epiphany-quick-nav', JSON.stringify(chosen)); } catch (_) {}
        renderQuickNav(); dialog.hidden = true; document.body.classList.remove('no-scroll');
      });
    }
    const chosen = getQuickNav();
    $('#quick-nav-options', dialog).innerHTML = QUICK_NAV_OPTIONS.map(([id,label,icon]) => '<label class="quick-nav-option"><input type="checkbox" value="'+id+'" '+(chosen.includes(id)?'checked':'')+'><span aria-hidden="true">'+icon+'</span><b>'+label+'</b></label>').join('');
    $('#quick-nav-count', dialog).textContent = '3 of 3 selected';
    $('#quick-nav-save', dialog).disabled = false;
    dialog.hidden = false; document.body.classList.add('no-scroll');
  }

  function init() {
    setupMobileLabel(); setupBreadcrumb(); setupSearch(); setupDropdowns(); setupFinalPolish(); setupCalmNavigation(); setupExpandableDescriptions(); setupGentleProgressCopy();
    const view = currentView();
    syncCurrentNav(view);
    routeFromHash();
    setupHistorySync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();