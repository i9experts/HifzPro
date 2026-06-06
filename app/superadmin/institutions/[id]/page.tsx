"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PLANS = [
  { id:"TRIAL",        label:"Free Trial",    amount:0,    desc:"14 days free" },
  { id:"BASIC",        label:"Basic",         amount:2999, desc:"Up to 50 students" },
  { id:"PROFESSIONAL", label:"Professional",  amount:5999, desc:"Up to 200 students" },
  { id:"ENTERPRISE",   label:"Enterprise",    amount:9999, desc:"Unlimited students" },
];

const PLAN_COLOR: Record<string,{color:string;bg:string}> = {
  TRIAL:        { color:"#d97706", bg:"#431d00" },
  BASIC:        { color:"#60a5fa", bg:"#1e3a5f" },
  PROFESSIONAL: { color:"#10B981", bg:"#052e16" },
  ENTERPRISE:   { color:"#a78bfa", bg:"#2e1b69" },
};

function StatBox({ icon, val, label }: { icon:string; val:any; label:string }) {
  return (
    <div style={{ background:"#1f2937", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
      <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
      <div style={{ fontFamily:fonts.heading, fontSize:20, fontWeight:700, color:"white" }}>{val}</div>
      <div style={{ fontFamily:fonts.body, fontSize:10, color:"#6b7280", marginTop:2 }}>{label}</div>
    </div>
  );
}

export default function InstitutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }     = use(params);
  const [data,     setData]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"overview"|"campus"|"subscription"|"activity">("overview");
  const [toast,    setToast]    = useState("");
  const [saving,   setSaving]   = useState(false);

  // Subscription form
  const [subForm, setSubForm] = useState({
    plan:"PROFESSIONAL", status:"ACTIVE", amount:5999,
    billingCycle:"MONTHLY", endDate:"", trialEndsAt:"", notes:"",
  });

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/superadmin/institutions/${id}`)
      .then(r=>r.json())
      .then(d=>{ if(d.success){ setData(d.data); const sub=d.data.institution.subscriptions?.[0]; if(sub) setSubForm(f=>({...f,plan:sub.plan,status:sub.status,amount:sub.amount,billingCycle:sub.billingCycle||"MONTHLY",notes:sub.notes||""})); } })
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[id]);

  const handleAction = async(action:string, extra?:any) => {
    setSaving(true);
    try {
      const res  = await fetch(`/api/superadmin/institutions/${id}`,{
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action,...extra}),
      });
      const d = await res.json();
      if(d.success){ showToast(`✅ ${action.replace("_"," ")} successful`); fetchData(); }
      else showToast(`❌ ${d.error}`);
    } finally { setSaving(false); }
  };

  const handleUpdateSub = () => handleAction("UPDATE_SUBSCRIPTION", subForm);

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:fonts.body,color:"#4b5563"}}>Loading institution data...</div>
    </div>
  );

  if(!data) return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:fonts.heading,fontSize:16,color:"#dc2626",marginBottom:12}}>Institution not found</div>
        <Link href="/superadmin" style={{color:"#10B981",fontFamily:fonts.heading}}>← Back to dashboard</Link>
      </div>
    </div>
  );

  const inst = data.institution;
  const sub  = inst.subscriptions?.[0];
  const stats= data.stats;
  const pc   = PLAN_COLOR[sub?.plan||"TRIAL"] || PLAN_COLOR.TRIAL;
  const totalStudents = inst.campuses?.reduce((acc:number,c:any)=>acc+c.students.length,0)||0;
  const totalUstadh   = inst.campuses?.reduce((acc:number,c:any)=>acc+c.users.length,0)||0;
  const totalBatches  = inst.campuses?.reduce((acc:number,c:any)=>acc+c.batches.filter((b:any)=>b.isActive).length,0)||0;
  const createdDate   = new Date(inst.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"});

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a"}}>
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"#111827",color:"white",padding:"10px 20px",borderRadius:10,fontFamily:fonts.heading,fontSize:13,zIndex:999,border:"1px solid #1f2937",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>{toast}</div>}

      {/* Nav */}
      <nav style={{background:"#111827",borderBottom:"1px solid #1f2937",padding:"0 28px",height:60,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Link href="/superadmin" style={{width:32,height:32,borderRadius:8,background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"#9ca3af",fontSize:16}}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:"white"}}>{inst.name}</div>
        {!inst.isActive&&<span style={{background:"#7f1d1d",color:"#fca5a5",padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>SUSPENDED</span>}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {inst.isActive
            ? <button onClick={()=>{ if(confirm(`Suspend ${inst.name}? All users will lose access.`)) handleAction("SUSPEND"); }} disabled={saving}
                style={{padding:"7px 14px",borderRadius:8,background:"#7f1d1d",border:"1px solid #dc262644",color:"#fca5a5",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>
                Suspend Institution
              </button>
            : <button onClick={()=>handleAction("ACTIVATE")} disabled={saving}
                style={{padding:"7px 14px",borderRadius:8,background:"#052e16",border:"1px solid #10B98144",color:"#10B981",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>
                Reactivate
              </button>
          }
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}}>

        {/* Hero */}
        <div style={{background:"linear-gradient(135deg,#111827,#1f2937)",borderRadius:20,padding:24,marginBottom:20,display:"flex",gap:20,alignItems:"center",flexWrap:"wrap",border:"1px solid #1f2937"}}>
          <div style={{width:64,height:64,borderRadius:16,background:pc.bg,border:`2px solid ${pc.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
            {inst.logo
              ? <img src={inst.logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span style={{fontFamily:fonts.display,fontSize:26,fontWeight:700,color:pc.color}}>{inst.name.charAt(0)}</span>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4}}>
              <h1 style={{fontFamily:fonts.display,fontSize:"1.6rem",fontWeight:700,color:"white",margin:0}}>{inst.name}</h1>
              <span style={{background:pc.bg,color:pc.color,padding:"3px 10px",borderRadius:6,fontFamily:fonts.heading,fontSize:11,fontWeight:700}}>{sub?.plan||"NO PLAN"}</span>
            </div>
            <div style={{fontFamily:fonts.body,fontSize:12,color:"#6b7280"}}>
              {inst.city||"—"} · {inst.email||"—"} · {inst.phone||"—"}
            </div>
            <div style={{fontFamily:fonts.mono,fontSize:10,color:"#4b5563",marginTop:4}}>
              Member since {createdDate} · Admin: {inst.users?.[0]?.name||"—"}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {val:totalStudents, label:"Students",  color:"#60a5fa"},
              {val:totalUstadh,   label:"Ustadh",    color:"#a78bfa"},
              {val:totalBatches,  label:"Batches",   color:"#34d399"},
              {val:inst._count?.campuses||inst.campuses?.length||0, label:"Campuses", color:"#f97316"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",background:"#0f172a",borderRadius:10,padding:"10px 14px"}}>
                <div style={{fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
                <div style={{fontFamily:fonts.body,fontSize:9,color:"#4b5563",marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:"#111827",borderRadius:10,padding:4,border:"1px solid #1f2937",marginBottom:20}}>
          {[{id:"overview",label:"Overview"},{id:"campus",label:`Campuses (${inst.campuses?.length||0})`},{id:"subscription",label:"Subscription"},{id:"activity",label:"Activity"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?"#10B981":"transparent",color:tab===t.id?"#052e16":"#6b7280",fontFamily:fonts.heading,fontSize:12,fontWeight:700}}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              <StatBox icon="📖" val={stats.totalLessons?.toLocaleString()||0} label="Total Lessons"/>
              <StatBox icon="📖" val={stats.weekLessons||0} label="Lessons This Week"/>
              <StatBox icon="📝" val={stats.totalTests||0} label="Tests Recorded"/>
              <StatBox icon="💬" val={stats.totalNotifications||0} label="WhatsApp Sent"/>
            </div>
            {/* Admin contacts */}
            <div style={{background:"#111827",borderRadius:14,padding:20,border:"1px solid #1f2937"}}>
              <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:"white",marginBottom:14}}>👤 Admin Account{inst.users?.length>1?"s":""}</div>
              {inst.users?.map((u:any,i:number)=>{
                const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}) : "Never";
                return (
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<inst.users.length-1?"1px solid #1f2937":"none"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:"#10B981"}}>{u.name?.charAt(0)||"?"}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:"white"}}>{u.name}</div>
                      <div style={{fontFamily:fonts.mono,fontSize:10,color:"#4b5563"}}>{u.email}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:fonts.body,fontSize:11,color:"#9ca3af"}}>Last login</div>
                      <div style={{fontFamily:fonts.mono,fontSize:10,color:"#6b7280"}}>{lastLogin}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CAMPUSES */}
        {tab==="campus" && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {inst.campuses?.map((c:any,i:number)=>{
              const activeStuds = c.students?.filter((s:any)=>s.status==="ACTIVE").length||0;
              return (
                <div key={c.id} style={{background:"#111827",borderRadius:14,padding:20,border:"1px solid #1f2937"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                    <div>
                      <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:"white"}}>{c.name}</div>
                      <div style={{fontFamily:fonts.body,fontSize:11,color:"#6b7280",marginTop:2}}>{c.city||"—"} · {c.phone||"—"}</div>
                    </div>
                    <span style={{background:c.isActive?"#052e16":"#1c0a0a",color:c.isActive?"#10B981":"#dc2626",padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>
                      {c.isActive?"ACTIVE":"INACTIVE"}
                    </span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                    {[
                      {val:c.students?.length||0,  label:"Total Students", color:"#60a5fa"},
                      {val:activeStuds,              label:"Active",        color:"#10B981"},
                      {val:c.users?.length||0,       label:"Ustadh",        color:"#a78bfa"},
                      {val:c.batches?.filter((b:any)=>b.isActive).length||0, label:"Active Batches", color:"#f97316"},
                    ].map((s,j)=>(
                      <div key={j} style={{background:"#1f2937",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                        <div style={{fontFamily:fonts.heading,fontSize:18,fontWeight:700,color:s.color}}>{s.val}</div>
                        <div style={{fontFamily:fonts.body,fontSize:9,color:"#6b7280",marginTop:1}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Batches */}
                  {c.batches?.filter((b:any)=>b.isActive).length>0 && (
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {c.batches.filter((b:any)=>b.isActive).map((b:any)=>(
                        <span key={b.id} style={{background:"#1f2937",color:"#9ca3af",padding:"3px 8px",borderRadius:5,fontSize:10,fontFamily:fonts.heading}}>
                          {b.name} · {b._count?.students||0}s
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab==="subscription" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Current plan */}
            <div style={{background:pc.bg,borderRadius:14,padding:20,border:`1px solid ${pc.color}33`}}>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:pc.color,letterSpacing:2,marginBottom:4}}>CURRENT PLAN</div>
              <div style={{fontFamily:fonts.display,fontSize:28,fontWeight:700,color:pc.color}}>{sub?.plan||"NO PLAN"}</div>
              <div style={{display:"flex",gap:20,marginTop:10,flexWrap:"wrap"}}>
                {[
                  {label:"Status",  val:sub?.status||"—"},
                  {label:"Amount",  val:sub?.amount?`PKR ${sub.amount.toLocaleString()}/mo`:"Free"},
                  {label:"Renewal", val:sub?.endDate?new Date(sub.endDate).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"}):"—"},
                ].map((s,i)=>(
                  <div key={i}>
                    <div style={{fontFamily:fonts.mono,fontSize:8,color:pc.color,opacity:0.6,letterSpacing:1}}>{s.label.toUpperCase()}</div>
                    <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:pc.color}}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Update subscription */}
            <div style={{background:"#111827",borderRadius:14,padding:24,border:"1px solid #1f2937"}}>
              <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:"white",marginBottom:20}}>⚙️ Update Subscription</div>

              {/* Plan selector */}
              <div style={{marginBottom:16}}>
                <div style={{fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:"#9ca3af",marginBottom:8}}>Plan</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {PLANS.map(p=>{
                    const pc2=PLAN_COLOR[p.id]||PLAN_COLOR.TRIAL;
                    return (
                      <button key={p.id} onClick={()=>setSubForm(f=>({...f,plan:p.id,amount:p.amount}))} style={{padding:"12px 8px",borderRadius:10,border:`2px solid ${subForm.plan===p.id?pc2.color:"#1f2937"}`,background:subForm.plan===p.id?pc2.bg:"#1f2937",cursor:"pointer",textAlign:"center"}}>
                        <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:subForm.plan===p.id?pc2.color:"#9ca3af"}}>{p.label}</div>
                        <div style={{fontFamily:fonts.mono,fontSize:10,color:subForm.plan===p.id?pc2.color:"#4b5563",marginTop:3}}>PKR {p.amount.toLocaleString()}</div>
                        <div style={{fontFamily:fonts.body,fontSize:9,color:"#4b5563",marginTop:2}}>{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status + Billing */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div>
                  <div style={{fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:"#9ca3af",marginBottom:4}}>Status</div>
                  <select value={subForm.status} onChange={e=>setSubForm(f=>({...f,status:e.target.value}))}
                    style={{width:"100%",padding:"9px 11px",background:"#1f2937",border:"1px solid #374151",borderRadius:7,fontSize:12,fontFamily:fonts.body,color:"white",outline:"none"}}>
                    {["ACTIVE","TRIAL","EXPIRED","CANCELLED","SUSPENDED"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:"#9ca3af",marginBottom:4}}>Billing Cycle</div>
                  <select value={subForm.billingCycle} onChange={e=>setSubForm(f=>({...f,billingCycle:e.target.value}))}
                    style={{width:"100%",padding:"9px 11px",background:"#1f2937",border:"1px solid #374151",borderRadius:7,fontSize:12,fontFamily:fonts.body,color:"white",outline:"none"}}>
                    {["MONTHLY","QUARTERLY","ANNUAL"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:"#9ca3af",marginBottom:4}}>Amount (PKR)</div>
                  <input type="number" value={subForm.amount} onChange={e=>setSubForm(f=>({...f,amount:parseInt(e.target.value)||0}))}
                    style={{width:"100%",padding:"9px 11px",background:"#1f2937",border:"1px solid #374151",borderRadius:7,fontSize:12,fontFamily:fonts.mono,color:"#10B981",outline:"none"}}/>
                </div>
                <div>
                  <div style={{fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:"#9ca3af",marginBottom:4}}>Renewal Date</div>
                  <input type="date" value={subForm.endDate} onChange={e=>setSubForm(f=>({...f,endDate:e.target.value}))}
                    style={{width:"100%",padding:"9px 11px",background:"#1f2937",border:"1px solid #374151",borderRadius:7,fontSize:12,fontFamily:fonts.body,color:"#d1d5db",outline:"none"}}/>
                </div>
              </div>

              <div style={{marginBottom:14}}>
                <div style={{fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:"#9ca3af",marginBottom:4}}>Internal Notes</div>
                <textarea value={subForm.notes} onChange={e=>setSubForm(f=>({...f,notes:e.target.value}))} rows={2} placeholder="Payment notes, special terms..."
                  style={{width:"100%",padding:"9px 11px",background:"#1f2937",border:"1px solid #374151",borderRadius:7,fontSize:12,fontFamily:fonts.body,color:"#d1d5db",outline:"none",resize:"none"}}/>
              </div>

              <button onClick={handleUpdateSub} disabled={saving}
                style={{width:"100%",padding:"13px",borderRadius:10,background:saving?"#1f2937":"#10B981",color:saving?"#4b5563":"#052e16",border:"none",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
                {saving?"Saving...":"Update Subscription ✓"}
              </button>
            </div>

            {/* Subscription history */}
            {inst.subscriptions?.length > 1 && (
              <div style={{background:"#111827",borderRadius:14,padding:20,border:"1px solid #1f2937"}}>
                <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:"white",marginBottom:12}}>📋 Subscription History</div>
                {inst.subscriptions.slice(0,5).map((s:any,i:number)=>{
                  const pc2=PLAN_COLOR[s.plan]||PLAN_COLOR.TRIAL;
                  return (
                    <div key={s.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?"1px solid #1f2937":"none",alignItems:"center"}}>
                      <span style={{background:pc2.bg,color:pc2.color,padding:"2px 8px",borderRadius:5,fontSize:10,fontFamily:fonts.heading,fontWeight:700}}>{s.plan}</span>
                      <span style={{fontFamily:fonts.mono,fontSize:11,color:"#9ca3af"}}>PKR {s.amount?.toLocaleString()||0}</span>
                      <span style={{fontFamily:fonts.body,fontSize:10,color:"#4b5563"}}>{new Date(s.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {tab==="activity" && (
          <div style={{background:"#111827",borderRadius:14,padding:24,border:"1px solid #1f2937"}}>
            <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:"white",marginBottom:14}}>📊 Platform Activity</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {[
                {icon:"📖",label:"Total Lessons Recorded",       val:stats.totalLessons?.toLocaleString()||0,    color:"#10B981"},
                {icon:"📖",label:"Lessons This Week",            val:stats.weekLessons||0,                       color:"#34d399"},
                {icon:"📝",label:"Tests Recorded",               val:stats.totalTests||0,                        color:"#60a5fa"},
                {icon:"💬",label:"WhatsApp Messages Sent",       val:stats.totalNotifications?.toLocaleString()||0, color:"#4ade80"},
              ].map((s,i)=>(
                <div key={i} style={{background:"#1f2937",borderRadius:10,padding:"16px 18px",borderLeft:`3px solid ${s.color}`}}>
                  <span style={{fontSize:20}}>{s.icon}</span>
                  <div style={{fontFamily:fonts.heading,fontSize:24,fontWeight:700,color:s.color,marginTop:6}}>{s.val}</div>
                  <div style={{fontFamily:fonts.body,fontSize:12,color:"#6b7280",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
