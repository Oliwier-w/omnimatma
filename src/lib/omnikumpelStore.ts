import type { OmniAISettings, OmniPracticeSpec, OmniSolution } from "./omnikumpelTypes";

export const OMNI_PINS_KEY = "omnimatma-kumpel-pins-v1";
export const OMNI_SETTINGS_KEY = "omnimatma-kumpel-ai-v1";
export const OMNI_MAX_PINS = 100;
export const OMNI_MAX_STORAGE_BYTES = 1024 * 1024;
export const OMNI_DEFAULT_SETTINGS: OmniAISettings = { provider: "gemini", model: "", apiKey: "", remember: false };
let sessionSettings: OmniAISettings | null = null;
export type OmniPin = { id: string; createdAt: string; input: string; solution: OmniSolution };
export type OmniStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type OmniStoreResult<T> = { ok: true; value: T } | { ok: false; error: string };
const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 12000): v is string => typeof v === "string" && v.length <= max;
const own = (v: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(v, key) ? v[key] : undefined;

function practice(value: unknown): OmniPracticeSpec | undefined {
  if (!record(value)) return;
  const kind = own(value, "kind"), op = own(value, "operation");
  if (kind === "quadratic" || kind === "derivative") return { kind };
  if (kind === "matrix" && (op === "inverse" || op === "add" || op === "multiply" || op === "transpose")) return { kind, operation: op };
  if (kind === "complex" && (op === "add" || op === "multiply" || op === "divide" || op === "conjugate" || op === "modulus")) return { kind, operation: op };
  const statistic = own(value, "statistic");
  if (kind === "statistics" && (statistic === "mean" || statistic === "median" || statistic === "variance" || statistic === "std" || statistic === "all")) return { kind, statistic };
  const spec = own(value, "spec");
  if (kind === "smart" && record(spec)) {
    const sk = own(spec, "kind"), operation = own(spec, "operation");
    if (sk === "linear-equation" || sk === "determinant2x2") return { kind, spec: { kind: sk } };
    if (sk === "rational" && (operation === "+" || operation === "-" || operation === "*" || operation === "/")) return { kind, spec: { kind: sk, operation } };
  }
}

/** Only allowlisted mathematical fields cross the persistence boundary. Never spread input. */
export function sanitizeOmniSolution(value: unknown): OmniSolution | null {
  if (!record(value)) return null;
  const status = own(value, "status"), input = own(value, "input"), normalized = own(value, "normalized"), summary = own(value, "summary"), exact = own(value, "exact"), steps = own(value, "steps");
  if (status !== "solved" && status !== "unsupported" && status !== "invalid") return null;
  if (!text(input, 600) || !text(normalized) || !text(summary) || typeof exact !== "boolean" || !Array.isArray(steps) || steps.length > 100) return null;
  const clean: OmniSolution = { status, input, normalized, summary, exact, steps: [] };
  for (const step of steps) {
    if (!record(step) || !text(own(step, "title"), 1000) || !text(own(step, "latex")) || !text(own(step, "why"))) return null;
    const item = { title: step.title as string, latex: step.latex as string, why: step.why as string, ...(text(own(step, "expression")) ? { expression: step.expression as string } : {}) };
    clean.steps.push(item);
  }
  for (const field of ["answer", "answerLatex", "tutorHint"] as const) {
    const v = own(value, field);
    if (v !== undefined && !text(v)) return null;
    if (typeof v === "string") clean[field] = v;
  }
  const family = own(value, "family");
  if (family === "rational" || family === "linear" || family === "quadratic" || family === "matrix" || family === "complex" || family === "derivative" || family === "statistics" || family === "context") clean.family = family;
  const spec = practice(own(value, "practice"));
  if (spec) clean.practice = spec;
  return clean;
}

function sanitizePins(value: unknown): OmniPin[] | null {
  if (!Array.isArray(value) || value.length > OMNI_MAX_PINS) return null;
  const pins: OmniPin[] = [], ids = new Set<string>();
  for (const pin of value) {
    if (!record(pin)) return null;
    const id = own(pin, "id"), createdAt = own(pin, "createdAt"), input = own(pin, "input"), solution = sanitizeOmniSolution(own(pin, "solution"));
    if (!text(id, 120) || !id || ids.has(id) || !text(createdAt, 40) || !Number.isFinite(Date.parse(createdAt)) || !text(input, 600) || !solution || solution.status !== "solved") return null;
    ids.add(id);
    pins.push({ id, createdAt, input, solution });
  }
  return pins;
}

export function parseOmniPins(raw: string): OmniStoreResult<OmniPin[]> {
  if (raw.length > OMNI_MAX_STORAGE_BYTES || new TextEncoder().encode(raw).length > OMNI_MAX_STORAGE_BYTES) return fail("Przypięte rozwiązania przekraczają limit 1 MB.");
  try {
    const data: unknown = JSON.parse(raw);
    const pins = record(data) && own(data, "version") === 1 ? sanitizePins(own(data, "pins")) : null;
    return pins ? { ok: true, value: pins } : fail("Nieprawidłowy format przypiętych rozwiązań. Nie nadpisano danych.");
  } catch { return fail("Nie można odczytać przypiętych rozwiązań. Nie nadpisano danych."); }
}

function browserStorage(): OmniStorage {
  if (typeof window === "undefined") throw new Error("Pamięć przeglądarki jest niedostępna.");
  return window.localStorage;
}

export function loadOmniPins(storage?: OmniStorage): OmniStoreResult<OmniPin[]> {
  try {
    const raw = (storage ?? browserStorage()).getItem(OMNI_PINS_KEY);
    return raw === null ? { ok: true, value: [] } : parseOmniPins(raw);
  } catch { return fail("Pamięć przeglądarki jest niedostępna. Przypięcia nie zostały zmienione."); }
}

export function saveOmniPins(value: readonly OmniPin[], storage?: OmniStorage): OmniStoreResult<OmniPin[]> {
  try {
    const pins = sanitizePins(value);
    if (!pins) return fail("Nieprawidłowe przypięcie lub przekroczony limit 100 przypięć.");
    const raw = JSON.stringify({ version: 1, pins });
    if (new TextEncoder().encode(raw).length > OMNI_MAX_STORAGE_BYTES) return fail("Przypięcia przekraczają limit 1 MB. Poprzednie dane zachowano.");
    const target = storage ?? browserStorage();
    const previous = target.getItem(OMNI_PINS_KEY);
    if (previous !== null && !parseOmniPins(previous).ok) return fail("Istniejące przypięcia są uszkodzone. Nie nadpisano ich.");
    target.setItem(OMNI_PINS_KEY, raw);
    return { ok: true, value: pins };
  } catch { return fail("Nie udało się zapisać przypięć. Poprzednie dane zachowano."); }
}

export function createOmniPin(input: string, solution: OmniSolution, id: string, createdAt = new Date().toISOString()): OmniPin | null {
  return sanitizePins([{ id, createdAt, input, solution }])?.[0] ?? null;
}

function sanitizeSettings(value: unknown): OmniAISettings | null {
  if (!record(value)) return null;
  const provider = own(value, "provider"), model = own(value, "model"), apiKey = own(value, "apiKey");
  if (provider !== "gemini" && provider !== "openrouter" && provider !== "openai" && provider !== "opencode") return null;
  if (!text(model, 300) || !text(apiKey, 4096) || typeof own(value, "remember") !== "boolean") return null;
  return { provider, model, apiKey, remember: value.remember as boolean };
}

export function loadOmniSettings(storage?: OmniStorage): OmniStoreResult<OmniAISettings> {
  if (sessionSettings) return { ok: true, value: { ...sessionSettings } };
  try {
    const raw = (storage ?? browserStorage()).getItem(OMNI_SETTINGS_KEY);
    if (raw === null) return { ok: true, value: { ...OMNI_DEFAULT_SETTINGS } };
    if (raw.length > 24000) return fail("Ustawienia AI są zbyt duże.");
    const settings = sanitizeSettings(JSON.parse(raw));
    return settings?.remember ? { ok: true, value: settings } : fail("Nieprawidłowe ustawienia AI.");
  } catch { return fail("Nie można odczytać ustawień AI. Możesz korzystać lokalnie bez AI."); }
}

export function saveOmniSettings(value: OmniAISettings, storage?: OmniStorage): OmniStoreResult<OmniAISettings> {
  const settings = sanitizeSettings(value);
  if (!settings) return fail("Nieprawidłowe ustawienia AI.");
  sessionSettings = { ...settings };
  try {
    const target = storage ?? browserStorage();
    if (settings.remember) target.setItem(OMNI_SETTINGS_KEY, JSON.stringify(settings));
    else target.removeItem(OMNI_SETTINGS_KEY);
    return { ok: true, value: settings };
  } catch { return fail("Nie udało się zmienić zapisu ustawień AI. Klucz pozostaje tylko w pamięci tej sesji; wcześniejszy zapis mógł pozostać w przeglądarce."); }
}

export function clearOmniSettings(storage?: OmniStorage): OmniStoreResult<OmniAISettings> {
  sessionSettings = { ...OMNI_DEFAULT_SETTINGS };
  try {
    (storage ?? browserStorage()).removeItem(OMNI_SETTINGS_KEY);
    return { ok: true, value: { ...OMNI_DEFAULT_SETTINGS } };
  } catch { return fail("Nie udało się usunąć zapisanego klucza z przeglądarki. Sprawdź uprawnienia pamięci witryny."); }
}
