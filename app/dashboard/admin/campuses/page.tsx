"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PROG_COLOR: Record<string,string> = {
  HIFZ:colors.primary, NAZRA:"#7c3aed", TAJWEED:"#b45309", GIRDAAN:"#0f766e"
};

interface Campus {
  id:string; name:string; city:string|null; phone:string|null; isActive:boolean;
  weekLessons:number; totalLessons:number;
  _count:{ students:number; batches:number };
  batches:{ id:string; name:string; program:string; _count:{ students:number } }[];
  users: { id:string; name:string }[];
}

export default function CampusesPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState<"cards"|"compare">("cards");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/campuses")
      .then(r=>r.json())
      .then(d=>{ if(d.success) setCampuses(d.data.campuses); })
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[]);

  const totalStudents = campuses.reduce((a,c)=>a+c._count.students,0);
  const totalBatches  = campuses.reduce((a,c)=>a+c._count.batches,0);
  const totalLessons  = campuses.reduce((a,c)=>a+c.weekLessons,0);

  const handleSignOut = async()=>{
    await fetch("/api/auth/signout",{method:"POST"});
    window.location.href="/signin";
  };

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Link href="/dashboard/admin" style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{fontFamily:fonts.display,fontSize:16,fontWeight:700,color:colors.white,lineHeight:1}}>Campus Management</div>
            <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.gold,opacity:0.8,letterSpacing:1}}>إدارة الحرم الجامعي</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Link href="/dashboard/admin/campuses/new" style={{padding:"8px 18px",borderRadius:8,background:colors.gold,color:colors.white,fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading}}>+ Add Campus</Link>
          <button onClick={handleSignOut} style={{padding:"6px 12px",borderRadius:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",fontFamily:fonts.heading}}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}}>

        {/* Header */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:4}}>MULTI-CAMPUS</div>
          <h1 style={{fontFamily:fonts.display,fontSize:"2rem",fontWeight:700,color:colors.n800,margin:"0 0 4px"}}>Campus Management</h1>
          <p style={{fontFamily:fonts.body,fontSize:13,color:colors.n500}}>Manage all campuses, compare performance, transfer students between locations</p>
        </div>

        {/* Summary stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[
            {icon:"🏛️",val:campuses.length,       label:"Total Campuses",    color:colors.primary,  bg:colors.green50,  border:colors.green200},
            {icon:"👨‍🎓",val:totalStudents,         label:"Active Students",   color:"#0369a1",       bg:"#f0f9ff",       border:"#bae6fd"},
            {icon:"👥",val:totalBatches,           label:"Active Halqas",     color:"#7c3aed",       bg:"#f5f3ff",       border:"#c4b5fd"},
            {icon:"📖",val:totalLessons,           label:"Lessons This Week", color:"#0f766e",       bg:"#f0fdfa",       border:"#99f6e4"},
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,borderRadius:14,padding:"16px 14px",border:`1px solid ${s.border}`,textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontFamily:fonts.heading,fontSize:26,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontFamily:fonts.body,fontSize:11,color:s.color,opacity:0.8,marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div style={{display:"flex",gap:6,background:colors.white,borderRadius:10,padding:3,border:`1px solid ${colors.n200}`,marginBottom:20,width:"fit-content"}}>
          {[{id:"cards",label:"Campus Cards"},{id:"compare",label:"Comparison Table"}].map(v=>(
            <button key={v.id} onClick={()=>setView(v.id as any)} style={{padding:"8px 18px",borderRadius:7,border:"none",cursor:"pointer",background:view===v.id?colors.primary:"transparent",color:view===v.id?"white":colors.n500,fontFamily:fonts.heading,fontSize:12,fontWeight:600}}>{v.label}</button>
          ))}
        </div>

        {loading?(
          <div style={{padding:48,textAlign:"center",color:colors.n400,fontFamily:fonts.body}}>Loading campuses...</div>
        ):campuses.length===0?(
          <div style={{background:colors.white,borderRadius:16,padding:56,textAlign:"center",border:`1px solid ${colors.n200}`}}>
            <div style={{fontSize:56,marginBottom:16}}>🏛️</div>
            <div style={{fontFamily:fonts.heading,fontSize:18,fontWeight:700,color:colors.n700,marginBottom:8}}>Only one campus</div>
            <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n400,marginBottom:20}}>Add a second campus for your institution to unlock multi-campus management</div>
            <Link href="/dashboard/admin/campuses/new" style={{padding:"12px 28px",borderRadius:10,background:colors.gold,color:"white",textDecoration:"none",fontFamily:fonts.heading,fontSize:13,fontWeight:700}}>+ Add Campus →</Link>
          </div>
        ):view==="cards"?(
          // ── CARD VIEW ──
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
            {campuses.map(c=>(
              <div key={c.id} style={{background:colors.white,borderRadius:16,overflow:"hidden",border:`1px solid ${colors.n200}`,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                {/* Header */}
                <div style={{background:`linear-gradient(135deg,${colors.deep},${colors.primary}88)`,padding:"18px 18px 14px",position:"relative",overflow:"hidden"}}>
                  <svg style={{position:"absolute",right:-10,top:-10,opacity:0.06}} width="100" height="100" viewBox="0 0 80 80">
                    <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
                  </svg>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:"white",marginBottom:2}}>{c.name}</div>
                      <div style={{fontFamily:fonts.body,fontSize:11,color:"rgba(255,255,255,0.5)"}}>{c.city||"—"} · {c.phone||"—"}</div>
                    </div>
                    <span style={{background:c.isActive?"rgba(52,211,153,0.2)":"rgba(239,68,68,0.2)",color:c.isActive?"#4ade80":"#fca5a5",padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>
                      {c.isActive?"ACTIVE":"INACTIVE"}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
                    {[
                      {label:"Students",val:c._count.students,  color:colors.primary},
                      {label:"Batches", val:c._count.batches,   color:"#7c3aed"},
                      {label:"Lessons/wk",val:c.weekLessons,   color:"#0f766e"},
                    ].map((s,i)=>(
                      <div key={i} style={{background:colors.n50,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                        <div style={{fontFamily:fonts.heading,fontSize:18,fontWeight:700,color:s.color}}>{s.val}</div>
                        <div style={{fontFamily:fonts.body,fontSize:9,color:colors.n400}}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Batches */}
                  {c.batches.length>0&&(
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
                      {c.batches.slice(0,4).map(b=>(
                        <span key={b.id} style={{background:`${PROG_COLOR[b.program]||colors.primary}15`,color:PROG_COLOR[b.program]||colors.primary,padding:"2px 7px",borderRadius:5,fontSize:9,fontFamily:fonts.heading,fontWeight:700}}>
                          {b.name} · {b._count.students}s
                        </span>
                      ))}
                      {c.batches.length>4&&<span style={{fontSize:9,color:colors.n400,padding:"2px 4px"}}>+{c.batches.length-4} more</span>}
                    </div>
                  )}

                  <div style={{display:"flex",gap:6}}>
                    <Link href={`/dashboard/admin/campuses/${c.id}`} style={{flex:1,padding:"8px",borderRadius:8,background:colors.green50,color:colors.primary,border:`1px solid ${colors.green200}`,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center"}}>Manage →</Link>
                    <Link href={`/dashboard/admin/campuses/${c.id}?tab=transfer`} style={{flex:1,padding:"8px",borderRadius:8,background:colors.n50,color:colors.n700,border:`1px solid ${colors.n200}`,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center"}}>Transfer Students</Link>
                  </div>
                </div>
              </div>
            ))}
            {/* Add campus card */}
            <Link href="/dashboard/admin/campuses/new" style={{textDecoration:"none"}}>
              <div style={{background:colors.white,borderRadius:16,border:`2px dashed ${colors.n200}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:200,gap:10,cursor:"pointer"}}>
                <div style={{width:48,height:48,borderRadius:14,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>+</div>
                <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary}}>Add New Campus</div>
                <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n400}}>Girls wing, boys branch, new city</div>
              </div>
            </Link>
          </div>
        ):(
          // ── COMPARISON TABLE ──
          <div style={{background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:`160px repeat(${campuses.length},1fr)`,gap:0,borderBottom:`1px solid ${colors.n200}`}}>
              <div style={{padding:"12px 16px",background:colors.n50,fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:colors.n500}}/>
              {campuses.map(c=>(
                <div key={c.id} style={{padding:"12px 10px",background:colors.n50,textAlign:"center",borderLeft:`1px solid ${colors.n200}`}}>
                  <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.primary}}>{c.name}</div>
                  <div style={{fontFamily:fonts.body,fontSize:9,color:colors.n400}}>{c.city||"—"}</div>
                </div>
              ))}
            </div>
            {[
              {label:"Active Students",  key:"_count.students"},
              {label:"Active Batches",   key:"_count.batches"},
              {label:"Lessons This Week",key:"weekLessons"},
              {label:"Total Lessons",    key:"totalLessons"},
              {label:"Ustadh",          key:"users.length"},
            ].map((row,ri)=>(
              <div key={ri} style={{display:"grid",gridTemplateColumns:`160px repeat(${campuses.length},1fr)`,gap:0,borderBottom:`1px solid ${colors.n100}`}}>
                <div style={{padding:"12px 16px",fontFamily:fonts.body,fontSize:12,color:colors.n600,background:ri%2===0?colors.white:colors.n50}}>{row.label}</div>
                {campuses.map(c=>{
                  const val = row.key==="_count.students"?c._count.students
                    :row.key==="_count.batches"?c._count.batches
                    :row.key==="weekLessons"?c.weekLessons
                    :row.key==="totalLessons"?c.totalLessons
                    :c.users.length;
                  const max = Math.max(...campuses.map(x=>row.key==="_count.students"?x._count.students:row.key==="_count.batches"?x._count.batches:row.key==="weekLessons"?x.weekLessons:row.key==="totalLessons"?x.totalLessons:x.users.length));
                  return (
                    <div key={c.id} style={{padding:"12px 10px",textAlign:"center",borderLeft:`1px solid ${colors.n200}`,background:val===max&&max>0?colors.green50:ri%2===0?colors.white:colors.n50}}>
                      <div style={{fontFamily:fonts.mono,fontSize:14,fontWeight:700,color:val===max&&max>0?colors.primary:colors.n700}}>{val}</div>
                      {val===max&&max>0&&<div style={{fontFamily:fonts.mono,fontSize:8,color:colors.primary}}>★ BEST</div>}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:`160px repeat(${campuses.length},1fr)`,gap:0}}>
              <div style={{padding:"12px 16px",fontFamily:fonts.body,fontSize:12,color:colors.n600}}>Actions</div>
              {campuses.map(c=>(
                <div key={c.id} style={{padding:"10px 10px",textAlign:"center",borderLeft:`1px solid ${colors.n200}`}}>
                  <Link href={`/dashboard/admin/campuses/${c.id}`} style={{padding:"5px 12px",borderRadius:6,background:colors.green50,color:colors.primary,fontSize:10,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading}}>Manage →</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
