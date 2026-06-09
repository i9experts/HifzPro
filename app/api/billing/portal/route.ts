// app/api/billing/portal/route.ts
import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !payload.institutionId) return unauthorizedResponse();
    if (!["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const subscription = await prisma.subscription.findUnique({
      where: { institutionId: payload.institutionId },
    });

    if (!subscription?.stripeCustomerId) {
      return errorResponse("No active Stripe subscription found. Please subscribe first.");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com";

    const session = await stripe.billingPortal.sessions.create({
      customer:   subscription.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    return successResponse({ url: session.url });
  } catch (error: any) {
    console.error("[billing/portal]", error?.message);
    return serverErrorResponse("Failed to open billing portal");
  }
}
