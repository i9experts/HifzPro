import { test, expect } from "@playwright/test";

// Every top-level admin page reachable by URL. Existing-record detail pages
// ([id]) are exercised separately once we have known seeded IDs.
const PAGES = [
  "/dashboard/admin",
  "/dashboard/admin/analytics",
  "/dashboard/admin/students",
  "/dashboard/admin/students/new",
  "/dashboard/admin/asatidha",
  "/dashboard/admin/asatidha/new",
  "/dashboard/admin/batches",
  "/dashboard/admin/batches/new",
  "/dashboard/admin/attendance",
  "/dashboard/admin/attendance/reports",
  "/dashboard/admin/campuses",
  "/dashboard/admin/campuses/new",
  "/dashboard/admin/donors",
  "/dashboard/admin/fees",
  "/dashboard/admin/fees/outstanding",
  "/dashboard/admin/fees/payments/new",
  "/dashboard/admin/fees/scholarships",
  "/dashboard/admin/fees/structures/new",
  "/dashboard/admin/finance/export",
  "/dashboard/admin/hijri",
  "/dashboard/admin/id-cards",
  "/dashboard/admin/mutashabihat",
  "/dashboard/admin/notifications",
  "/dashboard/admin/profile",
  "/dashboard/admin/quran",
  "/dashboard/admin/sanads",
  "/dashboard/admin/sanads/new",
  "/dashboard/admin/tests",
  "/dashboard/admin/whatsapp",
  "/dashboard/admin/whatsapp/settings",
];

for (const path of PAGES) {
  test(`loads without crashing: ${path}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `HTTP status for ${path}`).toBeTruthy();
    await page.waitForTimeout(500); // let client-side fetches/hydration settle

    // Next.js dev error overlay / default error page markers
    await expect(page.getByText(/application error/i)).toHaveCount(0);
    await expect(page.getByText(/unhandled runtime error/i)).toHaveCount(0);
    await expect(page.locator("nextjs-portal")).toHaveCount(0);

    // Should not have been bounced to signin (session lost / role check failed)
    await expect(page).not.toHaveURL(/\/signin/);

    expect(consoleErrors, `uncaught client errors on ${path}`).toEqual([]);
  });
}
