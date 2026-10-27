import { test, expect } from "@playwright/test";
import { getLessons } from "../../src/lib/vaultParser";

/**
 * Lightweight production smoke: the 13 public entry points must work as direct
 * GET requests and their SSR HTML must not contain empty ARIA containers.
 * JavaScript is disabled deliberately: this is a server-rendering check.
 */
test.use({ javaScriptEnabled: false });

const lessons = getLessons();
const trackPrefixes = [
  "fractions",
  "matrix",
  "complex",
  "matura-liczby",
  "matura-funkcje",
  "matura-geometria",
];
const discoverRoutes = trackPrefixes.map((prefix) => {
  const lesson = lessons.find((item) => item.id.startsWith(prefix));
  if (!lesson) throw new Error(`Missing lesson for track ${prefix}`);
  return `/lekcja/${lesson.id}`;
});

const routes = [
  { name: "Start", path: "/" },
  { name: "Ścieżka", path: "/sciezka" },
  { name: "Zadania", path: "/zadania" },
  { name: "OmniKumpel AI", path: "/omnikumpel" },
  { name: "Powtórki", path: "/powtorki" },
  { name: "Laboratorium", path: "/laboratorium" },
  { name: "Sprawdzian", path: "/sprawdzian" },
  ...discoverRoutes.map((path, index) => ({
    name: `Odkrywaj: ${trackPrefixes[index]}`,
    path,
  })),
];

for (const route of routes) {
  test(`${route.name} (${route.path}) returns 200 and complete SSR landmarks`, async ({
    page,
  }) => {
    const response = await page.goto(route.path, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status(), `HTTP status for ${route.path}`).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");

    const empty = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>('[role="tablist"], [role="group"]'),
      )
        .filter(
          (element) =>
            !(element.textContent ?? "").trim() &&
            !element.querySelector("button, a, input, select, textarea"),
        )
        .map((element) => element.getAttribute("role") ?? element.tagName),
    );
    expect(empty, `empty ARIA containers on ${route.path}`).toEqual([]);
  });
}

test("all 13 public routes are reported in one place", () => {
  expect(routes).toHaveLength(13);
  expect(new Set(routes.map((route) => route.path)).size).toBe(13);
});
