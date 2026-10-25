import type { Lesson } from "./lesson";
import { generateProblem, type Problem } from "../generators";
import { random } from "../generators/shared";

/** A deliberately small foundational review, not an estimate of exam frequency. */
export const CRASH_CORE_IDS = [
  "fractions-common",
  "fractions-add",
  "fractions-multiply",
  "fractions-divide",
  "matrix-multiply",
  "matrix-det",
  "matrix-inverse",
  "matrix-equation",
  "complex-multiply",
  "complex-divide",
  "complex-modulus",
  "complex-equation",
] as const;

export type CrashGroup = { category: string; lessons: Lesson[] };
export type CrashQuestion = { lesson: Lesson; problem: Problem };

export function getCrashCategories(lessons: Lesson[]): string[] {
  return [
    ...new Set(
      CRASH_CORE_IDS.flatMap((id) => {
        const lesson = lessons.find((item) => item.id === id);
        return lesson ? [lesson.category] : [];
      }),
    ),
  ];
}

export function buildCrashCourse(
  lessons: Lesson[],
  selected: string[],
): CrashGroup[] {
  const categories = getCrashCategories(lessons);
  if (selected.some((category) => !categories.includes(category)))
    throw new Error("Nieznany dział powtórki.");
  return categories
    .filter((category) => selected.includes(category))
    .map((category) => ({
      category,
      lessons: CRASH_CORE_IDS.flatMap((id) => {
        const lesson = lessons.find(
          (item) => item.id === id && item.category === category,
        );
        return lesson ? [lesson] : [];
      }),
    }));
}

/** Two distinct core topics per category; deterministic given the data and seed. */
export function buildCrashTest(
  lessons: Lesson[],
  selected: string[],
  seed: number,
): CrashQuestion[] {
  if (!Number.isSafeInteger(seed))
    throw new Error("Nieprawidłowe ziarno testu.");
  const groups = buildCrashCourse(lessons, selected);
  if (!groups.length) throw new Error("Wybierz co najmniej jeden dział.");
  const rng = random(seed);
  return groups.flatMap((group) => {
    const pool = [...group.lessons];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rng(0, i);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 2).map((lesson) => ({
      lesson,
      problem: generateProblem(lesson.generatorId, 2, rng(0, 0xffffffff)),
    }));
  });
}
