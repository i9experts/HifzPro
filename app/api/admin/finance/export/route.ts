// app/api/admin/finance/export/route.ts
// GET -> export finance data as CSV, Excel (TSV), or JSON
// Query params:
//   type: fee_collection | outstanding | scholarships | student_ledger | journal_entries
//   format: csv | excel | json
//   erp: generic | erpnext | tally | peachtree
//   from: YYYY-MM-DD
//   to:   YYYY-MM-DD

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/api";

function getAuth(req: NextRequest): { institutionId: string; campusId: string | null; role: string } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return null;
  if (!payload.institutionId) return null;
  return { institutionId: payload.institutionId as string, campusId: payload.campusId ?? null, role: payload.role };
}

// ─── CSV helpers ─────────────────────────────────────────────
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: any[][]): string {
  const lines = [
    headers.map(escapeCSV).join(","),
    ...rows.map(r => r.map(escapeCSV).join(",")),
  ];
  return lines.join("\n");
}

function toTSV(headers: string[], rows: any[][]): string {
  const lines = [
    headers.join("\t"),
    ...rows.map(r => r.map(v => v ?? "").join("\t")),
  ];
  return lines.join("\n");
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PK", { day:"2-digit", month:"2-digit", year:"numeric" });
}

function formatAmount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0.00";
  return Number(n).toFixed(2);
}

// ─── ERP column name mappers ──────────────────────────────────
function mapHeaders(headers: string[], erp: string): string[] {
  if (erp === "erpnext") {
    const map: Record<string,string> = {
      "Date": "Posting Date",
      "Student Name": "Customer",
      "Amount": "Grand Total",
      "Paid Amount": "Paid Amount",
      "Outstanding": "Outstanding Amount",
      "Payment Method": "Mode of Payment",
      "Receipt No": "Name",
      "Month": "Billing Month",
      "Year": "Billing Year",
      "Fee Type": "Item",
      "Status": "Status",
      "Debit": "Debit",
      "Credit": "Credit",
      "Account": "Account",
      "Narration": "Remarks",
    };
    return headers.map(h => map[h] || h);
  }
  if (erp === "tally") {
    const map: Record<string,string> = {
      "Date": "Date",
      "Student Name": "Party Name",
      "Amount": "Amount",
      "Paid Amount": "Paid Amount",
      "Outstanding": "Balance",
      "Receipt No": "Voucher No",
      "Debit": "Dr Amount",
      "Credit": "Cr Amount",
      "Account": "Ledger Account",
      "Narration": "Narration",
    };
    return headers.map(h => map[h] || h);
  }
  if (erp === "peachtree") {
    const map: Record<string,string> = {
      "Date": "Transaction Date",
      "Student Name": "Customer ID",
      "Amount": "Invoice Amount",
      "Paid Amount": "Amount Paid",
      "Receipt No": "Invoice/CM #",
      "Account": "GL Account",
    };
    return headers.map(h => map[h] || h);
  }
  return headers;
}

// ─── Export generators ────────────────────────────────────────

async function exportFeeCollection(
  campusId: string | null,
  from: Date, to: Date, erp: string
): Promise<{ headers: string[]; rows: any[][] }> {
  const payments = await prisma.feePayment.findMany({
    where: {
      ...(campusId ? { student: { campusId } } : {}),
      paymentDate: { gte: from, lte: to },
      status: "PAID",
    },
    include: {
      student: { select: { name: true, enrollmentNumber: true, program: true } },
      feeStructure: { select: { name: true, feeType: true } },
      collectedBy: { select: { name: true } },
    },
    orderBy: { paymentDate: "asc" },
  });

  const headers = ["Date","Receipt No","Student Name","Enrollment No","Program","Fee Type","Amount","Paid Amount","Discount","Payment Method","Collected By"];
  const rows = payments.map(p => [
    formatDate(p.paymentDate),
    p.receiptNumber,
    p.student?.name ?? "",
    p.student?.enrollmentNumber ?? "",
    p.student?.program ?? "",
    p.feeStructure?.feeType ?? "TUITION",
    formatAmount(p.amount),
    formatAmount(p.paidAmount),
    formatAmount(p.discountAmount),
    p.paymentMethod ?? "",
    p.collectedBy?.name ?? "",
  ]);

  return { headers: mapHeaders(headers, erp), rows };
}

async function exportOutstanding(
  campusId: string | null,
  from: Date, to: Date, erp: string
): Promise<{ headers: string[]; rows: any[][] }> {
  const payments = await prisma.feePayment.findMany({
    where: {
      ...(campusId ? { student: { campusId } } : {}),
      status: { in: ["PENDING","PARTIAL","OVERDUE"] },
    },
    include: {
      student: { select: { name: true, enrollmentNumber: true, program: true, batch: { select: { name: true } } } },
      feeStructure: { select: { name: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const headers = ["Student Name","Enrollment No","Program","Batch","Month","Year","Fee Structure","Total Amount","Paid Amount","Outstanding","Status","Due Since"];
  const rows = payments.map(p => {
    const outstanding = (p.amount ?? 0) - (p.paidAmount ?? 0) - (p.discountAmount ?? 0);
    return [
      p.student?.name ?? "",
      p.student?.enrollmentNumber ?? "",
      p.student?.program ?? "",
      p.student?.batch?.name ?? "",
      p.month,
      p.year,
      p.feeStructure?.name ?? "Monthly Fee",
      formatAmount(p.amount),
      formatAmount(p.paidAmount),
      formatAmount(outstanding),
      p.status,
      formatDate(p.createdAt),
    ];
  });

  return { headers: mapHeaders(headers, erp), rows };
}

async function exportScholarships(
  campusId: string | null,
  from: Date, to: Date, erp: string
): Promise<{ headers: string[]; rows: any[][] }> {
  const scholarships = await prisma.scholarship.findMany({
    where: {
      ...(campusId ? { student: { campusId } } : {}),
      isActive: true,
    },
    include: {
      student: { select: { name: true, enrollmentNumber: true, program: true } },
      donor: { select: { name: true } },
      grantedBy: { select: { name: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const headers = ["Student Name","Enrollment No","Program","Scholarship Type","Coverage %","Fixed Amount","Donor","Granted By","Start Date","End Date","Status","Notes"];
  const rows = scholarships.map(s => [
    s.student?.name ?? "",
    s.student?.enrollmentNumber ?? "",
    s.student?.program ?? "",
    s.type ?? "FULL",
    s.percentage ? `${s.percentage}%` : "",
    s.fixedAmount ? formatAmount(s.fixedAmount) : "",
    s.donor?.name ?? "Institutional",
    s.grantedBy?.name ?? "",
    formatDate(s.startDate),
    s.endDate ? formatDate(s.endDate) : "Ongoing",
    s.isActive ? "Active" : "Inactive",
    s.reason ?? "",
  ]);

  return { headers: mapHeaders(headers, erp), rows };
}

async function exportStudentLedger(
  campusId: string | null,
  from: Date, to: Date, erp: string
): Promise<{ headers: string[]; rows: any[][] }> {
  const students = await prisma.student.findMany({
    where: { ...(campusId ? { campusId } : {}), status: "ACTIVE" },
    include: {
      feePayments: {
        where: { createdAt: { gte: from, lte: to } },
        include: { feeStructure: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
      scholarships: { where: { isActive: true }, select: { fixedAmount: true, percentage: true, type: true } },
    },
    orderBy: { enrollmentNumber: "asc" },
  });

  const headers = ["Enrollment No","Student Name","Program","Total Fees","Total Paid","Total Discount","Total Scholarship","Outstanding","Payment Status"];
  const rows = students.map(s => {
    const totalFees    = s.feePayments.reduce((a, p) => a + (p.amount ?? 0), 0);
    const totalPaid    = s.feePayments.reduce((a, p) => a + (p.paidAmount ?? 0), 0);
    const totalDisc    = s.feePayments.reduce((a, p) => a + (p.discountAmount ?? 0), 0);
    const totalSch     = s.scholarships.reduce((a, sch) => a + (sch.fixedAmount ?? 0), 0);
    const outstanding  = totalFees - totalPaid - totalDisc - totalSch;
    const status       = outstanding <= 0 ? "Clear" : outstanding > 0 ? "Outstanding" : "Overpaid";

    return [
      s.enrollmentNumber ?? "",
      s.name,
      s.program,
      formatAmount(totalFees),
      formatAmount(totalPaid),
      formatAmount(totalDisc),
      formatAmount(totalSch),
      formatAmount(Math.max(0, outstanding)),
      status,
    ];
  });

  return { headers: mapHeaders(headers, erp), rows };
}

async function exportJournalEntries(
  campusId: string | null,
  from: Date, to: Date, erp: string
): Promise<{ headers: string[]; rows: any[][] }> {
  const payments = await prisma.feePayment.findMany({
    where: {
      ...(campusId ? { student: { campusId } } : {}),
      paymentDate: { gte: from, lte: to },
      status: "PAID",
    },
    include: {
      student: { select: { name: true, enrollmentNumber: true } },
      feeStructure: { select: { name: true, feeType: true } },
    },
    orderBy: { paymentDate: "asc" },
  });

  const headers = ["Date","Voucher No","Account","Narration","Debit","Credit","Student Name","Enrollment No"];
  const rows: any[][] = [];

  payments.forEach(p => {
    const narration = `Fee payment — ${p.student?.name} — ${p.feeStructure?.name ?? "Monthly Fee"} — Receipt ${p.receiptNumber}`;
    // Debit: Cash/Bank
    rows.push([
      formatDate(p.paymentDate),
      p.receiptNumber,
      p.paymentMethod === "BANK" ? "Bank Account" : "Cash in Hand",
      narration,
      formatAmount(p.paidAmount),
      "",
      p.student?.name ?? "",
      p.student?.enrollmentNumber ?? "",
    ]);
    // Credit: Fee Income
    rows.push([
      formatDate(p.paymentDate),
      p.receiptNumber,
      `Fee Income — ${p.feeStructure?.feeType ?? "Tuition"}`,
      narration,
      "",
      formatAmount(p.paidAmount),
      p.student?.name ?? "",
      p.student?.enrollmentNumber ?? "",
    ]);
  });

  return { headers: mapHeaders(headers, erp), rows };
}

// ─── Main handler ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const type   = searchParams.get("type")   || "fee_collection";
    const format = searchParams.get("format") || "csv";
    const erp    = searchParams.get("erp")    || "generic";
    const fromStr= searchParams.get("from")   || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const toStr  = searchParams.get("to")     || new Date().toISOString().split("T")[0];

    const from = new Date(fromStr + "T00:00:00.000Z");
    const to   = new Date(toStr   + "T23:59:59.999Z");

    let result: { headers: string[]; rows: any[][] };

    switch (type) {
      case "outstanding":
        result = await exportOutstanding(auth.campusId, from, to, erp); break;
      case "scholarships":
        result = await exportScholarships(auth.campusId, from, to, erp); break;
      case "student_ledger":
        result = await exportStudentLedger(auth.campusId, from, to, erp); break;
      case "journal_entries":
        result = await exportJournalEntries(auth.campusId, from, to, erp); break;
      default:
        result = await exportFeeCollection(auth.campusId, from, to, erp);
    }

    const typeLabels: Record<string,string> = {
      fee_collection: "Fee-Collection",
      outstanding: "Outstanding-Dues",
      scholarships: "Scholarships",
      student_ledger: "Student-Ledger",
      journal_entries: "Journal-Entries",
    };

    const filename = `HifzPro_${typeLabels[type] ?? type}_${fromStr}_to_${toStr}`;
    const totalRows = result.rows.length;

    if (format === "json") {
      const data = result.rows.map(row => {
        const obj: Record<string,any> = {};
        result.headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
        return obj;
      });
      return new Response(JSON.stringify({ meta: { type, erp, from: fromStr, to: toStr, totalRows }, data }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    }

    const content = format === "excel"
      ? toTSV(result.headers, result.rows)
      : toCSV(result.headers, result.rows);

    const ext = format === "excel" ? "xls" : "csv";
    const mime = format === "excel"
      ? "application/vnd.ms-excel"
      : "text/csv";

    return new Response(
      format === "excel" ? `\uFEFF${content}` : content, // BOM for Excel UTF-8
      {
        headers: {
          "Content-Type": `${mime}; charset=utf-8`,
          "Content-Disposition": `attachment; filename="${filename}.${ext}"`,
        },
      }
    );
  } catch (error) {
    console.error("Finance export error:", error);
    return serverErrorResponse();
  }
}
