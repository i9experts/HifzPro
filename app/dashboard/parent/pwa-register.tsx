"use client";
import { useState, useEffect } from "react";
import { colors, fonts } from "@/lib/tokens";

// ── PWA Install Banner ──
export function InstallBanner() {
  const [prompt,    setPrompt]    = useState<any>(null);
  const [show,      setShow]      = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS,     setIsIOS]     = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone === true) return;

    // Check dismissed
    const wasDismissed = localStorage.getItem("hifzpro-pwa-dismissed");
    if (wasDismissed && Date.now() - parseInt(wasDismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS guide after 3s
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("hifzpro-pwa-dismissed", String(Date.now()));
  };

  if (!show || dismissed || installed) return null;

  // iOS install guide
  if (isIOS) return (
    <div style={{
      position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 448, zIndex: 100,
      background: "white", borderRadius: 18, boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      border: `1px solid ${colors.n200}`, overflow: "hidden",
    }}>
      <div style={{ background: `linear-gradient(135deg,${colors.deep},${colors.primary}88)`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>📱</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: "white" }}>Install HifzPro App</div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Add to your home screen for quick access</div>
        </div>
        <button onClick={handleDismiss} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, marginBottom: 12 }}>Follow these steps on Safari:</div>
        {[
          { icon: "⬆️", step: "Tap the Share button at the bottom of Safari" },
          { icon: "➕", step: "Scroll down and tap \"Add to Home Screen\"" },
          { icon: "✅", step: "Tap \"Add\" — HifzPro appears on your home screen" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{s.icon}</div>
            <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n700 }}>{s.step}</span>
          </div>
        ))}
        <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 13, color: colors.primary, textAlign: "center", marginTop: 8, opacity: 0.7 }}>
          تثبيت التطبيق على الشاشة الرئيسية
        </div>
      </div>
    </div>
  );

  // Android/Chrome install prompt
  return (
    <div style={{
      position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 448, zIndex: 100,
      background: "white", borderRadius: 18, boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      border: `1px solid ${colors.n200}`, overflow: "hidden",
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity:0 } to { transform: translateX(-50%) translateY(0); opacity:1 } }`}</style>
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${colors.deep},${colors.primary})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 24 }}>📖</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>Install HifzPro</div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 1 }}>Works offline · No App Store needed · Instant access</div>
        </div>
        <button onClick={handleDismiss} style={{ background: "none", border: "none", color: colors.n300, fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 16px 16px" }}>
        <button onClick={handleDismiss} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${colors.n200}`, background: colors.n50, color: colors.n600, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: fonts.heading }}>
          Not Now
        </button>
        <button onClick={handleInstall} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: colors.primary, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
          📲 Add to Home Screen
        </button>
      </div>
    </div>
  );
}

// ── SW Registration ──
export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/dashboard/parent/" })
        .then(reg => {
          console.log("[HifzPro SW] Registered:", reg.scope);
          // Check for updates every 30 minutes
          setInterval(() => reg.update(), 30 * 60 * 1000);
        })
        .catch(err => console.error("[HifzPro SW] Registration failed:", err));
    }
  }, []);

  return null;
}
