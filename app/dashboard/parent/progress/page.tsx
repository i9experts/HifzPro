"use client";
import { useParent } from "../layout";
import { colors, fonts } from "@/lib/tokens";

const PROGRAM_LABELS: Record<string,string> = {
  HIFZ:"Hifz ul Quran",NAZRA:"Nazrah",TAJWEED:"Tajweed",GIRDAAN:"Girdaan"
};

// ─────────────────────────────────────────────────────────────
// ROOT FIX: derive memorized Juz from lesson entries, not from
// currentJuz number comparison. Works for any starting Juz.
// ─────────────────────────────────────────────────────────────
function getMemorizedJuzSet(lessonEntries: any[]): Set<number> {
  const memorized = new Set<number>();
  if (!lessonEntries?.length) return memorized;
  for (const entry of lessonEntries) {
    if (entry.lessonType === "SABAQ" && entry.juzFrom) {
      memorized.add(entry.juzFrom);
      if (entry.juzTo && entry.juzTo !== entry.juzFrom) {
        for (let j = Math.min(entry.juzFrom, entry.juzTo); j <= Math.max(entry.juzFrom, entry.juzTo); j++) {
          memorized.add(j);
        }
      }
    }
  }
  return memorized;
}

function getCurrentJuzFromEntries(lessonEntries: any[]): number | null {
  if (!lessonEntries?.length) return null;
  const sabaqEntries = lessonEntries
    .filter((e: any) => e.lessonType === "SABAQ" && e.juzFrom)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sabaqEntries[0]?.juzFrom ?? null;
}

export default function ProgressPage() {
  const { student, loading } = useParent();

  if (loading) return <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading progress...</div>;
  if (!student) return null;

  const prog        = student.progress;
  const health      = student.stats.currentHealth;
  const healthTrend = student.stats.healthTrend || [];

  const healthColor = health === null ? colors.n400 : health >= 75 ? colors.successText : health >= 55 ? colors.warningText : colors.errorText;
  const healthBg    = health === null ? colors.n50  : health >= 75 ? colors.successBg  : health >= 55 ? colors.warningBg  : colors.errorBg;

  const daysEnrolled   = Math.floor((Date.now() - new Date(student.enrolledAt).getTime()) / (1000*60*60*24));
  const monthsEnrolled = Math.floor(daysEnrolled / 30);

  // ── ROOT FIX: use lesson entries as source of truth ──
  const memorizedJuzSet       = getMemorizedJuzSet(student.lessonEntries || []);
  const currentJuzFromEntries = getCurrentJuzFromEntries(student.lessonEntries || []);
  const activeJuz             = currentJuzFromEntries ?? prog.currentJuz ?? null;
  const memorizedCount        = memorizedJuzSet.size;
  const correctPercent        = Math.round((memorizedCount / 30) * 100);
  const juzRemaining          = 30 - memorizedCount;

  // Estimated completion — based on memorized count, not Juz number arithmetic
  const avgDaily     = prog.avgLinesPerDay || 0;
  const estimatedDays = avgDaily > 0 ? Math.ceil((juzRemaining * 200) / avgDaily) : null;

  return (
    <div style={{ padding:"16px" }}>
      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.gold, marginBottom:4 }}>قرآن ترقی · QURAN PROGRESS</div>
        <div style={{ fontFamily:fonts.display, fontSize:"1.4rem", fontWeight:700, color:colors.n800 }}>Journey to Khatm</div>
        <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500 }}>{PROGRAM_LABELS[student.program]} · {daysEnrolled} days enrolled</div>
      </div>

      {/* Hero progress card */}
      <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary})`, borderRadius:20, padding:20, marginBottom:16, position:"relative", overflow:"hidden" }}>
        <svg style={{ position:"absolute",right:-30,top:-30,opacity:0.06 }} width="160" height="160" viewBox="0 0 80 80">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
        </svg>
        <div style={{ fontFamily:fonts.mono, fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginBottom:12 }}>QURAN COMPLETION</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:16 }}>
          <div style={{ fontFamily:fonts.heading, fontSize:56, fontWeight:700, color:"white", lineHeight:1 }}>{correctPercent}</div>
          <div style={{ fontFamily:fonts.heading, fontSize:24, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>%</div>
        </div>
        {/* Progress bar — driven by memorized count */}
        <div style={{ height:12, background:"rgba(255,255,255,0.15)", borderRadius:6, overflow:"hidden", marginBottom:12 }}>
          <div style={{ height:"100%", width:`${correctPercent}%`, background:`linear-gradient(90deg,#4ade80,#86efac)`, borderRadius:6, transition:"width 1s" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <div style={{ fontFamily:fonts.body, fontSize:12, color:"rgba(255,255,255,0.7)" }}>
            📍 {memorizedCount} Juz memorized · Active: Juz {activeJuz ?? "—"}
          </div>
          <div style={{ fontFamily:fonts.body, fontSize:12, color:"rgba(255,255,255,0.7)" }}>
            {juzRemaining} Juz remaining
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
        {[
          { icon:"📍", label:"Active Juz",    val: activeJuz ? `Juz ${activeJuz}` : "—",              sub:`Page ${prog.currentPage ?? "—"}` },
          { icon:"💚", label:"Manzil Health", val: health!==null ? `${health}%` : "—",
            sub: health!==null ? (health>=75?"Excellent":health>=55?"Moderate":"Needs work") : "No data" },
          { icon:"📅", label:"Enrolled",      val:`${monthsEnrolled}mo`,                               sub:`${daysEnrolled} days` },
        ].map((s,i)=>(
          <div key={i} style={{ background:colors.white, borderRadius:12, padding:"12px 10px", border:`1px solid ${colors.n200}`, textAlign:"center" }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontFamily:fonts.heading, fontSize:16, fontWeight:700, color:colors.n800 }}>{s.val}</div>
            <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n500, marginTop:1 }}>{s.label}</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.n400 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 30-Juz Visual Grid — ROOT FIX APPLIED */}
      <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
        <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:4 }}>30 Juz — The Complete Quran</div>
        <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginBottom:12 }}>
          Each box represents one Juz ·{" "}
          <span style={{ color:colors.primary, fontWeight:700 }}>{memorizedCount} of 30 memorized</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:5 }}>
          {Array.from({length:30},(_,i)=>i+1).map(juz => {
            // ── THE FIX: check membership in the memorized SET ──
            const isMemorized  = memorizedJuzSet.has(juz);
            const isCurrent    = juz === activeJuz;
            const isInProgress = isCurrent && !isMemorized;

            return (
              <div key={juz} style={{
                aspectRatio:"1", borderRadius:8,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                background: isMemorized   ? colors.primary    :
                            isInProgress  ? colors.green50    :
                            colors.n50,
                border:`2px solid ${
                  isMemorized   ? colors.primary :
                  isInProgress  ? colors.primary :
                  colors.n200
                }`,
                transition:"all 0.3s",
              }}>
                <span style={{
                  fontFamily:fonts.mono, fontSize:10, fontWeight:700,
                  color: isMemorized   ? "white"         :
                         isInProgress  ? colors.primary   :
                         colors.n400,
                }}>{juz}</span>
                {isMemorized  && <span style={{ fontSize:8, color:"rgba(255,255,255,0.8)" }}>✓</span>}
                {isInProgress && <span style={{ fontSize:6, color:colors.primary }}>▶</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:10, justifyContent:"center" }}>
          {[
            {color:colors.primary,  label:"Memorized"},
            {color:colors.green50,  border:colors.primary, label:"In Progress"},
            {color:colors.n50,      border:colors.n200,    label:"Remaining"},
          ].map((l,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:12,height:12,borderRadius:3,background:l.color,border:`1px solid ${(l as any).border||l.color}`}}/>
              <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manzil Health History */}
      <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
        <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:4 }}>💚 Manzil Health History</div>
        <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginBottom:12 }}>How well your child retains their memorised Quran</div>
        {healthTrend.length > 0 ? (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"12px 14px", background:healthBg, borderRadius:10 }}>
              <div style={{ fontFamily:fonts.heading, fontSize:36, fontWeight:700, color:healthColor }}>{health}%</div>
              <div>
                <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:healthColor }}>
                  {health! >= 75 ? "Excellent Retention" : health! >= 55 ? "Good — Needs Regular Revision" : "Urgent — Extra Revision Needed"}
                </div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:healthColor, opacity:0.7 }}>
                  {health! >= 75 ? "Keep up the great work!" : health! >= 55 ? "Daily home revision recommended" : "Please discuss with Ustadh immediately"}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:60 }}>
              {healthTrend.slice().reverse().map((h: any, i: number) => {
                const barH     = Math.max(4, (h.score/100)*54);
                const barColor = h.score>=75?"#16a34a":h.score>=55?colors.warning:colors.error;
                return (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                    <div style={{ width:"100%", height:barH, background:barColor, borderRadius:"3px 3px 0 0", opacity:i===healthTrend.length-1?1:0.5+i*0.1 }}/>
                    <span style={{ fontFamily:fonts.mono, fontSize:7, color:colors.n400 }}>{h.score}%</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400, textAlign:"center", marginTop:6 }}>Last {healthTrend.length} recordings</div>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:20, color:colors.n400, fontFamily:fonts.body, fontSize:12 }}>
            Health scores will appear here as lessons are recorded
          </div>
        )}
      </div>

      {/* Test results */}
      {student.testRecords?.length > 0 && (
        <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
          <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:12 }}>📝 Test Results</div>
          {student.testRecords.slice(0,5).map((t: any, i: number) => {
            const passed = t.result === "PASS";
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<4?`1px solid ${colors.n100}`:"none" }}>
                <span style={{ fontSize:20 }}>{passed?"✅":"❌"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800 }}>
                    {t.testType.replace(/_/g," ")}
                    {t.juzFrom?` — Juz ${t.juzFrom}${t.juzTo&&t.juzTo!==t.juzFrom?`–${t.juzTo}`:""}` : ""}
                  </div>
                  <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400 }}>
                    {new Date(t.date).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}
                    {t.score ? ` · ${t.score}%` : ""}
                  </div>
                </div>
                <span style={{ background:passed?colors.successBg:colors.errorBg, color:passed?colors.successText:colors.errorText, padding:"3px 8px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700 }}>
                  {t.result||"PENDING"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Projected Khatm */}
      {(student.expectedKhatmAt || estimatedDays) && (
        <div style={{ background:`${colors.gold}15`, borderRadius:16, padding:16, border:`1px solid ${colors.gold}44`, marginBottom:8 }}>
          <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.goldDark, marginBottom:6 }}>🏆 Expected Khatm</div>
          {student.expectedKhatmAt && (
            <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.n800 }}>
              {new Date(student.expectedKhatmAt).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})}
            </div>
          )}
          {estimatedDays && (
            <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n600, marginTop:4 }}>
              At current pace — approximately {Math.ceil(estimatedDays/30)} months remaining
            </div>
          )}
          <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginTop:6, fontStyle:"italic" }}>
            May Allah grant your child the honour of completing the Quran. Ameen. 🤲
          </div>
        </div>
      )}
    </div>
  );
}
