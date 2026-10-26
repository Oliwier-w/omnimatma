import { getLessons } from "@/lib/vaultParser";
import { notFound } from "next/navigation";

export const dynamicParams = false;
export function generateStaticParams() {
  return getLessons().map((lesson) => ({ lessonId: lesson.id }));
}
export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  if (!getLessons().some((lesson) => lesson.id === lessonId)) notFound();
  return null;
}
