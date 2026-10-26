import { test, expect, type Page } from "@playwright/test";

async function startLesson(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Zacznij odkrywać", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pojęcie ułamka zwykłego", exact: true }),
  ).toBeVisible();
}

test("graph-paper notes and ink survive closing, new tasks and responsive resizing", async ({
  page,
}, info) => {
  await startLesson(page);
  await page
    .getByRole("button", { name: "Otwórz brudnopis", exact: true })
    .click();
  const pad = page.locator(".scratchpad-panel");
  await expect(pad).toBeVisible();
  if (info.project.name === "mobile") {
    await expect(pad).toHaveAttribute("aria-modal", "true");
    await page.keyboard.press("Shift+Tab");
    expect(await pad.evaluate((e) => e.contains(document.activeElement))).toBe(
      true,
    );
    await page.keyboard.press("Control+k");
    await expect(
      page.getByRole("dialog", { name: "Wyszukaj lekcję", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Wyszukaj lekcję", exact: true }),
    ).toHaveCount(0);
    expect(
      await page
        .locator(".main-shell")
        .evaluate((e) => (e as HTMLElement).inert),
    ).toBe(true);
    expect(await pad.evaluate((e) => (e as HTMLElement).inert)).toBe(false);
  }
  await pad
    .getByRole("textbox", { name: "OBLICZENIA / NOTATKI", exact: true })
    .fill("1/2 + 1/4\n3/4");
  await pad
    .getByRole("button", { name: "Porównaj kroki", exact: true })
    .click();
  await expect(pad.locator(".scratchpad-results li")).toHaveCount(2);
  await pad.getByRole("button", { name: "Rysuj", exact: true }).click();
  const canvas = pad.locator(".scratchpad-canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.25, box!.y + box!.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.6, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(canvas.locator("polyline")).toHaveCount(1);
  const points = await canvas.locator("polyline").getAttribute("points");
  if (info.project.name === "desktop") {
    expect(
      await pad.evaluate(
        (e) => Math.abs(e.getBoundingClientRect().width - innerWidth / 2) < 2,
      ),
    ).toBe(true);
    expect(
      await pad.evaluate(
        (e) => Math.abs(e.getBoundingClientRect().right - innerWidth) < 2,
      ),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath("scratchpad.png") });
    await page.setViewportSize({ width: 1250, height: 900 });
    await expect(canvas.locator("polyline")).toHaveAttribute("points", points!);
  } else {
    expect(
      await pad.evaluate(
        (e) => Math.abs(e.getBoundingClientRect().width - innerWidth) < 2,
      ),
    ).toBe(true);
    await page.touchscreen.tap(
      box!.x + box!.width * 0.7,
      box!.y + box!.height * 0.5,
    );
    await expect(canvas.locator("circle")).toHaveCount(1);
    await pad
      .getByRole("button", { name: "Cofnij ostatnią kreskę", exact: true })
      .click();
    await expect(canvas.locator("circle")).toHaveCount(0);
  }
  await pad
    .getByRole("button", { name: "Zamknij brudnopis", exact: true })
    .click();
  await expect(pad).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Otwórz brudnopis", exact: true }),
  ).toBeFocused();
  expect(
    await page.locator(".main-shell").evaluate((e) => (e as HTMLElement).inert),
  ).toBe(false);
  await page.getByRole("button", { name: "Nowe zadanie", exact: true }).click();
  await page
    .getByRole("button", { name: "Otwórz brudnopis", exact: true })
    .click();
  await expect(canvas.locator("polyline")).toHaveAttribute("points", points!);
  await pad
    .getByRole("button", { name: "Wyczyść tylko rysunek", exact: true })
    .click();
  await expect(canvas.locator("polyline")).toHaveCount(0);
  await pad.getByRole("button", { name: "Kroki", exact: true }).click();
  await expect(
    pad.getByRole("textbox", { name: "OBLICZENIA / NOTATKI", exact: true }),
  ).toHaveValue("1/2 + 1/4\n3/4");
  await page.keyboard.press("Escape");
  await expect(pad).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("wikilinks preview real notes on hover or keyboard focus and navigate on touch/click", async ({
  page,
}, info) => {
  await startLesson(page);
  const link = page.getByRole("link", {
    name: "Skracanie i rozszerzanie ułamków",
    exact: true,
  });
  await expect(link).toBeVisible();
  if (info.project.name === "mobile") {
    await link.tap();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Pojęcie ułamka zwykłego",
        exact: true,
      }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
  if (info.project.name === "desktop") await link.hover();
  else {
    await link.blur();
    await link.focus();
  }
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(
    tooltip.getByRole("heading", {
      name: "Skracanie i rozszerzanie ułamków",
      exact: true,
    }),
  ).toBeVisible();
  await expect(tooltip.locator(".wiki-preview-definition")).not.toBeEmpty();
  await expect(tooltip.locator(".math-block .katex")).toHaveCount(1);
  expect(
    await tooltip.evaluate((e) => {
      const r = e.getBoundingClientRect();
      return (
        r.left >= 0 &&
        r.right <= innerWidth + 1 &&
        r.top >= 0 &&
        r.bottom <= innerHeight + 1
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await link.blur();
  await link.focus();
  await expect(tooltip).toBeVisible();
  await page.screenshot({ path: info.outputPath("hover-preview.png") });
  if (info.project.name === "desktop") {
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Brudnopis w kratkę", exact: true })
      .click();
    await link.focus();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toHaveCount(0);
    await expect(page.locator(".scratchpad-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".scratchpad-panel")).toHaveCount(0);
  }
  if (info.project.name === "mobile") await link.tap();
  else await link.press("Enter");
  await expect(
    page.getByRole("heading", {
      name: "Skracanie i rozszerzanie ułamków",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".katex-error")).toHaveCount(0);
});

test("crash course builds a selected review and balanced test without awarding XP", async ({
  page,
}, info) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Ułóż szybką powtórkę", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Kolokwium / Sprawdzian jutro",
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".crash-card")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Wyczyść wybór", exact: true })
    .click();
  await expect(page.locator(".crash-card")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Rozpocznij szybki test", exact: true }),
  ).toBeDisabled();
  await page.getByRole("checkbox", { name: "Macierze", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "Liczby zespolone", exact: true })
    .check();
  await expect(page.locator(".crash-card")).toHaveCount(8);
  await expect(
    page.getByRole("region", { name: "Powtórka: Ułamki", exact: true }),
  ).toHaveCount(0);
  const pitfall = page.locator(".crash-pitfalls").first();
  await pitfall.locator("summary").click();
  await expect(pitfall.locator(".lesson-prose")).not.toBeEmpty();
  await page.screenshot({
    path: info.outputPath("crash-course.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Rozpocznij szybki test", exact: true })
    .click();
  await expect(page.locator(".crash-question")).toHaveCount(4);
  await expect(
    page.getByRole("checkbox", { name: "Macierze", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".crash-solution")).toHaveCount(0);
  await page.locator(".crash-answer input").first().fill("0");
  await page
    .getByRole("button", { name: "Brudnopis w kratkę", exact: true })
    .click();
  await expect(page.locator(".scratchpad-panel")).toBeVisible();
  await page
    .locator(".scratchpad-panel")
    .getByRole("button", { name: "Zamknij brudnopis", exact: true })
    .click();
  await expect(page.locator(".crash-answer input").first()).toHaveValue("0");
  await page.locator(".crash-lesson-link").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const menu = page.getByRole("button", { name: "Otwórz menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Menu główne", exact: true })
    .getByRole("button", { name: "Sprawdzian jutro", exact: true })
    .click();
  await expect(page.locator(".crash-answer input").first()).toHaveValue("0");
  await page
    .getByRole("button", { name: "Oddaj test i zobacz analizę", exact: true })
    .click();
  await expect(page.locator(".crash-results")).toBeVisible();
  await expect(page.locator(".crash-results li")).toHaveCount(4);
  await expect(page.locator(".crash-solution")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp,
    ),
  ).toBe(0);
  await page
    .getByRole("button", {
      name: "Spróbuj ponownie · nowy zestaw",
      exact: true,
    })
    .click();
  await expect(page.locator(".crash-results")).toHaveCount(0);
  await expect(page.locator(".crash-answer input").first()).toHaveValue("");
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
