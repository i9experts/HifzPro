// app/api/auth/signin/route.ts
// Admin and Ustadh email + password authentication

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateToken, cookieOptions } from "@/lib/auth";
import { errorResponse, serverErrorResponse } from "@/lib/api";

const signInSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const result = signInSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institution: { select: { id: true, name: true, slug: true } },
        campus:      { select: { id: true, name: true } },
        ustadh:      { select: { id: true } },
      },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse("Your account has been deactivated. Contact your admin.", 401);
    }

    // Check role — only Admin and Ustadh can use email/password
    if (user.role === "PARENT" || user.role === "STUDENT") {
      return errorResponse("Please use WhatsApp OTP to sign in.", 401);
    }

    // Verify password
    if (!user.passwordHash) {
      return errorResponse("Invalid email or password", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = generateToken({
      userId:        user.id,
      role:          user.role,
      institutionId: user.institutionId,
      campusId:      user.campusId,
      name:          user.name,
    });

    // Set cookie and return response
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id:          user.id,
          name:        user.name,
          email:       user.email,
          role:        user.role,
          institution: user.institution,
          campus:      user.campus,
        },
        redirectTo: getDashboardUrl(user.role),
      },
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;

  } catch (error) {
    console.error("Sign in error:", error);
    return serverErrorResponse();
  }
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":  return "/dashboard/super-admin";
    case "CAMPUS_ADMIN": return "/dashboard/admin";
    case "USTADH":       return "/dashboard/ustadh";
    case "EXAMINER":     return "/dashboard/examiner";
    default:             return "/dashboard";
  }
}
