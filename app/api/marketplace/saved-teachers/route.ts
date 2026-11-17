// app/api/marketplace/saved-teachers/route.ts
// A parent's shortlist of teachers (PRD Tier 2 — favoriting). GET returns
// the full saved list for the "Saved teachers" page; POST/DELETE toggle a
// single teacher and are used from the directory/profile heart button.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

async function loadParent(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return { error: unauthorizedResponse() };
  const payload = verifyToken(token);
  if (!payload || payload.role !== "MARKETPLACE_PARENT") return { error: unauthorizedResponse() };
  const profile = await prisma.marketplaceParentProfile.findUnique({ where: { userId: payload.userId } });
  if (!profile) return { error: notFoundResponse("Parent profile not found") };
  return { profile };
}

export async function GET(req: NextRequest) {
  try {
    const { profile, error } = await loadParent(req);
    if (error) return error;

    const saved = await prisma.savedTeacher.findMany({
      where: { parentId: profile!.id },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: {
            id: true, gender: true, residenceCountry: true, bio: true, qiraat: true,
            yearsExperience: true, languages: true, countriesServed: true, ageGroupsTaught: true,
            programsOffered: true, hourlyRate: true, currency: true, verificationTier: true,
            avgRating: true, totalReviews: true, isListed: true, isActive: true,
            user: { select: { name: true, avatar: true } },
          },
        },
      },
    });

    return successResponse({ teacherIds: saved.map(s => s.teacherId), teachers: saved.map(s => s.teacher) });
  } catch (error) {
    console.error("List saved teachers error:", error);
    return serverErrorResponse();
  }
}

const bodySchema = z.object({ teacherId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { profile, error } = await loadParent(req);
    if (error) return error;

    const body = await req.json();
    const result = bodySchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const teacher = await prisma.teacherProfile.findUnique({ where: { id: result.data.teacherId } });
    if (!teacher) return notFoundResponse("Teacher not found");

    await prisma.savedTeacher.upsert({
      where: { parentId_teacherId: { parentId: profile!.id, teacherId: teacher.id } },
      update: {},
      create: { parentId: profile!.id, teacherId: teacher.id },
    });

    return successResponse({ saved: true }, 201);
  } catch (error) {
    console.error("Save teacher error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { profile, error } = await loadParent(req);
    if (error) return error;

    const teacherId = req.nextUrl.searchParams.get("teacherId");
    if (!teacherId) return errorResponse("teacherId is required");

    await prisma.savedTeacher.deleteMany({ where: { parentId: profile!.id, teacherId } });

    return successResponse({ saved: false });
  } catch (error) {
    console.error("Unsave teacher error:", error);
    return serverErrorResponse();
  }
}
