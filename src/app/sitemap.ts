import type { MetadataRoute } from "next";
import { getLessons } from "@/lib/vaultParser";

const BASE_URL = (process.env.SITE_URL ?? "https://omnimatma.vercel.app").replace(/\/+$/, "");
const lastModified = new Date();

const mainRoutes: MetadataRoute.Sitemap = ([
  { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
  { url: `${BASE_URL}/sciezka`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE_URL}/zadania`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE_URL}/omnikumpel`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE_URL}/powtorki`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/laboratorium`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/sprawdzian`, changeFrequency: "monthly", priority: 0.7 },
] satisfies MetadataRoute.Sitemap).map((route) => ({ ...route, lastModified }));

export default function sitemap(): MetadataRoute.Sitemap {
  const lessonRoutes: MetadataRoute.Sitemap = getLessons().map((lesson) => ({
    url: `${BASE_URL}/lekcja/${encodeURIComponent(lesson.id)}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...mainRoutes, ...lessonRoutes];
}
