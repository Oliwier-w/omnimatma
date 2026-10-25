import { parse, type MathNode } from "mathjs";
import { gcd, random, type Problem } from "./shared";
import { checkAnswer } from "../lib/math";
import { fractionProblem } from "./fractions";
import { matrixProblem } from "./matrices";
import { complexProblem } from "./complex";
export type { Problem } from "./shared";
export { checkAnswer, checkSteps } from "../lib/math";

/** Final-answer validation; intermediate steps intentionally remain value-based. */
export function checkProblemAnswer(
  problem: Problem,
  input: string,
): ReturnType<typeof checkAnswer> {
  const result = checkAnswer(input, problem.answer);
  if (
    !result.correct ||
    !["fractions-meaning", "fractions-simplify", "fractions-mixed"].includes(
      problem.generatorId,
    )
  )
    return result;
  // Inspect syntax, never evaluate arbitrary nodes. Parentheses and signed integers are harmless.
  const unwrap = (node: MathNode): MathNode =>
    node.type === "ParenthesisNode"
      ? unwrap((node as unknown as { content: MathNode }).content)
      : node;
  const integer = (node: MathNode): number => {
    const n = unwrap(node) as unknown as {
      type: string;
      value: number;
      op: string;
      args: MathNode[];
    };
    if (n.type === "ConstantNode" && Number.isSafeInteger(n.value))
      return n.value;
    if (
      n.type === "OperatorNode" &&
      n.args.length === 1 &&
      ["+", "-"].includes(n.op)
    )
      return (n.op === "-" ? -1 : 1) * integer(n.args[0]);
    return NaN;
  };
  let root = unwrap(parse(input));
  // A sign may apply to the complete fraction, e.g. -(3/4).
  while (root.type === "OperatorNode") {
    const signed = root as unknown as { op: string; args: MathNode[] };
    if (signed.args.length !== 1 || !["+", "-"].includes(signed.op)) break;
    root = unwrap(signed.args[0]);
  }
  const node = root as unknown as {
    type: string;
    op: string;
    args: MathNode[];
  };
  const [numerator, denominator] =
    node.type === "OperatorNode" && node.op === "/" && node.args.length === 2
      ? node.args.map(integer)
      : [NaN, NaN];
  if (
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    denominator === 0
  ) {
    return {
      correct: false,
      message:
        "Zapisz wynik jako ułamek: całkowity licznik / całkowity niezerowy mianownik.",
    };
  }
  if (
    problem.generatorId !== "fractions-meaning" &&
    (denominator < 0 || gcd(numerator, denominator) !== 1)
  ) {
    return {
      correct: false,
      message:
        "Skróć ułamek do postaci nieskracalnej i zapisz dodatni mianownik.",
    };
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
] as const;

export function generateProblem(
  generatorId: string,
  difficulty: number,
  seed: number = Math.floor(Math.random() * 4294967296),
) {
  if (!(GENERATOR_IDS as readonly string[]).includes(generatorId))
    throw new Error(`Nieznany generator: ${generatorId}`);
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5)
    throw new Error("Poziom trudności musi być liczbą całkowitą od 1 do 5.");
  if (!Number.isSafeInteger(seed))
    throw new Error("Ziarno musi być bezpieczną liczbą całkowitą.");
  const rng = random(seed);
  const factory = generatorId.startsWith("fractions-")
    ? fractionProblem
    : generatorId.startsWith("matrix-")
      ? matrixProblem
      : complexProblem;
  return factory(generatorId, difficulty, seed, rng);
}
