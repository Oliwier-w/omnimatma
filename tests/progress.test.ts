import { test } from "node:test";
import assert from "node:assert/strict";
import {
  award,
  emptyProgress,
  loadProgress,
  streak,
  miss,
} from "../src/lib/progress";

test("XP is awarded once per problem and progress survives serialization", () => {
  const p = award(
    emptyProgress,
    "lesson",
    "p1",
    3,
    new Date("2026-10-25T12:00:00Z"),
  );
  assert.equal(p.xp, 30);
  assert.equal(p.solved.lesson, 1);
  assert.deepEqual(award(p, "lesson", "p1", 3), p);
  assert.deepEqual(loadProgress(JSON.stringify(p)), p);
});
test("many problems in one day do not advance the review schedule", () => {
  let p = emptyProgress;
  for (let i = 0; i < 20; i++)
    p = award(p, "lesson", `p${i}`, 1, new Date("2026-10-25T12:00:00Z"));
  assert.equal(p.reviews.lesson.intervalDays, 1);
  p = award(p, "lesson", "next-day", 1, new Date("2026-10-26T12:00:00Z"));
  assert.equal(p.reviews.lesson.intervalDays, 3);
  p = miss(p, "lesson", new Date("2026-10-26T12:01:00Z"));
  assert.equal(p.reviews.lesson.intervalDays, 1);
  assert.equal(p.reviews.lesson.repetitions, 0);
});
test("streak accepts yesterday but not a missed full day", () => {
  assert.equal(
    streak(["2026-10-24", "2026-10-23"], new Date("2026-10-25T12:00:00")),
    2,
  );
  assert.equal(streak(["2026-10-23"], new Date("2026-10-25T12:00:00")), 0);
  assert.equal(
    streak(["2026-10-25", "2026-10-24"], new Date("2026-10-25T12:00:00")),
    2,
  );
});
test("corrupt storage recovers to empty progress", () => {
  for (const value of [
    "{",
    "null",
    "{}",
    '{"xp":-1}',
    JSON.stringify({ ...emptyProgress, solved: { x: "bad" } }),
  ])
    assert.deepEqual(loadProgress(value), emptyProgress);
});
