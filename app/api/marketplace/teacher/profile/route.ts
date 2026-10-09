// app/api/marketplace/teacher/profile/route.ts
// Teacher-side read/write for their own marketplace profile (PRD §5).
// A profile can only be self-listed (isListed: true) once the minimum
// fields a parent needs to evaluate a teacher are actually filled in —
// an empty listing in the public directory would be worse than none.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const PROGRAMS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"] as const;

const updateSchema = z.object({
  gender:           z.enum(["MALE", "FEMALE"]).optional(),
  residenceCountry: z.string().min(2).optional(),
  bio:              z.string().max(2000).optional(),
  qualification:    z.string().max(300).optional(),
  qiraat:           z.string().max(200).optional(),
  yearsExperience:  z.number().int().min(0).max(80).optional(),
  languages:        z.array(z.string()).optional(),
  countriesServed:  z.array(z.string()).optional(),
  ageGroupsTaught:  z.array(z.string()).optional(),
  programsOffered:  z.array(z.enum(PROGRAMS)).optional(),
  hourlyRate:       z.number().min(0).optional(),
  currency:         z.string().min(3).max(3).optional(),
  isListed:         z.boolean().optional(),
});

function minimumFieldsMissing(profile: {
  bio: string | null; qiraat: string | null; hourlyRate: number | null;
  languages: string[]; countriesServed: string[]; ageGroupsTaught: string[]; programsOffered: string[];
}): string[] {
  const missing: string[] = [];
  if (!profile.bio || profile.bio.trim().length < 20) missing.push("a bio (at least 20 characters)");
  if (!profile.qiraat) missing.push("qiraat specialization");
  if (profile.hourlyRate == null) missing.push("hourly rate");
  if (profile.languages.length === 0) missing.push("at least one language");
  if (profile.countriesServed.length === 0) missing.push("at least one country you'll teach students in");
  if (profile.ageGroupsTaught.length === 0) missing.push("at least one age group");
  if (profile.programsOffered.length === 0) missing.push("at least one program you teach");
  return missing;
}

async function loadSelf(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return { error: unauthorizedResponse() };
  const payload = verifyToken(token);
  if (!payload || payload.role !== "MARKETPLACE_TEACHER") return { error: unauthorizedResponse() };
  return { payload };
}

export async function GET(req: NextRequest) {
  try {
    const { payload, error } = await loadSelf(req);
    if (error) return error;

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: payload!.userId },
      include: { availabilitySlots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    });
    if (!profile) return notFoundResponse("Teacher profile not found");

    return successResponse({ profile, missingForListing: minimumFieldsMissing(profile) });
  } catch (error) {
    console.error("Teacher profile GET error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { payload, error } = await loadSelf(req);
    if (error) return error;

    const body = await req.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    const existing = await prisma.teacherProfile.findUnique({ where: { userId: payload!.userId } });
    if (!existing) return notFoundResponse("Teacher profile not found");

    const merged = { ...existing, ...data };
    if (data.isListed) {
      const missing = minimumFieldsMissing(merged as any);
      if (missing.length > 0) {
        return errorResponse(`Finish your profile before listing yourself publicly: add ${missing.join(", ")}.`);
      }
    }

    const profile = await prisma.teacherProfile.update({
      where: { userId: payload!.userId },
      data,
    });

    return successResponse({ profile });
  } catch (error) {
    console.error("Teacher profile PUT error:", error);
    return serverErrorResponse();
  }
}
