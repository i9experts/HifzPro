"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

type LessonType = "SABAQ" | "SABQI" | "MANZIL";
type Grade      = "EXCELLENT" | "GOOD" | "WEAK" | "REPEAT";
type MistakeType = "ATAK" | "TAJWEED" | "LAHN_JALI" | "LAHN_KHAFI";

interface StudentData {
  id:          string;
  name:        string;
  program:     string;
  manzilHealth: number | null;
  progress:    { currentJuz: number; currentPage: number; currentSurah?: number; currentAyah?: number; percentComplete: number } | null;
  guardian:    { name: string; whatsapp?: string } | null;
}

interface LastEntry {
  juzTo?: number; surahTo?: number; ayahTo?: number; pageTo?: number;
  juzFrom?: number; surahFrom?: number; ayahFrom?: number; pageFrom?: number;
  grade?: Grade;
}

const LESSON_TABS: { id: LessonType; label: string; arabic: string; color: string }[] = [
  { id: "SABAQ",  label: "Sabaq",  arabic: "سبق",  color: colors.primary },
  { id: "SABQI",  label: "Sabqi",  arabic: "سبقی", color: colors.gold },
  { id: "MANZIL", label: "Manzil", arabic: "منزل", color: "#6366f1" },
];

const GRADES: { id: Grade; label: string; emoji: string; color: string; bg: string }[] = [
  { id: "EXCELLENT", label: "Excellent", emoji: "⭐", color: "#166534", bg: "#dcfce7" },
  { id: "GOOD",      label: "Good",      emoji: "👍", color: colors.primary, bg: colors.green50 },
  { id: "WEAK",      label: "Weak",      emoji: "⚠️", color: colors.warningText, bg: colors.warningBg },
  { id: "REPEAT",    label: "Repeat",    emoji: "🔄", color: colors.errorText, bg: colors.errorBg },
];

const MISTAKE_TYPES: { id: MistakeType; label: string; labelUrdu: string }[] = [
  { id: "ATAK",      label: "Atak",      labelUrdu: "اٹک" },
  { id: "TAJWEED",   label: "Tajweed",   labelUrdu: "تجوید" },
  { id: "LAHN_JALI", label: "Lahn Jali", labelUrdu: "لحن جلی" },
  { id: "LAHN_KHAFI",label: "Lahn Khafi",labelUrdu: "لحن خفی" },
];

export default function EntryPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const router = useRouter();

  const [student,    setStudent]    = useState<StudentData | null>(null);
  const [lastEntry,  setLastEntry]  = useState<LastEntry | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");

  // Form state
  const [lessonType, setLessonType] = useState<LessonType>("SABAQ");
  const [grade,      setGrade]      = useState<Grade | "">("");
  const [juzFrom,    setJuzFrom]    = useState(1);
  const [pageFrom,   setPageFrom]   = useState(1);
  const [juzTo,      setJuzTo]      = useState(1);
  const [pageTo,     setPageTo]     = useState(1);
  const [ayahFrom,   setAyahFrom]   = useState<number | "">("");
  const [ayahTo,     setAyahTo]     = useState<number | "">("");
  const [mistakeCount, setMistakeCount] = useState(0);
  const [mistakes,   setMistakes]   = useState<{ type: MistakeType; count: number }[]>([]);
  const [notes,      setNotes]      = useState("");
  const [showMistakes, setShowMistakes] = useState(false);

  useEffect(() => {
    fetch(`/api/students/${studentId}/last-entry`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStudent(data.data.student);
          const le = data.data.lastEntry;
          setLastEntry(le);
          // Pre-fill from last entry or progress
          const prog = data.data.student?.progress;
          if (le) {
            setJuzFrom(le.juzTo || prog?.currentJuz || 1);
            setPageFrom(le.pageTo || prog?.currentPage || 1);
            setJuzTo(le.juzTo || prog?.currentJuz || 1);
            setPageTo(le.pageTo || prog?.currentPage || 1);
            if (le.ayahTo) { setAyahFrom(le.ayahTo); setAyahTo(le.ayahTo); }
          } else if (prog) {
            setJuzFrom(prog.currentJuz || 1);
            setPageFrom(prog.currentPage || 1);
            setJuzTo(prog.currentJuz || 1);
            setPageTo(prog.currentPage || 1);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleSave = async () => {
    if (!grade) { setError("Please select a grade"); return; }
    setSaving(true);
    setError("");

    const payload = {
      studentId,
      lessonType,
      juzFrom, pageFrom, ayahFrom: ayahFrom || undefined,
      juzTo,   pageTo,   ayahTo:   ayahTo || undefined,
      grade,
      mistakeCount,
      notes: notes || undefined,
      mistakes: mistakes.flatMap(m =>
        Array.from({ length: m.count }, () => ({ mistakeType: m.type }))
      ),
    };

    try {
      const res  = await fetch("/api/lesson-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setSaved(true);
        setTimeout(() => window.location.href = "/dashboard/ustadh", 1500);
      } else {
        setError(data.error || "Failed to save. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addMistake = (type: MistakeType) => {
    setMistakes(prev => {
      const existing = prev.find(m => m.type === type);
      if (existing) return prev.map(m => m.type === type ? { ...m, count: m.count + 1 } : m);
      return [...prev, { type, count: 1 }];
    });
    setMistakeCount(c => c + 1);
  };

  const numBtn = (label: string, val: number, setter: (v: number) => void, min = 1, max = 604) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, width: 52, flexShrink: 0 }}>{label}</span>
      <button onClick={() => setter(Math.max(min, val - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontSize: 16, color: colors.n600 }}>−</button>
      <input type="number" value={val} min={min} max={max}
        onChange={e => setter(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
        style={{ width: 56, textAlign: "center", padding: "6px", border: `1.5px solid ${colors.primary}`, borderRadius: 8, fontSize: 14, fontFamily: fonts.mono, fontWeight: 700, color: colors.primary, outline: "none" }}
      />
      <button onClick={() => setter(Math.min(max, val + 1))} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontSize: 16, color: colors.n600 }}>+</button>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.4)" }}>Loading student data...</div>
    </div>
  );

  if (saved) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.white, marginBottom: 8 }}>Saved!</div>
        <div style={{ fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Returning to halqa...</div>
      </div>
    </div>
  );

  const activeTab = LESSON_TABS.find(t => t.id === lessonType)!;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Header */}
      <div style={{ background: colors.deep, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/ustadh" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 18 }}>
          ←
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>
            {student?.name || "Student"}
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Juz {student?.progress?.currentJuz || "—"} · Page {student?.progress?.currentPage || "—"} · {student?.program}
          </div>
        </div>
        {/* Manzil health */}
        {student?.manzilHealth !== null && student?.manzilHealth !== undefined && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: student.manzilHealth >= 75 ? colors.success : student.manzilHealth >= 55 ? colors.gold : colors.error }}>
              {Math.round(student.manzilHealth)}%
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>MANZIL</div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>

        {/* Lesson type tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: colors.white, borderRadius: 12, padding: 4, border: `1px solid ${colors.n200}` }}>
          {LESSON_TABS.map(tab => (
            <button key={tab.id} onClick={() => setLessonType(tab.id)} style={{
              flex: 1, padding: "12px 8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: lessonType === tab.id ? tab.color : "transparent",
              transition: "all 0.15s",
            }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: lessonType === tab.id ? colors.white : colors.n500 }}>
                {tab.label}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: lessonType === tab.id ? "rgba(255,255,255,0.7)" : colors.n400, marginTop: 1 }}>
                {tab.arabic}
              </div>
            </button>
          ))}
        </div>

        {/* Quran reference */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 20, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: activeTab.color, fontFamily: fonts.mono, marginBottom: 14 }}>
            QURAN REFERENCE — {activeTab.label.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {numBtn("Juz From", juzFrom, setJuzFrom, 1, 30)}
              {numBtn("Page From", pageFrom, setPageFrom, 1, 604)}
            </div>
            <div style={{ height: 1, background: colors.n100 }} />
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {numBtn("Juz To", juzTo, setJuzTo, 1, 30)}
              {numBtn("Page To", pageTo, setPageTo, 1, 604)}
            </div>
          </div>
        </div>

        {/* Grade selector */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 20, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: colors.n500, fontFamily: fonts.mono, marginBottom: 14 }}>GRADE *</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {GRADES.map(g => (
              <button key={g.id} onClick={() => setGrade(g.id)} style={{
                padding: "14px 12px", borderRadius: 12, border: `2px solid ${grade === g.id ? g.color : colors.n200}`,
                background: grade === g.id ? g.bg : colors.n50,
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>{g.emoji}</span>
                <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: grade === g.id ? g.color : colors.n600 }}>
                  {g.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mistake counter */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 20, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: colors.n500, fontFamily: fonts.mono }}>MISTAKES</div>
            <button onClick={() => setShowMistakes(!showMistakes)} style={{ fontSize: 11, color: colors.primary, background: "none", border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
              {showMistakes ? "Hide details ▲" : "Add details ▼"}
            </button>
          </div>
          {/* Quick count */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: showMistakes ? 16 : 0 }}>
            <button onClick={() => setMistakeCount(c => Math.max(0, c - 1))} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontSize: 20, color: colors.n600, fontFamily: fonts.heading }}>−</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 32, fontWeight: 700, color: mistakeCount === 0 ? colors.success : mistakeCount < 5 ? colors.warning : colors.error }}>
                {mistakeCount}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>total mistakes</div>
            </div>
            <button onClick={() => setMistakeCount(c => c + 1)} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontSize: 20, color: colors.n600, fontFamily: fonts.heading }}>+</button>
          </div>
          {/* Mistake types */}
          {showMistakes && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MISTAKE_TYPES.map(m => {
                const count = mistakes.find(x => x.type === m.id)?.count || 0;
                return (
                  <button key={m.id} onClick={() => addMistake(m.id)} style={{
                    padding: "10px 12px", borderRadius: 10, border: `1px solid ${count > 0 ? colors.error : colors.n200}`,
                    background: count > 0 ? colors.errorBg : colors.n50, cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: count > 0 ? colors.errorText : colors.n600 }}>{m.label}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: colors.n400 }}>{m.labelUrdu}</div>
                    </div>
                    {count > 0 && (
                      <span style={{ background: colors.error, color: colors.white, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: fonts.mono }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 20, border: `1px solid ${colors.n200}`, marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: colors.n500, fontFamily: fonts.mono, marginBottom: 10 }}>NOTES (OPTIONAL)</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Any notes for this lesson..."
            style={{ width: "100%", padding: "10px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n700, resize: "none", outline: "none" }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: colors.errorBg, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
            <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.errorText }}>⚠ {error}</span>
          </div>
        )}

        {/* Save button */}
        <button onClick={handleSave} disabled={saving || !grade} style={{
          width: "100%", padding: "16px", borderRadius: 14,
          background: !grade ? colors.n300 : saving ? colors.primaryLight : colors.primary,
          color: colors.white, fontSize: 16, fontWeight: 700, border: "none",
          cursor: !grade || saving ? "not-allowed" : "pointer",
          fontFamily: fonts.heading, boxShadow: grade ? `0 4px 16px rgba(13,92,58,0.25)` : "none",
          transition: "all 0.2s",
        }}>
          {saving ? "Saving..." : `Save ${activeTab.label} Entry`}
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontFamily: fonts.body, fontSize: 11, color: colors.n400 }}>
          Entry will be saved to the database and parent will be notified
        </div>
      </div>
    </div>
  );
}
