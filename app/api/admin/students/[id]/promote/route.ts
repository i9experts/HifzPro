// app/api/admin/students/[id]/promote/route.ts
// Promote/transfer a student between programs (Nazrah / Hifz / Girdaan / Tajweed).
// Changing `program` alone preserves every existing record — lesson entries,
// attendance, tests, Manzil Health, guardians, fees, Qaida progress — since
// they're all keyed by studentId, not by program. The only program-scoped
// field is batchId (a Batch belongs to exactly one program), so a promotion
// either moves the student into a batch of the new program or unassigns them.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { canAccessCampus } from "@/lib/tenant-guard";

type Params = { params: Promise<{ id: string }> };

const PROGRAM_LABELS: Record<string, string> = { HIFZ: "Hifz ul Quran", NAZRA: "Nazrah", TAJWEED: "Tajweed", GIRDAAN: "Girdaan" };

const schema = z.object({
  program: z.enum(["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"]),
  batchId: z.string().optional().nullable(),
  reason:  z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const { program: targetProgram, batchId, reason } = result.data;

    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, name: true, program: true, campusId: true, campus: { select: { institutionId: true } }, notes: true },
    });
    if (!student) return notFoundResponse("Student not found");
    if (!canAccessCampus(payload, student.campusId, student.campus?.institutionId)) {
      return notFoundResponse("Student not found");
    }

    if (targetProgram === student.program && !batchId) {
      return errorResponse("Student is already in this program. Choose a different program to promote/transfer.");
    }

    if (batchId) {
      const batch = await prisma.batch.findUnique({ where: { id: batchId }, select: { campusId: true, program: true } });
      if (!batch || batch.campusId !== student.campusId) return errorResponse("Selected Halqa was not found for this campus");
      if (batch.program !== targetProgram) return errorResponse(`Selected Halqa is a ${PROGRAM_LABELS[batch.program]} batch, not ${PROGRAM_LABELS[targetProgram]}`);
    }

    const fromLabel = PROGRAM_LABELS[student.program] || student.program;
    const toLabel   = PROGRAM_LABELS[targetProgram] || targetProgram;
    const stamp = new Date().toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
    const historyLine = `[${stamp}] Promoted from ${fromLabel} to ${toLabel}${reason ? ` — ${reason}` : ""}`;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        program: targetProgram,
        // A batch is scoped to one program — moving programs without an
        // explicit target batch unassigns the student rather than leaving
        // them in a now-mismatched batch.
        batchId: batchId || null,
        notes: student.notes ? `${student.notes}\n${historyLine}` : historyLine,
      },
      include: { batch: { select: { name: true } } },
    });

    return successResponse({
      student: { id: updated.id, name: updated.name, program: updated.program, batchName: updated.batch?.name ?? null },
      message: `${updated.name} promoted from ${fromLabel} to ${toLabel}`,
    });
  } catch (error) {
    console.error("Promote student error:", error);
    return serverErrorResponse();
  }
}
