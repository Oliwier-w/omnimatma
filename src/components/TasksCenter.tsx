"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Compass,
  Dices,
  GraduationCap,
  HelpCircle,
  Infinity as InfinityIcon,
  Keyboard,
  Layers3,
  Lightbulb,
  ListChecks,
  PencilRuler,
  RotateCw,
  Share2,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { Lesson } from "@/lib/lesson";
import { checkProblemAnswer } from "@/generators";
import {
  buildMasterCatalog,
  filterMasterTopics,
  generateMasterProblem,
  randomMasterSeed,
  type MasterDifficulty,
  type MasterLevel,
  type MasterProblem,
  type MasterTopic,
} from "@/generators/masterGenerator";
import MathText, { MathFormula } from "./MathText";
import { useScratchpad } from "./ScratchpadContext";
import "./TasksCenter.css";
import { problemPath, type ProblemLink } from "@/lib/problemLink";
import { generateSmartPractice, smartPracticeTopicId, type SmartPracticeSpec } from "@/lib/smartMath";
import SymbolTranslator from "./SymbolTranslator";
import { useOmniKumpel, useOmniQuestion } from "./OmniKumpelContext";
import { generateOmniPractice, omniPracticeTopicId } from "@/lib/omnikumpelEngine";
import type { OmniPracticeSpec } from "@/lib/omnikumpelTypes";

const LEVEL_OPTIONS: { id: MasterLevel | "all"; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "podstawowka", label: "Podstawówka" },
  { id: "liceum", label: "Liceum" },
  { id: "studia", label: "Studia" },
];

const LEVEL_LABELS: Record<MasterLevel, string> = {
  podstawowka: "Podstawówka",
  liceum: "Liceum",
  studia: "Studia",
};

const DIFFICULTY_OPTIONS: { id: MasterDifficulty; label: string }[] = [
  { id: 1, label: "1" },
  { id: 2, label: "2" },
  { id: 3, label: "3" },
  { id: 4, label: "4" },
  { id: 5, label: "5" },
  { id: "mixed", label: "Mieszane" },
];

const DIFFICULTY_NAMES = [
  "Rozgrzewka",
  "Nabierz pewności",
  "Poziom egzaminacyjny",
  "Wyzwanie",
  "Hardcore",
];

const MODE_OPTIONS = [
  { id: "single", label: "Pojedyncze zadanie" },
  { id: "series5", label: "Seria 5" },
  { id: "series10", label: "Seria 10" },
  { id: "series20", label: "Seria 20" },
  { id: "infinite", label: "Nieskończoność" },
] as const;

type Mode = (typeof MODE_OPTIONS)[number]["id"];
type Round = MasterProblem & { seed: number };

function createRound(
  topic: MasterTopic,
  difficulty: MasterDifficulty,
  seed: number,
  smart?: SmartPracticeSpec,
  omni?: OmniPracticeSpec,
): Round {
  const base = generateMasterProblem(topic.id, difficulty, seed);
  if (omni) {
    const problem = generateOmniPractice(omni, seed, base.effectiveDifficulty);
    return { ...base, problem, topic: { ...topic, label: "Podobne zadania · OmniKumpel" }, deepSteps: problem.steps.map((step) => `${step.explanation} Zapis kontrolny: ${step.expression}.`), seed };
  }
  if (!smart) return { ...base, seed };
  const problem = generateSmartPractice(smart, seed, base.effectiveDifficulty);
  return { ...base, problem, topic: { ...topic, label: "Podobne zadania · Smart Math" }, deepSteps: problem.steps.map((step) => `${step.explanation} Zapis kontrolny: ${step.expression}.`), seed };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function seriesTargetFor(mode: Mode): number {
  return mode === "series5" ? 5 : mode === "series10" ? 10 : mode === "series20" ? 20 : 0;
}

function topicCountLabel(count: number): string {
  return count === 1 ? "1 temat" : `${count} tematów`;
}

function drawSeed(previous?: number): number {
  let seed = randomMasterSeed();
  if (previous !== undefined && seed === previous) seed = (seed + 1) >>> 0;
  return seed;
}

export default function TasksCenter({
  lessons,
  onSolved,
  initialTopicId,
  initialProblem,
}: {
  lessons: Lesson[];
  onSolved: (problemId: string, difficulty: number, lessonId?: string) => boolean;
  initialTopicId?: string;
  initialProblem?: ProblemLink;
}) {
  const catalog = useMemo(() => buildMasterCatalog(lessons), [lessons]);
  const requestedTopic = initialProblem?.topicId ?? initialTopicId;
  const initialTopic = catalog.find((topic) => topic.lessonId === requestedTopic) ?? catalog[0];
  const [round, setRound] = useState<Round | null>(() =>
    initialTopic ? createRound(initialTopic, (initialProblem?.difficulty ?? 1) as MasterDifficulty, initialProblem?.seed ?? 20261025, initialProblem?.smart, initialProblem?.omni) : null,
  );
  const [activeTopicId, setActiveTopicId] = useState(initialTopic?.id ?? "");
  const [level, setLevel] = useState<MasterLevel | "all">("all");
  const [category, setCategory] = useState("all");
  const [topicChoice, setTopicChoice] = useState(requestedTopic ? initialTopic?.id ?? "all" : "all");
  const [difficulty, setDifficulty] = useState<MasterDifficulty>((initialProblem?.difficulty ?? 1) as MasterDifficulty);
  const [mode, setMode] = useState<Mode>(initialProblem?.mode ?? "single");
  const [shareStatus, setShareStatus] = useState("");
  const [shareFallback, setShareFallback] = useState("");
  const filterSignature = useRef<string | null>(initialProblem ? JSON.stringify(["all", "all", requestedTopic, initialProblem.difficulty, initialProblem.mode ?? "single"]) : null);
  const [seriesDone, setSeriesDone] = useState(0);
  const [seriesComplete, setSeriesComplete] = useState(false);
  const [input, setInput] = useState("");
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof checkProblemAnswer> | null>(null);
  const [solution, setSolution] = useState(false);
  const { revealed, reveal, setQuestion, openHelper } = useOmniKumpel();
  useEffect(() => { if (solution && round) reveal(`task:${round.problem.id}`); }, [solution, round, reveal]);
  const [deepOpen, setDeepOpen] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  const [creditStatus, setCreditStatus] = useState<
    "none" | "granted" | "duplicate"
  >("none");
  const answerRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<() => void>(() => {});
  const creditedRef = useRef<Set<string>>(new Set());
  const { setOpen: setScratchOpen } = useScratchpad();
  useOmniQuestion(round ? { id: `task:${round.problem.id}`, title: round.topic.label, prompt: round.problem.prompt, problem: round.problem } : undefined);
  const askOmniStep = (index: number) => {
    if (!round) return;
    const step = round.problem.steps[index];
    setQuestion({
      id: `task-step:${round.problem.id}:${index}`,
      title: `${round.topic.label} · krok ${index + 1}`,
      prompt: `${round.problem.prompt}\n\nKrok ${index + 1}: ${step.explanation}\nZapis kontrolny: ${step.expression}`,
      problem: round.problem,
      lessonHint: step.explanation,
    });
    setScratchOpen(false);
    openHelper("tutor");
  };

  const levelTopics = useMemo(
    () => filterMasterTopics(catalog, level, "all"),
    [catalog, level],
  );
  const categories = useMemo(
    () => [...new Set(levelTopics.map((topic) => topic.category))],
    [levelTopics],
  );
  const safeCategory =
    category !== "all" && categories.includes(category) ? category : "all";
  const topicOptions = useMemo(
    () => filterMasterTopics(catalog, level, safeCategory),
    [catalog, level, safeCategory],
  );
  const safeTopicChoice =
    topicChoice !== "all" &&
    topicOptions.some((topic) => topic.id === topicChoice)
      ? topicChoice
      : "all";
  const pool = useMemo(
    () =>
      filterMasterTopics(catalog, level, safeCategory).filter(
        (topic) =>
          safeTopicChoice === "all" || topic.id === safeTopicChoice,
      ),
    [catalog, level, safeCategory, safeTopicChoice],
  );
  const activeSmart = initialProblem?.smart && safeTopicChoice === smartPracticeTopicId(initialProblem.smart) ? initialProblem.smart : undefined;
  const customFor = (topic: MasterTopic) => activeSmart && topic.id === smartPracticeTopicId(activeSmart) ? activeSmart : undefined;
  const activeOmni = initialProblem?.omni && safeTopicChoice === omniPracticeTopicId(initialProblem.omni) ? initialProblem.omni : undefined;
  const omniFor = (topic: MasterTopic) => activeOmni && topic.id === omniPracticeTopicId(activeOmni) ? activeOmni : undefined;

  const seriesTarget = seriesTargetFor(mode);
  const modeLabel =
    MODE_OPTIONS.find((option) => option.id === mode)?.label ??
    "Pojedyncze zadanie";
  const selectedTopic = round?.topic;
  const levelText = selectedTopic
    ? LEVEL_LABELS[selectedTopic.level]
    : "Wszystkie poziomy";
  const difficultyText = round
    ? difficulty === "mixed"
      ? `Mieszane · poziom ${round.effectiveDifficulty}`
      : `Poziom ${round.effectiveDifficulty} · ${DIFFICULTY_NAMES[round.effectiveDifficulty - 1]}`
    : "Poziom 1 · Rozgrzewka";
  const progressPercent = seriesTarget
    ? Math.round((seriesDone / seriesTarget) * 100)
    : 0;

  function resetInteraction() {
    setShareStatus("");
    setShareFallback("");
    setInput("");
    setHints(0);
    setResult(null);
    setSolution(false);
    setDeepOpen([]);
    setAnswered(false);
    setCreditStatus("none");
  }

  function applyRound(next: Round, topic: MasterTopic, resetSeries: boolean) {
    setRound(next);
    setActiveTopicId(topic.id);
    resetInteraction();
    if (resetSeries) {
      setSeriesDone(0);
      setSeriesComplete(false);
    }
  }

  useEffect(() => {
    const signature = JSON.stringify([level, safeCategory, safeTopicChoice, difficulty, mode]);
    if (filterSignature.current === signature) return;
    filterSignature.current = signature;
    const candidates = filterMasterTopics(catalog, level, safeCategory).filter(
      (topic) => safeTopicChoice === "all" || topic.id === safeTopicChoice,
    );
    if (!candidates.length) {
      setRound(null);
      setActiveTopicId("");
      return;
    }
    const topic = candidates[0];
    applyRound(
      createRound(topic, difficulty, randomMasterSeed(), customFor(topic), omniFor(topic)),
      topic,
      true,
    );
    // Filters and the mode define a new training round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, level, safeCategory, safeTopicChoice, difficulty, mode]);

  function startNewSeries() {
    const candidates = filterMasterTopics(catalog, level, safeCategory).filter(
      (topic) => safeTopicChoice === "all" || topic.id === safeTopicChoice,
    );
    if (!candidates.length) return;
    const topic =
      candidates.find((item) => item.id === activeTopicId) ?? candidates[0];
    applyRound(
      createRound(topic, difficulty, drawSeed(round?.seed), customFor(topic), omniFor(topic)),
      topic,
      true,
    );
  }

  function drawNext() {
    if (seriesComplete) {
      startNewSeries();
      return;
    }
    const candidates = filterMasterTopics(catalog, level, safeCategory).filter(
      (topic) => safeTopicChoice === "all" || topic.id === safeTopicChoice,
    );
    if (!candidates.length) return;
    let topic =
      candidates.find((item) => item.id === activeTopicId) ?? candidates[0];
    if (safeTopicChoice === "all" && candidates.length > 1) {
      const index = candidates.findIndex((item) => item.id === activeTopicId);
      topic = candidates[(index + 1) % candidates.length];
    }
    let seed = drawSeed(round?.seed);
    let next = createRound(topic, difficulty, seed, customFor(topic), omniFor(topic));
    let guard = 0;
    while (round && next.problem.id === round.problem.id && guard < 8) {
      seed = drawSeed(round.seed);
      next = createRound(topic, difficulty, seed, customFor(topic), omniFor(topic));
      guard++;
    }
    applyRound(next, topic, false);
  }

  useEffect(() => {
    nextRef.current = drawNext;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, button, select, summary, a, [contenteditable='true']",
        )
      )
        return;
      event.preventDefault();
      nextRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onInsert = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (typeof value !== "string") return;
      setInput(value);
      answerRef.current?.focus();
    };
    window.addEventListener("omnimatma:insert-answer", onInsert);
    return () =>
      window.removeEventListener("omnimatma:insert-answer", onInsert);
  }, []);

  function submit() {
    if (!round || answered) return;
    const checked = checkProblemAnswer(round.problem, input);
    setResult(checked);
    if (!checked.correct) return;
    setAnswered(true);
    if (creditStatus === "none" && !solution && !revealed.has(`task:${round.problem.id}`)) {
      if (creditedRef.current.has(round.problem.id)) {
        setCreditStatus("duplicate");
      } else {
        creditedRef.current.add(round.problem.id);
        const granted = onSolved(round.problem.id, round.effectiveDifficulty, round.topic.lessonId);
        setCreditStatus(granted ? "granted" : "duplicate");
        if (granted && !prefersReducedMotion()) {
          void confetti({
            particleCount: 65,
            spread: 65,
            origin: { y: 0.7 },
            colors: ["#9585ff", "#5edbb7", "#f8cb75"],
          });
        }
      }
    }
    if (seriesTarget) {
      const nextDone = Math.min(seriesTarget, seriesDone + 1);
      setSeriesDone(nextDone);
      if (nextDone >= seriesTarget) setSeriesComplete(true);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function revealHint(index: number) {
    setHints((current) => Math.max(current, index + 1));
  }

  function toggleDeep(index: number) {
    setDeepOpen((current) => {
      const next = [...current];
      next[index] = !next[index];
      return next;
    });
  }

  function resetFilters() {
    setLevel("all");
    setCategory("all");
    setTopicChoice("all");
  }
  async function shareProblem() {
    if (!round) return;
    const href = new URL(problemPath({ topicId: round.topic.id, difficulty: round.effectiveDifficulty, seed: round.seed, ...(customFor(round.topic) ? { smart: customFor(round.topic) } : {}), ...(omniFor(round.topic) ? { omni: omniFor(round.topic) } : {}) }), window.location.origin).href;
    try {
      await navigator.clipboard.writeText(href);
      setShareFallback("");
      setShareStatus("Link skopiowany. Na drugim urządzeniu otworzy dokładnie ten sam przykład.");
    } catch {
      setShareFallback(href);
      setShareStatus("Przeglądarka zablokowała schowek. Zaznacz i skopiuj link poniżej.");
    }
  }

  return (
    <div className="tasks-center">
      <section className="panel tasks-hero">
        <div className="tasks-hero-copy">
          <span className="eyebrow">NIESKOŃCZONY TRENING · BEZ LIMITÓW</span>
          <h1>Trenuj tak długo, jak chcesz.</h1>
          <p>
            Wybierz poziom, dział i temat. Generator ułoży zadanie, a Ty
            decydujesz, kiedy kończysz.
          </p>
          <div className="tasks-hero-meta">
            <span className="tasks-pill">
              <Target size={14} />
              {selectedTopic?.label ?? "Wybierz temat"}
            </span>
            <span className="tasks-pill">
              <GraduationCap size={14} />
              {levelText}
            </span>
            <span className="tasks-pill">
              <Zap size={14} />
              {difficultyText}
            </span>
          </div>
        </div>
        <div className="tasks-hero-side">
          <div className="tasks-orbit" aria-hidden="true">
            <span>∞</span>
            <i />
            <i />
          </div>
          <small>
            {catalog.length} mikro-tematów · {categories.length} działów
          </small>
        </div>
      </section>

      <section className="panel tasks-filters" aria-label="Filtry treningu">
        <div className="tasks-filter-group">
          <span>Poziom</span>
          <div className="tasks-segments">
            {LEVEL_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={level === option.id}
                onClick={() => setLevel(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tasks-filter-group">
          <span>Dział</span>
          <label className="tasks-select">
            <Layers3 size={14} />
            <select
              aria-label="Dział"
              value={safeCategory}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Wszystkie</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>

        <div className="tasks-filter-group">
          <span>Podtemat</span>
          <label className="tasks-select">
            <Target size={14} />
            <select
              aria-label="Podtemat"
              value={safeTopicChoice}
              onChange={(event) => setTopicChoice(event.target.value)}
            >
              <option value="all">Wszystkie</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>

        <div className="tasks-filter-group">
          <span>Trudność</span>
          <div className="tasks-segments tasks-segments-compact">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={difficulty === option.id}
                onClick={() => setDifficulty(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tasks-filter-group tasks-filter-mode">
          <span>Tryb</span>
          <div className="tasks-segments">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={mode === option.id}
                onClick={() => setMode(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tasks-filter-summary">
          <span>{topicCountLabel(pool.length)} w puli</span>
          <small>Bez limitu zadań</small>
        </div>
      </section>

      <div className="tasks-layout">
        <section className="panel tasks-main">
          {seriesComplete ? (
            <motion.div
              className="tasks-complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="tasks-complete-icon">
                <Trophy size={30} />
              </span>
              <span className="eyebrow">SERIA UKOŃCZONA</span>
              <h2>
                {seriesDone} z {seriesTarget} poprawnych odpowiedzi.
              </h2>
              <p className="muted">
                Świetny rytm. Zacznij kolejną serię albo zmień filtr i przejdź
                do innego działu.
              </p>
              <button
                type="button"
                className="button primary tasks-complete-button"
                onClick={startNewSeries}
              >
                <RotateCw size={16} /> Nowa seria
              </button>
            </motion.div>
          ) : round ? (
            <motion.div
              key={round.problem.id}
              className="tasks-problem"
              data-problem-id={round.problem.id}
              data-seed={round.seed}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="tasks-problem-head">
                <div>
                  <span className="eyebrow">
                    {seriesTarget ? "SERIA W TOKU" : "TRENING"} ·{" "}
                    {round.topic.category}
                  </span>
                  <h2>{round.topic.label}</h2>
                </div>
                <div className="tasks-problem-badges">
                  <span className="tasks-badge">{levelText}</span>
                  <span className="tasks-badge tasks-badge-accent">
                    {difficultyText}
                  </span>
                </div>
              </div>

              {seriesTarget > 0 && (
                <div className="tasks-series-strip">
                  <span>
                    Seria {seriesDone} / {seriesTarget}
                  </span>
                  <div className="tasks-series-track">
                    <span
                      style={
                        {
                          "--tasks-progress": `${progressPercent}%`,
                        } as CSSProperties
                      }
                    />
                  </div>
                  <small>{seriesTarget - seriesDone} do końca</small>
                </div>
              )}

              <p className="tasks-prompt">{round.problem.prompt}</p>
              <div className="tasks-formula">
                <MathFormula value={round.problem.latex} block />
              </div>

              <form className="tasks-answer-form" onSubmit={onSubmit}>
                <label className="tasks-answer-label" htmlFor="tasks-answer">
                  Twoja odpowiedź
                </label>
                <div className="tasks-answer-row">
                  <input
                    ref={answerRef}
                    id="tasks-answer"
                    className="field tasks-answer-field"
                    value={input}
                    maxLength={500}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="np. 3/4, 2+3i lub [[1,2],[3,4]]"
                  />
                  <button
                    className="button primary tasks-check"
                    type="submit"
                  >
                    <Check size={17} /> Sprawdź
                  </button>
                  <button
                    className="button tasks-next"
                    type="button"
                    onClick={drawNext}
                  >
                    <Dices size={17} /> Wylosuj kolejne
                    <span className="tasks-button-key">Spacja / Enter</span>
                  </button>
                </div>
              </form>

              <div className="tasks-keyboard-hint">
                <Keyboard size={13} />
                Enter w polu odpowiedzi sprawdza. Spacja lub Enter poza polem
                losuje kolejne zadanie.
              </div>

              <AnimatePresence initial={false}>
                {result && (
                  <motion.div
                    key={`${round.problem.id}-${result.correct}`}
                    role="status"
                    className={`tasks-feedback ${
                      result.correct ? "is-correct" : result.status === "trap" ? "is-trap" : "is-wrong"
                    }`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="tasks-feedback-icon">
                      {result.correct ? (
                        <CircleCheck size={18} />
                      ) : (
                        <X size={18} />
                      )}
                    </span>
                    <p>
                      {result.message}
                    </p>
                    {result.correct && (
                      <span className="tasks-feedback-xp">
                        {creditStatus === "granted"
                          ? `+${round.effectiveDifficulty * 10} XP`
                          : creditStatus === "duplicate"
                            ? "Już zaliczone · bez dodatkowego XP"
                             : revealed.has(`task:${round.problem.id}`) || solution ? "Rozwiązanie ujawnione · trening bez XP" : ""}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="tasks-actions">
                <div className="tasks-hint-buttons">
                  {round.problem.hints.slice(0, 3).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`tasks-hint-button ${
                        index < hints ? "is-open" : ""
                      }`}
                      aria-expanded={index < hints}
                      onClick={() => revealHint(index)}
                    >
                      <Lightbulb size={14} /> Podpowiedź {index + 1}
                    </button>
                  ))}
                </div>
                <button type="button" className="tasks-scratch tasks-share" onClick={shareProblem} aria-label="Udostępnij to zadanie (Kopiuj link)"><Share2 size={15} /> Kopiuj link</button>
                <button
                  type="button"
                  className="tasks-scratch"
                  onClick={() => setScratchOpen(true)}
                >
                  <PencilRuler size={15} /> Otwórz brudnopis
                </button>
              </div>
              <p className="tasks-share-status" role="status">{shareStatus}</p>
              {shareFallback && <label className="tasks-share-fallback">Link do tego zadania<input readOnly aria-label="Link do zadania" value={shareFallback} onFocus={(event) => event.currentTarget.select()} /></label>}

              <AnimatePresence initial={false}>
                {round.problem.hints.slice(0, hints).map((hint, index) => (
                  <motion.div
                    key={`${round.problem.id}-hint-${index}`}
                    className="tasks-hint"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span>0{index + 1}</span>
                    <MathText text={hint} />
                  </motion.div>
                ))}
              </AnimatePresence>

              <details
                className="tasks-solution"
                open={solution}
                onToggle={(event) => setSolution(event.currentTarget.open)}
              >
                <summary>
                  <span>
                    <ListChecks size={16} /> Rozwiązanie krok po kroku
                  </span>
                  <span className="tasks-solution-count">
                    {round.problem.steps.length} kroków
                  </span>
                  <ChevronDown size={16} />
                </summary>
                <div className="tasks-steps">
                  {round.problem.steps.map((step, index) => (
                    <article className="tasks-step" key={index}>
                      <span className="tasks-step-number">{index + 1}</span>
                      <div className="tasks-step-body">
                        <p>{step.explanation}</p>
                        <code>{step.expression}</code>
                        <div className="tasks-step-actions">
                          <button
                            type="button"
                            className="tasks-deep-toggle"
                            aria-expanded={Boolean(deepOpen[index])}
                            onClick={() => toggleDeep(index)}
                          >
                            <HelpCircle size={14} /> Nie rozumiem tego kroku
                          </button>
                          <button
                            type="button"
                            className="tasks-deep-toggle tasks-ask-omni"
                            onClick={() => askOmniStep(index)}
                          >
                            🤖 Zapytaj OmniKumpla o ten krok
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {deepOpen[index] && (
                            <motion.p
                              className="tasks-deep"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              {round.deepSteps[index]}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </article>
                  ))}
                </div>
              </details>
              <SymbolTranslator compact />
            </motion.div>
          ) : (
            <div className="tasks-empty">
              <Compass size={28} />
              <h2>Brak tematów w tym filtrze.</h2>
              <p className="muted">
                Zmień poziom lub dział, aby wrócić do treningu.
              </p>
              <button
                type="button"
                className="button"
                onClick={resetFilters}
              >
                Wyczyść filtry
              </button>
            </div>
          )}
        </section>

        <aside className="tasks-side">
          <section className="panel tasks-side-card">
            <span className="eyebrow">TWOJA SESJA</span>
            <h3>{seriesTarget ? `${seriesDone} / ${seriesTarget}` : "Bez limitu"}</h3>
            <p className="muted">
              {seriesTarget
                ? "Liczba poprawnych odpowiedzi w tej serii."
                : "Zadania kończą się tylko wtedy, gdy Ty je zamkniesz."}
            </p>
            {seriesTarget ? (
              <div
                className="tasks-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={seriesTarget}
                aria-valuenow={seriesDone}
              >
                <span
                  style={
                    {
                      "--tasks-progress": `${progressPercent}%`,
                    } as CSSProperties
                  }
                />
              </div>
            ) : (
              <div className="tasks-infinity">
                <InfinityIcon size={30} />
                <span>∞</span>
              </div>
            )}
            <dl className="tasks-session-list">
              <div>
                <dt>Tryb</dt>
                <dd>{modeLabel}</dd>
              </div>
              <div>
                <dt>Poziom</dt>
                <dd>{difficultyText}</dd>
              </div>
              <div>
                <dt>Temat</dt>
                <dd>{selectedTopic?.label ?? "—"}</dd>
              </div>
              <div>
                <dt>Pula</dt>
                <dd>{topicCountLabel(pool.length)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel tasks-side-card">
            <span className="eyebrow">SKRÓTY</span>
            <div className="tasks-shortcut">
              <span>Sprawdź odpowiedź</span>
              <kbd>Enter</kbd>
            </div>
            <div className="tasks-shortcut">
              <span>Następne zadanie</span>
              <kbd>Spacja</kbd>
            </div>
            <div className="tasks-shortcut">
              <span>Wyszukiwarka</span>
              <kbd>⌘ K</kbd>
            </div>
            <p className="muted">
              Skróty losowania działają poza polem odpowiedzi. Ctrl/Cmd+K
              zostaje dla wyszukiwarki.
            </p>
          </section>

          <section className="panel tasks-side-card tasks-side-note">
            <Sparkles size={18} />
            <h3>Zero limitów.</h3>
            <p className="muted">
              Każde losowanie to nowe ziarno i nowe zadanie. Bez serduszek,
              blokad i reklam.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
