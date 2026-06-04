import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        progress: true,
        lessonEntries: {
          orderBy: { date: "desc" },
          take: 5,
          include: { mistakes: true },
        },
      },
    });

    if (!student) {
      return successResponse({ student: null }, 404);
    }

    return successResponse({ student });
  } catch (error) {
    console.error("Admin student fetch error:", error);
    return serverErrorResponse();
  }
}
