import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const migration = read("supabase/migrations/20261114010000_velorn_player_dashboard_read_api.sql");
const edge = read("supabase/functions/velorn-player-dashboard/index.ts");
const config = read("supabase/config.toml");
const auth = read("account.js");
const ui = read("velorn.js");
const html = read("index.html");
const css = read("style.css");

test("Velorn dashboard RPC is private, service-role-only, and fails closed", () => {
  assert.match(migration, /economy_private\.get_player_dashboard\(p_user_id uuid\)/);
  assert.match(migration, /SECURITY DEFINER\s+SET search_path = ''/);
  assert.match(migration, /v_role IS DISTINCT FROM 'service_role'/);
  assert.match(migration, /'enabled',false/);
  assert.match(migration, /'balance',v_balance::text/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.economy_get_player_dashboard\(uuid\)/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.economy_get_player_dashboard\(uuid\) TO service_role/);
});
test("Dashboard Edge Function derives identity from verified Auth and never trusts request user IDs", () => {
  assert.match(edge, /authClient\.auth\.getUser\(token\)/);
  assert.match(edge, /p_user_id:authData\.user\.id/);
  assert.match(edge, /Object\.keys\(body\)\.length !== 0/);
  assert.match(edge, /economy_generate_mission_board/);
  assert.doesNotMatch(edge, /body\.userId|body\.user_id/);
  assert.match(config, /\[functions\.velorn-player-dashboard\]\s*\nverify_jwt = true/);
});
test("Browser uses only narrow authenticated Velorn dashboard and claim methods", () => {
  assert.match(auth, /loadVelornDashboard/);
  assert.match(auth, /claimVelornMission/);
  assert.match(auth, /client\.functions\.invoke\('velorn-player-dashboard'/);
  assert.match(auth, /client\.functions\.invoke\('velorn-mission-claims'/);
  assert.match(auth, /epiphany:auth-state/);
  assert.match(ui, /loadVelornDashboard/);
  assert.match(ui, /claimVelornMission/);
  assert.match(ui, /assignment\.canClaim === true/);
  assert.match(ui, /board\.canClaimBonus === true/);
  assert.doesNotMatch(ui, /localStorage|service_role|SUPABASE_SERVICE_ROLE_KEY/);
});
test("Home dashboard is account-only, accessible, and keeps prototype Tokens separate", () => {
  assert.match(html, /id="velorn-panel"[^>]*hidden/);
  assert.match(html, /id="velorn-status"[^>]*aria-live="polite"/);
  assert.match(html, /id="velorn-wallet"/);
  assert.match(css, /\.velorn-panel/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /TOKENS/);
  assert.match(html, /VELORN/);
});
