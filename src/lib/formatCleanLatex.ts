type Token = { raw: string; kind: "space" | "number" | "word" | "group" | "command" | "symbol" };

/** A presentation pass, not a CAS. In particular, never cancel terms or domains. */
export function formatCleanLatex(latex: string): string {
  const tokens: Token[] = [];
  for (let i = 0; i < latex.length;) {
    const start = i;
    let kind: Token["kind"] = "symbol";
    if (latex[i] === "{") {
      // Keep groups opaque, including nested text, fraction arguments and powers.
      kind = "group";
      let depth = 1;
      i++;
      while (i < latex.length && depth) {
        if (latex[i] === "\\") { i += Math.min(2, latex.length - i); continue; }
        if (latex[i] === "{") depth++;
        if (latex[i] === "}") depth--;
        i++;
      }
    } else {
      const rest = latex.slice(i);
      const match = /^(\\(?:[a-zA-Z]+\*?|[\s\S]))|^(\s+)|^(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|^([a-zA-Z][a-zA-Z0-9_]*)/.exec(rest);
      if (match) {
        i += match[0].length;
        kind = match[1] ? "command" : match[2] ? "space" : match[3] ? "number" : "word";
      } else i++;
    }
    tokens.push({ raw: latex.slice(start, i), kind });
  }
  const next = (i: number) => {
    do { i++; } while (i < tokens.length && (tokens[i].kind === "space" || tokens[i].raw === ""));
    return i;
  };
  const previous = (i: number) => {
    do { i--; } while (i >= 0 && (tokens[i].kind === "space" || tokens[i].raw === ""));
    return i;
  };
  const raw = (i: number) => tokens[i]?.raw ?? "";
  const boundary = (i: number) => i >= tokens.length || /^[+=,;&<>-]$/.test(raw(i));
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.raw === "(" || token.raw === "[") depth++;
    if (token.raw === ")" || token.raw === "]") depth--;
    const before = previous(i);
    if (token.raw === "+" && !["^", "_"].includes(raw(before)) && tokens[before]?.kind !== "command") {
      const after = next(i);
      if (raw(after) === "-") {
        token.raw = "-";
        for (let j = i + 1; j <= after; j++) tokens[j].raw = "";
      } else if (/^\{-\d+(?:\.\d+)?\}$/.test(raw(after)) && boundary(next(after))) {
        token.raw = "-";
        tokens[after].raw = raw(after).slice(2, -1);
      }
    }
    if (token.kind !== "number") continue;
    token.raw = cleanFloat(token.raw);
    if (token.raw !== "1" && token.raw !== "0") continue;
    // A preceding slash, command, subscript, power, digit or word is not a
    // coefficient boundary. This also protects unbraced command arguments.
    if (before >= 0 && !/^[+=,;&(:<>-]$/.test(raw(before))) continue;
    if (["+", "-"].includes(raw(before))) {
      const signBefore = previous(before);
      if (["^", "_", "/"].includes(raw(signBefore)) || tokens[signBefore]?.kind === "command") continue;
    }
    let variable = next(i);
    if (raw(variable) === "*" || raw(variable) === "\\cdot") variable = next(variable);
    if (tokens[variable]?.kind !== "word" || !/^[a-zA-Z]$/.test(raw(variable))) continue;
    const afterVariable = next(variable);
    if (token.raw === "1") {
      // Do not consume partial tokens such as 1x_1, 1x2 or 1x.2.
      if (["_", "."].includes(raw(afterVariable)) || tokens[afterVariable]?.kind === "number") continue;
      for (let j = i; j < variable; j++) tokens[j].raw = "";
      continue;
    }
    // Zero is safe only as a complete top-level polynomial monomial. Never
    // touch a denominator, a product with other factors, or x^0 / x^-1.
    if (depth !== 0) continue;
    let end = afterVariable;
    let last = variable;
    if (raw(end) === "^") {
      const exponent = next(end);
      if (!/^(?:[1-9]\d*|\{[1-9]\d*\})$/.test(raw(exponent))) continue;
      last = exponent;
      end = next(exponent);
    }
    if (!boundary(end)) continue;
    for (let j = i + 1; j <= last; j++) tokens[j].raw = "";
  }
  return tokens.map((token) => token.raw).join("");
}

function cleanFloat(token: string): string {
  if (!/^\d+\.\d{14,}$/.test(token) || !/(?:0{6,}\d{0,3}|9{6,}\d{0,3})$/.test(token)) return token;
  const value = Number(token);
  // Only repair canonical JS-number output, not arbitrary-precision input that
  // merely rounds to the same double when parsed.
  if (!Number.isFinite(value) || value <= 0 || value >= 1e12 || String(value) !== token) return token;
  const bits = (number: number) => {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, number);
    return view.getBigUint64(0);
  };
  for (let places = 0; places <= 12; places++) {
    const rounded = Number(value.toFixed(places));
    if (rounded <= 0) continue;
    const delta = bits(value) - bits(rounded);
    if (delta >= -2n && delta <= 2n) return String(rounded);
  }
  return token;
}
