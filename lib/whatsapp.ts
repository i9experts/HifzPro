// ============================================================
// lib/whatsapp.ts
// HifzPro multi-tenant WhatsApp sender
// Resolves provider + credentials PER INSTITUTION, with fallback
// to global env vars (your existing single-number UltraMsg setup).
//
// Providers:
//   - "ultramsg" : UltraMsg instance (QR-linked, per-institute number)
//   - "meta"     : Meta WhatsApp Cloud API (Tech Provider / v2 path)
//
// Env fallbacks (legacy global config — keep your existing vars):
//   WHATSAPP_PROVIDER=ultramsg
//   ULTRAMSG_INSTANCE_ID=instanceXXXXX
//   ULTRAMSG_TOKEN=xxxxxxxx
//   META_WA_PHONE_NUMBER_ID=...
//   META_WA_ACCESS_TOKEN=...
// ============================================================

import prisma from "@/lib/prisma";

// ---------- Types ----------

export type WhatsAppProvider = "ultramsg" | "meta";

export interface ResolvedWhatsAppConfig {
  provider: WhatsAppProvider;
  // UltraMsg
  instanceId?: string;
  apiToken?: string;
  // Meta
  phoneNumberId?: string;
  accessToken?: string;
  // Meta source: "tenant" config row or "env" fallback
  source: "tenant" | "env";
}

export interface SendResult {
  ok: boolean;
  provider: WhatsAppProvider;
  providerMessageId?: string;
  error?: string;
}

// ---------- Phone normalization (Pakistan-aware) ----------

/**
 * Normalizes a phone number to international digits-only format.
 *  "0300-1234567"   -> "923001234567"
 *  "+92 300 1234567"-> "923001234567"
 *  "3001234567"     -> "923001234567"
 *  "923001234567"   -> "923001234567"
 * Non-PK numbers with country code pass through unchanged.
 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);

  // Pakistani local formats
  if (digits.startsWith("0") && digits.length === 11) {
    // 0300xxxxxxx -> 92300xxxxxxx
    digits = "92" + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith("3")) {
    // 300xxxxxxx -> 92300xxxxxxx
    digits = "92" + digits;
  }

  return digits;
}

// ---------- Config resolution ----------

/**
 * Resolves the WhatsApp config for an institution.
 * Priority:
 *   1. Per-institution WhatsAppConfig row (status = "connected")
 *   2. Global env vars (legacy single-number setup)
 * Returns null if nothing usable is configured.
 */
export async function resolveWhatsAppConfig(
  institutionId: string | null
): Promise<ResolvedWhatsAppConfig | null> {
  if (institutionId) {
    const cfg = await prisma.whatsAppConfig.findUnique({
      where: { institutionId },
    });

    if (cfg && cfg.status === "connected") {
      if (cfg.provider === "ultramsg" && cfg.instanceId && cfg.apiToken) {
        return {
          provider: "ultramsg",
          instanceId: cfg.instanceId,
          apiToken: cfg.apiToken,
          source: "tenant",
        };
      }
      if (cfg.provider === "meta" && cfg.phoneNumberId && cfg.apiToken) {
        return {
          provider: "meta",
          phoneNumberId: cfg.phoneNumberId,
          accessToken: cfg.apiToken,
          source: "tenant",
        };
      }
    }
  }

  // ----- Env fallback (your current global setup) -----
  const envProvider = (process.env.WHATSAPP_PROVIDER || "").toLowerCase();

  if (
    envProvider === "ultramsg" &&
    process.env.ULTRAMSG_INSTANCE_ID &&
    process.env.ULTRAMSG_TOKEN
  ) {
    return {
      provider: "ultramsg",
      instanceId: process.env.ULTRAMSG_INSTANCE_ID,
      apiToken: process.env.ULTRAMSG_TOKEN,
      source: "env",
    };
  }

  if (
    envProvider === "meta" &&
    process.env.META_WA_PHONE_NUMBER_ID &&
    process.env.META_WA_ACCESS_TOKEN
  ) {
    return {
      provider: "meta",
      phoneNumberId: process.env.META_WA_PHONE_NUMBER_ID,
      accessToken: process.env.META_WA_ACCESS_TOKEN,
      source: "env",
    };
  }

  return null;
}

// ---------- Provider: UltraMsg ----------

async function sendViaUltraMsg(
  cfg: ResolvedWhatsAppConfig,
  to: string,
  message: string
): Promise<SendResult> {
  try {
    const url = `https://api.ultramsg.com/${cfg.instanceId}/messages/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: cfg.apiToken!,
        to,
        body: message,
      }),
    });

    const data = await res.json().catch(() => ({}));

    // UltraMsg returns { sent: "true", id: ..., message: "ok" } on success
    const sent =
      data?.sent === "true" || data?.sent === true || data?.message === "ok";

    if (!res.ok || !sent) {
      return {
        ok: false,
        provider: "ultramsg",
        error:
          typeof data?.error === "string"
            ? data.error
            : JSON.stringify(data?.error ?? data) || `HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      provider: "ultramsg",
      providerMessageId: data?.id ? String(data.id) : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      provider: "ultramsg",
      error: err instanceof Error ? err.message : "UltraMsg request failed",
    };
  }
}

/** Checks an UltraMsg instance's connection status (QR linked or not). */
export async function checkUltraMsgStatus(
  instanceId: string,
  apiToken: string
): Promise<{ connected: boolean; raw?: unknown; error?: string }> {
  try {
    const url = `https://api.ultramsg.com/${instanceId}/instance/status?token=${encodeURIComponent(
      apiToken
    )}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));

    // Connected instances report status.accountStatus.status === "authenticated"
    const status =
      data?.status?.accountStatus?.status ?? data?.status ?? data?.accountStatus;

    return {
      connected: status === "authenticated" || status === "connected",
      raw: data,
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Status check failed",
    };
  }
}

// ---------- Provider: Meta Cloud API ----------

const META_GRAPH_VERSION = "v21.0";

async function sendViaMeta(
  cfg: ResolvedWhatsAppConfig,
  to: string,
  message: string
): Promise<SendResult> {
  try {
    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${cfg.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        provider: "meta",
        error:
          data?.error?.message ||
          `Meta API HTTP ${res.status}: ${JSON.stringify(data)}`,
      };
    }

    return {
      ok: true,
      provider: "meta",
      providerMessageId: data?.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      ok: false,
      provider: "meta",
      error: err instanceof Error ? err.message : "Meta request failed",
    };
  }
}

/**
 * Sends a Meta TEMPLATE message (required for business-initiated messages
 * outside the 24h service window). Free-form text (sendViaMeta) only works
 * inside an open service window.
 */
export async function sendMetaTemplate(opts: {
  institutionId: string | null;
  to: string;
  templateName: string;
  languageCode?: string; // e.g. "en", "ur"
  bodyParams?: string[]; // {{1}}, {{2}}, ...
}): Promise<SendResult> {
  const cfg = await resolveWhatsAppConfig(opts.institutionId);
  if (!cfg || cfg.provider !== "meta") {
    return {
      ok: false,
      provider: "meta",
      error: "No Meta WhatsApp config for this institution",
    };
  }

  try {
    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${cfg.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(opts.to),
        type: "template",
        template: {
          name: opts.templateName,
          language: { code: opts.languageCode || "en" },
          components: opts.bodyParams?.length
            ? [
                {
                  type: "body",
                  parameters: opts.bodyParams.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ]
            : undefined,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        provider: "meta",
        error: data?.error?.message || `Meta API HTTP ${res.status}`,
      };
    }
    return {
      ok: true,
      provider: "meta",
      providerMessageId: data?.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      ok: false,
      provider: "meta",
      error: err instanceof Error ? err.message : "Meta template send failed",
    };
  }
}

// ---------- Public API ----------

/**
 * Main entry point. Use this everywhere in the app.
 *
 *   await sendWhatsApp({
 *     institutionId: token.institutionId, // or null for global fallback
 *     to: parent.phone,
 *     message: "Assalamualaikum! ...",
 *   });
 */
export async function sendWhatsApp(opts: {
  institutionId: string | null;
  to: string;
  message: string;
}): Promise<SendResult> {
  const cfg = await resolveWhatsAppConfig(opts.institutionId);

  if (!cfg) {
    return {
      ok: false,
      provider: "ultramsg",
      error:
        "WhatsApp is not configured for this institution. Connect a number in Settings → WhatsApp.",
    };
  }

  const to = normalizePhone(opts.to);
  if (to.length < 11) {
    return { ok: false, provider: cfg.provider, error: `Invalid phone number: ${opts.to}` };
  }

  if (cfg.provider === "meta") {
    return sendViaMeta(cfg, to, opts.message);
  }
  return sendViaUltraMsg(cfg, to, opts.message);
}

/**
 * Bulk helper with gentle pacing (avoids UltraMsg flooding / bans).
 * Sends sequentially with a small delay; returns per-recipient results.
 */
export async function sendWhatsAppBulk(opts: {
  institutionId: string | null;
  recipients: { to: string; message: string }[];
  delayMs?: number; // default 1500ms between messages
}): Promise<{ to: string; result: SendResult }[]> {
  const results: { to: string; result: SendResult }[] = [];
  const delay = opts.delayMs ?? 1500;

  for (const r of opts.recipients) {
    const result = await sendWhatsApp({
      institutionId: opts.institutionId,
      to: r.to,
      message: r.message,
    });
    results.push({ to: r.to, result });
    if (delay > 0) await new Promise((res) => setTimeout(res, delay));
  }
  return results;
}
