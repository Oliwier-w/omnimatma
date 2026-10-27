import { test, expect } from "@playwright/test";

test("dashboard navigation, directions and demos are visible without JavaScript", async ({ browser, baseURL }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(baseURL!);
  const nav = page.getByRole("navigation", { name: "Menu główne" });
  await expect(nav.getByRole("link")).toHaveCount(7);
  await expect(nav.getByRole("link", { name: "Zadania", exact: true })).toBeVisible();
  await expect(page.locator(".track-nav a")).toHaveCount(6);
  await expect(page.locator(".track-card")).toHaveCount(6);
  await expect(page.locator(".learning-level-card")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Matematyka. W końcu po Twojemu." })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Metafora", exact: true })).toBeVisible();
  await expect(page.getByRole("slider", { name: /promień/i })).toHaveValue("5");
  expect(await page.locator("main").evaluate((main) => {
    let element: HTMLElement | null = main as HTMLElement;
    while (element) {
      if (getComputedStyle(element).opacity === "0") return false;
      element = element.parentElement;
    }
    return getComputedStyle(main.firstElementChild!).opacity !== "0";
  })).toBe(true);
  await page.screenshot({ path: info.outputPath("dashboard-no-js.png"), fullPage: true });
  await context.close();
});

test("circle radius and four perspectives update in place without hydration errors", async ({ page }, info) => {
  const errors: string[] = [];
  await page.addInitScript(() => {
    Object.assign(window, { omniCLS: 0 });
    new PerformanceObserver((list) => {
      for (const raw of list.getEntries()) {
        const entry = raw as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!entry.hadRecentInput) (window as unknown as { omniCLS: number }).omniCLS += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration|hydrated|didn't match|server rendered HTML/i.test(message.text())) errors.push(message.text());
  });
  await page.goto("/");
  const slider = page.getByRole("slider", { name: /promień/i });
  await slider.scrollIntoViewIfNeeded();
  const demo = page.locator(".lab-card");
  const circle = demo.locator("circle[data-radius]");
  const before = await circle.getAttribute("r");
  await slider.fill("9");
  await expect(slider).toHaveValue("9");
  await expect(circle).not.toHaveAttribute("r", before!);
  await page.getByRole("tab", { name: "Definicja", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Definicja", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(/mianownik|licznik|ułamek/i);
  await page.getByRole("tab", { name: "Obraz", exact: true }).click();
  await expect(page.getByRole("tabpanel").locator("svg")).toBeVisible();
  await expect(page.locator(".hero")).toBeVisible();
  await page.screenshot({ path: info.outputPath("interactive-demos.png"), fullPage: false });
  expect(errors).toEqual([]);
  const cls = await page.evaluate(() => (window as unknown as { omniCLS: number }).omniCLS);
  await info.attach("layout-metrics", { body: JSON.stringify({ cls }), contentType: "application/json" });
  expect(cls).toBeLessThan(0.1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("command palette opens a targeted generator and laboratory tool", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Szukaj tematu, wzoru lub zadania", exact: true }).click();
  const search = page.getByRole("textbox", { name: "Szukaj tematu", exact: true });
  await search.fill("zadania dodawanie macierzy");
  await page.getByRole("button", { name: /Ćwicz: Dodawanie macierzy/ }).click();
  await expect(page.locator(".tasks-problem-head h2")).toHaveText("Dodawanie macierzy");
  await expect(page.getByLabel("Podtemat", { exact: true })).not.toHaveValue("all");
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Szukaj tematu", exact: true }).fill("Wykres funkcji");
  await page.getByRole("dialog", { name: "Wyszukaj lekcję" }).getByRole("button", { name: /Wykres funkcji/ }).click();
  await expect(page.getByRole("region", { name: "Wykres funkcji", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Macierze", exact: true }).click();
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Szukaj tematu", exact: true }).fill("Wykres funkcji");
  await page.getByRole("dialog", { name: "Wyszukaj lekcję" }).getByRole("button", { name: /Wykres funkcji/ }).click();
  await expect(page.getByRole("region", { name: "Wykres funkcji", exact: true })).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Szukaj tematu", exact: true }).fill("pole koła");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("dialog", { name: "Wyszukaj lekcję" }).getByRole("button", { name: "Tablice wzorów", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Tablice wzorów", exact: true })).toBeVisible();
});

test("profile exports, validates imports, restores progress and resumes the last lesson", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/hydration|hydrated|didn't match/i.test(message.text())) errors.push(message.text()); });
  await page.addInitScript(() => {
    if (!localStorage.getItem("omnimatma-v1")) localStorage.setItem("omnimatma-v1", JSON.stringify({
      xp: 120, solved: { "matrix-add": 5 }, awarded: ["matrix-add-1-42"], activity: [], reviews: {}, theme: "space", lastLessonId: "matrix-add",
    }));
  });
  await page.goto("/");
  await expect(page.locator(".hero-resume")).toContainText("Wróć do nauki: Dodawanie macierzy");
  await page.getByRole("button", { name: "Profil: Odkrywca", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Profil i postępy", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Imię lub pseudonim", exact: true }).fill("Alicja");
  await dialog.getByRole("textbox", { name: "Inicjał (awatar)", exact: true }).fill("A");
  await dialog.getByRole("button", { name: "Zapisz profil", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).displayName)).toBe("Alicja");
  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: /^Eksportuj postępy/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks);
  expect(JSON.parse(backup.toString()).progress.xp).toBe(120);
  await dialog.locator('input[type="file"]').setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from('{"xp":-1}') });
  await expect(dialog.getByRole("alert")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp)).toBe(120);
  await dialog.locator('input[type="file"]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: backup });
  await expect(dialog.getByRole("alert")).toBeEmpty();
  await expect(dialog.getByRole("button", { name: "Tak, importuj postęp", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Anuluj", exact: true }).click();
  await dialog.getByRole("button", { name: "Zresetuj postęp", exact: true }).click();
  // Opening or cancelling the confirmation must not reset anything.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp)).toBe(120);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Zresetuj postęp", exact: true }).click();
  await dialog.getByRole("button", { name: "Tak, resetuj postęp", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp)).toBe(0);
  await expect(dialog.getByRole("textbox", { name: "Imię lub pseudonim" })).toHaveValue("Alicja");
  await dialog.locator('input[type="file"]').setInputFiles({ name: "restore.json", mimeType: "application/json", buffer: backup });
  // Preview must not apply the backup yet.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp)).toBe(0);
  await dialog.getByRole("button", { name: "Tak, importuj postęp", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("omnimatma-v1")!).xp)).toBe(120);
  await page.screenshot({ path: info.outputPath("profile-backup.png"), fullPage: false });
  await dialog.getByRole("button", { name: "Zamknij profil", exact: true }).click();
  await expect(page.getByRole("button", { name: "Profil: Alicja", exact: true })).toHaveText("A");
  await page.reload();
  await expect(page.getByRole("button", { name: "Profil: Alicja", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Kontynuuj lekcję", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dodawanie macierzy", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
