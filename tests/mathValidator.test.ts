import test from "node:test";
import assert from "node:assert/strict";
import { validateMathAnswer as validate } from "../src/lib/mathValidator";

test("numeric, complex and matrix regression coverage", () => {
  for (const [input, expected] of [
    ["0,5", "1/2"], ["sqrt(9)", "3"], ["2*pi", "pi+pi"],
    ["(1+i)*(1-i)", "2"], ["conj(2+3i)", "2-3i"],
    ["re(3+2i)+im(2+4i)", "7"], ["abs(3+4i)", "5"],
    ["[1,2;3,4]", "[[1,2],[3,4]]"], ["det([1,2;3,4])", "-2"],
    ["transpose([1,2;3,4])", "[1,3;2,4]"],
    ["inv([1,0;0,2])", "[1,0;0,0.5]"], ["trace([1,2;3,4])", "5"],
    ["[1,2]+[3,4]", "[4,6]"], ["i^2", "-1"],
  ]) assert.equal(validate(input, expected).correct, true, `${input} = ${expected}`);
  assert.equal(validate("1000000000000", "1000001000000").correct, false);
  assert.equal(validate("1000000000001", "1000000000000").correct, false);
  assert.equal(validate("1+i", "1-i").correct, false);
});

test("solution syntax is unordered, coordinates and matrices are ordered", () => {
  for (const input of ["x=2 lub x=3", "2; 3", "3, 2", "{3,2}"])
    for (const expected of ["[2,3]", "{2,3}", "x=3 lub x=2"])
      assert.equal(validate(input, expected).correct, true, `${input} versus ${expected}`);
  assert.equal(validate("[3,2]", "[2,3]").correct, false);
  assert.equal(validate("[3,2]", "{2,3}").correct, true);
  assert.equal(validate("[[3,2]]", "{2,3}").correct, false);
  assert.equal(validate("[1,2;3,4]", "[3,4;1,2]").correct, false);
  assert.equal(validate("[0,5]", "0.5").correct, false);
  assert.equal(validate("x=2", "2").correct, true);
  assert.equal(validate("{2,2,3}", "{3,2}").correct, true);
  assert.equal(validate("{2,3}", "[1,2;3,4]").correct, false);
});

test("polynomials use exact certificates including implicit products and tiny coefficients", () => {
  for (const [input, expected] of [
    ["(x+1)^2", "x^2+2*x+1"], ["2x+3x", "5*x"],
    ["(x+y)^2", "x^2+2*x*y+y^2"], ["(a+b)*c", "a*c+b*c"],
    ["x/2+x/2", "x"], ["0.1*x+0.2*x", "0.3*x"],
  ]) {
    const result = validate(input, expected);
    assert.equal(result.correct, true, input);
    assert.equal(result.method, "symbolic", input);
  }
  assert.equal(validate("x+0.000000000001", "x").correct, false);
  assert.equal(validate("x+1e-300", "x").correct, false);
  assert.equal(validate("x^2", "x").correct, false);
});

test("nonpolynomial sampling supports multiple variables and never certifies domain cancellation", () => {
  for (const [input, expected] of [["abs(x*y)", "abs(x)*abs(y)"], ["x/x", "1"], ["sqrt(x)^2", "x"], ["re(x)+im(y*i)+abs(z)^2", "x+y+z^2"]]) {
    const result = validate(input, expected);
    assert.equal(result.correct, true, input);
    assert.equal(result.method, "sampling");
  }
  assert.equal(validate("abs(x)", "x").correct, false);
  assert.equal(validate("x/(x-x)", "1").correct, false);
  assert.equal(validate("x/(x-x)", "y/(y-y)").correct, false);
  assert.equal(validate("x+y+z+a", "0").status, "unsupported");
});

test("rational simplification is canonical, including signs and unreduced expected answers", () => {
  for (const [input, expected, canonical] of [
    ["2/4", "4/8", "1/2"], ["-2/4", "-0.5", "-1/2"],
    ["2/-4", "-1/2", "-1/2"], ["-2/-4", "0.5", "1/2"],
    ["0/4", "0", "0"], ["6/3", "2", "2"],
  ]) {
    const result = validate(input, expected);
    assert.equal(result.status, "correct_unsimplified");
    assert.equal(result.correct, true);
    assert.equal(result.message, `Dobrze! W najprostszej postaci to ${canonical}`);
  }
  assert.equal(validate("1/2", "2/4").status, "correct");
});

test("traps follow mathematical correctness and ignore invalid author payloads", () => {
  const traps = [{ wrongAnswer: "2/4", explanation: "Nie skrócono" }, { wrongAnswer: "-0.5", explanation: "Sprawdź znak" }];
  assert.equal(validate("0.5", "1/2", traps).status, "correct");
  const result = validate("-1/2", "0.5", traps);
  assert.equal(result.status, "trap");
  assert.equal(result.explanation, "Sprawdź znak");
  assert.equal(validate("sin(1)", "0", [{ wrongAnswer: "sin(1)", explanation: "trap" }]).status, "unsupported");
  assert.equal(validate("1", "2", [{ wrongAnswer: "import('fs')", explanation: "bad" }]).status, "incorrect");
  assert.equal(validate("1", "2", Array.from({ length: 17 }, (_, i) => ({ wrongAnswer: i === 16 ? "1" : "3", explanation: "trap" }))).status, "incorrect");
});

test("unsafe AST types and unsupported functions fail closed", () => {
  for (const input of [
    "a=2", "x=x+1", "f(x)=x", "[1,2][1]", "2 cm", "5!", "sin(x)",
    "import('fs')", "evaluate('2+2')", "simplify('x')", "constructor(1)",
    "__proto__", "x.constructor", "random()", "true", "Infinity", "NaN",
    "x^x", "x^13", "2^0.5", "x>2", "x ? 1 : 2", "1:10", "{a: 1}",
  ]) assert.equal(validate(input, "1").correct, false, input);
});

test("input, AST, array, numeric and intermediate budgets", () => {
  for (const input of [
    "", " ", "1+", "1/0", "1e16", "1e16-1e16", "0*(1/0)",
    "(".repeat(25) + "1" + ")".repeat(25), "1+".repeat(600) + "1",
    "1".repeat(2049), "[" + Array(17).fill("1").join(",") + "]",
    "[[[1]]]", "[[1,2],[3]]", "x*1e15*1e15-x*1e15*1e15",
  ]) assert.equal(validate(input, "0").correct, false, input.slice(0, 50));
});
