// app/api/admin/notification-preferences/route.ts
// GET  -> institution's notification preferences (creates default row if none)
// POST -> update preferences
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

function getAuth(req: NextRequest): { institutionId: string; role: string } | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return null;
  if (!payload.institutionId) return null;
  return { institutionId: payload.institutionId as string, role: payload.role };
}

const DEFAULTS = {
  sendOnSabaq: true,
  sendOnAbsence: true,
  sendOnTest: true,
  sendHealthAlert: true,
  sendWeekly: true,
  sendWelcome: true,
  language: "ur",
};

export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) return unauthorizedResponse();

    let prefs = await prisma.notificationPreferences.findUnique({
      where: { institutionId: auth.institutionId },
    });

    // Create default row on first access
    if (!prefs) {
      prefs = await prisma.notificationPreferences.create({
        data: { institutionId: auth.institutionId, ...DEFAULTS },
      });
    }

    return successResponse({ preferences: prefs });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body");

    const data: Record<string, any> = {};
    const boolFields = ["sendOnSabaq","sendOnAbsence","sendOnTest","sendHealthAlert","sendWeekly","sendWelcome"];
    for (const f of boolFields) {
      if (typeof body[f] === "boolean") data[f] = body[f];
    }
    if (body.language === "ur" || body.language === "en") {
      data.language = body.language;
    }

    const prefs = await prisma.notificationPreferences.upsert({
      where: { institutionId: auth.institutionId },
      create: { institutionId: auth.institutionId, ...DEFAULTS, ...data },
      update: data,
    });

    return successResponse({ preferences: prefs });
  } catch (error) {
    console.error("Save notification preferences error:", error);
    return serverErrorResponse();
  }
}
