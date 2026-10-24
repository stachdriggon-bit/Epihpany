const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');

async function clickView(page, view) {
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
  const landingStart = page.locator('#landing-start');
  if (await landingStart.isVisible()) await landingStart.click();
  const welcomeClose = page.locator('#welcome-modal-close');
  if (await welcomeClose.isVisible()) await welcomeClose.click();
  const placementSkip = page.locator('#placement-skip');
  if (await placementSkip.isVisible()) await placementSkip.click();
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
    const views = ['home','stories','world','arcade','words','trophies','progress','profile'];
    for (const view of views) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 800, height: 900 });
      const requested = [];
      page.on('pageerror', error => errors.push(view + ': ' + error.message));
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push(view + ': ' + message.text()); });
      page.on('request', request => {
        try {
          const url = new URL(request.url());
          if (url.origin === baseUrl) requested.push(url.pathname);
        } catch {}
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
      if (view === 'home') {
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
    const offlinePage = await browser.newPage();
    await offlinePage.setViewportSize({ width: 800, height: 900 });
    offlinePage.on('pageerror', error => errors.push('offline: ' + error.message));
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
