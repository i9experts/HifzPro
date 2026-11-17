// app/api/marketplace/inquiries/[id]/bookings/[bookingId]/review/route.ts
// A parent rates the teacher once a booking's payment is confirmed. A
// booking is a recurring weekly arrangement rather than a single dated
// lesson, so "eligible to review" means PAYMENT_CONFIRMED rather than
// waiting for a specific lesson date to pass. One review per booking
// (unique on bookingId) — TeacherProfile.avgRating/totalReviews are
// recomputed from the real TeacherReview rows on every write.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const reviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

async function recomputeTeacherRating(teacherId: string) {
  const agg = await prisma.teacherReview.aggregate({
    where: { teacherId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: { avgRating: agg._avg.rating, totalReviews: agg._count },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_PARENT") return unauthorizedResponse();

    const { id, bookingId } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { parent: { select: { userId: true } }, review: true },
    });
    if (!booking || booking.inquiryId !== id) return notFoundResponse("Booking not found");
    if (booking.parent.userId !== payload.userId) return unauthorizedResponse("Only the parent on this booking can review it");
    if (booking.status !== "PAYMENT_CONFIRMED") return errorResponse("You can review a teacher once payment for this booking is confirmed");
    if (booking.review) return errorResponse("You've already reviewed this booking");

    const body = await req.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const review = await prisma.teacherReview.create({
      data: {
        bookingId,
        teacherId: booking.teacherId,
        parentId:  booking.parentId,
        rating:    result.data.rating,
        comment:   result.data.comment,
      },
    });

    await recomputeTeacherRating(booking.teacherId);

    return successResponse({ review }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return serverErrorResponse();
  }
}
