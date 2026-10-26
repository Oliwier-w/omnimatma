"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { solveSmartMath, type SmartMathResult, type SmartPracticeSpec } from "../lib/smartMath";
import "./SmartMathBar.css";

export type SmartMathBarProps = {
  onPractice: (spec: SmartPracticeSpec) => void;
  onSearch?: (query: string) => void;
  compact?: boolean;
};

const examples = ["3/4+1/2", "2x+5=13", "det([1,2;3,4])"];

/** Callbacks belong to the client parent (e.g. TasksCenter), not an RSC boundary. */
export default function SmartMathBar({ onPractice, onSearch, compact = false }: SmartMathBarProps) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const [settled, setSettled] = useState<{ input: string; result: SmartMathResult } | null>(null);
  useEffect(() => {
    if (!input.trim()) return;
    const timer = setTimeout(() => setSettled({ input, result: solveSmartMath(input) }), 180);
    return () => clearTimeout(timer);
  }, [input]);
  const result = settled?.input === input ? settled.result : null;
  const hasInput = Boolean(input.trim());
  const topic = /^[\p{L}\s-]+$/u.test(input.trim()) && /[\p{L}]{2}/u.test(input);
  const error = result && result.kind !== "solved" && !topic;

  return (
    <section className={`sm-bar${compact ? " sm-compact" : ""}`} aria-labelledby={`${id}-label`}>
      <div className="sm-heading"><span className="sm-badge" aria-hidden="true">✦</span><span>Matematyka od jednego pytania</span><span className="sm-tag">Dokładnie, krok po kroku</span></div>
      <form className="sm-form" onSubmit={(event) => { event.preventDefault(); if (topic && onSearch) onSearch(input.trim()); }}>
        <label id={`${id}-label`} htmlFor={`${id}-input`}>Wpisz działanie, równanie lub temat</label>
        <div className="sm-input-row">
          <input id={`${id}-input`} maxLength={300} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Działanie, równanie lub temat: 2x + 5 = 13, 3/4 + 1/2, det([1,2;3,4])" autoComplete="off" spellCheck={false} aria-describedby={`${id}-help`} aria-invalid={Boolean(error && result.kind === "invalid")} />
          {input && <button className="sm-clear" type="button" aria-label="Wyczyść wpis" onClick={() => { setInput(""); setSettled(null); }}>×</button>}
        </div>
        <p id={`${id}-help`} className="sm-help">Ułamki bez zaokrągleń · Równania liniowe z x · Wyznaczniki 2×2</p>
        {topic && onSearch && <button type="submit" className="sm-secondary">Szukaj tematu: {input.trim()}</button>}
      </form>
      {!hasInput && <div className="sm-examples"><span>Wypróbuj:</span>{examples.map((example) => <button type="button" key={example} onClick={() => setInput(example)}>{example}</button>)}</div>}
      <div className="sm-status" role="status" aria-live="polite" aria-atomic="true">
        {hasInput && !result && <p className="sm-help">Sprawdzam zapis…</p>}
        {result?.kind === "solved" && <p className="sm-answer"><span>Dokładny wynik</span><strong>{result.answer}</strong></p>}
        {error && <p className="sm-error">{result.message}</p>}
        {topic && result && <p className="sm-help">To wygląda na nazwę tematu. {onSearch ? "Wyszukaj go przyciskiem powyżej." : "Tutaj możesz obliczyć działanie lub rozwiązać równanie liniowe."}</p>}
      </div>
      {result?.kind === "solved" && <motion.div className="sm-result" key={input} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 26 }}>
        <details className="sm-details">
          <summary>Zobacz rozwiązanie krok po kroku <span aria-hidden="true">↓</span></summary>
          <ol>{result.steps.map((step, index) => <li key={index}><h4>{step.title}</h4><code>{step.expression}</code><p>{step.explanation}</p></li>)}</ol>
        </details>
        <button type="button" className="sm-practice" onClick={() => onPractice(result.practice)}>Wygeneruj 10 podobnych zadań</button>
      </motion.div>}
    </section>
  );
}
