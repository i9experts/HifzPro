"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface User {
  id:          string;
  name:        string;
  email:       string;
  role:        string;
  institution: { name: string } | null;
  campus:      { name: string } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.success) setUser(data.data.user);
        else router.push("/signin");
      })
      .catch(() => router.push("/signin"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <HifzMark size={60} primary="#10B981" gold={colors.gold} />
        <div style={{ fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Top Nav */}
      <nav style={{ background: colors.deep, padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <HifzMark size={36} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
            <div style={{ fontSize: 9, color: colors.gold, fontFamily: fonts.mono, letterSpacing: 1, opacity: 0.8 }}>ADMIN DASHBOARD</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.white }}>{user?.name}</div>
            <div style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user?.institution?.name}</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", fontFamily: fonts.heading }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Welcome */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.gold, marginBottom: 8 }}>WELCOME BACK</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.n800, margin: "0 0 8px" }}>
            As-salamu Alaykum, {user?.name?.split(" ")[0]}
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500 }}>
            {user?.campus?.name} · {user?.institution?.name}
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Students", val: "—", icon: "👨‍🎓", color: colors.primary },
            { label: "Active Today",   val: "—", icon: "✅", color: colors.success },
            { label: "Manzil Health",  val: "—", icon: "💚", color: colors.gold },
            { label: "At Risk",        val: "—", icon: "⚠️", color: colors.warning },
          ].map((s, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 12, padding: 20, border: `1px solid ${colors.n200}`, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Coming soon modules */}
        <div style={{ background: colors.white, borderRadius: 16, padding: 32, border: `1px solid ${colors.n200}`, textAlign: "center" }}>
          <HifzMark size={56} primary={colors.primary} gold={colors.gold} />
          <h2 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "16px 0 8px" }}>
            Dashboard Modules Loading...
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500, maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.8 }}>
            Authentication is complete. The Ustadh entry screen, student management, and analytics modules are being built next.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["Student Management", "Ustadh Entry", "Attendance", "Reports", "WhatsApp"].map((m, i) => (
              <span key={i} style={{ background: colors.green50, color: colors.primary, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontFamily: fonts.heading, fontWeight: 600, border: `1px solid ${colors.green200}` }}>
                🔜 {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
