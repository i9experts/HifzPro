"use client";
import { useState } from "react";
import Link from "next/link";

const D = { bg:"#0d0a1a", card:"#13101f", border:"#1e1a30", purple:"#7c3aed", gold:"#C4882A", white:"#fff", dim:"rgba(255,255,255,0.5)" };
const serif  = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";
const sans   = "'Inter','Segoe UI',system-ui,sans-serif";
const mono   = "'JetBrains Mono',monospace";

export default function DonorSigninPage() {
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPw,  setShowPw]  = useState(false);

  const handleSubmit = async() => {
    if(!email||!password) { setError("Please enter email and password"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/donor-signin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const data = await res.json();
      if(data.success) window.location.href="/dashboard/donor";
      else setError(data.error||"Invalid credentials");
    } catch { setError("Connection error"); } finally { setLoading(false); }
  };

  const inp = { width:"100%", padding:"13px 14px", border:`1.5px solid ${D.border}`, borderRadius:10, fontSize:14, fontFamily:sans, color:D.white, background:"rgba(255,255,255,0.05)", outline:"none" };

  return (
    <div style={{minHeight:"100vh",background:D.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:420,width:"100%"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>🕌</div>
          <div style={{fontFamily:serif,fontSize:28,fontWeight:700,color:D.white}}>HifzPro</div>
          <div style={{fontFamily:mono,fontSize:9,color:D.purple,letterSpacing:2,marginTop:2}}>DONOR PORTAL</div>
        </div>

        {/* Arabic dua */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:arabic,fontSize:18,color:D.gold,opacity:0.7}}>جزاك الله خيراً على عطائك</div>
          <div style={{fontFamily:sans,fontSize:12,color:D.dim,marginTop:4}}>May Allah reward your generosity</div>
        </div>

        {/* Form card */}
        <div style={{background:D.card,borderRadius:20,padding:32,border:`1px solid ${D.border}`}}>
          <h2 style={{fontFamily:serif,fontSize:"1.5rem",fontWeight:700,color:D.white,margin:"0 0 20px",textAlign:"center"}}>Donor Sign In</h2>

          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontFamily:sans,fontSize:11,fontWeight:600,color:D.dim,marginBottom:5}}>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={inp} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontFamily:sans,fontSize:11,fontWeight:600,color:D.dim,marginBottom:5}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" style={{...inp,paddingRight:44}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
              <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:D.dim,fontSize:14}}>{showPw?"🙈":"👁"}</button>
            </div>
          </div>

          {error&&<div style={{background:"rgba(239,68,68,0.1)",borderRadius:10,padding:"10px 14px",marginBottom:14,border:"1px solid rgba(239,68,68,0.3)"}}><span style={{fontFamily:sans,fontSize:12,color:"#fca5a5"}}>⚠ {error}</span></div>}

          <button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:11,background:loading?"rgba(124,58,237,0.3)":"#7c3aed",color:"white",fontSize:14,fontWeight:700,border:"none",cursor:loading?"not-allowed":"pointer",fontFamily:sans,boxShadow:loading?"none":"0 4px 20px rgba(124,58,237,0.35)"}}>
            {loading?"Signing in...":"Sign In to Donor Portal →"}
          </button>
        </div>

        <div style={{textAlign:"center",marginTop:20}}>
          <Link href="/signin" style={{fontFamily:sans,fontSize:12,color:D.dim,textDecoration:"none"}}>Institution admin? <span style={{color:D.purple}}>Sign in here →</span></Link>
        </div>
      </div>
    </div>
  );
}
