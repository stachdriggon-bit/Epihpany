import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private, max-age=0",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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
    if (!url || !anonKey || !serviceKey) return json(503, { error: "claims_not_configured" });

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) return json(401, { error: "invalid_session" });

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 2048) return json(413, { error: "request_too_large" });
    const rawBody = await req.text();
    if (rawBody.length > 2048) return json(413, { error: "request_too_large" });
    let body: unknown;
    try { body = JSON.parse(rawBody); } catch { return json(400, { error: "invalid_json" }); }
    if (!isPlainObject(body)) return json(400, { error: "invalid_request" });

    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let rpcName: string;
    let rpcArgs: Record<string, string>;
    if (body.action === "claim_assignment") {
      if (Object.keys(body).some(key => !["action", "assignmentId"].includes(key)) ||
          typeof body.assignmentId !== "string" || !UUID_RE.test(body.assignmentId)) {
        return json(400, { error: "invalid_assignment_claim" });
      }
      rpcName = "economy_claim_mission_assignment";
      rpcArgs = {
        p_user_id: authData.user.id,
        p_assignment_id: body.assignmentId,
      };
    } else if (body.action === "claim_board_bonus") {
      if (Object.keys(body).some(key => !["action", "boardId"].includes(key)) ||
          typeof body.boardId !== "string" || !UUID_RE.test(body.boardId)) {
        return json(400, { error: "invalid_board_bonus_claim" });
      }
      rpcName = "economy_claim_mission_board_bonus";
      rpcArgs = {
        p_user_id: authData.user.id,
        p_board_id: body.boardId,
      };
    } else {
      return json(400, { error: "unknown_action" });
    }

    const { data, error } = await service.rpc(rpcName, rpcArgs);
    if (error || !data) {
      const message = error?.message || "";
      const status = /not found/i.test(message) ? 404 :
        /completed|limit|bonus|disabled|not payable|not verified|configuration|snapshot/i.test(message) ? 409 : 503;
      if (status === 503) console.error("Velorn mission claim RPC failed:", message);
      return json(status, { error: "claim_rejected" });
    }

    const claim = Array.isArray(data) ? data[0] : data;
    if (!claim?.out_claim_id || claim.out_claim_status !== "paid") {
      return json(503, { error: "claim_result_unavailable" });
    }
    return json(200, {
      claimId: claim.out_claim_id,
      status: claim.out_claim_status,
      rewardAmount: claim.out_reward_amount,
      paidAt: claim.out_paid_at,
      replayed: claim.out_replayed === true,
    });
  } catch (error) {
    console.error("Velorn mission claim request failed:", error instanceof Error ? error.message : "unknown");
    return json(400, { error: "invalid_request" });
  }
});
