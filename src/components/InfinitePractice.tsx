"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Lightbulb,
  RotateCw,
  Keyboard,
  ListChecks,
  Sparkles,
  PencilRuler,
} from "lucide-react";
import confetti from "canvas-confetti";
import { generateProblem, checkProblemAnswer, checkSteps } from "@/generators";
import type { Lesson } from "@/lib/lesson";
import { MathFormula } from "./MathText";
import { useScratchpad, useScratchpadAnswer } from "./ScratchpadContext";

export default function InfinitePractice({
  lesson,
  onSolved,
  onMiss,
}: {
  lesson: Lesson;
  onSolved: (problemId: string, difficulty: number) => boolean;
  onMiss?: () => void;
}) {
  const [difficulty, setDifficulty] = useState(1);
  const [problem, setProblem] = useState(() =>
    generateProblem(lesson.generatorId, 1, 42),
  );
  const [input, setInput] = useState("");
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [solution, setSolution] = useState(false);
  const [scratch, setScratch] = useState("");
  const [stepResults, setStepResults] = useState<
    { correct: boolean; message: string }[]
  >([]);
  const [keyboard, setKeyboard] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [credited, setCredited] = useState(false);
  const { open: scratchOpen, setOpen: setScratchOpen } = useScratchpad();
  useScratchpadAnswer(problem.answer);
  useEffect(() => {
    const insert = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (typeof value !== "string") return;
      setInput(value);
      setResult(null);
    };
    window.addEventListener("omnimatma:insert-answer", insert);
    return () => window.removeEventListener("omnimatma:insert-answer", insert);
  }, []);
  function next(level = difficulty) {
    setProblem(generateProblem(lesson.generatorId, level));
    setInput("");
    setHints(0);
    setResult(null);
    setSolution(false);
    setScratch("");
    setStepResults([]);
    setAnswered(false);
    setCredited(false);
  }
  function submit() {
    const checked = checkProblemAnswer(problem, input);
    setResult(checked);
    if (!checked.correct && input.trim() && !answered && !solution) onMiss?.();
    if (checked.correct && !answered) {
      setAnswered(true);
      if (!solution) {
        const granted = onSolved(problem.id, difficulty);
        setCredited(granted);
        if (
          granted &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          void confetti({
            particleCount: 65,
            spread: 65,
            origin: { y: 0.7 },
            colors: ["#9585ff", "#5edbb7", "#f8cb75"],
          });
      }
    }
  }
  const symbols = [
    ["a/b", "(1)/(2)"],
    ["x²", "^2"],
    ["√", "sqrt()"],
    ["[A]", "[[1,0],[0,1]]"],
    ["i", "i"],
    ["π", "pi"],
    ["α", "alpha"],
    ["∫", "integral()"],
  ];
  return (
    <section
      className={`panel practice-panel ${scratchOpen ? "with-scratchpad" : ""}`}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">TWOJE MATEMATYCZNE LABORATORIUM</span>
          <h2>Teraz Twój ruch.</h2>
        </div>
        <span className="chip">
          <Sparkles size={14} /> Bez limitów
        </span>
      </div>
      <div className="difficulty">
        <span className="muted">Poziom trudności</span>
        <div>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              aria-label={`Poziom ${n}`}
              aria-pressed={difficulty === n}
              className={difficulty === n ? "active" : ""}
              onClick={() => {
                setDifficulty(n);
                next(n);
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <small>
          {
            [
              "Rozgrzewka",
              "Nabierz pewności",
              "Egzamin",
              "Wyzwanie",
              "Hardcore",
            ][difficulty - 1]
          }
        </small>
      </div>
      <motion.div
        key={problem.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="problem"
      >
        <p>{problem.prompt}</p>
        <MathFormula value={problem.latex} block />
      </motion.div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="input-label" htmlFor="answer">
          Twoja odpowiedź
        </label>
        <div className="answer-row">
          <input
            id="answer"
            className="field"
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            placeholder="np. 3/4, 2+3i lub [[1,2],[3,4]]"
            autoComplete="off"
          />
          <button
            type="button"
            className="icon-button"
            aria-label="Klawiatura matematyczna"
            aria-expanded={keyboard}
            onClick={() => setKeyboard(!keyboard)}
          >
            <Keyboard size={20} />
          </button>
          <button className="button primary" type="submit">
            Sprawdź <Check size={17} />
          </button>
        </div>
      </form>
      {keyboard && (
        <div className="math-keyboard">
          {symbols.map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setInput(input + value)}
            >
              {label}
            </button>
          ))}
          <p className="muted">
            Symbole α i ∫ służą do zapisu. Ten zestaw zadań sprawdza wartości
            liczbowe, zespolone i macierze, nie całki ani równania symboliczne.
          </p>
        </div>
      )}
      {result && (
        <div
          role="status"
          className={result.correct ? "feedback success" : "feedback error"}
        >
          {result.correct ? <Check size={18} /> : null}
          {result.message}
          {result.correct && (
            <span>
              {solution
                ? "Tryb nauki — bez XP"
                : credited
                  ? `+${difficulty * 10} XP`
                  : "Już zaliczone · bez dodatkowego XP"}
            </span>
          )}
        </div>
      )}
      <div className="practice-actions">
        <button
          className="button subtle"
          onClick={() => setHints(Math.min(problem.hints.length, hints + 1))}
        >
          <Lightbulb size={17} /> Podpowiedź {hints}/{problem.hints.length}
        </button>
        <button
          className="button subtle"
          onClick={() => {
            setSolution(true);
          }}
        >
          <ListChecks size={17} /> Rozwiązanie
        </button>
        <button className="button subtle" onClick={() => next()}>
          Nowe zadanie <RotateCw size={16} />
        </button>
      </div>
      {problem.hints.slice(0, hints).map((hint, i) => (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="hint"
          key={i}
        >
          <span>0{i + 1}</span>
          {hint}
        </motion.div>
      ))}
      {solution && (
        <div className="solution">
          <span className="eyebrow">KROK PO KROKU · DLACZEGO TAK?</span>
          {problem.steps.map((step, i) => (
            <div className="solution-step" key={i}>
              <span className="step-number">{i + 1}</span>
              <div>
                <p>{step.explanation}</p>
                <code>{step.expression}</code>
              </div>
            </div>
          ))}
          <button className="button primary" onClick={() => next()}>
            Spróbuję samodzielnie <ArrowRight size={17} />
          </button>
        </div>
      )}
      <button
        type="button"
        className="button scratchpad-launch"
        aria-label={scratchOpen ? "Zamknij brudnopis" : "Otwórz brudnopis"}
        aria-expanded={scratchOpen}
        onClick={() => setScratchOpen(!scratchOpen)}
      >
        <span>
          <PencilRuler size={17} />
          {scratchOpen ? "Zamknij brudnopis" : "Otwórz brudnopis"}
        </span>
        <small>Kroki + rysowanie · papier w kratkę</small>
      </button>
      <details className="scratchpad">
        <summary>
          Sprawdź mój krok <span className="muted">brudnopis matematyczny</span>
        </summary>
        <p className="muted">
          Wpisuj równoważne wyrażenia, po jednym w wierszu (bez znaku =).
          Sprawdzamy ich wartość, nie poprawność dowodu ani sens metody.
        </p>
        <textarea
          className="field"
          aria-label="Twoje kroki rozwiązania"
          rows={3}
          value={scratch}
          maxLength={3000}
          onChange={(e) => {
            setScratch(e.target.value);
            setStepResults([]);
          }}
          placeholder={"1/2 + 1/4\n2/4 + 1/4\n3/4"}
        />
        <button
          className="button"
          onClick={() =>
            setStepResults(
              checkSteps(
                scratch.split("\n").filter((l) => l.trim()),
                problem.answer,
              ),
            )
          }
        >
          Sprawdź kroki
        </button>
        {stepResults.map((r, i) => (
          <p key={i} className={r.correct ? "success" : "error"}>
            Krok {i + 1}: {r.message}
          </p>
        ))}
      </details>
    </section>
  );
}
