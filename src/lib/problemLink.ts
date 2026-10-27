import { parseSmartPractice, smartPracticeTopicId, type SmartPracticeSpec } from "./smartMath";
import { parseOmniPractice, omniPracticeTopicId } from "./omnikumpelEngine";
import type { OmniPracticeSpec } from "./omnikumpelTypes";

export type ProblemLink = {
  topicId: string;
  difficulty: number;
  seed: number;
  smart?: SmartPracticeSpec;
  omni?: OmniPracticeSpec;
  mode?: "single" | "series5" | "series10";
};
const UINT32 = 4294967295;
export function problemPath(value: ProblemLink): string {
  if (!value.topicId || !Number.isInteger(value.difficulty) || value.difficulty < 1 || value.difficulty > 5 || !Number.isSafeInteger(value.seed) || value.seed < 0 || value.seed > UINT32)
    throw new Error("Nieprawidłowe parametry linku do zadania.");
  const params = new URLSearchParams({ v: "2", topic: value.topicId, difficulty: String(value.difficulty), seed: String(value.seed) });
  if (value.smart) {
    if (value.omni) throw new Error("Link może zawierać tylko jeden typ treningu.");
    const spec = parseSmartPractice(value.smart);
    if (!spec || smartPracticeTopicId(spec) !== value.topicId) throw new Error("Nieprawidłowy typ podobnych zadań.");
    params.set("practice", JSON.stringify(spec));
  }
  if (value.omni) {
    const spec = parseOmniPractice(value.omni);
    if (!spec || omniPracticeTopicId(spec) !== value.topicId) throw new Error("Nieprawidłowy typ treningu OmniKumpla.");
    params.set("omni", JSON.stringify(spec));
  }
  if (value.mode === "series5") params.set("mode", "series5");
  if (value.mode === "series10") params.set("mode", "series10");
  return `/zadania?${params.toString()}`;
}

export function parseProblemLink(params: Pick<URLSearchParams, "get" | "has">, knownTopics: readonly string[]): { value: ProblemLink | null; error?: string } {
  if (!["v", "topic", "difficulty", "seed", "practice", "omni", "mode"].some((key) => params.has(key))) return { value: null };
  const invalid = { value: null, error: "Ten link do zadania jest nieprawidłowy lub pochodzi z nieobsługiwanej wersji. Możesz wylosować nowe zadanie poniżej." };
  if (params.get("v") !== "2") return invalid;
  const topicId = params.get("topic") ?? "";
  const difficultyText = params.get("difficulty") ?? "";
  const seedText = params.get("seed") ?? "";
  if (!knownTopics.includes(topicId) || !/^[1-5]$/.test(difficultyText) || !/^\d{1,10}$/.test(seedText)) return invalid;
  const seed = Number(seedText);
  if (seed > UINT32) return invalid;
  const mode = params.get("mode");
  if (mode !== null && mode !== "single" && mode !== "series10" && mode !== "series5") return invalid;
  let smart: SmartPracticeSpec | undefined;
  if (params.has("practice")) {
    const raw = params.get("practice") ?? "";
    if (raw.length > 1000) return invalid;
    try { smart = parseSmartPractice(JSON.parse(raw)) ?? undefined; } catch { return invalid; }
    if (!smart || smartPracticeTopicId(smart) !== topicId) return invalid;
  }
  let omni: OmniPracticeSpec | undefined;
  if (params.has("omni")) {
    if (smart) return invalid;
    const raw = params.get("omni") ?? "";
    if (raw.length > 1000) return invalid;
    try { omni = parseOmniPractice(JSON.parse(raw)) ?? undefined; } catch { return invalid; }
    if (!omni || omniPracticeTopicId(omni) !== topicId) return invalid;
  }
  return { value: { topicId, difficulty: Number(difficultyText), seed, ...(smart ? { smart } : {}), ...(omni ? { omni } : {}), mode: mode === "series10" ? "series10" : mode === "series5" ? "series5" : "single" } };
}
