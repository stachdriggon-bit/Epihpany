const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROMPT = "Build the sentence in the correct order.";
const MODES = Object.freeze(["guided", "steady", "challenge"]);

export function normalizeSentence(value) {
  const slash = String.fromCharCode(92);
  const stripPunctuation = new RegExp("[^" + slash + "p{L}" + slash + "p{N}" + slash + "s]", "gu");
  const collapseWhitespace = new RegExp(slash + "s+", "g");
  return String(value ?? "").toLowerCase().replace(stripPunctuation, "").replace(collapseWhitespace, " ").trim();
}

function sentenceWords(sentence) {
  const value = String(sentence ?? "").trim();
  return value ? value.split(" ") : [];
}

export function safeQuestion(question) {
  if (!question || typeof question !== "object" || !Array.isArray(question.words)) {
    throw new TypeError("Canonical sentence required");
  }
  return { id: question.id, prompt: question.prompt, words: question.words.slice() };
}

export function safeSessionQuestions(questions, expectedCount = 24) {
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    throw new TypeError("Complete Sentence Scramble round required");
  }
  return questions.map(safeQuestion);
}

export function validateStartRequest(body) {
  return !!body && body.action === "start" &&
    Object.keys(body).every(key => ["action", "trainingMode", "daily", "dailySeed"].includes(key)) &&
    MODES.includes(body.trainingMode) &&
    (body.daily === undefined || typeof body.daily === "boolean") &&
    (body.daily === true
      ? Number.isInteger(body.dailySeed) && body.dailySeed >= 0 && body.dailySeed <= 0xffffffff
      : body.dailySeed === undefined);
}

export function validateAnswerRequest(body, guest = false) {
  const allowed = ["action", "sessionId", "questionIndex", "tileOrder", ...(guest ? ["guestToken"] : [])];
  return !!body && body.action === "answer" &&
    Object.keys(body).every(key => allowed.includes(key)) &&
    typeof body.sessionId === "string" && UUID_PATTERN.test(body.sessionId) &&
    Number.isInteger(body.questionIndex) && body.questionIndex >= 0 && body.questionIndex < 24 &&
    Array.isArray(body.tileOrder) && body.tileOrder.length >= 3 && body.tileOrder.length <= 24 &&
    body.tileOrder.every(value => Number.isInteger(value) && value >= 0 && value < 24) &&
    new Set(body.tileOrder).size === body.tileOrder.length &&
    (!guest || (typeof body.guestToken === "string" && /^[0-9a-f]{64}$/.test(body.guestToken)));
}

export function validateCanonicalSentence(question, mode) {
  if (!question || typeof question !== "object" || Array.isArray(question)) return false;
  const prefix = "SS-" + ({ guided: "G", steady: "S", challenge: "C" }[mode]) + "-";
  const allowedKeys = ["id", "prompt", "sentence", "acceptedAnswers", "skill", "explanation", "words"];
  if (Object.keys(question).sort().join("|") !== allowedKeys.sort().join("|") ||
      typeof question.id !== "string" || question.id.length !== 8 || !question.id.startsWith(prefix) ||
      typeof question.prompt !== "string" || question.prompt !== PROMPT ||
      typeof question.sentence !== "string" || question.sentence.trim() !== question.sentence ||
      question.sentence.length < 10 || question.sentence.length > 240 ||
      question.sentence.includes("  ") || question.sentence.includes("\n") || question.sentence.includes("\t") ||
      !Array.isArray(question.words) || question.words.length < 3 || question.words.length > 24 ||
      !question.words.every(word => typeof word === "string" && word.length > 0 && word.length <= 40 &&
        word.trim() === word && !word.includes(" ")) ||
      !Array.isArray(question.acceptedAnswers) || question.acceptedAnswers.length > 8 ||
      !question.acceptedAnswers.every(answer => typeof answer === "string" && answer.trim() === answer && answer.length >= 10 && answer.length <= 240) ||
      typeof question.skill !== "string" || question.skill.trim().length < 5 ||
      typeof question.explanation !== "string" || question.explanation.trim().length < 20) {
    return false;
  }
  const expected = sentenceWords(question.sentence).slice().sort();
  const actual = question.words.slice().sort();
  return expected.length === actual.length && expected.every((word, index) => word === actual[index]);
}

export function validateSentenceScrambleBank(bank) {
  if (!bank || typeof bank !== "object" || bank.schemaVersion !== 1 ||
      bank.gameId !== "sentence-scramble" || bank.totalChallenges !== 72 ||
      !bank.modes || typeof bank.modes !== "object") return { valid: false, count: 0 };
  let count = 0;
  const ids = new Set();
  for (const mode of MODES) {
    const questions = bank.modes[mode];
    if (!Array.isArray(questions) || questions.length !== 24) return { valid: false, count };
    for (const source of questions) {
      const canonical = { ...source, words: sentenceWords(source?.sentence) };
      if (!validateCanonicalSentence(canonical, mode) || ids.has(canonical.id)) return { valid: false, count };
      ids.add(canonical.id);
      count++;
    }
  }
  return { valid: count === 72 && ids.size === 72, count };
}
