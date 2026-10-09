import { test, expect } from "@playwright/test";

// Phase 1 of the Quran teacher marketplace (PRD §5–§7): an independent
// teacher signs up and builds a public profile, a parent signs up and
// finds them in the search directory, sends an inquiry, and the teacher
// replies — all without any admin-in-the-middle step.

test("teacher signs up, lists a profile; parent finds them and messages back and forth", async ({ browser }) => {
  // Three actors, many first-visit dev-server route compiles, and a full
  // propose → accept → admin-confirm loop comfortably exceed the default
  // per-test timeout.
  test.setTimeout(120_000);
  const ts = Date.now();
  const teacherName = `QA Qari ${ts}`;
  const parentName = `QA Parent ${ts}`;

  const teacherContext = await browser.newContext();
  const teacherPage = await teacherContext.newPage();
  const parentContext = await browser.newContext();
  const parentPage = await parentContext.newPage();

  // ── 1. Teacher signs up via the public form ──
  await teacherPage.goto("/marketplace/join/teacher", { waitUntil: "domcontentloaded" });
  await teacherPage.locator('input[type="text"]').first().fill(teacherName);
  await teacherPage.locator('input[type="email"]').fill(`qa.teacher.${ts}@example.com`);
  await teacherPage.getByPlaceholder("+92...").fill(`+9230099${String(ts).slice(-5)}`);
  await teacherPage.locator('input[type="password"]').fill("TeacherPass123");
  await teacherPage.locator('input[placeholder="Pakistan"]').fill("Pakistan");
  await teacherPage.getByRole("button", { name: /create teacher account/i }).click();
  await teacherPage.waitForURL("**/dashboard/teacher/profile**", { timeout: 15_000 });

  // ── 2. Complete the profile via the authenticated API (fast path for
  //    the many fields), then verify + flip the public listing switch
  //    through the actual UI, which is the behavior under test ──
  const profileRes = await teacherPage.request.put("/api/marketplace/teacher/profile", {
    data: {
      bio: "Experienced Qari teaching Hifz and Tajweed online for over a decade.",
      qiraat: "Hafs 'an 'Asim",
      yearsExperience: 10,
      languages: ["English", "Urdu"],
      countriesServed: ["US", "UK"],
      ageGroupsTaught: ["9-12", "13-17"],
      programsOffered: ["HIFZ", "TAJWEED"],
      hourlyRate: 15,
      currency: "USD",
    },
  });
  expect(profileRes.ok()).toBeTruthy();

  await teacherPage.reload({ waitUntil: "domcontentloaded" });
  await teacherPage.getByRole("button", { name: /list me publicly/i }).click();
  await expect(teacherPage.getByText(/you're listed publicly/i)).toBeVisible({ timeout: 10_000 });

  // ── 3. Parent signs up, finds the teacher in the public directory ──
  await parentPage.goto("/marketplace/join/parent", { waitUntil: "domcontentloaded" });
  await parentPage.locator('input[type="text"]').first().fill(parentName);
  await parentPage.locator('input[type="email"]').fill(`qa.parent.${ts}@example.com`);
  await parentPage.getByPlaceholder("+1...").fill(`+1415555${String(ts).slice(-4)}`);
  await parentPage.locator('input[type="password"]').fill("ParentPass123");
  await parentPage.locator('input[placeholder="United States"]').fill("United States");
  await parentPage.getByRole("button", { name: /create account/i }).click();
  await parentPage.waitForURL(u => u.pathname === "/marketplace", { timeout: 15_000 });

  await parentPage.goto("/marketplace", { waitUntil: "domcontentloaded" });
  await expect(parentPage.getByText(teacherName)).toBeVisible({ timeout: 10_000 });
  await parentPage.getByText(teacherName).click();
  await parentPage.waitForURL("**/marketplace/teachers/**", { timeout: 10_000 });

  // ── 4. Parent sends an inquiry ──
  const inquiryText = "Hi! Looking for Hifz lessons for my 10-year-old twice a week. Are you available?";
  await parentPage.locator("textarea").fill(inquiryText);
  await parentPage.getByRole("button", { name: /send message/i }).click();
  await expect(parentPage.getByText(/your message has been sent/i)).toBeVisible({ timeout: 10_000 });

  // ── 5. Teacher sees it in their inbox and replies ──
  await teacherPage.goto("/dashboard/teacher/inquiries", { waitUntil: "domcontentloaded" });
  await expect(teacherPage.getByText(parentName)).toBeVisible({ timeout: 10_000 });
  await teacherPage.getByText(parentName).click();
  await teacherPage.waitForURL("**/dashboard/teacher/inquiries/**", { timeout: 10_000 });
  await expect(teacherPage.getByText(inquiryText)).toBeVisible();

  const replyText = "Yes, I have Tuesday and Thursday evening slots open — let's start with a trial lesson.";
  await teacherPage.locator('input[placeholder="Type a reply…"]').fill(replyText);
  await teacherPage.getByRole("button", { name: "Send" }).click();
  await expect(teacherPage.getByText(replyText)).toBeVisible({ timeout: 10_000 });

  // ── 6. Parent sees the teacher's reply ──
  await parentPage.goto("/dashboard/family/inquiries", { waitUntil: "domcontentloaded" });
  await expect(parentPage.getByText(teacherName)).toBeVisible({ timeout: 10_000 });
  await parentPage.getByText(teacherName).click();
  await parentPage.waitForURL("**/dashboard/family/inquiries/**", { timeout: 10_000 });
  await expect(parentPage.getByText(replyText)).toBeVisible({ timeout: 10_000 });

  // ── 7. Parent proposes a lesson time from the same thread ──
  await parentPage.getByRole("button", { name: /propose a lesson time/i }).click();
  await parentPage.locator('input[type="number"]').fill("15");
  await parentPage.getByRole("button", { name: /send proposal/i }).click();
  await expect(parentPage.getByText(/waiting for the other side to respond/i)).toBeVisible({ timeout: 10_000 });

  // ── 8. Teacher accepts the proposal ──
  await teacherPage.reload({ waitUntil: "domcontentloaded" });
  await teacherPage.getByRole("button", { name: "Accept" }).click();
  await expect(teacherPage.getByText(/both sides agreed/i)).toBeVisible({ timeout: 10_000 });

  // ── 9. Admin marks the booking's payment as received ──
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.request.get("/api/setup/superadmin"); // idempotent — creates the fixed platform admin if it doesn't exist yet
  await adminPage.goto("/signin", { waitUntil: "domcontentloaded" });
  await adminPage.locator('input[type="email"]').fill("superadmin@hifzpro.com");
  await adminPage.locator('input[type="password"]').fill("HifzPro@SuperAdmin2026");
  await adminPage.getByRole("button", { name: /sign in as admin/i }).click();
  await adminPage.waitForURL("**/superadmin**", { timeout: 15_000 });

  await adminPage.goto("/superadmin/marketplace", { waitUntil: "domcontentloaded" });
  await adminPage.getByRole("button", { name: /^bookings/i }).click();
  const bookingRow = adminPage.locator("div", { hasText: teacherName }).filter({ hasText: parentName }).last();
  adminPage.once("dialog", d => d.accept());
  await bookingRow.getByRole("button", { name: /mark paid/i }).click();
  await expect(bookingRow.getByText("PAYMENT CONFIRMED", { exact: true })).toBeVisible({ timeout: 10_000 });

  // ── 10. Both sides see the arrangement is now active ──
  await teacherPage.reload({ waitUntil: "domcontentloaded" });
  await expect(teacherPage.getByText(/payment confirmed — this arrangement is active/i)).toBeVisible({ timeout: 10_000 });
  await parentPage.reload({ waitUntil: "domcontentloaded" });
  await expect(parentPage.getByText(/payment confirmed — this arrangement is active/i)).toBeVisible({ timeout: 10_000 });

  await teacherContext.close();
  await parentContext.close();
  await adminContext.close();
});
