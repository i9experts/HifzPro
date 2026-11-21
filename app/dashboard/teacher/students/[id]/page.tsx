"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SkeletonBlock } from "@/components/marketplace/Skeleton";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { colors, fonts, shadows } from "@/lib/tokens";

interface StudentDetail {
  id: string; name: string; program: string; batchId: string | null;
  progress: { currentJuz: number; currentPage: number | null; percentComplete: number } | null;
  manzilHealth: number | null;
  guardian: { name: string; phone: string | null; whatsapp: string | null } | null;
}
interface Entry {
  id: string; lessonType: string; date: string; grade: string | null; notes: string | null;
  juzFrom: number | null; juzTo: number | null; pageFrom: number | null; pageTo: number | null;
}

const LESSON_TYPES = [
  { value: "SABAQ", label: "Sabaq (new lesson)" },
  { value: "SABQI", label: "Sabqi (recent revision)" },
  { value: "MANZIL", label: "Manzil (long-term revision)" },
  { value: "GIRDAAN", label: "Girdaan (revision cycle)" },
];
const GRADES = ["EXCELLENT", "GOOD", "WEAK", "REPEAT"];

function fieldStyle(): React.CSSProperties {
  return { width: "100%", padding: "9px 10px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n700, outline: "none" };
}
function labelStyle(): React.CSSProperties {
  return { fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n500, marginBottom: 4, display: "block" };
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [lessonType, setLessonType] = useState("SABAQ");
  const [juzFrom, setJuzFrom] = useState(""); const [juzTo, setJuzTo] = useState("");
  const [pageFrom, setPageFrom] = useState(""); const [pageTo, setPageTo] = useState("");
  const [grade, setGrade] = useState("GOOD");
  const [notes, setNotes] = useState("");

  const load = useCallback(() => {
    fetch(`/api/students/${id}/last-entry`).then(r => r.json()).then(d => {
      if (d.success) { setStudent(d.data.student); setEntries(d.data.recentEntries || []); }
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/lesson-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id, lessonType,
          juzFrom: juzFrom ? Number(juzFrom) : undefined, juzTo: juzTo ? Number(juzTo) : undefined,
          pageFrom: pageFrom ? Number(pageFrom) : undefined, pageTo: pageTo ? Number(pageTo) : undefined,
          grade, notes: notes || undefined,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setMessage({ type: "ok", text: "Lesson entry saved." });
        setNotes(""); setJuzFrom(""); setJuzTo(""); setPageFrom(""); setPageTo("");
        load();
      } else setMessage({ type: "err", text: d.error || "Could not save entry." });
    } catch { setMessage({ type: "err", text: "Could not save entry." }); }
    finally { setSaving(false); }
  };

  const markAttendance = async (status: "PRESENT" | "ABSENT" | "LATE") => {
    if (!student?.batchId) return;
    setMarking(true); setMessage(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: student.batchId,
          date: new Date().toISOString().split("T")[0],
          records: [{ studentId: id, status }],
        }),
      });
      const d = await res.json();
      setMessage(d.success ? { type: "ok", text: `Marked ${status.toLowerCase()} for today.` } : { type: "err", text: d.error || "Could not save attendance." });
    } catch { setMessage({ type: "err", text: "Could not save attendance." }); }
    finally { setMarking(false); }
  };

  if (loading) {
    return <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}><SkeletonBlock width="100%" height={200} radius={16} /></div>;
  }
  if (!student) {
    return <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px", color: colors.n500 }}>Student not found.</div>;
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 48px", display: "grid", gap: 18 }}>
      <Link href="/dashboard/teacher/students" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: colors.n500, fontSize: 12.5, fontFamily: fonts.heading, fontWeight: 600, textDecoration: "none" }}>
        <ArrowLeftIcon size={14} /> My Students
      </Link>

      <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: "18px 20px", boxShadow: shadows.sm }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 19, fontWeight: 700, color: colors.n800 }}>{student.name}</h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
          <div><div style={labelStyle()}>Current Juz</div><div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.primary }}>{student.progress?.currentJuz ?? 1}</div></div>
          <div><div style={labelStyle()}>Progress</div><div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.n800 }}>{Math.round(student.progress?.percentComplete ?? 0)}%</div></div>
          {student.manzilHealth != null && (
            <div><div style={labelStyle()}>Manzil Retention</div><div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.n800 }}>{Math.round(student.manzilHealth)}%</div></div>
          )}
        </div>
        {student.guardian && (
          <div style={{ fontSize: 12, color: colors.n500, marginTop: 10 }}>Guardian: {student.guardian.name}{student.guardian.phone ? ` · ${student.guardian.phone}` : ""}</div>
        )}
      </div>

      {student.batchId && (
        <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, color: colors.n800 }}>Today's attendance</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={marking} onClick={() => markAttendance("PRESENT")} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${colors.green200}`, background: colors.green50, color: colors.primary, fontFamily: fonts.heading, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Present</button>
            <button disabled={marking} onClick={() => markAttendance("LATE")} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${colors.warning}55`, background: colors.warningBg, color: colors.warningText, fontFamily: fonts.heading, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Late</button>
            <button disabled={marking} onClick={() => markAttendance("ABSENT")} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${colors.error}55`, background: colors.errorBg, color: colors.errorText, fontFamily: fonts.heading, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Absent</button>
          </div>
        </div>
      )}

      {message && (
        <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 12.5, fontFamily: fonts.heading, fontWeight: 600, background: message.type === "ok" ? colors.successBg : colors.errorBg, color: message.type === "ok" ? colors.successText : colors.errorText }}>
          {message.text}
        </div>
      )}

      <form onSubmit={submitEntry} style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "18px 20px", display: "grid", gap: 12 }}>
        <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, color: colors.n800 }}>Record a lesson</div>

        <div>
          <label style={labelStyle()}>Lesson type</label>
          <select value={lessonType} onChange={e => setLessonType(e.target.value)} style={fieldStyle()}>
            {LESSON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelStyle()}>From Juz</label><input type="number" min={1} max={30} value={juzFrom} onChange={e => setJuzFrom(e.target.value)} style={fieldStyle()} /></div>
          <div><label style={labelStyle()}>To Juz</label><input type="number" min={1} max={30} value={juzTo} onChange={e => setJuzTo(e.target.value)} style={fieldStyle()} /></div>
          <div><label style={labelStyle()}>From Page</label><input type="number" min={1} value={pageFrom} onChange={e => setPageFrom(e.target.value)} style={fieldStyle()} /></div>
          <div><label style={labelStyle()}>To Page</label><input type="number" min={1} value={pageTo} onChange={e => setPageTo(e.target.value)} style={fieldStyle()} /></div>
        </div>

        <div>
          <label style={labelStyle()}>Grade</label>
          <select value={grade} onChange={e => setGrade(e.target.value)} style={fieldStyle()}>
            {GRADES.map(g => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle()}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...fieldStyle(), resize: "vertical" }} />
        </div>

        <button type="submit" disabled={saving} style={{ justifySelf: "start", padding: "10px 20px", borderRadius: 9, border: "none", background: colors.primary, color: "white", fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save entry"}
        </button>
      </form>

      <div>
        <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, color: colors.n800, marginBottom: 10 }}>Recent lessons</div>
        {entries.length === 0 ? (
          <div style={{ fontSize: 13, color: colors.n500 }}>No lessons recorded yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {entries.map(e => (
              <div key={e.id} style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 12.5, color: colors.n800 }}>{LESSON_TYPES.find(t => t.value === e.lessonType)?.label || e.lessonType}</div>
                  <div style={{ fontSize: 11.5, color: colors.n500, marginTop: 1 }}>
                    {new Date(e.date).toLocaleDateString()}
                    {e.juzFrom != null && e.juzTo != null && ` · Juz ${e.juzFrom}–${e.juzTo}`}
                    {e.notes ? ` · ${e.notes}` : ""}
                  </div>
                </div>
                {e.grade && (
                  <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: colors.n600, background: colors.n100, borderRadius: 999, padding: "3px 10px", alignSelf: "center" }}>{e.grade}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
