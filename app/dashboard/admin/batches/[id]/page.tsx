"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id: string; name: string; enrollmentNumber: string; program: string; status: string;
  progress: { currentJuz: number; percentComplete: number } | null;
  manzilHealth: { score: number }[];
  lessonEntries: { date: string; grade: string }[];
  guardians: { name: string; phone: string }[];
}
interface Ustadh { id: string; user: { name: string } }

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [batch,     setBatch]     = useState<any>(null);
  const [available, setAvailable] = useState<any[]>([]);
  const [asatidha,  setAsatidha]  = useState<Ustadh[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<"students"|"settings">("students");
  const [search,    setSearch]    = useState("");
  const [adding,    setAdding]    = useState<string | null>(null);
  const [removing,  setRemoving]  = useState<string | null>(null);
  const [savingUstadh, setSavingUstadh] = useState(false);
  const [selectedUstadh, setSelectedUstadh] = useState("");
  const [toast, setToast] = useState("");

  const fetchBatch = () => {
    fetch(`/api/admin/batches/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setBatch(d.data.batch);
          setAvailable(d.data.availableStudents);
          setAsatidha(d.data.asatidha);
          setSelectedUstadh(d.data.batch.ustadhId || "");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBatch(); }, [id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const addStudent = async (studentId: string, name: string) => {
    setAdding(studentId);
    try {
      const res  = await fetch(`/api/admin/batches/${id}/students`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (data.success) { showToast(`✅ ${name} added to ${batch.name}`); fetchBatch(); }
      else showToast(`❌ ${data.error}`);
    } finally { setAdding(null); }
  };

  const removeStudent = async (studentId: string, name: string) => {
    if (!confirm(`Remove ${name} from this batch?`)) return;
    setRemoving(studentId);
    try {
      const res  = await fetch(`/api/admin/batches/${id}/students?studentId=${studentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { showToast(`✅ ${name} removed from batch`); fetchBatch(); }
      else showToast(`❌ ${data.error}`);
    } finally { setRemoving(null); }
  };

  const assignUstadh = async () => {
    setSavingUstadh(true);
    try {
      const res  = await fetch(`/api/admin/batches/${id}/students`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ustadhId: selectedUstadh || null }),
      });
      const data = await res.json();
      if (data.success) { showToast("✅ Ustadh assigned successfully"); fetchBatch(); }
      else showToast(`❌ ${data.error}`);
    } finally { setSavingUstadh(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:fonts.body, color:"rgba(255,255,255,0.4)" }}>Loading batch...</div>
    </div>
  );

  if (!batch) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
        <div style={{ fontFamily:fonts.heading, fontSize:16, color:colors.n700 }}>Batch not found</div>
        <Link href="/dashboard/admin/batches" style={{ display:"block", marginTop:12, color:colors.primary, fontFamily:fonts.heading }}>← Back</Link>
      </div>
    </div>
  );

  const batchStudents = batch.students || [];
  const filteredAvailable = available.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.enrollmentNumber?.includes(search)
  );

  const GRADE_COLOR: Record<string,string> = { EXCELLENT:"#166534", GOOD:colors.primary, WEAK:colors.warningText, REPEAT:colors.errorText };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", background:colors.n800, color:"white", padding:"10px 20px", borderRadius:10, fontFamily:fonts.heading, fontSize:13, zIndex:999, boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/batches" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div>
          <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white, lineHeight:1 }}>{batch.name}</div>
          <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, opacity:0.8 }}>{batch.program} · {batchStudents.length}/{batch.maxStudents} STUDENTS</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <Link href={`/dashboard/admin/batches/${id}/edit`} style={{ padding:"7px 14px", borderRadius:8, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.8)", fontSize:12, textDecoration:"none", fontFamily:fonts.heading }}>Edit</Link>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* Batch header info */}
        <div style={{ background:`linear-gradient(135deg,${colors.deep},#0A3020)`, borderRadius:16, padding:20, marginBottom:20, display:"flex", gap:20, flexWrap:"wrap" }}>
          {/* Ustadh info */}
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginBottom:6 }}>USTADH</div>
            {batch.ustadh ? (
              <>
                <div style={{ fontFamily:fonts.heading, fontSize:16, fontWeight:700, color:"white" }}>{batch.ustadh.user?.name || batch.ustadh.name}</div>
                {batch.ustadh.user?.phone && <div style={{ fontFamily:fonts.mono, fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{batch.ustadh.user.phone}</div>}
              </>
            ) : (
              <div style={{ fontFamily:fonts.heading, fontSize:13, color:colors.error }}>No Ustadh Assigned ⚠️</div>
            )}
          </div>
          {/* Session */}
          {batch.sessionTime && (
            <div style={{ flex:1, minWidth:150 }}>
              <div style={{ fontFamily:fonts.mono, fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginBottom:6 }}>SESSION TIME</div>
              <div style={{ fontFamily:fonts.body, fontSize:13, color:"rgba(255,255,255,0.8)" }}>{batch.sessionTime}</div>
            </div>
          )}
          {/* Quick stats */}
          {[
            { label:"Students", val:`${batchStudents.length}/${batch.maxStudents}` },
            { label:"Program",  val:batch.program },
          ].map((s,i) => (
            <div key={i} style={{ flex:1, minWidth:100 }}>
              <div style={{ fontFamily:fonts.mono, fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginBottom:6 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:"white" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, background:colors.white, borderRadius:10, padding:4, border:`1px solid ${colors.n200}`, marginBottom:20 }}>
          {[{id:"students",label:`Students (${batchStudents.length})`},{id:"settings",label:"Settings & Ustadh"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ flex:1, padding:"9px", borderRadius:8, border:"none", cursor:"pointer", background:tab===t.id?colors.primary:"transparent", color:tab===t.id?"white":colors.n500, fontFamily:fonts.heading, fontSize:13, fontWeight:600 }}>{t.label}</button>
          ))}
        </div>

        {/* TAB: STUDENTS */}
        {tab === "students" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

            {/* Students IN batch */}
            <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", background:colors.green50, borderBottom:`1px solid ${colors.green200}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.primary }}>In This Halqa</div>
                  <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n500 }}>{batchStudents.length} of {batch.maxStudents} seats filled</div>
                </div>
                <span style={{ background:colors.primary, color:"white", padding:"3px 10px", borderRadius:999, fontFamily:fonts.mono, fontSize:11, fontWeight:700 }}>{batchStudents.length}</span>
              </div>

              {batchStudents.length === 0 ? (
                <div style={{ padding:32, textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
                  <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400 }}>No students yet. Add from the right panel.</div>
                </div>
              ) : batchStudents.map((s: any, i: number) => {
                const health = s.manzilHealth?.[0]?.score ? Math.round(s.manzilHealth[0].score) : null;
                const hColor = health===null?colors.n400:health>=75?colors.successText:health>=55?colors.warningText:colors.errorText;
                const lastG  = s.lessonEntries?.[0]?.grade;
                const daysSince = s.lessonEntries?.[0]?.date
                  ? Math.floor((Date.now()-new Date(s.lessonEntries[0].date).getTime())/(1000*60*60*24))
                  : null;
                return (
                  <div key={s.id} style={{ padding:"12px 16px", borderBottom:i<batchStudents.length-1?`1px solid ${colors.n100}`:"none", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:10,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.primary }}>{s.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary, textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</Link>
                      <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400, marginTop:1 }}>
                        Juz {s.progress?.currentJuz||"—"} · {health!==null?<span style={{color:hColor,fontWeight:700}}>{health}%</span>:"—"}
                        {daysSince!==null&&<span style={{marginLeft:6,color:daysSince>7?colors.errorText:colors.n400}}>{daysSince===0?"today":daysSince===1?"yesterday":`${daysSince}d ago`}</span>}
                      </div>
                    </div>
                    <button onClick={()=>removeStudent(s.id,s.name)} disabled={removing===s.id}
                      style={{ padding:"4px 10px", borderRadius:6, background:colors.errorBg, color:colors.errorText, border:"none", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:fonts.heading, flexShrink:0 }}>
                      {removing===s.id?"...":"Remove"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Available students */}
            <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", background:colors.n50, borderBottom:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:8 }}>Unassigned Students</div>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search students..."
                  style={{ width:"100%", padding:"8px 10px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, outline:"none" }}/>
              </div>

              {filteredAvailable.length === 0 ? (
                <div style={{ padding:32, textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
                  <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400 }}>
                    {available.length === 0 ? "All students are assigned to halqas" : "No students match your search"}
                  </div>
                </div>
              ) : filteredAvailable.map((s: any, i: number) => (
                <div key={s.id} style={{ padding:"12px 16px", borderBottom:i<filteredAvailable.length-1?`1px solid ${colors.n100}`:"none", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:colors.n100,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n500 }}>{s.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                    <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400 }}>
                      {s.enrollmentNumber} · Juz {s.progress?.currentJuz||"—"} · {s.program}
                    </div>
                  </div>
                  <button onClick={()=>addStudent(s.id, s.name)} disabled={adding===s.id||batchStudents.length>=batch.maxStudents}
                    style={{ padding:"5px 12px", borderRadius:6, background:batchStudents.length>=batch.maxStudents?colors.n200:colors.green50, color:batchStudents.length>=batch.maxStudents?colors.n400:colors.primary, border:`1px solid ${batchStudents.length>=batch.maxStudents?colors.n200:colors.green200}`, fontSize:11, fontWeight:700, cursor:batchStudents.length>=batch.maxStudents?"not-allowed":"pointer", fontFamily:fonts.heading, flexShrink:0 }}>
                    {adding===s.id?"Adding...":batchStudents.length>=batch.maxStudents?"Full":"+ Add"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {tab === "settings" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Assign Ustadh */}
            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:4 }}>👨‍🏫 Assign Ustadh</div>
              <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginBottom:16 }}>The assigned Ustadh will see all students in this batch in their dashboard.</div>
              <div style={{ display:"flex", gap:10 }}>
                <select value={selectedUstadh} onChange={e=>setSelectedUstadh(e.target.value)}
                  style={{ flex:1, padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" }}>
                  <option value="">— No Ustadh —</option>
                  {asatidha.map(u=><option key={u.id} value={u.id}>{u.user.name}</option>)}
                </select>
                <button onClick={assignUstadh} disabled={savingUstadh} style={{ padding:"10px 24px", borderRadius:8, background:savingUstadh?colors.n300:colors.primary, color:"white", border:"none", cursor:savingUstadh?"not-allowed":"pointer", fontFamily:fonts.heading, fontSize:13, fontWeight:700 }}>
                  {savingUstadh?"Saving...":"Save"}
                </button>
              </div>
            </div>

            {/* Batch details */}
            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:16 }}>ℹ️ Batch Information</div>
              {[
                {label:"Name",        val:batch.name},
                {label:"Program",     val:batch.program},
                {label:"Session",     val:batch.sessionTime||"Not set"},
                {label:"Max Students",val:String(batch.maxStudents)},
                {label:"Status",      val:batch.isActive?"Active":"Inactive"},
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${colors.n100}` }}>
                  <span style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500 }}>{s.label}</span>
                  <span style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n800 }}>{s.val}</span>
                </div>
              ))}
              <div style={{ marginTop:16 }}>
                <Link href={`/dashboard/admin/batches/${id}/edit`} style={{ display:"inline-block", padding:"10px 20px", borderRadius:8, background:colors.green50, color:colors.primary, border:`1px solid ${colors.green200}`, fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
                  ✏️ Edit Batch Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
