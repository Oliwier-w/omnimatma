import { localDay, sanitizeProgress, type Progress } from "./progress";

/**
 * Strict, versioned backup format for progress.
 *
 * Envelope: `{ app: "omnimatma", version: 1, exportedAt, progress }`.
 * Legacy exports that are a bare (raw) Progress object are still accepted as
 * long as they validate. Nothing is ever silently reset: every invalid file
 * throws a Polish `Error` so the caller can show the reason to the user.
 */
export const BACKUP_APP = "omnimatma";
export const BACKUP_VERSION = 1;
/** Maximum UTF-8 file size accepted by the importer. */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
/** A lesson counts as completed once the learner solved five of its tasks. */
export const COMPLETED_THRESHOLD = 5;

export interface ProgressBackup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  progress: Progress;
}

export interface ProgressSummary {
  xp: number;
  solved: number;
  completed: number;
  awarded: number;
  activityDays: number;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Serializes progress into the versioned envelope. Throws on invalid input. */
export function exportProgressBackup(
  progress: Progress,
  now: Date | string = new Date(),
): string {
  const sanitized = sanitizeProgress(progress);
  if (!sanitized)
    throw new Error(
      "Nie można zapisać kopii zapasowej: dane postępu są nieprawidłowe.",
    );
  const date = now instanceof Date ? now : new Date(now);
  const exportedAt = Number.isFinite(date.getTime())
    ? date.toISOString()
    : new Date().toISOString();
  const backup: ProgressBackup = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt,
    progress: sanitized,
  };
  return JSON.stringify(backup);
}

/** Parses a backup file. Never returns partial data and never resets. */
export function parseProgressBackup(text: string): Progress {
  if (typeof text !== "string" || !text.length)
    throw new Error("Plik nie jest poprawnym plikiem JSON.");
  if (byteLength(text) > MAX_BACKUP_BYTES)
    throw new Error("Plik kopii zapasowej przekracza dozwolony limit 5 MB.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Plik nie jest poprawnym plikiem JSON.");
  }
  if (!isPlainRecord(parsed))
    throw new Error("Plik nie zawiera danych postępu OmniMatma.");
  if ("app" in parsed || "version" in parsed) return parseEnvelope(parsed);
  const legacy = sanitizeProgress(parsed);
  if (!legacy)
    throw new Error("Dane postępu w pliku są uszkodzone lub nieprawidłowe.");
  return legacy;
}

function parseEnvelope(parsed: Record<string, unknown>): Progress {
  if (parsed.app !== BACKUP_APP)
    throw new Error("Plik nie jest kopią zapasową OmniMatma.");
  const version = parsed.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1)
    throw new Error("Plik ma nieprawidłowy numer wersji kopii zapasowej.");
  if (version !== BACKUP_VERSION)
    throw new Error(
      `Nieobsługiwana wersja kopii zapasowej: ${version}. Obsługiwana wersja: ${BACKUP_VERSION}.`,
    );
  const progress = sanitizeProgress(parsed.progress);
  if (!progress)
    throw new Error("Dane postępu w pliku są uszkodzone lub nieprawidłowe.");
  return progress;
}

/** Suggested file name, e.g. `omnimatma-postepy-2026-10-26.json`. */
export function backupFileName(now: Date = new Date()): string {
  return `omnimatma-postepy-${localDay(now)}.json`;
}

/** Counts used by the import preview before the user confirms anything. */
export function progressSummary(progress: Progress): ProgressSummary {
  const counts = Object.values(progress.solved);
  return {
    xp: progress.xp,
    solved: counts.reduce((total, count) => total + count, 0),
    completed: counts.filter((count) => count >= COMPLETED_THRESHOLD).length,
    awarded: progress.awarded.length,
    activityDays: progress.activity.length,
  };
}
