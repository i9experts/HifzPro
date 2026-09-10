// ============================================================
// lib/email.ts
// HifzPro email sender (Resend) — mirrors lib/whatsapp.ts's
// "resolve config, send, never throw" pattern so callers can
// fire-and-forget alongside sendWhatsApp().
//
// Env:
//   RESEND_API_KEY=re_xxxxxxxx
//   EMAIL_FROM="HifzPro <onboarding@resend.dev>"   (defaults to
//     Resend's shared test domain, which needs no verification —
//     switch to a verified domain address before relying on this
//     for real deliverability/inbox placement.)
// ============================================================

import { Resend } from "resend";

export interface EmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

let client: Resend | null = null;
function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

/**
 * Main entry point. Use this everywhere in the app, the same way
 * sendWhatsApp() is used — as a non-blocking, best-effort channel:
 *
 *   sendEmail({ to: user.email, subject: "...", html: "..." })
 *     .catch(e => console.error("[email] failed:", e));
 *
 * Never throws. If RESEND_API_KEY isn't set, logs a warning and
 * resolves with { ok: false } instead of crashing the caller.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  const resend = getClient();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not configured — skipping email to",
      opts.to
    );
    return { ok: false, error: "Email is not configured (RESEND_API_KEY missing)." };
  }

  const from = process.env.EMAIL_FROM || "HifzPro <onboarding@resend.dev>";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    if (error) {
      return { ok: false, error: error.message || "Resend API error" };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}

/**
 * Branded HTML for "here are your HifzPro login details" emails —
 * shared by signup, Ustadh credential (re)send, and donor invite.
 */
export function renderCredentialsEmail(opts: {
  recipientName: string;
  roleLabel: string; // e.g. "Campus Admin", "Ustadh", "Donor"
  institutionName?: string;
  loginUrl: string;
  email: string;
  password: string;
  note?: string; // extra line, e.g. trial info
}): string {
  const { recipientName, roleLabel, institutionName, loginUrl, email, password, note } = opts;
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAFAF8;font-family:'DM Sans',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E4E4E0;">
          <tr><td style="background:#0D5C3A;padding:28px 32px;">
            <div style="font-family:'Outfit',Arial,sans-serif;font-size:20px;font-weight:700;color:#FFFFFF;">HifzPro</div>
            <div style="font-family:monospace;font-size:10px;letter-spacing:2px;color:#C4882A;margin-top:2px;">MEMORIZE · PROTECT · EXCEL</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="font-family:'Outfit',Arial,sans-serif;font-size:18px;font-weight:700;color:#1E1E1C;margin:0 0 12px;">
              Assalamu Alaikum, ${escapeHtml(recipientName)}
            </p>
            <p style="font-size:14px;color:#525250;line-height:1.7;margin:0 0 20px;">
              Your ${escapeHtml(roleLabel)} account${institutionName ? ` at <strong>${escapeHtml(institutionName)}</strong>` : ""} is ready. Here are your login details:
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:10px;border:1px solid #E4E4E0;">
              <tr><td style="padding:16px 20px;">
                <div style="font-family:monospace;font-size:9px;letter-spacing:1px;color:#737370;">WEBSITE</div>
                <div style="font-size:13px;font-weight:600;color:#1E1E1C;margin-bottom:10px;">${escapeHtml(loginUrl)}</div>
                <div style="font-family:monospace;font-size:9px;letter-spacing:1px;color:#737370;">EMAIL</div>
                <div style="font-size:13px;font-weight:600;color:#1E1E1C;margin-bottom:10px;">${escapeHtml(email)}</div>
                <div style="font-family:monospace;font-size:9px;letter-spacing:1px;color:#737370;">PASSWORD</div>
                <div style="font-family:monospace;font-size:14px;font-weight:700;color:#0D5C3A;">${escapeHtml(password)}</div>
              </td></tr>
            </table>
            ${note ? `<p style="font-size:12px;color:#737370;margin:16px 0 0;">${escapeHtml(note)}</p>` : ""}
            <div style="text-align:center;margin-top:24px;">
              <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:12px 28px;background:#C4882A;color:#FFFFFF;text-decoration:none;border-radius:10px;font-family:'Outfit',Arial,sans-serif;font-size:13px;font-weight:700;">
                Sign In →
              </a>
            </div>
            <p style="font-size:11px;color:#A5A5A0;margin:24px 0 0;text-align:center;">
              Please change your password after your first login.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
