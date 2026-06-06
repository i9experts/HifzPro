"use client";
import { useState } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const QUALIFICATIONS_LIST = [
  "Hafiz ul Quran","Alim","Mufti","Qari","Muhaddith","Maulana",
  "PhD Islamic Studies","MA Islamic Studies","Graduate Darul Uloom",
  "Tajweed Specialist","Hifz Teacher Certificate","Ijaazah"
];

const SPECIALIZATIONS = [
  { id:"HIFZ",    label:"Hifz ul Quran",  icon:"📖" },
  { id:"NAZRA",   label:"Nazrah",          icon:"📚" },
  { id:"TAJWEED", label:"Tajweed",         icon:"✏️" },
  { id:"GIRDAAN", label:"Girdaan",         icon:"🔄" },
  { id:"ALL",     label:"All Programs",    icon:"⭐" },
];

const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function NewUstadhPage() {
  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState<any>(null);
  const [error,  setError]  = useState("");
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    // Account
    name:           "",
    email:          "",
    password:       "",
    phone:          "",
    whatsapp:       "",
    // Profile
    nameArabic:     "",
    specialization: "HIFZ",
    qualifications: [] as string[],
    experience:     0,
    joiningDate:    new Date().toISOString().split("T")[0],
    bio:            "",
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleQual = (q: string) => {
    setForm(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(q)
        ? prev.qualifications.filter(x => x !== q)
        : [...prev.qualifications, q],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim())    { setError("Name is required"); return; }
    if (!form.email.trim())   { setError("Email is required"); return; }
    if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/asatidha", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ ...form, experience: form.experience || undefined }),
      });
      const data = await res.json();
      if (data.success) setSaved(data.data.ustadh);
      else setError(data.error || "Failed to create Ustadh account");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if (saved) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:460, width:"100%", background:colors.white, borderRadius:20, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>👨‍🏫</div>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:8 }}>USTADH ADDED</div>
        <h2 style={{ fontFamily:fonts.display, fontSize:"1.8rem", fontWeight:700, color:colors.n800, margin:"0 0 6px" }}>{form.name}</h2>
        <div style={{ fontFamily:fonts.mono, fontSize:13, color:colors.primary, marginBottom:6 }}>{form.email}</div>
        <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500, marginBottom:24, lineHeight:1.7 }}>
          Ustadh account created. Share the login credentials with them.<br/>
          Now assign them to a Halqa in Batch Management.
        </div>
        {/* Credentials card */}
        <div style={{ background:colors.n50, borderRadius:12, padding:14, border:`1px solid ${colors.n200}`, marginBottom:20, textAlign:"left" }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n500, letterSpacing:1, marginBottom:8 }}>LOGIN CREDENTIALS</div>
          {[
            { label:"URL",      val:"www.hifzpro.com/signin" },
            { label:"Email",    val:form.email },
            { label:"Password", val:form.password },
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<2?`1px solid ${colors.n100}`:"none" }}>
              <span style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500 }}>{s.label}</span>
              <span style={{ fontFamily:fonts.mono, fontSize:12, fontWeight:700, color:colors.n800 }}>{s.val}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href={`/dashboard/admin/asatidha/${saved.id}`} style={{ flex:1, padding:"12px", borderRadius:10, background:colors.primary, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading, textAlign:"center" }}>View Profile →</Link>
          <Link href="/dashboard/admin/batches" style={{ flex:1, padding:"12px", borderRadius:10, background:colors.gold, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading, textAlign:"center" }}>Assign Batch →</Link>
        </div>
      </div>
    </div>
  );

  const STEPS = [
    { num:1, label:"Account Details",   icon:"👤" },
    { num:2, label:"Profile & Skills",  icon:"📋" },
    { num:3, label:"Review & Create",   icon:"✅" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/asatidha" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Add New Ustadh</div>
      </nav>

      {/* Steps */}
      <div style={{ background:colors.white, borderBottom:`1px solid ${colors.n200}`, padding:"12px 24px" }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center" }}>
          {STEPS.map((s,i)=>(
            <div key={s.num} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <div onClick={()=>step>s.num&&setStep(s.num)} style={{ width:30,height:30,borderRadius:8,background:step>s.num?colors.success:step===s.num?colors.primary:colors.n100,display:"flex",alignItems:"center",justifyContent:"center",cursor:step>s.num?"pointer":"default" }}>
                  <span style={{ fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:step>=s.num?"white":colors.n400 }}>{step>s.num?"✓":s.num}</span>
                </div>
                <span style={{ fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:step>=s.num?colors.n800:colors.n400 }}>{s.label}</span>
              </div>
              {i<STEPS.length-1&&<div style={{ flex:1,height:2,background:step>s.num?colors.success:colors.n200,margin:"0 8px" }}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ background:colors.white, borderRadius:16, padding:28, border:`1px solid ${colors.n200}` }}>

          {/* STEP 1 — Account */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4 }}>STEP 1 OF 3</div>
              <h2 style={{ fontFamily:fonts.display,fontSize:"1.6rem",fontWeight:700,color:colors.n800,margin:"0 0 20px" }}>Account Details</h2>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Full Name (English) <span style={{ color:colors.error }}>*</span></label>
                  <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Qari Muhammad Saleem" style={inp}/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Full Name (Arabic / Urdu)</label>
                  <input value={form.nameArabic} onChange={e=>set("nameArabic",e.target.value)} placeholder="e.g. قاری محمد سلیم" style={{ ...inp,direction:"rtl",fontFamily:"'Cormorant Garamond',serif",fontSize:15 }}/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Email Address <span style={{ color:colors.error }}>*</span></label>
                  <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="qari.saleem@institute.com" style={inp}/>
                  <div style={{ fontFamily:fonts.body,fontSize:11,color:colors.n400,marginTop:3 }}>Used to log in to the Ustadh dashboard</div>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Password <span style={{ color:colors.error }}>*</span></label>
                  <div style={{ position:"relative" }}>
                    <input type={showPw?"text":"password"} value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Min 6 characters" style={{ ...inp,paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:colors.n400,fontSize:14 }}>{showPw?"🙈":"👁"}</button>
                  </div>
                  <div style={{ fontFamily:fonts.body,fontSize:11,color:colors.n400,marginTop:3 }}>Share this with the Ustadh — they can change it after login</div>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Phone Number</label>
                  <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+92 300 0000000" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>WhatsApp Number</label>
                  <input value={form.whatsapp} onChange={e=>set("whatsapp",e.target.value)} placeholder="If different from phone" style={inp}/>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Profile */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4 }}>STEP 2 OF 3</div>
              <h2 style={{ fontFamily:fonts.display,fontSize:"1.6rem",fontWeight:700,color:colors.n800,margin:"0 0 20px" }}>Profile & Qualifications</h2>

              {/* Specialization */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:8 }}>Specialization</label>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {SPECIALIZATIONS.map(s=>(
                    <button key={s.id} onClick={()=>set("specialization",s.id)} style={{ padding:"8px 14px",borderRadius:10,border:`2px solid ${form.specialization===s.id?colors.primary:colors.n200}`,background:form.specialization===s.id?colors.green50:colors.n50,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:16 }}>{s.icon}</span>
                      <span style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:form.specialization===s.id?colors.primary:colors.n700 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualifications */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:8 }}>Qualifications <span style={{ fontFamily:fonts.body,fontWeight:400,color:colors.n400 }}>(select all that apply)</span></label>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
                  {QUALIFICATIONS_LIST.map(q=>(
                    <label key={q} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:form.qualifications.includes(q)?colors.green50:colors.n50,borderRadius:8,border:`1.5px solid ${form.qualifications.includes(q)?colors.primary:colors.n200}`,cursor:"pointer" }}>
                      <input type="checkbox" checked={form.qualifications.includes(q)} onChange={()=>toggleQual(q)} style={{ width:14,height:14,accentColor:colors.primary }}/>
                      <span style={{ fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:form.qualifications.includes(q)?colors.primary:colors.n700 }}>{q}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience + Joining date */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Years of Experience</label>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <button onClick={()=>set("experience",Math.max(0,form.experience-1))} style={{ width:34,height:34,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
                    <div style={{ textAlign:"center",flex:1,fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:colors.primary }}>{form.experience}</div>
                    <button onClick={()=>set("experience",form.experience+1)} style={{ width:34,height:34,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
                  </div>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Joining Date</label>
                  <input type="date" value={form.joiningDate} onChange={e=>set("joiningDate",e.target.value)} style={inp}/>
                </div>
              </div>

              {/* Bio */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6 }}>Bio / Notes <span style={{ fontFamily:fonts.body,fontWeight:400,color:colors.n400 }}>(optional)</span></label>
                <textarea value={form.bio} onChange={e=>set("bio",e.target.value)} rows={3} placeholder="Brief background, teaching style, previous institutions..."
                  style={{ ...inp,resize:"none" }}/>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div>
              <div style={{ fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4 }}>STEP 3 OF 3</div>
              <h2 style={{ fontFamily:fonts.display,fontSize:"1.6rem",fontWeight:700,color:colors.n800,margin:"0 0 20px" }}>Review & Create</h2>

              {/* Preview card */}
              <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary})`, borderRadius:14, padding:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
                <svg style={{ position:"absolute",right:-20,top:-20,opacity:0.08 }} width="120" height="120" viewBox="0 0 80 80">
                  <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
                </svg>
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
                  <div style={{ width:56,height:56,borderRadius:14,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ fontFamily:fonts.display,fontSize:24,fontWeight:700,color:"white" }}>{form.name.charAt(0)||"?"}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:fonts.heading,fontSize:18,fontWeight:700,color:"white" }}>{form.name||"—"}</div>
                    {form.nameArabic&&<div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"rgba(255,255,255,0.5)",direction:"rtl",textAlign:"left" }}>{form.nameArabic}</div>}
                    <div style={{ fontFamily:fonts.mono,fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2 }}>{form.email}</div>
                  </div>
                </div>
                {form.qualifications.length > 0 && (
                  <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                    {form.qualifications.map((q,i)=>(
                      <span key={i} style={{ background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.8)",padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:fonts.heading }}>{q}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background:colors.n50,borderRadius:12,padding:16,marginBottom:20 }}>
                {[
                  {label:"Name",           val:form.name||"—"},
                  {label:"Email",          val:form.email||"—"},
                  {label:"Phone",          val:form.phone||"—"},
                  {label:"WhatsApp",       val:form.whatsapp||"—"},
                  {label:"Specialization", val:SPECIALIZATIONS.find(s=>s.id===form.specialization)?.label||"—"},
                  {label:"Experience",     val:`${form.experience} years`},
                  {label:"Joining Date",   val:new Date(form.joiningDate).toLocaleDateString("en-PK",{day:"numeric",month:"long",year:"numeric"})},
                  {label:"Qualifications", val:form.qualifications.join(", ")||"None selected"},
                ].map((s,i,arr)=>(
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<arr.length-1?`1px solid ${colors.n200}`:"none" }}>
                    <span style={{ fontFamily:fonts.body,fontSize:12,color:colors.n500 }}>{s.label}</span>
                    <span style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n800,maxWidth:300,textAlign:"right" }}>{s.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background:colors.warningBg,borderRadius:10,padding:"12px 14px",border:`1px solid ${colors.warning}44`,marginBottom:20 }}>
                <div style={{ fontFamily:fonts.body,fontSize:12,color:colors.warningText,lineHeight:1.7 }}>
                  ⚠️ After creating, share the login credentials with the Ustadh.<br/>
                  Then go to <strong>Batch Management</strong> to assign them to a Halqa.
                </div>
              </div>
            </div>
          )}

          {error && <div style={{ background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginBottom:16 }}><span style={{ fontFamily:fonts.body,fontSize:13,color:colors.errorText }}>⚠ {error}</span></div>}

          {/* Navigation */}
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:24,paddingTop:20,borderTop:`1px solid ${colors.n100}` }}>
            <button onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1}
              style={{ padding:"12px 24px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:step===1?colors.n300:colors.n700,fontSize:13,cursor:step===1?"not-allowed":"pointer",fontFamily:fonts.heading }}>
              ← Back
            </button>
            <div style={{ fontFamily:fonts.mono,fontSize:11,color:colors.n400,alignSelf:"center" }}>Step {step} of 3</div>
            {step < 3 ? (
              <button onClick={()=>{
                if(step===1&&(!form.name.trim()||!form.email.trim()||!form.password)){setError("Name, email and password are required");return;}
                setError("");setStep(s=>s+1);
              }} style={{ padding:"12px 28px",borderRadius:10,background:colors.primary,color:"white",fontSize:13,fontWeight:700,border:"none",cursor:"pointer",fontFamily:fonts.heading }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving} style={{ padding:"12px 28px",borderRadius:10,background:saving?colors.n300:colors.gold,color:"white",fontSize:13,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading,boxShadow:saving?"none":"0 4px 14px rgba(196,136,42,0.3)" }}>
                {saving?"Creating...":"👨‍🏫 Create Ustadh Account"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
