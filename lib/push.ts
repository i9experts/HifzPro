// lib/push.ts
// Web Push helper — requires VAPID keys in env:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY
// Generate once with: npx web-push generate-vapid-keys
import webpush from "web-push";
import prisma from "@/lib/prisma";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const pub  = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error("VAPID keys not set");
  webpush.setVapidDetails("mailto:support@hifzpro.com", pub, priv);
  configured = true;
}

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;   // where notification click navigates
  icon?: string;
  tag?:  string;   // collapse key — same tag replaces previous notification
}

// ── Send to a single subscription, pruning dead ones ──
async function sendToSubscription(sub: { id: string; endpoint: string; p256dh: string; auth: string }, payload: PushPayload): Promise<boolean> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 86400 }
    );
    return true;
  } catch (err: any) {
    // 404/410 = subscription expired or unsubscribed — remove from DB
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    }
    return false;
  }
}

// ── Send to all devices of one user ──
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0, failed = 0;
  for (const sub of subs) {
    (await sendToSubscription(sub, payload)) ? sent++ : failed++;
  }
  return { sent, failed };
}

// ── Send to many users (batched, parallel chunks of 50) ──
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0 };
  const subs = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } });
  let sent = 0, failed = 0;
  for (let i = 0; i < subs.length; i += 50) {
    const chunk   = subs.slice(i, i + 50);
    const results = await Promise.all(chunk.map(s => sendToSubscription(s, payload)));
    results.forEach(ok => ok ? sent++ : failed++);
  }
  return { sent, failed };
}

// ── Send to the parent(s) of a student — for automated event pushes ──
// Call this from lesson entry, attendance, test result, fee routes
export async function sendPushToStudentParents(studentId: string, payload: PushPayload): Promise<{ sent: number; failed: number }> {
  const parents = await prisma.parent.findMany({
    where:  { guardian: { studentId } },
    select: { userId: true },
  });
  return sendPushToUsers(parents.map(p => p.userId), payload);
}
