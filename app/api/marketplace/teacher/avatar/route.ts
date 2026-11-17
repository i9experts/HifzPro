// app/api/marketplace/teacher/avatar/route.ts
// Sets the marketplace teacher's own photo — stored on User.avatar (the
// same field every other role's PhotoUpload writes to), not on
// TeacherProfile, since a profile photo belongs to the person, not the
// listing.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse, errorResponse } from "@/lib/api";

const schema = z.object({ avatarUrl: z.string().max(5_000_000) }); // data URLs can run large; empty string clears it

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_TEACHER") return unauthorizedResponse();

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { avatar: result.data.avatarUrl || null },
      select: { avatar: true },
    });

    return successResponse({ avatar: user.avatar });
  } catch (error) {
    console.error("Teacher avatar PUT error:", error);
    return serverErrorResponse();
  }
}
