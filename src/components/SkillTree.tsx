"use client";
import { Check, ChevronRight } from "lucide-react";
import type { Lesson } from "@/lib/lesson";

export default function SkillTree({
  lessons,
  solved,
  onOpen,
}: {
  lessons: Lesson[];
  solved: Record<string, number>;
  onOpen: (lesson: Lesson) => void;
}) {
  const index = new Map(lessons.map((lesson, i) => [lesson.id, i]));
  const edges = lessons.flatMap((lesson, i) =>
    lesson.prerequisites.flatMap((id, j) =>
      index.has(id) ? [{ from: index.get(id)!, to: i, lane: j }] : [],
    ),
  );
  return (
    <div className="graph-list">
      <svg
        className="graph-edges"
        width="35"
        height={lessons.length * 112}
        viewBox={`0 0 35 ${lessons.length * 112}`}
        aria-hidden="true"
      >
        <defs>
          <marker
            id={`arrow-${lessons[0]?.id}`}
            markerWidth="5"
            markerHeight="5"
            refX="4"
            refY="2.5"
            orient="auto"
          >
            <path d="M0 0 L5 2.5 L0 5" fill="var(--accent)" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const start = edge.from * 112 + 43,
            end = edge.to * 112 + 43,
            lane = 5 + (i % 4) * 5;
          return (
            <path
              key={i}
              d={`M34 ${start} H${lane + 5} Q${lane} ${start} ${lane} ${start + 5} V${end - 5} Q${lane} ${end} ${lane + 5} ${end} H32`}
              stroke="var(--accent)"
              strokeWidth="1"
              fill="none"
              opacity=".4"
              markerEnd={`url(#arrow-${lessons[0]?.id})`}
            />
          );
        })}
      </svg>
      {lessons.map((lesson, i) => (
        <div className="skill-node graph-node" key={lesson.id}>
          <button
            onClick={() => onOpen(lesson)}
            className={(solved[lesson.id] ?? 0) >= 5 ? "mastered" : ""}
          >
            <span className="node-number">
              {(solved[lesson.id] ?? 0) >= 5 ? (
                <Check size={15} />
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </span>
            <div>
              <strong>{lesson.title}</strong>
              <small>
                {lesson.prerequisites.length
                  ? `Po: ${lesson.prerequisites.map((id) => lessons.find((l) => l.id === id)?.title ?? id).join(", ")}`
                  : "Zacznij tutaj"}{" "}
                · {lesson.minutes} min
              </small>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
