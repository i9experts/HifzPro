"use client";
import { useParent } from "./layout";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const PROGRAM_LABELS: Record<string, { en: string; ur: string }> = {
  HIFZ:    { en: "Hifz ul Quran", ur: "حفظ القرآن" },
  NAZRA:   { en: "Nazrah",        ur: "ناظرہ" },
  TAJWEED: { en: "Tajweed",       ur: "تجوید" },
  GIRDAAN: { en: "Girdaan",       ur: "گردان" },
};

const GRADE_DISPLAY: Record<string, { label: string; labelUr: string; color: string; bg: string; emoji: string }> = {
  EXCELLENT: { label: "Excellent",  labelUr: "بہت اچھا",  color: "#166534",          bg: "#dcfce7", emoji: "⭐" },
  GOOD:      { label: "Good",       labelUr: "اچھا",      color: colors.primary,     bg: colors.green50, emoji: "✅" },
  WEAK:      { label: "Weak",       labelUr: "کمزور",     color: colors.warningText, bg: colors.warningBg, emoji: "⚠️" },
  REPEAT:    { label: "Repeat",     labelUr: "دوبارہ",    color: colors.errorText,   bg: colors.errorBg, emoji: "🔄" },
};

const DUAS = [
  { arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge." },
  { arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ", translation: "Our Lord, grant us comfort in our spouses and children." },
  { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", translation: "My Lord, expand my chest and ease my affairs." },
];

function HealthRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 75 ? "#16a34a" : score >= 55 ? "#d97706" : "#dc2626";
  return (
    <svg width={90} height={90} viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={radius} fill="none" stroke={colors.n100} strokeWidth="8" />
      <circle cx="45" cy="45" r={radius} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
        transform="rotate(-90 45 45)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="45" y="50" textAnchor="middle" fill={color} fontFamily={fonts.heading} fontSize="16" fontWeight="700">{score}%</text>
    </svg>
  );
}

export default function ParentHome() {
  const { student, loading } = useParent();
  const dua = DUAS[new Date().getDate() % DUAS.length];
  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
      <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500 }}>Loading...</div>
    </div>
  );

  if (!student) return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👦</div>
      <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.n700, marginBottom: 8 }}>No student linked</div>
      <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, lineHeight: 1.7 }}>
        Your account has not been linked to a student yet. Please contact the institute.
      </div>
    </div>
  );

  const prog   = PROGRAM_LABELS[student.program] || PROGRAM_LABELS.HIFZ;
  const lastLesson = student.recentLessons?.[0];
  const todayLesson = lastLesson && new Date(lastLesson.date).toDateString() === new Date().toDateString() ? lastLesson : null;
  const gradeInfo = todayLesson?.grade ? GRADE_DISPLAY[todayLesson.grade] : null;

  return (
    <div style={{ padding: "16px 16px 0" }}>

      {/* Date */}
      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, letterSpacing: 1, marginBottom: 12 }}>{today.toUpperCase()}</div>

      {/* Child header card */}
      <div style={{ background: `linear-gradient(135deg,${colors.deep} 0%,${colors.primary} 100%)`, borderRadius: 20, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden" }}>
        {/* Background pattern */}
        <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.06 }} width="140" height="140" viewBox="0 0 80 80">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
          <polygon points="30,10 50,10 70,30 70,50 50,70 30,70 10,50 10,30" fill="none" stroke="white" strokeWidth="1"/>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", overflow: "hidden", flexShrink: 0 }}>
            {student.photo
              ? <img src={student.photo} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: "white" }}>{student.name.charAt(0)}</span>
                </div>
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{student.name}</div>
            {student.nameArabic && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(255,255,255,0.6)", direction: "rtl", textAlign: "left" }}>{student.nameArabic}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{student.enrollmentNumber}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{prog.en}</span>
              {student.batch?.campus && <span style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>· {student.batch.campus}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Today's lesson */}
      {todayLesson ? (
        <div style={{ background: colors.white, borderRadius: 16, padding: 16, marginBottom: 14, border: `2px solid ${colors.green200}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: 2, color: colors.gold, marginBottom: 2 }}>آج کا سبق · TODAY'S LESSON</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>Lesson Recorded ✅</div>
            </div>
            {gradeInfo && (
              <span style={{ background: gradeInfo.bg, color: gradeInfo.color, padding: "6px 12px", borderRadius: 10, fontFamily: fonts.heading, fontSize: 13, fontWeight: 700 }}>
                {gradeInfo.emoji} {gradeInfo.labelUr}
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Type",     labelUr: "قسم",   val: todayLesson.lessonType },
              { label: "Juz",      labelUr: "جز",    val: `Juz ${todayLesson.juzFrom || "—"}` },
              { label: "Mistakes", labelUr: "غلطیاں",val: String(todayLesson.mistakeCount || 0) },
            ].map((s, i) => (
              <div key={i} style={{ background: colors.n50, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: colors.n400 }}>{s.labelUr}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{s.val}</div>
              </div>
            ))}
          </div>
          {todayLesson.notes && (
            <div style={{ marginTop: 10, padding: "8px 10px", background: `${colors.gold}15`, borderRadius: 8, border: `1px solid ${colors.gold}44` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, marginBottom: 2, letterSpacing: 1 }}>USTADH'S NOTE</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n700, lineHeight: 1.6 }}>{todayLesson.notes}</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: colors.white, borderRadius: 16, padding: 16, marginBottom: 14, border: `1px solid ${colors.n200}`, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📖</div>
          <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n700, marginBottom: 3 }}>No lesson recorded today</div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n400 }}>
            {student.stats.daysSinceLesson !== null && student.stats.daysSinceLesson > 0
              ? `Last lesson was ${student.stats.daysSinceLesson} day${student.stats.daysSinceLesson > 1 ? "s" : ""} ago`
              : "Check back after the Halqa"}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {/* Manzil Health */}
        <div style={{ background: colors.white, borderRadius: 16, padding: 16, border: `1px solid ${colors.n200}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1, color: colors.n500, marginBottom: 6 }}>منزل صحت · MANZIL HEALTH</div>
          {student.stats.currentHealth !== null
            ? <HealthRing score={student.stats.currentHealth} />
            : <div style={{ height: 90, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.body, fontSize: 12, color: colors.n400 }}>No data</div>
          }
          <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500, marginTop: 4, textAlign: "center" }}>
            {student.stats.currentHealth !== null
              ? student.stats.currentHealth >= 75 ? "Excellent retention 💚" : student.stats.currentHealth >= 55 ? "Needs more revision 🟡" : "Urgent attention needed 🔴"
              : "Record lessons to see health"}
          </div>
        </div>

        {/* Quran Progress */}
        <div style={{ background: colors.white, borderRadius: 16, padding: 16, border: `1px solid ${colors.n200}` }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: 1, color: colors.n500, marginBottom: 10 }}>قرآن ترقی · PROGRESS</div>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 32, fontWeight: 700, color: colors.primary, lineHeight: 1 }}>{student.progress.currentJuz}</div>
            <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500 }}>Current Juz / 30</div>
          </div>
          <div style={{ height: 6, background: colors.n100, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${student.progress.percentComplete}%`, background: `linear-gradient(90deg,${colors.primary},${colors.success})`, borderRadius: 3 }} />
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: colors.primary, textAlign: "center" }}>{student.progress.percentComplete}% Complete</div>
        </div>
      </div>

      {/* Attendance + Tests row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Link href="/dashboard/parent/attendance" style={{ textDecoration: "none" }}>
          <div style={{ background: colors.white, borderRadius: 14, padding: 14, border: `1px solid ${colors.n200}` }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>📅</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: student.stats.monthAttendancePct >= 80 ? colors.successText : student.stats.monthAttendancePct >= 60 ? colors.warningText : colors.errorText }}>
              {student.stats.monthAttendancePct}%
            </div>
            <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700 }}>Attendance</div>
            <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400 }}>Last 30 days</div>
          </div>
        </Link>
        <Link href="/dashboard/parent/diary" style={{ textDecoration: "none" }}>
          <div style={{ background: colors.white, borderRadius: 14, padding: 14, border: `1px solid ${colors.n200}` }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>📖</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.primary }}>{student.stats.weekLessons}</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700 }}>Lessons</div>
            <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400 }}>This week</div>
          </div>
        </Link>
      </div>

      {/* Recent lessons */}
      {student.recentLessons?.length > 0 && (
        <div style={{ background: colors.white, borderRadius: 16, padding: 16, marginBottom: 14, border: `1px solid ${colors.n200}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>حالیہ اسباق · Recent Lessons</div>
            <Link href="/dashboard/parent/diary" style={{ fontFamily: fonts.heading, fontSize: 11, color: colors.primary, textDecoration: "none" }}>View All →</Link>
          </div>
          {student.recentLessons.slice(0, 4).map((lesson: any, i: number) => {
            const g = GRADE_DISPLAY[lesson.grade] || { emoji: "—", labelUr: "—", color: colors.n400, bg: colors.n50, label: "—" };
            const daysAgo = Math.floor((Date.now() - new Date(lesson.date).getTime()) / (1000*60*60*24));
            return (
              <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${colors.n100}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{g.emoji}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>
                    {lesson.lessonType} — Juz {lesson.juzFrom || "—"}{lesson.pageFrom ? ` · Page ${lesson.pageFrom}` : ""}
                  </div>
                  <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>
                    {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`}
                    {lesson.mistakeCount > 0 ? ` · ${lesson.mistakeCount} mistakes` : ""}
                  </div>
                </div>
                <span style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: g.color }}>{g.labelUr}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Dua */}
      <div style={{ background: `linear-gradient(135deg,${colors.deep},#0A2E1A)`, borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 10 }}>آج کی دعا · DAILY DUA</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: colors.gold, marginBottom: 8, lineHeight: 1.6, direction: "rtl" }}>{dua.arabic}</div>
        <div style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>{dua.translation}</div>
      </div>

      {/* Ustadh info */}
      {student.batch?.ustadh && (
        <div style={{ background: colors.white, borderRadius: 16, padding: 14, marginBottom: 8, border: `1px solid ${colors.n200}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>👨‍🏫</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>{student.batch.ustadh.name}</div>
            <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500 }}>Ustadh · {student.batch.name}</div>
          </div>
          {student.batch.ustadh.whatsapp && (
            <a href={`https://wa.me/${student.batch.ustadh.whatsapp?.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: "6px 12px", borderRadius: 8, background: "#25D366", color: "white", fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
              WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}
