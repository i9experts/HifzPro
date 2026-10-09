// app/api/marketplace/signup/teacher/route.ts
// Self-serve signup for an independent Qari/Mu'allimah joining the Quran
// teacher marketplace. Unlike institution signup, the teacher sets their
// own password and is signed straight in — there is no admin to provision
// the account. The profile starts unlisted (isListed: false) until the
// teacher finishes the profile builder and (Phase 3) passes verification.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { errorResponse, serverErrorResponse, uniqueConstraintMessage } from "@/lib/api";
import { generateToken, cookieOptions } from "@/lib/auth";

const schema = z.object({
  name:             z.string().min(2),
  email:            z.string().email(),
  phone:            z.string().min(7),
  password:         z.string().min(8, "Password must be at least 8 characters"),
  gender:           z.enum(["MALE", "FEMALE"]),
  residenceCountry: z.string().min(2),
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
        role:         "MARKETPLACE_TEACHER",
        institutionId: null,
        campusId:      null,
        isActive:      true,
        teacherProfile: {
          create: {
            gender:           data.gender,
            residenceCountry: data.residenceCountry,
          },
        },
      },
      include: { teacherProfile: true },
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
        redirectTo: "/dashboard/teacher/profile",
      },
    });
    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (error: any) {
    const uniqueMessage = uniqueConstraintMessage(error);
    if (uniqueMessage) return errorResponse(uniqueMessage);
    console.error("Teacher marketplace signup error:", error);
    return serverErrorResponse();
  }
}
