"use client";
import { useState } from "react";
import { MathFormula } from "./MathText";

export default function Visualizer({ family }: { family: string }) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(8);
  if (family === "fractions")
    return (
      <div className="visualizer">
        <div className="fraction-bars">
          {Array.from({ length: b }, (_, i) => (
            <span key={i} className={i < a ? "filled" : ""} />
          ))}
        </div>
        <MathFormula value={`\\frac{${Math.min(a, b)}}{${b}}`} block />
        <label>
          Licznik: {Math.min(a, b)}
          <input
            type="range"
            min="0"
            max={b}
            value={Math.min(a, b)}
            onChange={(e) => setA(+e.target.value)}
          />
        </label>
        <label>
          Mianownik: {b}
          <input
            type="range"
            min="1"
            max="16"
            value={b}
            onChange={(e) => {
              setB(+e.target.value);
              setA(Math.min(a, +e.target.value));
            }}
          />
        </label>
        <p className="muted">
          Zaznaczone części / wszystkie równe części. Zmieniaj suwaki i obserwuj
          proporcję.
        </p>
      </div>
    );
  if (family === "matrix")
    return (
      <div className="visualizer">
        <label>
          Wiersz {Math.min(a, 2)}
          <input
            type="range"
            min="1"
            max="2"
            value={Math.min(a, 2)}
            onChange={(e) => setA(+e.target.value)}
          />
        </label>
        <label>
          Kolumna {Math.min(b, 2)}
          <input
            type="range"
            min="1"
            max="2"
            value={Math.min(b, 2)}
            onChange={(e) => setB(+e.target.value)}
          />
        </label>
        <div className="matrix-visual">
          {[2, 5, 3, 7].map((n, i) => (
            <span
              key={i}
              className={
                Math.floor(i / 2) + 1 === Math.min(a, 2) &&
                (i % 2) + 1 === Math.min(b, 2)
                  ? "selected"
                  : ""
              }
            >
              {n}
            </span>
          ))}
        </div>
        <MathFormula
          value={`a_{${Math.min(a, 2)}${Math.min(b, 2)}}=${[2, 5, 3, 7][(Math.min(a, 2) - 1) * 2 + Math.min(b, 2) - 1]}`}
          block
        />
        <p className="muted">
          Pierwszy indeks wskazuje wiersz, drugi — kolumnę.
        </p>
      </div>
    );
  return (
    <div className="visualizer">
      <svg
        viewBox="0 0 320 220"
        className="complex-plane"
        role="img"
        aria-label={`Liczba zespolona ${a} + ${b - 8} i na płaszczyźnie Gaussa`}
      >
        <defs>
          <pattern
            id="plane-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              opacity=".12"
            />
          </pattern>
        </defs>
        <rect width="320" height="220" fill="url(#plane-grid)" />
        <path
          d="M 0 110 H 320 M 160 0 V 220"
          stroke="currentColor"
          opacity=".35"
        />
        <path
          d={`M 160 110 L ${160 + a * 10} ${110 - (b - 8) * 10}`}
          stroke="var(--accent)"
          strokeWidth="3"
        />
        <circle
          cx={160 + a * 10}
          cy={110 - (b - 8) * 10}
          r="6"
          fill="var(--green)"
        />
        <text x="298" y="102" fill="currentColor">
          Re
        </text>
        <text x="166" y="17" fill="currentColor">
          Im
        </text>
      </svg>
      <label>
        Część rzeczywista: {a}
        <input
          type="range"
          min="-10"
          max="10"
          value={a}
          onChange={(e) => setA(+e.target.value)}
        />
      </label>
      <label>
        Część urojona: {b - 8}
        <input
          type="range"
          min="0"
          max="16"
          value={b}
          onChange={(e) => setB(+e.target.value)}
        />
      </label>
      <MathFormula
        value={`z=\\color{#a5a0ff}{${a}}+\\color{#5edbb7}{(${b - 8})}i`}
        block
      />
    </div>
  );
}
