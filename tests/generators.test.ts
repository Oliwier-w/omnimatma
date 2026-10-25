import test from "node:test";
import assert from "node:assert/strict";
import {
  GENERATOR_IDS,
  generateProblem,
  checkAnswer,
  checkProblemAnswer,
  checkSteps,
} from "../src/generators/index";
import { numericValue } from "../src/lib/math";

const plain = (value: unknown): any =>
  value && typeof value === "object" && "toArray" in value
    ? (value as { toArray(): unknown }).toArray()
    : value;
const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const value = (s: string) => plain(numericValue(s));
// Prompt operands use only integer literals or integer ratios, independent of the checker.
const rational = (s: string): number => {
  assert.match(s, /^-?\d+(?:\/-?\d+)?$/);
  const [numerator, denominator = 1] = s.split("/").map(Number);
  return numerator / denominator;
};

for (const id of GENERATOR_IDS) {
  test(`${id}: five levels, reproducible seeds, finite equivalent steps`, () => {
    const signatures = new Set<string>();
    for (let level = 1; level <= 5; level++) {
      for (const seed of [0, 1, 42, 987654, -100]) {
        const p = generateProblem(id, level, seed);
        assert.deepEqual(p, generateProblem(id, level, seed));
        assert.equal(p.generatorId, id);
        assert.equal(p.difficulty, level);
        assert.ok(p.prompt && p.latex && !p.latex.includes("\t"));
        assert.ok(p.hints.length >= 3 && p.hints.every((h) => h.length > 10));
        assert.ok(
          p.steps.length >= 3 &&
            p.steps.every((s) => s.explanation.length > 10),
        );
        assert.ok(
          checkAnswer(p.answer, p.answer).correct,
          `${p.id}: ${p.answer}`,
        );
        assert.ok(
          checkProblemAnswer(p, p.answer).correct,
          `${p.id}: final answer must satisfy task semantics`,
        );
        for (const step of p.steps)
          assert.ok(
            checkAnswer(step.expression, p.answer).correct,
            `${p.id}: ${step.expression} != ${p.answer}: ${checkAnswer(step.expression, p.answer).message}`,
          );
        signatures.add(p.prompt);
      }
    }
    assert.ok(signatures.size >= 15, "Procedural parameters should vary.");
    assert.equal(
      new Set(
        [1, 2, 3, 4, 5].map((level) => generateProblem(id, level, 42).prompt),
      ).size,
      5,
    );
  });
}

test("fraction independent arithmetic oracles", () => {
  for (const id of [
    "fractions-add",
    "fractions-subtract",
    "fractions-multiply",
    "fractions-divide",
    "fractions-compound",
  ]) {
    for (let level = 1; level <= 5; level++)
      for (let seed = 0; seed < 10; seed++) {
        const p = generateProblem(id, level, seed);
        const numbers = [...p.prompt.matchAll(/-?\d+/g)].map((m) =>
          Number(m[0]),
        );
        const [a, b, c, d] = numbers;
        const expected = id.endsWith("add")
          ? a / b + c / d
          : id.endsWith("subtract")
            ? a / b - c / d
            : id.endsWith("multiply")
              ? ((a / b) * c) / d
              : id.endsWith("divide")
                ? a / b / (c / d)
                : (a / b + c / d) / (c / b);
        near(value(p.answer), expected);
      }
  }
});

test("fraction representation and comparison independent oracles", () => {
  const gcd = (a: number, b: number): number =>
    b ? gcd(b, a % b) : Math.abs(a);
  for (const id of [
    "fractions-meaning",
    "fractions-simplify",
    "fractions-common",
    "fractions-mixed",
    "fractions-compare",
  ]) {
    for (let level = 1; level <= 5; level++)
      for (let seed = 0; seed < 8; seed++) {
        const p = generateProblem(id, level, seed);
        const numbers = [...p.prompt.matchAll(/-?\d+/g)].map((m) =>
          Number(m[0]),
        );
        const [a, b, c, d] = numbers;
        const actual = value(p.answer);
        if (id === "fractions-meaning")
          near(actual, (a / b) * (p.prompt.includes("przeciwną") ? -1 : 1));
        if (id === "fractions-simplify") near(actual, a / b);
        if (id === "fractions-common") {
          const lcm = (b * d) / gcd(b, d);
          assert.deepEqual(actual, [(a * lcm) / b, (c * lcm) / d, lcm]);
        }
        if (id === "fractions-mixed")
          near(actual, (a + b / c) * (p.prompt.includes("ujemną") ? -1 : 1));
        if (id === "fractions-compare")
          assert.equal(actual, Math.sign(a * d - c * b));
      }
  }
});

test("complex coordinates preserve real and imaginary components", () => {
  for (let level = 1; level <= 5; level++)
    for (let seed = 0; seed < 8; seed++) {
      const p = generateProblem("complex-parts", level, seed);
      const coordinates = [
        ...p.prompt.matchAll(/\(\(([-\d/]+)\)\+\(([-\d/]+)\)\*i\)/g),
      ][0];
      assert.deepEqual(value(p.answer), [
        rational(coordinates[1]),
        rational(coordinates[2]),
      ]);
      const g = generateProblem("complex-gauss", level, seed);
      const pair = g.prompt.match(/P=\(([-\d/]+), ([-\d/]+)\)/)!;
      const z = value(g.answer);
      near(z.re, rational(pair[1]));
      near(z.im, rational(pair[2]));
    }
});

test("matrix independent element, product, determinant, inverse and equation oracles", () => {
  const product = (a: number[][], b: number[][]) =>
    a.map((row) =>
      b[0].map((_, j) => row.reduce((sum, v, k) => sum + v * b[k][j], 0)),
    );
  const compare = (a: number[][], b: number[][]) => {
    assert.equal(a.length, b.length);
    a.forEach((row, i) => {
      assert.equal(row.length, b[i].length);
      row.forEach((v, j) => near(v, b[i][j]));
    });
  };
  // Independent Gaussian-elimination determinant, not the generator's cofactor implementation.
  const determinant = (input: number[][]) => {
    const a = input.map((row) => [...row]);
    let sign = 1;
    for (let k = 0; k < a.length; k++) {
      const pivot = a.findIndex((row, i) => i >= k && Math.abs(row[k]) > 1e-12);
      if (pivot < 0) return 0;
      if (pivot !== k) {
        [a[pivot], a[k]] = [a[k], a[pivot]];
        sign *= -1;
      }
      for (let i = k + 1; i < a.length; i++) {
        const ratio = a[i][k] / a[k][k];
        for (let j = k + 1; j < a.length; j++) a[i][j] -= ratio * a[k][j];
      }
    }
    return sign * a.reduce((acc, row, i) => acc * row[i], 1);
  };
  for (const id of GENERATOR_IDS.filter((id) => id.startsWith("matrix-"))) {
    for (let level = 1; level <= 5; level++)
      for (let seed = 0; seed < 8; seed++) {
        const p = generateProblem(id, level, seed);
        const matrices = [...p.prompt.matchAll(/\[\[.*?\]\]/g)].map(
          (m) => JSON.parse(m[0]) as number[][],
        );
        const [a, b] = matrices,
          answer = value(p.answer);
        if (id === "matrix-multiply") compare(answer, product(a, b));
        if (id === "matrix-equation") compare(product(a, answer), b);
        if (id === "matrix-inverse")
          compare(
            product(a, answer),
            a.map((row, i) => row.map((_, j) => Number(i === j))),
          );
        if (id === "matrix-det") near(answer, determinant(a));
        if (id === "matrix-trace")
          near(
            answer,
            a.reduce((s, row, i) => s + row[i], 0),
          );
        if (id === "matrix-transpose")
          compare(
            answer,
            a[0].map((_, j) => a.map((row) => row[j])),
          );
        if (id === "matrix-add" || id === "matrix-subtract")
          compare(
            answer,
            a.map((row, i) =>
              row.map((v, j) => v + (id === "matrix-add" ? 1 : -1) * b[i][j]),
            ),
          );
        if (id === "matrix-scale") {
          const k = p.prompt
            .match(/skalar ([-\d/]+)/)![1]
            .split("/")
            .map(Number);
          compare(
            answer,
            a.map((row) => row.map((v) => (v * k[0]) / (k[1] || 1))),
          );
        }
        if (id === "matrix-entry") {
          const indices = [
            ...p.prompt.matchAll(/(?:wierszu|kolumnie) (\d+)/g),
          ].map((m) => Number(m[1]) - 1);
          near(answer, a[indices[0]][indices[1]]);
        }
      }
  }
});

test("complex arithmetic independent real-coordinate oracle", () => {
  const pair = (v: any): [number, number] =>
    typeof v === "number" ? [v, 0] : [v.re, v.im];
  const mul = ([a, b]: number[], [c, d]: number[]) => [
    a * c - b * d,
    a * d + b * c,
  ];
  for (const id of [
    "complex-add",
    "complex-subtract",
    "complex-multiply",
    "complex-divide",
    "complex-conjugate",
    "complex-modulus",
    "complex-power",
    "complex-equation",
  ]) {
    for (let level = 1; level <= 5; level++)
      for (let seed = 0; seed < 8; seed++) {
        const p = generateProblem(id, level, seed);
        const literals = [
          ...p.prompt.matchAll(/\(\(([-\d/]+)\)\+\(([-\d/]+)\)\*i\)/g),
        ].map((m) => [rational(m[1]), rational(m[2])]);
        let expected: number[];
        const [[a, b], second] = literals;
        if (id === "complex-conjugate") expected = [a, -b];
        else if (id === "complex-modulus") expected = [Math.hypot(a, b), 0];
        else if (id === "complex-power") {
          expected = [1, 0];
          const exponent = Number(p.prompt.match(/potęgi (\d+)/)![1]);
          for (let k = 0; k < exponent; k++) expected = mul(expected, [a, b]);
        } else {
          const [c, d] = second;
          expected =
            id === "complex-add"
              ? [a + c, b + d]
              : id === "complex-subtract"
                ? [a - c, b - d]
                : id === "complex-multiply"
                  ? mul([a, b], [c, d])
                  : id === "complex-equation"
                    ? [
                        (c * a + d * b) / (a * a + b * b),
                        (d * a - c * b) / (a * a + b * b),
                      ]
                    : [
                        (a * c + b * d) / (c * c + d * d),
                        (b * c - a * d) / (c * c + d * d),
                      ];
        }
        const actual = pair(value(p.answer));
        near(actual[0], expected[0]);
        near(actual[1], expected[1]);
      }
  }
});

test("checker accepts equivalent numbers, matrices, complex values; identifies wrong lines", () => {
  for (const [a, b] of [
    ["2/6", "1/3"],
    ["sqrt(8)", "2*sqrt(2)"],
    ["(1+i)^2", "2*i"],
    ["[1,2;3,4]", "[[1,2],[3,4]]"],
    ["1/3", "0.3333333333"],
  ])
    assert.equal(checkAnswer(a, b).correct, true, a);
  assert.deepEqual(
    checkSteps(["2/6", "-1/3", "1/3", "x=1"], "1/3").map((r) => r.correct),
    [true, false, true, false],
  );
  assert.equal(checkAnswer("[[1,2]]", "[1,2]").correct, false);
  assert.equal(checkAnswer("1+i", "1-i").correct, false);
});

test("checker rejects malicious, nonfinite, oversized and unsupported input", () => {
  const bad = [
    "a=2",
    "x+1",
    "x=1",
    "2;3",
    'import("fs")',
    'evaluate("2+2")',
    'parse("2")',
    'simplify("x")',
    'createUnit("x")',
    'sqrt.constructor("return 1")()',
    "[1,2][1]",
    "range(1,10000000)",
    "ones(10000)",
    "factorial(100000)",
    "1/0",
    "0/0",
    "Infinity",
    "NaN",
    "true",
    '"hello"',
    "2^100000",
    "2^(2^12)",
    "10^12*10^12",
    "2^0.5",
    "9".repeat(2049),
    "(".repeat(1000) + "1" + ")".repeat(1000),
    "[" + Array(17).fill("1").join(",") + "]",
  ];
  for (const input of bad)
    assert.equal(checkAnswer(input, "1").correct, false, input.slice(0, 80));
  assert.equal(checkAnswer("1", "1/0").correct, false);
  assert.throws(() => generateProblem("unknown", 1));
  for (const level of [0, 6, 1.5, NaN])
    assert.throws(() => generateProblem("matrix-add", level));
  assert.throws(() => generateProblem("matrix-add", 1, Infinity));
});

test("final fraction answers enforce the requested representation, not just equality", () => {
  const simplify = {
    ...generateProblem("fractions-simplify", 1, 1),
    answer: "-3/4",
  };
  for (const input of ["-3/4", "(-3)/(4)", "-(3/4)", "((-3/4))"])
    assert.equal(checkProblemAnswer(simplify, input).correct, true, input);
  for (const input of ["-6/8", "3/-4", "-0.75", "-(1+2)/4", "(-3/4)*1"])
    assert.equal(checkProblemAnswer(simplify, input).correct, false, input);
  const mixed = { ...generateProblem("fractions-mixed", 1, 1), answer: "7/3" };
  for (const input of ["14/6", "2+1/3", "7/-3", "[7/3]"])
    assert.equal(checkProblemAnswer(mixed, input).correct, false, input);
  assert.equal(checkProblemAnswer(mixed, "(7)/(3)").correct, true);
  const meaning = {
    ...generateProblem("fractions-meaning", 1, 1),
    answer: "1/2",
  };
  for (const input of ["1/2", "2/4", "-1/-2", "-(-1/2)"])
    assert.equal(checkProblemAnswer(meaning, input).correct, true, input);
  for (const input of ["0.5", "sqrt(1/4)", "1/0", "1/3"])
    assert.equal(checkProblemAnswer(meaning, input).correct, false, input);
  const arithmetic = {
    ...generateProblem("fractions-add", 1, 1),
    answer: "1/2",
  };
  for (const input of ["0.5", "2/4", "1/-(-2)", "sqrt(1/4)"])
    assert.equal(checkProblemAnswer(arithmetic, input).correct, true, input);
  assert.equal(
    checkAnswer("-6/8", simplify.answer).correct,
    true,
    "Scratchpad still accepts equivalent unsimplified steps",
  );
});

test("checker supports bounded constants, powers and matrix operations", () => {
  near(value("pi"), Math.PI);
  near(value("e"), Math.E);
  assert.equal(checkAnswer("pi+e", String(Math.PI + Math.E)).correct, true);
  assert.equal(checkAnswer("2^-12", "1/4096").correct, true);
  assert.equal(checkAnswer("2^12", "4096").correct, true);
  const identity = JSON.stringify(
    Array.from({ length: 16 }, (_, i) =>
      Array.from({ length: 16 }, (_, j) => Number(i === j)),
    ),
  );
  assert.equal(checkAnswer(`inv(${identity})`, identity).correct, true);
  assert.equal(checkAnswer(`det(${identity})`, "1").correct, true);
  for (const input of [
    "[[[1]]]",
    "[[1],[2,3]]",
    "[1,[2]]",
    "[]",
    "[[]]",
    "1e309",
    "1000000000000001",
    "2^-13",
    "2^13",
    "pi()",
    "e=1",
    "pi.constructor",
    "sqrt([[[1]]])",
    `inv([${Array(17).fill("[1]").join(",")}])`,
  ])
    assert.throws(() => numericValue(input), Error, input);
});

test("reading tasks do not print their answer as the exercise formula", () => {
  assert.equal(
    generateProblem("fractions-meaning", 3, 42).latex,
    "\\frac{?}{?}",
  );
  assert.match(generateProblem("matrix-entry", 3, 42).latex, /a_\{\d\d\}=\?/);
  assert.match(generateProblem("complex-parts", 3, 42).latex, /re|Re/);
});
