"use client";

import { useId, useState } from "react";
import { MATH_SYMBOLS } from "@/lib/mathSymbols";
import { MathFormula } from "./MathText";
import "./SymbolTranslator.css";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l");
}

export default function SymbolTranslator({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MATH_SYMBOLS[0].id);
  const selected = MATH_SYMBOLS.find((item) => item.id === selectedId) ?? MATH_SYMBOLS[0];
  const search = normalize(query.trim());
  const matches = MATH_SYMBOLS.filter((item) =>
    normalize([item.symbol, item.reading, item.meaning, item.category, item.example].join(" ")).includes(search),
  );

  const content = (
    <section className={`symbols-translator${compact ? " symbols-translator--compact" : ""}`} aria-labelledby={`${id}-title`}>
      <header className="symbols-header">
        <span className="symbols-eyebrow">Od znaku do zrozumienia</span>
        <h2 id={`${id}-title`}>Tłumacz symboli matematycznych</h2>
        <p>Wybierz znak. Przeczytaj go na głos i zobacz prosty przykład.</p>
      </header>
      <input
        className="symbols-search"
        type="search"
        aria-label="Szukaj symbolu lub znaczenia"
        placeholder="Wpisz znak, np. ∑, albo słowo: suma…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-controls={`${id}-grid`}
      />
      <div className="symbols-layout">
        <div className="symbols-picker">
          <p className="symbols-count" role="status">Znalezione symbole: {matches.length}</p>
          <div className="symbols-grid" id={`${id}-grid`} role="group" aria-label="Wybierz symbol">
            {matches.map((item) => (
              <button
                key={item.id}
                type="button"
                className="symbols-button"
                aria-pressed={selected.id === item.id}
                aria-label={`${item.symbol} — ${item.reading}`}
                aria-controls={`${id}-detail`}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="symbols-glyph" aria-hidden="true">{item.symbol}</span>
                <span className="symbols-button-category">{item.category}</span>
              </button>
            ))}
          </div>
          {matches.length === 0 && <p className="symbols-empty">Brak wyników. Spróbuj wpisać „suma”, „granica” albo sam znak.</p>}
        </div>
        <div className="symbols-detail" id={`${id}-detail`} aria-live="polite" aria-atomic="true">
          <span className="symbols-category">{selected.category}</span>
          <h3 className="symbols-selected">{selected.symbol}</h3>
          <dl className="symbols-definitions">
            <dt>Jak przeczytać?</dt>
            <dd className="symbols-reading">{selected.reading}</dd>
            <dt>Co to znaczy?</dt>
            <dd>{selected.meaning}</dd>
          </dl>
          <div className="symbols-example">
            <h4>Przykład bez tajemnic</h4>
            <MathFormula value={selected.example} block />
            <p>{selected.exampleExplanation}</p>
          </div>
        </div>
      </div>
    </section>
  );

  return compact ? (
    <details className="symbol-widget">
      <summary>Jak przeczytać ten symbol?</summary>
      {content}
    </details>
  ) : content;
}
