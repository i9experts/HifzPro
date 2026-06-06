"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";
import { MUTASHABIHAT_PAIRS, CATEGORY_INFO, DIFFICULTY_INFO } from "@/lib/mutashabihat-data";

interface Snapshot {
  totalConfusions:number; unresolved:number; resolved:number;
  resolutionRate:number; criticalCount:number; recentCount:number;
}
interface StudentStat {
  id:string; name:string; enrollmentNumber:string; batchName:string;
  total:number; unresolved:number; critical:number;
}

export default function MutashabihatAdminPage() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"dashboard"|"library"|"students">("dashboard");
  const [search,  setSearch]  = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [diffFilter,setDiffFilter]= useState(0);

  useEffect(()=>{
    fetch("/api/admin/mutashabihat")
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d.data); })
      .finally(()=>setLoading(false));
  },[]);

  const handleSignOut = async()=>{
    await fetch("/api/auth/signout",{method:"POST"});
    window.location.href="/signin";
  };

  const filteredPairs = MUTASHABIHAT_PAIRS.filter(p=>{
    if(catFilter && p.category!==catFilter) return false;
    if(diffFilter>0 && p.difficulty!==diffFilter) return false;
    if(search && !p.text1.includes(search) && !p.text2.includes(search) &&
       !p.notes.toLowerCase().includes(search.toLowerCase()) &&
       !p.difference.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const s: Snapshot = data?.snapshot || {totalConfusions:0,unresolved:0,resolved:0,resolutionRate:0,criticalCount:0,recentCount:0};

  return (
    <div style={{minHeight:"100vh", background:colors.n50}}>
      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Link href="/dashboard/admin" style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{fontFamily:fonts.display,fontSize:16,fontWeight:700,color:colors.white,lineHeight:1}}>Mutashabihat</div>
            <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.gold,opacity:0.8,letterSpacing:1}}>المتشابهات</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{padding:"6px 12px",borderRadius:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",fontFamily:fonts.heading}}>Sign Out</button>
      </nav>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px"}}>

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,${colors.deep},#0A2E1A)`,borderRadius:20,padding:"28px 32px",marginBottom:24,position:"relative",overflow:"hidden"}}>
          <svg style={{position:"absolute",right:-20,top:-20,opacity:0.05}} width="200" height="200" viewBox="0 0 80 80">
            <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="1"/>
            <polygon points="30,10 50,10 70,30 70,50 50,70 30,70 10,50 10,30" fill="none" stroke="white" strokeWidth="0.5"/>
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
            <div>
              <div style={{fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:6}}>INTELLIGENT HIFZ MODULE</div>
              <h1 style={{fontFamily:fonts.display,fontSize:"2rem",fontWeight:700,color:"white",margin:"0 0 8px"}}>Mutashabihat Intelligence</h1>
              <p style={{fontFamily:fonts.body,fontSize:13,color:"rgba(255,255,255,0.5)",margin:0,maxWidth:500,lineHeight:1.7}}>
                Track, analyse and resolve every Ayah confusion. Pre-loaded with 35+ classical Mutashabihat pairs from Islamic scholarship. Smart Manzil alerts prevent repeated mistakes.
              </p>
            </div>
            <div style={{fontFamily:"'Scheherazade New','Cormorant Garamond',serif",fontSize:28,color:colors.gold,direction:"rtl",lineHeight:1.8,opacity:0.8,textAlign:"center"}}>
              المتشابهاتُ<br/>
              <span style={{fontSize:16,opacity:0.6}}>درءُ اللَّبس عن القرآن</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[
            {icon:"📊", val:s.totalConfusions,  label:"Total Tracked",     sub:"All confusions recorded", color:colors.primary,   bg:colors.green50,   border:colors.green200},
            {icon:"⚠️", val:s.unresolved,       label:"Active / Unresolved",sub:"Needs focus",            color:s.unresolved>0?colors.warningText:colors.successText, bg:s.unresolved>0?colors.warningBg:colors.successBg, border:`${s.unresolved>0?colors.warning:colors.success}44`},
            {icon:"✅", val:`${s.resolutionRate}%`,label:"Resolution Rate", sub:"Mastered confusions",   color:s.resolutionRate>=60?colors.successText:colors.warningText,bg:s.resolutionRate>=60?colors.successBg:colors.warningBg,border:`${s.resolutionRate>=60?colors.success:colors.warning}44`},
          ].map((c,i)=>(
            <div key={i} style={{background:c.bg,borderRadius:14,padding:"18px 16px",border:`1px solid ${c.border}`,textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:6}}>{c.icon}</div>
              <div style={{fontFamily:fonts.heading,fontSize:28,fontWeight:700,color:c.color}}>{c.val}</div>
              <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:c.color,opacity:0.9,marginTop:3}}>{c.label}</div>
              <div style={{fontFamily:fonts.body,fontSize:10,color:c.color,opacity:0.6,marginTop:1}}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,background:colors.white,borderRadius:12,padding:4,border:`1px solid ${colors.n200}`,marginBottom:20}}>
          {[{id:"dashboard",label:"Dashboard"},{id:"library",label:`Reference Library (${MUTASHABIHAT_PAIRS.length})`},{id:"students",label:"Students"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?colors.primary:"transparent",color:tab===t.id?"white":colors.n500,fontFamily:fonts.heading,fontSize:12,fontWeight:600}}>{t.label}</button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          loading ? (
            <div style={{padding:48,textAlign:"center",color:colors.n400,fontFamily:fonts.body}}>Loading intelligence data...</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>

              {/* Juz confusion heatmap */}
              <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
                <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:4}}>🗺️ 30-Juz Confusion Map</div>
                <div style={{fontFamily:fonts.body,fontSize:12,color:colors.n500,marginBottom:16}}>Which Juz combinations cause the most confusion across all students</div>
                {data?.juzConfusions?.length > 0 ? (
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {data.juzConfusions.map((j: any, i: number)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:colors.primary,minWidth:80,textAlign:"center",background:colors.green50,padding:"4px 8px",borderRadius:8}}>Juz {j.pair}</div>
                        <div style={{flex:1,height:8,background:colors.n100,borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(j.count/data.juzConfusions[0].count)*100}%`,background:colors.primary,borderRadius:4,transition:"width 0.5s"}}/>
                        </div>
                        <span style={{fontFamily:fonts.mono,fontSize:11,fontWeight:700,color:colors.n600,minWidth:30}}>{j.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{textAlign:"center",padding:24,color:colors.n400,fontFamily:fonts.body,fontSize:13}}>No confusion data yet. Record student confusions via the Ustadh dashboard.</div>
                )}
              </div>

              {/* Top confused pairs */}
              {data?.topPairs?.length > 0 && (
                <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
                  <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:12}}>🔥 Most Confused Pairs — Institution-wide</div>
                  {data.topPairs.map((p: any, i: number)=>{
                    const pair = MUTASHABIHAT_PAIRS.find(x=>x.id===p.pairId);
                    return (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<data.topPairs.length-1?`1px solid ${colors.n100}`:"none"}}>
                        <div style={{width:28,height:28,borderRadius:8,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:colors.primary}}>{i+1}</span>
                        </div>
                        <div style={{flex:1}}>
                          {pair ? (
                            <>
                              <div style={{fontFamily:"'Scheherazade New',serif",fontSize:14,color:colors.n800,direction:"rtl",textAlign:"left",lineHeight:1.8}}>{pair.text1.substring(0,50)}...</div>
                              <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n500}}>{pair.difference}</div>
                            </>
                          ) : (
                            <div style={{fontFamily:fonts.mono,fontSize:11,color:colors.n600}}>{p.text}</div>
                          )}
                        </div>
                        <span style={{fontFamily:fonts.mono,fontSize:14,fontWeight:700,color:colors.errorText,background:colors.errorBg,padding:"3px 10px",borderRadius:8}}>{p.count}×</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recent confusions */}
              {data?.recentConfusions?.length > 0 && (
                <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`}}>
                  <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:12}}>⏰ Recent Confusions</div>
                  {data.recentConfusions.slice(0,8).map((c: any, i: number)=>{
                    const daysAgo = Math.floor((Date.now()-new Date(c.createdAt).getTime())/(1000*60*60*24));
                    return (
                      <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<7?`1px solid ${colors.n100}`:"none"}}>
                        <div style={{width:36,height:36,borderRadius:8,background:c.isResolved?colors.successBg:c.priority>=70?colors.errorBg:colors.warningBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{fontFamily:fonts.mono,fontSize:10,fontWeight:700,color:c.isResolved?colors.successText:c.priority>=70?colors.errorText:colors.warningText}}>
                            {c.isResolved?"✓":"!"}
                          </span>
                        </div>
                        <div style={{flex:1}}>
                          <Link href={`/dashboard/admin/mutashabihat/${c.studentId}`} style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.primary,textDecoration:"none"}}>{c.student?.name}</Link>
                          <div style={{fontFamily:fonts.mono,fontSize:9,color:colors.n400}}>
                            {c.correctSurah}:{c.correctAyah} ↔ {c.confusedWithSurah}:{c.confusedWithAyah}
                            {c.confusionCount>1&&<span style={{color:colors.errorText,marginLeft:6}}>{c.confusionCount}× confused</span>}
                          </div>
                        </div>
                        <span style={{fontFamily:fonts.body,fontSize:10,color:colors.n400}}>{daysAgo===0?"Today":daysAgo===1?"Yesterday":`${daysAgo}d ago`}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {(!data?.recentConfusions?.length && !data?.topPairs?.length) && (
                <div style={{background:colors.white,borderRadius:14,padding:48,textAlign:"center",border:`1px solid ${colors.n200}`}}>
                  <div style={{fontFamily:"'Scheherazade New',serif",fontSize:36,color:colors.gold,marginBottom:12}}>المتشابهات</div>
                  <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:colors.n700,marginBottom:8}}>No confusions recorded yet</div>
                  <div style={{fontFamily:fonts.body,fontSize:13,color:colors.n500,marginBottom:20,lineHeight:1.7,maxWidth:400,margin:"0 auto 20px"}}>
                    Asatidha can record Mutashabihat confusions during lesson entry. Browse the Reference Library to see all known Mutashabihat pairs.
                  </div>
                  <button onClick={()=>setTab("library")} style={{padding:"10px 24px",borderRadius:8,background:colors.primary,color:"white",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>Browse Library →</button>
                </div>
              )}
            </div>
          )
        )}

        {/* ── REFERENCE LIBRARY ── */}
        {tab === "library" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Library header */}
            <div style={{background:`linear-gradient(135deg,#1e1b4b,#3730a3)`,borderRadius:14,padding:"18px 24px"}}>
              <div style={{fontFamily:fonts.mono,fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:2,marginBottom:4}}>CLASSICAL SCHOLARSHIP</div>
              <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:"white",marginBottom:4}}>Mutashabihat Reference Library</div>
              <div style={{fontFamily:fonts.body,fontSize:12,color:"rgba(255,255,255,0.5)"}}>
                {MUTASHABIHAT_PAIRS.length} curated pairs from Islamic scholarship tradition — from Juz 1 to 30
              </div>
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Arabic text or notes..."
                style={{flex:1,minWidth:200,padding:"9px 12px",border:`1px solid ${colors.n200}`,borderRadius:8,fontSize:12,fontFamily:fonts.body,outline:"none"}}/>
              <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
                style={{padding:"9px 12px",border:`1px solid ${colors.n200}`,borderRadius:8,fontSize:12,fontFamily:fonts.heading,color:colors.n700,background:colors.white,outline:"none"}}>
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_INFO).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <select value={diffFilter} onChange={e=>setDiffFilter(parseInt(e.target.value))}
                style={{padding:"9px 12px",border:`1px solid ${colors.n200}`,borderRadius:8,fontSize:12,fontFamily:fonts.heading,color:colors.n700,background:colors.white,outline:"none"}}>
                <option value={0}>All Difficulties</option>
                {[1,2,3,4,5].map(d=><option key={d} value={d}>{"★".repeat(d)} {DIFFICULTY_INFO[d].label}</option>)}
              </select>
            </div>

            {/* Pairs grid */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filteredPairs.map(pair=>{
                const cat  = CATEGORY_INFO[pair.category];
                const diff = DIFFICULTY_INFO[pair.difficulty];
                return (
                  <div key={pair.id} style={{background:colors.white,borderRadius:14,padding:20,border:`1px solid ${colors.n200}`,borderLeft:`4px solid ${cat.color}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{background:`${cat.color}15`,color:cat.color,padding:"3px 10px",borderRadius:6,fontSize:10,fontFamily:fonts.heading,fontWeight:700}}>{cat.icon} {cat.label}</span>
                        <span style={{background:`${diff.color}15`,color:diff.color,padding:"3px 10px",borderRadius:6,fontSize:10,fontFamily:fonts.heading,fontWeight:700}}>{"★".repeat(pair.difficulty)} {diff.label}</span>
                      </div>
                      <div style={{display:"flex",gap:8,fontFamily:fonts.mono,fontSize:10,color:colors.n500}}>
                        <span>Juz {pair.juz1}</span>
                        <span>↔</span>
                        <span>Juz {pair.juz2}</span>
                      </div>
                    </div>

                    {/* Two Ayahs side by side */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"center",marginBottom:12}}>
                      {/* Ayah 1 */}
                      <div style={{background:colors.n50,borderRadius:10,padding:"12px 14px",border:`1px solid ${colors.n200}`}}>
                        <div style={{fontFamily:fonts.mono,fontSize:9,color:colors.n500,letterSpacing:1,marginBottom:6}}>
                          SURAH {pair.surah1} · AYAH {pair.ayah1} · JUZ {pair.juz1}
                        </div>
                        <div style={{fontFamily:"'Scheherazade New','Cormorant Garamond',serif",fontSize:18,color:colors.n800,direction:"rtl",lineHeight:1.9}}>
                          {pair.text1}
                        </div>
                      </div>
                      {/* Arrow */}
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:fonts.mono,fontSize:16,color:colors.n400}}>↔</div>
                        <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.n300}}>vs</div>
                      </div>
                      {/* Ayah 2 */}
                      <div style={{background:colors.n50,borderRadius:10,padding:"12px 14px",border:`1px solid ${colors.n200}`}}>
                        <div style={{fontFamily:fonts.mono,fontSize:9,color:colors.n500,letterSpacing:1,marginBottom:6}}>
                          SURAH {pair.surah2} · AYAH {pair.ayah2} · JUZ {pair.juz2}
                        </div>
                        <div style={{fontFamily:"'Scheherazade New','Cormorant Garamond',serif",fontSize:18,color:colors.n800,direction:"rtl",lineHeight:1.9}}>
                          {pair.text2}
                        </div>
                      </div>
                    </div>

                    {/* Difference + Notes */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div style={{padding:"8px 12px",background:`${cat.color}08`,borderRadius:8,border:`1px solid ${cat.color}22`}}>
                        <div style={{fontFamily:fonts.mono,fontSize:8,color:cat.color,letterSpacing:1,marginBottom:3}}>KEY DIFFERENCE</div>
                        <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n700,lineHeight:1.6}}>{pair.difference}</div>
                      </div>
                      <div style={{padding:"8px 12px",background:colors.n50,borderRadius:8,border:`1px solid ${colors.n200}`}}>
                        <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.n400,letterSpacing:1,marginBottom:3}}>NOTES</div>
                        <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n600,lineHeight:1.6}}>{pair.notes}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredPairs.length === 0 && (
                <div style={{background:colors.white,borderRadius:12,padding:40,textAlign:"center",border:`1px solid ${colors.n200}`}}>
                  <div style={{fontFamily:fonts.body,fontSize:14,color:colors.n400}}>No pairs match your filters</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {tab === "students" && (
          <div style={{background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${colors.n100}`,fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800}}>
              Students — Mutashabihat Status
            </div>
            {!data?.studentStats?.length ? (
              <div style={{padding:48,textAlign:"center",color:colors.n400,fontFamily:fonts.body}}>No student data yet.</div>
            ) : (data.studentStats as StudentStat[]).map((s,i)=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderBottom:i<data.studentStats.length-1?`1px solid ${colors.n100}`:"none"}}>
                <div style={{width:40,height:40,borderRadius:10,background:s.critical>0?colors.errorBg:s.unresolved>0?colors.warningBg:colors.successBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:s.critical>0?colors.errorText:s.unresolved>0?colors.warningText:colors.successText}}>{s.name.charAt(0)}</span>
                </div>
                <div style={{flex:1}}>
                  <Link href={`/dashboard/admin/mutashabihat/${s.id}`} style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary,textDecoration:"none"}}>{s.name}</Link>
                  <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n500}}>{s.batchName} · {s.enrollmentNumber}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {s.critical>0&&<span style={{background:colors.errorBg,color:colors.errorText,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>{s.critical} CRITICAL</span>}
                  {s.unresolved>0&&<span style={{background:colors.warningBg,color:colors.warningText,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>{s.unresolved} active</span>}
                  <span style={{fontFamily:fonts.body,fontSize:11,color:colors.n400}}>{s.total} total</span>
                  <Link href={`/dashboard/admin/mutashabihat/${s.id}`} style={{padding:"5px 12px",borderRadius:6,background:colors.green50,color:colors.primary,fontSize:10,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading}}>View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
