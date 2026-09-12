import { test, expect, request as playwrightRequest } from "@playwright/test";

test("Hifz Diary module link opens a student picker instead of 404ing", async ({ page, baseURL }) => {
  const ts = Date.now();

  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA Picker Ustadh ${ts}`,
      email: `qa.picker.ustadh.${ts}@alnoor.edu.pk`,
      password: "PickerPass789",
      phone: `+9231${ts}`.slice(0, 13),
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();
  const { data: ustadhData } = await ustadhRes.json();

  const batchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Picker Batch ${ts}`, program: "HIFZ", ustadhId: ustadhData.ustadh.id, maxStudents: 20 },
  });
  expect(batchRes.ok()).toBeTruthy();
  const { data: batchData } = await batchRes.json();

  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Picker Student ${ts}`, program: "HIFZ", batchId: batchData.batch.id,
      guardianName: "QA Picker Guardian", guardianRelation: "Father", guardianPhone: "+923009991235",
    },
  });
  expect(studentRes.ok()).toBeTruthy();

  const ustadhContext = await playwrightRequest.newContext({ baseURL });
  const signinRes = await ustadhContext.post("/api/auth/signin", {
    data: { email: `qa.picker.ustadh.${ts}@alnoor.edu.pk`, password: "PickerPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();
  const storageState = await ustadhContext.storageState();
  await page.context().addCookies(storageState.cookies);

  // Click the "Hifz Diary" module card from the ustadh home page, exactly as a real user would
  await page.goto("/dashboard/ustadh", { waitUntil: "domcontentloaded" });
  await page.getByText("Hifz Diary", { exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard\/ustadh\/entry$/);
  await expect(page.getByText("404")).toHaveCount(0);
  await expect(page.getByText(`QA Picker Student ${ts}`)).toBeVisible({ timeout: 10_000 });

  await page.getByText(`QA Picker Student ${ts}`).click();
  await expect(page).toHaveURL(/\/dashboard\/ustadh\/entry\/[a-z0-9]+$/);
  await expect(page.getByRole("button", { name: "Save Sabaq Entry" })).toBeVisible({ timeout: 10_000 });

  await ustadhContext.dispose();
});
