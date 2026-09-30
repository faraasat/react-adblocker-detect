import { test, expect, Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectNoClippedText,
  failOnConsoleErrors,
} from "./_helpers";

/**
 * Real ad blockers work by hiding elements that match filter-list selectors.
 * Injecting the same rules is the closest honest simulation available in a
 * clean browser, and it exercises the bait check exactly as production does.
 */
async function simulateAdBlocker(page: Page) {
  await page.addInitScript(() => {
    const inject = () => {
      const style = document.createElement("style");
      style.setAttribute("data-simulated-blocker", "");
      style.textContent =
        ".adsbox,.ad-banner,.ad-placement,.advertisement,.banner_ad,.sponsored-ad,.pub_300x250{display:none!important}";
      document.head.appendChild(style);
    };

    // Appending before the document is parsed loses the node: the browser
    // discards the provisional documentElement. Wait for a real <head>.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inject, { once: true });
    } else {
      inject();
    }
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("reports no blocker in a clean browser", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("no blocker")).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
});

/**
 * A refused ad script is the signal a network-level blocker (Pi-hole, DNS
 * filtering, host rules) produces, and cosmetic filtering leaves the network
 * alone — so both signals are needed and either one counts.
 */
test("a refused ad script is detected", async ({ page }) => {
  await page.route("**/pagead2.googlesyndication.com/**", (r) => r.abort());
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
});

/** Offline is not ad blocking, and must never be reported as such. */
test("being offline is not treated as ad blocking", async ({ page, context }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "onLine", { get: () => false })
  );
  await page.route("**/pagead2.googlesyndication.com/**", (r) => r.abort());
  await page.goto("/");
  await expect(page.getByText("no blocker")).toBeVisible();
  void context;
});

test("detects a blocker once filter-list selectors are hidden", async ({ page }) => {
  await simulateAdBlocker(page);
  await page.goto("/");

  // The component runs its own detection on mount and shows the dialog.
  await expect(page.getByRole("dialog")).toBeVisible();

  // The page's status readout is a separate hook instance that already ran, so
  // drive its re-check rather than racing the initial one.
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Re-check" }).click();
  await expect(page.getByText("blocker detected")).toBeVisible();
});

test("the dialog is accessible and traps focus", async ({ page }) => {
  await simulateAdBlocker(page);
  await page.goto("/");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAccessibleName(/AdBlocker Detected/i);

  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
});

test("Escape closes the dialog and restores scrolling", async ({ page }) => {
  await simulateAdBlocker(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("the how-to screen is reachable and reversible", async ({ page }) => {
  await simulateAdBlocker(page);
  await page.goto("/");
  await page.getByRole("button", { name: /How to disable/i }).click();
  await expect(page.getByText(/Click on the Extensions Icon/i)).toBeVisible();
  await page.getByRole("button", { name: /Go Back/i }).click();
  await expect(page.getByText(/AdBlocker Detected/i)).toBeVisible();
});

test("dialog does not overflow the viewport", async ({ page }) => {
  await simulateAdBlocker(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoClippedText(page, ".rad-title, .rad-btn");
});

test("renders as a bottom sheet on a phone", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "sheet behaviour is mobile-only");

  await simulateAdBlocker(page);
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const box = (await dialog.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 1);
  expect(await dialog.evaluate((el) => getComputedStyle(el).borderBottomLeftRadius)).toBe("0px");
});

test("the demo page logs no errors", async ({ page }) => {
  const assertClean = failOnConsoleErrors(page);
  await page.goto("/");
  await page.waitForTimeout(600);
  assertClean();
});
