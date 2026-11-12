const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const savedWindow = global.window;
global.window = globalThis;
require('../chain-reaction-bank.js');
const chainReactionBank = global.EPIPHANY_CHAIN_REACTION_BANK;
delete global.EPIPHANY_CHAIN_REACTION_BANK;
require('../supabase/functions/velorn-sentence-scramble/sentence-scramble-bank.js');
const sentenceScrambleBank = global.EPIPHANY_SENTENCE_SCRAMBLE_BANK;
delete global.EPIPHANY_SENTENCE_SCRAMBLE_BANK;
if (savedWindow === undefined) delete global.window;
else global.window = savedWindow;

async function clickView(page, view) {
  const activeView = page.locator('#' + view + '-view.is-active');
  if (await activeView.count() && await activeView.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && Number(getComputedStyle(el).opacity) > 0.99;
  })) return;
  const selector = 'button[data-view="' + view + '"]';
  await page.waitForSelector(selector, { state: 'attached', timeout: 10000 });
  const mobileLayout = await page.evaluate(() => window.innerWidth <= 900);
  if (mobileLayout) {
    const mobileMenu = page.locator('.mobile-menu');
    if (await mobileMenu.isVisible() && !(await mobileMenu.evaluate(el => el.open))) await mobileMenu.locator(':scope > summary').click();
    const group = page.locator('details.mobile-nav-group').filter({ has: page.locator(selector) }).first();
    if (await group.count() && !(await group.evaluate(el => el.open))) await group.locator('summary').click();
  } else {
    const group = page.locator('details.nav-group').filter({ has: page.locator(selector) }).first();
    if (await group.count() && !(await group.evaluate(el => el.open))) await group.locator('summary').click();
  }
  await page.locator(selector + ':visible').first().click();
}

async function dismissFirstVisitOverlays(page) {
  // Navigation smoke tests seed the current returning-guest marker. The dedicated
  // first-visit test below exercises the account gate and guest continuation.
  await page.locator('#auth-dialog').waitFor({ state:'hidden', timeout:5000 });
  const languageChoice = page.locator('#help-language-modal [data-help-language="en"]');
  if (await languageChoice.isVisible()) await languageChoice.click();
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
let server, browser, baseUrl;

test('main navigation tabs open without uncaught page errors', { timeout: 18 * 60 * 1000 }, async t => {
  const checkpoint = label => console.log('[browser-smoke] ' + new Date().toISOString() + ' ' + label);
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
    checkpoint('launching Chromium');
    browser = await chromium.launch({ headless: true, timeout: 30000 });
    checkpoint('Chromium launched');
    const errors = [];
    const consoleErrors = [];

    const firstVisitPage = await browser.newPage();
    await firstVisitPage.setViewportSize({ width: 1280, height: 900 });
    firstVisitPage.on('pageerror', error => errors.push('first-visit: ' + error.message));
    checkpoint('starting first-visit onboarding');
    await firstVisitPage.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await firstVisitPage.locator('#auth-dialog').waitFor({ state:'visible', timeout:7000 });
    assert.equal(await firstVisitPage.locator('#auth-continue-guest').isVisible(), true, 'a new visitor must be able to continue as a guest from the account gate');
    assert.equal(await firstVisitPage.locator('#account-welcome-modal').isVisible(), false, 'the legacy account welcome modal must remain unused');
    await firstVisitPage.locator('#auth-continue-guest').click();
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
    checkpoint('first-visit onboarding passed');

    const views = ['home','fluentia','stories','chronicle','resonance','world','thinklab','casebound','summon','words','trophies','progress','profile'];
    for (const view of views) {
      checkpoint('starting view ' + view);
      const page = await browser.newPage();
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(20000);
      checkpoint('view ' + view + ': page created; setting viewport');
      await page.setViewportSize({ width: 1280, height: 900 });
      const requested = [];
      const failedRequests = [];
      const badResponses = [];
      const pageErrors = [];
      const viewConsoleErrors = [];
      page.on('pageerror', error => { pageErrors.push(error.message); errors.push(view + ': ' + error.message); });
      page.on('console', message => { if (message.type() === 'error') { viewConsoleErrors.push(message.text()); consoleErrors.push(view + ': ' + message.text()); } });
      page.on('requestfailed', request => failedRequests.push({url:request.url(),failure:request.failure()?.errorText || 'unknown'}));
      page.on('response', response => { if (response.status() >= 400) badResponses.push({status:response.status(),url:response.url()}); });
      page.on('request', request => {
        try {
          const url = new URL(request.url());
          if (url.origin === baseUrl) requested.push(url.pathname);
        } catch {}
      });
      await page.addInitScript(() => {
        localStorage.setItem('epiphany-progress', JSON.stringify({placementDone:true,assessedLevel:'A1',level:'A1'}));
        localStorage.setItem('epiphany-landing-seen', '1');
        localStorage.setItem('epiphany-guest-mode-v2', '1');
      });
      checkpoint('view ' + view + ': navigating to app');
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      checkpoint('view ' + view + ': app document loaded; dismissing first-visit overlays');
      await dismissFirstVisitOverlays(page);
      checkpoint('view ' + view + ': overlays dismissed; waiting for navigation control');
      await page.waitForSelector('button[data-view="' + view + '"]', { state: 'attached', timeout: 10000 });
      const eagerDeferred = requested.filter(path => /\/(data-translation-ar|data-stories|data-world(?:-sprites)?|think-lab|practice-lab|life-skills|fluentia-textwise-bank|fluentia-soundscape-bank)\.js$/.test(path));
      assert.deepEqual(eagerDeferred, [], 'deferred files should not load at startup for ' + view);
      checkpoint('view ' + view + ': navigation control ready; opening view');
      await clickView(page, view);
      checkpoint('view ' + view + ': clickView completed; waiting for render');
      await page.waitForTimeout(350);
      checkpoint('view ' + view + ': render settle completed');
      if (view === 'home') {
        await page.waitForFunction(() => {
          const el = document.querySelector('#home-view');
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && Number(getComputedStyle(el).opacity) > 0.99;
        }, null, { timeout: 5000 }).catch(async error => {
          const state = await page.evaluate(() => {
            const home = document.querySelector('#home-view');
            const main = document.querySelector('#main');
            const ancestors = [];
            for (let node = home; node && ancestors.length < 5; node = node.parentElement) {
              const rect = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              ancestors.push({tag:node.tagName,id:node.id,className:node.className,display:style.display,visibility:style.visibility,opacity:style.opacity,width:rect.width,height:rect.height,hidden:node.hidden,inert:node.inert});
            }
            return {bodyClass:document.body.className,mainInert:main?.inert,placementHidden:document.querySelector('#placement')?.hidden,helpHidden:document.querySelector('#help-language-modal')?.hidden,welcomeHidden:document.querySelector('#account-welcome-modal')?.hidden,ancestors};
          });
          throw new Error('Home view did not become visible after navigation: ' + JSON.stringify(state) + '; ' + error.message);
        });
      }
      if (view !== 'world') {
        const target = page.locator('#' + view + '-view');
        checkpoint('view ' + view + ': waiting for target section attachment');
        await target.waitFor({ state: 'attached', timeout: 5000 }).catch(async error => {
          const diagnostics = await page.evaluate(({requestedView}) => ({
            url: location.href,
            readyState: document.readyState,
            title: document.title,
            bodyClass: document.body?.className || '',
            targetId: requestedView + '-view',
            targetExists: !!document.getElementById(requestedView + '-view'),
            viewIds: [...document.querySelectorAll('.view')].map(el => ({id:el.id,active:el.classList.contains('is-active'),hidden:el.hidden})),
            matchingButtons: [...document.querySelectorAll('button[data-view]')].filter(el => el.dataset.view === requestedView).map(el => ({text:el.textContent.trim(),visible:!!(el.getClientRects().length),ariaCurrent:el.getAttribute('aria-current'),parent:el.parentElement?.className || ''})),
            mainInert: document.querySelector('#main')?.inert,
            placementHidden: document.querySelector('#placement')?.hidden,
            overlays: ['landing','help-language-modal','account-welcome-modal'].map(id => ({id,exists:!!document.getElementById(id),hidden:document.getElementById(id)?.hidden ?? null})),
            lazyLoaderType: typeof window.EPIPHANY_LAZY_LOAD
          }), {requestedView:view});
          throw new Error(view + ' view was not attached after navigation: ' + JSON.stringify({diagnostics,requested,failedRequests,badResponses,pageErrors,consoleErrors:viewConsoleErrors}) + '; ' + error.message);
        });
        checkpoint('view ' + view + ': target section attached');
        if (view !== 'home') {
          checkpoint('view ' + view + ': checking active class');
          const isActive = await target.evaluate(el => el.classList.contains('is-active'));
          checkpoint('view ' + view + ': active class evaluated as ' + isActive);
          assert.equal(isActive, true, view + ' view should become active');
        }
      }
      if (view === 'fluentia') {
        const fluentia = page.locator('#fluentia-content');
        await fluentia.locator('#fluentia-title').waitFor({state:'visible',timeout:5000});
        await page.waitForFunction(() => {
          const engine = window.EPIPHANY_FLUENTIA_SESSION_ENGINE;
          return engine && ['soundscape-sound-maze','soundscape-dictation','real-world-speaking-shadowing','soundscape-sound-maze-history-review'].every(id => engine.getActivity(id));
        }, null, {timeout:5000});
        assert.ok(requested.some(path => path.endsWith('/sound-maze-content.js')), 'Fluentia should load Sound Maze content on its first open');
        assert.ok(requested.some(path => path.endsWith('/fluentia-textwise-bank.js')), 'Fluentia should load Textwise sequencing content on its first open');
        assert.ok(requested.some(path => path.endsWith('/fluentia-soundscape-bank.js')), 'Fluentia should load Soundscape dictation content on its first open');
        assert.ok(requested.some(path => path.endsWith('/fluentia-practice-bank.js')), 'Fluentia should load Practice Lab samples on its first open');
        assert.equal(await fluentia.locator('.fluentia-domain-card').count(),6,'Fluentia should render its six canonical domains');
        assert.equal(await fluentia.locator('[data-mode="section-mixed"]').count(),0,'Section Mixed should not appear on the Fluentia landing page');
        assert.equal(await fluentia.locator('[data-mode="fluentia-mix"]').count(),1,'Fluentia Mix should have one landing entry');
        assert.equal(await fluentia.locator('.fluentia-review-panel').count(),1,'Your Review should remain a separate destination');
        await fluentia.locator('.fluentia-domain-card[data-domain="wordcraft"]').click();
        await page.evaluate(() => window.dispatchEvent(new Event('epiphany:progress-saved')));
        assert.equal(await fluentia.locator('.fluentia-domain-intro h2').innerText(),'Wordcraft','a progress save must preserve the selected Wordcraft domain');
        await fluentia.locator('.fluentia-activity-card').first().waitFor({state:'visible',timeout:5000});
        await fluentia.locator('.fluentia-activity-card').first().click();
        const question = fluentia.locator('.fluentia-question-card');
        await question.waitFor({state:'visible',timeout:5000});
        assert.match(await question.locator('.kicker').innerText(),/Wordcraft/i,'single activity should retain its canonical domain');
        if (await question.locator('[data-answer-index]').count()) {
          await question.locator('[data-answer-index]').first().click();
        } else {
          const answerInput = question.locator('#fluentia-answer, #fluentia-match-meaning').first();
          await answerInput.fill('test answer');
          await question.locator('[data-submit]').click();
        }
        await question.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
        const history = await page.evaluate(() => window.__epiphanyReadProgress?.().fluentiaHistory || []);
        assert.ok(history.length > 0,'a Fluentia answer should be recorded through the existing progress bridge');
        assert.equal(history.at(-1).source,'fluentia','progress history should preserve Fluentia attribution');
        const translation = question.locator('[data-translate]');
        if (await translation.count()) {
          const explanation = question.locator('#fluentia-feedback p').first();
          const before = await explanation.innerText();
          await translation.click();
          assert.equal(await question.locator('[data-translate]').innerText(),'Show English','Arabic help should replace the explanation in place');
          await question.locator('[data-translate]').click();
          assert.equal(await explanation.innerText(),before,'returning to English should restore the same explanation slot');
        }
        await fluentia.locator('[data-exit]').click();
        await fluentia.locator('.fluentia-domain-intro h2').waitFor({state:'visible',timeout:5000});
        assert.equal(await fluentia.locator('.fluentia-domain-intro h2').innerText(),'Wordcraft','exiting an activity should return to its domain activity picker');
        const wordMatchActivity = fluentia.locator('[data-activity="wordcraft-word-match"]');
        await wordMatchActivity.waitFor({state:'visible',timeout:5000});
        await wordMatchActivity.click();
        const matchQuestion = fluentia.locator('.fluentia-question-card');
        await matchQuestion.locator('.fluentia-match-board').waitFor({state:'visible',timeout:5000});
        const visibleWordCount = await matchQuestion.locator('#fluentia-match-words [data-match-word]').count();
        const visibleMeaningCount = await matchQuestion.locator('#fluentia-match-meanings [data-match-meaning]').count();
        assert.ok(visibleWordCount >= 2 && visibleWordCount <= 4,'Word Match should present a valid 2–4 pair round; received '+visibleWordCount);
        assert.equal(visibleMeaningCount,visibleWordCount,'Word Match should present one meaning for every word in a separate shuffled column');
        assert.equal(await matchQuestion.locator('#fluentia-match-meaning').count(),0,'Word Match must not ask for typed meanings');
        const wordIds = await matchQuestion.locator('#fluentia-match-words [data-match-word]').evaluateAll(buttons=>buttons.map(button=>button.dataset.matchWord));
        for (const [index,id] of wordIds.entries()) {
          if (index % 2) {
            await matchQuestion.locator('[data-match-meaning="'+id+'"]').click();
            await matchQuestion.locator('[data-match-word="'+id+'"]').click();
          } else {
            await matchQuestion.locator('[data-match-word="'+id+'"]').click();
            await matchQuestion.locator('[data-match-meaning="'+id+'"]').click();
          }
        }
        assert.equal(await matchQuestion.locator('.fluentia-match-pair').count(),visibleWordCount,'all pairs should be assembled as independent matches');
        await matchQuestion.locator('.fluentia-match-pair [data-match-remove]').first().click();
        assert.equal(await matchQuestion.locator('.fluentia-match-pair').count(),visibleWordCount-1,'a selected pair should be removable before submission');
        const returnedWordId = await matchQuestion.locator('#fluentia-match-words [data-match-word]').getAttribute('data-match-word');
        await matchQuestion.locator('[data-match-word="'+returnedWordId+'"]').click();
        await matchQuestion.locator('[data-match-meaning="'+returnedWordId+'"]').click();
        assert.equal(await matchQuestion.locator('.fluentia-match-pair').count(),visibleWordCount,'a removed pair should be selectable again');
        await matchQuestion.locator('[data-submit]').click();
        await matchQuestion.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
        assert.match(await matchQuestion.locator('.fluentia-feedback').innerText(),/Correct/i,'the shared evaluator should accept the complete correct matching round');
        await fluentia.locator('[data-exit]').click();
        await fluentia.locator('[data-home-back]').click();
        for (const level of ['A1','A2','B1','B2','C1','C2']) {
          if (level !== 'A1') await fluentia.locator('#fluentia-level').selectOption(level);
          await fluentia.locator('.fluentia-domain-card[data-domain="soundscape"]').click();
          const pictureActivity = fluentia.locator('[data-activity="soundscape-sound-picture-match"]');
          await pictureActivity.waitFor({state:'visible',timeout:5000});
          await pictureActivity.click();
          const pictureChoices = question.locator('.fluentia-picture-choice');
          await pictureChoices.first().waitFor({state:'visible',timeout:5000});
          assert.equal(await pictureChoices.count(),4,level+' Sound & Picture Match should show four image choices');
          assert.deepEqual(await pictureChoices.evaluateAll(buttons=>buttons.map(button=>button.innerText.trim())),['','','',''],level+' picture choices must not display object names or any text');
          assert.deepEqual(await pictureChoices.evaluateAll(buttons=>buttons.map(button=>button.getAttribute('aria-label'))),['Picture option 1','Picture option 2','Picture option 3','Picture option 4'],'picture choices should keep neutral accessible labels');
          await page.waitForFunction(() => {
            const art = [...document.querySelectorAll('.fluentia-picture-choice .fluentia-picture-art')];
            return art.length === 4 && art.every(node => node.tagName === 'IMG' && node.getAttribute('src')?.includes('/openmoji@3e01de523ddefe9c5e46a7765b15efef04bf9002/color/svg/'));
          }, null, {timeout:5000});
          const imageSources = await pictureChoices.locator('.fluentia-picture-art').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')));
          assert.equal(new Set(imageSources).size,4,level+' picture choices should use four distinct vector illustrations');
          assert.ok(imageSources.every(src=>src.startsWith('https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@3e01de523ddefe9c5e46a7765b15efef04bf9002/color/svg/')),level+' picture choices should use the pinned OpenMoji artwork');
          await pictureChoices.first().click();
          await question.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
          await fluentia.locator('[data-exit]').click();
          await fluentia.locator('[data-home-back]').click();
        }
        await fluentia.locator('#fluentia-level').selectOption('A1');
        await fluentia.locator('.fluentia-domain-card[data-domain="sentence-studio"]').click();
        await fluentia.locator('[data-activity="sentence-studio-sentence-builder"]').click();
        await question.waitFor({state:'visible',timeout:5000});
        const wordTiles = question.locator('[data-order-token]');
        const wordTileCount = await wordTiles.count();
        const sentenceSource = await page.evaluate(() => {
          const adapter = window.EPIPHANY_FLUENTIA_SESSION_ENGINE?.getActivity('sentence-studio-sentence-builder');
          return {interactionType:adapter?.interactionType,items:adapter?.getItems({level:'A1'}).slice(0,2)};
        });
        assert.ok(wordTileCount >= 5,'Sentence Builder should provide selectable word tiles. Source='+JSON.stringify(sentenceSource)+' UI='+JSON.stringify(await question.innerText())+' HTML='+String(await question.innerHTML()).slice(0,1200));
        for (let index=0; index<wordTileCount; index++) await question.locator('[data-order-token="'+index+'"]').click();
        assert.equal(await question.locator('[data-order-remove]').count(),wordTileCount,'selected words should move into the answer sequence');
        await question.locator('[data-order-remove]').first().click();
        assert.equal(await question.locator('[data-order-token]').count(),1,'a placed word should be removable back to the bank');
        await question.locator('[data-order-token]').first().click();
        await question.locator('[data-submit]').click();
        await question.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
        await fluentia.locator('[data-exit]').click();
        await fluentia.locator('[data-home-back]').click();

        await fluentia.locator('.fluentia-domain-card[data-domain="textwise"]').click();
        await fluentia.locator('[data-activity="textwise-sequence"]').click();
        await question.waitFor({state:'visible',timeout:5000});
        assert.equal(await question.locator('.fluentia-order-context').count(),1,'Text Sequencing should show its informational context');
        const stepTiles = question.locator('[data-order-token]');
        const stepCount = await stepTiles.count();
        assert.ok(stepCount>=3,'Text Sequencing should provide reorderable step tiles');
        for (let index=0; index<stepCount; index++) await question.locator('[data-order-token="'+index+'"]').click();
        await question.locator('[data-submit]').click();
        await question.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
        await fluentia.locator('[data-exit]').click();
        await fluentia.locator('[data-home-back]').click();

        await fluentia.locator('.fluentia-domain-card[data-domain="real-world"]').click();
        await fluentia.locator('[data-activity="real-world-directions"]').click();
        await question.waitFor({state:'visible',timeout:5000});
        assert.equal(await question.locator('.fluentia-map-cell').count(),12,'Directions should render all twelve selectable town destinations');
        assert.equal(await question.locator('#fluentia-answer').count(),0,'Directions should no longer ask for typed coordinates');
        await question.locator('.fluentia-map-cell').first().click();
        assert.equal(await question.locator('.fluentia-map-cell.is-selected').count(),1,'the chosen destination should be visibly selected');
        await question.locator('[data-submit]').click();
        await question.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
        await fluentia.locator('[data-exit]').click();
        await fluentia.locator('[data-home-back]').click();
        assert.ok(requested.some(path=>path.endsWith('/fluentia-directions-bank.js')),'Fluentia should load the shared Directions map bank');
        assert.equal(await page.evaluate(() => window.EPIPHANY_DIRECTIONS_DATA?.items?.length),120,'the complete six-level Directions bank should be registered');
        assert.equal(await page.evaluate(() => window.EPIPHANY_FLUENTIA_SESSION_ENGINE.getActivity('real-world-directions').getItems({level:'A1'}).length),20,'Directions should expose its A1 items after lazy loading');
        await fluentia.locator('#fluentia-level').selectOption('C2');
        const domainCases = [
          ['wordcraft','Wordcraft'],['sentence-studio','Sentence Studio'],['textwise','Textwise'],
          ['soundscape','Soundscape'],['real-world','Real World'],['fine-sense','Fine Sense']
        ];
        for (const [domainId, domainName] of domainCases) {
          await fluentia.locator('.fluentia-domain-card[data-domain="'+domainId+'"]').click();
          await page.evaluate(() => window.dispatchEvent(new Event('epiphany:progress-saved')));
          assert.equal(await fluentia.locator('.fluentia-domain-intro h2').innerText(),domainName,'a progress save must preserve the '+domainName+' domain');
          assert.equal(await fluentia.locator('.fluentia-back').count(),1,'the selected domain should remain open after a progress save');
          await fluentia.locator('[data-home-back]').click();
          assert.equal(await fluentia.locator('#fluentia-level').inputValue(),'C2','background saves must preserve the learner-selected practice level');
        }
        await fluentia.locator('.fluentia-domain-card[data-domain="wordcraft"]').click();
                await fluentia.locator('[data-mode="section-mixed"]').click();
        await question.waitFor({state:'visible',timeout:5000});
        assert.match(await fluentia.locator('.fluentia-session-top .pill').innerText(),/Section Mixed/i,'Section Mixed should start inside the chosen domain');
        assert.match(await question.locator('.kicker').innerText(),/Wordcraft/i,'Section Mixed must not leak into another domain');
        await fluentia.locator('[data-exit]').click();
        await fluentia.locator('[data-home-back]').click();
        await fluentia.locator('[data-mode="fluentia-mix"]').click();
        await question.waitFor({state:'visible',timeout:5000});
        assert.match(await fluentia.locator('.fluentia-session-top .pill').innerText(),/Fluentia Mix/i,'Fluentia Mix should start from the landing page');
        const mixedKicker = await question.locator('.kicker').innerText();
        assert.match(mixedKicker,/Wordcraft|Sentence Studio|Textwise|Soundscape|Real World|Fine Sense/i,'Fluentia Mix should present a question with a canonical domain');
        await fluentia.locator('[data-exit]').click();
        // Fluentia Mix exits directly to the hub because it has no selected domain.
        // Full Fluentia interaction matrix: every canonical domain at every CEFR level.
        // The selected response is deliberately varied by interaction type so the test
        // verifies real controls and feedback, not only engine eligibility.
        for (const level of ['A1','A2','B1','B2','C1','C2']) {
          await fluentia.locator('#fluentia-level').selectOption(level);
          for (const [domainId, domainName] of domainCases) {
            await fluentia.locator('.fluentia-domain-card[data-domain="'+domainId+'"]').click();
            await fluentia.locator('[data-mode="section-mixed"]').click();
            await question.waitFor({state:'visible',timeout:5000});
            assert.match(await fluentia.locator('.fluentia-session-top .pill').innerText(),new RegExp(level),'Section Mixed should retain '+level);
            const questionKicker = await question.locator('.kicker').innerText();
            assert.ok(questionKicker.toLocaleLowerCase().includes(domainName.toLocaleLowerCase()),domainName+' should remain the selected domain at '+level+': '+questionKicker);

            const matchWords = question.locator('[data-match-word]');
            const orderTokens = question.locator('[data-order-token]');
            const mapCells = question.locator('[data-map-cell]');
            const speechTranscript = question.locator('#fluentia-speech-transcript');
            const answerInput = question.locator('#fluentia-answer');
            const answerChoices = question.locator('[data-answer-index]');

            if (await matchWords.count()) {
              const ids = await matchWords.evaluateAll(buttons=>buttons.map(button=>button.dataset.matchWord));
              for (const id of ids) {
                await question.locator('[data-match-word="'+id+'"]').click();
                await question.locator('[data-match-meaning="'+id+'"]').click();
              }
              await question.locator('[data-submit]').click();
            } else if (await orderTokens.count()) {
              const count = await orderTokens.count();
              for (let index=0; index<count; index++) await question.locator('[data-order-token]').first().click();
              await question.locator('[data-submit]').click();
            } else if (await mapCells.count()) {
              await mapCells.first().click();
              await question.locator('[data-submit]').click();
            } else if (await speechTranscript.count()) {
              await speechTranscript.fill('A practice transcript.');
              await question.locator('[data-submit]').click();
            } else if (await answerChoices.count()) {
              await answerChoices.first().click();
            } else if (await answerInput.count()) {
              await answerInput.fill('A practice response.');
              await question.locator('[data-submit]').click();
            } else {
              throw new Error(domainName+' '+level+' rendered no supported answer control: '+await question.innerText());
            }
            await question.locator('.fluentia-feedback').waitFor({state:'visible',timeout:5000});
            await fluentia.locator('[data-exit]').click();
            await fluentia.locator('[data-home-back]').click();
          }
        }
        await fluentia.locator('#fluentia-level').selectOption('A1');
        await page.setViewportSize({width:390,height:844});
        const layout = await fluentia.evaluate(el => ({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,cardCount:el.querySelectorAll('.fluentia-domain-card').length}));
        assert.ok(layout.scrollWidth <= layout.clientWidth + 1,'Fluentia landing should not overflow horizontally on a phone: '+JSON.stringify(layout));
        assert.equal(layout.cardCount,6,'all six domains should remain available on mobile');
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
      if (view === 'thinklab') {
        checkpoint('thinklab: checking deferred module requests');
        assert.equal(requested.some(path => path.endsWith('/odd-one-out-bank.js')), false, 'Odd One Out answer bank must never be sent to the browser');
        assert.equal(await page.evaluate(() => typeof window.EPIPHANY_ODD_ONE_OUT_BANK), 'undefined', 'no browser-side Odd One Out bank should be exposed');
        assert.equal(await page.evaluate(() => typeof window.EpiphanyAuth?.getGuestValidatorClient), 'function', 'guest Odd One Out must use the server validator client');
        await page.locator('#think-lab-content .tl-mission').waitFor({state:'visible',timeout:10000});
        assert.ok(requested.some(path => path.endsWith('/think-lab.js')), 'Think Lab should load on first open after its landing interface is ready');
        checkpoint('thinklab: modules requested; checking the daily challenge entry');
        const dailyCard = page.locator('#thinklab-view .tl-daily-challenge');
        await dailyCard.waitFor({state:'visible',timeout:5000});
        assert.equal(await dailyCard.locator('[data-think-daily]').isEnabled(),true,'an eligible daily challenge should be available');
        await dailyCard.locator('[data-think-daily]').click();
        await page.locator('#thinklab-view [data-think-home]').waitFor({state:'visible',timeout:5000});
        assert.equal(await page.locator('#thinklab-view .tl-game-card').count(),1,'the daily challenge should open a real Think Lab game');
        await page.locator('#thinklab-view [data-think-home]').click();
        assert.match(await page.locator('#thinklab-view .tl-daily-challenge').innerText(),/Continue challenge/i,'an unfinished daily challenge should remain resumable');
        checkpoint('thinklab: daily challenge entry and resume state verified');
        checkpoint('thinklab: opening Odd One Out');
        await page.locator('#thinklab-view [data-think-game="odd"]').click();
        checkpoint('thinklab: Odd One Out selected; waiting for mode picker');
        const modePicker = page.locator('#thinklab-view .tl-mode-picker');
        await modePicker.waitFor({state:'visible',timeout:5000});
        checkpoint('thinklab: mode picker visible; checking three modes');
        assert.equal(await modePicker.locator('[data-think-training-mode]').count(), 3, 'Think Lab must offer Guided, Steady and Challenge before a round starts');
        for (const trainingMode of ['guided','steady','challenge']) {
          assert.equal(await modePicker.locator('[data-think-training-mode="'+trainingMode+'"]').isVisible(), true, trainingMode+' mode should be selectable');
        }
        let guestStartRequest = null;
        let guestAnswerRequest = null;
        await page.route('**/functions/v1/velorn-think-lab-validator', async route => {
          if (route.request().method() === 'OPTIONS') {
            await route.fulfill({status:204,headers:{
              'Access-Control-Allow-Origin':'*',
              'Access-Control-Allow-Methods':'POST, OPTIONS',
              'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info'
            }});
            return;
          }
          const requestBody = route.request().postDataJSON();
          if (requestBody.action === 'answer') {
            guestAnswerRequest = requestBody;
            await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
              correct:false,
              correctIndex:3,
              explanation:'Screwdriver is a tool, while the other three are fruits.',
              hint:'Three words name fruit.',
              relationship:'Category',
              completed:false
            })});
            return;
          }
          guestStartRequest = requestBody;
          const questions = Array.from({length:8},(_,i)=>({
            id:'A1-CAT-'+String(i+1).padStart(2,'0'),
            words:['apple','pear','plum','screwdriver'],
            relationship:'category',
            hint:'Three words name fruit.',
            context:'Fruit category',
            cefrLevel:'A1',
            trainingMode:'guided'
          }));
          await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
            sessionId:'00000000-0000-4000-8000-000000000001',
            guestToken:'a'.repeat(64),
            validatorVersion:'odd-one-out-rotated-20261110-v2',
            level:'A1',
            trainingMode:'guided',
            questions
          })});
        });
        checkpoint('thinklab: guest validator mock installed');
        checkpoint('thinklab: selecting Guided mode');
        await modePicker.locator('[data-think-training-mode="guided"]').click();
        checkpoint('thinklab: Guided selected; waiting for game card');
        await modePicker.waitFor({state:'hidden',timeout:15000});
        checkpoint('thinklab: mode picker closed; waiting for server-backed guest round');
        await page.waitForFunction(() => {
          const view = document.querySelector('#thinklab-view');
          const text = view?.innerText || '';
          return text.includes('Which word does not belong?') || text.includes('Secure challenge unavailable');
        }, null, {timeout:15000});
        const gameCard = page.locator('#thinklab-view .tl-game-card').filter({hasText:'Which word does not belong?'});
        if (!(await gameCard.count())) {
          const failureText = await page.locator('#thinklab-view').innerText();
          assert.fail('Guest validator did not prepare Odd One Out: ' + failureText);
        }
        await gameCard.waitFor({state:'visible',timeout:5000});
        checkpoint('thinklab: server-backed game card visible; validating prompt and choices');
        assert.deepEqual(guestStartRequest,{action:'start',gameId:'odd_one_out',level:'A1',trainingMode:'guided'},'guest start must send only the selected level and training mode');
        assert.equal(await gameCard.locator('h2').innerText(), 'Which word does not belong?', 'Odd One Out must render its question prompt after the guest validator responds');
        assert.equal(await gameCard.locator('[data-think-answer]').count(), 4, 'Odd One Out must render four answer choices');
        assert.match(await gameCard.locator('.tl-game-kicker').innerText(), /PATTERN ANALYSIS · A1/);
        assert.match(await gameCard.locator('.tl-game-instruction').first().innerText(), /relationship/i);
        const screenshotDir = path.join(root, 'test-results', 'odd-one-out');
        fs.mkdirSync(screenshotDir, {recursive:true});
        checkpoint('thinklab: capturing desktop question screenshot');
        await gameCard.screenshot({path:path.join(screenshotDir,'desktop-guided-question.png')});
        checkpoint('thinklab: screenshot captured; opening hint');
        await gameCard.locator('[data-odd-hint]').click();
        assert.equal(await gameCard.locator('[data-odd-hint-text]').isVisible(), true, 'Guided mode should reveal its item-specific hint');
        assert.ok((await gameCard.locator('[data-odd-hint-text]').innerText()).trim().length > 10);
        checkpoint('thinklab: hint verified; submitting first answer');
        await gameCard.locator('[data-think-answer]').first().click();
        checkpoint('thinklab: answer submitted; waiting for server verification feedback');
        await gameCard.locator('#tl-feedback').waitFor({state:'visible',timeout:5000});
        checkpoint('thinklab: server feedback visible; checking result');
        assert.equal(await gameCard.locator('#tl-feedback').isVisible(), true, 'a verified answer should reveal feedback');
        const feedbackState = await gameCard.locator('#tl-feedback').evaluate(el => ({text:el.textContent,html:el.innerHTML,hidden:el.hidden,className:el.className}));
        assert.match(feedbackState.text, /Relationship:/, 'feedback should identify the shared relationship: ' + JSON.stringify(feedbackState));
        assert.deepEqual(guestAnswerRequest,{action:'answer',gameId:'odd_one_out',sessionId:'00000000-0000-4000-8000-000000000001',questionIndex:0,selectedIndex:0,guestToken:'a'.repeat(64)},'guest answer must be verified with the in-memory session token');
        assert.equal(await gameCard.locator('[data-think-next]').isVisible(), true, 'feedback should unlock the next question');
        checkpoint('thinklab: feedback verified; advancing to next question');
        await gameCard.locator('[data-think-next]').click();
        checkpoint('thinklab: next question rendered; switching to mobile viewport');
        assert.equal(await gameCard.locator('h2').innerText(), 'Which word does not belong?');
        await page.setViewportSize({width:390,height:844});
        await gameCard.screenshot({path:path.join(screenshotDir,'mobile-guided-question.png')});
        assert.equal(await gameCard.locator('[data-think-answer]').count(), 4, 'all four choices must remain available on mobile');
        assert.equal(await gameCard.locator('[data-think-answer]').first().isVisible(), true, 'the first answer must remain visible on mobile');
        checkpoint('thinklab: mobile question checks passed');

        checkpoint('thinklab: returning to game list to open Sound Maze');
        await page.locator('#thinklab-view [data-think-back]').click();
        await page.locator('#thinklab-view [data-think-back]').click();
        await page.setViewportSize({width:1280,height:900});
        assert.equal(await page.locator('#thinklab-view [data-think-game="maze"]').isVisible(), true,
          'The Sound Maze should be available from the Think Lab list');
        await page.locator('#thinklab-view [data-think-game="maze"]').click();
        const mazeModePicker = page.locator('#thinklab-view .tl-mode-picker');
        await mazeModePicker.waitFor({state:'visible',timeout:5000});
        await mazeModePicker.locator('[data-think-training-mode="guided"]').click();
        const mazeLevelPicker = page.locator('#thinklab-view [data-sound-maze-level]');
        await mazeLevelPicker.first().waitFor({state:'visible',timeout:5000});
        assert.equal(await mazeLevelPicker.count(), 6, 'Sound Maze should offer all six CEFR levels');
        await page.locator('#thinklab-view [data-sound-maze-level="A1"]').click();
        const mazeCard = page.locator('#thinklab-view .tl-game-card');
        await mazeCard.waitFor({state:'visible',timeout:5000});
        checkpoint('thinklab: Sound Maze round opened; checking the real question bank');
        assert.ok(requested.some(path => path.endsWith('/sound-maze-content.js')),
          'the reviewed Sound Maze content bank should load with Think Lab');
        assert.match(await mazeCard.locator('.tl-game-kicker').innerText(), /LISTENING MAZE · A1/);
        assert.equal(await mazeCard.locator('.tl-maze-target').count(), 1,
          'Sound Maze should show its listening prompt and replay control');
        assert.equal(await mazeCard.locator('[data-think-answer]').count(), 4,
          'Sound Maze should render four spelling choices');
        const mazeChoices = await mazeCard.locator('[data-think-answer]').allInnerTexts();
        assert.equal(new Set(mazeChoices.map(value => value.replace(/^\s*[A-D]\s*/, '').trim().toLowerCase())).size, 4,
          'Sound Maze choices should be distinct');
        await mazeCard.locator('[data-think-answer]').first().click();
        assert.equal(await mazeCard.locator('#tl-feedback').isVisible(), true,
          'answering a Sound Maze question should reveal educational feedback');
        assert.match(await mazeCard.locator('#tl-feedback').innerText(), /Target word:/,
          'Sound Maze feedback should identify the spoken target after the answer');
        assert.equal(await mazeCard.locator('[data-think-next]').isVisible(), true,
          'Sound Maze feedback should unlock the next question');
        checkpoint('thinklab: Sound Maze content, choices and feedback verified');

        checkpoint('thinklab: returning to the game list to open Word Forge');
        await page.locator('#thinklab-view [data-think-back]').first().click();
        await page.locator('#thinklab-view [data-think-back]').click();
        await page.locator('#thinklab-view [data-think-back]').click();
        let forgeStartRequest = null;
        const forgeAnswerRequests = [];
        const forgeSessionId = '00000000-0000-4000-8000-000000000024';
        const forgeGuestToken = 'b'.repeat(64);
        await page.route('**/functions/v1/velorn-think-lab-validator', async route => {
          if (route.request().method() === 'OPTIONS') {
            await route.fulfill({status:204,headers:{
              'Access-Control-Allow-Origin':'*',
              'Access-Control-Allow-Methods':'POST, OPTIONS',
              'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info'
            }});
            return;
          }
          const requestBody = route.request().postDataJSON();
          if (requestBody.action === 'answer') {
            forgeAnswerRequests.push(requestBody);
            const questionIndex=requestBody.questionIndex;
            await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
              correct:true,correctAnswer:'apple',
              explanation:'An apple is a common fruit that grows on an apple tree.',
              skill:'Food vocabulary',questionIndex,attemptsRemaining:2,
              advance:true,completed:questionIndex===23,nextIndex:questionIndex+1,correctCount:questionIndex+1
            })});
            return;
          }
          forgeStartRequest = requestBody;
          const questions = Array.from({length:24},(_,i)=>({
            id:'WF-G-'+String(i+1).padStart(3,'0'),
            clue:i===0?'A fruit that is often red or green and grows on a tree.':'A reviewed Word Forge practice clue for question '+(i+1)+'.',
            letters:'PPLAE',
            prompt:'Forge the word from the letter tiles.'
          }));
          await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
            sessionId:forgeSessionId,guestToken:forgeGuestToken,
            validatorVersion:'word-forge-reviewed-72-20261111-v1',
            trainingMode:'guided',questions
          })});
        });
        const forgeLaunch = page.locator('#thinklab-view [data-think-game="forge"]');
        await forgeLaunch.waitFor({state:'visible',timeout:5000});
        await forgeLaunch.click();
        const forgeModePicker = page.locator('#thinklab-view .tl-mode-picker');
        await forgeModePicker.waitFor({state:'visible',timeout:5000});
        await forgeModePicker.locator('[data-think-training-mode="guided"]').click();
        const forgeCard = page.locator('#thinklab-view .tl-game-card');
        await forgeCard.waitFor({state:'visible',timeout:5000});
        await forgeCard.locator('.tl-game-actions').waitFor({state:'visible',timeout:5000});
        checkpoint('thinklab: Word Forge loaded its server-approved session');
        assert.ok(requested.some(path => path.endsWith('/word-forge-bank.js')),
          'Word Forge prompt metadata should load on demand with Think Lab');
        const publicForgeAudit = await page.evaluate(() => {
          const bank=window.EPIPHANY_WORD_FORGE_BANK;
          const rounds=['guided','steady','challenge'].flatMap(mode => bank.getRounds(mode));
          return {
            valid:bank.validateBank().valid,
            total:rounds.length,
            containsPrivateFields:rounds.some(round => 'answerWord' in round || 'explain' in round || 'skill' in round)
          };
        });
        assert.equal(publicForgeAudit.valid,true,
          'the public Word Forge prompt metadata should validate');
        assert.equal(publicForgeAudit.total,72,'the browser should receive the 72 reviewed prompt records');
        assert.equal(publicForgeAudit.containsPrivateFields,false,
          'answer keys, explanations and skill labels must remain server-only');
        assert.deepEqual(forgeStartRequest,{action:'start',gameId:'word_forge',trainingMode:'guided'},
          'Word Forge start must send only the selected training mode');
        assert.match(await forgeCard.locator('.tl-game-actions').innerText(), /ROUND 1 OF 24/);
        assert.equal(await forgeCard.locator('[data-forge-tile]').count(),5,
          'Word Forge should render the server-issued letter tiles');
        assert.equal(await forgeCard.locator('[data-forge-slot]').count(),5,
          'Word Forge should render answer slots');
        assert.equal(await forgeCard.locator('[data-training-hint]').count(),1,
          'Guided Word Forge should provide its training hint');
        assert.match(await forgeCard.locator('.tl-word-clue p').innerText(),/fruit.*red or green/i);
        for (let questionIndex=0;questionIndex<24;questionIndex++) {
          if(questionIndex>0) await forgeCard.locator('[data-think-next]').click();
          for (const letter of 'APPLE') {
            await forgeCard.locator('[data-forge-tile]:not(:disabled)').filter({hasText:letter}).first().click();
          }
          assert.equal(await forgeCard.locator('[data-forge-slot].is-filled').count(),5,
            'each answer letter should occupy one slot in question '+questionIndex);
          await forgeCard.locator('[data-forge-check]').click();
          await forgeCard.locator('#tl-feedback').waitFor({state:'visible',timeout:5000});
          if(questionIndex===0) {
            assert.match(await forgeCard.locator('#tl-feedback').innerText(), /Skill:.*Food vocabulary/s,
              'successful server feedback should identify the vocabulary skill');
          }
          assert.equal(await forgeCard.locator('[data-think-next]').isVisible(),true,
            'a verified answer should unlock the next challenge');
        }
        assert.equal(forgeAnswerRequests.length,24,'the UI must submit every challenge to the trusted validator');
        assert.deepEqual(forgeAnswerRequests.map(request=>request.questionIndex),Array.from({length:24},(_,i)=>i),
          'Word Forge must submit question indices in strict sequential order');
        assert.ok(forgeAnswerRequests.every(request=>request.action==='answer'&&request.gameId==='word_forge'&&request.sessionId===forgeSessionId&&request.guestToken===forgeGuestToken&&request.answerWord==='apple'),
          'every answer must use the same server session, in-memory guest token and submitted word');
        await forgeCard.locator('[data-think-next]').click();
        await page.locator('#thinklab-view .tl-finish').waitFor({state:'visible',timeout:5000});
        assert.match(await page.locator('#thinklab-view .tl-finish').innerText(),/You solved 24 of 24 challenges/,
          'the UI should reach the finish screen only after the server confirms the 24th answer');

        checkpoint('thinklab: complete 24-question Word Forge session, ordered server checks and final completion verified');

        const chainSessionId = '00000000-0000-4000-8000-000000000025';
        const chainGuestToken = 'c'.repeat(64);
        let chainStartRequest = null;
        const chainAnswerRequests = [];
        let chainPrivateRound = [];
        await page.route('**/functions/v1/velorn-think-lab-validator', async route => {
          const request = route.request();
          if (request.method() === 'OPTIONS') return route.fallback();
          const requestBody = request.postDataJSON();
          if (requestBody.gameId !== 'chain_reaction') return route.fallback();
          if (requestBody.action === 'answer') {
            chainAnswerRequests.push(requestBody);
            const question = chainPrivateRound[requestBody.questionIndex];
            const link = question.links[requestBody.linkIndex];
            const correct = requestBody.selectedIndex === link.answer;
            const finalLink = requestBody.linkIndex === 2;
            await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
              correct,
              questionIndex:requestBody.questionIndex,
              linkIndex:requestBody.linkIndex,
              nextLinkIndex:correct?(finalLink?0:requestBody.linkIndex+1):requestBody.linkIndex,
              nextIndex:requestBody.questionIndex+(correct&&finalLink?1:0),
              challengeCompleted:correct&&finalLink,
              completed:correct&&finalLink&&requestBody.questionIndex===23,
              ...(correct?{nextWord:link.to,explanation:link.explanation}:{})
            })});
            return;
          }
          chainStartRequest = requestBody;
          chainPrivateRound = chainReactionBank.selectRound('guided',()=>0);
          const questions = chainPrivateRound.map(question=>({
            id:question.id,title:question.title,start:question.start,
            links:question.links.map(link=>({from:link.from,options:link.options.slice()}))
          }));
          await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
            sessionId:chainSessionId,guestToken:chainGuestToken,
            validatorVersion:'chain-reaction-72-20261112-v1',
            trainingMode:'guided',daily:false,questions
          })});
        });
        await page.locator('#thinklab-view [data-think-back]').first().click();
        await page.locator('#thinklab-view [data-think-game="chain"]').waitFor({state:'visible',timeout:5000});
        await page.locator('#thinklab-view [data-think-game="chain"]').click();
        const chainModePicker = page.locator('#thinklab-view .tl-mode-picker');
        await chainModePicker.waitFor({state:'visible',timeout:5000});
        await chainModePicker.locator('[data-think-training-mode="guided"]').click();
        const chainCard = page.locator('#thinklab-view .tl-game-card');
        await chainCard.waitFor({state:'visible',timeout:5000});
        assert.equal(requested.some(path => path.endsWith('/chain-reaction-bank.js')), false,
          'the private Chain Reaction answer bank must not load in the browser');
        assert.equal(await page.evaluate(() => typeof window.EPIPHANY_CHAIN_REACTION_BANK), 'undefined',
          'the browser must not receive the private Chain Reaction answer bank');
        assert.deepEqual(chainStartRequest,{action:'start',gameId:'chain_reaction',trainingMode:'guided'},
          'Chain Reaction start must send only the selected training mode');
        assert.match(await chainCard.locator('.tl-game-actions').innerText(), /ROUND 1 OF 24/);
        assert.match(await chainCard.locator('.tl-connection-count').innerText(), /LINK 1 OF 3/);
        const chainTitle = await chainCard.locator('h2').innerText();
        const chainChallenge = chainPrivateRound.find(item => item.title === chainTitle);
        assert.ok(chainChallenge, 'the displayed chain title should map to an approved challenge');
        for (let step = 0; step < 3; step++) {
          const link = chainChallenge.links[step];
          await chainCard.locator('[data-chain-answer]').filter({hasText:link.to}).click();
          await chainCard.locator('#tl-feedback').waitFor({state:'visible',timeout:5000});
          await chainCard.locator('#tl-feedback').getByText(link.explanation, {exact:false}).waitFor({state:'visible',timeout:5000});
          if (step < 2) assert.match(await chainCard.locator('.tl-connection-count').innerText(), new RegExp('LINK ' + (step + 2) + ' OF 3'));
        }
        assert.match(await chainCard.locator('#tl-feedback').innerText(), /Chain complete!/);
        const completedChainPath = await chainCard.locator('.tl-chain-path').innerText();
        assert.ok(completedChainPath.includes(chainChallenge.start) && completedChainPath.includes(chainChallenge.links[2].to),
          'the completed path should display the start and all three answers');
        assert.doesNotMatch(completedChainPath, /\?/,
          'the completed path should no longer end with an unanswered marker');
        assert.equal(await chainCard.locator('[data-think-next]').isVisible(), true,
          'completing all three links should unlock the next challenge');
        assert.equal(chainAnswerRequests.length,3,'the UI must submit each Chain Reaction link to the trusted validator');
        assert.deepEqual(chainAnswerRequests.map(request=>request.linkIndex),[0,1,2],
          'Chain Reaction links must be submitted in strict sequence');
        assert.ok(chainAnswerRequests.every(request=>request.action==='answer'&&request.gameId==='chain_reaction'&&
          request.sessionId===chainSessionId&&request.guestToken===chainGuestToken&&request.questionIndex===0),
          'every Chain Reaction answer must use the same server session and in-memory guest token');
        assert.deepEqual(chainAnswerRequests.map(request=>request.selectedIndex),chainChallenge.links.map(link=>link.answer),
          'the UI must submit the selected option index, not a client-supplied answer key');
        checkpoint('thinklab: Chain Reaction three-link path, server validation and answer-key isolation verified');

        await page.locator('#thinklab-view [data-think-back]').first().click();
        await page.locator('#thinklab-view [data-think-back]').click();

        const sentenceSessionId = '00000000-0000-4000-8000-000000000026';
        const sentenceGuestToken = 'd'.repeat(64);
        let sentenceStartRequest = null;
        const sentenceAnswerRequests = [];
        let sentencePrivateRound = [];
        await page.route('**/functions/v1/velorn-think-lab-validator', async route => {
          const request = route.request();
          if (request.method() === 'OPTIONS') return route.fallback();
          const requestBody = request.postDataJSON() || {};
          if (requestBody.gameId !== 'sentence_scramble') return route.fallback();
          if (requestBody.action === 'answer') {
            sentenceAnswerRequests.push(requestBody);
            const question = sentencePrivateRound[requestBody.questionIndex];
            const attempt = requestBody.tileOrder.map(tile => question.words[tile]).join(' ');
            const normalize = value => {
        const slash = String.fromCharCode(92);
        return String(value).toLowerCase()
          .replace(new RegExp("[^" + slash + "p{L}" + slash + "p{N}" + slash + "s]","gu"),"")
          .replace(new RegExp(slash + "s+","g")," ").trim();
      };
            const correct = [question.sentence,...question.acceptedAnswers].some(answer => normalize(answer) === normalize(attempt));
            await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
              correct,questionIndex:requestBody.questionIndex,nextIndex:requestBody.questionIndex+(correct?1:0),
              completed:correct&&requestBody.questionIndex===sentencePrivateRound.length-1,
              ...(correct?{sentence:question.sentence,explanation:question.explanation,skill:question.skill}:{})
            })});
            return;
          }
          sentenceStartRequest = requestBody;
          sentencePrivateRound = sentenceScrambleBank.modes[requestBody.trainingMode].map(question=>({
            ...question,words:question.sentence.split(' ').reverse()
          }));
          const questions = sentencePrivateRound.map(question=>({id:question.id,prompt:question.prompt,words:question.words.slice()}));
          await route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({
            sessionId:sentenceSessionId,guestToken:sentenceGuestToken,
            validatorVersion:'sentence-scramble-72-20261112-v1',
            trainingMode:requestBody.trainingMode,daily:false,questions
          })});
        });
        await page.locator('#thinklab-view [data-think-game="scramble"]').click();
        const sentenceModePicker = page.locator('#thinklab-view .tl-mode-picker');
        await sentenceModePicker.waitFor({state:'visible',timeout:5000});
        await sentenceModePicker.locator('[data-think-training-mode="guided"]').click();
        const sentenceCard = page.locator('#thinklab-view .tl-game-card');
        await sentenceCard.waitFor({state:'visible',timeout:5000});
        assert.equal(requested.some(path => path.endsWith('/sentence-scramble-bank.js')), false,
          'the private Sentence Scramble answer bank must not load in the browser');
        assert.equal(await page.evaluate(() => typeof window.EPIPHANY_SENTENCE_SCRAMBLE_BANK), 'undefined',
          'the browser must not receive the private Sentence Scramble answer bank');
        assert.deepEqual(sentenceStartRequest,{action:'start',gameId:'sentence_scramble',trainingMode:'guided'},
          'Sentence Scramble start must send only the selected training mode');
        assert.match(await sentenceCard.locator('.tl-game-actions').innerText(),/ROUND 1 OF 24/);
        const sentenceChallenge = sentencePrivateRound[0];
        const remainingTiles = sentenceChallenge.words.map((_,index)=>index);
        const correctTileOrder = sentenceChallenge.sentence.split(' ').map(word=>{
          const tile = remainingTiles.find(index=>sentenceChallenge.words[index]===word);
          assert.notEqual(tile,undefined,'each canonical sentence token must have one server-issued tile');
          remainingTiles.splice(remainingTiles.indexOf(tile),1);
          return tile;
        });
        const wrongTileOrder = correctTileOrder.slice().reverse();
        for(const tile of wrongTileOrder) await sentenceCard.locator('[data-scramble-tile="'+tile+'"]').click();
        await sentenceCard.locator('[data-scramble-check]').click();
        await sentenceCard.locator('#tl-feedback').waitFor({state:'visible',timeout:5000});
        assert.equal((await sentenceCard.locator('#tl-feedback').innerText()).includes(sentenceChallenge.sentence),false,
          'a wrong tile order must not reveal the canonical sentence');
        await sentenceCard.locator('[data-scramble-reset]').click();
        for(const tile of correctTileOrder) await sentenceCard.locator('[data-scramble-tile="'+tile+'"]').click();
        await sentenceCard.locator('[data-scramble-check]').click();
        await sentenceCard.locator('#tl-feedback').getByText(sentenceChallenge.sentence,{exact:false}).waitFor({state:'visible',timeout:5000});
        assert.match(await sentenceCard.locator('#tl-feedback').innerText(),/Sentence built!/);
        assert.equal(sentenceAnswerRequests.length,2,'the UI must submit wrong and correct tile orders to the trusted validator');
        assert.deepEqual(sentenceAnswerRequests.map(request=>request.tileOrder),[wrongTileOrder,correctTileOrder],
          'the client must submit tile indices, never a client-computed sentence answer');
        assert.ok(sentenceAnswerRequests.every(request=>request.action==='answer'&&request.gameId==='sentence_scramble'&&
          request.sessionId===sentenceSessionId&&request.guestToken===sentenceGuestToken&&request.questionIndex===0),
          'every Sentence Scramble answer must use the same server session and in-memory guest token');
        checkpoint('thinklab: Sentence Scramble server validation, retry and answer-key isolation verified');

        await page.locator('#thinklab-view [data-think-back]').first().click();
        await page.locator('#thinklab-view [data-think-back]').click();
        await page.locator('#thinklab-view [data-think-game="codebreaker"]').click();
        assert.ok(requested.some(path => path.endsWith('/codebreaker-bank.js')),
          'Codebreaker bank should load on demand with Think Lab');
        assert.ok(requested.some(path => path.endsWith('/codebreaker.js')),
          'Codebreaker engine should load on demand with Think Lab');
        assert.equal(await page.evaluate(() => window.EPIPHANY_CODEBREAKER_BANK.validateBank().valid), true,
          'the complete Codebreaker bank should validate in the browser');
        await page.locator('#thinklab-view [data-cb-level="easy"]').click();
        const codebreaker = page.locator('#thinklab-view .cb-panel');
        await codebreaker.locator('[data-cb-symbol="J"]').first().click();
        await codebreaker.locator('[data-cb-plain="L"]').click();
        await codebreaker.locator('[data-cb-symbol="S"]').first().click();
        await codebreaker.locator('[data-cb-plain="E"]').click();
        await codebreaker.locator('[data-cb-check]').click();
        await codebreaker.getByText('Message decoded!', {exact:false}).waitFor({state:'visible',timeout:5000});
        assert.match(await codebreaker.innerText(), /APPLE/);
        checkpoint('thinklab: Codebreaker key assignment and message validation verified');

        await page.locator('#thinklab-view [data-cb-levels]').click();
        await page.locator('#thinklab-view [data-cb-home]').click();
        await page.locator('#thinklab-view [data-think-game="lettergrid"]').click();
        assert.ok(requested.some(path => path.endsWith('/letter-grid-bank.js')),
          'Letter Grid bank should load on demand with Think Lab');
        assert.ok(requested.some(path => path.endsWith('/letter-grid.js')),
          'Letter Grid engine should load on demand with Think Lab');
        assert.equal(await page.evaluate(() => window.EPIPHANY_LETTER_GRID_BANK.validateBank().valid), true,
          'the complete Letter Grid bank should validate in the browser');
        await page.locator('#thinklab-view [data-lg-level="easy"]').click();
        const firstTarget = await page.evaluate(() => window.EPIPHANY_LETTER_GRID_BANK.puzzles.easy[0].words[0]);
        await page.locator('#thinklab-view [data-lg-clue="' + firstTarget.id + '"]').click();
        for (const cell of firstTarget.path) {
          await page.locator('#thinklab-view [data-lg-cell="' + cell + '"]').click();
        }
        await page.locator('#thinklab-view .lg-clue.is-found').waitFor({state:'visible',timeout:5000});
        checkpoint('thinklab: Letter Path clue selection and straight-line search verified');


      }
      if (view === 'casebound') {
        assert.ok(requested.some(path => path.endsWith('/language-detective-assessment-schemas.js')), 'CASEBOUND schemas should load on first open');
        assert.ok(requested.some(path => path.endsWith('/language-detective-investigation.js')), 'CASEBOUND investigation session model should load on first open');
        assert.ok(requested.some(path => path.endsWith('/language-detective-cefr-patterns.js')), 'CASEBOUND CEFR profiles should load on first open');
        assert.ok(requested.some(path => path.endsWith('/language-detective-assessment-engine.js')), 'CASEBOUND assessment engine should load on first open');
        assert.ok(requested.some(path => path.endsWith('/language-detective-assessment-fixtures.js')), 'CASEBOUND case files should load on first open');
        assert.ok(requested.some(path => path.endsWith('/language-detective-ui.js')), 'CASEBOUND interface should load on first open');
        const caseboundRoot = page.locator('#casebound-content');
        await caseboundRoot.locator('.ld-shell').waitFor({state:'visible',timeout:10000}).catch(async error => {
          const state = await page.evaluate(() => ({
            rootHtml: document.querySelector('#casebound-content')?.innerHTML?.slice(0,1800) || '',
            progressReader: typeof window.__epiphanyReadProgress,
            fixtures: Boolean(window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES),
            engine: Boolean(window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE),
            bridge: window.EPIPHANY_LANGUAGE_DETECTIVE
          }));
          throw new Error('Casebound did not render. Page errors: ' + JSON.stringify(errors) + '; console errors: ' + JSON.stringify(consoleErrors) + '; state: ' + JSON.stringify(state) + '; ' + error.message);
        });
        assert.equal(await caseboundRoot.locator('.ld-caseboard-header h2').innerText(), 'CASEBOUND',
          'the standalone game should display its approved name');
        assert.equal(await caseboundRoot.locator('.ld-case-recommendation').count(), 1,
          'the caseboard should present one recommended next case');
        const translationToggle = page.locator('#translation-toggle');
        if (await translationToggle.getAttribute('aria-pressed') !== 'true') {
          const settingsMenu = page.locator('.tools-menu');
          if (!(await settingsMenu.evaluate(menu => menu.open))) await settingsMenu.locator('> summary').click();
          await page.locator('[data-settings-open="learning"]').click();
          await translationToggle.waitFor({state:'visible',timeout:3000});
          await translationToggle.click();
          await page.locator('#settings-close').click();
          await caseboundRoot.locator('.ld-shell').waitFor({state:'visible',timeout:5000});
        }
        assert.equal(await caseboundRoot.locator('[data-ld-filter-level]').count(), 7,
          'the archive should offer all-cases and six CEFR filters');
        await caseboundRoot.locator('[data-ld-filter-level="A1"]').click();
        assert.equal(await caseboundRoot.locator('.ld-case-file-card[data-ld-case]').count(), 2,
          'A1 filter should show only its own archived investigations');
        assert.equal(await caseboundRoot.locator('.ld-case-recommendation [data-ld-case]').count(), 1,
          'the recommended next-case action should remain separate from the filtered archive');
        assert.equal(await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-004"]').count(), 1,
          'The Blue Scarf should be listed under A1');
        assert.equal(await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-005"]').count(), 1,
          'The Missing Bag should be listed under A1');
        await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-005"]').click();
        await caseboundRoot.locator('.ld-case-intro h2').waitFor({state:'visible'});
        assert.equal(await caseboundRoot.locator('.ld-case-intro h2 [data-tx]').innerText(), 'The Missing Bag',
          'the renamed case title should appear in its case brief');
        await caseboundRoot.locator('[data-ld-start-investigation]').click();
        const hiddenStageTranslate = caseboundRoot.locator('.ld-scene-progress .casebound-translation-row .translate-btn');
        assert.equal(await hiddenStageTranslate.count() > 0,true,
          'legacy per-label translation controls may remain in the DOM for compatibility');
        assert.equal(await hiddenStageTranslate.first().isVisible(),false,
          'stage navigation should not expose legacy per-label controls; its labels are investigation chrome');
        const peopleStageTranslation = caseboundRoot.locator('.ld-mission-panel [data-tx]').first();
        await peopleStageTranslation.waitFor({state:'attached',timeout:5000});
        const peopleStageTranslate = caseboundRoot.locator('.ld-mission-panel > .ld-tx-block').first();
        await peopleStageTranslate.waitFor({state:'visible',timeout:5000});
        assert.equal((await peopleStageTranslate.innerText()).trim(),'ع',
          'CASEBOUND content blocks must start with a compact Arabic-mark translation control');
        assert.equal(await peopleStageTranslate.evaluate(el => el.scrollWidth <= el.clientWidth),
          true,'the initial compact translation control must not overflow its fixed width');
        await peopleStageTranslate.click();
        await page.waitForFunction(el => el.dataset.txLang === 'ar', await peopleStageTranslation.elementHandle());
        await page.waitForFunction(el => el.getAttribute('aria-pressed') === 'true',
          await peopleStageTranslate.elementHandle());
        await peopleStageTranslate.click();
        await page.waitForFunction(el => el.dataset.txLang === 'en', await peopleStageTranslation.elementHandle());
        await page.waitForFunction(el => el.getAttribute('aria-pressed') === 'false',
          await peopleStageTranslate.elementHandle());
        await caseboundRoot.locator('[data-ld-scene-next]').click();
        assert.equal(await caseboundRoot.locator('[data-ld-scene="evidence"]').evaluate(el => document.activeElement === el),true,
          'keyboard focus should move to the new stage after using Continue');
        await caseboundRoot.locator('[data-ld-scene="people"]').click();
        assert.ok(await caseboundRoot.locator('.ld-contact-list .casebound-translation-row .translate-btn').count() > 0,
          'people cards should expose adjacent translation controls for translatable role and status text');
        for (const [characterId, questionId] of [
          ['LINA','Q-LINA-BAG-LAST'],
          ['OMAR','Q-OMAR-VIEW'],
          ['NORA','Q-NORA-BAG']
        ]) {
          await caseboundRoot.locator('[data-ld-select-character="' + characterId + '"]').click();
          await caseboundRoot.locator('[data-ld-ask-interview][data-question-id="' + questionId + '"]').click();
        }
        assert.equal(await caseboundRoot.locator('.ld-contact-row.is-complete').count(), 3,
          'one selected interview answer should be recorded for each of the three characters');
        await caseboundRoot.locator('[data-ld-scene="evidence"]').click();
        for (let i = 1; i <= 4; i++) {
          await caseboundRoot.locator('[data-ld-open-next]').click();
          assert.equal(await caseboundRoot.locator('.ld-evidence').count(), i,
            'the A1 case should reveal only the evidence examined so far');
        }
        await caseboundRoot.locator('[data-ld-scene="conclusion"]').click();
        await caseboundRoot.locator('[name="ld-standard-reasoning"]').fill(
          'The library record links Lina to the paperback in the bag. The seating log places her near the bench, but location alone does not prove ownership. The evidence makes her the best-supported owner, not a certain owner.'
        );
        await caseboundRoot.locator('[data-ld-submit-reasoning]').click();
        await caseboundRoot.locator('[data-ld-conclusion-option="0"]').click();
        await caseboundRoot.locator('[data-ld-answer-form] [type="submit"]').click();
        await caseboundRoot.locator('.ld-result-head').waitFor({state:'visible',timeout:5000});
        assert.match(await caseboundRoot.locator('.ld-result-head h2').innerText(), /Conclusion supported/,
          'The Missing Bag should accept a complete, evidence-based A1 conclusion');
        assert.ok(await caseboundRoot.locator('[data-ld-source-evidence="E04"]').count() >= 1,
          'claim review should link the library-record finding back to the discovered source');
        assert.ok(await caseboundRoot.locator('.ld-result-review .ld-source-link').count() >= 1,
          'examined records should offer a direct revisit action');

        const assessmentBreakdown = caseboundRoot.locator('.ld-diagnostics summary').filter({hasText:'Assessment breakdown'});
        assert.equal(await assessmentBreakdown.count(), 1,
          'the result should provide an assessment breakdown when dimension scores are available');
        await assessmentBreakdown.click();
        assert.ok(await caseboundRoot.locator('.ld-dimensions .ld-dimension').count() >= 1,
          'opening the assessment breakdown should reveal scored dimensions');

        await caseboundRoot.locator('[data-ld-retry]').click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="conclusion"]').waitFor({state:'visible'});
        const retainedReasoning = await caseboundRoot.locator('[name="ld-standard-reasoning"]').inputValue();
        assert.equal(retainedReasoning.trim(),
          'The library record links Lina to the paperback in the bag. The seating log places her near the bench, but location alone does not prove ownership. The evidence makes her the best-supported owner, not a certain owner.',
          'revising an answer should preserve the previous reasoning text');
        await caseboundRoot.locator('[data-ld-submit-reasoning]').click();
        await caseboundRoot.locator('[data-ld-conclusion-option="0"]').click();
        await caseboundRoot.locator('[data-ld-answer-form] [type="submit"]').click();
        await caseboundRoot.locator('.ld-result-head').waitFor({state:'visible',timeout:5000});
        const previousAttempts = caseboundRoot.locator('.ld-diagnostics summary').filter({hasText:'Previous attempts'});
        assert.equal(await previousAttempts.count(), 1,
          'a second submission should expose the previous-attempt history');
        await previousAttempts.click();
        const earlierAttempt = caseboundRoot.locator('.ld-diagnostics').filter({hasText:'Previous attempts'}).locator('li').first();
        assert.equal(await earlierAttempt.locator('b span[data-tx-en="Attempt"]').innerText(), 'Attempt',
          'previous-attempt history should retain the attempt label');
        assert.match(await earlierAttempt.innerText(), /1:\s*Conclusion supported/,
          'previous-attempt history should identify the earlier submission');

        await caseboundRoot.locator('.ld-diagnostics summary').filter({hasText:'Review your reasoning'}).click();
        await caseboundRoot.locator('.ld-finding [data-ld-source-evidence="E04"]').first().click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="evidence"]').waitFor({state:'visible'});
        await caseboundRoot.locator('[data-evidence-id="E04"]').waitFor({state:'visible'});
        assert.equal(await caseboundRoot.locator('[data-evidence-id="E04"]').evaluate(el => document.activeElement === el),true,
          'revisiting an evidence source should move keyboard focus to that record');
        await caseboundRoot.locator('[data-ld-back]').click();
        await caseboundRoot.locator('.ld-caseboard-header').waitFor({state:'visible'});

        // Verify that a reviewed initial statement returns to its original card.
        await caseboundRoot.locator('[data-ld-filter-level="A1"]').click();
        await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-005"]').click();
        await caseboundRoot.locator('[data-ld-start-investigation]').click();
        await caseboundRoot.locator('[data-ld-scene="evidence"]').click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="evidence"]').waitFor({state:'visible'});
        for (let i = 1; i <= 4; i++) await caseboundRoot.locator('[data-ld-open-next]').click();
        await caseboundRoot.locator('[data-ld-scene="conclusion"]').click();
        await caseboundRoot.locator('[name="ld-standard-reasoning"]').fill(
          'The library record links Lina to the paperback in the bag. The seating log places her near the bench, but location alone does not prove ownership. The evidence makes her the best-supported owner, not a certain owner.'
        );
        await caseboundRoot.locator('[data-ld-submit-reasoning]').click();
        await caseboundRoot.locator('[data-ld-conclusion-option="0"]').click();
        await caseboundRoot.locator('[data-ld-answer-form] [type="submit"]').click();
        await caseboundRoot.locator('.ld-result-head').waitFor({state:'visible',timeout:5000});
        const statementSource = caseboundRoot.locator('.ld-result-review').filter({hasText:'Initial statements you reviewed'}).locator('[data-ld-source-statement]').first();
        assert.ok(await statementSource.count() >= 1,
          'result review should list initial statements that were revealed during the investigation');
        const statementId = await statementSource.getAttribute('data-ld-source-statement');
        await statementSource.click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="people"]').waitFor({state:'visible'});
        await caseboundRoot.locator('#ld-statement-' + statementId).waitFor({state:'visible'});
        assert.equal(await caseboundRoot.locator('#ld-statement-' + statementId).evaluate(el => document.activeElement === el),true,
          'revisiting an initial statement should move keyboard focus to its card');
        await caseboundRoot.locator('[data-ld-back]').click();
        await caseboundRoot.locator('.ld-caseboard-header').waitFor({state:'visible'});

        // Re-open A1 to verify that an interview source returns to the exact answer.
        await caseboundRoot.locator('[data-ld-filter-level="A1"]').click();
        await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-005"]').click();
        await caseboundRoot.locator('[data-ld-start-investigation]').click();
        for (const [characterId, questionId] of [
          ['LINA','Q-LINA-BAG-LAST'],
          ['OMAR','Q-OMAR-VIEW'],
          ['NORA','Q-NORA-BAG']
        ]) {
          await caseboundRoot.locator('[data-ld-select-character="' + characterId + '"]').click();
          await caseboundRoot.locator('[data-ld-ask-interview][data-question-id="' + questionId + '"]').click();
        }
        await caseboundRoot.locator('[data-ld-scene="evidence"]').click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="evidence"]').waitFor({state:'visible'});
        for (let i = 1; i <= 4; i++) await caseboundRoot.locator('[data-ld-open-next]').click();
        await caseboundRoot.locator('[data-ld-scene="conclusion"]').click();
        await caseboundRoot.locator('[name="ld-standard-reasoning"]').fill(
          'The library record links Lina to the paperback in the bag. The seating log places her near the bench, but location alone does not prove ownership. The evidence makes her the best-supported owner, not a certain owner.'
        );
        await caseboundRoot.locator('[data-ld-submit-reasoning]').click();
        await caseboundRoot.locator('[data-ld-conclusion-option="0"]').click();
        await caseboundRoot.locator('[data-ld-answer-form] [type="submit"]').click();
        await caseboundRoot.locator('.ld-result-head').waitFor({state:'visible',timeout:5000});
        await caseboundRoot.locator('.ld-diagnostics summary').filter({hasText:'Review your reasoning'}).click();
        const interviewSource = caseboundRoot.locator('.ld-result-review').filter({hasText:'Interview answers you collected'}).locator('[data-ld-source-interview]').first();
        assert.ok(await interviewSource.count() >= 1,
          'result review should list collected interview answers separately from claim diagnostics');
        const firstInterviewReview = caseboundRoot.locator('.ld-result-review')
          .filter({hasText:'Interview answers you collected'}).locator('li').first();
        const firstInterviewText = await firstInterviewReview.innerText();
        assert.match(firstInterviewText, /When did you last see your green bag\?/,
          'interview review should preserve the exact question prompt');
        assert.match(firstInterviewText, /I remember having it near the timetable board\. I do not remember seeing it after that\./,
          'interview review should display the collected answer, not only link back to the question');
        const interviewRef = await interviewSource.getAttribute('data-ld-source-interview');
        const [interviewCharacterId, ...interviewQuestionParts] = interviewRef.split(':');
        const interviewQuestionId = interviewQuestionParts.join(':');
        await interviewSource.click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="people"]').waitFor({state:'visible'});
        await caseboundRoot.locator('[data-ld-select-character="' + interviewCharacterId + '"].is-selected').waitFor({state:'visible'});
        await caseboundRoot.locator('#ld-interview-' + interviewQuestionId).waitFor({state:'visible'});
        assert.equal(await caseboundRoot.locator('#ld-interview-' + interviewQuestionId).evaluate(el => document.activeElement === el),true,
          'revisiting an interview answer should move keyboard focus to that answer');
        await caseboundRoot.locator('[data-ld-back]').click();
        await caseboundRoot.locator('.ld-caseboard-header').waitFor({state:'visible'});
        await caseboundRoot.locator('[data-ld-filter-level="A2"]').click();
        assert.equal(await caseboundRoot.locator('.ld-case-file-card[data-ld-case]').count(), 1,
          'A2 should show only its own archived investigation');
        assert.equal(await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-001"]').count(), 1,
          'the A2 case should be listed under A2');
        await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-001"]').click();
        await caseboundRoot.locator('[data-ld-start-investigation]').waitFor({state:'visible'});
        assert.equal(await caseboundRoot.locator('.ld-evidence').count(), 0,
          'evidence should not be exposed before the player starts the investigation');
        await caseboundRoot.locator('[data-ld-start-investigation]').click();
        assert.equal(await caseboundRoot.locator('.ld-evidence').count(), 0,
          'evidence should remain undisclosed until each item is examined');
        assert.equal(await caseboundRoot.locator('[data-ld-open-next]').count(), 1,
          'the workspace should offer the next available evidence item');
        assert.equal(await caseboundRoot.locator('.ld-evidence-records [data-ld-open-next]').count(), 1,
          'the next evidence action should live inside the records lane');
        assert.equal(await caseboundRoot.locator('[data-ld-conclusion-choices]').count(), 0,
          'conclusion should remain unavailable while evidence is undiscovered');
        await caseboundRoot.locator('[data-ld-notebook-open]').click();
        assert.match(await page.locator('#ld-case-notebook').innerText(), /notebook is empty/i,
          'the notebook should start empty');
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('#ld-case-notebook').evaluate(el => el.contains(document.activeElement)),true,
          'keyboard Tab navigation should remain inside the modal case notebook');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#ld-case-notebook').evaluate(el => el.hidden),true,
          'Escape should close the CASEBOUND notebook drawer');
        assert.equal(await caseboundRoot.locator('[data-ld-notebook-open]').evaluate(el => document.activeElement === el),true,
          'closing the CASEBOUND notebook with Escape should restore focus to its trigger');
        await caseboundRoot.locator('[data-ld-scene="evidence"]').click();
        await caseboundRoot.locator('[data-ld-open-next]').waitFor({state:'visible'});
        for (let i = 1; i <= 4; i++) {
          await caseboundRoot.locator('[data-ld-open-next]').click();
          assert.equal(await caseboundRoot.locator('.ld-evidence').count(), i,
            'only examined evidence should be visible in the workspace');
          if (i === 1) {
            assert.equal(await caseboundRoot.locator('.ld-evidence-records').evaluate(el => {
              const action = el.querySelector('[data-ld-open-next]');
              const firstEvidence = el.querySelector('.ld-evidence-card');
              return !!action && !!firstEvidence && Boolean(action.compareDocumentPosition(firstEvidence) & Node.DOCUMENT_POSITION_FOLLOWING);
            }), true, 'the next evidence action should remain above previously examined records');
          }
          assert.equal(await caseboundRoot.locator('.ld-notebook-trigger .ld-notebook-count').innerText(), String(i),
            'the notebook count should match discovered evidence');
        }
        assert.equal(await caseboundRoot.locator('[data-ld-open-next]').count(), 0,
          'all evidence should be exhausted after the final discovery');
        await caseboundRoot.locator('[data-ld-scene="conclusion"]').click();
        await caseboundRoot.locator('[data-ld-conclusion-choices]').waitFor({state:'visible',timeout:5000});
        assert.equal(await caseboundRoot.locator('.ld-conclusion-locked').count(), 3,
          'Standard mode should show three locked option placeholders before reasoning is submitted');
        assert.ok(await caseboundRoot.locator('.ld-conclusion-locked .translate-btn').count() > 0,
          'non-answer locked-state guidance should remain translatable before choices unlock');
        assert.equal(await caseboundRoot.locator('[data-ld-conclusion-option]').count(), 0,
          'option text must remain hidden before reasoning submission');
        assert.equal(await caseboundRoot.locator('[data-ld-answer-form]').getAttribute('data-answer-format'), 'STANDARD',
          'Standard conclusion should retain its explicit answer format');
        assert.equal(await caseboundRoot.locator('.ld-answer-form-standard .ld-answer-step').count(), 2,
          'Standard mode should present reasoning before the conclusion-choice step');
        assert.equal(await caseboundRoot.locator('.ld-answer-form-standard .ld-answer-step').nth(0).locator('h4 [data-tx-en="Explain your reasoning"]').innerText(), 'Explain your reasoning');
        assert.equal(await caseboundRoot.locator('.ld-answer-form-standard .ld-answer-step').nth(1).locator('h4 [data-tx-en="Choose your conclusion"]').innerText(), 'Choose your conclusion');
        await caseboundRoot.locator('[name="ld-standard-reasoning"]').fill(
          'Sara saw a resident in a green jacket pick up the package, but she did not see the resident’s face. The evidence does not identify the person.'
        );
        await caseboundRoot.locator('[data-ld-submit-reasoning]').click();
        assert.equal(await caseboundRoot.locator('.ld-conclusion-locked').count(), 0,
          'submitting reasoning should unlock the conclusion choices');
        assert.equal(await caseboundRoot.locator('[data-ld-conclusion-option]').count(), 3,
          'Standard mode should reveal three conclusion choices after reasoning submission');
        assert.equal(await caseboundRoot.locator('[data-ld-conclusion-option] .translate-btn').count(),0,
          'final conclusion choices must not receive translation controls that could reveal the answer');
        assert.equal(await caseboundRoot.locator('[name="ld-standard-reasoning"]').isEditable(), false,
          'reasoning should be locked after the choices are revealed');
        await caseboundRoot.locator('[data-ld-conclusion-option="1"]').click();
        await caseboundRoot.locator('[data-ld-answer-form] [type="submit"]').click();
        await caseboundRoot.locator('.ld-result-head').waitFor({state:'visible',timeout:5000});
        assert.match(await caseboundRoot.locator('.ld-result-head h2').innerText(), /Conclusion supported|Partly supported/,
          'the CASEBOUND assessment engine should return a usable result');

        // Exercise Hell Mode on a phone-sized viewport after the case has been solved.
        await caseboundRoot.locator('[data-ld-back]').first().click();
        await caseboundRoot.locator('.ld-advanced-settings > summary').click();
        await caseboundRoot.locator('.ld-segment-option:has([data-ld-setting="answerFormat"][value="HELL"])').click();
        assert.equal(await caseboundRoot.locator('[data-ld-setting="answerFormat"][value="HELL"]').isChecked(), true,
          'Hell Mode should be selected through its visible answer-style option');
        await caseboundRoot.locator('[data-ld-filter-level="A1"]').click();
        await caseboundRoot.locator('.ld-case-file-card[data-ld-case="CASE-005"]').click();
        await page.setViewportSize({width:390,height:844});
        await caseboundRoot.locator('[data-ld-start-investigation]').click();
        for (const [characterId, questionId] of [
          ['LINA','Q-LINA-BAG-LAST'],
          ['OMAR','Q-OMAR-VIEW'],
          ['NORA','Q-NORA-BAG']
        ]) {
          await caseboundRoot.locator('[data-ld-select-character="' + characterId + '"]').click();
          await caseboundRoot.locator('[data-ld-ask-interview][data-question-id="' + questionId + '"]').click();
        }
        await caseboundRoot.locator('[data-ld-scene="evidence"]').click();
        await caseboundRoot.locator('.ld-layout[data-active-scene="evidence"]').waitFor({state:'visible'});
        for (let i = 1; i <= 4; i++) await caseboundRoot.locator('[data-ld-open-next]').click();
        await caseboundRoot.locator('[data-ld-scene="conclusion"]').click();
        const hellForm = caseboundRoot.locator('[data-ld-answer-form]');
        assert.equal(await hellForm.getAttribute('data-answer-format'),'HELL',
          'the completed case should unlock Hell Mode for a subsequent investigation');
        assert.equal(await hellForm.locator('[name="ld-conclusion"]').count(),1,
          'Hell Mode should provide a dedicated conclusion field');
        assert.equal(await hellForm.locator('[name="ld-reasoning"]').count(),1,
          'Hell Mode should provide a dedicated reasoning field');
        const hellLayout = await hellForm.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const shell = el.closest('.ld-shell').getBoundingClientRect();
          return {
            columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,
            fits:rect.left >= shell.left - 1 && rect.right <= shell.right + 1
          };
        });
        assert.equal(hellLayout.columns,1,'Hell Mode fields should stack in one column on a phone');
        assert.equal(hellLayout.fits,true,'Hell Mode form should fit within the CASEBOUND shell on mobile');
        await hellForm.locator('[name="ld-conclusion"]').fill('Lina most likely owned the bag, although the records do not prove it with certainty.');
        await hellForm.locator('[name="ld-reasoning"]').fill('The library record connects Lina to the paperback found in the bag. The seating record places her near the bench, but neither record proves who moved the bag.');
        await hellForm.locator('[type="submit"]').click();
        await caseboundRoot.locator('.ld-result-head').waitFor({state:'visible',timeout:5000});
        assert.equal(await caseboundRoot.locator('.ld-result-head').isVisible(),true,
          'Hell Mode should submit both written fields and reach the result review');
        const resultOverflow = await caseboundRoot.locator('.ld-shell').evaluate(shell => {
          const shellRect = shell.getBoundingClientRect();
          const elements = [shell, ...shell.querySelectorAll('*')];
          const offenders = elements.map(el => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              tag:el.tagName.toLowerCase(),
              className:typeof el.className === 'string' ? el.className : '',
              id:el.id || '',
              text:(el.innerText || el.textContent || '').trim().replace(/\\s+/g,' ').slice(0,90),
              left:Math.round(rect.left * 10) / 10,
              right:Math.round(rect.right * 10) / 10,
              width:Math.round(rect.width * 10) / 10,
              scrollWidth:el.scrollWidth,
              clientWidth:el.clientWidth,
              position:style.position,
              whiteSpace:style.whiteSpace,
              gridColumns:style.gridTemplateColumns
            };
          }).filter(item =>
            item.right > shellRect.right + 1 ||
            item.left < shellRect.left - 1 ||
            item.scrollWidth > item.clientWidth + 1
          );
          return {
            shell:{left:shellRect.left,right:shellRect.right,width:shellRect.width,scrollWidth:shell.scrollWidth,clientWidth:shell.clientWidth},
            offenders:offenders.slice(0,25)
          };
        });
        assert.equal(resultOverflow.shell.scrollWidth <= resultOverflow.shell.clientWidth + 1,true,
          'the Hell Mode result screen should not overflow horizontally on mobile; diagnostics: ' + JSON.stringify(resultOverflow));
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
        const mobileDestinations = page.locator('.mobile-menu nav [data-view]');
        assert.equal(await mobileDestinations.count(), 16, 'all current destinations, including Fluentia, Codex and CASEBOUND, should remain available in the mobile menu');
        assert.equal(await page.locator('.mobile-menu nav [data-view="fluentia"]').count(), 1, 'Fluentia should replace Arcade as the single Play practice destination');
        assert.equal(await page.locator('.mobile-menu nav [data-view="arcade"]').count(), 0, 'legacy Arcade should not remain as a separate navigation destination');
        assert.equal(await page.locator('.mobile-menu nav [data-view="casebound"]').count(), 1, 'CASEBOUND should appear exactly once as a standalone Play destination');
        const quickActions = page.locator('.quick-actions-more');
        assert.equal(await quickActions.evaluate(el => el.open), false, 'secondary practice options should start collapsed');
        assert.equal(await page.locator('#listen-only-start').isVisible(), false, 'collapsed secondary actions should not clutter the home screen');
        const quickActionsState = await page.evaluate(() => {
          const details = document.querySelector('.quick-actions-more');
          const summary = details?.querySelector('summary');
          const rect = element => { if (!element) return null; const r = element.getBoundingClientRect(); const s = getComputedStyle(element); return {width:r.width,height:r.height,display:s.display,visibility:s.visibility,opacity:s.opacity}; };
          return {details:rect(details),summary:rect(summary),detailsHidden:details?.hidden??null,summaryHidden:summary?.hidden??null,home:rect(document.querySelector('#home-view')),main:rect(document.querySelector('main#main')),bodyClass:document.body.className};
        });
        assert.equal(await quickActions.locator('summary').isVisible(), true, 'secondary actions summary should be visible: ' + JSON.stringify(quickActionsState));
        await quickActions.locator('summary').evaluate(el => el.click());
        assert.equal(await page.locator('#listen-only-start').isVisible(), true, 'secondary practice actions should be available when expanded');
        await quickActions.locator('summary').evaluate(el => el.click());
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
      checkpoint('completed view ' + view);
    }
    checkpoint('all navigation views passed; starting adaptive review checks');
    const adaptivePage = await browser.newPage();
    await adaptivePage.setViewportSize({ width: 800, height: 900 });
    adaptivePage.on('pageerror', error => errors.push('adaptive-home: ' + error.message));
    await adaptivePage.addInitScript(() => {
      localStorage.setItem('epiphany-guest-mode-v2', '1');
      localStorage.setItem('epiphany-progress', JSON.stringify({
        review:[{word:'although',meaning:'despite',due:'2000-01-01',errors:0,box:1,attempts:0}],
        adaptiveSignals:{grammar:{attempts:4,errors:3,correct:1,topics:{}}},
        quests:0,level:'A1'
      }));
    });
    await adaptivePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await dismissFirstVisitOverlays(adaptivePage);
    await adaptivePage.waitForFunction(() => document.querySelector('#next-title')?.textContent === 'Review words due today', null, { timeout: 5000 });
    assert.equal(await adaptivePage.locator('#next-start').getAttribute('data-game'), 'wordcraft-speed-round', 'words due for spaced review should take priority through Fluentia Speed Round');
    assert.match(await adaptivePage.locator('#next-desc').innerText(), /although/i, 'the recommendation should name the words that need attention');
    await adaptivePage.close();

    const grammarReviewPage = await browser.newPage();
    await grammarReviewPage.setViewportSize({ width: 800, height: 900 });
    grammarReviewPage.on('pageerror', error => errors.push('adaptive-grammar-review: ' + error.message));
    await grammarReviewPage.addInitScript(() => {
      localStorage.setItem('epiphany-guest-mode-v2', '1');
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

    checkpoint('adaptive and grammar review checks passed; starting card portal checks');
    const cardsPage = await browser.newPage();
    await cardsPage.setViewportSize({ width: 390, height: 844 });
    await cardsPage.addInitScript(() => {
      localStorage.setItem('epiphany-guest-mode-v2', '1');
      // Keep the browser smoke test deterministic even when external config loading is delayed.
      window.EPIPHANY_SUPABASE_CONFIG = {url:'https://pqxkmtowialpjwehvuyb.supabase.co'};
      window.__cardLongTasks = [];
      try { new PerformanceObserver(list => window.__cardLongTasks.push(...list.getEntries().map(entry => entry.duration))).observe({type:'longtask', buffered:true}); } catch {}
      localStorage.setItem('epiphany-landing-seen', '1');
      localStorage.setItem('epiphany-progress', JSON.stringify({placementDone:true,assessedLevel:'A1',level:'A1'}));
      localStorage.setItem('epiphany-card-prototype-v1:guest', JSON.stringify({
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
    const mobileMenu = cardsPage.locator('.mobile-menu');
    const mobileMenuTrigger = mobileMenu.locator(':scope > summary');
    await mobileMenuTrigger.click();
    assert.equal(await mobileMenu.evaluate(el => el.open), true, 'the mobile drawer should open from its menu button');
    const playGroup = cardsPage.locator('.mobile-nav-group').filter({hasText:'PLAY'}).first();
    await playGroup.locator(':scope > summary').click();
    assert.equal(await mobileMenu.evaluate(el => el.open), true, 'opening a group inside the drawer must not close the drawer');
    assert.equal(await playGroup.evaluate(el => el.open), true, 'the selected mobile group should expand');
    await cardsPage.keyboard.press('Escape');
    assert.equal(await mobileMenu.evaluate(el => el.open), false, 'Escape should close the entire mobile drawer');
    assert.equal(await mobileMenuTrigger.evaluate(el => document.activeElement === el), true, 'Escape should restore focus to the menu button');
    await mobileMenuTrigger.click();
    await mobileMenu.locator('.mobile-menu-backdrop').click({position:{x:360,y:200}});
    assert.equal(await mobileMenu.evaluate(el => el.open), false, 'the backdrop should close the mobile drawer');
    await clickView(cardsPage, 'fluentia');
    await cardsPage.locator('#fluentia-content #fluentia-title').waitFor({state:'visible',timeout:10000});
    assert.equal(await cardsPage.locator('#fluentia-content .fluentia-domain-card').count(),6,'Fluentia should open from the mobile drawer with all six domains');
    const fluentiaMobileLayout = await cardsPage.locator('#fluentia-content').evaluate(el => ({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
    assert.ok(fluentiaMobileLayout.scrollWidth <= fluentiaMobileLayout.clientWidth + 1,'Fluentia should fit the mobile viewport: '+JSON.stringify(fluentiaMobileLayout));
    await clickView(cardsPage, 'collection');
    assert.equal(await mobileMenu.evaluate(el => el.open), false, 'choosing a destination should close the mobile drawer');
    await cardsPage.locator('#cards-gallery').scrollIntoViewIfNeeded();
    // The auth-driven published-art refresh can rebuild gallery nodes and restore lazy loading.
    // Wait for the final nodes before promoting a visible representative image to eager loading.
    checkpoint('card portal opened; waiting for published card assets');
    await cardsPage.waitForFunction(() => window.EPIPHANY_CARD_ASSETS_REFRESHED === true, null, {timeout:10000});
    checkpoint('published card assets refreshed');
    const galleryOpenedAt = await cardsPage.evaluate(() => performance.now());
    // Auth state can trigger a second published-art refresh immediately after the first
    // one completes. Re-apply eager loading to the current representative node while
    // waiting, so a replaced lazy image cannot leave the smoke test waiting forever.
    await cardsPage.waitForFunction(() => {
      const image = document.querySelector('#cards-gallery .fcard-portrait-image');
      if (!image) return false;
      if (image.loading !== 'eager') image.loading = 'eager';
      image.scrollIntoView({block:'center',inline:'nearest'});
      return image.complete && image.naturalWidth > 0;
    }, null, {timeout:10000, polling:100}).catch(async error => {
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
    // The final published-art nodes are now stable for filter-cache measurements.
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

    // Force the no-dossier state explicitly; the card catalog may gain a profile later.
    await cardsPage.evaluate(() => { delete window.EPIPHANY_CARD_PROFILES['CHR-004']; });
    await cardsPage.locator('#cards-gallery [data-gallery-card="CHR-004"] .fcard').click();
    const undocumentedDetail = cardsPage.locator('#cards-detail-modal [role="dialog"]');
    await undocumentedDetail.waitFor({state:'visible'});
    await cardsPage.locator('#cards-detail-modal .cards-detail-placeholder').waitFor({state:'visible'});
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
    await cardsPage.waitForSelector('#collection-view.is-active #cards-gallery');
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
    checkpoint('card gallery and dossier interaction checks passed; capturing visual matrix');
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
    checkpoint('card dossier visual matrix captured');

    checkpoint('starting offline service-worker checks');
    const offlinePage = await browser.newPage();
    await offlinePage.setViewportSize({ width: 800, height: 900 });
    offlinePage.on('pageerror', error => errors.push('offline: ' + error.message));
    await offlinePage.addInitScript(() => {
      localStorage.setItem('epiphany-progress', JSON.stringify({placementDone:true,assessedLevel:'A1',level:'A1'}));
      localStorage.setItem('epiphany-landing-seen', '1');
      localStorage.setItem('epiphany-guest-mode-v2', '1');
    });
    await offlinePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await dismissFirstVisitOverlays(offlinePage);
    await Promise.race([
      offlinePage.evaluate(() => navigator.serviceWorker.ready),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker did not become ready within 15 seconds')), 15000))
    ]);
    checkpoint('service worker ready');
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
    checkpoint('offline service-worker checks passed');
    assert.deepEqual(errors, [], 'uncaught page errors occurred: ' + errors.join(' | '));
  } finally {
    if (browser) await browser.close();
    if (server) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  }
});
