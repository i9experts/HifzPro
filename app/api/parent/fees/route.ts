// app/api/parent/fees/route.ts
// Read-only fee history for a parent's own child — payment history,
// outstanding balance, and any active scholarship. No internal fields
// (collectedById, grantedById, staff names) are exposed.
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { computeFeeBalance } from "@/lib/fees";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    // See app/api/parent/dashboard/route.ts — a marketplace parent linked
    // in via an auto-provisioned booking needs access here too; ownership
    // is enforced below via the Parent/Guardian chain, not the role.
    if (!payload || !["PARENT", "MARKETPLACE_PARENT"].includes(payload.role)) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) return notFoundResponse("Student not specified");

    // Ownership check — same pattern as /api/parent/dashboard: this
    // parent's User must be linked (via Parent -> Guardian) to the
    // requested student, otherwise one parent could read another
    // family's fee history just by guessing a student id.
    const student = await prisma.student.findFirst({
      where: { id: studentId, guardians: { some: { parent: { userId: payload.userId } } } },
      select: { id: true },
    });
    if (!student) return notFoundResponse("Student not found");

    const now = new Date();
    const [payments, scholarship] = await Promise.all([
      prisma.feePayment.findMany({
        where: { studentId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        select: {
          id: true, amount: true, paidAmount: true, discountAmount: true, status: true,
          month: true, year: true, paymentMethod: true, paymentDate: true, receiptNumber: true,
          feeStructure: { select: { name: true, feeType: true } },
        },
      }),
      prisma.scholarship.findFirst({
        where: {
          studentId, isActive: true,
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        select: { name: true, type: true, percentage: true, fixedAmount: true, reason: true },
      }),
    ]);

    const withBalance = payments.map(p => ({ ...p, balance: computeFeeBalance(p.amount, p.paidAmount, p.discountAmount) }));
    const totalOutstanding = withBalance.reduce((acc, p) => acc + p.balance, 0);

    return successResponse({
      payments: withBalance,
      scholarship,
      summary: {
        totalOutstanding: Math.round(totalOutstanding),
        totalPaymentsRecorded: payments.length,
      },
    });
  } catch (error) {
    console.error("Parent fees error:", error);
    return serverErrorResponse();
  }
}
