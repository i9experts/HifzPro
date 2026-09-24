import { test, expect, request as playwrightRequest } from "@playwright/test";

// The Nazrah Diary surah dropdown used to hardcode only 16 of the 114
// surahs (1-10, then a handful from the 30th juz), so a teacher could not
// record recitation progress for most of the Quran (e.g. Surah Al-Kahf,
// Surah Ya-Sin). Now backed by the same complete, shared surah list used
// by the admin Quran browser (lib/quran-data.ts).

test("Nazrah Diary surah dropdown lists all 114 surahs", async ({ page, baseURL }) => {
  const ts = Date.now();

  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA Nazrah Ustadh ${ts}`,
      email: `qa.nazrah.ustadh.${ts}@alnoor.edu.pk`,
      password: "NazrahPass789",
      phone: `+92${String(ts).slice(-10)}`,
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();
  const { data: ustadhData } = await ustadhRes.json();

  const batchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Nazrah Batch ${ts}`, program: "NAZRA", ustadhId: ustadhData.ustadh.id, maxStudents: 20 },
  });
  expect(batchRes.ok()).toBeTruthy();
  const { data: batchData } = await batchRes.json();

  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Nazrah Student ${ts}`, program: "NAZRA", batchId: batchData.batch.id,
      guardianName: "QA Nazrah Guardian", guardianRelation: "Father", guardianPhone: "+923009991237",
    },
  });
  expect(studentRes.ok()).toBeTruthy();

  const ustadhContext = await playwrightRequest.newContext({ baseURL });
  const signinRes = await ustadhContext.post("/api/auth/signin", {
    data: { email: `qa.nazrah.ustadh.${ts}@alnoor.edu.pk`, password: "NazrahPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();
  const storageState = await ustadhContext.storageState();
  await page.context().addCookies(storageState.cookies);

  await page.goto("/dashboard/ustadh/nazrah", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(`QA Nazrah Student ${ts}`)).toBeVisible({ timeout: 10_000 });

  const options = page.locator("select").first().locator("option");
  await expect(options).toHaveCount(114);

  // Previously missing surahs (e.g. Al-Kahf #18, Ya-Sin #36) must now be present
  await expect(options.nth(17)).toHaveText(/18\. Al-Kahf/);
  await expect(options.nth(35)).toHaveText(/36\. Ya-Sin/);
  await expect(options.last()).toHaveText(/114\. An-Nas/);

  // Selecting a previously-missing surah and saving a Nazrah entry works
  await page.locator("select").first().selectOption("36");
  await page.getByText("Good 👍", { exact: true }).click();
  await page.getByRole("button", { name: "Save Nazrah Entry" }).click();
  await expect(page.getByText("Saved!")).toBeVisible({ timeout: 10_000 });

  await ustadhContext.dispose();
});
