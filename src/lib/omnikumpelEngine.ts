import { parse, type MathNode } from "mathjs";
import { random, type Problem } from "../generators/shared";
import { generateSmartPractice, parseSmartPractice, smartPracticeTopicId, solveSmartMath } from "./smartMath";
import type { OmniLineCheck, OmniPracticeSpec, OmniSolution, OmniStep } from "./omnikumpelTypes";

/** Local, exact, deliberately bounded notation (not a general CAS).
 * Integers / fractions only; decimals and scientific notation are rejected.
 * Equations: polynomial degree <=2, derivative(p,x) / d/dx(p): degree <=8.
 * Matrices: 2x2, [[a,b],[c,d]] or [a,b;c,d], +, *, inv, transpose.
 * Complex: i, +,-,*,/, conj, abs. Statistics: mean/median/variance/std/stats([..]).
 * Variance is population variance. No mathjs evaluation or compilation occurs.
 */
class Failure extends Error {
  constructor(message: string, readonly status: "invalid" | "unsupported" = "unsupported") { super(message); }
}
const fail = (message = "Ten zapis nie jest obsługiwany przez lokalny silnik."): never => { throw new Failure(message); };
type Q = { n: bigint; d: bigint };
const abs = (n: bigint) => n < 0n ? -n : n;
const MAX = (1n << 256n) - 1n;
function q(n: bigint, d = 1n): Q {
  if (!d) throw new Failure("Dzielenie przez zero.", "invalid");
  if (abs(n) > MAX || abs(d) > MAX) throw new Failure("Przekroczono limit 256 bitów.", "invalid");
  if (d < 0n) { n = -n; d = -d; }
  let a = abs(n), b = d;
  while (b) [a, b] = [b, a % b];
  return { n: n / a, d: d / a };
}
const Z = () => q(0n), O = () => q(1n);
const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const neg = (a: Q) => q(-a.n, a.d);
const sub = (a: Q, b: Q) => add(a, neg(b));
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
const txt = (a: Q) => a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`;
const eq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
const cmp = (a: Q, b: Q) => a.n * b.d < b.n * a.d ? -1 : a.n * b.d > b.n * a.d ? 1 : 0;
type Ast = MathNode & { value?: unknown; name?: string; op?: string; fn?: unknown; args?: Ast[]; items?: Ast[]; content?: Ast };
const unwrap = (n: Ast): Ast => n.type === "ParenthesisNode" ? unwrap(n.content!) : n;
function normalize(input: string): string {
  if (typeof input !== "string" || !input.trim()) throw new Failure("Podaj wyrażenie.", "invalid");
  if (input.length > 600) throw new Failure("Limit: 600 znaków.", "invalid");
  const s = input.trim().replaceAll("−", "-").replaceAll("×", "*").replaceAll("·", "*").replaceAll("÷", "/").replaceAll("²", "^2").replaceAll("³", "^3");
  if (!/^[\w\s+*/^(),;[\]=\-]+$/.test(s) || /\d[eE]|\d{11,}/.test(s)) fail("Użyj liczb całkowitych do 1000000000 i ułamków a/b; bez zapisu dziesiętnego lub naukowego.");
  let depth = 0;
  for (const c of s) {
    if (c === "(" || c === "[") { if (++depth > 24) throw new Failure("Limit zagnieżdżenia: 24.", "invalid"); }
    if (c === ")" || c === "]") { if (--depth < 0) throw new Failure("Sprawdź nawiasy.", "invalid"); }
  }
  if (depth) throw new Failure("Sprawdź nawiasy.", "invalid");
  return s;
}
const functionName = (n: Ast): string => (n.fn as Ast | undefined)?.name ?? "";
function exponent(n: Ast): number {
  n = unwrap(n);
  if (n.type !== "ConstantNode" || typeof n.value !== "number" || !Number.isInteger(n.value) || n.value < 0 || n.value > 8)
    return fail("Wykładnik musi być pojedynczą liczbą całkowitą od 0 do 8.");
  return n.value;
}
function ast(source: string): Ast {
  let root: Ast;
  try { root = parse(source) as Ast; } catch { throw new Failure("Sprawdź składnię wyrażenia.", "invalid"); }
  let nodes = 0, entries = 0;
  function validate(n: Ast, depth: number): void {
    if (++nodes > 200 || depth > 32) throw new Failure("Limit: 200 węzłów i 32 poziomy AST.", "invalid");
    if (n.type === "ConstantNode") {
      if (typeof n.value !== "number" || !Number.isSafeInteger(n.value) || Math.abs(n.value) > 1e9) fail("Liczba poza zakresem; użyj całkowitych do 1000000000.");
      return;
    }
    if (n.type === "SymbolNode" && ["x", "i"].includes(n.name!)) return;
    if (n.type === "ParenthesisNode") { validate(n.content!, depth + 1); return; }
    if (n.type === "ArrayNode") {
      entries += n.items!.length;
      if (entries > 54) fail("Tablica może mieć najwyżej 50 wartości (macierz: 2×2).");
      n.items!.forEach(child => validate(child, depth + 1)); return;
    }
    if (n.type === "OperatorNode" && n.args) {
      const fns: Record<string, string> = { "+": "add", "-": "subtract", "*": "multiply", "/": "divide", "^": "pow" };
      const unary = n.args.length === 1 && ((n.op === "+" && n.fn === "unaryPlus") || (n.op === "-" && n.fn === "unaryMinus"));
      if (!unary && !(n.args.length === 2 && fns[n.op!] === n.fn)) fail();
      if (n.op === "^") exponent(n.args[1]);
      n.args.forEach(child => validate(child, depth + 1)); return;
    }
    if (n.type === "FunctionNode" && ["inv", "transpose", "conj", "abs", "sqrt", "stats", "mean", "median", "variance", "std", "det"].includes(functionName(n)) && n.args?.length === 1) {
      n.args.forEach(child => validate(child, depth + 1)); return;
    }
    fail("Dozwolone są tylko opisane działania; bez przypisań, dostępu do pól, jednostek i dowolnych funkcji.");
  }
  validate(root, 0); return root;
}
type Poly = Q[];
function trim(p: Poly): Poly { while (p.length > 1 && !p[p.length - 1].n) p.pop(); return p; }
function pAdd(a: Poly, b: Poly, minus = false): Poly {
  return trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (minus ? sub : add)(a[i] ?? Z(), b[i] ?? Z())));
}
function pMul(a: Poly, b: Poly): Poly {
  if (a.length + b.length - 2 > 8) fail("Stopień wielomianu nie może przekraczać 8.");
  const out = Array.from({ length: a.length + b.length - 1 }, Z);
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = add(out[i + j], mul(x, y)); }));
  return trim(out);
}
function poly(node: Ast, allowX = true): Poly {
  const n = unwrap(node);
  if (n.type === "ConstantNode") return [q(BigInt(n.value as number))];
  if (n.type === "SymbolNode" && n.name === "x" && allowX) return [Z(), O()];
  if (n.type !== "OperatorNode") return fail("Oczekuję wielomianu o wymiernych współczynnikach.");
  const a = poly(n.args![0], allowX);
  if (n.args!.length === 1) return n.op === "-" ? a.map(neg) : a;
  if (n.op === "^") {
    const e = exponent(n.args![1]);
    if ((a.length - 1) * e > 8) fail("Stopień wielomianu nie może przekraczać 8.");
    let out = [O()]; for (let k = 0; k < e; k++) out = pMul(out, a); return out;
  }
  const b = poly(n.args![1], allowX);
  if (n.op === "+" || n.op === "-") return pAdd(a, b, n.op === "-");
  if (n.op === "*") return pMul(a, b);
  if (n.op === "/" && b.length === 1) return a.map(x => div(x, b[0]));
  return fail("Zmienna w mianowniku nie jest obsługiwana.");
}
const rational = (n: Ast) => poly(n, false)[0];
function pText(p: Poly): string {
  const terms: string[] = [];
  for (let k = p.length - 1; k >= 0; k--) {
    const a = p[k]; if (!a.n) continue;
    const magnitude = txt(q(abs(a.n), a.d));
    const term = k ? `${magnitude === "1" ? "" : `(${magnitude})*`}x${k > 1 ? `^${k}` : ""}` : magnitude;
    terms.push(`${a.n < 0n ? "-" : terms.length ? "+" : ""}${term}`);
  }
  return terms.join("") || "0";
}
function isqrt(n: bigint): bigint {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) { const y = (x + n / x) / 2n; if (y >= x) return x; x = y; }
}
/** Exact even when bounded trial factorization leaves the radicand unsimplified. */
function radical(a: Q, coefficient = O()): string {
  if (a.n < 0n) return fail("Ujemny pierwiastek: rozwiązania zespolone równań nie są obsługiwane.");
  if (!a.n || !coefficient.n) return "0";
  let n = a.n * a.d, outside = 1n;
  const root = isqrt(n);
  if (root * root === n) return txt(mul(coefficient, q(root, a.d)));
  for (let f = 2n; f <= 10000n && f * f <= n; f++) {
    while (n % (f * f) === 0n) { outside *= f; n /= f * f; }
  }
  const c = mul(coefficient, q(outside, a.d));
  return n === 1n ? txt(c) : `${c.n < 0n ? "-" : ""}${abs(c.n) === c.d ? "" : `(${txt(q(abs(c.n), c.d))})*`}sqrt(${n})`;
}
const literalLatex = (s: string) => `\\text{${s.replace(/[\\{}$%&#_^~]/g, " ").replace(/[\r\n]/g, " ")}}`;
function tex(s: string): string {
  if (s.length > 2000) return literalLatex("Zapis przekracza limit podglądu.");
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(s)) return literalLatex(s);
  try {
    // Trusted/generated expressions only, or expressions already validated above.
    if (s.includes("=")) return s.split("=").map(side => parse(side).toTex({ parenthesis: "keep", implicit: "hide" })).join(" = ");
    return parse(s).toTex({ parenthesis: "keep", implicit: "hide" });
  } catch { return literalLatex(s); }
}
const hints: Record<NonNullable<OmniSolution["family"]>, string> = {
  rational: "Które działanie wykonasz najpierw zgodnie z kolejnością działań?",
  linear: "Jak zebrać wyrazy ze zmienną po jednej stronie, wykonując to samo po obu stronach?",
  quadratic: "Jak przenieść wszystkie wyrazy na jedną stronę i odczytać współczynniki?",
  matrix: "Która reguła wybranej operacji na macierzach będzie pierwszym krokiem?",
  complex: "Jak oddzielić części rzeczywiste od urojonych, korzystając z kwadratu jednostki urojonej?",
  derivative: "Jaką regułę różniczkowania zastosujesz osobno do każdego jednomianu?",
  statistics: "Jak uporządkować próbę i wybrać definicję żądanej statystyki?",
  context: "Jakie dane i szukaną wielkość możesz najpierw wypisać?",
};
function step(title: string, expression: string, why: string, index: number): OmniStep {
  return { title, expression, latex: tex(expression), why };
}
function solved(input: string, normalized: string, family: NonNullable<OmniSolution["family"]>, answer: string, practice: OmniPracticeSpec | undefined, steps: OmniStep[]): OmniSolution {
  return { status: "solved", input, normalized, family, answer, answerLatex: tex(answer), exact: true, summary: "Dokładny wynik lokalnego, ograniczonego silnika.", steps, tutorHint: hints[family], practice };
}
function equation(source: string): Poly {
  const sides = source.split("=");
  if (sides.length !== 2) throw new Failure("Równanie musi mieć jeden znak =.", "invalid");
  const p = pAdd(poly(ast(sides[0])), poly(ast(sides[1])), true);
  if (p.length > 3) fail("Równania obsługuję do stopnia 2.");
  return p;
}
function quadraticAnswer(p: Poly): { answer: string; discriminant: Q } {
  const [c, b, a] = p;
  const discriminant = sub(mul(b, b), mul(q(4n), mul(a, c)));
  if (discriminant.n < 0n) return { answer: "Brak rozwiązań rzeczywistych", discriminant };
  const center = div(neg(b), mul(q(2n), a));
  const offset = radical(discriminant, div(O(), mul(q(2n), q(abs(a.n), a.d))));
  let roots: string[];
  if (!offset.includes("sqrt")) {
    const r = mul(q(isqrt(discriminant.n), isqrt(discriminant.d)), div(O(), mul(q(2n), q(abs(a.n), a.d))));
    roots = [txt(sub(center, r)), txt(add(center, r))];
  } else roots = center.n ? [`${txt(center)}-${offset}`, `${txt(center)}+${offset}`] : [`-${offset}`, offset];
  return { answer: `[${[...new Set(roots)].join(",")}]`, discriminant };
}
type Matrix = [[Q, Q], [Q, Q]];
const matrixText = (m: Matrix) => `[${m.map(row => `[${row.map(txt).join(",")}]`).join(",")}]`;
const det = (m: Matrix) => sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0]));
function matrix(node: Ast): Matrix {
  const n = unwrap(node);
  if (n.type === "ArrayNode") {
    const rows = n.items!.map(unwrap);
    if (rows.length !== 2 || rows.some(row => row.type !== "ArrayNode" || row.items!.length !== 2)) return fail("Podaj macierz 2×2.");
    return rows.map(row => row.items!.map(rational)) as Matrix;
  }
  if (n.type === "FunctionNode") {
    const a = matrix(n.args![0]);
    if (functionName(n) === "transpose") return [[a[0][0], a[1][0]], [a[0][1], a[1][1]]];
    if (functionName(n) === "inv") {
      const d = det(a);
      if (!d.n) throw new Failure("Macierz osobliwa nie ma odwrotności.", "invalid");
      return [[div(a[1][1], d), div(neg(a[0][1]), d)], [div(neg(a[1][0]), d), div(a[0][0], d)]];
    }
  }
  if (n.type === "OperatorNode" && n.args?.length === 2 && ["+", "*"].includes(n.op!)) {
    const a = matrix(n.args[0]), b = matrix(n.args[1]);
    return [0, 1].map(i => [0, 1].map(j => n.op === "+" ? add(a[i][j], b[i][j]) : add(mul(a[i][0], b[0][j]), mul(a[i][1], b[1][j])))) as Matrix;
  }
  return fail("Macierze: tylko dodawanie, mnożenie, inv i transpose dla 2×2.");
}
type C = { re: Q; im: Q };
const cAdd = (a: C, b: C): C => ({ re: add(a.re, b.re), im: add(a.im, b.im) });
const cNeg = (a: C): C => ({ re: neg(a.re), im: neg(a.im) });
const cMul = (a: C, b: C): C => ({ re: sub(mul(a.re, b.re), mul(a.im, b.im)), im: add(mul(a.re, b.im), mul(a.im, b.re)) });
function complex(node: Ast): C {
  const n = unwrap(node);
  if (n.type === "ConstantNode") return { re: rational(n), im: Z() };
  if (n.type === "SymbolNode" && n.name === "i") return { re: Z(), im: O() };
  if (n.type === "FunctionNode" && functionName(n) === "conj") { const a = complex(n.args![0]); return { re: a.re, im: neg(a.im) }; }
  if (n.type !== "OperatorNode") return fail("Obsługuję wymierne części rzeczywiste i urojone.");
  const a = complex(n.args![0]);
  if (n.args!.length === 1) return n.op === "-" ? cNeg(a) : a;
  if (n.op === "^") {
    let out = { re: O(), im: Z() }; for (let k = 0; k < exponent(n.args![1]); k++) out = cMul(out, a); return out;
  }
  const b = complex(n.args![1]);
  if (n.op === "+") return cAdd(a, b);
  if (n.op === "-") return cAdd(a, cNeg(b));
  if (n.op === "*") return cMul(a, b);
  if (n.op === "/") {
    const norm = add(mul(b.re, b.re), mul(b.im, b.im));
    const out = cMul(a, { re: b.re, im: neg(b.im) });
    return { re: div(out.re, norm), im: div(out.im, norm) };
  }
  return fail();
}
function cText(a: C): string {
  if (!a.im.n) return txt(a.re);
  const coefficient = txt(q(abs(a.im.n), a.im.d));
  const imag = `${abs(a.im.n) === a.im.d ? "" : `${a.im.d === 1n ? coefficient : `(${coefficient})`}*`}i`;
  return `${a.re.n ? txt(a.re) : ""}${a.im.n < 0n ? "-" : a.re.n ? "+" : ""}${imag}`;
}
function matrixNotation(s: string): string {
  return s.replace(/\[([^\[\]]*;[^\[\]]*)\]/g, (_, body: string) => `[[${body.split(";").join("],[")}]]`);
}
function statistic(n: Ast): { answer: string; statistic: "all" | "mean" | "median" | "variance" | "std"; mean: Q; variance: Q } {
  const name = functionName(n);
  const values = unwrap(n.args![0]);
  if (values.type !== "ArrayNode" || !values.items!.length || values.items!.length > 50) return fail("Próba: od 1 do 50 liczb wymiernych.");
  const xs = values.items!.map(rational).sort(cmp), count = q(BigInt(xs.length));
  const middle = Math.floor(xs.length / 2);
  const median = xs.length % 2 ? xs[middle] : div(add(xs[middle - 1], xs[middle]), q(2n));
  const mean = name === "median" ? median : div(xs.reduce(add, Z()), count);
  const variance = ["variance", "std", "stats"].includes(name) ? div(xs.reduce((sum, x) => { const delta = sub(x, mean); return add(sum, mul(delta, delta)); }, Z()), count) : Z();
  const std = radical(variance);
  const answers: Record<string, string> = { mean: txt(mean), median: txt(median), variance: txt(variance), std, stats: `[${txt(mean)},${txt(median)},${txt(variance)},${std}]` };
  return { answer: answers[name], statistic: name === "stats" ? "all" : name as "mean" | "median" | "variance" | "std", mean, variance };
}

export function solveOmniProblem(input: string): OmniSolution {
  let normalized = "";
  try {
    normalized = normalize(input);
    const derivative = /^derivative\((.*),\s*x\s*\)$/.exec(normalized) ?? /^d\/dx\((.*)\)$/.exec(normalized);
    if (derivative) {
      const p = poly(ast(derivative[1]));
      const d = p.length === 1 ? [Z()] : p.slice(1).map((a, i) => mul(a, q(BigInt(i + 1))));
      const answer = pText(d);
      return solved(input, normalized, "derivative", answer, { kind: "derivative" }, [
        step("Uporządkuj wielomian", pText(p), "Zbierz współczynniki przy kolejnych potęgach zmiennej.", 1),
        step("Zastosuj regułę potęgową", "derivative(x^2,x)=2*x", "Każdy jednomian różniczkujemy osobno: współczynnik mnożymy przez wykładnik, a wykładnik zmniejszamy o jeden. Pochodna stałej jest zerem.", 2),
        step("Zapisz pochodną", answer, "Dodaj pochodne wszystkich jednomianów; to wynik symboliczny, nie wartość funkcji.", 3),
      ]);
    }
    if (normalized.includes("=")) {
      const p = equation(normalized);
      if (p.length === 3) {
        const result = quadraticAnswer(p);
        return solved(input, normalized, "quadratic", result.answer, { kind: "quadratic" }, [
          step("Przenieś wyrazy na lewą stronę", `${pText(p)}=0`, "Odejmujemy prawą stronę od obu stron, zachowując zbiór rozwiązań.", 1),
          step("Oblicz wyróżnik", `${txt(mul(p[1], p[1]))}-4*(${txt(p[2])})*(${txt(p[0])})=${txt(result.discriminant)}`, "Wyróżnik to kwadrat współczynnika liniowego minus czterokrotność iloczynu pozostałych współczynników.", 2),
          step("Wyznacz pierwiastki rzeczywiste", result.answer, "Stosujemy wzór: minus współczynnik liniowy plus lub minus pierwiastek z wyróżnika, podzielone przez podwojony współczynnik kwadratowy. Wektor rosnący; pierwiastek podwójny podajemy raz. Ujemny wyróżnik oznacza brak rozwiązań rzeczywistych.", 3),
        ]);
      }
      const smart = solveSmartMath(normalized);
      if (smart.kind === "solved") return solved(input, normalized, "linear", smart.answer, { kind: "smart", spec: smart.practice }, smart.steps.map((s, i) => step(s.title, s.expression, s.explanation, i + 1)));
      const answer = p.length === 1 ? p[0].n ? "Brak rozwiązań" : "Nieskończenie wiele rozwiązań" : `x = ${txt(div(neg(p[0]), p[1]))}`;
      return solved(input, normalized, "linear", answer, { kind: "smart", spec: { kind: "linear-equation" } }, [step("Uporządkuj", `${pText(p)}=0`, "Odejmij prawą stronę i zbierz wyrazy.", 1), step("Rozstrzygnij równanie liniowe", answer, "Podziel przez niezerowy współczynnik przy zmiennej; stałe równanie jest tożsamością lub sprzecznością.", 2)]);
    }
    const root = unwrap(ast(matrixNotation(normalized)));
    const name = functionName(root);
    if (["stats", "mean", "median", "variance", "std"].includes(name)) {
      const s = statistic(root);
      return solved(input, normalized, "statistics", s.answer, { kind: "statistics", statistic: s.statistic }, [
        step("Odczytaj próbę", matrixNotation(normalized).slice(matrixNotation(normalized).indexOf("(") + 1, -1), "Próba zawiera liczby wymierne; do mediany porządkujemy je rosnąco.", 1),
        step("Zastosuj definicję", `(${txt(s.mean)})`, name === "median" ? "Wybierz środkową wartość uporządkowanej próby; przy parzystej liczebności oblicz średnią dwóch środkowych." : "Średnia to suma podzielona przez liczebność. Wariancję populacyjną liczymy jako średnią kwadratów odchyleń; odchylenie to jej pierwiastek.", 2),
        step("Zapisz żądaną statystykę", s.answer, "W stats kolejność wektora to: średnia, mediana, wariancja populacyjna, odchylenie standardowe. Nie zaokrąglamy.", 3),
      ]);
    }
    if (normalized.includes("[")) {
      if (name === "det") {
        const answer = txt(det(matrix(root.args![0])));
        return solved(input, normalized, "matrix", answer, { kind: "smart", spec: { kind: "determinant2x2" } }, [step("Zastosuj wzór", "a*d-b*c", "Dla macierzy dwa na dwa odejmij iloczyn drugiej przekątnej od iloczynu głównej.", 1), step("Oblicz wyznacznik", answer, "Wstaw wymierne elementy i odejmij dokładnie.", 2)]);
      }
      const operation = name === "inv" ? "inverse" : name === "transpose" ? "transpose" : root.op === "+" ? "add" : root.op === "*" ? "multiply" : null;
      if (!operation) return fail("Podaj operację na macierzy: inv, transpose, + albo *.");
      const answer = matrixText(matrix(root));
      const why = operation === "inverse" ? "Oblicz wyznacznik; jeśli niezerowy, zamień elementy głównej przekątnej, zmień znaki pozostałych i podziel wszystkie przez wyznacznik." : operation === "transpose" ? "Zamień wiersze z kolumnami." : operation === "add" ? "Dodaj elementy na tych samych pozycjach." : "Każdy element wyniku jest sumą iloczynów odpowiedniego wiersza pierwszej macierzy i kolumny drugiej.";
      return solved(input, normalized, "matrix", answer, { kind: "matrix", operation }, [step("Wybierz regułę", matrixNotation(normalized), why, 1), step("Oblicz elementy", answer, "Działania na elementach wykonujemy dokładnie na ułamkach.", 2)]);
    }
    if (/\bi\b|\di\b|\bconj\s*\(|\babs\s*\(/.test(normalized)) {
      const answer = name === "abs" ? (() => { const z = complex(root.args![0]); return radical(add(mul(z.re, z.re), mul(z.im, z.im))); })() : cText(complex(root));
      const operation = name === "conj" ? "conjugate" : name === "abs" ? "modulus" : root.op === "/" ? "divide" : root.op === "*" ? "multiply" : "add";
      const practice: OmniPracticeSpec | undefined = ["conj", "abs"].includes(name) || ["+", "*", "/"].includes(root.op ?? "") ? { kind: "complex", operation } : undefined;
      return solved(input, normalized, "complex", answer, practice, [step("Odczytaj części liczby", normalized, "Rozdziel część rzeczywistą i urojoną. Kwadrat jednostki urojonej jest równy minus jeden.", 1), step("Zastosuj działanie", answer, operation === "divide" ? "Pomnóż licznik i mianownik przez sprzężenie mianownika; mianownik staje się sumą kwadratów jego części." : operation === "modulus" ? "Moduł jest pierwiastkiem z sumy kwadratów części rzeczywistej i urojonej." : operation === "conjugate" ? "Sprzężenie zmienia znak wyłącznie części urojonej." : "Rozwiń iloczyny, zredukuj kwadrat jednostki urojonej i połącz odpowiednie części.", 2)]);
    }
    const smart = solveSmartMath(normalized);
    if (smart.kind === "solved") return solved(input, normalized, "rational", smart.answer, { kind: "smart", spec: smart.practice }, smart.steps.map((s, i) => step(s.title, s.expression, s.explanation, i + 1)));
    const answer = txt(rational(root));
    const practice = ["+", "-", "*", "/"].includes(root.op!) ? { kind: "smart" as const, spec: { kind: "rational" as const, operation: root.op as "+" | "-" | "*" | "/" } } : undefined;
    return solved(input, normalized, "rational", answer, practice, [step("Zachowaj kolejność działań", normalized, "Najpierw nawiasy i małe potęgi, potem iloczyny i ilorazy, na końcu sumy.", 1), step("Skróć dokładny ułamek", answer, "Skróć licznik i mianownik przez ich największy wspólny dzielnik.", 2)]);
  } catch (e) {
    return { status: e instanceof Failure ? e.status : "invalid", input, normalized, exact: false, summary: e instanceof Failure ? e.message : "Nie udało się odczytać zapisu.", steps: [] };
  }
}

/** This is a checkpoint wrapper, not a proof that a generated word problem was parsed. */
export function solutionFromProblem(problem: Problem): OmniSolution {
  const exact = false; // A parseable checkpoint does not certify that the generator avoided rounding.
  return { status: "solved", input: problem.prompt, normalized: problem.prompt, family: "context", answer: problem.answer, answerLatex: tex(problem.answer), exact,
    summary: "Zaufane zadanie generatora. Sprawdzanie kroków porównuje wyłącznie wartości punktów kontrolnych z odpowiedzią; nie weryfikuje rozumowania symbolicznego.",
    tutorHint: hints.context, steps: problem.steps.map((s, i) => step("Punkt kontrolny", s.expression, s.explanation, i + 1)) };
}

/** Canonical numeric checkpoints: rationals, rational complex, matrices/vectors,
 * and standalone square roots of nonnegative rationals. No approximate comparison. */
function numericKey(node: Ast): string {
  const n = unwrap(node);
  if (n.type === "ArrayNode") return `[${n.items!.map(numericKey).join(",")}]`;
  if (n.type === "FunctionNode" && functionName(n) === "sqrt") {
    const a = rational(n.args![0]);
    if (a.n < 0n) fail();
    const rn = isqrt(a.n), rd = isqrt(a.d);
    return rn * rn === a.n && rd * rd === a.d ? `${txt(q(rn, rd))};0` : `sqrt:${txt(a)}`;
  }
  const z = complex(n); return `${txt(z.re)};${txt(z.im)}`;
}
function checkpointKey(source: string): string {
  const n = ast(matrixNotation(normalize(source)));
  // The numeric path accepts roots multiplied by rational coefficients as well.
  function key(node: Ast): string {
    const n = unwrap(node);
    if (n.type === "ArrayNode") return `[${n.items!.map(key).join(",")}]`;
    try { return numericKey(n); } catch { /* try a single rational times a radical */ }
    let coefficient = O(), inner = n;
    if (n.type === "OperatorNode" && n.args?.length === 1) { coefficient = n.op === "-" ? q(-1n) : O(); inner = unwrap(n.args[0]); }
    if (inner.type === "OperatorNode" && inner.op === "*" && inner.args?.length === 2) {
      coefficient = mul(coefficient, rational(inner.args[0])); inner = unwrap(inner.args[1]);
    }
    if (inner.type !== "FunctionNode" || functionName(inner) !== "sqrt") return fail();
    const rad = rational(inner.args![0]);
    if (rad.n < 0n) return fail();
    const square = mul(mul(coefficient, coefficient), rad);
    const rn = isqrt(square.n), rd = isqrt(square.d);
    if (rn * rn === square.n && rd * rd === square.d) return `${txt(q(coefficient.n < 0n ? -rn : rn, rd))};0`;
    return `${coefficient.n < 0n ? "-" : ""}sqrt:${txt(square)}`;
  }
  return key(n);
}
function equationKey(source: string): string {
  const p = equation(normalize(source));
  if (p.length === 1) return p[0].n ? "empty" : "all";
  if (p.length === 2) return `roots:${txt(div(neg(p[0]), p[1]))}`;
  const d = sub(mul(p[1], p[1]), mul(q(4n), mul(p[2], p[0])));
  if (d.n < 0n) return "empty";
  if (!d.n) return `roots:${txt(div(neg(p[1]), mul(q(2n), p[2])))}`;
  return `quadratic:${p.map(a => txt(div(a, p[2]))).join(",")}`;
}
function valueKey(source: string): string {
  try { return checkpointKey(source); } catch {
    const result = solveOmniProblem(source);
    if (result.status !== "solved" || !result.answer || !["rational", "matrix", "complex", "statistics"].includes(result.family!)) return fail();
    return checkpointKey(result.answer);
  }
}
export function checkOmniSteps(input: string, work: string, context?: { answer: string }): OmniLineCheck[] {
  const lines = work.split(/\r?\n/);
  if (lines.length > 50) return [{ line: 1, text: lines[0], status: "unsupported", message: "Limit: 50 linii. Skróć zapis przed sprawdzeniem." }];
  let incorrect = false;
  return lines.flatMap((text, i): OmniLineCheck[] => {
    if (!text.trim()) return [];
    const base = { line: i + 1, text };
    if (incorrect) return [{ ...base, status: "skipped", message: "Najpierw popraw wcześniejszą linię." }];
    if (text.length > 600) return [{ ...base, status: "unsupported", message: "Limit linii: 600 znaków." }];
    try {
      let correct: boolean;
      if (!context && input.includes("=") && /\bx\b|\dx\b/.test(input)) {
        if (!text.includes("=")) fail();
        correct = equationKey(input) === equationKey(text);
      } else {
        const original = (context?.answer ?? input).split("=");
        const target = valueKey(original[0]);
        if (!original.every(part => valueKey(part) === target)) fail();
        correct = text.split("=").every(part => valueKey(part) === target);
      }
      if (!correct) incorrect = true;
      return [{ ...base, status: correct ? "correct" : "incorrect", message: correct
        ? context ? "Zgodna wartość punktu kontrolnego; nie jest to weryfikacja rozumowania." : "Zachowano wartość lub zbiór rozwiązań."
        : context ? "Wartość punktu kontrolnego jest inna. Sprawdź działanie; porównujemy tylko wartości, nie dowód." : "Ta linia zmienia wartość lub zbiór rozwiązań. Sprawdź znaki i działania po obu stronach." }];
    } catch { return [{ ...base, status: "unsupported", message: "Nie mogę zweryfikować tego rozumowania w obsługiwanym zapisie; nie oznaczam go jako błędnego." }]; }
  });
}

export function parseOmniPractice(value: unknown): OmniPracticeSpec | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return null;
  const v = value as Record<string, unknown>, keys = Object.keys(v);
  if (!Object.hasOwn(v, "kind")) return null;
  if (v.kind === "smart" && keys.length === 2 && Object.hasOwn(v, "spec")) { const spec = parseSmartPractice(v.spec); return spec ? { kind: "smart", spec } : null; }
  if ((v.kind === "quadratic" || v.kind === "derivative") && keys.length === 1) return { kind: v.kind };
  if (keys.length !== 2) return null;
  if (v.kind === "matrix" && Object.hasOwn(v, "operation") && ["inverse", "add", "multiply", "transpose"].includes(v.operation as string)) return { kind: "matrix", operation: v.operation as "inverse" | "add" | "multiply" | "transpose" };
  if (v.kind === "complex" && Object.hasOwn(v, "operation") && ["add", "multiply", "divide", "conjugate", "modulus"].includes(v.operation as string)) return { kind: "complex", operation: v.operation as "add" | "multiply" | "divide" | "conjugate" | "modulus" };
  if (v.kind === "statistics" && Object.hasOwn(v, "statistic") && ["mean", "median", "variance", "std", "all"].includes(v.statistic as string)) return { kind: "statistics", statistic: v.statistic as "mean" | "median" | "variance" | "std" | "all" };
  return null;
}
export function omniPracticeTopicId(spec: OmniPracticeSpec): string {
  if (spec.kind === "smart") return smartPracticeTopicId(spec.spec);
  if (spec.kind === "matrix") return `matrix-${spec.operation}`;
  if (spec.kind === "complex") return `complex-${spec.operation}`;
  if (spec.kind === "statistics") return "matura-geometria-statystyka";
  if (spec.kind === "derivative") return "matura-geometria-optymalizacja";
  return "matura-funkcje-kwadratowa";
}

export function generateOmniPractice(spec: OmniPracticeSpec, seed: number, difficulty: number): Problem {
  if (!parseOmniPractice(spec)) throw new Error("Nieprawidłowa specyfikacja ćwiczenia.");
  if (!Number.isSafeInteger(seed) || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) throw new Error("Wymagane całkowite ziarno i trudność od 1 do 5.");
  if (spec.kind === "smart") return generateSmartPractice(spec.spec, seed, difficulty);
  const rng = random(seed), range = difficulty * 4;
  const integer = () => rng(-range, range);
  let source: string, prompt: string, answer: string, expressions: string[], explanations: string[];
  let symbolic: string | undefined;
  if (spec.kind === "quadratic") {
    const r1 = integer(), r2 = r1 + rng(1, range), a = rng(1, difficulty + 1);
    source = `${a}*x^2+(${-a * (r1 + r2)})*x+(${a * r1 * r2})=0`;
    answer = `[${r1},${r2}]`;
    prompt = `Rozwiąż ${source}. Podaj wektor [mniejszy pierwiastek,większy pierwiastek].`;
    expressions = [answer]; explanations = ["Rozłóż wielomian na czynniki liniowe lub oblicz wyróżnik; uporządkuj pierwiastki rosnąco."];
  } else if (spec.kind === "derivative") {
    const degree = rng(2, Math.min(8, difficulty + 2));
    const p = Array.from({ length: degree + 1 }, () => q(BigInt(integer()))); p[degree] = q(BigInt(rng(1, range)));
    source = `derivative(${pText(p)},x)`;
    symbolic = pText(p.slice(1).map((a, i) => mul(a, q(BigInt(i + 1)))));
    const x = rng(-difficulty, difficulty);
    const d = p.slice(1).map((a, i) => mul(a, q(BigInt(i + 1))));
    let value = Z(); for (let i = d.length - 1; i >= 0; i--) value = add(mul(value, q(BigInt(x))), d[i]);
    answer = txt(value);
    prompt = `Wyznacz symbolicznie ${source}, a potem oblicz pochodną w x=${x}. W polu odpowiedzi wpisz tylko wartość liczbową tego punktu kontrolnego.`;
    const evaluated = symbolic.replace(/\bx\b/g, `(${x})`);
    expressions = [evaluated, answer]; explanations = [`Pochodna symboliczna: ${symbolic}. Następnie podstaw podaną wartość zmiennej.`, "Oblicz wartość pochodnej w podanym punkcie, nie wartość pierwotnej funkcji."];
  } else {
    if (spec.kind === "matrix") {
      let a: number[][];
      do { a = [[integer(), integer()], [integer(), integer()]]; } while (spec.operation === "inverse" && a[0][0] * a[1][1] === a[0][1] * a[1][0]);
      const b = [[integer(), integer()], [integer(), integer()]];
      source = spec.operation === "inverse" ? `inv(${JSON.stringify(a)})` : spec.operation === "transpose" ? `transpose(${JSON.stringify(a)})` : `${JSON.stringify(a)}${spec.operation === "add" ? "+" : "*"}${JSON.stringify(b)}`;
    } else if (spec.kind === "complex") {
      const z = `(${integer()}+(${integer()})*i)`, w = `(${rng(1, range)}+(${integer()})*i)`;
      source = spec.operation === "conjugate" ? `conj(${z})` : spec.operation === "modulus" ? `abs(${z})` : `${z}${spec.operation === "add" ? "+" : spec.operation === "multiply" ? "*" : "/"}${w}`;
    } else {
      const xs = Array.from({ length: rng(3, difficulty + 4) }, integer);
      source = `${spec.statistic === "all" ? "stats" : spec.statistic}([${xs.join(",")}])`;
    }
    const result = solveOmniProblem(source);
    if (result.status !== "solved" || !result.answer) throw new Error(`Błąd generowania: ${source}`);
    answer = result.answer;
    prompt = `Oblicz ${source}. Podaj dokładny wynik${spec.kind === "statistics" && spec.statistic === "all" ? " jako [średnia,mediana,wariancja populacyjna,odchylenie standardowe]" : ""}; wariancja jest populacyjna.`;
    expressions = [answer]; explanations = [result.steps.map(s => s.why).join(" ")];
  }
  const family = spec.kind === "matrix" || spec.kind === "complex" ? `${spec.kind}-${spec.operation}` : spec.kind === "statistics" ? `${spec.kind}-${spec.statistic}` : spec.kind;
  const hint = hints[spec.kind];
  return { id: `omni-${family}-${seed}-${difficulty}`, generatorId: omniPracticeTopicId(spec), difficulty, prompt, latex: tex(source), answer,
    hints: [hint, spec.kind === "derivative" ? "Zastosuj regułę potęgową, a dopiero później podstaw punkt." : "Wykonuj operacje dokładnie na ułamkach; zachowaj podaną kolejność elementów.", `${symbolic ? `Pochodna: ${symbolic}. ` : ""}Dokładny wynik: ${answer}.`],
    steps: expressions.map((expression, i) => ({ expression, explanation: explanations[i] })) };
}
