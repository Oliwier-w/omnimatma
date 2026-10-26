"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { analyzeFormula } from "../lib/formulaXray";
import { MathFormula } from "./MathFormula";
import "./FormulaXray.css";

export type FormulaXrayProps = { formula: string; topicId?: string; title?: string };

/** Local, default-off state is reset when a different formula is selected. */
export default function FormulaXray(props: FormulaXrayProps) {
  return <FormulaXrayContent key={`${props.topicId ?? ""}\u0000${props.formula}`} {...props} />;
}

function FormulaXrayContent({ formula, topicId, title }: FormulaXrayProps) {
  const [enabled, setEnabled] = useState(false);
  const id = useId();
  const analysis = useMemo(() => analyzeFormula(formula, topicId ?? title), [formula, topicId, title]);
  return (
    <div className="formula-xray" data-enabled={enabled}>
      <MathFormula value={enabled ? analysis.coloredLatex : formula} block />
      <div className="formula-xray-toolbar">
        <button
          type="button"
          className="formula-xray-switch"
          role="switch"
          aria-label="Rentgen Wzoru"
          aria-checked={enabled}
          aria-controls={`${id}-legend`}
          aria-describedby={`${id}-hint`}
          onClick={() => setEnabled((value) => !value)}
        >
          <span className="formula-xray-track" aria-hidden="true"><span /></span>
          <span>Rentgen Wzoru</span>
          <span className="formula-xray-state" aria-hidden="true">{enabled ? "Włączony" : "Wyłączony"}</span>
        </button>
        <span className="formula-xray-hint" id={`${id}-hint`}>Poznaj znaczenie symboli</span>
      </div>
      <div id={`${id}-legend`} hidden={!enabled} className="formula-xray-legend" role="region" aria-label={title ? `Rentgen Wzoru: ${title}` : "Znaczenie elementów wzoru"}>
        {enabled && (analysis.parts.length ? (
          <ul>
            {analysis.parts.map((part) => (
              <li key={part.key} style={{ "--xray-color": part.color } as CSSProperties}>
                <span className="formula-xray-chip"><span aria-hidden="true" />{part.label}</span>
                <span className="formula-xray-description">{part.description}</span>
              </li>
            ))}
          </ul>
        ) : <p className="formula-xray-empty">Ten zapis nie zawiera rozpoznanych symboli. Znaczenie całego wzoru znajdziesz w objaśnieniu lekcji.</p>)}
      </div>
    </div>
  );
}
