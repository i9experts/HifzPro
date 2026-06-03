"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id:              string;
  name:            string;
  program:         string;
  batchName:       string;
  currentJuz:      number;
  currentPage:     number;
  percentComplete: number;
  manzilHealth:    number | null;
  recordedToday:   boolean;
}

interface Stats {
  totalStudents:  number;
  recordedToday:  number;
  pendingToday:   number;
  atRisk:         number;
}

function HealthBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ fontSize: 11, color: colors.n400, fontFamily: fonts.mono }}>—</span>;
  const color = score >= 75 ? colors.successText : score >= 55 ? colors.warningText : colors.errorText;
  const bg    = score >= 75 ? colors.successBg  : score >= 55 ? colors.warningBg  : colors.errorBg;
  return (
    <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: fonts.mono }}>
      {Math.round(score)}%
    </span>
  );
}

export default function UstadhDashboard() {
  const router = useRouter();
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | "pending" | "done">("all");
  const [ustadhName, setUstadhName] = useState("");

  useEffect(() => {
    fetch("/api/ustadh/dashboard")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.data.stats);
          setStudents(data.data.students);
          setUstadhName(data.data.ustadhName);
        } else {
          router.push("/signin");
        }
      })
      .catch(() => router.push("/signin"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  const filtered = students.filter(s => {
    if (filter === "pending") return !s.recordedToday;
    if (filter === "done")    return s.recordedToday;
    return true;
  });

  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <HifzMark size={56} primary="#10B981" gold={colors.gold} />
        <div style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Loading your halqa...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
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
          <button onClick={handleSignOut} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>

        {/* Stats row */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Students",  val: stats.totalStudents, color: colors.primary,     bg: colors.green50 },
              { label: "Recorded",  val: stats.recordedToday, color: colors.successText, bg: colors.successBg },
              { label: "Pending",   val: stats.pendingToday,  color: colors.warningText, bg: colors.warningBg },
              { label: "At Risk",   val: stats.atRisk,        color: colors.errorText,   bg: colors.errorBg },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: colors.white, borderRadius: 10, padding: 4, border: `1px solid ${colors.n200}` }}>
          {(["all", "pending", "done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
              background: filter === f ? colors.primary : "transparent",
              color: filter === f ? colors.white : colors.n500,
              fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, textTransform: "capitalize",
              transition: "all 0.15s",
            }}>
              {f === "all" ? `All (${students.length})` : f === "pending" ? `Pending (${stats?.pendingToday || 0})` : `Done (${stats?.recordedToday || 0})`}
            </button>
          ))}
        </div>

        {/* Student list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ background: colors.white, borderRadius: 12, padding: 32, textAlign: "center", border: `1px solid ${colors.n200}` }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 600, color: colors.n700 }}>All students recorded!</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n400, marginTop: 4 }}>JazakAllah Khair for today.</div>
            </div>
          )}

          {filtered.map(student => (
            <div key={student.id} style={{
              background: colors.white, borderRadius: 14, padding: "16px",
              border: `1px solid ${student.recordedToday ? colors.green200 : colors.n200}`,
              borderLeft: `4px solid ${student.recordedToday ? colors.success : colors.primary}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: 12, background: student.recordedToday ? colors.successBg : colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: student.recordedToday ? colors.successText : colors.primary }}>
                  {student.recordedToday ? "✓" : student.name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>{student.name}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500 }}>Juz {student.currentJuz} · Page {student.currentPage}</span>
                  <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>{student.batchName}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                  <div style={{ flex: 1, height: 4, background: colors.n100, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${student.percentComplete}%`, background: `linear-gradient(90deg,${colors.primary},${colors.success})`, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400 }}>{Math.round(student.percentComplete)}%</span>
                  <HealthBadge score={student.manzilHealth} />
                </div>
              </div>

              {/* Action button */}
              {!student.recordedToday ? (
                <Link href={`/dashboard/ustadh/entry/${student.id}`} style={{
                  padding: "10px 16px", borderRadius: 10, background: colors.primary,
                  color: colors.white, fontSize: 12, fontWeight: 700, textDecoration: "none",
                  fontFamily: fonts.heading, flexShrink: 0, whiteSpace: "nowrap",
                }}>
                  Record →
                </Link>
              ) : (
                <Link href={`/dashboard/ustadh/entry/${student.id}`} style={{
                  padding: "10px 14px", borderRadius: 10, background: colors.green50,
                  color: colors.successText, fontSize: 11, fontWeight: 600, textDecoration: "none",
                  fontFamily: fonts.heading, flexShrink: 0, border: `1px solid ${colors.green200}`,
                }}>
                  Edit
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
