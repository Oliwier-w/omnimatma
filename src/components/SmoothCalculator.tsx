"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
  Check,
  CircleAlert,
  Copy,
  Delete,
  History,
  NotebookPen,
  Trash2,
} from "lucide-react";
import {
  combinations,
  evaluate,
  format,
  parse,
  permutations,
  type MathNode,
} from "mathjs";
import "./SmoothCalculator.css";

const MAX_INPUT = 500;
const HISTORY_LIMIT = 16;
const MAX_RESULT_LENGTH = 1200;

const EVAL_SCOPE = {
  nCr: combinations,
  nPr: permutations,
};

const ALLOWED_CONSTANTS = new Set(["pi", "e", "i"]);
const ALLOWED_OPERATORS = new Set(["+", "-", "*", "/", "^", "!"]);
const ALLOWED_FUNCTIONS = new Set([
  "pi",
  "e",
  "i",
  "sqrt",
  "cbrt",
  "abs",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "log",
  "log10",
  "exp",
  "det",
  "inv",
  "transpose",
  "re",
  "im",
  "conj",
  "mean",
  "median",
  "variance",
  "std",
  "min",
  "max",
  "round",
  "floor",
  "ceil",
  "factorial",
  "nCr",
  "nPr",
  "gcd",
  "lcm",
  "sum",
  "prod",
]);

type Mode = "scientific" | "academic";
type KeyAction = "clear" | "backspace" | "equals";
type KeyTone =
  | "default"
  | "operator"
  | "function"
  | "utility"
  | "danger"
  | "equals";
type NoticeTone = "ok" | "warn";
type Notice = { id: number; text: string; tone: NoticeTone };
type HistoryEntry = { id: number; expression: string; result: string };
type Caret = { start: number; end: number };

type KeySpec = {
  label: ReactNode;
  token?: string;
  action?: KeyAction;
  aria: string;
  title: string;
  tone?: KeyTone;
};

type TemplateSpec = { label: string; expression: string };
type TemplateGroup = {
  key: string;
  title: string;
  hint: string;
  templates: TemplateSpec[];
};

const MODES: { key: Mode; label: string; title: string }[] = [
  {
    key: "scientific",
    label: "Naukowy",
    title: "Tryb naukowy: trygonometria, logarytmy, potęgi i pierwiastki.",
  },
  {
    key: "academic",
    label: "Akademicki",
    title: "Tryb akademicki: macierze, liczby zespolone i statystyka.",
  },
];

const SCIENTIFIC_KEYS: KeySpec[] = [
  {
    label: "sin",
    token: "sin(",
    aria: "Sinus — wstaw sin(",
    title: "sin( — kąt w radianach",
    tone: "function",
  },
  {
    label: "cos",
    token: "cos(",
    aria: "Cosinus — wstaw cos(",
    title: "cos( — kąt w radianach",
    tone: "function",
  },
  {
    label: "tan",
    token: "tan(",
    aria: "Tangens — wstaw tan(",
    title: "tan( — kąt w radianach",
    tone: "function",
  },
  {
    label: "ln",
    token: "log(",
    aria: "Logarytm naturalny — wstaw log(",
    title: "ln — logarytm naturalny (log)",
    tone: "function",
  },
  {
    label: "log₁₀",
    token: "log10(",
    aria: "Logarytm dziesiętny — wstaw log10(",
    title: "log₁₀ — logarytm dziesiętny",
    tone: "function",
  },
  {
    label: "√",
    token: "sqrt(",
    aria: "Pierwiastek kwadratowy — wstaw sqrt(",
    title: "√ — pierwiastek kwadratowy",
    tone: "function",
  },
  {
    label: "π",
    token: "pi",
    aria: "Pi — wstaw pi",
    title: "π ≈ 3,14159265",
    tone: "function",
  },
  {
    label: "e",
    token: "e",
    aria: "Liczba e — wstaw e",
    title: "e ≈ 2,71828182",
    tone: "function",
  },
  {
    label: "xʸ",
    token: "^",
    aria: "Potęga — wstaw operator potęgi",
    title: "Potęga: podstawa^wykładnik",
    tone: "function",
  },
];

const BASE_KEYS: KeySpec[] = [
  {
    label: "C",
    action: "clear",
    aria: "Wyczyść wyrażenie",
    title: "Wyczyść wyrażenie (Escape)",
    tone: "danger",
  },
  {
    label: "(",
    token: "(",
    aria: "Nawias otwierający",
    title: "Nawias otwierający (",
  },
  {
    label: ")",
    token: ")",
    aria: "Nawias zamykający",
    title: "Nawias zamykający )",
  },
  {
    label: <Delete size={18} aria-hidden="true" />,
    action: "backspace",
    aria: "Usuń ostatni znak",
    title: "Usuń znak (Backspace)",
    tone: "utility",
  },
  { label: "7", token: "7", aria: "Cyfra 7", title: "7" },
  { label: "8", token: "8", aria: "Cyfra 8", title: "8" },
  { label: "9", token: "9", aria: "Cyfra 9", title: "9" },
  {
    label: "÷",
    token: "/",
    aria: "Dzielenie",
    title: "Dzielenie (/)",
    tone: "operator",
  },
  { label: "4", token: "4", aria: "Cyfra 4", title: "4" },
  { label: "5", token: "5", aria: "Cyfra 5", title: "5" },
  { label: "6", token: "6", aria: "Cyfra 6", title: "6" },
  {
    label: "×",
    token: "*",
    aria: "Mnożenie",
    title: "Mnożenie (*)",
    tone: "operator",
  },
  { label: "1", token: "1", aria: "Cyfra 1", title: "1" },
  { label: "2", token: "2", aria: "Cyfra 2", title: "2" },
  { label: "3", token: "3", aria: "Cyfra 3", title: "3" },
  {
    label: "−",
    token: "-",
    aria: "Odejmowanie",
    title: "Odejmowanie (-)",
    tone: "operator",
  },
  { label: "0", token: "0", aria: "Cyfra 0", title: "0" },
  {
    label: ",",
    token: ",",
    aria: "Przecinek dziesiętny",
    title: "Przecinek lub kropka dziesiętna",
  },
  {
    label: "+",
    token: "+",
    aria: "Dodawanie",
    title: "Dodawanie (+)",
    tone: "operator",
  },
  {
    label: "=",
    action: "equals",
    aria: "Oblicz wynik",
    title: "Oblicz wynik (Enter)",
    tone: "equals",
  },
];

const ACADEMIC_GROUPS: TemplateGroup[] = [
  {
    key: "matrices",
    title: "Macierze",
    hint: "2 × 2",
    templates: [
      { label: "Wyznacznik", expression: "det([[1,2],[3,4]])" },
      { label: "Macierz odwrotna", expression: "inv([[1,2],[3,4]])" },
      { label: "Transpozycja", expression: "transpose([[1,2],[3,4]])" },
    ],
  },
  {
    key: "complex",
    title: "Liczby zespolone",
    hint: "a + bi",
    templates: [
      { label: "Liczba zespolona", expression: "(3+4i)" },
      { label: "Sprzężenie", expression: "conj(3+4i)" },
      { label: "Część rzeczywista", expression: "re(3+4i)" },
      { label: "Część urojona", expression: "im(3+4i)" },
    ],
  },
  {
    key: "statistics",
    title: "Statystyka",
    hint: "tablice danych",
    templates: [
      { label: "Średnia", expression: "mean([2,4,6,8])" },
      { label: "Mediana", expression: "median([2,4,6,8])" },
      { label: "Wariancja", expression: "variance([2,4,6,8])" },
      { label: "Odchylenie standardowe", expression: "std([2,4,6,8])" },
    ],
  },
];

class CalculatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculatorError";
  }
}

interface AstNode {
  type: string;
  value?: unknown;
  name?: string;
  op?: string;
  args?: MathNode[];
  items?: MathNode[];
  content?: MathNode;
  fn?: MathNode;
}

function normalizeExpression(expression: string): string {
  return expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/[−–—]/g, "-")
    .replace(/·/g, "*")
    .trim();
}

function validateText(expression: string): void {
  if (!expression) {
    throw new CalculatorError("Wpisz wyrażenie, aby obliczyć wynik.");
  }
  if (expression.length > MAX_INPUT) {
    throw new CalculatorError(
      `Wyrażenie może mieć najwyżej ${MAX_INPUT} znaków.`,
    );
  }
  if (expression.includes("=")) {
    throw new CalculatorError(
      "Znak „=” nie należy do wyrażenia — naciśnij =, aby obliczyć.",
    );
  }
  if (/[;{}]/.test(expression)) {
    throw new CalculatorError(
      "Średniki i nawiasy klamrowe nie są obsługiwane. Użyj nawiasów okrągłych.",
    );
  }
  if (!/^[0-9A-Za-z\s+\-*/^(),.!\[\]]+$/.test(expression)) {
    throw new CalculatorError(
      "Wyrażenie zawiera niedozwolone znaki. Użyj cyfr, funkcji z listy oraz operatorów + − * / ^ ( ).",
    );
  }
}

function validateAst(node: MathNode): void {
  const state = { count: 0 };

  function walk(current: MathNode, depth: number): void {
    state.count += 1;
    if (state.count > 512 || depth > 24) {
      throw new CalculatorError(
        "Wyrażenie jest zbyt złożone. Podziel je na mniejsze kroki.",
      );
    }

    const n = current as unknown as AstNode;
    switch (n.type) {
      case "ConstantNode":
        if (typeof n.value !== "number") {
          throw new CalculatorError("Dozwolone są tylko wartości liczbowe.");
        }
        return;
      case "SymbolNode":
        if (!ALLOWED_CONSTANTS.has(n.name ?? "")) {
          throw new CalculatorError(
            `Niedozwolona nazwa „${n.name ?? "?"}”. Użyj pi, e, i lub funkcji z listy.`,
          );
        }
        return;
      case "ParenthesisNode":
        if (!n.content) {
          throw new CalculatorError("Pusty nawias. Wpisz wyrażenie w środku.");
        }
        walk(n.content, depth + 1);
        return;
      case "ArrayNode":
        if (!n.items?.length) {
          throw new CalculatorError(
            "Pusta tablica. Wpisz co najmniej jedną liczbę.",
          );
        }
        n.items.forEach((item) => walk(item, depth + 1));
        return;
      case "OperatorNode": {
        const op = n.op ?? "";
        if (!ALLOWED_OPERATORS.has(op)) {
          throw new CalculatorError(
            "To działanie nie jest obsługiwane. Użyj +, −, ×, ÷, ^ lub !.",
          );
        }
        const args = n.args ?? [];
        if (!args.length) {
          throw new CalculatorError("Brakuje argumentu działania.");
        }
        if (op === "!") {
          if (args.length !== 1) {
            throw new CalculatorError("Silnia przyjmuje jeden argument.");
          }
        } else if (["*", "/", "^"].includes(op)) {
          if (args.length !== 2) {
            throw new CalculatorError("To działanie wymaga dwóch argumentów.");
          }
        } else if (args.length < 1 || args.length > 2) {
          throw new CalculatorError("Nieprawidłowa liczba argumentów działania.");
        }
        args.forEach((arg) => walk(arg, depth + 1));
        return;
      }
      case "FunctionNode": {
        const fn = n.fn as unknown as AstNode | undefined;
        const name = fn?.name ?? "";
        if (!ALLOWED_FUNCTIONS.has(name)) {
          throw new CalculatorError(
            `Funkcja „${name || "?"}” nie jest dostępna w kalkulatorze.`,
          );
        }
        const args = n.args ?? [];
        if (!args.length) {
          throw new CalculatorError(`Funkcja „${name}” wymaga argumentu.`);
        }
        args.forEach((arg) => walk(arg, depth + 1));
        return;
      }
      default:
        throw new CalculatorError(
          "To wyrażenie zawiera operację, której kalkulator nie obsługuje.",
        );
    }
  }

  walk(node, 0);
}

function validateValue(value: unknown): void {
  const state = { arrays: 0 };

  function check(current: unknown, depth: number): void {
    if (depth > 6) {
      throw new CalculatorError("Wynik ma zbyt głęboką strukturę.");
    }
    if (typeof current === "number") {
      if (!Number.isFinite(current)) {
        throw new CalculatorError(
          "Wynik nie jest liczbą skończoną. Sprawdź dzielenie lub potęgowanie.",
        );
      }
      return;
    }
    if (Array.isArray(current)) {
      state.arrays += 1;
      if (state.arrays > 64 || current.length > 256) {
        throw new CalculatorError(
          "Wynik jest zbyt rozbudowany. Użyj mniejszej tablicy lub macierzy.",
        );
      }
      const first = current[0];
      if (Array.isArray(first)) {
        for (const row of current) {
          if (!Array.isArray(row) || row.length !== first.length) {
            throw new CalculatorError(
              "Wiersze macierzy mają różne długości — sprawdź zapis tablicy.",
            );
          }
        }
      }
      current.forEach((item) => check(item, depth + 1));
      return;
    }
    if (current && typeof current === "object") {
      if (
        "toArray" in current &&
        typeof (current as { toArray?: unknown }).toArray === "function"
      ) {
        check((current as { toArray: () => unknown }).toArray(), depth + 1);
        return;
      }
      if ("re" in current && "im" in current) {
        const complex = current as { re: unknown; im: unknown };
        check(complex.re, depth + 1);
        check(complex.im, depth + 1);
        return;
      }
    }
    throw new CalculatorError("Wynik ma nieobsługiwany format.");
  }

  check(value, 0);
}

function friendlyEvaluationError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("undefined function")) {
    return "Ta funkcja nie jest obsługiwana przez kalkulator.";
  }
  if (message.includes("undefined symbol")) {
    return "Ta nazwa nie jest obsługiwana. Użyj pi, e, i lub funkcji z listy.";
  }
  if (
    message.includes("too many arguments") ||
    message.includes("too few arguments") ||
    message.includes("wrong number of arguments")
  ) {
    return "Sprawdź liczbę argumentów funkcji.";
  }
  if (message.includes("determinant is zero") || message.includes("singular")) {
    return "Macierz jest osobliwa — nie ma macierzy odwrotnej.";
  }
  if (
    message.includes("dimension") ||
    message.includes("size") ||
    message.includes("matrix") ||
    message.includes("determinant")
  ) {
    return "Wymiary macierzy nie pasują do tej operacji.";
  }
  if (
    message.includes("unexpected end") ||
    message.includes("parenthesis") ||
    message.includes("expected )")
  ) {
    return "Sprawdź nawiasy — któregoś brakuje lub jest zbędny.";
  }
  if (
    message.includes("unexpected operator") ||
    message.includes("unexpected type") ||
    message.includes("syntax")
  ) {
    return "Sprawdź zapis i kolejność działań.";
  }
  return "Nie udało się obliczyć wyrażenia. Sprawdź zapis i spróbuj ponownie.";
}

function decimalCommasToDots(expression: string): string {
  let bracketDepth = 0;
  let output = "";
  for (let index = 0; index < expression.length; index += 1) {
    const character = expression[index];
    if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);

    const isDecimalComma =
      character === "," &&
      bracketDepth === 0 &&
      index > 0 &&
      index < expression.length - 1 &&
      /\d/.test(expression[index - 1]) &&
      /\d/.test(expression[index + 1]);

    output += isDecimalComma ? "." : character;
  }
  return output;
}

function attempt(expression: string): { result: string } {
  let node: MathNode;
  try {
    node = parse(expression);
  } catch (error) {
    throw new CalculatorError(friendlyEvaluationError(error));
  }

  validateAst(node);

  let value: unknown;
  try {
    value = evaluate(expression, EVAL_SCOPE);
  } catch (error) {
    throw new CalculatorError(friendlyEvaluationError(error));
  }

  validateValue(value);

  let result: string;
  try {
    result = format(value, { precision: 12 });
  } catch {
    throw new CalculatorError("Nie udało się sformatować wyniku.");
  }

  if (result.length > MAX_RESULT_LENGTH) {
    throw new CalculatorError(
      "Wynik jest zbyt rozbudowany do wyświetlenia. Użyj mniejszej macierzy.",
    );
  }

  return { result };
}

function computeExpression(expression: string): { result: string } {
  const normalized = normalizeExpression(expression);
  validateText(normalized);

  try {
    return attempt(normalized);
  } catch (firstError) {
    const withDots = decimalCommasToDots(normalized);
    if (withDots === normalized) throw firstError;
    return attempt(withDots);
  }
}

function KeyButton({
  label,
  ariaLabel,
  title,
  onClick,
  tone = "default",
  reduced,
}: {
  label: ReactNode;
  ariaLabel: string;
  title: string;
  onClick: () => void;
  tone?: KeyTone;
  reduced: boolean | null;
}) {
  const transition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 480, damping: 28 };

  return (
    <motion.button
      type="button"
      className={`sc-key${tone === "default" ? "" : ` is-${tone}`}`}
      onClick={onClick}
      onMouseDown={(event) => {
        if (event.button === 0) event.preventDefault();
      }}
      aria-label={ariaLabel}
      title={title}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      transition={transition}
    >
      {label}
    </motion.button>
  );
}

export default function SmoothCalculator({
  onInsertNote,
}: {
  onInsertNote: (value: string) => void;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const expressionRef = useRef("");
  const caretRef = useRef<Caret | null>(null);
  const historyId = useRef(0);
  const noticeId = useRef(0);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mode, setMode] = useState<Mode>("scientific");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  const flashNotice = useCallback((text: string, tone: NoticeTone = "ok") => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ id: ++noticeId.current, text, tone });
    noticeTimer.current = setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, 2600);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const focusInput = useCallback((caret: number) => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      input.setSelectionRange(caret, caret);
    });
  }, []);

  const commitExpression = useCallback(
    (next: string, caret = next.length) => {
      expressionRef.current = next;
      setExpression(next);
      setResult(null);
      setError("");
      const safeCaret = Math.max(0, Math.min(caret, next.length));
      caretRef.current = { start: safeCaret, end: safeCaret };
      focusInput(safeCaret);
    },
    [focusInput],
  );

  const insertToken = useCallback(
    (token: string) => {
      const current = expressionRef.current;
      const caret = caretRef.current;
      const start = Math.min(caret?.start ?? current.length, current.length);
      const end = Math.min(caret?.end ?? current.length, current.length);
      const next = current.slice(0, start) + token + current.slice(end);
      if (next.length > MAX_INPUT) {
        flashNotice(
          `Limit wyrażenia to ${MAX_INPUT} znaków. Usuń fragment i spróbuj ponownie.`,
          "warn",
        );
        return;
      }
      commitExpression(next, start + token.length);
    },
    [commitExpression, flashNotice],
  );

  const backspace = useCallback(() => {
    const current = expressionRef.current;
    const caret = caretRef.current;
    let start = Math.min(caret?.start ?? current.length, current.length);
    let end = Math.min(caret?.end ?? current.length, current.length);
    if (start === end && start > 0) start -= 1;
    commitExpression(current.slice(0, start) + current.slice(end), start);
  }, [commitExpression]);

  const clearAll = useCallback(() => {
    expressionRef.current = "";
    caretRef.current = { start: 0, end: 0 };
    setExpression("");
    setResult(null);
    setError("");
    focusInput(0);
  }, [focusInput]);

  const calculate = useCallback(() => {
    const raw = expressionRef.current.trim();
    if (!raw) {
      setResult(null);
      setError("Wpisz wyrażenie, aby obliczyć wynik.");
      return;
    }

    try {
      const computed = computeExpression(raw);
      const calculationId = ++historyId.current;
      setResult(computed.result);
      setError("");
      setHistory((previous) => {
        if (
          previous[0]?.expression === raw &&
          previous[0]?.result === computed.result
        ) {
          return previous;
        }
        return [
          { id: calculationId, expression: raw, result: computed.result },
          ...previous,
        ].slice(0, HISTORY_LIMIT);
      });

      if (document.activeElement !== inputRef.current) {
        const caret = expressionRef.current.length;
        caretRef.current = { start: caret, end: caret };
        focusInput(caret);
      }
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof CalculatorError
          ? caught.message
          : "Nie udało się obliczyć wyrażenia. Spróbuj ponownie.",
      );
    }
  }, [focusInput]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target instanceof HTMLElement ? event.target : null;
      if (!target) return;
      if (
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      ) {
        return;
      }
      const isOwnInput = target === inputRef.current;
      if (target instanceof HTMLInputElement && !isOwnInput) return;

      const active = document.activeElement;
      if (
        rootRef.current &&
        active instanceof HTMLElement &&
        active !== document.body &&
        active !== document.documentElement &&
        !rootRef.current.contains(active)
      ) {
        return;
      }

      const modals = [
        ...document.querySelectorAll<HTMLElement>('[aria-modal="true"]'),
      ];
      if (
        modals.length > 0 &&
        rootRef.current &&
        !modals.some((modal) => modal.contains(rootRef.current))
      ) {
        return;
      }

      const key = event.key;
      if (key === "Escape") {
        if (event.repeat) return;
        event.preventDefault();
        clearAll();
        return;
      }
      if (key === "Enter" || key === "=") {
        if (event.repeat) return;
        if (key === "Enter" && target.closest("button, a[href]")) return;
        event.preventDefault();
        calculate();
        return;
      }
      if (isOwnInput) return;
      if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }
      if (key === " ") return;
      if (/^[0-9]$/.test(key) || key === "." || key === ",") {
        event.preventDefault();
        insertToken(key);
        return;
      }
      if (["+", "-", "*", "/", "^", "(", ")"].includes(key)) {
        event.preventDefault();
        insertToken(key);
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [backspace, calculate, clearAll, insertToken]);

  function pressKey(key: KeySpec) {
    if (key.action === "clear") {
      clearAll();
      return;
    }
    if (key.action === "backspace") {
      backspace();
      return;
    }
    if (key.action === "equals") {
      calculate();
      return;
    }
    if (key.token) insertToken(key.token);
  }

  function applyTemplate(template: string) {
    if (template.length > MAX_INPUT) return;
    commitExpression(template, template.length);
  }

  function chainResult(value: string) {
    const current = expressionRef.current.trimEnd();
    const next =
      current && /[+\-*/^(]$/.test(current) ? `${current} ${value}` : value;
    if (next.length > MAX_INPUT) {
      flashNotice(
        `Wynik nie zmieści się w limicie ${MAX_INPUT} znaków.`,
        "warn",
      );
      return;
    }
    commitExpression(next, next.length);
  }

  const insertAnswer = useCallback(
    (value: string) => {
      window.dispatchEvent(
        new CustomEvent<string>("omnimatma:insert-answer", {
          detail: value,
        }),
      );
      flashNotice("Wynik wstawiony do odpowiedzi.", "ok");
    },
    [flashNotice],
  );

  const insertNote = useCallback(
    (value: string) => {
      try {
        onInsertNote(value);
        flashNotice("Wynik dodany do notatki.", "ok");
      } catch {
        flashNotice(
          "Nie udało się dodać wyniku do notatki. Spróbuj ponownie.",
          "warn",
        );
      }
    },
    [flashNotice, onInsertNote],
  );

  const copyResult = useCallback(
    async (value: string) => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Brak schowka");
        await navigator.clipboard.writeText(value);
        flashNotice("Skopiowano wynik do schowka.", "ok");
      } catch {
        flashNotice(
          "Nie udało się skopiować. Zaznacz wynik i skopiuj ręcznie.",
          "warn",
        );
      }
    },
    [flashNotice],
  );

  function clearHistory() {
    setHistory([]);
    flashNotice("Taśma obliczeń wyczyszczona.", "ok");
  }

  function rememberCaret() {
    const input = inputRef.current;
    if (!input) return;
    caretRef.current = {
      start: input.selectionStart ?? input.value.length,
      end: input.selectionEnd ?? input.value.length,
    };
  }

  function handleInputChange(value: string) {
    expressionRef.current = value;
    setExpression(value);
    setResult(null);
    setError("");
    const input = inputRef.current;
    caretRef.current = {
      start: input?.selectionStart ?? value.length,
      end: input?.selectionEnd ?? value.length,
    };
  }

  const deckTransition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 34 };
  const resultTransition = { duration: reducedMotion ? 0 : 0.16 };
  const modePillId = `${id}-mode-pill`;

  return (
    <section
      ref={rootRef}
      className="smooth-calculator"
      aria-labelledby={`${id}-title`}
    >
      <header className="sc-header">
        <div className="sc-brand">
          <span className="sc-emblem" aria-hidden="true">
            <Calculator size={19} />
          </span>
          <div className="sc-brand-copy">
            <span className="sc-eyebrow">SZYBKI RACHUNEK</span>
            <h3 id={`${id}-title`}>Kalkulator</h3>
          </div>
        </div>

        <div className="sc-modes" role="group" aria-label="Tryb kalkulatora">
          {MODES.map((item) => {
            const active = mode === item.key;
            return (
              <motion.button
                key={item.key}
                type="button"
                className={`sc-mode${active ? " is-active" : ""}`}
                aria-pressed={active}
                title={item.title}
                onClick={() => setMode(item.key)}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 30 }
                }
              >
                {active && (
                  <motion.span
                    layoutId={modePillId}
                    className="sc-mode-pill"
                    aria-hidden="true"
                    transition={deckTransition}
                  />
                )}
                <span className="sc-mode-label">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </header>

      <div className="sc-display">
        <div className="sc-display-meta">
          <label className="sc-field-label" htmlFor={`${id}-expression`}>
            Wyrażenie
          </label>
          <span className="sc-counter" aria-hidden="true">
            {expression.length}/{MAX_INPUT}
          </span>
        </div>
        <div className="sc-input-row">
          <span className="sc-prompt" aria-hidden="true">
            ›
          </span>
          <input
            ref={inputRef}
            id={`${id}-expression`}
            className="sc-input"
            type="text"
            value={expression}
            maxLength={MAX_INPUT}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="done"
            aria-label="Wyrażenie kalkulatora"
            placeholder="np. 2,5 × 4 + sqrt(9)"
            title="Wpisz wyrażenie. Kropka i przecinek działają jak separator dziesiętny."
            onChange={(event) => handleInputChange(event.target.value)}
            onSelect={rememberCaret}
          />
        </div>
        <div className="sc-output" aria-live="polite" aria-atomic="true">
          <span className="sc-output-label">Wynik</span>
          <AnimatePresence mode="wait" initial={false}>
            {error ? (
              <motion.p
                key="error"
                className="sc-error"
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={resultTransition}
              >
                <CircleAlert size={15} aria-hidden="true" />
                {error}
              </motion.p>
            ) : result !== null ? (
              <motion.p
                key={`result-${result}`}
                className="sc-result"
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={resultTransition}
              >
                {result}
              </motion.p>
            ) : (
              <motion.p
                key="idle"
                className="sc-idle"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                transition={resultTransition}
              >
                Naciśnij = lub Enter
              </motion.p>
            )}
          </AnimatePresence>
          <span className="sc-precision" aria-hidden="true">
            12 cyfr
          </span>
        </div>
        {result !== null && !error && (
          <div
            className="sc-history-actions sc-main-actions"
            role="group"
            aria-label="Użyj obliczonego wyniku"
          >
            <button
              type="button"
              onClick={() => insertAnswer(result)}
              title="Wstaw wynik do aktywnego pola odpowiedzi"
            >
              <ArrowUpRight size={13} aria-hidden="true" />
              ↳ Wstaw do odpowiedzi
            </button>
            <button
              type="button"
              onClick={() => insertNote(result)}
              title="Dopisz wynik do brudnopisu"
            >
              <NotebookPen size={13} aria-hidden="true" />
              ↳ Do brudnopisu
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {notice && (
          <motion.p
            key={notice.id}
            className={`sc-notice is-${notice.tone}`}
            role="status"
            initial={reducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={resultTransition}
          >
            {notice.tone === "ok" ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <CircleAlert size={14} aria-hidden="true" />
            )}
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div className="sc-deck-shell" layout={!reducedMotion}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            className="sc-deck"
            initial={reducedMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 6 }}
            transition={deckTransition}
          >
            {mode === "scientific" ? (
              <section
                className="sc-group"
                aria-labelledby={`${id}-functions`}
              >
                <div className="sc-group-head">
                  <h4 id={`${id}-functions`}>Funkcje</h4>
                  <span>Trygonometria w radianach</span>
                </div>
                <div
                  className="sc-function-grid"
                  role="group"
                  aria-label="Funkcje naukowe"
                >
                  {SCIENTIFIC_KEYS.map((key) => (
                    <KeyButton
                      key={key.aria}
                      label={key.label}
                      ariaLabel={key.aria}
                      title={key.title}
                      tone={key.tone}
                      reduced={reducedMotion}
                      onClick={() => pressKey(key)}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <div className="sc-academic">
                {ACADEMIC_GROUPS.map((group) => (
                  <section
                    className="sc-group"
                    key={group.key}
                    aria-labelledby={`${id}-group-${group.key}`}
                  >
                    <div className="sc-group-head">
                      <h4 id={`${id}-group-${group.key}`}>{group.title}</h4>
                      <span>{group.hint}</span>
                    </div>
                    <div
                      className="sc-template-grid"
                      role="group"
                      aria-label={group.title}
                    >
                      {group.templates.map((template) => (
                        <motion.button
                          key={template.expression}
                          type="button"
                          className="sc-template"
                          onClick={() => applyTemplate(template.expression)}
                          onMouseDown={(event) => {
                            if (event.button === 0) event.preventDefault();
                          }}
                          aria-label={`Wstaw szablon: ${template.label}. ${template.expression}`}
                          title={`Wstaw szablon „${template.label}” — zastępuje obecne wyrażenie`}
                          whileTap={
                            reducedMotion ? undefined : { scale: 0.97 }
                          }
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : {
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }
                          }
                        >
                          <span className="sc-template-label">
                            {template.label}
                          </span>
                          <code className="sc-template-code">
                            {template.expression}
                          </code>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                ))}
                <p className="sc-deck-note">
                  Szablon zastępuje wyrażenie. Kliknij je i podmień liczby.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <section className="sc-group" aria-labelledby={`${id}-pad`}>
        <div className="sc-group-head">
          <h4 id={`${id}-pad`}>Klawiatura</h4>
          <span>Kropka lub przecinek dziesiętny</span>
        </div>
        <div
          className="sc-pad"
          role="group"
          aria-label="Cyfry i działania"
        >
          {BASE_KEYS.map((key) => (
            <KeyButton
              key={key.aria}
              label={key.label}
              ariaLabel={key.aria}
              title={key.title}
              tone={key.tone}
              reduced={reducedMotion}
              onClick={() => pressKey(key)}
            />
          ))}
        </div>
      </section>

      <section className="sc-history" aria-labelledby={`${id}-history`}>
        <div className="sc-history-head">
          <div className="sc-history-title">
            <History size={15} aria-hidden="true" />
            <h4 id={`${id}-history`}>Taśma obliczeń</h4>
            <span className="sc-history-count">
              {history.length}/{HISTORY_LIMIT}
            </span>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              className="sc-clear-history"
              onClick={clearHistory}
              title="Wyczyść taśmę obliczeń"
            >
              <Trash2 size={13} aria-hidden="true" />
              Wyczyść
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {history.length === 0 ? (
            <motion.p
              key="history-empty"
              className="sc-history-empty"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={resultTransition}
            >
              Tu pojawi się historia obliczeń. Kliknij wynik, aby użyć go w
              kolejnym wyrażeniu.
            </motion.p>
          ) : (
            <motion.ol
              key="history-list"
              className="sc-history-list"
              initial={reducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={resultTransition}
            >
              <AnimatePresence initial={false}>
                {history.map((entry) => (
                  <motion.li
                    key={entry.id}
                    layout={!reducedMotion}
                    initial={reducedMotion ? false : { opacity: 0, y: -7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: 12 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.18,
                    }}
                  >
                    <div className="sc-history-formula">
                      <span
                        className="sc-history-expression"
                        title={entry.expression}
                      >
                        {entry.expression}
                      </span>
                      <span className="sc-history-equals" aria-hidden="true">
                        =
                      </span>
                      <button
                        type="button"
                        className="sc-history-result"
                        onClick={() => chainResult(entry.result)}
                        aria-label={`Wstaw wynik ${entry.result} do wyrażenia`}
                        title="Wstaw wynik do wyrażenia"
                      >
                        {entry.result}
                      </button>
                    </div>
                    <div className="sc-history-actions">
                      <button
                        type="button"
                        onClick={() => insertAnswer(entry.result)}
                        title="Wstaw wynik do odpowiedzi"
                      >
                        <ArrowUpRight size={13} aria-hidden="true" />
                        Do odpowiedzi
                      </button>
                      <button
                        type="button"
                        onClick={() => insertNote(entry.result)}
                        title="Dodaj wynik do notatki"
                      >
                        <NotebookPen size={13} aria-hidden="true" />
                        Do notatki
                      </button>
                      <button
                        type="button"
                        className="sc-history-copy"
                        onClick={() => void copyResult(entry.result)}
                        aria-label="Kopiuj wynik do schowka"
                        title="Kopiuj wynik"
                      >
                        <Copy size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ol>
          )}
        </AnimatePresence>
      </section>

      <footer className="sc-shortcuts" aria-label="Skróty klawiaturowe">
        <span>
          <kbd>Enter</kbd> wynik
        </span>
        <span>
          <kbd>Backspace</kbd> usuń
        </span>
        <span>
          <kbd>Esc</kbd> wyczyść
        </span>
        <span className="sc-shortcuts-extra">
          Cyfry i operatory działają od razu
        </span>
      </footer>
    </section>
  );
}
