// app/api/public/marketplace/teachers/[id]/route.ts
// Public profile view (PRD §6) — no auth required.
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacher = await prisma.teacherProfile.findFirst({
      where: { id, isListed: true, isActive: true },
      select: {
        id: true, gender: true, residenceCountry: true, bio: true, qualification: true, qiraat: true,
        yearsExperience: true, languages: true, countriesServed: true, ageGroupsTaught: true,
        programsOffered: true, hourlyRate: true, currency: true, verificationTier: true,
        avgRating: true, totalReviews: true, avgResponseMinutes: true, responseSampleCount: true,
        user: { select: { name: true, avatar: true } },
        availabilitySlots: { where: { isActive: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true, rating: true, comment: true, createdAt: true,
            parent: { select: { user: { select: { name: true } } } },
          },
        },
      },
    });
    if (!teacher) return notFoundResponse("Teacher not found or not listed");

    // Completion rate: of the bookings that got as far as both sides
    // agreeing (ACCEPTED or later), what share actually went through
    // (PAYMENT_CONFIRMED/REFUNDED) rather than falling through after
    // acceptance (CANCELLED). PROPOSED/DECLINED never reached an
    // agreement, so they don't count against or for the teacher here.
    const statusCounts = await prisma.booking.groupBy({
      by: ["status"],
      where: { teacherId: id, status: { in: ["ACCEPTED", "PAYMENT_CONFIRMED", "REFUNDED", "CANCELLED"] } },
      _count: true,
    });
    const counts = Object.fromEntries(statusCounts.map(s => [s.status, s._count]));
    const agreedTotal = (counts.ACCEPTED ?? 0) + (counts.PAYMENT_CONFIRMED ?? 0) + (counts.REFUNDED ?? 0) + (counts.CANCELLED ?? 0);
    const completed = (counts.PAYMENT_CONFIRMED ?? 0) + (counts.REFUNDED ?? 0);
    const completionRate = agreedTotal > 0 ? completed / agreedTotal : null;

    return successResponse({ teacher: { ...teacher, completionRate, completionSampleSize: agreedTotal } });
  } catch (error) {
    console.error("Marketplace teacher profile error:", error);
    return serverErrorResponse();
  }
}
