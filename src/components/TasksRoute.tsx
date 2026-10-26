"use client";
import { useSearchParams } from "next/navigation";
import type { Lesson } from "@/lib/lesson";
import { parseProblemLink } from "@/lib/problemLink";
import TasksCenter from "./TasksCenter";

export default function TasksRoute({ lessons, onSolved }: { lessons: Lesson[]; onSolved: (id: string, difficulty: number, lessonId?: string) => boolean }) {
  const params = useSearchParams();
  const parsed = parseProblemLink(params, lessons.map((lesson) => lesson.id));
  return <>
    {parsed.error && <p className="storage-warning" role="alert">{parsed.error}</p>}
    <TasksCenter key={params.toString()} lessons={lessons} onSolved={onSolved} initialProblem={parsed.value ?? undefined} />
  </>;
}
