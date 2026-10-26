import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import { analyzeFormula, XRAY_COLORS } from "../src/lib/formulaXray";
import { getLessons } from "../src/lib/vaultParser";

const render = (formula: string) => katex.renderToString(formula, { throwOnError: true, trust: false, displayMode: true });
const mathml = (value: string) => render(value).match(/<math[\s\S]*?<\/math>/)?.[0]
  .replace(/<annotation[\s\S]*?<\/annotation>/g, "")
  .replace(/<mstyle[^>]*>|<\/mstyle>/g, "")
  .replace(/<mrow>|<\/mrow>/g, "");

test("all 60 vault formulas keep valid KaTeX and source-consistent legends", () => {
  const lessons = getLessons();
  assert.equal(lessons.length, 60);
  for (const lesson of lessons) {
    const analysis = analyzeFormula(lesson.formula, lesson.generatorId);
    assert.doesNotThrow(() => render(analysis.coloredLatex), lesson.id);
    assert.equal(mathml(analysis.coloredLatex), mathml(lesson.formula), `${lesson.id}: mathematical structure`);
    assert.ok(analysis.parts.length, lesson.id);
    assert.equal(new Set(analysis.parts.map((part) => part.key)).size, analysis.parts.length);
    for (const part of analysis.parts) {
      assert.ok(Object.values(XRAY_COLORS).includes(part.color as typeof XRAY_COLORS.indigo));
      assert.ok(analysis.coloredLatex.includes(`\\color{${part.color}}`), `${lesson.id}: ${part.key}`);
      assert.ok(part.description.length > 10, `${lesson.id}: ${part.key}: ${part.description}`);
    }
    assert.deepEqual(analysis, analyzeFormula(lesson.formula, lesson.generatorId));
  }
});

test("commands, opaque text/name arguments and Greek control-word boundaries stay intact", () => {
  const formula = String.raw`\frac ab+\sqrt[3]{x}+\alpha+\lambda+\text{lub abc}+\mathbb R+\operatorname{tr}(A)`;
  const analysis = analyzeFormula(formula);
  assert.ok(analysis.coloredLatex.includes("\\frac "));
  assert.ok(analysis.coloredLatex.includes("\\sqrt["));
  assert.ok(analysis.coloredLatex.includes("\\text{lub abc}"));
  assert.ok(analysis.coloredLatex.includes("\\mathbb R"));
  assert.ok(analysis.coloredLatex.includes("\\operatorname{tr}"));
  assert.deepEqual(analysis.parts.map((p) => p.key), ["a", "b", "x", "alpha", "lambda", "A"]);
  assert.doesNotThrow(() => render(analysis.coloredLatex));
  const textOnly = String.raw`\text{abc 123}\mathbb{R}`;
  assert.deepEqual(analyzeFormula(textOnly), { coloredLatex: textOnly, parts: [] });
});

test("unbraced macro arguments and scripts preserve their original mathematical scope", () => {
  for (const formula of [String.raw`\frac12`, String.raw`\frac1{23}`, String.raw`\sqrt2+x^12+y_23`, String.raw`\frac\alpha\beta`, String.raw`a_{ij}+b^{n+1}`, String.raw`\frac{\frac12}{3}`]) {
    const colored = analyzeFormula(formula).coloredLatex;
    assert.doesNotThrow(() => render(colored), formula);
    // Color annotations change presentation, not the MathML expression tree.
    assert.equal(mathml(colored), mathml(formula), formula);
  }
});

test("fraction, matrix, complex, linear, quadratic and circle contexts explain only present symbols", () => {
  const cases: [string, string, string, RegExp][] = [
    [String.raw`\frac ab`, "fractions-meaning", "b", /Mianownik/],
    [String.raw`A^{-1}B`, "matrix-equation", "A", /odwrotn/],
    [String.raw`A^T`, "matrix-transpose", "T", /Transpozycja/],
    ["z=a+bi", "complex-parts", "i", /Jednostka urojona/],
    [String.raw`\Re z+\operatorname{Im}(z)`, "complex-parts", "Im", /Część urojona/],
    ["y=ax+b", "linear", "a", /kierunkowy/],
    ["ax^2+bx+c", "quadratic", "b", /przy x/],
    ["(x-a)^2+(y-b)^2=r^2", "circle", "r", /Promień/],
    [String.raw`\sum_{k=1}^n k`, "", "n", /granica sumowania/],
  ];
  for (const [formula, context, key, expected] of cases) {
    const analysis = analyzeFormula(formula, context);
    assert.match(analysis.parts.find((p) => p.key === key)!.description, expected);
    assert.doesNotThrow(() => render(analysis.coloredLatex));
  }
  assert.deepEqual(analyzeFormula("x", "quadratic").parts.map((p) => p.key), ["x"]);
  assert.deepEqual(analyzeFormula("A", "matrix-inverse").parts.map((p) => p.key), ["A"]);
});

test("numeric fallback explains structure or constants without invented variables", () => {
  assert.deepEqual(analyzeFormula(String.raw`\frac{12}{35}`).parts.map((p) => p.key), ["numerator", "denominator"]);
  const numbers = analyzeFormula("12+35=47");
  assert.deepEqual(numbers.parts.map((p) => p.key), ["12", "35", "47"]);
  assert.ok(numbers.parts.every((p) => p.description.includes("Stała liczbowa")));
  assert.deepEqual(analyzeFormula(""), { coloredLatex: "", parts: [] });
});

test("source text cannot inject colors or trusted HTML through the analyzer", () => {
  const formula = String.raw`x+\text{<script>alert(1)</script>}+\href{javascript:alert(1)}{x}`;
  const analysis = analyzeFormula(formula);
  const html = katex.renderToString(analysis.coloredLatex, { throwOnError: false, trust: false });
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(analysis.coloredLatex.includes(String.raw`\href{javascript:alert(1)}{x}`));
});

test("component SSR starts off, preserves original MathFormula, and gives instances unique ARIA IDs", () => {
  // CSS is handled by Next in the app; ignore only this module's stylesheet in Node.
  const require = createRequire(import.meta.url);
  const extensions = require.extensions;
  const previous = extensions[".css"];
  extensions[".css"] = () => {};
  try {
    const FormulaXray = require("../src/components/FormulaXray").default;
    const formula = String.raw`\frac ab`;
    const view = () => renderToStaticMarkup(createElement("div", null,
      createElement(FormulaXray, { formula, topicId: "fractions-meaning" }),
      createElement(FormulaXray, { formula, title: "Ułamek" }),
    ));
    const html = view();
    assert.equal(html, view());
    assert.equal((html.match(/aria-checked="false"/g) ?? []).length, 2);
    assert.equal((html.match(/aria-label="Rentgen Wzoru"/g) ?? []).length, 2);
    assert.equal((html.match(/role="switch"/g) ?? []).length, 2);
    assert.ok(html.includes('class="math-block"'));
    assert.ok(!html.includes("\\color"));
    const ids = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, 2);
    for (const id of ids) assert.ok(html.includes(`id="${id}" hidden=""`));
  } finally {
    if (previous) extensions[".css"] = previous;
    else delete extensions[".css"];
  }
});
