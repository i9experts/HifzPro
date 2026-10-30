// app/api/marketplace/teacher/stripe/onboarding/route.ts
// Creates (or refreshes) the teacher's Stripe Connect Express account and
// returns a hosted onboarding link. A booking can't be paid for until this
// completes (see app/api/marketplace/webhook/route.ts: account.updated).
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { createExpressAccount, createOnboardingLink } from "@/lib/stripe-connect";

const schema = z.object({
  country: z.string().regex(/^[A-Z]{2}$/, "Use a 2-letter country code, e.g. PK, GB, US, AE, SA"),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_TEACHER") return unauthorizedResponse();

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: payload.userId },
      include: { user: { select: { email: true } } },
    });
    if (!profile) return notFoundResponse("Teacher profile not found");
    if (!profile.user.email) return errorResponse("Add an email to your account before setting up payouts");

    let accountId = profile.stripeConnectAccountId;
    if (!accountId) {
      const account = await createExpressAccount(profile.user.email, result.data.country);
      accountId = account.id;
      await prisma.teacherProfile.update({
        where: { userId: payload.userId },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com";
    const link = await createOnboardingLink(
      accountId,
      `${baseUrl}/dashboard/teacher/profile?stripe=refresh`,
      `${baseUrl}/dashboard/teacher/profile?stripe=return`,
    );

    return successResponse({ url: link.url });
  } catch (error: any) {
    console.error("Teacher Stripe onboarding error:", error?.message, error);
    return serverErrorResponse();
  }
}
