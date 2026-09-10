import { test, expect } from "@playwright/test";

test("create a new Halqa (batch)", async ({ page }) => {
  const name = `QA Test Halqa ${Date.now()}`;

  await page.goto("/dashboard/admin/batches/new", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/e.g. Halqa A/i).fill(name);
  await page.getByRole("button", { name: "Create Halqa →" }).click();

  await expect(page.getByText("HALQA CREATED")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("link", { name: "All Halqas" }).click();
  await page.waitForURL("**/dashboard/admin/batches");
  await expect(page.getByText(name)).toBeVisible();
});
