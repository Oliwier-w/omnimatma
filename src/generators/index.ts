import { random, type Problem } from "./shared";
import { validateMathAnswer } from "../lib/mathValidator";
import { numericValue } from "../lib/math";
import { fractionProblem } from "./fractions";
import { matrixProblem } from "./matrices";
import { complexProblem } from "./complex";
import { maturaLiczbyProblem } from "./maturaLiczby";
import { maturaFunkcjeProblem } from "./maturaFunkcje";
import { maturaGeometriaProblem } from "./maturaGeometria";
import { percentProblem, algebraProblem, PERCENT_GENERATOR_IDS, ALGEBRA_GENERATOR_IDS } from "./percentAlgebra";
import { trigLogSequenceProblem, TRIG_LOG_SEQUENCE_GENERATOR_IDS } from "./trigLogSequences";
import { statisticsProblem, architectureProblem, STATISTICS_GENERATOR_IDS, ARCHITECTURE_GENERATOR_IDS } from "./statisticsArchitecture";
import { cleanMathLatex } from "../lib/cleanMathLatex";
export type { Problem } from "./shared";
export { checkAnswer, checkSteps } from "../lib/math";

/**
 * Extension families are deliberately separate from the 60 lesson-backed
 * generators. They can be used by new lessons or extra practice without
 * breaking the strict 1:1 catalogue audit.
 */
export const EXTENDED_GENERATOR_IDS = [
  ...PERCENT_GENERATOR_IDS,
  ...ALGEBRA_GENERATOR_IDS,
  ...TRIG_LOG_SEQUENCE_GENERATOR_IDS,
  ...STATISTICS_GENERATOR_IDS,
  ...ARCHITECTURE_GENERATOR_IDS,
] as const;

/** One final-answer policy for practice and exams. Scratchpad checkpoints stay numeric. */
export function checkProblemAnswer(
  problem: Problem,
  input: string,
): ReturnType<typeof validateMathAnswer> {
  const expected = problem.answerKind === "set" && /^\[[^\[\]]*\]$/.test(problem.answer) ? `{${problem.answer.slice(1, -1)}}` : problem.answer;
  const result = validateMathAnswer(input, expected, [
    ...(problem.commonTraps ?? []),
    ...(problem.mistakes ?? []).map(({ answer, message }) => ({ wrongAnswer: answer, explanation: message })),
  ]);
  if (result.method === "set" && problem.answerKind !== "set") {
    try {
      const value = numericValue(problem.answer) as { toArray?: () => unknown };
      if (Array.isArray(value) || (value && typeof value.toArray === "function" && Array.isArray(value.toArray()))) {
        return { status: "incorrect", correct: false, message: "To uporządkowany wektor lub macierz, nie zbiór rozwiązań. Zapisz elementy w nawiasach kwadratowych i zachowaj ich kolejność." };
      }
    } catch { /* The central validator already handles invalid expected answers. */ }
  }
  return result;
}

export const GENERATOR_IDS = [
  "fractions-meaning",
  "fractions-simplify",
  "fractions-common",
  "fractions-add",
  "fractions-subtract",
  "fractions-multiply",
  "fractions-divide",
  "fractions-mixed",
  "fractions-compare",
  "fractions-compound",
  "matrix-entry",
  "matrix-add",
  "matrix-subtract",
  "matrix-scale",
  "matrix-transpose",
  "matrix-multiply",
  "matrix-det",
  "matrix-inverse",
  "matrix-trace",
  "matrix-equation",
  "complex-parts",
  "complex-add",
  "complex-subtract",
  "complex-multiply",
  "complex-divide",
  "complex-conjugate",
  "complex-modulus",
  "complex-power",
  "complex-gauss",
  "complex-equation",
  "matura-liczby-pierwiastki",
  "matura-liczby-potegi",
  "matura-liczby-logarytmy",
  "matura-liczby-wzory-skrocone",
  "matura-liczby-podzielnosc",
  "matura-liczby-nierownosc-liniowa",
  "matura-liczby-rownanie-iloczynowe",
  "matura-liczby-wyrazenia-wymierne",
  "matura-liczby-nierownosc-kwadratowa",
  "matura-liczby-uklad-rownan",
  "matura-funkcje-przedzialami",
  "matura-funkcje-liniowa",
  "matura-funkcje-kwadratowa",
  "matura-funkcje-ciag-geometryczny",
  "matura-funkcje-ciag-arytmetyczny",
  "matura-funkcje-ciag-trzywyrazowy",
  "matura-funkcje-trygonometria",
  "matura-funkcje-katy-okregu",
  "matura-funkcje-trapez",
  "matura-funkcje-trojkat-prostokatny",
  "matura-geometria-podobienstwo",
  "matura-geometria-prosta",
  "matura-geometria-okrag",
  "matura-geometria-proste-rownolegle",
  "matura-geometria-graniastoslup",
  "matura-geometria-ostroslup-kat",
  "matura-geometria-ostroslup-krawedzie",
  "matura-geometria-prawdopodobienstwo",
  "matura-geometria-statystyka",
  "matura-geometria-optymalizacja",
] as const;
const ALL_GENERATOR_IDS: readonly string[] = [...GENERATOR_IDS, ...EXTENDED_GENERATOR_IDS];

export function generateProblem(
  generatorId: string,
  difficulty: number,
  seed: number = Math.floor(Math.random() * 4294967296),
) {
  if (!ALL_GENERATOR_IDS.includes(generatorId))
    throw new Error(`Nieznany generator: ${generatorId}`);
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5)
    throw new Error("Poziom trudności musi być liczbą całkowitą od 1 do 5.");
  if (!Number.isSafeInteger(seed))
    throw new Error("Ziarno musi być bezpieczną liczbą całkowitą.");
  const rng = random(seed);
  const factory = EXTENDED_GENERATOR_IDS.includes(generatorId as (typeof EXTENDED_GENERATOR_IDS)[number])
    ? generatorId === "extra-percent"
      ? percentProblem
      : generatorId === "extra-powers" || generatorId === "extra-linear-equations"
        ? algebraProblem
        : generatorId === "extra-statistics"
          ? statisticsProblem
          : generatorId === "extra-architecture"
            ? architectureProblem
            : trigLogSequenceProblem
    : generatorId.startsWith("fractions-")
    ? fractionProblem
    : generatorId.startsWith("matrix-")
      ? matrixProblem
      : generatorId.startsWith("complex-")
        ? complexProblem
        : generatorId.startsWith("matura-liczby-")
          ? maturaLiczbyProblem
          : generatorId.startsWith("matura-funkcje-")
            ? maturaFunkcjeProblem
            : maturaGeometriaProblem;
  const problem = factory(generatorId, difficulty, seed, rng);
  problem.latex = cleanMathLatex(problem.latex);
  problem.commonTraps = [
    ...(problem.commonTraps ?? []),
    ...(problem.mistakes ?? []).map(({ answer, message }) => ({ wrongAnswer: answer, explanation: message })),
  ].filter((trap, index, traps) => traps.findIndex(other => other.wrongAnswer === trap.wrongAnswer) === index);
  return problem;
}
