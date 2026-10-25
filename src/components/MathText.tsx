"use client";
import { Fragment, type ReactNode } from "react";
import { tokenizeLessonText } from "@/lib/wikiLinks";
import WikiLink from "./WikiLink";
import { MathFormula } from "./MathFormula";
export { MathFormula } from "./MathFormula";

function renderInline(text: string): ReactNode[] {
  return tokenizeLessonText(text).map((token, i) => {
    if (token.kind === "displayMath" || token.kind === "math")
      return (
        <MathFormula
          key={i}
          value={token.value}
          block={token.kind === "displayMath"}
        />
      );
    if (token.kind === "wiki") return <WikiLink key={i} value={token.value} />;
    if (token.kind === "strong")
      return <strong key={i}>{renderInline(token.value)}</strong>;
    return (
      <Fragment key={i}>
        {token.value.split("\n").map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {line.replace(/^#{1,4}\s*/, "")}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}
export default function MathText({ text }: { text: string }) {
  return <div className="lesson-prose">{renderInline(text)}</div>;
}
