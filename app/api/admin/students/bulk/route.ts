// app/api/admin/students/bulk/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

interface BulkStudent {
  name:             string;
  program:          string;
  dateOfBirth?:     string;
  guardianName:     string;
  guardianPhone:    string;
  guardianRelation?: string;
}

const VALID_PROGRAMS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();
    if (!payload.campusId) return errorResponse("No campus assigned to your account");

    const body = await req.json();
    const rows: BulkStudent[] = body.students;

    if (!Array.isArray(rows) || rows.length === 0)
      return errorResponse("No student data provided");
    if (rows.length > 200)
      return errorResponse("Maximum 200 students per import");

    const results: { row: number; name: string; status: "success" | "error"; error?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      // Validate
      if (!row.name?.trim()) { results.push({ row: rowNum, name: row.name || "—", status: "error", error: "Name is required" }); continue; }
      if (!row.guardianName?.trim()) { results.push({ row: rowNum, name: row.name, status: "error", error: "Guardian name is required" }); continue; }
      if (!row.guardianPhone?.trim()) { results.push({ row: rowNum, name: row.name, status: "error", error: "Guardian phone is required" }); continue; }
      const program = row.program?.toUpperCase().trim();
      if (!VALID_PROGRAMS.includes(program)) { results.push({ row: rowNum, name: row.name, status: "error", error: `Invalid program "${row.program}". Use: HIFZ, NAZRA, TAJWEED, GIRDAAN` }); continue; }

      try {
        // Generate enrollment number
        const count = await prisma.student.count({ where: { campusId: payload.campusId! } });
        const enrollmentNumber = `STU-${String(count + 1 + i).padStart(4, "0")}`;

        const student = await prisma.student.create({
          data: {
            campusId:         payload.campusId!,
            name:             row.name.trim(),
            program:          program as any,
            enrollmentNumber,
            dateOfBirth:      row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
            status:           "ACTIVE",
          },
        });

        await prisma.guardian.create({
          data: {
            studentId:      student.id,
            name:           row.guardianName.trim(),
            phone:          row.guardianPhone.trim(),
            whatsapp:       row.guardianPhone.trim(),
            relation:       row.guardianRelation?.trim() || "Father",
            receiveUpdates: true,
            isEmergency:    true,
          },
        });

        results.push({ row: rowNum, name: row.name, status: "success" });
      } catch (e: any) {
        results.push({ row: rowNum, name: row.name, status: "error", error: e?.code === "P2002" ? "Duplicate enrollment number" : e.message });
      }
    }

    const succeeded = results.filter(r => r.status === "success").length;
    const failed    = results.filter(r => r.status === "error").length;

    return successResponse({ succeeded, failed, results });
  } catch (error) {
    console.error("Bulk students error:", error);
    return serverErrorResponse();
  }
}
