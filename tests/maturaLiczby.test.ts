import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { maturaLiczbyProblem } from "../src/generators/maturaLiczby";
import { random } from "../src/generators/shared";
import { checkAnswer, numericValue } from "../src/lib/math";

const IDS = [
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
] as const;
const SEEDS = [0, 1, 42, 987654, -100];

const problem = (id: string, level: number, seed: number) =>
  maturaLiczbyProblem(id, level, seed, random(seed));

const near = (actual: number, expected: number, label: string) =>
  assert.ok(
    Math.abs(actual - expected) <=
      1e-8 * Math.max(1, Math.abs(actual), Math.abs(expected)),
    `${label}: ${actual} != ${expected}`,
  );

function answerValue(answer: string): number {
  const value = numericValue(answer);
  assert.equal(typeof value, "number", `Odpowiedź nie jest liczbą: ${answer}`);
  return value as number;
}

const fifthRoot = (value: number) =>
  Math.sign(value) * Math.round(Math.abs(value) ** (1 / 5));

/** Niezależny od generatora punkt kontrolny dla każdego wariantu zadania. */
function oracle(id: string, level: number, prompt: string): number {
  if (id === "matura-liczby-pierwiastki") {
    if (level === 1) {
      const cube = Number(prompt.match(/∛\((-?\d+)\)/)![1]);
      return Math.round(Math.cbrt(cube));
    }
    if (level === 2) {
      const cube = Number(prompt.match(/∛\((-?\d+)\)/)![1]);
      const fifth = Number(prompt.match(/⁵√\((-?\d+)\)/)![1]);
      return Math.round(Math.cbrt(cube)) + fifthRoot(fifth);
    }
    if (level === 3) {
      const [, c, cube, fifth] = prompt.match(
        /^Oblicz (\d+)·∛\((-?\d+)\) − ⁵√\((-?\d+)\)/,
      )!;
      return Number(c) * Math.round(Math.cbrt(Number(cube))) - fifthRoot(Number(fifth));
    }
    if (level === 4) {
      const cube = Number(prompt.match(/∛\((-?\d+)\)/)![1]);
      const square = Number(prompt.match(/(?<!⁵)√\((\d+)\)/)![1]);
      const fifth = Number(prompt.match(/⁵√\((-?\d+)\)/)![1]);
      return Math.round(Math.cbrt(cube)) + Math.sqrt(square) - fifthRoot(fifth);
    }
    const [, c, cube, d, fifth, square] = prompt.match(
      /^Oblicz (\d+)·∛\((-?\d+)\) − (\d+)·⁵√\((-?\d+)\) \+ √\((\d+)\)/,
    )!;
    return (
      Number(c) * Math.round(Math.cbrt(Number(cube))) -
      Number(d) * fifthRoot(Number(fifth)) +
      Math.sqrt(Number(square))
    );
  }

  if (id === "matura-liczby-potegi") {
    if (level === 1) {
      const [, a, n] = prompt.match(/^Oblicz (\d+)\^\(-(\d+)\)/)!;
      return Number(a) ** -Number(n);
    }
    if (level === 2) {
      const [, p, q, n] = prompt.match(/^Oblicz \((\d+)\/(\d+)\)\^\(-(\d+)\)/)!;
      return (Number(p) / Number(q)) ** -Number(n);
    }
    if (level === 3) {
      const [, a, m, n] = prompt.match(/^Oblicz (\d+)\^\((\d+)\/(\d+)\)/)!;
      return Number(a) ** (Number(m) / Number(n));
    }
    if (level === 4) {
      const [, a, m, n, c, k] = prompt.match(
        /^Oblicz (\d+)\^\((\d+)\/(\d+)\) · (\d+)\^\(-(\d+)\)/,
      )!;
      return Number(a) ** (Number(m) / Number(n)) * Number(c) ** -Number(k);
    }
    const [, a, m, n, c, k, d, r] = prompt.match(
      /^Oblicz \((\d+)\^\((\d+)\/(\d+)\) · (\d+)\^\(-(\d+)\)\) \/ (\d+)\^\(-(\d+)\)/,
    )!;
    return (
      (Number(a) ** (Number(m) / Number(n)) * Number(c) ** -Number(k)) /
      Number(d) ** -Number(r)
    );
  }

  if (id === "matura-liczby-logarytmy") {
    if (level < 5) {
      const match = prompt.match(
        /^Oblicz log_(\d+) (\d+) \+ log_(\d+) (\d+) − log_(\d+) (\d+)\.$/,
      )!;
      const [, baseA, x, baseB, y, baseC, z] = match;
      assert.equal(baseA, baseB);
      assert.equal(baseA, baseC);
      const base = Number(baseA);
      return (
        Math.log(Number(x)) / Math.log(base) +
        Math.log(Number(y)) / Math.log(base) -
        Math.log(Number(z)) / Math.log(base)
      );
    }
    const [, baseA, k, baseB, p, baseC, root] = prompt.match(
      /^Oblicz log_(\d+) \(1\/(\d+)\) \+ log_(\d+) (\d+) − log_(\d+) √(\d+)\.$/,
    )!;
    assert.equal(baseA, baseB);
    assert.equal(baseA, baseC);
    assert.equal(baseA, root);
    const base = Number(baseA);
    return (
      -Math.log(Number(k)) / Math.log(base) +
      Math.log(Number(p)) / Math.log(base) -
      0.5
    );
  }

  if (id === "matura-liczby-wzory-skrocone") {
    const b = Number(prompt.match(/dla b = (\d+)/)![1]);
    if (level <= 2) return 4 * b * Math.PI;
    if (level <= 4) return 4 * b * Math.SQRT2;
    return 4 * Math.PI * Math.sqrt(b);
  }

  if (id === "matura-liczby-podzielnosc") {
    const n = Number(prompt.match(/dla n = (\d+)/)![1]);
    assert.equal(n % 2, 1, "n musi być nieparzyste");
    if (level === 1) return (n ** 3 - n) / 24;
    if (level === 2) return (3 * n ** 2 + 6 * n + 15) / 12;
    if (level === 3) return (n ** 5 - n) / 30;
    if (level === 4) return (n ** 4 - 1) / 16;
    return (n ** 5 - n) / 240;
  }

  if (id === "matura-liczby-nierownosc-liniowa") {
    if (level === 1) {
      const [, a, b, c] = prompt.match(
        /nierówność (\d+)x \+ (\d+) ≥ (-?\d+)/,
      )!;
      return (Number(c) - Number(b)) / Number(a);
    }
    if (level === 2 || level === 4) {
      const [, a, b, c] = prompt.match(
        /nierówność (\d+)x − (\d+) > (-?\d+)/,
      )!;
      return Math.floor((Number(c) + Number(b)) / Number(a) + 1e-12) + 1;
    }
    if (level === 3) {
      const [, b, a, c] = prompt.match(
        /nierówność (\d+) \+ (\d+)x ≥ (-?\d+)/,
      )!;
      return (Number(c) - Number(b)) / Number(a);
    }
    const [, c, a, b] = prompt.match(
      /nierówność (-?\d+) ≤ (\d+)x \+ (\d+)/,
    )!;
    return (Number(c) - Number(b)) / Number(a);
  }

  if (id === "matura-liczby-rownanie-iloczynowe") {
    if (level === 1) {
      const [, p, q] = prompt.match(
        /\(x − (\d+)\)\(x − (\d+)\) = 0/,
      )!;
      return Number(p) + Number(q);
    }
    if (level === 2) {
      const [, p, q] = prompt.match(
        /\(x \+ (\d+)\)\(x − (\d+)\) = 0/,
      )!;
      return Number(q) - Number(p);
    }
    if (level === 3) {
      const [, a, p, q] = prompt.match(
        /\((\d+)x − (\d+)\)\(x \+ (\d+)\) = 0/,
      )!;
      return Number(p) / Number(a) - Number(q);
    }
    if (level === 4) {
      const [, p, q, a, r] = prompt.match(
        /\(x − (\d+)\)\(x \+ (\d+)\)\((\d+)x − (\d+)\) = 0/,
      )!;
      return Number(p) - Number(q) + Number(r) / Number(a);
    }
    const [, p, q, r, s] = prompt.match(
      /\(x \+ (\d+)\)\(x − (\d+)\)\(x \+ (\d+)\)\(x − (\d+)\) = 0/,
    )!;
    return -Number(p) + Number(q) - Number(r) + Number(s);
  }

  if (id === "matura-liczby-wyrazenia-wymierne") {
    if (level === 1) {
      const [, numerator, denominator] = prompt.match(
        /\(x\^2 − (\d+)\)\/\(x − (\d+)\)/,
      )!;
      assert.equal(Math.sqrt(Number(numerator)), Number(denominator));
      return Number(denominator);
    }
    if (level === 2) {
      const [, sum, product, denominator] = prompt.match(
        /\(x\^2 \+ (\d+)x \+ (\d+)\)\/\(x \+ (\d+)\)/,
      )!;
      return Number(product) / Number(denominator);
    }
    if (level === 3) {
      const [, signB, b, signC, c, denominator] = prompt.match(
        /\(2x\^2 ([+−]) (\d+)x ([+−]) (\d+)\)\/\(x − (\d+)\)/,
      )!;
      const a = Number(denominator);
      const expectedC = (signC === "−" ? -1 : 1) * Number(c) / -a;
      const expectedB = expectedC - 2 * a;
      const actualB = (signB === "−" ? -1 : 1) * Number(b);
      assert.equal(actualB, expectedB, "Niespójny współczynnik przy x");
      return expectedC;
    }
    if (level === 4) {
      const [, numerator, linear, quadratic] = prompt.match(
        /\(x\^3 − (\d+)\)\/\(x\^2 \+ (\d+)x \+ (\d+)\)/,
      )!;
      assert.equal(Number(linear) ** 2, Number(quadratic));
      assert.equal(Number(linear) ** 3, Number(numerator));
      return -Number(linear);
    }
    const [, a2, b, a, b2] = prompt.match(
      /\(\(x\^2 − (\d+)\)\(x \+ (\d+)\)\)\/\(\(x − (\d+)\)\(x\^2 − (\d+)\)\)/,
    )!;
    assert.equal(Number(a) ** 2, Number(a2));
    assert.equal(Number(b) ** 2, Number(b2));
    return Number(a);
  }

  if (id === "matura-liczby-nierownosc-kwadratowa") {
    if (level === 1) {
      const [, p, q] = prompt.match(
        /\(x − (\d+)\)\(x − (\d+)\) ≤ 0/,
      )!;
      return Math.max(Number(p), Number(q));
    }
    if (level === 2) {
      const [, p, q] = prompt.match(
        /\(x \+ (\d+)\)\(x − (\d+)\) < 0/,
      )!;
      return Number(q) - 1;
    }
    if (level === 3) {
      const [, a, n, p] = prompt.match(
        /\((\d+)x − (\d+)\)\(x \+ (\d+)\) ≤ 0/,
      )!;
      assert.ok(Number(p) > 0);
      return Math.floor(Number(n) / Number(a));
    }
    const open = level === 4;
    const [, a, n, b, m] = prompt.match(
      new RegExp(
        `\\((\\d+)x − (\\d+)\\)\\((\\d+)x \\+ (\\d+)\\) ${open ? "<" : "≤"} 0`,
      ),
    )!;
    const right = Number(n) / Number(a);
    return open ? Math.ceil(right - 1e-12) - 1 : Math.floor(right + 1e-12);
  }

  if (id === "matura-liczby-uklad-rownan") {
    const numbers = [...prompt.matchAll(/\d+/g)].map((match) =>
      Number(match[0]),
    );
    assert.equal(numbers.length, 6, prompt);
    const [a, b, first, c, d, second] = numbers;
    return (first * d - second * b) / (a * d - b * c);
  }

  throw new Error(`Brak oracle dla ${id}`);
}

for (const id of IDS) {
  test(`${id}: poziomy, determinizm, kroki i niezależny wynik`, () => {
    const prompts = new Set<string>();
    for (let level = 1; level <= 5; level++) {
      for (const seed of SEEDS) {
        const p = problem(id, level, seed);
        assert.deepEqual(p, problem(id, level, seed));
        assert.equal(p.generatorId, id);
        assert.equal(p.difficulty, level);
        assert.ok(p.prompt.length > 10 && !p.prompt.includes("$"));
        assert.ok(p.latex.length > 0 && !p.latex.includes("$"));
        assert.doesNotThrow(
          () => katex.renderToString(p.latex, { throwOnError: true }),
          `${id}: ${p.latex}`,
        );
        assert.ok(p.hints.length >= 3);
        assert.ok(p.hints.every((hint) => hint.length > 10));
        assert.ok(p.steps.length >= 3);
        assert.ok(
          p.steps.every((step) => step.explanation.length > 10),
          `${id}: zbyt krótkie wyjaśnienie`,
        );
        assert.ok(
          checkAnswer(p.answer, p.answer).correct,
          `${id}: odpowiedź nie przechodzi checkAnswer`,
        );
        for (const step of p.steps)
          assert.ok(
            checkAnswer(step.expression, p.answer).correct,
            `${id}: ${step.expression} != ${p.answer}`,
          );
        const actual = answerValue(p.answer);
        near(actual, oracle(id, level, p.prompt), `${id} L${level} s${seed}`);
        prompts.add(p.prompt);
      }
    }
    assert.ok(prompts.size >= 15, `${id}: tylko ${prompts.size} różnych promptów`);
    assert.equal(
      new Set([1, 2, 3, 4, 5].map((level) => problem(id, level, 42).prompt))
        .size,
      5,
      `${id}: poziomy powinny różnić się przy seed 42`,
    );
  });
}

test("matura-liczby: odpowiedzi są liczbowe, a kroki mają poprawne wyrażenia", () => {
  for (const id of IDS)
    for (let level = 1; level <= 5; level++)
      for (const seed of SEEDS) {
        const p = problem(id, level, seed);
        assert.doesNotThrow(() => answerValue(p.answer));
        assert.ok(!/^\[/.test(p.answer), `${id}: odpowiedź nie może być wektorem`);
        for (const step of p.steps)
          assert.doesNotThrow(() => numericValue(step.expression));
      }
});

test("matura-liczby: znane punkty kontrolne z arkusza", () => {
  assert.equal(
    problem("matura-liczby-pierwiastki", 2, 42).prompt.includes("∛"),
    true,
  );
  const logs = problem("matura-liczby-logarytmy", 1, 42);
  assert.match(logs.prompt, /log_/);
  const system = problem("matura-liczby-uklad-rownan", 1, 42);
  assert.match(system.prompt, /zł/);
  const proof = problem("matura-liczby-podzielnosc", 2, 42);
  assert.match(proof.prompt, /nieparzystej/);
});
