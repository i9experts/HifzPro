"use client";
import { useState, useEffect } from "react";
import { colors, fonts } from "@/lib/tokens";

const STEPS = [
  { num:1, title:"Institution Profile",  subtitle:"Tell us about your institute",    icon:"🏫", arabic:"معلومات المدرسة" },
  { num:2, title:"Your Campus",           subtitle:"Set up your main campus",         icon:"🏛️", arabic:"إعداد الحرم" },
  { num:3, title:"First Ustadh",          subtitle:"Create an Ustadh account",        icon:"👨‍🏫", arabic:"الأستاذ الأول" },
  { num:4, title:"First Halqa",           subtitle:"Create a Hifz batch",            icon:"📚", arabic:"الحلقة الأولى" },
  { num:5, title:"First Student",         subtitle:"Enroll your first student",       icon:"👨‍🎓", arabic:"الطالب الأول" },
];

const PROGRAMS = [
  { id:"HIFZ",    label:"Hifz ul Quran", arabic:"حفظ", icon:"📖" },
  { id:"NAZRA",   label:"Nazrah",         arabic:"ناظرہ",icon:"📚" },
  { id:"TAJWEED", label:"Tajweed",        arabic:"تجوید",icon:"✏️" },
  { id:"GIRDAAN", label:"Girdaan",        arabic:"گردان",icon:"🔄" },
];

const MUSHAF = [
  { id:"MADANI_15_LINE", label:"Madani 15-Line" },
  { id:"MADANI_13_LINE", label:"Madani 13-Line" },
  { id:"INDOPAK_16_LINE",label:"IndoPak 16-Line" },
];

const inp = { width:"100%", padding:"11px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:9, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function OnboardingPage() {
  const [step,      setStep]      = useState(1);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [stepDone,  setStepDone]  = useState<Record<number,boolean>>({});
  const [savedIds,  setSavedIds]  = useState<Record<string,string>>({});

  // Step 1 data
  const [s1, setS1] = useState({ name:"", nameArabic:"", city:"", address:"", phone:"", email:"", logo:"", mushaf:"MADANI_15_LINE" });
  // Step 2 data
  const [s2, setS2] = useState({ campusName:"", address:"", city:"", phone:"", sessionTime:"" });
  // Step 3 data
  const [s3, setS3] = useState({ ustadhName:"", ustadhEmail:"", ustadhPassword:"", ustadhPhone:"", qualification:"Hafiz ul Quran" });
  const [showPw, setShowPw] = useState(false);
  // Step 4 data
  const [s4, setS4] = useState({ batchName:"", program:"HIFZ", sessionTime:"", maxStudents:20 });
  // Step 5 data
  const [s5, setS5] = useState({ studentName:"", guardianName:"", guardianPhone:"", program:"HIFZ", dateOfBirth:"" });

  // Auto-fill campus from institution
  useEffect(()=>{
    if(s1.name && !s2.campusName) setS2(p=>({...p, campusName:`${s1.name} — Main Campus`, city:s1.city, phone:s1.phone}));
  },[step]);

  const saveStep = async(stepNum:number, data:any) => {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/onboarding", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ step:stepNum, ...data }),
      });
      const d = await res.json();
      if (d.success) {
        setStepDone(p=>({...p,[stepNum]:true}));
        if (d.data?.ustadhId) setSavedIds(p=>({...p,ustadhId:d.data.ustadhId}));
        if (d.data?.batchId)  setSavedIds(p=>({...p,batchId:d.data.batchId}));
        setStep(stepNum+1);
      } else setError(d.error || "Something went wrong");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  // ── Celebration screen ──
  if (step > 5) return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,${colors.deep},#0A2E1A)`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:560, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:8 }}>SETUP COMPLETE</div>
        <h1 style={{ fontFamily:fonts.display, fontSize:"2.4rem", fontWeight:700, color:"white", margin:"0 0 12px", lineHeight:1.2 }}>
          Your Institute is Live!
        </h1>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:colors.gold, marginBottom:24, direction:"rtl" }}>
          بارك الله فيكم — تهانينا على الانطلاقة!
        </div>
        <p style={{ fontFamily:fonts.body, fontSize:14, color:"rgba(255,255,255,0.6)", marginBottom:32, lineHeight:1.8 }}>
          Your HifzPro account is fully set up. Start recording lessons, tracking students, and sending WhatsApp updates to parents.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:360, margin:"0 auto" }}>
          {[
            { href:"/dashboard/admin",          label:"Open Admin Dashboard →",      color:colors.gold   },
            { href:"/dashboard/admin/students",  label:"Enroll More Students",         color:colors.primary},
            { href:"/dashboard/admin/asatidha",  label:"Add More Asatidha",            color:"#7c3aed"     },
            { href:"/dashboard/admin/fees",      label:"Set Up Fee Structures",        color:"#0f766e"     },
          ].map((a,i)=>(
            <a key={i} href={a.href} style={{ display:"block", padding:"14px", borderRadius:12, background:i===0?a.color:"rgba(255,255,255,0.06)", color:i===0?"white":a.color, border:i===0?"none":`1px solid ${a.color}44`, fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
              {a.label}
            </a>
          ))}
        </div>
        <div style={{ marginTop:24, fontFamily:fonts.body, fontSize:11, color:"rgba(255,255,255,0.3)" }}>
          Need help? WhatsApp us: +92-XXX-XXXXXXX
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Top bar */}
      <div style={{ background:colors.deep, padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🕌</span>
          <span style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:"white" }}>HifzPro</span>
          <span style={{ fontFamily:fonts.mono, fontSize:9, color:colors.gold, opacity:0.7, letterSpacing:1, marginLeft:8 }}>SETUP WIZARD</span>
        </div>
        <a href="/dashboard/admin" style={{ fontFamily:fonts.body, fontSize:11, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>
          Skip setup →
        </a>
      </div>

      {/* Step progress */}
      <div style={{ background:colors.white, borderBottom:`1px solid ${colors.n200}`, padding:"16px 24px" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          {/* Step dots */}
          <div style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
            {STEPS.map((s,i)=>(
              <div key={s.num} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div onClick={()=>stepDone[s.num-1]&&s.num<step&&setStep(s.num)} style={{ display:"flex", alignItems:"center", gap:8, cursor:stepDone[s.num-1]&&s.num<step?"pointer":"default", flexShrink:0 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:step===s.num?colors.primary:stepDone[s.num]?colors.success:colors.n100, display:"flex", alignItems:"center", justifyContent:"center", fontSize:stepDone[s.num]?14:15, transition:"all 0.2s" }}>
                    {stepDone[s.num] ? <span style={{ color:"white" }}>✓</span> : <span>{s.icon}</span>}
                  </div>
                  <div style={{ display:"none", ["@media (min-width: 640px)" as any]:{ display:"block" } }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:step===s.num?colors.primary:colors.n500 }}>{s.title}</div>
                  </div>
                </div>
                {i<STEPS.length-1&&<div style={{ flex:1, height:2, background:stepDone[s.num]?colors.success:colors.n200, margin:"0 8px", transition:"background 0.3s" }}/>}
              </div>
            ))}
          </div>
          {/* Current step info */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontFamily:fonts.mono, fontSize:10, color:colors.n400 }}>Step {step} of {STEPS.length}</div>
            <div style={{ width:200, height:4, background:colors.n100, borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${((step-1)/STEPS.length)*100}%`, background:colors.primary, borderRadius:2, transition:"width 0.4s" }}/>
            </div>
            <div style={{ fontFamily:fonts.mono, fontSize:10, color:colors.primary }}>{Math.round(((step-1)/STEPS.length)*100)}%</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ background:colors.white, borderRadius:20, padding:32, border:`1px solid ${colors.n200}`, boxShadow:"0 2px 16px rgba(0,0,0,0.04)" }}>

          {/* Step header */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:40, marginBottom:8 }}>{STEPS[step-1].icon}</div>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP {step} OF {STEPS.length}</div>
            <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>{STEPS[step-1].title}</h2>
            <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>{STEPS[step-1].subtitle}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:colors.gold, opacity:0.7, marginTop:4 }}>{STEPS[step-1].arabic}</div>
          </div>

          {/* ── STEP 1: Institution Profile ── */}
          {step===1&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Institution Name (English) *</label>
                <input value={s1.name} onChange={e=>setS1(p=>({...p,name:e.target.value}))} placeholder="e.g. Al-Noor Hifz Institute" style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Institution Name (Arabic/Urdu)</label>
                <input value={s1.nameArabic} onChange={e=>setS1(p=>({...p,nameArabic:e.target.value}))} placeholder="مدرسة النور للحفظ" style={{ ...inp,direction:"rtl",fontFamily:"'Cormorant Garamond',serif",fontSize:16 }}/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>City *</label>
                  <input value={s1.city} onChange={e=>setS1(p=>({...p,city:e.target.value}))} placeholder="Karachi" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Phone</label>
                  <input value={s1.phone} onChange={e=>setS1(p=>({...p,phone:e.target.value}))} placeholder="+92 21 0000000" style={inp}/>
                </div>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Address</label>
                <input value={s1.address} onChange={e=>setS1(p=>({...p,address:e.target.value}))} placeholder="Street address" style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:8 }}>Preferred Mushaf</label>
                <div style={{ display:"flex",gap:8 }}>
                  {MUSHAF.map(m=>(
                    <button key={m.id} onClick={()=>setS1(p=>({...p,mushaf:m.id}))} style={{ flex:1,padding:"10px 8px",borderRadius:9,border:`2px solid ${s1.mushaf===m.id?colors.primary:colors.n200}`,background:s1.mushaf===m.id?colors.green50:colors.n50,cursor:"pointer" }}>
                      <div style={{ fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:s1.mushaf===m.id?colors.primary:colors.n700 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Campus ── */}
          {step===2&&(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ background:colors.green50,borderRadius:10,padding:"10px 14px",border:`1px solid ${colors.green200}`,fontFamily:fonts.body,fontSize:12,color:colors.primary }}>
                💡 Your main campus has been pre-filled from your institution details. You can update it below.
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Campus Name *</label>
                <input value={s2.campusName} onChange={e=>setS2(p=>({...p,campusName:e.target.value}))} placeholder="Main Campus" style={inp}/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>City</label>
                  <input value={s2.city} onChange={e=>setS2(p=>({...p,city:e.target.value}))} style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Phone</label>
                  <input value={s2.phone} onChange={e=>setS2(p=>({...p,phone:e.target.value}))} style={inp}/>
                </div>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Session Time (optional)</label>
                <input value={s2.sessionTime} onChange={e=>setS2(p=>({...p,sessionTime:e.target.value}))} placeholder="e.g. Fajr 5:30 AM — 7:00 AM" style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Address</label>
                <input value={s2.address} onChange={e=>setS2(p=>({...p,address:e.target.value}))} placeholder="Campus address" style={inp}/>
              </div>
            </div>
          )}

          {/* ── STEP 3: Ustadh ── */}
          {step===3&&(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ background:colors.green50,borderRadius:10,padding:"10px 14px",border:`1px solid ${colors.green200}`,fontFamily:fonts.body,fontSize:12,color:colors.primary }}>
                👨‍🏫 Create an Ustadh account. They will use these credentials to log in and record lessons.
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Ustadh Full Name *</label>
                  <input value={s3.ustadhName} onChange={e=>setS3(p=>({...p,ustadhName:e.target.value}))} placeholder="e.g. Qari Muhammad Saleem" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Email *</label>
                  <input type="email" value={s3.ustadhEmail} onChange={e=>setS3(p=>({...p,ustadhEmail:e.target.value}))} placeholder="qari@institute.com" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Phone</label>
                  <input value={s3.ustadhPhone} onChange={e=>setS3(p=>({...p,ustadhPhone:e.target.value}))} placeholder="+92 300 0000000" style={inp}/>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Password *</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPw?"text":"password"} value={s3.ustadhPassword} onChange={e=>setS3(p=>({...p,ustadhPassword:e.target.value}))} placeholder="Min 6 characters" style={{ ...inp,paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:colors.n400,fontSize:14 }}>{showPw?"🙈":"👁"}</button>
                  </div>
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Qualification</label>
                  <select value={s3.qualification} onChange={e=>setS3(p=>({...p,qualification:e.target.value}))} style={inp}>
                    {["Hafiz ul Quran","Alim","Mufti","Qari","Graduate Darul Uloom","Other"].map(q=><option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Batch ── */}
          {step===4&&(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Halqa / Batch Name *</label>
                <input value={s4.batchName} onChange={e=>setS4(p=>({...p,batchName:e.target.value}))} placeholder="e.g. Halqa Al-Noor — Hifz A" style={inp}/>
              </div>
              <div>
                <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:8 }}>Program *</label>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
                  {PROGRAMS.map(p=>(
                    <button key={p.id} onClick={()=>setS4(f=>({...f,program:p.id}))} style={{ padding:"12px 8px",borderRadius:10,border:`2px solid ${s4.program===p.id?colors.primary:colors.n200}`,background:s4.program===p.id?colors.green50:colors.n50,cursor:"pointer",textAlign:"center" }}>
                      <div style={{ fontSize:20,marginBottom:4 }}>{p.icon}</div>
                      <div style={{ fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:s4.program===p.id?colors.primary:colors.n700 }}>{p.label}</div>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:10,color:colors.n400 }}>{p.arabic}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Session Time</label>
                  <input value={s4.sessionTime} onChange={e=>setS4(p=>({...p,sessionTime:e.target.value}))} placeholder="e.g. Fajr 5:30 AM" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Max Students</label>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <button onClick={()=>setS4(p=>({...p,maxStudents:Math.max(5,p.maxStudents-5)}))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
                    <div style={{ flex:1,textAlign:"center",fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:colors.primary }}>{s4.maxStudents}</div>
                    <button onClick={()=>setS4(p=>({...p,maxStudents:p.maxStudents+5}))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
                  </div>
                </div>
              </div>
              <div style={{ background:colors.green50,borderRadius:10,padding:"10px 14px",border:`1px solid ${colors.green200}`,fontFamily:fonts.body,fontSize:12,color:colors.primary }}>
                ✅ {s3.ustadhName||"Your Ustadh"} will be assigned to this Halqa automatically.
              </div>
            </div>
          )}

          {/* ── STEP 5: Student ── */}
          {step===5&&(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ background:colors.green50,borderRadius:10,padding:"10px 14px",border:`1px solid ${colors.green200}`,fontFamily:fonts.body,fontSize:12,color:colors.primary }}>
                👨‍🎓 Enroll your first student. You can add many more students from the Student Management module after setup.
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Student Full Name *</label>
                  <input value={s5.studentName} onChange={e=>setS5(p=>({...p,studentName:e.target.value}))} placeholder="e.g. Ahmed Raza Khan" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Date of Birth</label>
                  <input type="date" value={s5.dateOfBirth} onChange={e=>setS5(p=>({...p,dateOfBirth:e.target.value}))} style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Program</label>
                  <select value={s5.program} onChange={e=>setS5(p=>({...p,program:e.target.value}))} style={inp}>
                    {PROGRAMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:"1/-1",borderTop:`1px solid ${colors.n100}`,paddingTop:12,marginTop:4 }}>
                  <div style={{ fontFamily:fonts.mono,fontSize:9,color:colors.n500,letterSpacing:1,marginBottom:10 }}>GUARDIAN / PARENT DETAILS</div>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Guardian Name *</label>
                  <input value={s5.guardianName} onChange={e=>setS5(p=>({...p,guardianName:e.target.value}))} placeholder="e.g. Muhammad Raza" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:5 }}>Guardian WhatsApp *</label>
                  <input value={s5.guardianPhone} onChange={e=>setS5(p=>({...p,guardianPhone:e.target.value}))} placeholder="+92 300 0000000" style={inp}/>
                </div>
              </div>
              <div style={{ background:`${colors.gold}15`,borderRadius:10,padding:"10px 14px",border:`1px solid ${colors.gold}44`,fontFamily:fonts.body,fontSize:12,color:colors.n700 }}>
                💬 The guardian will automatically receive WhatsApp updates about their child's progress after each lesson.
              </div>
            </div>
          )}

          {error && <div style={{ background:colors.errorBg,borderRadius:10,padding:"12px 14px",marginTop:16 }}><span style={{ fontFamily:fonts.body,fontSize:13,color:colors.errorText }}>⚠ {error}</span></div>}

          {/* Navigation */}
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:28,paddingTop:20,borderTop:`1px solid ${colors.n100}` }}>
            {step > 1
              ? <button onClick={()=>setStep(s=>s-1)} style={{ padding:"12px 24px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:13,cursor:"pointer",fontFamily:fonts.heading }}>← Back</button>
              : <div/>
            }
            <button
              onClick={()=>{
                if(step===1) { if(!s1.name.trim()){setError("Institution name required");return;} saveStep(1,s1); }
                if(step===2) { if(!s2.campusName.trim()){setError("Campus name required");return;} saveStep(2,s2); }
                if(step===3) { if(!s3.ustadhName||!s3.ustadhEmail||!s3.ustadhPassword){setError("Name, email and password required");return;} saveStep(3,s3); }
                if(step===4) { if(!s4.batchName.trim()){setError("Halqa name required");return;} saveStep(4,s4); }
                if(step===5) { if(!s5.studentName||!s5.guardianName||!s5.guardianPhone){setError("Student name and guardian details required");return;} saveStep(5,{...s5,batchId:savedIds.batchId}); }
              }}
              disabled={saving}
              style={{ padding:"12px 32px",borderRadius:10,background:saving?colors.n300:step===5?colors.gold:colors.primary,color:"white",fontSize:13,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading,boxShadow:saving?"none":`0 4px 14px ${step===5?"rgba(196,136,42,0.3)":"rgba(13,92,58,0.3)"}` }}>
              {saving?"Saving...":(step===5?"🎉 Complete Setup →":"Continue →")}
            </button>
          </div>

          {step < 5 && (
            <div style={{ textAlign:"center",marginTop:12 }}>
              <button onClick={()=>setStep(s=>s+1)} style={{ fontFamily:fonts.body,fontSize:11,color:colors.n400,background:"none",border:"none",cursor:"pointer",textDecoration:"underline" }}>
                Skip this step →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
