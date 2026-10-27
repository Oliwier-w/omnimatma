import test from "node:test";
import assert from "node:assert/strict";
import { solveOmniProblem, checkOmniSteps } from "../src/lib/omnikumpelEngine";

test("audit: quadratic solver should accept computed roots above the input-literal limit", () => {
  const result = solveOmniProblem("x^2=1000000000^4");
  assert.equal(result.status, "solved", result.summary);
  assert.equal(result.answer, "[-1000000000000000000,1000000000000000000]");
});

test("audit: median should not overflow while calculating an unused variance", () => {
  const result = solveOmniProblem("median([1000000000^8,0,1])");
  assert.equal(result.status, "solved", result.summary);
  assert.equal(result.answer, "1");
});

test("audit: exact radical root representations remain equivalent", () => {
  assert.equal(checkOmniSteps("", "2*sqrt(2)", { answer: "sqrt(8)" })[0].status, "correct");
  assert.equal(checkOmniSteps("x^2-2*x+1=0", "x=1")[0].status, "correct");
});

test("audit: equation steps preserve exponents and math layout instead of plain-text fallback", () => {
  const solution = solveOmniProblem("x^2-5*x+6=0");
  assert.ok(solution.steps[0].latex.includes("^{2}"));
  assert.equal(solution.steps[0].latex.includes("\\text{"), false);
  assert.equal(solution.steps[1].latex.includes("\\text{"), false);
});

test("audit: unsupported practice families never silently become unrelated exercises", () => {
  assert.equal(solveOmniProblem("2^8").practice, undefined);
  assert.equal(solveOmniProblem("i^2").practice, undefined);
  assert.equal(solveOmniProblem("(3+4i)-(2-i)").practice, undefined);
});
