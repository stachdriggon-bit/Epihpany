export function publicQuestion(question) {
  if (!question || typeof question !== "object") throw new TypeError("Question is required");
  const safe = {};
  for (const key of ["id", "prompt", "why", "words", "relationship", "hint", "cefrLevel", "trainingMode"]) {
    if (Object.prototype.hasOwnProperty.call(question, key)) safe[key] = question[key];
  }
  return safe;
}

export function validateAnswerRequest(body) {
  const allowed = new Set(["action", "sessionId", "questionIndex", "selectedIndex"]);
  return !!body && Object.keys(body).every(key => allowed.has(key)) &&
    typeof body.sessionId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.sessionId) &&
    Number.isInteger(body.questionIndex) && body.questionIndex >= 0 && body.questionIndex < 12 &&
    Number.isInteger(body.selectedIndex) && body.selectedIndex >= 0 && body.selectedIndex < 4;
}

export function safeSessionQuestions(questions) {
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 12) {
    throw new TypeError("Invalid question set");
  }
  return questions.map(publicQuestion);
}
