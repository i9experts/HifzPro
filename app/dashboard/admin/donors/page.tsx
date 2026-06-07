"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

export default function AdminDonorsPage() {
  const [data,    setData]    = useState<any>({donors:[],stats:{}});
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"list"|"add">("list");
  const [students,setStudents]= useState<any[]>([]);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState("");
  const [result,  setResult]  = useState<any>(null);

  const [form, setForm] = useState({
    name:"", email:"", phone:"", isAnonymous:false, password:"",
    studentIds:[] as string[],
    scholarshipName:"", scholarshipType:"FULL", scholarshipPercent:50, scholarshipAmount:0,
    sendInvite:true,
  });

  const set = (k:string,v:any) => setForm(p=>({...p,[k]:v}));
  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/donors").then(r=>r.json()),
      fetch("/api/admin/students?limit=200&status=ACTIVE").then(r=>r.json()),
    ]).then(([dData,sData])=>{
      if(dData.success) setData(dData.data);
      if(sData.success) setStudents(sData.data.students);
    }).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[]);

  const toggleStudent = (id:string) => {
    setForm(p=>({ ...p, studentIds:p.studentIds.includes(id)?p.studentIds.filter(x=>x!==id):[...p.studentIds,id] }));
  };

  const handleAddDonor = async() => {
    if(!form.name.trim()) { showToast("⚠️ Donor name required"); return; }
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/donors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d    = await res.json();
      if(d.success){ setResult(d.data); fetchData(); setTab("list"); }
      else showToast(`❌ ${d.error}`);
    } finally { setSaving(false); }
  };

  const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

  const handleSignOut = async()=>{ await fetch("/api/auth/signout",{method:"POST"}); window.location.href="/signin"; };

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:colors.n800,color:"white",padding:"10px 20px",borderRadius:10,fontFamily:fonts.heading,fontSize:13,zIndex:999}}>{toast}</div>}

      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Link href="/dashboard/admin" style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{fontFamily:fonts.display,fontSize:16,fontWeight:700,color:colors.white,lineHeight:1}}>Donor Management</div>
            <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.gold,opacity:0.8,letterSpacing:1}}>إدارة المتبرعين</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setTab("add")} style={{padding:"8px 18px",borderRadius:8,background:colors.gold,color:colors.white,fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:fonts.heading}}>+ Add Donor</button>
          <button onClick={handleSignOut} style={{padding:"6px 12px",borderRadius:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",fontFamily:fonts.heading}}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 20px"}}>

        <div style={{marginBottom:24}}>
          <div style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4}}>DONOR MANAGEMENT</div>
          <h1 style={{fontFamily:fonts.display,fontSize:"1.8rem",fontWeight:700,color:colors.n800,margin:"0 0 4px"}}>Donor Portal Management</h1>
          <p style={{fontFamily:fonts.body,fontSize:13,color:colors.n500}}>Manage donors, link them to sponsored students, send portal access via WhatsApp</p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[
            {icon:"🤲",val:data.stats.total||0,         label:"Total Donors",           color:"#7c3aed",bg:"#f5f3ff",border:"#c4b5fd"},
            {icon:"✅",val:data.stats.active||0,         label:"Active Sponsorships",    color:colors.successText,bg:colors.successBg,border:`${colors.success}44`},
            {icon:"🎓",val:data.stats.totalStudentsSponsored||0,label:"Students Sponsored",color:colors.primary,bg:colors.green50,border:colors.green200},
            {icon:"🕶️",val:data.stats.anonymous||0,      label:"Anonymous Donors",       color:colors.n500,bg:colors.n100,border:colors.n200},
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,borderRadius:14,padding:"16px 14px",border:`1px solid ${s.border}`,textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontFamily:fonts.heading,fontSize:24,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontFamily:fonts.body,fontSize:11,color:s.color,opacity:0.8,marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,background:colors.white,borderRadius:10,padding:3,border:`1px solid ${colors.n200}`,marginBottom:20,width:"fit-content"}}>
          {[{id:"list",label:`Donors (${data.donors.length})`},{id:"add",label:"+ Add Donor"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{padding:"9px 18px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?colors.primary:"transparent",color:tab===t.id?"white":colors.n500,fontFamily:fonts.heading,fontSize:12,fontWeight:600}}>{t.label}</button>
          ))}
        </div>

        {/* LIST */}
        {tab==="list"&&(
          loading?(
            <div style={{padding:48,textAlign:"center",color:colors.n400,fontFamily:fonts.body}}>Loading donors...</div>
          ):data.donors.length===0?(
            <div style={{background:colors.white,borderRadius:14,padding:48,textAlign:"center",border:`1px solid ${colors.n200}`}}>
              <div style={{fontSize:48,marginBottom:12}}>🤲</div>
              <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:colors.n700,marginBottom:8}}>No donors yet</div>
              <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400,marginBottom:20}}>Add your first donor and link them to sponsored students</div>
              <button onClick={()=>setTab("add")} style={{padding:"11px 24px",borderRadius:9,background:"#7c3aed",color:"white",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>Add First Donor →</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {data.donors.map((d:any)=>{
                const activeSchs = d.scholarships.filter((s:any)=>s.isActive);
                return (
                  <div key={d.id} style={{background:colors.white,borderRadius:14,padding:"18px 20px",border:`1px solid ${colors.n200}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                      <div style={{width:44,height:44,borderRadius:12,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>
                        {d.isAnonymous?"🕶️":"🤲"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800}}>{d.isAnonymous?"Anonymous Donor":d.name}</div>
                        <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n500}}>
                          {d.email||"—"} · {d.phone||"—"}
                          {d.lastLoginAt&&<span style={{marginLeft:8}}>Last login: {new Date(d.lastLoginAt).toLocaleDateString("en-PK",{day:"numeric",month:"short"})}</span>}
                        </div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:fonts.heading,fontSize:18,fontWeight:700,color:"#7c3aed"}}>{activeSchs.length}</div>
                        <div style={{fontFamily:fonts.body,fontSize:9,color:colors.n400}}>Students</div>
                      </div>
                    </div>
                    {activeSchs.length>0&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${colors.n100}`,display:"flex",flexWrap:"wrap",gap:6}}>
                        {activeSchs.map((s:any)=>(
                          <div key={s.id} style={{background:colors.green50,borderRadius:8,padding:"5px 10px",border:`1px solid ${colors.green200}`,display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:18,height:18,borderRadius:4,background:colors.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"white"}}>{s.student?.name?.charAt(0)||"?"}</div>
                            <span style={{fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:colors.primary}}>{s.student?.name||"—"}</span>
                            <span style={{fontFamily:fonts.mono,fontSize:8,color:colors.n400}}>Juz {s.student?.progress?.currentJuz||"—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ADD DONOR */}
        {tab==="add"&&(
          <div style={{background:colors.white,borderRadius:16,padding:28,border:`1px solid ${colors.n200}`}}>
            <div style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4}}>ADD DONOR</div>
            <h2 style={{fontFamily:fonts.display,fontSize:"1.4rem",fontWeight:700,color:colors.n800,margin:"0 0 20px"}}>Add New Donor</h2>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5}}>Donor Name *</label>
                <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Haji Muhammad Farooq" style={inp}/>
              </div>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5}}>Email</label>
                <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="donor@email.com" style={inp}/>
              </div>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5}}>WhatsApp / Phone</label>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+92 300 0000000" style={inp}/>
              </div>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5}}>Portal Password</label>
                <input value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Leave blank to auto-generate" style={inp}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:colors.n50,borderRadius:8}}>
                <input type="checkbox" checked={form.isAnonymous} onChange={e=>set("isAnonymous",e.target.checked)} style={{width:15,height:15,accentColor:colors.primary}}/>
                <div>
                  <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700}}>Anonymous Donor</div>
                  <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n400}}>Name hidden from students</div>
                </div>
              </div>
            </div>

            {/* Scholarship type */}
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:8}}>Scholarship Type</label>
              <div style={{display:"flex",gap:8}}>
                {[{id:"FULL",label:"Full Waiver"},{id:"PARTIAL_PERCENT",label:"% Discount"},{id:"PARTIAL_AMOUNT",label:"Fixed Amount"}].map(t=>(
                  <button key={t.id} onClick={()=>set("scholarshipType",t.id)} style={{flex:1,padding:"9px 8px",borderRadius:9,border:`2px solid ${form.scholarshipType===t.id?"#7c3aed":colors.n200}`,background:form.scholarshipType===t.id?"#f5f3ff":colors.n50,cursor:"pointer",fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:form.scholarshipType===t.id?"#7c3aed":colors.n700}}>{t.label}</button>
                ))}
              </div>
              {form.scholarshipType==="PARTIAL_PERCENT"&&(
                <div style={{marginTop:10}}>
                  <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5}}>Percentage</label>
                  <input type="number" value={form.scholarshipPercent} onChange={e=>set("scholarshipPercent",parseInt(e.target.value)||0)} min={1} max={99} style={inp}/>
                </div>
              )}
              {form.scholarshipType==="PARTIAL_AMOUNT"&&(
                <div style={{marginTop:10}}>
                  <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5}}>Fixed Amount (PKR)</label>
                  <input type="number" value={form.scholarshipAmount} onChange={e=>set("scholarshipAmount",parseFloat(e.target.value)||0)} min={0} style={{...inp,fontFamily:fonts.mono,fontWeight:700,color:"#7c3aed"}}/>
                </div>
              )}
            </div>

            {/* Link students */}
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:8}}>Link to Students (optional)</label>
              <div style={{maxHeight:200,overflowY:"auto",border:`1px solid ${colors.n200}`,borderRadius:8}}>
                {students.map((s,i)=>(
                  <label key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderBottom:i<students.length-1?`1px solid ${colors.n100}`:"none",cursor:"pointer",background:form.studentIds.includes(s.id)?colors.green50:"transparent"}}>
                    <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={()=>toggleStudent(s.id)} style={{width:14,height:14,accentColor:colors.primary}}/>
                    <div style={{width:28,height:28,borderRadius:7,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:colors.primary,flexShrink:0}}>{s.name.charAt(0)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.n800}}>{s.name}</div>
                      <div style={{fontFamily:fonts.mono,fontSize:9,color:colors.n400}}>{s.enrollmentNumber} · {s.program}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Send invite toggle */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:colors.green50,borderRadius:10,border:`1px solid ${colors.green200}`,marginBottom:20}}>
              <span style={{fontSize:20}}>💬</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.primary}}>Send WhatsApp Invite</div>
                <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n600}}>Send login credentials to donor's WhatsApp</div>
              </div>
              <div onClick={()=>set("sendInvite",!form.sendInvite)} style={{width:44,height:24,borderRadius:12,background:form.sendInvite?colors.success:colors.n300,position:"relative",cursor:"pointer",transition:"background 0.2s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:form.sendInvite?23:3,transition:"left 0.2s"}}/>
              </div>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setTab("list")} style={{flex:1,padding:"13px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,cursor:"pointer",fontFamily:fonts.heading,fontSize:13}}>Cancel</button>
              <button onClick={handleAddDonor} disabled={saving||!form.name.trim()} style={{flex:2,padding:"13px",borderRadius:10,fontSize:13,fontWeight:700,border:"none",background:!form.name.trim()||saving?colors.n300:"#7c3aed",color:"white",cursor:!form.name.trim()||saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
                {saving?"Adding Donor...":"🤲 Add Donor & Send Invite"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
