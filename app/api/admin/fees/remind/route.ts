// app/api/admin/fees/remind/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";

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
    if (!student.feePayments.length) return errorResponse("No outstanding fees found");

    const totalDue = student.feePayments.reduce((acc, p) => acc + p.amount - (p.paidAmount || 0), 0);
    const months   = student.feePayments.map(p => `${MONTHS[p.month]} ${p.year}`).join(", ");
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

    let sent = 0;
    for (const guardian of student.guardians) {
      const phone = guardian.whatsapp || guardian.phone;
      if (phone) {
        await sendWhatsApp(phone, message).catch(console.error);
        sent++;
      }
    }

    if (sent === 0) return errorResponse("No valid phone number found for guardian");

    return successResponse({ message: `Reminder sent to ${sent} guardian(s)` });
  } catch (error) {
    console.error("[fee remind]", error);
    return serverErrorResponse();
  }
}
