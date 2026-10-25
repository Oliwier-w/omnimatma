import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { random } from "../src/generators/shared";
import { maturaGeometriaProblem } from "../src/generators/maturaGeometria";
import { checkAnswer, numericValue } from "../src/lib/math";

const IDS = [
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

const SEEDS = [0, 1, 42, 987654, -100];

const numeric = (text: string): number => {
  const value = numericValue(text);
  assert.equal(typeof value, "number", `${text} should be a scalar`);
  return value as number;
};

const near = (actual: number, expected: number, message?: string) =>
  assert.ok(
    Math.abs(actual - expected) <
      1e-7 * Math.max(1, Math.abs(expected)),
    message ?? `${actual} != ${expected}`,
  );

const tableRows = (prompt: string): [number, number][] => [
  ...prompt.matchAll(/wartość (-?\d+) – częstość (\d+)/g),
].map((match) => [Number(match[1]), Number(match[2])]);

test("dziesięć maturalnych generatorów: poziomy, determinizm i poprawna forma", () => {
  for (const id of IDS) {
    const prompts = new Set<string>();
    for (let level = 1; level <= 5; level++) {
      for (const seed of SEEDS) {
        const problem = maturaGeometriaProblem(id, level, seed, random(seed));
        assert.deepEqual(
          problem,
          maturaGeometriaProblem(id, level, seed, random(seed)),
          `${id}: wynik nie jest deterministyczny`,
        );
        assert.equal(problem.id, `${id}-${level}-${seed}`);
        assert.equal(problem.generatorId, id);
        assert.equal(problem.difficulty, level);
        assert.ok(problem.prompt.length > 20);
        assert.ok(!problem.prompt.includes("$"));
        assert.ok(problem.latex.length > 0 && !problem.latex.includes("\t"));
        assert.doesNotThrow(
          () =>
            katex.renderToString(problem.latex, {
              throwOnError: true,
              trust: false,
            }),
          `${id}: ${problem.latex}`,
        );
        assert.ok(
          checkAnswer(problem.answer, problem.answer).correct,
          `${id}: ${problem.answer}`,
        );
        assert.ok(problem.hints.length >= 3);
        problem.hints.forEach((hint) =>
          assert.ok(hint.length > 10, `${id}: zbyt krótka podpowiedź`),
        );
        assert.ok(problem.steps.length >= 3);
        problem.steps.forEach((step, index) => {
          assert.ok(
            step.explanation.length > 10,
            `${id}: zbyt krótkie wyjaśnienie kroku ${index + 1}`,
          );
          assert.ok(
            checkAnswer(step.expression, problem.answer).correct,
            `${id}: krok ${step.expression} != ${problem.answer}`,
          );
        });
        prompts.add(problem.prompt);
      }
    }
    assert.ok(
      prompts.size >= 15,
      `${id}: tylko ${prompts.size} różnych poleceń`,
    );
    const atSeed42 = new Set(
      [1, 2, 3, 4, 5].map(
        (level) => maturaGeometriaProblem(id, level, 42, random(42)).prompt,
      ),
    );
    assert.equal(
      atSeed42.size,
      5,
      `${id}: poziomy powinny różnić się poleceniem`,
    );
  }
});

test("zadanie 21: podobieństwo i skala obwodów", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-podobienstwo",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(
        /długości (\d+), (\d+) i (\d+)\. Obwód .* równy (\d+)\./,
      );
      assert.ok(match, p.prompt);
      const [a, b, c, perimeter] = match.slice(1).map(Number);
      near(numeric(p.answer), (a * perimeter) / (a + b + c));
      assert.equal(numeric(p.answer), Math.min(a, b, c) * (perimeter / (a + b + c)));
    }
});

test("zadanie 22: współczynnik kierunkowy prostej", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-prosta",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(
        /A=\((-?\d+), (-?\d+)\) i B=\((-?\d+), (-?\d+)\)/,
      );
      assert.ok(match, p.prompt);
      const [x1, y1, x2, y2] = match.slice(1).map(Number);
      near(numeric(p.answer), (y2 - y1) / (x2 - x1));
    }
});

test("zadanie 23: kwadrat promienia okręgu", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-okrag",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(
        /P=\((-?\d+), (-?\d+)\) leży na okręgu o środku S=\((-?\d+), (-?\d+)\)/,
      );
      assert.ok(match, p.prompt);
      const [x, y, centerX, centerY] = match.slice(1).map(Number);
      near(
        numeric(p.answer),
        (x - centerX) ** 2 + (y - centerY) ** 2,
      );
    }
});

test("zadanie 24: równoległość i współczynnik m", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-proste-rownolegle",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(
        /y=\(m-(\d+)\)x\+\(m([+-]\d+)\) i y=(\d+)x([+-]\d+)/,
      );
      assert.ok(match, p.prompt);
      near(numeric(p.answer), Number(match[1]) + Number(match[3]));
    }
});

test("zadanie 25: objętość graniastosłupa sześciokątnego", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-graniastoslup",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(/wszystkie krawędzie długości (\d+)/);
      assert.ok(match, p.prompt);
      const a = Number(match[1]);
      near(numeric(p.answer), ((3 * Math.sqrt(3)) / 2) * a ** 3);
    }
});

test("zadanie 26: wysokość ostrosłupa z kąta nachylenia", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-ostroslup-kat",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(
        /krawędź boczna ma długość (\d+), a kąt .* ma miarę (\d+)°/,
      );
      assert.ok(match, p.prompt);
      const [lateral, angle] = match.slice(1).map(Number);
      near(
        numeric(p.answer),
        lateral * Math.sin((angle * Math.PI) / 180),
      );
    }
});

test("zadanie 27: krawędzie i wierzchołki ostrosłupa", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-ostroslup-krawedzie",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(/o (\d+) większa od liczby jego wierzchołków/);
      assert.ok(match, p.prompt);
      const difference = Number(match[1]);
      const sides = numeric(p.answer);
      near(sides, difference + 1);
      assert.equal(2 * sides - (sides + 1), difference);
    }
});

test("zadanie 28: prawdopodobieństwo sumy dwóch kostek", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-prawdopodobienstwo",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(/(równa|większa od) (\d+)\./);
      assert.ok(match, p.prompt);
      const strict = match[1] === "większa od";
      const threshold = Number(match[2]);
      let count = 0;
      for (let first = 1; first <= 6; first++)
        for (let second = 1; second <= 6; second++)
          if (
            strict
              ? first + second > threshold
              : first + second === threshold
          )
            count++;
      near(numeric(p.answer), count / 36);
    }
});

test("zadanie 29: mediana, dominanta i prawdopodobieństwo z tabeli", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-statystyka",
        level,
        seed,
        random(seed),
      );
      const rows = tableRows(p.prompt);
      assert.equal(rows.length, 5, p.prompt);
      const total = rows.reduce((sum, [, count]) => sum + count, 0);
      if (p.prompt.includes("medianę")) {
        const position = (total + 1) / 2;
        let cumulative = 0;
        let expected = rows[0][0];
        for (const [value, count] of rows) {
          cumulative += count;
          if (cumulative >= position) {
            expected = value;
            break;
          }
        }
        assert.equal(numeric(p.answer), expected);
      } else if (p.prompt.includes("dominantę")) {
        const maximum = Math.max(...rows.map(([, count]) => count));
        const expected = rows.find(([, count]) => count === maximum)![0];
        assert.equal(numeric(p.answer), expected);
      } else {
        const match = p.prompt.match(/ma ona wartość (-?\d+)\?/);
        assert.ok(match, p.prompt);
        const expectedValue = Number(match[1]);
        const expectedCount = rows.find(([value]) => value === expectedValue)![1];
        near(numeric(p.answer), expectedCount / total);
      }
    }
});

test("zadanie 30: optymalizacja pola bocznego walca", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = maturaGeometriaProblem(
        "matura-geometria-optymalizacja",
        level,
        seed,
        random(seed),
      );
      const match = p.prompt.match(/d\+h=(\d+)/);
      assert.ok(match, p.prompt);
      near(numeric(p.answer), Number(match[1]) / 4);
    }
});
