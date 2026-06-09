// app/api/billing/checkout/route.ts
import { NextRequest } from "next/server";
import { stripe, PRICES, PLAN_META, PlanKey, IntervalKey } from "@/lib/stripe";
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

    const body     = await req.json();
    const plan     = body.plan     as PlanKey;
    const interval = body.interval as IntervalKey;

    if (!PRICES[plan]?.[interval]) {
      return errorResponse("Invalid plan or billing interval");
    }

    const priceId = PRICES[plan][interval];
    const meta    = PLAN_META[plan];

    // Get or create Stripe customer
    const subscription = await prisma.subscription.findUnique({
      where: { institutionId: payload.institutionId },
    });
    const institution = await prisma.institution.findUnique({
      where: { id: payload.institutionId },
      select: { name: true, email: true },
    });

    if (!institution) return errorResponse("Institution not found");

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name:     institution.name,
        email:    institution.email || undefined,
        metadata: { institutionId: payload.institutionId, plan },
      });
      customerId = customer.id;

      // Save customer ID immediately
      await prisma.subscription.update({
        where: { institutionId: payload.institutionId },
        data:  { stripeCustomerId: customerId },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com";

    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      mode:                 "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          institutionId: payload.institutionId,
          plan,
          interval,
        },
        trial_end: subscription?.status === "TRIAL" && subscription?.trialEndsAt
          ? "continue" // preserve remaining trial
          : undefined,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/billing`,
      metadata: {
        institutionId: payload.institutionId,
        plan,
        interval,
      },
    });

    return successResponse({ url: session.url });
  } catch (error: any) {
    console.error("[billing/checkout]", error?.message);
    return serverErrorResponse("Failed to create checkout session");
  }
}
