// app/api/marketplace/teacher/availability/route.ts
// Weekly recurring availability slots a teacher offers (PRD §5/§6).
// Phase 1 keeps this a simple recurring-slot list, not a real booking
// calendar — Phase 2 adds the booking/offer state machine (§7).
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format"),
  endTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format"),
  timezone:  z.string().min(2),
});

async function requireTeacherProfile(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return { error: unauthorizedResponse() };
  const payload = verifyToken(token);
  if (!payload || payload.role !== "MARKETPLACE_TEACHER") return { error: unauthorizedResponse() };
  const profile = await prisma.teacherProfile.findUnique({ where: { userId: payload.userId } });
  if (!profile) return { error: notFoundResponse("Teacher profile not found") };
  return { profile };
}

export async function GET(req: NextRequest) {
  try {
    const { profile, error } = await requireTeacherProfile(req);
    if (error) return error;

    const slots = await prisma.teacherAvailabilitySlot.findMany({
      where: { teacherId: profile!.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return successResponse({ slots });
  } catch (error) {
    console.error("Availability GET error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile, error } = await requireTeacherProfile(req);
    if (error) return error;

    const body = await req.json();
    const result = slotSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;
    if (data.startTime >= data.endTime) return errorResponse("End time must be after start time");

    const slot = await prisma.teacherAvailabilitySlot.create({
      data: { ...data, teacherId: profile!.id },
    });
    return successResponse({ slot }, 201);
  } catch (error) {
    console.error("Availability POST error:", error);
    return serverErrorResponse();
  }
}
