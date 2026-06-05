"use client";
import { useState } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const FEE_TYPES = [
  { id:"TUITION",      label:"Tuition",      labelUr:"تعلیمی فیس",  icon:"📚", color:colors.primary },
  { id:"REGISTRATION", label:"Registration",  labelUr:"داخلہ فیس",   icon:"📋", color:"#7c3aed" },
  { id:"TRANSPORT",    label:"Transport",     labelUr:"ٹرانسپورٹ",  icon:"🚌", color:"#b45309" },
  { id:"HOSTEL",       label:"Hostel",        labelUr:"ہاسٹل",       icon:"🏠", color:"#0f766e" },
  { id:"EXAM",         label:"Exam Fee",      labelUr:"امتحان فیس", icon:"📝", color:"#dc2626" },
  { id:"BOOKS",        label:"Books",         labelUr:"کتب",         icon:"📖", color:"#1d4ed8" },
  { id:"OTHER",        label:"Other",         labelUr:"دیگر",        icon:"💰", color:"#374151" },
];

const FREQUENCIES = [
  { id:"MONTHLY",   label:"Monthly",   labelUr:"ماہانہ",  icon:"📅" },
  { id:"QUARTERLY", label:"Quarterly", labelUr:"سہ ماہی", icon:"📆" },
  { id:"ANNUAL",    label:"Annual",    labelUr:"سالانہ",  icon:"🗓️" },
  { id:"ONE_TIME",  label:"One Time",  labelUr:"ایک بار", icon:"💫" },
];

const PROGRAMS = [
  { id:"",        label:"All Programs" },
  { id:"HIFZ",    label:"Hifz ul Quran" },
  { id:"NAZRA",   label:"Nazrah" },
  { id:"TAJWEED", label:"Tajweed" },
  { id:"GIRDAAN", label:"Girdaan" },
];

const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function NewFeeStructurePage() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState({
    name:        "",
    feeType:     "TUITION",
    program:     "",
    amount:      0,
    frequency:   "MONTHLY",
    description: "",
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim())  { setError("Name is required"); return; }
    if (form.amount <= 0)   { setError("Amount must be greater than zero"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/fees/structures", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ ...form, program: form.program || undefined }),
      });
      const data = await res.json();
      if (data.success) setSaved(true);
      else setError(data.error || "Failed to create");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if (saved) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:420, width:"100%", background:colors.white, borderRadius:20, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
        <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:"0 0 8px" }}>{form.name}</h2>
        <div style={{ fontFamily:fonts.heading, fontSize:18, color:colors.primary, marginBottom:20 }}>PKR {form.amount.toLocaleString()} / {form.frequency}</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Link href="/dashboard/admin/fees" style={{ padding:"12px 24px", borderRadius:10, background:colors.primary, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>← Fee Dashboard</Link>
          <button onClick={()=>{ setSaved(false); setForm({name:"",feeType:"TUITION",program:"",amount:0,frequency:"MONTHLY",description:""}); }} style={{ padding:"12px 20px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:13, cursor:"pointer", fontFamily:fonts.heading }}>Add Another</button>
        </div>
      </div>
    </div>
  );

  const selType = FEE_TYPES.find(t => t.id === form.feeType);

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/fees" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Create Fee Structure</div>
      </nav>

      <div style={{ maxWidth:620, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ background:colors.white, borderRadius:16, padding:28, border:`1px solid ${colors.n200}` }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>FEE STRUCTURE</div>
          <h2 style={{ fontFamily:fonts.display, fontSize:"1.5rem", fontWeight:700, color:colors.n800, margin:"0 0 20px" }}>Create Fee Structure</h2>

          {/* Name */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Structure Name *</label>
            <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Monthly Tuition — Hifz" style={inp}/>
          </div>

          {/* Fee type */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>Fee Type *</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {FEE_TYPES.map(t=>(
                <button key={t.id} onClick={()=>set("feeType",t.id)} style={{ padding:"10px 6px", borderRadius:10, border:`2px solid ${form.feeType===t.id?t.color:colors.n200}`, background:form.feeType===t.id?`${t.color}12`:colors.n50, cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:18 }}>{t.icon}</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:form.feeType===t.id?t.color:colors.n700 }}>{t.label}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:9, color:colors.n400 }}>{t.labelUr}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Frequency */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Amount (PKR) *</label>
              <input type="number" value={form.amount || ""} min={0} onChange={e=>set("amount",parseFloat(e.target.value)||0)}
                placeholder="e.g. 2500" style={{ ...inp, fontFamily:fonts.mono, fontWeight:700, color:colors.primary }}/>
            </div>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Frequency</label>
              <select value={form.frequency} onChange={e=>set("frequency",e.target.value)} style={inp}>
                {FREQUENCIES.map(f=><option key={f.id} value={f.id}>{f.icon} {f.label} — {f.labelUr}</option>)}
              </select>
            </div>
          </div>

          {/* Program */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Apply to Program (optional)</label>
            <select value={form.program} onChange={e=>set("program",e.target.value)} style={inp}>
              {PROGRAMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n400, marginTop:3 }}>Leave blank to apply to all programs</div>
          </div>

          {/* Description */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Description</label>
            <input value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Optional notes about this fee" style={inp}/>
          </div>

          {/* Preview */}
          {form.name && form.amount > 0 && (
            <div style={{ background:colors.green50, borderRadius:10, padding:"12px 14px", border:`1px solid ${colors.green200}`, marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:22 }}>{selType?.icon || "💰"}</span>
              <div>
                <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.primary }}>{form.name}</div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n600 }}>PKR {form.amount.toLocaleString()} / {form.frequency.toLowerCase()}{form.program?` — ${form.program}`:""}</div>
              </div>
            </div>
          )}

          {error && <div style={{ background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginBottom:16 }}><span style={{ fontFamily:fonts.body,fontSize:13,color:colors.errorText }}>⚠ {error}</span></div>}

          <div style={{ display:"flex", gap:10 }}>
            <Link href="/dashboard/admin/fees" style={{ flex:1,padding:"13px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:14,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center" }}>Cancel</Link>
            <button onClick={handleSubmit} disabled={saving||!form.name.trim()||form.amount<=0} style={{ flex:2,padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,border:"none",background:!form.name.trim()||form.amount<=0?colors.n300:saving?colors.primaryLight:colors.primary,color:"white",cursor:!form.name.trim()||form.amount<=0||saving?"not-allowed":"pointer",fontFamily:fonts.heading }}>
              {saving?"Creating...":"Create Fee Structure ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
