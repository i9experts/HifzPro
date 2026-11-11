// lib/marketplace-provisioning.ts
// Turns a PAYMENT_CONFIRMED marketplace Booking into an actual tracked
// Student in the Hifz Diary system — lessons, attendance, Manzil Health —
// instead of a booking being just a scheduling/payment record with no
// connection to the rest of the app. All marketplace-originated students
// live under one shared, platform-owned "HifzPro Marketplace" campus;
// each teacher gets one Batch per program there (reusing the existing
// Ustadh/Batch structure, via a lightweight shim Ustadh row since
// Batch.ustadhId points at Ustadh, not TeacherProfile).
//
// Idempotent: Booking.provisionedStudentId is set once this succeeds, and
// every entry point checks it first — safe to call again on a redelivered
// webhook or a retried admin action.
import prisma from "@/lib/prisma";
import type { Program } from "@prisma/client";
import { generateEnrollmentNumber, withEnrollmentNumberRetry } from "@/lib/enrollment-number";

const MARKETPLACE_INSTITUTION_SLUG = "hifzpro-marketplace";

async function getOrCreateMarketplaceCampus() {
  let institution = await prisma.institution.findUnique({ where: { slug: MARKETPLACE_INSTITUTION_SLUG } });
  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: "HifzPro Marketplace",
        slug: MARKETPLACE_INSTITUTION_SLUG,
        isActive: true,
        isOnboarded: true,
      },
    });
  }

  let campus = await prisma.campus.findFirst({ where: { institutionId: institution.id } });
  if (!campus) {
    campus = await prisma.campus.create({
      data: { institutionId: institution.id, name: "HifzPro Marketplace", isActive: true },
    });
  }
  return campus;
}

// Batch.ustadhId references the school-side Ustadh model, not
// TeacherProfile — a marketplace teacher needs a minimal Ustadh row
// purely so their marketplace Batch has somewhere valid to point.
async function getOrCreateShimUstadh(teacherUserId: string) {
  return prisma.ustadh.upsert({
    where: { userId: teacherUserId },
    update: {},
    create: { userId: teacherUserId },
  });
}

async function getOrCreateTeacherBatch(campusId: string, ustadhId: string, teacherName: string, program: Program) {
  let batch = await prisma.batch.findFirst({ where: { campusId, ustadhId, program } });
  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        campusId,
        ustadhId,
        program,
        name:     `${teacherName} — Marketplace`,
        isActive: true,
      },
    });
  }
  return batch;
}

/**
 * Provisions (or returns the already-provisioned) Student for a paid
 * marketplace booking. Returns the Student id, or null if the booking
 * isn't paid yet or is missing the child's name (Booking.studentName —
 * collected before payment; see app/api/marketplace/.../pay/route.ts).
 */
export async function provisionBookingIntoHifzDiary(bookingId: string): Promise<string | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      teacher: { select: { id: true, userId: true, programsOffered: true, user: { select: { name: true } } } },
      parent:  { select: { userId: true, user: { select: { name: true, phone: true, whatsapp: true, email: true } } } },
    },
  });
  if (!booking) return null;
  if (booking.provisionedStudentId) return booking.provisionedStudentId;
  if (booking.status !== "PAYMENT_CONFIRMED") return null;

  const studentName = booking.studentName?.trim();
  if (!studentName) {
    console.error(`[marketplace-provisioning] Booking ${bookingId} is paid but has no studentName — skipping auto-provisioning until it's set.`);
    return null;
  }

  const program = booking.program ?? booking.teacher.programsOffered[0] ?? "HIFZ";
  const campus  = await getOrCreateMarketplaceCampus();
  const ustadh  = await getOrCreateShimUstadh(booking.teacher.userId);
  const batch   = await getOrCreateTeacherBatch(campus.id, ustadh.id, booking.teacher.user.name, program);

  return withEnrollmentNumberRetry(() => prisma.$transaction(async (tx) => {
    // Re-check inside the transaction — a redelivered webhook or a retried
    // admin action could reach here after another call already finished.
    const current = await tx.booking.findUnique({ where: { id: bookingId }, select: { provisionedStudentId: true } });
    if (current?.provisionedStudentId) return current.provisionedStudentId;

    const enrollmentNumber = await generateEnrollmentNumber(tx);

    const student = await tx.student.create({
      data: {
        campusId: campus.id,
        batchId:  batch.id,
        enrollmentNumber,
        name:     studentName,
        program,
        status:   "ACTIVE",
      },
    });

    const guardian = await tx.guardian.create({
      data: {
        studentId:      student.id,
        name:           booking.parent.user.name,
        relation:       "Parent",
        phone:          booking.parent.user.phone || "",
        whatsapp:       booking.parent.user.whatsapp || booking.parent.user.phone || null,
        email:          booking.parent.user.email || null,
        isEmergency:    true,
        receiveUpdates: true,
      },
    });

    // Link into the marketplace parent's existing login — one Parent row
    // per User, covering however many children they've since booked and
    // paid for (prisma/schema.prisma: Parent/Guardian are one-to-many).
    let parentRow = await tx.parent.findUnique({ where: { userId: booking.parent.userId } });
    if (!parentRow) parentRow = await tx.parent.create({ data: { userId: booking.parent.userId } });
    await tx.guardian.update({ where: { id: guardian.id }, data: { parentId: parentRow.id } });

    await tx.studentProgress.create({
      data: { studentId: student.id, currentJuz: 1, totalJuzMemorized: 0, percentComplete: 0 },
    });
    await tx.manzilHealth.create({ data: { studentId: student.id, score: 100 } });

    await tx.booking.update({ where: { id: bookingId }, data: { provisionedStudentId: student.id } });

    return student.id;
  }));
}
