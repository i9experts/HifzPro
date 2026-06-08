"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";
import { formatHijriBilingual } from "@/lib/hijri";
interface Sanad {
  id: string; sanadNumber: string; program: string; issuedAt: string;
  student: { id: string; name: string; enrollmentNumber: string; photo: string | null; campus: { institution: { name: string } } | null };
}
interface Stats { total: number; hifz: number; nazra: number; tajweed: number; girdaan: number; }

const PROGRAM_INFO: Record<string, { label: string; arabic: string; icon: string; color: string; bg: string }> = {
  HIFZ:    { label: "Hifz ul Quran",  arabic: "حفظ القرآن الكريم", icon: "🏆", color: "#166534",       bg: "#dcfce7" },
  NAZRA:   { label: "Nazrah",          arabic: "ناظرہ",             icon: "📖", color: "#7c3aed",       bg: "#f5f3ff" },
  TAJWEED: { label: "Tajweed",         arabic: "تجوید",             icon: "✏️", color: "#b45309",       bg: "#fffbeb" },
  GIRDAAN: { label: "Girdaan",         arabic: "گردان",             icon: "🔄", color: "#0f766e",       bg: "#f0fdfa" },
};

export default function SanadsPage() {
  const [sanads,  setSanads]  = useState<Sanad[]>([]);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("");
  const [program, setProgram] = useState("");

  useEffect(() => {
    fetch("/api/admin/sanads")
      .then(r => r.json())
      .then(d => { if (d.success) { setSanads(d.data.sanads); setStats(d.data.stats); } })
      .finally(() => setLoading(false));
  }, []);

  const filtered = sanads.filter(s => {
    if (program && s.program !== program) return false;
    if (filter && !s.student.name.toLowerCase().includes(filter.toLowerCase()) && !s.sanadNumber.includes(filter)) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>Sanad & Certificates</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, opacity: 0.8, letterSpacing: 1 }}>سند القرآن الكريم</div>
          </div>
        </div>
        <Link href="/dashboard/admin/sanads/new" style={{ padding: "8px 20px", borderRadius: 8, background: colors.gold, color: colors.white, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
          + Issue New Sanad
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg,${colors.deep},#0A2E1A)`, borderRadius: 20, padding: 28, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 6 }}>QR-VERIFIED CERTIFICATES</div>
            <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.white, margin: "0 0 6px" }}>Sanad & Certificates</h1>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Issue beautiful, QR-verified digital Sanads for students who complete their program</p>
          </div>
          <div style={{ fontFamily: "'Scheherazade New','Cormorant Garamond',serif", fontSize: 28, color: colors.gold, direction: "rtl", lineHeight: 1.6, opacity: 0.8 }}>
            شَهَادَةُ حِفْظِ<br/>الْقُرْآنِ الْكَرِيم
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { val: stats.total,   label: "Total Issued", icon: "📜", color: colors.primary, bg: colors.green50, border: colors.green200 },
              { val: stats.hifz,    label: "Hifz",        icon: "🏆", color: "#166534",       bg: "#dcfce7",      border: "#86efac" },
              { val: stats.nazra,   label: "Nazrah",      icon: "📖", color: "#7c3aed",       bg: "#f5f3ff",      border: "#c4b5fd" },
              { val: stats.tajweed, label: "Tajweed",     icon: "✏️", color: "#b45309",       bg: "#fffbeb",      border: "#fde68a" },
              { val: stats.girdaan, label: "Girdaan",     icon: "🔄", color: "#0f766e",       bg: "#f0fdfa",      border: "#99f6e4" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "16px 14px", border: `1px solid ${s.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search by name or Sanad number..."
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 12, fontFamily: fonts.body, outline: "none" }} />
          <select value={program} onChange={e => setProgram(e.target.value)}
            style={{ padding: "10px 12px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 12, fontFamily: fonts.heading, color: colors.n700, background: colors.white, outline: "none" }}>
            <option value="">All Programs</option>
            {Object.entries(PROGRAM_INFO).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>

        {/* Sanad list */}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: colors.n400, fontFamily: fonts.body }}>Loading Sanads...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: colors.white, borderRadius: 16, padding: 56, textAlign: "center", border: `1px solid ${colors.n200}` }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📜</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.n700, marginBottom: 8 }}>No Sanads issued yet</div>
            <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, marginBottom: 24 }}>Issue a Sanad when a student completes their program</div>
            <Link href="/dashboard/admin/sanads/new" style={{ padding: "12px 28px", borderRadius: 10, background: colors.gold, color: "white", textDecoration: "none", fontFamily: fonts.heading, fontSize: 13, fontWeight: 700 }}>Issue First Sanad →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((sanad, idx) => {
              const prog = PROGRAM_INFO[sanad.program] || PROGRAM_INFO.HIFZ;
             const issuedDateObj = new Date(sanad.issuedAt);
const issuedDate    = issuedDateObj.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
const issuedHijri   = formatHijriBilingual(issuedDateObj);
              return (
                <div key={sanad.id} style={{ background: colors.white, borderRadius: 14, padding: "16px 20px", border: `1px solid ${colors.n200}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {/* Student */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: prog.bg, border: `2px solid ${prog.color}33`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {sanad.student.photo
                        ? <img src={sanad.student.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: prog.color }}>{sanad.student.name.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>{sanad.student.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400 }}>{sanad.student.enrollmentNumber}</div>
                    </div>
                  </div>
                  {/* Program */}
                  <span style={{ background: prog.bg, color: prog.color, padding: "4px 12px", borderRadius: 8, fontFamily: fonts.heading, fontSize: 11, fontWeight: 700 }}>
                    {prog.icon} {prog.label}
                  </span>
                  {/* Sanad number */}
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>{issuedDate}</div>
<div style={{ fontFamily: "Scheherazade New,serif", fontSize: 11, color: colors.gold, marginTop: 1 }}>{issuedHijri.hijriAr}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: colors.primary }}>{sanad.sanadNumber}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>{issuedDate}</div>
                  </div>
                  {/* Verified badge */}
                  <span style={{ background: colors.successBg, color: colors.successText, padding: "4px 10px", borderRadius: 6, fontFamily: fonts.mono, fontSize: 9, fontWeight: 700 }}>✓ VERIFIED</span>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/dashboard/admin/sanads/${sanad.id}`} style={{ padding: "7px 14px", borderRadius: 8, background: colors.green50, color: colors.primary, border: `1px solid ${colors.green200}`, fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
                      View
                    </Link>
                    <Link href={`/certificates/${sanad.sanadNumber}`} target="_blank" style={{ padding: "7px 14px", borderRadius: 8, background: prog.bg, color: prog.color, border: `1px solid ${prog.color}33`, fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
                      Certificate ↗
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
