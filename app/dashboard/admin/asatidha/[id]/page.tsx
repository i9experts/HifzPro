"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PROGRAM_COLORS: Record<string,string> = {
  HIFZ:colors.primary, NAZRA:"#7c3aed", TAJWEED:"#b45309", GIRDAAN:"#0f766e"
};

const GRADE_SCORE: Record<string,number> = { EXCELLENT:100, GOOD:75, WEAK:40, REPEAT:10 };
const GRADE_LABEL: Record<string,{label:string;emoji:string;color:string}> = {
  EXCELLENT:{ label:"Excellent", emoji:"⭐", color:"#166534" },
  GOOD:     { label:"Good",      emoji:"✅", color:colors.primary },
  WEAK:     { label:"Weak",      emoji:"⚠️", color:colors.warningText },
  REPEAT:   { label:"Repeat",    emoji:"🔄", color:colors.errorText },
};

export default function UstadhProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params);
  const [ustadh,  setUstadh]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"students"|"lessons"|"edit">("overview");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [toast,   setToast]   = useState("");

  const [editForm, setEditForm] = useState({
    name:"", phone:"", whatsapp:"", newPassword:"", isActive:true,
  });

  const fetchUstadh = () => {
    fetch(`/api/admin/asatidha/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUstadh(d.data.ustadh);
          setEditForm({ name:d.data.ustadh.user.name||"", phone:d.data.ustadh.user.phone||"", whatsapp:d.data.ustadh.user.whatsapp||"", newPassword:"", isActive:d.data.ustadh.user.isActive });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUstadh(); }, [id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`/api/admin/asatidha/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) { showToast("✅ Ustadh profile updated"); fetchUstadh(); setTab("overview"); }
      else showToast(`❌ ${data.error}`);
    } finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    if (!confirm(`Deactivate ${ustadh?.user?.name}? They will no longer be able to log in.`)) return;
    const res  = await fetch(`/api/admin/asatidha/${id}`, { method:"DELETE" });
    const data = await res.json();
    if (data.success) { showToast("✅ Ustadh deactivated"); window.location.href = "/dashboard/admin/asatidha"; }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ fontFamily:fonts.body,color:"rgba(255,255,255,0.4)" }}>Loading profile...</div>
    </div>
  );

  if (!ustadh) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40,marginBottom:12 }}>⚠️</div>
        <div style={{ fontFamily:fonts.heading,fontSize:16,color:colors.n700 }}>Ustadh not found</div>
        <Link href="/dashboard/admin/asatidha" style={{ display:"block",marginTop:12,color:colors.primary,fontFamily:fonts.heading }}>← Back</Link>
      </div>
    </div>
  );

  const u    = ustadh;
  const user = u.user;
  const perf = u.performance;
  const allStudents = u.batches?.flatMap((b: any) => b.students) || [];

  const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {toast && (
        <div style={{ position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:colors.n800,color:"white",padding:"10px 20px",borderRadius:10,fontFamily:fonts.heading,fontSize:13,zIndex:999,boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/asatidha" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{ fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.white }}>{user.name}</div>
        {!user.isActive && <span style={{ background:"rgba(239,68,68,0.3)",color:"#fca5a5",padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>INACTIVE</span>}
        <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
          <button onClick={()=>setTab("edit")} style={{ padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.8)",fontSize:12,cursor:"pointer",fontFamily:fonts.heading }}>✏️ Edit</button>
          <button onClick={handleDeactivate} style={{ padding:"7px 14px",borderRadius:8,background:colors.errorBg,border:`1px solid ${colors.error}44`,color:colors.errorText,fontSize:12,cursor:"pointer",fontFamily:fonts.heading }}>Deactivate</button>
        </div>
      </nav>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px" }}>

        {/* Hero */}
        <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary}99)`, borderRadius:20, padding:24, marginBottom:20, display:"flex", gap:20, alignItems:"center", flexWrap:"wrap", position:"relative", overflow:"hidden" }}>
          <svg style={{ position:"absolute",right:-30,top:-30,opacity:0.06 }} width="160" height="160" viewBox="0 0 80 80">
            <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
          <div style={{ width:72,height:72,borderRadius:18,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden" }}>
            {user.photo
              ? <img src={user.photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              : <span style={{ fontFamily:fonts.display,fontSize:30,fontWeight:700,color:"white" }}>{user.name.charAt(0)}</span>
            }
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:fonts.display,fontSize:24,fontWeight:700,color:"white",lineHeight:1.2 }}>{user.name}</div>
            {u.nameArabic && <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"rgba(255,255,255,0.5)",direction:"rtl",textAlign:"left" }}>{u.nameArabic}</div>}
            <div style={{ fontFamily:fonts.mono,fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4 }}>{user.email}</div>
            {u.qualifications?.length > 0 && (
              <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginTop:8 }}>
                {u.qualifications.map((q: string,i: number)=>(
                  <span key={i} style={{ background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.8)",padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:fonts.heading }}>{q}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12 }}>
            {[
              { val:perf.totalStudents,   label:"Students",      color:"white" },
              { val:u.batches?.length||0,  label:"Batches",       color:"white" },
              { val:perf.monthLessons,    label:"Lessons/month", color:"white" },
              { val:perf.weekLessons,     label:"Lessons/week",  color:"white" },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:"center",background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px" }}>
                <div style={{ fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:fonts.body,fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Health + Grade */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
          {[
            { label:"Average Student Health", val:perf.avgStudentHealth!==null?`${perf.avgStudentHealth}%`:"No data", color:perf.avgStudentHealth===null?colors.n400:perf.avgStudentHealth>=75?colors.successText:perf.avgStudentHealth>=55?colors.warningText:colors.errorText, bg:perf.avgStudentHealth===null?colors.n50:perf.avgStudentHealth>=75?colors.successBg:perf.avgStudentHealth>=55?colors.warningBg:colors.errorBg, border:perf.avgStudentHealth===null?colors.n200:perf.avgStudentHealth>=75?`${colors.success}44`:perf.avgStudentHealth>=55?`${colors.warning}44`:`${colors.error}44`, icon:"💚", sub:"Manzil retention across all students" },
            { label:"Average Lesson Grade",   val:perf.avgGrade!==null?`${perf.avgGrade}%`:"No data",             color:perf.avgGrade===null?colors.n400:perf.avgGrade>=75?colors.successText:colors.warningText, bg:perf.avgGrade===null?colors.n50:perf.avgGrade>=75?colors.successBg:colors.warningBg, border:perf.avgGrade===null?colors.n200:perf.avgGrade>=75?`${colors.success}44`:`${colors.warning}44`, icon:"📊", sub:"Quality of lessons recorded this month" },
          ].map((s,i)=>(
            <div key={i} style={{ background:s.bg,borderRadius:14,padding:"18px 16px",border:`1px solid ${s.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                <span style={{ fontSize:22 }}>{s.icon}</span>
                <div style={{ fontFamily:fonts.heading,fontSize:26,fontWeight:700,color:s.color }}>{s.val}</div>
              </div>
              <div style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:s.color }}>{s.label}</div>
              <div style={{ fontFamily:fonts.body,fontSize:10,color:s.color,opacity:0.7,marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex",gap:6,background:colors.white,borderRadius:12,padding:4,border:`1px solid ${colors.n200}`,marginBottom:20 }}>
          {[{id:"overview",label:"Overview"},{id:"students",label:`Students (${allStudents.length})`},{id:"lessons",label:"Recent Lessons"},{id:"edit",label:"Edit Profile"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?colors.primary:"transparent",color:tab===t.id?"white":colors.n500,fontFamily:fonts.heading,fontSize:12,fontWeight:600 }}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            {/* Contact */}
            <div style={{ background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:14 }}>📞 Contact</div>
              {[
                { label:"Email",    val:user.email,     link:`mailto:${user.email}` },
                { label:"Phone",    val:user.phone||"—",link:user.phone?`tel:${user.phone}`:null },
                { label:"WhatsApp", val:user.whatsapp||user.phone||"—", link:(user.whatsapp||user.phone)?`https://wa.me/${(user.whatsapp||user.phone||"").replace(/[^0-9]/g,"")}`:null },
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<2?`1px solid ${colors.n100}`:"none" }}>
                  <span style={{ fontFamily:fonts.body,fontSize:12,color:colors.n500 }}>{s.label}</span>
                  {s.link
                    ? <a href={s.link} target={s.link.startsWith("http")?"_blank":undefined} style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.primary,textDecoration:"none" }}>{s.val}</a>
                    : <span style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n800 }}>{s.val}</span>
                  }
                </div>
              ))}
            </div>

            {/* Info */}
            <div style={{ background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:14 }}>ℹ️ Details</div>
              {[
                { label:"Specialization", val:u.specialization||"—" },
                { label:"Experience",     val:u.experience?`${u.experience} years`:"—" },
                { label:"Joined",         val:u.joiningDate?new Date(u.joiningDate).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"}):"—" },
                { label:"At Risk Students",val:`${perf.atRiskCount} students` },
                { label:"Status",         val:user.isActive?"Active":"Inactive" },
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<4?`1px solid ${colors.n100}`:"none" }}>
                  <span style={{ fontFamily:fonts.body,fontSize:12,color:colors.n500 }}>{s.label}</span>
                  <span style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n800 }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Batches */}
            <div style={{ gridColumn:"1/-1",background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800 }}>👥 Assigned Batches</div>
                <Link href="/dashboard/admin/batches" style={{ fontFamily:fonts.heading,fontSize:11,color:colors.primary,textDecoration:"none" }}>Manage Batches →</Link>
              </div>
              {u.batches?.length > 0 ? (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10 }}>
                  {u.batches.map((b: any)=>(
                    <Link key={b.id} href={`/dashboard/admin/batches/${b.id}`} style={{ textDecoration:"none" }}>
                      <div style={{ background:colors.n50,borderRadius:10,padding:"12px 14px",border:`1px solid ${colors.n200}`,borderLeft:`4px solid ${PROGRAM_COLORS[b.program]||colors.primary}` }}>
                        <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800 }}>{b.name}</div>
                        <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n500,marginTop:2 }}>{b.students?.length||0} students · {b.program}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:24,color:colors.n400,fontFamily:fonts.body,fontSize:13 }}>
                  No batches assigned. <Link href="/dashboard/admin/batches" style={{ color:colors.primary }}>Assign a batch →</Link>
                </div>
              )}
            </div>

            {/* Bio */}
            {u.bio && (
              <div style={{ gridColumn:"1/-1",background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800,marginBottom:10 }}>📝 Bio</div>
                <div style={{ fontFamily:fonts.body,fontSize:13,color:colors.n600,lineHeight:1.8 }}>{u.bio}</div>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS */}
        {tab === "students" && (
          <div style={{ background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden" }}>
            <div style={{ padding:"14px 16px",borderBottom:`1px solid ${colors.n100}`,fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800 }}>
              All Students — {user.name}
            </div>
            {allStudents.length === 0 ? (
              <div style={{ padding:40,textAlign:"center",color:colors.n400,fontFamily:fonts.body }}>No students assigned yet.</div>
            ) : allStudents.map((s: any,i: number)=>{
              const health = s.manzilHealth?.[0]?.score ? Math.round(s.manzilHealth[0].score) : null;
              const hColor = health===null?colors.n400:health>=75?colors.successText:health>=55?colors.warningText:colors.errorText;
              const lastLesson = s.lessonEntries?.[0];
              const daysAgo = lastLesson ? Math.floor((Date.now()-new Date(lastLesson.date).getTime())/(1000*60*60*24)) : null;
              return (
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<allStudents.length-1?`1px solid ${colors.n100}`:"none" }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary }}>{s.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary,textDecoration:"none" }}>{s.name}</Link>
                    <div style={{ fontFamily:fonts.mono,fontSize:9,color:colors.n400 }}>
                      Juz {s.progress?.currentJuz||"—"} · {s.progress?.percentComplete?`${Math.round(s.progress.percentComplete)}% complete`:""}
                      {daysAgo!==null?` · last lesson ${daysAgo===0?"today":daysAgo===1?"yesterday":`${daysAgo}d ago`}`:""}
                    </div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    {health!==null
                      ? <span style={{ background:hColor==="colors.successText"?colors.successBg:hColor===colors.warningText?colors.warningBg:colors.errorBg, color:hColor, padding:"2px 8px",borderRadius:6,fontSize:10,fontFamily:fonts.mono,fontWeight:700 }}>{health}%</span>
                      : <span style={{ color:colors.n300,fontFamily:fonts.mono,fontSize:11 }}>—</span>
                    }
                    <div style={{ fontFamily:fonts.body,fontSize:8,color:colors.n400,marginTop:1 }}>Health</div>
                  </div>
                  {lastLesson?.grade && (
                    <div style={{ textAlign:"center" }}>
                      <span style={{ fontSize:16 }}>{GRADE_LABEL[lastLesson.grade]?.emoji||"—"}</span>
                      <div style={{ fontFamily:fonts.body,fontSize:8,color:colors.n400 }}>Last grade</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* LESSONS */}
        {tab === "lessons" && (
          <div style={{ background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden" }}>
            <div style={{ padding:"14px 16px",borderBottom:`1px solid ${colors.n100}`,fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800 }}>
              Recent Lessons — Last 50
            </div>
            {u.lessonEntries?.length === 0 ? (
              <div style={{ padding:40,textAlign:"center",color:colors.n400,fontFamily:fonts.body }}>No lessons recorded yet.</div>
            ) : u.lessonEntries?.map((e: any,i: number)=>{
              const g = e.grade ? GRADE_LABEL[e.grade] : null;
              const daysAgo = Math.floor((Date.now()-new Date(e.date).getTime())/(1000*60*60*24));
              return (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:i<(u.lessonEntries?.length-1)?`1px solid ${colors.n100}`:"none" }}>
                  <div style={{ width:36,height:36,borderRadius:8,background:g?`${g.color}15`:colors.n50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontSize:16 }}>{g?.emoji||"📖"}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.n800 }}>{e.student?.name||"—"}</div>
                    <div style={{ fontFamily:fonts.mono,fontSize:9,color:colors.n400 }}>
                      {e.lessonType} · {daysAgo===0?"Today":daysAgo===1?"Yesterday":`${daysAgo}d ago`}
                    </div>
                  </div>
                  {g && <span style={{ fontFamily:fonts.heading,fontSize:10,fontWeight:700,color:g.color }}>{g.label}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* EDIT */}
        {tab === "edit" && (
          <div style={{ background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}` }}>
            <div style={{ fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:16 }}>✏️ Edit Ustadh Profile</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:4 }}>Name</label>
                <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:4 }}>Phone</label>
                <input value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:4 }}>WhatsApp</label>
                <input value={editForm.whatsapp} onChange={e=>setEditForm(f=>({...f,whatsapp:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:4 }}>New Password <span style={{ fontFamily:fonts.body,fontWeight:400,color:colors.n400 }}>(leave blank to keep current)</span></label>
                <input type="password" value={editForm.newPassword} onChange={e=>setEditForm(f=>({...f,newPassword:e.target.value}))} placeholder="Min 6 characters" style={inp}/>
              </div>
            </div>
            <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:16 }}>
              <input type="checkbox" checked={editForm.isActive} onChange={e=>setEditForm(f=>({...f,isActive:e.target.checked}))} style={{ width:16,height:16,accentColor:colors.primary }}/>
              <span style={{ fontFamily:fonts.body,fontSize:13,color:colors.n700 }}>Account is active</span>
            </label>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setTab("overview")} style={{ flex:1,padding:"12px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,cursor:"pointer",fontFamily:fonts.heading,fontSize:13 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex:2,padding:"12px",borderRadius:10,background:saving?colors.n300:colors.primary,color:"white",border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading,fontSize:13,fontWeight:700 }}>
                {saving?"Saving...":"Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
