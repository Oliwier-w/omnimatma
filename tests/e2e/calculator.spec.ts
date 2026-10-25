import { test, expect, type Page } from "@playwright/test";

async function openCalculator(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Zacznij odkrywać", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Otwórz brudnopis", exact: true })
    .click();
  const pad = page.locator(".scratchpad-panel");
  await expect(pad).toBeVisible();
  await pad.getByRole("button", { name: "Kalkulator", exact: true }).click();
  const input = pad.getByRole("textbox", {
    name: "Wyrażenie kalkulatora",
    exact: true,
  });
  await expect(input).toBeVisible();
  return { pad, input };
}

test("smooth calculator computes, keeps history and sends results to notes and the active answer", async ({
  page,
}, info) => {
  const { pad, input } = await openCalculator(page);
  await input.fill("2+2");
  await input.press("Enter");
  await expect(pad.locator(".sc-result")).toHaveText("4");
  await expect(pad.locator(".sc-history-list li")).toHaveCount(1);
  await expect(pad.locator(".sc-history-expression")).toHaveText("2+2");
  await expect(pad.locator(".sc-history-result")).toHaveText("4");

  await pad
    .getByRole("button", { name: "Do odpowiedzi", exact: true })
    .click();
  await expect(pad.locator(".sc-notice")).toContainText(
    "Wynik wstawiony do odpowiedzi.",
  );
  await pad.getByRole("button", { name: "Do notatki", exact: true }).click();
  await expect(
    pad.getByText("Wynik dodany do notatki.", { exact: true }),
  ).toBeVisible();
  await pad.getByRole("button", { name: "Kroki", exact: true }).click();
  await expect(
    pad.getByRole("textbox", { name: "OBLICZENIA / NOTATKI", exact: true }),
  ).toHaveValue("4");

  await pad
    .getByRole("button", { name: "Zamknij brudnopis", exact: true })
    .click();
  await expect(page.locator("#answer")).toHaveValue("4");

  await page
    .getByRole("button", { name: "Otwórz brudnopis", exact: true })
    .click();
  await pad.getByRole("button", { name: "Kalkulator", exact: true }).click();
  await pad.getByRole("button", { name: "Akademicki", exact: true }).click();
  const academicInput = pad.getByRole("textbox", {
    name: "Wyrażenie kalkulatora",
    exact: true,
  });
  await academicInput.fill("det([[1,2],[3,4]])");
  await academicInput.press("Enter");
  await expect(pad.locator(".sc-result")).toHaveText("-2");
  await expect(
    pad.getByRole("button", {
      name: /Wstaw szablon: Wyznacznik/,
    }),
  ).toBeVisible();
  await expect(
    pad.getByRole("button", { name: "Do odpowiedzi", exact: true }),
  ).toBeVisible();
  if (info.project.name === "desktop") {
    await page.screenshot({
      path: info.outputPath("smooth-calculator.png"),
      fullPage: false,
    });
  }
  await pad
    .getByRole("button", { name: "Zamknij brudnopis", exact: true })
    .click();
  await expect(page.locator(".scratchpad-panel")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
