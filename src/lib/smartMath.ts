import { parse, type MathNode } from "mathjs";
import { random, type Problem } from "../generators/shared";
import { cleanMathLatex } from "./cleanMathLatex";

export type SmartPracticeSpec =
  | { kind: "linear-equation" }
  | { kind: "rational"; operation: "+" | "-" | "*" | "/" }
  | { kind: "determinant2x2" };

type Step = { title: string; expression: string; explanation: string };
export type SmartMathResult =
  | { kind: "solved"; normalized: string; answer: string; steps: Step[]; practice: SmartPracticeSpec }
  | { kind: "unsupported" | "invalid"; message: string };

const SUPPORTED = "Obsługuję dokładne działania na liczbach całkowitych i ułamkach (+, −, *, /), równania liniowe z x oraz det([a,b;c,d]). Potęgi, funkcje i równania nieliniowe nie są jeszcze obsługiwane.";
class InputError extends Error {
  constructor(message: string, readonly kind: "invalid" | "unsupported" = "invalid") {
    super(message);
  }
}

// BigInt arithmetic only: mathjs is used exclusively as a parser, never as an evaluator.
type Q = { n: bigint; d: bigint };
const MAX = (1n << 256n) - 1n;
const abs = (n: bigint) => n < 0n ? -n : n;
function q(n: bigint, d = 1n): Q {
  if (!d) throw new InputError("Nie można dzielić przez zero.");
  if (abs(n) > MAX || abs(d) > MAX) throw new InputError("Obliczenie przekracza limit wielkości liczb (256 bitów).");
  if (d < 0n) { n = -n; d = -d; }
  let a = abs(n), b = d;
  while (b) [a, b] = [b, a % b];
  return { n: n / a, d: d / a };
}
const zero = () => q(0n);
const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const neg = (a: Q) => q(-a.n, a.d);
const sub = (a: Q, b: Q) => add(a, neg(b));
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
const text = (a: Q): string => a.d === 1n ? String(a.n) : `${a.n}/${a.d}`;
const calculate = (op: string, a: Q, b: Q): Q => {
  switch (op) {
    case "+": return add(a, b);
    case "-": return sub(a, b);
    case "*": return mul(a, b);
    case "/": return div(a, b);
    default: throw new InputError(SUPPORTED, "unsupported");
  }
};

type Ast = MathNode & {
  value?: unknown;
  name?: string;
  op?: string;
  fn?: string;
  args?: Ast[];
  content?: Ast;
};
type Budget = { nodes: number };
function readAst(source: string, budget: Budget): Ast {
  if (!source.trim()) throw new InputError("Uzupełnij obie strony równania lub wszystkie liczby.");
  // Reject decimals, scientific notation, strings, assignments, accessors, and functions.
  // No exponent is accepted (including huge exponents), even before parsing.
  if (!/^[\dx\s()+*/-]+$/.test(source)) throw new InputError(SUPPORTED, "unsupported");
  if (/\d{11,}/.test(source)) throw new InputError("Pojedyncza liczba może mieć wartość najwyżej 1000000000.");
  let nesting = 0;
  for (const char of source) {
    if (char === "(" && ++nesting > 24) throw new InputError("Za dużo zagnieżdżonych nawiasów (limit 24).");
    if (char === ")" && --nesting < 0) throw new InputError("Sprawdź pary nawiasów.");
  }
  if (nesting) throw new InputError("Sprawdź pary nawiasów.");
  let root: Ast;
  try { root = parse(source) as Ast; }
  catch { throw new InputError("Nie rozpoznaję zapisu. Sprawdź liczby, znaki działań i nawiasy."); }
  function validate(node: Ast, depth: number): void {
    if (++budget.nodes > 120 || depth > 32) throw new InputError("Wyrażenie jest zbyt złożone (limit 120 węzłów i 32 poziomów).");
    if (node.type === "ConstantNode") {
      if (typeof node.value !== "number" || !Number.isSafeInteger(node.value) || Math.abs(node.value) > 1e9)
        throw new InputError("Użyj liczb całkowitych do 1000000000; ułamki zapisuj jako a/b.");
      return;
    }
    if (node.type === "SymbolNode" && node.name === "x") return;
    if (node.type === "ParenthesisNode" && node.content) { validate(node.content, depth + 1); return; }
    const functions: Record<string, string> = { "+": "add", "-": "subtract", "*": "multiply", "/": "divide" };
    if (node.type === "OperatorNode" && node.op && node.args) {
      const unary = node.args.length === 1 && ((node.op === "+" && node.fn === "unaryPlus") || (node.op === "-" && node.fn === "unaryMinus"));
      if (unary || (node.args.length === 2 && functions[node.op] === node.fn)) {
        node.args.forEach((child) => validate(child, depth + 1));
        return;
      }
    }
    throw new InputError(SUPPORTED, "unsupported");
  }
  validate(root, 0);
  return root;
}

type Linear = { a: Q; b: Q; hasX: boolean };
function evaluate(node: Ast): Linear {
  if (node.type === "ParenthesisNode") return evaluate(node.content!);
  if (node.type === "ConstantNode") return { a: zero(), b: q(BigInt(node.value as number)), hasX: false };
  if (node.type === "SymbolNode") return { a: q(1n), b: zero(), hasX: true };
  const args = node.args!;
  const left = evaluate(args[0]);
  if (args.length === 1) return node.op === "-" ? { a: neg(left.a), b: neg(left.b), hasX: left.hasX } : left;
  const right = evaluate(args[1]);
  const hasX = left.hasX || right.hasX;
  if (node.op === "+" || node.op === "-") {
    const op = node.op === "+" ? add : sub;
    return { a: op(left.a, right.a), b: op(left.b, right.b), hasX };
  }
  if (node.op === "*") {
    if (left.hasX && right.hasX) throw new InputError("Nieliniowe mnożenie dwóch wyrażeń z x nie jest jeszcze obsługiwane.", "unsupported");
    return { a: add(mul(left.a, right.b), mul(right.a, left.b)), b: mul(left.b, right.b), hasX };
  }
  if (right.hasX) throw new InputError("Zmienna w mianowniku nie jest jeszcze obsługiwana. Użyj równania z liczbowymi mianownikami.", "unsupported");
  return { a: div(left.a, right.b), b: div(left.b, right.b), hasX };
}

const unwrap = (node: Ast): Ast => node.type === "ParenthesisNode" ? unwrap(node.content!) : node;
function arithmeticPractice(node: Ast): SmartPracticeSpec {
  const root = unwrap(node);
  if (root.type === "OperatorNode" && root.args?.length === 1) return arithmeticPractice(root.args[0]);
  if (root.type === "OperatorNode" && root.args?.length === 2)
    return { kind: "rational", operation: root.op as "+" | "-" | "*" | "/" };
  return { kind: "rational", operation: "+" };
}

function arithmeticSteps(node: Ast, steps: Step[]): Q {
  if (node.type === "ParenthesisNode") return arithmeticSteps(node.content!, steps);
  if (node.type === "ConstantNode") return q(BigInt(node.value as number));
  const left = arithmeticSteps(node.args![0], steps);
  if (node.args!.length === 1) return node.op === "-" ? neg(left) : left;
  const right = arithmeticSteps(node.args![1], steps);
  const value = calculate(node.op!, left, right);
  const explanation = node.op === "+" || node.op === "-"
    ? `Wspólny mianownik to ${left.d * right.d}. Licznik: (${left.n})*(${right.d}) ${node.op} (${right.n})*(${left.d}). Skracamy przez NWD.`
    : node.op === "*"
      ? `Mnożymy liczniki (${left.n})*(${right.n}) i mianowniki (${left.d})*(${right.d}), a następnie skracamy.`
      : `Dzielnik ${text(right)} jest niezerowy. Mnożymy ${text(left)} przez odwrotność (${right.d})/(${right.n}) i skracamy.`;
  steps.push({ title: "Oblicz działanie", expression: `(${text(left)})${node.op}(${text(right)}) = ${text(value)}`, explanation });
  return value;
}

/** Bounded, exact solver. Unsupported input is never approximated or evaluated. */
export function solveSmartMath(input: string): SmartMathResult {
  try {
    if (typeof input !== "string" || !input.trim()) throw new InputError("Zadej działanie, równanie lub temat.");
    if (input.length > 300) throw new InputError("Zapis może mieć najwyżej 300 znaków.");
    const normalized = input.trim().replaceAll("−", "-").replaceAll("×", "*").replaceAll("·", "*").replaceAll("÷", "/");
    const budget = { nodes: 0 };
    if (/^det\s*\(/.test(normalized)) {
      const match = /^det\s*\(\s*\[([^\[\]]+)\]\s*\)$/.exec(normalized);
      const rows = match?.[1].split(";").map((row) => row.split(","));
      if (!rows || rows.length !== 2 || rows.some((row) => row.length !== 2))
        throw new InputError("Podaj macierz 2×2 w formacie det([1,2;3,4]).");
      const entries = rows.flat().map((entry) => {
        const value = evaluate(readAst(entry, budget));
        if (value.hasX) throw new InputError("Wyznacznik obsługuje tylko liczby całkowite i ułamki.", "unsupported");
        return value.b;
      });
      const [a, b, c, d] = entries;
      const ad = mul(a, d), bc = mul(b, c), answer = text(sub(ad, bc));
      return { kind: "solved", normalized, answer, practice: { kind: "determinant2x2" }, steps: [
        { title: "Wzór dla macierzy 2×2", expression: `(${text(a)})*(${text(d)})-(${text(b)})*(${text(c)})`, explanation: "Wyznacznik to ad − bc: iloczyn głównej przekątnej minus iloczyn drugiej." },
        { title: "Oblicz iloczyny", expression: `(${text(ad)})-(${text(bc)})`, explanation: `Pierwszy iloczyn to ${text(ad)}, drugi to ${text(bc)}. Zachowaj znak odejmowania.` },
        { title: "Odejmij", expression: answer, explanation: "Różnica iloczynów jest wyznacznikiem tej macierzy." },
      ] };
    }
    if (normalized.includes("=")) {
      const sides = normalized.split("=");
      if (sides.length !== 2) throw new InputError("Równanie musi mieć dokładnie jeden znak =.");
      const left = evaluate(readAst(sides[0], budget)), right = evaluate(readAst(sides[1], budget));
      const a = sub(left.a, right.a), b = sub(right.b, left.b);
      const steps: Step[] = [
        { title: "Uporządkuj obie strony", expression: `(${text(left.a)})*x+(${text(left.b)})=(${text(right.a)})*x+(${text(right.b)})`, explanation: "Rozwiń nawiasy i połącz wyrazy z x oraz liczby osobno po każdej stronie." },
        { title: "Wykonaj te same działania po obu stronach", expression: `(${text(a)})*x=${text(b)}`, explanation: `Odejmij (${text(right.a)})*x i (${text(left.b)}) od obu stron. To zachowuje zbiór rozwiązań.` },
      ];
      let answer: string;
      if (!a.n) {
        answer = b.n ? "Brak rozwiązań" : "Nieskończenie wiele rozwiązań (x ∈ ℝ)";
        steps.push({ title: b.n ? "Sprzeczność" : "Tożsamość", expression: `0=${text(b)}`, explanation: b.n ? "Zero nie jest równe liczbie niezerowej, więc żadne x nie spełnia równania." : "Obie strony są równe dla dowolnego rzeczywistego x. Nie dzielimy przez zero." });
      } else {
        answer = `x = ${text(div(b, a))}`;
        steps.push({ title: "Podziel przez współczynnik przy x", expression: answer, explanation: `Współczynnik ${text(a)} jest niezerowy. Dzieląc obie strony przez niego, otrzymujemy x = (${text(b)})/(${text(a)}).` });
      }
      return { kind: "solved", normalized, answer, steps, practice: { kind: "linear-equation" } };
    }
    const root = readAst(normalized, budget), value = evaluate(root);
    if (value.hasX) throw new InputError("Aby znaleźć x, podaj całe równanie ze znakiem =.", "unsupported");
    const answer = text(value.b);
    const calculationSteps: Step[] = [];
    arithmeticSteps(root, calculationSteps);
    return { kind: "solved", normalized, answer, practice: arithmeticPractice(root), steps: [
      { title: "Zachowaj kolejność działań", expression: normalized, explanation: "Najpierw nawiasy, potem mnożenie i dzielenie, a następnie dodawanie i odejmowanie; działania równorzędne od lewej." },
      ...calculationSteps,
      { title: "Skróć wynik", expression: answer, explanation: "Podziel licznik i mianownik przez ich największy wspólny dzielnik. Mianownik jest dodatni; nie używamy zaokrągleń." },
    ] };
  } catch (error) {
    return error instanceof InputError ? { kind: error.kind, message: error.message } : { kind: "invalid", message: "Nie udało się odczytać zapisu. Sprawdź nawiasy i znaki działań." };
  }
}

/** Strict persistence boundary: never spread untrusted objects into a practice spec. */
export function parseSmartPractice(value: unknown): SmartPracticeSpec | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value)) || !Object.hasOwn(value, "kind")) return null;
  const record = value as Record<string, unknown>;
  if (record.kind === "linear-equation" && Object.keys(record).length === 1) return { kind: "linear-equation" };
  if (record.kind === "determinant2x2" && Object.keys(record).length === 1) return { kind: "determinant2x2" };
  if (record.kind === "rational" && Object.keys(record).length === 2 && ["+", "-", "*", "/"].includes(record.operation as string))
    return { kind: "rational", operation: record.operation as "+" | "-" | "*" | "/" };
  return null;
}

/** Existing lesson ID for metadata only; do not call its generic generator for this spec. */
export function smartPracticeTopicId(spec: SmartPracticeSpec): string {
  if (spec.kind === "linear-equation") return "matura-funkcje-liniowa";
  if (spec.kind === "determinant2x2") return "matrix-det";
  return { "+": "fractions-add", "-": "fractions-subtract", "*": "fractions-multiply", "/": "fractions-divide" }[spec.operation];
}

export function generateSmartPractice(spec: SmartPracticeSpec, seed: number, difficulty: number): Problem {
  if (!parseSmartPractice(spec)) throw new Error("Nieprawidłowa specyfikacja podobnych zadań.");
  if (!Number.isSafeInteger(seed)) throw new Error("Ziarno musi być bezpieczną liczbą całkowitą.");
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) throw new Error("Trudność musi być liczbą całkowitą od 1 do 5.");
  const rng = random(seed), range = difficulty * 8;
  const integer = () => rng(-range, range);
  const nonzero = () => rng(1, range) * (rng(0, 1) ? 1 : -1);
  let prompt: string, latex: string, answer: string, expressions: string[], explanations: string[], hints: string[];
  let mistakes: Problem["mistakes"];
  if (spec.kind === "linear-equation") {
    const c = difficulty > 1 ? integer() : 0, a = c + nonzero(), b = integer(), x = integer(), d = (a - c) * x + b;
    prompt = `Rozwiąż równanie ${a}*x+(${b})=${c}*x+(${d}). Podaj samą wartość x.`;
    const side = (coefficient: number, constant: number) => {
      const term = coefficient === 0 ? "" : coefficient === 1 ? "x" : coefficient === -1 ? "-x" : `${coefficient}x`;
      return !term ? String(constant) : !constant ? term : `${term}${constant < 0 ? "-" : "+"}${Math.abs(constant)}`;
    };
    latex = `${side(a, b)}=${side(c, d)}`;
    answer = String(x);
    expressions = [`((${d})-(${b}))/((${a})-(${c}))`, `${d - b}/(${a - c})`, answer];
    explanations = [`Odejmij ${c}x i ${b} po obu stronach: (${a - c})x=${d - b}. Następnie podziel przez niezerowy współczynnik.`, `Po zebraniu wyrazów współczynnik przy x to ${a - c}, a prawa strona to ${d - b}.`, `Iloraz daje x = ${answer}. Podstawienie do obu stron potwierdza równość.`];
    hints = ["Przenieś wyrazy z x na jedną stronę i liczby na drugą, wykonując te same działania po obu stronach.", `Po uporządkowaniu: (${a - c})x=${d - b}. Podziel obie strony przez ${a - c}.`, `${explanations[0]} Wynik: x = ${answer}.`];
  } else if (spec.kind === "determinant2x2") {
    const a = difficulty <= 3 ? 1 : integer(), b = integer(), c = integer();
    const d = difficulty <= 3 ? b * c + rng(1, 2) * (rng(0, 1) ? 1 : -1) : integer();
    answer = String(a * d - b * c);
    mistakes = [
      { answer: String(b * c - a * d), message: "Ten wynik pasuje do odwrócenia kolejności odejmowania. Wyznacznik 2×2 liczymy jako ad − bc, a nie bc − ad." },
      { answer: String(a * d + b * c), message: "Ten wynik pasuje do dodania przekątnych. W wyznaczniku 2×2 drugi iloczyn odejmujemy: ad − bc." },
    ];
    prompt = `Oblicz det([${a},${b};${c},${d}]).`;
    latex = `\\begin{vmatrix}${a}&${b}\\\\${c}&${d}\\end{vmatrix}`;
    expressions = [`(${a})*(${d})-(${b})*(${c})`, `(${a * d})-(${b * c})`, answer];
    explanations = ["Dla macierzy 2×2 stosujemy wzór ad − bc, nie zamieniamy przekątnych.", `Iloczyn głównej przekątnej to ${a * d}, a drugiej to ${b * c}.`, `Odejmujemy iloczyny i otrzymujemy wyznacznik ${answer}.`];
    hints = ["Wyznacznik macierzy 2×2 liczymy ze wzoru ad − bc.", `Podstaw: (${a})*(${d}) − (${b})*(${c}).`, `${a * d} − (${b * c}) = ${answer}. Odejmujemy drugi iloczyn od pierwszego.`];
  } else {
    const a = integer(), b = rng(2, range + 2), c = nonzero(), d = rng(2, range + 2), op = spec.operation;
    const expression = `(${a}/${b})${op}(${c}/${d})`;
    if (op === "+") mistakes = [{ answer: text(q(BigInt(a + c), BigInt(b + d))), message: "Ten wynik pasuje do dodania liczników i mianowników osobno. Przy dodawaniu ułamków najpierw sprowadź je do wspólnego mianownika, a potem dodaj tylko liczniki." }];
    answer = text(calculate(op, q(BigInt(a), BigInt(b)), q(BigInt(c), BigInt(d))));
    const n = op === "+" ? a * d + c * b : op === "-" ? a * d - c * b : op === "*" ? a * c : a * d;
    const denominator = op === "/" ? b * c : b * d;
    prompt = `Oblicz ${expression}. Podaj dokładny wynik.`;
    latex = `\\left(\\frac{${a}}{${b}}\\right)${op === "*" ? "\\cdot" : op === "/" ? "\\div" : op}\\left(\\frac{${c}}{${d}}\\right)`;
    expressions = [expression, `(${n})/(${denominator})`, answer];
    explanations = [op === "/" ? "Mnożymy pierwszy ułamek przez odwrotność drugiego; dzielnik jest niezerowy." : op === "*" ? "Mnożymy liczniki przez siebie oraz mianowniki przez siebie." : "Sprowadzamy ułamki do wspólnego mianownika, a następnie wykonujemy działanie na licznikach.", `Po wykonaniu działania otrzymujemy (${n})/(${denominator}).`, "Skracamy ułamek przez NWD i zapisujemy dodatni mianownik, bez zaokrąglania."];
    hints = [explanations[0], `Podstaw liczby: ${expression}. Przed skróceniem: (${n})/(${denominator}).`, `${explanations[0]} Następnie skróć (${n})/(${denominator}). Wynik: ${answer}.`];
  }
  const family = spec.kind === "rational" ? `rational-${{ "+": "add", "-": "subtract", "*": "multiply", "/": "divide" }[spec.operation]}` : spec.kind;
  return { id: `smart-${family}-${seed}-${difficulty}`, generatorId: smartPracticeTopicId(spec), difficulty, prompt, latex: cleanMathLatex(latex), answer, hints, commonTraps: (mistakes ?? []).map(({ answer, message }) => ({ wrongAnswer: answer, explanation: message })), ...(mistakes ? { mistakes } : {}), steps: expressions.map((expression, i) => ({ expression, explanation: explanations[i] })) };
}
