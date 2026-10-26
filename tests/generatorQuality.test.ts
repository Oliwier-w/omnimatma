import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { parse } from "mathjs";
import { GENERATOR_IDS, generateProblem, checkProblemAnswer, checkAnswer } from "../src/generators";
import { numericValue } from "../src/lib/math";
import { cleanMathLatex } from "../src/lib/cleanMathLatex";

test("rational-polynomial level three asks for the constant, not the x coefficient", () => {
  for (let seed = 0; seed < 30; seed++) {
    const problem = generateProblem("matura-liczby-wyrazenia-wymierne", 3, seed);
    assert.match(problem.prompt, /podaj wyraz wolny/);
    assert.match(problem.steps.at(-1)!.explanation, /współczynnik przy x to 2/);
  }
});

test("LaTeX cleaning is conservative, command-safe and idempotent", () => {
  for (const [input, expected] of [
    ["1x + -3", "x -3"],
    ["-1x+11x+21x+x_1+1.1x", "-x+11x+21x+x_1+1.1x"],
    ["1e3+1e-3+1E+3+1x1", "1e3+1e-3+1E+3+1x1"],
    ["x^{11}+x^{1}+\\frac{1}{11}+x_1", "x^{11}+x^{1}+\\frac{1}{11}+x_1"],
    ["x+(-3)^2+(-3)x", "x+(-3)^2+(-3)x"],
    ["0.30000000000000004+0.7999999999999999", "0.3+0.8"],
    ["3.141592653589793+0.1234567890123456+0.00000000000000004", "3.141592653589793+0.1234567890123456+0.00000000000000004"],
    ["\\text{1x + -3 {nested}}+1x", "\\text{1x + -3 {nested}}+x"],
    ["\\log_{11}x+\\sqrt{21x},\\quad x\\in(-1,11]", "\\log_{11}x+\\sqrt{21x},\\quad x\\in(-1,11]"],
    ["\\operatorname{1x}+\\mathrm{1x}+\\frac{1x}{1}+x^{-1}", "\\operatorname{1x}+\\mathrm{1x}+\\frac{1x}{1}+x^{-1}"],
  ]) {
    assert.equal(cleanMathLatex(input), expected);
    assert.equal(cleanMathLatex(expected), expected);
    katex.renderToString(expected, { throwOnError: true });
  }
});

test("all 60 generators: levels 1–3, 24 seeds, finite equivalent steps and valid KaTeX", () => {
  assert.equal(GENERATOR_IDS.length, 60);
  for (const id of GENERATOR_IDS)
    for (let level = 1; level <= 3; level++)
      for (let seed = 0; seed < 24; seed++) {
        const problem = generateProblem(id, level, seed);
        assert.deepEqual(problem, generateProblem(id, level, seed));
        assert.equal(problem.id, `${id}-${level}-${seed}`);
        assert.doesNotMatch(problem.latex, /NaN|Infinity|undefined|\+\s*-/);
        katex.renderToString(problem.latex, { throwOnError: true });
        assert.equal(checkProblemAnswer(problem, problem.answer).correct, true, problem.id);
        for (const step of problem.steps) {
          assert.doesNotThrow(() => numericValue(step.expression), problem.id);
          assert.equal(checkAnswer(step.expression, problem.answer).correct, true, `${problem.id}: ${step.expression}`);
          parse(step.expression).traverse((node) => {
            if (node.type !== "OperatorNode") return;
            const op = node as unknown as { op: string; args: { toString(): string }[] };
            if (op.op === "/") assert.notEqual(numericValue(op.args[1].toString()), 0, problem.id);
          });
        }
      }
});

test("all five levels retain seeded determinism including signed and large seeds", () => {
  for (const id of GENERATOR_IDS)
    for (let level = 1; level <= 5; level++)
      for (const seed of [-100, 42, 4294967295])
        assert.deepEqual(generateProblem(id, level, seed), generateProblem(id, level, seed));
});

test("targeted reverse constructions produce integral inverse, quotient and modulus", () => {
  for (let level = 1; level <= 3; level++)
    for (let seed = 0; seed < 80; seed++) {
      const modulus = generateProblem("complex-modulus", level, seed);
      assert.ok(Number.isInteger(numericValue(modulus.answer)));
      const quotient = numericValue(generateProblem("complex-divide", level, seed).answer) as { re: number; im: number } | number;
      assert.ok(typeof quotient === "number" ? Number.isInteger(quotient) : Number.isInteger(quotient.re) && Number.isInteger(quotient.im));
      const inverse = numericValue(generateProblem("matrix-inverse", level, seed).answer) as number[][];
      assert.ok(inverse.flat().every(Number.isInteger));
    }
});

test("structured misconception diagnostics never replace a correct result or parse prompts", () => {
  for (const [id, rule] of [
    ["fractions-add", /mianownik/],
    ["matrix-det", /wyznacznik|Wyznacznik/],
    ["matura-liczby-wzory-skrocone", /2ab/],
  ] as const) {
    for (const level of [1, 2, 3, 4, 5]) {
      const problem = generateProblem(id, level, 42);
      assert.equal(checkProblemAnswer(problem, problem.answer).correct, true);
      for (const trap of problem.mistakes ?? []) {
        const correct = checkAnswer(trap.answer, problem.answer).correct;
        const result = checkProblemAnswer({ ...problem, prompt: "untrusted nonsense" }, trap.answer);
        assert.equal(result.correct, correct);
        if (!correct) assert.match(result.message, rule);
      }
      for (const input of ['import("fs")', 'sqrt.constructor("return 1")()', "1/0", "(".repeat(1000), "9".repeat(2049)]) {
        const result = checkProblemAnswer(problem, input);
        assert.equal(result.correct, false);
        assert.equal(result.message, checkAnswer(input, problem.answer).message);
      }
    }
  }
  const collision = generateProblem("matrix-det", 1, 42);
  collision.mistakes = [{ answer: collision.answer, message: "MUST NOT APPEAR" }];
  assert.equal(checkProblemAnswer(collision, collision.answer).correct, true);
  assert.doesNotMatch(checkProblemAnswer(collision, "123456").message, /MUST NOT/);
});

test("fixed misconception arithmetic uses original operands, including symbolic squares", () => {
  const add = generateProblem("fractions-add", 1, 42);
  const [a, b, c, d] = [...add.prompt.matchAll(/\d+/g)].map((m) => Number(m[0]));
  assert.equal(checkProblemAnswer(add, `${a + c}/${b + d}`).correct, false);
  assert.match(checkProblemAnswer(add, `${a + c}/${b + d}`).message, /Dodano osobno/);
  assert.equal(checkProblemAnswer(add, `${a * d + c * b}/${b * d}`).correct, true);
  for (const level of [1, 3, 5]) {
    const square = generateProblem("matura-liczby-wzory-skrocone", level, 42);
    assert.match(checkProblemAnswer(square, "0").message, /Pominięto wyraz mieszany/);
    assert.equal(checkProblemAnswer(square, square.answer).correct, true);
    assert.match(square.answer, /pi|sqrt/);
  }
  const det = generateProblem("matrix-det", 2, 42);
  const matrix = JSON.parse(det.prompt.match(/\[\[.*?\]\]/)![0]) as number[][];
  const [[p, q], [r, s]] = matrix;
  assert.equal(checkProblemAnswer(det, String(p * s - q * r)).correct, true);
  for (const wrong of [q * r - p * s, p * s + q * r]) {
    if (wrong !== p * s - q * r) assert.match(checkProblemAnswer(det, String(wrong)).message, /wyznacznik|Wyznacznik/);
  }
});
