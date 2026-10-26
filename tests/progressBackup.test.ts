import { test } from "node:test";
import assert from "node:assert/strict";
import {
  award,
  emptyProgress,
  loadProgress,
  sanitizeProgress,
  type Progress,
} from "../src/lib/progress";
import {
  BACKUP_APP,
  BACKUP_VERSION,
  MAX_BACKUP_BYTES,
  backupFileName,
  exportProgressBackup,
  parseProgressBackup,
  progressSummary,
} from "../src/lib/progressBackup";

const DAY = new Date("2026-10-25T12:00:00Z");
const EXPORTED_AT = "2026-10-26T09:30:00.000Z";

/** Five solved tasks in one lesson plus one harder task in another. */
function sampleProgress(): Progress {
  let progress: Progress = {
    ...emptyProgress,
    displayName: "Zosia",
    initial: "Z",
    lastLessonId: "ulamki-pojecie",
  };
  for (let i = 0; i < 5; i++)
    progress = award(progress, "ulamki-pojecie", `ulamki-${i}`, 1, DAY);
  return award(progress, "macierze-dodawanie", "macierze-1", 3, DAY);
}

function envelope(
  progress: unknown,
  version: unknown = BACKUP_VERSION,
  app: unknown = BACKUP_APP,
): string {
  return JSON.stringify({
    app,
    version,
    exportedAt: EXPORTED_AT,
    progress,
  });
}

test("backup round trip keeps every field inside a versioned envelope", () => {
  const progress = sampleProgress();
  const text = exportProgressBackup(progress, new Date(EXPORTED_AT));
  const parsed = JSON.parse(text) as Record<string, unknown>;
  assert.equal(parsed.app, BACKUP_APP);
  assert.equal(parsed.version, BACKUP_VERSION);
  assert.equal(parsed.exportedAt, EXPORTED_AT);
  assert.deepEqual(parsed.progress, sanitizeProgress(progress));
  assert.deepEqual(parseProgressBackup(text), progress);
});

test("legacy raw progress exports still import when they validate", () => {
  assert.deepEqual(parseProgressBackup(JSON.stringify(sampleProgress())), sampleProgress());
  assert.deepEqual(parseProgressBackup(JSON.stringify(emptyProgress)), emptyProgress);
});

test("invalid backup files throw a clear Polish error and never reset", () => {
  const cases: Array<[string, RegExp]> = [
    ["{", /nie jest poprawnym plikiem JSON/],
    ["", /nie jest poprawnym plikiem JSON/],
    ["null", /nie zawiera danych postępu/],
    ["[]", /nie zawiera danych postępu/],
    ["{}", /uszkodzone lub nieprawidłowe/],
    [envelope([sampleProgress()]), /uszkodzone lub nieprawidłowe/],
    [envelope(sampleProgress(), 2), /Nieobsługiwana wersja kopii zapasowej: 2/],
    [envelope(sampleProgress(), 0), /nieprawidłowy numer wersji/],
    [envelope(sampleProgress(), 1.5), /nieprawidłowy numer wersji/],
    [envelope(sampleProgress(), "1"), /nieprawidłowy numer wersji/],
    [
      envelope(sampleProgress(), undefined, "inna-aplikacja"),
      /nie jest kopią zapasową OmniMatma/,
    ],
    [envelope({ ...emptyProgress, xp: "sto" }), /uszkodzone lub nieprawidłowe/],
    [envelope({ ...emptyProgress, xp: -10 }), /uszkodzone lub nieprawidłowe/],
    [envelope(null), /uszkodzone lub nieprawidłowe/],
  ];
  for (const [text, pattern] of cases)
    assert.throws(() => parseProgressBackup(text), pattern, `case: ${text.slice(0, 60)}`);
});

test("files above the 5 MB limit are rejected before parsing", () => {
  assert.throws(
    () => parseProgressBackup("x".repeat(MAX_BACKUP_BYTES + 1)),
    /limit 5 MB/,
  );
  assert.equal(MAX_BACKUP_BYTES, 5 * 1024 * 1024);
  assert.doesNotThrow(() => parseProgressBackup(exportProgressBackup(sampleProgress())));
});

test("arrays are never treated as progress records", () => {
  assert.equal(sanitizeProgress([sampleProgress()]), null);
  assert.equal(sanitizeProgress({ ...emptyProgress, solved: [1, 2] }), null);
  assert.equal(sanitizeProgress({ ...emptyProgress, reviews: [] }), null);
  assert.equal(sanitizeProgress({ ...emptyProgress, awarded: [1] }), null);
  assert.deepEqual(loadProgress(JSON.stringify([sampleProgress()])), emptyProgress);
  assert.deepEqual(loadProgress(JSON.stringify({ ...emptyProgress, activity: [1] })), emptyProgress);
});

test("prototype keys are rejected without polluting Object.prototype", () => {
  const nested = JSON.stringify({
    ...sampleProgress(),
    solved: JSON.parse('{"__proto__": 3}') as unknown,
  });
  const withProtoKey = envelope(JSON.parse(nested) as unknown);
  assert.throws(() => parseProgressBackup(withProtoKey), /uszkodzone lub nieprawidłowe/);

  const topLevel =
    '{"__proto__":{"polluted":true},"xp":0,"solved":{},"awarded":[],"activity":[],"reviews":{},"theme":"space"}';
  assert.equal(sanitizeProgress(JSON.parse(topLevel) as unknown), null);
  assert.deepEqual(loadProgress(topLevel), emptyProgress);
  assert.throws(() => parseProgressBackup(topLevel), /uszkodzone lub nieprawidłowe/);

  const pollutedReview = JSON.stringify({
    ...emptyProgress,
    reviews: JSON.parse(
      '{"ulamki":{"dueAt":"2026-10-26T00:00:00.000Z","lastReviewedAt":"2026-10-25T00:00:00.000Z","intervalDays":1,"repetitions":0,"ease":2.5,"constructor":"boom"}}',
    ) as unknown,
  });
  assert.equal(sanitizeProgress(JSON.parse(pollutedReview) as unknown), null);
  assert.equal(
    (Object.prototype as unknown as Record<string, unknown>).polluted,
    undefined,
  );
  assert.equal(
    ({} as Record<string, unknown>).polluted,
    undefined,
  );
});

test("non-finite and out-of-bounds numbers invalidate the payload", () => {
  const nonFinite =
    '{"xp":1e999,"solved":{},"awarded":[],"activity":[],"reviews":{},"theme":"space"}';
  assert.equal(sanitizeProgress(JSON.parse(nonFinite) as unknown), null);
  assert.deepEqual(loadProgress(nonFinite), emptyProgress);
  assert.throws(
    () => parseProgressBackup(envelope(JSON.parse(nonFinite) as unknown)),
    /uszkodzone lub nieprawidłowe/,
  );
  assert.equal(sanitizeProgress({ ...emptyProgress, xp: -1 }), null);
  assert.equal(sanitizeProgress({ ...emptyProgress, xp: 1.5 }), null);
  assert.equal(
    sanitizeProgress({
      ...emptyProgress,
      reviews: {
        ulamki: {
          dueAt: "2026-10-26T00:00:00.000Z",
          lastReviewedAt: "2026-10-25T00:00:00.000Z",
          intervalDays: 3,
          repetitions: 1,
          ease: Infinity,
        },
      },
    }),
    null,
  );
});

test("displayName, initial and lastLessonId survive save, load and backup", () => {
  const progress: Progress = {
    ...emptyProgress,
    displayName: "Ala",
    initial: "A",
    lastLessonId: "macierze-wyznacznik",
  };
  const loaded = loadProgress(JSON.stringify(progress));
  assert.equal(loaded.displayName, "Ala");
  assert.equal(loaded.initial, "A");
  assert.equal(loaded.lastLessonId, "macierze-wyznacznik");
  assert.deepEqual(parseProgressBackup(exportProgressBackup(progress)), progress);

  // Backwards compatibility: older saves simply do not carry these keys.
  const legacy = loadProgress(JSON.stringify(emptyProgress));
  assert.equal("displayName" in legacy, false);
  assert.equal("initial" in legacy, false);
  assert.equal("lastLessonId" in legacy, false);
  assert.deepEqual(parseProgressBackup(JSON.stringify(emptyProgress)), emptyProgress);

  // Damaged optional fields are dropped while the rest of the progress stays.
  const sanitized = sanitizeProgress({
    ...progress,
    displayName: 42,
    initial: "",
    lastLessonId: "   ",
    injected: "x",
  });
  assert.ok(sanitized);
  assert.equal("displayName" in sanitized, false);
  assert.equal("initial" in sanitized, false);
  assert.equal("lastLessonId" in sanitized, false);
  assert.equal("injected" in sanitized, false);
  assert.equal(sanitized.theme, "space");
});

test("sanitizing copies only explicit known fields", () => {
  const raw = JSON.parse(
    JSON.stringify({ ...sampleProgress(), injected: "x", nested: { a: 1 } }),
  ) as unknown;
  const clean = sanitizeProgress(raw);
  assert.ok(clean);
  assert.equal("injected" in clean, false);
  assert.equal("nested" in clean, false);
  assert.deepEqual(clean, sampleProgress());
  assert.equal(sanitizeProgress({ ...emptyProgress, theme: "chrome" })?.theme, "space");
});

test("import preview summary counts XP, completed topics and solved tasks", () => {
  const summary = progressSummary(sampleProgress());
  assert.equal(summary.xp, 80);
  assert.equal(summary.solved, 6);
  assert.equal(summary.completed, 1);
  assert.equal(summary.awarded, 6);
  assert.equal(summary.activityDays, 1);
  assert.equal(progressSummary(emptyProgress).completed, 0);
});

test("export refuses invalid progress and builds a dated file name", () => {
  assert.throws(
    () => exportProgressBackup({ ...emptyProgress, xp: -1 }),
    /dane postępu są nieprawidłowe/,
  );
  assert.equal(
    backupFileName(new Date(2026, 9, 26, 12, 0, 0)),
    "omnimatma-postepy-2026-10-26.json",
  );
});
