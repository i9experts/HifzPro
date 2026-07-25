// app/api/admin/asatidha/bulk/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

interface BulkUstadh {
  name:            string;
  email:           string;
  phone:           string;
  whatsapp?:       string;
  specialization?: string;
  experience?:     string;
  qualifications?: string; // pipe-separated: "Hafiz ul Quran|Alim"
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") + "1!";
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();
    if (!payload.campusId || !payload.institutionId) return errorResponse("No campus assigned");

    const body = await req.json();
    const rows: BulkUstadh[] = body.asatidha;

    if (!Array.isArray(rows) || rows.length === 0)
      return errorResponse("No Ustadh data provided");
    if (rows.length > 100)
      return errorResponse("Maximum 100 Asatidha per import");

    const results: { row: number; name: string; status: "success" | "error"; password?: string; error?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row  = rows[i];
      const rowNum = i + 1;

      if (!row.name?.trim())  { results.push({ row: rowNum, name: row.name || "—", status: "error", error: "Name is required" }); continue; }
      if (!row.email?.trim()) { results.push({ row: rowNum, name: row.name, status: "error", error: "Email is required" }); continue; }
      if (!row.phone?.trim()) { results.push({ row: rowNum, name: row.name, status: "error", error: "Phone is required" }); continue; }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email.trim())) { results.push({ row: rowNum, name: row.name, status: "error", error: "Invalid email format" }); continue; }

      try {
        const password   = generatePassword();
        const hashedPw   = await bcrypt.hash(password, 10);
        const quals      = row.qualifications ? row.qualifications.split("|").map(q => q.trim()).filter(Boolean) : [];
        const experience = row.experience ? parseInt(row.experience) : undefined;

        const user = await prisma.user.create({
          data: {
            name:          row.name.trim(),
            email:         row.email.trim().toLowerCase(),
            phone:         row.phone.trim(),
            whatsapp:      row.whatsapp?.trim() || row.phone.trim(),
            passwordHash:  hashedPw,
            role:          "USTADH",
            institutionId: payload.institutionId!,
            campusId:      payload.campusId!,
            isActive:      true,
          },
        });

        await prisma.ustadh.create({
          data: {
            userId:         user.id,
            specialization: row.specialization?.trim() || null,
            qualification:  quals.join(", ") || null,
          },
        });

        results.push({ row: rowNum, name: row.name, status: "success", password });
      } catch (e: any) {
        const msg = e?.code === "P2002"
          ? "Email or phone already exists"
          : e.message;
        results.push({ row: rowNum, name: row.name, status: "error", error: msg });
      }
    }

    const succeeded = results.filter(r => r.status === "success").length;
    const failed    = results.filter(r => r.status === "error").length;

    return successResponse({ succeeded, failed, results });
  } catch (error) {
    console.error("Bulk asatidha error:", error);
    return serverErrorResponse();
  }
}
