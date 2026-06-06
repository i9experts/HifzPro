"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";
import { MUTASHABIHAT_PAIRS, CATEGORY_INFO, DIFFICULTY_INFO } from "@/lib/mutashabihat-data";

interface Confusion {
  id:string; pairId:string|null;
  correctSurah:number; correctAyah:number; correctJuz:number; correctText:string|null;
  confusedWithSurah:number; confusedWithAyah:number; confusedWithJuz:number; confusedText:string|null;
  confusionCount:number; firstConfusedAt:string; lastConfusedAt:string;
  isResolved:boolean; resolvedAt:string|null; priority:number; notes:string|null;
}

export default function StudentMutashabihatPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const [data,    setData]    = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"active"|"resolved"|"manzil">("active");
  const [toast,   setToast]   = useState("");
  const [resolving, setResolving] = useState<string|null>(null);
  const [showRecord, setShowRecord] = useState(false);

  // Record new confusion form
  const [recForm, setRecForm] = useState({
    correctSurah:0, correctAyah:0, correctJuz:0,
    confusedWithSurah:0, confusedWithAyah:0, confusedWithJuz:0,
    pairId:"", notes:"",
  });
  const [recSaving, setRecSaving] = useState(false);

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const fetchData = () => {
    Promise.all([
      fetch(`/api/students/${studentId}/mutashabihat`).then(r=>r.json()),
      fetch(`/api/admin/students/${studentId}`).then(r=>r.json()).catch(()=>({success:false})),
    ]).then(([mData, sData]) => {
      if (mData.success) setData(mData.data);
      if (sData.success) setStudent(sData.data?.student);
    }).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[studentId]);

  const handleResolve = async(confusionId:string, resolve:boolean) => {
    setResolving(confusionId);
    try {
      const res = await fetch(`/api/students/${studentId}/mutashabihat`,{
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({confusionId, resolve}),
      });
      const d = await res.json();
      if (d.success) { showToast(resolve?"✅ Marked as resolved!":"⚠️ Marked as active"); fetchData(); }
    } finally { setResolving(null); }
  };

  const handleRecord = async() => {
    if(!recForm.correctSurah||!recForm.correctAyah||!recForm.confusedWithSurah||!recForm.confusedWithAyah) { showToast("⚠️ Fill in both Ayah references"); return; }
    setRecSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}/mutashabihat`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...recForm, correctJuz:recForm.correctJuz||1, confusedWithJuz:recForm.confusedWithJuz||1, pairId:recForm.pairId||undefined}),
      });
      const d = await res.json();
      if(d.success){ showToast(d.data.isRepeat?`⚠️ Repeated confusion! ${d.data.newCount}× total`:"✅ Confusion recorded"); setShowRecord(false); fetchData(); }
    } finally { setRecSaving(false); }
  };

  if(loading) return <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontFamily:fonts.body,color:"rgba(255,255,255,0.4)"}}>Loading...</div></div>;

  const confusions: Confusion[] = data?.confusions || [];
  const stats = data?.stats || {};
  const manzilAlerts: Confusion[] = data?.manzilAlerts || [];
  const active   = confusions.filter(c=>!c.isResolved);
  const resolved = confusions.filter(c=>c.isResolved);

  const inp = {width:"100%",padding:"9px 11px",border:`1.5px solid ${colors.n200}`,borderRadius:7,fontSize:12,fontFamily:fonts.body,color:colors.n800,background:colors.white,outline:"none"};

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:colors.n800,color:"white",padding:"10px 20px",borderRadius:10,fontFamily:fonts.heading,fontSize:13,zIndex:999,boxShadow:"0 4px 16px rgba(0,0,0,0.3)"}}>{toast}</div>}

      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Link href="/dashboard/admin/mutashabihat" style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div>
          <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.white,lineHeight:1}}>{student?.name || "Student"} — Mutashabihat</div>
          <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.gold,opacity:0.8}}>المتشابهات الشخصية</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          <button onClick={()=>setShowRecord(!showRecord)} style={{padding:"7px 16px",borderRadius:8,background:colors.gold,border:"none",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>
            + Record Confusion
          </button>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px"}}>

        {/* Student header */}
        <div style={{background:`linear-gradient(135deg,${colors.deep},${colors.primary})`,borderRadius:16,padding:20,marginBottom:20,display:"flex",alignItems:"center",gap:16,position:"relative",overflow:"hidden"}}>
          <svg style={{position:"absolute",right:-20,top:-20,opacity:0.06}} width="120" height="120" viewBox="0 0 80 80">
            <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
          <div style={{width:54,height:54,borderRadius:14,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
            {student?.photo
              ? <img src={student.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span style={{fontFamily:fonts.display,fontSize:22,fontWeight:700,color:"white"}}>{student?.name?.charAt(0)||"?"}</span>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:fonts.heading,fontSize:18,fontWeight:700,color:"white"}}>{student?.name||studentId}</div>
            <div style={{fontFamily:fonts.body,fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>
              {student?.enrollmentNumber} · Juz {student?.progress?.currentJuz||"—"}
            </div>
          </div>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[
              {val:stats.total||0,     label:"Total",    color:"white"},
              {val:stats.unresolved||0,label:"Active",   color:stats.unresolved>0?"#fca5a5":"#4ade80"},
              {val:`${stats.resolutionRate||0}%`,label:"Resolved",color:"#4ade80"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 12px"}}>
                <div style={{fontFamily:fonts.heading,fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
                <div style={{fontFamily:fonts.body,fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Manzil alert banner */}
        {manzilAlerts.length > 0 && (
          <div style={{background:"#fef2f2",borderRadius:12,padding:"14px 18px",border:"2px solid #fca5a5",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:24}}>🔔</span>
            <div>
              <div style={{fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:"#991b1b"}}>
                Manzil Alert — {manzilAlerts.length} unresolved confusion{manzilAlerts.length>1?"s":""} in upcoming Juz!
              </div>
              <div style={{fontFamily:fonts.body,fontSize:11,color:"#dc2626",marginTop:2}}>
                Student has known confusions in Juz they will soon recite during Manzil. Review before the session.
              </div>
              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                {manzilAlerts.map(a=>(
                  <span key={a.id} style={{background:"#fecaca",color:"#991b1b",padding:"2px 8px",borderRadius:5,fontSize:10,fontFamily:fonts.mono,fontWeight:700}}>
                    {a.correctSurah}:{a.correctAyah} ↔ {a.confusedWithSurah}:{a.confusedWithAyah}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Record new confusion form */}
        {showRecord && (
          <div style={{background:colors.white,borderRadius:14,padding:20,border:`2px solid ${colors.gold}`,marginBottom:16}}>
            <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:14}}>📝 Record New Confusion</div>

            {/* Quick select from library */}
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:4}}>Select from Known Pairs (optional)</label>
              <select value={recForm.pairId} onChange={e=>{
                const pair = MUTASHABIHAT_PAIRS.find(p=>p.id===e.target.value);
                if(pair) setRecForm(f=>({...f,pairId:pair.id,correctSurah:pair.surah1,correctAyah:pair.ayah1,correctJuz:pair.juz1,confusedWithSurah:pair.surah2,confusedWithAyah:pair.ayah2,confusedWithJuz:pair.juz2}));
                else setRecForm(f=>({...f,pairId:e.target.value}));
              }} style={{...inp}}>
                <option value="">— Or enter manually below —</option>
                {MUTASHABIHAT_PAIRS.map(p=>(
                  <option key={p.id} value={p.id}>
                    {p.surah1}:{p.ayah1} (Juz {p.juz1}) ↔ {p.surah2}:{p.ayah2} (Juz {p.juz2}) — {p.notes.substring(0,40)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:12,alignItems:"end",marginBottom:12}}>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:colors.primary,marginBottom:4}}>Correct Ayah (what they should say)</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[{label:"Surah",key:"correctSurah"},{label:"Ayah",key:"correctAyah"},{label:"Juz",key:"correctJuz"}].map(f=>(
                    <div key={f.key}>
                      <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.n500,marginBottom:2}}>{f.label}</div>
                      <input type="number" value={(recForm as any)[f.key]||""} onChange={e=>setRecForm(x=>({...x,[f.key]:parseInt(e.target.value)||0}))} min={1} style={{...inp}}/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{textAlign:"center",paddingBottom:8}}>
                <div style={{fontFamily:fonts.mono,fontSize:20,color:colors.n400}}>↔</div>
                <div style={{fontFamily:fonts.body,fontSize:10,color:colors.n400}}>confused with</div>
              </div>
              <div>
                <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:700,color:colors.errorText,marginBottom:4}}>Confused With (what they said instead)</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[{label:"Surah",key:"confusedWithSurah"},{label:"Ayah",key:"confusedWithAyah"},{label:"Juz",key:"confusedWithJuz"}].map(f=>(
                    <div key={f.key}>
                      <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.n500,marginBottom:2}}>{f.label}</div>
                      <input type="number" value={(recForm as any)[f.key]||""} onChange={e=>setRecForm(x=>({...x,[f.key]:parseInt(e.target.value)||0}))} min={1} style={{...inp}}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontFamily:fonts.heading,fontSize:11,fontWeight:600,color:colors.n700,marginBottom:4}}>Ustadh Notes</label>
              <input value={recForm.notes} onChange={e=>setRecForm(f=>({...f,notes:e.target.value}))} placeholder="Any specific notes about this confusion..." style={inp}/>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowRecord(false)} style={{flex:1,padding:"10px",borderRadius:8,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,cursor:"pointer",fontFamily:fonts.heading,fontSize:12}}>Cancel</button>
              <button onClick={handleRecord} disabled={recSaving} style={{flex:2,padding:"10px",borderRadius:8,background:recSaving?colors.n300:colors.gold,color:"white",border:"none",cursor:recSaving?"not-allowed":"pointer",fontFamily:fonts.heading,fontSize:12,fontWeight:700}}>
                {recSaving?"Saving...":"Record Confusion"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",gap:6,background:colors.white,borderRadius:10,padding:3,border:`1px solid ${colors.n200}`,marginBottom:16}}>
          {[
            {id:"active",   label:`Active (${active.length})`},
            {id:"manzil",   label:`Manzil Alerts (${manzilAlerts.length})`},
            {id:"resolved", label:`Resolved (${resolved.length})`},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id as any)} style={{flex:1,padding:"9px",borderRadius:7,border:"none",cursor:"pointer",background:tab===t.id?colors.primary:"transparent",color:tab===t.id?"white":colors.n500,fontFamily:fonts.heading,fontSize:12,fontWeight:600}}>{t.label}</button>
          ))}
        </div>

        {/* Confusion cards */}
        {(() => {
          const list = tab==="active"?active:tab==="resolved"?resolved:manzilAlerts;
          if(list.length===0) return (
            <div style={{background:colors.white,borderRadius:12,padding:40,textAlign:"center",border:`1px solid ${colors.n200}`}}>
              <div style={{fontSize:36,marginBottom:10}}>{tab==="resolved"?"🎉":"📖"}</div>
              <div style={{fontFamily:fonts.heading,fontSize:14,color:colors.n700}}>{tab==="resolved"?"No resolved confusions yet":"No active confusions"}</div>
              {tab==="active"&&<button onClick={()=>setShowRecord(true)} style={{marginTop:14,padding:"9px 20px",borderRadius:8,background:colors.gold,color:"white",border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:fonts.heading}}>+ Record First Confusion</button>}
            </div>
          );
          return (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {list.map(c=>{
                const pair    = c.pairId ? MUTASHABIHAT_PAIRS.find(p=>p.id===c.pairId) : null;
                const cat     = pair ? CATEGORY_INFO[pair.category] : null;
                const daysSinceFirst = Math.floor((Date.now()-new Date(c.firstConfusedAt).getTime())/(1000*60*60*24));
                const priorityColor  = c.priority>=70?colors.errorText:c.priority>=40?colors.warningText:colors.successText;
                const priorityBg     = c.priority>=70?colors.errorBg:c.priority>=40?colors.warningBg:colors.successBg;

                return (
                  <div key={c.id} style={{background:colors.white,borderRadius:12,overflow:"hidden",border:`1px solid ${c.isResolved?colors.n200:c.priority>=70?`${colors.error}55`:colors.n200}`,borderLeft:`4px solid ${c.isResolved?colors.n300:c.priority>=70?colors.error:c.priority>=40?colors.warning:colors.success}`}}>
                    <div style={{padding:"14px 16px"}}>
                      {/* Header */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:6}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                          {!c.isResolved&&<span style={{background:priorityBg,color:priorityColor,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>
                            {c.priority>=70?"🔴 CRITICAL":c.priority>=40?"🟡 IMPORTANT":"🟢 MONITOR"}
                          </span>}
                          {c.isResolved&&<span style={{background:colors.successBg,color:colors.successText,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>✓ RESOLVED</span>}
                          {cat&&<span style={{background:`${cat.color}15`,color:cat.color,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.heading,fontWeight:700}}>{cat.icon} {cat.label}</span>}
                          {c.confusionCount>1&&<span style={{background:colors.errorBg,color:colors.errorText,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700}}>{c.confusionCount}× confused</span>}
                        </div>
                        <span style={{fontFamily:fonts.mono,fontSize:9,color:colors.n400}}>{daysSinceFirst}d tracked</span>
                      </div>

                      {/* Ayah pair */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:c.notes?10:0}}>
                        <div style={{background:`${colors.primary}08`,borderRadius:8,padding:"10px 12px"}}>
                          <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.primary,letterSpacing:1,marginBottom:4}}>CORRECT — SURAH {c.correctSurah}:{c.correctAyah} · JUZ {c.correctJuz}</div>
                          {c.correctText ? (
                            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:16,color:colors.n800,direction:"rtl",lineHeight:1.9}}>{c.correctText}</div>
                          ) : (
                            <div style={{fontFamily:fonts.mono,fontSize:12,color:colors.primary,fontWeight:700}}>Surah {c.correctSurah} · Ayah {c.correctAyah}</div>
                          )}
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:fonts.mono,fontSize:18,color:colors.errorText}}>↔</div>
                        </div>
                        <div style={{background:colors.errorBg,borderRadius:8,padding:"10px 12px"}}>
                          <div style={{fontFamily:fonts.mono,fontSize:8,color:colors.errorText,letterSpacing:1,marginBottom:4}}>CONFUSED WITH — SURAH {c.confusedWithSurah}:{c.confusedWithAyah} · JUZ {c.confusedWithJuz}</div>
                          {c.confusedText ? (
                            <div style={{fontFamily:"'Scheherazade New',serif",fontSize:16,color:colors.n800,direction:"rtl",lineHeight:1.9}}>{c.confusedText}</div>
                          ) : (
                            <div style={{fontFamily:fonts.mono,fontSize:12,color:colors.errorText,fontWeight:700}}>Surah {c.confusedWithSurah} · Ayah {c.confusedWithAyah}</div>
                          )}
                        </div>
                      </div>

                      {/* Pair notes if available */}
                      {pair && (
                        <div style={{marginTop:8,padding:"7px 10px",background:colors.n50,borderRadius:7,fontFamily:fonts.body,fontSize:11,color:colors.n600}}>
                          <strong>Key difference:</strong> {pair.difference}
                        </div>
                      )}

                      {c.notes && (
                        <div style={{marginTop:6,padding:"7px 10px",background:`${colors.gold}12`,borderRadius:7,fontFamily:fonts.body,fontSize:11,color:colors.n700}}>
                          <strong>Note:</strong> {c.notes}
                        </div>
                      )}
                    </div>

                    {/* Action footer */}
                    <div style={{padding:"10px 16px",background:colors.n50,borderTop:`1px solid ${colors.n100}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontFamily:fonts.mono,fontSize:9,color:colors.n400}}>
                        {c.isResolved
                          ? `Resolved ${c.resolvedAt?new Date(c.resolvedAt).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}):""}`
                          : `Last confused: ${new Date(c.lastConfusedAt).toLocaleDateString("en-PK",{day:"numeric",month:"short"})}`}
                      </span>
                      <button onClick={()=>handleResolve(c.id,!c.isResolved)} disabled={resolving===c.id}
                        style={{padding:"5px 14px",borderRadius:7,border:"none",cursor:resolving===c.id?"not-allowed":"pointer",fontFamily:fonts.heading,fontSize:11,fontWeight:700,
                          background:c.isResolved?colors.warningBg:colors.successBg,
                          color:c.isResolved?colors.warningText:colors.successText}}>
                        {resolving===c.id?"...":(c.isResolved?"↩ Mark Active":"✓ Mark Resolved")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
