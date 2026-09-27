"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface TrendPoint { date: string; pct: number | null }
interface BatchRow {
  id: string; name: string; program: string;
  ustadh: { id: string; name: string; phone: string | null } | null;
  totalStudents: number; recordedCount: number; pct: number | null;
  breakdown: { SABAQ: number; SABQI: number; MANZIL: number; GIRDAAN: number };
  missingStudents: { id: string; name: string }[];
  trend: TrendPoint[];
}
interface MonitorData {
  date: string;
  summary: {
    totalBatches: number; fullyRecorded: number; partiallyRecorded: number;
    notRecorded: number; noStudents: number; totalStudents: number; recordedStudents: number;
  };
  batches: BatchRow[];
}

const PROGRAM_LABELS: Record<string, string> = { HIFZ: "Hifz", NAZRA: "Nazrah", TAJWEED: "Tajweed/Qaida", GIRDAAN: "Girdaan" };
const PROGRAM_COLORS: Record<string, string> = { HIFZ: colors.primary, NAZRA: "#7c3aed", TAJWEED: "#b45309", GIRDAAN: "#0f766e" };

function statusColor(pct: number | null): { color: string; bg: string; label: string } {
  if (pct === null) return { color: colors.n400, bg: colors.n100, label: "No students" };
  if (pct === 0)     return { color: colors.errorText,   bg: colors.errorBg,   label: "Not recorded" };
  if (pct < 100)     return { color: colors.warningText, bg: colors.warningBg, label: "Partial" };
  return                    { color: colors.successText, bg: colors.successBg, label: "Complete" };
}

function todayISO(): string { return new Date().toISOString().split("T")[0]; }

function MetricCard({ val, label, color, bg }: { val: number | string; label: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
      <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
      <div style={{ fontFamily: fonts.body, fontSize: 11, color, opacity: 0.85, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function TrendStrip({ trend }: { trend: TrendPoint[] }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {trend.map(t => {
        const st = statusColor(t.pct);
        const dayLabel = new Date(`${t.date}T00:00:00`).toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" });
        return (
          <div key={t.date} title={`${dayLabel}: ${t.pct === null ? "no students" : `${t.pct}% recorded`}`}
            style={{ width: 16, height: 16, borderRadius: 4, background: t.pct === null ? colors.n100 : st.bg, border: `1px solid ${t.pct === null ? colors.n200 : st.color}40` }} />
        );
      })}
    </div>
  );
}

export default function DiaryMonitorPage() {
  const [data,     setData]     = useState<MonitorData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [date,     setDate]     = useState(todayISO());
  const [program,  setProgram]  = useState<string>("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/diary-monitor?date=${date}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [date]);

  const filteredBatches = useMemo(() => {
    if (!data) return [];
    return program === "ALL" ? data.batches : data.batches.filter(b => b.program === program);
  }, [data, program]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isToday = date === todayISO();
  const shiftDate = (deltaDays: number) => {
    const d = new Date(`${date}T00:00:00`); d.setDate(d.getDate() + deltaDays);
    setDate(d.toISOString().split("T")[0]);
  };
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const PROGRAMS = ["ALL", "HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <nav style={{ background: colors.deep, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 16 }}>←</Link>
          <HifzMark size={32} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>Diary Monitor</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, opacity: 0.8, letterSpacing: 1 }}>DAILY CLASS DIARY TRACKING</div>
          </div>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{dateLabel}</div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>

        {/* Date navigator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
          <button onClick={() => shiftDate(-1)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${colors.n200}`, background: colors.white, cursor: "pointer", fontSize: 16 }}>←</button>
          <input type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${colors.primary}`, fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.primary, outline: "none" }} />
          <button onClick={() => shiftDate(1)} disabled={isToday} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${colors.n200}`, background: isToday ? colors.n100 : colors.white, cursor: isToday ? "not-allowed" : "pointer", fontSize: 16, opacity: isToday ? 0.4 : 1 }}>→</button>
          {!isToday && (
            <button onClick={() => setDate(todayISO())} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: colors.primary, color: colors.white, cursor: "pointer", fontFamily: fonts.heading, fontSize: 12, fontWeight: 700 }}>Today</button>
          )}
        </div>

        {/* Program filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", justifyContent: "center" }}>
          {PROGRAMS.map(p => (
            <button key={p} onClick={() => setProgram(p)} style={{
              padding: "7px 16px", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap",
              background: program === p ? colors.primary : colors.white,
              color: program === p ? colors.white : colors.n500,
              fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
              border: program === p ? "none" : `1px solid ${colors.n200}`,
            }}>
              {p === "ALL" ? "All Classes" : PROGRAM_LABELS[p]}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: colors.n400, fontFamily: fonts.body }}>Loading diary monitor...</div>
        )}

        {!loading && data && (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
              <MetricCard val={data.summary.totalBatches} label="Total Classes" color={colors.primary} bg={colors.green50} />
              <MetricCard val={data.summary.fullyRecorded} label="Fully Recorded" color={colors.successText} bg={colors.successBg} />
              <MetricCard val={data.summary.partiallyRecorded} label="Partially Recorded" color={colors.warningText} bg={colors.warningBg} />
              <MetricCard val={data.summary.notRecorded} label="Not Recorded" color={colors.errorText} bg={colors.errorBg} />
              <MetricCard val={`${data.summary.recordedStudents}/${data.summary.totalStudents}`} label="Students Recorded" color={colors.n700} bg={colors.n100} />
            </div>

            {/* Batch list */}
            {filteredBatches.length === 0 ? (
              <div style={{ background: colors.white, borderRadius: 14, padding: 40, textAlign: "center", border: `1px solid ${colors.n200}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📔</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.n700 }}>No classes found for this filter</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredBatches.map(b => {
                  const st = statusColor(b.pct);
                  const isOpen = expanded.has(b.id);
                  const showBreakdown = b.program === "HIFZ" && b.recordedCount > 0;
                  const waLink = b.ustadh?.phone
                    ? `https://wa.me/${b.ustadh.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`As-salamu alaykum ${b.ustadh.name}, could you please record today's (${dateLabel}) diary entries for ${b.name}? JazakAllah Khair.`)}`
                    : null;

                  return (
                    <div key={b.id} data-testid={`batch-card-${b.id}`} style={{ background: colors.white, borderRadius: 14, border: `1px solid ${colors.n200}`, borderLeft: `4px solid ${st.color}`, overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>{b.name}</span>
                            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: `${PROGRAM_COLORS[b.program]}18`, color: PROGRAM_COLORS[b.program], fontFamily: fonts.mono, fontWeight: 700 }}>
                              {PROGRAM_LABELS[b.program] || b.program}
                            </span>
                          </div>
                          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 2 }}>
                            {b.ustadh ? b.ustadh.name : "Unassigned"}
                          </div>
                        </div>

                        <div style={{ minWidth: 130 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontFamily: fonts.mono, fontSize: 10, color: st.color, fontWeight: 700 }}>{st.label}</span>
                            <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500 }}>{b.recordedCount}/{b.totalStudents}</span>
                          </div>
                          <div style={{ height: 6, background: colors.n100, borderRadius: 3, overflow: "hidden", width: 130 }}>
                            <div style={{ height: "100%", width: `${b.pct ?? 0}%`, background: st.color, borderRadius: 3 }} />
                          </div>
                        </div>

                        <TrendStrip trend={b.trend} />

                        {b.missingStudents.length > 0 && (
                          <button onClick={() => toggleExpand(b.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontFamily: fonts.heading, fontSize: 11, color: colors.n600 }}>
                            {isOpen ? "Hide" : "Show"} missing ({b.missingStudents.length})
                          </button>
                        )}
                      </div>

                      {showBreakdown && (
                        <div style={{ padding: "0 16px 12px", fontFamily: fonts.mono, fontSize: 10, color: colors.n500 }}>
                          {b.breakdown.SABAQ > 0 && <span style={{ marginRight: 10 }}>{b.breakdown.SABAQ} Sabaq</span>}
                          {b.breakdown.SABQI > 0 && <span style={{ marginRight: 10 }}>{b.breakdown.SABQI} Sabqi</span>}
                          {b.breakdown.MANZIL > 0 && <span style={{ marginRight: 10 }}>{b.breakdown.MANZIL} Manzil</span>}
                        </div>
                      )}

                      {isOpen && (
                        <div style={{ padding: "12px 16px", borderTop: `1px solid ${colors.n100}`, background: colors.n50 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.n500 }}>MISSING TODAY'S ENTRY</div>
                            {waLink && (
                              <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 12px", borderRadius: 8, background: "#16a34a", color: colors.white, textDecoration: "none", fontFamily: fonts.heading, fontSize: 11, fontWeight: 700 }}>
                                💬 Remind {b.ustadh?.name.split(" ")[0]}
                              </a>
                            )}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {b.missingStudents.map(s => (
                              <span key={s.id} style={{ padding: "4px 10px", borderRadius: 8, background: colors.white, border: `1px solid ${colors.n200}`, fontFamily: fonts.body, fontSize: 11, color: colors.n700 }}>{s.name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
