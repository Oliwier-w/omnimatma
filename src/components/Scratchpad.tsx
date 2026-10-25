"use client";

import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCheck,
  ChevronRight,
  NotebookPen,
  Pencil,
  RotateCcw,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { checkSteps } from "@/generators";
import { createPortal } from "react-dom";
import { acquireInert, acquireScrollLock } from "@/lib/interactionLock";
import "./Scratchpad.css";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string; width: number };
const MAX_STROKES = 80;
const MAX_POINTS = 700;
const COLORS = [
  { value: "var(--text)", label: "Kolor tekstu" },
  { value: "var(--accent)", label: "Fioletowy" },
  { value: "var(--green)", label: "Zielony" },
  { value: "var(--peach)", label: "Bursztynowy" },
];

export default function Scratchpad({
  open,
  onClose,
  answer,
}: {
  open: boolean;
  onClose: () => void;
  answer?: string;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<"notes" | "draw">("notes");
  const [notes, setNotes] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [draft, setDraft] = useState<Stroke | null>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [width, setWidth] = useState(3);
  const [notice, setNotice] = useState("");
  const [compact, setCompact] = useState(false);
  const [checked, setChecked] = useState<{
    notes: string;
    answer: string;
    results: ReturnType<typeof checkSteps>;
  } | null>(null);
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const active = useRef<{ pointer: number; stroke: Stroke } | null>(null);
  const close = useRef(onClose);
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
    if (!open || !compact) return;
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
          "button:not(:disabled),textarea,select,a[href]",
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
  }, [open, compact]);

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
      active.current = null;
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

  function cancelInk() {
    const pointer = active.current?.pointer;
    active.current = null;
    setDraft(null);
    if (pointer !== undefined && svg.current?.hasPointerCapture(pointer))
      svg.current.releasePointerCapture(pointer);
  }

  function point(event: PointerEvent<SVGSVGElement>): Point | null {
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return null;
    const mapped = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return {
      x: Math.max(0, Math.min(1000, mapped.x)),
      y: Math.max(0, Math.min(800, mapped.y)),
    };
  }

  function startInk(event: PointerEvent<SVGSVGElement>) {
    if (!event.isPrimary || event.button !== 0 || active.current) return;
    if (strokes.length >= MAX_STROKES) {
      setNotice(
        "Kartka ma już 80 kresek. Cofnij kreskę lub wyczyść rysunek, aby pisać dalej.",
      );
      return;
    }
    const p = point(event);
    if (!p) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke = { points: [p], color, width };
    active.current = { pointer: event.pointerId, stroke };
    setDraft(stroke);
    setNotice("");
  }

  function moveInk(event: PointerEvent<SVGSVGElement>) {
    const current = active.current;
    if (!current || current.pointer !== event.pointerId) return;
    const p = point(event);
    if (!p) return;
    const previous = current.stroke.points.at(-1)!;
    if (Math.hypot(p.x - previous.x, p.y - previous.y) < 1.5) return;
    if (current.stroke.points.length >= MAX_POINTS) {
      setNotice(
        "Unieś pisak i zacznij kolejną kreskę — limit długości chroni płynność kartki.",
      );
      return;
    }
    const stroke = { ...current.stroke, points: [...current.stroke.points, p] };
    active.current = { ...current, stroke };
    setDraft(stroke);
  }

  function finishInk(event: PointerEvent<SVGSVGElement>) {
    if (active.current?.pointer !== event.pointerId) return;
    const current = active.current.stroke;
    const end = point(event);
    const previous = current.points.at(-1)!;
    const stroke =
      end &&
      current.points.length < MAX_POINTS &&
      Math.hypot(end.x - previous.x, end.y - previous.y) >= 1.5
        ? { ...current, points: [...current.points, end] }
        : current;
    active.current = null;
    setDraft(null);
    setStrokes((previous) => [...previous, stroke].slice(0, MAX_STROKES));
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (!open) return null;
  const results =
    checked?.notes === notes && checked.answer === answer
      ? checked.results
      : [];
  const visibleDraft = active.current ? draft : null;
  const ink = visibleDraft ? [...strokes, visibleDraft] : strokes;

  return createPortal(
    <motion.aside
      ref={panel}
      className="scratchpad-panel"
      role={compact ? "dialog" : "region"}
      aria-modal={compact ? true : undefined}
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
              cancelInk();
              setMode("notes");
            }}
          >
            <Type size={16} aria-hidden="true" /> Kroki
          </button>
          <button
            type="button"
            aria-pressed={mode === "draw"}
            onClick={() => {
              cancelInk();
              setMode("draw");
            }}
          >
            <Pencil size={16} aria-hidden="true" /> Rysuj
          </button>
        </div>
        <span className="scratchpad-tool-hint">
          {mode === "notes"
            ? "Jedna myśl. Jeden wiersz."
            : "Mysz, palec lub rysik"}
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
            </div>
          </>
        ) : (
          <>
            <div className="scratchpad-ink-tools">
              <div
                className="scratchpad-colors"
                role="group"
                aria-label="Kolor pisaka"
              >
                {COLORS.map((inkColor) => (
                  <button
                    type="button"
                    key={inkColor.value}
                    className="scratchpad-swatch"
                    style={
                      {
                        "--scratchpad-ink": inkColor.value,
                      } as React.CSSProperties
                    }
                    aria-label={inkColor.label}
                    aria-pressed={color === inkColor.value}
                    onClick={() => {
                      cancelInk();
                      setColor(inkColor.value);
                    }}
                  />
                ))}
              </div>
              <label className="scratchpad-width">
                Grubość{" "}
                <select
                  value={width}
                  onChange={(event) => {
                    cancelInk();
                    setWidth(Number(event.target.value));
                  }}
                  aria-label="Grubość pisaka"
                >
                  <option value={2}>Cienki</option>
                  <option value={3}>Średni</option>
                  <option value={6}>Gruby</option>
                </select>
              </label>
              <button
                type="button"
                className="scratchpad-icon-button"
                disabled={!strokes.length}
                aria-label="Cofnij ostatnią kreskę"
                title="Cofnij kreskę"
                onClick={() => {
                  cancelInk();
                  setStrokes((previous) => previous.slice(0, -1));
                  setNotice("");
                }}
              >
                <RotateCcw size={17} />
              </button>
              <button
                type="button"
                className="scratchpad-icon-button"
                disabled={!strokes.length}
                aria-label="Wyczyść tylko rysunek"
                title="Wyczyść tylko rysunek"
                onClick={() => {
                  cancelInk();
                  setStrokes([]);
                  setNotice(
                    "Rysunek wyczyszczony. Notatki pozostały bez zmian.",
                  );
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
            <div className="scratchpad-paper scratchpad-drawing">
              <span className="scratchpad-paper-label">
                MIEJSCE NA TWÓJ POMYSŁ
              </span>
              <svg
                ref={svg}
                className="scratchpad-canvas"
                viewBox="0 0 1000 800"
                preserveAspectRatio="none"
                role="img"
                aria-label="Kartka do rysowania odręcznego. Do notatek klawiaturą wybierz tryb Kroki."
                onPointerDown={startInk}
                onPointerMove={moveInk}
                onPointerUp={finishInk}
                onPointerCancel={(event) => {
                  if (active.current?.pointer === event.pointerId) cancelInk();
                }}
                onLostPointerCapture={(event) => {
                  if (active.current?.pointer === event.pointerId) cancelInk();
                }}
              >
                {ink.map((stroke, index) =>
                  stroke.points.length === 1 ? (
                    <circle
                      key={index}
                      cx={stroke.points[0].x}
                      cy={stroke.points[0].y}
                      r={stroke.width / 2}
                      fill={stroke.color}
                    />
                  ) : (
                    <polyline
                      key={index}
                      points={stroke.points
                        .map((p) => `${p.x},${p.y}`)
                        .join(" ")}
                      fill="none"
                      stroke={stroke.color}
                      strokeWidth={stroke.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  ),
                )}
              </svg>
              {!strokes.length && !visibleDraft && (
                <span className="scratchpad-draw-placeholder">
                  <Pencil size={25} aria-hidden="true" />
                  Tu zaczyna się Twój pomysł.
                  <small>Rysuj swobodnie po kratce.</small>
                </span>
              )}
            </div>
            <div className="scratchpad-drawing-status">
              <span>
                {strokes.length} / {MAX_STROKES} kresek
              </span>
              <span>Notatki i rysunek są niezależne</span>
            </div>
          </>
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
        {compact && (
          <button type="button" className="button" onClick={onClose}>
            Wróć do zadań <ChevronRight size={14} />
          </button>
        )}
      </footer>
    </motion.aside>,
    document.body,
  );
}
