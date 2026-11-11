const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const games = ['vocabulary', 'spelling', 'grammar', 'story', 'listening', 'advanced'];
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

test('expansion banks preserve question structure, CEFR coverage, and Arabic explanations', () => {
  const context = vm.createContext({
    GAMES: Object.fromEntries(games.map(game => [game, {
      questions: [{
        id: 'base-' + game,
        level: 'A1',
        q: 'Base question for ' + game,
        sub: 'Choose the best answer.',
        answers: ['One', 'Two', 'Three', 'Four'],
        correct: 0,
        explain: 'Base explanation'
      }]
    }])),
    WOTD_WORDS: [],
    window: {},
    Object,
    Map,
    Set,
    Number,
    String,
    Array
  });

  for (const file of [
    'data-expansion-translations.js',
    'data-expansion-runtime.js',
    'data-expansion-wotd.js',
    ...games.map(game => 'data-expansion-' + game + '.js')
  ]) {
    vm.runInContext(
      fs.readFileSync(path.join(root, file), 'utf8'),
      context,
      { filename: file }
    );
  }

  assert.equal(context.WOTD_WORDS.length, 60, 'all shared Word of the Day additions should register');

  for (const game of games) {
    const questions = context.GAMES[game].questions.filter(question =>
      question && question.id && question.id.startsWith('exp-')
    );

    assert.equal(context.window.EPIPHANY_EXPANSION_BANKS[game], true);
    assert.ok(questions.length >= 60, game + ' should retain its complete expansion bank');
    assert.equal(new Set(questions.map(question => question.id)).size, questions.length,
      game + ' should have unique question IDs');

    for (const level of levels) {
      assert.ok(
        questions.some(question => question.level === level),
        game + ' should include ' + level + ' questions'
      );
    }

    for (const question of questions) {
      assert.ok(question.q && typeof question.q === 'string', game + ' question text should be present');
      assert.ok(question.explain && typeof question.explain === 'string', game + ' explanation should be present');
      assert.ok(Array.isArray(question.answers) && question.answers.length >= 2,
        game + ' should provide answer choices');
      assert.ok(Number.isInteger(question.correct) &&
        question.correct >= 0 && question.correct < question.answers.length,
      game + ' should have a valid correct-answer index');

      if (question.answers_ar) {
        assert.equal(question.answers_ar.length, question.answers.length,
          game + ' Arabic choices must remain aligned with English choices');
      }
    }
  }

  const spelling = context.GAMES.spelling.questions.filter(question =>
    question && question.id && question.id.startsWith('exp-')
  );
  assert.ok(spelling.every(question => question.explain_ar),
    'Arabic explanation strings supplied by the spelling bank must not be discarded');

  const advanced = context.GAMES.advanced.questions.filter(question =>
    question && question.id && question.id.startsWith('exp-')
  );
  assert.ok(advanced.some(question => question.explain_ar),
    'Arabic explanation strings supplied by the advanced bank must be preserved');

  const expectedExpansionCount = games.reduce((total, game) => total +
    context.GAMES[game].questions.filter(question =>
      question && question.id && question.id.startsWith('exp-')
    ).length, 0);
  assert.equal(context.window.EpiphanyExpansion.extraQuestions, expectedExpansionCount,
    'expansion diagnostics must report the real number of registered expansion questions');
});
