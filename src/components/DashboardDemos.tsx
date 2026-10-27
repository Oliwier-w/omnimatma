"use client";

import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { MathFormula } from "./MathText";

type PerspectiveId = "metafora" | "przepis" | "obraz" | "definicja";

const PERSPECTIVES: { id: PerspectiveId; label: string }[] = [
  { id: "metafora", label: "Metafora" },
  { id: "przepis", label: "Przepis" },
  { id: "obraz", label: "Obraz" },
  { id: "definicja", label: "Definicja" },
];

/**
 * Jedna karta „JEDEN TEMAT. CZTERY PERSPEKTYWY." — cztery zakładki
 * wyjaśniające ten sam ułamek 3/4. Domyślny stan jest deterministyczny,
 * więc HTML renderowany po stronie serwera jest pełny i sensowny.
 */
export function DashboardPerspectives() {
  const [active, setActive] = useState<PerspectiveId>("metafora");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selectWithKeyboard = (event: React.KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % PERSPECTIVES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + PERSPECTIVES.length) % PERSPECTIVES.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = PERSPECTIVES.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const target = PERSPECTIVES[next];
    setActive(target.id);
    tabRefs.current[target.id]?.focus();
  };

  return (
    <section className="panel approach-card">
      <div className="section-heading">
        <span className="chip">JEDEN TEMAT. CZTERY PERSPEKTYWY.</span>
      </div>
      <h3>
        Każdy rozumie inaczej.
        <br />
        Znajdź swoje „aha!”.
      </h3>
      <p className="muted">
        Jedno zagadnienie — ułamek ¾ — wyjaśniony na cztery sposoby. Kliknij
        zakładkę i zobacz, co do Ciebie przemawia.
      </p>
      <div className="dd-tabs" role="tablist" aria-label="Cztery perspektywy ułamka">
        {PERSPECTIVES.map((perspective, index) => (
          <button
            key={perspective.id}
            type="button"
            role="tab"
            id={`dd-tab-${perspective.id}`}
            aria-selected={active === perspective.id}
            aria-controls="dd-perspective-panel"
            tabIndex={active === perspective.id ? 0 : -1}
            ref={(node) => {
              tabRefs.current[perspective.id] = node;
            }}
            onClick={() => setActive(perspective.id)}
            onKeyDown={(event) => selectWithKeyboard(event, index)}
          >
            <span className={`dd-tab-dot ${perspective.id}`} aria-hidden="true" />
            {perspective.label}
          </button>
        ))}
      </div>
      <div
        className="dd-tabpanel"
        id="dd-perspective-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`dd-tab-${active}`}
      >
        {active === "metafora" && <MetaforaPanel />}
        {active === "przepis" && <PrzepisPanel />}
        {active === "obraz" && <ObrazPanel />}
        {active === "definicja" && <DefinicjaPanel />}
      </div>
    </section>
  );
}

function MetaforaPanel() {
  return (
    <div className="dd-panel-body">
      <span className="dd-panel-kicker">Jak dla 5-latka</span>
      <p className="muted">
        Wyobraź sobie pizzę pokrojoną na <strong>4 równe kawałki</strong>.
        Zjadłeś <strong>3</strong> z nich. Ile pizzy zjadłeś? Trzy z czterech
        kawałków — czyli <strong>¾</strong>. To tak, jakbyś zabrał trzy z czterech
        zabawek z pudełka: bierzesz większość, ale nie wszystko.
      </p>
    </div>
  );
}

function PrzepisPanel() {
  return (
    <div className="dd-panel-body">
      <span className="dd-panel-kicker">Krok po kroku</span>
      <ol className="dd-steps">
        <li>Całość (pizzę) podziel na <strong>4 równe części</strong> — to mianownik.</li>
        <li>Zaznacz <strong>3</strong> z tych części — to licznik.</li>
        <li>Przeczytaj ułamek: „trzy czwarte”.</li>
        <li>
          Sprawdź w kalkulatorze: 3 ÷ 4 = <MathFormula value="0{,}75" />.
        </li>
      </ol>
    </div>
  );
}

function ObrazPanel() {
  return (
    <div className="dd-panel-body">
      <span className="dd-panel-kicker">Zobacz to</span>
      <svg
        viewBox="0 0 220 100"
        className="dd-fraction-art"
        role="img"
        aria-label="Trzy z czterech części koła i paska są zaznaczone na fioletowo — to ułamek 3/4"
      >
        <defs>
          <linearGradient id="dd-fill-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ab95fa" />
            <stop offset="1" stopColor="#735bd1" />
          </linearGradient>
        </defs>
        {/* Koło podzielone na 4 ćwiartki, 3 z nich wypełnione. */}
        <g transform="translate(50 50)">
          <path d="M0 0 L0 -38 A38 38 0 0 1 38 0 Z" fill="url(#dd-fill-gradient)" />
          <path d="M0 0 L38 0 A38 38 0 0 1 0 38 Z" fill="url(#dd-fill-gradient)" />
          <path d="M0 0 L0 38 A38 38 0 0 1 -38 0 Z" fill="url(#dd-fill-gradient)" />
          <path
            d="M0 0 L-38 0 A38 38 0 0 1 0 -38 Z"
            fill="var(--accent-wash)"
          />
          <circle
            cx="0"
            cy="0"
            r="38"
            fill="none"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          <path
            d="M-38 0 H38 M0 -38 V38"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
        </g>
        {/* Pasek 4 części, 3 wypełnione. */}
        <g transform="translate(108 24)">
          <rect x="0" y="0" width="23" height="52" rx="5" fill="url(#dd-fill-gradient)" />
          <rect x="27" y="0" width="23" height="52" rx="5" fill="url(#dd-fill-gradient)" />
          <rect x="54" y="0" width="23" height="52" rx="5" fill="url(#dd-fill-gradient)" />
          <rect
            x="81"
            y="0"
            width="23"
            height="52"
            rx="5"
            fill="var(--accent-wash)"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          <text x="52" y="70" textAnchor="middle" className="dd-art-label">
            3 z 4 = ¾
          </text>
        </g>
      </svg>
      <p className="muted">
        Fioletowe części to <strong>¾</strong> całości. Ostatnia, jasna część to
        ta, której nie zaznaczono — czyli jedna czwarta.
      </p>
    </div>
  );
}

function DefinicjaPanel() {
  return (
    <div className="dd-panel-body">
      <span className="dd-panel-kicker">Ściśle i formalnie</span>
      <p className="muted">
        Ułamek <MathFormula value="\frac{3}{4}" /> to wyrażenie{" "}
        <MathFormula value="\frac{a}{b}" /> z liczbami całkowitymi, gdzie{" "}
        <MathFormula value="a=3" /> (licznik), <MathFormula value="b=4" />{" "}
        (mianownik) oraz <MathFormula value="b \neq 0" />. Odpowiada ilorazowi{" "}
        <MathFormula value="3 \div 4 = 0{,}75" />, a na osi liczbowej leży w
        przedziale <MathFormula value="(0;\,1)" />.
      </p>
    </div>
  );
}

/**
 * Mini-laboratorium: suwak promienia okręgu. Domyślny stan (r = 5) jest
 * deterministyczny, więc karta renderuje się kompletnie na serwerze.
 */
export function DashboardCircleDemo({ onOpenTools }: { onOpenTools: () => void }) {
  const [radius, setRadius] = useState(5);
  const r = Math.min(10, Math.max(1, Math.round(radius)));

  return (
    <section className="panel lab-card">
      <span className="eyebrow">MNIEJ WKUWANIA. WIĘCEJ ODKRYWANIA.</span>
      <div className="lab-formula">
        <MathFormula
          value={String.raw`\color{#a5a0ff}x^{2}\color{#8e91a7}{+}\color{#5edbb7}y^{2}\color{#8e91a7}{=}\color{#f5bd87}r^{2}`}
        />
      </div>
      <h3>A co, jeśli zmienisz jedną liczbę?</h3>
      <p className="muted">
        Suwak zmienia tylko <strong>r</strong>. Reszta wzoru zostaje ta sama — a
        okrąg rośnie lub maleje na tej samej siatce osi.
      </p>
      <div className="dd-circle-wrap">
        <svg
          viewBox="0 0 130 130"
          className="dd-circle-art"
          role="img"
          aria-label={`Okrąg o promieniu ${r} na stałej siatce osi`}
        >
          <path
            d="M10 65 H120 M65 10 V120"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          {[25, 45, 85, 105].map((tick) => (
            <g key={tick}>
              <path
                d={`M${tick} 62 V68 M62 ${tick} H68`}
                stroke="var(--line)"
                strokeWidth="1.5"
              />
            </g>
          ))}
          <circle
            cx="65"
            cy="65"
            r={r * 5.5}
            data-radius={r}
            fill="var(--accent-wash)"
            stroke="var(--accent)"
            strokeWidth="2.5"
          />
          <path
            d={`M65 65 H${65 + r * 5.5}`}
            stroke="var(--green)"
            strokeWidth="2"
          />
          <text x={65 + (r * 5.5) / 2} y="60" textAnchor="middle" className="dd-art-label">
            r = {r}
          </text>
        </svg>
        <label className="dd-radius-label" htmlFor="dd-radius">
          Promień r: <strong>{r}</strong>
        </label>
        <input
          id="dd-radius"
          className="dd-radius-slider"
          type="range"
          min={1}
          max={10}
          step={1}
          value={r}
          aria-label={`Promień r = ${r}`}
          onChange={(event) => setRadius(Number(event.target.value))}
        />
        <p className="muted dd-radius-readout" role="status">
          Wynik: okrąg o promieniu <strong>{r}</strong>, czyli x² + y² ={" "}
          <strong>{r * r}</strong>.
        </p>
      </div>
      <button type="button" className="text-button" onClick={onOpenTools}>
        Otwórz laboratorium <ArrowUpRight size={16} />
      </button>
    </section>
  );
}
