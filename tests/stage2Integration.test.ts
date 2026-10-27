import test from "node:test";
import assert from "node:assert/strict";
import { checkProblemAnswer, generateProblem } from "../src/generators";
import { generateOmniPractice } from "../src/lib/omnikumpelEngine";

test("final answers share one validator, while solution sets cannot reorder coordinates", () => {
  const coordinate = { ...generateProblem("complex-gauss", 1, 42), answer: "[1,2]" };
  assert.equal(checkProblemAnswer(coordinate, "[2,1]").correct, false);
  assert.equal(checkProblemAnswer(coordinate, "2; 1").correct, false);
  assert.equal(checkProblemAnswer(coordinate, "[1,2]").correct, true);
  const roots = generateOmniPractice({ kind: "quadratic" }, 42, 2);
  const [a, b] = JSON.parse(roots.answer) as number[];
  for (const input of [`x=${b} lub x=${a}`, `${b}; ${a}`, `[${b},${a}]`]) assert.equal(checkProblemAnswer(roots, input).correct, true, input);
});

test("every public generator provides operand-based trap metadata and correct answers take priority", () => {
  const problem = generateProblem("fractions-add", 1, 42);
  assert.ok(Array.isArray(problem.commonTraps));
  assert.ok(problem.commonTraps.length);
  const result = checkProblemAnswer(problem, problem.commonTraps[0].wrongAnswer);
  assert.equal(result.status, "trap");
  assert.match(result.message, /^Uwaga, klasyczna pułapka!/);
  assert.equal(checkProblemAnswer({ ...problem, commonTraps: [{ wrongAnswer: problem.answer, explanation: "Nieprawidłowa pułapka" }] }, problem.answer).correct, true);
});
