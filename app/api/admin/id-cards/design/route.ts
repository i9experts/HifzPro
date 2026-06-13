// app/api/admin/id-cards/design/route.ts
// GET  -> institution's saved card design
// POST -> save/update card design
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken, TokenPayload } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

type AuthPayload = Omit<TokenPayload, "institutionId"> & { institutionId: string };

function getAuth(req: NextRequest): AuthPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return null;
  if (!payload.institutionId) return null;
  return { ...payload, institutionId: payload.institutionId };
}

export async function GET(req: NextRequest) {
  try {
    const payload = getAuth(req);
    if (!payload) return unauthorizedResponse();

    const design = await prisma.cardDesign.findUnique({
      where: { institutionId: payload.institutionId },
    });

    return successResponse({ design });
  } catch (error) {
    console.error("Get card design error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getAuth(req);
    if (!payload) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body");

    const design = await prisma.cardDesign.upsert({
      where: { institutionId: payload.institutionId },
      create: {
        institutionId: payload.institutionId,
        primaryColor:  body.primaryColor  ?? "#0D5C3A",
        accentColor:   body.accentColor   ?? "#C4882A",
        logoUrl:       body.logoUrl       ?? null,
        bgType:        body.bgType        ?? "gradient",
        bgValue:       body.bgValue       ?? "#0D5C3A",
        fontStyle:     body.fontStyle     ?? "classic",
        instituteName: body.instituteName ?? "",
        tagline:       body.tagline       ?? null,
        address:       body.address       ?? null,
        footerText:    body.footerText    ?? null,
        parentAppUrl:  body.parentAppUrl  ?? "https://hifzpro.com/parent-app",
        ustadhAppUrl:  body.ustadhAppUrl  ?? "https://hifzpro.com/ustadh-app",
        visibleFields: body.visibleFields
          ? JSON.stringify(body.visibleFields)
          : '["guardian","batch","program","bloodGroup"]',
      },
      update: {
        primaryColor:  body.primaryColor,
        accentColor:   body.accentColor,
        logoUrl:       body.logoUrl,
        bgType:        body.bgType,
        bgValue:       body.bgValue,
        fontStyle:     body.fontStyle,
        instituteName: body.instituteName,
        tagline:       body.tagline,
        address:       body.address,
        footerText:    body.footerText,
        parentAppUrl:  body.parentAppUrl,
        ustadhAppUrl:  body.ustadhAppUrl,
        visibleFields: body.visibleFields
          ? JSON.stringify(body.visibleFields)
          : undefined,
      },
    });

    return successResponse({ design });
  } catch (error) {
    console.error("Save card design error:", error);
    return serverErrorResponse();
  }
}
