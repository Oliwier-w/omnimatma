"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import katex from "katex";
import type { Lesson } from "@/lib/lesson";
import SymbolTranslator from "./SymbolTranslator";
import FormulaXray from "./FormulaXray";
import { generateProblem, checkProblemAnswer } from "@/generators";

/** Only KaTeX-generated, trust-disabled markup is inserted into the document. */
function MathText({ expression }: { expression: string }) {
  const html = useMemo(
    () =>
      katex.renderToString(expression, {
        throwOnError: false,
        trust: false,
        strict: "ignore",
        output: "htmlAndMathml",
        maxExpand: 200,
        maxSize: 12,
      }),
    [expression],
  );
  return (
    <span
      style={{
        display: "inline-block",
        maxWidth: "100%",
        overflowX: "auto",
        verticalAlign: "middle",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const formulae = [
  {
    title: "Suma ułamków",
    topic: "Arytmetyka",
    formula: String.raw`\frac{a}{b}+\frac{c}{d}=\frac{ad+bc}{bd}`,
    example: String.raw`\frac{1}{2}+\frac{1}{3}=\frac{3+2}{6}=\frac{5}{6}`,
    note: "Mianowniki b i d muszą być różne od zera. Najpierw znajdź wspólny mianownik.",
  },
  {
    title: "Procent z liczby",
    topic: "Arytmetyka",
    formula: String.raw`p\%\cdot x=\frac{p}{100}x`,
    example: String.raw`15\%\cdot 200=0{,}15\cdot200=30`,
    note: "Procent to jedna setna całości. Nie myl procentu z punktem procentowym.",
  },
  {
    title: "Kwadrat sumy",
    topic: "Algebra",
    formula: String.raw`(a+b)^2=a^2+2ab+b^2`,
    example: String.raw`(x+3)^2=x^2+6x+9`,
    note: "Nie zgub środkowego składnika 2ab.",
  },
  {
    title: "Równanie kwadratowe",
    topic: "Algebra",
    formula: String.raw`x_{1,2}=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`,
    example: String.raw`x^2-5x+6=0\quad\Rightarrow\quad x_1=2,\ x_2=3`,
    note: "a ≠ 0. W liczbach rzeczywistych potrzebujesz Δ ≥ 0; dla Δ = 0 jest jeden pierwiastek podwójny.",
  },
  {
    title: "Twierdzenie Pitagorasa",
    topic: "Geometria",
    formula: String.raw`a^2+b^2=c^2`,
    example: String.raw`3^2+4^2=25=5^2`,
    note: "Tylko dla trójkąta prostokątnego. c jest przeciwprostokątną.",
  },
  {
    title: "Pole koła",
    topic: "Geometria",
    formula: String.raw`P=\pi r^2`,
    example: String.raw`r=3\quad\Rightarrow\quad P=9\pi`,
    note: "r oznacza promień, nie średnicę. Jednostkę pola podaj w kwadracie.",
  },
  {
    title: "Wyznacznik 2 × 2",
    topic: "Studia",
    formula: String.raw`\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc`,
    example: String.raw`\det\begin{pmatrix}1&2\\3&4\end{pmatrix}=4-6=-2`,
    note: "Macierz kwadratowa jest odwracalna wtedy i tylko wtedy, gdy jej wyznacznik jest niezerowy.",
  },
  {
    title: "Pochodna potęgi",
    topic: "Studia",
    formula: String.raw`\frac{d}{dx}x^n=nx^{n-1}`,
    example: String.raw`\frac{d}{dx}x^4=4x^3`,
    note: "Dla n naturalnego wzór działa dla każdego x; dla innych wykładników sprawdź dziedzinę i różniczkowalność.",
  },
];

function FormulaSheets({ lessons }: { lessons: Lesson[] }) {
  const [topic, setTopic] = useState("Wszystkie");
  return (
    <div>
      <p className="muted">
        Kliknij kartę, aby zobaczyć przykład i warunki użycia wzoru.
      </p>
      <Link href="/omnikumpel" className="button" style={{ margin: "12px 0" }}>Moja ściąga · rozwiązania przypięte w OmniKumplu</Link>
      <div className="tool-tabs" aria-label="Kategorie wzorów">
        {["Wszystkie", ...new Set(formulae.map((f) => f.topic))].map((item) => (
          <button
            type="button"
            className="chip"
            key={item}
            aria-pressed={topic === item}
            onClick={() => setTopic(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="tool-grid">
        {formulae
          .filter((f) => topic === "Wszystkie" || f.topic === topic)
          .map((formula) => (
            <details className="formula-card" key={formula.title}>
              <summary>
                <span className="eyebrow">{formula.topic}</span>
                <h3>{formula.title}</h3>
                <MathText expression={formula.formula} />
                <p className="muted">Pokaż przykład ↗</p>
              </summary>
              <div>
                <FormulaXray formula={formula.formula} title={formula.title} />
                <MathText expression={formula.example} />
                <p className="muted">{formula.note}</p>
              </div>
            </details>
          ))}
      </div>
      {lessons.some((lesson) => lesson.formula) && (
        <details className="panel">
          <summary>Wzory z Twoich lekcji</summary>
          <div className="tool-grid">
            {lessons
              .filter((lesson) => lesson.formula)
              .map((lesson) => (
                <article className="formula-card" key={lesson.id}>
                  <h3>{lesson.title}</h3>
                  <FormulaXray formula={lesson.formula.replace(/^\$\$?|\$\$?$/g, "")} topicId={lesson.generatorId} title={lesson.title} />
                </article>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}

type Matrix = [number, number, number, number];
const matrixLatex = (values: number[]) =>
  String.raw`\begin{pmatrix}${values.slice(0, 2).map(format).join("&")}\\${values.slice(2).map(format).join("&")}\end{pmatrix}`;
const format = (value: number) => Number(value.toFixed(6)).toString();

function MatrixLab() {
  const [a, setA] = useState<string[]>(["1", "2", "3", "4"]);
  const [b, setB] = useState<string[]>(["2", "0", "1", "2"]);
  const [operation, setOperation] = useState("add");
  const parse = (values: string[]): Matrix | null =>
    values.every(
      (v) =>
        v.trim() !== "" &&
        Number.isFinite(Number(v)) &&
        Math.abs(Number(v)) <= 1000,
    )
      ? (values.map(Number) as Matrix)
      : null;
  const A = parse(a),
    B = parse(b);
  const needsB = operation === "add" || operation === "multiply";
  let result = "",
    error = "";
  if (!A || (needsB && !B))
    error =
      "Wpisz w każdym polu liczbę od −1000 do 1000. Dla ułamków dziesiętnych użyj kropki.";
  else if (A) {
    const determinant = A[0] * A[3] - A[1] * A[2];
    if (operation === "determinant")
      result = String.raw`\det A=${format(determinant)}`;
    if (operation === "inverse") {
      // Relative guard prevents unstable inverses for nearly singular input.
      const scale = Math.max(1, ...A.map(Math.abs));
      if (Math.abs(determinant) <= 1e-12 * scale * scale)
        error =
          "Macierz osobliwa lub numerycznie bliska osobliwej: nie można bezpiecznie obliczyć odwrotności.";
      else
        result = String.raw`A^{-1}=${matrixLatex([A[3] / determinant, -A[1] / determinant, -A[2] / determinant, A[0] / determinant])}`;
    }
    if (operation === "add" && B)
      result = `A+B=${matrixLatex(A.map((value, i) => value + B[i]))}`;
    if (operation === "multiply" && B)
      result = `AB=${matrixLatex([A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]])}`;
  }
  const inputMatrix = (
    name: string,
    values: string[],
    update: (values: string[]) => void,
  ) => (
    <fieldset className="panel">
      <legend>Macierz {name} · 2 × 2</legend>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {values.map((value, i) => (
          <label key={i}>
            <span className="muted">
              {name}
              {Math.floor(i / 2) + 1}
              {(i % 2) + 1}
            </span>
            <input
              className="field"
              style={{ width: "100%", minWidth: 0 }}
              aria-label={`${name}, wiersz ${Math.floor(i / 2) + 1}, kolumna ${(i % 2) + 1}`}
              type="number"
              min={-1000}
              max={1000}
              step="any"
              value={value}
              onChange={(event) =>
                update(values.map((v, j) => (j === i ? event.target.value : v)))
              }
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <div>
      <p className="muted">
        Zmień liczby — wynik przelicza się na żywo. Precyzja wyświetlania: 6
        miejsc po przecinku.
      </p>
      <div className="tool-tabs">
        {[
          ["add", "A + B"],
          ["multiply", "A × B"],
          ["inverse", "A⁻¹"],
          ["determinant", "det A"],
        ].map(([value, label]) => (
          <button
            type="button"
            className="chip"
            aria-pressed={operation === value}
            key={value}
            onClick={() => setOperation(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tool-grid">
        {inputMatrix("A", a, setA)}
        {needsB && inputMatrix("B", b, setB)}
      </div>
      <div className="panel" role="status" aria-live="polite">
        <span className="eyebrow">Wynik</span>
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <p>
            <MathText expression={result} />
          </p>
        )}
      </div>
      <p className="muted">
        Mnożenie: element wyniku to iloczyn odpowiedniego wiersza A i kolumny B.
        Zwykle AB ≠ BA.
      </p>
    </div>
  );
}

function GraphLab() {
  const [parameters, setParameters] = useState([1, 0, 0]);
  const [a, b, c] = parameters;
  const clip = useId().replace(/:/g, "");
  const points = Array.from({ length: 401 }, (_, i) => {
    const x = -10 + i / 20;
    return `${300 + x * 28},${180 - (a * x * x + b * x + c) * 16}`;
  }).join(" ");
  const delta = b * b - 4 * a * c;
  const zeros =
    a !== 0
      ? delta < 0
        ? "brak rzeczywistych miejsc zerowych"
        : delta === 0
          ? format(-b / (2 * a))
          : `${format((-b - Math.sqrt(delta)) / (2 * a))}, ${format((-b + Math.sqrt(delta)) / (2 * a))}`
      : b !== 0
        ? format(-c / b)
        : c === 0
          ? "każda liczba rzeczywista"
          : "brak";
  return (
    <div>
      <p className="muted">
        Przesuwaj suwaki i obserwuj funkcję f(x) = ax² + bx + c. Okno: x ∈ [−10,
        10], y ∈ [−10, 10].
      </p>
      <div className="tool-grid">
        <div className="panel">
          {["a", "b", "c"].map((name, i) => (
            <label key={name} style={{ display: "block", marginBottom: 24 }}>
              <span>
                {name} = <strong>{parameters[i]}</strong>
              </span>
              <input
                style={{
                  display: "block",
                  width: "100%",
                  accentColor: "#8b5cf6",
                }}
                aria-label={`Współczynnik ${name}`}
                type="range"
                min={-5}
                max={5}
                step={0.25}
                value={parameters[i]}
                onChange={(event) =>
                  setParameters(
                    parameters.map((value, j) =>
                      i === j ? Number(event.target.value) : value,
                    ),
                  )
                }
              />
            </label>
          ))}
          <button
            type="button"
            className="button"
            onClick={() => setParameters([1, 0, 0])}
          >
            Resetuj parametry
          </button>
        </div>
        <div className="panel">
          <MathText
            expression={`f(x)=${a}x^2${b < 0 ? "" : "+"}${b}x${c < 0 ? "" : "+"}${c}`}
          />
          <p className="muted">Miejsca zerowe: {zeros}</p>
          {a !== 0 && (
            <p className="muted">
              Wierzchołek: ({format(-b / (2 * a))}; {format(-delta / (4 * a))})
            </p>
          )}
          {a === 0 && (
            <p className="muted">
              a = 0: to funkcja {b === 0 ? "stała" : "liniowa"}, nie parabola.
            </p>
          )}
        </div>
      </div>
      <svg
        viewBox="0 0 600 360"
        role="img"
        aria-label={`Wykres funkcji ${a} x kwadrat plus ${b} x plus ${c}`}
        style={{
          width: "100%",
          maxHeight: 420,
          background: "var(--surface, #12141d)",
          borderRadius: 20,
          color: "#9ca3af",
        }}
      >
        <defs>
          <clipPath id={clip}>
            <rect x="20" y="20" width="560" height="320" />
          </clipPath>
        </defs>
        {Array.from({ length: 21 }, (_, i) => (
          <g key={i}>
            <line
              x1={20 + i * 28}
              y1="20"
              x2={20 + i * 28}
              y2="340"
              stroke="currentColor"
              opacity="0.12"
            />
            <line
              x1="20"
              y1={20 + i * 16}
              x2="580"
              y2={20 + i * 16}
              stroke="currentColor"
              opacity="0.12"
            />
          </g>
        ))}
        <path d="M20 180H580 M300 20V340" stroke="currentColor" />
        <text x="566" y="170" fill="currentColor">
          x
        </text>
        <text x="310" y="32" fill="currentColor">
          y
        </text>
        <text x="306" y="196" fill="currentColor" fontSize="11">
          0
        </text>
        <text x="20" y="198" fill="currentColor" fontSize="11">
          −10
        </text>
        <text x="563" y="198" fill="currentColor" fontSize="11">
          10
        </text>
        <text x="306" y="44" fill="currentColor" fontSize="11">
          10
        </text>
        <text x="306" y="338" fill="currentColor" fontSize="11">
          −10
        </text>
        <polyline
          points={points}
          clipPath={`url(#${clip})`}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

type ExamItem = { lesson: Lesson; problem: ReturnType<typeof generateProblem> };
type Exam = {
  items: ExamItem[];
  answers: string[];
  deadline: number;
  finished: boolean;
};

function ExamLab({ lessons }: { lessons: Lesson[] }) {
  const [category, setCategory] = useState("Wszystkie");
  const [selected, setSelected] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(3);
  const [count, setCount] = useState(5);
  const [minutes, setMinutes] = useState(10);
  const [exam, setExam] = useState<Exam | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const available = lessons.filter(
    (lesson) => category === "Wszystkie" || lesson.category === category,
  );
  const pool = available.filter((lesson) => selected.includes(lesson.id));
  useEffect(() => {
    if (!exam || exam.finished) return;
    const deadline = exam.deadline;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0)
        setExam((current) =>
          current && current.deadline === deadline
            ? { ...current, finished: true }
            : current,
        );
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [exam?.deadline, exam?.finished]);

  function start() {
    setError("");
    if (!pool.length) {
      setError("Wybierz co najmniej jedną lekcję.");
      return;
    }
    try {
      const seed = Math.floor(Math.random() * 1_000_000_000);
      const items = Array.from(
        { length: Math.min(30, Math.max(1, count)) },
        (_, index) => {
          const lesson = pool[index % pool.length];
          return {
            lesson,
            problem: generateProblem(
              lesson.generatorId,
              difficulty,
              seed + index,
            ),
          };
        },
      );
      setRemaining(minutes * 60);
      setExam({
        items,
        answers: items.map(() => ""),
        deadline: Date.now() + minutes * 60_000,
        finished: false,
      });
    } catch {
      setError(
        "Nie udało się wygenerować arkusza dla tego zestawu. Wybierz inne lekcje.",
      );
    }
  }

  if (!exam)
    return (
      <div>
        <p className="muted">
          Ułóż własny arkusz. Po zakończeniu zobaczysz wyniki według tematów,
          podpowiedzi i rozwiązania. Wynik jest lokalny dla tej sesji narzędzia.
        </p>
        <div className="tool-grid">
          <label>
            Dział
            <select
              className="field"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setSelected([]);
              }}
            >
              <option>Wszystkie</option>
              {[...new Set(lessons.map((lesson) => lesson.category))].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Trudność
            <select
              className="field"
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                  {value === 1
                    ? " · rozgrzewka"
                    : value === 3
                      ? " · egzamin"
                      : value === 5
                        ? " · wyzwanie"
                        : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Liczba zadań
            <input
              className="field"
              type="number"
              min="1"
              max="30"
              value={count}
              onChange={(event) =>
                setCount(
                  Math.min(30, Math.max(1, Number(event.target.value) || 1)),
                )
              }
            />
          </label>
          <label>
            Czas w minutach
            <input
              className="field"
              type="number"
              min="1"
              max="180"
              value={minutes}
              onChange={(event) =>
                setMinutes(
                  Math.min(180, Math.max(1, Number(event.target.value) || 1)),
                )
              }
            />
          </label>
        </div>
        <fieldset className="panel">
          <legend>Lekcje · wybrano {pool.length}</legend>
          <button
            type="button"
            className="button"
            onClick={() =>
              setSelected(
                pool.length === available.length
                  ? []
                  : available.map((lesson) => lesson.id),
              )
            }
          >
            {pool.length === available.length
              ? "Odznacz wszystkie"
              : "Zaznacz wszystkie"}
          </button>
          <div className="tool-grid" style={{ marginTop: 16 }}>
            {available.map((lesson) => (
              <label className="chip" key={lesson.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(lesson.id)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, lesson.id]
                        : current.filter((id) => id !== lesson.id),
                    )
                  }
                />{" "}
                {lesson.title}
              </label>
            ))}
          </div>
          {!available.length && (
            <p className="muted">Brak lekcji w tym dziale.</p>
          )}
        </fieldset>
        <p className="muted">
          Zadania są przydzielane kolejno do wybranych lekcji; aby objąć każdą,
          ustaw liczbę zadań nie mniejszą niż liczba lekcji. Czas biegnie
          również po przełączeniu karty przeglądarki. Odświeżenie strony usuwa
          arkusz.
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="button primary"
          disabled={!pool.length}
          onClick={start}
        >
          Rozpocznij egzamin →
        </button>
      </div>
    );

  const results = exam.finished
    ? exam.items.map((item, i) =>
        checkProblemAnswer(item.problem, exam.answers[i]),
      )
    : [];
  const correct = results.filter((result) => result.correct).length;
  const topics = [...new Set(exam.items.map((item) => item.lesson.id))];
  return (
    <div>
      {exam.finished ? (
        <div className="panel" role="status">
          <span className="eyebrow">Egzamin zakończony</span>
          <h3>
            {correct} / {exam.items.length} ·{" "}
            {Math.round((correct / exam.items.length) * 100)}%
          </h3>
          <div className="tool-grid">
            {topics.map((id) => {
              const indexes = exam.items.flatMap((item, i) =>
                item.lesson.id === id ? [i] : [],
              );
              const passed = indexes.filter((i) => results[i].correct).length;
              return (
                <article className="formula-card" key={id}>
                  <strong>{exam.items[indexes[0]].lesson.title}</strong>
                  <p
                    className={passed === indexes.length ? "success" : "muted"}
                  >
                    {passed} / {indexes.length} poprawnych ·{" "}
                    {passed === indexes.length
                      ? "Dobra robota — utrwal w powtórce."
                      : "Wróć do przykładów i przećwicz ten temat."}
                  </p>
                </article>
              );
            })}
          </div>
          <button
            type="button"
            className="button"
            onClick={() => setExam(null)}
          >
            Skonfiguruj nowy arkusz
          </button>
        </div>
      ) : (
        <div className="panel">
          <span className="eyebrow">Egzamin w toku</span>
          <h3 role="timer" aria-label="Pozostały czas">
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </h3>
          <p className="muted">
            Odpowiedz na {exam.items.length} zadań. Arkusz odda się
            automatycznie po upływie czasu.
          </p>
          <button
            type="button"
            className="button primary"
            onClick={() => setExam({ ...exam, finished: true })}
          >
            Oddaj arkusz
          </button>
        </div>
      )}
      {exam.items.map(({ lesson, problem }, index) => (
        <article className="panel" key={`${index}-${problem.id}`}>
          <span className="eyebrow">
            Zadanie {index + 1} · {lesson.title}
          </span>
          <h3>{problem.prompt}</h3>
          <p>
            <MathText expression={problem.latex} />
          </p>
          <label>
            Twoja odpowiedź
            <input
              className="field"
              autoComplete="off"
              spellCheck={false}
              disabled={exam.finished}
              value={exam.answers[index]}
              onChange={(event) => {
                const answer = event.target.value.slice(0, 500);
                setExam((current) =>
                  !current || current.finished
                    ? current
                    : Date.now() >= current.deadline
                      ? { ...current, finished: true }
                      : {
                          ...current,
                          answers: current.answers.map((value, i) =>
                            i === index ? answer : value,
                          ),
                        },
                );
              }}
            />
          </label>
          {exam.finished && (
            <div>
              <p className={results[index].correct ? "success" : "error"}>
                {results[index].correct ? "✓ " : "↻ "}
                {results[index].message}
              </p>
              <p>
                Oczekiwana odpowiedź: <code>{problem.answer}</code>
              </p>
              <details>
                <summary>Podpowiedzi i rozwiązanie krok po kroku</summary>
                <ul>
                  {problem.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
                <ol>
                  {problem.steps.map((step, i) => (
                    <li key={i}>
                      <MathText expression={step.expression} />
                      <p className="muted">{step.explanation}</p>
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default function Tools({ lessons, initialTab = "formula", navigationKey = 0 }: { lessons: Lesson[]; initialTab?: "formula" | "matrix" | "graph" | "exam" | "symbols"; navigationKey?: number }) {
  const [tab, setTab] = useState<string>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab, navigationKey]);
  const id = useId();
  const tabs = [
    ["formula", "Tablice wzorów"],
    ["matrix", "Macierze"],
    ["graph", "Wykres funkcji"],
    ["exam", "Symulator egzaminu"],
    ["symbols", "Tłumacz symboli"],
  ];
  return (
    <section className="tools-content">
      <header>
        <p className="eyebrow">Twoje matematyczne laboratorium</p>
        <h2 className="section-title">Mniej liczenia. Więcej odkrywania.</h2>
        <p className="muted">
          Sprawdzaj pomysły, eksperymentuj i przygotuj własny egzamin.
        </p>
      </header>
      <div className="tool-tabs" aria-label="Narzędzia">
        {tabs.map(([value, label]) => (
          <button
            type="button"
            className={`button${tab === value ? " primary" : ""}`}
            key={value}
            aria-pressed={tab === value}
            aria-controls={`${id}-${value}`}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Keep panels mounted so the exam timer and answers survive tool switching. */}
      {tabs.map(([value, label]) => (
        <div
          id={`${id}-${value}`}
          key={value}
          hidden={tab !== value}
          role="region"
          aria-label={label}
        >
          {value === "formula" ? (
            <FormulaSheets lessons={lessons} />
          ) : value === "matrix" ? (
            <MatrixLab />
          ) : value === "graph" ? (
            <GraphLab />
          ) : value === "symbols" ? (
            <SymbolTranslator />
          ) : (
            <ExamLab lessons={lessons} />
          )}
        </div>
      ))}
      <p className="muted" style={{ marginTop: 24 }}>
        Tryb offline (wersja produkcyjna): po pierwszej wizycie można wracać do
        zapisanych stron i pobranych zasobów na tym urządzeniu. Nieodwiedzone
        strony, aktualizacje i pierwsze uruchomienie wymagają internetu.
        Przeglądarka może usunąć pamięć podręczną.
      </p>
    </section>
  );
}
