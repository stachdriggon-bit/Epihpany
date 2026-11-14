import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private, max-age=0",
};
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
    if (!url || !anonKey || !serviceKey) return json(503, { error: "dashboard_not_configured" });
    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: "Bearer " + token } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) return json(401, { error: "invalid_session" });
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 1024) return json(413, { error: "request_too_large" });
    const rawBody = await req.text();
    if (rawBody.length > 1024) return json(413, { error: "request_too_large" });
    let body: unknown;
    try { body = JSON.parse(rawBody || "{}"); } catch { return json(400, { error: "invalid_json" }); }
    if (!isPlainObject(body) || Object.keys(body).length !== 0) return json(400, { error: "invalid_request" });
    const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const readDashboard = () => service.rpc("economy_get_player_dashboard", {p_user_id:authData.user.id});
    const first = await readDashboard();
    if (first.error || !first.data || typeof first.data !== "object") {
      console.error("Velorn dashboard read failed:", first.error?.code || "unknown");
      return json(503, { error: "dashboard_unavailable" });
    }
    if (first.data.enabled !== true) return json(200, first.data);
    for (const periodType of ["daily", "weekly"]) {
      const { error } = await service.rpc("economy_generate_mission_board", {
        p_user_id: authData.user.id, p_period_type: periodType,
      });
      if (error) {
        console.error("Velorn board generation failed:", error.code || "unknown");
        return json(503, { error: "dashboard_unavailable" });
      }
    }
    const latest = await readDashboard();
    if (latest.error || !latest.data || typeof latest.data !== "object") {
      console.error("Velorn dashboard refresh failed:", latest.error?.code || "unknown");
      return json(503, { error: "dashboard_unavailable" });
    }
    return json(200, latest.data);
  } catch (error) {
    console.error("Velorn dashboard request failed:", error instanceof Error ? error.name : "unknown");
    return json(400, { error: "invalid_request" });
  }
});
