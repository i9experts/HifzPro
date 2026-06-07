"use client";
import { useState } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const inp = { width:"100%", padding:"11px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:9, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

export default function NewCampusPage() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState<any>(null);
  const [error,  setError]  = useState("");
  const [form, setForm] = useState({
    name:"", nameArabic:"", city:"", address:"", phone:"", sessionTime:"",
  });
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async() => {
    if(!form.name.trim()) { setError("Campus name is required"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/campuses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data = await res.json();
      if(data.success) setSaved(data.data.campus);
      else setError(data.error||"Failed to create campus");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if(saved) return (
    <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:440,width:"100%",background:colors.white,borderRadius:20,padding:40,textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>🏛️</div>
        <div style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:8}}>CAMPUS CREATED</div>
        <h2 style={{fontFamily:fonts.display,fontSize:"1.6rem",fontWeight:700,color:colors.n800,margin:"0 0 20px"}}>{form.name}</h2>
        <div style={{display:"flex",gap:10}}>
          <Link href="/dashboard/admin/campuses" style={{flex:1,padding:"12px",borderRadius:10,background:colors.primary,color:"white",fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center"}}>All Campuses</Link>
          <Link href={`/dashboard/admin/campuses/${saved.id}`} style={{flex:1,padding:"12px",borderRadius:10,background:colors.gold,color:"white",fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center"}}>Manage →</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Link href="/dashboard/admin/campuses" style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
        <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.white}}>Add New Campus</div>
      </nav>
      <div style={{maxWidth:620,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{background:colors.white,borderRadius:16,padding:28,border:`1px solid ${colors.n200}`}}>
          <div style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4}}>NEW CAMPUS</div>
          <h2 style={{fontFamily:fonts.display,fontSize:"1.5rem",fontWeight:700,color:colors.n800,margin:"0 0 20px"}}>Add Campus</h2>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Campus Name (English) *</label>
              <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Girls Wing — Block A" style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Campus Name (Arabic/Urdu)</label>
              <input value={form.nameArabic} onChange={e=>set("nameArabic",e.target.value)} placeholder="اردو یا عربی میں نام" style={{...inp,direction:"rtl",fontFamily:"'Cormorant Garamond',serif",fontSize:16}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>City</label>
                <input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="Karachi" style={inp}/>
              </div>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Phone</label>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+92 21 0000000" style={inp}/>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Address</label>
              <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Street, Area, City" style={inp}/>
            </div>
            <div>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:5}}>Session Time (optional)</label>
              <input value={form.sessionTime} onChange={e=>set("sessionTime",e.target.value)} placeholder="e.g. Fajr 5:30 AM — 7:00 AM" style={inp}/>
            </div>
          </div>
          {error&&<div style={{background:colors.errorBg,borderRadius:10,padding:"12px 14px",marginTop:14}}><span style={{fontFamily:fonts.body,fontSize:13,color:colors.errorText}}>⚠ {error}</span></div>}
          <div style={{display:"flex",gap:10,marginTop:24}}>
            <Link href="/dashboard/admin/campuses" style={{flex:1,padding:"13px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:14,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center"}}>Cancel</Link>
            <button onClick={handleSubmit} disabled={saving} style={{flex:2,padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,border:"none",background:saving?colors.n300:colors.primary,color:"white",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
              {saving?"Creating...":"Create Campus 🏛️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
