// app/api/auth/donor-signin/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse("Invalid email or password");

    const { email, password } = result.data;

    const donor = await prisma.donor.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: {
        institution: { select: { name:true, logo:true, id:true } },
        scholarships: {
          where: { isActive: true },
          include: { student: { select: { id:true, name:true, photo:true, program:true } } },
        },
      },
    });

    if (!donor || !donor.passwordHash) {
      return errorResponse("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, donor.passwordHash);
    if (!valid) return errorResponse("Invalid email or password");

    // Update last login
    await prisma.donor.update({ where:{ id:donor.id }, data:{ lastLoginAt:new Date() } });

    // Issue JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "hifzpro-secret");
    const token  = await new SignJWT({
      donorId:       donor.id,
      role:          "DONOR",
      institutionId: donor.institutionId,
      name:          donor.name,
    })
      .setProtectedHeader({ alg:"HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const response = successResponse({ donor: { id:donor.id, name:donor.name, email:donor.email, institutionId:donor.institutionId }, token });
    response.cookies.set("donor_token", token, { httpOnly:true, path:"/", maxAge:60*60*24*30, sameSite:"lax", secure:process.env.NODE_ENV==="production" });

    return response;
  } catch (error) {
    console.error("Donor signin error:", error);
    return serverErrorResponse();
  }
}
