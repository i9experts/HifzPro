"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Stats {
  totalStudents: number;
  recordedToday: number;
  pendingToday:  number;
  atRisk:        number;
}
interface Student {
  id: string; name: string; currentJuz: number;
  currentPage: number; manzilHealth: number | null; recordedToday: boolean;
}

function StatCard({ val, label, color, bg }: { val: number; label: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color }}>{val}</div>
      <div style={{ fontFamily: fonts.body, fontSize: 10, color, opacity: 0.8, marginTop: 2 }}>{label}</div>
    </div>
  );
}

const MODULES = [
  {
    href: "/dashboard/ustadh/entry",
    icon: "📖",
    title: "Hifz Diary",
    titleUrdu: "حفظ ڈائری",
    desc: "Record Sabaq, Sabqi & Manzil",
    color: colors.primary,
    bg: colors.green50,
    border: colors.green200,
    badge: null,
  },
  {
    href: "/dashboard/ustadh/attendance",
    icon: "📅",
    title: "Attendance",
    titleUrdu: "حاضری",
    desc: "Mark today's halqa attendance",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    badge: "TODAY",
  },
   {
    href: "/dashboard/ustadh/tests",
    icon: "📝",
    title: "Tests & Assessment",
    titleUrdu: "امتحان",
    desc: "Record Para, Sabaq & Sanad test results",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    badge: null,
  },
  {
    href: "/dashboard/ustadh/nazrah",
    icon: "📚",
    title: "Nazrah Diary",
    titleUrdu: "ناظرہ ڈائری",
    desc: "Track Surah-by-Surah recitation",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    badge: null,
  },
  {
    href: "/dashboard/ustadh/qaida",
    icon: "✏️",
    title: "Qaida / Tajweed",
    titleUrdu: "قاعدہ / تجوید",
    desc: "Record Qaida & Tajweed progress",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    badge: null,
  },
  {
    href: "/dashboard/ustadh/girdaan",
    icon: "🔄",
    title: "Girdaan",
    titleUrdu: "گردان",
    desc: "Record revision & Dohraai cycles",
    color: "#0f766e",
    bg: "#f0fdfa",
    border: "#99f6e4",
    badge: null,
  },
  {
    href: "/dashboard/ustadh/reports",
    icon: "📊",
    title: "Reports",
    titleUrdu: "رپورٹس",
    desc: "View student progress & analytics",
    color: colors.n600,
    bg: colors.n50,
    border: colors.n200,
    badge: null,
  },
];

export default function UstadhHome() {
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [students,   setStudents]   = useState<Student[]>([]);
  const [ustadhName, setUstadhName] = useState("");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetch("/api/ustadh/dashboard")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStats(d.data.stats);
          setStudents(d.data.students);
          setUstadhName(d.data.ustadhName);
        } else window.location.href = "/signin";
      })
      .catch(() => window.location.href = "/signin")
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <HifzMark size={56} primary="#10B981" gold={colors.gold} />
        <div style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HifzMark size={32} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: colors.gold, fontFamily: fonts.mono, opacity: 0.8 }}>USTADH</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.white }}>{ustadhName}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: fonts.mono }}>{today}</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>WELCOME BACK</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: 0, lineHeight: 1.2 }}>
            As-salamu Alaykum,<br/>{ustadhName?.split(" ")[0]}
          </h1>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
            <StatCard val={stats.totalStudents}  label="Students" color={colors.primary}     bg={colors.green50} />
            <StatCard val={stats.recordedToday}  label="Recorded" color={colors.successText} bg={colors.successBg} />
            <StatCard val={stats.pendingToday}   label="Pending"  color={colors.warningText} bg={colors.warningBg} />
            <StatCard val={stats.atRisk}         label="At Risk"  color={colors.errorText}   bg={colors.errorBg} />
          </div>
        )}

        {/* Module cards */}
        <div style={{ fontSize: 10, letterSpacing: 3, color: colors.n500, fontFamily: fonts.mono, marginBottom: 12 }}>MODULES</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {MODULES.map((mod, i) => (
            <Link key={i} href={mod.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: colors.white, borderRadius: 14, padding: 18,
                border: `1px solid ${mod.border}`,
                borderLeft: `4px solid ${mod.color}`,
                transition: "all 0.15s", cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{mod.icon}</span>
                  {mod.badge && (
                    <span style={{ fontSize: 8, background: mod.color, color: colors.white, padding: "2px 6px", borderRadius: 4, fontFamily: fonts.mono, letterSpacing: 1 }}>
                      {mod.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 3 }}>{mod.title}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: mod.color, marginBottom: 4 }}>{mod.titleUrdu}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, lineHeight: 1.5 }}>{mod.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick student list — pending only */}
        {stats && stats.pendingToday > 0 && (
          <>
            <div style={{ fontSize: 10, letterSpacing: 3, color: colors.n500, fontFamily: fonts.mono, marginBottom: 12 }}>
              PENDING TODAY ({stats.pendingToday})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {students.filter(s => !s.recordedToday).map(s => (
                <div key={s.id} style={{ background: colors.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${colors.n200}`, borderLeft: `3px solid ${colors.primary}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.primary }}>{s.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{s.name}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500, marginTop: 2 }}>Juz {s.currentJuz} · Page {s.currentPage}</div>
                  </div>
                  <Link href={`/dashboard/ustadh/entry/${s.id}`} style={{ padding: "8px 14px", borderRadius: 8, background: colors.primary, color: colors.white, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
                    Record →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {stats?.pendingToday === 0 && (
          <div style={{ background: colors.successBg, borderRadius: 14, padding: 24, textAlign: "center", border: `1px solid ${colors.green200}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.successText }}>All students recorded today!</div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.successText, opacity: 0.7, marginTop: 4 }}>JazakAllah Khair, {ustadhName?.split(" ")[0]}.</div>
          </div>
        )}
      </div>
    </div>
  );
}
