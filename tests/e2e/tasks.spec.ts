import { test, expect, type Page } from "@playwright/test";

async function openTasks(page: Page) {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Otwórz menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "Menu główne", exact: true })
    .getByRole("link", { name: "Zadania", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Trenuj tak długo, jak chcesz.",
      exact: true,
    }),
  ).toBeVisible();
}

test("tasks center filters topics, reveals hints and deep steps, and draws with the keyboard", async ({
  page,
}, info) => {
  await openTasks(page);
  await expect(page.locator(".tasks-center")).toBeVisible();
  await page.getByRole("button", { name: "Studia", exact: true }).click();
  await page.getByLabel("Dział", { exact: true }).selectOption({
    label: "Macierze",
  });
  await expect(page.getByLabel("Podtemat", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mieszane", exact: true }).click();
  await page.getByRole("button", { name: "Seria 10", exact: true }).click();
  await expect(page.locator(".tasks-problem")).toBeVisible();
  await expect(page.locator(".tasks-prompt")).not.toBeEmpty();
  await expect(page.locator(".tasks-formula .katex")).toHaveCount(1);

  await page
    .getByRole("button", { name: "Podpowiedź 1", exact: true })
    .click();
  await expect(page.locator(".tasks-hint").first()).toBeVisible();

  await page.locator(".tasks-solution summary").click();
  expect(await page.locator(".tasks-step").count()).toBeGreaterThanOrEqual(3);
  await page
    .getByRole("button", { name: "Nie rozumiem tego kroku" })
    .first()
    .click();
  await expect(page.locator(".tasks-deep").first()).toBeVisible();

  const before = await page.locator(".tasks-prompt").textContent();
  await page.locator(".tasks-prompt").click();
  await page.keyboard.press("Space");
  await expect
    .poll(() => page.locator(".tasks-prompt").textContent())
    .not.toBe(before);

  if (info.project.name === "desktop") {
    await page.screenshot({
      path: info.outputPath("tasks-center.png"),
      fullPage: false,
    });
  }

  await page
    .getByRole("button", { name: "Otwórz brudnopis", exact: true })
    .first()
    .click();
  await expect(page.locator(".scratchpad-panel")).toBeVisible();
  const pad = page.locator(".scratchpad-panel");
  if (info.project.name === "desktop") {
    await pad.getByRole("button", { name: "Rysuj", exact: true }).click();
    const canvas = pad.locator(".scratchpad-canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.4);
      await page.mouse.down();
      await page.mouse.move(
        box.x + box.width * 0.35,
        box.y + box.height * 0.3,
        { steps: 14 },
      );
      await page.mouse.move(
        box.x + box.width * 0.5,
        box.y + box.height * 0.52,
        { steps: 14 },
      );
      await page.mouse.up();
    }
    await expect(canvas.locator("polyline")).toHaveCount(1);
    await page.screenshot({
      path: info.outputPath("scratchpad-canvas.png"),
      fullPage: false,
    });
  }
  if (info.project.name === "desktop") {
    await expect(
      page.locator(".scratchpad-panel .scratchpad-tool-hint"),
    ).toBeVisible();
    await page
      .locator(".scratchpad-panel")
      .getByRole("button", { name: "Siedemdziesiąt procent ekranu" })
      .click();
    await expect
      .poll(() =>
        page
          .locator(".scratchpad-panel")
          .evaluate((element) =>
            Math.round(
              (element.getBoundingClientRect().width / innerWidth) * 100,
            ),
          ),
      )
      .toBe(70);
    await page
      .locator(".scratchpad-panel")
      .getByRole("button", { name: "Pełny ekran" })
      .click();
    await expect(page.locator(".scratchpad-panel")).toHaveAttribute(
      "aria-modal",
      "true",
    );
    await expect
      .poll(() =>
        page
          .locator(".scratchpad-panel")
          .evaluate((element) =>
            Math.round(
              (element.getBoundingClientRect().width / innerWidth) * 100,
            ),
          ),
      )
      .toBe(100);
  }
  await page
    .locator(".scratchpad-panel")
    .getByRole("button", { name: "Zamknij brudnopis", exact: true })
    .click();
  await expect(page.locator(".scratchpad-panel")).toHaveCount(0);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
