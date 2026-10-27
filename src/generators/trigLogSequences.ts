import type { Problem } from "./shared";
import { finish, type RNG } from "./shared";

export const TRIG_LOG_SEQUENCE_GENERATOR_IDS = [
  "extra-trigonometry",
  "extra-logarithms",
  "extra-sequences",
] as const;

const manual = (
  generatorId: string,
  difficulty: number,
  seed: number,
  prompt: string,
  latex: string,
  answer: string,
  steps: { expression: string; explanation: string }[],
  hints: string[],
  wrong?: { answer: string; message: string },
): Problem => ({
  id: `${generatorId}-${difficulty}-${seed}`,
  generatorId,
  difficulty,
  prompt,
  latex,
  answer,
  hints,
  steps,
  commonTraps: [],
  mistakes: wrong ? [wrong] : [],
});

function trigProblem(generatorId: string, difficulty: number, seed: number, rng: RNG): Problem {
  const pairs = [
    { angle: 30, fn: "sin", answer: "1/2", latex: "\\sin 30^\\circ = \\frac{1}{2}" },
    { angle: 30, fn: "cos", answer: "\\sqrt{3}/2", latex: "\\cos 30^\\circ = \\frac{\\sqrt{3}}{2}" },
    { angle: 45, fn: "tg", answer: "1", latex: "\\operatorname{tg} 45^\\circ = 1" },
    { angle: 60, fn: "sin", answer: "\\sqrt{3}/2", latex: "\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}" },
    { angle: 60, fn: "cos", answer: "1/2", latex: "\\cos 60^\\circ = \\frac{1}{2}" },
    { angle: 90, fn: "sin", answer: "1", latex: "\\sin 90^\\circ = 1" },
  ];
  const pick = pairs[rng(0, pairs.length - 1)];
  const answer = pick.answer.replace("\\sqrt{3}", "sqrt(3)");
  return manual(
    generatorId,
    difficulty,
    seed,
    `Oblicz ${pick.fn} ${pick.angle}°. Wynik podaj dokładnie (ułamek lub pierwiastek w postaci liczby).`,
    pick.latex,
    answer,
    [
      { expression: pick.latex, explanation: `Korzystamy z wartości funkcji trygonometrycznych dla kąta ${pick.angle}°.` },
      { expression: answer, explanation: "Odpowiedź zapisujemy w najprostszej dokładnej postaci." },
    ],
    [`Narysuj trójkąt charakterystyczny dla kąta ${pick.angle}°.`, "Porównaj długości boków lub użyj tabeli wartości."],
    { answer: pick.answer === "1" ? "0" : "1", message: "To nie jest wartość tej funkcji dla podanego kąta." },
  );
}

function logProblem(generatorId: string, difficulty: number, seed: number, rng: RNG): Problem {
  const base = [2, 3, 5, 10][rng(0, 3)];
  const exponent = rng(2, 2 + difficulty);
  const value = Math.pow(base, exponent);
  const latexBase = base === 10 ? "" : `_{${base}}`;
  return manual(
    generatorId,
    difficulty,
    seed,
    `Oblicz logarytm: log${base === 10 ? "" : `_${base}`} ${value}.`,
    `\\log${latexBase} ${value}`,
    `${exponent}`,
    [
      { expression: `${base}^${exponent}`, explanation: `Szukamy wykładnika, do którego podnosimy ${base}, aby otrzymać ${value}.` },
      { expression: `${exponent}`, explanation: `Ponieważ ${base}^${exponent} = ${value}, logarytm wynosi ${exponent}.` },
    ],
    [`Zapytaj: ${base} do której potęgi daje ${value}?`, "Rozpisz potęgi krok po kroku."],
    { answer: `${value}`, message: "To liczba logarytmowana, a nie wynik logarytmu." },
  );
}

function sequenceProblem(generatorId: string, difficulty: number, seed: number, rng: RNG): Problem {
  const a1 = rng(1, 9);
  const step = rng(2, 3 + difficulty);
  const n = rng(5, 8 + difficulty * 2);
  const arithmetic = rng(1, 2) === 1;
  if (arithmetic) {
    const value = a1 + (n - 1) * step;
    return finish(generatorId, difficulty, seed, `W ciągu arytmetycznym a₁ = ${a1} i r = ${step}. Oblicz a${n}.`, `${value}`, [`${a1}+(${n}-1)*${step}`], [
      `Korzystamy ze wzoru aₙ = a₁ + (n − 1)r, podstawiając n = ${n}.`,
    ], [`Podstaw n = ${n}, a₁ = ${a1}, r = ${step}.`, "Najpierw policz (n − 1)r, potem dodaj a₁."]);
  }
  const value = a1 * Math.pow(step, n - 1);
  return finish(generatorId, difficulty, seed, `W ciągu geometrycznym a₁ = ${a1} i q = ${step}. Oblicz a${n}.`, `${value}`, [`${a1}*${step}^${n - 1}`], [
    `Korzystamy ze wzoru aₙ = a₁ · q^(n − 1) dla n = ${n}.`,
  ], [`Podstaw a₁ = ${a1}, q = ${step}, n = ${n}.`, "Najpierw policz potęgę, potem pomnóż przez a₁."]);
}

export function trigLogSequenceProblem(
  generatorId: string,
  difficulty: number,
  seed: number,
  rng: RNG,
): Problem {
  if (generatorId === "extra-trigonometry") return trigProblem(generatorId, difficulty, seed, rng);
  if (generatorId === "extra-logarithms") return logProblem(generatorId, difficulty, seed, rng);
  return sequenceProblem(generatorId, difficulty, seed, rng);
}
