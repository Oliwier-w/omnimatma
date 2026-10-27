import test from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "mathjs";
import { GENERATOR_IDS } from "../src/generators/index";
import { fractionProblem } from "../src/generators/fractions";
import { matrixProblem } from "../src/generators/matrices";
import { complexProblem } from "../src/generators/complex";
import { maturaLiczbyProblem } from "../src/generators/maturaLiczby";
import { maturaFunkcjeProblem } from "../src/generators/maturaFunkcje";
import { maturaGeometriaProblem } from "../src/generators/maturaGeometria";
import { random, type Problem } from "../src/generators/shared";

// Call current factories directly: archived URL versions must not mask regressions.
const make = (id: string, level: number, seed: number): Problem => {
  const factory = id.startsWith("fractions-") ? fractionProblem
    : id.startsWith("matrix-") ? matrixProblem
    : id.startsWith("complex-") ? complexProblem
    : id.startsWith("matura-liczby-") ? maturaLiczbyProblem
    : id.startsWith("matura-funkcje-") ? maturaFunkcjeProblem : maturaGeometriaProblem;
  return factory(id, level, seed, random(seed));
};
const nums = (text: string) => [...text.matchAll(/-?\d+/g)].map(m => Number(m[0]));
const capture = (text: string, pattern: RegExp) => {
  const match = text.match(pattern);
  assert.ok(match, text);
  return match.slice(1).map(Number);
};
const ratio = (s: string) => { const [a, b = 1] = s.split("/").map(Number); return a / b; };
const value = (s: string): any => {
  const v = evaluate(s);
  return v && typeof v.toArray === "function" ? v.toArray() : v;
};
const near = (a: number, b: number) => {
  assert.ok(Number.isFinite(a) && Number.isFinite(b));
  assert.ok(Math.abs(a - b) < 1e-8 * Math.max(1, Math.abs(b)), `${a} != ${b}`);
};
const equal = (actual: any, expected: any): void => {
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual));
    assert.equal(actual.length, expected.length);
    expected.forEach((v, i) => equal(actual[i], v));
  } else if (typeof expected === "object") {
    near(typeof actual === "number" ? actual : actual.re, expected.re);
    near(typeof actual === "number" ? 0 : actual.im, expected.im);
  } else near(actual, expected);
};
const product = (a: number[][], b: number[][]) => a.map(row =>
  b[0].map((_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)));
// Independent elimination oracle (the generator uses recursive cofactors).
function eliminate(input: number[][]) {
  const n = input.length;
  const a = input.map((row, i) => [...row, ...row.map((_, j) => Number(i === j))]);
  let determinant = 1;
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[pivot][k])) pivot = i;
    if (Math.abs(a[pivot][k]) < 1e-12) return { determinant: 0, inverse: [] };
    if (pivot !== k) { [a[k], a[pivot]] = [a[pivot], a[k]]; determinant *= -1; }
    const divisor = a[k][k];
    determinant *= divisor;
    a[k] = a[k].map(x => x / divisor);
    for (let i = 0; i < n; i++) if (i !== k) {
      const factor = a[i][k];
      a[i] = a[i].map((x, j) => x - factor * a[k][j]);
    }
  }
  return { determinant, inverse: a.map(row => row.slice(n)) };
}
const matrices = (p: Problem): number[][][] => [...p.prompt.matchAll(/\[\[.*?\]\]/g)].map(m => JSON.parse(m[0]));
const literals = (p: Problem) => [...p.prompt.matchAll(/\(\(([-\d/]+)\)\+\(([-\d/]+)\)\*i\)/g)]
  .map(m => [ratio(m[1]), ratio(m[2])]);
const multiply = ([a, b]: number[], [c, d]: number[]) => [a * c - b * d, a * d + b * c];
const divide = ([a, b]: number[], [c, d]: number[]) => [(a * c + b * d) / (c * c + d * d), (b * c - a * d) / (c * c + d * d)];
const factors = (prompt: string) => [...prompt.matchAll(/\((\d*)x ([+−]) (\d+)\)/g)]
  .map(m => (m[2] === "+" ? -1 : 1) * Number(m[3]) / Number(m[1] || 1));

/** Only question operands enter these oracles, never answer or generated steps. */
function oracle(p: Problem): any {
  const id = p.generatorId, t = p.prompt, level = p.difficulty;
  const [a, b, c, d, e, f] = nums(t);
  if (id.startsWith("fractions-")) {
    switch (id) {
      case "fractions-meaning": return a / b * (t.includes("przeciwną") ? -1 : 1);
      case "fractions-simplify": return a / b;
      case "fractions-common": {
        let lcm = Math.max(b, d); while (lcm % b || lcm % d) lcm++;
        return [a * lcm / b, c * lcm / d, lcm];
      }
      case "fractions-add": return a / b + c / d;
      case "fractions-subtract": return a / b - c / d;
      case "fractions-multiply": return a * c / (b * d);
      case "fractions-divide": return a * d / (b * c);
      case "fractions-mixed": return (a + b / c) * (t.includes("ujemną") ? -1 : 1);
      case "fractions-compare": return Math.sign(a * d - c * b);
      case "fractions-compound": return (a / b + c / d) / (c / b);
    }
  }
  if (id.startsWith("matrix-")) {
    const [A, B] = matrices(p);
    switch (id) {
      case "matrix-entry": {
        const [i, j] = capture(t, /wierszu (\d+), kolumnie (\d+)/);
        return A[i - 1][j - 1];
      }
      case "matrix-add": return A.map((row, i) => row.map((v, j) => v + B[i][j]));
      case "matrix-subtract": return A.map((row, i) => row.map((v, j) => v - B[i][j]));
      case "matrix-scale": {
        const k = ratio(t.match(/skalar ([-\d/]+)/)![1]); return A.map(row => row.map(v => v * k));
      }
      case "matrix-transpose": return A[0].map((_, j) => A.map(row => row[j]));
      case "matrix-multiply": return product(A, B);
      case "matrix-det": return eliminate(A).determinant;
      case "matrix-inverse": return eliminate(A).inverse;
      case "matrix-trace": return A.reduce((s, row, i) => s + row[i], 0);
      case "matrix-equation": return product(eliminate(A).inverse, B);
    }
  }
  if (id.startsWith("complex-")) {
    if (id === "complex-gauss") {
      const pair = t.match(/P=\(([-\d/]+), ([-\d/]+)\)/)!;
      return { re: ratio(pair[1]), im: ratio(pair[2]) };
    }
    const [[x, y], w] = literals(p);
    if (id === "complex-parts") return [x, y];
    if (id === "complex-modulus") return Math.hypot(x, y);
    let pair: number[];
    switch (id) {
      case "complex-add": pair = [x + w[0], y + w[1]]; break;
      case "complex-subtract": pair = [x - w[0], y - w[1]]; break;
      case "complex-multiply": pair = multiply([x, y], w); break;
      case "complex-divide": pair = divide([x, y], w); break;
      case "complex-conjugate": pair = [x, -y]; break;
      case "complex-equation": pair = divide(w, [x, y]); break;
      case "complex-power": {
        const [n] = capture(t, /potęgi (\d+)/); pair = [1, 0];
        for (let k = 0; k < n; k++) pair = multiply(pair, [x, y]);
        break;
      }
      default: throw new Error(id);
    }
    return { re: pair[0], im: pair[1] };
  }
  if (id.startsWith("matura-liczby-")) {
    switch (id) {
      case "matura-liczby-pierwiastki": {
        const expression = t.slice(7).split(".")[0]
          .replace(/∛\((-?\d+)\)/g, (_, n) => String(Math.cbrt(Number(n))))
          .replace(/⁵√\((-?\d+)\)/g, (_, n) => String(Math.sign(Number(n)) * Math.abs(Number(n)) ** .2))
          .replace(/√\((\d+)\)/g, (_, n) => String(Math.sqrt(Number(n))))
          .replaceAll("·", "*").replaceAll("−", "-");
        return evaluate(expression);
      }
      case "matura-liczby-potegi": return evaluate(t.slice(7).split(".")[0].replaceAll("·", "*"));
      case "matura-liczby-logarytmy": {
        const expression = t.slice(7, -1)
          .replace(/log_(\d+) \(1\/(\d+)\)/g, (_, base, n) => String(-Math.log(Number(n)) / Math.log(Number(base))))
          .replace(/log_(\d+) √(\d+)/g, (_, base, n) => String(Math.log(Math.sqrt(Number(n))) / Math.log(Number(base))))
          .replace(/log_(\d+) (\d+)/g, (_, base, n) => String(Math.log(Number(n)) / Math.log(Number(base))))
          .replaceAll("−", "-");
        return evaluate(expression);
      }
      case "matura-liczby-wzory-skrocone": {
        const [n] = capture(t, /dla b = (\d+)/);
        const x = level <= 2 || level === 5 ? Math.PI : Math.SQRT2;
        const y = level === 5 ? Math.sqrt(n) : n;
        return (x + y) ** 2 - (x - y) ** 2;
      }
      case "matura-liczby-podzielnosc": {
        const [n] = capture(t, /dla n = (\d+)/);
        return level === 1 ? (n ** 3 - n) / 24 : level === 2 ? (3 * n * n + 6 * n + 15) / 12
          : level === 3 ? (n ** 5 - n) / 30 : level === 4 ? (n ** 4 - 1) / 16 : (n ** 5 - n) / 240;
      }
      case "matura-liczby-nierownosc-liniowa": {
        const s = t.split("nierówność ")[1].slice(0, -1).replaceAll("−", "-");
        const [left, right] = s.split(/[≥>≤]/);
        const diff = (x: number) => evaluate(left, { x }) - evaluate(right, { x });
        for (let x = -100; x < 100; x++) {
          const n = diff(x); if (s.includes("≥") ? n >= 0 : s.includes("≤") ? n <= 0 : n > 0) return x;
        }
        throw new Error(t);
      }
      case "matura-liczby-rownanie-iloczynowe": return [...new Set(factors(t))].reduce((s, x) => s + x, 0);
      case "matura-liczby-wyrazenia-wymierne": {
        // For polynomial quotients f(0) is the constant; the final rational
        // variant asks for the numerator after cancelling monic factors.
        if (level === 1) return Math.sqrt(capture(t, /x\^2 − (\d+)/)[0]);
        if (level === 2) { const [prod, den] = capture(t, /x \+ (\d+)\)\/\(x \+ (\d+)\)/); return prod / den; }
        if (level === 3) {
          const m = t.match(/x ([+−]) (\d+)\)\/\(x − (\d+)\)/)!;
          return (m[1] === "−" ? 1 : -1) * Number(m[2]) / Number(m[3]);
        }
        if (level === 4) return -Math.cbrt(capture(t, /x\^3 − (\d+)/)[0]);
        return Math.sqrt(capture(t, /x\^2 − (\d+)/)[0]);
      }
      case "matura-liczby-nierownosc-kwadratowa": {
        const roots = factors(t), right = Math.max(...roots);
        return t.includes(" < ") ? Math.ceil(right) - 1 : Math.floor(right);
      }
      case "matura-liczby-uklad-rownan": return (c * e - f * b) / (a * e - b * d);
    }
  }
  if (id.startsWith("matura-funkcje-")) {
    switch (id) {
      case "matura-funkcje-przedzialami": {
        const [sl, k, sr, , left, right] = capture(t, /\{ (-?\d+)x \+ (\d+) dla x <= 0; (-?\d+)x \+ (\d+) dla x > 0 \}.*\[(-?\d+), (-?\d+)\]/);
        return Math.max(sl * left + k, k, sr * right + k);
      }
      case "matura-funkcje-liniowa": {
        const [b, y] = capture(t, /m\^2 \+ (\d+)m.*\(0, (-?\d+)\)/);
        return (-b + Math.sqrt(b * b + 4 * y)) / 2;
      }
      case "matura-funkcje-kwadratowa": { const [a, h, k] = capture(t, /a = (-?\d+), h = (-?\d+), k = (-?\d+)/); return a * h * h + k; }
      case "matura-funkcje-ciag-geometryczny": {
        const m = t.match(/równy (-?\d+), a iloraz q = ([-\d/]+).*a_(\d+)/)!;
        return Number(m[1]) * ratio(m[2]) ** (Number(m[3]) - 1);
      }
      case "matura-funkcje-ciag-arytmetyczny": {
        const [sum, mean] = capture(t, /wynosi (-?\d+), a średnia.*wynosi (-?\d+)/);
        const r = (mean - sum / 10) / (13 / 3 - 4.5); return [(sum - 45 * r) / 10, r];
      }
      case "matura-funkcje-ciag-trzywyrazowy": {
        const [a, b, c] = capture(t, /Liczby x, x \+ (\d+), (\d+)x \+ (\d+)/);
        const A = 1 - b, B = 2 * a - c;
        const x = A === 0 ? -a * a / B : (-B - Math.sqrt(B * B - 4 * A * a * a)) / (2 * A);
        return (x + a) / x;
      }
      case "matura-funkcje-trygonometria": { const [a, c] = capture(t, /równanie (\d+) sin α.*= (\d+) cos α/); return c / a; }
      case "matura-funkcje-katy-okregu": return 180 - capture(t, /odpowiednio (\d+)°, (\d+)°, (\d+)°/)[1];
      case "matura-funkcje-trapez": {
        const [diag, n, den, diff] = capture(t, /AC ma długość (\d+).*równy (\d+)\/(\d+).*wynosi (\d+)/);
        return Math.sqrt((diff / 2) ** 2 + diag * diag * (1 - (n / den) ** 2));
      }
      case "matura-funkcje-trojkat-prostokatny": return capture(t, /długości (\d+)/)[0] * (1 + Math.SQRT2);
    }
  }
  switch (id) {
    case "matura-geometria-podobienstwo": return a * d / (a + b + c);
    case "matura-geometria-prosta": return (d - b) / (c - a);
    case "matura-geometria-okrag": return (a - c) ** 2 + (b - d) ** 2;
    case "matura-geometria-proste-rownolegle": {
      const [offset, slope] = capture(t, /y=\(m-(\d+)\).* i y=(\d+)x/); return offset + slope;
    }
    case "matura-geometria-graniastoslup": return 6 * Math.sqrt(3) / 4 * a ** 3;
    case "matura-geometria-ostroslup-kat": return a * Math.sin(b * Math.PI / 180);
    case "matura-geometria-ostroslup-krawedzie": return b + 1;
    case "matura-geometria-prawdopodobienstwo": {
      const [threshold] = capture(t, /(?:równa|większa od) (\d+)/);
      let count = 0;
      for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (t.includes("większa od") ? x + y > threshold : x + y === threshold) count++;
      return count / 36;
    }
    case "matura-geometria-statystyka": {
      const rows = [...t.matchAll(/wartość (\d+) – częstość (\d+)/g)].map(m => [Number(m[1]), Number(m[2])]);
      const data = rows.flatMap(([x, n]) => Array(n).fill(x));
      if (t.includes("medianę")) return data[(data.length - 1) / 2];
      if (t.includes("dominantę")) return rows.reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const [selected] = capture(t, /ma ona wartość (\d+)/); return data.filter(x => x === selected).length / data.length;
    }
    case "matura-geometria-optymalizacja": return capture(t, /d\+h=(\d+)/)[0] / 4;
    default: throw new Error(`Missing independent oracle: ${id}`);
  }
}

for (const id of GENERATOR_IDS) test(`stage 2: ${id}: independent operands, all steps, noncorrect traps`, () => {
  for (let level = 1; level <= 5; level++) for (let seed = 0; seed < 24; seed++) {
    const p = make(id, level, seed);
    const expected = oracle(p);
    try {
      equal(value(p.answer), expected);
      for (const step of p.steps) equal(value(step.expression), expected);
      assert.ok(Array.isArray(p.commonTraps));
      for (const trap of p.commonTraps!) {
        assert.ok(trap.explanation.length > 20);
        const wrong = value(trap.wrongAnswer);
        assert.throws(() => equal(wrong, expected), `${p.id}: mathematically correct trap ${trap.wrongAnswer}`);
      }
    } catch (error) { throw new Error(`${p.id}: ${p.prompt}`, { cause: error }); }
  }
});

test("stage 2: reverse-generation constraints are task-specific, not universal integers", () => {
  for (let level = 1; level <= 3; level++) for (let seed = 0; seed < 160; seed++) {
    const det = make("matrix-det", level, seed);
    const [A] = matrices(det);
    const D = eliminate(A).determinant;
    near(Math.abs(D), Math.round(Math.abs(D)));
    assert.ok(Math.abs(D) >= 1 - 1e-8 && Math.abs(D) <= 2 + 1e-8);
    if (level === 1) assert.ok(D > 0 && A.flat().every(x => x >= 0));
    for (const id of ["matrix-inverse", "matrix-equation"]) {
      const p = make(id, level, seed);
      const expected = oracle(p);
      expected.flat().forEach((x: number) => near(x, Math.round(x)));
    }
    for (const id of ["complex-divide", "complex-equation"]) {
      const z = oracle(make(id, level, seed)); near(z.re, Math.round(z.re)); near(z.im, Math.round(z.im));
    }
    const p = make("matura-liczby-rownanie-iloczynowe", level, seed);
    factors(p.prompt).forEach(x => near(x, Math.round(x)));
    assert.match(p.prompt, /sumę rozwiązań/);
    assert.equal(typeof value(p.answer), "number", "A sum-of-roots checkpoint is not a vector");
    const linear = make("matura-funkcje-liniowa", level, seed);
    const [b, y] = capture(linear.prompt, /m\^2 \+ (\d+)m.*\(0, (-?\d+)\)/);
    const deltaRoot = Math.sqrt(b * b + 4 * y);
    near(deltaRoot, Math.round(deltaRoot));
    near(oracle(linear), Math.round(oracle(linear)));
    near(value(make("complex-modulus", level, seed).answer), Math.round(value(make("complex-modulus", level, seed).answer)));
  }
  assert.ok(Array.from({ length: 24 }, (_, s) => value(make("fractions-divide", 3, s).answer)).some(x => !Number.isInteger(x)));
  assert.ok(Array.from({ length: 24 }, (_, s) => value(make("matura-geometria-prosta", 3, s).answer)).some(x => !Number.isInteger(x)));
});

test("stage 2: concrete bug-family formulas are computed from actual question operands", () => {
  for (let level = 1; level <= 5; level++) for (let seed = 0; seed < 32; seed++) {
    const f = make("fractions-add", level, seed);
    const [a, b, c, d] = nums(f.prompt);
    assert.ok(f.commonTraps!.some(t => Math.abs(value(t.wrongAnswer) - (a + c) / (b + d)) < 1e-10));
    assert.ok(f.mistakes?.length, "Retain legacy fraction feedback");
    const m = make("matrix-det", level, seed), [A] = matrices(m);
    let sum = 0;
    if (A.length === 2) sum = A[0][0] * A[1][1] + A[0][1] * A[1][0];
    else for (let j = 0; j < 3; j++) {
      sum += A[0][j] * A[1][(j + 1) % 3] * A[2][(j + 2) % 3];
      sum += A[0][j] * A[1][(j + 2) % 3] * A[2][(j + 1) % 3];
    }
    if (Math.abs(sum - oracle(m)) > 1e-8) assert.ok(m.commonTraps!.some(t => value(t.wrongAnswer) === sum));
    for (const id of ["complex-multiply", "complex-power"]) {
      const p = make(id, level, seed), [[x, y], w] = literals(p);
      let re: number, im: number;
      if (id.endsWith("multiply")) { re = x * w[0] + y * w[1]; im = x * w[1] + y * w[0]; }
      else {
        // Binomial parity independently models the mistaken rule i²=+1.
        const n = capture(p.prompt, /potęgi (\d+)/)[0]; re = 0; im = 0;
        let choose = 1;
        for (let k = 0; k <= n; k++) {
          const term = choose * x ** (n - k) * y ** k;
          if (k % 2) im += term; else re += term;
          choose = choose * (n - k) / (k + 1);
        }
      }
      const expected = oracle(p);
      if (Math.abs(re - expected.re) + Math.abs(im - expected.im) > 1e-8) {
        assert.ok(p.commonTraps!.length);
        equal(value(p.commonTraps![0].wrongAnswer), { re, im });
      }
    }
    const q = make("matura-funkcje-kwadratowa", level, seed);
    const [qa, h, k] = capture(q.prompt, /a = (-?\d+), h = (-?\d+), k = (-?\d+)/);
    assert.equal(typeof oracle(q), "number");
    for (const trap of q.commonTraps!) assert.equal(typeof value(trap.wrongAnswer), "number");
    if (k !== 0) assert.ok(q.commonTraps!.some(t => value(t.wrongAnswer) === qa * h * h - k));
    if (qa !== 1 && h !== 0) assert.ok(q.commonTraps!.some(t => value(t.wrongAnswer) === h * h + k));
    const w = make("matura-liczby-wzory-skrocone", level, seed);
    assert.ok(w.commonTraps!.some(t => value(t.wrongAnswer) === 0));
  }
});

test("stage 2: singular system construction is repaired in bounded RNG calls", () => {
  for (let level = 1; level <= 5; level++) {
    let calls = 0;
    const p = maturaLiczbyProblem("matura-liczby-uklad-rownan", level, 0, (min) => {
      calls++;
      assert.ok(calls <= 6, "No rejection-sampling loop");
      return min;
    });
    equal(value(p.answer), oracle(p));
    assert.equal(calls, 6);
  }
});
