import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { maturaFunkcjeProblem } from "../src/generators/maturaFunkcje";
import { random } from "../src/generators/shared";
import { checkAnswer } from "../src/lib/math";

const IDS = [
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
] as const;

const SEEDS = [0, 1, 42, 987654, -100];

function captures(prompt: string, pattern: RegExp): RegExpMatchArray {
  const match = prompt.match(pattern);
  assert.ok(match, `Nie udało się odczytać danych z promptu: ${prompt}`);
  return match;
}

const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-8 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

/** Niezależny wynik wyliczony wyłącznie z treści zadania. */
function expected(id: string, prompt: string): string {
  switch (id) {
    case "matura-funkcje-przedzialami": {
      const m = captures(
        prompt,
        /f\(x\) = \{ (-?\d+)x \+ (\d+) dla x <= 0; (-?\d+)x \+ (\d+) dla x > 0 \}\. Wyznacz największą wartość funkcji f w przedziale \[(-?\d+), (-?\d+)\]\./,
      );
      const slopeLeft = Number(m[1]);
      const constant = Number(m[2]);
      const slopeRight = Number(m[3]);
      const left = Number(m[5]);
      const right = Number(m[6]);
      return String(
        Math.max(
          slopeLeft * left + constant,
          constant,
          slopeRight * right + constant,
        ),
      );
    }
    case "matura-funkcje-liniowa": {
      const m = captures(
        prompt,
        /f\(x\) = (-?\d+)x \+ m\^2 \+ (\d+)m przecina oś OY w punkcie \(0, (-?\d+)\)\./,
      );
      const b = Number(m[2]);
      const y = Number(m[3]);
      return `(sqrt(${b * b}+4*${y})-${b})/2`;
    }
    case "matura-funkcje-kwadratowa": {
      const m = captures(prompt, /gdzie a = (-?\d+), h = (-?\d+), k = (-?\d+)\./);
      const a = Number(m[1]);
      const h = Number(m[2]);
      const k = Number(m[3]);
      return String(a * h * h + k);
    }
    case "matura-funkcje-ciag-geometryczny": {
      const m = captures(
        prompt,
        /pierwszy wyraz jest równy (-?\d+), a iloraz q = (-?\d+(?:\/\d+)?)\. Oblicz wyraz a_(\d+)\./,
      );
      const firstTerm = Number(m[1]);
      const quotient = m[2];
      const n = Number(m[3]);
      return `${firstTerm}*(${quotient})^${n - 1}`;
    }
    case "matura-funkcje-ciag-arytmetyczny": {
      const m = captures(
        prompt,
        /suma pierwszych dziesięciu wyrazów wynosi (-?\d+), a średnia arytmetyczna wyrazów a1, a7 i a8 wynosi (-?\d+)\./,
      );
      const sum = Number(m[1]);
      const mean = Number(m[2]);
      const difference = (3 * sum - 30 * mean) / 5;
      const firstTerm = (sum - 45 * difference) / 10;
      near(firstTerm, Math.round(firstTerm));
      near(difference, Math.round(difference));
      return `[${firstTerm},${difference}]`;
    }
    case "matura-funkcje-ciag-trzywyrazowy": {
      const m = captures(prompt, /Liczby x, x \+ (\d+), (\d+)x \+ (\d+) są dodatnie/);
      const a = Number(m[1]);
      const b = Number(m[2]);
      const c = Number(m[3]);
      // (x + a)^2 = x(bx + c)  =>  (1-b)x^2 + (2a-c)x + a^2 = 0
      const qa = 1 - b;
      const qb = 2 * a - c;
      const qc = a * a;
      let x: number;
      if (Math.abs(qa) < 1e-12) {
        x = -qc / qb;
      } else {
        const discriminant = qb * qb - 4 * qa * qc;
        assert.ok(discriminant >= 0, `Ujemny wyróżnik w ${prompt}`);
        const roots = [
          (-qb + Math.sqrt(discriminant)) / (2 * qa),
          (-qb - Math.sqrt(discriminant)) / (2 * qa),
        ].filter((value) => value > 0);
        assert.ok(roots.length > 0, `Brak dodatniego x w ${prompt}`);
        x = Math.max(...roots);
      }
      return String((x + a) / x);
    }
    case "matura-funkcje-trygonometria": {
      const m = captures(
        prompt,
        /spełnia równanie (\d+) sin α \+ (\d+) sin\^2 α = (\d+) cos α - (\d+) cos\^2 α \+ (\d+)\. Oblicz tan α\./,
      );
      return `${m[3]}/${m[1]}`;
    }
    case "matura-funkcje-katy-okregu": {
      const m = captures(prompt, /odpowiednio (\d+)°, (\d+)°, (\d+)°/);
      return String(180 - Number(m[2]));
    }
    case "matura-funkcje-trapez": {
      const m = captures(
        prompt,
        /Przekątna AC ma długość (\d+), cosinus kąta BAC jest równy (\d+)\/(\d+), a różnica długości podstaw wynosi (\d+)\./,
      );
      const diagonal = Number(m[1]);
      const cosNumerator = Number(m[2]);
      const cosDenominator = Number(m[3]);
      const difference = Number(m[4]);
      return `sqrt((${difference}/2)^2+(${diagonal}^2-(${diagonal}*${cosNumerator}/${cosDenominator})^2))`;
    }
    case "matura-funkcje-trojkat-prostokatny": {
      const m = captures(prompt, /przeciwprostokątną długości (\d+)\./);
      const hypotenuse = Number(m[1]);
      return `${hypotenuse}+${hypotenuse}*sqrt(2)`;
    }
    default:
      throw new Error(`Brak niezależnego orakulum dla ${id}`);
  }
}

for (const id of IDS) {
  test(`${id}: poziomy 1–5, determinizm, kroki, KaTeX i niezależny wynik`, () => {
    const prompts = new Set<string>();
    for (let level = 1; level <= 5; level++) {
      for (const seed of SEEDS) {
        const problem = maturaFunkcjeProblem(id, level, seed, random(seed));
        assert.deepEqual(
          problem,
          maturaFunkcjeProblem(id, level, seed, random(seed)),
          "Ten sam seed musi dawać identyczne zadanie.",
        );
        assert.equal(problem.generatorId, id);
        assert.equal(problem.difficulty, level);
        assert.ok(problem.prompt.length > 20);
        assert.ok(problem.latex.length > 0);
        assert.ok(!problem.latex.includes("$"));
        assert.ok(problem.answer.length > 0);
        assert.ok(problem.hints.length >= 3);
        assert.ok(problem.hints.every((hint) => hint.length > 10));
        assert.ok(problem.steps.length >= 3);
        assert.ok(problem.steps.every((step) => step.explanation.length > 10));

        assert.ok(
          checkAnswer(problem.answer, problem.answer).correct,
          `${id}: odpowiedź nie przechodzi checkAnswer: ${problem.answer}`,
        );
        for (const step of problem.steps)
          assert.ok(
            checkAnswer(step.expression, problem.answer).correct,
            `${id}: krok ${step.expression} nie jest równy ${problem.answer}`,
          );

        const oracle = expected(id, problem.prompt);
        assert.ok(
          checkAnswer(problem.answer, oracle).correct,
          `${id}: ${problem.answer} != ${oracle} dla promptu ${problem.prompt}`,
        );

        assert.doesNotThrow(
          () => katex.renderToString(problem.latex, { throwOnError: true }),
          `${id}: niepoprawny KaTeX ${problem.latex}`,
        );
        prompts.add(problem.prompt);
      }
    }
    assert.ok(prompts.size >= 15, `${id}: tylko ${prompts.size} różnych promptów`);
    assert.equal(
      new Set(
        [1, 2, 3, 4, 5].map(
          (level) => maturaFunkcjeProblem(id, level, 42, random(42)).prompt,
        ),
      ).size,
      5,
      `${id}: poziomy powinny różnić się treścią przy seed 42`,
    );
  });
}
