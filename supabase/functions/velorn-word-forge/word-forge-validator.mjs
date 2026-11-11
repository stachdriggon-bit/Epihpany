export function safeQuestion(q) {
  if (!q || typeof q !== "object") throw new TypeError("Question required");
  return { id:q.id, clue:q.clue, letters:q.letters, prompt:q.prompt };
}
export function safeSessionQuestions(qs) {
  if (!Array.isArray(qs) || qs.length !== 24) throw new TypeError("Complete round required");
  return qs.map(safeQuestion);
}
export function validateStartRequest(body) {
  return !!body && body.action === "start" &&
    Object.keys(body).every(k => ["action","trainingMode"].includes(k)) &&
    ["guided","steady","challenge"].includes(body.trainingMode);
}
export function validateAnswerRequest(body, guest=false) {
  const allowed=["action","sessionId","questionIndex","answerWord",...(guest?["guestToken"]:[])];
  return !!body && body.action==="answer" && Object.keys(body).every(k=>allowed.includes(k)) &&
    typeof body.sessionId==="string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.sessionId) &&
    Number.isInteger(body.questionIndex) && body.questionIndex>=0 && body.questionIndex<24 &&
    typeof body.answerWord==="string" && /^[a-zA-Z]{3,14}$/.test(body.answerWord) &&
    (!guest || (typeof body.guestToken==="string" && /^[0-9a-f]{64}$/.test(body.guestToken)));
}
export function validateBankQuestion(q) {
  if (!q || typeof q!=="object") return false;
  const letters=String(q.letters||"").toLowerCase().split("").sort().join("");
  const answer=String(q.answerWord||"").toLowerCase().split("").sort().join("");
  return /^WF-[GSC]-\d{3}$/.test(q.id||"") &&
    typeof q.clue==="string" && q.clue.length>=12 &&
    /^[A-Z]{3,14}$/.test(q.letters||"") && /^[a-z]{3,14}$/.test(q.answerWord||"") &&
    letters===answer && typeof q.explain==="string" && q.explain.length>=20 &&
    typeof q.skill==="string" && q.skill.length>=2;
}

export function isUserJwtBearer(bearer, apiKey, anonKey) {
  if (typeof bearer !== "string" || !bearer || bearer === apiKey || bearer === anonKey) return false;
  return bearer.split(".").length === 3;
}
