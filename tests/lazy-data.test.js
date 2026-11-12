const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('feature data loader does not request large datasets until requested', async () => {
  const requested = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'script');
      return { async: true, src: '', remove() {} };
    },
    head: {
      appendChild(script) {
        requested.push(script.src);
        queueMicrotask(() => script.onload());
      }
    }
  };
  const merged = [];
  let fluentiaRegistrations = 0;
  let context;
  document.head.appendChild = script => {
    requested.push(script.src);
    queueMicrotask(() => {
      const match = script.src.match(/data-expansion-(vocabulary|spelling|grammar|story|listening|advanced)\.js/);
      if (match) { context.window.EPIPHANY_EXPANSION_BANKS[match[1]] = true; context.GAMES[match[1]].questions.push({id:'exp-a1-'+match[1],level:'A1'}); }
      script.onload();
    });
  };
  context = { GAMES: Object.fromEntries(['vocabulary','spelling','grammar','story','listening','advanced'].map(name => [name, {questions:[{level:'A1'}]}])), WOTD_WORDS: [], window: { EPIPHANY_EXPANSION_BANKS: {}, EPIPHANY_REGISTER_EXPANSION_BANK() {}, EPIPHANY_EXPANSION_TRANSLATIONS: {}, EPIPHANY_MERGE_AR_TRANSLATIONS: () => merged.push(true), EPIPHANY_FLUENTIA_REGISTER_SOURCES: () => { fluentiaRegistrations++; }, EPIPHANY_FLUENTIA_SESSION_ENGINE: { getActivity: () => ({}) } }, document, Promise, Map, Set, Object, Error };
  const source = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'lazy-data.js' }));
  vm.runInNewContext(source, context);
  assert.deepEqual(requested, []);

  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['data-stories.js', 'data-stories-expansion.js']);
  assert.ok(requested.every(src => /\?v=.+/.test(src)), 'loaded scripts should have cache-busting versions');
  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.equal(requested.length, 2);

  await context.window.EPIPHANY_LAZY_LOAD('world');
  assert.deepEqual(requested.slice(2).map(src => src.split('?')[0]), [
    'data-world.js',
    'data-world-sprites.js'
  ]);
  assert.ok(requested.slice(2).every(src => /\?v=.+/.test(src)));
  await context.window.EPIPHANY_LAZY_LOAD('fluentia');
  assert.deepEqual(requested.slice(4).map(src => src.split('?')[0]), ['fluentia-directions-bank.js','sound-maze-bank.js','sound-maze-content.js','fluentia-textwise-bank.js','fluentia-soundscape-bank.js','fluentia-practice-bank.js'], 'Fluentia should load its optional content sources only when opened');
  assert.equal(fluentiaRegistrations, 1, 'Fluentia should register its banks after every lazy source has loaded');
  await assert.rejects(context.window.EPIPHANY_LAZY_LOAD('arcade'), /Unknown feature data group/, 'retired Arcade data group must no longer be registered');
  await context.window.EPIPHANY_LAZY_LOAD('thinklab');
  await context.window.EPIPHANY_LAZY_LOAD('lifeskills');
  assert.deepEqual(requested.slice(4).map(src => src.split('?')[0]), [
    'fluentia-directions-bank.js',
    'sound-maze-bank.js',
    'sound-maze-content.js',
    'fluentia-textwise-bank.js',
    'fluentia-soundscape-bank.js',
    'fluentia-practice-bank.js',
    'word-connections-bank.js',
    'word-forge-bank.js',
    'word-hunt-bank.js',
    'think-lab-progression.js',
    'think-lab.js',
    'word-hunt.js',
    'codebreaker-bank.js',
    'codebreaker.js',
    'letter-grid-bank.js',
    'letter-grid.js',
    'life-skills.js'
  ]);
  assert.ok(requested.slice(4).every(src => /\?v=.+/.test(src)));
  await context.window.EPIPHANY_LAZY_LOAD('arabic');
  assert.deepEqual(requested.slice(21).map(src => src.split('?')[0]), [
    'data-translation-ar.js',
    'data-translation-ar-fill.js'
  ]);
  assert.ok(requested.slice(21).every(src => /\?v=.+/.test(src)));
  assert.deepEqual(merged, [true]);
  await context.window.EPIPHANY_LAZY_LOAD('chronicle');
  assert.deepEqual(requested.slice(23).map(src => src.split('?')[0]), ['data-world-registry.js', 'data-world-events.js']);
  assert.ok(requested.slice(21).every(src => /\?v=.+/.test(src)));

  await assert.rejects(context.window.EPIPHANY_LAZY_LOAD('directions'), /Unknown feature data group/, 'the standalone Directions loader is retired; its bank loads only with Fluentia');

  await context.window.EPIPHANY_LAZY_LOAD('expansionVocabulary');
  assert.deepEqual(requested.slice(25).map(src => src.split('?')[0]), ['data-expansion-translations.js','data-expansion-runtime.js','data-expansion-wotd.js','data-expansion-vocabulary.js']);
  await context.window.EPIPHANY_LAZY_LOAD('expansionGrammar');
  assert.deepEqual(requested.slice(29).map(src => src.split('?')[0]), ['data-expansion-grammar.js'], 'other game banks should remain unloaded');
  assert.equal(fluentiaRegistrations, 3);
});

test('a game expansion loader rejects incomplete registration and permits a clean retry', async () => {
  const requested = [];
  let context, attempts = 0;
  const document = {
    createElement() { return { src: '', remove() {} }; },
    head: { appendChild(script) { requested.push(script.src); queueMicrotask(() => { if(script.src.includes('data-expansion-vocabulary.js')&&++attempts>1){context.window.EPIPHANY_EXPANSION_BANKS.vocabulary=true;context.GAMES.vocabulary.questions.push({id:'exp-a1-vocabulary',level:'A1'});} script.onload(); }); } },
    querySelectorAll() { return []; }
  };
  context = vm.createContext({ GAMES:{vocabulary:{questions:[{level:'A1'}]}}, WOTD_WORDS:[], window:{EPIPHANY_EXPANSION_BANKS:{},EPIPHANY_REGISTER_EXPANSION_BANK(){},EPIPHANY_EXPANSION_TRANSLATIONS:{}}, document, Promise, Map, Set, Object, Error, Number });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  await assert.rejects(context.window.EPIPHANY_LAZY_LOAD('expansionVocabulary'), /vocabulary expansion bank loaded, but its questions did not register/);
  await context.window.EPIPHANY_LAZY_LOAD('expansionVocabulary');
  assert.equal(requested.length, 5);
});

test('initial HTML defers stories and World data and keeps loader in offline shell', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const expansionFiles = ['data-expansion-translations.js','data-expansion-runtime.js','data-expansion-wotd.js', ...['vocabulary','spelling','grammar','story','listening','advanced'].map(game => 'data-expansion-' + game + '.js')];
  for (const file of expansionFiles) assert.ok(fs.existsSync(path.join(root, file)), file + ' should exist');
  assert.ok(!fs.existsSync(path.join(root, 'data-expansion.js')), 'the combined file should be removed');

  assert.match(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), /data-stories-expansion\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-stories\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-world(?:-sprites)?\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-minigames\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-spot\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-typing\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-expansion-(?:translations|runtime|wotd|vocabulary|spelling|grammar|story|listening|advanced)\.js/, 'expansion modules must remain out of initial HTML');
  assert.doesNotMatch(html, /<script[^>]+src="fluentia-(?:textwise|soundscape)-bank\.js/);
  assert.match(html, /lazy-data\.js\?v=[^\"&]+/);
  assert.doesNotMatch(html, /href=\"(?:resonance|life-skills)\.css/);
  assert.match(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), /EPIPHANY_LAZY_STYLE/);
  assert.match(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), /EPIPHANY_LAZY_LOAD\('thinklab'\), window\.EPIPHANY_LAZY_STYLE\('thinklab'\)/);
  assert.doesNotMatch(html, /<script[^>]+src="(?:crossword-quest|crossword-quest-bank)\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-translation-ar\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="(?:think-lab|practice-lab|life-skills)\.js/);
  assert.match(sw, /'\.\/lazy-data\.js'/);
  const coreAssets = sw.match(/const CORE_ASSETS = \[([^\]]*)\];/)?.[1] || '';
  const lazyAssets = sw.match(/const LAZY_ASSETS = \[([^\]]*)\];/)?.[1] || '';
  assert.ok(coreAssets, 'service worker should define core offline assets');
  assert.ok(lazyAssets, 'service worker should define lazy offline assets');
  assert.ok(!coreAssets.includes("'./fluentia-directions-bank.js'"), 'Directions data should not be a core startup asset');
  for (const asset of ['data-expansion-translations.js','data-expansion-runtime.js','data-expansion-wotd.js', ...['vocabulary','spelling','grammar','story','listening','advanced'].map(game => 'data-expansion-' + game + '.js')]) { assert.ok(!coreAssets.includes("'./"+asset+"'")); assert.ok(lazyAssets.includes("'./"+asset+"'")); }
  assert.ok(lazyAssets.includes("'./fluentia-directions-bank.js'"), 'Directions data should be cached as a lazy asset after use');
  for (const asset of ['data-spot.js', 'data-typing.js']) {
    assert.ok(!coreAssets.includes("'./" + asset + "'"), asset + ' should not be a core startup asset');
    assert.ok(lazyAssets.includes("'./" + asset + "'"), asset + ' should be cached as a lazy asset after use');
  }
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.ok(app.includes("EPIPHANY_LAZY_LOAD(dataName)"));
  assert.match(app, /expansionGames\.has\(type\)[\s\S]*?EPIPHANY_LAZY_LOAD\(expansionGroup\)/, 'each game must await its own bank');
  assert.ok(app.includes("hydrateWritingPractice(type)"));
  const lazy = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  assert.ok(lazy.includes("spot: ['data-spot.js"));
  assert.ok(lazy.includes("typing: ['data-typing.js"));
  for (const asset of ['data-stories.js', 'data-world.js', 'data-world-sprites.js', 'fluentia-textwise-bank.js', 'fluentia-soundscape-bank.js', 'sound-maze-bank.js', 'sound-maze-content.js', 'word-forge-bank.js', 'think-lab.js', 'think-lab-progression.js', 'word-hunt-bank.js', 'word-hunt.js', 'codebreaker-bank.js', 'codebreaker.js', 'letter-grid-bank.js', 'letter-grid.js', 'fluentia-practice-bank.js', 'life-skills.js', 'data-translation-ar.js', 'data-translation-ar-fill.js']) {
    assert.ok(!coreAssets.includes("'./" + asset + "'"), asset + ' should not be a core startup asset');
  }
  for (const asset of ['resonance.css', 'life-skills.css', 'word-hunt.css', 'codebreaker.css', 'letter-grid.css']) {
    assert.ok(!coreAssets.includes("'./" + asset + "'"), asset + ' must not be part of the core cache');
    assert.ok(lazyAssets.includes("'./" + asset + "'"), asset + ' should be cached as a lazy offline asset');
  }
  for (const asset of ['fluentia-textwise-bank.js', 'fluentia-soundscape-bank.js', 'data-stories.js', 'data-world.js', 'data-world-registry.js', 'data-world-events.js', 'data-world-sprites.js', 'sound-maze-bank.js', 'sound-maze-content.js', 'word-forge-bank.js', 'think-lab.js', 'word-hunt-bank.js', 'word-hunt.js', 'codebreaker-bank.js', 'codebreaker.js', 'letter-grid-bank.js', 'letter-grid.js', 'fluentia-practice-bank.js', 'life-skills.js', 'language-detective-investigation.js']) {
    assert.ok(lazyAssets.includes("'./" + asset + "'"), asset + ' should be cached as a lazy offline asset');
  }
  assert.ok(!lazyAssets.includes("'./chain-reaction-bank.js'"), 'the private Chain Reaction answer bank must never be cached in the browser');
  assert.match(sw, /const cached = await cache\.match\(request\);\s*if \(cached\) return cached;/);
  assert.match(app, /window\.EPIPHANY_MERGE_AR_TRANSLATIONS = mergeArabicTranslationCatalog/);
  assert.ok(app.includes('function launchFluentiaActivity(activityId)') && app.includes("window.EPIPHANY_LAZY_LOAD('fluentia').then"), 'Home activity shortcuts must await the shared Fluentia bank before launch');
  assert.match(app, /textwiseSequenceBank: Array\.isArray\(window\.EPIPHANY_TEXTWISE_SEQUENCE_BANK\) \? window\.EPIPHANY_TEXTWISE_SEQUENCE_BANK : undefined/);
  assert.match(app, /soundscapeDictationBank: Array\.isArray\(window\.EPIPHANY_SOUNDSCAPE_DICTATION_BANK\) \? window\.EPIPHANY_SOUNDSCAPE_DICTATION_BANK : undefined/);
  assert.doesNotMatch(app, /if \(state\.helpArabic \|\| state\.translationEnabled\) ensureArabicTranslationCatalog\(\)/);
  assert.match(app, /if \(state\.helpArabic\) ensureArabicTranslationCatalog\(\)/);
  assert.match(app, /if \(state\.helpArabic\) ensureArabicTranslationCatalog\(\)/);
  assert.ok(lazyAssets.includes("'./data-translation-ar.js'"), 'Arabic translation catalogue should be available for offline reuse after it is requested');
  assert.ok(lazyAssets.includes("'./data-translation-ar-fill.js'"), 'Arabic translation fill should be available for offline reuse after it is requested');
});


test('Life Skills loads independently without Think Lab game banks', async () => {
  const requested = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'script');
      return { async: true, src: '', remove() {} };
    },
    head: {
      appendChild(script) {
        requested.push(script.src);
        queueMicrotask(() => script.onload());
      }
    }
  };
  const context = vm.createContext({ window: {}, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  await context.window.EPIPHANY_LAZY_LOAD('lifeskills');
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['life-skills.js']);
  assert.match(requested[0], /^life-skills\.js\?v=/);

  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const lifeSkills = fs.readFileSync(path.join(root, 'life-skills.js'), 'utf8');
  assert.match(app, /window\.EpiphanyThinkLab\s*=\s*\{/);
  assert.match(lifeSkills, /window\.EpiphanyThinkLab\.registerGame/);
  assert.match(lifeSkills, /window\.EpiphanyThinkLab\.getGameDifficulty/);
  assert.match(lifeSkills, /window\.EpiphanyThinkLab\.recordResult/);
});

test('failed lazy scripts are removed and can be retried', async () => {
  const requested = [];
  const scripts = [];
  const document = {
    createElement() {
      const script = { async: true, src: '', removed: false, remove() { this.removed = true; } };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const context = vm.createContext({ window: {}, document });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const failed = context.window.EPIPHANY_LAZY_LOAD('stories');
  await new Promise(resolve => setImmediate(resolve));
  scripts[0].onerror();
  await assert.rejects(failed, /Unable to load feature data: data-stories\.js/);
  assert.equal(scripts[0].removed, true);

  const retry = context.window.EPIPHANY_LAZY_LOAD('stories');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3);
  scripts[2].onload();
  await retry;
});


test('feature styles load only when requested', async () => {
  const requested = [];
  const links = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'link');
      const link = { rel: '', href: '', remove() {} };
      links.push(link);
      return link;
    },
    head: { appendChild(link) { requested.push(link.href); } }
  };
  const context = vm.createContext({ window: {}, document });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  assert.deepEqual(requested, []);
  const first = context.window.EPIPHANY_LAZY_STYLE('resonance');
  const second = context.window.EPIPHANY_LAZY_STYLE('resonance');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1);
  assert.match(requested[0], /^resonance\.css\?v=/);
  links[0].onload();
  await Promise.all([first, second]);
  const life = context.window.EPIPHANY_LAZY_STYLE('lifeskills');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);
  assert.match(requested[1], /^life-skills\.css\?v=/);
  links[1].onload();
  await life;
  const think = context.window.EPIPHANY_LAZY_STYLE('thinklab');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3);
  assert.match(requested[2], /^word-hunt\.css\?v=/);
  links[2].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 4);
  assert.match(requested[3], /^codebreaker\.css\?v=/);
  links[3].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 5);
  assert.match(requested[4], /^letter-grid\.css\?v=/);
  links[4].onload();
  await think;
});


test('navigation intent prefetches optional sections only when the adaptive policy allows it', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement(tag) {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const engine = { getPolicy: () => ({
    allowSpeculativePreload: true, deferNonEssentialWork: false
  }) };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: engine,
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  const target = { getAttribute: () => 'stories' };
  listeners['document:pointerover']({ type: 'pointerover', pointerType: 'mouse', target: { closest: () => target } });
  assert.equal(requested.length, 0, 'speculative work should wait for the short idle delay');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(requested[0], /^data-stories\.js\?/);
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);

  const constrained = { ...engine, getPolicy: () => ({
    allowSpeculativePreload: false, deferNonEssentialWork: true
  }) };
  window.EPIPHANY_ADAPTIVE_ENGINE = constrained;
  listeners['document:pointerover']({ type: 'pointerover', pointerType: 'mouse', target: { closest: () => ({ getAttribute: () => 'world' }) } });
  assert.equal(requested.length, 2, 'constrained devices must not prefetch optional sections');
});


test('optional lazy loads respect the adaptive concurrency limit', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement(tag) {
      const element = { tagName: tag, src: '', href: '', async: true, remove() {} };
      if (tag === 'script') scripts.push(element);
      return element;
    },
    head: { appendChild(element) {
      if (element.tagName === 'link') {
        Promise.resolve().then(() => element.onload && element.onload());
      } else {
        requested.push(element.src);
      }
    } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const intent = group => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => group }) }
  });
  intent('resonance');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['resonance.js']);

  intent('thinklab');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'the second optional load must wait for the concurrency slot');

  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['resonance.js', 'sound-maze-bank.js']);
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[2].split('?')[0], 'sound-maze-content.js');
  scripts[2].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[3].split('?')[0], 'word-connections-bank.js');
  scripts[3].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[4].split('?')[0], 'word-forge-bank.js');
  scripts[4].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[5].split('?')[0], 'word-hunt-bank.js');
  scripts[5].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[6].split('?')[0], 'think-lab-progression.js');
  scripts[6].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[7].split('?')[0], 'think-lab.js');
  scripts[7].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[8].split('?')[0], 'word-hunt.js');
  scripts[8].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[9].split('?')[0], 'codebreaker-bank.js');
  scripts[9].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[10].split('?')[0], 'codebreaker.js');
  scripts[10].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[11].split('?')[0], 'letter-grid-bank.js');
  scripts[11].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[12].split('?')[0], 'letter-grid.js');
  scripts[12].onload();
  await new Promise(resolve => setImmediate(resolve));


});

test('explicit navigation bypasses and promotes queued optional loads', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const intent = group => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => group }) }
  });
  intent('resonance');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  intent('thinklab');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['resonance.js']);

  const explicit = context.window.EPIPHANY_LAZY_LOAD('thinklab');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['resonance.js', 'sound-maze-bank.js'],
    'an explicit request must promote its matching queued prefetch immediately');

  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[2].split('?')[0], 'sound-maze-content.js');
  scripts[2].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[3].split('?')[0], 'word-connections-bank.js');
  scripts[3].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[4].split('?')[0], 'word-forge-bank.js');
  scripts[4].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[5].split('?')[0], 'word-hunt-bank.js');
  scripts[5].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[6].split('?')[0], 'think-lab-progression.js');
  scripts[6].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[7].split('?')[0], 'think-lab.js');
  scripts[7].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[8].split('?')[0], 'word-hunt.js');
  scripts[8].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[9].split('?')[0], 'codebreaker-bank.js');
  scripts[9].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[10].split('?')[0], 'codebreaker.js');
  scripts[10].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[11].split('?')[0], 'letter-grid-bank.js');
  scripts[11].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[12].split('?')[0], 'letter-grid.js');
  scripts[12].onload();
  await new Promise(resolve => setImmediate(resolve));


  await explicit;
  scripts[0].onload();
});


test('background optional loads pause while constrained, resume once, and never delay explicit navigation', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  let policy = { allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1 };
  const subscribers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement(tag) {
      const element = { tagName: tag, src: '', href: '', async: true, remove() {} };
      if (tag === 'script') scripts.push(element);
      return element;
    },
    head: { appendChild(element) {
      if (element.tagName === 'link') {
        Promise.resolve().then(() => element.onload && element.onload());
      } else {
        requested.push(element.src);
      }
    } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: {
      getPolicy: () => policy,
      subscribe(fn) { subscribers.push(fn); return () => {}; }
    },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  const intent = group => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => group }) }
  });

  intent('resonance');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['resonance.js']);

  intent('thinklab');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'the second optional load should wait for the concurrency slot');

  policy = { ...policy, allowSpeculativePreload: false, deferNonEssentialWork: true };
  subscribers.forEach(fn => fn());
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'queued optional work must remain paused while constrained');

  policy = { ...policy, allowSpeculativePreload: true, deferNonEssentialWork: false };
  subscribers.forEach(fn => fn());
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['resonance.js', 'sound-maze-bank.js'],
    'queued optional work should resume when conditions improve');
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[2].split('?')[0], 'sound-maze-content.js');
  scripts[2].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[3].split('?')[0], 'word-connections-bank.js');
  scripts[3].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[4].split('?')[0], 'word-forge-bank.js');
  scripts[4].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[5].split('?')[0], 'word-hunt-bank.js');
  scripts[5].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[6].split('?')[0], 'think-lab-progression.js');
  scripts[6].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[7].split('?')[0], 'think-lab.js');
  scripts[7].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[8].split('?')[0], 'word-hunt.js');
  scripts[8].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[9].split('?')[0], 'codebreaker-bank.js');
  scripts[9].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[10].split('?')[0], 'codebreaker.js');
  scripts[10].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[11].split('?')[0], 'letter-grid-bank.js');
  scripts[11].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[12].split('?')[0], 'letter-grid.js');
  scripts[12].onload();
  await new Promise(resolve => setImmediate(resolve));


  await new Promise(resolve => setImmediate(resolve));

  policy = { ...policy, allowSpeculativePreload: false, deferNonEssentialWork: true };
  const explicit = context.window.EPIPHANY_LAZY_LOAD('world');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[13].split('?')[0], 'data-world.js',
    'explicit navigation must bypass background deferral');
  scripts[13].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[14].split('?')[0], 'data-world-sprites.js');
  scripts[14].onload();
  await explicit;
});


test('failed feature recovery resumes the complete data group and clears after success', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const subscribers = [];
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const policy = { allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1 };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: {
      getPolicy: () => policy,
      subscribe(fn) { subscribers.push(fn); return () => {}; }
    },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const initial = context.window.EPIPHANY_LAZY_LOAD('stories');
  await new Promise(resolve => setImmediate(resolve));
  scripts[0].onerror();
  await assert.rejects(initial, /Unable to load feature data: data-stories\.js/);

  assert.equal(timers.length, 1, 'a failed group should schedule recovery automatically');
  assert.equal(timers[0].delay, 1000, 'the first recovery should use a short initial backoff');
  document.visibilityState = 'hidden';
  listeners['window:online']();
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'recovery must not run while the page is hidden');

  document.visibilityState = 'visible';
  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1, 'recovery should be rescheduled when the page becomes visible');
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'recovery should retry the failed first file');
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'recovery must continue with the remaining group files');
  scripts[2].onload();
  await new Promise(resolve => setImmediate(resolve));

  listeners['window:online']();
  subscribers.forEach(fn => fn());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'successful group recovery must clear its failure record');
});

test('failed feature styles recover as a complete style group', async () => {
  const requested = [];
  const links = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const link = { rel: '', href: '', remove() {} };
      links.push(link);
      return link;
    },
    head: { appendChild(link) { requested.push(link.href); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const initial = context.window.EPIPHANY_LAZY_STYLE('resonance');
  await new Promise(resolve => setImmediate(resolve));
  links[0].onerror();
  await assert.rejects(initial, /Unable to load feature styles: resonance\.css/);

  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1);
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'visibility recovery should retry the failed stylesheet');
  links[1].onload();
  await new Promise(resolve => setImmediate(resolve));

  listeners['window:online']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'successful style recovery must clear its failure record');
});

test('feature-group recovery is deduplicated and stops after two recovery attempts', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const initial = context.window.EPIPHANY_LAZY_LOAD('world');
  await new Promise(resolve => setImmediate(resolve));
  scripts[0].onerror();
  await assert.rejects(initial, /Unable to load feature data/);

  listeners['window:online']();
  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1, 'multiple recovery signals should share one scheduled retry');
  assert.equal(timers[0].delay, 1000);
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'the first bounded recovery attempt should start once');
  scripts[1].onerror();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1, 'a failed retry should schedule the second attempt');
  assert.equal(timers[0].delay, 4000, 'the second recovery should use a longer backoff');

  listeners['window:online']();
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'one further group recovery attempt should be allowed');
  scripts[2].onerror();
  await new Promise(resolve => setImmediate(resolve));

  listeners['window:online']();
  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'group recovery must stop after the bounded retry budget');
});

test('Think Lab CEFR bridge reads the active assessed or developer test level', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(app, /getCEFRLevel\(\)\s*\{\s*const level = currentLevel\(\);\s*return level && LEVELS\.some\(item => item\.id === level\.id\) \? level\.id : 'A1';/);
  const think = fs.readFileSync(path.join(root, 'think-lab.js'), 'utf8');
  assert.match(think, /bridge\.getCEFRLevel\(\)/);
  assert.match(think, /functions\.invoke\(functionName/);
  assert.match(think, /validatorFunctionName/);
  assert.match(think, /if \(id === 'odd'\) return \[\]/);
  assert.doesNotMatch(think, /EPIPHANY_ODD_ONE_OUT_BANK/);
  assert.match(think, /This round is shorter than the '\+roundTarget\+'-question target/);
});


test('Language Detective lazy load rejects scripts that load without initializing required globals and can retry', async () => {
  const requested = [];
  const scripts = [];
  const document = {
    createElement() {
      const script = {
        async: true, src: '', removed: false,
        getAttribute(name) { return name === 'src' ? this.src : null; },
        remove() { this.removed = true; }
      };
      scripts.push(script);
      return script;
    },
    querySelectorAll() { return scripts; },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const context = vm.createContext({ window: {}, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const failed = context.window.EPIPHANY_LAZY_LOAD('languageDetective');
  for (let i = 0; i < 6; i++) {
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(scripts[i], 'expected language module ' + (i + 1) + ' to be requested');
    scripts[i].onload();
  }
  await assert.rejects(failed, /did not initialize/);
  assert.equal(requested.length, 6);
  assert.ok(scripts.every(script => script.removed), 'failed group scripts should be invalidated for a clean retry');

  const retry = context.window.EPIPHANY_LAZY_LOAD('languageDetective');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 7);
  assert.match(requested[6], /^language-detective-assessment-schemas\.js\?/);
  scripts[6].onerror();
  await assert.rejects(retry, /Unable to load feature data/);
});

test('Language Detective lazy load resolves only after every required module is ready', async () => {
  const requested = [];
  const scripts = [];
  const document = {
    createElement() {
      const script = { async: true, src: '', getAttribute(name) { return name === 'src' ? this.src : null; }, remove() {} };
      scripts.push(script);
      return script;
    },
    querySelectorAll() { return scripts; },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {};
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const loading = window.EPIPHANY_LAZY_LOAD('languageDetective');
  for (let i = 0; i < 6; i++) {
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(scripts[i]);
    if (i === 4) {
      window.EPIPHANY_LANGUAGE_DETECTIVE_SCHEMAS = { validateEvaluationRequest() {} };
      window.EPIPHANY_LANGUAGE_DETECTIVE_CEFR = { getCefrProfile() {} };
      window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE = { evaluate() {} };
      window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES = { cases: { 'CASE-001': {} } };
      window.EPIPHANY_LANGUAGE_DETECTIVE = { available: true, mount() {} };
    }
    scripts[i].onload();
  }
  await loading;
  assert.equal(requested.length, 6);
  assert.equal(window.EPIPHANY_LANGUAGE_DETECTIVE.available, true);
});


test('concurrent requests for the same feature group share one complete loading promise', async () => {
  const requested = [];
  const scripts = [];
  const document = {
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const context = vm.createContext({ window: {}, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const first = context.window.EPIPHANY_LAZY_LOAD('stories');
  const second = context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.equal(first, second, 'concurrent callers should receive the same in-flight group promise');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'the first file should be requested once');
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'the second file should follow the first exactly once');
  scripts[1].onload();
  await Promise.all([first, second]);
  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.equal(requested.length, 2, 'a completed group should not be downloaded again');
});

test('scheduled speculative prefetch is cancelled while hidden and can resume when visible', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) {
      const timer = { fn, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearTimeout(timer) { if (timer) timer.cleared = true; }
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const target = { getAttribute: () => 'stories' };
  listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse', target: { closest: () => target }
  });
  assert.equal(timers.length, 1);
  document.visibilityState = 'hidden';
  listeners['document:visibilitychange']();
  assert.equal(timers[0].cleared, true, 'hiding the page should cancel the scheduled idle timer');
  timers[0].fn();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 0, 'a stale timer must not start background work while hidden');

  document.visibilityState = 'visible';
  listeners['document:visibilitychange']();
  assert.equal(timers.length, 2, 'the last navigation intent should be rescheduled on return');
  timers[1].fn();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'speculative work should resume only after the page is visible');
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  scripts[1].onload();
});


test('speculative navigation keeps only the latest pending section intent', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) {
      const timer = { fn, cleared: false };
      timers.push(timer);
      return timer;
    },
    clearTimeout(timer) { if (timer) timer.cleared = true; }
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const intent = view => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => view }) }
  });
  intent('stories');
  intent('world');
  assert.equal(timers.length, 2);
  assert.equal(timers[0].cleared, true, 'the previous section intent should be cancelled');
  assert.equal(timers[1].cleared, false, 'the latest section intent should remain scheduled');

  timers[0].fn();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 0, 'a cancelled stale intent must not load its section');

  timers[1].fn();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['data-world.js']);
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[1].split('?')[0], 'data-world-sprites.js');
  scripts[1].onload();
});


test('per-game expansion modules register isolated CEFR banks and preserve shared data', () => {
  const games=['vocabulary','spelling','grammar','story','listening','advanced'];
  const context=vm.createContext({GAMES:Object.fromEntries(games.map(g=>[g,{questions:[{id:'base-'+g,level:'A1',q:'Base '+g,sub:'Choose',answers:['a','b'],correct:0}]}])),WOTD_WORDS:[],window:{},Object,Map,Set,Number,String,Array});
  for(const file of ['data-expansion-translations.js','data-expansion-runtime.js','data-expansion-wotd.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  assert.equal(context.WOTD_WORDS.length,60);
  vm.runInContext(fs.readFileSync(path.join(root,'data-expansion-vocabulary.js'),'utf8'),context);
  assert.ok(context.GAMES.vocabulary.questions.length>1);
  for(const g of games.slice(1))assert.equal(context.GAMES[g].questions.length,1,g+' should not load with vocabulary');
  for(const g of games.slice(1))vm.runInContext(fs.readFileSync(path.join(root,'data-expansion-'+g+'.js'),'utf8'),context);
  for(const g of games){const qs=context.GAMES[g].questions;assert.equal(context.window.EPIPHANY_EXPANSION_BANKS[g],true);assert.ok(['A1','A2','B1','B2','C1','C2'].every(level=>qs.some(q=>q.level===level)));assert.ok(qs.every(q=>!q.answers_ar||q.answers_ar.length===q.answers.length));assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);}
  assert.equal(context.window.EpiphanyExpansion.addedWords,60);
  assert.equal(context.window.EpiphanyExpansion.extraQuestions,730);
});


test('lazy loader reports load lifecycle and bounded retry events through the optional diagnostics bridge', () => {
  const source = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  assert.match(source, /function diagnosticRecord\(type, details\)/);
  assert.match(source, /diagnosticRecord\('load_queued'/);
  assert.match(source, /diagnosticRecord\('load_started'/);
  assert.match(source, /diagnosticRecord\('load_succeeded'/);
  assert.match(source, /diagnosticRecord\('load_failed'/);
  assert.match(source, /diagnosticRecord\('retry_scheduled'/);
  assert.match(source, /diagnosticRecord\('retry_started'/);
});
