"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import EmptyState from "@/components/marketplace/EmptyState";
import { SkeletonBlock } from "@/components/marketplace/Skeleton";
import { GraduationCapIcon } from "@/components/ui/Icons";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id: string; name: string; enrollmentNumber: string | null; program: string;
  progress: { currentJuz: number; currentPage: number | null; percentComplete: number } | null;
  manzilHealth: { score: number }[];
  batch: { name: string } | null;
}

const PROGRAM_LABELS: Record<string, string> = { HIFZ: "Hifz", NAZRA: "Nazra", TAJWEED: "Tajweed", GIRDAAN: "Girdaan" };

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ustadh/students")
      .then(r => r.json())
      .then(d => { if (d.success) setStudents(d.data.students); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px 48px" }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>My Students</h1>
        <p style={{ fontSize: 13, color: colors.n500, marginBottom: 20 }}>
          Students you're teaching through booked, paid lessons — track their memorization progress and attendance here.
        </p>

        {loading && (
          <div style={{ display: "grid", gap: 10 }}>
            {[0, 1, 2].map(i => <SkeletonBlock key={i} width="100%" height={72} radius={14} />)}
          </div>
        )}

        {!loading && students.length === 0 && (
          <EmptyState
            icon={<GraduationCapIcon size={32} />}
            title="No students yet"
            description="Once a parent books and pays for lessons with you, their child appears here so you can log lessons and attendance."
          />
        )}

        {!loading && students.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {students.map(s => {
              const health = s.manzilHealth[0]?.score ?? null;
              return (
                <Link key={s.id} href={`/dashboard/teacher/students/${s.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.green50, border: `1px solid ${colors.green200}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <GraduationCapIcon size={19} className="hp-icon-primary" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, color: colors.n800 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: colors.n500, marginTop: 1 }}>
                        {PROGRAM_LABELS[s.program] || s.program}
                        {s.progress && ` · Juz ${s.progress.currentJuz} · ${Math.round(s.progress.percentComplete)}% complete`}
                      </div>
                    </div>
                    {health != null && (
                      <div style={{
                        fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "4px 10px", flexShrink: 0,
                        color: health >= 70 ? colors.successText : health >= 50 ? colors.warningText : colors.errorText,
                        background: health >= 70 ? colors.successBg : health >= 50 ? colors.warningBg : colors.errorBg,
                      }}>
                        {Math.round(health)}% retention
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style jsx global>{`.hp-icon-primary { color: ${colors.primary}; }`}</style>
    </div>
  );
}
