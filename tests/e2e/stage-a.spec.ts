import { test, expect, type Page } from "@playwright/test";
import { generateSmartPractice, parseSmartPractice } from "../../src/lib/smartMath";
import { generateProblem } from "../../src/generators";

async function nav(page: Page, label: string) {
  const menu = page.getByRole("button", { name: "Otwórz menu nawigacji", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("navigation", { name: "Menu główne" }).getByRole("link", { name: label, exact: true }).click();
}

test("native sidebar URLs, SSR and browser back/forward remain consistent", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/hydration|hydrated|didn't match/i.test(message.text())) errors.push(message.text()); });
  const raw = await (await request.get("/")).text();
  const menu = raw.match(/<nav[^>]*aria-label="Menu główne"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  expect((menu.match(/href=/g) ?? []).length).toBe(7);
  expect(raw).toContain("Cztery perspektywy ułamka");
  await page.goto("/");
  await expect(page.locator(".resume-card")).toHaveCount(0);
  expect(await page.locator(".track-grid").evaluate((grid) => {
    const stats = document.querySelector(".stats-grid")!;
    const crash = document.querySelector(".crash-entry")!;
    return Boolean(stats.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING) && Boolean(grid.compareDocumentPosition(crash) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
  await nav(page, "Ścieżka nauki");
  await expect(page).toHaveURL(/\/sciezka$/);
  await nav(page, "Laboratorium");
  await expect(page).toHaveURL(/\/laboratorium$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/sciezka$/);
  await expect(page.locator(".graph-node")).toHaveCount(60);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("W końcu po Twojemu");
  await page.goForward();
  await expect(page).toHaveURL(/\/sciezka$/);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wszystko się łączy.");
  expect(errors).toEqual([]);
});

test("a seed link reproduces the exact problem in a fresh browser context and after reload", async ({ page, browser }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { Object.assign(window, { copiedProblemLink: value }); } } });
  });
  await page.goto("/zadania");
  await expect(page.locator(".tasks-problem")).toBeVisible();
  await page.getByLabel("Podtemat", { exact: true }).selectOption("matrix-det");
  await page.getByRole("button", { name: "Mieszane", exact: true }).click();
  const prompt = await page.locator(".tasks-prompt").textContent();
  const id = await page.locator(".tasks-problem").getAttribute("data-problem-id");
  await page.getByRole("button", { name: "Udostępnij to zadanie (Kopiuj link)", exact: true }).click();
  await expect(page.locator(".tasks-share-status")).toContainText("Link skopiowany");
  const href = await page.evaluate(() => (window as unknown as { copiedProblemLink: string }).copiedProblemLink);
  expect(new URL(href).searchParams.has("seed")).toBe(true);
  const context = await browser.newContext();
  try {
    const second = await context.newPage();
    await second.goto(href);
    await expect(second.locator(".tasks-problem")).toHaveAttribute("data-problem-id", id!);
    await expect(second.locator(".tasks-prompt")).toHaveText(prompt!);
    await second.reload();
    await expect(second.locator(".tasks-problem")).toHaveAttribute("data-problem-id", id!);
  } finally { await context.close(); }
});

test("Smart Math gives exact steps and starts ten genuinely similar equations", async ({ page }, info) => {
  await page.goto("/");
  const bar = page.locator(".sm-bar");
  await bar.getByRole("textbox", { name: "Wpisz działanie, równanie lub temat" }).fill("2x + 5 = 13");
  await expect(bar.locator(".sm-answer strong")).toHaveText("x = 4");
  await bar.locator("summary").click();
  await expect(bar.locator(".sm-details li")).toHaveCount(3);
  await bar.screenshot({ path: info.outputPath("smart-math.png") });
  await bar.getByRole("button", { name: "Wygeneruj 10 podobnych zadań", exact: true }).click();
  await expect(page).toHaveURL(/\/zadania\?/);
  await expect(page.getByRole("button", { name: "Seria 10", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".tasks-prompt")).toContainText("Rozwiąż równanie");
  const params = new URL(page.url()).searchParams;
  const spec = parseSmartPractice(JSON.parse(params.get("practice")!))!;
  const problem = generateSmartPractice(spec, Number(params.get("seed")), Number(params.get("difficulty")));
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(problem.answer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".tasks-feedback.is-correct")).toBeVisible();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Wyszukaj lekcję" });
  await dialog.getByRole("textbox", { name: "Szukaj tematu" }).fill("3/4 + 1/2");
  await expect(dialog.locator(".cp-math-answer strong")).toHaveText("5/4");
  await dialog.getByRole("textbox", { name: "Szukaj tematu" }).fill("det([1,2;3,4])");
  await expect(dialog.locator(".cp-math-answer strong")).toHaveText("-2");
});

test("symbol translator and Formula X-Ray work in lessons and formula drawers", async ({ page }, info) => {
  await page.goto("/lekcja/fractions-add");
  const xray = page.locator(".theory-panel .formula-xray");
  await xray.getByRole("switch", { name: "Rentgen Wzoru", exact: true }).click();
  await expect(xray.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(xray.locator(".formula-xray-legend")).toBeVisible();
  expect(await xray.locator(".formula-xray-legend li").count()).toBeGreaterThan(0);
  await xray.screenshot({ path: info.outputPath("formula-xray.png") });
  await page.locator(".symbol-widget summary").click();
  await page.getByRole("searchbox", { name: "Szukaj symbolu lub znaczenia" }).fill("∑");
  await page.locator(".symbol-widget .symbols-button").first().click();
  await expect(page.locator(".symbols-reading").filter({ visible: true })).toContainText(/suma|sumowania/i);
  await nav(page, "Laboratorium");
  await page.getByRole("button", { name: "Tłumacz symboli", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tłumacz symboli matematycznych", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tablice wzorów", exact: true }).click();
  const card = page.locator(".formula-card").first();
  await card.locator("summary").click();
  await card.getByRole("switch", { name: "Rentgen Wzoru", exact: true }).click();
  await expect(card.locator(".formula-xray-legend")).toBeVisible();
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("a common fraction mistake produces a dedicated diagnostic, not a generic miss", async ({ page }) => {
  const problem = generateProblem("fractions-add", 1, 42);
  const trap = problem.commonTraps!.find((mistake) => mistake.wrongAnswer !== problem.answer)!;
  await page.goto("/zadania?v=2&topic=fractions-add&difficulty=1&seed=42");
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(trap.wrongAnswer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".tasks-feedback.is-trap")).toContainText(trap.explanation);
  await expect(page.locator(".tasks-feedback.is-trap")).toContainText("Uwaga, klasyczna pułapka!");
});
