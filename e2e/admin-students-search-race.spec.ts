import { test, expect } from "@playwright/test";

// Regression test for a race condition on /dashboard/admin/students: the
// page's initial (unfiltered) fetch on mount and a fetch triggered a moment
// later by typing into the search box can resolve out of order. If the
// unfiltered response happens to arrive after the filtered one, it used to
// silently overwrite the correct, filtered results with the unfiltered list
// — with no visible error, just wrong data on screen.
//
// This is reproduced deterministically (rather than relying on real
// network timing) by delaying only the unfiltered request's response.

test("a slow initial fetch cannot clobber a faster, newer search result", async ({ page }) => {
  const studentName = `QA Race Student ${Date.now()}`;

  const createRes = await page.request.post("/api/admin/students", {
    data: {
      name: studentName, program: "HIFZ",
      guardianName: "QA Race Guardian", guardianRelation: "Father", guardianPhone: "+923001112223",
    },
  });
  expect(createRes.ok()).toBeTruthy();

  // Delay only the unfiltered request (no `search` param) so it resolves
  // well after a subsequent filtered request would.
  await page.route("**/api/admin/students?*", async route => {
    const url = new URL(route.request().url());
    if (!url.searchParams.get("search")) {
      await new Promise(r => setTimeout(r, 1500));
    }
    await route.continue();
  });

  await page.goto("/dashboard/admin/students", { waitUntil: "domcontentloaded" });
  // Search immediately — the slow unfiltered request from page load is
  // still in flight at this point.
  await page.getByPlaceholder("Search by name or enrollment number...").fill(studentName);

  // Give the deliberately-slowed unfiltered response time to land too, so
  // a broken version of the page (no request-sequencing guard) would have
  // already overwritten the filtered result by the time we assert.
  await page.waitForTimeout(2000);

  await expect(page.getByText(studentName)).toBeVisible();
  await expect(page.getByText(/students enrolled/i)).toContainText("1 students enrolled");
});
