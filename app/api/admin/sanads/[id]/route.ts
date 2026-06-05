// app/api/admin/sanads/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const sanad  = await prisma.sanad.findUnique({
      where:   { id },
      include: {
        student: {
          include: {
            progress: true,
            campus:   { include: { institution: true } },
            batch:    { include: { ustadh: { include: { user: { select: { name: true } } } } } },
          },
        },
        issuedBy: { select: { name: true } },
      },
    });
    if (!sanad) return notFoundResponse("Sanad not found");
    return successResponse({ sanad });
  } catch (error) {
    console.error("Get sanad error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id } = await params;
    const body   = await req.json();

    const sanad = await prisma.sanad.update({
      where: { id },
      data: {
        silsila:   body.silsila,
        issuedAt:  body.issuedAt ? new Date(body.issuedAt) : undefined,
      },
      include: {
        student: {
          include: {
            campus: { include: { institution: true } },
            batch:  { include: { ustadh: { include: { user: { select: { name: true } } } } } },
          },
        },
      },
    });

    return successResponse({ sanad });
  } catch (error) {
    console.error("Update sanad error:", error);
    return serverErrorResponse();
  }
}
