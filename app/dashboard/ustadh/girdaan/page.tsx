"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

type Grade = "EXCELLENT"|"GOOD"|"WEAK"|"REPEAT";
const GRADES: {id:Grade;label:string;emoji:string;color:string;bg:string}[] = [
  {id:"EXCELLENT",label:"Excellent",emoji:"⭐",color:"#166534",bg:"#dcfce7"},
  {id:"GOOD",     label:"Good",     emoji:"👍",color:colors.primary,bg:colors.green50},
  {id:"WEAK",     label:"Weak",     emoji:"⚠️",color:colors.warningText,bg:colors.warningBg},
  {id:"REPEAT",   label:"Repeat",   emoji:"🔄",color:colors.errorText,bg:colors.errorBg},
];

export default function GirdaanPage() {
  const [students,   setStudents]   = useState<{id:string;name:string;currentJuz:number}[]>([]);
  const [selected,   setSelected]   = useState("");
  const [cycleNum,   setCycleNum]   = useState(1);
  const [juzFrom,    setJuzFrom]    = useState(1);
  const [juzTo,      setJuzTo]      = useState(30);
  const [grade,      setGrade]      = useState<Grade|"">("");
  const [mistakes,   setMistakes]   = useState(0);
  const [notes,      setNotes]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    fetch("/api/ustadh/dashboard")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.data.students);
          if (d.data.students.length > 0) setSelected(d.data.students[0].id);
        }
      });
  }, []);

  const handleSave = async () => {
    if (!selected || !grade) { setError("Select student and grade"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/lesson-entries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selected, lessonType: "GIRDAAN",
          juzFrom, juzTo, grade, mistakeCount: mistakes,
          notes: `Girdaan Cycle ${cycleNum}${notes ? ` — ${notes}` : ""}`,
        }),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(()=>setSaved(false),2000); setGrade(""); setMistakes(0); setNotes(""); }
      else setError(data.error||"Failed to save");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  const TEAL = "#0f766e";

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <div style={{ background:`linear-gradient(135deg,#134e4a,${TEAL})`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/ustadh" style={{ width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:18 }}>←</Link>
        <div>
          <div style={{ fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:colors.white }}>🔄 Girdaan</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(255,255,255,0.6)" }}>دوہرائی / گردان</div>
        </div>
      </div>

      <div style={{ maxWidth:520,margin:"0 auto",padding:"20px 16px" }}>

        {/* What is Girdaan info */}
        <div style={{ background:`${TEAL}15`,borderRadius:12,padding:14,border:`1px solid ${TEAL}33`,marginBottom:16 }}>
          <div style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:TEAL,marginBottom:4 }}>About Girdaan</div>
          <div style={{ fontFamily:fonts.body,fontSize:12,color:colors.n600,lineHeight:1.7 }}>
            Girdaan is an intensive revision cycle where a Hafiz recites the entire Quran or a portion to the Ustadh for quality assessment. Record each cycle with the Para range and quality grade.
          </div>
        </div>

        {/* Student selector */}
        <div style={{ background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14 }}>
          <div style={{ fontSize:10,letterSpacing:2,color:TEAL,fontFamily:fonts.mono,marginBottom:10 }}>SELECT HAFIZ</div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {students.map(s => (
              <button key={s.id} onClick={()=>setSelected(s.id)} style={{
                padding:"11px 14px",borderRadius:10,border:`1.5px solid ${selected===s.id?TEAL:colors.n200}`,
                background:selected===s.id?`${TEAL}12`:colors.white,cursor:"pointer",textAlign:"left",
                display:"flex",alignItems:"center",justifyContent:"space-between",
              }}>
                <span style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:selected===s.id?700:400,color:selected===s.id?TEAL:colors.n700 }}>{s.name}</span>
                <span style={{ fontFamily:fonts.mono,fontSize:10,color:colors.n400 }}>Juz {s.currentJuz}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cycle + Juz range */}
        <div style={{ background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14 }}>
          <div style={{ fontSize:10,letterSpacing:2,color:TEAL,fontFamily:fonts.mono,marginBottom:14 }}>CYCLE DETAILS</div>

          {/* Cycle number */}
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
            <div style={{ fontFamily:fonts.body,fontSize:12,color:colors.n500,width:100 }}>Cycle Number</div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <button onClick={()=>setCycleNum(Math.max(1,cycleNum-1))} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
              <div style={{ width:48,textAlign:"center",fontFamily:fonts.heading,fontSize:20,fontWeight:700,color:TEAL }}>{cycleNum}</div>
              <button onClick={()=>setCycleNum(cycleNum+1)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
            </div>
          </div>

          {/* Juz range */}
          <div style={{ display:"flex",gap:12 }}>
            {[{label:"Juz From",val:juzFrom,set:(v:number)=>setJuzFrom(Math.max(1,Math.min(juzTo,v)))},
              {label:"Juz To",  val:juzTo,  set:(v:number)=>setJuzTo(Math.max(juzFrom,Math.min(30,v)))}].map((f,i)=>(
              <div key={i} style={{ flex:1 }}>
                <div style={{ fontSize:11,color:colors.n500,fontFamily:fonts.body,marginBottom:6 }}>{f.label}</div>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <button onClick={()=>f.set(f.val-1)} style={{ width:30,height:30,borderRadius:6,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:14 }}>−</button>
                  <input type="number" value={f.val} min={1} max={30} onChange={e=>f.set(parseInt(e.target.value)||1)}
                    style={{ width:44,textAlign:"center",padding:"5px",border:`1.5px solid ${TEAL}`,borderRadius:6,fontSize:14,fontFamily:fonts.mono,fontWeight:700,color:TEAL,outline:"none" }}/>
                  <button onClick={()=>f.set(f.val+1)} style={{ width:30,height:30,borderRadius:6,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:14 }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Juz strip */}
          <div style={{ marginTop:14,display:"flex",gap:3,flexWrap:"wrap" }}>
            {Array.from({length:30},(_,i)=>i+1).map(j=>{
              const inRange = j>=juzFrom && j<=juzTo;
              return (
                <div key={j} style={{ width:28,height:20,borderRadius:4,background:inRange?TEAL:colors.n100,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <span style={{ fontFamily:fonts.mono,fontSize:8,color:inRange?"white":colors.n400,fontWeight:inRange?700:400 }}>{j}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n400,marginTop:6 }}>
            {juzTo-juzFrom+1} Juz selected
          </div>
        </div>

        {/* Grade */}
        <div style={{ background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14 }}>
          <div style={{ fontSize:10,letterSpacing:2,color:TEAL,fontFamily:fonts.mono,marginBottom:12 }}>OVERALL QUALITY *</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {GRADES.map(g=>(
              <button key={g.id} onClick={()=>setGrade(g.id)} style={{
                padding:"13px 10px",borderRadius:10,border:`2px solid ${grade===g.id?g.color:colors.n200}`,
                background:grade===g.id?g.bg:colors.n50,cursor:"pointer",
                display:"flex",alignItems:"center",gap:8,
              }}>
                <span style={{ fontSize:18 }}>{g.emoji}</span>
                <span style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:grade===g.id?g.color:colors.n600 }}>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mistakes + Notes */}
        <div style={{ background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ fontSize:10,letterSpacing:2,color:TEAL,fontFamily:fonts.mono }}>TOTAL MISTAKES</div>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <button onClick={()=>setMistakes(Math.max(0,mistakes-1))} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
              <span style={{ fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:mistakes===0?colors.success:mistakes<10?colors.warning:colors.error,width:40,textAlign:"center" }}>{mistakes}</span>
              <button onClick={()=>setMistakes(mistakes+1)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
            </div>
          </div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes about this Girdaan cycle..."
            style={{ width:"100%",padding:"10px",border:`1px solid ${colors.n200}`,borderRadius:8,fontSize:13,fontFamily:fonts.body,color:colors.n700,resize:"none",outline:"none" }}/>
        </div>

        {error&&<div style={{ background:colors.errorBg,borderRadius:10,padding:"12px",marginBottom:12 }}><span style={{ fontFamily:fonts.body,fontSize:12,color:colors.errorText }}>⚠ {error}</span></div>}
        {saved&&<div style={{ background:colors.successBg,borderRadius:10,padding:"12px",marginBottom:12,textAlign:"center" }}><span style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:600,color:colors.successText }}>✓ Girdaan Cycle {cycleNum} Saved!</span></div>}

        <button onClick={handleSave} disabled={saving||!grade||!selected} style={{
          width:"100%",padding:"15px",borderRadius:12,
          background:!grade||!selected?colors.n300:TEAL,
          color:colors.white,fontSize:15,fontWeight:700,border:"none",
          cursor:!grade||!selected||saving?"not-allowed":"pointer",fontFamily:fonts.heading,
        }}>
          {saving?"Saving...":"Save Girdaan Entry"}
        </button>
      </div>
    </div>
  );
}
