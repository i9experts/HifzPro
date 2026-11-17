// ============================================================
// lib/marketplace-notify.ts
// Best-effort email + WhatsApp notifications for marketplace events
// (new inquiry, new message, booking proposal, payment confirmed).
// Marketplace users always have institutionId: null (signup/parent and
// signup/teacher routes), so sendWhatsApp() falls back to the global
// env-configured WhatsApp number — there is no per-tenant config to
// resolve here. Every call is wrapped so a notification failure never
// surfaces as a failure of the API route that triggered it.
// ============================================================

import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";

export interface NotifyRecipient {
  name: string;
  email: string | null;
  whatsapp: string | null;
}

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, max = 160): string {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > max ? flat.slice(0, max - 1) + "…" : flat;
}

function renderEmail(opts: { heading: string; bodyHtml: string; ctaUrl: string; ctaLabel: string }): string {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAFAF8;font-family:'DM Sans',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E4E4E0;">
          <tr><td style="background:#0D5C3A;padding:24px 32px;">
            <div style="font-family:'Outfit',Arial,sans-serif;font-size:18px;font-weight:700;color:#FFFFFF;">HifzPro Marketplace</div>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="font-family:'Outfit',Arial,sans-serif;font-size:17px;font-weight:700;color:#1E1E1C;margin:0 0 14px;">
              ${escapeHtml(opts.heading)}
            </p>
            <div style="font-size:14px;color:#525250;line-height:1.7;">${opts.bodyHtml}</div>
            <div style="text-align:center;margin-top:24px;">
              <a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;padding:12px 28px;background:#C4882A;color:#FFFFFF;text-decoration:none;border-radius:10px;font-family:'Outfit',Arial,sans-serif;font-size:13px;font-weight:700;">
                ${escapeHtml(opts.ctaLabel)} →
              </a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/** Fires email + WhatsApp in parallel, best-effort — never throws. */
async function notify(recipient: NotifyRecipient, opts: { subject: string; html: string; waMessage: string }): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  if (recipient.email) {
    tasks.push(
      sendEmail({ to: recipient.email, subject: opts.subject, html: opts.html })
        .catch((err) => console.error("[marketplace-notify] email failed:", err))
    );
  }
  if (recipient.whatsapp) {
    tasks.push(
      sendWhatsApp({ institutionId: null, to: recipient.whatsapp, message: opts.waMessage })
        .catch((err) => console.error("[marketplace-notify] whatsapp failed:", err))
    );
  }
  if (tasks.length === 0) return;
  await Promise.allSettled(tasks);
}

export async function notifyNewInquiry(
  recipient: NotifyRecipient,
  opts: { senderName: string; preview: string; inquiryUrl: string }
): Promise<void> {
  const preview = truncate(opts.preview);
  await notify(recipient, {
    subject: `New inquiry from ${opts.senderName} on HifzPro Marketplace`,
    html: renderEmail({
      heading: `Assalamu Alaikum, ${opts.senderName} just messaged you`,
      bodyHtml: `A parent has reached out about lessons:<br><br><em>"${escapeHtml(preview)}"</em>`,
      ctaUrl: opts.inquiryUrl,
      ctaLabel: "Reply now",
    }),
    waMessage: `🕌 New inquiry on HifzPro Marketplace\n\n${opts.senderName} wrote:\n"${preview}"\n\nReply here: ${opts.inquiryUrl}`,
  });
}

export async function notifyNewMessage(
  recipient: NotifyRecipient,
  opts: { senderName: string; preview: string; inquiryUrl: string }
): Promise<void> {
  const preview = truncate(opts.preview);
  await notify(recipient, {
    subject: `${opts.senderName} sent you a message on HifzPro Marketplace`,
    html: renderEmail({
      heading: `New message from ${opts.senderName}`,
      bodyHtml: `<em>"${escapeHtml(preview)}"</em>`,
      ctaUrl: opts.inquiryUrl,
      ctaLabel: "View conversation",
    }),
    waMessage: `💬 New message on HifzPro Marketplace\n\n${opts.senderName} wrote:\n"${preview}"\n\nReply here: ${opts.inquiryUrl}`,
  });
}

export async function notifyBookingProposed(
  recipient: NotifyRecipient,
  opts: { proposerName: string; dayLabel: string; startTime: string; endTime: string; timezone: string; inquiryUrl: string }
): Promise<void> {
  const when = `${opts.dayLabel} ${opts.startTime}–${opts.endTime} (${opts.timezone})`;
  await notify(recipient, {
    subject: `${opts.proposerName} proposed a lesson time on HifzPro Marketplace`,
    html: renderEmail({
      heading: `${opts.proposerName} proposed a lesson time`,
      bodyHtml: `<strong>${escapeHtml(when)}</strong><br><br>Open the conversation to accept or decline.`,
      ctaUrl: opts.inquiryUrl,
      ctaLabel: "Respond now",
    }),
    waMessage: `📅 Lesson time proposed on HifzPro Marketplace\n\n${opts.proposerName} proposed:\n${when}\n\nRespond here: ${opts.inquiryUrl}`,
  });
}

export async function notifyPaymentConfirmed(
  recipient: NotifyRecipient,
  opts: { otherPartyName: string; dayLabel: string; startTime: string; endTime: string; amount?: number | null; currency?: string | null; inquiryUrl: string; forTeacher: boolean }
): Promise<void> {
  const when = `${opts.dayLabel} ${opts.startTime}–${opts.endTime}`;
  const amountLine = opts.amount != null && opts.currency ? ` for ${opts.currency} ${opts.amount}` : "";
  const heading = opts.forTeacher
    ? `Payment confirmed — ${opts.otherPartyName} has paid`
    : `Payment confirmed — your lesson is booked`;
  const body = opts.forTeacher
    ? `${opts.otherPartyName} has paid${amountLine} for your lesson on <strong>${escapeHtml(when)}</strong>. The booking is now confirmed.`
    : `Your payment${amountLine} to ${opts.otherPartyName} went through. Your lesson on <strong>${escapeHtml(when)}</strong> is confirmed.`;
  await notify(recipient, {
    subject: heading,
    html: renderEmail({ heading, bodyHtml: body, ctaUrl: opts.inquiryUrl, ctaLabel: "View booking" }),
    waMessage: `✅ ${heading}\n\n${opts.forTeacher ? `${opts.otherPartyName} paid${amountLine}` : `Paid${amountLine} to ${opts.otherPartyName}`} for ${when}.\n\nDetails: ${opts.inquiryUrl}`,
  });
}

export function inquiryUrlFor(role: "teacher" | "parent", inquiryId: string): string {
  const path = role === "teacher" ? `/dashboard/teacher/inquiries/${inquiryId}` : `/dashboard/family/inquiries/${inquiryId}`;
  return `${baseUrl()}${path}`;
}

export const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
