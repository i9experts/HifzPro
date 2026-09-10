import { test, expect } from "@playwright/test";

test("edit and deactivate a batch", async ({ page }) => {
  const batchName = `QA Edit Halqa ${Date.now()}`;
  const createRes = await page.request.post("/api/admin/batches", {
    data: { name: batchName, program: "HIFZ", maxStudents: 10 },
  });
  expect(createRes.ok()).toBeTruthy();
  const { data } = await createRes.json();
  const batchId = data.batch.id;

  await page.goto(`/dashboard/admin/batches/${batchId}/edit`, { waitUntil: "domcontentloaded" });
  const maxStudentsInput = page.locator('input[type="number"]');
  await expect(maxStudentsInput).toHaveValue("10");
  await maxStudentsInput.fill("20");
  await page.getByRole("button", { name: "Save Changes" }).last().click();

  await expect(page.getByText(/Saved! Redirecting/i)).toBeVisible({ timeout: 10_000 });
  await page.waitForURL(`**/dashboard/admin/batches/${batchId}`, { timeout: 10_000, waitUntil: "commit" });

  const check = await page.request.get(`/api/admin/batches/${batchId}`);
  const { data: after } = await check.json();
  expect(after.batch.maxStudents).toBe(20);

  // Deactivate
  await page.goto(`/dashboard/admin/batches/${batchId}/edit`, { waitUntil: "domcontentloaded" });
  page.once("dialog", (dialog) => dialog.accept());
  // noWaitAfter: the click's confirm() dialog is accepted synchronously and
  // immediately followed by a full-page navigation, which can tear down the
  // frame before Playwright's post-click checks resolve — causing a hang.
  await page.getByRole("button", { name: "Deactivate" }).click({ noWaitAfter: true });
  await page.waitForURL("**/dashboard/admin/batches", { timeout: 10_000, waitUntil: "commit" });

  const finalCheck = await page.request.get(`/api/admin/batches/${batchId}`);
  const { data: final } = await finalCheck.json();
  expect(final.batch.isActive).toBe(false);
});
