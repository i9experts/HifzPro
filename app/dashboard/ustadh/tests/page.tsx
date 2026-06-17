"use client";
// app/dashboard/ustadh/tests/page.tsx
// Ustadh-facing Test recording — simplified version of admin Tests page.
// Pick student → test type → result → submit. Auto-WhatsApp to parent
// (respects institution's sendOnTest toggle, handled server-side).

import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id: string; name: string; enrollmentNumber: string; photo: string | null;
  progress: { currentJuz: number; currentPage: number } | null;
  batch: { name: string } | null;
}

interface TestRecordRow {
  id: string; testType: string; date: string; result: string | null;
  score: number | null; mistakeCount: number;
  juzFrom: number | null; juzTo: number | null;
  student: { id: string; name: string; enrollmentNumber: string; photo: string | null };
}

const TEST_TYPES: Record<string,{label:string;labelUr:string;icon:string;color:string}> = {
  SABAQ_TEST:      { label:"Sabaq Test",      labelUr:"سبق ٹیسٹ",    icon:"📖", color:colors.primary },
  SABQI_TEST:      { label:"Sabqi Test",      labelUr:"سبقی ٹیسٹ",   icon:"📚", color:"#0369a1" },
  PARA_TEST:       { label:"Para Test",       labelUr:"پارہ ٹیسٹ",   icon:"📋", color:"#7c3aed" },
  NUSS_TEST:       { label:"15 Para Test",    labelUr:"نصف ٹیسٹ",    icon:"📑", color:"#b45309" },
  TARTEEB_TEST:    { label:"Tarteebi Test",   labelUr:"ترتیبی ٹیسٹ", icon:"🔀", color:"#0f766e" },
  FULL_QURAN_TEST: { label:"Full Quran Test", labelUr:"مکمل قرآن",   icon:"🏆", color:colors.gold },
  GIRDAAN_TEST:    { label:"Girdaan Test",    labelUr:"گردان ٹیسٹ",  icon:"🔄", color:"#6d28d9" },
};

const RESULT_OPTIONS: { id: string; label: string; icon: string; color: string; bg: string }[] = [
  { id: "PASS",             label: "Pass",        icon: "✅", color: colors.successText, bg: colors.successBg },
  { id: "CONDITIONAL_PASS", label: "Conditional", icon: "⚠️", color: colors.warningText, bg: colors.warningBg },
  { id: "FAIL",             label: "Fail",         icon: "❌", color: colors.errorText,   bg: colors.errorBg },
];

export default function UstadhTestsPage() {
  const [students,   setStudents]   = useState<Student[]>([]);
  const [recentTests,setRecentTests]= useState<TestRecordRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState<"form" | "history">("form");

  const [studentId,  setStudentId]  = useState("");
  const [testType,   setTestType]   = useState("SABAQ_TEST");
  const [juzFrom,    setJuzFrom]    = useState<number | "">("");
  const [juzTo,      setJuzTo]      = useState<number | "">("");
  const [result,     setResultVal]  = useState("PASS");
  const [score,      setScore]      = useState<number | "">("");
  const [mistakeCount,setMistakeCount] = useState(0);
  const [notes,      setNotes]      = useState("");

  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/ustadh/students").then(r=>r.json()),
      fetch("/api/ustadh/tests?limit=20").then(r=>r.json()),
    ]).then(([studD, testD]) => {
      const sJson = studD?.data ?? studD;
      const tJson = testD?.data ?? testD;
      setStudents(sJson?.students ?? []);
      setRecentTests(tJson?.tests ?? []);
    }).catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const selectedStudent = students.find(s => s.id === studentId);

  const resetForm = () => {
    setStudentId(""); setTestType("SABAQ_TEST");
    setJuzFrom(""); setJuzTo(""); setResultVal("PASS");
    setScore(""); setMistakeCount(0); setNotes("");
  };

  const handleSubmit = async () => {
    if (!studentId) { setError("Please select a student"); return; }
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/ustadh/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId, testType,
          juzFrom: juzFrom === "" ? undefined : Number(juzFrom),
          juzTo:   juzTo   === "" ? undefined : Number(juzTo),
          result, score: score === "" ? undefined : Number(score),
          mistakeCount, notes: notes || undefined,
        }),
      });
      const json = await res.json();
      const data = json?.data ?? json;
      if (!res.ok) {
        setError(json?.error || "Failed to save test");
      } else {
        setSaved(true);
        setRecentTests(prev => [data.test, ...prev]);
        resetForm();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <HifzMark size={56} primary="#10B981" gold={colors.gold}/>
        <div style={{ fontFamily:fonts.body, color:"rgba(255,255,255,0.4)", marginTop:16 }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link href="/dashboard/ustadh" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"white",fontSize:16 }}>←</Link>
          <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:15, fontWeight:700, color:"white", lineHeight:1 }}>Tests & Assessment</div>
            <div style={{ fontSize:8, letterSpacing:1.5, color:colors.gold, fontFamily:fonts.mono, opacity:0.8 }}>امتحان ریکارڈ</div>
          </div>
        </div>
        <button onClick={handleSignOut} style={{ padding:"6px 12px", borderRadius:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, background:colors.white, borderRadius:12, padding:4, border:`1px solid ${colors.n200}`, marginBottom:20 }}>
          {[
            { id:"form",    label:"📝 Record Test" },
            { id:"history", label:`📋 My Tests (${recentTests.length})` },
          ].map(t=>(
            <button key={t.id} onClick={()=>setView(t.id as any)} style={{
              flex:1, padding:"10px", borderRadius:10, border:"none", cursor:"pointer",
              background: view===t.id ? colors.primary : "transparent",
              color: view===t.id ? "white" : colors.n500,
              fontFamily:fonts.heading, fontSize:13, fontWeight:600, transition:"all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── FORM VIEW ── */}
        {view === "form" && (
          <div style={{ background:colors.white, borderRadius:16, padding:24, border:`1px solid ${colors.n200}` }}>

            {saved && (
              <div style={{ background:colors.successBg, borderRadius:10, padding:"12px 16px", marginBottom:16, textAlign:"center" }}>
                <span style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:600, color:colors.successText }}>
                  ✓ Test recorded! WhatsApp sent to parent (if enabled).
                </span>
              </div>
            )}
            {error && (
              <div style={{ background:colors.errorBg, borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
                <span style={{ fontFamily:fonts.body, fontSize:13, color:colors.errorText }}>⚠ {error}</span>
              </div>
            )}

            {/* Student picker */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>
                Select Student <span style={{ color:colors.error }}>*</span>
              </label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxHeight:220, overflowY:"auto" }}>
                {students.map(s => (
                  <button key={s.id} onClick={()=>setStudentId(s.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
                      borderRadius:10, cursor:"pointer", textAlign:"left",
                      border:`2px solid ${studentId===s.id ? colors.primary : colors.n200}`,
                      background: studentId===s.id ? colors.green50 : "white",
                    }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:colors.green50, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                      {s.photo ? <img src={s.photo} style={{ width:30, height:30, objectFit:"cover" }} alt=""/> : <span style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary }}>{s.name.charAt(0)}</span>}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:colors.n800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</div>
                      <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400 }}>{s.progress ? `Juz ${s.progress.currentJuz}` : s.enrollmentNumber}</div>
                    </div>
                  </button>
                ))}
                {students.length === 0 && (
                  <div style={{ gridColumn:"1/-1", textAlign:"center", padding:20, color:colors.n400, fontFamily:fonts.body, fontSize:12 }}>
                    No students assigned to your batch yet.
                  </div>
                )}
              </div>
            </div>

            {/* Test type */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>Test Type</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {Object.entries(TEST_TYPES).map(([key, tt]) => (
                  <button key={key} onClick={()=>setTestType(key)}
                    style={{
                      padding:"10px 8px", borderRadius:10, cursor:"pointer", textAlign:"left",
                      border:`2px solid ${testType===key ? tt.color : colors.n200}`,
                      background: testType===key ? `${tt.color}10` : "white",
                    }}>
                    <span style={{ fontSize:16 }}>{tt.icon}</span>
                    <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color: testType===key ? tt.color : colors.n700, marginTop:2 }}>{tt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Juz range */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Juz From</label>
                <input type="number" min={1} max={30} value={juzFrom} onChange={e=>setJuzFrom(e.target.value===""?"":parseInt(e.target.value))} style={inp}/>
              </div>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Juz To</label>
                <input type="number" min={1} max={30} value={juzTo} onChange={e=>setJuzTo(e.target.value===""?"":parseInt(e.target.value))} style={inp}/>
              </div>
            </div>

            {/* Result */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>Result</label>
              <div style={{ display:"flex", gap:8 }}>
                {RESULT_OPTIONS.map(r => (
                  <button key={r.id} onClick={()=>setResultVal(r.id)}
                    style={{
                      flex:1, padding:"12px 0", borderRadius:10, cursor:"pointer", textAlign:"center",
                      border:`2px solid ${result===r.id ? r.color : colors.n200}`,
                      background: result===r.id ? r.bg : "white",
                    }}>
                    <div style={{ fontSize:18 }}>{r.icon}</div>
                    <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color: result===r.id ? r.color : colors.n600, marginTop:2 }}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Score & mistakes */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Score (%)</label>
                <input type="number" min={0} max={100} value={score} onChange={e=>setScore(e.target.value===""?"":parseInt(e.target.value))} placeholder="e.g. 85" style={inp}/>
              </div>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Mistake Count</label>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <button onClick={()=>setMistakeCount(m=>Math.max(0,m-1))} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${colors.n200}`, background:colors.n50, cursor:"pointer", fontSize:16 }}>−</button>
                  <div style={{ flex:1, textAlign:"center", fontFamily:fonts.heading, fontSize:16, fontWeight:700, color:colors.primary }}>{mistakeCount}</div>
                  <button onClick={()=>setMistakeCount(m=>m+1)} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${colors.n200}`, background:colors.n50, cursor:"pointer", fontSize:16 }}>+</button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Notes (optional)</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Any remarks about this test..." style={{...inp, resize:"none"}}/>
            </div>

            <button onClick={handleSubmit} disabled={saving || !studentId}
              style={{
                width:"100%", padding:"14px 0", borderRadius:10, border:"none",
                background: saving || !studentId ? colors.n300 : colors.primary,
                color:"white", fontSize:14, fontWeight:700, cursor: saving || !studentId ? "not-allowed" : "pointer",
                fontFamily:fonts.heading,
              }}>
              {saving ? "Saving…" : selectedStudent ? `Submit Test for ${selectedStudent.name}` : "Select a Student First"}
            </button>
          </div>
        )}

        {/* ── HISTORY VIEW ── */}
        {view === "history" && (
          <div style={{ background:colors.white, borderRadius:16, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
            {recentTests.length === 0 ? (
              <div style={{ padding:48, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
                <div style={{ fontFamily:fonts.heading, fontSize:14, color:colors.n700 }}>No tests recorded yet</div>
              </div>
            ) : (
              recentTests.map((t, i) => {
                const tt = TEST_TYPES[t.testType] || { label:t.testType, icon:"📝", color:colors.primary };
                const ri = t.result ? RESULT_OPTIONS.find(r=>r.id===t.result) : null;
                return (
                  <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderBottom: i<recentTests.length-1 ? `1px solid ${colors.n100}` : "none" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${tt.color}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:16 }}>{tt.icon}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800 }}>{t.student.name}</div>
                      <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400 }}>
                        {tt.label}{t.juzFrom && ` · Juz ${t.juzFrom}${t.juzTo && t.juzTo!==t.juzFrom ? `–${t.juzTo}` : ""}`} · {new Date(t.date).toLocaleDateString("en-PK",{day:"numeric",month:"short"})}
                      </div>
                    </div>
                    {ri && (
                      <span style={{ background:ri.bg, color:ri.color, padding:"3px 8px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700, flexShrink:0 }}>
                        {ri.icon} {ri.label}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
