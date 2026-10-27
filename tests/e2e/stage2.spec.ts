import { test, expect } from "@playwright/test";
import { generateProblem } from "../../src/generators";
import { generateOmniPractice, omniPracticeTopicId } from "../../src/lib/omnikumpelEngine";
import { problemPath } from "../../src/lib/problemLink";

test("unsimplified equivalent fraction is green, gives a hint and earns XP", async ({ page }) => {
  const problem = generateProblem("fractions-simplify", 1, 42);
  const [n, d] = problem.answer.split("/").map(Number);
  await page.goto(problemPath({ topicId: "fractions-simplify", difficulty: 1, seed: 42 }));
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(`${2 * n}/${2 * d}`);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".tasks-feedback.is-correct")).toContainText("W najprostszej postaci");
  await expect(page.locator(".tasks-feedback-xp")).toContainText("+10 XP");
});

test("quadratic solutions accept reversed order without confusing coordinates", async ({ page }) => {
  const omni = { kind: "quadratic" } as const;
  const problem = generateOmniPractice(omni, 42, 2);
  const roots = JSON.parse(problem.answer) as number[];
  await page.goto(problemPath({ topicId: omniPracticeTopicId(omni), difficulty: 2, seed: 42, omni, mode: "series5" }));
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill(`x=${roots[1]} lub x=${roots[0]}`);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".tasks-feedback.is-correct")).toBeVisible();
});
