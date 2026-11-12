import { safeSessionQuestions, validateAnswerRequest, validateStartRequest } from "./word-forge-validator.mjs";

export const wordForgeAdapter = Object.freeze({
  id: "word_forge",
  validatorVersion: "word-forge-reviewed-72-20261111-v1",
  sessionLifetimeMs: 40 * 60 * 1000,
  validateStartRequest,
  validateAnswerRequest,
  selectRound(bank, body, random) {
    return bank.selectRound(body.trainingMode, random);
  },
  buildCanonicalQuestions(round) {
    if (!Array.isArray(round) || round.length !== 24 || !round.every(question => question && question.answerWord)) {
      throw new TypeError("Word Forge requires a complete 24-question round");
    }
    return round;
  },
  projectQuestions: safeSessionQuestions,
  buildStartResponse({ sessionId, guestToken, questions }) {
    return {
      sessionId,
      guestToken,
      validatorVersion: this.validatorVersion,
      trainingMode: questions[0]?.trainingMode ?? null,
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
      p_answer: { answerWord: body.answerWord },
    };
  },
  projectAnswer(data) {
    return {
      correct: data.correct,
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      skill: data.skill,
      questionIndex: data.question_index,
      attemptsRemaining: data.attempts_remaining,
      advance: data.advance,
      completed: data.completed,
      nextIndex: data.next_index,
      correctCount: data.correct_count,
    };
  },
});
