import { wordForgeAdapter } from "../velorn-word-forge/word-forge-adapter.mjs";
import { oddOneOutAdapter } from "../velorn-odd-one-out/odd-one-out-adapter.mjs";
import { chainReactionAdapter } from "../velorn-chain-reaction/chain-reaction-adapter.mjs";
import { sentenceScrambleAdapter } from "../velorn-sentence-scramble/sentence-scramble-adapter.mjs";

const adapters = Object.freeze({
  [wordForgeAdapter.id]: wordForgeAdapter,
  [oddOneOutAdapter.id]: oddOneOutAdapter,
  [chainReactionAdapter.id]: chainReactionAdapter,
  [sentenceScrambleAdapter.id]: sentenceScrambleAdapter,
});

const REQUIRED_METHODS = Object.freeze([
  "validateStartRequest",
  "validateAnswerRequest",
  "selectRound",
  "buildCanonicalQuestions",
  "projectQuestions",
  "buildStartResponse",
  "answerRpcArguments",
  "projectAnswer",
]);

export function getThinkLabAdapter(gameId) {
  if (typeof gameId !== "string" || !Object.prototype.hasOwnProperty.call(adapters, gameId)) {
    return null;
  }
  return adapters[gameId];
}

export function listThinkLabAdapterIds() {
  return Object.keys(adapters);
}

export function validateThinkLabAdapter(adapter) {
  if (!adapter || typeof adapter !== "object" ||
      typeof adapter.id !== "string" || !/^[a-z][a-z0-9_]{1,39}$/.test(adapter.id) ||
      typeof adapter.validatorVersion !== "string" || adapter.validatorVersion.length < 1 ||
      !Number.isInteger(adapter.sessionLifetimeMs) || adapter.sessionLifetimeMs < 60_000 ||
      REQUIRED_METHODS.some(method => typeof adapter[method] !== "function")) {
    return { valid: false, missing: REQUIRED_METHODS.filter(method => typeof adapter?.[method] !== "function") };
  }
  return { valid: true, missing: [] };
}

export function resolveThinkLabAdapter(gameId) {
  const adapter = getThinkLabAdapter(gameId);
  if (!adapter) throw new RangeError("Unsupported Think Lab game");
  const validation = validateThinkLabAdapter(adapter);
  if (!validation.valid) throw new TypeError("Think Lab adapter contract is incomplete");
  return adapter;
}
