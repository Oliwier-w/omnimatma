import { test, expect } from "@playwright/test";
import { generateOmniPractice, parseOmniPractice } from "../../src/lib/omnikumpelEngine";

test("OmniKumpel solver, tutor, line check, pins and five related tasks", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/omnikumpel");
  await expect(page.getByRole("heading", { name: "OmniKumpel AI", exact: true })).toBeVisible();
  const input = page.getByLabel("Treść zadania dla OmniKumpla");
  await input.fill("2*x+5=13");
  await page.getByRole("tab", { name: /Naprowadź/ }).click();
  await page.getByRole("button", { name: "Rozpocznij naprowadzanie" }).click();
  await expect(page.getByLabel("Podpowiedź korepetytora")).toBeVisible();
  await expect(page.locator(".ok-answer")).toHaveCount(0);
  await page.getByLabel("Moja próba rozwiązania").fill("2*x=8\nx=5");
  await page.getByRole("button", { name: "Sprawdź mój krok" }).click();
  await expect(page.locator(".ok-line-incorrect")).toContainText("Linia 2");
  await page.getByRole("button", { name: "Pokaż pełne rozwiązanie" }).click();
  await expect(page.locator(".ok-answer")).toBeVisible();
  await page.getByRole("button", { name: "Przypnij do mojej ściągi" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Przypięto" })).toBeVisible();
  await page.reload();
  await expect(page.locator(".ok-pin > details")).toHaveCount(1);
  await input.fill("x^2-5*x+6=0");
  await page.getByRole("button", { name: "Rozwiąż zadanie", exact: true }).click();
  await page.screenshot({ path: info.outputPath("omnikumpel.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole("button", { name: "Wygeneruj 5 podobnych zadań" }).click();
  await expect(page.getByRole("button", { name: "Seria 5", exact: true })).toHaveAttribute("aria-pressed", "true");
  const params = new URL(page.url()).searchParams;
  const spec = parseOmniPractice(JSON.parse(params.get("omni")!))!;
  const problem = generateOmniPractice(spec, Number(params.get("seed")), Number(params.get("difficulty")));
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(problem.answer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".tasks-feedback.is-correct")).toBeVisible();
  expect(errors).toEqual([]);
});

test("contextual help protects XP after revealing a solution", async ({ page }) => {
  await page.goto("/zadania?v=2&topic=matrix-det&difficulty=1&seed=42");
  await page.locator(".ok-dock-trigger").click();
  const dialog = page.getByRole("dialog", { name: "OmniKumpel AI — pomoc do zadania" });
  await expect(dialog.getByLabel("Treść zadania dla OmniKumpla")).not.toHaveValue("");
  await dialog.getByRole("button", { name: "Rozpocznij naprowadzanie" }).click();
  await expect(dialog.locator(".ok-answer")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Pokaż pełne rozwiązanie" }).click();
  await expect(dialog.locator(".ok-answer")).toBeVisible();
  await page.getByRole("button", { name: "Zamknij pomoc OmniKumpla" }).click();
  const { generateMasterProblem } = await import("../../src/generators/masterGenerator");
  const problem = generateMasterProblem("matrix-det", 1, 42).problem;
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(problem.answer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".tasks-feedback.is-correct")).toBeVisible();
  const progress = await page.evaluate(() => localStorage.getItem("omnimatma-v1"));
  expect(progress ?? "").not.toContain(problem.id);
});

test("photo requires explicit sending and editable OCR confirmation", async ({ page }) => {
  let sent = 0;
  await page.route("**/api/omnibot", async route => {
    sent++;
    expect(route.request().postDataJSON().mode).toBe("ocr");
    await route.fulfill({ json: { text: "2*x+5=13", verified: false } });
  });
  await page.goto("/omnikumpel");
  await page.getByRole("button", { name: "Ustawienia AI", exact: true }).click();
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByLabel("Klucz API", { exact: true }).fill("test-key-not-real");
  await page.getByRole("button", { name: "Zapisz ustawienia AI" }).click();
  await page.getByLabel("Wybierz zdjęcie zadania").setInputFiles({ name: "task.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=", "base64") });
  await expect(page.getByAltText("Lokalny podgląd zdjęcia zadania")).toBeVisible();
  expect(sent).toBe(0);
  await page.getByRole("button", { name: "Odczytaj zdjęcie przez AI" }).click();
  await expect(page.getByLabel("Odczytana treść zdjęcia", { exact: true })).toHaveValue("2*x+5=13");
  await expect(page.locator(".ok-answer")).toHaveCount(0);
  await page.getByLabel("Odczytana treść zdjęcia", { exact: true }).fill("2*x+5=15");
  await page.getByRole("button", { name: "Potwierdź treść i rozwiąż lokalnie" }).click();
  await expect(page.locator(".ok-answer")).toBeVisible();
  expect(sent).toBe(1);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain("test-key-not-real");
});

test("scratchpad sends text into the checker without losing context", async ({ page }) => {
  await page.goto("/zadania?v=2&topic=matrix-det&difficulty=1&seed=42");
  await page.getByRole("button", { name: "Brudnopis w kratkę", exact: true }).click();
  const pad = page.locator(".scratchpad-panel");
  await pad.getByRole("textbox", { name: "OBLICZENIA / NOTATKI", exact: true }).fill("2+2\n\n4");
  await pad.getByRole("button", { name: "🤖 Sprawdź moje zapiski z OmniKumplem" }).click();
  const dialog = page.getByRole("dialog", { name: "OmniKumpel AI — pomoc do zadania" });
  await expect(dialog.getByRole("tab", { name: "Sprawdź moje rozwiązanie" })).toHaveAttribute("aria-selected", "true");
  await expect(dialog.getByLabel("Moje obliczenia", { exact: true })).toHaveValue("2+2\n\n4");
  await expect(dialog.getByLabel("Treść zadania dla OmniKumpla")).not.toHaveValue("");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(await page.locator(".main-shell").evaluate(e => (e as HTMLElement).inert)).toBe(false);
});
