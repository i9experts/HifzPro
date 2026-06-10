"use client";
// components/push-subscribe.tsx
// "Enable Notifications" banner + bell toggle for the parent portal.
// Drop <PushSubscribe /> into the parent layout/dashboard.
import { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  const arr     = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Status = "unsupported" | "default" | "subscribed" | "denied" | "loading";

export default function PushSubscribe() {
  const [status,    setStatus]    = useState<Status>("loading");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") { setStatus("denied"); return; }

    // Check existing subscription
    navigator.serviceWorker.ready.then(async reg => {
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : "default");
    }).catch(() => setStatus("default"));

    // Respect a 7-day dismissal
    const d = localStorage.getItem("hifzpro-push-dismissed");
    if (d && Date.now() - parseInt(d) < 7 * 24 * 60 * 60 * 1000) setDismissed(true);
  }, []);

  const subscribe = async () => {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus(permission === "denied" ? "denied" : "default"); return; }

      const reg       = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) { console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY not set"); setStatus("default"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subscription: sub.toJSON() }),
      });
      const data = await res.json();
      setStatus(data.success ? "subscribed" : "default");
    } catch (e) {
      console.error("Push subscribe failed:", e);
      setStatus("default");
    }
  };

  const unsubscribe = async () => {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("default");
    } catch { setStatus("subscribed"); }
  };

  const dismiss = () => {
    localStorage.setItem("hifzpro-push-dismissed", String(Date.now()));
    setDismissed(true);
  };

  // Bell toggle — always visible once subscribed (small, unobtrusive)
  if (status === "subscribed") {
    return (
      <button
        onClick={unsubscribe}
        title="Notifications on — tap to disable"
        style={{ position: "fixed", bottom: "calc(76px + env(safe-area-inset-bottom))", right: 16, zIndex: 60, width: 40, height: 40, borderRadius: "50%", background: "#0D5C3A", border: "1px solid #16a34a", color: "white", fontSize: 17, cursor: "pointer", boxShadow: "0 3px 12px rgba(13,92,58,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        🔔
      </button>
    );
  }

  // Banner — shown only when not yet subscribed and not dismissed
  if (status !== "default" || dismissed) return null;

  return (
    <div style={{ position: "fixed", bottom: "calc(70px + env(safe-area-inset-bottom))", left: 12, right: 12, zIndex: 60, background: "linear-gradient(135deg,#0D5C3A,#065f46)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 6px 24px rgba(0,0,0,0.3)", border: "1px solid #16a34a", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 26, flexShrink: 0 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "white" }}>
          Get instant updates
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>
          Lesson progress, attendance & announcements — straight to your phone
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <button onClick={subscribe} style={{ padding: "8px 16px", borderRadius: 8, background: "#C4882A", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>
          Enable
        </button>
        <button onClick={dismiss} style={{ padding: "4px", borderRadius: 6, background: "transparent", color: "rgba(255,255,255,0.4)", border: "none", fontSize: 10, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
          Not now
        </button>
      </div>
    </div>
  );
}
