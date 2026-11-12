import { safeSessionQuestions, validateAnswerRequest } from "./odd-one-out-validator.mjs";

const LEVELS = Object.freeze(["A1", "A2", "B1", "B2", "C1", "C2"]);
const MODES = Object.freeze(["guided", "steady", "challenge"]);

export const oddOneOutAdapter = Object.freeze({
  id: "odd_one_out",
  validatorVersion: "odd-one-out-rotated-20261110-v2",
  sessionLifetimeMs: 25 * 60 * 1000,
  validateStartRequest(body) {
    return !!body &&
      Object.keys(body).every(key => ["action", "level", "trainingMode"].includes(key)) &&
      body.action === "start" && LEVELS.includes(body.level) && MODES.includes(body.trainingMode);
  },
  validateAnswerRequest,
  selectRound(bank, body, random) {
    return bank.selectRound(body.level, body.trainingMode, [], random);
  },
  buildCanonicalQuestions(round, body) {
    if (!round || !Array.isArray(round.questions) || round.questions.length < 1 || round.questions.length > 12) {
      throw new TypeError("Odd One Out requires a valid round");
    }
    return round.questions.map(question => ({
      ...question,
      cefrLevel: body.level,
      trainingMode: body.trainingMode,
    }));
  },
  projectQuestions: safeSessionQuestions,
  answerRpcArguments({ userId, guestTokenHash, body }) {
    return {
      p_user_id: userId,
      p_guest_token_hash: guestTokenHash,
      p_session_id: body.sessionId,
      p_game_id: this.id,
      p_question_index: body.questionIndex,
      p_answer: { selectedIndex: body.selectedIndex },
    };
  },
  buildStartResponse({ sessionId, guestToken, questions, body, round }) {
    return {
      sessionId,
      guestToken,
      validatorVersion: this.validatorVersion,
      level: body.level,
      trainingMode: body.trainingMode,
      target: round.target,
      shortened: round.shortened,
      questions: this.projectQuestions(questions),
    };
  },
  projectAnswer(data) {
    return {
      correct: data.correct,
      correctIndex: data.correct_index,
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      relationship: data.relationship,
      hint: data.hint,
      questionIndex: data.question_index,
      completed: data.completed,
      nextIndex: data.next_index,
    };
  },
});
