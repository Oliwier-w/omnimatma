import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import katex from "katex";
import { getLessons } from "../src/lib/vaultParser";

const vault = path.join(process.cwd(), "curriculum_vault");
const source = fs.readFileSync(
  path.join(vault, "Ulamki", "fractions-meaning.md"),
  "utf8",
);

function fixture(
  files: Record<string, string>,
  check: (directory: string) => void,
) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "omnimatma-vault-test-"),
  );
  try {
    for (const [name, content] of Object.entries(files)) {
      const destination = path.join(directory, name);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, content, "utf8");
    }
    check(directory);
  } finally {
    // Only remove this test's isolated, newly created directory.
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

// Remove the forward link so the lesson can stand alone in malformed fixtures.
const standalone = source.replace(
  "[[Skracanie i rozszerzanie ułamków]]",
  "następna lekcja",
);

test("vault contains 60 atomic lessons with four modes, examples and valid KaTeX", () => {
  const lessons = getLessons();
  assert.equal(lessons.length, 60);
  const ids = new Set(lessons.map((lesson) => lesson.id));
  assert.equal(ids.size, 60);
  for (const category of [
    "Ułamki",
    "Macierze",
    "Liczby zespolone",
    "Matura · Liczby i algebra",
    "Matura · Funkcje i ciągi",
    "Matura · Geometria i dane",
  ])
    assert.equal(
      lessons.filter((lesson) => lesson.category === category).length,
      10,
    );
  for (const lesson of lessons) {
    assert.equal(lesson.generatorId, lesson.id);
    assert.ok(lesson.title && lesson.description && lesson.content);
    assert.ok(
      lesson.example.includes("**Krok 1:**") &&
        lesson.example.includes("**Wynik:**"),
    );
    assert.ok(lesson.pitfalls.length > 30);
    assert.ok(lesson.minutes > 0);
    Object.values(lesson.modes).forEach((mode) => assert.ok(mode.length > 50));
    lesson.prerequisites.forEach((id) =>
      assert.ok(ids.has(id), `unresolved ${id}`),
    );
    assert.doesNotThrow(() =>
      katex.renderToString(lesson.formula, { throwOnError: true }),
    );
    for (const match of lesson.content.matchAll(
      /\$\$([\s\S]*?)\$\$|(?<!\$)\$([^$\n]+)\$(?!\$)/g,
    )) {
      assert.doesNotThrow(
        () =>
          katex.renderToString(match[1] ?? match[2], { throwOnError: true }),
        `${lesson.id}: ${match[0]}`,
      );
    }
  }
  assert.deepEqual(
    lessons.find((lesson) => lesson.id === "fractions-add")!.prerequisites,
    ["fractions-common"],
  );
});

test("recursive loader and optional formula fallback", () => {
  const text = standalone.replace(/^formula:.*\r?\n/m, "");
  fixture({ "nested/lesson.md": text }, (directory) => {
    assert.equal(getLessons(directory)[0].formula, "\\frac ab=a\\div b");
  });
});

test("empty vault and invalid formula fail clearly; lessons are topologically ordered", () => {
  fixture({}, (directory) => assert.throws(() => getLessons(directory), /no lessons/));
  fixture({ "bad.md": standalone.replace(/^formula:.*$/m, "formula: '\\notARealCommand'") },
    (directory) => assert.throws(() => getLessons(directory), /invalid KaTeX/));
  const lessons = getLessons();
  assert.equal(lessons[0].id, 'fractions-meaning');
  lessons.forEach((lesson, index) => lesson.prerequisites.forEach(id =>
    assert.ok(lessons.findIndex(prerequisite => prerequisite.id === id) < index)));
});

test("duplicate lesson IDs have a clear error", () => {
  fixture({ "a.md": standalone, "nested/b.md": standalone }, (directory) =>
    assert.throws(
      () => getLessons(directory),
      /duplicate ID fractions-meaning/,
    ),
  );
});

test("invalid YAML and duplicate YAML keys are rejected", () => {
  for (const text of [
    standalone.replace("id: fractions-meaning", "id: [unterminated"),
    standalone.replace(
      "id: fractions-meaning",
      "id: fractions-meaning\nid: fractions-add",
    ),
  ]) {
    fixture({ "bad.md": text }, (directory) =>
      assert.throws(() => getLessons(directory), /invalid YAML/),
    );
  }
});

test("invalid metadata, missing sections, unknown links and mismatched generators fail", () => {
  const cases: [string, RegExp][] = [
    [
      standalone.replace("poziom: podstawowka", "poziom: unknown"),
      /invalid poziom/,
    ],
    [
      standalone.replace(
        "generator_id: fractions-meaning",
        "generator_id: fractions-add",
      ),
      /generator_id must match/,
    ],
    [
      standalone.replace("wymagane_wczesniej: []", "wymagane_wczesniej: nope"),
      /array of wikilinks/,
    ],
    [
      standalone.replace("## 7. Tryb wizualny", "## Tryb wizualny"),
      /section 7/,
    ],
    [standalone + "\n[[Nieistniejąca lekcja]]", /unresolved wikilink/],
    [standalone.replace("minutes: 5", "minutes: -1"), /positive integer/],
    [
      standalone.replace("tytul: Pojęcie ułamka zwykłego", "tytul: 123"),
      /nonempty string: tytul/,
    ],
    [
      standalone.replace(/^---[\s\S]*?---\r?\n/, ""),
      /missing YAML frontmatter/,
    ],
  ];
  for (const [text, expected] of cases)
    fixture({ "bad.md": text }, (directory) =>
      assert.throws(() => getLessons(directory), expected),
    );
});

test("prerequisite cycles are rejected; ordinary related links may point forward", () => {
  const a = standalone.replace(
    "wymagane_wczesniej: []",
    "wymagane_wczesniej: ['[[fractions-add]]']",
  );
  const b = standalone
    .replace(/fractions-meaning/g, "fractions-add")
    .replace(/Pojęcie ułamka zwykłego/g, "Dodawanie testowe")
    .replace(
      "wymagane_wczesniej: []",
      "wymagane_wczesniej: ['[[fractions-meaning]]']",
    );
  fixture({ "a.md": a, "b.md": b }, (directory) =>
    assert.throws(() => getLessons(directory), /circular prerequisites/),
  );
  fixture(
    { "a.md": standalone + "\n[[fractions-add]]", "b.md": b },
    (directory) => assert.equal(getLessons(directory).length, 2),
  );
});
