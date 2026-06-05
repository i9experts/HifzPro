"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PROGRAMS = [
  { id:"HIFZ",    label:"Hifz ul Quran",  arabic:"حفظ القرآن",  icon:"📖", color:colors.primary,  desc:"Full Quran memorization" },
  { id:"NAZRA",   label:"Nazrah",          arabic:"ناظرہ",        icon:"📚", color:"#7c3aed",       desc:"Recitation with Tajweed" },
  { id:"TAJWEED", label:"Tajweed / Qaida", arabic:"تجوید / قاعدہ",icon:"✏️", color:"#b45309",       desc:"Tajweed rules & lessons" },
  { id:"GIRDAAN", label:"Girdaan",         arabic:"گردان",        icon:"🔄", color:"#0f766e",       desc:"Intensive revision" },
];

const SESSION_TIMES = [
  "Morning 6:00 - 8:00 AM",
  "Morning 7:00 - 9:00 AM",
  "Morning 8:00 - 10:00 AM",
  "Afternoon 12:00 - 2:00 PM",
  "Afternoon 2:00 - 4:00 PM",
  "Evening 4:00 - 6:00 PM",
  "Evening 5:00 - 7:00 PM",
  "Evening 6:00 - 8:00 PM",
  "Night 8:00 - 10:00 PM",
];

interface Ustadh { id: string; name: string; email: string; }

const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function NewBatchPage() {
  const [asatidha, setAsatidha] = useState<Ustadh[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [newBatchId, setNewBatchId] = useState("");

  const [form, setForm] = useState({
    name:           "",
    program:        "HIFZ",
    ustadhId:       "",
    sessionTime:    "",
    customSession:  "",
    maxStudents:    15,
    notes:          "",
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetch("/api/admin/batches")
      .then(r => r.json())
      .then(d => { if (d.success) setAsatidha(d.data.asatidha); });
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Halqa name is required"); return; }
    setSaving(true); setError("");
    try {
      const sessionTime = form.sessionTime === "custom" ? form.customSession : form.sessionTime;
      const res  = await fetch("/api/admin/batches", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sessionTime: sessionTime || undefined, ustadhId: form.ustadhId || undefined }),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setNewBatchId(data.data.batch.id); }
      else setError(data.error || "Failed to create halqa");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if (saved) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:460, width:"100%", background:colors.white, borderRadius:20, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:8 }}>HALQA CREATED</div>
        <h2 style={{ fontFamily:fonts.display, fontSize:"1.8rem", fontWeight:700, color:colors.n800, margin:"0 0 8px" }}>{form.name}</h2>
        <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500, marginBottom:28, lineHeight:1.7 }}>
          Your new Halqa has been created. Now assign students to it.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Link href={`/dashboard/admin/batches/${newBatchId}`} style={{ padding:"12px 24px", borderRadius:10, background:colors.primary, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
            Assign Students →
          </Link>
          <Link href="/dashboard/admin/batches" style={{ padding:"12px 20px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:13, textDecoration:"none", fontFamily:fonts.heading }}>
            All Halqas
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/batches" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Create New Halqa</div>
      </nav>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ background:colors.white, borderRadius:16, padding:28, border:`1px solid ${colors.n200}` }}>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>NEW HALQA</div>
            <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Create Halqa / Batch</h2>
            <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500, marginTop:4 }}>A Halqa groups students under one Ustadh for a specific program</p>
          </div>

          {/* Halqa Name */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>
              Halqa Name <span style={{ color:colors.error }}>*</span>
            </label>
            <input value={form.name} onChange={e=>set("name",e.target.value)}
              placeholder="e.g. Halqa A — Morning, Senior Huffaz Group"
              style={inp}/>
          </div>

          {/* Program */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>
              Program <span style={{ color:colors.error }}>*</span>
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {PROGRAMS.map(p => (
                <button key={p.id} onClick={()=>set("program",p.id)} style={{
                  padding:"14px 12px", borderRadius:12, border:`2px solid ${form.program===p.id?p.color:colors.n200}`,
                  background:form.program===p.id?`${p.color}12`:colors.n50, cursor:"pointer", textAlign:"left",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:form.program===p.id?p.color:colors.n800 }}>{p.label}</div>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:11, color:form.program===p.id?p.color:colors.n400 }}>{p.arabic}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500, marginTop:4 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Assign Ustadh */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>
              Assign Ustadh
            </label>
            {asatidha.length === 0 ? (
              <div style={{ padding:"12px 14px", background:colors.warningBg, borderRadius:8, border:`1px solid ${colors.warning}44` }}>
                <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.warningText }}>
                  ⚠️ No Asatidha found. Add Ustadh accounts first via the Users section, then assign here.
                </div>
              </div>
            ) : (
              <select value={form.ustadhId} onChange={e=>set("ustadhId",e.target.value)} style={inp}>
                <option value="">— Assign Ustadh later —</option>
                {asatidha.map(u=><option key={u.id} value={u.id}>{u.name}{u.email?` (${u.email})`:""}</option>)}
              </select>
            )}
            {!form.ustadhId && <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n400, marginTop:4 }}>You can assign an Ustadh later from the batch detail page.</div>}
          </div>

          {/* Session time + Max students */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Session Time</label>
              <select value={form.sessionTime} onChange={e=>set("sessionTime",e.target.value)} style={inp}>
                <option value="">Select time slot</option>
                {SESSION_TIMES.map(t=><option key={t} value={t}>{t}</option>)}
                <option value="custom">Custom time...</option>
              </select>
              {form.sessionTime === "custom" && (
                <input value={form.customSession} onChange={e=>set("customSession",e.target.value)}
                  placeholder="e.g. Daily 7:30 - 9:30 AM" style={{ ...inp, marginTop:8 }}/>
              )}
            </div>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Max Students</label>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={()=>set("maxStudents",Math.max(1,form.maxStudents-1))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:18 }}>−</button>
                <input type="number" value={form.maxStudents} min={1} max={50}
                  onChange={e=>set("maxStudents",parseInt(e.target.value)||1)}
                  style={{ ...inp, width:60, textAlign:"center", fontFamily:fonts.mono, fontWeight:700, color:colors.primary }}/>
                <button onClick={()=>set("maxStudents",Math.min(50,form.maxStudents+1))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:18 }}>+</button>
              </div>
            </div>
          </div>

          {error && <div style={{ background:colors.errorBg, borderRadius:10, padding:"12px 16px", marginBottom:16 }}><span style={{ fontFamily:fonts.body, fontSize:13, color:colors.errorText }}>⚠ {error}</span></div>}

          <div style={{ display:"flex", gap:10 }}>
            <Link href="/dashboard/admin/batches" style={{ flex:1, padding:"13px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:14, textDecoration:"none", fontFamily:fonts.heading, textAlign:"center" }}>Cancel</Link>
            <button onClick={handleSubmit} disabled={saving||!form.name.trim()} style={{
              flex:2, padding:"13px", borderRadius:10, fontSize:14, fontWeight:700, border:"none",
              background:!form.name.trim()?colors.n300:saving?colors.primaryLight:colors.gold,
              color:"white", cursor:!form.name.trim()||saving?"not-allowed":"pointer",
              fontFamily:fonts.heading, boxShadow:form.name.trim()?"0 4px 14px rgba(196,136,42,0.3)":"none",
            }}>
              {saving ? "Creating..." : "Create Halqa →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
