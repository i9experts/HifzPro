// app/api/admin/fees/payments/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;

    const payment = await prisma.feePayment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            guardians: { take: 1, select: { name: true, phone: true, whatsapp: true, relation: true } },
            batch:     { select: { name: true } },
            campus:    {
              include: {
                institution: {
                  select: { name: true, nameArabic: true, logo: true, city: true, phone: true, email: true, address: true },
                },
              },
            },
          },
        },
        feeStructure: { select: { name: true, feeType: true, frequency: true } },
        collectedBy:  { select: { name: true } },
      },
    });

    if (!payment) return notFoundResponse("Payment not found");

    return successResponse({ payment });
  } catch (error) {
    console.error("[payment detail]", error);
    return serverErrorResponse();
  }
}
