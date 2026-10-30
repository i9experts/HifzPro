// app/api/marketplace/inquiries/[id]/bookings/[bookingId]/pay/route.ts
// The parent pays for an ACCEPTED booking — a hosted Stripe Checkout
// Session whose PaymentIntent is a destination charge: HifzPro's platform
// fee (lib/stripe-connect.ts: PLATFORM_FEE_PERCENT) is withheld via
// application_fee_amount, the rest transfers to the teacher's connected
// account. The booking isn't marked paid here — that happens when the
// webhook (app/api/marketplace/webhook/route.ts) sees checkout.session.completed.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { createBookingCheckoutSession } from "@/lib/stripe-connect";

const schema = z.object({
  sessions: z.number().int().min(1).max(52).default(4),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id, bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        teacher: { select: { stripeConnectAccountId: true, stripeOnboardingComplete: true, user: { select: { name: true } } } },
        parent:  { select: { userId: true } },
      },
    });
    if (!booking || booking.inquiryId !== id) return notFoundResponse("Booking not found");
    if (booking.parent.userId !== payload.userId) return unauthorizedResponse("Only the parent who requested this booking can pay for it");
    if (booking.status !== "ACCEPTED") return errorResponse("Only an accepted booking can be paid for");
    if (!booking.hourlyRate) return errorResponse("This booking has no agreed rate yet — ask the teacher to propose one");
    if (!booking.teacher.stripeConnectAccountId || !booking.teacher.stripeOnboardingComplete) {
      return errorResponse("This teacher hasn't finished payout setup yet — you'll be notified once they're ready to accept payment");
    }

    const body = await req.json().catch(() => ({}));
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const { sessions } = result.data;

    const totalAmount = Math.round(booking.hourlyRate * sessions * 100) / 100;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com";

    const { session } = await createBookingCheckoutSession({
      bookingId: booking.id,
      teacherAccountId: booking.teacher.stripeConnectAccountId,
      currency: booking.currency,
      totalAmount,
      sessions,
      teacherName: booking.teacher.user.name,
      successUrl: `${baseUrl}/dashboard/family/inquiries/${id}?payment=success`,
      cancelUrl:  `${baseUrl}/dashboard/family/inquiries/${id}?payment=cancelled`,
    });

    return successResponse({ url: session.url });
  } catch (error: any) {
    console.error("Booking payment checkout error:", error?.message, error);
    return serverErrorResponse();
  }
}
