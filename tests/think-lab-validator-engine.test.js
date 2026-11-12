import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  THINK_LAB_CORS_HEADERS,
  InvalidAuthSessionError,
  bytesToHex,
  createRandomHex,
  getBearerToken,
  getClientNetworkAddress,
  hasOnlyKeys,
  hmacSha256Hex,
  isPlainObject,
  isUserJwtBearer,
  isUuid,
  jsonResponse,
  resolveAuthenticatedUserId,
  sha256Hex,
} from "../supabase/functions/_shared/think-lab-validator-engine.mjs";

test("shared response contract is private and non-cacheable", async () => {
  const response = jsonResponse(409, { error: "conflict" });
  assert.equal(response.status, 409);
  assert.equal(response.headers.get("cache-control"), "no-store, private, max-age=0");
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.deepEqual(await response.json(), { error: "conflict" });
  assert.equal(THINK_LAB_CORS_HEADERS["Access-Control-Allow-Methods"], "POST, OPTIONS");
});

test("bearer parsing and JWT classification reject project keys", () => {
  assert.equal(getBearerToken("Bearer user.token.signature"), "user.token.signature");
  assert.equal(getBearerToken("bearer guest-token"), "guest-token");
  assert.equal(getBearerToken("Basic abc"), "");
  assert.equal(isUserJwtBearer("project-anon", "project-anon", "project-anon"), false);
  assert.equal(isUserJwtBearer("a.b.c", "project-anon", "project-anon"), true);
  assert.equal(isUserJwtBearer("", "project-anon", "project-anon"), false);
});

test("authenticated identity is always resolved through Auth getUser", async () => {
  let called = 0;
  const id = await resolveAuthenticatedUserId({
    bearer: "header.payload.signature",
    apiKey: "project-anon",
    anonKey: "project-anon",
    createAuthClient: token => ({
      auth: { getUser: async supplied => {
        called++;
        assert.equal(supplied, token);
        return { data: { user: { id: "trusted-user-id" } }, error: null };
      } },
    }),
  });
  assert.equal(id, "trusted-user-id");
  assert.equal(called, 1);
  assert.equal(await resolveAuthenticatedUserId({
    bearer: "project-anon", apiKey: "project-anon", anonKey: "project-anon",
    createAuthClient: () => { throw new Error("must not be called for anon key"); },
  }), null);
});

test("invalid JWT sessions fail closed", async () => {
  await assert.rejects(
    resolveAuthenticatedUserId({
      bearer: "header.payload.signature",
      apiKey: "project-anon",
      anonKey: "project-anon",
      createAuthClient: () => ({ auth: { getUser: async () => ({ data: { user: null }, error: { message: "bad token" } }) } }),
    }),
    InvalidAuthSessionError,
  );
});

test("guest token, SHA-256, and IP HMAC use fixed-length hex digests", async () => {
  const token = createRandomHex(32, webcrypto);
  assert.match(token, /^[0-9a-f]{64}$/);
  assert.equal((await sha256Hex(token, webcrypto)).length, 64);
  const one = await hmacSha256Hex("server-secret", "192.0.2.10", webcrypto);
  const two = await hmacSha256Hex("server-secret", "192.0.2.11", webcrypto);
  const otherSecret = await hmacSha256Hex("other-secret", "192.0.2.10", webcrypto);
  assert.match(one, /^[0-9a-f]{64}$/);
  assert.notEqual(one, two);
  assert.notEqual(one, otherSecret);
  assert.equal(bytesToHex(new Uint8Array([0, 15, 255])), "000fff");
});

test("network identity prefers platform address headers and safely falls back", () => {
  const request = new Request("https://example.test", { headers: {
    "cf-connecting-ip": " 192.0.2.1 ",
    "x-real-ip": "192.0.2.2",
    "x-forwarded-for": "192.0.2.3, 192.0.2.4",
  } });
  assert.equal(getClientNetworkAddress(request), "192.0.2.1");
  const fallback = new Request("https://example.test", { headers: { "x-forwarded-for": "192.0.2.3, 192.0.2.4" } });
  assert.equal(getClientNetworkAddress(fallback), "192.0.2.3");
  assert.equal(getClientNetworkAddress(new Request("https://example.test")), "");
});

test("strict object and UUID helpers reject malformed or extra input", () => {
  assert.equal(isPlainObject({ action: "start" }), true);
  assert.equal(isPlainObject([]), false);
  assert.equal(hasOnlyKeys({ action: "start", mode: "challenge" }, ["action", "mode"]), true);
  assert.equal(hasOnlyKeys({ action: "start", userId: "forged" }, ["action", "mode"]), false);
  assert.equal(isUuid("f4100000-0000-4000-8000-000000000051"), true);
  assert.equal(isUuid("f4i00000-0000-4000-8000-000000000051"), false);
  assert.equal(isUuid("not-a-uuid"), false);
});
