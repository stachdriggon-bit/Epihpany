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
      const key = clean(q.q || q.question);
      if (!key) continue;
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
