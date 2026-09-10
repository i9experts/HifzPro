import { test, expect } from "@playwright/test";

test("enrol a new student through the full 6-step wizard", async ({ page }) => {
  const studentName = `QA Test Student ${Date.now()}`;

  await page.goto("/dashboard/admin/students/new");

  // Step 1 — Personal Info
  await expect(page.getByText("STEP 1 OF 6", { exact: true })).toBeVisible();
  await page.getByPlaceholder("e.g. Muhammad Ahmed").fill(studentName);
  await page.getByPlaceholder("e.g. Karachi").fill("Karachi");
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 2 — Program & Batch
  await expect(page.getByText("STEP 2 OF 6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 3 — Quran Position
  await expect(page.getByText("STEP 3 OF 6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 4 — Guardian Details (required)
  await expect(page.getByText("STEP 4 OF 6", { exact: true })).toBeVisible();
  await page.getByPlaceholder("e.g. Muhammad Abdullah").fill("QA Test Guardian");
  await page.getByPlaceholder("+92 300 0000000").first().fill("+923001234567");
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 5 — Documents (optional, skip)
  await expect(page.getByText("STEP 5 OF 6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 6 — Review & Enrol
  await expect(page.getByText("STEP 6 OF 6", { exact: true })).toBeVisible();
  await expect(page.getByText(studentName)).toBeVisible();
  await page.getByRole("button", { name: /Enrol Student/i }).click();

  // Success screen shows the generated enrollment number
  await expect(page.getByText(studentName)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("link", { name: /View Profile/i })).toBeVisible();

  // The student should now show up in the students list
  await page.getByRole("link", { name: "All Students" }).click();
  await page.waitForURL("**/dashboard/admin/students");
  await expect(page.getByText(studentName)).toBeVisible();
});
