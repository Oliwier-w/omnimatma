import assert from "node:assert/strict";
import test from "node:test";
import { isReviewDue, scheduleReview } from "../src/lib/review";

const now = "2026-10-25T12:00:00.000Z";

test("new success schedules tomorrow without mutating the supplied date", () => {
  const date = new Date(now);
  const result = scheduleReview(null, date, true);
  assert.equal(result.intervalDays, 1);
  assert.equal(result.repetitions, 1);
  assert.equal(result.dueAt, "2026-10-26T12:00:00.000Z");
  assert.equal(date.toISOString(), now);
});

test("successes expand intervals, failure resets without mutating prior state", () => {
  const first = scheduleReview(null, now, true);
  const snapshot = { ...first };
  const second = scheduleReview(first, first.dueAt, true);
  const third = scheduleReview(second, second.dueAt, true);
  assert.equal(second.intervalDays, 3);
  assert.ok(third.intervalDays > second.intervalDays);
  const failed = scheduleReview(third, third.dueAt, false);
  assert.equal(failed.intervalDays, 1);
  assert.equal(failed.repetitions, 0);
  assert.ok(failed.ease < third.ease);
  assert.deepEqual(first, snapshot);
});

test("due check includes equality, unseen and malformed records", () => {
  const result = scheduleReview(null, now, true);
  assert.equal(isReviewDue(result, now), false);
  assert.equal(isReviewDue(result, result.dueAt), true);
  assert.equal(isReviewDue(null, now), true);
  assert.equal(isReviewDue({ dueAt: "broken" }, now), true);
});

test("schedule stays bounded and rejects invalid clock values", () => {
  let review = scheduleReview(null, now, true);
  for (let i = 0; i < 50; i++)
    review = scheduleReview(review, review.dueAt, true);
  assert.equal(review.intervalDays, 365);
  assert.ok(review.ease <= 3);
  for (let i = 0; i < 50; i++)
    review = scheduleReview(review, review.dueAt, false);
  assert.ok(review.ease >= 1.3);
  assert.throws(() => scheduleReview(null, "invalid", true), RangeError);
  assert.throws(() => isReviewDue(null, "invalid"), RangeError);
});
