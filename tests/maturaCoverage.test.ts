import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";
import { GENERATOR_IDS, generateProblem } from "../src/generators";
import { getLessons } from "../src/lib/vaultParser";

/** Every task type from the CKE August 2026 basic-level paper has its own lesson. */
const sourceTasks = [
  ["matura-liczby-pierwiastki", "Matura · Liczby i algebra"],
  ["matura-liczby-potegi", "Matura · Liczby i algebra"],
  ["matura-liczby-logarytmy", "Matura · Liczby i algebra"],
  ["matura-liczby-wzory-skrocone", "Matura · Liczby i algebra"],
  ["matura-liczby-podzielnosc", "Matura · Liczby i algebra"],
  ["matura-liczby-nierownosc-liniowa", "Matura · Liczby i algebra"],
  ["matura-liczby-rownanie-iloczynowe", "Matura · Liczby i algebra"],
  ["matura-liczby-wyrazenia-wymierne", "Matura · Liczby i algebra"],
  ["matura-liczby-nierownosc-kwadratowa", "Matura · Liczby i algebra"],
  ["matura-liczby-uklad-rownan", "Matura · Liczby i algebra"],
  ["matura-funkcje-przedzialami", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-liniowa", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-kwadratowa", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-ciag-geometryczny", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-ciag-arytmetyczny", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-ciag-trzywyrazowy", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-trygonometria", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-katy-okregu", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-trapez", "Matura · Funkcje i ciągi"],
  ["matura-funkcje-trojkat-prostokatny", "Matura · Funkcje i ciągi"],
  ["matura-geometria-podobienstwo", "Matura · Geometria i dane"],
  ["matura-geometria-prosta", "Matura · Geometria i dane"],
  ["matura-geometria-okrag", "Matura · Geometria i dane"],
  ["matura-geometria-proste-rownolegle", "Matura · Geometria i dane"],
  ["matura-geometria-graniastoslup", "Matura · Geometria i dane"],
  ["matura-geometria-ostroslup-kat", "Matura · Geometria i dane"],
  ["matura-geometria-ostroslup-krawedzie", "Matura · Geometria i dane"],
  ["matura-geometria-prawdopodobienstwo", "Matura · Geometria i dane"],
  ["matura-geometria-statystyka", "Matura · Geometria i dane"],
  ["matura-geometria-optymalizacja", "Matura · Geometria i dane"],
] as const;

test("all 30 CKE 2026 task types have a matching lesson and generator", () => {
  const lessons = getLessons();
  for (const [id, category] of sourceTasks) {
    const lesson = lessons.find((item) => item.id === id);
    assert.ok(lesson, `missing lesson ${id}`);
    assert.equal(lesson.category, category);
    assert.equal(lesson.generatorId, id);
    assert.equal(lesson.level, "liceum");
    assert.ok(
      (GENERATOR_IDS as readonly string[]).includes(id),
      `missing generator ${id}`,
    );
  }
  assert.equal(
    new Set(sourceTasks.map(([id]) => id)).size,
    sourceTasks.length,
  );
  for (const [id] of sourceTasks) {
    for (const level of [1, 3, 5]) {
      const problem = generateProblem(id, level, 42);
      assert.ok(problem.prompt.length > 20, `${id}: short prompt`);
      assert.ok(problem.answer.length > 0, `${id}: empty answer`);
      assert.doesNotThrow(
        () =>
          katex.renderToString(problem.latex, {
            throwOnError: true,
            trust: false,
          }),
        `${id}: invalid KaTeX`,
      );
    }
  }
});
