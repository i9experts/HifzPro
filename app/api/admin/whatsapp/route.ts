// app/api/admin/whatsapp/route.ts
// GET    -> current institution's WhatsApp config (token masked)
// POST   -> save/update config + verify connection
// DELETE -> remove config
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { checkUltraMsgStatus, normalizePhone } from "@/lib/whatsapp";

function maskToken(token: string | null): string | null {
  if (!token) return null;
  if (token.length <= 8) return "••••••";
  return token.slice(0, 4) + "••••••••" + token.slice(-4);
}

function getAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return null;
  if (!payload.institutionId) return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const payload = getAuth(req);
    if (!payload) return unauthorizedResponse();

    const cfg = await prisma.whatsAppConfig.findUnique({
      where: { institutionId: payload.institutionId },
    });

    if (!cfg) return successResponse({ config: null });

    return successResponse({
      config: {
        provider: cfg.provider,
        instanceId: cfg.instanceId,
        apiToken: maskToken(cfg.apiToken),
        phoneNumberId: cfg.phoneNumberId,
        wabaId: cfg.wabaId,
        displayNumber: cfg.displayNumber,
        status: cfg.status,
        lastTestedAt: cfg.lastTestedAt,
      },
    });
  } catch (error) {
    console.error("Get WhatsApp config error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getAuth(req);
    if (!payload) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid request body");

    const provider = body.provider === "meta" ? "meta" : "ultramsg";
    const displayNumber = String(body.displayNumber || "").trim();
    if (!displayNumber) return errorResponse("Display number is required");

    // Load existing so a masked (unchanged) token isn't overwritten
    const existing = await prisma.whatsAppConfig.findUnique({
      where: { institutionId: payload.institutionId },
    });

    const incomingToken = String(body.apiToken || "").trim();
    const tokenIsMasked = incomingToken.includes("••");
    const apiToken =
      !incomingToken || tokenIsMasked ? existing?.apiToken ?? null : incomingToken;

    let instanceId: string | null = null;
    let phoneNumberId: string | null = null;
    let wabaId: string | null = null;
    let status = "pending";
    let verifyError: string | null = null;

    if (provider === "ultramsg") {
      instanceId = String(body.instanceId || "").trim() || null;
      if (!instanceId || !apiToken) {
        return errorResponse("UltraMsg Instance ID and Token are required");
      }
      const check = await checkUltraMsgStatus(instanceId, apiToken);
      if (check.connected) {
        status = "connected";
      } else {
        verifyError =
          check.error ||
          "Instance is not authenticated yet. Scan the QR code in your UltraMsg dashboard with the institute's WhatsApp number, then save again.";
      }
    } else {
      phoneNumberId = String(body.phoneNumberId || "").trim() || null;
      wabaId = String(body.wabaId || "").trim() || null;
      if (!phoneNumberId || !apiToken) {
        return errorResponse("Meta Phone Number ID and Access Token are required");
      }
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number,verified_name`,
          { headers: { Authorization: `Bearer ${apiToken}` } }
        );
        if (res.ok) {
          status = "connected";
        } else {
          const data = await res.json().catch(() => ({}));
          verifyError =
            data?.error?.message || `Meta verification failed (HTTP ${res.status})`;
        }
      } catch {
        verifyError = "Could not reach Meta Graph API to verify credentials.";
      }
    }

    const normalized = normalizePhone(displayNumber);
    const saved = await prisma.whatsAppConfig.upsert({
      where: { institutionId: payload.institutionId },
      create: {
        institutionId: payload.institutionId,
        provider,
        instanceId,
        apiToken,
        phoneNumberId,
        wabaId,
        displayNumber: normalized ? "+" + normalized : displayNumber,
        status,
      },
      update: {
        provider,
        instanceId,
        apiToken,
        phoneNumberId,
        wabaId,
        displayNumber: normalized ? "+" + normalized : displayNumber,
        status,
      },
    });

    return successResponse({ status: saved.status, verifyError });
  } catch (error) {
    console.error("Save WhatsApp config error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = getAuth(req);
    if (!payload) return unauthorizedResponse();

    await prisma.whatsAppConfig
      .delete({ where: { institutionId: payload.institutionId } })
      .catch(() => null);

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Delete WhatsApp config error:", error);
    return serverErrorResponse();
  }
}
