"use client";

import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calculator,
  CheckCheck,
  ChevronRight,
  Maximize2,
  NotebookPen,
  Bot,
  Pencil,
  Type,
  X,
} from "lucide-react";
import { checkSteps } from "@/generators";
import { createPortal } from "react-dom";
import { acquireInert, acquireScrollLock } from "@/lib/interactionLock";
import dynamic from "next/dynamic";

import ScratchpadCanvas, {
  type ScratchStroke,
  type ScratchText,
} from "./ScratchpadCanvas";
import "./Scratchpad.css";
import { useOmniKumpel } from "./OmniKumpelContext";

/** The calculator is only fetched when the "Kalkulator" tab is opened. */
const SmoothCalculator = dynamic(() => import("./SmoothCalculator"));

export type ScratchpadSize = "half" | "wide" | "full";

export default function Scratchpad({
  open,
  onClose,
  answer,
  size,
  onSizeChange,
  notes,
  onNotesChange: setNotes,
}: {
  open: boolean;
  onClose: () => void;
  answer?: string;
  size: ScratchpadSize;
  onSizeChange: (size: ScratchpadSize) => void;
  notes: string;
  onNotesChange: Dispatch<SetStateAction<string>>;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<"notes" | "draw" | "calc">("notes");
  const { openHelper, setQuestion } = useOmniKumpel();
  const [strokes, setStrokes] = useState<ScratchStroke[]>([]);
  const [textBlocks, setTextBlocks] = useState<ScratchText[]>([]);
  const [notice, setNotice] = useState("");
  const [compact, setCompact] = useState(false);
  const [checked, setChecked] = useState<{
    notes: string;
    answer: string;
    results: ReturnType<typeof checkSteps>;
  } | null>(null);
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  const modal = compact || size === "full";

  /**
   * The unified math context loop: notes become part of the OmniKumpel question,
   * so the checker diagnoses the learner's own lines instead of a generic task.
   */
  const checkNotesWithOmni = () => {
    const lines = notes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 100);
    setQuestion((previous) => ({
      id: `scratchpad:${Date.now()}`,
      title: previous?.title
        ? `${previous.title} · brudnopis`
        : "Moje zapiski z brudnopisu",
      prompt: [
        previous?.prompt,
        "Moje obliczenia z brudnopisu:",
        ...lines,
      ]
        .filter(Boolean)
        .join("\n"),
      problem: previous?.problem,
      lessonHint: previous?.lessonHint,
    }));
    onClose();
    openHelper("check");
  };

  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1099px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!open || !modal) return;
    const releaseBackground = acquireInert([
      ...document.querySelectorAll<HTMLElement>(".main-shell, .sidebar"),
    ]);
    const releaseScroll = acquireScrollLock(document.body);
    const trap = (event: KeyboardEvent) => {
      if (
        event.key !== "Tab" ||
        [...document.querySelectorAll('[aria-modal="true"]')].some(
          (e) => e !== panel.current,
        )
      )
        return;
      const nodes = [
        ...(panel.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),textarea,input,select,a[href],[tabindex]:not([tabindex='-1'])",
        ) ?? []),
      ].filter((e) => e.getClientRects().length > 0);
      const first = nodes[0],
        last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      } else if (!panel.current?.contains(document.activeElement)) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      releaseBackground();
      releaseScroll();
    };
  }, [open, modal]);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const element = panel.current;
    closeButton.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        ![...document.querySelectorAll('[aria-modal="true"]')].some(
          (e) => e !== panel.current,
        )
      ) {
        event.preventDefault();
        close.current();
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      // Do not steal focus back if the learner has moved into the exercise.
      if (
        trigger?.isConnected &&
        (element?.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        requestAnimationFrame(() => {
          if (trigger.isConnected) trigger.focus({ preventScroll: true });
        });
      }
    };
  }, [open]);

  if (!open) return null;
  const results =
    checked?.notes === notes && checked.answer === answer
      ? checked.results
      : [];

  return createPortal(
    <motion.aside
      ref={panel}
      className={`scratchpad-panel size-${size}${modal ? " is-modal" : ""}`}
      role={modal ? "dialog" : "region"}
      aria-modal={modal ? true : undefined}
      aria-labelledby={`${id}-title`}
      initial={reducedMotion ? false : { opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 310, damping: 32 }}
    >
      <header className="scratchpad-header">
        <span className="scratchpad-emblem">
          <NotebookPen size={21} aria-hidden="true" />
        </span>
        <div className="scratchpad-heading">
          <span className="scratchpad-eyebrow">
            TWOJA PRZESTRZEŃ NA MYŚLENIE
          </span>
          <h2 id={`${id}-title`}>
            Brudnopis <span>w kratkę</span>
          </h2>
        </div>
        <div
          className="scratchpad-size-switcher"
          role="group"
          aria-label="Szerokość brudnopisu"
        >
          <button
            type="button"
            className="scratchpad-size-button"
            aria-pressed={size === "half"}
            aria-label="Połowa ekranu"
            title="Połowa ekranu"
            onClick={() => onSizeChange("half")}
          >
            50%
          </button>
          <button
            type="button"
            className="scratchpad-size-button"
            aria-pressed={size === "wide"}
            aria-label="Siedemdziesiąt procent ekranu"
            title="70% ekranu"
            onClick={() => onSizeChange("wide")}
          >
            70%
          </button>
          <button
            type="button"
            className="scratchpad-size-button"
            aria-pressed={size === "full"}
            aria-label="Pełny ekran"
            title="Pełny ekran"
            onClick={() => onSizeChange(size === "full" ? "half" : "full")}
          >
            <Maximize2 size={14} aria-hidden="true" />
          </button>
        </div>
        <button
          ref={closeButton}
          type="button"
          className="scratchpad-icon-button"
          onClick={onClose}
          aria-label="Zamknij brudnopis"
          title="Zamknij (Escape)"
        >
          <X size={20} />
        </button>
      </header>

      <div className="scratchpad-toolbar">
        <div
          className="scratchpad-modes"
          role="group"
          aria-label="Sposób notowania"
        >
          <button
            type="button"
            aria-pressed={mode === "notes"}
            onClick={() => {
              setMode("notes");
              setNotice("");
            }}
          >
            <Type size={16} aria-hidden="true" /> Kroki
          </button>
          <button
            type="button"
            aria-pressed={mode === "draw"}
            onClick={() => {
              setMode("draw");
              setNotice("");
            }}
          >
            <Pencil size={16} aria-hidden="true" /> Rysuj
          </button>
          <button
            type="button"
            aria-pressed={mode === "calc"}
            onClick={() => {
              setMode("calc");
              setNotice("");
            }}
          >
            <Calculator size={16} aria-hidden="true" /> Kalkulator
          </button>
        </div>
        <span className="scratchpad-tool-hint">
          {mode === "notes"
            ? "Jedna myśl. Jeden wiersz."
            : mode === "draw"
              ? "Mysz, palec lub rysik · 60/120 FPS"
              : "Wynik jednym kliknięciem wróci do zadania"}
        </span>
      </div>

      <div className="scratchpad-body">
        {mode === "notes" ? (
          <>
            <div className="scratchpad-paper scratchpad-notes">
              <label className="scratchpad-paper-label" htmlFor={`${id}-notes`}>
                OBLICZENIA / NOTATKI
              </label>
              <textarea
                id={`${id}-notes`}
                className="scratchpad-textarea"
                value={notes}
                maxLength={16000}
                spellCheck={false}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={
                  "Zapisz pierwszy krok…\n\nMożesz się mylić. Od tego jest brudnopis."
                }
                aria-describedby={`${id}-session`}
              />
            </div>
            <div className="scratchpad-checker">
              <div className="scratchpad-checker-heading">
                <CheckCheck size={17} aria-hidden="true" />
                <strong>Porównaj wartości kroków</strong>
              </div>
              <p>
                Każdy niepusty wiersz porównujemy liczbowo z wynikiem zadania.
                To nie jest sprawdzanie dowodu ani poprawności przekształceń
                równań z niewiadomymi.
              </p>
              <button
                type="button"
                className="scratchpad-check-button"
                disabled={!answer || !notes.trim()}
                onClick={() => {
                  if (!answer) return;
                  const lines = notes
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                  setChecked({
                    notes,
                    answer,
                    results: checkSteps(lines.slice(0, 100), answer),
                  });
                }}
              >
                Porównaj kroki <ChevronRight size={15} aria-hidden="true" />
              </button>
              {!answer && (
                <p>Sprawdzanie będzie dostępne przy aktywnym zadaniu.</p>
              )}
              {notes.split("\n").filter((line) => line.trim()).length > 100 && (
                <p>Sprawdzamy pierwsze 100 niepustych wierszy.</p>
              )}
              <ul className="scratchpad-results" aria-live="polite">
                {results.map((result, index) => (
                  <li key={index} data-correct={result.correct}>
                    {result.message}
                  </li>
                ))}
              </ul>
              <button type="button" className="scratchpad-check-button" disabled={!notes.trim()} onClick={checkNotesWithOmni}><Bot size={15} /> 🤖 Sprawdź moje zapiski z OmniKumplem</button>
              <p>Przekazujemy tekst notatek lokalnie. Rysunek nie jest automatycznie rozpoznawany.</p>
            </div>
          </>
        ) : mode === "draw" ? (
          <ScratchpadCanvas
            strokes={strokes}
            textBlocks={textBlocks}
            onStrokesChange={setStrokes}
            onTextBlocksChange={setTextBlocks}
            onNotice={setNotice}
          />
        ) : (
          <SmoothCalculator
            onInsertNote={(value) => {
              setNotes((previous) =>
                previous.trim() ? `${previous}\n${value}` : value,
              );
              setNotice(
                "Wynik dopisany do notatek. Otwórz zakładkę Kroki, aby go zobaczyć.",
              );
            }}
          />
        )}
        <p className="scratchpad-notice" role="status">
          {notice}
        </p>
      </div>
      <footer className="scratchpad-footer" id={`${id}-session`}>
        <span className="scratchpad-session-dot" />
        <span>
          Tylko ta sesja · zmiana zadania i zamknięcie panelu nie usuwają
          notatek. Odświeżenie strony je usuwa.
        </span>
        {modal && (
          <button type="button" className="button" onClick={onClose}>
            Wróć do zadań <ChevronRight size={14} />
          </button>
        )}
      </footer>
    </motion.aside>,
    document.body,
  );
}
