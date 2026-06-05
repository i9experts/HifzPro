// app/api/admin/fees/payments/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";

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

function generateReceiptNumber(count: number): string {
  const year  = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `RCP-${year}${month}-${String(count + 1).padStart(5, "0")}`;
}

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

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
    const outstanding = await prisma.feePayment.aggregate({
      where: { student: { campusId: payload.campusId || undefined }, status: { in: ["PENDING","PARTIAL","OVERDUE"] } },
      _sum: { amount: true, paidAmount: true },
      _count: true,
    });

    return successResponse({
      payments, total,
      stats: {
        thisMonthCollected:  thisMonth._sum.paidAmount || 0,
        thisMonthTotal:      thisMonth._sum.amount || 0,
        thisMonthCount:      thisMonth._count,
        outstandingAmount:   (outstanding._sum.amount || 0) - (outstanding._sum.paidAmount || 0),
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

    // Generate receipt number
    const count         = await prisma.feePayment.count();
    const receiptNumber = generateReceiptNumber(count);

    // Determine status
    const status = data.paidAmount >= data.amount ? "PAID"
      : data.paidAmount > 0 ? "PARTIAL"
      : "PENDING";

    const payment = await prisma.feePayment.create({
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

    // Send WhatsApp receipt if requested
    if (data.sendReceipt && payment.student.guardians.length > 0 && status === "PAID") {
      const instituteName = payment.student.campus?.institution?.name || "HifzPro";
      const message = `🧾 *رسید / Fee Receipt*\n━━━━━━━━━━━━━━━\n🏫 ${instituteName}\n👤 طالب علم: ${payment.student.name}\n📅 ${MONTHS[data.month]} ${data.year}\n💰 رقم ادا: PKR ${data.paidAmount.toLocaleString()}\n🧾 رسید نمبر: ${receiptNumber}\n✅ ادائیگی موصول ہوگئی\n━━━━━━━━━━━━━━━\n_HifzPro — www.hifzpro.com_`;
      for (const guardian of payment.student.guardians) {
        const phone = guardian.whatsapp || guardian.phone;
        if (phone) await sendWhatsApp(phone, message).catch(console.error);
      }
    }

    return successResponse({ payment, receiptNumber }, 201);
  } catch (error) {
    console.error("Create payment error:", error);
    return serverErrorResponse();
  }
}
