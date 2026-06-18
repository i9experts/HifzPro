// app/api/auth/signin/route.ts
// Admin and Ustadh email + password authentication
// Enforces that the selected role tab matches the account's actual role
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateToken, cookieOptions } from "@/lib/auth";
import { errorResponse, serverErrorResponse } from "@/lib/api";

const signInSchema = z.object({
  email:        z.string().email("Invalid email address"),
  password:     z.string().min(6, "Password must be at least 6 characters"),
  expectedRole: z.enum(["CAMPUS_ADMIN", "USTADH"]).optional(),
});

// Roles that satisfy each tab. SUPER_ADMIN can sign in via either tab
// since they have access to both admin and ustadh-equivalent views.
const ROLE_TAB_MATCH: Record<string, string[]> = {
  CAMPUS_ADMIN: ["CAMPUS_ADMIN", "SUPER_ADMIN"],
  USTADH:       ["USTADH", "SUPER_ADMIN"],
};

const TAB_LABELS: Record<string, string> = {
  CAMPUS_ADMIN: "Admin",
  USTADH:       "Ustadh",
};

const ROLE_LABELS: Record<string, string> = {
  CAMPUS_ADMIN: "Admin",
  USTADH:       "Ustadh",
  SUPER_ADMIN:  "Super Admin",
  EXAMINER:     "Examiner",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = signInSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }
    const { email, password, expectedRole } = result.data;

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

    if (!user.isActive) {
      return errorResponse("Your account has been deactivated. Contact your admin.", 401);
    }

    if (user.role === "PARENT" || user.role === "STUDENT") {
      return errorResponse("Please use WhatsApp OTP to sign in.", 401);
    }

    if (!user.passwordHash) {
      return errorResponse("Invalid email or password", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // ── Role tab enforcement ──
    // If the frontend told us which tab was selected, verify the
    // account's actual role is allowed under that tab.
    if (expectedRole) {
      const allowed = ROLE_TAB_MATCH[expectedRole] || [expectedRole];
      if (!allowed.includes(user.role)) {
        const actualLabel = ROLE_LABELS[user.role] || user.role;
        const tabLabel     = TAB_LABELS[expectedRole] || expectedRole;
        return errorResponse(
          `This account is registered as ${actualLabel}. Please select the "${actualLabel}" tab to sign in.`,
          401
        );
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

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
    case "SUPER_ADMIN":  return "/superadmin";
    case "CAMPUS_ADMIN": return "/dashboard/admin";
    case "USTADH":       return "/dashboard/ustadh";
    case "EXAMINER":     return "/dashboard/examiner";
    default:             return "/dashboard";
  }
}
