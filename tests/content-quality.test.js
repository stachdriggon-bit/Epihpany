const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function loadData() {
  const context = vm.createContext({ console, window: {} });
  const files = ['data.js', 'data-wotd.js', 'data-expansion.js', 'data-stories.js', 'data-stories-expansion.js'];
  for (const file of files) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    const source = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(source, context, { filename: file, timeout: 5000 });
  }
  return vm.runInContext(`({
    games: typeof GAMES !== 'undefined' ? GAMES : {},
    stories: typeof STORIES !== 'undefined' ? STORIES : [],
    words: typeof WOTD_WORDS !== 'undefined' ? WOTD_WORDS : []
  })`, context);
}

function clean(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('en')
    .replace(/[“”‘’"']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function describeQuestion(q) {
  return q.id || q.q || q.question || '(question without text)';
}

test('question banks have valid answer choices and correct-answer indexes', () => {
  const { games } = loadData();
  const errors = [];
  let count = 0;
  for (const [gameName, game] of Object.entries(games)) {
    for (const [index, q] of (game.questions || []).entries()) {
      count++;
      const where = `${gameName}.questions[${index}] (${describeQuestion(q)})`;
      if (!String(q.q || q.question || '').trim()) errors.push(`${where}: missing question text`);
      if (!Array.isArray(q.answers) || q.answers.length < 2) {
        errors.push(`${where}: expected at least two answer choices`);
        continue;
      }
      if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.answers.length) {
        errors.push(`${where}: correct index ${q.correct} is outside 0..${q.answers.length - 1}`);
      } else if (!String(q.answers[q.correct] ?? '').trim()) {
        errors.push(`${where}: the correct answer choice is empty`);
      }
      if (q.answers.some(a => !String(a ?? '').trim())) errors.push(`${where}: one or more answer choices are empty`);
      if (q.explain !== undefined && !String(q.explain).trim()) errors.push(`${where}: explanation is present but empty`);
    }
  }
  assert.ok(count > 0, 'No game questions were loaded; check data script names and globals.');
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('question banks do not repeat the same question within a game', () => {
  const { games } = loadData();
  const duplicates = [];
  for (const [gameName, game] of Object.entries(games)) {
    const seen = new Map();
    for (const [index, q] of (game.questions || []).entries()) {
      const prompt = clean(q.q || q.question);
      if (!prompt) continue;
      const options = Array.isArray(q.answers) ? q.answers.map(clean).sort().join('|') : '';
      const key = prompt + '|' + options;
      if (seen.has(key)) duplicates.push(`${gameName}: question ${index + 1} duplicates question ${seen.get(key) + 1}: ${q.q || q.question}`);
      else seen.set(key, index);
    }
  }
  assert.deepEqual(duplicates, [], duplicates.join('\\n'));
});

test('story decisions have meaningful options and no empty Arabic translation fields', () => {
  const { stories } = loadData();
  assert.ok(Array.isArray(stories) && stories.length > 0, 'No stories loaded; check story data script names and globals.');
  const errors = [];
  for (const [index, story] of stories.entries()) {
    const where = `story[${index}] ${story.id || story.title || '(untitled)'}`;
    if (!String(story.title || '').trim()) errors.push(`${where}: missing title`);
    for (const [pageIndex, page] of (story.pages || []).entries()) {
      if (page.ar !== undefined && !String(page.ar).trim()) errors.push(`${where}: page ${pageIndex + 1} has an empty Arabic translation`);
    }
    const decision = story.decision;
    if (decision) {
      if (!Array.isArray(decision.options) || decision.options.length < 2) errors.push(`${where}: decision needs at least two options`);
      for (const [optionIndex, option] of (decision.options || []).entries()) {
        if (!String(option.text || '').trim()) errors.push(`${where}: option ${optionIndex + 1} has no text`);
        if (option.text_ar !== undefined && !String(option.text_ar).trim()) errors.push(`${where}: option ${optionIndex + 1} has an empty Arabic translation`);
        if (option.response_ar !== undefined && !String(option.response_ar).trim()) errors.push(`${where}: option ${optionIndex + 1} has an empty Arabic response`);
      }
      if (decision.prompt_ar !== undefined && !String(decision.prompt_ar).trim()) errors.push(`${where}: decision prompt has an empty Arabic translation`);
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('explicit Arabic translation fields are never blank', () => {
  const { games } = loadData();
  const errors = [];
  for (const [gameName, game] of Object.entries(games)) {
    for (const [index, q] of (game.questions || []).entries()) {
      const where = `${gameName}.questions[${index}] (${describeQuestion(q)})`;
      for (const key of ['q_ar', 'sub_ar', 'explain_ar', 'why_ar', 'ar']) {
        if (Object.prototype.hasOwnProperty.call(q, key) && typeof q[key] === 'string' && q[key] !== '' && !q[key].trim()) {
          errors.push(`${where}: ${key} is explicitly present but empty`);
        }
      }
      if (Object.prototype.hasOwnProperty.call(q, 'answers_ar')) {
        if (!Array.isArray(q.answers_ar) || q.answers_ar.length !== (q.answers || []).length) {
          errors.push(`${where}: answers_ar must match the number of answer choices`);
        } else if (q.answers_ar.some(answer => !String(answer ?? '').trim())) {
          errors.push(`${where}: answers_ar contains an empty translation`);
        }
      }
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});


test('Word of the Day entries have complete Arabic meanings and examples', () => {
  const { words } = loadData();
  assert.ok(Array.isArray(words) && words.length > 0, 'No Word of the Day entries loaded.');
  const errors = [];
  for (const [index, item] of words.entries()) {
    const where = `WOTD[${index}] ${item.word || '(untitled)'}`;
    for (const key of ['word', 'meaning', 'example', 'meaning_ar', 'example_ar']) {
      if (!String(item[key] ?? '').trim()) errors.push(`${where}: missing ${key}`);
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('every story page has English text and a non-empty Arabic translation', () => {
  const { stories } = loadData();
  const errors = [];
  for (const [storyIndex, story] of stories.entries()) {
    const where = `story[${storyIndex}] ${story.id || story.title || "(untitled)"}`;
    if (!Array.isArray(story.pages) || story.pages.length === 0) {
      errors.push(`${where}: expected at least one story page`);
      continue;
    }
    for (const [pageIndex, page] of story.pages.entries()) {
      const isTuple = Array.isArray(page);
      const english = isTuple ? page[1] : page && page.text;
      const arabic = isTuple ? page[2] : page && page.ar;
      if (!String(english || '').trim()) errors.push(`${where}: page ${pageIndex + 1} has no English text`);
      if (!String(arabic || '').trim()) errors.push(`${where}: page ${pageIndex + 1} has no Arabic translation`);
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('every story has a non-empty comprehension question bank', () => {
  const { stories } = loadData();
  const errors = [];
  for (const [index, story] of stories.entries()) {
    const where = `story[${index}] ${story.id || story.title || "(untitled)"}`;
    if (!Array.isArray(story.questions) || story.questions.length === 0) {
      errors.push(`${where}: missing comprehension questions`);
      continue;
    }
    for (const [questionIndex, question] of story.questions.entries()) {
      if (Array.isArray(question)) {
        if (!String(question[0] || '').trim()) errors.push(`${where}: question ${questionIndex + 1} has no prompt`);
        if (!Array.isArray(question[1]) || question[1].length < 2) errors.push(`${where}: question ${questionIndex + 1} needs at least two answer choices`);
        if (!Number.isInteger(question[2]) || question[2] < 0 || question[2] >= (question[1] || []).length) errors.push(`${where}: question ${questionIndex + 1} has an invalid answer index`);
      } else {
        if (!String(question.q || question.question || '').trim()) errors.push(`${where}: question ${questionIndex + 1} has no prompt`);
        const answers = question.answers || question.options;
        if (!Array.isArray(answers) || answers.length < 2) errors.push(`${where}: question ${questionIndex + 1} needs at least two answer choices`);
        const correct = question.correct ?? question.answer;
        if (!Number.isInteger(correct) || correct < 0 || correct >= (answers || []).length) errors.push(`${where}: question ${questionIndex + 1} has an invalid answer index`);
      }
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('story comprehension questions do not reveal a fixed correct-answer position', () => {
  const { stories } = loadData();
  const positions = new Map();
  let count = 0;
  const fixedStories = [];
  for (const story of stories) {
    const storyPositions = new Set();
    let storyQuestionCount = 0;
    for (const question of story.questions || []) {
      const answers = Array.isArray(question) ? question[1] : (question.answers || question.options);
      const correct = Array.isArray(question) ? question[2] : (question.correct ?? question.answer);
      if (!Array.isArray(answers) || !Number.isInteger(correct) || correct < 0 || correct >= answers.length) continue;
      positions.set(correct, (positions.get(correct) || 0) + 1);
      storyPositions.add(correct);
      storyQuestionCount++;
      count++;
    }
    if (storyQuestionCount >= 3 && storyPositions.size < 2) {
      fixedStories.push(story.id || story.title || '(untitled story)');
    }
  }
  assert.ok(count >= 3, 'Expected a meaningful story comprehension question bank.');
  assert.ok(positions.size >= 2, 'Correct answers must not always occupy the same position.');
  const largestGroup = Math.max(...positions.values());
  assert.ok(largestGroup / count < 0.8, 'One correct-answer position dominates the story question bank.');
  assert.deepEqual(fixedStories, [], `Stories must vary correct-answer positions within each question bank: ${fixedStories.join(', ')}`);
});

test('story comprehension questions include explanations and distinct answer choices', () => {
  const { stories } = loadData();
  const errors = [];
  for (const [storyIndex, story] of stories.entries()) {
    const storyName = story.id || story.title || `story[${storyIndex}]`;
    for (const [questionIndex, question] of (story.questions || []).entries()) {
      const tuple = Array.isArray(question);
      const prompt = tuple ? question[0] : (question.q || question.question);
      const answers = tuple ? question[1] : (question.answers || question.options);
      const explanation = tuple ? question[3] : (question.explain || question.explanation);
      const where = `${storyName} question ${questionIndex + 1} (${prompt || 'no prompt'})`;
      if (!String(explanation || '').trim()) errors.push(`${where}: missing explanation`);
      if (!Array.isArray(answers)) continue;
      const normalized = answers.map(clean);
      if (normalized.some(answer => !answer)) errors.push(`${where}: contains an empty answer choice`);
      if (new Set(normalized).size !== normalized.length) errors.push(`${where}: contains duplicate answer choices`);
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('story vocabulary questions are grounded in the story or its vocabulary list', () => {
  const { stories } = loadData();
  const errors = [];
  for (const [storyIndex, story] of stories.entries()) {
    const storyName = story.id || story.title || `story[${storyIndex}]`;
    const pageText = (story.pages || []).map(page => Array.isArray(page) ? page[1] : page && page.text).join(' ').toLocaleLowerCase('en');
    const vocab = story.vocab || {};
    const vocabTerms = (Array.isArray(vocab)
      ? vocab.map(item => item && (item.word || item.term || item.name)).filter(Boolean)
      : Object.keys(vocab)).join(' ').toLocaleLowerCase('en');
    for (const [questionIndex, question] of (story.questions || []).entries()) {
      const prompt = Array.isArray(question) ? question[0] : (question.q || question.question || '');
      const match = String(prompt).match(/what does [“"'](.+?)[”"'] mean/i);
      if (!match) continue;
      const term = match[1].toLocaleLowerCase('en');
      if (!pageText.includes(term) && !vocabTerms.includes(term)) {
        errors.push(`${storyName} question ${questionIndex + 1}: vocabulary term "${match[1]}" appears in neither the story nor its vocabulary list`);
      }
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('story page Arabic translations contain Arabic-script text', () => {
  const { stories } = loadData();
  const errors = [];
  for (const [storyIndex, story] of stories.entries()) {
    const storyName = story.id || story.title || `story[${storyIndex}]`;
    for (const [pageIndex, page] of (story.pages || []).entries()) {
      const arabic = Array.isArray(page) ? page[2] : page && page.ar;
      if (String(arabic || '').trim() && !/[\u0600-\u06FF]/.test(arabic)) {
        errors.push(`${storyName} page ${pageIndex + 1}: Arabic translation contains no Arabic-script text`);
      }
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});


test('story answer shuffling keeps Arabic options paired with their English choices', () => {
  const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const match = appSource.match(/function prepareStoryQuestions\(story\)\{[\s\S]*?\n  \}/);
  assert.ok(match, 'Could not locate prepareStoryQuestions in app.js');
  const prepareStoryQuestions = vm.runInNewContext(match[0] + '; prepareStoryQuestions', {
    Math: { random: () => 0.42, floor: Math.floor }
  });
  const originalAnswers = ['Check the date', 'Move the storehouse', 'Ignore the records'];
  const originalArabic = ['تحقّق من التاريخ', 'انقل المخزن', 'تجاهل السجلات'];
  const prepared = prepareStoryQuestions({
    questions: [{
      q: 'What should they do?',
      answers: originalAnswers,
      answers_ar: originalArabic,
      correct: 0,
      explain: 'Check the date first.'
    }]
  }).questions[0];
  assert.equal(prepared.answers_ar[prepared.correct], originalArabic[0], 'The correct Arabic answer must follow the correct English answer.');
  for (const [index, answer] of prepared.answers.entries()) {
    const originalIndex = originalAnswers.indexOf(answer);
    assert.notEqual(originalIndex, -1, 'Shuffling must preserve each original English answer.');
    assert.equal(prepared.answers_ar[index], originalArabic[originalIndex], 'Each Arabic answer must stay paired with its English answer.');
  }
});


test('Low-Water Shore world-story arc has six complete bilingual episodes', () => {
  const { stories } = loadData();
  const arc = stories.filter(story => story.lore && story.lore.seriesId === 'low-water-shore');
  assert.equal(arc.length, 6, 'Expected exactly six Low-Water Shore episodes.');
  const errors = [];
  const episodeNumbers = arc.map(story => story.lore.episode).sort((a, b) => a - b);
  if (episodeNumbers.join(',') !== '1,2,3,4,5,6') errors.push('Episode numbers must be exactly 1 through 6.');
  for (const story of arc) {
    const where = story.id;
    if (story.lore.placeId !== 'OR-LOC-02') errors.push(where + ': must reference the single Low-Water Shore place ID.');
    if (story.level !== 'B1') errors.push(where + ': expected B1 level for the pilot arc.');
    if (!story.season || story.season.episode !== story.lore.episode) errors.push(where + ': season metadata does not match the lore episode.');
    for (const [index, question] of (story.questions || []).entries()) {
      const label = where + ' question ' + (index + 1);
      if (!String(question.q_ar || '').trim()) errors.push(label + ': missing Arabic prompt.');
      if (!String(question.explain_ar || '').trim()) errors.push(label + ': missing Arabic explanation.');
      if (!Array.isArray(question.answers_ar) || question.answers_ar.length !== (question.answers || []).length) {
        errors.push(label + ': Arabic options must align one-to-one with English options.');
      }
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});


test('world archive event records use stable place/story IDs and preserve unknown dates', () => {
  const source = fs.readFileSync(path.join(root, 'data-world-events.js'), 'utf8');
  const context = vm.createContext({ window: {} });
  vm.runInContext(source, context, { filename: 'data-world-events.js', timeout: 5000 });
  const events = context.window.EPIPHANY_WORLD_EVENTS;
  const knownStoryIds = new Set(loadData().stories.map(story => story.id));
  assert.equal(events.length, 6, 'Pilot archive should expose six event records.');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const lazy = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  assert.match(html, /data-view="chronicle"/, 'World Archive must be reachable from navigation.');
  assert.match(html, /id="chronicle-view"/, 'World Archive needs a registered view container.');
  assert.match(lazy, /chronicle:\s*\['data-world-events\.js/, 'Archive data must be lazy-loaded.');
  assert.match(app, /function renderChronicle\s*\(/, 'Archive view needs a renderer.');
  assert.match(app, /data-story-open/ , 'Archive entries need a route back to stories.');
  const ids = new Set(), errors = [];
  for (const event of events) {
    if (!event.id || ids.has(event.id)) errors.push('Event IDs must be present and unique.');
    ids.add(event.id);
    if (event.placeId !== 'OR-LOC-02') errors.push(event.id + ': unexpected place ID.');
    if (!Array.isArray(event.storyIds) || event.storyIds.length !== 1) errors.push(event.id + ': must link to an existing story.');
    for (const storyId of event.storyIds || []) if (!knownStoryIds.has(storyId)) errors.push(event.id + ': unknown story link ' + storyId + '.');
    if (event.date?.kind !== 'unknown' || event.date?.label !== 'Date not established') errors.push(event.id + ': must not invent a date.');
    if (event.status !== 'provisional') errors.push(event.id + ': pilot entries must remain provisional.');
    if (!String(event.summary || '').trim()) errors.push(event.id + ': missing summary.');
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});


test('Low-Water Shore stories expose explicit place and unknown-date metadata', () => {
  const { stories } = loadData();
  const arc = stories.filter(story => story.lore && story.lore.seriesId === 'low-water-shore');
  assert.equal(arc.length, 6);
  for (const story of arc) {
    assert.equal(story.lore.placeId, 'OR-LOC-02');
    assert.equal(story.lore.placeName, 'The Low-Water Shore');
    assert.equal(story.lore.dateLabel, 'Date not established');
  }
});


test('World Archive navigation is registered with its view and lazy data group', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const lazy = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  const navigation = fs.readFileSync(path.join(root, 'navigation-enhancements.js'), 'utf8');
  assert.match(html, /data-view="chronicle"/);
  assert.match(html, /id="chronicle-view"/);
  assert.match(app, /if \(name === 'chronicle'\) renderChronicle\(\)/);
  assert.match(app, /function renderChronicle\(\)/);
  assert.match(lazy, /chronicle:\s*\['data-world-events\.js\?/);
  assert.match(navigation, /chronicle:\s*'World Archive'/);
});
