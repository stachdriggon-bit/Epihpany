import {
  normalizeSentence,
  safeSessionQuestions,
  validateAnswerRequest,
  validateCanonicalSentence,
  validateSentenceScrambleBank,
  validateStartRequest,
} from "./sentence-scramble-validator.mjs";

function shuffle(items, random) {
  const result = items.slice();
  for (let index = result.length - 1; index > 0; index--) {
    const next = Math.floor(random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const sentenceScrambleAdapter = Object.freeze({
  id: "sentence_scramble",
  validatorVersion: "sentence-scramble-72-20261112-v1",
  sessionLifetimeMs: 40 * 60 * 1000,
  validateStartRequest,
  validateAnswerRequest,
  validateBank: validateSentenceScrambleBank,
  selectRound(bank, body, random) {
    const source = bank?.modes?.[body.trainingMode];
    if (!Array.isArray(source)) throw new TypeError("Sentence Scramble mode bank unavailable");
    const rng = body.daily === true ? seededRandom(body.dailySeed) : random;
    const questions = shuffle(source, rng);
    const selected = body.daily === true ? questions.slice(0, 1) : questions;
    return selected.map(item => ({
      ...item,
      acceptedAnswers: Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers.slice() : [],
      words: shuffle(String(item.sentence).trim().split(" ").filter(Boolean), rng),
    }));
  },
  buildCanonicalQuestions(round, body) {
    const expectedCount = body.daily === true ? 1 : 24;
    if (!Array.isArray(round) || round.length !== expectedCount ||
        !round.every(question => validateCanonicalSentence(question, body.trainingMode))) {
      throw new TypeError("Sentence Scramble requires a complete approved sentence set");
    }
    return round.map(question => ({
      id: question.id,
      prompt: question.prompt,
      words: question.words.slice(),
      sentence: question.sentence,
      acceptedAnswers: question.acceptedAnswers.slice(),
      skill: question.skill,
      explanation: question.explanation,
    }));
  },
  projectQuestions(questions) {
    return safeSessionQuestions(questions, questions.length);
  },
  buildStartResponse({ sessionId, guestToken, questions, body }) {
    return {
      sessionId,
      guestToken,
      validatorVersion: this.validatorVersion,
      trainingMode: body.trainingMode,
      daily: body.daily === true,
      questions: this.projectQuestions(questions),
    };
  },
  answerRpcArguments({ userId, guestTokenHash, body }) {
    return {
      p_user_id: userId,
      p_guest_token_hash: guestTokenHash,
      p_session_id: body.sessionId,
      p_game_id: this.id,
      p_question_index: body.questionIndex,
      p_answer: { tileOrder: body.tileOrder.slice() },
    };
  },
  projectAnswer(data) {
    return {
      correct: data.correct,
      questionIndex: data.question_index,
      nextIndex: data.next_index,
      completed: data.completed,
      sentence: data.sentence,
      explanation: data.explanation,
      skill: data.skill,
    };
  },
  normalizeAnswer: normalizeSentence,
});
