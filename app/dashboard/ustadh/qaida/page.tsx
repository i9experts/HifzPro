"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";
import { TAKHTIS, TOTAL_TAKHTIS } from "@/lib/qaida-16takhti";

const AMBER = "#b45309";
const serif = "'Cormorant Garamond',serif";

type TakhtiStatus = "NOT_STARTED" | "IN_PROGRESS" | "NEEDS_REVISION" | "MASTERED";
type Rating = "NEEDS_PRACTICE" | "DEVELOPING" | "PROFICIENT" | "MASTERED";

interface TakhtiProgress {
  takhtiNumber: number;
  status: TakhtiStatus;
  lastAttempt: { rating: Rating; makhrajAccuracy: number; tajweedAccuracy: number; fluency: number; attemptDate: string } | null;
}
interface QaidaData {
  student: { id: string; name: string; program: string; batchName: string | null };
  summary: { masteredCount: number; totalTakhtis: number; currentTakhti: number; needsRevisionCount: number; overallStatus: string };
  takhtiProgress: TakhtiProgress[];
}

const RATINGS: { id: Rating; label: string }[] = [
  { id: "NEEDS_PRACTICE", label: "Needs Practice" },
  { id: "DEVELOPING", label: "Developing" },
  { id: "PROFICIENT", label: "Proficient" },
  { id: "MASTERED", label: "Mastered" },
];

function statusStyle(status: TakhtiStatus): { color: string; bg: string; border: string } {
  switch (status) {
    case "MASTERED": return { color: colors.successText, bg: colors.successBg, border: colors.success };
    case "NEEDS_REVISION": return { color: colors.warningText, bg: colors.warningBg, border: colors.warning };
    case "IN_PROGRESS": return { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" };
    default: return { color: colors.n500, bg: colors.n100, border: colors.n200 };
  }
}

function todayLocal(): string { return new Date().toISOString().split("T")[0]; }
function nowLocal(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function QaidaPage() {
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState<QaidaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTakhti, setActiveTakhti] = useState<number | null>(null);

  const [date, setDate] = useState(todayLocal());
  const [time, setTime] = useState(nowLocal());
  const [rating, setRating] = useState<Rating | "">("");
  const [makhraj, setMakhraj] = useState(3);
  const [tajweed, setTajweed] = useState(3);
  const [fluency, setFluency] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ustadh/dashboard")
      .then(r => r.json())
      .then(d => { if (d.success) { setStudents(d.data.students); if (d.data.students.length > 0) setSelected(d.data.students[0].id); } });
  }, []);

  const loadQaida = useCallback(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/students/${selected}/qaida`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [selected]);

  useEffect(loadQaida, [loadQaida]);

  const openTakhti = (n: number) => {
    setActiveTakhti(n);
    setRating(""); setMakhraj(3); setTajweed(3); setFluency(3); setNotes(""); setError("");
    setDate(todayLocal()); setTime(nowLocal());
  };

  const handleSave = async () => {
    if (!activeTakhti || !rating) { setError("Select a rating before saving"); return; }
    setSaving(true); setError("");
    try {
      const attemptDate = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch(`/api/students/${selected}/qaida/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ takhtiNumber: activeTakhti, rating, makhrajAccuracy: makhraj, tajweedAccuracy: tajweed, fluency, notes: notes || undefined, attemptDate }),
      });
      const d = await res.json();
      if (!d.success) { setError(d.error || "Failed to save"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadQaida();
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const takhtiDef = activeTakhti ? TAKHTIS[activeTakhti - 1] : null;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <div style={{ background: `linear-gradient(135deg,#78350f,${AMBER})`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/ustadh" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 18 }}>←</Link>
        <div>
          <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>📖 Noorani Qaida Tracker</div>
          <div style={{ fontFamily: serif, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>قاعدہ نورانیہ — 16 تختیاں</div>
        </div>
        {data && (
          <button onClick={() => window.print()} style={{ marginLeft: "auto", padding: "9px 16px", borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: colors.white, fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ⬇ Download Report
          </button>
        )}
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px" }}>
        {/* Student picker */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: AMBER, fontFamily: fonts.mono, marginBottom: 10 }}>SELECT STUDENT</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {students.map(s => (
              <button key={s.id} onClick={() => { setSelected(s.id); setActiveTakhti(null); }} style={{
                padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${selected === s.id ? AMBER : colors.n200}`,
                background: selected === s.id ? `${AMBER}12` : colors.white, cursor: "pointer",
                fontFamily: fonts.heading, fontSize: 13, fontWeight: selected === s.id ? 700 : 400, color: selected === s.id ? AMBER : colors.n700,
              }}>{s.name}</button>
            ))}
          </div>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 30, color: colors.n500 }}>Loading…</div>}

        {!loading && data && (
          <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
              <div style={{ background: colors.successBg, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 800, color: colors.successText }}>{data.summary.masteredCount}/{data.summary.totalTakhtis}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.successText, marginTop: 2 }}>Mastered</div>
              </div>
              <div style={{ background: "#eff6ff", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 800, color: "#1d4ed8" }}>Takhti {data.summary.currentTakhti}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: "#1d4ed8", marginTop: 2 }}>Currently On</div>
              </div>
              <div style={{ background: colors.warningBg, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 800, color: colors.warningText }}>{data.summary.needsRevisionCount}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.warningText, marginTop: 2 }}>Needs Revision</div>
              </div>
              <div style={{ background: colors.n100, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 800, color: colors.n700 }}>{data.summary.overallStatus.replace("_", " ")}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500, marginTop: 2 }}>Overall Status</div>
              </div>
            </div>

            {/* 16-Takhti journey grid */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: AMBER, fontFamily: fonts.mono, marginBottom: 12 }}>THE 16-TAKHTI JOURNEY</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {data.takhtiProgress.map(tp => {
                  const st = statusStyle(tp.status);
                  const def = TAKHTIS[tp.takhtiNumber - 1];
                  const isActive = activeTakhti === tp.takhtiNumber;
                  return (
                    <button key={tp.takhtiNumber} onClick={() => openTakhti(tp.takhtiNumber)} style={{
                      padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${isActive ? AMBER : st.border}`,
                      background: isActive ? `${AMBER}15` : st.bg, cursor: "pointer", textAlign: "center",
                    }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 800, color: isActive ? AMBER : st.color }}>{tp.takhtiNumber}</div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: isActive ? AMBER : st.color, marginTop: 2, lineHeight: 1.3 }}>{def.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Record Attempt panel */}
            {takhtiDef && (
              <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `2px solid ${AMBER}40`, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.n800 }}>
                      Record Attempt — Takhti {takhtiDef.number}: {takhtiDef.title} <span style={{ fontFamily: serif, color: AMBER }}>({takhtiDef.titleArabic})</span>
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginTop: 4 }}>{takhtiDef.description}</div>
                  </div>
                  <button onClick={() => setActiveTakhti(null)} style={{ background: "none", border: "none", fontSize: 18, color: colors.n400, cursor: "pointer" }}>✕</button>
                </div>

                <div style={{ marginTop: 14, padding: 16, borderRadius: 12, background: "#fffbeb", border: `1.5px solid #fde68a` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontSize: 10, color: AMBER, marginBottom: 10 }}>
                    <span>NOORANI QAIDA — TAKHTI {takhtiDef.number}</span>
                  </div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginBottom: 10 }}>{takhtiDef.contentLabel}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, direction: "rtl" }}>
                    {takhtiDef.items.map((item, i) => (
                      <div key={i} style={{ padding: "10px 12px", minWidth: 44, borderRadius: 10, background: colors.white, border: `1.5px solid #fde68a`, textAlign: "center" }}>
                        <div style={{ fontFamily: serif, fontSize: takhtiDef.contentType === "letters" ? 24 : 18, color: colors.n800 }}>{item.text}</div>
                        {item.sub && <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 2 }}>{item.sub}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
                  <div>
                    <label style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, fontSize: 13, fontFamily: fonts.body }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, fontSize: 13, fontFamily: fonts.body }} />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 8 }}>RATING</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {RATINGS.map(r => (
                      <button key={r.id} onClick={() => setRating(r.id)} style={{
                        padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${rating === r.id ? AMBER : colors.n200}`,
                        background: rating === r.id ? `${AMBER}15` : colors.n50, cursor: "pointer",
                        fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: rating === r.id ? AMBER : colors.n600,
                      }}>{r.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
                  {[
                    { label: "Makhraj Accuracy", val: makhraj, set: setMakhraj },
                    { label: "Tajweed Accuracy", val: tajweed, set: setTajweed },
                    { label: "Fluency", val: fluency, set: setFluency },
                  ].map(scale => (
                    <div key={scale.label}>
                      <label style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 8 }}>{scale.label}</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => scale.set(n)} style={{
                            width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer",
                            background: n <= scale.val ? colors.primary : colors.n200,
                            color: n <= scale.val ? colors.white : colors.n500,
                            fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                          }}>{n}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes about this attempt..."
                    style={{ width: "100%", padding: 10, border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n700, resize: "none", outline: "none" }} />
                </div>

                {error && <div style={{ background: colors.errorBg, borderRadius: 10, padding: 12, marginTop: 12 }}><span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.errorText }}>⚠ {error}</span></div>}
                {saved && <div style={{ background: colors.successBg, borderRadius: 10, padding: 12, marginTop: 12, textAlign: "center" }}><span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.successText }}>✓ Saved!</span></div>}

                <button onClick={handleSave} disabled={saving || !rating} style={{
                  width: "100%", padding: 14, borderRadius: 12, marginTop: 14, border: "none",
                  background: !rating ? colors.n300 : AMBER, color: colors.white,
                  fontSize: 14, fontWeight: 700, cursor: !rating || saving ? "not-allowed" : "pointer", fontFamily: fonts.heading,
                }}>
                  {saving ? "Saving…" : "Save Attempt"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
