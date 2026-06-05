"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const SCHOLARSHIP_TYPES = [
  { id:"FULL",           label:"Full Scholarship",    labelUr:"مکمل وظیفہ",    icon:"🏆", desc:"100% fee waiver — student pays nothing" },
  { id:"PARTIAL_PERCENT",label:"Partial %",           labelUr:"جزوی فیصدی",    icon:"📊", desc:"e.g. 50% discount on monthly fee" },
  { id:"PARTIAL_AMOUNT", label:"Fixed Amount Waiver", labelUr:"مقررہ رقم",     icon:"💰", desc:"e.g. PKR 500 off every month" },
];

const REASONS = ["Merit-based","Need-based","Hafiz family","Orphan / Widowed parent","Staff family","Performance reward","Special needs","Founder member","Other"];

const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function ScholarshipsPage() {
  const [students,  setStudents]  = useState<any[]>([]);
  const [existing,  setExisting]  = useState<any[]>([]);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");
  const [view,      setView]      = useState<"grant"|"list">("list");

  const [form, setForm] = useState({
    studentId:   "",
    name:        "",
    type:        "FULL",
    percentage:  50,
    fixedAmount: 0,
    reason:      "Need-based",
    startDate:   new Date().toISOString().split("T")[0],
    endDate:     "",
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetch("/api/admin/students?limit=200&status=ACTIVE").then(r=>r.json()).then(d=>{ if(d.success) setStudents(d.data.students); });
    fetch("/api/admin/fees/scholarships").then(r=>r.json()).then(d=>{ if(d.success) setExisting(d.data.scholarships); });
  },[]);

  const handleSubmit = async () => {
    if(!form.studentId) { setError("Please select a student"); return; }
    if(!form.name.trim()) { setError("Scholarship name is required"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/fees/scholarships",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ ...form, percentage:form.type==="PARTIAL_PERCENT"?form.percentage:undefined, fixedAmount:form.type==="PARTIAL_AMOUNT"?form.fixedAmount:undefined, endDate:form.endDate||undefined }),
      });
      const data = await res.json();
      if(data.success){ setSaved(true); setTimeout(()=>{ setSaved(false); setView("list"); fetch("/api/admin/fees/scholarships").then(r=>r.json()).then(d=>{ if(d.success) setExisting(d.data.scholarships); }); },1500); }
      else setError(data.error||"Failed");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin/fees" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
          <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Scholarship Management</div>
        </div>
        <button onClick={()=>setView(view==="list"?"grant":"list")} style={{ padding:"8px 16px", borderRadius:8, background:view==="grant"?colors.n700:"#7c3aed", color:"white", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:fonts.heading }}>
          {view==="grant"?"← View All":"+ Grant Scholarship"}
        </button>
      </nav>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 20px" }}>

        {saved && <div style={{ background:colors.successBg, borderRadius:10, padding:"12px 16px", marginBottom:16, textAlign:"center" }}><span style={{ fontFamily:fonts.heading, fontSize:13, color:colors.successText }}>✅ Scholarship granted successfully!</span></div>}

        {view === "list" ? (
          <div>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>ACTIVE SCHOLARSHIPS</div>
            <h2 style={{ fontFamily:fonts.display, fontSize:"1.5rem", fontWeight:700, color:colors.n800, margin:"0 0 20px" }}>Scholarship Registry</h2>

            {existing.length === 0 ? (
              <div style={{ background:colors.white, borderRadius:14, padding:40, textAlign:"center", border:`1px solid ${colors.n200}` }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎓</div>
                <div style={{ fontFamily:fonts.heading, fontSize:15, color:colors.n700, marginBottom:6 }}>No scholarships yet</div>
                <button onClick={()=>setView("grant")} style={{ padding:"10px 24px", borderRadius:8, background:"#7c3aed", color:"white", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:fonts.heading }}>Grant First Scholarship →</button>
              </div>
            ) : existing.map((s,i)=>(
              <div key={s.id} style={{ background:colors.white, borderRadius:12, padding:"16px 18px", border:`1px solid ${colors.n200}`, marginBottom:10, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:20 }}>{SCHOLARSHIP_TYPES.find(t=>t.id===s.type)?.icon||"🎓"}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800 }}>{s.student.name}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500 }}>{s.name} · {s.student.enrollmentNumber}</div>
                  {s.reason && <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400 }}>{s.reason}</div>}
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:16, fontWeight:700, color:"#7c3aed" }}>
                    {s.type==="FULL"?"100% Off":s.type==="PARTIAL_PERCENT"?`${s.percentage}% Off`:`PKR ${s.fixedAmount?.toLocaleString()} Off`}
                  </div>
                  <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400 }}>{SCHOLARSHIP_TYPES.find(t=>t.id===s.type)?.label}</div>
                </div>
                <span style={{ background:s.isActive?"#f5f3ff":colors.n100, color:s.isActive?"#7c3aed":colors.n400, padding:"3px 8px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700 }}>
                  {s.isActive?"ACTIVE":"ENDED"}
                </span>
                <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400 }}>
                  Granted by {s.grantedBy?.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:colors.white, borderRadius:16, padding:28, border:`1px solid ${colors.n200}` }}>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>GRANT SCHOLARSHIP</div>
            <h2 style={{ fontFamily:fonts.display, fontSize:"1.5rem", fontWeight:700, color:colors.n800, margin:"0 0 20px" }}>Grant Scholarship / Waiver</h2>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Student *</label>
              <select value={form.studentId} onChange={e=>set("studentId",e.target.value)} style={inp}>
                <option value="">Select student...</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.enrollmentNumber} ({s.program})</option>)}
              </select>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Scholarship Name *</label>
              <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Merit Scholarship 2026" style={inp}/>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>Scholarship Type *</label>
              <div style={{ display:"flex", gap:10 }}>
                {SCHOLARSHIP_TYPES.map(t=>(
                  <button key={t.id} onClick={()=>set("type",t.id)} style={{ flex:1, padding:"14px 10px", borderRadius:12, border:`2px solid ${form.type===t.id?"#7c3aed":colors.n200}`, background:form.type===t.id?"#f5f3ff":colors.n50, cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:4 }}>{t.icon}</div>
                    <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:form.type===t.id?"#7c3aed":colors.n800 }}>{t.label}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:10, color:colors.n400 }}>{t.labelUr}</div>
                    <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n500, marginTop:3 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {form.type === "PARTIAL_PERCENT" && (
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:"#7c3aed", marginBottom:6 }}>Discount Percentage</label>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={()=>set("percentage",Math.max(5,form.percentage-5))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
                  <div style={{ textAlign:"center", flex:1 }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:32, fontWeight:700, color:"#7c3aed" }}>{form.percentage}%</div>
                  </div>
                  <button onClick={()=>set("percentage",Math.min(95,form.percentage+5))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
                </div>
              </div>
            )}

            {form.type === "PARTIAL_AMOUNT" && (
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:"#7c3aed", marginBottom:6 }}>Fixed Amount Waiver (PKR)</label>
                <input type="number" value={form.fixedAmount||""} min={0} onChange={e=>set("fixedAmount",parseFloat(e.target.value)||0)} style={{ ...inp, fontFamily:fonts.mono, fontWeight:700, color:"#7c3aed" }}/>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Reason</label>
                <select value={form.reason} onChange={e=>set("reason",e.target.value)} style={inp}>
                  {REASONS.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)} style={inp}/>
              </div>
            </div>

            {error && <div style={{ background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginBottom:16 }}><span style={{ fontFamily:fonts.body,fontSize:13,color:colors.errorText }}>⚠ {error}</span></div>}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setView("list")} style={{ flex:1,padding:"13px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:14,cursor:"pointer",fontFamily:fonts.heading }}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving||!form.studentId||!form.name.trim()} style={{ flex:2,padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,border:"none",background:!form.studentId||!form.name.trim()?colors.n300:"#7c3aed",color:"white",cursor:!form.studentId||!form.name.trim()||saving?"not-allowed":"pointer",fontFamily:fonts.heading }}>
                {saving?"Granting...":"🎓 Grant Scholarship"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
