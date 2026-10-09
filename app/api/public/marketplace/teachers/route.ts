// app/api/public/marketplace/teachers/route.ts
// Public search/filter directory (PRD §6) — no auth required. Only
// profiles the teacher has explicitly listed (isListed: true) and that
// are still active show up here.
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const program  = sp.get("program");
    const gender   = sp.get("gender");
    const language = sp.get("language");
    const country  = sp.get("country");
    const ageGroup = sp.get("ageGroup");
    const maxRate  = sp.get("maxRate");

    const where: any = { isListed: true, isActive: true };
    if (program)  where.programsOffered = { has: program };
    if (gender)   where.gender = gender;
    if (language) where.languages = { has: language };
    if (country)  where.countriesServed = { has: country };
    if (ageGroup) where.ageGroupsTaught = { has: ageGroup };
    if (maxRate)  where.hourlyRate = { lte: Number(maxRate) };

    const teachers = await prisma.teacherProfile.findMany({
      where,
      select: {
        id: true, gender: true, residenceCountry: true, bio: true, qiraat: true,
        yearsExperience: true, languages: true, countriesServed: true, ageGroupsTaught: true,
        programsOffered: true, hourlyRate: true, currency: true, verificationTier: true,
        avgRating: true, totalReviews: true,
        user: { select: { name: true, avatar: true } },
      },
      orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
      take: 60,
    });

    return successResponse({ teachers });
  } catch (error) {
    console.error("Marketplace teacher search error:", error);
    return serverErrorResponse();
  }
}
