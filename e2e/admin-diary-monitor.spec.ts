import { test, expect, request as playwrightRequest } from "@playwright/test";

// Regression coverage for the new "Diary Monitor" admin dashboard: for a
// given day, it should show every active batch and how many of its
// students have a lesson entry recorded that day, so an admin can see at
// a glance which classes are up to date and which teachers haven't
// recorded anything yet.

test("Diary Monitor shows per-batch recording status, breakdown, and missing students", async ({ page, baseURL }) => {
  const ts = Date.now();

  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA Monitor Ustadh ${ts}`,
      email: `qa.monitor.ustadh.${ts}@alnoor.edu.pk`,
      password: "MonitorPass789",
      phone: `+92${String(ts).slice(-10)}`,
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();
  const { data: ustadhData } = await ustadhRes.json();

  // Batch 1: HIFZ, 3 students — 2 will be recorded (Sabaq + Manzil), 1 left missing
  const batchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Monitor Batch ${ts}`, program: "HIFZ", ustadhId: ustadhData.ustadh.id, maxStudents: 20 },
  });
  expect(batchRes.ok()).toBeTruthy();
  const { data: batchData } = await batchRes.json();

  const studentIds: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const res = await page.request.post("/api/admin/students", {
      data: {
        name: `QA Monitor Student ${i} ${ts}`, program: "HIFZ", batchId: batchData.batch.id,
        guardianName: `QA Monitor Guardian ${i}`, guardianRelation: "Father", guardianPhone: `+92300111222${i}`,
      },
    });
    expect(res.ok()).toBeTruthy();
    studentIds.push((await res.json()).data.student.id);
  }

  // Batch 2: NAZRA, 1 student, left completely unrecorded (0%)
  const batch2Res = await page.request.post("/api/admin/batches", {
    data: { name: `QA Monitor Empty Batch ${ts}`, program: "NAZRA", ustadhId: ustadhData.ustadh.id, maxStudents: 20 },
  });
  expect(batch2Res.ok()).toBeTruthy();
  const { data: batch2Data } = await batch2Res.json();
  const emptyStudentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Monitor Unrecorded Student ${ts}`, program: "NAZRA", batchId: batch2Data.batch.id,
      guardianName: "QA Monitor Guardian N", guardianRelation: "Father", guardianPhone: "+923001112229",
    },
  });
  expect(emptyStudentRes.ok()).toBeTruthy();

  const ustadhContext = await playwrightRequest.newContext({ baseURL });
  const signinRes = await ustadhContext.post("/api/auth/signin", {
    data: { email: `qa.monitor.ustadh.${ts}@alnoor.edu.pk`, password: "MonitorPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();

  const sabaqRes = await ustadhContext.post("/api/lesson-entries", {
    data: { studentId: studentIds[0], lessonType: "SABAQ", juzFrom: 1, pageFrom: 1, juzTo: 1, pageTo: 10, grade: "GOOD", mistakeCount: 0 },
  });
  expect(sabaqRes.ok()).toBeTruthy();
  const manzilRes = await ustadhContext.post("/api/lesson-entries", {
    data: { studentId: studentIds[1], lessonType: "MANZIL", juzFrom: 1, pageFrom: 1, juzTo: 1, pageTo: 5, grade: "WEAK", mistakeCount: 2 },
  });
  expect(manzilRes.ok()).toBeTruthy();

  // Verify the API computes this correctly
  const today = new Date().toISOString().split("T")[0];
  const apiRes = await page.request.get(`/api/admin/diary-monitor?date=${today}`);
  expect(apiRes.ok()).toBeTruthy();
  const { data: monitorData } = await apiRes.json();
  const batch1Result = monitorData.batches.find((b: any) => b.name === `QA Monitor Batch ${ts}`);
  const batch2Result = monitorData.batches.find((b: any) => b.name === `QA Monitor Empty Batch ${ts}`);
  expect(batch1Result.recordedCount).toBe(2);
  expect(batch1Result.totalStudents).toBe(3);
  expect(batch1Result.pct).toBe(67);
  expect(batch1Result.breakdown.SABAQ).toBe(1);
  expect(batch1Result.breakdown.MANZIL).toBe(1);
  expect(batch1Result.missingStudents).toHaveLength(1);
  expect(batch1Result.missingStudents[0].name).toBe(`QA Monitor Student 3 ${ts}`);
  expect(batch2Result.recordedCount).toBe(0);
  expect(batch2Result.pct).toBe(0);

  // Verify the page itself renders this correctly
  await page.goto("/dashboard/admin/diary-monitor", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(`QA Monitor Batch ${ts}`, { exact: false })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Partial", { exact: true }).first()).toBeVisible();

  const batchCard = page.getByTestId(`batch-card-${batchData.batch.id}`);
  await expect(batchCard.getByText("2/3")).toBeVisible();

  await batchCard.getByRole("button", { name: /Show missing \(1\)/i }).click();
  await expect(page.getByText(`QA Monitor Student 3 ${ts}`)).toBeVisible();
  await expect(page.getByRole("link", { name: /Remind/i }).first()).toBeVisible();

  // Program filter narrows the list
  await page.getByRole("button", { name: "Nazrah", exact: true }).click();
  await expect(page.getByText(`QA Monitor Empty Batch ${ts}`, { exact: false })).toBeVisible();
  await expect(page.getByText(`QA Monitor Batch ${ts}`, { exact: false })).toHaveCount(0);

  await ustadhContext.dispose();
});
