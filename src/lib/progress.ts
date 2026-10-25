import { scheduleReview, type ReviewSchedule } from "./review";
export type ReviewEntry = ReviewSchedule;
export interface Progress {
  xp: number;
  solved: Record<string, number>;
  awarded: string[];
  activity: string[];
  reviews: Record<string, ReviewEntry>;
  theme: string;
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
export function loadProgress(value: string | null): Progress {
  if (!value) return emptyProgress;
  try {
    const p = JSON.parse(value);
    if (
      !p ||
      !Number.isFinite(p.xp) ||
      p.xp < 0 ||
      typeof p.solved !== "object" ||
      !p.solved ||
      !Object.values(p.solved).every(
        (v) => Number.isSafeInteger(v) && Number(v) >= 0,
      ) ||
      !Array.isArray(p.awarded) ||
      !p.awarded.every((v: unknown) => typeof v === "string") ||
      !Array.isArray(p.activity) ||
      !p.activity.every((v: unknown) => typeof v === "string") ||
      !p.reviews ||
      typeof p.reviews !== "object" ||
      !Object.values(p.reviews).every((v: unknown) => {
        const r = v as ReviewEntry;
        return (
          r &&
          typeof r.dueAt === "string" &&
          Number.isFinite(Date.parse(r.dueAt)) &&
          typeof r.lastReviewedAt === "string" &&
          Number.isFinite(Date.parse(r.lastReviewedAt)) &&
          Number.isFinite(r.intervalDays) &&
          r.intervalDays >= 1 &&
          Number.isFinite(r.repetitions) &&
          Number.isFinite(r.ease)
        );
      })
    )
      return emptyProgress;
    return {
      ...emptyProgress,
      ...p,
      theme: ["space", "paper", "neon", "matcha", "contrast"].includes(p.theme)
        ? p.theme
        : "space",
    };
  } catch {
    return emptyProgress;
  }
}
