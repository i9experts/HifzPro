// app/api/billing/status/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !payload.institutionId) return unauthorizedResponse();

    const sub = await prisma.subscription.findUnique({
      where: { institutionId: payload.institutionId },
      select: {
        plan:                 true,
        status:               true,
        billingCycle:         true,
        trialEndsAt:          true,
        currentPeriodEnd:     true,
        nextBillingAt:        true,
        lastPaymentAt:        true,
        stripeCustomerId:     true,
        stripeSubscriptionId: true,
        stripePriceId:        true,
        amount:               true,
        startDate:            true,
      },
    });

    return successResponse(sub);
  } catch (error) {
    console.error("[billing/status]", error);
    return serverErrorResponse();
  }
}
