import { test, expect, request as playwrightRequest } from "@playwright/test";

// The Qaida/Tajweed module now tracks the standard 16-Takhti Noorani Qaida
// curriculum per student: a summary dashboard (mastered count, current
// Takhti, needs-revision count, overall status), a 16-Takhti grid, and a
// Record Attempt panel (real drill content, date/time, a 4-level rating,
// and three 1-5 accuracy scales) that logs an attempt and updates the
// Takhti's status.

test("Qaida tracker records attempts and updates 16-Takhti progress", async ({ page, baseURL }) => {
  const ts = Date.now();

  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA Qaida Ustadh ${ts}`,
      email: `qa.qaida.ustadh.${ts}@alnoor.edu.pk`,
      password: "QaidaPass789",
      phone: `+92${String(ts).slice(-10)}`,
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();
  const { data: ustadhData } = await ustadhRes.json();

  const batchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Qaida Batch ${ts}`, program: "HIFZ", ustadhId: ustadhData.ustadh.id, maxStudents: 20 },
  });
  expect(batchRes.ok()).toBeTruthy();
  const { data: batchData } = await batchRes.json();

  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Qaida Student ${ts}`, program: "HIFZ", batchId: batchData.batch.id,
      guardianName: "QA Qaida Guardian", guardianRelation: "Father", guardianPhone: "+923009991236",
    },
  });
  expect(studentRes.ok()).toBeTruthy();

  const ustadhContext = await playwrightRequest.newContext({ baseURL });
  const signinRes = await ustadhContext.post("/api/auth/signin", {
    data: { email: `qa.qaida.ustadh.${ts}@alnoor.edu.pk`, password: "QaidaPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();
  const storageState = await ustadhContext.storageState();
  await page.context().addCookies(storageState.cookies);

  await page.goto("/dashboard/ustadh/qaida", { waitUntil: "domcontentloaded" });
  await page.getByText(`QA Qaida Student ${ts}`).click();

  // Fresh student: nothing mastered yet, starting on Takhti 1, not started overall
  await expect(page.getByText("0/16")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Takhti 1", { exact: true })).toBeVisible();
  await expect(page.getByText("NOT STARTED")).toBeVisible();

  // Open Takhti 1 (Mufradat) — the 29-letter grid should render
  await page.getByText("Mufradat", { exact: true }).first().click();
  await expect(page.getByText("Record Attempt — Takhti 1: Mufradat", { exact: false })).toBeVisible();
  await expect(page.getByText("29 isolated Arabic letters", { exact: false })).toBeVisible();
  await expect(page.getByText("ا", { exact: true }).first()).toBeVisible();

  // Rate it Mastered with full scores and save
  await page.getByRole("button", { name: "Mastered" }).click();
  await page.getByRole("button", { name: "Save Attempt" }).click();
  await expect(page.getByText("Saved!", { exact: false })).toBeVisible({ timeout: 10_000 });

  // Progress should now show 1/16 mastered, advanced to Takhti 2, still in progress overall
  await expect(page.getByText("1/16")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Takhti 2", { exact: true })).toBeVisible();
  await expect(page.getByText("IN PROGRESS")).toBeVisible();

  // Open Takhti 2 (Murakkabat) and flag it as needing practice
  await page.getByText("Murakkabat", { exact: true }).first().click();
  await expect(page.getByText("Record Attempt — Takhti 2: Murakkabat", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Needs Practice" }).click();
  await page.getByRole("button", { name: "Save Attempt" }).click();
  await expect(page.getByText("Saved!", { exact: false })).toBeVisible({ timeout: 10_000 });

  // Needs-revision count should now be 1, mastered count unchanged at 1/16
  await expect(page.getByText("1/16")).toBeVisible({ timeout: 10_000 });
  const needsRevisionCard = page.getByText("Needs Revision", { exact: true }).locator("xpath=..");
  await expect(needsRevisionCard.getByText("1", { exact: true })).toBeVisible();

  await ustadhContext.dispose();
});
