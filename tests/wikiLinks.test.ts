import assert from "node:assert/strict";
import test from "node:test";
import { getLessons } from "../src/lib/vaultParser";
import {
  createLessonLookup,
  parseWikiLink,
  previewDefinition,
  tokenizeLessonText,
} from "../src/lib/wikiLinks";

test("wikilink resolution supports titles, IDs, basenames, labels and headings", () => {
  const lessons = getLessons();
  const lookup = createLessonLookup(lessons);
  assert.deepEqual(parseWikiLink("[[fractions-add#Definicja|dodawanie]]"), {
    target: "fractions-add",
    label: "dodawanie",
  });
  assert.equal(lookup.get("Dodawanie ułamków")?.id, "fractions-add");
  assert.equal(lookup.get("fractions-add")?.id, "fractions-add");
  const custom = { ...lessons[0], aliases: ["Nazwa pliku"] };
  assert.equal(createLessonLookup([custom]).get("Nazwa pliku")?.id, custom.id);
  assert.equal(lookup.get("Brakująca notatka"), undefined);
  assert.throws(
    () =>
      createLessonLookup([custom, { ...lessons[1], aliases: ["Nazwa pliku"] }]),
    /Ambiguous/,
  );
});
test("tokenizer preserves math, labelled wiki references, bold and text without rendering HTML", () => {
  const tokens = tokenizeLessonText(
    "Sprawdź **[[fractions-add|sumę]]** i $a/b$.\n$$x^2$$ <img src=x>",
  );
  assert.equal(
    tokens.find((t) => t.kind === "strong")?.value,
    "[[fractions-add|sumę]]",
  );
  assert.equal(tokens.find((t) => t.kind === "math")?.value, "a/b");
  assert.equal(tokens.find((t) => t.kind === "displayMath")?.value, "x^2");
  assert.ok(
    tokens.some((t) => t.kind === "text" && t.value.includes("<img src=x>")),
  );
  assert.equal(tokenizeLessonText("[[name|$x$]]")[0].kind, "wiki");
  assert.equal(tokenizeLessonText("niedomknięte [[pojęcie")[0].kind, "text");
});
test("every preview uses a real academic definition and formula; related note text is exposed", () => {
  for (const lesson of getLessons()) {
    assert.ok(previewDefinition(lesson).length > 20);
    assert.ok(lesson.modes.academic.includes(previewDefinition(lesson)));
    assert.ok(lesson.formula.length > 0);
    assert.ok(lesson.related?.includes("[["));
  }
});
