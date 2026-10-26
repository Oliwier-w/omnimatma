"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  BookOpen,
  Dumbbell,
  FunctionSquare,
  Network,
  Search,
  Sigma,
  Timer,
  X,
} from "lucide-react";
import type { Lesson } from "@/lib/lesson";
import { useModalFocus } from "@/lib/useModalFocus";
import "./CommandPalette.css";
import { solveSmartMath, type SmartPracticeSpec } from "@/lib/smartMath";

type ToolId = "formula" | "matrix" | "graph" | "exam" | "symbols";

type CommandResult = {
  id: string;
  kind: "lesson" | "practice" | "tool";
  label: string;
  meta: string;
  score: number;
  lesson?: Lesson;
  tool?: ToolId;
};

type CommandPaletteProps = {
  lessons: Lesson[];
  onLesson: (lesson: Lesson) => void;
  onPractice: (lesson: Lesson) => void;
  onTool: (tool: ToolId) => void;
  initialQuery?: string;
  onSmartPractice: (spec: SmartPracticeSpec) => void;
  onClose: () => void;
};

const MAX_RESULTS = 30;
const EMPTY_QUERY_LESSONS = 6;

const TOOLS: {
  tool: ToolId;
  label: string;
  meta: string;
  aliases: string;
}[] = [
  { tool: "symbols", label: "Tłumacz symboli", meta: "Jak przeczytać matematykę po polsku?", aliases: "symbole symbol slownik tlumacz przeczytac znaczek suma sigma calka kwantyfikator" },
  {
    tool: "formula",
    label: "Tablice wzorów",
    meta: "Wzory maturalne i akademickie",
    aliases:
      "wzor wzory tablice tabliczka sciaga pitagorasa pitagorasz a2+b2=c2 pole kola kolo koło procent procenty logarytm logarytmy",
  },
  {
    tool: "matrix",
    label: "Macierze",
    meta: "Kalkulator macierzy 2×2 i operacje",
    aliases:
      "macierz macierzy matryca wyznacznik determinanta odwrotna operacje dodawanie mnozenie",
  },
  {
    tool: "graph",
    label: "Wykres funkcji",
    meta: "Interaktywny wykres 2D",
    aliases:
      "wykres wykresy funkcja funkcje parabola liniowa kwadratowa wspolczynniki",
  },
  {
    tool: "exam",
    label: "Symulator egzaminu",
    meta: "Arkusz testowy na czas",
    aliases:
      "egzamin egzaminy matura test kolokwium arkusz powtorka czas timer",
  },
];

/** Keywords that make generator ("Ćwicz") entries searchable on their own. */
const PRACTICE_KEYWORDS = [
  "zadanie",
  "zadania",
  "zadank",
  "generator",
  "generatory",
  "trening",
  "cwiczenie",
  "cwiczenia",
  "cwicz",
  "praktyka",
  "praktyki",
];

const TOOL_ICONS: Record<ToolId, typeof Sigma> = {
  symbols: Sigma,
  formula: Sigma,
  matrix: Network,
  graph: FunctionSquare,
  exam: Timer,
};

/** Lowercase, strip diacritics (including Polish ł) and collapse punctuation. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pluralWynikow(count: number): string {
  if (count === 1) return "wynik";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14))
    return "wyniki";
  return "wyników";
}

function lessonScore(lesson: Lesson, full: string, tokens: string[]): number {
  const title = normalize(lesson.title);
  const rest = normalize(
    `${lesson.category} ${lesson.level} ${lesson.id} ${lesson.generatorId} ${lesson.formula} ${lesson.aliases?.join(" ") ?? ""}`,
  );
  const haystack = `${title} ${rest}`;
  if (!tokens.every((token) => haystack.includes(token))) return 0;
  if (title.startsWith(full)) return 100;
  if (title.includes(full)) return 90;
  if (rest.includes(full)) return 70;
  return 55;
}

function search(lessons: Lesson[], rawQuery: string) {
  const full = normalize(rawQuery);
  const tokens = full.split(" ").filter(Boolean);

  if (!tokens.length) {
    const items: CommandResult[] = TOOLS.map((entry, index) => ({
      id: `tool-${entry.tool}`,
      kind: "tool",
      label: entry.label,
      meta: entry.meta,
      score: -index,
      tool: entry.tool,
    }));
    lessons.slice(0, EMPTY_QUERY_LESSONS).forEach((lesson, index) => {
      items.push({
        id: `lesson-${lesson.id}`,
        kind: "lesson",
        label: lesson.title,
        meta: lesson.category,
        score: -index,
        lesson,
      });
    });
    return { items, total: items.length };
  }

  const keywordHit = tokens.some((token) => PRACTICE_KEYWORDS.includes(token));
  const matched = lessons
    .map((lesson) => ({ lesson, score: lessonScore(lesson, full, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  // Grouped order: every lesson hit first, then its generator entry, then tools.
  const items: CommandResult[] = [];
  for (const { lesson, score } of matched) {
    items.push({
      id: `lesson-${lesson.id}`,
      kind: "lesson",
      label: lesson.title,
      meta: lesson.category,
      score,
      lesson,
    });
  }
  for (const { lesson, score } of matched) {
    items.push({
      id: `practice-${lesson.id}`,
      kind: "practice",
      label: `Ćwicz: ${lesson.title}`,
      meta: "Generator zadań · 5 poziomów",
      score: score - 5,
      lesson,
    });
  }
  // Strip the command word but keep the actual topic filter.
  if (keywordHit && !matched.length) {
    const topicTokens = tokens.filter((token) => !PRACTICE_KEYWORDS.includes(token));
    const practiceMatches = lessons.map((lesson) => ({ lesson, score: topicTokens.length ? lessonScore(lesson, topicTokens.join(" "), topicTokens) : 20 }))
      .filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
    practiceMatches.forEach(({ lesson, score }) => {
      items.push({
        id: `practice-${lesson.id}`,
        kind: "practice",
        label: `Ćwicz: ${lesson.title}`,
        meta: "Generator zadań · 5 poziomów",
        score,
        lesson,
      });
    });
  }
  const toolHits = TOOLS.map((entry) => {
    const haystack = normalize(`${entry.label} ${entry.aliases}`);
    if (!tokens.every((token) => haystack.includes(token))) return null;
    const title = normalize(entry.label);
    return {
      id: `tool-${entry.tool}`,
      kind: "tool" as const,
      label: entry.label,
      meta: entry.meta,
      score: title.includes(full) ? 85 : 65,
      tool: entry.tool,
    };
  })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.score - a.score);
  items.push(...toolHits);

  return { items: items.slice(0, MAX_RESULTS), total: items.length };
}

const GROUP_LABEL: Record<CommandResult["kind"], string> = {
  lesson: "LEKCJE",
  practice: "ĆWICZENIA",
  tool: "NARZĘDZIA",
};

export default function CommandPalette({
  lessons,
  onLesson,
  onPractice,
  onTool,
  onClose,
  initialQuery = "",
  onSmartPractice,
}: CommandPaletteProps) {
  useModalFocus(true);
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const mathLike = /^\s*(?:[(-]*\d|det\s*\(|x\s*[+\-*/=])/i.test(deferredQuery) || deferredQuery.includes("=");
  const mathResult = useMemo(() => mathLike ? solveSmartMath(deferredQuery) : null, [deferredQuery, mathLike]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { items, total } = useMemo(
    () => search(lessons, query),
    [lessons, query],
  );
  const shown = items.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= itemRefs.current.length) setActiveIndex(0);
    itemRefs.current.length = items.length;
  }, [activeIndex, items.length]);

  // One instant "nearest" scroll per selection change — never smooth, never repeated.
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, items.length]);

  const choose = (item: CommandResult) => {
    if (item.kind === "lesson" && item.lesson) onLesson(item.lesson);
    else if (item.kind === "practice" && item.lesson) onPractice(item.lesson);
    else if (item.kind === "tool" && item.tool) onTool(item.tool);
    onClose();
  };

  const focusItem = (index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (mathResult?.kind === "solved" && event.target === inputRef.current && event.key === "Enter") { event.preventDefault(); return; }
    if (!items.length) return;
    const onInput = event.target === inputRef.current;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(onInput ? 0 : Math.min(activeIndex + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (activeIndex > 0) focusItem(activeIndex - 1);
      else inputRef.current?.focus();
    } else if (event.key === "Enter" && onInput) {
      event.preventDefault();
      itemRefs.current[activeIndex]?.click();
    } else if (
      (event.key === "Home" || event.key === "End") &&
      !onInput
    ) {
      event.preventDefault();
      focusItem(event.key === "Home" ? 0 : items.length - 1);
    }
  };

  let previousKind: CommandResult["kind"] | null = null;
  const trimmed = query.trim();

  return (
    <div
      className="cp-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="cp-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Wyszukaj lekcję"
        onKeyDown={onKeyDown}
      >
        <div className="cp-field">
          <Search className="cp-field-icon" size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            className="cp-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Szukaj tematu"
            placeholder="Szukaj tematu, wzoru lub zadania…"
            autoComplete="off"
            spellCheck={false}
            maxLength={300}
            autoCapitalize="off"
          />
          <button
            type="button"
            className="cp-close"
            aria-label="Zamknij wyszukiwarkę"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {mathResult && <section className="cp-math" aria-label="Smart Math" aria-live="polite">
          {mathResult.kind === "solved" ? <>
            <p className="cp-math-answer">Dokładny wynik: <strong>{mathResult.answer}</strong></p>
            <details><summary>Rozwiązanie krok po kroku</summary><ol>{mathResult.steps.map((step, index) => <li key={index}><strong>{step.title}</strong><code>{step.expression}</code><p>{step.explanation}</p></li>)}</ol></details>
            <button type="button" className="button primary" onClick={() => { onSmartPractice(mathResult.practice); onClose(); }}>Wygeneruj 10 podobnych zadań</button>
          </> : <p>{mathResult.message}</p>}
        </section>}
        <div className="cp-results" hidden={mathResult?.kind === "solved"}>
          {items.length === 0 ? (
            <p className="cp-status" role="status">
              Brak wyników dla „{trimmed}”. Spróbuj innego słowa — albo
              wpisz „zadania”, żeby przejść do generatora.
            </p>
          ) : (
            items.map((item, index) => {
              const header =
                item.kind !== previousKind ? GROUP_LABEL[item.kind] : null;
              previousKind = item.kind;
              const active = index === activeIndex;
              return (
                <div className="cp-row" key={item.id}>
                  {header && (
                    <p className="cp-group" aria-hidden="true">
                      {header}
                    </p>
                  )}
                  <button
                    type="button"
                    className={`cp-item${active ? " is-active" : ""}`}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    tabIndex={active ? 0 : -1}
                    aria-current={active ? "true" : undefined}
                    aria-label={item.label}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(item)}
                  >
                    <span className="cp-item-icon" aria-hidden="true">
                      {item.kind === "lesson" ? (
                        <BookOpen size={17} />
                      ) : item.kind === "practice" ? (
                        <Dumbbell size={17} />
                      ) : (
                        (() => {
                          const Icon = TOOL_ICONS[item.tool!];
                          return <Icon size={17} />;
                        })()
                      )}
                    </span>
                    <span className="cp-item-body">
                      <span className="cp-item-title">{item.label}</span>
                      <span className="cp-item-meta" aria-hidden="true">
                        {item.meta}
                      </span>
                    </span>
                    <span className="cp-item-kind" aria-hidden="true">
                      {item.kind === "lesson"
                        ? "lekcja"
                        : item.kind === "practice"
                          ? "generuj"
                          : "narzędzie"}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <p className="cp-status cp-count" role="status">
          {trimmed
            ? shown === total
              ? `${total} ${pluralWynikow(total)}`
              : `Pokazano ${shown} z ${total} ${pluralWynikow(total)}`
            : "Wpisz temat, wzór albo słowo kluczowe — wyniki pojawią się tutaj."}
        </p>

        <div className="cp-footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> nawigacja
          </span>
          <span>
            <kbd>↵</kbd> wybierz
          </span>
          <span>
            <kbd>esc</kbd> zamknij
          </span>
        </div>
      </div>
    </div>
  );
}
