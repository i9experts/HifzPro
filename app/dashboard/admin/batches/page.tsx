"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Batch {
  id: string; name: string; program: string; isActive: boolean;
  sessionTime: string | null; maxStudents: number; studentCount: number;
  ustadh: { id: string; name: string } | null;
  avgHealth: number | null; avgProgress: number; atRiskCount: number;
  lastActivity: string | null;
  students: { id: string; name: string; currentJuz: number; manzilHealth: number | null }[];
}
interface Stats { total: number; active: number; unassigned: number; totalStudents: number; }

const PROGRAM_INFO: Record<string,{label:string;arabic:string;color:string;bg:string}> = {
  HIFZ:    { label:"Hifz ul Quran", arabic:"حفظ القرآن", color:colors.primary,  bg:colors.green50 },
  NAZRA:   { label:"Nazrah",        arabic:"ناظرہ",       color:"#7c3aed",       bg:"#f5f3ff" },
  TAJWEED: { label:"Tajweed",       arabic:"تجوید",       color:"#b45309",       bg:"#fffbeb" },
  GIRDAAN: { label:"Girdaan",       arabic:"گردان",       color:"#0f766e",       bg:"#f0fdfa" },
};

function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct   = Math.round((current / max) * 100);
  const color = pct >= 90 ? colors.error : pct >= 70 ? colors.warning : colors.success;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>Capacity</span>
        <span style={{ fontFamily:fonts.mono, fontSize:10, fontWeight:700, color }}>{current}/{max}</span>
      </div>
      <div style={{ height:4, background:colors.n100, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 0.4s" }}/>
      </div>
    </div>
  );
}

function HealthDot({ score }: { score: number | null }) {
  if (!score) return <span style={{ color:colors.n300, fontSize:11 }}>—</span>;
  const color = score>=75?colors.successText:score>=55?colors.warningText:colors.errorText;
  const bg    = score>=75?colors.successBg:score>=55?colors.warningBg:colors.errorBg;
  return <span style={{ background:bg, color, padding:"2px 7px", borderRadius:999, fontSize:10, fontFamily:fonts.mono, fontWeight:700 }}>{score}%</span>;
}

export default function BatchesPage() {
  const [batches,  setBatches]  = useState<Batch[]>([]);
  const [stats,    setStats]    = useState<Stats|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("");
  const [program,  setProgram]  = useState("");

  const fetchBatches = () => {
    setLoading(true);
    fetch("/api/admin/batches")
      .then(r=>r.json())
      .then(d=>{ if(d.success){ setBatches(d.data.batches); setStats(d.data.stats); }})
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchBatches(); },[]);

  const filtered = batches.filter(b => {
    if (!b.isActive) return false;
    if (program && b.program !== program) return false;
    if (filter && !b.name.toLowerCase().includes(filter.toLowerCase()) &&
        !b.ustadh?.name.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const handleSignOut = async () => {
    await fetch("/api/auth/signout",{method:"POST"});
    window.location.href="/signin";
  };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:colors.white, lineHeight:1 }}>Batch Management</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, opacity:0.8, letterSpacing:1 }}>حلقہ مینجمنٹ</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Link href="/dashboard/admin/batches/new" style={{ padding:"8px 18px", borderRadius:8, background:colors.gold, color:colors.white, fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
            + New Halqa
          </Link>
          <button onClick={handleSignOut} style={{ padding:"6px 14px", borderRadius:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>HALQA MANAGEMENT</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>Batches & Halqas</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>Create halqas, assign Asatidha, and manage student placement</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {[
              { val:stats.total,          label:"Total Halqas",      icon:"👥", color:colors.primary,     bg:colors.green50,   border:colors.green200 },
              { val:stats.active,         label:"Active Halqas",     icon:"✅", color:colors.successText, bg:colors.successBg, border:`${colors.success}44` },
              { val:stats.totalStudents,  label:"Assigned Students", icon:"👨‍🎓",color:colors.primary,     bg:colors.white,     border:colors.n200 },
              { val:stats.unassigned,     label:"Unassigned",        icon:"⚠️", color:stats.unassigned>0?colors.warningText:colors.successText, bg:stats.unassigned>0?colors.warningBg:colors.successBg, border:`${stats.unassigned>0?colors.warning:colors.success}44` },
            ].map((s,i)=>(
              <div key={i} style={{ background:s.bg, borderRadius:14, padding:"16px 14px", border:`1px solid ${s.border}`, textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:fonts.heading, fontSize:26, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:fonts.body, fontSize:10, color:s.color, opacity:0.8, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Unassigned students warning */}
        {stats && stats.unassigned > 0 && (
          <div style={{ background:colors.warningBg, borderRadius:12, padding:"12px 16px", border:`1px solid ${colors.warning}44`, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>⚠️</span>
              <div>
                <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.warningText }}>{stats.unassigned} students not assigned to any Halqa</div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.warningText, opacity:0.8 }}>These students won't appear in any Ustadh's dashboard</div>
              </div>
            </div>
            <Link href="/dashboard/admin/students?status=ACTIVE" style={{ padding:"8px 16px", borderRadius:8, background:colors.warning, color:"white", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
              View Students →
            </Link>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <input value={filter} onChange={e=>setFilter(e.target.value)}
            placeholder="Search by name or Ustadh..."
            style={{ flex:1, minWidth:200, padding:"10px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, outline:"none" }}/>
          <select value={program} onChange={e=>setProgram(e.target.value)}
            style={{ padding:"10px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.heading, color:colors.n700, background:colors.white, outline:"none" }}>
            <option value="">All Programs</option>
            {Object.entries(PROGRAM_INFO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Batch cards */}
        {loading ? (
          <div style={{ textAlign:"center", padding:48, color:colors.n400, fontFamily:fonts.body }}>Loading halqas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background:colors.white, borderRadius:16, padding:48, textAlign:"center", border:`1px solid ${colors.n200}` }}>
            <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
            <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.n700, marginBottom:6 }}>No halqas yet</div>
            <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400, marginBottom:20 }}>Create your first halqa to assign students to an Ustadh</div>
            <Link href="/dashboard/admin/batches/new" style={{ padding:"12px 28px", borderRadius:10, background:colors.gold, color:"white", textDecoration:"none", fontFamily:fonts.heading, fontSize:13, fontWeight:700 }}>+ Create First Halqa →</Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
            {filtered.map(batch => {
              const prog = PROGRAM_INFO[batch.program] || PROGRAM_INFO.HIFZ;
              const daysAgo = batch.lastActivity
                ? Math.floor((Date.now()-new Date(batch.lastActivity).getTime())/(1000*60*60*24))
                : null;
              return (
                <div key={batch.id} style={{ background:colors.white, borderRadius:16, overflow:"hidden", border:`1px solid ${colors.n200}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                  {/* Card header */}
                  <div style={{ background:`linear-gradient(135deg,${colors.deep},${prog.color}55)`, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
                    <svg style={{ position:"absolute",right:-10,top:-10,opacity:0.08 }} width="100" height="100" viewBox="0 0 80 80">
                      <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
                    </svg>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontFamily:fonts.heading, fontSize:17, fontWeight:700, color:colors.white, marginBottom:3 }}>{batch.name}</div>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <span style={{ background:prog.bg, color:prog.color, padding:"2px 8px", borderRadius:6, fontSize:10, fontFamily:fonts.heading, fontWeight:700 }}>{prog.label}</span>
                          {batch.sessionTime && <span style={{ fontFamily:fonts.mono, fontSize:9, color:"rgba(255,255,255,0.5)" }}>{batch.sessionTime}</span>}
                        </div>
                      </div>
                      <Link href={`/dashboard/admin/batches/${batch.id}`} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.15)", color:"white", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading, flexShrink:0 }}>
                        Manage →
                      </Link>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding:"16px 18px" }}>
                    {/* Ustadh */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, padding:"10px 12px", background:colors.n50, borderRadius:10 }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:batch.ustadh?colors.green50:colors.errorBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ fontSize:18 }}>{batch.ustadh?"👨‍🏫":"❓"}</span>
                      </div>
                      <div style={{ flex:1 }}>
                        {batch.ustadh ? (
                          <>
                            <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800 }}>{batch.ustadh.name}</div>
                            <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>Assigned Ustadh</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.errorText }}>No Ustadh Assigned</div>
                            <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.errorText, opacity:0.7 }}>Students won't appear in any dashboard</div>
                          </>
                        )}
                      </div>
                      {!batch.ustadh && (
                        <Link href={`/dashboard/admin/batches/${batch.id}/edit`} style={{ padding:"5px 10px", borderRadius:6, background:colors.errorBg, color:colors.errorText, fontSize:10, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>Assign</Link>
                      )}
                    </div>

                    {/* Stats row */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                      {[
                        { label:"Manzil Health", val:<HealthDot score={batch.avgHealth}/> },
                        { label:"Avg Progress",  val:<span style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:700, color:colors.primary }}>{batch.avgProgress}%</span> },
                        { label:"At Risk",       val:<span style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:700, color:batch.atRiskCount>0?colors.errorText:colors.successText }}>{batch.atRiskCount}</span> },
                      ].map((s,i)=>(
                        <div key={i} style={{ background:colors.n50, borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                          {s.val}
                          <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400, marginTop:2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Capacity */}
                    <div style={{ marginBottom:12 }}>
                      <CapacityBar current={batch.studentCount} max={batch.maxStudents}/>
                    </div>

                    {/* Student avatars */}
                    {batch.students.length > 0 && (
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:10 }}>
                        {batch.students.slice(0,6).map((s,i)=>(
                          <div key={s.id} style={{ width:26,height:26,borderRadius:8,background:colors.green50,border:`2px solid white`,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:i>0?-6:0,zIndex:6-i }}>
                            <span style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.primary }}>{s.name.charAt(0)}</span>
                          </div>
                        ))}
                        {batch.students.length > 6 && (
                          <div style={{ width:26,height:26,borderRadius:8,background:colors.n100,border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",marginLeft:-6 }}>
                            <span style={{ fontFamily:fonts.mono, fontSize:8, color:colors.n500 }}>+{batch.students.length-6}</span>
                          </div>
                        )}
                        <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400, marginLeft:8 }}>{batch.studentCount} student{batch.studentCount!==1?"s":""}</span>
                      </div>
                    )}

                    {/* Last activity */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400 }}>
                        {daysAgo===null?"No lessons yet":daysAgo===0?"Active today":daysAgo===1?"Active yesterday":`Last active ${daysAgo}d ago`}
                      </span>
                      <Link href={`/dashboard/admin/batches/${batch.id}`} style={{ fontFamily:fonts.heading, fontSize:11, color:colors.primary, textDecoration:"none", fontWeight:600 }}>
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
