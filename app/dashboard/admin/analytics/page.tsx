"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

// ── Types ──
interface Student {
  id: string; name: string; program: string; batchName?: string;
  currentJuz: number; percentComplete: number; manzilHealth: number | null;
  daysSinceLesson: number; attendancePct: number | null; riskLevel: number;
  guardian: { name: string; phone: string } | null; recentGrades: string[];
  totalMistakes: number;
}
interface BatchAnalytic {
  id: string; name: string; program: string; ustadhName: string;
  studentCount: number; avgHealth: number | null; avgProgress: number;
  avgAttendance: number | null; atRiskCount: number;
}
interface Snapshot {
  totalStudents: number; todayLessons: number; todayAttendance: number;
  todayMessages: number; overallHealth: number | null; overallAttendance: number | null;
  criticalCount: number; atRiskCount: number;
}
interface AnalyticsData {
  snapshot:           Snapshot;
  healthDistribution: { excellent: number; good: number; moderate: number; atRisk: number; noData: number };
  progressBands:      { completing: number; advanced: number; midway: number; early: number };
  dropoutRisk:        { critical: Student[]; atRisk: Student[]; monitor: Student[] };
  batchAnalytics:     BatchAnalytic[];
  topPerformers:      Student[];
  mistakeAnalysis:    { mistakeType: string; _count: number }[];
  lessonTrend:        { date: string; count: number }[];
  ustadhPerformance:  { id: string; name: string; batchCount: number; studentCount: number; lessonsThisMonth: number; avgGradeScore: number | null; avgStudentHealth: number | null }[];
  allStudents:        Student[];
}

// ── Reusable components ──
function MetricCard({ icon, val, label, color, bg, border, sub }: any) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "18px 16px", border: `1px solid ${border}`, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
      <div style={{ fontFamily: fonts.body, fontSize: 11, color, opacity: 0.8, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontFamily: fonts.mono, fontSize: 9, color, opacity: 0.5, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function HealthBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n300 }}>—</span>;
  const color = score >= 75 ? colors.successText : score >= 55 ? colors.warningText : colors.errorText;
  const bg    = score >= 75 ? colors.successBg  : score >= 55 ? colors.warningBg  : colors.errorBg;
  return <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontFamily: fonts.mono, fontWeight: 700 }}>{score}%</span>;
}

function RiskBadge({ level }: { level: number }) {
  if (level >= 4) return <span style={{ background: "#fef2f2", color: "#991b1b", padding: "2px 8px", borderRadius: 6, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700 }}>CRITICAL</span>;
  if (level >= 2) return <span style={{ background: colors.errorBg, color: colors.errorText, padding: "2px 8px", borderRadius: 6, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700 }}>AT RISK</span>;
  if (level === 1) return <span style={{ background: colors.warningBg, color: colors.warningText, padding: "2px 8px", borderRadius: 6, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700 }}>MONITOR</span>;
  return <span style={{ background: colors.successBg, color: colors.successText, padding: "2px 8px", borderRadius: 6, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700 }}>GOOD</span>;
}

function ProgressBar({ pct, color = colors.primary, height = 6 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ height, background: colors.n100, borderRadius: height/2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: height/2, transition: "width 0.6s" }} />
    </div>
  );
}

function SectionTitle({ label, title, action }: { label: string; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
      <div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: fonts.display, fontSize: "1.4rem", fontWeight: 700, color: colors.n800 }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"risk"|"batches"|"progress"|"ustadh"|"mistakes">("overview");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <HifzMark size={64} primary="#10B981" gold={colors.gold} />
      <div style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Calculating institutional analytics...</div>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.n700 }}>Failed to load analytics</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 8, background: colors.primary, color: "white", border: "none", cursor: "pointer", fontFamily: fonts.heading }}>Retry</button>
      </div>
    </div>
  );

  const s = data.snapshot;
  const hd = data.healthDistribution;
  const totalWithHealth = hd.excellent + hd.good + hd.moderate + hd.atRisk;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 16 }}>←</Link>
          <HifzMark size={32} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>Analytics</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, opacity: 0.8, letterSpacing: 1 }}>INTELLIGENCE DASHBOARD</div>
          </div>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{today}</div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>INSTITUTIONAL INTELLIGENCE</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2.2rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px" }}>Analytics Dashboard</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500 }}>
            {s.totalStudents} students · Real-time Manzil health · Dropout risk detection · Batch performance
          </p>
        </div>

        {/* Today's snapshot */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 12 }}>
          <MetricCard icon="📖" val={s.todayLessons}                     label="Lessons Today"   color={colors.primary}     bg={colors.green50}   border={colors.green200}  sub="recorded by Asatidha" />
          <MetricCard icon="📅" val={s.todayAttendance}                  label="Present Today"   color={colors.successText} bg={colors.successBg} border={`${colors.success}44`} sub="of active students" />
          <MetricCard icon="💬" val={s.todayMessages}                    label="WhatsApp Sent"   color="#0369a1"            bg="#f0f9ff"           border="#bae6fd"          sub="to parents today" />
          <MetricCard icon="⚠️" val={s.criticalCount + s.atRiskCount}   label="Need Attention"  color={colors.errorText}   bg={colors.errorBg}   border={`${colors.error}44`}  sub="dropout risk detected" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
          <MetricCard icon="👨‍🎓" val={s.totalStudents}                   label="Enrolled"        color={colors.primary}     bg={colors.white}     border={colors.n200} />
          <MetricCard icon="💚"  val={s.overallHealth !== null ? `${s.overallHealth}%` : "—"} label="Avg Manzil Health" color={s.overallHealth && s.overallHealth>=65?colors.successText:colors.warningText} bg={colors.white} border={colors.n200} />
          <MetricCard icon="📊"  val={s.overallAttendance !== null ? `${s.overallAttendance}%` : "—"} label="Avg Attendance" color={colors.primary} bg={colors.white} border={colors.n200} />
          <MetricCard icon="🏆"  val={data.topPerformers.length}          label="Top Performers"  color="#d97706"            bg={colors.white}     border={colors.n200} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: colors.white, borderRadius: 12, padding: 4, border: `1px solid ${colors.n200}`, marginBottom: 24, overflowX: "auto" }}>
          {[
            { id: "overview",  label: "Overview",        badge: null },
            { id: "risk",      label: "Dropout Risk",    badge: s.criticalCount + s.atRiskCount > 0 ? s.criticalCount + s.atRiskCount : null },
            { id: "batches",   label: "Batch Analysis",  badge: null },
            { id: "progress",  label: "Progress Tracker",badge: null },
            { id: "ustadh",    label: "Ustadh Report",   badge: null },
            { id: "mistakes",  label: "Mistake Analysis",badge: null },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: tab === t.id ? colors.primary : "transparent",
              color: tab === t.id ? colors.white : colors.n500,
              fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              position: "relative",
            }}>
              {t.label}
              {t.badge !== null && t.badge !== undefined && (
                <span style={{ position: "absolute", top: -4, right: -2, background: colors.error, color: "white", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontFamily: fonts.mono, fontWeight: 700 }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════ */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Manzil Health Distribution */}
            <div style={{ background: colors.white, borderRadius: 16, padding: 24, border: `1px solid ${colors.n200}` }}>
              <SectionTitle label="MANZIL HEALTH" title="Health Distribution Across All Students" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Excellent",  count: hd.excellent, color: "#166534",          bg: "#dcfce7", threshold: "≥ 80%" },
                  { label: "Good",       count: hd.good,      color: colors.primary,     bg: colors.green50, threshold: "65–79%" },
                  { label: "Moderate",   count: hd.moderate,  color: colors.warningText, bg: colors.warningBg, threshold: "50–64%" },
                  { label: "At Risk",    count: hd.atRisk,    color: colors.errorText,   bg: colors.errorBg, threshold: "< 50%" },
                ].map((h, i) => (
                  <div key={i} style={{ background: h.bg, borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: h.color }}>{h.count}</div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: h.color }}>{h.label}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, color: h.color, opacity: 0.6, marginTop: 2 }}>{h.threshold}</div>
                  </div>
                ))}
              </div>
              {/* Stacked bar */}
              {totalWithHealth > 0 && (
                <div>
                  <div style={{ display: "flex", height: 24, borderRadius: 12, overflow: "hidden", gap: 1 }}>
                    {[
                      { count: hd.excellent, color: "#16a34a" },
                      { count: hd.good,      color: colors.primary },
                      { count: hd.moderate,  color: colors.warning },
                      { count: hd.atRisk,    color: colors.error },
                    ].map((b, i) => b.count > 0 && (
                      <div key={i} style={{ flex: b.count, background: b.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: fonts.mono, fontSize: 10, color: "white", fontWeight: 700 }}>
                          {Math.round((b.count/totalWithHealth)*100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    {[
                      { label: "Excellent", color: "#16a34a" },
                      { label: "Good",      color: colors.primary },
                      { label: "Moderate",  color: colors.warning },
                      { label: "At Risk",   color: colors.error },
                    ].map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                        <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500 }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Manzil health per student grid */}
            <div style={{ background: colors.white, borderRadius: 16, padding: 24, border: `1px solid ${colors.n200}` }}>
              <SectionTitle label="STUDENT HEALTH MAP" title="Every Student's Manzil Score" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10 }}>
                {data.allStudents.map(s => (
                  <Link key={s.id} href={`/dashboard/admin/students/${s.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: colors.n50, borderRadius: 10, padding: "10px 12px", border: `1px solid ${s.manzilHealth === null ? colors.n200 : s.manzilHealth >= 65 ? colors.green200 : s.manzilHealth >= 50 ? `${colors.warning}44` : `${colors.error}44`}`, borderLeft: `4px solid ${s.manzilHealth === null ? colors.n300 : s.manzilHealth >= 65 ? colors.success : s.manzilHealth >= 50 ? colors.warning : colors.error}` }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>{s.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n500 }}>Juz {s.currentJuz}</span>
                        <HealthBadge score={s.manzilHealth} />
                      </div>
                      <ProgressBar pct={s.percentComplete} color={s.manzilHealth && s.manzilHealth >= 65 ? colors.primary : s.manzilHealth && s.manzilHealth >= 50 ? colors.warning : colors.error} height={4} />
                      {s.daysSinceLesson > 7 && (
                        <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.errorText, marginTop: 4 }}>⚠ {s.daysSinceLesson}d since lesson</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top performers + Progress bands side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Top performers */}
              <div style={{ background: colors.white, borderRadius: 16, padding: 24, border: `1px solid ${colors.n200}` }}>
                <SectionTitle label="RECOGNITION" title="Top Performers" />
                {data.topPerformers.length === 0 ? (
                  <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, textAlign: "center", padding: 24 }}>No data yet — record lessons to see top performers</div>
                ) : data.topPerformers.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < data.topPerformers.length-1 ? `1px solid ${colors.n100}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "#fef9c3" : colors.n50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: i === 0 ? 16 : 12 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{s.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400 }}>Juz {s.currentJuz} · {s.batchName}</div>
                    </div>
                    <HealthBadge score={s.manzilHealth} />
                  </div>
                ))}
              </div>

              {/* Progress bands */}
              <div style={{ background: colors.white, borderRadius: 16, padding: 24, border: `1px solid ${colors.n200}` }}>
                <SectionTitle label="PROGRESS" title="Completion Bands" />
                {[
                  { label: "Near Completion", range: "90–100%", count: data.progressBands.completing, color: "#166534", bg: "#dcfce7" },
                  { label: "Advanced",        range: "60–89%",  count: data.progressBands.advanced,   color: colors.primary, bg: colors.green50 },
                  { label: "Midway",          range: "30–59%",  count: data.progressBands.midway,     color: colors.warningText, bg: colors.warningBg },
                  { label: "Early Stage",     range: "0–29%",   count: data.progressBands.early,      color: colors.n500, bg: colors.n50 },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: b.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: b.color }}>{b.count}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>{b.label}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginBottom: 3 }}>{b.range}</div>
                      <ProgressBar pct={s.totalStudents > 0 ? (b.count/s.totalStudents)*100 : 0} color={b.color} height={4} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            TAB: DROPOUT RISK
        ══════════════════════════════ */}
        {tab === "risk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Risk explanation */}
            <div style={{ background: `linear-gradient(135deg,#7f1d1d,#991b1b)`, borderRadius: 14, padding: 20, color: "white" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: "#fca5a5", marginBottom: 6 }}>DROPOUT RISK INTELLIGENCE</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>How Risk Is Calculated</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { factor: "Manzil Health", desc: "Score < 60% adds risk points" },
                  { factor: "Lesson Frequency", desc: "No lesson in 7+ days adds risk" },
                  { factor: "Attendance Rate", desc: "< 70% attendance adds risk" },
                ].map((f, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{f.factor}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, opacity: 0.7 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical */}
            {data.dropoutRisk.critical.length > 0 && (
              <div style={{ background: colors.white, borderRadius: 16, border: `2px solid ${colors.error}`, overflow: "hidden" }}>
                <div style={{ background: colors.errorBg, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🚨</span>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.errorText }}>Critical — Immediate Action Required</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.errorText, opacity: 0.7 }}>{data.dropoutRisk.critical.length} students at critical risk of dropping out</div>
                  </div>
                </div>
                {data.dropoutRisk.critical.map((s, i) => <RiskRow key={s.id} student={s} idx={i} total={data.dropoutRisk.critical.length} />)}
              </div>
            )}

            {/* At Risk */}
            {data.dropoutRisk.atRisk.length > 0 && (
              <div style={{ background: colors.white, borderRadius: 16, border: `1px solid ${colors.error}66`, overflow: "hidden" }}>
                <div style={{ background: `${colors.errorBg}88`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>⚠️</span>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.errorText }}>At Risk — Needs Attention Soon</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.errorText, opacity: 0.7 }}>{data.dropoutRisk.atRisk.length} students showing risk patterns</div>
                  </div>
                </div>
                {data.dropoutRisk.atRisk.map((s, i) => <RiskRow key={s.id} student={s} idx={i} total={data.dropoutRisk.atRisk.length} />)}
              </div>
            )}

            {/* Monitor */}
            {data.dropoutRisk.monitor.length > 0 && (
              <div style={{ background: colors.white, borderRadius: 16, border: `1px solid ${colors.warning}66`, overflow: "hidden" }}>
                <div style={{ background: `${colors.warningBg}`, padding: "14px 20px" }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.warningText }}>🔶 Monitor — Keep an Eye On</div>
                </div>
                {data.dropoutRisk.monitor.map((s, i) => <RiskRow key={s.id} student={s} idx={i} total={data.dropoutRisk.monitor.length} />)}
              </div>
            )}

            {data.dropoutRisk.critical.length === 0 && data.dropoutRisk.atRisk.length === 0 && data.dropoutRisk.monitor.length === 0 && (
              <div style={{ background: colors.successBg, borderRadius: 16, padding: 40, textAlign: "center", border: `1px solid ${colors.green200}` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.successText }}>No students at risk!</div>
                <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.successText, opacity: 0.8, marginTop: 6 }}>All students are on track. Keep up the great work.</div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: BATCH ANALYSIS
        ══════════════════════════════ */}
        {tab === "batches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionTitle label="BATCH COMPARISON" title="Performance by Halqa" />
            {data.batchAnalytics.length === 0 ? (
              <div style={{ background: colors.white, borderRadius: 14, padding: 40, textAlign: "center", border: `1px solid ${colors.n200}` }}>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n400 }}>No batches found. Create batches in Batch Management.</div>
              </div>
            ) : data.batchAnalytics.map((b, i) => (
              <div key={b.id} style={{ background: colors.white, borderRadius: 14, padding: 20, border: `1px solid ${colors.n200}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.n800 }}>{b.name}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginTop: 2 }}>
                      Ustadh: {b.ustadhName} · {b.studentCount} students · {b.program}
                    </div>
                  </div>
                  {b.atRiskCount > 0 && (
                    <span style={{ background: colors.errorBg, color: colors.errorText, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono, fontWeight: 700 }}>
                      {b.atRiskCount} at risk
                    </span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {[
                    { label: "Avg Manzil Health", val: b.avgHealth !== null ? `${b.avgHealth}%` : "—", color: b.avgHealth === null ? colors.n400 : b.avgHealth >= 65 ? colors.successText : b.avgHealth >= 50 ? colors.warningText : colors.errorText, bar: b.avgHealth ?? 0 },
                    { label: "Avg Progress",       val: `${b.avgProgress}%`,                            color: colors.primary,     bar: b.avgProgress },
                    { label: "Avg Attendance",     val: b.avgAttendance !== null ? `${b.avgAttendance}%` : "—", color: b.avgAttendance === null ? colors.n400 : b.avgAttendance >= 80 ? colors.successText : b.avgAttendance >= 60 ? colors.warningText : colors.errorText, bar: b.avgAttendance ?? 0 },
                  ].map((m, j) => (
                    <div key={j}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>{m.label}</span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: m.color }}>{m.val}</span>
                      </div>
                      <ProgressBar pct={m.bar} color={m.color} height={6} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: PROGRESS TRACKER
        ══════════════════════════════ */}
        {tab === "progress" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionTitle label="QURAN PROGRESS" title="Every Student's Journey" />
            <div style={{ background: colors.white, borderRadius: 14, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px 80px 80px", gap: 0, padding: "10px 16px", background: colors.n50, borderBottom: `1px solid ${colors.n200}` }}>
                {["Student","Quran Progress","Juz","Manzil","Attend."].map((h, i) => (
                  <div key={i} style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: colors.n500, textAlign: i>1?"center":"left" }}>{h}</div>
                ))}
              </div>
              {[...data.allStudents].sort((a,b) => b.percentComplete - a.percentComplete).map((s, i) => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px 80px 80px", gap: 0, padding: "12px 16px", borderBottom: i < data.allStudents.length-1 ? `1px solid ${colors.n100}` : "none", alignItems: "center" }}>
                  <div>
                    <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.primary, textDecoration: "none" }}>{s.name}</Link>
                    <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>{s.batchName}</div>
                  </div>
                  <div style={{ paddingRight: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500 }}>Juz {s.currentJuz} / 30</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: colors.primary }}>{s.percentComplete}%</span>
                    </div>
                    <ProgressBar pct={s.percentComplete} height={6} />
                  </div>
                  <div style={{ textAlign: "center", fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: colors.primary }}>{s.currentJuz}</div>
                  <div style={{ textAlign: "center" }}><HealthBadge score={s.manzilHealth} /></div>
                  <div style={{ textAlign: "center", fontFamily: fonts.mono, fontSize: 11, color: s.attendancePct === null ? colors.n300 : s.attendancePct >= 80 ? colors.successText : s.attendancePct >= 60 ? colors.warningText : colors.errorText, fontWeight: 700 }}>
                    {s.attendancePct !== null ? `${s.attendancePct}%` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            TAB: USTADH REPORT
        ══════════════════════════════ */}
        {tab === "ustadh" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionTitle label="USTADH PERFORMANCE" title="Effectiveness Report — Last 30 Days" />
            {data.ustadhPerformance.length === 0 ? (
              <div style={{ background: colors.white, borderRadius: 14, padding: 40, textAlign: "center", border: `1px solid ${colors.n200}` }}>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n400 }}>No Ustadh data yet.</div>
              </div>
            ) : data.ustadhPerformance.map((u, i) => (
              <div key={u.id} style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.primary }}>{u.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.n800 }}>{u.name}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{u.batchCount} batch{u.batchCount>1?"es":""} · {u.studentCount} students</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    { label: "Lessons Recorded", val: u.lessonsThisMonth, suffix: "this month", color: colors.primary },
                    { label: "Avg Grade Score",   val: u.avgGradeScore !== null ? `${u.avgGradeScore}%` : "—", suffix: "lesson quality", color: u.avgGradeScore && u.avgGradeScore >= 70 ? colors.successText : colors.warningText },
                    { label: "Student Health",    val: u.avgStudentHealth !== null ? `${u.avgStudentHealth}%` : "—", suffix: "avg Manzil health", color: u.avgStudentHealth && u.avgStudentHealth >= 65 ? colors.successText : colors.warningText },
                  ].map((m, j) => (
                    <div key={j} style={{ background: colors.n50, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: m.color }}>{m.val}</div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginTop: 3 }}>{m.label}</div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400, marginTop: 1 }}>{m.suffix}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════
            TAB: MISTAKE ANALYSIS
        ══════════════════════════════ */}
        {tab === "mistakes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionTitle label="MISTAKE INTELLIGENCE" title="Error Pattern Analysis — Last 30 Days" />
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              {data.mistakeAnalysis.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: colors.n400, fontFamily: fonts.body }}>No mistake data yet — record lessons with mistake types to see analysis</div>
              ) : (
                <div>
                  {data.mistakeAnalysis.map((m, i) => {
                    const total = data.mistakeAnalysis.reduce((acc, x) => acc + x._count, 0);
                    const pct = Math.round((m._count / total) * 100);
                    const labels: Record<string,{label:string;desc:string;color:string}> = {
                      ATAK:       { label:"Atak (اٹک)",         desc:"Hesitation / stopping mid-recitation",      color:colors.errorText },
                      TAJWEED:    { label:"Tajweed (تجوید)",    desc:"Tajweed rule violations",                    color:"#7c3aed" },
                      LAHN_JALI:  { label:"Lahn Jali (لحن جلی)",desc:"Major errors that change meaning",           color:"#dc2626" },
                      LAHN_KHAFI: { label:"Lahn Khafi (لحن خفی)",desc:"Minor errors — pronunciation/sound issues", color:colors.warningText },
                    };
                    const info = labels[m.mistakeType] || { label: m.mistakeType, desc: "", color: colors.n500 };
                    return (
                      <div key={i} style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div>
                            <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: info.color }}>{info.label}</span>
                            <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginLeft: 8 }}>{info.desc}</span>
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: info.color }}>{m._count}</span>
                            <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n400 }}>{pct}%</span>
                          </div>
                        </div>
                        <ProgressBar pct={pct} color={info.color} height={10} />
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 20, padding: "14px 16px", background: colors.n50, borderRadius: 10, border: `1px solid ${colors.n200}` }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800, marginBottom: 6 }}>📊 Insight</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, lineHeight: 1.7 }}>
                      The most common mistake type reveals where students need the most focus. High Atak (hesitation) suggests insufficient Sabqi review. High Tajweed errors suggest the need for dedicated Tajweed sessions alongside Hifz.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Students with most mistakes */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 16 }}>Students With Most Mistakes (Last 3 Lessons)</div>
              {[...data.allStudents].sort((a,b) => b.totalMistakes - a.totalMistakes).filter(s => s.totalMistakes > 0).slice(0, 8).map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 7 ? `1px solid ${colors.n100}` : "none" }}>
                  <Link href={`/dashboard/admin/students/${s.id}`} style={{ flex: 1, textDecoration: "none" }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.primary }}>{s.name}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>{s.batchName}</div>
                  </Link>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 80 }}>
                      <ProgressBar pct={Math.min(100, s.totalMistakes * 10)} color={s.totalMistakes > 7 ? colors.error : s.totalMistakes > 3 ? colors.warning : colors.primary} height={6} />
                    </div>
                    <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: s.totalMistakes > 7 ? colors.errorText : s.totalMistakes > 3 ? colors.warningText : colors.primary, width: 20 }}>{s.totalMistakes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Risk row component ──
function RiskRow({ student, idx, total }: { student: Student; idx: number; total: number }) {
  const riskFactors = [];
  if (student.manzilHealth !== null && student.manzilHealth < 60) riskFactors.push(`Manzil ${student.manzilHealth}%`);
  if (student.daysSinceLesson > 7) riskFactors.push(`${student.daysSinceLesson}d no lesson`);
  if (student.attendancePct !== null && student.attendancePct < 70) riskFactors.push(`Attendance ${student.attendancePct}%`);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: idx < total-1 ? `1px solid ${colors.n100}` : "none" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.n50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.primary }}>{student.name.charAt(0)}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <Link href={`/dashboard/admin/students/${student.id}`} style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.primary, textDecoration: "none" }}>{student.name}</Link>
          <RiskBadge level={student.riskLevel} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {riskFactors.map((f, i) => (
            <span key={i} style={{ background: colors.errorBg, color: colors.errorText, padding: "1px 6px", borderRadius: 4, fontSize: 9, fontFamily: fonts.mono }}>{f}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <HealthBadge score={student.manzilHealth} />
        {student.guardian && (
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 3 }}>{student.guardian.phone}</div>
        )}
      </div>
    </div>
  );
}
