import { test, expect } from "@playwright/test";

test("create a new Ustadh account through the 3-step wizard", async ({ page }) => {
  const name = `QA Test Ustadh ${Date.now()}`;
  const email = `qa.ustadh.${Date.now()}@alnoor.edu.pk`;

  await page.goto("/dashboard/admin/asatidha/new");

  // Step 1 — Account Details
  await expect(page.getByText("STEP 1 OF 3", { exact: true })).toBeVisible();
  await page.getByPlaceholder("e.g. Qari Muhammad Saleem").fill(name);
  await page.getByPlaceholder("qari.saleem@institute.com").fill(email);
  await page.getByPlaceholder("Min 6 characters").fill("QaPass123");
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 2 — Profile & Skills
  await expect(page.getByText("STEP 2 OF 3", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 3 — Review & Create
  await expect(page.getByText("STEP 3 OF 3", { exact: true })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await page.getByRole("button", { name: /Create Ustadh Account/i }).click();

  // Success screen shows the credentials card
  await expect(page.getByText("USTADH ADDED")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(email)).toBeVisible();

  // Should now be visible in the asatidha list
  await page.getByRole("link", { name: /Assign Batch/i }).click();
  await page.waitForURL("**/dashboard/admin/batches");
});
