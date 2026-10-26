import test from "node:test";
import assert from "node:assert/strict";
import { solveSmartMath, parseSmartPractice, smartPracticeTopicId, generateSmartPractice, type SmartPracticeSpec, type SmartMathResult } from "../src/lib/smartMath";
import { GENERATOR_IDS, checkProblemAnswer } from "../src/generators/index";
import { numericValue, checkAnswer } from "../src/lib/math";

function solved(input: string): Extract<SmartMathResult, { kind: "solved" }> {
  const result = solveSmartMath(input);
  if (result.kind !== "solved") assert.fail(JSON.stringify(result));
  assert.ok(result.steps.length >= 3);
  assert.ok(result.steps.every((step) => step.title && step.expression && step.explanation));
  return result;
}

test("exact rational arithmetic with signed operands and precedence", () => {
  assert.equal(solved("3/4+1/2").answer, "5/4");
  assert.equal(solved("1/3+1/3+1/3").answer, "1");
  assert.equal(solved("(3/4-1/2)/(2/3)").answer, "3/8");
  assert.equal(solved("-(-3/4)*(-2/3)").answer, "-1/2");
  assert.equal(solved("2+3*4").answer, "14");
  assert.equal(solved("2−3×4").answer, "-10");
  assert.equal(solved("1000000000*1000000000+1").answer, "1000000000000000001");
  assert.deepEqual(solved("(1/2)*(3/4)").practice, { kind: "rational", operation: "*" });
  assert.deepEqual(solved("-(1/2-3/4)").practice, { kind: "rational", operation: "-" });
  assert.ok(solved("3/4+1/2").steps.some((step) => step.expression.includes("5/4")));
});

test("linear equations: exact x, no solutions and infinitely many solutions", () => {
  assert.equal(solved("2x+5=13").answer, "x = 4");
  assert.equal(solved("2*(x+3)=3x-1").answer, "x = 7");
  assert.equal(solved("x/3+1=2x/3").answer, "x = 3");
  assert.equal(solved("3x=1").answer, "x = 1/3");
  assert.equal(solved("x+1=x+2").answer, "Brak rozwiązań");
  assert.match(solved("2*(x+1)=2x+2").answer, /Nieskończenie wiele/);
  assert.equal(solved("0*x=1").answer, "Brak rozwiązań");
  assert.match(solved("0*x=0").answer, /Nieskończenie wiele/);
  assert.deepEqual(solved("2x+5=13").practice, { kind: "linear-equation" });
});

test("2x2 determinants use ad-bc, including negative and rational entries", () => {
  assert.equal(solved("det([1,2;3,4])").answer, "-2");
  assert.equal(solved("det([1/2,2;3,4])").answer, "-4");
  assert.equal(solved("det([-1,2;3,-4])").answer, "-2");
  assert.equal(solved("det([1+1,2;3,4])").answer, "2");
  assert.deepEqual(solved("det([1,2;3,4])").practice, { kind: "determinant2x2" });
});

test("unsupported or malicious syntax is never evaluated", () => {
  for (const input of [
    'import("fs")', 'evaluate("2+2")', "a=2", "x=2;3", "x.constructor",
    "__proto__", '2["constructor"]', "f(x)=x", "sqrt(4)", "sin(0)",
    "x*x=4", "x^2=4", "x/x=1", "1/(x+1)=2", "x*(x-x)=0", "2^999999999",
    "1e999999", "1.5+2", "2!", "[1,2]", "2<3", "Infinity", "NaN", "x", "2y=4",
    "det([x,2;3,4])", "det([1,2,3;4,5,6;7,8,9])",
  ]) assert.notEqual(solveSmartMath(input).kind, "solved", input);
  assert.equal(solveSmartMath("x^2=4").kind, "unsupported");
  assert.match((solveSmartMath("sin(0)") as { message: string }).message, /Obsługuję/);
});

test("invalid input and resource limits fail safely", () => {
  for (const input of ["", "1/0", "1/(2-2)", "x/0=1", "1+", "(1+2", "x==2", "1000000001", "9".repeat(301), "(".repeat(25) + "1" + ")".repeat(25), Array(70).fill("1").join("+"), Array(10).fill("1000000000").join("*")]) {
    assert.equal(solveSmartMath(input).kind, "invalid", input);
  }
});

test("practice parser accepts only the serializable spec contract", () => {
  const specs: SmartPracticeSpec[] = [{ kind: "linear-equation" }, { kind: "determinant2x2" }, ...(["+", "-", "*", "/"] as const).map((operation) => ({ kind: "rational" as const, operation }))];
  for (const spec of specs) {
    assert.deepEqual(parseSmartPractice(JSON.parse(JSON.stringify(spec))), spec);
    assert.ok((GENERATOR_IDS as readonly string[]).includes(smartPracticeTopicId(spec)));
  }
  for (const value of [null, undefined, [], "linear-equation", {}, { kind: "rational", operation: "^" }, { kind: "linear-equation", code: "evil" }, { kind: "rational", operation: "+", extra: 1 }]) assert.equal(parseSmartPractice(value), null);
});

test("same-family practice is deterministic, varied, correct at five levels with valid numeric checkpoints", () => {
  const specs: SmartPracticeSpec[] = [{ kind: "linear-equation" }, { kind: "determinant2x2" }, ...(["+", "-", "*", "/"] as const).map((operation) => ({ kind: "rational" as const, operation }))];
  const ids = new Set<string>();
  for (const spec of specs) {
    const prompts = new Set<string>();
    for (let difficulty = 1; difficulty <= 5; difficulty++) {
      for (const seed of [0, 1, 2, 42, -100, 987654]) {
        const p = generateSmartPractice(spec, seed, difficulty);
        assert.deepEqual(p, generateSmartPractice(spec, seed, difficulty));
        assert.equal(p.generatorId, smartPracticeTopicId(spec));
        assert.equal(p.difficulty, difficulty);
        assert.ok(!ids.has(p.id), p.id);
        ids.add(p.id);
        prompts.add(p.prompt);
        assert.ok(p.latex && p.hints.length === 3);
        assert.ok(p.hints.every((hint) => hint.length > 10));
        assert.ok(checkProblemAnswer(p, p.answer).correct);
        for (const step of p.steps) assert.ok(checkAnswer(step.expression, p.answer).correct, `${p.id}: ${step.expression} != ${p.answer}`);
        const actual = Number(numericValue(p.answer));
        if (spec.kind === "linear-equation") {
          const match = /równanie (-?\d+)\*x\+\((-?\d+)\)=(-?\d+)\*x\+\((-?\d+)\)/.exec(p.prompt);
          assert.ok(match);
          const [a, b, c, d] = match.slice(1).map(Number);
          assert.equal(a * actual + b, c * actual + d);
          assert.notEqual(a, c);
          assert.match(p.latex, /x/);
          assert.ok(p.latex.includes("="));
        } else if (spec.kind === "determinant2x2") {
          const match = /det\(\[(-?\d+),(-?\d+);(-?\d+),(-?\d+)\]\)/.exec(p.prompt);
          assert.ok(match);
          const [a, b, c, d] = match.slice(1).map(Number);
          assert.equal(actual, a * d - b * c);
          assert.match(p.latex, /vmatrix/);
        } else {
          const match = /\((-?\d+)\/(\d+)\)([+*/-])\((-?\d+)\/(\d+)\)/.exec(p.prompt);
          assert.ok(match);
          const a = Number(match[1]) / Number(match[2]), b = Number(match[4]) / Number(match[5]);
          assert.equal(match[3], spec.operation);
          const expected = spec.operation === "+" ? a + b : spec.operation === "-" ? a - b : spec.operation === "*" ? a * b : a / b;
          assert.ok(Math.abs(actual - expected) < 1e-10);
        }
      }
    }
    assert.ok(prompts.size >= 20, `${spec.kind}: seeds should vary`);
  }
});

test("generator rejects invalid spec, seed and difficulty", () => {
  assert.throws(() => generateSmartPractice({ kind: "linear-equation" }, NaN, 1));
  assert.throws(() => generateSmartPractice({ kind: "linear-equation" }, 1, 0));
  assert.throws(() => generateSmartPractice({ kind: "linear-equation" }, 1, 6));
  assert.throws(() => generateSmartPractice({ kind: "bad" } as unknown as SmartPracticeSpec, 1, 1));
});
