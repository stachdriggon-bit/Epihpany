const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');
const bankBlock = source.match(/const ladderWordBank = new Set\(\s*`([\s\S]*?)`\s*\.trim\(\)\.split\(/);
assert.ok(bankBlock, 'Word Ladder word bank should exist');
const words = new Set(bankBlock[1].trim().split(/\s+/));

function differsByOne(a, b) {
  return a.length === b.length && a !== b &&
    [...a].filter((letter, index) => letter !== b[index]).length === 1;
}

function findPath(start, goal, blocked = new Set()) {
  if (!words.has(start) || !words.has(goal)) return null;
  const queue = [[start]];
  const visited = new Set([start]);
  while (queue.length) {
    const current = queue.shift();
    const last = current[current.length - 1];
    for (const candidate of words) {
      if (visited.has(candidate) ||
          (blocked.has(candidate) && candidate !== goal) ||
          !differsByOne(last, candidate)) continue;
      const next = [...current, candidate];
      if (candidate === goal) return next;
      visited.add(candidate);
      queue.push(next);
    }
  }
  return null;
}

const staticBlock = source.match(/rounds\.wordladder\s*=\s*\[([\s\S]*?)\n  \];/);
assert.ok(staticBlock, 'Fallback Word Ladder puzzles should exist');
const staticPuzzles = [...staticBlock[1].matchAll(
  /\{start:'([^']+)',goal:'([^']+)',path:\[([^\]]*)\]/g
)].map(match => ({
  start: match[1],
  goal: match[2],
  path: [...match[3].matchAll(/'([^']+)'/g)].map(wordMatch => wordMatch[1])
}));

test('every fallback Word Ladder has a real, valid full route', () => {
  assert.ok(staticPuzzles.length >= 6, 'At least six fallback puzzles are expected');
  for (const puzzle of staticPuzzles) {
    const route = [puzzle.start, ...puzzle.path];
    assert.ok(words.has(puzzle.start), `Missing start word: ${puzzle.start}`);
    assert.ok(words.has(puzzle.goal), `Missing goal word: ${puzzle.goal}`);
    assert.equal(route.at(-1), puzzle.goal, `${puzzle.start} must end at ${puzzle.goal}`);
    for (let i = 1; i < route.length; i++) {
      assert.ok(words.has(route[i]), `Missing route word: ${route[i]}`);
      assert.ok(differsByOne(route[i - 1], route[i]),
        `Invalid step in ${puzzle.start} → ${puzzle.goal}: ${route[i - 1]} → ${route[i]}`);
    }
  }
});

test('the lake-to-belt example has a complete route in the word bank', () => {
  const route = findPath('lake', 'belt');
  assert.ok(route, 'LAKE must be connected to BELT');
  assert.equal(route[0], 'lake');
  assert.equal(route.at(-1), 'belt');
  for (let i = 1; i < route.length; i++) {
    assert.ok(differsByOne(route[i - 1], route[i]));
  }
});

test('every bank word is defined and can take part in at least one ladder', () => {
  const meaningsBlock = source.match(/const ladderMeanings = \{([\s\S]*?)\n  \};/);
  assert.ok(meaningsBlock, 'Word Ladder meanings should exist');
  const definedWords = new Set([...meaningsBlock[1].matchAll(/^\s*([a-z]+):/gm)].map(match => match[1]));

  for (const word of words) {
    assert.ok(definedWords.has(word), `Missing definition for ${word}`);
    assert.ok([...words].some(candidate => differsByOne(word, candidate)),
      `${word} is isolated and cannot be used in a ladder`);
  }
});

test('difficulty bands are distinct and each can generate enough solvable puzzles', () => {
  const ranges = {
    guided: [1, 2],
    steady: [3, 4],
    challenge: [5, 7]
  };
  const generatorBlock = source.match(/function generateWordLadders\(level, count = 12\) \{([\s\S]*?)\n    const candidates/);
  assert.ok(generatorBlock, 'Word Ladder generator should exist');
  assert.match(generatorBlock[1], /const minSteps = level === 'challenge' \? 5 : level === 'steady' \? 3 : 1;/);
  assert.match(generatorBlock[1], /const maxSteps = level === 'guided' \? 2 : level === 'steady' \? 4 : 7;/);

  const occupiedSteps = new Set();

  for (const [level, [minSteps, maxSteps]] of Object.entries(ranges)) {
    for (let steps = minSteps; steps <= maxSteps; steps++) {
      assert.ok(!occupiedSteps.has(steps), `Step count ${steps} overlaps difficulty bands`);
      occupiedSteps.add(steps);
    }
    let count = 0;
    for (const start of words) {
      const distances = new Map([[start, 0]]);
      const queue = [start];
      while (queue.length) {
        const current = queue.shift();
        for (const candidate of words) {
          if (distances.has(candidate) || !differsByOne(current, candidate)) continue;
          distances.set(candidate, distances.get(current) + 1);
          queue.push(candidate);
        }
      }
      for (const [goal, steps] of distances) {
        if (goal === start || steps < minSteps || steps > maxSteps) continue;
        count++;
      }
    }
    assert.ok(count >= 12, `Expected at least 12 solvable ${level} puzzles, found ${count}`);
  }

  assert.deepEqual(ranges, {
    guided: [1, 2],
    steady: [3, 4],
    challenge: [5, 7]
  });
});

test('the expanded bank adds 40 unique, defined, connected words', () => {
  const additions = ["beat","cake","cane","hall","live","well","bake","cave","cell","fame","fate","felt","hire","lend","life","name","nest","rate","rent","rest","wing","bill","cage","cape","file","fill","find","firm","full","gave","mail","meal","mile","paid","park","past","pile","save","seat","sell"];
  assert.equal(additions.length, 40);
  assert.equal(new Set(additions).size, 40);
  const meaningsBlock = source.match(/const ladderMeanings = \{([\s\S]*?)\n  \};/);
  assert.ok(meaningsBlock, 'Word Ladder meanings should exist');
  const definedWords = new Set([...meaningsBlock[1].matchAll(/^\s*([a-z]+):/gm)].map(match => match[1]));
  for (const word of additions) {
    assert.ok(words.has(word), `Missing added word: ${word}`);
    assert.ok(definedWords.has(word), `Missing definition for added word: ${word}`);
    assert.ok([...words].some(candidate => differsByOne(word, candidate)), `${word} is isolated`);
  }
});

test('generated ladders avoid recently used pairs across sessions', () => {
  assert.match(source, /const LADDER_RECENT_HISTORY_KEY = 'epiphany-word-ladder-recent-v1';/);
  assert.match(source, /window\.localStorage\.getItem\(LADDER_RECENT_HISTORY_KEY/);
  assert.match(source, /const fresh = candidates\.filter\(item => !recent\.has\(\[item\.start, item\.goal\]\.sort\(\)\.join\(':')\)\);/);
  assert.match(source, /\.slice\(-60\)/);
  assert.match(source, /rememberLadderPairs\(chosen\);/);
});
