import { test, expect, request as playwrightRequest } from "@playwright/test";

// School admin reported that Sabaq, Sabqi and Manzil "save at once" instead
// of separately, per standard madrasa practice. Root cause: the entry
// form's Sabaq/Sabqi/Manzil tabs shared ONE set of form state (grade, Juz/
// Page range, mistakes, notes) — switching tabs never cleared it, so a
// teacher who logged a Sabaq entry and then switched to Sabqi (or Manzil)
// without manually clearing every field would save it with the same grade,
// mistake count, notes, and even the same Juz/Page range as Sabaq — even
// though Sabqi/Manzil review a different, earlier part of the Quran.
//
// Each tab now keeps its own independent form state, and Sabqi/Manzil each
// pre-fill their Juz/Page range from THEIR OWN last entry of that type
// (never from Sabaq's current frontier).

test("Sabaq, Sabqi and Manzil tabs keep independent form state", async ({ page, baseURL }) => {
  const ts = Date.now();

  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA TabIso Ustadh ${ts}`,
      email: `qa.tabiso.ustadh.${ts}@alnoor.edu.pk`,
      password: "TabIsoPass789",
      phone: `+92${String(ts).slice(-10)}`,
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();
  const { data: ustadhData } = await ustadhRes.json();

  const batchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA TabIso Batch ${ts}`, program: "HIFZ", ustadhId: ustadhData.ustadh.id, maxStudents: 20 },
  });
  expect(batchRes.ok()).toBeTruthy();
  const { data: batchData } = await batchRes.json();

  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA TabIso Student ${ts}`, program: "HIFZ", batchId: batchData.batch.id,
      guardianName: "QA TabIso Guardian", guardianRelation: "Father", guardianPhone: "+923009991239",
      startingJuz: 10, startingPage: 180,
    },
  });
  expect(studentRes.ok()).toBeTruthy();
  const studentId = (await studentRes.json()).data.student.id;

  const ustadhContext = await playwrightRequest.newContext({ baseURL });
  const signinRes = await ustadhContext.post("/api/auth/signin", {
    data: { email: `qa.tabiso.ustadh.${ts}@alnoor.edu.pk`, password: "TabIsoPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();

  // Give this student prior Sabqi/Manzil history at very different ranges
  // from the Sabaq frontier (juz 10/page 180), so the pre-fill test is
  // meaningful.
  const sabqiRes = await ustadhContext.post("/api/lesson-entries", {
    data: { studentId, lessonType: "SABQI", juzFrom: 3, pageFrom: 40, juzTo: 3, pageTo: 45, grade: "GOOD", mistakeCount: 1 },
  });
  expect(sabqiRes.ok()).toBeTruthy();
  const manzilRes = await ustadhContext.post("/api/lesson-entries", {
    data: { studentId, lessonType: "MANZIL", juzFrom: 1, pageFrom: 1, juzTo: 1, pageTo: 12, grade: "WEAK", mistakeCount: 2 },
  });
  expect(manzilRes.ok()).toBeTruthy();

  const storageState = await ustadhContext.storageState();
  await page.context().addCookies(storageState.cookies);

  await page.goto(`/dashboard/ustadh/entry/${studentId}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Save Sabaq Entry", { timeout: 15_000 });

  const numberInputs = page.locator('input[type="number"]');

  // Sabaq tab pre-fills from progress (the frontier), unaffected by Sabqi/Manzil history
  await expect(numberInputs.nth(0)).toHaveValue("10");
  await expect(numberInputs.nth(1)).toHaveValue("180");

  // Fill Sabaq: grade, 3 mistakes, notes
  await page.getByText("Excellent", { exact: true }).click();
  await page.getByText("Add details ▼").click();
  await page.getByText("Atak", { exact: true }).click();
  await page.locator("textarea").fill("Sabaq-only note");

  // Switch to Sabqi WITHOUT saving — its own Juz/Page history, and a blank grade/mistakes/notes
  await page.getByText("Sabqi", { exact: true }).click();
  await expect(numberInputs.nth(0)).toHaveValue("3");
  await expect(numberInputs.nth(1)).toHaveValue("45");
  await expect(page.locator("button", { hasText: "Excellent" })).not.toHaveCSS("border-color", "rgb(22, 101, 52)");
  await expect(page.locator("text=total mistakes").locator("..").locator("div").first()).toHaveText("0");
  await expect(page.locator("textarea")).toHaveValue("");

  // Switch to Manzil — its own Juz/Page history, still blank grade/mistakes/notes
  await page.getByText("Manzil", { exact: true }).click();
  await expect(numberInputs.nth(0)).toHaveValue("1");
  await expect(numberInputs.nth(1)).toHaveValue("12");
  await expect(page.locator("text=total mistakes").locator("..").locator("div").first()).toHaveText("0");
  await expect(page.locator("textarea")).toHaveValue("");

  // Switching back to Sabaq restores exactly what was filled in earlier — proving
  // state is preserved per-tab, not merely reset globally on every switch
  await page.getByText("Sabaq", { exact: true }).click();
  await expect(numberInputs.nth(0)).toHaveValue("10");
  await expect(page.locator("textarea")).toHaveValue("Sabaq-only note");
  await expect(page.locator("text=total mistakes").locator("..").locator("div").first()).toHaveText("1");

  await ustadhContext.dispose();
});
