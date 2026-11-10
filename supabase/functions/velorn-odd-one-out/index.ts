import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import "../_shared/odd-one-out-bank.js";
import { safeSessionQuestions, validateAnswerRequest } from "../_shared/odd-one-out-validator.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const VERSION = "odd-one-out-v1";
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  try {
    const authorization = req.headers.get("Authorization") || "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return json(401, { error: "authentication_required" });

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return json(503, { error: "validator_not_configured" });

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) return json(401, { error: "invalid_session" });
    const userId = authData.user.id;
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "invalid_request" });

    if (body.action === "start") {
      const allowedKeys = new Set(["action", "level", "trainingMode"]);
      if (Object.keys(body).some(key => !allowedKeys.has(key))) return json(400, { error: "unexpected_fields" });
      const level = ["A1","A2","B1","B2","C1","C2"].includes(body.level) ? body.level : null;
      const trainingMode = ["guided","steady","challenge"].includes(body.trainingMode) ? body.trainingMode : null;
      if (!level || !trainingMode) return json(400, { error: "invalid_selection" });

      const bank = (globalThis as typeof globalThis & { EPIPHANY_ODD_ONE_OUT_BANK?: any }).EPIPHANY_ODD_ONE_OUT_BANK;
      if (!bank || typeof bank.selectRound !== "function" || !bank.validateBank().valid) {
        return json(503, { error: "question_bank_unavailable" });
      }
      const random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      const round = bank.selectRound(level, trainingMode, [], random);
      if (!round.questions.length) return json(503, { error: "question_bank_empty" });

      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
      const questions = round.questions.map((question: Record<string, unknown>) => ({
        ...question,
        cefrLevel: level,
        trainingMode,
      }));
      const { error } = await service.rpc("velorn_start_odd_one_out_session", {
        p_user_id: userId,
        p_session_id: sessionId,
        p_validator_version: VERSION,
        p_cefr_level: level,
        p_training_mode: trainingMode,
        p_questions: questions,
        p_expires_at: expiresAt,
      });
      if (error) {
        console.error("Odd One Out session creation failed:", error.message);
        return json(503, { error: "session_creation_failed" });
      }
      return json(200, {
        sessionId,
        validatorVersion: VERSION,
        level,
        trainingMode,
        target: round.target,
        shortened: round.shortened,
        questions: safeSessionQuestions(questions),
      });
    }

    if (body.action === "answer") {
      if (Object.keys(body).some(key => !["action","sessionId","questionIndex","selectedIndex"].includes(key)) ||
          !validateAnswerRequest(body)) return json(400, { error: "invalid_answer_request" });
      const { data, error } = await service.rpc("velorn_submit_odd_one_out_answer", {
        p_user_id: userId,
        p_session_id: body.sessionId,
        p_question_index: body.questionIndex,
        p_selected_index: body.selectedIndex,
      });
      if (error || !data) {
        const message = error?.message || "";
        const status = /not found/i.test(message) ? 404 : /expired|not active|unexpected question/i.test(message) ? 409 : 400;
        return json(status, { error: "answer_rejected" });
      }
      return json(200, {
        correct: data.correct,
        correctIndex: data.correct_index,
        correctAnswer: data.correct_answer,
        explanation: data.explanation,
        relationship: data.relationship,
        hint: data.hint,
        questionIndex: data.question_index,
        completed: data.completed,
        nextIndex: data.next_index,
      });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    console.error("Odd One Out validator request failed:", error instanceof Error ? error.message : "unknown");
    return json(400, { error: "invalid_request" });
  }
});
