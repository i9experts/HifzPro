"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

type Status = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

interface Student { id: string; name: string; }
interface Batch   { id: string; name: string; students: Student[]; }

const STATUS_CONFIG = {
  PRESENT: { label: "P", labelFull: "Present", color: "#fff",           bg: colors.success,     border: colors.success },
  ABSENT:  { label: "A", labelFull: "Absent",  color: "#fff",           bg: colors.error,       border: colors.error },
  LATE:    { label: "L", labelFull: "Late",     color: "#fff",           bg: colors.warning,     border: colors.warning },
  LEAVE:   { label: "Lv",labelFull: "Leave",   color: colors.infoText,  bg: colors.infoBg,      border: colors.info },
} as const;

export default function AttendancePage() {
  const [batches,   setBatches]   = useState<Batch[]>([]);
  const [batchIdx,  setBatchIdx]  = useState(0);
  const [attendance,setAttendance]= useState<Record<string, Status>>({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [date,      setDate]      = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch(`/api/attendance?date=${date}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBatches(d.data.batches);
          // Pre-fill from existing records
          const existing: Record<string,Status> = {};
          d.data.sessions.forEach((s: any) =>
            s.records.forEach((r: any) => { existing[r.studentId] = r.status; })
          );
          setAttendance(existing);
        }
      })
      .finally(() => setLoading(false));
  }, [date]);

  const batch = batches[batchIdx];

  const setStatus = (studentId: string, status: Status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status: Status) => {
    if (!batch) return;
    const all: Record<string,Status> = {};
    batch.students.forEach(s => { all[s.id] = status; });
    setAttendance(prev => ({ ...prev, ...all }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!batch) return;
    setSaving(true);
    const records = batch.students.map(s => ({
      studentId: s.id,
      status:    attendance[s.id] || "PRESENT",
    }));
    try {
      const res  = await fetch("/api/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: batch.id, date, records }),
      });
      const data = await res.json();
      if (data.success) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const stats = batch ? {
    present: batch.students.filter(s => (attendance[s.id] || "PRESENT") === "PRESENT").length,
    absent:  batch.students.filter(s => attendance[s.id] === "ABSENT").length,
    late:    batch.students.filter(s => attendance[s.id] === "LATE").length,
    leave:   batch.students.filter(s => attendance[s.id] === "LEAVE").length,
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Header */}
      <div style={{ background: colors.deep, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/ustadh" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 18 }}>←</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>📅 Attendance</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>حاضری</div>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: colors.white, padding: "6px 10px", fontSize: 11, fontFamily: fonts.mono, outline: "none" }}
        />
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>

        {/* Batch selector */}
        {batches.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
            {batches.map((b, i) => (
              <button key={b.id} onClick={() => setBatchIdx(i)} style={{
                padding: "8px 16px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
                background: batchIdx === i ? colors.primary : colors.white,
                color: batchIdx === i ? colors.white : colors.n600,
                fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
                border: `1px solid ${batchIdx === i ? colors.primary : colors.n200}`,
              }}>{b.name}</button>
            ))}
          </div>
        )}

        {/* Stats strip */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { val: stats.present, label: "Present", color: colors.successText, bg: colors.successBg },
              { val: stats.absent,  label: "Absent",  color: colors.errorText,   bg: colors.errorBg },
              { val: stats.late,    label: "Late",     color: colors.warningText, bg: colors.warningBg },
              { val: stats.leave,   label: "Leave",    color: colors.infoText,    bg: colors.infoBg },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 9, color: s.color, opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => markAll("PRESENT")} style={{ flex: 1, padding: "10px", borderRadius: 10, background: colors.successBg, border: `1px solid ${colors.green200}`, color: colors.successText, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
            ✓ All Present
          </button>
          <button onClick={() => markAll("ABSENT")} style={{ flex: 1, padding: "10px", borderRadius: 10, background: colors.errorBg, border: `1px solid ${colors.error}33`, color: colors.errorText, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
            ✗ All Absent
          </button>
        </div>

        {/* Student list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: colors.n400, fontFamily: fonts.body }}>Loading students...</div>
        ) : !batch ? (
          <div style={{ textAlign: "center", padding: 40, color: colors.n400, fontFamily: fonts.body }}>No batch assigned</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {batch.students.map((student, idx) => {
              const status = attendance[student.id] || "PRESENT";
              const cfg    = STATUS_CONFIG[status];
              return (
                <div key={student.id} style={{ background: colors.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${colors.n200}`, display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Number */}
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.n100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n500 }}>{idx + 1}</span>
                  </div>
                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{student.name}</div>
                  </div>
                  {/* Status buttons */}
                  <div style={{ display: "flex", gap: 5 }}>
                    {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
                      const c = STATUS_CONFIG[s];
                      const active = status === s;
                      return (
                        <button key={s} onClick={() => setStatus(student.id, s)} style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: active ? c.bg : colors.n50,
                          border: `1.5px solid ${active ? c.border : colors.n200}`,
                          color: active ? c.color : colors.n400,
                          fontSize: 10, fontWeight: 700, cursor: "pointer",
                          fontFamily: fonts.mono, transition: "all 0.15s",
                        }}>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save */}
        {saved && (
          <div style={{ background: colors.successBg, borderRadius: 10, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
            <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.successText }}>✓ Attendance saved successfully!</span>
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !batch} style={{
          width: "100%", padding: "15px", borderRadius: 12,
          background: saving ? colors.n300 : colors.primary,
          color: colors.white, fontSize: 15, fontWeight: 700,
          border: "none", cursor: saving ? "not-allowed" : "pointer",
          fontFamily: fonts.heading, boxShadow: `0 4px 14px rgba(13,92,58,0.2)`,
        }}>
          {saving ? "Saving..." : `Save Attendance (${batch?.students.length || 0} Students)`}
        </button>
      </div>
    </div>
  );
}
