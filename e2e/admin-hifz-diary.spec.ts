import { test, expect, request as playwrightRequest } from "@playwright/test";

// Regression coverage for the Hifz Diary (Sabaq/Sabqi/Manzil) recording flow.
// Two bugs were found and fixed here:
//  1. The entry form pre-filled Juz/Page from whichever lesson type was most
//     recently logged, instead of the student's tracked progress — so a
//     Sabqi/Manzil entry (reviewing an earlier, lower juz) could silently
//     regress a student's actual memorization progress on the next Sabaq save.
//  2. Manzil Health was recalculated (and double-counted) on every lesson
//     type, not just MANZIL entries, so a Sabaq/Sabqi grade could move the
//     "revision retention" metric even though no revision had happened.

test("Sabaq entry pre-fills from progress, and Manzil Health only moves on Manzil entries", async ({ page, baseURL }) => {
  const ts = Date.now();

  // ── Set up an ustadh, batch, and student via the authenticated admin session ──
  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA Diary Ustadh ${ts}`,
      email: `qa.diary.ustadh.${ts}@alnoor.edu.pk`,
      password: "DiaryPass789",
      phone: `+9230${ts}`.slice(0, 13),
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();
  const { data: ustadhData } = await ustadhRes.json();

  const batchRes = await page.request.post("/api/admin/batches", {
    data: {
      name: `QA Diary Batch ${ts}`,
      program: "HIFZ",
      ustadhId: ustadhData.ustadh.id,
      maxStudents: 20,
    },
  });
  expect(batchRes.ok()).toBeTruthy();
  const { data: batchData } = await batchRes.json();

  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Diary Student ${ts}`,
      program: "HIFZ",
      batchId: batchData.batch.id,
      guardianName: "QA Diary Guardian",
      guardianRelation: "Father",
      guardianPhone: "+923009991234",
      startingJuz: 5,
      startingPage: 90,
    },
  });
  expect(studentRes.ok()).toBeTruthy();
  const { data: studentData } = await studentRes.json();
  const studentId = studentData.student.id;

  // ── Sign in as the ustadh in a fresh, unauthenticated context ──
  const ustadhContext = await playwrightRequest.newContext({ baseURL });
  const signinRes = await ustadhContext.post("/api/auth/signin", {
    data: { email: `qa.diary.ustadh.${ts}@alnoor.edu.pk`, password: "DiaryPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();

  // Log a SABAQ entry: juz 5 -> 8, page 90 -> 140
  const sabaqRes = await ustadhContext.post("/api/lesson-entries", {
    data: { studentId, lessonType: "SABAQ", juzFrom: 5, pageFrom: 90, juzTo: 8, pageTo: 140, grade: "GOOD", mistakeCount: 0 },
  });
  expect(sabaqRes.ok()).toBeTruthy();

  // Manzil Health must stay untouched by a Sabaq entry (starts at 100 from enrollment)
  let lastEntryRes = await ustadhContext.get(`/api/students/${studentId}/last-entry`);
  let lastEntryData = (await lastEntryRes.json()).data;
  expect(lastEntryData.student.manzilHealth).toBe(100);

  // Log a MANZIL entry reviewing an earlier juz: juz 1, page 1 -> 20, grade WEAK
  const manzilRes = await ustadhContext.post("/api/lesson-entries", {
    data: { studentId, lessonType: "MANZIL", juzFrom: 1, pageFrom: 1, juzTo: 1, pageTo: 20, grade: "WEAK", mistakeCount: 3 },
  });
  expect(manzilRes.ok()).toBeTruthy();

  lastEntryRes = await ustadhContext.get(`/api/students/${studentId}/last-entry`);
  lastEntryData = (await lastEntryRes.json()).data;
  // Progress must remain at the Sabaq frontier — untouched by the Manzil entry
  expect(lastEntryData.student.progress.currentJuz).toBe(8);
  expect(lastEntryData.student.progress.currentPage).toBe(140);
  // A single WEAK Manzil grade (55) counted exactly once, not doubled
  expect(lastEntryData.student.manzilHealth).toBe(55);

  // ── Now open the entry page as the ustadh in the browser and confirm the
  //    Sabaq tab pre-fills from progress (8/140), not from the Manzil entry (1/20) ──
  const storageState = await ustadhContext.storageState();
  await page.context().addCookies(storageState.cookies);
  await page.goto(`/dashboard/ustadh/entry/${studentId}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Save Sabaq Entry" })).toBeVisible({ timeout: 15_000 });

  const numberInputs = page.locator('input[type="number"]');
  await expect(numberInputs.nth(0)).toHaveValue("8");   // Juz From
  await expect(numberInputs.nth(1)).toHaveValue("140"); // Page From
  await expect(numberInputs.nth(2)).toHaveValue("8");   // Juz To
  await expect(numberInputs.nth(3)).toHaveValue("140"); // Page To

  await ustadhContext.dispose();
});
