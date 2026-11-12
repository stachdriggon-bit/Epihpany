export function safeQuestion(question) {
  if (!question || typeof question !== "object") throw new TypeError("Challenge required");
  return {
    id: question.id,
    title: question.title,
    start: question.start,
    links: question.links.map(link => ({
      from: link.from,
      options: link.options.slice(),
    })),
  };
}

export function safeSessionQuestions(questions, expectedCount = 24) {
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    throw new TypeError("Complete Chain Reaction round required");
  }
  return questions.map(safeQuestion);
}

export function validateStartRequest(body) {
  return !!body && body.action === "start" &&
    Object.keys(body).every(key => ["action", "trainingMode", "daily", "dailySeed"].includes(key)) &&
    ["guided", "steady", "challenge"].includes(body.trainingMode) &&
    (body.daily === undefined || typeof body.daily === "boolean") &&
    (body.daily === true
      ? Number.isInteger(body.dailySeed) && body.dailySeed >= 0 && body.dailySeed <= 0xffffffff
      : body.dailySeed === undefined);
}

export function validateAnswerRequest(body, guest = false) {
  const allowed = [
    "action", "sessionId", "questionIndex", "linkIndex", "selectedIndex",
    ...(guest ? ["guestToken"] : []),
  ];
  return !!body && body.action === "answer" &&
    Object.keys(body).every(key => allowed.includes(key)) &&
    typeof body.sessionId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.sessionId) &&
    Number.isInteger(body.questionIndex) && body.questionIndex >= 0 && body.questionIndex < 24 &&
    Number.isInteger(body.linkIndex) && body.linkIndex >= 0 && body.linkIndex < 3 &&
    Number.isInteger(body.selectedIndex) && body.selectedIndex >= 0 && body.selectedIndex < 3 &&
    (!guest || (typeof body.guestToken === "string" && /^[0-9a-f]{64}$/.test(body.guestToken)));
}

export function validateCanonicalChallenge(challenge, mode) {
  if (!challenge || typeof challenge !== "object" || Array.isArray(challenge)) return false;
  const prefix = "CR-" + ({ guided: "G", steady: "S", challenge: "C" }[mode]) + "-";
  if (typeof challenge.id !== "string" || !challenge.id.startsWith(prefix) ||
      typeof challenge.title !== "string" || challenge.title.trim().length < 3 ||
      typeof challenge.start !== "string" || !/^[A-Z][A-Z -]{1,39}$/.test(challenge.start) ||
      !Array.isArray(challenge.links) || challenge.links.length !== 3) return false;
  let previous = challenge.start;
  return challenge.links.every(link => {
    if (!link || typeof link !== "object" || Array.isArray(link) ||
        link.from !== previous ||
        typeof link.to !== "string" || !/^[A-Z][A-Z -]{1,39}$/.test(link.to) ||
        !Array.isArray(link.options) || link.options.length !== 3 ||
        new Set(link.options).size !== 3 ||
        !link.options.every(option => typeof option === "string" && /^[A-Z][A-Z -]{1,39}$/.test(option)) ||
        !Number.isInteger(link.answer) || link.answer < 0 || link.answer > 2 ||
        link.options[link.answer] !== link.to ||
        typeof link.explanation !== "string" || link.explanation.trim().length < 8) return false;
    previous = link.to;
    return true;
  });
}
