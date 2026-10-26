import { checkAnswer } from "../lib/math";
import type { Problem } from "./shared";

/** Compare generated numeric traps with the same bounded, non-eval checker. */
export function classifyMistake(problem: Problem, input: string): string | undefined {
  if (checkAnswer(input, problem.answer).correct) return undefined;
  for (const mistake of (problem.mistakes ?? []).slice(0, 16)) {
    if (
      !checkAnswer(mistake.answer, problem.answer).correct &&
      checkAnswer(input, mistake.answer).correct
    ) return mistake.message;
  }
  return undefined;
}
