"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface User {
  name: string;
  institution: { name: string } | null;
  campus: { name: string } | null;
}
interface Stats {
  total: number; active: number; completed: number; onLeave: number; atRisk: number;
}

const MODULES = [
  { href: "/dashboard/admin/students",     icon: "👨‍🎓", title: "Student Management",  titleUrdu: "طلبہ مینجمنٹ",   desc: "Enrol, manage & track all students",          color: colors.primary,  bg: colors.green50,  border: colors.green200,  badge: "" },
  { href: "/dashboard/ustadh",             icon: "📖", title: "Ustadh Portal",        titleUrdu: "استاذ پورٹل",     desc: "Hifz diary, attendance & lesson entry",       color: "#0891b2",       bg: "#ecfeff",       border: "#a5f3fc",        badge: "" },
  { href: "/dashboard/admin/batches",      icon: "👥", title: "Batch Management",     titleUrdu: "حلقہ مینجمنٹ",   desc: "Create & manage halqas and assign Asatidha", color: "#7c3aed",       bg: "#f5f3ff",       border: "#ddd6fe",        badge: "SOON" },
  { href: "/dashboard/admin/attendance",   icon: "📅", title: "Attendance Reports",   titleUrdu: "حاضری رپورٹس",   desc: "Campus-wide attendance analytics",            color: "#b45309",       bg: "#fffbeb",       border: "#fde68a",        badge: "SOON" },
  { href: "/dashboard/admin/analytics",    icon: "📊", title: "Analytics Dashboard",  titleUrdu: "تجزیاتی لوحہ",   desc: "Manzil health, dropout risk & insights",     color: "#0f766e",       bg: "#f0fdfa",       border: "#99f6e4",        badge: "SOON" },
  { href: "/dashboard/admin/tests",        icon: "📝", title: "Tests & Assessments",  titleUrdu: "امتحانات",        desc: "Para tests, Sanad tests & results",           color: "#be185d",       bg: "#fdf2f8",       border: "#fbcfe8",        badge: "SOON" },
  { href: "/dashboard/admin/finance",      icon: "💰", title: "Fee Management",       titleUrdu: "فیس مینجمنٹ",    desc: "Fee structures, payments & scholarships",    color: "#15803d",       bg: "#f0fdf4",       border: "#bbf7d0",        badge: "SOON" },
  { href: "/dashboard/admin/whatsapp",     icon: "💬", title: "WhatsApp Notifications",titleUrdu: "واٹس ایپ",      desc: "Parent updates, alerts & messaging",         color: "#16a34a",       bg: "#f0fdf4",       border: "#bbf7d0",        badge: "SOON" },
  { href: "/dashboard/admin/sanads",       icon: "🏛",  title: "Sanads & Certificates",titleUrdu: "سند / اجازہ",   desc: "Issue QR-verified Sanads & Ijazahs",         color: colors.gold,     bg: "#fffbeb",       border: "#fde68a",        badge: "SOON" },
  { href: "/dashboard/admin/asatidha",     icon: "🧑‍🏫", title: "Asatidha Management", titleUrdu: "اساتذہ",         desc: "Add, manage & assign Asatidha",              color: colors.n600,     bg: colors.n50,      border: colors.n200,      badge: "SOON" },
];

export default function AdminDashboard() {
  const [user,    setUser]    = useState<User | null>(null);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.data.user); else window.location.href = "/signin"; });

    // Get student stats
    fetch("/api/admin/students?limit=1")
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data.stats); })
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <HifzMark size={36} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
            <div style={{ fontSize: 8, letterSpacing: 2, color: colors.gold, fontFamily: fonts.mono, marginTop: 2, opacity: 0.8 }}>ADMIN DASHBOARD</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.white }}>{user?.name || "—"}</div>
            <div style={{ fontFamily: fonts.body, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{user?.campus?.name} · {user?.institution?.name}</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: "7px 16px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", fontFamily: fonts.heading }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 6 }}>WELCOME BACK</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2.2rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px", lineHeight: 1.2 }}>
            As-salamu Alaykum, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, margin: 0 }}>
            {user?.campus?.name} · {user?.institution?.name} · {today}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { val: loading ? "—" : (stats?.total     || 0), label: "Total Students",  icon: "👨‍🎓", color: colors.primary,     bg: colors.green50,  border: colors.green200 },
            { val: loading ? "—" : (stats?.active    || 0), label: "Active",          icon: "✅",  color: colors.successText, bg: colors.successBg,border: `${colors.success}44` },
            { val: loading ? "—" : (stats?.completed || 0), label: "Completed Hifz",  icon: "🏆",  color: "#0369a1",          bg: "#f0f9ff",        border: "#bae6fd" },
            { val: loading ? "—" : (stats?.onLeave   || 0), label: "On Leave",        icon: "🏠",  color: colors.warningText, bg: colors.warningBg, border: `${colors.warning}44` },
            { val: loading ? "—" : (stats?.atRisk    || 0), label: "At Risk",         icon: "⚠️",  color: colors.errorText,   bg: colors.errorBg,   border: `${colors.error}44` },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "18px 14px", border: `1px solid ${s.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 10, color: s.color, opacity: 0.8, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick action */}
        <div style={{ background: `linear-gradient(135deg,${colors.primary} 0%,#0A4A28 100%)`, borderRadius: 16, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.gold, marginBottom: 4 }}>QUICK ACTION</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>Enrol a New Student</div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>5-step wizard — personal info, program, Quran position, guardian details</div>
          </div>
          <Link href="/dashboard/admin/students/new" style={{ padding: "12px 24px", borderRadius: 10, background: colors.gold, color: colors.white, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, flexShrink: 0, boxShadow: "0 4px 14px rgba(196,136,42,0.4)" }}>
            + Enrol Student →
          </Link>
        </div>

        {/* Modules grid */}
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.n500, marginBottom: 14 }}>ALL MODULES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
          {MODULES.map((mod, i) => (
            <Link key={i} href={mod.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: colors.white, borderRadius: 14, padding: "18px 18px",
                border: `1px solid ${mod.badge ? colors.n200 : mod.border}`,
                borderLeft: `4px solid ${mod.badge ? colors.n300 : mod.color}`,
                opacity: mod.badge ? 0.7 : 1,
                transition: "all 0.15s", cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{mod.icon}</span>
                  {mod.badge && (
                    <span style={{ fontSize: 8, background: colors.n100, color: colors.n400, padding: "2px 6px", borderRadius: 4, fontFamily: fonts.mono, letterSpacing: 1 }}>
                      {mod.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: mod.badge ? colors.n400 : colors.n800, marginBottom: 2 }}>{mod.title}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: mod.badge ? colors.n300 : mod.color, marginBottom: 5 }}>{mod.titleUrdu}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, lineHeight: 1.5 }}>{mod.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent students quick view */}
        <div style={{ background: colors.white, borderRadius: 16, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.n100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>Recent Students</div>
            <Link href="/dashboard/admin/students" style={{ fontFamily: fonts.heading, fontSize: 12, color: colors.primary, textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Link href="/dashboard/admin/students" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 10, background: colors.green50,
              border: `1px solid ${colors.green200}`, color: colors.primary,
              fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading,
            }}>
              👨‍🎓 Open Student Management
            </Link>
            <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n400, marginTop: 10 }}>
              Search, filter, view profiles, and manage all {stats?.total || 0} enrolled students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
