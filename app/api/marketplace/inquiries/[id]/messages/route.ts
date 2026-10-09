// app/api/marketplace/inquiries/[id]/messages/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken, type TokenPayload } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const sendSchema = z.object({ body: z.string().min(1).max(4000) });

async function loadInquiryForParticipant(id: string, payload: TokenPayload) {
  const inquiry = await prisma.teacherInquiry.findUnique({
    where: { id },
    include: { teacher: { select: { userId: true } }, parent: { select: { userId: true } } },
  });
  if (!inquiry) return null;
  const isTeacher = inquiry.teacher.userId === payload.userId;
  const isParent  = inquiry.parent.userId === payload.userId;
  if (!isTeacher && !isParent) return null;
  return { inquiry, isTeacher };
}

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
    const found = await loadInquiryForParticipant(id, payload);
    if (!found) return notFoundResponse("Inquiry not found");

    const messages = await prisma.teacherMessage.findMany({
      where: { inquiryId: id },
      orderBy: { createdAt: "asc" },
    });

    // Mark the other side's messages as read now that this participant has fetched them
    await prisma.teacherMessage.updateMany({
      where: { inquiryId: id, senderId: { not: payload.userId }, readAt: null },
      data: { readAt: new Date() },
    });

    return successResponse({ messages, inquiry: found.inquiry });
  } catch (error) {
    console.error("List messages error:", error);
    return serverErrorResponse();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;
    const found = await loadInquiryForParticipant(id, payload);
    if (!found) return notFoundResponse("Inquiry not found");

    const body = await req.json();
    const result = sendSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const message = await prisma.teacherMessage.create({
      data: { inquiryId: id, senderId: payload.userId, body: result.data.body },
    });

    // A teacher's first reply to a pending inquiry counts as accepting it.
    // Otherwise still touch the row so `updatedAt` reflects latest activity
    // for inbox sort order (status assigned to itself to force the bump).
    const nextStatus = found.isTeacher && found.inquiry.status === "PENDING" ? "ACCEPTED" : found.inquiry.status;
    await prisma.teacherInquiry.update({ where: { id }, data: { status: nextStatus } });

    return successResponse({ message }, 201);
  } catch (error) {
    console.error("Send message error:", error);
    return serverErrorResponse();
  }
}
