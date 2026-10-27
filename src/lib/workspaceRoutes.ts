export type WorkspacePage = "home" | "path" | "tasks" | "lesson" | "tools" | "review" | "crash" | "kumpel";
export const WORKSPACE_PATHS = {
  home: "/", path: "/sciezka", tasks: "/zadania", tools: "/laboratorium", review: "/powtorki", crash: "/sprawdzian", kumpel: "/omnikumpel",
} as const;
export function lessonPath(id: string): string { return `/lekcja/${encodeURIComponent(id)}`; }
export function readWorkspacePath(pathname: string): { page: WorkspacePage; lessonId?: string } {
  const normalized = pathname.replace(/\/$/, "") || "/";
  for (const [page, path] of Object.entries(WORKSPACE_PATHS)) {
    if (normalized === path) return { page: page as Exclude<WorkspacePage, "lesson"> };
  }
  if (normalized.startsWith("/lekcja/")) {
    try { return { page: "lesson", lessonId: decodeURIComponent(normalized.slice(8)) }; } catch { return { page: "lesson" }; }
  }
  return { page: "home" };
}
