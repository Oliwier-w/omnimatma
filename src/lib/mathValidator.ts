import { parse, type MathNode } from "mathjs";
import { numericValue } from "./math";

export interface MathValidationResult {
  status: "correct" | "correct_unsimplified" | "incorrect" | "trap" | "invalid" | "unsupported";
  correct: boolean;
  message: string;
  method?: "numeric" | "symbolic" | "sampling" | "set";
  explanation?: string;
}

// This is deliberately not a CAS. Sampling is evidence, not a proof, and does
// not prove equality of domains (in particular x/x versus 1).
const VARIABLES = ["x", "y", "z", "a", "b", "c"];
const FUNCTIONS = ["sqrt", "abs", "re", "im", "conj", "transpose", "det", "inv", "trace"];
const MAX = 1e15;
type Node = MathNode & {
  value: number; name: string; content: Node; items: Node[];
  args: Node[]; op: string; fn: Node;
  rawLiteral?: string;
};
class Rejected extends Error {
  constructor(public status: "invalid" | "unsupported", message: string) { super(message); }
}
function reject(message = "Nieobsługiwany zapis matematyczny."): never {
  throw new Rejected("unsupported", message);
}
function bounded(n: number): number {
  if (!Number.isFinite(n) || Math.abs(n) > MAX)
    throw new Rejected("invalid", "Wartość poza bezpiecznym zakresem.");
  return n;
}
type Expression = { text: string; node: Node; variables: Set<string> };
type Answer = { entries: Expression[]; set: boolean };

function expression(text: string): Expression {
  if (/\b0[xob][\da-f]/i.test(text)) reject("Zapisz liczby w systemie dziesiętnym.");
  const literals = [...text.matchAll(/(?<![\w.])(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/g)].map(match => match[0]);
  let literalIndex = 0;
  let depth = 0;
  for (const ch of text) {
    if ("([{".includes(ch) && ++depth > 24) reject("Za wiele nawiasów.");
    if (")]}".includes(ch)) depth--;
  }
  let node: Node;
  try { node = parse(text) as Node; }
  catch { throw new Rejected("invalid", "Nie udało się odczytać wyrażenia."); }
  let count = 0;
  const variables = new Set<string>();
  function walk(n: Node, level = 0, arrayLevel = 0): void {
    if (++count > 512 || level > 24) reject("Wyrażenie jest zbyt złożone.");
    const child = (c: Node) => walk(c, level + 1, arrayLevel);
    switch (n.type) {
      case "ConstantNode":
        if (typeof n.value !== "number") reject();
        n.rawLiteral = literals[literalIndex++];
        if (n.rawLiteral === undefined) reject();
        const scientificExponent = /[eE]([+-]?\d+)$/.exec(n.rawLiteral);
        if (scientificExponent && Math.abs(Number(scientificExponent[1])) > 1000) reject("Wykładnik zapisu dziesiętnego przekracza limit.");
        bounded(n.value); return;
      case "SymbolNode":
        if (VARIABLES.includes(n.name)) variables.add(n.name);
        else if (!["i", "pi", "e"].includes(n.name)) reject();
        return;
      case "ParenthesisNode": child(n.content); return;
      case "ArrayNode":
        if (arrayLevel >= 2 || !n.items.length || n.items.length > 16) reject();
        n.items.forEach((c) => walk(c, level + 1, arrayLevel + 1)); return;
      case "OperatorNode":
        if (!["+", "-", "*", "/", "^"].includes(n.op) ||
          !(n.args.length === 2 || (n.args.length === 1 && ["+", "-"].includes(n.op)))) reject();
        n.args.forEach(child);
        if (n.op === "^") {
          // Exponents must be numeric, bounded integers, never scope-dependent.
          let exponent: unknown;
          try { exponent = exactExponent(n.args[1]); } catch { reject(); }
          if (typeof exponent !== "number" || !Number.isInteger(exponent) || Math.abs(exponent) > 12) reject();
        }
        return;
      case "FunctionNode":
        if (n.fn.type !== "SymbolNode" || !FUNCTIONS.includes(n.fn.name) || n.args.length !== 1) reject();
        n.args.forEach(child); return;
      default: reject();
    }
  }
  walk(node);
  if (literalIndex !== literals.length) reject();
  if (variables.size > 3) reject("Obsługujemy najwyżej trzy zmienne.");
  return { text, node, variables };
}

function answer(input: string): Answer {
  if (typeof input !== "string" || !input.trim() || input.length > 2048)
    throw new Rejected("invalid", "Wpisz wyrażenie do 2048 znaków.");
  let text = input.trim().replaceAll("−", "-");
  const braces = text.startsWith("{") && text.endsWith("}");
  if (braces) text = text.slice(1, -1);
  // Only top-level separators denote solutions; matrix semicolons stay intact.
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ("([".includes(ch)) depth++;
    if (")]".includes(ch)) depth--;
    if (depth === 0) {
      const lub = /^\s+lub\s+/.exec(text.slice(i));
      const separator = ch === ";" || (ch === "," && (braces || /\s/.test(text[i + 1] ?? ""))) || !!lub;
      if (separator) {
        parts.push(text.slice(start, i));
        if (lub) i += lub[0].length - 1;
        start = i + 1;
      }
    }
  }
  parts.push(text.slice(start));
  if (parts.length > 16) reject("Zbyt wiele rozwiązań.");
  const set = braces || parts.length > 1 || /^\s*x\s*=/.test(text);
  const entries = parts.map((part) => {
    part = part.trim().replace(/^x\s*=\s*/, "");
    // Never reinterpret array/function argument commas as decimal marks.
    if (!/[\[\]]/.test(part)) part = part.replace(/(?<![\w.])(\d+),(\d+)(?=(?:[eE][+-]?\d)|[^\w.]|$)/g, "$1.$2");
    return expression(part);
  });
  return { entries, set };
}

function plain(value: unknown): unknown {
  if (value && typeof value === "object" && "toArray" in value)
    return (value as { toArray(): unknown }).toArray();
  return value;
}
function equal(a: unknown, b: unknown, tolerance = 1e-9): boolean {
  a = plain(a); b = plain(b);
  if (Array.isArray(a) || Array.isArray(b))
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => equal(v, b[i], tolerance));
  const parts = (v: unknown): [number, number] => typeof v === "number" ? [v, 0] :
    v && typeof v === "object" && "re" in v && "im" in v ? [(v as { re: number }).re, (v as { im: number }).im] : [NaN, NaN];
  const [ar, ai] = parts(a), [br, bi] = parts(b);
  const close = (x: number, y: number) =>
    // Exact integer answers must not accept a wrong unit at large magnitudes.
    tolerance === 1e-9 && Number.isSafeInteger(x) && Number.isSafeInteger(y)
      ? x === y
      : Math.abs(x - y) <= (tolerance === 1e-9 ? tolerance : tolerance * (1 + Math.max(Math.abs(x), Math.abs(y))));
  return [ar, ai, br, bi].every(Number.isFinite) &&
    close(ar, br) && close(ai, bi);
}

// Exact rational-coefficient polynomials: no floating-point tolerance can erase
// a tiny nonzero coefficient. Term/degree/BigInt budgets bound expansion cost.
type Fraction = [bigint, bigint];
type Polynomial = Map<string, Fraction>;
function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}
function fraction(a: bigint, b = 1n): Fraction {
  if (!b) throw new Error("Undefined fraction");
  if (a.toString(2).length > 16384 || b.toString(2).length > 16384) reject("Przekroczono limit dokładnych obliczeń symbolicznych.");
  const d = gcd(a, b), sign = b < 0n ? -1n : 1n;
  return [a / d * sign, b / d * sign];
}
function plus(a: Fraction, b: Fraction): Fraction { return fraction(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
function times(a: Fraction, b: Fraction): Fraction { return fraction(a[0] * b[0], a[1] * b[1]); }
const ZERO_KEY = "0,0,0,0,0,0";
function constant(f: Fraction): Polynomial { return new Map(f[0] ? [[ZERO_KEY, f]] : []); }
function merge(a: Polynomial, b: Polynomial): Polynomial {
  const out = new Map(a);
  for (const [key, value] of b) {
    const sum = plus(out.get(key) ?? [0n, 1n], value);
    if (sum[0]) out.set(key, sum); else out.delete(key);
  }
  if (out.size > 256) reject("Wielomian ma zbyt wiele składników.");
  return out;
}
function product(a: Polynomial, b: Polynomial): Polynomial {
  let out: Polynomial = new Map();
  for (const [ka, va] of a) for (const [kb, vb] of b) {
    const powers = ka.split(",").map((v, i) => Number(v) + Number(kb.split(",")[i]));
    if (powers.reduce((s, v) => s + v, 0) > 36) reject("Stopień wielomianu przekracza 36.");
    out = merge(out, new Map([[powers.join(","), times(va, vb)]]));
  }
  return out;
}
function polynomial(n: Node): Polynomial {
  if (n.type === "ParenthesisNode") return polynomial(n.content);
  if (n.type === "ConstantNode") {
    const [digits, exp = "0"] = (n.rawLiteral ?? String(n.value)).toLowerCase().split("e");
    const decimal = digits.split(".");
    const scale = (decimal[1]?.length ?? 0) - Number(exp);
    const numerator = BigInt(decimal.join(""));
    return constant(scale >= 0 ? fraction(numerator, 10n ** BigInt(scale)) : fraction(numerator * 10n ** BigInt(-scale)));
  }
  if (n.type === "SymbolNode" && VARIABLES.includes(n.name)) {
    const powers = VARIABLES.map((v) => v === n.name ? 1 : 0);
    return new Map([[powers.join(","), [1n, 1n]]]);
  }
  if (n.type !== "OperatorNode") throw new Error("Not polynomial");
  const a = polynomial(n.args[0]);
  if (n.args.length === 1) return n.op === "-" ? product(a, constant([-1n, 1n])) : a;
  if (n.op === "^") {
    const exponent = exactExponent(n.args[1]);
    if (exponent < 0) throw new Error("Not polynomial");
    let out = constant([1n, 1n]);
    for (let i = 0; i < exponent; i++) out = product(out, a);
    return out;
  }
  const b = polynomial(n.args[1]);
  if (n.op === "+") return merge(a, b);
  if (n.op === "-") return merge(a, product(b, constant([-1n, 1n])));
  if (n.op === "*") return product(a, b);
  if (n.op === "/") {
    // No cancelling variable denominators: it would conceal domain holes.
    if (b.size !== 1 || !b.has(ZERO_KEY)) throw new Error("Not polynomial");
    const [num, den] = b.get(ZERO_KEY)!;
    return product(a, constant(fraction(den, num)));
  }
  throw new Error("Not polynomial");
}

function exactExponent(node: Node): number {
  const p = polynomial(node);
  if (!p.size) return 0;
  if (p.size !== 1 || !p.has(ZERO_KEY)) reject();
  const [n, d] = p.get(ZERO_KEY)!;
  if (d !== 1n || n < -12n || n > 12n) reject();
  return Number(n);
}

// All nodes were validated first. Scope substitution is structural, never an
// evaluate/simplify call; numericValue supplies its own bounded allowed walker.
function at(expr: Expression, scope: Record<string, number>): unknown {
  const replaced = expr.node.transform((node) => {
    const n = node as Node;
    return n.type === "SymbolNode" && Object.hasOwn(scope, n.name) ? parse(`(${scope[n.name]})`) : node;
  });
  return numericValue(replaced.toString());
}
function random(): number {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] / 4294967296;
  }
  return Math.random();
}
function compareExpressions(a: Expression, b: Expression): { same: boolean; method: "numeric" | "symbolic" | "sampling" } {
  const variables = new Set([...a.variables, ...b.variables]);
  if (!variables.size) return { same: equal(numericValue(a.text), numericValue(b.text)), method: "numeric" };
  if (variables.size > 3) reject("Obsługujemy najwyżej trzy zmienne.");
  // Check that sampled intermediates satisfy the numeric budget even when an
  // exact polynomial certificate is available (e.g. huge cancelled constants).
  let certificate: boolean | undefined;
  try { certificate = merge(polynomial(a.node), product(polynomial(b.node), constant([-1n, 1n]))).size === 0; }
  catch (error) {
    if (error instanceof Rejected) throw error;
    // Only genuinely non-polynomial expressions fall back to sampling. An
    // exhausted exact-arithmetic budget must never erase small coefficients.
  }
  let valid = 0;
  for (let attempt = 0; attempt < 12 && valid < 3; attempt++) {
    const scope: Record<string, number> = Object.create(null);
    for (const v of variables) {
      const magnitude = 0.25 + random() * 3.5;
      scope[v] = (attempt % 2 ? -1 : 1) * (Number.isInteger(magnitude) ? magnitude + 0.173 : magnitude);
    }
    let av: unknown, bv: unknown, aValid = true, bValid = true;
    try { av = at(a, scope); } catch { aValid = false; }
    try { bv = at(b, scope); } catch { bValid = false; }
    if (aValid !== bValid) return { same: false, method: "sampling" };
    if (!aValid) continue;
    valid++;
    if (certificate === false || (certificate === undefined && !equal(av, bv, 1e-7))) return { same: false, method: certificate === undefined ? "sampling" : "symbolic" };
  }
  if (valid < 3) throw new Rejected("invalid", "Nie znaleziono trzech wspólnych punktów dziedziny.");
  return { same: true, method: certificate === undefined ? "sampling" : "symbolic" };
}

function compare(a: Answer, b: Answer): { same: boolean; method: NonNullable<MathValidationResult["method"]> } {
  if (!a.set && !b.set) return compareExpressions(a.entries[0], b.entries[0]);
  const values = (v: Answer): unknown[] => {
    if (v.entries.some((e) => e.variables.size)) reject("Zbiory rozwiązań muszą zawierać wartości liczbowe.");
    const list = v.entries.map((e) => plain(numericValue(e.text)));
    const flat = !v.set && Array.isArray(list[0]) ? list[0] as unknown[] : list;
    if (flat.some(Array.isArray)) reject("Macierz nie jest zbiorem rozwiązań.");
    return flat.filter((x, i) => flat.findIndex((y) => equal(x, y)) === i);
  };
  const av = values(a), bv = values(b);
  const used = new Set<number>();
  const same = av.length === bv.length && av.every((x) => {
    const index = bv.findIndex((y, i) => !used.has(i) && equal(x, y));
    if (index < 0) return false;
    used.add(index); return true;
  });
  return { same, method: "set" };
}

function simplified(input: string): string | undefined {
  const match = /^\s*([+-]?\d+)\s*\/\s*([+-]?\d+)\s*$/.exec(input);
  if (!match) return;
  const a = BigInt(match[1]), b = BigInt(match[2]);
  if (!b || (gcd(a, b) <= 1n && b > 0n)) return;
  const [num, den] = fraction(a, b);
  return den === 1n ? String(num) : `${num}/${den}`;
}

export function validateMathAnswer(
  userInput: string,
  expectedAnswer: string,
  commonTraps: Array<{ wrongAnswer: string; explanation: string }> = [],
): MathValidationResult {
  try {
    const user = answer(userInput), expected = answer(expectedAnswer);
    const comparison = compare(user, expected);
    if (comparison.same) {
      const canonical = simplified(userInput);
      return { status: canonical ? "correct_unsimplified" : "correct", correct: true,
        message: canonical ? `Dobrze! W najprostszej postaci to ${canonical}` : comparison.method === "sampling" ? "W trzech punktach wartości są zgodne. To test punktowy, nie dowód równości dziedzin." : "Dobrze! Odpowiedź jest poprawna.",
        method: comparison.method };
    }
    for (const trap of (Array.isArray(commonTraps) ? commonTraps : []).slice(0, 16)) {
      if (!trap || typeof trap.wrongAnswer !== "string" || trap.wrongAnswer.length > 2048 ||
        typeof trap.explanation !== "string" || trap.explanation.length > 2048) continue;
      try {
        const wrong = answer(trap.wrongAnswer);
        if (!compare(wrong, expected).same && compare(user, wrong).same)
          return { status: "trap", correct: false, message: `Uwaga, klasyczna pułapka! ${trap.explanation}`, explanation: trap.explanation, method: comparison.method };
      } catch { /* Bad author-supplied traps never override a valid comparison. */ }
    }
    return { status: "incorrect", correct: false, message: "Jeszcze nie. Sprawdź znaki i kolejność działań.", method: comparison.method };
  } catch (error) {
    return { status: error instanceof Rejected ? error.status : "invalid", correct: false,
      message: error instanceof Rejected ? error.message : "Nieprawidłowa lub niezdefiniowana wartość wyrażenia." };
  }
}
