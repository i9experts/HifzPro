import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/admin.json";

setup("authenticate as campus admin", async ({ page }) => {
  await page.goto("/signin");
  await page.locator('input[type="email"]').fill("admin@alnoor.edu.pk");
  await page.locator('input[type="password"]').fill("Admin@123");
  await page.getByRole("button", { name: /sign in as admin/i }).click();
  await page.waitForURL("**/dashboard/admin**", { timeout: 15_000, waitUntil: "commit" });
  await expect(page).toHaveURL(/\/dashboard\/admin/);
  await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible({ timeout: 15_000 });
  await page.context().storageState({ path: authFile });
});
