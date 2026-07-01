"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

type Tab = "overview"|"progress"|"attendance"|"tests"|"finance"|"timeline";

const TABS: {id:Tab;label:string;icon:string}[] = [
  {id:"overview",   label:"Overview",   icon:"👤"},
  {id:"progress",   label:"Progress",   icon:"📖"},
  {id:"attendance", label:"Attendance", icon:"📅"},
  {id:"tests",      label:"Tests",      icon:"📝"},
  {id:"finance",    label:"Finance",    icon:"💰"},
  {id:"timeline",   label:"Timeline",   icon:"🕐"},
];

const PROGRAM_LABELS: Record<string,string> = { HIFZ:"Hifz ul Quran",NAZRA:"Nazrah",TAJWEED:"Tajweed",GIRDAAN:"Girdaan" };
const STATUS_STYLES: Record<string,{bg:string;color:string}> = {
  ACTIVE:    {bg:colors.successBg,color:colors.successText},
  ON_LEAVE:  {bg:colors.warningBg,color:colors.warningText},
  COMPLETED: {bg:"#f0f9ff",color:"#0369a1"},
  SUSPENDED: {bg:colors.errorBg,color:colors.errorText},
  WITHDRAWN: {bg:colors.n100,color:colors.n500},
};
const GRADE_STYLES: Record<string,{color:string}> = {
  EXCELLENT:{color:colors.successText},GOOD:{color:colors.primary},
  WEAK:{color:colors.warningText},REPEAT:{color:colors.errorText},
};

function InfoRow({label,val}:{label:string;val:string|null|undefined}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${colors.n100}`}}>
      <span style={{fontFamily:fonts.body,fontSize:12,color:colors.n500}}>{label}</span>
      <span style={{fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n800,textAlign:"right",maxWidth:"60%"}}>{val||"—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT FIX: derive which Juz have actually been memorized
// from the lesson entries themselves — not from currentJuz alone.
// This works regardless of whether the student started at Juz 30,
// Juz 1, or any other starting point.
// ─────────────────────────────────────────────────────────────
function getMemorizedJuzSet(lessonEntries: any[]): Set<number> {
  const memorized = new Set<number>();
  if (!lessonEntries?.length) return memorized;
  for (const entry of lessonEntries) {
    // Only SABAQ entries represent newly memorized Juz
    if (entry.lessonType === "SABAQ" && entry.juzFrom) {
      memorized.add(entry.juzFrom);
      // If the lesson spans multiple Juz (juzTo differs from juzFrom)
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
  // Most recent SABAQ entry's Juz = current active Juz
  const sabaqEntries = lessonEntries
    .filter((e: any) => e.lessonType === "SABAQ" && e.juzFrom)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sabaqEntries[0]?.juzFrom ?? null;
}

export default function StudentProfile({params}:{params:Promise<{id:string}>}) {
  const {id} = use(params);
  const [tab,      setTab]      = useState<Tab>("overview");
  const [student,  setStudent]  = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    fetch(`/api/admin/students/${id}`)
      .then(r=>r.json())
      .then(d=>{
        if(d.success) setStudent(d.data.student);
        else setError("Student not found");
      })
      .catch(()=>setError("Failed to load student"))
      .finally(()=>setLoading(false));
  },[id]);

  if(loading) return <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:fonts.body,color:"rgba(255,255,255,0.4)"}}>Loading student profile...</div></div>;
  if(error||!student) return <div style={{minHeight:"100vh",background:colors.n50,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><div style={{fontFamily:fonts.heading,fontSize:16,color:colors.n700}}>{error||"Student not found"}</div><Link href="/dashboard/admin/students" style={{display:"inline-block",marginTop:16,color:colors.primary,fontFamily:fonts.heading,fontSize:13}}>← Back to Students</Link></div></div>;

  const s     = student;
  const stats = s.stats;
  const stat  = STATUS_STYLES[s.status]||STATUS_STYLES.ACTIVE;
  const primaryGuardian = s.guardians?.find((g:any)=>g.isEmergency) || s.guardians?.[0];

  // ── ROOT FIX: build the memorized set from actual lesson entries ──
  const memorizedJuzSet  = getMemorizedJuzSet(s.lessonEntries || []);
  const currentJuzFromEntries = getCurrentJuzFromEntries(s.lessonEntries || []);
  // Fall back to API-supplied currentJuz only if no entries yet
  const activeJuz        = currentJuzFromEntries ?? s.progress?.currentJuz ?? null;
  const memorizedCount   = memorizedJuzSet.size;
  // Correct completion % = memorized Juz count / 30
  const correctPercent   = Math.round((memorizedCount / 30) * 100);
  // Remaining = 30 minus however many distinct Juz have been memorized
  const juzRemaining     = 30 - memorizedCount;

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${colors.deep} 0%,#0A2E1A 100%)`,padding:"0 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          {/* Breadcrumb */}
          <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:16,paddingBottom:8}}>
            <Link href="/dashboard/admin" style={{fontFamily:fonts.body,fontSize:11,color:"rgba(255,255,255,0.4)",textDecoration:"none"}}>Dashboard</Link>
            <span style={{color:"rgba(255,255,255,0.2)"}}>›</span>
            <Link href="/dashboard/admin/students" style={{fontFamily:fonts.body,fontSize:11,color:"rgba(255,255,255,0.4)",textDecoration:"none"}}>Students</Link>
            <span style={{color:"rgba(255,255,255,0.2)"}}>›</span>
            <span style={{fontFamily:fonts.body,fontSize:11,color:"rgba(255,255,255,0.6)"}}>{s.name}</span>
          </div>

          {/* Profile header */}
          <div style={{display:"flex",alignItems:"flex-start",gap:20,paddingBottom:0,paddingTop:8,flexWrap:"wrap"}}>
            <div style={{width:72,height:72,borderRadius:16,background:colors.primary,border:"3px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
              {s.photo
                ? <img src={s.photo} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                : <span style={{fontFamily:fonts.display,fontSize:28,fontWeight:700,color:colors.white}}>{s.name.charAt(0)}</span>
              }
            </div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
                <h1 style={{fontFamily:fonts.display,fontSize:"1.6rem",fontWeight:700,color:colors.white,margin:0}}>{s.name}</h1>
                <span style={{background:stat.bg,color:stat.color,padding:"3px 10px",borderRadius:999,fontSize:10,fontFamily:fonts.mono,fontWeight:700}}>{s.status.replace("_"," ")}</span>
              </div>
              {s.nameArabic && <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"rgba(255,255,255,0.5)",marginBottom:6,direction:"rtl",textAlign:"left"}}>{s.nameArabic}</div>}
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {[
                  {icon:"🎫",val:s.enrollmentNumber||"—"},
                  {icon:"📖",val:PROGRAM_LABELS[s.program]||s.program},
                  {icon:"👥",val:s.batch?.name||"No batch"},
                  {icon:"📅",val:`Enrolled ${new Date(s.enrolledAt).toLocaleDateString("en-PK",{year:"numeric",month:"short",day:"numeric"})}`},
                ].map((item,i)=>(
                  <span key={i} style={{fontFamily:fonts.body,fontSize:11,color:"rgba(255,255,255,0.5)"}}>{item.icon} {item.val}</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <a href={`/api/admin/students/${id}/report`} target="_blank" rel="noopener noreferrer" style={{padding:"9px 18px",borderRadius:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.25)",color:"white",fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading}}>
                📄 Print Report
              </a>
              <Link href={`/dashboard/admin/students/${id}/edit`} style={{padding:"9px 18px",borderRadius:8,background:colors.gold,color:colors.white,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading}}>Edit Student</Link>
            </div>
          </div>

          {/* Quick stats — uses corrected values */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0,borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:16}}>
            {[
              {val:stats.daysSinceEnrolled,                                   label:"Days Enrolled"},
              {val:activeJuz ? `Juz ${activeJuz}` : "—",                     label:"Current Juz"},
              {val:`${correctPercent}%`,                                       label:"Quran Done"},
              {val:`${stats.attendancePct}%`,                                  label:"Attendance"},
              {val:stats.currentHealth?`${Math.round(stats.currentHealth)}%`:"—", label:"Manzil Health"},
            ].map((q,i)=>(
              <div key={i} style={{padding:"14px 12px",textAlign:"center",borderRight:i<4?"1px solid rgba(255,255,255,0.08)":"none"}}>
                <div style={{fontFamily:fonts.heading,fontSize:20,fontWeight:700,color:colors.white}}>{q.val}</div>
                <div style={{fontFamily:fonts.body,fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:2,letterSpacing:0.5}}>{q.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,overflowX:"auto"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"12px 18px",border:"none",cursor:"pointer",background:"transparent",
                borderBottom:`3px solid ${tab===t.id?colors.gold:"transparent"}`,
                fontFamily:fonts.heading,fontSize:12,fontWeight:600,
                color:tab===t.id?"white":"rgba(255,255,255,0.4)",
                whiteSpace:"nowrap",transition:"all 0.15s",
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>

        {/* OVERVIEW TAB */}
        {tab==="overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:14}}>👤 Personal Information</div>
              <InfoRow label="Full Name"      val={s.name}/>
              <InfoRow label="Arabic Name"    val={s.nameArabic}/>
              <InfoRow label="Date of Birth"  val={s.dateOfBirth?new Date(s.dateOfBirth).toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"}):null}/>
              <InfoRow label="Blood Group"    val={null}/>
              <InfoRow label="Transport"      val={null}/>
              <InfoRow label="Previous Inst." val={null}/>
            </div>

            <div style={{background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:14}}>👨‍👩‍👦 Guardian Details</div>
              {primaryGuardian ? (
                <>
                  <InfoRow label="Name"     val={primaryGuardian.name}/>
                  <InfoRow label="Relation" val={primaryGuardian.relation}/>
                  <InfoRow label="Phone"    val={primaryGuardian.phone}/>
                  <InfoRow label="WhatsApp" val={primaryGuardian.whatsapp}/>
                  <InfoRow label="Email"    val={primaryGuardian.email}/>
                  <InfoRow label="Updates"  val={primaryGuardian.receiveUpdates?"Daily WhatsApp updates enabled":"Updates disabled"}/>
                </>
              ) : <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400}}>No guardian on record</div>}
            </div>

            <div style={{background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:14}}>📖 Program Details</div>
              <InfoRow label="Program"        val={PROGRAM_LABELS[s.program]||s.program}/>
              <InfoRow label="Batch/Halqa"    val={s.batch?.name}/>
              <InfoRow label="Ustadh"         val={s.batch?.ustadh?.user?.name}/>
              <InfoRow label="Status"         val={s.status.replace("_"," ")}/>
              <InfoRow label="Enrolled"       val={new Date(s.enrolledAt).toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"})}/>
              <InfoRow label="Expected Khatm" val={s.expectedKhatmAt?new Date(s.expectedKhatmAt).toLocaleDateString("en-PK",{year:"numeric",month:"long",day:"numeric"}):null}/>
            </div>

            <div style={{background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:14}}>📊 Activity Summary</div>
              <InfoRow label="Total Lessons"   val={String(stats.totalLessons)}/>
              <InfoRow label="Total Tests"     val={String(stats.totalTests)}/>
              <InfoRow label="Days Enrolled"   val={String(stats.daysSinceEnrolled)}/>
              <InfoRow label="Juz Memorized"   val={`${memorizedCount} of 30`}/>
              <InfoRow label="Present"         val={`${stats.presentCount} sessions`}/>
              <InfoRow label="Attendance Rate" val={`${stats.attendancePct}%`}/>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {tab==="progress" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Current position */}
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16}}>📍 Current Position</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[
                  {label:"Active Juz",  val:activeJuz ? `Juz ${activeJuz}` : "—",             color:colors.primary},
                  {label:"Page",        val:s.progress?.currentPage||"—",                       color:colors.primary},
                  {label:"Juz Done",    val:`${memorizedCount} / 30`,                           color:colors.success},
                  {label:"Manzil",      val:stats.currentHealth?`${Math.round(stats.currentHealth)}%`:"—",
                    color:stats.currentHealth>=75?colors.success:stats.currentHealth>=55?colors.warning:colors.error},
                ].map((q,i)=>(
                  <div key={i} style={{background:colors.n50,borderRadius:10,padding:"14px 12px",textAlign:"center",border:`1px solid ${colors.n200}`}}>
                    <div style={{fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:q.color}}>{q.val}</div>
                    <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n500,marginTop:2}}>{q.label}</div>
                  </div>
                ))}
              </div>
              {/* Progress bar — uses correctedPercent */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontFamily:fonts.body,fontSize:12,color:colors.n500}}>Quran Completion</span>
                  <span style={{fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:colors.primary}}>{correctPercent}%</span>
                </div>
                <div style={{height:10,background:colors.n100,borderRadius:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${correctPercent}%`,background:`linear-gradient(90deg,${colors.primary},${colors.success})`,borderRadius:5,transition:"width 0.5s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  <span style={{fontFamily:fonts.body,fontSize:11,color:colors.n400}}>{memorizedCount} Juz memorized</span>
                  <span style={{fontFamily:fonts.body,fontSize:11,color:colors.n400}}>{juzRemaining} Juz remaining</span>
                </div>
              </div>
            </div>

            {/* 30-Juz grid — ROOT FIX APPLIED HERE */}
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:4}}>📗 Quran Progress (30 Juz)</div>
              <div style={{fontFamily:fonts.body,fontSize:12,color:colors.n500,marginBottom:16}}>
                Green = memorized · Highlighted = currently active · Grey = not yet started
                {memorizedCount > 0 && (
                  <span style={{marginLeft:8,fontFamily:fonts.mono,fontSize:11,color:colors.primary,fontWeight:700}}>
                    {memorizedCount}/30 complete
                  </span>
                )}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {Array.from({length:30},(_,i)=>i+1).map(juz=>{
                  // ── THE FIX: check the SET, not the number comparison ──
                  const isMemorized = memorizedJuzSet.has(juz);
                  const isCurrent   = juz === activeJuz;
                  // A Juz is "in progress" if it's the active one AND not yet
                  // fully memorized (i.e., not in the completed set yet)
                  const isInProgress = isCurrent && !isMemorized;

                  return (
                    <div key={juz} style={{
                      width:48, height:48, borderRadius:10,
                      background: isMemorized
                        ? colors.primary
                        : isInProgress
                          ? `${colors.primary}20`
                          : colors.n50,
                      border:`2px solid ${
                        isMemorized   ? colors.primary  :
                        isInProgress  ? colors.primary  :
                        colors.n200
                      }`,
                      display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center",
                    }}>
                      <span style={{
                        fontFamily:fonts.mono, fontSize:11, fontWeight:700,
                        color: isMemorized   ? "white"          :
                               isInProgress  ? colors.primary    :
                               colors.n400,
                      }}>{juz}</span>
                      {isMemorized   && <span style={{fontSize:8,color:"rgba(255,255,255,0.7)"}}>✓</span>}
                      {isInProgress  && <span style={{fontSize:8,color:colors.primary}}>●</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:16,marginTop:14}}>
                {[
                  {color:colors.primary,              label:"Memorized"},
                  {color:`${colors.primary}20`,       label:"In Progress", border:colors.primary},
                  {color:colors.n50,                  label:"Not Started",  border:colors.n200},
                ].map((l,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:12,height:12,borderRadius:3,background:l.color,border:`1px solid ${(l as any).border||l.color}`}}/>
                    <span style={{fontFamily:fonts.body,fontSize:11,color:colors.n500}}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent lessons */}
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16}}>📋 Recent Lesson Entries</div>
              {s.lessonEntries?.slice(0,10).map((le:any)=>{
                const g = GRADE_STYLES[le.grade]||{color:colors.n500};
                return (
                  <div key={le.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${colors.n100}`}}>
                    <div style={{width:40,height:40,borderRadius:8,background:le.lessonType==="SABAQ"?colors.green50:le.lessonType==="SABQI"?colors.warningBg:`${colors.n100}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontFamily:fonts.mono,fontSize:9,fontWeight:700,color:le.lessonType==="SABAQ"?colors.primary:le.lessonType==="SABQI"?colors.warningText:colors.n500}}>{le.lessonType}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n800}}>
                        {le.juzFrom&&`Juz ${le.juzFrom}`}{le.pageFrom&&` · Page ${le.pageFrom}`}{le.pageTo&&le.pageTo!==le.pageFrom&&`–${le.pageTo}`}
                      </div>
                      <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n400,marginTop:1}}>{new Date(le.date).toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short"})}</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {le.mistakeCount>0&&<span style={{fontFamily:fonts.mono,fontSize:10,color:colors.errorText}}>⚠ {le.mistakeCount}</span>}
                      <span style={{fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:g.color}}>{le.grade||"—"}</span>
                    </div>
                  </div>
                );
              })}
              {(!s.lessonEntries||s.lessonEntries.length===0)&&<div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400,textAlign:"center",padding:24}}>No lesson entries yet</div>}
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab==="attendance" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[
                {val:`${stats.attendancePct}%`,label:"Attendance Rate",color:stats.attendancePct>=80?colors.successText:stats.attendancePct>=60?colors.warningText:colors.errorText,bg:stats.attendancePct>=80?colors.successBg:stats.attendancePct>=60?colors.warningBg:colors.errorBg},
                {val:stats.presentCount,label:"Present",color:colors.successText,bg:colors.successBg},
                {val:stats.absentCount, label:"Absent", color:colors.errorText,  bg:colors.errorBg},
                {val:stats.lateCount,   label:"Late",   color:colors.warningText,bg:colors.warningBg},
              ].map((s,i)=>(
                <div key={i} style={{background:s.bg,borderRadius:12,padding:"16px",textAlign:"center"}}>
                  <div style={{fontFamily:fonts.heading,fontSize:24,fontWeight:700,color:s.color}}>{s.val}</div>
                  <div style={{fontFamily:fonts.body,fontSize:11,color:s.color,opacity:0.8,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16}}>Attendance History</div>
              {s.attendanceRecords?.slice(0,30).map((rec:any)=>{
                const statusColor:Record<string,{bg:string;color:string}> = {
                  PRESENT:{bg:colors.successBg,color:colors.successText},
                  ABSENT: {bg:colors.errorBg,  color:colors.errorText},
                  LATE:   {bg:colors.warningBg,color:colors.warningText},
                  LEAVE:  {bg:colors.n100,     color:colors.n600},
                };
                const sc = statusColor[rec.status]||statusColor.PRESENT;
                return (
                  <div key={rec.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${colors.n100}`}}>
                    <span style={{fontFamily:fonts.body,fontSize:12,color:colors.n700}}>{new Date(rec.session.date).toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</span>
                    <span style={{background:sc.bg,color:sc.color,padding:"2px 8px",borderRadius:6,fontSize:10,fontFamily:fonts.mono,fontWeight:700}}>{rec.status}</span>
                  </div>
                );
              })}
              {(!s.attendanceRecords||s.attendanceRecords.length===0)&&<div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400,textAlign:"center",padding:24}}>No attendance records yet</div>}
            </div>
          </div>
        )}

        {/* TESTS TAB */}
        {tab==="tests" && (
          <div>
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16}}>📝 Test Records</div>
              {s.testRecords?.length > 0 ? s.testRecords.map((t:any)=>{
                const resultColor = t.result==="PASS"?colors.successText:t.result==="FAIL"?colors.errorText:colors.warningText;
                const resultBg    = t.result==="PASS"?colors.successBg:t.result==="FAIL"?colors.errorBg:colors.warningBg;
                return (
                  <div key={t.id} style={{padding:"14px 0",borderBottom:`1px solid ${colors.n100}`,display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:44,height:44,borderRadius:10,background:resultBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:18}}>{t.result==="PASS"?"✅":t.result==="FAIL"?"❌":"⚠️"}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800}}>{t.testType.replace(/_/g," ")}</div>
                      <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n500,marginTop:2}}>
                        {t.juzFrom&&`Juz ${t.juzFrom}`}{t.juzTo&&t.juzTo!==t.juzFrom&&`–${t.juzTo}`}
                        {" · "}{new Date(t.date).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}
                        {t.examiner&&` · Examiner: ${t.examiner.user.name}`}
                      </div>
                      {t.notes&&<div style={{fontFamily:fonts.body,fontSize:11,color:colors.n400,marginTop:3}}>{t.notes}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <span style={{background:resultBg,color:resultColor,padding:"3px 10px",borderRadius:6,fontSize:10,fontFamily:fonts.mono,fontWeight:700}}>{t.result||"PENDING"}</span>
                      {t.score&&<span style={{fontFamily:fonts.mono,fontSize:11,color:colors.n500}}>{t.score}%</span>}
                    </div>
                  </div>
                );
              }) : <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400,textAlign:"center",padding:32}}>No test records yet</div>}
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {tab==="finance" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16}}>💰 Scholarships & Concessions</div>
              {s.scholarships?.length>0 ? s.scholarships.map((sch:any)=>(
                <div key={sch.id} style={{padding:"14px 0",borderBottom:`1px solid ${colors.n100}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800}}>{sch.donor?sch.donor.name:"Institutional Scholarship"}</div>
                      <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n500,marginTop:2}}>
                        {sch.coverage}% fee coverage · Since {new Date(sch.startDate).toLocaleDateString("en-PK",{month:"short",year:"numeric"})}
                      </div>
                    </div>
                    <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:colors.primary}}>PKR {sch.amount}</div>
                  </div>
                </div>
              )) : (
                <div style={{background:colors.n50,borderRadius:10,padding:20,textAlign:"center"}}>
                  <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400}}>No scholarships on record</div>
                </div>
              )}
            </div>
            <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16}}>🧾 Fee Records</div>
              <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400,textAlign:"center",padding:24}}>
                Fee management module coming soon. Fee structures, payment history, and outstanding balances will appear here.
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab==="timeline" && (
          <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
            <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:20}}>🕐 Activity Timeline</div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:20,top:0,bottom:0,width:2,background:colors.n100}}/>
              {[
                {icon:"🎓",color:colors.primary,title:"Student Enrolled",desc:`Enrolled in ${PROGRAM_LABELS[s.program]}`,date:s.enrolledAt},
                ...s.lessonEntries?.slice(0,5).map((le:any)=>({
                  icon:le.lessonType==="SABAQ"?"📖":"🔄",color:colors.primary,
                  title:`${le.lessonType} Recorded`,
                  desc:`${le.juzFrom?`Juz ${le.juzFrom}`:""}${le.pageFrom?` · Page ${le.pageFrom}`:""}${le.grade?` · ${le.grade}`:""}`,
                  date:le.date,
                }))||[],
                ...s.testRecords?.slice(0,3).map((t:any)=>({
                  icon:"📝",color:t.result==="PASS"?colors.success:colors.error,
                  title:`${t.testType.replace(/_/g," ")} — ${t.result||"Pending"}`,
                  desc:t.notes||"",date:t.date,
                }))||[],
              ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map((event,i)=>(
                <div key={i} style={{display:"flex",gap:16,marginBottom:20,paddingLeft:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:colors.n50,border:`2px solid ${event.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,position:"relative"}}>
                    <span style={{fontSize:12}}>{event.icon}</span>
                  </div>
                  <div style={{flex:1,paddingTop:3}}>
                    <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:600,color:colors.n800}}>{event.title}</div>
                    {event.desc&&<div style={{fontFamily:fonts.body,fontSize:11,color:colors.n500,marginTop:1}}>{event.desc}</div>}
                    <div style={{fontFamily:fonts.mono,fontSize:10,color:colors.n400,marginTop:3}}>{new Date(event.date).toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
