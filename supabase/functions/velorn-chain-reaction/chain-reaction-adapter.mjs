import {
  safeSessionQuestions,
  validateAnswerRequest,
  validateCanonicalChallenge,
  validateStartRequest,
} from "./chain-reaction-validator.mjs";

export const chainReactionAdapter = Object.freeze({
  id: "chain_reaction",
  validatorVersion: "chain-reaction-72-20261113-v1",
  sessionLifetimeMs: 40 * 60 * 1000,
  validateStartRequest,
  validateAnswerRequest,
  selectRound(bank, body, random) {
    const round = bank.selectRound(body.trainingMode, random);
    return body.daily === true ? round.slice(0, 1) : round;
  },
  buildCanonicalQuestions(round, body) {
    const expectedCount = body.daily === true ? 1 : 24;
    if (!Array.isArray(round) || round.length !== expectedCount ||
        !round.every(challenge => validateCanonicalChallenge(challenge, body.trainingMode))) {
      throw new TypeError("Chain Reaction requires a complete approved challenge set");
    }
    return round.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      start: challenge.start,
      links: challenge.links.map(link => ({
        from: link.from,
        to: link.to,
        options: link.options.slice(),
        answer: link.answer,
        explanation: link.explanation,
      })),
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
      p_answer: {
        linkIndex: body.linkIndex,
        selectedIndex: body.selectedIndex,
      },
    };
  },
  projectAnswer(data) {
    return {
      correct: data.correct,
      questionIndex: data.question_index,
      linkIndex: data.link_index,
      nextLinkIndex: data.next_link_index,
      nextIndex: data.next_index,
      challengeCompleted: data.challenge_completed,
      completed: data.completed,
      nextWord: data.next_word,
      explanation: data.explanation,
    };
  },
});
