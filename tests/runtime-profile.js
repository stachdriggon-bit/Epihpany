const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mime = {
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.webp':'image/webp'
};

async function clickView(page, view) {
  const selector = 'button[data-view="' + view + '"]';
  await page.waitForSelector(selector, { state:'attached', timeout:10000 });
  const group = page.locator('details.nav-group').filter({ has:page.locator(selector) }).first();
  if (await group.count() && !(await group.evaluate(el => el.open))) {
    await group.locator(':scope > summary').click();
  }
  await page.locator(selector + ':visible').first().click();
}

async function openAndCloseView(page, view) {
  await clickView(page, view);
  if (view === 'world') {
    await page.waitForFunction(() => {
      const game = document.querySelector('#world-game');
      return game && !game.hidden && game.querySelector('.world-intro, .world-region-hub, .world-top');
    }, null, { timeout:20000 });
    const exit = page.locator('#world-game [data-world-exit]').first();
    await exit.waitFor({ state:'visible', timeout:5000 });
    await exit.click();
    await page.waitForFunction(() => {
      const game = document.querySelector('#world-game');
      return !game || game.hidden;
    }, null, { timeout:5000 });
  } else {
    await page.waitForSelector('#' + view + '-view.is-active', { timeout:8000 });
    await page.waitForTimeout(80);
    await clickView(page, 'home');
    await page.waitForSelector('#home-view.is-active', { timeout:8000 });
  }
}

async function readDetachedDomMetrics(page) {
  return page.evaluate(async () => {
    await Promise.resolve();
    const probe = window.__epiphanyDetachedProbe;
    if (!probe) return { tracked:0, liveDetached:0, samples:[] };
    const live = [];
    const counts = new Map();
    for (const entry of probe.entries) {
      const node = entry.ref.deref();
      if (!node || node.isConnected) continue;
      live.push(entry);
      counts.set(entry.label, (counts.get(entry.label) || 0) + 1);
    }
    return {
      tracked:probe.entries.length,
      liveDetached:live.length,
      samples:[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([label,count])=>({label,count}))
    };
  });
}

async function readRuntimeMetrics(cdp, page) {
  const response = await cdp.send('Performance.getMetrics');
  const metrics = Object.fromEntries(response.metrics.map(item => [item.name, item.value]));
  const dom = await page.evaluate(() => ({
    elementCount:document.querySelectorAll('*').length,
    textNodeCount:(() => { const walker=document.createTreeWalker(document, NodeFilter.SHOW_TEXT); let count=0; while(walker.nextNode()) count++; return count; })(),
    worldChildren:document.querySelector('#world-game')?.children.length || 0
  }));
  return {
    jsHeapUsedMB:Number.isFinite(metrics.JSHeapUsedSize) ? Math.round(metrics.JSHeapUsedSize / 1048576 * 100) / 100 : null,
    domNodes:metrics.Nodes ?? null,
    jsEventListeners:metrics.JSEventListeners ?? null,
    documents:metrics.Documents ?? null,
    frames:metrics.Frames ?? null,
    elementCount:dom.elementCount,
    textNodeCount:dom.textNodeCount,
    worldChildren:dom.worldChildren
  };
}

test('repeated feature entry and exit reports Chromium runtime lifecycle metrics', { timeout:5 * 60 * 1000 }, async () => {
  let server;
  let browser;
  try {
    server = http.createServer((req, res) => {
      let pathname;
      try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
      catch { res.writeHead(400); res.end('Bad request'); return; }
      const requested = path.resolve(root, '.' + pathname);
      if (pathname !== '/' && !requested.startsWith(root + path.sep) && requested !== path.join(root, 'index.html')) {
        res.writeHead(403); res.end('Forbidden'); return;
      }
      const file = pathname === '/' ? path.join(root, 'index.html') : requested;
      fs.readFile(file, (error, data) => {
        if (error) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'content-type':mime[path.extname(file)] || 'application/octet-stream', 'cache-control':'no-store' });
        res.end(data);
      });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const baseUrl = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless:true, timeout:30000 });
    const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => {
      const probe = window.__epiphanyDetachedProbe = { entries:[], limit:50000 };
      const seen = new WeakSet();
      const label = node => {
        const tag = String(node.tagName || node.nodeName || 'node').toLowerCase();
        const id = node.id ? '#' + node.id : '';
        const classes = typeof node.className === 'string' && node.className.trim()
          ? '.' + node.className.trim().split(/\s+/).slice(0,3).join('.') : '';
        return tag + id + classes;
      };
      const remember = node => {
        if (!node || probe.entries.length >= probe.limit) return;
        if (node.nodeType === 1 && !seen.has(node)) {
          seen.add(node);
          probe.entries.push({ref:new WeakRef(node),label:label(node)});
        }
        for (const child of node.childNodes || []) remember(child);
      };
      const observer = new MutationObserver(records => {
        for (const record of records) for (const removed of record.removedNodes) remember(removed);
      });
      observer.observe(document, {childList:true,subtree:true});
    });
    await page.addInitScript(() => {
      localStorage.setItem('epiphany-progress', JSON.stringify({ placementDone:true, assessedLevel:'A1', level:'A1' }));
      localStorage.setItem('epiphany-landing-seen', '1');
    });
    await page.goto(baseUrl, { waitUntil:'domcontentloaded', timeout:20000 });
    await page.waitForSelector('button[data-view="home"]', { state:'attached', timeout:10000 });

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Performance.enable');
    await cdp.send('HeapProfiler.enable');

    // Warm each feature once so lazy-loaded modules are not mistaken for leaked session state.
    for (const view of ['fluentia','thinklab','world']) {
      await openAndCloseView(page, view);
    }
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await cdp.send('HeapProfiler.collectGarbage');
    await page.evaluate(() => Promise.resolve());
    const samples = [{ phase:'warm-baseline', ...(await readRuntimeMetrics(cdp, page)), detachedDom:await readDetachedDomMetrics(page) }];

    // Repeated same-tab navigation exercises teardown and re-entry without creating fresh documents.
    for (let cycle = 1; cycle <= 6; cycle++) {
      for (const view of ['fluentia','thinklab','world']) {
        await openAndCloseView(page, view);
      }
      if (cycle % 2 === 0) {
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await cdp.send('HeapProfiler.collectGarbage');
        samples.push({ phase:'after-cycle-' + cycle, ...(await readRuntimeMetrics(cdp, page)), detachedDom:await readDetachedDomMetrics(page) });
      }
    }

    assert.deepEqual(pageErrors, [], 'uncaught browser errors during repeated navigation: ' + pageErrors.join(' | '));
    assert.ok(samples.every(sample => Number.isFinite(sample.domNodes) && Number.isFinite(sample.jsHeapUsedMB)),
      'Chromium must provide DOM node and JavaScript heap metrics: ' + JSON.stringify(samples));

    const baseline = samples[0];
    const final = samples[samples.length - 1];
    const report = {
      cycles:6,
      featureEntries:21,
      note:'Diagnostic measurements only; WeakRef samples count removed elements still alive after forced GC and exclude nodes reattached to the document. No fixed leak threshold is asserted.',
      baseline,
      final,
      delta:{
        jsHeapUsedMB:Math.round((final.jsHeapUsedMB - baseline.jsHeapUsedMB) * 100) / 100,
        domNodes:final.domNodes - baseline.domNodes,
        jsEventListeners:final.jsEventListeners - baseline.jsEventListeners,
        elementCount:final.elementCount - baseline.elementCount,
        textNodeCount:final.textNodeCount - baseline.textNodeCount,
        liveDetachedDom:final.detachedDom.liveDetached - baseline.detachedDom.liveDetached
      },
      samples
    };
    console.log('[runtime-profile] ' + JSON.stringify(report));
    await cdp.detach();
    await page.close();
  } finally {
    if (browser) await browser.close();
    if (server) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  }
});
