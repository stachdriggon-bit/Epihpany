import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import "../velorn-word-forge/word-forge-bank.js";
import "../velorn-odd-one-out/odd-one-out-bank.js";
import "../velorn-chain-reaction/chain-reaction-bank.js";
import "../velorn-sentence-scramble/sentence-scramble-bank.js";
import { resolveThinkLabAdapter } from "../_shared/think-lab-validator-adapters.mjs";
import {
  THINK_LAB_CORS_HEADERS,
  InvalidAuthSessionError,
  createRandomHex,
  getBearerToken,
  getClientNetworkAddress,
  hmacSha256Hex,
  jsonResponse,
  resolveAuthenticatedUserId,
  sha256Hex,
  isPlainObject,
  isUuid,
} from "../_shared/think-lab-validator-engine.mjs";

const headers = THINK_LAB_CORS_HEADERS;
const json = jsonResponse;

type SentenceScrambleBank = {
  gameId: string;
  schemaVersion: number;
  totalChallenges: number;
  modes: Record<string, unknown[]>;
  validateBank?: () => { valid: boolean; count: number };
};

function getBank(gameId: string) {
  const root = globalThis as typeof globalThis & {
    EPIPHANY_WORD_FORGE_BANK?: any;
    EPIPHANY_ODD_ONE_OUT_BANK?: any;
    EPIPHANY_CHAIN_REACTION_BANK?: any;
    EPIPHANY_SENTENCE_SCRAMBLE_BANK?: SentenceScrambleBank;
  };
  return gameId === "word_forge" ? root.EPIPHANY_WORD_FORGE_BANK :
    gameId === "odd_one_out" ? root.EPIPHANY_ODD_ONE_OUT_BANK :
    gameId === "chain_reaction" ? root.EPIPHANY_CHAIN_REACTION_BANK :
    gameId === "sentence_scramble" ? root.EPIPHANY_SENTENCE_SCRAMBLE_BANK : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return json(503, { error: "validator_not_configured" });
    const apiKey = req.headers.get("apikey") || "";
    if (!apiKey) return json(401, { error: "project_key_required" });

    const raw = await req.json();
    if (!isPlainObject(raw) || typeof raw.action !== "string" ||
        typeof raw.gameId !== "string") return json(400, { error: "invalid_request" });

    const bearer = getBearerToken(req.headers.get("Authorization") || "");
    let userId: string | null = null;
    try {
      userId = await resolveAuthenticatedUserId({
        bearer,
        apiKey,
        anonKey,
        createAuthClient: (token: string) => createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: "Bearer " + token } },
        }),
      });
    } catch (error) {
      if (error instanceof InvalidAuthSessionError) return json(401, { error: "invalid_session" });
      throw error;
    }

    const adapter = resolveThinkLabAdapter(raw.gameId);
    const body = { ...raw };
    delete body.gameId;
    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (body.action === "start") {
      if (!adapter.validateStartRequest(body)) return json(400, { error: "invalid_selection" });
      const bank = getBank(adapter.id);
      const bankValidation = typeof bank?.validateBank === "function"
        ? bank.validateBank()
        : typeof adapter.validateBank === "function" ? adapter.validateBank(bank) : null;
      if (!bank || !bankValidation?.valid) {
        return json(503, { error: "question_bank_unavailable" });
      }
      const random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      let round: any;
      let questions: any[];
      try {
        round = adapter.selectRound(bank, body, random);
        questions = adapter.buildCanonicalQuestions(round, body);
      } catch {
        return json(503, { error: "question_bank_incomplete" });
      }
      if (!Array.isArray(questions) || questions.length < 1 || questions.length > 24) {
        return json(503, { error: "question_bank_incomplete" });
      }

      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + adapter.sessionLifetimeMs).toISOString();
      const guestToken = userId ? null : createRandomHex(32);
      const ip = guestToken ? getClientNetworkAddress(req) : "";
      if (guestToken && !ip) return json(503, { error: "client_network_identity_unavailable" });

      const { error } = await service.rpc("velorn_start_think_lab_validator_session", {
        p_session_id: sessionId,
        p_game_id: adapter.id,
        p_user_id: userId,
        p_guest_token_hash: guestToken ? await sha256Hex(guestToken) : null,
        p_client_ip_hash: guestToken ? await hmacSha256Hex(serviceKey, ip) : null,
        p_validator_version: adapter.validatorVersion,
        p_cefr_level: body.level ?? null,
        p_training_mode: body.trainingMode,
        p_questions: questions,
        p_expires_at: expiresAt,
      });
      if (error) {
        const limited = /rate limit/i.test(error.message || "");
        if (!limited) console.error("Unified Think Lab session creation failed:", error.message);
        return json(limited ? 429 : 503, { error: limited ? "session_rate_limited" : "session_creation_failed" });
      }

      return json(200, adapter.buildStartResponse({
        sessionId,
        guestToken,
        questions,
        body,
        round,
      }));
    }

    if (body.action === "answer") {
      const guest = !userId;
      if (!adapter.validateAnswerRequest(body, guest) ||
          !isUuid(body.sessionId) || !Number.isInteger(body.questionIndex)) {
        return json(400, { error: "invalid_answer_request" });
      }
      const guestTokenHash = guest ? await sha256Hex(body.guestToken) : null;
      const args = adapter.answerRpcArguments({ userId, guestTokenHash, body });
      const { data, error } = await service.rpc("velorn_submit_think_lab_validator_answer", args);
      if (error || !data) {
        const message = error?.message || "";
        if (error) console.error("Unified Think Lab answer RPC rejected:", {
          gameId: adapter.id,
          code: error.code || null,
          message,
        });
        const status = /not found/i.test(message) ? 404 :
          /expired|not active|unexpected/i.test(message) ? 409 :
          /too quickly|rate limit/i.test(message) ? 429 : 400;
        return json(status, { error: "answer_rejected" });
      }
      return json(200, adapter.projectAnswer(data));
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    if (error instanceof RangeError) return json(400, { error: "unsupported_game" });
    console.error("Unified Think Lab validator failed:", error instanceof Error ? error.message : "unknown");
    return json(400, { error: "invalid_request" });
  }
});
