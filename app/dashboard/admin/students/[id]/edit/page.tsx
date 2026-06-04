"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const RELATIONS = ["Father","Mother","Grandfather","Grandmother","Uncle","Aunt","Brother","Sister","Guardian","Other"];
const PROGRAMS  = ["HIFZ","NAZRA","TAJWEED","GIRDAAN"];

const inputStyle = {
  width:"100%", padding:"10px 12px",
  border:`1.5px solid ${colors.n200}`, borderRadius:8,
  fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none",
};

function FieldRow({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) {
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6}}>
        {label} {required&&<span style={{color:colors.error}}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EditStudentPage({params}:{params:Promise<{id:string}>}) {
  const {id} = use(params);
  const [loading, setLoading]  = useState(true);
  const [saving,  setSaving]   = useState(false);
  const [saved,   setSaved]    = useState(false);
  const [error,   setError]    = useState("");
  const [form,    setForm]     = useState({
    name:"",nameArabic:"",dateOfBirth:"",gender:"MALE",
    program:"HIFZ",status:"ACTIVE",batchId:"",expectedKhatmAt:"",startingJuz:1,
    guardianName:"",guardianRelation:"Father",guardianCnic:"",
    guardianPhone:"",guardianWhatsapp:"",guardianEmail:"",receiveUpdates:true,
  });

  const set = (key:string,val:any)=>setForm(prev=>({...prev,[key]:val}));

  useEffect(()=>{
    fetch(`/api/admin/students/${id}`)
      .then(r=>r.json())
      .then(d=>{
        if(d.success){
          const s = d.data.student;
          const g = s.guardians?.find((g:any)=>g.isEmergency)||s.guardians?.[0];
          setForm({
            name:s.name||"", nameArabic:s.nameArabic||"",
            dateOfBirth:s.dateOfBirth?s.dateOfBirth.split("T")[0]:"",
            gender:"MALE", program:s.program||"HIFZ", status:s.status||"ACTIVE",
            batchId:s.batchId||"",
            expectedKhatmAt:s.expectedKhatmAt?s.expectedKhatmAt.split("T")[0]:"",
            startingJuz:s.startingJuz||1,
            guardianName:g?.name||"", guardianRelation:g?.relation||"Father",
            guardianCnic:g?.cnic||"", guardianPhone:g?.phone||"",
            guardianWhatsapp:g?.whatsapp||"", guardianEmail:g?.email||"",
            receiveUpdates:g?.receiveUpdates??true,
          });
        }
      })
      .finally(()=>setLoading(false));
  },[id]);

  const handleSave = async()=>{
    if(!form.name||!form.guardianPhone){setError("Name and guardian phone are required");return;}
    setSaving(true);setError("");
    try{
      const res  = await fetch(`/api/admin/students/${id}`,{
        method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form),
      });
      const data = await res.json();
      if(data.success){setSaved(true);setTimeout(()=>window.location.href=`/dashboard/admin/students/${id}`,1500);}
      else setError(data.error||"Failed to update");
    }catch{setError("Connection error");}finally{setSaving(false);}
  };

  const handleWithdraw = async()=>{
    if(!confirm("Are you sure you want to withdraw this student? This can be reversed."))return;
    const res  = await fetch(`/api/admin/students/${id}?action=withdraw`,{method:"DELETE"});
    const data = await res.json();
    if(data.success)window.location.href="/dashboard/admin/students";
  };

  if(loading)return<div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:fonts.body,color:"rgba(255,255,255,0.4)"}}>Loading...</div></div>;

  return(
    <div style={{minHeight:"100vh",background:colors.n50}}>
      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Link href={`/dashboard/admin/students/${id}`} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
        <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.white}}>Edit Student</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={handleWithdraw} style={{padding:"8px 16px",borderRadius:8,background:colors.errorBg,border:`1px solid ${colors.error}44`,color:colors.errorText,fontSize:12,cursor:"pointer",fontFamily:fonts.heading}}>
            Withdraw Student
          </button>
          <button onClick={handleSave} disabled={saving} style={{padding:"8px 20px",borderRadius:8,background:saving?colors.n300:colors.primary,color:colors.white,fontSize:12,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
            {saving?"Saving...":"Save Changes"}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:800,margin:"0 auto",padding:"28px 20px"}}>
        {saved&&<div style={{background:colors.successBg,borderRadius:10,padding:"12px 16px",marginBottom:16,textAlign:"center"}}><span style={{fontFamily:fonts.heading,fontSize:13,fontWeight:600,color:colors.successText}}>✓ Student updated successfully! Redirecting...</span></div>}
        {error&&<div style={{background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginBottom:16}}><span style={{fontFamily:fonts.body,fontSize:13,color:colors.errorText}}>⚠ {error}</span></div>}

        {/* Personal */}
        <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`,marginBottom:16}}>
          <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:18}}>👤 Personal Information</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{gridColumn:"1/-1"}}><FieldRow label="Full Name" required><input value={form.name} onChange={e=>set("name",e.target.value)} style={inputStyle}/></FieldRow></div>
            <FieldRow label="Arabic / Urdu Name"><input value={form.nameArabic} onChange={e=>set("nameArabic",e.target.value)} style={{...inputStyle,direction:"rtl",fontFamily:"'Cormorant Garamond',serif",fontSize:15}}/></FieldRow>
            <FieldRow label="Date of Birth"><input type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)} style={inputStyle}/></FieldRow>
          </div>
        </div>

        {/* Program */}
        <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`,marginBottom:16}}>
          <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:18}}>📖 Program Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <FieldRow label="Program" required>
              <select value={form.program} onChange={e=>set("program",e.target.value)} style={inputStyle}>
                {PROGRAMS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Status">
              <select value={form.status} onChange={e=>set("status",e.target.value)} style={inputStyle}>
                {["ACTIVE","ON_LEAVE","SUSPENDED","COMPLETED","WITHDRAWN"].map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Expected Khatm Date">
              <input type="date" value={form.expectedKhatmAt} onChange={e=>set("expectedKhatmAt",e.target.value)} style={inputStyle}/>
            </FieldRow>
            <FieldRow label="Starting Juz">
              <input type="number" min={1} max={30} value={form.startingJuz} onChange={e=>set("startingJuz",parseInt(e.target.value)||1)} style={inputStyle}/>
            </FieldRow>
          </div>
        </div>

        {/* Guardian */}
        <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`,marginBottom:16}}>
          <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:18}}>👨‍👩‍👦 Guardian Information</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <FieldRow label="Full Name" required><input value={form.guardianName} onChange={e=>set("guardianName",e.target.value)} style={inputStyle}/></FieldRow>
            <FieldRow label="Relation">
              <select value={form.guardianRelation} onChange={e=>set("guardianRelation",e.target.value)} style={inputStyle}>
                {RELATIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="CNIC"><input value={form.guardianCnic} onChange={e=>set("guardianCnic",e.target.value)} placeholder="42101-1234567-1" style={inputStyle}/></FieldRow>
            <FieldRow label="Phone" required><input value={form.guardianPhone} onChange={e=>set("guardianPhone",e.target.value)} style={inputStyle}/></FieldRow>
            <FieldRow label="WhatsApp"><input value={form.guardianWhatsapp} onChange={e=>set("guardianWhatsapp",e.target.value)} style={inputStyle}/></FieldRow>
            <FieldRow label="Email"><input type="email" value={form.guardianEmail} onChange={e=>set("guardianEmail",e.target.value)} style={inputStyle}/></FieldRow>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={form.receiveUpdates} onChange={e=>set("receiveUpdates",e.target.checked)} style={{width:16,height:16,accentColor:colors.primary}}/>
                <span style={{fontFamily:fonts.body,fontSize:13,color:colors.n700}}>Send daily Sabaq updates via WhatsApp</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <Link href={`/dashboard/admin/students/${id}`} style={{padding:"12px 24px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:13,textDecoration:"none",fontFamily:fonts.heading}}>Cancel</Link>
          <button onClick={handleSave} disabled={saving} style={{padding:"12px 28px",borderRadius:10,background:saving?colors.n300:colors.primary,color:colors.white,fontSize:13,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
            {saving?"Saving...":"Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

