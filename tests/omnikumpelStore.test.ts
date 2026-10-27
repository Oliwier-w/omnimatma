import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clearOmniSettings, createOmniPin, loadOmniPins, loadOmniSettings,
  OMNI_MAX_STORAGE_BYTES, OMNI_PINS_KEY, OMNI_SETTINGS_KEY,
  parseOmniPins, sanitizeOmniSolution, saveOmniPins, saveOmniSettings,
  type OmniStorage,
} from "../src/lib/omnikumpelStore";
import type { OmniAISettings, OmniSolution } from "../src/lib/omnikumpelTypes";

function memory() {
  const data = new Map<string, string>();
  const storage: OmniStorage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: key => { data.delete(key); },
  };
  return { storage, data };
}
function solution(): OmniSolution {
  return {
    status: "solved", input: "2*x+3=11", normalized: "2*x+3=11", exact: true,
    summary: "Równanie liniowe", answer: "4", answerLatex: "x=4", family: "linear",
    steps: [{ title: "Odejmij 3", latex: "2x=8", why: "Po obu stronach.", expression: "2*x=8" }],
    practice: { kind: "smart", spec: { kind: "linear-equation" } }, tutorHint: "Zacznij od wyrazu wolnego.",
  };
}
const settings: OmniAISettings = { provider: "openai", model: "chosen-model", apiKey: "private-test-key", remember: false };

test("pin round trip is a detached mathematical snapshot with no unknown fields or keys", () => {
  const { storage, data } = memory();
  const original = solution();
  const dirty = { ...original, apiKey: settings.apiKey, settings, profile: { xp: 9999 }, steps: original.steps.map(s => ({ ...s, apiKey: settings.apiKey })), practice: { kind: "smart", apiKey: settings.apiKey, spec: { kind: "linear-equation", settings } } };
  const pin = createOmniPin(original.input, dirty as OmniSolution, "pin-1", "2026-10-27T12:00:00.000Z");
  assert.ok(pin);
  assert.equal(saveOmniPins([pin], storage).ok, true);
  original.steps[0].why = "changed later";
  assert.equal(pin.solution.steps[0].why, "Po obu stronach.");
  const raw = data.get(OMNI_PINS_KEY)!;
  for (const secret of [settings.apiKey, "apiKey", "settings", "profile", "9999"]) assert.equal(raw.includes(secret), false);
  assert.deepEqual(loadOmniPins(storage), { ok: true, value: [pin] });
  assert.equal(data.size, 1);
  pin.solution.steps[0].why = "changed after writing";
  const loaded = loadOmniPins(storage);
  assert.ok(loaded.ok);
  assert.equal(loaded.value[0].solution.steps[0].why, "Po obu stronach.");
});

test("broken JSON, oversized data and malformed records fail closed", () => {
  for (const raw of ["{", "null", "[]", '{"version":2,"pins":[]}', '{"version":1,"pins":[{}]}', " ".repeat(OMNI_MAX_STORAGE_BYTES + 1)]) assert.equal(parseOmniPins(raw).ok, false);
  assert.deepEqual(parseOmniPins('{"version":1,"pins":[]}'), { ok: true, value: [] });
  assert.equal(parseOmniPins(JSON.stringify({ version: 1, pins: Array(101).fill({}) })).ok, false);
  assert.equal(sanitizeOmniSolution({ ...solution(), steps: Array(101).fill(solution().steps[0]) }), null);
  assert.equal(sanitizeOmniSolution({ ...solution(), normalized: "x".repeat(12001) }), null);
});

test("prototype-bearing and unknown fields never survive sanitization", () => {
  const dirty = JSON.parse(JSON.stringify(solution()).slice(0, -1) + ',"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
  const clean = sanitizeOmniSolution(dirty);
  assert.ok(clean);
  assert.equal(Object.hasOwn(clean, "__proto__"), false);
  assert.equal(Object.hasOwn(clean, "constructor"), false);
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
  const inherited = Object.create(solution());
  assert.equal(sanitizeOmniSolution(inherited), null);
});

test("invalid writes and storage failures preserve previous pins", () => {
  const { storage, data } = memory();
  const pin = createOmniPin("2*x+3=11", solution(), "pin-1")!;
  assert.equal(saveOmniPins([pin], storage).ok, true);
  const previous = data.get(OMNI_PINS_KEY);
  assert.equal(saveOmniPins(Array(101).fill(pin), storage).ok, false);
  assert.equal(saveOmniPins([pin, pin], storage).ok, false);
  assert.equal(data.get(OMNI_PINS_KEY), previous);
  const broken: OmniStorage = { ...storage, setItem() { throw new Error("QuotaExceededError"); } };
  assert.equal(saveOmniPins([], broken).ok, false);
  assert.equal(data.get(OMNI_PINS_KEY), previous);
  data.set(OMNI_PINS_KEY, "broken original");
  assert.equal(loadOmniPins(storage).ok, false);
  assert.equal(saveOmniPins([], storage).ok, false);
  assert.equal(data.get(OMNI_PINS_KEY), "broken original");
});

test("the one MB guard counts UTF-8 bytes and keeps earlier data", () => {
  const { storage, data } = memory();
  const pin = createOmniPin("2*x+3=11", solution(), "old")!;
  saveOmniPins([pin], storage);
  const previous = data.get(OMNI_PINS_KEY);
  const large = solution();
  large.steps = Array.from({ length: 90 }, () => ({ title: "krok", latex: "ą".repeat(12000), why: "opis" }));
  const bigPin = createOmniPin(large.input, large, "big")!;
  assert.ok(bigPin);
  assert.equal(saveOmniPins([bigPin], storage).ok, false);
  assert.equal(data.get(OMNI_PINS_KEY), previous);
  assert.equal(parseOmniPins('"' + "ą".repeat(OMNI_MAX_STORAGE_BYTES / 2) + '"').ok, false);
});

test("settings require opt-in, stay separate from pins, and clear without touching pins", () => {
  const { storage, data } = memory();
  clearOmniSettings(storage);
  const pin = createOmniPin("2*x+3=11", solution(), "keep")!;
  saveOmniPins([pin], storage);
  assert.equal(saveOmniSettings(settings, storage).ok, true);
  assert.equal(data.has(OMNI_SETTINGS_KEY), false);
  assert.deepEqual(loadOmniSettings(storage), { ok: true, value: settings });
  assert.equal(saveOmniSettings({ ...settings, remember: true }, storage).ok, true);
  assert.equal(JSON.parse(data.get(OMNI_SETTINGS_KEY)!).apiKey, settings.apiKey);
  assert.equal(data.get(OMNI_PINS_KEY)!.includes(settings.apiKey), false);
  assert.equal(saveOmniSettings(settings, storage).ok, true);
  assert.equal(data.has(OMNI_SETTINGS_KEY), false);
  saveOmniSettings({ ...settings, remember: true }, storage);
  assert.equal(clearOmniSettings(storage).ok, true);
  assert.equal(data.has(OMNI_SETTINGS_KEY), false);
  assert.equal(loadOmniPins(storage).ok, true);
  const cleared = loadOmniSettings(storage);
  assert.ok(cleared.ok); assert.equal(cleared.value.apiKey, "");
});

test("denied storage is reported rather than mistaken for empty data", () => {
  const denied: OmniStorage = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } };
  assert.equal(loadOmniPins(denied).ok, false);
  assert.equal(saveOmniPins([], denied).ok, false);
  assert.equal(saveOmniSettings(settings, denied).ok, false);
  assert.equal(clearOmniSettings(denied).ok, false);
});
