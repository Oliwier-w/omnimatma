"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { parse } from "mathjs";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Zap,
} from "lucide-react";
import type { Lesson } from "@/lib/lesson";
import {
  buildCrashCourse,
  buildCrashTest,
  getCrashCategories,
  type CrashQuestion,
} from "@/lib/crashCourse";
import { checkProblemAnswer } from "@/generators";
import MathText, { MathFormula } from "./MathText";
import "./CrashCourse.css";

type TestSession = {
  items: CrashQuestion[];
  answers: string[];
  finished: boolean;
  seed: number;
};

export default function CrashCourse({
  lessons,
  onOpenLesson,
}: {
  lessons: Lesson[];
  onOpenLesson?: (lesson: Lesson) => void;
}) {
  const categories = useMemo(() => getCrashCategories(lessons), [lessons]);
  const [selected, setSelected] = useState<string[]>(() =>
    categories.slice(0, 1),
  );
  const [test, setTest] = useState<TestSession | null>(null);
  const [error, setError] = useState("");
  const id = useId();
  const reduceMotion = useReducedMotion();
  const selection = selected.filter((category) =>
    categories.includes(category),
  );
  const groups = buildCrashCourse(lessons, selection);
  const active = !!test && !test.finished;
  const results = test?.finished
    ? test.items.map((item, i) =>
        checkProblemAnswer(item.problem, test.answers[i]),
      )
    : [];

  function startTest() {
    try {
      let seed = Math.floor(Math.random() * 0x100000000);
      if (seed === test?.seed) seed = (seed + 1) >>> 0;
      const items = buildCrashTest(lessons, selection, seed);
      setTest({ items, answers: items.map(() => ""), finished: false, seed });
      setError("");
    } catch {
      setError("Nie udało się utworzyć testu. Sprawdź wybrane działy.");
    }
  }

  return (
    <section className="crash-course" aria-labelledby={`${id}-title`}>
      <header className="panel crash-hero">
        <div className="crash-hero-icon" aria-hidden="true">
          <Zap size={26} />
        </div>
        <div>
          <p className="eyebrow">Plan na ostatnią prostą</p>
          <h1 className="section-title" id={`${id}-title`}>
            Kolokwium / Sprawdzian jutro
          </h1>
          <p className="muted">
            Wybierz działy. Przypomnij podstawowe pojęcia, sprawdź warunki
            wzorów i rozwiąż krótki test.
          </p>
          <p className="crash-scope">
            To powtórka fundamentów z dostępnych lekcji, nie pełny program ani
            prognoza pytań na egzaminie.
          </p>
        </div>
      </header>

      <fieldset
        className="panel crash-selection"
        disabled={active}
        aria-describedby={`${id}-selection-help`}
      >
        <legend>1. Wybierz działy do powtórki</legend>
        <div className="crash-categories">
          {categories.map((category) => (
            <label
              className={`crash-category${selection.includes(category) ? " crash-category-selected" : ""}`}
              key={category}
            >
              <input
                type="checkbox"
                checked={selection.includes(category)}
                onChange={(event) => {
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, category]
                      : current.filter((item) => item !== category),
                  );
                  setError("");
                  setTest(null);
                }}
              />
              <span>{category}</span>
            </label>
          ))}
          <button
            type="button"
            className="button"
            disabled={!selection.length}
            onClick={() => {
              setSelected([]);
              setTest(null);
            }}
          >
            Wyczyść wybór
          </button>
        </div>
      </fieldset>
      <p className="muted crash-help" id={`${id}-selection-help`}>
        {active
          ? "Wybór jest zablokowany do oddania testu, aby nie utracić wpisanych odpowiedzi."
          : "Możesz połączyć kilka działów. Każdy wnosi do testu maksymalnie 2 różne tematy."}
      </p>

      {!groups.length && (
        <div className="panel crash-empty">
          <BookOpen aria-hidden="true" />
          <h3>Od czego zaczynamy?</h3>
          <p className="muted">
            Zaznacz co najmniej jeden dostępny dział, aby zobaczyć wzory i
            uruchomić test.
          </p>
        </div>
      )}

      {groups.map((group) => (
        <section
          className="crash-group"
          key={group.category}
          aria-label={`Powtórka: ${group.category}`}
        >
          <div className="crash-section-heading">
            <h3>2. Fundamenty · {group.category}</h3>
            <span className="muted">
              {group.lessons.length} kluczowe tematy
            </span>
          </div>
          <div className="crash-grid">
            {group.lessons.map((lesson, index) => (
              <motion.article
                className="panel crash-card"
                key={lesson.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 28,
                  delay: index * 0.025,
                }}
              >
                <span className="eyebrow">
                  Podstawowe pojęcie {String(index + 1).padStart(2, "0")}
                </span>
                <h4>{lesson.title}</h4>
                <div className="crash-formula">
                  <MathFormula
                    value={lesson.formula.replace(/^\$\$?|\$\$?$/g, "")}
                    block
                  />
                </div>
                <MathText
                  text={lesson.modes.academic.split(/\n\s*\n|\n\$\$/)[0]}
                />
                <details className="crash-pitfalls">
                  <summary>Uważaj na te pułapki</summary>
                  <MathText text={lesson.pitfalls} />
                </details>
                {onOpenLesson && (
                  <button
                    type="button"
                    className="button crash-lesson-link"
                    onClick={() => onOpenLesson(lesson)}
                  >
                    Otwórz pełną lekcję{" "}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                )}
              </motion.article>
            ))}
          </div>
        </section>
      ))}

      <section
        className="panel crash-test"
        aria-labelledby={`${id}-test-title`}
      >
        <div className="crash-section-heading">
          <div>
            <p className="eyebrow">Bez presji · bez punktów XP</p>
            <h3 id={`${id}-test-title`}>
              <ClipboardCheck size={21} aria-hidden="true" /> 3. Szybki test
            </h3>
          </div>
          <span className="crash-level">Poziom 2 / 5</span>
        </div>
        <p className="muted">
          Po 2 zadania na wybrany dział, maksymalnie 6. Test obejmuje próbkę
          tematów, nie wszystkie pokazane pojęcia. Wynik nie potwierdza
          opanowania całego działu. Losowania mogą się powtarzać.
        </p>
        {!active && (
          <div className="crash-actions">
            <button
              type="button"
              className="button primary"
              disabled={!groups.length}
              onClick={startTest}
            >
              {test
                ? "Spróbuj ponownie · nowy zestaw"
                : "Rozpocznij szybki test"}
            </button>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {test && (
          <>
            {test.finished ? (
              <div className="crash-results" role="status">
                <CheckCircle2 aria-hidden="true" />
                <h4>
                  Wynik: {results.filter((result) => result.correct).length} /{" "}
                  {test.items.length}
                </h4>
                <p className="muted">
                  Analiza dotyczy tylko poniższych zadań. Przy błędzie wróć do
                  wskazanej lekcji i prześledź rozwiązanie.
                </p>
                <ul>
                  {test.items.map(({ lesson }, i) => (
                    <li key={`${lesson.id}-${i}`}>
                      {lesson.category} · {lesson.title}:{" "}
                      <strong>
                        {results[i].correct
                          ? "1 / 1 — poprawnie w tej próbie"
                          : "0 / 1 — temat do powtórki"}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="crash-test-notice">
                Rozwiązania i podpowiedzi pojawią się dopiero po oddaniu.
                Odpowiedzi są przechowywane tylko w tej sesji strony.
              </p>
            )}
            <div className="crash-questions">
              {test.items.map(({ lesson, problem }, index) => (
                <article
                  className="crash-question"
                  key={`${test.seed}-${index}`}
                >
                  <p className="eyebrow">
                    Zadanie {index + 1} · {lesson.category} · {lesson.title}
                  </p>
                  <h4>{problem.prompt}</h4>
                  <MathFormula value={problem.latex} block />
                  <label className="crash-answer">
                    Twoja odpowiedź
                    <input
                      className="field"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      maxLength={500}
                      disabled={test.finished}
                      value={test.answers[index]}
                      onChange={(event) => {
                        const value = event.target.value;
                        setTest((current) =>
                          !current || current.finished
                            ? current
                            : {
                                ...current,
                                answers: current.answers.map((answer, i) =>
                                  i === index ? value : answer,
                                ),
                              },
                        );
                      }}
                    />
                  </label>
                  {test.finished && (
                    <div className="crash-solution">
                      <p
                        className={results[index].correct ? "success" : "error"}
                      >
                        {results[index].message}
                      </p>
                      <p>
                        Oczekiwana odpowiedź: <code>{problem.answer}</code>
                      </p>
                      <details>
                        <summary>
                          Podpowiedzi i wyjaśnienie krok po kroku
                        </summary>
                        <ul>
                          {problem.hints.map((hint, i) => (
                            <li key={i}>
                              <MathText text={hint} />
                            </li>
                          ))}
                        </ul>
                        <ol>
                          {problem.steps.map((step, i) => (
                            <li key={i}>
                              <MathFormula
                                value={parse(step.expression).toTex({
                                  parenthesis: "keep",
                                })}
                              />
                              <MathText text={step.explanation} />
                            </li>
                          ))}
                        </ol>
                      </details>
                      {onOpenLesson && (
                        <button
                          type="button"
                          className="button"
                          onClick={() => onOpenLesson(lesson)}
                        >
                          Powtórz: {lesson.title}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
            {active && (
              <button
                type="button"
                className="button primary"
                onClick={() =>
                  setTest((current) =>
                    current ? { ...current, finished: true } : current,
                  )
                }
              >
                Oddaj test i zobacz analizę
              </button>
            )}
          </>
        )}
      </section>
    </section>
  );
}
