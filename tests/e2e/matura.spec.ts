import { test, expect } from "@playwright/test";
import { generateProblem } from "../../src/generators";

test("matura track opens a complete four-mode lesson and checks a generated task", async ({
  page,
}, info) => {
  await page.goto("/");
  const track = page
    .locator(".track-grid")
    .getByRole("button", { name: /Matura · Liczby i algebra/ });
  await expect(track).toBeVisible();
  await track.click();
  await expect(page.locator(".lesson-breadcrumb")).toContainText("Matura");
  for (const name of ["Szkolny", "Wizualny", "Akademicki", "ELI5"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.locator("#mode-panel")).toBeVisible();
  }
  await expect(page.locator(".katex-error")).toHaveCount(0);
  const answer = generateProblem("matura-liczby-pierwiastki", 1, 42).answer;
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(answer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await page.getByRole("button", { name: "Otwórz brudnopis", exact: true }).click();
  await expect(page.locator(".scratchpad-panel")).toBeVisible();
  await page.locator(".scratchpad-icon-button").click();
  const menu = page.getByRole("button", { name: "Otwórz menu nawigacji", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Menu główne" })
    .getByRole("link", { name: "Ścieżka nauki", exact: true })
    .click();
  await expect(page.locator(".skill-track")).toHaveCount(6);
  // The stacked mobile tree is very tall; avoid allocating a huge bitmap.
  await page.screenshot({ path: info.outputPath("matura-path.png"), fullPage: info.project.name === "desktop" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
