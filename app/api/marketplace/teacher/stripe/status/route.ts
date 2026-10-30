// app/api/marketplace/teacher/stripe/status/route.ts
// Lets the teacher dashboard show payout-setup status without re-fetching
// the whole profile. Also opportunistically syncs stripeOnboardingComplete
// in case the account.updated webhook hasn't landed yet (e.g. local dev
// without a webhook listener running).
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { isAccountReady } from "@/lib/stripe-connect";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_TEACHER") return unauthorizedResponse();

    const profile = await prisma.teacherProfile.findUnique({ where: { userId: payload.userId } });
    if (!profile) return notFoundResponse("Teacher profile not found");

    if (!profile.stripeConnectAccountId) {
      return successResponse({ connected: false, onboardingComplete: false });
    }

    if (!profile.stripeOnboardingComplete) {
      const ready = await isAccountReady(profile.stripeConnectAccountId);
      if (ready) {
        await prisma.teacherProfile.update({ where: { userId: payload.userId }, data: { stripeOnboardingComplete: true } });
      }
      return successResponse({ connected: true, onboardingComplete: ready });
    }

    return successResponse({ connected: true, onboardingComplete: true });
  } catch (error) {
    console.error("Teacher Stripe status error:", error);
    return serverErrorResponse();
  }
}
