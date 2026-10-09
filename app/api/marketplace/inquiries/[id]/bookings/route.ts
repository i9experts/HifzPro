// app/api/marketplace/inquiries/[id]/bookings/route.ts
// Booking confirmation (PRD §7/§9 Phase 1): either side of an inquiry
// proposes a day/time + rate; the other side accepts or declines.
// Payment collection stays manual/admin-assisted (see /superadmin/marketplace) —
// Phase 2 replaces this with the real booking/offer state machine + Stripe Connect.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const PROGRAMS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"] as const;

const proposeSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format"),
  endTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format"),
  timezone:  z.string().min(2),
  program:   z.enum(PROGRAMS).optional(),
  hourlyRate: z.number().min(0).optional(),
  currency:   z.string().min(3).max(3).optional(),
  notes:      z.string().max(1000).optional(),
});

async function loadParticipant(id: string, userId: string) {
  const inquiry = await prisma.teacherInquiry.findUnique({
    where: { id },
    include: { teacher: { select: { userId: true } }, parent: { select: { userId: true } } },
  });
  if (!inquiry) return null;
  const isTeacher = inquiry.teacher.userId === userId;
  const isParent  = inquiry.parent.userId === userId;
  if (!isTeacher && !isParent) return null;
  return { inquiry, isTeacher };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;
    const found = await loadParticipant(id, payload.userId);
    if (!found) return notFoundResponse("Inquiry not found");

    const bookings = await prisma.booking.findMany({ where: { inquiryId: id }, orderBy: { createdAt: "desc" } });
    return successResponse({ bookings });
  } catch (error) {
    console.error("List bookings error:", error);
    return serverErrorResponse();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;
    const found = await loadParticipant(id, payload.userId);
    if (!found) return notFoundResponse("Inquiry not found");

    const body = await req.json();
    const result = proposeSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    if (result.data.startTime >= result.data.endTime) return errorResponse("End time must be after start time");

    const openBooking = await prisma.booking.findFirst({
      where: { inquiryId: id, status: "PROPOSED" },
    });
    if (openBooking) return errorResponse("There's already a pending proposal on this thread — respond to it before proposing a new one.");

    const booking = await prisma.booking.create({
      data: {
        ...result.data,
        inquiryId: id,
        teacherId: found.inquiry.teacherId,
        parentId:  found.inquiry.parentId,
        proposedById: payload.userId,
      },
    });

    return successResponse({ booking }, 201);
  } catch (error) {
    console.error("Propose booking error:", error);
    return serverErrorResponse();
  }
}
