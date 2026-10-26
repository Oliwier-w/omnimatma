"use client";
import katex from "katex";
import { memo } from "react";

export const MathFormula = memo(function MathFormula({
  value,
  block = false,
}: {
  value: string;
  block?: boolean;
}) {
  let html: string;
  try {
    html = katex.renderToString(value, {
      throwOnError: false,
      displayMode: block,
      trust: false,
      macros: {
        "\\vx": "{\\color{#a5a0ff}x}",
        "\\va": "{\\color{#a5a0ff}a}",
        "\\vb": "{\\color{#5edbb7}b}",
      },
    });
  } catch {
    return <code>{value}</code>;
  }
  return (
    <span
      className={block ? "math-block" : "math-inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
