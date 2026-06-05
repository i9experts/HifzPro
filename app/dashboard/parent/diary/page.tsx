"use client";
import { useState } from "react";
import { useParent } from "../layout";
import { colors, fonts } from "@/lib/tokens";

const GRADE_INFO: Record<string, { label: string; ur: string; color: string; bg: string; emoji: string }> = {
  EXCELLENT: { label: "Excellent",  ur: "بہت اچھا",  color: "#166534",          bg: "#dcfce7", emoji: "⭐" },
  GOOD:      { label: "Good",       ur: "اچھا",      color: colors.primary,     bg: colors.green50, emoji: "✅" },
  WEAK:      { label: "Weak",       ur: "کمزور",     color: colors.warningText, bg: colors.warningBg, emoji: "⚠️" },
  REPEAT:    { label: "Repeat",     ur: "دوبارہ",    color: colors.errorText,   bg: colors.errorBg, emoji: "🔄" },
};

const LESSON_TYPE_INFO: Record<string, { label: string; ur: string; color: string }> = {
  SABAQ:   { label: "Sabaq",  ur: "سبق",  color: colors.primary },
  SABQI:   { label: "Sabqi",  ur: "سبقی", color: "#d97706" },
  MANZIL:  { label: "Manzil", ur: "منزل", color: "#7c3aed" },
  GIRDAAN: { label: "Girdaan",ur: "گردان",color: "#0f766e" },
};

type FilterType = "ALL" | "SABAQ" | "SABQI" | "MANZIL" | "GIRDAAN";

export default function DiaryPage() {
  const { student, loading } = useParent();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: colors.n400, fontFamily: fonts.body }}>Loading diary...</div>;
  if (!student) return <div style={{ padding: 32, textAlign: "center", color: colors.n400, fontFamily: fonts.body }}>No student data</div>;

  const lessons = student.recentLessons || [];
  const filtered = filter === "ALL" ? lessons : lessons.filter((l: any) => l.lessonType === filter);

  // Group by date
  const grouped: Record<string, any[]> = {};
  filtered.forEach((lesson: any) => {
    const date = new Date(lesson.date).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(lesson);
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (date.toDateString() === today) return "Today";
    if (date.toDateString() === yesterday) return "Yesterday";
    return date.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.gold, marginBottom: 4 }}>حفظ ڈائری · HIFZ DIARY</div>
        <div style={{ fontFamily: fonts.display, fontSize: "1.4rem", fontWeight: 700, color: colors.n800 }}>Lesson History</div>
        <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{lessons.length} lessons recorded</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {(["ALL","SABAQ","SABQI","MANZIL","GIRDAAN"] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 20, cursor: "pointer", whiteSpace: "nowrap",
            background: filter === f ? colors.primary : colors.white,
            color: filter === f ? colors.white : colors.n500,
            fontFamily: fonts.heading, fontSize: 11, fontWeight: 600,
            border: filter === f ? "none" : `1px solid ${colors.n200}`,
          }}>
            {f === "ALL" ? "All" : LESSON_TYPE_INFO[f]?.label}
            {f !== "ALL" && <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>{LESSON_TYPE_INFO[f]?.ur}</span>}
          </button>
        ))}
      </div>

      {/* Lesson list grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ background: colors.white, borderRadius: 14, padding: 40, textAlign: "center", border: `1px solid ${colors.n200}` }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <div style={{ fontFamily: fonts.heading, fontSize: 14, color: colors.n700 }}>No lessons found</div>
        </div>
      ) : (
        Object.entries(grouped).map(([dateStr, dayLessons]) => (
          <div key={dateStr} style={{ marginBottom: 16 }}>
            {/* Date header */}
            <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, marginBottom: 8, paddingLeft: 4 }}>
              {formatDate(dateStr)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dayLessons.map((lesson: any) => {
                const g = GRADE_INFO[lesson.grade] || { label:"—", ur:"—", color:colors.n400, bg:colors.n50, emoji:"—" };
                const t = LESSON_TYPE_INFO[lesson.lessonType] || { label: lesson.lessonType, ur: "", color: colors.n500 };
                const isExpanded = expanded === lesson.id;
                return (
                  <div key={lesson.id} style={{ background: colors.white, borderRadius: 14, overflow: "hidden", border: `1px solid ${colors.n200}`, borderLeft: `4px solid ${t.color}` }}>
                    <div onClick={() => setExpanded(isExpanded ? null : lesson.id)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Grade badge */}
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: g.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 18 }}>{g.emoji}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        {/* Type + Urdu */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: t.color }}>{t.label}</span>
                          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: colors.n400 }}>{t.ur}</span>
                        </div>
                        {/* Quran reference */}
                        <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n600 }}>
                          {lesson.juzFrom ? `Juz ${lesson.juzFrom}` : ""}
                          {lesson.pageFrom ? ` · Page ${lesson.pageFrom}` : ""}
                          {lesson.pageTo && lesson.pageTo !== lesson.pageFrom ? `–${lesson.pageTo}` : ""}
                        </div>
                        {/* Mistakes */}
                        {lesson.mistakeCount > 0 && (
                          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.errorText, marginTop: 2 }}>⚠ {lesson.mistakeCount} mistakes</div>
                        )}
                      </div>
                      {/* Grade label */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: g.color }}>{g.ur}</div>
                        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400 }}>{isExpanded ? "▲" : "▼"}</div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${colors.n100}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                          {[
                            { label: "Lesson Type", val: lesson.lessonType },
                            { label: "Grade",       val: `${g.emoji} ${g.label}` },
                            { label: "Juz",         val: lesson.juzFrom ? `Juz ${lesson.juzFrom}${lesson.juzTo && lesson.juzTo !== lesson.juzFrom ? `–${lesson.juzTo}` : ""}` : "—" },
                            { label: "Pages",       val: lesson.pageFrom ? `${lesson.pageFrom}${lesson.pageTo && lesson.pageTo !== lesson.pageFrom ? `–${lesson.pageTo}` : ""}` : "—" },
                            { label: "Mistakes",    val: String(lesson.mistakeCount || 0) },
                            { label: "Duration",    val: lesson.durationMins ? `${lesson.durationMins} min` : "—" },
                          ].map((s, i) => (
                            <div key={i} style={{ background: colors.n50, borderRadius: 8, padding: "8px 10px" }}>
                              <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.n400, letterSpacing: 0.5, marginBottom: 2 }}>{s.label.toUpperCase()}</div>
                              <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800 }}>{s.val}</div>
                            </div>
                          ))}
                        </div>
                        {lesson.notes && (
                          <div style={{ marginTop: 8, padding: "10px 12px", background: `${colors.gold}12`, borderRadius: 8, border: `1px solid ${colors.gold}33` }}>
                            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, letterSpacing: 1, marginBottom: 4 }}>USTADH'S NOTE</div>
                            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n700, lineHeight: 1.6 }}>{lesson.notes}</div>
                          </div>
                        )}
                        {lesson.mistakes?.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.errorText, letterSpacing: 1, marginBottom: 6 }}>MISTAKE DETAILS</div>
                            {lesson.mistakes.map((m: any, i: number) => (
                              <div key={i} style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n600, padding: "3px 0" }}>
                                • {m.mistakeType.replace(/_/g," ")}{m.surah ? ` — Surah ${m.surah}` : ""}{m.ayah ? `, Ayah ${m.ayah}` : ""}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
