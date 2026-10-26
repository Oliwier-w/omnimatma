"use client";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import {
  Check,
  Download,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import { emptyProgress, streak, type Progress } from "@/lib/progress";
import {
  MAX_BACKUP_BYTES,
  backupFileName,
  exportProgressBackup,
  parseProgressBackup,
  progressSummary,
} from "@/lib/progressBackup";
import { useModalFocus } from "@/lib/useModalFocus";
import "./ProfileDialog.css";

const THEMES = [
  {
    id: "space",
    label: "Deep Space",
    hint: "Ciemność, która pomaga się skupić.",
  },
  {
    id: "paper",
    label: "Clean Paper",
    hint: "Ciepły papier i spokojny kontrast.",
  },
  { id: "neon", label: "Cyberpunk", hint: "Odrobina elektrycznej energii." },
  { id: "matcha", label: "Matcha", hint: "Zieleń i wolniejsze tempo." },
  {
    id: "contrast",
    label: "High Contrast",
    hint: "Wyraźne granice i większe odstępy.",
  },
] as const;

const DEFAULT_NAME = "Odkrywca";
const DEFAULT_INITIAL = "O";

export type ProfileDialogProps = {
  progress: Progress;
  onChange: (progress: Progress) => void;
  onClose: () => void;
};

type ImportPreview = {
  fileName: string;
  progress: Progress;
  xp: number;
  completed: number;
  solved: number;
};

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function ProfileDialog({
  progress,
  onChange,
  onClose,
}: ProfileDialogProps) {
  useModalFocus(true);
  const [name, setName] = useState(progress.displayName ?? "");
  const [initial, setInitial] = useState(progress.initial ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<"import" | "reset" | null>(null);
  const importRequest = useRef(0);
  useEffect(() => () => { importRequest.current += 1; }, []);

  const summary = progressSummary(progress);
  const level = Math.floor(progress.xp / 500) + 1;
  const displayName = name.trim() || DEFAULT_NAME;
  const avatarInitial = (initial.trim() || DEFAULT_INITIAL).slice(0, 8);

  useEffect(() => {
    confirmRef.current?.focus();
  }, [preview, confirmReset]);

  // Return focus to the trigger that is visible again after a confirmation
  // closes (the trigger is remounted, so this must run after the render).
  useEffect(() => {
    const target = restoreFocusTo.current;
    restoreFocusTo.current = null;
    if (target === "import") importButtonRef.current?.focus();
    if (target === "reset") resetTriggerRef.current?.focus();
  }, [preview, confirmReset]);

  // Keep the visible fields in step with an import or an external change.
  useEffect(() => {
    setName(progress.displayName ?? "");
    setInitial(progress.initial ?? "");
  }, [progress.displayName, progress.initial]);

  // Escape cancels the open confirmation first; React handlers run before the
  // workspace-level shortcut, so the dialog owns the whole interaction.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    if (preview) {
      restoreFocusTo.current = "import";
      setPreview(null);
    } else if (confirmReset) {
      restoreFocusTo.current = "reset";
      setConfirmReset(false);
    } else onClose();
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const next: Progress = { ...progress };
    const trimmedName = name.trim();
    const trimmedInitial = initial.trim();
    if (trimmedName) next.displayName = trimmedName;
    else delete next.displayName;
    if (trimmedInitial) next.initial = trimmedInitial;
    else delete next.initial;
    setName(trimmedName);
    setInitial(trimmedInitial);
    onChange(next);
    setError(null);
    setStatus("Zapisano profil.");
  };

  const chooseTheme = (id: string) => {
    onChange({ ...progress, theme: id });
    setError(null);
    setStatus(`Wybrano motyw: ${THEMES.find((theme) => theme.id === id)?.label ?? id}.`);
  };

  const exportBackup = () => {
    try {
      const json = exportProgressBackup(progress);
      const url = URL.createObjectURL(
        new Blob([json], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = backupFileName();
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError(null);
      setStatus("Zapisano kopię zapasową jako plik .json.");
    } catch (exportError) {
      setStatus(null);
      setError(messageOf(exportError, "Nie udało się wyeksportować postępu."));
    }
  };

  const readBackup = async (file: File) => {
    const request = ++importRequest.current;
    setPreview(null);
    setConfirmReset(false);
    setError(null);
    setStatus("Sprawdzanie kopii zapasowej…");
    if (file.size > MAX_BACKUP_BYTES) {
      setStatus(null);
      setError("Plik jest za duży — dozwolony limit to 5 MB.");
      return;
    }
    try {
      const text = await file.text();
      if (request !== importRequest.current) return;
      const imported = parseProgressBackup(text);
      const importedSummary = progressSummary(imported);
      setError(null);
      setStatus(null);
      setConfirmReset(false);
      setPreview({
        fileName: file.name,
        progress: imported,
        xp: importedSummary.xp,
        completed: importedSummary.completed,
        solved: importedSummary.solved,
      });
    } catch (parseError) {
      if (request !== importRequest.current) return;
      setPreview(null);
      setStatus(null);
      setError(
        messageOf(
          parseError,
          "Nie udało się wczytać pliku. Obecny postęp pozostał bez zmian.",
        ),
      );
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (file) void readBackup(file);
  };

  const confirmImport = () => {
    if (!preview) return;
    onChange(preview.progress);
    restoreFocusTo.current = "import";
    setPreview(null);
    setError(null);
    setStatus("Postęp został zaimportowany.");
  };

  const performReset = () => {
    const next: Progress = { ...emptyProgress };
    if (progress.displayName !== undefined)
      next.displayName = progress.displayName;
    if (progress.initial !== undefined) next.initial = progress.initial;
    next.theme = progress.theme;
    onChange(next);
    restoreFocusTo.current = "reset";
    setConfirmReset(false);
    setError(null);
    setStatus("Postęp zresetowany. Profil i motyw pozostały bez zmian.");
  };

  return (
    <div
      className="modal-backdrop profile-backdrop"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <section
        className="panel profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
        aria-describedby="profile-dialog-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="section-heading profile-heading">
          <div>
            <span className="eyebrow">TWÓJ PROFIL</span>
            <h2 id="profile-dialog-title">Profil i postępy</h2>
          </div>
          <button
            type="button"
            className="icon-button profile-close"
            aria-label="Zamknij profil"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        <p id="profile-dialog-subtitle" className="muted profile-intro">
          Imię, motyw i kopia zapasowa postępu. Wszystko dzieje się lokalnie,
          na tym urządzeniu — bez kont i limitów.
        </p>

        <section className="profile-stats" aria-label="Twoje postępy">
          <div className="profile-stat">
            <span className="profile-stat-icon">
              <Trophy size={16} />
            </span>
            <strong>{summary.xp}</strong>
            <span>PUNKTÓW XP</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">
              <Sparkles size={16} />
            </span>
            <strong>{level}</strong>
            <span>POZIOM</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">
              <Check size={16} />
            </span>
            <strong>{summary.completed}</strong>
            <span>UKOŃCZONE TEMATY</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-icon">
              <Flame size={16} />
            </span>
            <strong>{streak(progress.activity)}</strong>
            <span>SERIA DNI</span>
          </div>
        </section>

        <form className="profile-form" onSubmit={saveProfile}>
          <div className="profile-field">
            <label className="input-label" htmlFor="profile-name">
              Imię lub pseudonim
            </label>
            <input
              id="profile-name"
              className="field"
              type="text"
              maxLength={60}
              autoComplete="nickname"
              placeholder={DEFAULT_NAME}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="profile-field profile-field-initial">
            <label className="input-label" htmlFor="profile-initial">
              Inicjał (awatar)
            </label>
            <input
              id="profile-initial"
              className="field"
              type="text"
              maxLength={8}
              placeholder={DEFAULT_INITIAL}
              value={initial}
              onChange={(event) => setInitial(event.target.value)}
            />
          </div>
          <div className="profile-form-footer">
            <button type="submit" className="button primary">
              Zapisz profil
            </button>
            <span className="profile-preview-note">
              Będzie widoczne jako: <strong>{avatarInitial}</strong> ·{" "}
              {displayName}
            </span>
          </div>
        </form>

        <section className="profile-block" aria-labelledby="profile-theme-title">
          <div className="profile-block-head">
            <h3 id="profile-theme-title" className="profile-block-title">
              Motyw
            </h3>
            <span className="profile-block-caption">Zmiana od razu</span>
          </div>
          <div className="profile-themes">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`theme-option ${progress.theme === theme.id ? "selected" : ""}`}
                aria-pressed={progress.theme === theme.id}
                onClick={() => chooseTheme(theme.id)}
              >
                <span className={`theme-swatch swatch-${theme.id}`} />
                <span>
                  <strong>{theme.label}</strong>
                  <small>{theme.hint}</small>
                </span>
                {progress.theme === theme.id && <Check size={18} />}
              </button>
            ))}
          </div>
        </section>

        <section
          className="profile-block"
          aria-labelledby="profile-backup-title"
        >
          <div className="profile-block-head">
            <h3 id="profile-backup-title" className="profile-block-title">
              Kopia zapasowa
            </h3>
            <span className="profile-block-caption">.json · 5 MB max</span>
          </div>
          <p className="muted profile-block-text">
            Wyeksportuj postęp do pliku albo wczytaj go na innym urządzeniu.
            Plik jest sprawdzany w całości, zanim cokolwiek zastąpi.
          </p>
          <div className="profile-actions">
            <button type="button" className="button" onClick={exportBackup}>
              <Download size={16} /> Eksportuj postępy (.json)
            </button>
            <button
              ref={importButtonRef}
              type="button"
              className="button"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} /> Importuj postępy
            </button>
            <input
              ref={fileRef}
              className="profile-file-input"
              type="file"
              accept="application/json,.json"
              aria-label="Wybierz plik kopii zapasowej w formacie .json"
              onChange={handleFile}
            />
          </div>

          {preview && (
            <div
              className="profile-confirm"
              role="group"
              aria-labelledby="profile-import-title"
            >
              <p id="profile-import-title" className="profile-confirm-title">
                Podgląd: {preview.fileName}
              </p>
              <p className="muted profile-block-text">
                Plik jest poprawny. Import zastąpi obecny postęp razem z XP,
                rozwiązanymi zadaniami, serią dni, powtórkami, imieniem i
                motywem.
              </p>
              <ul className="profile-preview-list">
                <li>
                  <strong>{preview.xp}</strong> XP
                </li>
                <li>
                  <strong>{preview.completed}</strong> ukończonych tematów
                </li>
                <li>
                  <strong>{preview.solved}</strong> rozwiązanych zadań
                </li>
              </ul>
              <div className="profile-actions">
                <button
                  ref={confirmRef}
                  type="button"
                  className="button primary"
                  onClick={confirmImport}
                >
                  Tak, importuj postęp
                </button>
                <button
                  type="button"
                  className="button subtle"
                  onClick={() => {
                    restoreFocusTo.current = "import";
                    setPreview(null);
                  }}
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </section>

        <section
          className="profile-block profile-danger"
          aria-labelledby="profile-reset-title"
        >
          <div className="profile-block-head">
            <h3 id="profile-reset-title" className="profile-block-title">
              Reset postępu
            </h3>
            <span className="profile-block-caption">Nieodwracalne</span>
          </div>
          <p className="muted profile-block-text">
            Usuwa XP, rozwiązane zadania, serie dni, powtórki i ostatnią
            lekcję. Zachowuje imię, inicjał i motyw.
          </p>
          {confirmReset ? (
            <div
              className="profile-confirm"
              role="group"
              aria-labelledby="profile-reset-confirm-title"
            >
              <p
                id="profile-reset-confirm-title"
                className="profile-confirm-title"
              >
                Na pewno zresetować postęp?
              </p>
              <p className="muted profile-block-text">
                Zniknie: XP ({progress.xp}), {summary.solved} rozwiązanych
                zadań, {summary.activityDays} dni aktywności i cały harmonogram
                powtórek. Zostanie: {displayName}, inicjał {avatarInitial} oraz
                motyw. Jeśli chcesz je zachować, wcześniej użyj „Eksportuj
                postępy”.
              </p>
              <div className="profile-actions">
                <button
                  ref={confirmRef}
                  type="button"
                  className="button danger"
                  onClick={performReset}
                >
                  <RotateCcw size={16} /> Tak, resetuj postęp
                </button>
                <button
                  type="button"
                  className="button subtle"
                  onClick={() => {
                    restoreFocusTo.current = "reset";
                    setConfirmReset(false);
                  }}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <button
              ref={resetTriggerRef}
              type="button"
              className="button danger"
              onClick={() => {
                importRequest.current += 1;
                setError(null);
                setStatus(null);
                setPreview(null);
                setConfirmReset(true);
              }}
            >
              <RotateCcw size={16} /> Zresetuj postęp
            </button>
          )}
        </section>

        <div className="profile-messages">
          <p className="profile-message profile-error" role="alert">
            {error}
          </p>
          <p className="profile-message profile-status" role="status">
            {status}
          </p>
        </div>
      </section>
    </div>
  );
}
