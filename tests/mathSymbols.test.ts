import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { MATH_SYMBOLS } from "../src/lib/mathSymbols";

test("symbol dictionary contains every required symbol with unique IDs and glyphs", () => {
  const required = ["∑", "∏", "∀", "∃", "∈", "⊂", "⇒", "⇔", "det(A)", "A^T", "i", "z̄", "σ²", "μ", "lim", "∫", "∞", "=", "≠", "<", ">", "≤", "≥", "±", "√", "π", "∅", "∩", "∪"];
  assert.ok(MATH_SYMBOLS.length >= required.length);
  assert.equal(new Set(MATH_SYMBOLS.map((item) => item.id)).size, MATH_SYMBOLS.length);
  assert.equal(new Set(MATH_SYMBOLS.map((item) => item.symbol)).size, MATH_SYMBOLS.length);
  for (const symbol of required) {
    assert.ok(MATH_SYMBOLS.some((item) => item.symbol === symbol), `Missing ${symbol}`);
  }
});

test("each symbol has complete Polish teaching content and a valid KaTeX example", () => {
  for (const item of MATH_SYMBOLS) {
    for (const [field, value] of Object.entries(item)) {
      assert.equal(typeof value, "string");
      assert.ok(value.trim().length > 0, `${item.id}.${field} is empty`);
    }
    assert.doesNotThrow(() => katex.renderToString(item.example, {
      throwOnError: true,
      strict: "error",
      trust: false,
      displayMode: true,
    }), `${item.id} example must render without errors`);
  }
});

test("potentially ambiguous symbols state their conventions and concrete results", () => {
  const get = (id: string) => {
    const entry = MATH_SYMBOLS.find((item) => item.id === id);
    assert.ok(entry, `Missing ${id}`);
    return entry;
  };
  assert.match(get("strict-subset").meaning, /podzbiór właściwy/);
  assert.match(get("strict-subset").meaning, /⊆ dopuszcza równość/);
  assert.match(get("infinity").meaning, /nie jest liczbą rzeczywistą/);
  assert.match(get("variance").meaning, /dzielimy przez N, nie przez N − 1/);
  assert.match(get("variance").example, /\{2\}=1$/);
  assert.equal(get("limit").example, String.raw`\lim_{n\to\infty}\frac{1}{n}=0`);
  assert.equal(get("integral").example, String.raw`\int_0^1 2x\,dx=\left[x^2\right]_0^1=1`);
});
