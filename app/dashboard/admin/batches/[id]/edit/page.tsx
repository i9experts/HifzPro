"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const SESSION_TIMES = [
  "Morning 6:00 - 8:00 AM","Morning 7:00 - 9:00 AM","Morning 8:00 - 10:00 AM",
  "Afternoon 12:00 - 2:00 PM","Afternoon 2:00 - 4:00 PM",
  "Evening 4:00 - 6:00 PM","Evening 5:00 - 7:00 PM","Evening 6:00 - 8:00 PM",
  "Night 8:00 - 10:00 PM",
];

const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [asatidha,setAsatidha]= useState<{id:string;user:{name:string}}[]>([]);

  const [form, setForm] = useState({
    name:"", program:"HIFZ", ustadhId:"", sessionTime:"", maxStudents:15, isActive:true,
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetch(`/api/admin/batches/${id}`)
      .then(r=>r.json())
      .then(d=>{
        if(d.success){
          const b = d.data.batch;
          setForm({ name:b.name, program:b.program, ustadhId:b.ustadhId||"", sessionTime:b.sessionTime||"", maxStudents:b.maxStudents, isActive:b.isActive });
          setAsatidha(d.data.asatidha||[]);
        }
      })
      .finally(()=>setLoading(false));
  },[id]);

  const handleSave = async () => {
    if(!form.name.trim()){setError("Name required");return;}
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/batches/${id}`,{
        method:"PUT",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,ustadhId:form.ustadhId||null}),
      });
      const data = await res.json();
      if(data.success) setSaved(true);
      else setError(data.error||"Failed to update");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    if(!confirm("Deactivate this batch? Students will be unassigned."))return;
    await fetch(`/api/admin/batches/${id}`,{method:"DELETE"});
    window.location.href="/dashboard/admin/batches";
  };

  if(loading) return <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:fonts.body,color:"rgba(255,255,255,0.4)"}}>Loading...</div></div>;
  if(saved)   { setTimeout(()=>window.location.href=`/dashboard/admin/batches/${id}`,1000); return <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:fonts.heading,fontSize:16,color:colors.success}}>✓ Saved! Redirecting...</div></div>; }

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href={`/dashboard/admin/batches/${id}`} style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Edit Batch</div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={handleDeactivate} style={{ padding:"7px 14px", borderRadius:8, background:colors.errorBg, border:`1px solid ${colors.error}44`, color:colors.errorText, fontSize:12, cursor:"pointer", fontFamily:fonts.heading }}>Deactivate</button>
          <button onClick={handleSave} disabled={saving} style={{ padding:"7px 18px", borderRadius:8, background:saving?colors.n300:colors.primary, color:"white", border:"none", cursor:saving?"not-allowed":"pointer", fontFamily:fonts.heading, fontSize:12, fontWeight:700 }}>
            {saving?"Saving...":"Save Changes"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ background:colors.white, borderRadius:16, padding:28, border:`1px solid ${colors.n200}` }}>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>EDIT BATCH</div>
            <h2 style={{ fontFamily:fonts.display, fontSize:"1.5rem", fontWeight:700, color:colors.n800, margin:0 }}>Edit Halqa Details</h2>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Name *</label>
            <input value={form.name} onChange={e=>set("name",e.target.value)} style={inp}/>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Program</label>
            <select value={form.program} onChange={e=>set("program",e.target.value)} style={inp}>
              {["HIFZ","NAZRA","TAJWEED","GIRDAAN"].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Ustadh</label>
            <select value={form.ustadhId} onChange={e=>set("ustadhId",e.target.value)} style={inp}>
              <option value="">— No Ustadh —</option>
              {asatidha.map(u=><option key={u.id} value={u.id}>{u.user.name}</option>)}
            </select>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Session Time</label>
              <select value={form.sessionTime} onChange={e=>set("sessionTime",e.target.value)} style={inp}>
                <option value="">Not set</option>
                {SESSION_TIMES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Max Students</label>
              <input type="number" value={form.maxStudents} min={1} max={50} onChange={e=>set("maxStudents",parseInt(e.target.value)||1)} style={{ ...inp, fontFamily:fonts.mono, fontWeight:700, color:colors.primary }}/>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <input type="checkbox" checked={form.isActive} onChange={e=>set("isActive",e.target.checked)} style={{ width:16,height:16,accentColor:colors.primary }}/>
              <span style={{ fontFamily:fonts.body, fontSize:13, color:colors.n700 }}>Batch is active</span>
            </label>
          </div>

          {error && <div style={{ background:colors.errorBg, borderRadius:10, padding:"12px 16px", marginBottom:16 }}><span style={{ fontFamily:fonts.body, fontSize:13, color:colors.errorText }}>⚠ {error}</span></div>}

          <div style={{ display:"flex", gap:10 }}>
            <Link href={`/dashboard/admin/batches/${id}`} style={{ flex:1, padding:"13px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:13, textDecoration:"none", fontFamily:fonts.heading, textAlign:"center" }}>Cancel</Link>
            <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:"13px", borderRadius:10, background:saving?colors.n300:colors.primary, color:"white", fontSize:13, fontWeight:700, border:"none", cursor:saving?"not-allowed":"pointer", fontFamily:fonts.heading }}>
              {saving?"Saving...":"Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
