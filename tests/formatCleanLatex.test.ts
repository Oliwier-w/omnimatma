import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";
import { formatCleanLatex } from "../src/lib/formatCleanLatex";
import { getLessons } from "../src/lib/vaultParser";

function check(input: string, expected: string) {
  const actual = formatCleanLatex(input);
  assert.equal(actual, expected, input);
  assert.equal(formatCleanLatex(actual), actual, `idempotence: ${input}`);
  katex.renderToString(actual, { throwOnError: true, trust: false });
}

test("cleans signs and unit coefficients without consuming other numbers or symbols", () => {
  for (const [input, expected] of [
    ["1x + -3", "x -3"],
    ["-1x+10x+11x+21x+x_1+1.1x", "-x+10x+11x+21x+x_1+1.1x"],
    ["1e3-1e3+1e-3+1E+3+1x1", "1e3-1e3+1e-3+1E+3+1x1"],
    ["0x + 1x -1x", "0 + x -x"],
    ["0*x+0\\cdot x+0x^2+0x^{2}", "0+0+0+0"],
    ["x+{-3}", "x-3"],
    ["x+ -1x", "x-x"],
    ["1*x+1\\cdot y", "x+y"],
    ["0.30000000000000004+0.7999999999999999", "0.3+0.8"],
    ["0.3000000000000001+0.2999999999999999", "0.3+0.3"],
  ]) check(input, expected);
});

test("preserves grouping, domains, powers, partial tokens and opaque command arguments", () => {
  for (const input of [
    "x^{11}+x^{1}+x^1+\\frac{1}{x}+x_1",
    "x+(-3)^2+(-3)x+x+{-3}^2+x+{-3}x+x+{-3}/x",
    "0x^0+0x^{0}+0x^{-1}+0x^{-2}+0x^a+0x^{a}",
    "1/0x+1/(0x)+0x/x+0x*y+0xy+0x_1+0x2+0x.2",
    "x^1x+x^-1x+x_1x+1xy+1x_1+1x.2",
    "\\frac{0x}{0x}+\\frac{1x}{1}+\\sqrt{0x^{-1}}",
    "\\frac 1x+\\frac -1x+\\sqrt 1x",
    "\\sqrt + -3",
    "\\text{1x + -3 {nested \\text{0x}}}+\\mathrm{1x}+\\operatorname{0x}",
    "\\textbf{0x}+\\mathit{1x}+\\mathbb{1x}+\\color{red}{1x}",
    "\\log_{11}x+\\sqrt{21x},\\quad x\\in(-1,11]",
    "3.141592653589793+0.1234567890123456+0.00000000000000004",
    "0.30000000000000104+1234567890123.0000000000000001",
    "0.3000000000000002+0.2999999999999998+0.3000000000000000000001",
  ]) check(input, input);
});

test("composition stays idempotent across polynomial signs, powers and divisions", () => {
  const atoms = ["0x", "0*x", "0x^2", "0x^0", "0x^{-1}", "1x", "-1x", "10x", "1e3", "x_1", "\\frac{1}{x}", "{-3}", "0.30000000000000004"];
  for (const left of atoms) for (const right of atoms) for (const separator of ["+", " + -", "/", "*"]) {
    const source = left + separator + right;
    const formatted = formatCleanLatex(source);
    assert.equal(formatCleanLatex(formatted), formatted, source);
    katex.renderToString(formatted, { throwOnError: true, trust: false });
  }
});

// KaTeX's AST includes source locations; compare structure, not source offsets.
function structure(latex: string): unknown {
  const parser = katex as typeof katex & { __parse(input: string): unknown };
  return JSON.parse(JSON.stringify(parser.__parse(latex), (key, value) => key === "loc" ? undefined : value));
}

test("safe formulas across all 60 vault lessons retain their KaTeX structure", () => {
  const lessons = getLessons();
  assert.equal(lessons.length, 60);
  let formulas = 0;
  for (const lesson of lessons) {
    const sources = [lesson.formula, ...Array.from(lesson.content.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$([^$\n]+)\$(?!\$)/g), (match) => match[1] ?? match[2])];
    for (const source of sources) {
      const formatted = formatCleanLatex(source);
      assert.equal(formatCleanLatex(formatted), formatted, lesson.id);
      katex.renderToString(formatted, { throwOnError: true, trust: false });
      // The authored complex zero is the one coefficient-cleaning exception.
      // For everything else compare the complete mathematical parse structure.
      if (source === "0+0i") assert.deepEqual(structure(formatted), structure("0+0"));
      else assert.deepEqual(structure(formatted), structure(source), `${lesson.id}: ${source}`);
      formulas++;
    }
  }
  assert.ok(formulas >= 60);
});

test("opaque labels retain exact KaTeX structure even when they resemble coefficients", () => {
  for (const source of ["\\text{1x + -3 {nested}}", "\\mathrm{0x}", "\\operatorname{1x}", "\\frac{1}{x}", "x^{1}", "x_1"]) {
    assert.deepEqual(structure(formatCleanLatex(source)), structure(source));
  }
});
