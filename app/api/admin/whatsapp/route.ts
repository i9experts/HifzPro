// ============================================================
// app/api/admin/whatsapp/route.ts
// GET  -> current institution's WhatsApp config (token masked)
// POST -> save/update config, verify connection, set status
//
// ⚠️ ADJUST THE AUTH BLOCK to match your existing admin routes.
// I've used a typical pattern from your codebase (JWT cookie ->
// TokenPayload with institutionId). Replace getAuth() with your
// actual helper (e.g. verifyToken / getSession / getCampusId flow).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkUltraMsgStatus, normalizePhone } from "@/lib/whatsapp";

// ---- Replace with your real auth helper ----
import { verifyAuth } from "@/lib/auth"; // <- adjust import
async function getAuth(req: NextRequest) {
  // Must return { institutionId: string, role: string } or null
  return verifyAuth(req); // <- adjust call
}
// --------------------------------------------

function maskToken(token: string | null): string | null {
  if (!token) return null;
  if (token.length <= 8) return "••••••";
  return token.slice(0, 4) + "••••••••" + token.slice(-4);
}

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth?.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = await prisma.whatsAppConfig.findUnique({
    where: { institutionId: auth.institutionId },
  });

  if (!cfg) {
    return NextResponse.json({ config: null });
  }

  return NextResponse.json({
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
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth?.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const provider = body.provider === "meta" ? "meta" : "ultramsg";
  const displayNumber = String(body.displayNumber || "").trim();

  if (!displayNumber) {
    return NextResponse.json(
      { error: "Display number is required" },
      { status: 400 }
    );
  }

  // Load existing config so a masked token (unchanged) isn't overwritten
  const existing = await prisma.whatsAppConfig.findUnique({
    where: { institutionId: auth.institutionId },
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
      return NextResponse.json(
        { error: "UltraMsg Instance ID and Token are required" },
        { status: 400 }
      );
    }
    // Verify the instance is QR-linked before marking connected
    const check = await checkUltraMsgStatus(instanceId, apiToken);
    if (check.connected) {
      status = "connected";
    } else {
      status = "pending";
      verifyError =
        check.error ||
        "Instance is not authenticated yet. Scan the QR code in your UltraMsg dashboard with the institute's WhatsApp number, then save again.";
    }
  } else {
    phoneNumberId = String(body.phoneNumberId || "").trim() || null;
    wabaId = String(body.wabaId || "").trim() || null;
    if (!phoneNumberId || !apiToken) {
      return NextResponse.json(
        { error: "Meta Phone Number ID and Access Token are required" },
        { status: 400 }
      );
    }
    // Light verification: fetch the phone number object from Graph API
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

  const saved = await prisma.whatsAppConfig.upsert({
    where: { institutionId: auth.institutionId },
    create: {
      institutionId: auth.institutionId,
      provider,
      instanceId,
      apiToken,
      phoneNumberId,
      wabaId,
      displayNumber: normalizePhone(displayNumber)
        ? "+" + normalizePhone(displayNumber)
        : displayNumber,
      status,
    },
    update: {
      provider,
      instanceId,
      apiToken,
      phoneNumberId,
      wabaId,
      displayNumber: normalizePhone(displayNumber)
        ? "+" + normalizePhone(displayNumber)
        : displayNumber,
      status,
    },
  });

  return NextResponse.json({
    ok: true,
    status: saved.status,
    verifyError,
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth?.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.whatsAppConfig
    .delete({ where: { institutionId: auth.institutionId } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
