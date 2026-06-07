"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const TEST_TYPES: Record<string,{label:string;labelUr:string;icon:string;color:string}> = {
  SABAQ_TEST:      { label:"Sabaq Test",       labelUr:"سبق ٹیسٹ",     icon:"📖", color:colors.primary },
  SABQI_TEST:      { label:"Sabqi Test",        labelUr:"سبقی ٹیسٹ",    icon:"📚", color:"#0369a1" },
  PARA_TEST:       { label:"Para Test",         labelUr:"پارہ ٹیسٹ",    icon:"📋", color:"#7c3aed" },
  NUSS_TEST:       { label:"15 Para Test",      labelUr:"نصف ٹیسٹ",     icon:"📑", color:"#b45309" },
  TARTEEB_TEST:    { label:"Tarteebi Test",     labelUr:"ترتیبی ٹیسٹ",  icon:"🔀", color:"#0f766e" },
  FULL_QURAN_TEST: { label:"Full Quran Test",   labelUr:"مکمل قرآن",    icon:"🏆", color:colors.gold },
  GIRDAAN_TEST:    { label:"Girdaan Test",      labelUr:"گردان ٹیسٹ",   icon:"🔄", color:"#6d28d9" },
};

const RESULT_INFO: Record<string,{label:string;color:string;bg:string;icon:string}> = {
  PASS:             { label:"Pass",             color:colors.successText, bg:colors.successBg,  icon:"✅" },
  CONDITIONAL_PASS: { label:"Conditional",      color:colors.warningText, bg:colors.warningBg,  icon:"⚠️" },
  FAIL:             { label:"Fail",             color:colors.errorText,   bg:colors.errorBg,    icon:"❌" },
};

interface TestRecord {
  id:string; testType:string; date:string; result:string|null; score:number|null;
  mistakeCount:number; juzFrom:number|null; juzTo:number|null; notes:string|null;
  student:{ id:string; name:string; enrollmentNumber:string; photo:string|null };
  examiner:{ user:{ name:string } };
}

export default function AdminTestsPage() {
  const [tests,   setTests]   = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState<any>(null);
  const [filter,  setFilter]  = useState({ type:"", result:"", search:"" });

  useEffect(() => {
    fetch("/api/admin/tests")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTests(d.data.tests || []);
          setStats(d.data.stats || null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = tests.filter(t => {
    if (filter.type   && t.testType !== filter.type)   return false;
    if (filter.result && t.result   !== filter.result) return false;
    if (filter.search && !t.student.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method:"POST" });
    window.location.href = "/signin";
  };

  // 30-Para board
  const ParaBoard = () => {
    const paraCounts: Record<number,{pass:number;fail:number}> = {};
    tests.forEach(t => {
      if (t.juzFrom && t.juzTo) {
        for (let j = t.juzFrom; j <= t.juzTo; j++) {
          if (!paraCounts[j]) paraCounts[j] = { pass:0, fail:0 };
          if (t.result === "PASS") paraCounts[j].pass++;
          else if (t.result === "FAIL") paraCounts[j].fail++;
        }
      }
    });
    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
        {Array.from({length:30},(_,i) => {
          const juz  = i+1;
          const data = paraCounts[juz];
          const bg   = !data ? colors.n100 : data.fail > 0 ? colors.errorBg : data.pass > 0 ? colors.successBg : colors.n100;
          const color= !data ? colors.n300 : data.fail > 0 ? colors.errorText : colors.successText;
          return (
            <div key={juz} title={`Juz ${juz}${data?`: ${data.pass}✅ ${data.fail}❌`:""}`}
              style={{ aspectRatio:"1", borderRadius:8, background:bg, border:`1px solid ${color}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
              <span style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:700, color }}>{juz}</span>
              {data && <span style={{ fontSize:8, color }}>{data.pass}✓</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"white",fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:"white", lineHeight:1 }}>Tests & Assessment</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, letterSpacing:1 }}>نتائج الامتحانات</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{ padding:"6px 12px",borderRadius:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer" }}>Sign Out</button>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>TEST & ASSESSMENT</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>Tests & Assessment</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>All test records — 7 types, results, scores, and 30-Para visual board</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {[
              { icon:"📝", val:stats.total||0,      label:"Total Tests",    color:colors.primary, bg:colors.green50,   border:colors.green200 },
              { icon:"✅", val:stats.passed||0,     label:"Passed",         color:colors.successText, bg:colors.successBg, border:`${colors.success}44` },
              { icon:"❌", val:stats.failed||0,     label:"Failed",         color:colors.errorText, bg:colors.errorBg,   border:`${colors.error}44` },
              { icon:"📊", val:stats.avgScore?`${Math.round(stats.avgScore)}%`:"—", label:"Avg Score", color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
            ].map((s,i)=>(
              <div key={i} style={{ background:s.bg, borderRadius:14, padding:"16px 14px", border:`1px solid ${s.border}`, textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:fonts.heading, fontSize:24, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:s.color, opacity:0.8, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>

          {/* Left — test list */}
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              <input value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} placeholder="Search student..."
                style={{ flex:1, minWidth:160, padding:"9px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, outline:"none" }}/>
              <select value={filter.type} onChange={e=>setFilter(f=>({...f,type:e.target.value}))}
                style={{ padding:"9px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.heading, color:colors.n700, outline:"none", background:"white" }}>
                <option value="">All Types</option>
                {Object.entries(TEST_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
              <select value={filter.result} onChange={e=>setFilter(f=>({...f,result:e.target.value}))}
                style={{ padding:"9px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.heading, color:colors.n700, outline:"none", background:"white" }}>
                <option value="">All Results</option>
                <option value="PASS">✅ Pass</option>
                <option value="CONDITIONAL_PASS">⚠️ Conditional</option>
                <option value="FAIL">❌ Fail</option>
              </select>
            </div>

            {/* Records */}
            <div style={{ background:"white", borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
              {loading ? (
                <div style={{ padding:48, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading tests...</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:16, fontWeight:700, color:colors.n700, marginBottom:8 }}>No tests recorded yet</div>
                  <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400 }}>Tests are recorded by Asatidha from the Ustadh dashboard</div>
                </div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 80px 70px 70px", padding:"10px 16px", background:colors.n50, borderBottom:`1px solid ${colors.n200}` }}>
                    {["Student","Test Type","Result","Score","Date"].map((h,i)=>(
                      <div key={i} style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.n500, textAlign:i>0?"center":"left" }}>{h}</div>
                    ))}
                  </div>
                  {filtered.map((t,i)=>{
                    const tt = TEST_TYPES[t.testType] || { label:t.testType, icon:"📝", color:colors.primary };
                    const ri = t.result ? (RESULT_INFO[t.result] || RESULT_INFO.FAIL) : null;
                    const daysAgo = Math.floor((Date.now()-new Date(t.date).getTime())/(86400000));
                    return (
                      <div key={t.id} style={{ display:"grid", gridTemplateColumns:"1fr 120px 80px 70px 70px", padding:"11px 16px", borderBottom:i<filtered.length-1?`1px solid ${colors.n100}`:"none", alignItems:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:34,height:34,borderRadius:9,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <span style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary }}>{t.student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <Link href={`/dashboard/admin/students/${t.student.id}`} style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.primary,textDecoration:"none" }}>{t.student.name}</Link>
                            <div style={{ fontFamily:fonts.mono,fontSize:9,color:colors.n400 }}>
                              {t.student.enrollmentNumber}
                              {t.juzFrom&&` · Juz ${t.juzFrom}${t.juzTo&&t.juzTo!==t.juzFrom?`–${t.juzTo}`:""}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <span style={{ fontSize:14 }}>{tt.icon}</span>
                          <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n500 }}>{tt.label}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          {ri
                            ? <span style={{ background:ri.bg,color:ri.color,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>{ri.icon} {ri.label}</span>
                            : <span style={{ color:colors.n300,fontFamily:fonts.mono,fontSize:11 }}>—</span>
                          }
                        </div>
                        <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:t.score?colors.primary:colors.n300 }}>
                          {t.score?`${t.score}%`:"—"}
                        </div>
                        <div style={{ textAlign:"center",fontFamily:fonts.body,fontSize:10,color:colors.n400 }}>
                          {daysAgo===0?"Today":daysAgo===1?"Yesterday":`${daysAgo}d ago`}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Right — 30-Para board + type breakdown */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* 30-Para board */}
            <div style={{ background:"white", borderRadius:14, padding:20, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:4 }}>📿 30-Para Board</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginBottom:14 }}>Tests by Juz — green = passed, red = failed</div>
              <ParaBoard/>
              <div style={{ display:"flex", gap:12, marginTop:12 }}>
                {[{color:colors.successBg,textColor:colors.successText,label:"Tests Passed"},{color:colors.errorBg,textColor:colors.errorText,label:"Tests Failed"},{color:colors.n100,textColor:colors.n400,label:"Not Tested"}].map((l,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <div style={{ width:10,height:10,borderRadius:2,background:l.color,border:`1px solid ${l.textColor}44` }}/>
                    <span style={{ fontFamily:fonts.body,fontSize:9,color:colors.n500 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test type breakdown */}
            <div style={{ background:"white", borderRadius:14, padding:20, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:14 }}>📊 Tests by Type</div>
              {Object.entries(TEST_TYPES).map(([key,tt])=>{
                const count = tests.filter(t=>t.testType===key).length;
                const pct   = tests.length > 0 ? Math.round((count/tests.length)*100) : 0;
                return (
                  <div key={key} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontFamily:fonts.body,fontSize:11,color:colors.n600 }}>{tt.icon} {tt.label}</span>
                      <span style={{ fontFamily:fonts.mono,fontSize:10,fontWeight:700,color:tt.color }}>{count}</span>
                    </div>
                    <div style={{ height:4,background:colors.n100,borderRadius:2,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${pct}%`,background:tt.color,borderRadius:2 }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info box */}
            <div style={{ background:colors.green50, borderRadius:12, padding:16, border:`1px solid ${colors.green200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary, marginBottom:6 }}>ℹ️ How Tests Work</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n600, lineHeight:1.7 }}>
                Tests are recorded by Asatidha from the <strong>Ustadh Dashboard</strong>. Results are automatically sent to parents via WhatsApp.
              </div>
              <Link href="/dashboard/ustadh/tests" style={{ display:"inline-block",marginTop:10,padding:"6px 12px",borderRadius:7,background:colors.primary,color:"white",fontSize:11,fontWeight:700,textDecoration:"none" }}>
                Go to Ustadh Tests →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
