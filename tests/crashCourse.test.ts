import test from "node:test";
import assert from "node:assert/strict";
import { getLessons } from "../src/lib/vaultParser";
import {
  CRASH_CORE_IDS,
  buildCrashCourse,
  buildCrashTest,
  getCrashCategories,
} from "../src/lib/crashCourse";
import { checkProblemAnswer, GENERATOR_IDS } from "../src/generators";

const lessons = getLessons();
const categories = getCrashCategories(lessons);

test("crash review resolves twelve real core lessons in three real categories", () => {
  assert.equal(categories.length, 3);
  const groups = buildCrashCourse(lessons, categories);
  assert.equal(groups.length, 3);
  assert.equal(groups.flatMap((group) => group.lessons).length, 12);
  assert.equal(new Set(CRASH_CORE_IDS).size, 12);
  for (const group of groups) {
    assert.equal(group.lessons.length, 4);
    for (const lesson of group.lessons) {
      assert.ok(
        lessons.includes(lesson),
        "uses original lesson definitions, not fabricated content",
      );
      assert.equal(lesson.category, group.category);
      assert.ok(lesson.formula && lesson.pitfalls && lesson.modes.academic);
      assert.ok(
        (GENERATOR_IDS as readonly string[]).includes(lesson.generatorId),
      );
    }
  }
});

test("selection is validated, deduplicated and safe when cleared or data is absent", () => {
  assert.deepEqual(buildCrashCourse(lessons, []), []);
  assert.deepEqual(getCrashCategories([]), []);
  assert.deepEqual(buildCrashCourse([], []), []);
  assert.throws(() => buildCrashCourse(lessons, ["unknown"]));
  assert.throws(() => buildCrashTest(lessons, [], 1));
  assert.throws(() => buildCrashTest(lessons, ["unknown"], 1));
  assert.throws(() => buildCrashTest(lessons, categories, Infinity));
  assert.equal(
    buildCrashCourse(lessons, [categories[0], categories[0]]).length,
    1,
  );
  assert.deepEqual(
    buildCrashCourse([...lessons].reverse(), [...categories].reverse()),
    buildCrashCourse(lessons, categories),
  );
});

test("quick test is seeded, balanced across every selected category and uses distinct core topics", () => {
  for (let mask = 1; mask < 8; mask++) {
    const selection = categories.filter((_, i) => mask & (1 << i));
    for (const seed of [0, 1, 42, -100, 4294967295]) {
      const items = buildCrashTest(lessons, selection, seed);
      assert.deepEqual(items, buildCrashTest(lessons, selection, seed));
      assert.deepEqual(
        items,
        buildCrashTest(lessons, [...selection].reverse(), seed),
      );
      assert.equal(items.length, selection.length * 2);
      assert.ok(items.length <= 6);
      for (const category of selection) {
        const slice = items.filter((item) => item.lesson.category === category);
        assert.equal(slice.length, 2);
        assert.equal(new Set(slice.map((item) => item.lesson.id)).size, 2);
      }
      for (const { lesson, problem } of items) {
        assert.ok((CRASH_CORE_IDS as readonly string[]).includes(lesson.id));
        assert.equal(problem.generatorId, lesson.generatorId);
        assert.equal(problem.difficulty, 2);
        assert.ok(problem.prompt && problem.latex && problem.answer);
        assert.ok(problem.hints.length >= 3 && problem.steps.length >= 3);
        assert.ok(checkProblemAnswer(problem, problem.answer).correct);
        assert.equal(checkProblemAnswer(problem, "").correct, false);
      }
    }
  }
});

test("new seeds vary the sampled topics and problems without modifying lessons", () => {
  const before = JSON.stringify(lessons);
  const signatures = new Set(
    Array.from({ length: 16 }, (_, seed) =>
      JSON.stringify(buildCrashTest(lessons, categories, seed)),
    ),
  );
  assert.equal(signatures.size, 16);
  const covered = new Set(
    Array.from({ length: 40 }, (_, seed) =>
      buildCrashTest(lessons, categories, seed),
    )
      .flat()
      .map((item) => item.lesson.id),
  );
  assert.deepEqual([...covered].sort(), [...CRASH_CORE_IDS].sort());
  assert.equal(JSON.stringify(lessons), before);
});
