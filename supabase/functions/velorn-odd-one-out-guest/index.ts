import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import "./odd-one-out-bank.js";
import { safeSessionQuestions, validateAnswerRequest } from "./odd-one-out-validator.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private, max-age=0",
};
const VERSION = "odd-one-out-rotated-20261110-v2";
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
function toHex(bytes: Uint8Array) {
  return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}
async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
function clientAddress(req: Request) {
  return req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
}
function validGuestAnswer(body: Record<string, unknown>) {
  return typeof body.guestToken === "string" && /^[0-9a-f]{64}$/.test(body.guestToken) &&
    validateAnswerRequest({ action: body.action, sessionId: body.sessionId,
      questionIndex: body.questionIndex, selectedIndex: body.selectedIndex });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return json(503, { error: "validator_not_configured" });
    if (!req.headers.get("apikey")) return json(401, { error: "project_key_required" });
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "invalid_request" });
    const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    if (body.action === "start") {
      if (Object.keys(body).some(key => !["action","level","trainingMode"].includes(key))) return json(400, { error: "unexpected_fields" });
      const level = ["A1","A2","B1","B2","C1","C2"].includes(body.level) ? body.level : null;
      const trainingMode = ["guided","steady","challenge"].includes(body.trainingMode) ? body.trainingMode : null;
      if (!level || !trainingMode) return json(400, { error: "invalid_selection" });
      const address = clientAddress(req);
      if (!address) return json(503, { error: "client_network_identity_unavailable" });
      const bank = (globalThis as typeof globalThis & { EPIPHANY_ODD_ONE_OUT_BANK?: any }).EPIPHANY_ODD_ONE_OUT_BANK;
      if (!bank || typeof bank.selectRound !== "function" || !bank.validateBank().valid) return json(503, { error: "question_bank_unavailable" });
      const random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      const round = bank.selectRound(level, trainingMode, [], random);
      if (!round.questions.length) return json(503, { error: "question_bank_empty" });
      const sessionId = crypto.randomUUID();
      const guestToken = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const tokenHash = await sha256(guestToken);
      const ipHash = await hmacSha256(serviceKey, address);
      const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
      const questions = round.questions.map((question: Record<string, unknown>) => ({ ...question, cefrLevel: level, trainingMode }));
      const { error } = await service.rpc("velorn_start_odd_one_out_guest_session", {
        p_session_id: sessionId, p_token_hash: tokenHash, p_client_ip_hash: ipHash,
        p_validator_version: VERSION, p_challenge_level: level, p_training_mode: trainingMode,
        p_questions: questions, p_expires_at: expiresAt,
      });
      if (error) {
        const limited = /rate limit/i.test(error.message || "");
        if (!limited) console.error("Guest Odd One Out session creation failed:", error.message);
        return json(limited ? 429 : 503, { error: limited ? "session_rate_limited" : "session_creation_failed" });
      }
      return json(200, { sessionId, guestToken, validatorVersion: VERSION, level, trainingMode,
        target: round.target, shortened: round.shortened, questions: safeSessionQuestions(questions) });
    }

    if (body.action === "answer") {
      if (Object.keys(body).some(key => !["action","sessionId","guestToken","questionIndex","selectedIndex"].includes(key)) ||
          !validGuestAnswer(body)) return json(400, { error: "invalid_answer_request" });
      const { data, error } = await service.rpc("velorn_submit_odd_one_out_guest_answer", {
        p_session_id: body.sessionId, p_token_hash: await sha256(body.guestToken as string),
        p_question_index: body.questionIndex, p_selected_index: body.selectedIndex,
      });
      if (error || !data) {
        const message = error?.message || "";
        const status = /not found/i.test(message) ? 404 :
          /expired|not active|unexpected question/i.test(message) ? 409 :
          /too quickly/i.test(message) ? 429 : 400;
        return json(status, { error: "answer_rejected" });
      }
      return json(200, { correct: data.correct, correctIndex: data.correct_index,
        correctAnswer: data.correct_answer, explanation: data.explanation, relationship: data.relationship,
        hint: data.hint, questionIndex: data.question_index, completed: data.completed, nextIndex: data.next_index });
    }
    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("Guest Odd One Out request failed:", error instanceof Error ? error.message : "unknown");
    return json(400, { error: "invalid_request" });
  }
});
