import { scheduleReview, type ReviewSchedule } from "./review";
export type ReviewEntry = ReviewSchedule;
export interface Progress {
  xp: number;
  solved: Record<string, number>;
  awarded: string[];
  activity: string[];
  reviews: Record<string, ReviewEntry>;
  theme: string;
  /** Optional identity fields. Absent in saves made before they existed. */
  displayName?: string;
  /** Initials shown in the avatar. */
  initial?: string;
  /** Lesson the user wants to resume. */
  lastLessonId?: string;
}
export const emptyProgress: Progress = {
  xp: 0,
  solved: {},
  awarded: [],
  activity: [],
  reviews: {},
  theme: "space",
};
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function award(
  progress: Progress,
  lessonId: string,
  problemId: string,
  difficulty: number,
  now = new Date(),
): Progress {
  if (progress.awarded.includes(problemId)) return progress;
  const day = localDay(now);
  const previous = progress.reviews[lessonId];
  // A session with many exercises must not advance months into the future.
  const review =
    previous && localDay(new Date(previous.lastReviewedAt)) === day
      ? previous
      : scheduleReview(previous, now, true);
  return {
    ...progress,
    xp: progress.xp + 10 * difficulty,
    solved: {
      ...progress.solved,
      [lessonId]: (progress.solved[lessonId] ?? 0) + 1,
    },
    awarded: [...progress.awarded, problemId],
    activity: [...new Set([...progress.activity, day])].slice(-366),
    reviews: { ...progress.reviews, [lessonId]: review },
  };
}
export function miss(
  progress: Progress,
  lessonId: string,
  now = new Date(),
): Progress {
  return {
    ...progress,
    reviews: {
      ...progress.reviews,
      [lessonId]: scheduleReview(progress.reviews[lessonId], now, false),
    },
  };
}
export function streak(days: string[], now = new Date()) {
  const dates = new Set(days);
  const current = new Date(now);
  if (!dates.has(localDay(current))) current.setDate(current.getDate() - 1);
  let count = 0;
  while (dates.has(localDay(current))) {
    count++;
    current.setDate(current.getDate() - 1);
  }
  return count;
}
export const PROGRESS_THEMES = [
  "space",
  "paper",
  "neon",
  "matcha",
  "contrast",
] as const;

/**
 * Bounds are intentionally generous so every legitimately saved progress from
 * older releases keeps loading, while absurd payloads from hand-edited or
 * hostile files are rejected instead of silently half-applied.
 */
const MAX_XP = 100_000_000;
const MAX_ENTRIES = 100_000;
const MAX_SOLUTIONS = 100_000;
const MAX_ACTIVITY_DAYS = 1_000;
const MAX_ID_LENGTH = 300;
const MAX_LESSON_ID_LENGTH = 200;
const MAX_NAME_LENGTH = 60;
const MAX_INITIAL_LENGTH = 8;
const MAX_REVIEW_INTERVAL = 366;
const MAX_REVIEW_REPETITIONS = 1_000_000;
const MIN_REVIEW_EASE = 0.5;
const MAX_REVIEW_EASE = 10;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Rejects arrays, class instances and anything that is not a plain record. */
function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Rejects prototype-polluting keys such as `__proto__` or `constructor`. */
function hasSafeKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).every(
    (key) =>
      key.length > 0 && key.length <= MAX_ID_LENGTH && !FORBIDDEN_KEYS.has(key),
  );
}

function isCount(value: unknown, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= max
  );
}

function isStringOf(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

/** Trims and validates optional identity text; invalid input is dropped. */
function optionalText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text.length > max) return undefined;
  return text;
}

function cloneSolved(
  value: Record<string, unknown>,
): Record<string, number> | null {
  const result: Record<string, number> = {};
  for (const [key, count] of Object.entries(value)) {
    if (key.length === 0 || key.length > MAX_LESSON_ID_LENGTH) return null;
    if (!isCount(count, MAX_SOLUTIONS)) return null;
    result[key] = count;
  }
  return result;
}

function cloneReview(value: unknown): ReviewEntry | null {
  if (!isPlainRecord(value)) return null;
  if (Object.keys(value).some((key) => FORBIDDEN_KEYS.has(key))) return null;
  const { dueAt, lastReviewedAt, intervalDays, repetitions, ease } = value;
  if (
    typeof dueAt !== "string" ||
    !Number.isFinite(Date.parse(dueAt)) ||
    typeof lastReviewedAt !== "string" ||
    !Number.isFinite(Date.parse(lastReviewedAt)) ||
    typeof intervalDays !== "number" ||
    !Number.isFinite(intervalDays) ||
    intervalDays < 1 ||
    intervalDays > MAX_REVIEW_INTERVAL ||
    !isCount(repetitions, MAX_REVIEW_REPETITIONS) ||
    typeof ease !== "number" ||
    !Number.isFinite(ease) ||
    ease < MIN_REVIEW_EASE ||
    ease > MAX_REVIEW_EASE
  )
    return null;
  return { dueAt, lastReviewedAt, intervalDays, repetitions, ease };
}

/**
 * Rebuilds a Progress from untrusted data by copying only the explicit known
 * fields. Unknown keys are dropped, records must be plain (never arrays) and
 * must not carry prototype keys. Returns null when the payload is not a
 * trustworthy progress record at all.
 */
export function sanitizeProgress(input: unknown): Progress | null {
  if (!isPlainRecord(input) || !hasSafeKeys(input)) return null;
  const { xp, solved, awarded, activity, reviews, theme } = input;
  if (!isCount(xp, MAX_XP)) return null;
  if (!isPlainRecord(solved) || !hasSafeKeys(solved)) return null;
  const cleanSolved = cloneSolved(solved);
  if (!cleanSolved) return null;
  if (!Array.isArray(awarded) || awarded.length > MAX_ENTRIES) return null;
  if (!awarded.every((value) => isStringOf(value, MAX_ID_LENGTH))) return null;
  if (!Array.isArray(activity) || activity.length > MAX_ACTIVITY_DAYS)
    return null;
  if (
    !activity.every(
      (value) => typeof value === "string" && DAY_PATTERN.test(value),
    )
  )
    return null;
  if (!isPlainRecord(reviews) || !hasSafeKeys(reviews)) return null;
  const entries = Object.entries(reviews);
  if (entries.length > MAX_ENTRIES) return null;
  const cleanReviews: Record<string, ReviewEntry> = {};
  for (const [key, raw] of entries) {
    if (key.length === 0 || key.length > MAX_LESSON_ID_LENGTH) return null;
    const review = cloneReview(raw);
    if (!review) return null;
    cleanReviews[key] = review;
  }
  const progress: Progress = {
    xp,
    solved: cleanSolved,
    awarded: [...awarded],
    activity: [...activity],
    reviews: cleanReviews,
    theme:
      typeof theme === "string" &&
      PROGRESS_THEMES.some((known) => known === theme)
        ? theme
        : emptyProgress.theme,
  };
  const displayName = optionalText(input.displayName, MAX_NAME_LENGTH);
  if (displayName !== undefined) progress.displayName = displayName;
  const initial = optionalText(input.initial, MAX_INITIAL_LENGTH);
  if (initial !== undefined) progress.initial = initial;
  const lastLessonId = optionalText(input.lastLessonId, MAX_LESSON_ID_LENGTH);
  if (lastLessonId !== undefined && !FORBIDDEN_KEYS.has(lastLessonId))
    progress.lastLessonId = lastLessonId;
  return progress;
}

/** Storage stays lenient: unreadable saves recover to a clean slate. */
export function loadProgress(value: string | null): Progress {
  if (!value) return emptyProgress;
  try {
    return sanitizeProgress(JSON.parse(value)) ?? emptyProgress;
  } catch {
    return emptyProgress;
  }
}
