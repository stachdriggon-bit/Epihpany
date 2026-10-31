const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');

async function clickView(page, view) {
  const activeView = page.locator('#' + view + '-view.is-active');
  if (await activeView.count() && await activeView.isVisible()) return;
  const selector = 'button[data-view="' + view + '"]';
  await page.waitForSelector(selector, { state: 'attached', timeout: 10000 });
  if (!(await page.locator(selector + ':visible').count())) {
    const group = page.locator('details.nav-group').filter({ has: page.locator(selector) }).first();
    if (await group.count() && await group.isVisible()) {
      if (!(await group.evaluate(el => el.open))) await group.locator('summary').click();
    } else {
      const mobileMenu = page.locator('.mobile-menu');
      if (await mobileMenu.isVisible() && !(await mobileMenu.evaluate(el => el.open))) await mobileMenu.locator('summary').click();
    }
  }
  await page.locator(selector + ':visible').first().click();
}

async function dismissFirstVisitOverlays(page) {
  // Navigation smoke tests use a returning-visitor fixture. The dedicated first-visit
  // test below exercises the complete new onboarding path.
  const landingStart = page.locator('#landing-start');
  if (await landingStart.isVisible()) {
    await landingStart.click();
    await page.waitForTimeout(50);
  }
  const languageChoice = page.locator('#help-language-modal [data-help-language="en"]');
  if (await languageChoice.isVisible()) await languageChoice.click();
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
let server, browser, baseUrl;

test('main navigation tabs open without uncaught page errors', async t => {
  server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
    catch { res.writeHead(400); res.end('Bad request'); return; }
    const requested = path.resolve(root, '.' + pathname);
    if (pathname !== '/' && !requested.startsWith(root + path.sep) && requested !== path.join(root, 'index.html')) { res.writeHead(403); res.end('Forbidden'); return; }
    const file = pathname === '/' ? path.join(root, 'index.html') : requested;
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream', 'cache-control':'no-store' });
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = 'http://127.0.0.1:' + server.address().port;
  try {
    browser = await chromium.launch({ headless: true });
    const errors = [];
    const consoleErrors = [];

    const firstVisitPage = await browser.newPage();
    await firstVisitPage.setViewportSize({ width: 1280, height: 900 });
    firstVisitPage.on('pageerror', error => errors.push('first-visit: ' + error.message));
    await firstVisitPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    assert.equal(await firstVisitPage.locator('#landing-start').isVisible(), true, 'a new visitor should first see the landing screen');
    assert.equal(await firstVisitPage.locator('#account-welcome-modal').isVisible(), false, 'account creation must not interrupt the first visit');
    await firstVisitPage.locator('#landing-start').click();
    await firstVisitPage.locator('#help-language-modal [data-help-language="en"]').waitFor({ state: 'visible', timeout: 5000 });
    await firstVisitPage.locator('#help-language-modal [data-help-language="en"]').click();
    await firstVisitPage.locator('#placement [data-start-level="B1"]').waitFor({ state: 'visible', timeout: 7000 });
    await firstVisitPage.evaluate(() => window.EpiphanyAuth.whenReady());
    assert.equal(await firstVisitPage.evaluate(() => window.EpiphanyAuth.isSignedIn()), false, 'the fresh visitor should be a guest');
    assert.equal(await firstVisitPage.locator('#placement-title').innerText(), 'Choose your starting point');
    assert.equal(await firstVisitPage.locator('#placement-progress').isVisible(), false, 'the full assessment should not be forced at the start');
    await firstVisitPage.locator('#placement [data-start-level="B1"]').click();
    await firstVisitPage.locator('#game').waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await firstVisitPage.locator('#game-body .answer').count() >= 2, 'choosing a level should start a real learning activity');
    assert.equal(await firstVisitPage.locator('#account-welcome-modal').isVisible(), false, 'no account prompt should appear before the first activity is completed');
    assert.equal(await firstVisitPage.locator('.account-save-prompt').count(), 0, 'the result invitation must not appear before an activity result');
    assert.equal(await firstVisitPage.evaluate(() => window.__epiphanyReadProgress().assessedLevel), 'B1', 'the approximate level choice should be saved');

    for (let attempt = 0; attempt < 40; attempt++) {
      const answers = firstVisitPage.locator('#game-body .answer');
      if (!(await answers.count())) break;
      await answers.first().click();
      const retryHint = firstVisitPage.locator('#go-retry-answer');
      if (await retryHint.isVisible()) {
        await retryHint.click();
        await firstVisitPage.locator('#game-body .answer').first().click();
      }
      await firstVisitPage.locator('#go-next').waitFor({ state: 'visible', timeout: 3000 });
      await firstVisitPage.locator('#go-next').click();
    }
    const resultState = await firstVisitPage.evaluate(() => ({
      resultVisible: !!document.querySelector('#game-body .result'),
      dailySessionStep: window.__epiphanyReadProgress().dailySessionStep,
      promptSeen: sessionStorage.getItem('epiphany-account-prompt-shown-v1')
    }));
    assert.equal(resultState.resultVisible, true, 'the first lesson should reach its result screen: ' + JSON.stringify(resultState));
    await firstVisitPage.locator('.account-save-prompt').waitFor({ state: 'visible', timeout: 7000 });
    assert.equal(await firstVisitPage.locator('.result-actions').isVisible(), true, 'the invitation must not replace or cover the result actions');
    await firstVisitPage.locator('[data-account-prompt-dismiss]').click();
    assert.equal(await firstVisitPage.locator('.account-save-prompt').count(), 0, 'guest continuation should dismiss only the invitation');
    assert.equal(await firstVisitPage.locator('.result-actions').isVisible(), true, 'the result must remain available after dismissing the invitation');
    assert.equal(await firstVisitPage.evaluate(() => sessionStorage.getItem('epiphany-account-prompt-shown-v1')), '1', 'the invitation dismissal must be remembered for this session');
    await firstVisitPage.close();

    const views = ['home','stories','chronicle','resonance','world','arcade','summon','words','trophies','progress','profile'];
    for (const view of views) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 900 });
      const requested = [];
      page.on('pageerror', error => errors.push(view + ': ' + error.message));
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push(view + ': ' + message.text()); });
      page.on('request', request => {
        try {
          const url = new URL(request.url());
          if (url.origin === baseUrl) requested.push(url.pathname);
        } catch {}
      });
      await page.addInitScript(() => {
        localStorage.setItem('epiphany-progress', JSON.stringify({placementDone:true,assessedLevel:'A1',level:'A1'}));
        localStorage.setItem('epiphany-landing-seen', '1');
      });
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await dismissFirstVisitOverlays(page);
      await page.waitForSelector('button[data-view="' + view + '"]', { state: 'attached', timeout: 10000 });
      const eagerDeferred = requested.filter(path => /\/(data-translation-ar|data-stories|data-world(?:-sprites)?|think-lab|practice-lab|life-skills)\.js$/.test(path));
      assert.deepEqual(eagerDeferred, [], 'deferred files should not load at startup for ' + view);
      await clickView(page, view);
      await page.waitForTimeout(350);
      if (view !== 'world') {
        const target = page.locator('#' + view + '-view');
        await target.waitFor({ state: 'attached', timeout: 5000 });
        if (view !== 'home') assert.equal(await target.evaluate(el => el.classList.contains('is-active')), true, view + ' view should become active');
      }
      if (view === 'stories') {
        await page.waitForFunction(() => typeof STORIES !== 'undefined' && Array.isArray(STORIES) && STORIES.length >= 34, null, { timeout: 5000 });
        assert.ok(requested.some(path => path.endsWith('/data-stories.js')), 'Stories should load its data on first open');
      }
      if (view === 'chronicle') {
        await page.waitForFunction(() => Array.isArray(window.EPIPHANY_WORLD_EVENTS) && window.EPIPHANY_WORLD_EVENTS.length === 6, null, { timeout: 5000 });
        assert.ok(requested.some(path => path.endsWith('/data-world-events.js')), 'World Archive should load event records on first open');
        assert.equal(await page.locator('#chronicle-content .archive-event').count(), 6, 'archive should show all six provisional entries');
        assert.equal(await page.locator('#chronicle-content').getByText('Date not established').count(), 6, 'unknown dates must remain explicit');
        await page.locator('#archive-order').selectOption('newest');
        assert.equal(await page.locator('#chronicle-content .archive-event h3').first().innerText(), 'A careful practical decision is made', 'reverse episode order should reverse the undated pilot sequence');
        assert.equal(await page.locator('#chronicle-content [data-story-open]').count(), 6, 'each archive event should link to its existing story');
      }
      if (view === 'resonance') {
        await page.waitForFunction(() => typeof window.EPIPHANY_RESONANCE !== 'undefined', null, { timeout: 5000 });
        assert.ok(requested.some(path => path.endsWith('/resonance.js')), 'The Resonance should load on first open');
        await page.locator('[data-res-action="message"]').first().click();
        await page.locator('[data-res-action="record"]').click();
        // Evidence IDs are intentionally shown in the journal, not in the scene.
        await page.locator('#resonance-view [data-res-action="journal"]').first().click();
        await page.locator('#res-journal').waitFor({ state: 'visible' });
        await page.locator('#res-journal').getByText('E-01', { exact: true }).waitFor({ state: 'visible' });
        await page.locator('#res-journal [data-res-action="close-journal"]').click();
        await page.locator('[data-res-action="meet"]').click();
        await page.locator('[data-res-choice="careful"]').click();
        await page.locator('[data-res-action="continue"]').click();
        await page.locator('[data-res-action="relay"]').click();
        await page.locator('[data-res-action="chapter-end"]').click();
        await page.locator('[data-res-action="chapter-2"]').click();
        await page.locator('[data-res-action="signal-inspect"]').click();
        await page.locator('[data-res-action="signal-record"]').click();
        await page.locator('[data-res-action="chapter-3"]').click();
        await page.locator('[data-res-action="truth-record"]').click();
        await page.locator('[data-res-action="truth-evidence"]').click();
        await page.locator('[data-res-action="chapter-4"]').click();
        await page.locator('[data-res-action="archive-open"]').click();
        await page.locator('[data-res-action="archive-evidence"]').click();
        await page.locator('[data-res-action="chapter-5"]').click();
        await page.locator('[data-res-action="resonance-inspect"]').click();
        await page.locator('[data-res-action="resonance-record"]').click();
        await page.locator('[data-res-action="ending-b"]').click();
        await page.locator('#resonance-view').getByText('ENDING B · THE UNFINISHED SIGNAL').waitFor({ state: 'visible' });
        await page.locator('#resonance-view [data-res-action="journal"]').first().click();
        await page.locator('#res-journal').waitFor({ state: 'visible' });
        for (const id of ['E-01','E-08','E-09','E-10','E-11','E-12']) {
          await page.locator('#res-journal').getByText(id, { exact: true }).waitFor({ state: 'visible' });
        }
      }
      if (view === 'world') {
        await page.waitForFunction(() => typeof WORLD_DATA !== 'undefined', null, { timeout: 5000 });
        assert.ok(requested.some(path => path.endsWith('/data-world.js')), 'World should load its data on first open');
        assert.ok(requested.some(path => path.endsWith('/data-world-sprites.js')), 'World should load its art on first open');
      }
      if (view === 'arcade') {
        assert.ok(requested.some(path => path.endsWith('/practice-lab.js')), 'Arcade should load practice tools on first open');
        await page.locator('.arcade-play').first().click();
        await page.locator('#game').waitFor({ state: 'visible', timeout: 5000 });
        await page.locator('#game-body').waitFor({ state: 'visible', timeout: 5000 });
        if (await page.locator('#game-body .answer').count()) await page.locator('#game-body .answer').first().click();
      }
      if (view === 'summon') {
        await page.locator('#cards-summon-token-count').waitFor({ state: 'visible', timeout: 5000 });
        assert.equal(await page.locator('#cards-pull-one').isVisible(), true, 'single-pull control should be visible');
        assert.equal(await page.locator('#cards-pull-one strong').innerText(), '×1', 'pull button layout should survive wallet updates');
        await page.locator('[data-card-pack="words"]').click();
        assert.equal(await page.locator('#cards-pack-art').getAttribute('data-pack'), 'words', 'pack artwork should reflect the selected pack');
        await page.locator('#cards-pull-one').click();
        await page.locator('#cards-reveal-modal').waitFor({ state: 'visible', timeout: 5000 });
        assert.equal(await page.locator('#cards-reveal-results .reveal-result').count(), 1, 'single pull should reveal exactly one card');
        assert.equal(await page.locator('#cards-reveal-modal').getAttribute('data-result-count'), '1', 'single pull should use the featured reveal state');
        assert.equal(await page.locator('#cards-summon-token-count').innerText(), '10', 'single pull should deduct five Tokens');
        await page.locator('#cards-reveal-close').click();
      }
      if (view === 'home') {
        assert.ok((await page.locator('#next-title').innerText()).trim(), 'home should show a recommended next activity');
        assert.ok((await page.locator('#next-desc').innerText()).trim(), 'home should explain why the activity is recommended');
        assert.ok((await page.locator('#next-start').getAttribute('data-game'))?.trim(), 'recommended activity should have a working game target');
        const mobileGroups = page.locator('.mobile-nav-group');
        assert.ok(await mobileGroups.count() > 0, 'mobile navigation should organize destinations into purpose-based groups');
        assert.equal(await mobileGroups.locator('.mobile-nav-label').count(), await mobileGroups.count(), 'every mobile navigation group should have a visible purpose label');
        const groupedDestinations = mobileGroups.locator('button[data-view]');
        assert.equal(await groupedDestinations.count(), await groupedDestinations.evaluateAll(buttons => new Set(buttons.map(button => button.dataset.view)).size), 'each destination should appear in only one purpose group');
        assert.equal(await page.locator('.mobile-menu nav [data-view]').count(), 15, 'all destinations, including World Archive, should remain available in the mobile menu');
        const quickActions = page.locator('.quick-actions-more');
        assert.equal(await quickActions.evaluate(el => el.open), false, 'secondary practice options should start collapsed');
        assert.equal(await page.locator('#listen-only-start').isVisible(), false, 'collapsed secondary actions should not clutter the home screen');
        await quickActions.locator('summary').click();
        assert.equal(await page.locator('#listen-only-start').isVisible(), true, 'secondary practice actions should be available when expanded');
        await quickActions.locator('summary').click();
        const gameExplorer = page.locator('.home-game-explorer');
        assert.equal(await gameExplorer.evaluate(el => el.open), false, 'game browsing should start collapsed behind the main daily action');
        assert.equal(await page.locator('#games').isVisible(), false, 'the game catalogue should not compete with the daily action before expansion');
        await gameExplorer.locator('summary').click();
        assert.equal(await gameExplorer.evaluate(el => el.open), true, 'all game choices should remain available when requested');
        assert.equal(await page.locator('#games').isVisible(), true, 'expanding the game explorer should reveal the existing catalogue');
        assert.ok(await page.locator('#games button').count() > 0, 'the existing game buttons should remain available');
        await gameExplorer.locator('summary').click();
        const arabicToggle = page.locator('#ar-toggle');
        const arabicIsOn = await page.locator('body').evaluate(el => el.classList.contains('ar-on'));
        if (!arabicIsOn) await page.evaluate(() => document.querySelector('#ar-toggle').click());
        await page.waitForFunction(() => document.body.classList.contains('ar-on'), null, { timeout: 2000 }).catch(async error => {
          const diagnostics = await page.evaluate(() => ({arabicOn:document.body.classList.contains('ar-on'),toggle:document.querySelector('#ar-toggle')?.outerHTML,loaderType:typeof window.EPIPHANY_LAZY_LOAD}));
          throw new Error('Arabic help toggle did not activate: ' + JSON.stringify({diagnostics,requested,consoleErrors,pageErrors:errors}) + '; ' + error.message);
        });
        if (typeof (await page.evaluate(() => window.EPIPHANY_AR_TRANSLATION_WORDS)) === 'undefined' && !requested.some(path => path.endsWith('/data-translation-ar.js'))) {
          await page.evaluate(() => document.querySelector('#ar-toggle').click());
          await page.evaluate(() => document.querySelector('#ar-toggle').click());
        }
        await page.waitForFunction(() => typeof window.EPIPHANY_AR_TRANSLATION_WORDS !== 'undefined', null, { timeout: 5000 }).catch(async error => {
          const diagnostics = await page.evaluate(() => ({
            arabicOn: document.body.classList.contains('ar-on'),
            loaderType: typeof window.EPIPHANY_LAZY_LOAD,
            mergerType: typeof window.EPIPHANY_MERGE_AR_TRANSLATIONS,
            translationTogglePressed: document.querySelector('#translation-toggle')?.getAttribute('aria-pressed')
          }));
          throw new Error('Arabic catalogue did not load: ' + JSON.stringify({diagnostics, requested, consoleErrors, pageErrors: errors}) + '; ' + error.message);
        });
        assert.ok(requested.some(path => path.endsWith('/data-translation-ar.js')), 'Arabic catalogue should load only after Arabic help is enabled');
      }
      await page.close();
    }
    const adaptivePage = await browser.newPage();
    await adaptivePage.setViewportSize({ width: 800, height: 900 });
    adaptivePage.on('pageerror', error => errors.push('adaptive-home: ' + error.message));
    await adaptivePage.addInitScript(() => {
      localStorage.setItem('epiphany-progress', JSON.stringify({
        review:[{word:'although',meaning:'despite',due:'2000-01-01',errors:0,box:1,attempts:0}],
        adaptiveSignals:{grammar:{attempts:4,errors:3,correct:1,topics:{}}},
        quests:0,level:'A1'
      }));
    });
    await adaptivePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await dismissFirstVisitOverlays(adaptivePage);
    await adaptivePage.waitForFunction(() => document.querySelector('#next-title')?.textContent === 'Review words due today', null, { timeout: 5000 });
    assert.equal(await adaptivePage.locator('#next-start').getAttribute('data-game'), 'speed', 'words due for spaced review should take priority over a generic activity rotation');
    assert.match(await adaptivePage.locator('#next-desc').innerText(), /although/i, 'the recommendation should name the words that need attention');
    await adaptivePage.close();

    const grammarReviewPage = await browser.newPage();
    await grammarReviewPage.setViewportSize({ width: 800, height: 900 });
    grammarReviewPage.on('pageerror', error => errors.push('adaptive-grammar-review: ' + error.message));
    await grammarReviewPage.addInitScript(() => {
      localStorage.setItem('epiphany-progress', JSON.stringify({
        review:[],
        mistakeTrapSrs:{'past-simple':{attempts:4,correct:2,errors:2,box:0,streak:0,due:'2000-01-01'}},
        mistakeTrapErrors:{'past-simple':2},mistakeTrapCorrect:{'past-simple':1},
        quests:0,level:'A1'
      }));
    });
    await grammarReviewPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await dismissFirstVisitOverlays(grammarReviewPage);
    await grammarReviewPage.waitForFunction(() => document.querySelector('#next-title')?.textContent === 'Review grammar patterns due today', null, { timeout: 5000 });
    assert.equal(await grammarReviewPage.locator('#next-start').getAttribute('data-game'), 'personalized', 'due grammar SRS should surface when no vocabulary review is due');
    assert.match(await grammarReviewPage.locator('#next-desc').innerText(), /past simple/i, 'grammar review recommendation should name the due pattern');
    await grammarReviewPage.close();

    const cardsPage = await browser.newPage();
    await cardsPage.setViewportSize({ width: 390, height: 844 });
    await cardsPage.addInitScript(() => {
      // Keep the browser smoke test deterministic even when external config loading is delayed.
      window.EPIPHANY_SUPABASE_CONFIG = {url:'https://pqxkmtowialpjwehvuyb.supabase.co'};
      window.__cardLongTasks = [];
      try { new PerformanceObserver(list => window.__cardLongTasks.push(...list.getEntries().map(entry => entry.duration))).observe({type:'longtask', buffered:true}); } catch {}
      localStorage.setItem('epiphany-landing-seen', '1');
      localStorage.setItem('epiphany-progress', JSON.stringify({placementDone:true,assessedLevel:'A1',level:'A1'}));
      localStorage.setItem('epiphany-card-prototype-v1', JSON.stringify({
        tokens:15, shards:0, owned:{'CHR-001':1,'CHR-002':1,'CHR-004':1,'CHR-039':1,'CHR-005':1},
        cardLevels:{}, history:[], achievementRewards:{}, initialized:true
      }));
    });
    const failedCardRequests = [];
    cardsPage.on('pageerror', error => errors.push('card portal: ' + error.message));
    cardsPage.on('requestfailed', request => {
      if (request.url().includes('supabase.co/storage/')) failedCardRequests.push({url:request.url(),failure:request.failure()?.errorText || 'unknown'});
    });
    // Keep the gallery smoke test independent of external Supabase availability.
    // It verifies that card image elements load and decode; cloud delivery is covered separately.
    await cardsPage.route('https://pqxkmtowialpjwehvuyb.supabase.co/storage/v1/object/public/**', route => route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2" viewBox="0 0 2 2"><rect width="2" height="2" fill="#777"/></svg>'
    }));
    await cardsPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await dismissFirstVisitOverlays(cardsPage);
    await clickView(cardsPage, 'profile');
    await cardsPage.locator('#cards-gallery').scrollIntoViewIfNeeded();
    // The browser may defer every lazy image in a long gallery even when its container is in view.
    // Promote one visible representative image to eager loading so this smoke test checks decoding,
    // while the separate card tests continue to protect the app's lazy-loading behavior.
    await cardsPage.locator('#cards-gallery .fcard-portrait-image').first().evaluate(img => {
      img.loading = 'eager';
      img.scrollIntoView({block:'center',inline:'nearest'});
    });
    const galleryOpenedAt = await cardsPage.evaluate(() => performance.now());
    await cardsPage.waitForFunction(() => [...document.querySelectorAll('#cards-gallery .fcard-portrait-image')].some(img => img.complete && img.naturalWidth > 0), null, {timeout:10000}).catch(async error => {
      const diagnostics = await cardsPage.evaluate(() => ({
        configUrl: window.EPIPHANY_SUPABASE_CONFIG?.url || null,
        galleryVisible: !!document.querySelector('#cards-gallery')?.getClientRects().length,
        images: [...document.querySelectorAll('#cards-gallery .fcard-portrait-image')].slice(0,8).map(img => ({
          id: img.dataset.cardImageId,
          src: img.getAttribute('src'),
          currentSrc: img.currentSrc,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          loading: img.loading
        }))
      }));
      throw new Error('Card gallery images did not load: ' + JSON.stringify({diagnostics,failedCardRequests,consoleErrors, pageErrors:errors}) + '; ' + error.message);
    });
    const galleryMetrics = await cardsPage.evaluate(async started => {
      const images=[...document.querySelectorAll('#cards-gallery .fcard-portrait-image')];
      const first=images.find(img=>img.complete&&img.naturalWidth>0);
      let decodeMs=null;
      if(first){const t=performance.now();try{await first.decode();decodeMs=performance.now()-t;}catch{}}
      const resources=performance.getEntriesByType('resource').filter(entry=>/\\.(png|jpe?g|webp)(?:[?#]|$)/i.test(entry.name));
      return {viewport:innerWidth+'x'+innerHeight,imageRequests:resources.length,transferBytes:resources.reduce((sum,item)=>sum+(item.transferSize||0),0),decodedBytes:resources.reduce((sum,item)=>sum+(item.decodedBodySize||0),0),firstImageVisibleMs:Math.round(performance.now()-started),firstImageDecodeMs:decodeMs,longTaskCount:window.__cardLongTasks.length,longTaskMs:Math.round(window.__cardLongTasks.reduce((a,b)=>a+b,0))};
    }, galleryOpenedAt);
    console.log('CARD_GALLERY_METRICS '+JSON.stringify(galleryMetrics));
    await cardsPage.waitForSelector('#cards-rarity-filters [data-gallery-rarity="Epic"]');
    await cardsPage.locator('#cards-rarity-filters [data-gallery-rarity="Epic"]').click();
    await cardsPage.locator('#cards-type-filters [data-gallery-type="characters"]').click();
    await cardsPage.evaluate(() => { window.__miraGalleryNode = document.querySelector('#cards-gallery [data-gallery-card="CHR-001"]'); });
    const filteredIds = await cardsPage.locator('#cards-gallery [data-gallery-card]').evaluateAll(els => els.map(el => el.dataset.galleryCard));
    const invalidFiltered = await cardsPage.evaluate(ids => ids.filter(id => {
      const card = window.EPIPHANY_CARD_DATA.find(item => item.id === id);
      return !card || card.rarity !== 'Epic' || card.category !== 'characters';
    }), filteredIds);
    assert.deepEqual(invalidFiltered, [], 'rarity and type filters must combine');
    await cardsPage.locator('#cards-rarity-filters [data-gallery-rarity="all"]').click();
    await cardsPage.locator('#cards-type-filters [data-gallery-type="all"]').click();
    assert.equal(await cardsPage.evaluate(() => document.querySelector('#cards-gallery [data-gallery-card="CHR-001"]') === window.__miraGalleryNode), true, 'filter changes must preserve existing card node identity');
    const galleryMiraImage = cardsPage.locator('#cards-gallery [data-gallery-card="CHR-001"] .fcard-portrait-image');
    assert.equal(await galleryMiraImage.getAttribute('src'), await galleryMiraImage.getAttribute('data-cloud-src'), 'gallery must load its image directly from Supabase Storage');
    assert.ok(String(await galleryMiraImage.getAttribute('src')).includes('/thumbs/'), 'gallery must request the Supabase thumbnail object');
    assert.equal(await galleryMiraImage.getAttribute('data-local-fallback'), null, 'gallery must not define a local image fallback');
    const miraCard = cardsPage.locator('#cards-gallery [data-gallery-card="CHR-001"] .fcard');
    await miraCard.click();
    const detail = cardsPage.locator('#cards-detail-modal [role="dialog"]');
    await detail.waitFor();
    assert.equal(await detail.locator('#cards-detail-name').innerText(), 'Mira');
    assert.equal(await detail.getAttribute('aria-modal'), 'true');
    assert.ok(await detail.locator('.cards-detail-section').count() > 1, 'Mira dossier should display multiple distinct sections');
    const modalCardBox = await detail.locator('.cards-detail-art .fcard').boundingBox();
    assert.ok(modalCardBox && modalCardBox.width > 0 && modalCardBox.height > 0, 'the real card face must be visible in the modal');
    assert.ok(await detail.locator('.cards-detail-art img, .cards-detail-art svg').count() > 0, 'the modal card must contain its artwork');
    const modalArt = detail.locator('.cards-detail-art img');
    const modalArtSrc = await modalArt.getAttribute('data-cloud-src');
    assert.ok(modalArtSrc.includes('/character-art/originals/'), 'the modal must use the full-size Supabase Storage object');
    assert.equal(await modalArt.getAttribute('src'), modalArtSrc, 'the modal must load full artwork directly from Supabase Storage');
    assert.equal(await modalArt.getAttribute('data-local-fallback'), null, 'the modal must not define a local image fallback');
    await cardsPage.locator('.cards-detail-translate').click();
    assert.equal(await detail.locator('#cards-detail-name').innerText(), 'ميرا', 'character name should translate in place');
    assert.match(await detail.locator('.cards-detail-summary').innerText(), /مرشدة بشرية فضولية/);
    assert.doesNotMatch(await detail.locator('.cards-detail-summary').innerText(), /Mira is a practical guide/);
    // On narrow screens the dossier is intentionally full-screen, so close it with its visible close control.
    await cardsPage.locator('#cards-detail-modal .cards-detail-close').click();
    await detail.waitFor({ state:'detached' });
    assert.equal(await miraCard.evaluate(el => document.activeElement === el), true, 'focus should return to the selected card');

    await cardsPage.locator('#cards-gallery [data-gallery-card="CHR-005"] .fcard').click();
    await cardsPage.locator('#cards-detail-modal .cards-detail-placeholder').waitFor();
    assert.match(await cardsPage.locator('#cards-detail-modal .cards-detail-placeholder').innerText(), /Not documented yet/);
    await cardsPage.evaluate(() => {
      window.EPIPHANY_CARD_PROFILES['CHR-001'].sections.push({
        title:{en:'Places',ar:'الأماكن'},
        text:{en:[{place:'IL-LOC-01',label:'The Three-Arch Ferry'}],ar:[{place:'IL-LOC-01',label:'عبّارة الأقواس الثلاثة'}]}
      });
    });
    await cardsPage.keyboard.press('Escape');
    await cardsPage.locator('#cards-detail-modal').waitFor({state:'detached'});
    await cardsPage.locator('#cards-gallery [data-gallery-card="CHR-001"] .fcard').click();
    const archivePlaceLink=cardsPage.locator('#cards-detail-modal [data-archive-place="IL-LOC-01"]');
    await archivePlaceLink.waitFor({state:'attached',timeout:10000});
    const archivePlaceSection=archivePlaceLink.locator('xpath=ancestor::details[contains(@class,"cards-detail-section")][1]');
    if(!(await archivePlaceSection.evaluate(el=>el.open))){
      await archivePlaceSection.locator(':scope > summary').click();
    }
    await archivePlaceLink.waitFor({state:'visible',timeout:10000});
    await archivePlaceLink.click();
    await cardsPage.waitForSelector('#chronicle-view.is-active #chronicle-content .archive-place-heading h2', {timeout:10000});
    assert.match(await cardsPage.locator('#chronicle-content .archive-place-heading h2').innerText(), /Three-Arch Ferry/);
    await cardsPage.locator('.archive-back-to-cards').click();
    await cardsPage.waitForSelector('#profile-view.is-active #cards-gallery');
    await cardsPage.locator('#cards-gallery [data-gallery-card="CHR-003"] .fcard').click();
    const lockedDetail = cardsPage.locator('#cards-detail-modal [role="dialog"]');
    await lockedDetail.waitFor();
    assert.ok(await lockedDetail.locator('.cards-detail-art.is-locked .fcard.is-locked').count(), 'locked cards should show the dimmed silhouette');
    assert.match(await lockedDetail.locator('.cards-detail-summary').innerText(), /not been collected/i);
    await cardsPage.keyboard.press('Escape');
    await lockedDetail.waitFor({state:'detached'});

    const screenshotDir = path.join(root, 'test-results', 'card-dossier');
    fs.mkdirSync(screenshotDir, {recursive:true});
    const viewports = [{width:1920,height:1080,label:'1920x1080'},{width:1280,height:800,label:'1280x800'},{width:390,height:844,label:'390x844'}];
    for (const theme of ['light','dark']) {
      await cardsPage.evaluate(value => { document.body.dataset.theme=value; }, theme);
      for (const viewport of viewports) {
        await cardsPage.setViewportSize({width:viewport.width,height:viewport.height});
        await cardsPage.locator('#cards-gallery').scrollIntoViewIfNeeded();
        await cardsPage.screenshot({path:path.join(screenshotDir, theme+'-'+viewport.label+'-gallery.png')});
        for (const scenario of [{id:'CHR-001',label:'mira-en',translate:false},{id:'CHR-001',label:'mira-ar',translate:true},{id:'CHR-005',label:'no-profile',translate:false},{id:'CHR-003',label:'locked',translate:false}]) {
          const cardLocator=cardsPage.locator('#cards-gallery [data-gallery-card="'+scenario.id+'"] .fcard');
          await cardLocator.scrollIntoViewIfNeeded();
          await cardLocator.click();
          await cardsPage.locator('#cards-detail-modal [role="dialog"]').waitFor();
          if(scenario.translate)await cardsPage.locator('.cards-detail-translate').click();
          await cardsPage.screenshot({path:path.join(screenshotDir,theme+'-'+viewport.label+'-'+scenario.label+'.png')});
          await cardsPage.keyboard.press('Escape');
          await cardsPage.locator('#cards-detail-modal').waitFor({state:'detached'});
        }
      }
    }
    await cardsPage.close();

    const offlinePage = await browser.newPage();
    await offlinePage.setViewportSize({ width: 800, height: 900 });
    offlinePage.on('pageerror', error => errors.push('offline: ' + error.message));
    await offlinePage.addInitScript(() => {
      localStorage.setItem('epiphany-progress', JSON.stringify({placementDone:true,assessedLevel:'A1',level:'A1'}));
      localStorage.setItem('epiphany-landing-seen', '1');
    });
    await offlinePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await dismissFirstVisitOverlays(offlinePage);
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.reload({ waitUntil: 'domcontentloaded' });
    await offlinePage.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 });
    await clickView(offlinePage, 'stories');
    await offlinePage.waitForFunction(() => typeof STORIES !== 'undefined' && Array.isArray(STORIES) && STORIES.length >= 34, null, { timeout: 5000 });
    await offlinePage.waitForFunction(async () => {
      const keys = await caches.keys();
      const shellKey = keys.find(key => key.startsWith('epiphany-shell-'));
      if (!shellKey) return false;
      const cache = await caches.open(shellKey);
      const baseStories = await cache.match(new URL('/data-stories.js', location.href).href, { ignoreSearch: true });
      const expandedStories = await cache.match(new URL('/data-stories-expansion.js', location.href).href, { ignoreSearch: true });
      return !!baseStories && !!expandedStories;
    }, null, { timeout: 5000 });
    await offlinePage.context().setOffline(true);
    await offlinePage.reload({ waitUntil: 'domcontentloaded' });
    await clickView(offlinePage, 'stories');
    await offlinePage.waitForFunction(() => typeof STORIES !== 'undefined' && Array.isArray(STORIES), null, { timeout: 5000 });
    await offlinePage.context().setOffline(false);
    await offlinePage.close();
    assert.deepEqual(errors, [], 'uncaught page errors occurred: ' + errors.join(' | '));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
