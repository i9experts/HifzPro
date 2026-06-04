// lib/whatsapp.ts
// HifzPro WhatsApp Integration Service
// Supports: UltraMsg (primary), WATI, Meta Business API

export interface WhatsAppMessage {
  to:      string;   // Phone number with country code e.g. +923001234567
  body:    string;   // Message text
  type?:   "text" | "template";
}

export interface WhatsAppResult {
  success:  boolean;
  messageId?: string;
  error?:   string;
  provider: string;
}

// ── Normalize phone number ──
export function normalizePhone(phone: string): string {
  let p = phone.replace(/\s+/g, "").replace(/[()-]/g, "");
  if (p.startsWith("0"))  p = "+92" + p.slice(1);
  if (p.startsWith("92")) p = "+"  + p;
  if (!p.startsWith("+")) p = "+"  + p;
  return p;
}

// ── Send via UltraMsg ──
async function sendUltraMsg(to: string, body: string): Promise<WhatsAppResult> {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token      = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    console.log("[WhatsApp Dev Mode] To:", to);
    console.log("[WhatsApp Dev Mode] Message:", body);
    return { success: true, messageId: "dev_" + Date.now(), provider: "dev_mode" };
  }

  try {
    const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token,
        to:   normalizePhone(to),
        body,
        priority: "10",
      }),
    });

    const data = await res.json();

    if (data.sent === "true" || data.id) {
      return { success: true, messageId: String(data.id || data.sent), provider: "ultramsg" };
    }
    return { success: false, error: data.error || "Send failed", provider: "ultramsg" };
  } catch (error: any) {
    return { success: false, error: error.message, provider: "ultramsg" };
  }
}

// ── Send via WATI ──
async function sendWATI(to: string, body: string): Promise<WhatsAppResult> {
  const apiKey   = process.env.WATI_API_KEY;
  const endpoint = process.env.WATI_ENDPOINT; // e.g. https://live-mt-server.wati.io/12345

  if (!apiKey || !endpoint) {
    return { success: false, error: "WATI not configured", provider: "wati" };
  }

  try {
    const phone = normalizePhone(to).replace("+", "");
    const res   = await fetch(`${endpoint}/api/v1/sendSessionMessage/${phone}`, {
      method:  "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ messageText: body }),
    });
    const data = await res.json();
    return data.result
      ? { success: true, messageId: data.id, provider: "wati" }
      : { success: false, error: data.info, provider: "wati" };
  } catch (error: any) {
    return { success: false, error: error.message, provider: "wati" };
  }
}

// ── Main send function ──
export async function sendWhatsApp(to: string, body: string): Promise<WhatsAppResult> {
  if (process.env.WHATSAPP_ENABLED !== "true") {
    console.log("[WhatsApp DISABLED] Would send to:", to);
    return { success: true, messageId: "disabled", provider: "disabled" };
  }

  const provider = process.env.WHATSAPP_PROVIDER || "ultramsg";

  switch (provider) {
    case "wati":     return sendWATI(to, body);
    case "ultramsg":
    default:         return sendUltraMsg(to, body);
  }
}

// ── Bulk send ──
export async function sendWhatsAppBulk(
  messages: { to: string; body: string }[],
  delayMs = 500
): Promise<WhatsAppResult[]> {
  const results: WhatsAppResult[] = [];
  for (const msg of messages) {
    const result = await sendWhatsApp(msg.to, msg.body);
    results.push(result);
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  }
  return results;
}
