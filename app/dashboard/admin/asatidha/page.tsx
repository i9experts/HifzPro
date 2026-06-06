"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Ustadh {
  id: string; userId: string; name: string; email: string;
  phone: string | null; whatsapp: string | null; photo: string | null;
  isActive: boolean; createdAt: string;
  qualifications: string[]; specialization: string | null;
  experience: number | null; nameArabic: string | null;
  batches: { id: string; name: string; program: string; _count: { students: number } }[];
  stats: { totalBatches: number; totalStudents: number; lessonsThisMonth: number; avgGrade: number | null; avgStudentHealth: number | null };
}
interface Stats { totalUstadh: number; unassigned: number; totalStudentsCovered: number; }

const QUALIFICATIONS = [
  "Hafiz ul Quran","Alim","Mufti","Qari","Muhaddith","Maulana","PhD Islamic Studies","MA Islamic Studies","Graduate Darul Uloom"
];

const PROGRAM_COLORS: Record<string,string> = {
  HIFZ:colors.primary, NAZRA:"#7c3aed", TAJWEED:"#b45309", GIRDAAN:"#0f766e"
};

function HealthBar({ score }: { score: number | null }) {
  if (score === null) return <span style={{ fontFamily:fonts.mono, fontSize:11, color:colors.n300 }}>—</span>;
  const color = score>=75?colors.successText:score>=55?colors.warningText:colors.errorText;
  const bg    = score>=75?colors.successBg:score>=55?colors.warningBg:colors.errorBg;
  return <span style={{ background:bg, color, padding:"2px 7px", borderRadius:999, fontSize:10, fontFamily:fonts.mono, fontWeight:700 }}>{score}%</span>;
}

export default function AsatidhaPage() {
  const [asatidha, setAsatidha] = useState<Ustadh[]>([]);
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [view,     setView]     = useState<"cards"|"table">("cards");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/asatidha")
      .then(r => r.json())
      .then(d => { if (d.success) { setAsatidha(d.data.asatidha); setStats(d.data.stats); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = asatidha.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method:"POST" });
    window.location.href = "/signin";
  };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:colors.white, lineHeight:1 }}>Asatidha</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, opacity:0.8, letterSpacing:1 }}>أساتذة الكرام</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Link href="/dashboard/admin/asatidha/new" style={{ padding:"8px 18px", borderRadius:8, background:colors.gold, color:colors.white, fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
            + Add Ustadh
          </Link>
          <button onClick={handleSignOut} style={{ padding:"6px 12px", borderRadius:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>TEACHING STAFF</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>Asatidha Management</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>Add, manage and track all Asatidha across your institution</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
            {[
              { val:stats.totalUstadh,          label:"Total Asatidha",        icon:"👨‍🏫", color:colors.primary,     bg:colors.green50,   border:colors.green200 },
              { val:stats.totalStudentsCovered,  label:"Students Covered",      icon:"👨‍🎓", color:colors.successText, bg:colors.successBg, border:`${colors.success}44` },
              { val:stats.unassigned,            label:"No Batch Assigned",     icon:"⚠️", color:stats.unassigned>0?colors.warningText:colors.successText, bg:stats.unassigned>0?colors.warningBg:colors.successBg, border:`${stats.unassigned>0?colors.warning:colors.success}44` },
            ].map((s,i)=>(
              <div key={i} style={{ background:s.bg, borderRadius:14, padding:"18px 16px", border:`1px solid ${s.border}`, textAlign:"center" }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:fonts.heading, fontSize:28, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:s.color, opacity:0.8, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Warning: unassigned batches */}
        {stats && stats.unassigned > 0 && (
          <div style={{ background:colors.warningBg, borderRadius:12, padding:"12px 16px", border:`1px solid ${colors.warning}44`, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.warningText }}>{stats.unassigned} Ustadh not assigned to any Halqa</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.warningText, opacity:0.8 }}>Their students won't see them in the Ustadh dashboard</div>
            </div>
            <Link href="/dashboard/admin/batches" style={{ padding:"7px 14px", borderRadius:8, background:colors.warning, color:"white", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>Assign Batches →</Link>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ flex:1, padding:"10px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, outline:"none" }}/>
          <div style={{ display:"flex", gap:4, background:colors.white, borderRadius:8, padding:3, border:`1px solid ${colors.n200}` }}>
            {[{id:"cards",icon:"⊞"},{id:"table",icon:"☰"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id as any)} style={{ width:34,height:34,borderRadius:6,border:"none",cursor:"pointer",background:view===v.id?colors.primary:"transparent",color:view===v.id?"white":colors.n400,fontSize:16 }}>{v.icon}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding:48, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading Asatidha...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background:colors.white, borderRadius:16, padding:56, textAlign:"center", border:`1px solid ${colors.n200}` }}>
            <div style={{ fontSize:56, marginBottom:16 }}>👨‍🏫</div>
            <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.n700, marginBottom:8 }}>No Asatidha yet</div>
            <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400, marginBottom:24 }}>Add your first Ustadh to get started</div>
            <Link href="/dashboard/admin/asatidha/new" style={{ padding:"12px 28px", borderRadius:10, background:colors.gold, color:"white", textDecoration:"none", fontFamily:fonts.heading, fontSize:13, fontWeight:700 }}>+ Add First Ustadh →</Link>
          </div>
        ) : view === "cards" ? (
          // ── CARD VIEW ──
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
            {filtered.map(u => (
              <div key={u.id} style={{ background:colors.white, borderRadius:16, overflow:"hidden", border:`1px solid ${colors.n200}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Card header */}
                <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary}88)`, padding:"18px 18px 14px", position:"relative", overflow:"hidden" }}>
                  <svg style={{ position:"absolute",right:-10,top:-10,opacity:0.06 }} width="100" height="100" viewBox="0 0 80 80">
                    <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
                  </svg>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    {/* Avatar */}
                    <div style={{ width:52,height:52,borderRadius:14,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      {u.photo
                        ? <img src={u.photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        : <span style={{ fontFamily:fonts.display,fontSize:22,fontWeight:700,color:"white" }}>{u.name.charAt(0)}</span>
                      }
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:"white",lineHeight:1.2 }}>{u.name}</div>
                      {u.nameArabic && <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(255,255,255,0.5)",direction:"rtl",textAlign:"left" }}>{u.nameArabic}</div>}
                      <div style={{ fontFamily:fonts.mono,fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:2 }}>{u.email}</div>
                    </div>
                    {!u.isActive && <span style={{ background:"rgba(239,68,68,0.3)",color:"#fca5a5",padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>INACTIVE</span>}
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding:"14px 18px" }}>
                  {/* Qualifications */}
                  {u.qualifications?.length > 0 && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:12 }}>
                      {u.qualifications.map((q,i)=>(
                        <span key={i} style={{ background:colors.green50,color:colors.primary,padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:fonts.heading,fontWeight:700 }}>{q}</span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                    {[
                      { label:"Batches",  val:u.stats.totalBatches,                         color:colors.n700 },
                      { label:"Students", val:u.stats.totalStudents,                         color:colors.n700 },
                      { label:"Lessons/mo",val:u.stats.lessonsThisMonth,                     color:colors.primary },
                    ].map((s,i)=>(
                      <div key={i} style={{ background:colors.n50,borderRadius:8,padding:"8px 6px",textAlign:"center" }}>
                        <div style={{ fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:s.color }}>{s.val}</div>
                        <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Health + Grade */}
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                    <div>
                      <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400,marginBottom:2 }}>Avg Student Health</div>
                      <HealthBar score={u.stats.avgStudentHealth}/>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400,marginBottom:2 }}>Avg Grade Score</div>
                      {u.stats.avgGrade !== null
                        ? <span style={{ fontFamily:fonts.mono,fontSize:11,fontWeight:700,color:u.stats.avgGrade>=75?colors.successText:colors.warningText }}>{u.stats.avgGrade}%</span>
                        : <span style={{ fontFamily:fonts.mono,fontSize:11,color:colors.n300 }}>No data</span>
                      }
                    </div>
                  </div>

                  {/* Batches */}
                  {u.batches.length > 0 ? (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:14 }}>
                      {u.batches.map(b=>(
                        <span key={b.id} style={{ background:`${PROGRAM_COLORS[b.program]||colors.primary}15`,color:PROGRAM_COLORS[b.program]||colors.primary,padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.heading,fontWeight:700 }}>
                          {b.name} · {b._count.students}s
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginBottom:14,padding:"6px 10px",background:colors.warningBg,borderRadius:6,fontFamily:fonts.body,fontSize:11,color:colors.warningText }}>
                      ⚠️ No batch assigned yet
                    </div>
                  )}

                  {/* Contact + View */}
                  <div style={{ display:"flex",gap:6 }}>
                    {u.whatsapp && (
                      <a href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer"
                        style={{ padding:"7px 12px",borderRadius:8,background:"#dcfce7",color:"#166534",fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>
                        💬 WhatsApp
                      </a>
                    )}
                    {u.phone && (
                      <a href={`tel:${u.phone}`} style={{ padding:"7px 10px",borderRadius:8,background:colors.n50,color:colors.n700,border:`1px solid ${colors.n200}`,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>
                        📞
                      </a>
                    )}
                    <Link href={`/dashboard/admin/asatidha/${u.id}`} style={{ flex:1,padding:"7px",borderRadius:8,background:colors.green50,color:colors.primary,border:`1px solid ${colors.green200}`,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center" }}>
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ── TABLE VIEW ──
          <div style={{ background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 140px 80px 80px 80px 100px 90px",gap:0,padding:"10px 16px",background:colors.n50,borderBottom:`1px solid ${colors.n200}` }}>
              {["Ustadh","Batches","Students","Lessons/mo","Health","Grade","Actions"].map((h,i)=>(
                <div key={i} style={{ fontFamily:fonts.heading,fontSize:10,fontWeight:700,color:colors.n500,textAlign:i>0?"center":"left" }}>{h}</div>
              ))}
            </div>
            {filtered.map((u,idx)=>(
              <div key={u.id} style={{ display:"grid",gridTemplateColumns:"1fr 140px 80px 80px 80px 100px 90px",gap:0,padding:"12px 16px",borderBottom:idx<filtered.length-1?`1px solid ${colors.n100}`:"none",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden" }}>
                    {u.photo
                      ? <img src={u.photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                      : <span style={{ fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.primary }}>{u.name.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800 }}>{u.name}</div>
                    <div style={{ fontFamily:fonts.mono,fontSize:9,color:colors.n400 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center" }}>
                    {u.batches.slice(0,2).map(b=>(
                      <span key={b.id} style={{ background:`${PROGRAM_COLORS[b.program]||colors.primary}15`,color:PROGRAM_COLORS[b.program]||colors.primary,padding:"1px 6px",borderRadius:4,fontSize:8,fontFamily:fonts.mono,fontWeight:700 }}>{b.name}</span>
                    ))}
                    {u.batches.length > 2 && <span style={{ fontSize:9,color:colors.n400 }}>+{u.batches.length-2}</span>}
                    {u.batches.length === 0 && <span style={{ fontSize:9,color:colors.warningText }}>None</span>}
                  </div>
                </div>
                <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:13,fontWeight:700,color:colors.primary }}>{u.stats.totalStudents}</div>
                <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:12,color:colors.n600 }}>{u.stats.lessonsThisMonth}</div>
                <div style={{ textAlign:"center" }}><HealthBar score={u.stats.avgStudentHealth}/></div>
                <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:11,fontWeight:700,color:u.stats.avgGrade&&u.stats.avgGrade>=75?colors.successText:colors.warningText }}>
                  {u.stats.avgGrade !== null ? `${u.stats.avgGrade}%` : "—"}
                </div>
                <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                  <Link href={`/dashboard/admin/asatidha/${u.id}`} style={{ padding:"5px 10px",borderRadius:6,background:colors.green50,color:colors.primary,fontSize:10,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
