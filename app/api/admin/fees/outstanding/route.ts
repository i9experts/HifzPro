// app/api/admin/fees/outstanding/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    // Get all students with their payments
    const students = await prisma.student.findMany({
      where: {
        campusId: payload.campusId || undefined,
        status:   "ACTIVE",
      },
      include: {
        feePayments: {
          where:   { status: { in: ["PENDING","PARTIAL","OVERDUE"] } },
          orderBy: [{ year: "asc" }, { month: "asc" }],
          include: { feeStructure: { select: { name: true, feeType: true } } },
        },
        scholarships: { where: { isActive: true } },
        batch:        { select: { name: true } },
        guardians:    { take: 1, select: { name: true, phone: true, whatsapp: true } },
      },
    });

    const withOutstanding = students
      .filter(s => s.feePayments.length > 0)
      .map(s => {
        const totalDue  = s.feePayments.reduce((acc, p) => acc + p.amount - (p.paidAmount || 0), 0);
        const months    = s.feePayments.length;
        const oldestDue = s.feePayments[0];
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
          payments:     s.feePayments,
          scholarship:  scholarship || null,
        };
      })
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
