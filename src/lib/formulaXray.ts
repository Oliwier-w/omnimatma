/** Conservative LaTeX annotation, not a symbolic algebra / semantic inference engine. */
export const XRAY_COLORS = {
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
} as const;

export type FormulaPart = {
  key: string;
  label: string;
  color: string;
  description: string;
};
export type FormulaAnalysis = { coloredLatex: string; parts: FormulaPart[] };
type Span = { start: number; end: number; key: string; label: string };

const greek: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε",
  varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ",
  iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ",
  pi: "π", varpi: "ϖ", rho: "ρ", varrho: "ϱ", sigma: "σ", varsigma: "ς",
  tau: "τ", upsilon: "υ", phi: "φ", varphi: "ϕ", chi: "χ", psi: "ψ",
  omega: "ω", Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ",
  Xi: "Ξ", Pi: "Π", Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

// These arguments contain names, text, dimensions, colors, or alphabets, not variables.
const opaqueArguments: Record<string, number> = {
  text: 1, textrm: 1, textsf: 1, texttt: 1, textnormal: 1, textbf: 1,
  textit: 1, textup: 1, textmd: 1, textsc: 1, mbox: 1, hbox: 1,
  begin: 1, end: 1, mathbb: 1, mathcal: 1, mathfrak: 1, mathscr: 1,
  mathrm: 1, mathsf: 1, mathtt: 1, operatorname: 1,
  color: 1, textcolor: 1, colorbox: 1, fcolorbox: 2,
  href: 2, url: 1, htmlClass: 2, htmlId: 2, htmlStyle: 2, htmlData: 2,
  includegraphics: 1, rule: 2, hspace: 1, vspace: 1,
};

/** Reads balanced groups without ever replacing letters inside a control word. */
function scan(formula: string) {
  const symbols: Span[] = [];
  const fractions: { numerator: [number, number]; denominator: [number, number] }[] = [];
  const skipSpace = (i: number) => {
    while (/\s/.test(formula[i] ?? "") && i < formula.length) i++;
    return i;
  };
  // The group reader below uses explicit depth updates; escaped braces stay opaque.
  function balanced(start: number, open = "{", close = "}"): number {
    let depth = 0;
    for (let i = start; i < formula.length; i++) {
      if (formula[i] === "\\") { i++; continue; }
      if (formula[i] === open) depth++;
      if (formula[i] === close && --depth === 0) return i + 1;
    }
    return formula.length;
  }
  function atom(start: number, opaque = false, single = true): number {
    const i = skipSpace(start);
    if (i >= formula.length) return i;
    if (formula[i] === "{") {
      const end = balanced(i);
      if (!opaque) walk(i + 1, formula[end - 1] === "}" ? end - 1 : end);
      return end;
    }
    if (formula[i] === "\\") {
      const match = /^\\([a-zA-Z]+|[^a-zA-Z])/.exec(formula.slice(i));
      if (!match) return i + 1;
      const name = match[1];
      let end = i + match[0].length;
      if (opaque) return end;
      if (name === "frac" || name === "dfrac" || name === "tfrac" || name === "binom") {
        const a = skipSpace(end);
        const aEnd = atom(a);
        const b = skipSpace(aEnd);
        const bEnd = atom(b);
        if (name !== "binom" && aEnd > a && bEnd > b) {
          fractions.push({ numerator: [a, aEnd], denominator: [b, bEnd] });
        }
        return bEnd;
      }
      if (name === "sqrt") {
        const option = skipSpace(end);
        if (formula[option] === "[") {
          end = balanced(option, "[", "]");
          walk(option + 1, end - 1);
        }
        return atom(end);
      }
      const count = opaqueArguments[name];
      if (count) {
        // operatorname* has the same opaque name argument.
        if (name === "operatorname" && formula[end] === "*") end++;
        for (let n = 0; n < count; n++) end = atom(end, true);
        if (name === "begin" && /\\begin\{(?:array|alignedat)\}/.test(formula.slice(i, end))) end = atom(end, true);
        const raw = formula.slice(i, end);
        if (/^\\operatorname\{(?:Re|Im)\}$/.test(raw)) {
          const key = raw.includes("Re") ? "Re" : "Im";
          symbols.push({ start: i, end, key, label: key });
        }
        return end;
      }
      if (greek[name] || ["Re", "Im", "det", "vx", "va", "vb"].includes(name)) {
        const key = name.startsWith("v") && ["vx", "va", "vb"].includes(name) ? name[1] : name;
        symbols.push({ start: i, end, key, label: greek[name] ?? key });
      }
      return end;
    }
    if (!opaque && /[a-zA-Z0-9]/.test(formula[i])) {
      const raw = !single && /[0-9]/.test(formula[i])
        ? /^\d+(?:\.\d+)?/.exec(formula.slice(i))![0]
        : formula[i];
      symbols.push({ start: i, end: i + raw.length, key: raw, label: raw });
      return i + raw.length;
    }
    return i + 1;
  }
  function walk(start: number, end: number) {
    for (let i = start; i < end;) {
      if (formula[i] === "^" || formula[i] === "_") i = atom(i + 1);
      else if (formula[i] === "%") {
        const newline = formula.indexOf("\n", i);
        i = newline < 0 ? end : newline + 1;
      } else i = atom(i, false, false);
    }
  }
  walk(0, formula.length);
  return { symbols, fractions };
}

function meaning(key: string, formula: string, context: string): [string, keyof typeof XRAY_COLORS] {
  const matrix = /matrix|macierz/i.test(context) || /\\begin\{[pbvBV]?matrix\}/.test(formula);
  const complex = /complex|zespol/i.test(context) || /(?:[abcz]|\\overline\s*z)\s*\+\s*[bd]?i|i\^/.test(formula);
  const fraction = /fraction|ułam|ulam/i.test(context) || /\\(?:frac|dfrac|tfrac)\s*(?:\{a\}|a)\s*(?:\{b\}|b)/.test(formula);
  const circle = /okrag|okrąg|circle/i.test(context) || /\(x-a\)\^2\+\(y-b\)\^2=r\^2/.test(formula);
  const quadratic = /kwadrat|quadratic/i.test(context) || /(?:x\^2|x\^\{2\})/.test(formula);
  const linear = /liniow|linear/i.test(context) || /(?:a\s*\*?\s*x\s*\+\s*b)/.test(formula);
  if (matrix) {
    if (/^[ABX]$/.test(key)) return [`Macierz ${key} — prostokątna tablica elementów${key === "A" && /A\^\{-1\}/.test(formula) ? "; wykładnik −1 oznacza macierz odwrotną" : ""}.`, key === "B" ? "emerald" : "indigo"];
    if (key === "T") return ["Transpozycja — zamiana wierszy z kolumnami.", "rose"];
    if (/^[ijk]$/.test(key)) return [key === "i" ? "Indeks wiersza." : key === "j" ? "Indeks kolumny." : "Indeks sumowania przy mnożeniu macierzy.", "amber"];
    if (/^[abcd]$/.test(key)) return ["Element macierzy; indeksy wskazują jego położenie.", "emerald"];
    if (key === "lambda") return ["Skalar, przez który mnożymy macierz.", "rose"];
    if (/^[mn]$/.test(key)) return ["Wymiar macierzy lub górna granica sumowania.", "amber"];
  }
  if (key === "det") return ["Wyznacznik macierzy; niezerowy wyznacznik pozwala wyznaczyć macierz odwrotną.", "rose"];
  if (complex) {
    if (key === "i") return ["Jednostka urojona: i² = −1.", "rose"];
    if (key === "z") return ["Liczba zespolona; kreska oznacza sprzężenie, a pionowe kreski moduł.", "indigo"];
    if (/^[ac]$/.test(key)) return [`Część rzeczywista liczby zespolonej.${/modulus|moduł/i.test(context) || /\|a\+bi\|/.test(formula) ? " Pionowe kreski oznaczają moduł: odległość od zera na płaszczyźnie." : ""}`, "indigo"];
    if (/^[bd]$/.test(key)) return ["Współczynnik części urojonej (liczba stojąca przy i).", "emerald"];
    if (key === "Re" || key === "Im") return [key === "Re" ? "Część rzeczywista." : "Część urojona.", key === "Re" ? "indigo" : "emerald"];
  }
  if (fraction) {
    if (/^[ac]$/.test(key)) return ["Licznik wyjściowego ułamka — liczba nad kreską.", "indigo"];
    if (/^[bd]$/.test(key)) return ["Mianownik wyjściowego ułamka — liczba pod kreską; nie może być zerem.", "emerald"];
    if (key === "k") return ["Wspólny czynnik licznika i mianownika.", "rose"];
    if (key === "L") return ["Wspólny mianownik.", "amber"];
    if (key === "n") return ["Część całkowita liczby mieszanej.", "amber"];
  }
  if (circle) {
    if (key === "a" || key === "b") return [key === "a" ? "Pierwsza współrzędna środka okręgu." : "Druga współrzędna środka okręgu.", "emerald"];
    if (key === "r") return ["Promień okręgu.", "amber"];
  }
  if (key === "x" || key === "y") return [circle ? "Współrzędna punktu na okręgu." : "Zmienna lub współrzędna, której wartości rozpatrujemy.", key === "x" ? "indigo" : "emerald"];
  if (key === "Delta" && quadratic) return ["Wyróżnik trójmianu: Δ = b² − 4ac. Jego znak określa liczbę rzeczywistych miejsc zerowych.", "rose"];
  if ((linear || quadratic) && key === "a") return [quadratic ? "Współczynnik przy składniku kwadratowym." : "Współczynnik kierunkowy: tempo zmiany funkcji liniowej.", "emerald"];
  if (quadratic && key === "b" && !/a\(x-h\)/.test(formula)) return ["Współczynnik przy x w postaci ogólnej trójmianu.", "amber"];
  if ((linear || quadratic) && key === "c") return ["Stały współczynnik; w postaci ogólnej trójmianu jest wyrazem wolnym.", "rose"];
  if (linear && key === "b" && /ax\+b(?:\W|$)/.test(formula)) return ["Wyraz wolny funkcji liniowej, czyli wartość dla x = 0.", "amber"];
  if (quadratic && /a\(x-h\)/.test(formula) && (key === "h" || key === "k")) return [key === "h" ? "Pierwsza współrzędna wierzchołka paraboli." : "Druga współrzędna wierzchołka paraboli.", "amber"];
  if (key === "pi") return ["Stała π — stosunek obwodu koła do średnicy.", "amber"];
  if (key === "r" && /\\pi\s*r/.test(formula)) return ["Promień koła lub podstawy bryły.", "amber"];
  if (["alpha", "beta", "gamma"].includes(key) && /\\(?:sin|cos|tan)|\\angle/.test(formula)) return ["Miara kąta występującego we wzorze.", "rose"];
  if (key === "n" && /\\sum|ciag|ciąg/i.test(formula + context)) return ["Liczba wyrazów lub górna granica sumowania.", "amber"];
  if (/^[ijk]$/.test(key) && /\\sum/.test(formula)) return ["Indeks sumowania.", "rose"];
  if (/^\d/.test(key)) return ["Stała liczbowa zapisana we wzorze.", "amber"];
  return ["Symbol we wzorze; jego dokładne znaczenie określa treść zadania.", "indigo"];
}

/** Only fixed hexadecimal colors and source-preserving groups are injected. */
export function analyzeFormula(formula: string, topicId = ""): FormulaAnalysis {
  const { symbols, fractions } = scan(formula);
  let selected = symbols.filter((symbol) => !/^\d/.test(symbol.key));
  // A numeric-only fraction is better explained by its structure than by its digits.
  if (!selected.length && fractions.length) {
    const first = fractions[0];
    const parts: FormulaPart[] = [
      { key: "numerator", label: "Licznik", color: XRAY_COLORS.indigo, description: "Wyrażenie nad kreską ułamkową." },
      { key: "denominator", label: "Mianownik", color: XRAY_COLORS.emerald, description: "Wyrażenie pod kreską ułamkową; nie może być zerem." },
    ];
    const replacements = [first.numerator, first.denominator].map(([start, end], index) => ({ start, end, color: parts[index].color }));
    return { coloredLatex: replaceSpans(formula, replacements), parts };
  }
  if (!selected.length) selected = symbols;
  const parts = new Map<string, FormulaPart>();
  const replacements = selected.map((symbol) => {
    if (!parts.has(symbol.key)) {
      const [description, color] = meaning(symbol.key, formula, topicId);
      parts.set(symbol.key, { key: symbol.key, label: symbol.label, color: XRAY_COLORS[color], description });
    }
    return { ...symbol, color: parts.get(symbol.key)!.color };
  });
  return { coloredLatex: replaceSpans(formula, replacements), parts: [...parts.values()] };
}

function replaceSpans(formula: string, spans: { start: number; end: number; color: string }[]) {
  let result = formula;
  for (const span of [...spans].sort((a, b) => b.start - a.start)) {
    const source = formula.slice(span.start, span.end);
    const symbol = /^\\v[xab]$/.test(source) ? source.slice(-1) : source;
    result = result.slice(0, span.start) + `{\\color{${span.color}}{${symbol}}}` + result.slice(span.end);
  }
  return result;
}
