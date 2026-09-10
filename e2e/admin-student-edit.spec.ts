import { test, expect } from "@playwright/test";

test("edit an existing student's profile", async ({ page }) => {
  const studentName = `QA Edit Student ${Date.now()}`;
  const createRes = await page.request.post("/api/admin/students", {
    data: {
      name: studentName,
      city: "Lahore",
      program: "HIFZ",
      enrolledAt: new Date().toISOString().split("T")[0],
      guardianName: "QA Edit Guardian",
      guardianRelation: "Father",
      guardianPhone: "+923001234567",
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const { data } = await createRes.json();
  const studentId = data.student.id;

  await page.goto(`/dashboard/admin/students/${studentId}/edit`);
  const cityInput = page.getByPlaceholder("e.g. Karachi");
  await expect(cityInput).toHaveValue("Lahore");

  await cityInput.fill("Islamabad");
  await page.getByRole("button", { name: "Save Changes" }).first().click();

  await expect(page.getByText(/updated successfully/i)).toBeVisible({ timeout: 10_000 });
  await page.waitForURL(`**/dashboard/admin/students/${studentId}`, { timeout: 10_000, waitUntil: "commit" });

  // The student profile view doesn't render the city field, so verify the
  // save actually persisted via the API rather than the UI.
  const check = await page.request.get(`/api/admin/students/${studentId}`);
  const { data: student } = await check.json();
  expect(student.student.city).toBe("Islamabad");
});

test("withdraw a student", async ({ page }) => {
  const studentName = `QA Withdraw Student ${Date.now()}`;
  const createRes = await page.request.post("/api/admin/students", {
    data: {
      name: studentName,
      program: "HIFZ",
      enrolledAt: new Date().toISOString().split("T")[0],
      guardianName: "QA Withdraw Guardian",
      guardianRelation: "Father",
      guardianPhone: "+923001234567",
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const { data } = await createRes.json();
  const studentId = data.student.id;

  await page.goto(`/dashboard/admin/students/${studentId}/edit`);

  page.once("dialog", (dialog) => dialog.accept());
  // noWaitAfter: the click's confirm() dialog is accepted synchronously and
  // immediately followed by a full-page navigation, which can tear down the
  // frame before Playwright's post-click checks resolve — causing a hang.
  await page.getByRole("button", { name: "Withdraw Student" }).first().click({ noWaitAfter: true });

  await page.waitForURL("**/dashboard/admin/students", { timeout: 10_000, waitUntil: "commit" });

  // Confirm the API-side status actually flipped to WITHDRAWN
  const check = await page.request.get(`/api/admin/students/${studentId}`);
  const { data: student } = await check.json();
  expect(student.student.status).toBe("WITHDRAWN");
});
