// app/api/admin/institution/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const schema = z.object({
  name:        z.string().min(3).optional(),
  nameArabic:  z.string().optional(),
  about:       z.string().max(600).optional(),
  established: z.number().min(1900).max(2100).optional().nullable(),
  city:        z.string().optional(),
  address:     z.string().optional(),
  phone:       z.string().optional(),
  whatsapp:    z.string().optional(),
  email:       z.string().email().optional().or(z.literal("")),
  website:     z.string().optional(),
  logo:        z.string().optional(),
  programs:    z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !payload.institutionId) return unauthorizedResponse();

    const institution = await prisma.institution.findUnique({
      where: { id: payload.institutionId },
    });

    return successResponse({ institution });
  } catch (error) {
    console.error("[institution GET]", error);
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !payload.institutionId) return unauthorizedResponse();
    if (!["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    const updateData: any = {};
    if (data.name        !== undefined) updateData.name        = data.name;
    if (data.nameArabic  !== undefined) updateData.nameArabic  = data.nameArabic;
    if (data.about       !== undefined) updateData.about       = data.about;
    if (data.established !== undefined) updateData.established = data.established;
    if (data.city        !== undefined) updateData.city        = data.city;
    if (data.address     !== undefined) updateData.address     = data.address;
    if (data.phone       !== undefined) updateData.phone       = data.phone;
    if (data.whatsapp    !== undefined) updateData.whatsapp    = data.whatsapp;
    if (data.email       !== undefined) updateData.email       = data.email;
    if (data.website     !== undefined) updateData.website     = data.website;
    if (data.logo        !== undefined) updateData.logo        = data.logo;
    if (data.programs    !== undefined) updateData.programs    = data.programs.join(",");

    const institution = await prisma.institution.update({
      where: { id: payload.institutionId },
      data:  updateData,
    });

    return successResponse({ institution });
  } catch (error) {
    console.error("[institution PUT]", error);
    return serverErrorResponse();
  }
}
