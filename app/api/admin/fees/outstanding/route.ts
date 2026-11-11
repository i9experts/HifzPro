// app/api/admin/fees/outstanding/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { computeFeeBalance } from "@/lib/fees";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const now = new Date();

    // Get all students with their payments
    const students = await prisma.student.findMany({
      where: {
        campusId: payload.campusId || undefined,
        status:   "ACTIVE",
      },
      include: {
        // PENDING/PARTIAL/OVERDUE is a cheap DB-side prefilter for the
        // rows worth checking; the real "still owed" decision is the
        // per-payment balance computed below, so a payment whose status
        // was set before discounts were accounted for (or any other
        // stale value) still gets correctly excluded once its balance
        // nets to zero, with no backfill needed.
        feePayments: {
          where:   { status: { in: ["PENDING","PARTIAL","OVERDUE"] } },
          orderBy: [{ year: "asc" }, { month: "asc" }],
          include: { feeStructure: { select: { name: true, feeType: true } } },
        },
        // Only a scholarship that's actually in effect right now applies —
        // one that hasn't started yet, or has already ended, shouldn't
        // retroactively discount unrelated months.
        scholarships: {
          where: {
            isActive:  true,
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        },
        batch:        { select: { name: true } },
        guardians:    { take: 1, select: { name: true, phone: true, whatsapp: true } },
      },
    });

    const withOutstanding = students
      .map(s => {
        const duePayments = s.feePayments
          .map(p => ({ ...p, balance: computeFeeBalance(p.amount, p.paidAmount, p.discountAmount) }))
          .filter(p => p.balance > 0);
        if (duePayments.length === 0) return null;

        const totalDue  = duePayments.reduce((acc, p) => acc + p.balance, 0);
        const months    = duePayments.length;
        const oldestDue = duePayments[0];
        const scholarship = s.scholarships[0];

        // Apply scholarship discount
        const effectiveDue = scholarship
          ? scholarship.type === "FULL" ? 0
          : scholarship.type === "PARTIAL_PERCENT" ? totalDue * (1 - (scholarship.percentage || 0) / 100)
          : Math.max(0, totalDue - (scholarship.fixedAmount || 0))
          : totalDue;

        return {
          studentId:    s.id,
          name:         s.name,
          enrollmentNumber: s.enrollmentNumber,
          batch:        s.batch?.name || "—",
          guardian:     s.guardians[0] || null,
          totalDue:     Math.round(effectiveDue),
          monthsOverdue:months,
          oldestMonth:  oldestDue ? `${oldestDue.month}/${oldestDue.year}` : "—",
          payments:     duePayments,
          scholarship:  scholarship || null,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => b.totalDue - a.totalDue);

    // Summary
    const totalOutstanding = withOutstanding.reduce((acc, s) => acc + s.totalDue, 0);
    const overdueCritical  = withOutstanding.filter(s => s.monthsOverdue >= 3).length;

    return successResponse({
      students: withOutstanding,
      summary: {
        totalStudents:   withOutstanding.length,
        totalOutstanding: Math.round(totalOutstanding),
        overdueCritical,
      },
    });
  } catch (error) {
    console.error("Outstanding fees error:", error);
    return serverErrorResponse();
  }
}
