// app/api/admin/fees/payments/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";
import { computeFeePaymentStatus } from "@/lib/fees";
import { generateReceiptNumber, withReceiptNumberRetry } from "@/lib/receipt-number";

const schema = z.object({
  studentId:     z.string(),
  feeStructureId:z.string().optional(),
  amount:        z.number().min(0),
  paidAmount:    z.number().min(0),
  discountAmount:z.number().min(0).default(0),
  month:         z.number().min(1).max(12),
  year:          z.number().min(2020).max(2100),
  paymentMethod: z.enum(["CASH","BANK_TRANSFER","JAZZCASE","EASYPAISA","CHEQUE","ONLINE","OTHER"]).default("CASH"),
  paymentDate:   z.string().optional(),
  notes:         z.string().optional(),
  sendReceipt:   z.boolean().default(false),
});

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || "";
    const month     = parseInt(searchParams.get("month") || "0");
    const year      = parseInt(searchParams.get("year")  || "0");
    const status    = searchParams.get("status") || "";
    const limit     = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (payload.campusId) where.student = { campusId: payload.campusId };
    if (studentId) where.studentId = studentId;
    if (month)     where.month     = month;
    if (year)      where.year      = year;
    if (status)    where.status    = status;

    const [total, payments] = await Promise.all([
      prisma.feePayment.count({ where }),
      prisma.feePayment.findMany({
        where, orderBy: { createdAt: "desc" }, take: limit,
        include: {
          student:      { select: { id: true, name: true, enrollmentNumber: true, photo: true, program: true } },
          feeStructure: { select: { name: true, feeType: true } },
          collectedBy:  { select: { name: true } },
        },
      }),
    ]);

    // Monthly stats
    const now = new Date();
    const thisMonth = await prisma.feePayment.aggregate({
      where: { student: { campusId: payload.campusId || undefined }, month: now.getMonth() + 1, year: now.getFullYear() },
      _sum: { paidAmount: true, amount: true },
      _count: true,
    });
    // Outstanding — a discount reduces what's owed just as much as a cash
    // payment does (lib/fees.ts), so it has to come out of this sum too,
    // or a fully-discounted payment still counts as money owed.
    const outstanding = await prisma.feePayment.aggregate({
      where: { student: { campusId: payload.campusId || undefined }, status: { in: ["PENDING","PARTIAL","OVERDUE"] } },
      _sum: { amount: true, paidAmount: true, discountAmount: true },
      _count: true,
    });

    return successResponse({
      payments, total,
      stats: {
        thisMonthCollected:  thisMonth._sum.paidAmount || 0,
        thisMonthTotal:      thisMonth._sum.amount || 0,
        thisMonthCount:      thisMonth._count,
        outstandingAmount:   Math.max(0, (outstanding._sum.amount || 0) - (outstanding._sum.paidAmount || 0) - (outstanding._sum.discountAmount || 0)),
        outstandingCount:    outstanding._count,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // A discount settles the balance exactly as much as cash collected
    // does — a payment fully covered by discount is PAID, not PARTIAL.
    const status = computeFeePaymentStatus(data.amount, data.paidAmount, data.discountAmount);

    const payment = await withReceiptNumberRetry(() => prisma.$transaction(async (tx) => {
      const receiptNumber = await generateReceiptNumber(tx);
      return tx.feePayment.create({
        data: {
          studentId:      data.studentId,
          feeStructureId: data.feeStructureId || null,
          amount:         data.amount,
          paidAmount:     data.paidAmount,
          discountAmount: data.discountAmount,
          month:          data.month,
          year:           data.year,
          status,
          paymentDate:    data.paymentDate ? new Date(data.paymentDate) : new Date(),
          paymentMethod:  data.paymentMethod,
          receiptNumber,
          notes:          data.notes || null,
          collectedById:  payload.userId,
        },
        include: {
          student: {
            include: {
              guardians: { where: { receiveUpdates: true }, take: 2 },
              campus:    { include: { institution: true } },
            },
          },
          feeStructure: { select: { name: true } },
          collectedBy:  { select: { name: true } },
        },
      });
    }));

    // Send WhatsApp receipt if requested — sendWhatsApp resolves {ok:false}
    // rather than rejecting when nothing is configured, so the result has
    // to be checked explicitly; a .catch() alone can't see that failure.
    let whatsappResult: { attempted: boolean; sent: number; errors: string[] } = { attempted: false, sent: 0, errors: [] };
    if (data.sendReceipt && payment.student.guardians.length > 0 && status === "PAID") {
      whatsappResult.attempted = true;
      const instituteName = payment.student.campus?.institution?.name || "HifzPro";
      const message = `🧾 *رسید / Fee Receipt*\n━━━━━━━━━━━━━━━\n🏫 ${instituteName}\n👤 طالب علم: ${payment.student.name}\n📅 ${MONTHS[data.month]} ${data.year}\n💰 رقم ادا: PKR ${data.paidAmount.toLocaleString()}\n🧾 رسید نمبر: ${payment.receiptNumber}\n✅ ادائیگی موصول ہوگئی\n━━━━━━━━━━━━━━━\n_HifzPro — www.hifzpro.com_`;
      for (const guardian of payment.student.guardians) {
        const phone = guardian.whatsapp || guardian.phone;
        if (!phone) continue;
        const sendResult = await sendWhatsApp({ institutionId: payload.institutionId, to: phone, message }).catch((err): { ok: false; provider: "ultramsg"; error: string } => ({ ok: false, provider: "ultramsg", error: err?.message || "Unknown error" }));
        if (sendResult.ok) whatsappResult.sent++;
        else whatsappResult.errors.push(sendResult.error || "Unknown error");
      }
    }

    return successResponse({ payment, receiptNumber: payment.receiptNumber, whatsapp: whatsappResult }, 201);
  } catch (error) {
    console.error("Create payment error:", error);
    return serverErrorResponse();
  }
}
