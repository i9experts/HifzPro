import { test, expect } from "@playwright/test";

test("issue a Sanad certificate for a student", async ({ page }) => {
  // Create a dedicated throwaway student via the API so issuing a HIFZ
  // Sanad (which marks the student COMPLETED) doesn't disturb seeded data
  // used by other specs.
  const studentName = `QA Sanad Student ${Date.now()}`;
  const createRes = await page.request.post("/api/admin/students", {
    data: {
      name: studentName,
      program: "HIFZ",
      enrolledAt: new Date().toISOString().split("T")[0],
      startingJuz: 1, startingSurah: 1, startingAyah: 1, startingPage: 1,
      guardianName: "QA Sanad Guardian",
      guardianRelation: "Father",
      guardianPhone: "+923001234567",
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const { data: created } = await createRes.json();
  const studentId = created.student.id;

  await page.goto("/dashboard/admin/sanads/new", { waitUntil: "domcontentloaded" });

  // Step 1 — Student & Program. The list loads async, so wait for the
  // just-created student's option to appear before selecting it.
  await expect(page.getByText("STEP 1 OF 4", { exact: true })).toBeVisible();
  const studentSelect = page.locator("select").first();
  await expect(studentSelect.locator(`option[value="${studentId}"]`)).toBeAttached({ timeout: 10_000 });
  await studentSelect.selectOption(studentId);
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 2 — Certificate Design (defaults are fine)
  await expect(page.getByText("STEP 2 OF 4", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 3 — Content & Silsila (defaults are fine)
  await expect(page.getByText("STEP 3 OF 4", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue →" }).click();

  // Step 4 — Review & Issue
  await expect(page.getByText("STEP 4 OF 4", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Issue Sanad/i }).click();

  await expect(page.getByText("SANAD ISSUED")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("heading", { name: studentName })).toBeVisible();
  await expect(page.getByRole("link", { name: /View & Download Certificate/i })).toBeVisible();
});
