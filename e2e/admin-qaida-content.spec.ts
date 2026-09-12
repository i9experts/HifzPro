import { test, expect, request as playwrightRequest } from "@playwright/test";

// The Qaida/Tajweed page used to be a bare lesson-name dropdown with no real
// content. This covers the real Noorani Qaida content now rendered per
// lesson: the 29-letter alphabet with Makharij (articulation point) info,
// the interactive Makharij diagram, rule-based lessons (e.g. Qalqalah,
// Noon Sakin), and that recording a Qaida entry still works end to end.

test("Qaida page renders real lesson content and still records entries", async ({ page, baseURL }) => {
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
  await expect(page.getByText(`QA Qaida Student ${ts}`)).toBeVisible({ timeout: 10_000 });
  await page.getByText(`QA Qaida Student ${ts}`).click();

  // Lesson 1: Arabic Letters — the 29-letter grid should render, and tapping
  // a letter should show its makhraj info and highlight the diagram.
  await expect(page.getByText("Arabic Letters", { exact: false })).toBeVisible();
  await expect(page.getByText("29 LETTERS", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "ق", exact: false }).click();
  await expect(page.getByText("Qaf", { exact: false })).toBeVisible();
  await expect(page.getByText("MAKHARIJ AL-HUROOF", { exact: false })).toBeVisible();

  // Jump to Lesson 7: Qalqalah — a rules-type lesson with trigger letters
  await page.locator("button", { hasText: /^7$/ }).click();
  await expect(page.getByText("Qalqalah", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("قطب جد").first()).toBeVisible();

  // Jump to Lesson 10: Noon Sakin & Tanwin — multiple rule cards
  await page.locator("button", { hasText: /^10$/ }).click();
  await expect(page.getByText("Idgham with Ghunnah")).toBeVisible();
  await expect(page.getByText("Ikhfa (Concealment)")).toBeVisible();

  // Recording still works: select a competency level and save
  await page.getByText("Practicing", { exact: true }).click();
  await page.getByRole("button", { name: "Save Qaida Entry" }).click();
  await expect(page.getByText("Saved!")).toBeVisible({ timeout: 10_000 });

  await ustadhContext.dispose();
});
