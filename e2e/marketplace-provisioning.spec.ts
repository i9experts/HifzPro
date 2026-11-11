import { test, expect } from "@playwright/test";

// Auto-provisioning (lib/marketplace-provisioning.ts): once a booking is
// paid, it should turn into a real tracked Student in the Hifz Diary
// system (lessons/attendance/Manzil Health), not just a payment record.
// Tested via the admin CONFIRM_PAYMENT fallback (no live Stripe key in
// this environment) — the same provisioning call fires on that path as
// on the real Stripe webhook.

async function signUpTeacher(request: import("@playwright/test").APIRequestContext, ts: number) {
  const res = await request.post("/api/marketplace/signup/teacher", {
    data: {
      name: `QA Provision Teacher ${ts}`,
      email: `qa.provision.teacher.${ts}@example.com`,
      phone: `+9230099${String(ts).slice(-5)}`,
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
      name: `QA Provision Parent ${ts}`,
      email: `qa.provision.parent.${ts}@example.com`,
      phone: `+1415777${String(ts).slice(-4)}`,
      password: "ParentPass123",
      country: "United States",
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

async function proposeAndAccept(
  teacherContext: import("@playwright/test").BrowserContext,
  parentContext: import("@playwright/test").BrowserContext,
  teacherId: string,
  message: string,
  dayOfWeek: number,
) {
  const inquiryRes = await parentContext.request.post("/api/marketplace/inquiries", {
    data: { teacherId, message },
  });
  expect(inquiryRes.ok()).toBeTruthy();
  const inquiryId = (await inquiryRes.json()).data.inquiry.id;

  const bookingRes = await parentContext.request.post(`/api/marketplace/inquiries/${inquiryId}/bookings`, {
    data: { dayOfWeek, startTime: "16:00", endTime: "17:00", timezone: "Asia/Karachi", program: "HIFZ", hourlyRate: 12, currency: "USD" },
  });
  expect(bookingRes.ok()).toBeTruthy();
  const bookingId = (await bookingRes.json()).data.booking.id;

  const acceptRes = await teacherContext.request.patch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}`, {
    data: { action: "ACCEPT" },
  });
  expect(acceptRes.ok()).toBeTruthy();

  return { inquiryId, bookingId };
}

async function signInAdmin(context: import("@playwright/test").BrowserContext) {
  await context.request.get("/api/setup/superadmin"); // idempotent — creates the fixed platform admin if needed
  const res = await context.request.post("/api/auth/signin", {
    data: { email: "superadmin@hifzpro.com", password: "HifzPro@SuperAdmin2026" },
  });
  expect(res.ok()).toBeTruthy();
}

test("a confirmed booking without a student name is not auto-provisioned", async ({ browser }) => {
  test.setTimeout(60_000);
  const ts = Date.now();
  const teacherContext = await browser.newContext();
  const parentContext = await browser.newContext();
  const adminContext = await browser.newContext();

  const teacherData = await signUpTeacher(teacherContext.request, ts);
  await signUpParent(parentContext.request, ts);
  const profileRes = await teacherContext.request.put("/api/marketplace/teacher/profile", {
    data: {
      bio: "Experienced Qari teaching Hifz online.", qiraat: "Hafs 'an 'Asim", yearsExperience: 6,
      languages: ["English"], countriesServed: ["US"], ageGroupsTaught: ["9-12"],
      programsOffered: ["HIFZ"], hourlyRate: 12, currency: "USD", isListed: true,
    },
  });
  expect(profileRes.ok()).toBeTruthy();
  const teacherId = (await profileRes.json()).data.profile.id;

  const { bookingId } = await proposeAndAccept(teacherContext, parentContext, teacherId, "Hifz lessons please.", 1);

  await signInAdmin(adminContext);
  const confirmRes = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${bookingId}`, {
    data: { action: "CONFIRM_PAYMENT" }, // no studentName
  });
  expect(confirmRes.ok()).toBeTruthy();
  const { data } = await confirmRes.json();
  expect(data.booking.status).toBe("PAYMENT_CONFIRMED");
  expect(data.booking.provisionedStudentId).toBeFalsy();

  await teacherContext.close();
  await parentContext.close();
  await adminContext.close();
});

test("a paid booking is provisioned into a real tracked Student, and a second child shares the same parent login", async ({ browser }) => {
  test.setTimeout(60_000);
  const ts = Date.now();
  const teacherContext = await browser.newContext();
  const parentContext = await browser.newContext();
  const adminContext = await browser.newContext();

  const teacherData = await signUpTeacher(teacherContext.request, ts);
  const parentData = await signUpParent(parentContext.request, ts);
  const profileRes = await teacherContext.request.put("/api/marketplace/teacher/profile", {
    data: {
      bio: "Experienced Qari teaching Hifz online.", qiraat: "Hafs 'an 'Asim", yearsExperience: 6,
      languages: ["English"], countriesServed: ["US"], ageGroupsTaught: ["9-12"],
      programsOffered: ["HIFZ"], hourlyRate: 12, currency: "USD", isListed: true,
    },
  });
  expect(profileRes.ok()).toBeTruthy();
  const teacherId = (await profileRes.json()).data.profile.id;

  await signInAdmin(adminContext);

  // ── First child ──
  const first = await proposeAndAccept(teacherContext, parentContext, teacherId, "Hifz lessons for my first child.", 1);
  const confirm1 = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${first.bookingId}`, {
    data: { action: "CONFIRM_PAYMENT", studentName: `QA Child One ${ts}` },
  });
  expect(confirm1.ok()).toBeTruthy();
  const student1Id = (await confirm1.json()).data.booking.provisionedStudentId;
  expect(student1Id).toBeTruthy();

  // Verify via the parent's own view, not the admin students API — the
  // fixed test superadmin (app/api/setup/superadmin) belongs to a
  // different institution than the marketplace one, so tenant isolation
  // correctly hides it from that account; the parent is the real owner.
  const studentRes = await parentContext.request.get(`/api/parent/dashboard?studentId=${student1Id}`);
  expect(studentRes.ok()).toBeTruthy();
  const { data: studentData } = await studentRes.json();
  expect(studentData.student.name).toBe(`QA Child One ${ts}`);
  expect(studentData.student.program).toBe("HIFZ");
  expect(studentData.student.status).toBe("ACTIVE");
  expect(studentData.student.progress).toBeTruthy();
  expect(studentData.guardian.name).toBe(parentData.data.user.name);

  // ── Second child, same parent login ──
  const second = await proposeAndAccept(teacherContext, parentContext, teacherId, "Also lessons for my second child.", 2);
  const confirm2 = await adminContext.request.patch(`/api/superadmin/marketplace/bookings/${second.bookingId}`, {
    data: { action: "CONFIRM_PAYMENT", studentName: `QA Child Two ${ts}` },
  });
  expect(confirm2.ok()).toBeTruthy();
  const student2Id = (await confirm2.json()).data.booking.provisionedStudentId;
  expect(student2Id).toBeTruthy();
  expect(student2Id).not.toBe(student1Id);

  // The parent's dashboard (role MARKETPLACE_PARENT, widened to accept
  // this role — see app/api/parent/dashboard/route.ts) now shows both.
  const dashboardRes = await parentContext.request.get("/api/parent/dashboard");
  expect(dashboardRes.ok()).toBeTruthy();
  const { data: dashboardData } = await dashboardRes.json();
  const childNames = dashboardData.children.map((c: any) => c.name).sort();
  expect(childNames).toEqual([`QA Child One ${ts}`, `QA Child Two ${ts}`].sort());

  await teacherContext.close();
  await parentContext.close();
  await adminContext.close();
});
