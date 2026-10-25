// Node-only loader. Client components must import the type from ./lesson instead.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import katex from "katex";
import type { Lesson } from "./lesson";

const generatorIds = new Set([
  "fractions-meaning",
  "fractions-simplify",
  "fractions-common",
  "fractions-add",
  "fractions-subtract",
  "fractions-multiply",
  "fractions-divide",
  "fractions-mixed",
  "fractions-compare",
  "fractions-compound",
  "matrix-entry",
  "matrix-add",
  "matrix-subtract",
  "matrix-scale",
  "matrix-transpose",
  "matrix-multiply",
  "matrix-det",
  "matrix-inverse",
  "matrix-trace",
  "matrix-equation",
  "complex-parts",
  "complex-add",
  "complex-subtract",
  "complex-multiply",
  "complex-divide",
  "complex-conjugate",
  "complex-modulus",
  "complex-power",
  "complex-gauss",
  "complex-equation",
  "matura-liczby-pierwiastki",
  "matura-liczby-potegi",
  "matura-liczby-logarytmy",
  "matura-liczby-wzory-skrocone",
  "matura-liczby-podzielnosc",
  "matura-liczby-nierownosc-liniowa",
  "matura-liczby-rownanie-iloczynowe",
  "matura-liczby-wyrazenia-wymierne",
  "matura-liczby-nierownosc-kwadratowa",
  "matura-liczby-uklad-rownan",
  "matura-funkcje-przedzialami",
  "matura-funkcje-liniowa",
  "matura-funkcje-kwadratowa",
  "matura-funkcje-ciag-geometryczny",
  "matura-funkcje-ciag-arytmetyczny",
  "matura-funkcje-ciag-trzywyrazowy",
  "matura-funkcje-trygonometria",
  "matura-funkcje-katy-okregu",
  "matura-funkcje-trapez",
  "matura-funkcje-trojkat-prostokatny",
  "matura-geometria-podobienstwo",
  "matura-geometria-prosta",
  "matura-geometria-okrag",
  "matura-geometria-proste-rownolegle",
  "matura-geometria-graniastoslup",
  "matura-geometria-ostroslup-kat",
  "matura-geometria-ostroslup-krawedzie",
  "matura-geometria-prawdopodobienstwo",
  "matura-geometria-statystyka",
  "matura-geometria-optymalizacja",
]);

function filesIn(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory()
        ? filesIn(file)
        : entry.isFile() && entry.name.endsWith(".md")
          ? [file]
          : [];
    });
}

/** Optional directory supports isolated validation tools and tests; defaults to the vault. */
export function getLessons(
  directory = path.join(process.cwd(), "curriculum_vault"),
): Lesson[] {
  const aliases = new Map<string, string>();
  const pending: {
    lesson: Lesson;
    refs: string[];
    file: string;
    links: string[];
  }[] = [];
  const fail = (file: string, message: string): never => {
    throw new Error(`Vault ${file}: ${message}`);
  };
  for (const file of filesIn(directory)) {
    const raw = fs.readFileSync(file, "utf8");
    if (!/^---\r?\n/.test(raw)) fail(file, "missing YAML frontmatter");
    let parsed: ReturnType<typeof matter>;
    try {
      parsed = matter(raw);
    } catch (error) {
      fail(file, `invalid YAML: ${String(error)}`);
    }
    const { data, content } = parsed!;
    const text = (key: string): string => {
      if (typeof data[key] !== "string" || !data[key].trim())
        fail(file, `expected nonempty string: ${key}`);
      return data[key].trim();
    };
    const id = text("id");
    if (pending.some((item) => item.lesson.id === id))
      fail(file, `duplicate ID ${id}`);
    const generatorId = text("generator_id");
    if (!generatorIds.has(generatorId) || generatorId !== id)
      fail(file, `generator_id must match a registered lesson ID (${id})`);
    const level = text("poziom");
    if (!["podstawowka", "liceum", "studia"].includes(level))
      fail(file, `invalid poziom: ${level}`);
    if (text("status") !== "gotowe") fail(file, "status must be gotowe");
    if (
      !Array.isArray(data.wymagane_wczesniej) ||
      data.wymagane_wczesniej.some(
        (ref: unknown) =>
          typeof ref !== "string" || !/^\[\[[^\[\]]+\]\]$/.test(ref),
      )
    )
      fail(file, "wymagane_wczesniej must be an array of wikilinks");
    if (
      data.minutes !== undefined &&
      (!Number.isInteger(data.minutes) || data.minutes <= 0)
    )
      fail(file, "minutes must be a positive integer");
    if (
      data.formula !== undefined &&
      (typeof data.formula !== "string" || !data.formula.trim())
    )
      fail(file, "formula must be a nonempty KaTeX string");
    const sections = new Map<number, string>();
    const headings = [...content.matchAll(/^## (\d+)\. .+$/gm)];
    headings.forEach((heading, index) => {
      const number = Number(heading[1]);
      if (sections.has(number)) fail(file, `duplicate section ${number}`);
      sections.set(
        number,
        content
          .slice(
            heading.index! + heading[0].length,
            headings[index + 1]?.index ?? content.length,
          )
          .trim(),
      );
    });
    for (let number = 1; number <= 7; number++)
      if (!sections.get(number))
        fail(file, `missing or empty section ${number}`);
    const formula =
      data.formula ??
      sections
        .get(2)!
        .match(/\$\$([\s\S]+?)\$\$/)?.[1]
        ?.trim();
    if (!formula)
      fail(file, "provide formula or a display formula in section 2");
    try {
      katex.renderToString(formula!, { throwOnError: true, trust: false });
    } catch (error) {
      fail(file, `invalid KaTeX formula: ${String(error)}`);
    }
    const lesson: Lesson = {
      id,
      title: text("tytul"),
      level,
      category: text("dzial"),
      generatorId,
      prerequisites: [],
      minutes: data.minutes ?? 7,
      description:
        data.description === undefined
          ? sections.get(1)!.split(/\n/)[0]
          : text("description"),
      modes: {
        eli5: sections.get(1)!,
        academic: sections.get(2)!,
        school: sections.get(6)!,
        visual: sections.get(7)!,
      },
      example: sections.get(3)!,
      pitfalls: sections.get(4)!,
      formula,
      content: content.trim(),
      aliases: [id, text("tytul"), path.basename(file, ".md")],
      related: sections.get(5)!,
    };
    for (const alias of [id, lesson.title, path.basename(file, ".md")]) {
      if (aliases.has(alias) && aliases.get(alias) !== id)
        fail(file, `ambiguous lesson name ${alias}`);
      aliases.set(alias, id);
    }
    pending.push({
      lesson,
      file,
      refs: data.wymagane_wczesniej,
      links: [...content.matchAll(/\[\[([^\[\]]+)\]\]/g)].map(
        (match) => match[1],
      ),
    });
  }
  if (!pending.length) throw new Error("Vault contains no lessons");
  const target = (ref: string) =>
    ref
      .replace(/^\[\[|\]\]$/g, "")
      .split(/[|#]/)[0]
      .trim();
  for (const item of pending) {
    for (const ref of [...item.refs, ...item.links])
      if (!aliases.has(target(ref)))
        fail(item.file, `unresolved wikilink [[${target(ref)}]]`);
    item.lesson.prerequisites = [
      ...new Set(item.refs.map((ref) => aliases.get(target(ref))!)),
    ];
  }
  const byId = new Map(pending.map(({ lesson }) => [lesson.id, lesson]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, trail: string[]) => {
    if (visiting.has(id))
      throw new Error(
        `Vault circular prerequisites: ${[...trail, id].join(" -> ")}`,
      );
    if (visited.has(id)) return;
    visiting.add(id);
    byId.get(id)!.prerequisites.forEach((ref) => visit(ref, [...trail, id]));
    visiting.delete(id);
    visited.add(id);
  };
  byId.forEach((_, id) => visit(id, []));
  // Stable pedagogical order, with actual prerequisites always placed first.
  const ordered: Lesson[] = [];
  const emitted = new Set<string>();
  const emit = (id: string) => {
    if (emitted.has(id) || !byId.has(id)) return;
    const lesson = byId.get(id)!;
    lesson.prerequisites.forEach(emit);
    emitted.add(id);
    ordered.push(lesson);
  };
  generatorIds.forEach(emit);
  return ordered;
}
