"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Check, Copy, Download, Upload, X } from "lucide-react";
import { type Progress } from "@/lib/progress";
import {
  MAX_BACKUP_BYTES,
  backupFileName,
  encodeSyncLink,
  exportProgressBackup,
  parseProgressBackup,
  progressSummary,
} from "@/lib/progressBackup";
import { useModalFocus } from "@/lib/useModalFocus";
import "./ProfileDialog.css";

type Props = {
  progress: Progress;
  onChange: (progress: Progress) => void;
  onClose: () => void;
};

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(code: string): string {
  const binary = atob(code.replace(/\s+/g, ""));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (character) => character.charCodeAt(0)),
  );
}

/**
 * A small, direct path to the same versioned progress backup used by the
 * profile dialog. Export never mutates anything; import validates the complete
 * payload before replacing progress.
 */
export default function BackupDialog({ progress, onChange, onClose }: Props) {
  useModalFocus(true);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncLink, setSyncLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const summary = progressSummary(progress);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    onClose();
  };

  const json = () => exportProgressBackup(progress);

  const download = () => {
    try {
      const payload = json();
      const url = URL.createObjectURL(
        new Blob([payload], { type: "application/json" }),
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
      setStatus("Pobrano plik .json z pełnym zapisem postępów.");
    } catch (exportError) {
      setStatus(null);
      setError(messageOf(exportError, "Nie udało się zapisać kopii."));
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(encodeBase64(json()));
      setError(null);
      setStatus("Skopiowano kod Base64. Wklej go na innym urządzeniu.");
    } catch {
      setStatus(null);
      setError("Przeglądarka zablokowała schowek. Pobierz plik .json zamiast kodu.");
    }
  };

  const copySyncLink = async () => {
    try {
      const link = encodeSyncLink(progress, window.location.origin);
      setSyncLink(link);
      await navigator.clipboard.writeText(link);
      setError(null);
      setStatus(
        "Skopiowano link synchronizacyjny. Otwórz go na telefonie — postęp wczyta się sam.",
      );
    } catch {
      setStatus(null);
      setError(
        "Nie udało się skopiować linku. Zaznacz go i skopiuj ręcznie albo pobierz plik .json.",
      );
    }
  };

  const loadText = (text: string, label: string) => {
    try {
      if (!text.trim()) throw new Error("Wklej kod Base64 albo wybierz plik .json.");
      const imported = parseProgressBackup(text);
      onChange(imported);
      const next = progressSummary(imported);
      setError(null);
      setStatus(`Wczytano ${label}: ${next.xp} XP, ${next.solved} rozwiązanych zadań.`);
    } catch (parseError) {
      setStatus(null);
      setError(
        messageOf(parseError, "Nie udało się wczytać zapisu. Obecny postęp bez zmian."),
      );
    }
  };

  const importCode = () => {
    try {
      loadText(decodeBase64(code), "kod Base64");
    } catch (decodeError) {
      setStatus(null);
      setError(messageOf(decodeError, "Kod Base64 jest nieprawidłowy."));
    }
  };

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setStatus(null);
      setError("Plik jest za duży — dozwolony limit to 5 MB.");
      return;
    }
    try {
      loadText(await file.text(), file.name);
    } catch (readError) {
      setStatus(null);
      setError(messageOf(readError, "Nie udało się odczytać pliku."));
    }
  };

  return (
    <div className="modal-backdrop profile-backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <section
        className="panel profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-dialog-title"
        aria-describedby="backup-dialog-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="section-heading profile-heading">
          <div>
            <span className="eyebrow">PRZENIEŚ SWÓJ POSTĘP</span>
            <h2 id="backup-dialog-title">Kopia zapasowa postępów</h2>
          </div>
          <button type="button" className="icon-button profile-close" aria-label="Zamknij kopię zapasową" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <p id="backup-dialog-subtitle" className="muted profile-intro">
          {summary.xp} XP · {summary.completed} ukończonych tematów · {summary.activityDays} dni nauki.
          Wszystko zostaje na Twoim urządzeniu.
        </p>

        <section className="profile-block" aria-labelledby="backup-export-title">
          <div className="profile-block-head">
            <h3 id="backup-export-title" className="profile-block-title">Pobierz zapis</h3>
            <span className="profile-block-caption">.json lub Base64</span>
          </div>
          <p className="muted profile-block-text">
            Plik .json zachowuje XP, serie dni, powtórki, profil i motyw. Kod Base64 to ten sam zapis do wklejenia.
          </p>
          <div className="profile-actions">
            <button type="button" className="button primary" onClick={download}>
              <Download size={16} /> Pobierz zapis (.json)
            </button>
            <button type="button" className="button" onClick={() => void copyCode()}>
              <Copy size={16} /> Skopiuj kod Base64
            </button>
            <button type="button" className="button" onClick={() => void copySyncLink()}>
              🔗 Kopiuj link synchronizacyjny na telefon
            </button>
          </div>
          {syncLink && (
            <label className="input-label" htmlFor="backup-sync-link">
              Link synchronizacyjny
              <input
                id="backup-sync-link"
                className="field"
                readOnly
                value={syncLink}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          )}
        </section>

        <section className="profile-block" aria-labelledby="backup-import-title">
          <div className="profile-block-head">
            <h3 id="backup-import-title" className="profile-block-title">Wczytaj zapis</h3>
            <span className="profile-block-caption">Base64 lub .json · 5 MB max</span>
          </div>
          <label className="input-label" htmlFor="backup-code">Kod Base64</label>
          <textarea
            id="backup-code"
            className="field"
            rows={4}
            maxLength={MAX_BACKUP_BYTES}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Wklej tutaj skopiowany kod Base64"
            spellCheck={false}
          />
          <div className="profile-actions">
            <button type="button" className="button" onClick={importCode}>
              <Check size={16} /> Wczytaj kod
            </button>
            <button type="button" className="button" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Wybierz plik .json
            </button>
            <input
              ref={fileRef}
              className="profile-file-input"
              type="file"
              accept="application/json,.json"
              aria-label="Wybierz plik kopii zapasowej w formacie .json"
              onChange={(event) => void readFile(event)}
            />
          </div>
          <p className="muted profile-block-text">
            Import najpierw sprawdza cały zapis. Obecny postęp zastępujemy dopiero po poprawnej walidacji.
          </p>
        </section>

        <div className="profile-messages">
          <p className="profile-message profile-error" role="alert">{error}</p>
          <p className="profile-message profile-status" role="status">{status}</p>
        </div>
      </section>
    </div>
  );
}
