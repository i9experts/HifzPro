// app/api/admin/students/bulk/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

interface BulkStudent {
  name:              string;
  nameArabic?:       string;
  program:           string;
  dateOfBirth?:      string;
  gender?:           string;
  address?:          string;
  city?:             string;
  guardianName:      string;
  guardianPhone:     string;
  guardianRelation?: string;
  guardianWhatsapp?: string;
  guardianEmail?:    string;
}

const VALID_PROGRAMS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();
    if (!payload.campusId) return errorResponse("No campus assigned to your account");
    if (!payload.institutionId) return errorResponse("Institution not found in your session. Please sign out and sign in again.");

    const campusId      = payload.campusId;
    const institutionId = payload.institutionId;

    const body = await req.json();
    const rows: BulkStudent[] = body.students;

    if (!Array.isArray(rows) || rows.length === 0)
      return errorResponse("No student data provided");
    if (rows.length > 200)
      return errorResponse("Maximum 200 students per import");

    const results: { row: number; name: string; status: "success" | "error"; error?: string }[] = [];

    // ── Enrollment numbers use the SAME institution-scoped format as single-student creation
    //    (HP-{yy}-{seq}) so numbers stay consistent regardless of how a student was added. ──
    const year = new Date().getFullYear().toString().slice(-2);
    let runningCount = await prisma.student.count({ where: { campus: { institutionId } } });

    // ── Basic duplicate guard within the same file: same name + same guardian phone ──
    const seenInFile = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      // Validate
      if (!row.name?.trim()) { results.push({ row: rowNum, name: row.name || "—", status: "error", error: "Name is required" }); continue; }
      if (!row.guardianName?.trim()) { results.push({ row: rowNum, name: row.name, status: "error", error: "Guardian name is required" }); continue; }
      if (!row.guardianPhone?.trim()) { results.push({ row: rowNum, name: row.name, status: "error", error: "Guardian phone is required" }); continue; }
      const program = row.program?.toUpperCase().trim();
      if (!VALID_PROGRAMS.includes(program)) { results.push({ row: rowNum, name: row.name, status: "error", error: `Invalid program "${row.program}". Use: HIFZ, NAZRA, TAJWEED, GIRDAAN` }); continue; }

      const dupKey = `${row.name.trim().toLowerCase()}|${row.guardianPhone.trim()}`;
      if (seenInFile.has(dupKey)) {
        results.push({ row: rowNum, name: row.name, status: "error", error: "Duplicate row: same student name + guardian phone already appears earlier in this file" });
        continue;
      }
      seenInFile.add(dupKey);

      try {
        runningCount += 1;
        const enrollmentNumber = `HP-${year}-${String(runningCount).padStart(4, "0")}`;
        const guardianPhone    = row.guardianPhone.trim();
        const guardianWhatsapp = row.guardianWhatsapp?.trim() || guardianPhone;

        await prisma.$transaction(async (tx) => {
          const student = await tx.student.create({
            data: {
              campusId,
              name:             row.name.trim(),
              nameArabic:       row.nameArabic?.trim() || null,
              program:          program as any,
              enrollmentNumber,
              dateOfBirth:      row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
              gender:           row.gender?.trim()  || "MALE",
              address:          row.address?.trim() || null,
              city:             row.city?.trim()     || null,
              status:           "ACTIVE",
              startingJuz:      1,
            },
          });

          const guardian = await tx.guardian.create({
            data: {
              studentId:      student.id,
              name:           row.guardianName.trim(),
              phone:          guardianPhone,
              whatsapp:       guardianWhatsapp,
              email:          row.guardianEmail?.trim() || null,
              relation:       row.guardianRelation?.trim() || "Father",
              receiveUpdates: true,
              isEmergency:    true,
            },
          });

          // ── Same defaults as single-student creation, so bulk-imported students
          //    behave identically everywhere else in the app (progress dashboards,
          //    health scoring, Sabaq entry, parent portal). ──
          await tx.studentProgress.create({
            data: {
              studentId:         student.id,
              currentJuz:        1,
              totalJuzMemorized: 0,
              percentComplete:   0,
            },
          });

          await tx.manzilHealth.create({
            data: { studentId: student.id, score: 100 },
          });

          // ── Create parent portal login, same as single-student creation ──
          const existingUser = await tx.user.findFirst({
            where: { OR: [{ phone: guardianWhatsapp }, { whatsapp: guardianWhatsapp }] },
          });
          if (!existingUser) {
            const parentUser = await tx.user.create({
              data: {
                institutionId,
                campusId,
                role:     "PARENT",
                name:     row.guardianName.trim(),
                phone:    guardianWhatsapp,
                whatsapp: guardianWhatsapp,
              },
            });
            await tx.parent.create({
              data: { userId: parentUser.id, guardianId: guardian.id },
            });
          }
        });

        results.push({ row: rowNum, name: row.name, status: "success" });
      } catch (e: any) {
        results.push({ row: rowNum, name: row.name, status: "error", error: e?.code === "P2002" ? "Duplicate enrollment number — please retry" : e.message });
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
