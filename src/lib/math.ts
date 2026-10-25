import {
  parse,
  add,
  subtract,
  multiply,
  divide,
  pow,
  sqrt,
  abs,
  conj,
  re,
  im,
  complex,
  matrix,
  transpose,
  det,
  inv,
  trace,
  type MathNode,
} from "mathjs";

/** Deliberately not a CAS: no equations, variables, assignments, accessors or evaluation. */
export const CHECKER_LIMITATION =
  "Sprawdzamy wartości wyrażeń liczbowych, zespolonych i macierzy, nie równania symboliczne. Użyj i, pi, e, sqrt(…), [a,b; c,d] lub [[a,b],[c,d]].";
type Value = ReturnType<typeof matrix> | number | { re: number; im: number };
const functions = { sqrt, abs, conj, re, im, transpose, det, inv, trace };

function finite(value: unknown, dimensions = 0): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Math.abs(value) > 1e15)
      throw new Error("Wynik poza bezpiecznym zakresem.");
  } else if (Array.isArray(value)) {
    if (dimensions >= 2 || value.length === 0 || value.length > 16)
      throw new Error("Dozwolone są niepuste wektory i macierze do 16 × 16.");
    const rows = value.filter(Array.isArray);
    if (
      rows.length &&
      (rows.length !== value.length ||
        rows.some((row) => row.length !== rows[0].length))
    )
      throw new Error("Macierz musi mieć równe długości wierszy.");
    value.forEach((item) => finite(item, dimensions + 1));
  } else if (value && typeof value === "object" && "toArray" in value) {
    finite((value as { toArray(): unknown }).toArray(), dimensions);
  } else if (
    value &&
    typeof value === "object" &&
    "re" in value &&
    "im" in value
  ) {
    finite(value.re);
    finite(value.im);
  } else throw new Error("Nieobsługiwany typ wartości.");
}

export function numericValue(input: string): unknown {
  if (!input.trim() || input.length > 2048)
    throw new Error("Wpisz wyrażenie do 2048 znaków.");
  // Bound nesting before parsing (also prevents parser stack exhaustion).
  let depth = 0;
  for (const c of input) {
    if ("([".includes(c) && ++depth > 24) throw new Error("Za wiele nawiasów.");
    if (")]".includes(c)) depth--;
  }
  let count = 0;
  const walk = (node: MathNode, level = 0): unknown => {
    if (++count > 512 || level > 24)
      throw new Error("Wyrażenie jest zbyt złożone.");
    const n = node as unknown as {
      type: string;
      value: number;
      name: string;
      content: MathNode;
      items: MathNode[];
      args: MathNode[];
      op: string;
      fn: { name: string };
    };
    let result: unknown;
    const child = (v: MathNode) => walk(v, level + 1);
    if (n.type === "ConstantNode" && typeof n.value === "number")
      result = n.value;
    else if (n.type === "SymbolNode" && ["i", "pi", "e"].includes(n.name))
      result =
        n.name === "i" ? complex(0, 1) : n.name === "pi" ? Math.PI : Math.E;
    else if (n.type === "ParenthesisNode") result = child(n.content);
    else if (n.type === "ArrayNode") result = n.items.map(child);
    else if (
      n.type === "OperatorNode" &&
      ["+", "-", "*", "/", "^"].includes(n.op)
    ) {
      const args = n.args.map(child) as Value[];
      if (args.length === 1 && (n.op === "+" || n.op === "-"))
        result = multiply(n.op === "-" ? -1 : 1, args[0] as never);
      else if (args.length === 2) {
        const [a, b] = args;
        if (
          n.op === "^" &&
          (typeof b !== "number" || !Number.isInteger(b) || Math.abs(b) > 12)
        )
          throw new Error(
            "Potęgi wymagają całkowitego wykładnika od -12 do 12.",
          );
        const operation = {
          "+": add,
          "-": subtract,
          "*": multiply,
          "/": divide,
          "^": pow,
        }[n.op]!;
        result = (operation as (a: unknown, b: unknown) => unknown)(
          Array.isArray(a) ? matrix(a) : a,
          Array.isArray(b) ? matrix(b) : b,
        );
      } else throw new Error("Nieprawidłowy operator.");
    } else if (
      n.type === "FunctionNode" &&
      Object.hasOwn(functions, n.fn.name) &&
      n.args.length === 1
    ) {
      const arg = child(n.args[0]);
      result = (
        functions[n.fn.name as keyof typeof functions] as (
          v: unknown,
        ) => unknown
      )(Array.isArray(arg) ? matrix(arg) : arg);
    } else
      throw new Error(
        "Dozwolone są tylko liczby, i, pi, e, macierze i podstawowe działania.",
      );
    finite(result);
    return result;
  };
  const result = walk(parse(input));
  finite(result);
  return result;
}

function plain(value: unknown): unknown {
  if (value && typeof value === "object" && "toArray" in value)
    return (value as { toArray(): unknown }).toArray();
  return value;
}
function equal(a: unknown, b: unknown): boolean {
  a = plain(a);
  b = plain(b);
  if (Array.isArray(a) || Array.isArray(b))
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => equal(v, b[i]))
    );
  const parts = (v: unknown): [number, number] =>
    typeof v === "number"
      ? [v, 0]
      : [(v as { re: number }).re, (v as { im: number }).im];
  const [ar, ai] = parts(a);
  const [br, bi] = parts(b);
  return (
    Math.abs(ar - br) <= 1e-9 + 1e-9 * Math.max(Math.abs(ar), Math.abs(br)) &&
    Math.abs(ai - bi) <= 1e-9 + 1e-9 * Math.max(Math.abs(ai), Math.abs(bi))
  );
}
export function checkAnswer(
  input: string,
  answer: string,
): { correct: boolean; message: string } {
  try {
    const correct = equal(numericValue(input), numericValue(answer));
    return {
      correct,
      message: correct
        ? "Zgadza się — wartości są równe."
        : "Wartości nie są równe. Sprawdź znaki i kolejność działań.",
    };
  } catch (error) {
    return {
      correct: false,
      message: `${error instanceof Error ? error.message : "Nieprawidłowe wyrażenie."} ${CHECKER_LIMITATION}`,
    };
  }
}
export function checkSteps(
  lines: string[],
  answer: string,
): { correct: boolean; message: string }[] {
  return lines.map((line, i) => {
    const result = checkAnswer(line, answer);
    return { ...result, message: `Krok ${i + 1}: ${result.message}` };
  });
}
