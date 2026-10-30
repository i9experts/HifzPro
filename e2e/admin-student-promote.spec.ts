import { test, expect } from "@playwright/test";

// Promote Student — lets an admin transfer a student between the three
// program categories (Nazrah/Hifz/Girdaan, plus Tajweed) while keeping
// their existing records (guardians, history) intact.
test("promote a student from Hifz to Nazrah with a new Halqa", async ({ page }) => {
  const ts = Date.now();

  const hifzBatchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Promote Hifz Halqa ${ts}`, program: "HIFZ", maxStudents: 20 },
  });
  expect(hifzBatchRes.ok()).toBeTruthy();
  const { data: hifzBatchData } = await hifzBatchRes.json();

  const nazraBatchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Promote Nazra Halqa ${ts}`, program: "NAZRA", maxStudents: 20 },
  });
  expect(nazraBatchRes.ok()).toBeTruthy();
  const { data: nazraBatchData } = await nazraBatchRes.json();

  const studentName = `QA Promote Student ${ts}`;
  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: studentName, program: "HIFZ", batchId: hifzBatchData.batch.id,
      guardianName: "QA Promote Guardian", guardianRelation: "Father", guardianPhone: "+923001112223",
    },
  });
  expect(studentRes.ok()).toBeTruthy();
  const { data: studentData } = await studentRes.json();
  const studentId = studentData.student.id;

  await page.goto(`/dashboard/admin/students/${studentId}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "🔄 Promote Student" }).click();

  await expect(page.getByText("PROMOTE / TRANSFER STUDENT")).toBeVisible();
  await page.locator("select").first().selectOption("NAZRA");
  await page.locator("select").nth(1).selectOption(nazraBatchData.batch.id);
  await page.getByRole("button", { name: "Confirm Promotion" }).click();

  await expect(page.getByText(/promoted from Hifz ul Quran to Nazrah/i)).toBeVisible({ timeout: 10_000 });

  const check = await page.request.get(`/api/admin/students/${studentId}`);
  const { data: after } = await check.json();
  expect(after.student.program).toBe("NAZRA");
  expect(after.student.batchId).toBe(nazraBatchData.batch.id);

  // Existing records (guardian) are untouched by the promotion
  const primaryGuardian = after.student.guardians.find((g: any) => g.isEmergency) || after.student.guardians[0];
  expect(primaryGuardian.name).toBe("QA Promote Guardian");
});

test("promoting without picking a Halqa leaves the student unassigned", async ({ page }) => {
  const ts = Date.now();

  const hifzBatchRes = await page.request.post("/api/admin/batches", {
    data: { name: `QA Promote2 Hifz Halqa ${ts}`, program: "HIFZ", maxStudents: 20 },
  });
  expect(hifzBatchRes.ok()).toBeTruthy();
  const { data: hifzBatchData } = await hifzBatchRes.json();

  const studentName = `QA Promote2 Student ${ts}`;
  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: studentName, program: "HIFZ", batchId: hifzBatchData.batch.id,
      guardianName: "QA Promote2 Guardian", guardianRelation: "Father", guardianPhone: "+923001112224",
    },
  });
  expect(studentRes.ok()).toBeTruthy();
  const { data: studentData } = await studentRes.json();
  const studentId = studentData.student.id;

  const promoteRes = await page.request.post(`/api/admin/students/${studentId}/promote`, {
    data: { program: "GIRDAAN" },
  });
  expect(promoteRes.ok()).toBeTruthy();

  const check = await page.request.get(`/api/admin/students/${studentId}`);
  const { data: after } = await check.json();
  expect(after.student.program).toBe("GIRDAAN");
  expect(after.student.batchId).toBeNull();
});
