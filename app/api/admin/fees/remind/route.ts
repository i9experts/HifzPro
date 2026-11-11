// app/api/admin/fees/remind/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";
import { computeFeeBalance } from "@/lib/fees";

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { studentId } = await req.json();
    if (!studentId) return errorResponse("Student ID required");

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        guardians: { where: { receiveUpdates: true }, take: 2 },
        campus:    { include: { institution: { select: { name: true } } } },
        feePayments: {
          where:   { status: { in: ["PENDING","PARTIAL","OVERDUE"] } },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
    });

    if (!student) return errorResponse("Student not found");
    if (!student.guardians.length) return errorResponse("No guardian with WhatsApp found");

    // A discount settles a payment just as much as cash does (lib/fees.ts)
    // — only count rows that still have a real balance owed, regardless
    // of whatever status they were stored with.
    const duePayments = student.feePayments
      .map(p => ({ ...p, balance: computeFeeBalance(p.amount, p.paidAmount, p.discountAmount) }))
      .filter(p => p.balance > 0);
    if (!duePayments.length) return errorResponse("No outstanding fees found");

    const totalDue = duePayments.reduce((acc, p) => acc + p.balance, 0);
    const months   = duePayments.map(p => `${MONTHS[p.month]} ${p.year}`).join(", ");
    const instName = student.campus?.institution?.name || "HifzPro Institute";

    const message = `🔔 *فیس یاددہانی / Fee Reminder*
━━━━━━━━━━━━━━━
السلام علیکم،

🏫 ادارہ: ${instName}
👤 طالب علم: ${student.name}
📅 باقی مہینے: ${months}
💰 کل باقی رقم: PKR ${Math.round(totalDue).toLocaleString()}

براہ کرم جلد از جلد فیس ادا کریں۔

_HifzPro — www.hifzpro.com_`;

    // sendWhatsApp resolves {ok:false, error} rather than rejecting when
    // nothing is configured or the send fails, so a bare .catch() never
    // fires — the result has to be checked to know what actually happened.
    let sent = 0;
    const attempted = student.guardians.filter(g => g.whatsapp || g.phone).length;
    const errors: string[] = [];
    for (const guardian of student.guardians) {
      const phone = guardian.whatsapp || guardian.phone;
      if (!phone) continue;
      const result = await sendWhatsApp({ institutionId: payload.institutionId, to: phone, message })
        .catch((err): { ok: false; provider: "ultramsg"; error: string } => ({ ok: false, provider: "ultramsg", error: err?.message || "Unknown error" }));
      if (result.ok) sent++;
      else errors.push(result.error || "Unknown error");
    }

    if (attempted === 0) return errorResponse("No valid phone number found for guardian");
    if (sent === 0) return errorResponse(`Reminder failed to send: ${errors[0] || "unknown error"}`);

    return successResponse({ message: `Reminder sent to ${sent} of ${attempted} guardian(s)`, failed: errors });
  } catch (error) {
    console.error("[fee remind]", error);
    return serverErrorResponse();
  }
}
