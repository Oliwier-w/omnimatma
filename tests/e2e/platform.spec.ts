import { test, expect, type Page } from "@playwright/test";
import { generateProblem } from "../../src/generators";

async function navigate(page: Page, label: string) {
  const menu = page.getByRole("button", { name: "Otwórz menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Menu główne" })
    .getByRole("link", { name: label, exact: true })
    .click();
}

test("dashboard is responsive, mathematical rendering has no errors", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /W końcu po Twojemu/ }),
  ).toBeVisible();
  await expect(page.locator(".track-card")).toHaveCount(6);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("dashboard.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("four modes, five levels, correct and wrong answers, XP persistence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Zacznij odkrywać", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pojęcie ułamka zwykłego", exact: true }),
  ).toBeVisible();
  for (const name of ["Szkolny", "Wizualny", "Akademicki", "ELI5"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("#mode-panel")).toBeVisible();
  }
  await page.getByLabel("Twoja odpowiedź", { exact: true }).fill("999/1");
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback.error")).toBeVisible();
  await page
    .getByLabel("Twoja odpowiedź", { exact: true })
    .fill(generateProblem("fractions-meaning", 1, 42).answer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp),
    )
    .toBe(10);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp,
    ),
  ).toBe(10);
  for (const n of [2, 3, 4, 5]) {
    await page
      .getByRole("button", { name: `Poziom ${n}`, exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: `Poziom ${n}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page
    .getByRole("button", { name: "Podpowiedź 0/3", exact: true })
    .click();
  await expect(page.locator(".hint")).toHaveCount(1);
  await page.getByRole("button", { name: "Rozwiązanie", exact: true }).click();
  await expect(page.locator(".solution-step")).toHaveCount(3);
  const revealedAnswer = await page.locator('.solution-step code').last().innerText();
  await page.getByLabel('Twoja odpowiedź', { exact: true }).fill(revealedAnswer);
  await page.getByRole('button', { name: 'Sprawdź', exact: true }).click();
  await expect(page.locator('.feedback')).toContainText('Tryb nauki — bez XP');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('omnimatma-v1')!).xp)).toBe(10);
  await page
    .getByRole("button", { name: "Klawiatura matematyczna", exact: true })
    .click();
  await expect(page.locator(".math-keyboard")).toBeVisible();
  await page.reload();
  await expect
    .poll(() => page.locator(".profile-button").innerText())
    .toContain("10 XP");
});

test("search, keyboard focus, theme persistence and actual skill edges", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Wyszukaj lekcję" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Szukaj tematu" })
    .fill("Dodawanie macierzy");
  await page.getByRole("button", { name: "Dodawanie macierzy", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dodawanie macierzy", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Wybierz motyw", exact: true })
    .click();
  await page.getByRole("button", { name: /Clean Paper/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
  await page.keyboard.press("Escape");
  await navigate(page, "Ścieżka nauki");
  await expect(page.locator(".graph-node")).toHaveCount(60);
  expect(await page.locator(".graph-edges>path").count()).toBeGreaterThan(20);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
});

test("matrix calculator, graph and configurable exam work", async ({
  page,
}) => {
  await page.goto("/");
  await navigate(page, "Laboratorium");
  await page.getByRole("button", { name: "Macierze", exact: true }).click();
  await page.getByRole("button", { name: "det A", exact: true }).click();
  await expect(page.getByRole("region", { name: "Macierze", exact: true }).getByRole("status")).toContainText("−2");
  await page.getByRole("button", { name: "A⁻¹", exact: true }).click();
  for (const row of [1, 2])
    for (const col of [1, 2])
      await page
        .getByRole("spinbutton", {
          name: `A, wiersz ${row}, kolumna ${col}`,
          exact: true,
        })
        .fill("1");
  await expect(page.locator(".error")).toContainText("osobliwa");
  await page
    .getByRole("button", { name: "Wykres funkcji", exact: true })
    .click();
  await page
    .getByRole("slider", { name: "Współczynnik a", exact: true })
    .fill("0");
  await expect(
    page.getByText("a = 0: to funkcja stała, nie parabola.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Symulator egzaminu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Zaznacz wszystkie", exact: true })
    .click();
  await page
    .getByRole("spinbutton", { name: "Liczba zadań", exact: true })
    .fill("1");
  await page
    .getByRole("button", { name: /^Rozpocznij egzamin/ })
    .click();
  await expect(page.getByRole("timer")).toBeVisible();
  await page.getByRole("button", { name: "Oddaj arkusz", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "0 / 1 · 0%", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Egzamin zakończony", { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Skonfiguruj nowy arkusz', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Czas w minutach', exact: true }).fill('1');
  await page.clock.install();
  await page.getByRole('button', { name: /^Rozpocznij egzamin/ }).click();
  await page.getByRole('button', { name: 'Wykres funkcji', exact: true }).click();
  await page.clock.fastForward(61_000);
  await page.getByRole('button', { name: 'Symulator egzaminu', exact: true }).click();
  await expect(page.getByText('Egzamin zakończony', { exact: true })).toBeVisible();
});

test("production PWA runs after an offline reload", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const names = await caches.keys();
        const cache = await caches.open(
          names.find((n) => n.endsWith("-assets")) ?? "missing",
        );
        return (await cache.keys()).length;
      }),
    )
    .toBeGreaterThan(5);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Zacznij odkrywać", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /W końcu po Twojemu/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Zacznij odkrywać", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pojęcie ułamka zwykłego", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Twoja odpowiedź", { exact: true })
    .fill(generateProblem("fractions-meaning", 1, 42).answer);
  await page.getByRole("button", { name: "Sprawdź", exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await context.setOffline(false);
});
