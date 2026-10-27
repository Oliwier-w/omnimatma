import type { Metadata } from "next";
import { getLessons } from "@/lib/vaultParser";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLessons().map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessons().find((item) => item.id === lessonId);
  if (!lesson) return { title: "Nie znaleziono lekcji | OmniMatma" };
  return {
    title: `${lesson.title} — lekcja krok po kroku | OmniMatma`,
    description: `${lesson.description} Cztery sposoby tłumaczenia: jak dla 5-latka, szkolny, wizualny i akademicki.`,
    alternates: { canonical: `/lekcja/${lesson.id}` },
    openGraph: {
      title: `${lesson.title} | OmniMatma`,
      description: lesson.description,
      type: "article",
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  if (!getLessons().some((lesson) => lesson.id === lessonId)) notFound();
  return null;
}
