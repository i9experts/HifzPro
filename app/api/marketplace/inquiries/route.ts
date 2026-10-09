// app/api/marketplace/inquiries/route.ts
// In-platform messaging between a marketplace parent and teacher (PRD §7).
// POST starts (or reuses) a thread with the parent's opening message;
// GET lists the signed-in user's threads, whichever side they're on.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const createSchema = z.object({
  teacherId: z.string().min(1),
  message:   z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_PARENT") return unauthorizedResponse();

    const body = await req.json();
    const result = createSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const { teacherId, message } = result.data;

    const [parentProfile, teacherProfile] = await Promise.all([
      prisma.marketplaceParentProfile.findUnique({ where: { userId: payload.userId } }),
      prisma.teacherProfile.findFirst({ where: { id: teacherId, isListed: true, isActive: true } }),
    ]);
    if (!parentProfile) return notFoundResponse("Parent profile not found");
    if (!teacherProfile) return notFoundResponse("Teacher not found or not listed");

    const inquiry = await prisma.teacherInquiry.upsert({
      where: { teacherId_parentId: { teacherId: teacherProfile.id, parentId: parentProfile.id } },
      update: {},
      create: { teacherId: teacherProfile.id, parentId: parentProfile.id },
    });

    const sentMessage = await prisma.teacherMessage.create({
      data: { inquiryId: inquiry.id, senderId: payload.userId, body: message },
    });

    return successResponse({ inquiry, message: sentMessage }, 201);
  } catch (error) {
    console.error("Create inquiry error:", error);
    return serverErrorResponse();
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    let inquiries;
    if (payload.role === "MARKETPLACE_TEACHER") {
      const profile = await prisma.teacherProfile.findUnique({ where: { userId: payload.userId } });
      if (!profile) return notFoundResponse("Teacher profile not found");
      inquiries = await prisma.teacherInquiry.findMany({
        where: { teacherId: profile.id },
        include: {
          parent: { select: { user: { select: { name: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else if (payload.role === "MARKETPLACE_PARENT") {
      const profile = await prisma.marketplaceParentProfile.findUnique({ where: { userId: payload.userId } });
      if (!profile) return notFoundResponse("Parent profile not found");
      inquiries = await prisma.teacherInquiry.findMany({
        where: { parentId: profile.id },
        include: {
          teacher: { select: { user: { select: { name: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      return unauthorizedResponse();
    }

    return successResponse({ inquiries });
  } catch (error) {
    console.error("List inquiries error:", error);
    return serverErrorResponse();
  }
}
