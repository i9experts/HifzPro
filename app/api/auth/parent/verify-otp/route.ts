// app/api/auth/parent/verify-otp/route.ts
// Verify OTP and sign in parent

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateToken, cookieOptions } from "@/lib/auth";
import { errorResponse, serverErrorResponse } from "@/lib/api";

const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp:   z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = verifyOtpSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { phone, otp } = result.data;
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^0/, "+92");

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { whatsapp: normalizedPhone },
          { phone: phone },
          { whatsapp: phone },
        ],
      },
      include: {
        institution: { select: { id: true, name: true, slug: true } },
        campus:      { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return errorResponse("Invalid OTP", 401);
    }

    // Find valid OTP
    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        userId:    user.id,
        token:     otp,
        used:      false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return errorResponse("Invalid or expired OTP. Please request a new one.", 401);
    }

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpRecord.id },
      data:  { used: true },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = generateToken({
      userId:        user.id,
      role:          user.role,
      institutionId: user.institutionId,
      campusId:      user.campusId,
      name:          user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id:          user.id,
          name:        user.name,
          phone:       user.phone,
          role:        user.role,
          institution: user.institution,
          campus:      user.campus,
        },
        redirectTo: "/dashboard/parent",
      },
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;

  } catch (error) {
    console.error("Verify OTP error:", error);
    return serverErrorResponse();
  }
}
