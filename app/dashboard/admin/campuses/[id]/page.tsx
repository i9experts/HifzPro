"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PROG_COLOR: Record<string,string> = {
  HIFZ:colors.primary, NAZRA:"#7c3aed", TAJWEED:"#b45309", GIRDAAN:"#0f766e"
};

export default function CampusDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params);
  const [data,    setData]    = useState<any>(null);
  const [campuses,setCampuses]= useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"students"|"transfer">("overview");
  const [toast,   setToast]   = useState("");
  const [transferForm, setTransferForm] = useState({ studentId:"", toCampusId:"", toBatchId:"", reason:"" });
  const [transferring, setTransferring] = useState(false);
  const [toCampusBatches, setToCampusBatches] = useState<any[]>([]);

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3500); };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/campuses/${id}`).then(r=>r.json()),
      fetch("/api/admin/campuses").then(r=>r.json()),
    ]).then(([cData,allData])=>{
      if(cData.success) setData(cData.data);
      if(allData.success) setCampuses(allData.data.campuses.filter((c:any)=>c.id!==id));
    }).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[id]);

  // Load batches of destination campus
  useEffect(()=>{
    if(!transferForm.toCampusId) return;
    fetch(`/api/admin/campuses/${transferForm.toCampusId}`)
      .then(r=>r.json())
      .then(d=>{ if(d.success) setToCampusBatches(d.data.campus.batches||[]); });
  },[transferForm.toCampusId]);

  const handleTransfer = async() => {
    if(!transferForm.studentId||!transferForm.toCampusId) { showToast("⚠️ Select student and destination campus"); return; }
    setTransferring(true);
    try {
      const res  = await fetch(`/api/admin/campuses/${id}/transfer`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(transferForm)});
      const d    = await res.json();
      if(d.success){ showToast(`✅ ${d.data.message}`); setTransferForm({studentId:"",toCampusId:"",toBatchId:"",reason:""}); fetchData(); }
      else showToast(`❌ ${d.error}`);
    } finally { setTransferring(false); }
  };

  if(loading) return <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:fonts.body,color:"rgba(255,255,255,0.4)"}}>Loading campus...</div></div>;
  if(!data) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div><div style={{fontFamily:fonts.heading,fontSize:16,color:colors.n700}}>Campus not found</div><Link href="/dashboard/admin/campuses" style={{color:colors.primary}}>← Back</Link></div></div>;

  const c     = data.campus;
  const stats = data.stats;
  const inp   = {width:"100%",padding:"10px 12px",border:`1.5px solid ${colors.n200}`,borderRadius:8,fontSize:12,fontFamily:fonts.body,color:colors.n800,background:colors.white,outline:"none"};

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:colors.n800,color:"white",padding:"10px 20px",borderRadius:10,fontFamily:fonts.heading,fontSize:13,zIndex:999,boxShadow:"0 4px 16px rgba(0,0,0,0.3)"}}>{toast}</div>}

      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Link href="/dashboard/admin/campuses" style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.white,lineHeight:1}}>{c.name}</div>
        {!c.isActive&&<span style={{background:"rgba(239,68,68,0.3)",color:"#fca5a5",padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>INACTIVE</span>}
      </nav>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,${colors.deep},${colors.primary}88)`,borderRadius:16,padding:22,marginBottom:20,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",position:"relative",overflow:"hidden"}}>
          <svg style={{position:"absolute",right:-20,top:-20,opacity:0.06}} width="120" height="120" viewBox="0 0 80 80">
            <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
          <div style={{width:56,height:56,borderRadius:14,background:"rgba(255,255,255,0.12)",border:"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🏛️</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:fonts.heading,fontSize:20,fontWeight:700,color:"white"}}>{c.name}</div>
            <div style={{fontFamily:fonts.body,fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>{c.city||"—"} · {c.phone||"—"} · {c.address||"—"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {val:c.students?.length||0,   label:"Students",  color:"white"},
              {val:c.batches?.length||0,     label:"Batches",   color:"white"},
              {val:stats.weekLessons,        label:"Lessons/wk",color:"white"},
              {val:c.users?.length||0,       label:"Ustadh",    color:"white"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 12px"}}>
                <div style={{fontFamily:fonts.heading,fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
                <div style={{fontFamily:fonts.body,fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,background:colors.white,borderRadius:10,padding:3,border:`1px solid ${colors.n200}`,marginBottom:20}}>
          {[{id:"overview",label:"Overview"},{id:"students",label:`Students (${c.students?.length||0})`},{id:"transfer",label:"Transfer Students"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?colors.primary:"transparent",color:tab===t.id?"white":colors.n500,fontFamily:fonts.heading,fontSize:12,fontWeight:600}}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Batches */}
            <div style={{background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800}}>Active Halqas</div>
                <Link href="/dashboard/admin/batches" style={{fontFamily:fonts.heading,fontSize:11,color:colors.primary,textDecoration:"none"}}>Manage →</Link>
              </div>
              {c.batches?.length>0?(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                  {c.batches.map((b:any)=>(
                    <div key={b.id} style={{background:colors.n50,borderRadius:10,padding:"12px 14px",borderLeft:`4px solid ${PROG_COLOR[b.program]||colors.primary}`}}>
                      <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800}}>{b.name}</div>
                      <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n500,marginTop:2}}>
                        {b._count?.students||0} students · {b.ustadh?.user?.name||"Unassigned"}
                      </div>
                    </div>
                  ))}
                </div>
              ):(
                <div style={{textAlign:"center",padding:20,color:colors.n400,fontFamily:fonts.body,fontSize:13}}>No active batches</div>
              )}
            </div>
            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {[
                {icon:"📖",label:"Lessons This Week",  val:stats.weekLessons,  color:colors.primary},
                {icon:"📊",label:"Lessons This Month", val:stats.monthLessons, color:"#7c3aed"},
              ].map((s,i)=>(
                <div key={i} style={{background:colors.white,borderRadius:12,padding:"16px 18px",border:`1px solid ${colors.n200}`,display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:28}}>{s.icon}</span>
                  <div>
                    <div style={{fontFamily:fonts.heading,fontSize:26,fontWeight:700,color:s.color}}>{s.val}</div>
                    <div style={{fontFamily:fonts.body,fontSize:12,color:colors.n500}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {tab==="students"&&(
          <div style={{background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${colors.n100}`,fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800}}>
              All Students — {c.name}
            </div>
            {!c.students?.length?(
              <div style={{padding:40,textAlign:"center",color:colors.n400,fontFamily:fonts.body}}>No active students in this campus.</div>
            ):c.students.map((s:any,i:number)=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:i<c.students.length-1?`1px solid ${colors.n100}`:"none"}}>
                <div style={{width:36,height:36,borderRadius:10,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary}}>{s.name.charAt(0)}</span>
                </div>
                <div style={{flex:1}}>
                  <Link href={`/dashboard/admin/students/${s.id}`} style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.primary,textDecoration:"none"}}>{s.name}</Link>
                  <div style={{fontFamily:fonts.mono,fontSize:9,color:colors.n400}}>{s.enrollmentNumber} · {s.batch?.name||"No batch"} · Juz {s.progress?.currentJuz||"—"}</div>
                </div>
                <button onClick={()=>{ setTransferForm(f=>({...f,studentId:s.id})); setTab("transfer"); }} style={{padding:"4px 10px",borderRadius:6,background:colors.n50,border:`1px solid ${colors.n200}`,color:colors.n600,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>Transfer</button>
              </div>
            ))}
          </div>
        )}

        {/* TRANSFER */}
        {tab==="transfer"&&(
          <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
            <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:4}}>🔄 Transfer Student to Another Campus</div>
            <div style={{fontFamily:fonts.body,fontSize:12,color:colors.n500,marginBottom:20}}>Move a student from this campus to another campus within your institution. All their lesson history is preserved.</div>

            {campuses.length===0?(
              <div style={{background:colors.warningBg,borderRadius:10,padding:"14px 16px",border:`1px solid ${colors.warning}44`}}>
                <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.warningText}}>⚠️ No other campuses available</div>
                <div style={{fontFamily:fonts.body,fontSize:11,color:colors.warningText,opacity:0.8,marginTop:4}}>Add another campus first to enable student transfers.</div>
                <Link href="/dashboard/admin/campuses/new" style={{display:"inline-block",marginTop:10,padding:"7px 14px",borderRadius:7,background:colors.warning,color:"white",fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading}}>Add Campus →</Link>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div>
                  <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Student to Transfer *</label>
                  <select value={transferForm.studentId} onChange={e=>setTransferForm(f=>({...f,studentId:e.target.value}))} style={inp}>
                    <option value="">Select student...</option>
                    {c.students?.map((s:any)=><option key={s.id} value={s.id}>{s.name} — {s.enrollmentNumber} — {s.batch?.name||"No batch"}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Transfer To Campus *</label>
                  <select value={transferForm.toCampusId} onChange={e=>setTransferForm(f=>({...f,toCampusId:e.target.value,toBatchId:""}))} style={inp}>
                    <option value="">Select destination campus...</option>
                  {campuses.map((c:any)=><option key={c.id} value={c.id}>{c.name} — {c.city||"—"} ({c._count?.students||0} students)</option>)}
                  </select>
                </div>
                {toCampusBatches.length>0&&(
                  <div>
                    <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Assign to Batch (optional)</label>
                    <select value={transferForm.toBatchId} onChange={e=>setTransferForm(f=>({...f,toBatchId:e.target.value}))} style={inp}>
                      <option value="">— No batch —</option>
                      {toCampusBatches.map((b:any)=><option key={b.id} value={b.id}>{b.name} ({b._count?.students||0} students)</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Reason (optional)</label>
                  <input value={transferForm.reason} onChange={e=>setTransferForm(f=>({...f,reason:e.target.value}))} placeholder="e.g. Family moved, closer to home" style={inp}/>
                </div>
                {transferForm.studentId&&transferForm.toCampusId&&(
                  <div style={{background:colors.warningBg,borderRadius:10,padding:"12px 14px",border:`1px solid ${colors.warning}44`}}>
                    <div style={{fontFamily:fonts.body,fontSize:12,color:colors.warningText,lineHeight:1.7}}>
                      ⚠️ This will move the student to <strong>{campuses.find((c:any)=>c.id===transferForm.toCampusId)?.name}</strong>. All lesson history, attendance, and test records will be preserved. This action can be reversed by transferring them back.
                    </div>
                  </div>
                )}
                <button onClick={handleTransfer} disabled={transferring||!transferForm.studentId||!transferForm.toCampusId}
                  style={{padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,border:"none",cursor:!transferForm.studentId||!transferForm.toCampusId||transferring?"not-allowed":"pointer",background:!transferForm.studentId||!transferForm.toCampusId?colors.n300:colors.primary,color:"white",fontFamily:fonts.heading}}>
                  {transferring?"Transferring...":"🔄 Transfer Student"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
