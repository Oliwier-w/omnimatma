import test from "node:test";
import assert from "node:assert/strict";
import { validateMathAnswer as validate } from "../src/lib/mathValidator";
import { generateProblem, checkProblemAnswer } from "../src/generators";

test("exact polynomial certificates override finite floating-point cancellation", () => {
  for (let i = 0; i < 12; i++) {
    assert.equal(validate("(x+1e14)-1e14", "x").correct, true);
    assert.equal(validate("x+0.10000000000000001", "x+0.1").correct, false);
    assert.equal(validate("x+1e-324", "x").correct, false);
  }
});

test("absolute numeric tolerance cannot forgive a large fractional error", () => {
  assert.equal(validate("1000000000100.5", "1000000000000").correct, false);
  assert.equal(validate("1,5e2", "150").correct, true);
  assert.equal(validate("2,5e-1", "1/4").correct, true);
});

test("lexical exponents cannot underflow into integer powers or exhaust exact arithmetic", () => {
  for (const input of ["x^(1e-324)", "x+1e-1000000000", "x+0xFF"]) assert.equal(validate(input, "x").correct, false);
  assert.equal(validate("x^(1/2+1/2)", "x").correct, true);
});

test("computed and parenthesized coordinate answers cannot be reordered as solution sets", () => {
  for (const answer of ["([1,2])", "[1,2]+[0,0]"]) {
    const problem = { ...generateProblem("complex-gauss", 1, 42), answer };
    assert.equal(checkProblemAnswer(problem, "{2,1}").correct, false);
  }
});
