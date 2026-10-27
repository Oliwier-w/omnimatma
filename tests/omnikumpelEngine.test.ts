import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { solveOmniProblem, checkOmniSteps, solutionFromProblem, parseOmniPractice, omniPracticeTopicId, generateOmniPractice } from "../src/lib/omnikumpelEngine";
import type { OmniPracticeSpec, OmniSolution } from "../src/lib/omnikumpelTypes";
import { checkAnswer, numericValue } from "../src/lib/math";
import { GENERATOR_IDS } from "../src/generators/index";

function solved(input: string): OmniSolution & { answer: string } {
  const s = solveOmniProblem(input);
  assert.equal(s.status, "solved", `${input}: ${s.summary}`);
  assert.equal(s.exact, true);
  assert.ok(s.answer);
  assert.ok(s.steps.length >= 2);
  assert.ok(s.steps.every(step => step.title.trim() && step.why && !step.why.includes("\\")));
  for (const latex of [s.answerLatex!, ...s.steps.map(step => step.latex)]) katex.renderToString(latex, { throwOnError: true, trust: false });
  return s as OmniSolution & { answer: string };
}
function answer(input: string, expected: string) { assert.equal(solved(input).answer, expected); }

test("rational and linear retain existing exact families", () => {
  answer("1/3+1/3+1/3", "1");
  answer("2x+5=13", "x = 4");
  answer("3*x=1", "x = 1/3");
  answer("x+1=x+2", "Brak rozwiązań");
  answer("det([1,2;3,4])", "-2");
  answer("2^8", "256");
  assert.deepEqual(solved("3/4+1/2").practice, { kind: "smart", spec: { kind: "rational", operation: "+" } });
});

test("quadratics are expanded exactly on either side and have real rational/surd roots", () => {
  answer("x²-5x+6=0", "[2,3]");
  answer("x²-2=0", "[-sqrt(2),sqrt(2)]");
  answer("x^2=5*x-6", "[2,3]");
  answer("(x-2)*(x-3)=0", "[2,3]");
  answer("x^2/2-(5/2)*x+3=0", "[2,3]");
  answer("-x^2+5*x-6=0", "[2,3]");
  answer("4*x^2-4*x+1=0", "[1/2]");
  answer("x^2+1=0", "Brak rozwiązań rzeczywistych");
  const roots = numericValue(solved("x^2-2=0").answer) as number[];
  for (const x of roots) assert.ok(Math.abs(x * x - 2) < 1e-12);
});

test("2x2 matrix inverse, transpose, addition, multiplication use rational entries", () => {
  answer("inv([[1,2],[3,4]])", "[[-2,1],[3/2,-1/2]]");
  answer("inv([1,2;3,4])", "[[-2,1],[3/2,-1/2]]");
  answer("transpose([1,2;3,4])", "[[1,3],[2,4]]");
  answer("[1,2;3,4]+[5,6;7,8]", "[[6,8],[10,12]]");
  answer("[1,2;3,4]*[5,6;7,8]", "[[19,22],[43,50]]");
  answer("inv([1/2,0;0,2])", "[[2,0],[0,1/2]]");
  assert.equal(solveOmniProblem("inv([1,2;2,4])").status, "invalid");
});

test("complex operations are exact, including rational division, conjugate and modulus", () => {
  answer("(3+4i)*(2-i)", "10+5*i");
  answer("(3+4i)+(2-i)", "5+3*i");
  answer("(3+4i)/(2-i)", "2/5+(11/5)*i");
  answer("conj(3+4i)", "3-4*i");
  answer("abs(3+4i)", "5");
  answer("abs(1+i)", "sqrt(2)");
  answer("(1/2+i/3)*(2-3*i)", "2-(5/6)*i");
  assert.equal(solveOmniProblem("i/(1-1)").status, "invalid");
});

test("bounded formal polynomial derivatives", () => {
  answer("derivative(x^3-2*x,x)", "(3)*x^2-2");
  answer("d/dx(x^3-2*x)", "(3)*x^2-2");
  answer("derivative(x^8/2+x/3-7,x)", "(4)*x^7+1/3");
  answer("derivative(17,x)", "0");
  answer("derivative((x+1)^2,x)", "(2)*x+2");
  assert.equal(solveOmniProblem("derivative(x^9,x)").status, "unsupported");
});

test("population statistics use exact fractions and radicals", () => {
  answer("mean([1,2,3,4])", "5/2");
  answer("median([4,1,3,2])", "5/2");
  answer("variance([1,2,3,4])", "5/4");
  answer("std([1,2,3,4])", "(1/2)*sqrt(5)");
  answer("stats([1,2,3,4])", "[5/2,5/2,5/4,(1/2)*sqrt(5)]");
  answer("variance([1/3,2/3])", "1/36");
  answer("stats([2])", "[2,2,0,0]");
  const s = solved("variance([1,2,3,4])");
  assert.ok(s.steps.some(step => step.why.includes("populacyjn")));
});

test("untrusted expressions and resource exhaustion are rejected without evaluation", () => {
  for (const input of [
    'import("fs")', 'evaluate("2+2")', "a=2", "x.constructor", "x[1]", "2!", "5 cm", "Infinity", "NaN", "sin(0)", "2^999999999", "2^(2^8)", "1e99999", "1.5+2", "1000000001", "x^8*x^8=0", "x/x=1", "1/(x-1)=0", "derivative(sin(x),x)", "stats([])", "mean([1,i])", "inv([1,2,3;4,5,6])", "[1,2]+[3,4]", "9".repeat(601), "(".repeat(25) + "1" + ")".repeat(25), Array(110).fill("1").join("+"), `stats([${Array(51).fill("1").join(",")}])`, "((1000000000^8)^8)",
  ]) {
    const s = solveOmniProblem(input);
    assert.notEqual(s.status, "solved", input);
    assert.equal(s.exact, false);
  }
});

test("tutor starts with an action question, never the answer or final solution step", () => {
  for (const input of ["2*x+5=13", "x^2-5*x+6=0", "inv([1,2;3,4])", "(3+4i)*(2-i)", "derivative(x^3-2*x,x)", "stats([1,2,3,4])"]) {
    const s = solved(input);
    assert.ok(s.tutorHint);
    assert.ok(s.tutorHint.endsWith("?"));
    assert.ok(!s.tutorHint.includes(s.answer));
    assert.notEqual(s.tutorHint, s.steps.at(-1)?.why);
  }
});

test("line checks preserve original line numbers, stop at first wrong and never expose target", () => {
  const checks = checkOmniSteps("2x+5=13", "\n2x=8\n\nx=5\nx=4");
  assert.deepEqual(checks.map(c => [c.line, c.status]), [[2, "correct"], [4, "incorrect"], [5, "skipped"]]);
  assert.ok(!checks[1].message.includes("4"));
  assert.deepEqual(checkOmniSteps("2x+5=13", "odejmuję pięć\n2x=8").map(c => c.status), ["unsupported", "correct"]);
  assert.equal(checkOmniSteps("x^2-5*x+6=0", "2*(x-2)*(x-3)=0")[0].status, "correct");
  assert.equal(checkOmniSteps("x^2-2*x+1=0", "x=1")[0].status, "correct");
  assert.equal(checkOmniSteps("1+2", "1+2=3\n4\n3")[1].status, "incorrect");
  assert.equal(checkOmniSteps("1+2=3", "2=2")[0].status, "incorrect");
  assert.equal(checkOmniSteps("1+2", "x=3")[0].status, "unsupported");
  assert.equal(checkOmniSteps("abs(3+4i)", "5")[0].status, "correct");
  assert.equal(checkOmniSteps("inv([1,2;3,4])", "[[-2,1],[3/2,-1/2]]")[0].status, "correct");
  assert.equal(checkOmniSteps("mean([1,2,3,4])", "5/2")[0].status, "correct");
  assert.equal(checkOmniSteps("", "sqrt(5/4)", { answer: "(1/2)*sqrt(5)" })[0].status, "correct");
  assert.equal(checkOmniSteps("", "2x=8", { answer: "4" })[0].status, "unsupported");
  assert.match(checkOmniSteps("", "2+2", { answer: "4" })[0].message, /nie jest to weryfikacja/);
  assert.equal(checkOmniSteps("1", Array(51).fill("1").join("\n"))[0].status, "unsupported");
  assert.equal(checkOmniSteps("1", "1".repeat(601))[0].status, "unsupported");
});

const specs: OmniPracticeSpec[] = [
  { kind: "smart", spec: { kind: "rational", operation: "+" } }, { kind: "quadratic" }, { kind: "derivative" },
  ...(["inverse", "add", "multiply", "transpose"] as const).map(operation => ({ kind: "matrix" as const, operation })),
  ...(["add", "multiply", "divide", "conjugate", "modulus"] as const).map(operation => ({ kind: "complex" as const, operation })),
  ...(["mean", "median", "variance", "std", "all"] as const).map(statistic => ({ kind: "statistics" as const, statistic })),
];
test("strict persisted practice specs and existing XP metadata", () => {
  for (const spec of specs) {
    assert.deepEqual(parseOmniPractice(JSON.parse(JSON.stringify(spec))), spec);
    assert.ok((GENERATOR_IDS as readonly string[]).includes(omniPracticeTopicId(spec)));
  }
  for (const value of [null, [], {}, { kind: "matrix", operation: "power" }, { kind: "quadratic", extra: true }, { kind: "smart", spec: { kind: "rational", operation: "^" } }, Object.assign(Object.create({ kind: "quadratic" }), {})]) assert.equal(parseOmniPractice(value), null);
  assert.throws(() => generateOmniPractice({ kind: "quadratic" }, NaN, 1));
  assert.throws(() => generateOmniPractice({ kind: "quadratic" }, 1, 6));
});

test("seeded practice: correct family, stable IDs, safe KaTeX and honest numeric checkpoints at all levels", () => {
  const ids = new Set<string>();
  for (const spec of specs) for (let difficulty = 1; difficulty <= 5; difficulty++) for (const seed of [0, 1, 42, -100]) {
    const p = generateOmniPractice(spec, seed, difficulty);
    assert.deepEqual(p, generateOmniPractice(spec, seed, difficulty));
    assert.ok(!ids.has(p.id)); ids.add(p.id);
    assert.equal(p.generatorId, omniPracticeTopicId(spec));
    if (spec.kind !== "smart") assert.ok(p.id.startsWith(`omni-${spec.kind}`));
    if (spec.kind === "matrix" || spec.kind === "complex") assert.ok(p.id.includes(spec.operation));
    katex.renderToString(p.latex, { throwOnError: true, trust: false });
    assert.equal(p.hints.length, 3);
    for (const step of p.steps) assert.ok(checkAnswer(step.expression, p.answer).correct, `${p.id}: ${step.expression} != ${p.answer}`);
    if (spec.kind === "quadratic") {
      const match = /Rozwiąż (\d+)\*x\^2\+\((-?\d+)\)\*x\+\((-?\d+)\)=0/.exec(p.prompt)!;
      assert.ok(match);
      const [a, b, c] = match.slice(1).map(Number), roots = numericValue(p.answer) as number[];
      assert.equal(roots.length, 2); assert.ok(roots[0] < roots[1]);
      roots.forEach(x => assert.equal(a * x * x + b * x + c, 0));
    }
    if (spec.kind === "matrix" && spec.operation === "inverse") {
      const source = /inv\((\[\[.*?\]\])\)/.exec(p.prompt)![1];
      assert.ok(checkAnswer(`${source}*(${p.answer})`, "[[1,0],[0,1]]").correct);
    }
    if (spec.kind === "derivative") {
      const polynomial = /derivative\((.*),x\)/.exec(p.prompt)![1];
      const point = Number(/w x=(-?\d+)/.exec(p.prompt)![1]);
      // Independently differentiate the generated canonical monomials, without
      // calling the engine, mathjs derivative, or a numerical difference quotient.
      const terms = polynomial.replaceAll("(", "").replaceAll(")", "").match(/[+-]?[^+-]+/g)!;
      let expected = 0;
      for (const term of terms) {
        const monomial = /^([+-]?)(?:(\d+)\*)?x(?:\^(\d+))?$/.exec(term);
        if (!monomial) continue;
        const coefficient = (monomial[1] === "-" ? -1 : 1) * Number(monomial[2] ?? 1);
        const power = Number(monomial[3] ?? 1);
        expected += coefficient * power * point ** (power - 1);
      }
      assert.equal(Number(numericValue(p.answer)), expected);
    }
    if (spec.kind === "statistics") {
      const xs = /\[([^\]]+)\]/.exec(p.prompt)![1].split(",").map(Number).sort((a, b) => a - b);
      const mean = xs.reduce((a, b) => a + b) / xs.length;
      const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length;
      const middle = Math.floor(xs.length / 2), median = xs.length % 2 ? xs[middle] : (xs[middle - 1] + xs[middle]) / 2;
      const expected = { mean, median, variance, std: Math.sqrt(variance), all: [mean, median, variance, Math.sqrt(variance)] }[spec.statistic];
      assert.ok(checkAnswer(p.answer, JSON.stringify(expected)).correct);
    }
  }
});

test("trusted generator wrapping clearly announces checkpoint-only limitations and escapes fallback text", () => {
  const p = generateOmniPractice({ kind: "quadratic" }, 42, 2);
  const s = solutionFromProblem(p);
  assert.equal(s.answer, p.answer);
  assert.equal(s.family, "context");
  assert.match(s.summary, /wyłącznie wartości/);
  assert.ok(s.tutorHint && !s.tutorHint.includes(p.answer));
  const fallback = solutionFromProblem({ ...p, answer: "\\href{evil}{test}$%" });
  assert.ok(!fallback.answerLatex?.includes("\\href"));
  katex.renderToString(fallback.answerLatex!, { throwOnError: true, trust: false });
});
