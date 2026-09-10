import { test, expect } from "@playwright/test";

test("record a fee payment for a student", async ({ page }) => {
  await page.goto("/dashboard/admin/fees/payments/new");

  // Pick the first real student in the dropdown (index 0 is the placeholder).
  // The list loads async, so wait for it to populate before reading options.
  const studentSelect = page.locator("select").first();
  await expect(studentSelect.locator("option")).not.toHaveCount(1, { timeout: 10_000 });
  await studentSelect.selectOption({ index: 1 });

  await page.locator('input[type="number"]').first().fill("5000"); // Fee Amount
  const paidInput = page.locator('input[type="number"]').nth(2); // Amount Paid
  await paidInput.fill("5000");

  await expect(page.getByText("✅ PAID")).toBeVisible();

  await page.getByRole("button", { name: /Record Payment/i }).click();

  await expect(page.getByText("PAYMENT RECORDED")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("PKR 5,000")).toBeVisible();
  await expect(page.getByRole("link", { name: /View & Print Receipt/i })).toBeVisible();
});
