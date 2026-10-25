import { parse } from "mathjs";

export type Problem = {
  id: string;
  generatorId: string;
  difficulty: number;
  prompt: string;
  latex: string;
  answer: string;
  hints: string[];
  steps: { expression: string; explanation: string }[];
};
export function random(seed: number) {
  let state = seed >>> 0;
  return (min: number, max: number) => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (
      min +
      Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (max - min + 1))
    );
  };
}
export type RNG = ReturnType<typeof random>;
export const gcd = (a: number, b: number): number =>
  b ? gcd(b, a % b) : Math.abs(a);
export const fraction = (a: number, b: number): string => {
  const g = gcd(a, b);
  return `${(a / g) * Math.sign(b)}/${Math.abs(b) / g}`;
};
export const complex = (a: number | string, b: number | string) =>
  `((${a})+(${b})*i)`;
export const mat = (a: (number | string)[][]) =>
  `[${a.map((row) => `[${row.join(",")}]`).join(",")}]`;
export function finish(
  generatorId: string,
  difficulty: number,
  seed: number,
  prompt: string,
  answer: string,
  expressions: string[],
  explanations: string[],
  hints: string[],
): Problem {
  const latex = parse(expressions[0]).toTex({ parenthesis: "keep" });
  return {
    id: `${generatorId}-${difficulty}-${seed}`,
    generatorId,
    difficulty,
    prompt,
    latex,
    answer,
    hints,
    steps: expressions.map((expression, i) => ({
      expression,
      explanation: explanations[i],
    })),
  };
}
