/** A small, deterministic SM-2-inspired scheduler. Dates are UTC instants. */
export interface ReviewSchedule {
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  ease: number;
  lastReviewedAt: string;
}

const DAY = 86_400_000;

function validDate(value: Date | string): Date {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new RangeError("Invalid review date");
  return date;
}

/** A failed recall restarts at one day; successful recalls expand up to a year. */
export function scheduleReview(
  previous: ReviewSchedule | null | undefined,
  givenDate: Date | string,
  success: boolean,
): ReviewSchedule {
  const date = validDate(givenDate);
  const previousEase = Number.isFinite(previous?.ease) ? previous!.ease : 2.5;
  const ease = Math.min(
    3,
    Math.max(1.3, previousEase + (success ? 0.1 : -0.2)),
  );
  const oldRepetitions = Math.max(0, Math.floor(previous?.repetitions || 0));
  const repetitions = success ? oldRepetitions + 1 : 0;
  const intervalDays =
    !success || repetitions === 1
      ? 1
      : repetitions === 2
        ? 3
        : Math.min(
            365,
            Math.max(1, Math.round((previous?.intervalDays || 3) * ease)),
          );
  return {
    dueAt: new Date(date.getTime() + intervalDays * DAY).toISOString(),
    intervalDays,
    repetitions,
    ease,
    lastReviewedAt: date.toISOString(),
  };
}

/** Unseen lessons are due. The boundary is inclusive. */
export function isReviewDue(
  review: Pick<ReviewSchedule, "dueAt"> | null | undefined,
  givenDate: Date | string = new Date(),
): boolean {
  const now = validDate(givenDate).getTime();
  if (!review) return true;
  const due = new Date(review.dueAt).getTime();
  return !Number.isFinite(due) || due <= now;
}
