"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id: string; name: string; currentJuz: number; currentPage: number;
  percentComplete: number; manzilHealth: number | null; recordedToday: boolean;
}

function ManzilBar({ score }: { score: number | null }) {
  if (score === null) return <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n400 }}>—</span>;
  const color = score >= 75 ? colors.success : score >= 55 ? colors.warning : colors.error;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: colors.n100, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, color, width: 32, textAlign: "right" }}>{Math.round(score)}%</span>
    </div>
  );
}

export default function ReportsPage() {
  const [students,   setStudents]   = useState<Student[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [ustadhName, setUstadhName] = useState("");
  const [sortBy,     setSortBy]     = useState<"manzil"|"progress"|"name">("manzil");

  useEffect(() => {
    fetch("/api/ustadh/dashboard")
      .then(r => r.json())
      .then(d => {
        if (d.success) { setStudents(d.data.students); setUstadhName(d.data.ustadhName); }
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...students].sort((a, b) => {
    if (sortBy === "manzil")   return (b.manzilHealth || 0) - (a.manzilHealth || 0);
    if (sortBy === "progress") return b.percentComplete - a.percentComplete;
    return a.name.localeCompare(b.name);
  });

  const avgHealth = students.length
    ? Math.round(students.filter(s => s.manzilHealth !== null).reduce((acc, s) => acc + (s.manzilHealth || 0), 0) / students.filter(s => s.manzilHealth !== null).length)
    : 0;

  const atRisk    = students.filter(s => s.manzilHealth !== null && s.manzilHealth < 60).length;
  const excellent = students.filter(s => s.manzilHealth !== null && s.manzilHealth >= 80).length;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <div style={{ background: colors.deep, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/ustadh" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 18 }}>←</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>📊 Reports</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>HALQA OVERVIEW</div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { val: students.length, label: "Total Huffaz", color: colors.primary, bg: colors.green50 },
            { val: `${avgHealth}%`, label: "Avg Manzil", color: colors.successText, bg: colors.successBg },
            { val: atRisk, label: "Need Attention", color: colors.errorText, bg: colors.errorBg },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 10, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sort tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: colors.white, borderRadius: 10, padding: 4, border: `1px solid ${colors.n200}` }}>
          {[{id:"manzil",label:"Manzil Health"},{id:"progress",label:"Quran Progress"},{id:"name",label:"Name"}].map(s=>(
            <button key={s.id} onClick={()=>setSortBy(s.id as any)} style={{
              flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",
              background:sortBy===s.id?colors.primary:"transparent",
              color:sortBy===s.id?colors.white:colors.n500,
              fontFamily:fonts.heading,fontSize:11,fontWeight:600,transition:"all 0.15s",
            }}>{s.label}</button>
          ))}
        </div>

        {/* Student report list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: colors.n400, fontFamily: fonts.body }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((s, idx) => (
              <div key={s.id} style={{
                background: colors.white, borderRadius: 14, padding: "16px",
                border: `1px solid ${colors.n200}`,
                borderLeft: `4px solid ${s.manzilHealth === null ? colors.n300 : s.manzilHealth >= 75 ? colors.success : s.manzilHealth >= 55 ? colors.warning : colors.error}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: colors.primary }}>{idx + 1}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>{s.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500, marginTop: 1 }}>Juz {s.currentJuz} · Page {s.currentPage}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      background: s.recordedToday ? colors.successBg : colors.warningBg,
                      color: s.recordedToday ? colors.successText : colors.warningText,
                      padding: "3px 8px", borderRadius: 999, fontSize: 10, fontFamily: fonts.mono,
                    }}>
                      {s.recordedToday ? "✓ Recorded" : "⏳ Pending"}
                    </span>
                  </div>
                </div>

                {/* Quran progress */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500 }}>Quran Progress</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.primary, fontWeight: 700 }}>{Math.round(s.percentComplete)}%</span>
                  </div>
                  <div style={{ height: 6, background: colors.n100, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.percentComplete}%`, background: `linear-gradient(90deg,${colors.primary},${colors.success})`, borderRadius: 3 }} />
                  </div>
                </div>

                {/* Manzil health */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500 }}>Manzil Health</span>
                  </div>
                  <ManzilBar score={s.manzilHealth} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
