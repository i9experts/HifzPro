// app/api/admin/sanads/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const createSchema = z.object({
  studentId:       z.string(),
  program:         z.enum(["HIFZ","NAZRA","TAJWEED","GIRDAAN"]),
  issuedAt:        z.string().optional(),
  // Certificate content
  silsila:         z.string().optional(),
  customText:      z.string().optional(),
  examinerName:    z.string().optional(),
  principalName:   z.string().optional(),
  hijriDate:       z.string().optional(),
  // Design
  template:        z.enum(["CLASSIC","MODERN","TRADITIONAL"]).default("CLASSIC"),
  language:        z.enum(["ARABIC","ENGLISH","BILINGUAL","URDU"]).default("BILINGUAL"),
  colorTheme:      z.string().default("#0D5C3A"),
  orientation:     z.enum(["PORTRAIT","LANDSCAPE"]).default("PORTRAIT"),
  includeSilsila:  z.boolean().default(true),
  includeQR:       z.boolean().default(true),
  borderStyle:     z.enum(["ORNATE","SIMPLE","MODERN","NONE"]).default("ORNATE"),
  // Meta
  notes:           z.string().optional(),
});

function generateSanadNumber(program: string, count: number): string {
  const prefixes: Record<string,string> = {
    HIFZ: "HQ", NAZRA: "NZ", TAJWEED: "TJ", GIRDAAN: "GD",
  };
  const year   = new Date().getFullYear().toString().slice(-2);
  const prefix = prefixes[program] || "SN";
  return `${prefix}-${year}-${String(count + 1).padStart(5, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const program   = searchParams.get("program") || "";
    const studentId = searchParams.get("studentId") || "";

    const where: any = {};
    if (payload.campusId) where.student = { campusId: payload.campusId };
    if (program)          where.program  = program;
    if (studentId)        where.studentId= studentId;

    const sanads = await prisma.sanad.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      include: {
        student: {
          select: {
            id: true, name: true, nameArabic: true, enrollmentNumber: true,
            photo: true, program: true,
            batch: { select: { name: true, ustadh: { include: { user: { select: { name: true } } } } } },
            campus: { include: { institution: true } },
          },
        },
      },
    });

    const stats = {
      total:    sanads.length,
      hifz:     sanads.filter(s => s.program === "HIFZ").length,
      nazra:    sanads.filter(s => s.program === "NAZRA").length,
      tajweed:  sanads.filter(s => s.program === "TAJWEED").length,
      girdaan:  sanads.filter(s => s.program === "GIRDAAN").length,
    };

    return successResponse({ sanads, stats });
  } catch (error) {
    console.error("Get sanads error:", error);
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
    const result = createSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Get student + institution info
    const student = await prisma.student.findUnique({
      where:   { id: data.studentId },
      include: {
        campus:   { include: { institution: true } },
        batch:    { include: { ustadh: { include: { user: { select: { name: true } } } } } },
        progress: true,
      },
    });
    if (!student) return errorResponse("Student not found");

    // Generate unique sanad number
    const count = await prisma.sanad.count({ where: { program: data.program } });
    const sanadNumber = generateSanadNumber(data.program, count);

    // Default Silsila for Hifz
    const defaultSilsila = data.silsila || (data.program === "HIFZ"
      ? `${student.name} ← ${student.batch?.ustadh?.user?.name || "Ustadh"} ← [Ustadh's Ustadh] ← ... ← النبي محمد ﷺ ← جبريل عليه السلام ← الله سبحانه وتعالى`
      : undefined);

    // QR verification URL
    const qrUrl = `${process.env.NEXTAUTH_URL || "https://www.hifzpro.com"}/certificates/${sanadNumber}`;

    // Build sanad metadata to store in notes field as JSON
    const metadata = JSON.stringify({
      template:       data.template,
      language:       data.language,
      colorTheme:     data.colorTheme,
      orientation:    data.orientation,
      includeSilsila: data.includeSilsila,
      includeQR:      data.includeQR,
      borderStyle:    data.borderStyle,
      examinerName:   data.examinerName || student.batch?.ustadh?.user?.name,
      principalName:  data.principalName,
      hijriDate:      data.hijriDate,
      customText:     data.customText,
      instituteName:  student.campus?.institution?.name,
      instituteLogo:  student.campus?.institution?.logo,
      campusName:     student.campus?.name,
      city:           student.campus?.city || student.campus?.institution?.city,
    });

    const sanad = await prisma.sanad.create({
      data: {
        studentId:    data.studentId,
        issuedById:   payload.userId,
        sanadNumber,
        program:      data.program,
        issuedAt:     data.issuedAt ? new Date(data.issuedAt) : new Date(),
        silsila:      defaultSilsila,
        qrCode:       qrUrl,
        isVerified:   true,
        pdfUrl:       null,
      },
      include: {
        student: {
          select: {
            id: true, name: true, nameArabic: true, enrollmentNumber: true,
            photo: true, program: true,
            campus: { include: { institution: true } },
            batch:  { include: { ustadh: { include: { user: { select: { name: true } } } } } },
          },
        },
      },
    });

    // Update student status to COMPLETED if Hifz
    if (data.program === "HIFZ") {
      await prisma.student.update({
        where: { id: data.studentId },
        data:  { status: "COMPLETED", actualKhatmAt: new Date() },
      });
    }

    return successResponse({
      sanad: {
        ...sanad,
        metadata: JSON.parse(metadata),
        certificateUrl: `/certificates/${sanadNumber}`,
      },
    }, 201);
  } catch (error) {
    console.error("Create sanad error:", error);
    return serverErrorResponse();
  }
}
