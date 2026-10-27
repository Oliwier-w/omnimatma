import type { Problem } from "@/generators/shared";
import type { SmartPracticeSpec } from "./smartMath";

export type OmniPracticeSpec =
  | { kind: "smart"; spec: SmartPracticeSpec }
  | { kind: "quadratic" }
  | { kind: "matrix"; operation: "inverse" | "add" | "multiply" | "transpose" }
  | { kind: "complex"; operation: "add" | "multiply" | "divide" | "conjugate" | "modulus" }
  | { kind: "derivative" }
  | { kind: "statistics"; statistic: "mean" | "median" | "variance" | "std" | "all" };
export type OmniStep = { title: string; latex: string; why: string; expression?: string };
export type OmniSolution = {
  status: "solved" | "unsupported" | "invalid";
  input: string;
  normalized: string;
  summary: string;
  exact: boolean;
  answer?: string;
  answerLatex?: string;
  family?: "rational" | "linear" | "quadratic" | "matrix" | "complex" | "derivative" | "statistics" | "context";
  steps: OmniStep[];
  tutorHint?: string;
  practice?: OmniPracticeSpec;
};
export type OmniLineCheck = { line: number; text: string; status: "correct" | "incorrect" | "unsupported" | "skipped"; message: string };
export type OmniContext = { id: string; title: string; prompt: string; problem?: Problem; lessonHint?: string };
export type OmniAIMode = "explain" | "tutor" | "ocr";
export type OmniAIProvider = "gemini" | "openrouter" | "openai" | "opencode";
export type OmniAISettings = { provider: OmniAIProvider; model: string; apiKey: string; remember: boolean };
