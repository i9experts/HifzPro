"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ── Design tokens ──
const D = {
  bg:      "#0d0a1a",
  card:    "#13101f",
  border:  "#1e1a30",
  purple:  "#7c3aed",
  gold:    "#C4882A",
  green:   "#10B981",
  white:   "#ffffff",
  dim:     "rgba(255,255,255,0.55)",
  faint:   "rgba(255,255,255,0.06)",
};
const serif  = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";
const sans   = "'Inter','Segoe UI',system-ui,sans-serif";
const mono   = "'JetBrains Mono','Fira Mono',monospace";

function JuzBoard({ completed, total=30 }: { completed:number; total?:number }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:3 }}>
      {Array.from({length:total},(_,i)=>{
        const juz   = i+1;
        const done  = juz <= completed;
        const curr  = juz === completed+1;
        return (
          <div key={juz} title={`Juz ${juz}`} style={{ aspectRatio:"1", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", background:done?D.purple:curr?"rgba(124,58,237,0.2)":D.faint, border:`1px solid ${done?D.purple:curr?"rgba(124,58,237,0.4)":D.border}`, fontSize:8, fontFamily:mono, fontWeight:700, color:done?"white":curr?"rgba(124,58,237,0.8)":"rgba(255,255,255,0.2)" }}>
            {juz}
          </div>
        );
      })}
    </div>
  );
}

function HealthRing({ score }: { score:number|null }) {
  if (score===null) return <span style={{color:"rgba(255,255,255,0.2)",fontFamily:mono,fontSize:11}}>—</span>;
  const color = score>=75?D.green:score>=55?"#f59e0b":"#ef4444";
  return <span style={{background:`${color}20`,color,padding:"2px 8px",borderRadius:999,fontSize:10,fontFamily:mono,fontWeight:700}}>{score}%</span>;
}

export default function DonorDashboard() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"students"|"impact">("students");

  useEffect(()=>{
    fetch("/api/donor/dashboard")
      .then(r=>r.json())
      .then(d=>{
        if(d.success) setData(d.data);
        else window.location.href="/donor/signin";
      })
      .finally(()=>setLoading(false));
  },[]);

  const handleSignOut = async()=>{
    document.cookie="donor_token=;max-age=0;path=/";
    window.location.href="/donor/signin";
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:D.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:arabic,fontSize:28,color:D.purple,marginBottom:12,opacity:0.6}}>جزاك الله خيراً</div>
        <div style={{fontFamily:sans,fontSize:14,color:D.dim}}>Loading your impact...</div>
      </div>
    </div>
  );

  if(!data) return null;
  const { donor, institution, students, impact } = data;

  return (
    <div style={{minHeight:"100vh",background:D.bg,fontFamily:sans}}>

      {/* Nav */}
      <nav style={{background:D.card,borderBottom:`1px solid ${D.border}`,padding:"0 28px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🕌</div>
          <div>
            <div style={{fontFamily:serif,fontSize:18,fontWeight:700,color:D.white,lineHeight:1}}>HifzPro</div>
            <div style={{fontFamily:mono,fontSize:7,color:D.purple,letterSpacing:2}}>DONOR PORTAL</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontFamily:sans,fontSize:12,color:D.dim}}>{donor.name}</span>
          <button onClick={handleSignOut} style={{padding:"6px 14px",borderRadius:7,background:D.faint,border:`1px solid ${D.border}`,color:D.dim,fontSize:11,cursor:"pointer",fontFamily:sans}}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"32px 20px"}}>

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,#13082a,#1e0a4a)`,borderRadius:20,padding:"32px 36px",marginBottom:28,border:`1px solid ${D.purple}33`,position:"relative",overflow:"hidden"}}>
          {/* Geometric bg */}
          <svg style={{position:"absolute",right:-30,top:-30,opacity:0.06}} width="200" height="200" viewBox="0 0 80 80">
            {[...Array(4)].map((_,i)=><polygon key={i} points={`40,${4+i*6} ${76-i*6},${40} ${40},${76-i*6} ${4+i*6},${40}`} fill="none" stroke="white" strokeWidth="1"/>)}
          </svg>
          <div style={{fontFamily:mono,fontSize:9,letterSpacing:3,color:D.purple,marginBottom:8}}>ASSALAMU ALAIKUM</div>
          <h1 style={{fontFamily:serif,fontSize:"2rem",fontWeight:700,color:D.white,margin:"0 0 8px",lineHeight:1.2}}>
            Welcome, {donor.name}
          </h1>
          <div style={{fontFamily:arabic,fontSize:20,color:D.gold,marginBottom:16,opacity:0.8}}>
            جزاك الله خيراً على عطائك
          </div>
          <p style={{fontFamily:sans,fontSize:13,color:D.dim,lineHeight:1.7,maxWidth:520}}>
            Your generosity is helping future Huffaz preserve the words of Allah ﷻ. Here is the impact of your donation at {institution?.name}.
          </p>
        </div>

        {/* Impact stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:28}}>
          {[
            {icon:"👨‍🎓",val:impact.totalStudents,   label:"Students Sponsored", color:D.purple},
            {icon:"📖",val:impact.totalLessons,    label:"Lessons Recorded",   color:"#60a5fa"},
            {icon:"📿",val:impact.juzCompleted,    label:"Total Juz Completed",color:D.green},
            {icon:"📊",val:`${impact.avgProgress}%`,label:"Avg Progress",       color:"#f59e0b"},
            {icon:"🏆",val:impact.completedStudents,label:"Hifz Completed",    color:D.gold},
          ].map((s,i)=>(
            <div key={i} style={{background:D.card,borderRadius:12,padding:"16px 10px",border:`1px solid ${D.border}`,textAlign:"center",borderTop:`2px solid ${s.color}`}}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontFamily:mono,fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontFamily:sans,fontSize:9,color:D.dim,marginTop:3,lineHeight:1.4}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:D.card,borderRadius:10,padding:4,border:`1px solid ${D.border}`,marginBottom:24,width:"fit-content"}}>
          {[{id:"students",label:`My Students (${students.length})`},{id:"impact",label:"Impact Report"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{padding:"9px 20px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?D.purple:"transparent",color:tab===t.id?"white":D.dim,fontFamily:sans,fontSize:12,fontWeight:700}}>{t.label}</button>
          ))}
        </div>

        {/* ── STUDENTS TAB ── */}
        {tab==="students" && (
          students.length===0?(
            <div style={{background:D.card,borderRadius:16,padding:48,textAlign:"center",border:`1px solid ${D.border}`}}>
              <div style={{fontSize:48,marginBottom:12}}>📿</div>
              <div style={{fontFamily:serif,fontSize:20,color:D.white}}>No students linked yet</div>
              <div style={{fontFamily:sans,fontSize:13,color:D.dim,marginTop:8}}>The institution will link students to your account shortly.</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {students.map((item: any)=>{
                const s = item.student;
                const gradeEmoji: Record<string,string> = { EXCELLENT:"⭐", GOOD:"✅", WEAK:"⚠️", REPEAT:"🔄" };

                return (
                  <div key={s.id} style={{background:D.card,borderRadius:18,overflow:"hidden",border:`1px solid ${D.border}`}}>

                    {/* Student header */}
                    <div style={{background:`linear-gradient(135deg,#13082a,#1a0d3a)`,padding:"22px 24px",display:"flex",gap:18,alignItems:"center",flexWrap:"wrap",borderBottom:`1px solid ${D.border}`}}>
                      {/* Avatar */}
                      <div style={{width:64,height:64,borderRadius:16,background:"rgba(124,58,237,0.2)",border:"2px solid rgba(124,58,237,0.4)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {s.photo
                          ? <img src={s.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <span style={{fontFamily:serif,fontSize:26,fontWeight:700,color:D.purple}}>{s.name.charAt(0)}</span>
                        }
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:serif,fontSize:22,fontWeight:700,color:D.white,marginBottom:2}}>{s.name}</div>
                        {s.nameArabic&&<div style={{fontFamily:arabic,fontSize:15,color:"rgba(255,255,255,0.4)",direction:"rtl",textAlign:"left",marginBottom:4}}>{s.nameArabic}</div>}
                        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                          <span style={{background:"rgba(124,58,237,0.2)",color:D.purple,padding:"2px 8px",borderRadius:5,fontFamily:mono,fontSize:9,fontWeight:700}}>{s.program}</span>
                          <span style={{fontFamily:sans,fontSize:11,color:D.dim}}>Ustadh: {s.ustadhName}</span>
                          <span style={{fontFamily:sans,fontSize:11,color:D.dim}}>{s.institutionName}</span>
                          {s.hasSanad&&<span style={{background:"rgba(196,136,42,0.2)",color:D.gold,padding:"2px 8px",borderRadius:5,fontFamily:mono,fontSize:9,fontWeight:700}}>🏆 HAFIZ</span>}
                        </div>
                      </div>
                      {/* Progress circle */}
                      <div style={{textAlign:"center",background:"rgba(0,0,0,0.2)",borderRadius:14,padding:"14px 18px",flexShrink:0}}>
                        <div style={{fontFamily:mono,fontSize:32,fontWeight:700,color:D.purple}}>{s.percentComplete}%</div>
                        <div style={{fontFamily:sans,fontSize:10,color:D.dim,marginTop:2}}>Completion</div>
                        <div style={{fontFamily:sans,fontSize:11,color:"rgba(124,58,237,0.7)",marginTop:2}}>Juz {s.currentJuz} / 30</div>
                      </div>
                    </div>

                    {/* Progress section */}
                    <div style={{padding:"20px 24px"}}>

                      {/* Scholarship badge */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"10px 14px",background:"rgba(196,136,42,0.08)",borderRadius:10,border:"1px solid rgba(196,136,42,0.2)"}}>
                        <div>
                          <div style={{fontFamily:mono,fontSize:8,color:D.gold,letterSpacing:1,marginBottom:2}}>YOUR SCHOLARSHIP</div>
                          <div style={{fontFamily:sans,fontSize:13,fontWeight:700,color:D.white}}>{item.scholarshipName}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:mono,fontSize:14,fontWeight:700,color:D.gold}}>
                            {item.scholarshipType==="FULL"?"Full Waiver":item.scholarshipType==="PARTIAL_PERCENT"?`${item.scholarshipAmount}% Off`:`PKR ${item.scholarshipAmount} Off`}
                          </div>
                          <div style={{fontFamily:sans,fontSize:9,color:D.dim,marginTop:1}}>Since {new Date(item.startDate).toLocaleDateString("en-PK",{month:"short",year:"numeric"})}</div>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
                        {[
                          {label:"Lessons This Week", val:s.weekLessons,  color:"#60a5fa"},
                          {label:"Lessons This Month",val:s.monthLessons, color:D.purple},
                          {label:"Total Lessons",     val:s.totalLessons, color:D.green},
                          {label:"Manzil Health",     val:null,           color:D.green,  health:s.manzilHealth},
                        ].map((stat,i)=>(
                          <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                            {stat.health!==undefined
                              ? <HealthRing score={stat.health}/>
                              : <div style={{fontFamily:mono,fontSize:18,fontWeight:700,color:stat.color}}>{stat.val}</div>
                            }
                            <div style={{fontFamily:sans,fontSize:9,color:D.dim,marginTop:3,lineHeight:1.4}}>{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* 30-Juz board */}
                      <div style={{marginBottom:18}}>
                        <div style={{fontFamily:mono,fontSize:8,color:D.dim,letterSpacing:1,marginBottom:8}}>MEMORIZATION PROGRESS — {s.totalJuzMemorized} OF 30 JUZ</div>
                        <JuzBoard completed={s.totalJuzMemorized}/>
                      </div>

                      {/* Recent grades */}
                      {Object.values(s.recentGrades).some((v:any)=>v>0) && (
                        <div style={{marginBottom:16}}>
                          <div style={{fontFamily:mono,fontSize:8,color:D.dim,letterSpacing:1,marginBottom:8}}>RECENT LESSON GRADES (THIS WEEK)</div>
                          <div style={{display:"flex",gap:10}}>
                            {Object.entries(s.recentGrades).filter(([,v]:any)=>v>0).map(([grade,count]:any)=>(
                              <div key={grade} style={{display:"flex",alignItems:"center",gap:5}}>
                                <span style={{fontSize:14}}>{{EXCELLENT:"⭐",GOOD:"✅",WEAK:"⚠️",REPEAT:"🔄"}[grade]}</span>
                                <span style={{fontFamily:mono,fontSize:11,fontWeight:700,color:D.white}}>{count}×</span>
                                <span style={{fontFamily:sans,fontSize:10,color:D.dim}}>{grade.toLowerCase()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent tests */}
                      {s.recentTests?.length>0 && (
                        <div style={{marginBottom:16}}>
                          <div style={{fontFamily:mono,fontSize:8,color:D.dim,letterSpacing:1,marginBottom:8}}>RECENT TESTS</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            {s.recentTests.map((t:any)=>(
                              <div key={t.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 10px",border:`1px solid ${t.result==="PASS"?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`}}>
                                <div style={{fontFamily:mono,fontSize:9,color:D.dim}}>{t.testType.replace("_"," ")}</div>
                                <div style={{fontFamily:mono,fontSize:11,fontWeight:700,color:t.result==="PASS"?D.green:"#ef4444"}}>{t.result||"—"}{t.score?` · ${t.score}%`:""}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestones */}
                      {item.milestones?.length>0 && (
                        <div>
                          <div style={{fontFamily:mono,fontSize:8,color:D.gold,letterSpacing:1,marginBottom:8}}>🏅 MILESTONES ACHIEVED</div>
                          {item.milestones.map((m:any,i:number)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<item.milestones.length-1?`1px solid ${D.border}`:"none"}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:D.gold,flexShrink:0}}/>
                              <span style={{fontFamily:sans,fontSize:12,color:D.white}}>{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sanad link */}
                      {s.hasSanad && (
                        <div style={{marginTop:16,padding:"12px 14px",background:"rgba(196,136,42,0.1)",borderRadius:10,border:"1px solid rgba(196,136,42,0.3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontFamily:serif,fontSize:15,fontWeight:700,color:D.gold}}>🏆 Hifz Certificate Issued!</div>
                            <div style={{fontFamily:mono,fontSize:10,color:"rgba(196,136,42,0.7)"}}>{s.sanadNumber}</div>
                          </div>
                          <a href={`/certificates/${s.sanadNumber}`} target="_blank" rel="noopener noreferrer"
                            style={{padding:"8px 16px",borderRadius:8,background:D.gold,color:"white",fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:sans}}>
                            View Certificate ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── IMPACT TAB ── */}
        {tab==="impact" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Impact summary card - printable */}
            <div id="impact-report" style={{background:D.card,borderRadius:18,padding:32,border:`1px solid ${D.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{fontFamily:mono,fontSize:9,letterSpacing:2,color:D.purple,marginBottom:4}}>IMPACT CERTIFICATE</div>
                  <h2 style={{fontFamily:serif,fontSize:"1.8rem",fontWeight:700,color:D.white,margin:0}}>Your Contribution Report</h2>
                  <div style={{fontFamily:sans,fontSize:12,color:D.dim,marginTop:4}}>{institution?.name} · {new Date().toLocaleDateString("en-PK",{month:"long",year:"numeric"})}</div>
                </div>
                <button onClick={()=>window.print()} style={{padding:"9px 18px",borderRadius:9,background:"rgba(124,58,237,0.2)",border:`1px solid ${D.purple}44`,color:D.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:sans}}>
                  🖨️ Print / Save PDF
                </button>
              </div>

              {/* Arabic dua */}
              <div style={{textAlign:"center",padding:"20px",background:"rgba(196,136,42,0.08)",borderRadius:12,border:"1px solid rgba(196,136,42,0.15)",marginBottom:24}}>
                <div style={{fontFamily:arabic,fontSize:22,color:D.gold,lineHeight:1.8}}>
                  مَن جَهَّزَ غَازِيًا فَقَد غَزَا — من يُعِن حافِظاً فَقَد حَفِظ
                </div>
                <div style={{fontFamily:sans,fontSize:11,color:D.dim,marginTop:8}}>
                  "Whoever equips a warrior has himself fought — whoever supports a Hafiz has himself memorized"
                </div>
              </div>

              {/* Numbers */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
                {[
                  {val:impact.totalStudents,   label:"Students You Sponsor",    arabic:"طلبة برعايتكم",       color:D.purple},
                  {val:impact.totalLessons,    label:"Total Lessons Supported",  arabic:"دروس تمّت بدعمكم",   color:"#60a5fa"},
                  {val:impact.juzCompleted,    label:"Juz of Quran Memorized",   arabic:"أجزاء تم حفظها",      color:D.green},
                  {val:`${impact.avgProgress}%`,label:"Average Completion Rate", arabic:"معدل الإنجاز",        color:"#f59e0b"},
                  {val:impact.completedStudents,label:"Huffaz Completed",        arabic:"حفّاظ أتمّوا الحفظ",  color:D.gold},
                  {val:students.reduce((a:number,s:any)=>a+(s.student.weekLessons||0),0), label:"Lessons This Week", arabic:"دروس هذا الأسبوع", color:"#34d399"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 14px",textAlign:"center",border:`1px solid ${D.border}`}}>
                    <div style={{fontFamily:mono,fontSize:26,fontWeight:700,color:s.color}}>{s.val}</div>
                    <div style={{fontFamily:sans,fontSize:11,color:D.dim,marginTop:4}}>{s.label}</div>
                    <div style={{fontFamily:arabic,fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:2}}>{s.arabic}</div>
                  </div>
                ))}
              </div>

              {/* Students list for report */}
              {students.length>0&&(
                <div>
                  <div style={{fontFamily:mono,fontSize:9,color:D.dim,letterSpacing:1,marginBottom:12}}>SPONSORED STUDENTS</div>
                  {students.map((item:any)=>(
                    <div key={item.student.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${D.border}`}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"rgba(124,58,237,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>
                        {item.student.photo?<img src={item.student.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/>:item.student.name.charAt(0)}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:serif,fontSize:14,fontWeight:700,color:D.white}}>{item.student.name}</div>
                        <div style={{fontFamily:sans,fontSize:10,color:D.dim}}>Juz {item.student.currentJuz}/30 · {item.student.totalLessons} total lessons</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:mono,fontSize:14,fontWeight:700,color:D.purple}}>{item.student.percentComplete}%</div>
                        <div style={{fontFamily:sans,fontSize:9,color:D.dim}}>complete</div>
                      </div>
                      {item.student.hasSanad&&<span style={{background:"rgba(196,136,42,0.2)",color:D.gold,padding:"3px 8px",borderRadius:5,fontFamily:mono,fontSize:9,fontWeight:700}}>🏆 HAFIZ</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div style={{textAlign:"center",marginTop:24,paddingTop:16,borderTop:`1px solid ${D.border}`}}>
                <div style={{fontFamily:arabic,fontSize:16,color:"rgba(196,136,42,0.5)"}}>جزاك الله خيراً</div>
                <div style={{fontFamily:sans,fontSize:10,color:"rgba(255,255,255,0.15)",marginTop:4}}>HifzPro · {institution?.name} · www.hifzpro.com</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@media print { nav,.no-print{display:none!important} body{background:#0d0a1a} }`}</style>
    </div>
  );
}
