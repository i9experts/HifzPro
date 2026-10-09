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
        avgRating: true, totalReviews: true,
        user: { select: { name: true, avatar: true } },
        availabilitySlots: { where: { isActive: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      },
    });
    if (!teacher) return notFoundResponse("Teacher not found or not listed");
    return successResponse({ teacher });
  } catch (error) {
    console.error("Marketplace teacher profile error:", error);
    return serverErrorResponse();
  }
}
