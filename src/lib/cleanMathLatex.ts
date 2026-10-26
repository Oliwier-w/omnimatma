/** Presentation only: never parse/rewrite algebra, commands, domains or grouping. */
export function cleanMathLatex(latex: string): string {
  // Text/command arguments are opaque (including nested braces). Keep all braces.
  const opaque: string[] = [];
  let source = latex;
  const commandArgument = /\\(?:text|textrm|textit|textbf|operatorname|mathrm|mathbf|mathsf|mathtt)\s*\{/g;
  let match: RegExpExecArray | null;
  let cursor = 0;
  let protectedSource = "";
  while ((match = commandArgument.exec(source))) {
    let depth = 1;
    let end = commandArgument.lastIndex;
    while (end < source.length && depth) {
      if (source[end] === "{" && source[end - 1] !== "\\") depth++;
      if (source[end] === "}" && source[end - 1] !== "\\") depth--;
      end++;
    }
    if (depth) break;
    protectedSource += source.slice(cursor, match.index) + `\u0000${opaque.length}\u0000`;
    opaque.push(source.slice(match.index, end));
    cursor = end;
    commandArgument.lastIndex = end;
  }
  source = protectedSource + source.slice(cursor);
  // Only a bare signed number after plus. Do not unwrap (-3)^2 or (-3)x.
  source = source.replace(/\+\s*-\s*(?=\d)/g, "-");
  // A coefficient 1 before a single Latin variable; exclude digits, commands,
  // subscripts, exponents, decimals and fraction arguments via the boundary.
  source = source.replace(/(^|[=+\-&,;:(\s])1(?![eE][+-]?\d)(?=[a-zA-Z](?![a-zA-Z0-9]))/g, "$1");
  // Repair only characteristic binary tails near a <= 12 decimal-place value.
  // Do not round arbitrary long decimals (e.g. pi, measured precision).
  source = source.replace(/(?<![\w.])\d+\.\d{14,}(?![\w.])/g, (token) => {
    if (!/(?:0{6,}\d{0,3}|9{6,}\d{0,3})$/.test(token)) return token;
    const value = Number(token);
    if (!Number.isFinite(value) || Math.abs(value) >= 1e12) return token;
    for (let places = 0; places <= 12; places++) {
      const rounded = Number(value.toFixed(places));
      if (Math.abs(value - rounded) <= Number.EPSILON * Math.abs(value) * 2)
        return String(rounded);
    }
    return token;
  });
  return source.replace(/\u0000(\d+)\u0000/g, (_, index: string) => opaque[Number(index)]);
}
