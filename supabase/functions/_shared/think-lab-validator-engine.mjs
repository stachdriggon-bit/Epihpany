export const THINK_LAB_CORS_HEADERS = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private, max-age=0",
});

export class InvalidAuthSessionError extends Error {
  constructor() {
    super("Invalid authenticated session");
    this.name = "InvalidAuthSessionError";
  }
}

export function jsonResponse(status, body, headers = THINK_LAB_CORS_HEADERS) {
  return new Response(JSON.stringify(body), { status, headers });
}

export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function getBearerToken(authorization) {
  return (typeof authorization === "string"
    ? authorization.match(/^Bearer\s+(.+)$/i)?.[1]
    : null) || "";
}

export function isUserJwtBearer(bearer, apiKey, anonKey) {
  if (typeof bearer !== "string" || !bearer || bearer === apiKey || bearer === anonKey) return false;
  return bearer.split(".").length === 3;
}

export async function resolveAuthenticatedUserId({ bearer, apiKey, anonKey, createAuthClient }) {
  if (!isUserJwtBearer(bearer, apiKey, anonKey)) return null;
  if (typeof createAuthClient !== "function") throw new TypeError("Auth client factory required");
  const { data, error } = await createAuthClient(bearer).auth.getUser(bearer);
  if (error || !data?.user?.id) throw new InvalidAuthSessionError();
  return data.user.id;
}

export function bytesToHex(bytes) {
  return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(value, cryptoProvider = globalThis.crypto) {
  const digest = await cryptoProvider.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(secret, value, cryptoProvider = globalThis.crypto) {
  const key = await cryptoProvider.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(new Uint8Array(await cryptoProvider.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export function getClientNetworkAddress(request) {
  return request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
}

export function createRandomHex(byteLength, cryptoProvider = globalThis.crypto) {
  if (!Number.isInteger(byteLength) || byteLength < 1 || byteLength > 1024) {
    throw new RangeError("Invalid random byte length");
  }
  return bytesToHex(cryptoProvider.getRandomValues(new Uint8Array(byteLength)));
}

export function isUuid(value) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function hasOnlyKeys(value, allowedKeys) {
  if (!isPlainObject(value) || !Array.isArray(allowedKeys)) return false;
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every(key => allowed.has(key));
}
