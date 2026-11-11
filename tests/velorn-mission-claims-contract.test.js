import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../supabase/functions/velorn-mission-claims/index.ts", import.meta.url), "utf8");
const config = readFileSync(new URL("../supabase/config.toml", import.meta.url), "utf8");

test("Velorn mission claim endpoint verifies the bearer token with Supabase Auth", () => {
  assert.match(source, /authClient\.auth\.getUser\(token\)/);
  assert.match(source, /authData\.user\.id/);
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("Velorn claim RPC identity always comes from the verified Auth user", () => {
  assert.match(source, /p_user_id:\s*authData\.user\.id/);
  assert.doesNotMatch(source, /p_user_id:\s*body\./);
  assert.match(source, /invalid_assignment_claim/);
  assert.match(source, /invalid_board_bonus_claim/);
});

test("Velorn claim endpoint exposes only the two atomic claim RPCs", () => {
  assert.match(source, /economy_claim_mission_assignment/);
  assert.match(source, /economy_claim_mission_board_bonus/);
  assert.doesNotMatch(source, /economy_post_wallet_transaction/);
  assert.match(config, /\[functions\.velorn-mission-claims\]\s*\nverify_jwt = true/);
});
