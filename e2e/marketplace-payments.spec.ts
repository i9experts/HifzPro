import { test, expect } from "@playwright/test";

// Payment processing (Stripe Connect) for marketplace bookings. The real
// Stripe network calls (Connect onboarding, Checkout Session creation) need
// a live Stripe test-mode key and aren't exercised here — this suite covers
// everything on this side of that boundary: the guards that block paying
// before a teacher is onboarded, the manual CONFIRM_PAYMENT/REFUND fallback
// that doesn't touch Stripe at all, and the 24h full-refund-window rule.

async function signUpTeacher(request: import("@playwright/test").APIRequestContext, ts: number) {
  const res = await request.post("/api/marketplace/signup/teacher", {
    data: {
      name: `QA Pay Teacher ${ts}`,
      email: `qa.pay.teacher.${ts}@example.com`,
      phone: `+9230088${String(ts).slice(-5)}`,
      password: "TeacherPass123",
      gender: "MALE",
      residenceCountry: "Pakistan",
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

async function signUpParent(request: import("@playwright/test").APIRequestContext, ts: number) {
  const res = await request.post("/api/marketplace/signup/parent", {
    data: {
      name: `QA Pay Parent ${ts}`,
      email: `qa.pay.parent.${ts}@example.com`,
      phone: `+1415666${String(ts).slice(-4)}`,
      password: "ParentPass123",
      country: "United States",
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

function soonBookingSlot() {
  const now = new Date();
  const soon = new Date(now.getTime() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dayOfWeek: now.getDay(),
    startTime: `${pad(soon.getHours())}:${pad(soon.getMinutes())}`,
    endTime: `${pad((soon.getHours() + 1) % 24)}:${pad(soon.getMinutes())}`,
  };
}

test("teacher Stripe status starts disconnected before onboarding", async ({ page }) => {
  const ts = Date.now();
  await signUpTeacher(page.request, ts);

  const statusRes = await page.request.get("/api/marketplace/teacher/stripe/status");
  expect(statusRes.ok()).toBeTruthy();
  const { data } = await statusRes.json();
  expect(data.connected).toBe(false);
  expect(data.onboardingComplete).toBe(false);
});

test("a booking can't be paid for until the teacher completes payout setup", async ({ browser }) => {
  test.setTimeout(60_000);
  const ts = Date.now();
  const teacherContext = await browser.newContext();
  const parentContext = await browser.newContext();

  const teacherData = await signUpTeacher(teacherContext.request, ts);
  const parentData = await signUpParent(parentContext.request, ts);

  const profileRes = await teacherContext.request.put("/api/marketplace/teacher/profile", {
    data: {
      bio: "Experienced Qari teaching Hifz online.", qiraat: "Hafs 'an 'Asim", yearsExperience: 8,
      languages: ["English"], countriesServed: ["US"], ageGroupsTaught: ["9-12"],
      programsOffered: ["HIFZ"], hourlyRate: 12, currency: "USD", isListed: true,
    },
  });
  expect(profileRes.ok()).toBeTruthy();
  const teacherId = (await profileRes.json()).data.profile.id;

  const inquiryRes = await parentContext.request.post("/api/marketplace/inquiries", {
    data: { teacherId, message: "Looking for Hifz lessons for my child." },
  });
  expect(inquiryRes.ok()).toBeTruthy();
  const inquiryId = (await inquiryRes.json()).data.inquiry.id;

  const slot = soonBookingSlot();
  const bookingRes = await parentContext.request.post(`/api/marketplace/inquiries/${inquiryId}/bookings`, {
    data: { ...slot, timezone: "Asia/Karachi", program: "HIFZ", hourlyRate: 12, currency: "USD" },
  });
  expect(bookingRes.ok()).toBeTruthy();
  const bookingId = (await bookingRes.json()).data.booking.id;

  const acceptRes = await teacherContext.request.patch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}`, {
    data: { action: "ACCEPT" },
  });
  expect(acceptRes.ok()).toBeTruthy();

  const payRes = await parentContext.request.post(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}/pay`, {
    data: { sessions: 4 },
  });
  expect(payRes.ok()).toBeFalsy();
  const payBody = await payRes.json();
  expect(payBody.error).toMatch(/payout setup/i);

  await teacherContext.close();
  await parentContext.close();
});

test("manual payment-confirmation fallback and refund still work without Stripe", async ({ browser }) => {
  test.setTimeout(60_000);
  const ts = Date.now();
  const teacherContext = await browser.newContext();
  const parentContext = await browser.newContext();
  const adminContext = await browser.newContext();

  const teacherData = await signUpTeacher(teacherContext.request, ts);
  const parentData = await signUpParent(parentContext.request, ts);

  const profileRes = await teacherContext.request.put("/api/marketplace/teacher/profile", {
    data: {
      bio: "Experienced Mu'allimah teaching Nazrah online.", qiraat: "Hafs 'an 'Asim", yearsExperience: 5,
      languages: ["English"], countriesServed: ["US"], ageGroupsTaught: ["9-12"],
      programsOffered: ["NAZRA"], hourlyRate: 10, currency: "USD", isListed: true,
    },
  });
  expect(profileRes.ok()).toBeTruthy();
  const teacherId = (await profileRes.json()).data.profile.id;

  const inquiryRes = await parentContext.request.post("/api/marketplace/inquiries", {
    data: { teacherId, message: "Looking for Nazrah lessons." },
  });
  expect(inquiryRes.ok()).toBeTruthy();
  const inquiryId = (await inquiryRes.json()).data.inquiry.id;

  const slot = soonBookingSlot();
  const bookingRes = await parentContext.request.post(`/api/marketplace/inquiries/${inquiryId}/bookings`, {
    data: { ...slot, timezone: "Asia/Karachi", program: "NAZRA", hourlyRate: 10, currency: "USD" },
  });
  expect(bookingRes.ok()).toBeTruthy();
  const bookingId = (await bookingRes.json()).data.booking.id;

  const acceptRes = await teacherContext.request.patch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}`, {
    data: { action: "ACCEPT" },
  });
  expect(acceptRes.ok()).toBeTruthy();

  // ── Admin sign-in ──
  await adminContext.request.get("/api/setup/superadmin"); // idempotent — creates the fixed platform admin if needed
  const signinRes = await adminContext.request.post("/api/auth/signin", {
    data: { email: "superadmin@hifzpro.com", password: "HifzPro@SuperAdmin2026" },
  });
  expect(signinRes.ok()).toBeTruthy();

  // Refusing to refund an unpaid booking
  const earlyRefund = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${bookingId}`, {
    data: { action: "REFUND" },
  });
  expect(earlyRefund.ok()).toBeFalsy();

  // Manual fallback: mark paid without ever touching Stripe
  const confirmRes = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${bookingId}`, {
    data: { action: "CONFIRM_PAYMENT", adminNotes: "Collected via bank transfer" },
  });
  expect(confirmRes.ok()).toBeTruthy();
  expect((await confirmRes.json()).data.booking.status).toBe("PAYMENT_CONFIRMED");

  // The booking's session is only 5 minutes away — refunding without an
  // explicit override should be rejected (past the 24h full-refund window).
  const blockedRefund = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${bookingId}`, {
    data: { action: "REFUND" },
  });
  expect(blockedRefund.status()).toBe(409);

  // With force:true, the admin can still refund — and since there's no
  // stripePaymentIntentId (this was a manual confirmation), it resolves
  // immediately to REFUNDED without any Stripe call.
  const forcedRefund = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${bookingId}`, {
    data: { action: "REFUND", force: true },
  });
  expect(forcedRefund.ok()).toBeTruthy();
  expect((await forcedRefund.json()).data.booking.status).toBe("REFUNDED");

  await teacherContext.close();
  await parentContext.close();
  await adminContext.close();
});
