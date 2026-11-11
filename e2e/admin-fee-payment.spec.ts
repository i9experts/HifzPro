import { test, expect } from "@playwright/test";

test("a discount that fully covers the fee marks it PAID, not PARTIAL", async ({ page }) => {
  const ts = Date.now();

  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Discount Student ${ts}`, program: "HIFZ",
      guardianName: "QA Discount Guardian", guardianRelation: "Father", guardianPhone: "+923009992236",
    },
  });
  expect(studentRes.ok()).toBeTruthy();
  const { data: studentData } = await studentRes.json();

  // Fee 5000, discount 1000, paid 4000 — the balance nets to zero, so this
  // should be PAID (not PARTIAL, which only looked at paidAmount before).
  const payRes = await page.request.post("/api/admin/fees/payments", {
    data: {
      studentId: studentData.student.id, amount: 5000, paidAmount: 4000, discountAmount: 1000,
      month: 1, year: 2027, paymentMethod: "CASH",
    },
  });
  expect(payRes.ok()).toBeTruthy();
  const { data: payData } = await payRes.json();
  expect(payData.payment.status).toBe("PAID");

  // And it must not show up as still owing money.
  const outstandingRes = await page.request.get("/api/admin/fees/outstanding");
  const { data: outstandingData } = await outstandingRes.json();
  expect(outstandingData.students.some((s: any) => s.studentId === studentData.student.id)).toBe(false);
});

test("concurrent payment submissions each get a unique receipt number", async ({ page }) => {
  const ts = Date.now();
  const studentRes = await page.request.post("/api/admin/students", {
    data: {
      name: `QA Concurrent Student ${ts}`, program: "HIFZ",
      guardianName: "QA Concurrent Guardian", guardianRelation: "Father", guardianPhone: "+923009992237",
    },
  });
  expect(studentRes.ok()).toBeTruthy();
  const { data: studentData } = await studentRes.json();

  const results = await Promise.all(
    Array.from({ length: 6 }, () =>
      page.request.post("/api/admin/fees/payments", {
        data: { studentId: studentData.student.id, amount: 1000, paidAmount: 1000, month: 2, year: 2027, paymentMethod: "CASH" },
      })
    )
  );
  const bodies = await Promise.all(results.map(r => r.json()));
  expect(bodies.every(b => b.success)).toBe(true);
  const receiptNumbers = bodies.map(b => b.data.receiptNumber);
  expect(new Set(receiptNumbers).size).toBe(receiptNumbers.length);
});

test("a non-admin role cannot read campus fee data", async ({ page }) => {
  const ts = Date.now();
  const ustadhRes = await page.request.post("/api/admin/asatidha", {
    data: {
      name: `QA Fee Ustadh ${ts}`,
      email: `qa.fee.ustadh.${ts}@alnoor.edu.pk`,
      password: "UstadhPass789",
      phone: `+92${String(ts).slice(-10)}`,
    },
  });
  expect(ustadhRes.ok()).toBeTruthy();

  const ustadhContext = await page.context().browser()!.newContext();
  const signinRes = await ustadhContext.request.post("/api/auth/signin", {
    data: { email: `qa.fee.ustadh.${ts}@alnoor.edu.pk`, password: "UstadhPass789" },
  });
  expect(signinRes.ok()).toBeTruthy();

  for (const path of ["/api/admin/fees/structures", "/api/admin/fees/payments", "/api/admin/fees/outstanding", "/api/admin/fees/scholarships"]) {
    const res = await ustadhContext.request.get(path);
    expect(res.status()).toBe(401);
  }

  await ustadhContext.close();
});

test("record a fee payment for a student", async ({ page }) => {
  await page.goto("/dashboard/admin/fees/payments/new", { waitUntil: "domcontentloaded" });

  // Pick the first real student in the dropdown (index 0 is the placeholder).
  // The list loads async, so wait for it to populate before reading options.
  const studentSelect = page.locator("select").first();
  await expect(studentSelect.locator("option")).not.toHaveCount(1, { timeout: 10_000 });
  await studentSelect.selectOption({ index: 1 });

  await page.locator('input[type="number"]').first().fill("5000"); // Fee Amount
  const paidInput = page.locator('input[type="number"]').nth(2); // Amount Paid
  await paidInput.fill("5000");

  await expect(page.getByText("✅ PAID")).toBeVisible();

  await page.getByRole("button", { name: /Record Payment/i }).click();

  await expect(page.getByText("PAYMENT RECORDED")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("PKR 5,000")).toBeVisible();
  await expect(page.getByRole("link", { name: /View & Print Receipt/i })).toBeVisible();
});
