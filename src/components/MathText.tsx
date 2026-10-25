"use client";
import katex from "katex";
import { Fragment } from "react";

export function MathFormula({
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
}

export default function MathText({ text }: { text: string }) {
  const chunks = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);
  return (
    <div className="lesson-prose">
      {chunks.map((chunk, i) => {
        if (chunk.startsWith("$$"))
          return <MathFormula key={i} value={chunk.slice(2, -2)} block />;
        if (chunk.startsWith("$"))
          return <MathFormula key={i} value={chunk.slice(1, -1)} />;
        return (
          <Fragment key={i}>
            {chunk.split("\n").map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {line
                  .replace(/^#{1,4}\s*/, "")
                  .split(/(\*\*.*?\*\*)/g)
                  .map((s, k) =>
                    s.startsWith("**") ? (
                      <strong key={k}>{s.slice(2, -2)}</strong>
                    ) : (
                      <Fragment key={k}>
                        {s.replace(/\[\[([^\]]+)\]\]/g, "$1")}
                      </Fragment>
                    ),
                  )}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </div>
  );
}
