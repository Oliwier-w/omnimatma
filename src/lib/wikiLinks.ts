import type { Lesson } from "./lesson";

export type TextToken = {
  kind: "text" | "math" | "displayMath" | "wiki" | "strong";
  value: string;
};

/** Tokenize markup without interpreting HTML or touching math inside wikilinks. */
export function tokenizeLessonText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const pattern =
    /\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\[\[[^\]\n]+\]\]|\*\*[^\n]*?\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > cursor)
      tokens.push({ kind: "text", value: text.slice(cursor, match.index) });
    const value = match[0];
    if (value.startsWith("$$"))
      tokens.push({ kind: "displayMath", value: value.slice(2, -2) });
    else if (value.startsWith("$"))
      tokens.push({ kind: "math", value: value.slice(1, -1) });
    else if (value.startsWith("[[")) tokens.push({ kind: "wiki", value });
    else tokens.push({ kind: "strong", value: value.slice(2, -2) });
    cursor = match.index! + value.length;
  }
  if (cursor < text.length)
    tokens.push({ kind: "text", value: text.slice(cursor) });
  return tokens;
}

export function parseWikiLink(raw: string) {
  const value = raw.replace(/^\[\[|\]\]$/g, "");
  const pipe = value.indexOf("|");
  const destination = (pipe < 0 ? value : value.slice(0, pipe)).trim();
  const target = destination.split("#")[0].trim();
  const label =
    pipe < 0 ? destination : value.slice(pipe + 1).trim() || destination;
  return { target, label };
}

export function createLessonLookup(lessons: Lesson[]): Map<string, Lesson> {
  const lookup = new Map<string, Lesson>();
  for (const lesson of lessons) {
    for (const alias of new Set([
      lesson.id,
      lesson.title,
      ...(lesson.aliases ?? []),
    ])) {
      if (lookup.has(alias) && lookup.get(alias)!.id !== lesson.id)
        throw new Error(`Ambiguous lesson alias: ${alias}`);
      lookup.set(alias, lesson);
    }
  }
  return lookup;
}

/** The definition comes from the actual note, never inferred from the link label. */
export function previewDefinition(lesson: Lesson): string {
  return (
    lesson.modes.academic
      .split(/\$\$|\n\s*\n/)[0]
      .replace(/^#{1,4}\s*/gm, "")
      .trim() || lesson.description
  );
}
