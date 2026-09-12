"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id: string; name: string; enrollmentNumber: string | null;
  progress: { currentJuz: number; currentPage: number } | null;
  batch: { name: string } | null;
}

export default function HifzDiaryStudentPicker() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    fetch("/api/ustadh/students")
      .then(r => r.json())
      .then(d => { if (d.success) setStudents(d.data.students); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <div style={{ background: colors.deep, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/ustadh" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 18 }}>
          ←
        </Link>
        <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>
          Hifz Diary — Select Student
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search student name..."
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${colors.n200}`, marginBottom: 16, fontSize: 14, fontFamily: fonts.body, outline: "none" }}
        />

        {loading && (
          <div style={{ textAlign: "center", color: colors.n400, fontFamily: fonts.body, padding: 40 }}>Loading students...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ background: colors.white, borderRadius: 14, padding: 40, textAlign: "center", border: `1px solid ${colors.n200}` }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.n700 }}>
              {students.length === 0 ? "No students assigned to your halqa yet" : "No students match your search"}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(s => (
            <Link key={s.id} href={`/dashboard/ustadh/entry/${s.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: colors.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${colors.n200}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.primary }}>{s.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{s.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500, marginTop: 2 }}>
                    {s.batch?.name ? `${s.batch.name} · ` : ""}Juz {s.progress?.currentJuz ?? "—"} · Page {s.progress?.currentPage ?? "—"}
                  </div>
                </div>
                <span style={{ color: colors.primary, fontSize: 18 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
