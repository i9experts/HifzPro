// app/api/marketplace/signup/parent/route.ts
// Self-serve signup for a parent/guardian looking to hire an independent
// Qari/Mu'allimah through the marketplace. Distinct from the institution-
// bound PARENT role (lib/tenant-guard.ts), which is tied to a Guardian
// record under a specific institution's Student — a marketplace parent
// has no institution at all until (Phase 2) a booking auto-provisions one.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { errorResponse, serverErrorResponse, uniqueConstraintMessage } from "@/lib/api";
import { generateToken, cookieOptions } from "@/lib/auth";

const schema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  phone:    z.string().min(7),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country:  z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name:         data.name,
        email:        data.email,
        phone:        data.phone,
        whatsapp:     data.phone,
        passwordHash,
        role:         "MARKETPLACE_PARENT",
        institutionId: null,
        campusId:      null,
        isActive:      true,
        marketplaceParent: {
          create: { country: data.country },
        },
      },
      include: { marketplaceParent: true },
    });

    const token = generateToken({
      userId:        user.id,
      role:          user.role,
      institutionId: null,
      campusId:      null,
      name:          user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        redirectTo: "/marketplace",
      },
    });
    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (error: any) {
    const uniqueMessage = uniqueConstraintMessage(error);
    if (uniqueMessage) return errorResponse(uniqueMessage);
    console.error("Parent marketplace signup error:", error);
    return serverErrorResponse();
  }
}
