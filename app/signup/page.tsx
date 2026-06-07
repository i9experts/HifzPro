"use client";
import { useState } from "react";
import Link from "next/link";

const inp = (extra?: any) => ({
  width: "100%", padding: "13px 14px",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 10, fontSize: 14, fontFamily: "'Inter','Segoe UI',sans-serif",
  color: "white", background: "rgba(255,255,255,0.06)", outline: "none",
  transition: "border-color 0.2s", ...extra,
});

const PROGRAMS = [
  { id:"HIFZ",    label:"Hifz ul Quran",   arabic:"حفظ القرآن",  icon:"📖" },
  { id:"NAZRA",   label:"Nazrah",            arabic:"ناظرہ",        icon:"📚" },
  { id:"TAJWEED", label:"Tajweed",           arabic:"تجوید",        icon:"✏️" },
  { id:"GIRDAAN", label:"Girdaan",           arabic:"گردان",        icon:"🔄" },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    institutionName:"", city:"", country:"Pakistan",
    adminName:"", email:"", phone:"", whatsapp:"",
    estimatedStudents:0, programs:[] as string[], referral:"",
  });
  const [saving,  setSaving]  = useState(false);
  const [done,    setDone]    = useState<any>(null);
  const [error,   setError]   = useState("");
  const [focused, setFocused] = useState("");

  const set = (k:string,v:any) => setForm(p=>({...p,[k]:v}));

  const toggleProg = (id:string) => {
    setForm(p=>({ ...p, programs: p.programs.includes(id) ? p.programs.filter(x=>x!==id) : [...p.programs,id] }));
  };

  const handleSubmit = async () => {
    if (!form.institutionName.trim()) { setError("Please enter your institution name"); return; }
    if (!form.adminName.trim())       { setError("Please enter your name"); return; }
    if (!form.email.trim())           { setError("Please enter your email"); return; }
    if (!form.phone.trim())           { setError("Please enter your phone number"); return; }
    if (!form.city.trim())            { setError("Please enter your city"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/auth/signup", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ ...form, estimatedStudents: form.estimatedStudents||undefined }),
      });
      const data = await res.json();
      if (data.success) setDone(data.data);
      else setError(data.error || "Something went wrong. Please try again.");
    } catch { setError("Connection error. Please try again."); } finally { setSaving(false); }
  };

  // ── Success screen ──
  if (done) return (
    <div style={{ minHeight:"100vh", background:"#0a0f1a", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:520, width:"100%", background:"#111827", borderRadius:24, padding:40, textAlign:"center", border:"1px solid #1f2937" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
        <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:3, color:"#10B981", marginBottom:8 }}>ACCOUNT CREATED</div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"1.8rem", fontWeight:700, color:"white", margin:"0 0 8px" }}>
          {form.institutionName}
        </h1>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:"#6b7280", margin:"0 0 28px", lineHeight:1.7 }}>
          آپ کا اکاؤنٹ تیار ہے۔ لاگ ان تفصیلات آپ کے WhatsApp پر بھیج دی گئی ہیں۔
        </p>

        {/* Credentials card */}
        <div style={{ background:"#0a0f1a", borderRadius:14, padding:20, marginBottom:24, textAlign:"left", border:"1px solid #1f2937" }}>
          <div style={{ fontFamily:"monospace", fontSize:9, color:"#4b5563", letterSpacing:2, marginBottom:12 }}>LOGIN CREDENTIALS</div>
          {[
            { label:"Website",  val:"www.hifzpro.com/signin" },
            { label:"Email",    val:done.email },
            { label:"Password", val:done.password },
            { label:"Trial",    val:"14 days free — no credit card" },
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<3?"1px solid #1f2937":"none" }}>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#6b7280" }}>{s.label}</span>
              <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:i===2?"#10B981":"white" }}>{s.val}</span>
            </div>
          ))}
        </div>

        <div style={{ background:"#052e16", borderRadius:10, padding:"12px 14px", marginBottom:20, border:"1px solid #10B98133" }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#10B981", lineHeight:1.7 }}>
            💬 Login credentials sent to your WhatsApp: <strong>{form.phone}</strong>
          </div>
        </div>

        <a href="/signin" style={{ display:"block", padding:"14px", borderRadius:12, background:"#10B981", color:"#052e16", fontSize:14, fontWeight:700, textDecoration:"none", fontFamily:"'Inter',sans-serif" }}>
          Sign In & Start Setup →
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1a", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <header style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"#052e16", border:"1px solid #10B98133", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:20 }}>🕌</span>
          </div>
          <div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"white", lineHeight:1 }}>HifzPro</div>
            <div style={{ fontFamily:"monospace", fontSize:8, color:"#10B981", letterSpacing:2 }}>PAKISTAN'S #1 HIFZ PLATFORM</div>
          </div>
        </div>
        <Link href="/signin" style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"#9ca3af", textDecoration:"none" }}>
          Already have an account? <span style={{ color:"#10B981" }}>Sign In →</span>
        </Link>
      </header>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ maxWidth:600, width:"100%" }}>

          {/* Hero text */}
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:3, color:"#10B981", marginBottom:12 }}>FREE 14-DAY TRIAL — NO CREDIT CARD</div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:"2.2rem", fontWeight:700, color:"white", margin:"0 0 12px", lineHeight:1.2 }}>
              Start Managing Your<br/>Hifz Program Today
            </h1>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:14, color:"#6b7280", margin:"0 0 8px", lineHeight:1.7, maxWidth:440, marginLeft:"auto", marginRight:"auto" }}>
              Join Islamic institutions using HifzPro to track student progress, automate parent updates, and grow their Hifz program.
            </p>
            <div style={{ fontFamily:"'Scheherazade New','Cormorant Garamond',serif", fontSize:18, color:"#10B981", opacity:0.7 }}>
              حِفْظُ الْقُرْآنِ — الطريق الأسهل
            </div>
          </div>

          {/* Form card */}
          <div style={{ background:"#111827", borderRadius:20, padding:32, border:"1px solid #1f2937" }}>

            {/* Section: Institution */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"monospace", fontSize:9, color:"#4b5563", letterSpacing:2, marginBottom:14 }}>INSTITUTION DETAILS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:5 }}>Institution Name *</label>
                  <input value={form.institutionName} onChange={e=>set("institutionName",e.target.value)}
                    placeholder="e.g. Al-Noor Hifz Institute"
                    onFocus={()=>setFocused("institutionName")} onBlur={()=>setFocused("")}
                    style={inp({ borderColor:focused==="institutionName"?"#10B981":"rgba(255,255,255,0.12)" })}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:5 }}>City *</label>
                  <input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="e.g. Karachi"
                    onFocus={()=>setFocused("city")} onBlur={()=>setFocused("")}
                    style={inp({ borderColor:focused==="city"?"#10B981":"rgba(255,255,255,0.12)" })}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:5 }}>Country</label>
                  <select value={form.country} onChange={e=>set("country",e.target.value)}
                    style={{ ...inp(), cursor:"pointer" }}>
                    {["Pakistan","UAE","Saudi Arabia","UK","USA","Canada","Australia","Other"].map(c=><option key={c} value={c} style={{ background:"#111827" }}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Admin */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"monospace", fontSize:9, color:"#4b5563", letterSpacing:2, marginBottom:14 }}>YOUR CONTACT DETAILS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:5 }}>Your Full Name *</label>
                  <input value={form.adminName} onChange={e=>set("adminName",e.target.value)} placeholder="e.g. Maulana Abdullah Farooqi"
                    onFocus={()=>setFocused("adminName")} onBlur={()=>setFocused("")}
                    style={inp({ borderColor:focused==="adminName"?"#10B981":"rgba(255,255,255,0.12)" })}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:5 }}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="admin@institute.com"
                    onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")}
                    style={inp({ borderColor:focused==="email"?"#10B981":"rgba(255,255,255,0.12)" })}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:5 }}>WhatsApp Number *</label>
                  <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+92 300 0000000"
                    onFocus={()=>setFocused("phone")} onBlur={()=>setFocused("")}
                    style={inp({ borderColor:focused==="phone"?"#10B981":"rgba(255,255,255,0.12)" })}/>
                </div>
              </div>
            </div>

            {/* Programs */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"monospace", fontSize:9, color:"#4b5563", letterSpacing:2, marginBottom:10 }}>PROGRAMS YOU RUN</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {PROGRAMS.map(p=>(
                  <button key={p.id} onClick={()=>toggleProg(p.id)} style={{ padding:"10px 6px", borderRadius:10, border:`2px solid ${form.programs.includes(p.id)?"#10B981":"rgba(255,255,255,0.1)"}`, background:form.programs.includes(p.id)?"#052e16":"rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{p.icon}</div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, color:form.programs.includes(p.id)?"#10B981":"#9ca3af" }}>{p.label}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:10, color:form.programs.includes(p.id)?"#10B981":"#4b5563" }}>{p.arabic}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated students */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:8 }}>Approx. Number of Students</label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["1-25","12"],["26-50","37"],["51-100","75"],["100-200","150"],["200+","250"]].map(([label,val])=>(
                  <button key={label} onClick={()=>set("estimatedStudents",parseInt(val))} style={{ padding:"8px 16px", borderRadius:8, border:`1.5px solid ${form.estimatedStudents===parseInt(val)?"#10B981":"rgba(255,255,255,0.1)"}`, background:form.estimatedStudents===parseInt(val)?"#052e16":"transparent", color:form.estimatedStudents===parseInt(val)?"#10B981":"#9ca3af", fontSize:12, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:600 }}>{label}</button>
                ))}
              </div>
            </div>

            {/* How heard */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"block", fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6 }}>How did you hear about HifzPro? (optional)</label>
              <select value={form.referral} onChange={e=>set("referral",e.target.value)} style={{ ...inp(), cursor:"pointer" }}>
                <option value="" style={{ background:"#111827" }}>Select...</option>
                {["WhatsApp","Facebook","Instagram","Google","Word of Mouth","Another Institution","Other"].map(r=><option key={r} value={r} style={{ background:"#111827" }}>{r}</option>)}
              </select>
            </div>

            {error && (
              <div style={{ background:"#1c0a0a", borderRadius:10, padding:"12px 14px", marginBottom:16, border:"1px solid #dc262633" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:"#fca5a5" }}>⚠ {error}</span>
              </div>
            )}

            <button onClick={handleSubmit} disabled={saving} style={{ width:"100%", padding:"15px", borderRadius:12, background:saving?"#1f2937":"#10B981", color:saving?"#4b5563":"#052e16", fontSize:15, fontWeight:700, border:"none", cursor:saving?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif", boxShadow:saving?"none":"0 4px 20px rgba(16,185,129,0.3)", transition:"all 0.2s" }}>
              {saving ? "Creating your account..." : "Start Free 14-Day Trial →"}
            </button>

            <div style={{ textAlign:"center", marginTop:14, fontFamily:"'Inter',sans-serif", fontSize:11, color:"#4b5563" }}>
              No credit card required · Setup takes 5 minutes · Cancel anytime
            </div>
          </div>

          {/* Trust signals */}
          <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:24, flexWrap:"wrap" }}>
            {["🔒 Secure & Private","💬 WhatsApp Updates","📱 Mobile Friendly","🇵🇰 Built for Pakistan"].map((t,i)=>(
              <div key={i} style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"#4b5563" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
