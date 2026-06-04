"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const QAIDA_LESSONS = [
  "Lesson 1 — Arabic Letters (حروف)",
  "Lesson 2 — Harakat (زبر، زیر، پیش)",
  "Lesson 3 — Tanwin (تنوین)",
  "Lesson 4 — Madd Letters (حروف مد)",
  "Lesson 5 — Sukoon (سکون)",
  "Lesson 6 — Shaddah (شدہ)",
  "Lesson 7 — Qalqalah (قلقلہ)",
  "Lesson 8 — Laam Rules (لام)",
  "Lesson 9 — Raa Rules (ر)",
  "Lesson 10 — Noon Sakin & Tanwin",
  "Lesson 11 — Meem Sakin (میم ساکن)",
  "Lesson 12 — Madd Rules (مد)",
  "Lesson 13 — Waqf Rules (وقف)",
  "Lesson 14 — Practice Exercises",
  "Lesson 15 — Final Revision",
];

type Grade = "EXCELLENT"|"GOOD"|"WEAK"|"REPEAT";
type CompLevel = "INTRODUCED"|"PRACTICING"|"MASTERED";

const COMP: {id:CompLevel;label:string;color:string;bg:string}[] = [
  {id:"INTRODUCED", label:"Introduced",color:"#b45309",bg:"#fffbeb"},
  {id:"PRACTICING", label:"Practicing", color:colors.primary,bg:colors.green50},
  {id:"MASTERED",   label:"Mastered",   color:"#166534",bg:"#dcfce7"},
];

const AMBER = "#b45309";

export default function QaidaPage() {
  const [students,setStudents] = useState<{id:string;name:string}[]>([]);
  const [selected,setSelected] = useState("");
  const [lesson,  setLesson]   = useState(0);
  const [comp,    setComp]     = useState<CompLevel|"">("");
  const [mistakes,setMistakes] = useState(0);
  const [notes,   setNotes]    = useState("");
  const [saving,  setSaving]   = useState(false);
  const [saved,   setSaved]    = useState(false);
  const [error,   setError]    = useState("");

  useEffect(() => {
    fetch("/api/ustadh/dashboard")
      .then(r=>r.json())
      .then(d=>{ if(d.success){ setStudents(d.data.students); if(d.data.students.length>0)setSelected(d.data.students[0].id); }});
  },[]);

  const handleSave = async () => {
    if(!selected||!comp){setError("Select student and competency level");return;}
    setSaving(true);setError("");
    const gradeMap:Record<CompLevel,Grade> = {INTRODUCED:"WEAK",PRACTICING:"GOOD",MASTERED:"EXCELLENT"};
    try {
      const res = await fetch("/api/lesson-entries",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          studentId:selected,lessonType:"SABAQ",
          grade:gradeMap[comp],mistakeCount:mistakes,
          notes:`Qaida/Tajweed: ${QAIDA_LESSONS[lesson]} — ${comp}${notes?` — ${notes}`:""}`,
        }),
      });
      const data = await res.json();
      if(data.success){setSaved(true);setTimeout(()=>setSaved(false),2000);setComp("");setMistakes(0);setNotes("");}
      else setError(data.error||"Failed to save");
    }catch{setError("Connection error");}finally{setSaving(false);}
  };

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      <div style={{background:`linear-gradient(135deg,#78350f,${AMBER})`,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:50}}>
        <Link href="/dashboard/ustadh" style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:18}}>←</Link>
        <div>
          <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:colors.white}}>✏️ Qaida / Tajweed</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(255,255,255,0.6)"}}>قاعدہ · تجوید</div>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}}>

        {/* Student */}
        <div style={{background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14}}>
          <div style={{fontSize:10,letterSpacing:2,color:AMBER,fontFamily:fonts.mono,marginBottom:10}}>SELECT STUDENT</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {students.map(s=>(
              <button key={s.id} onClick={()=>setSelected(s.id)} style={{
                padding:"11px 14px",borderRadius:10,border:`1.5px solid ${selected===s.id?AMBER:colors.n200}`,
                background:selected===s.id?`${AMBER}12`:colors.white,cursor:"pointer",textAlign:"left",
                fontFamily:fonts.heading,fontSize:13,fontWeight:selected===s.id?700:400,color:selected===s.id?AMBER:colors.n700,
              }}>{s.name}</button>
            ))}
          </div>
        </div>

        {/* Lesson selector */}
        <div style={{background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14}}>
          <div style={{fontSize:10,letterSpacing:2,color:AMBER,fontFamily:fonts.mono,marginBottom:10}}>LESSON / RULE</div>
          <select value={lesson} onChange={e=>setLesson(Number(e.target.value))}
            style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${AMBER}`,borderRadius:10,fontSize:13,fontFamily:fonts.body,color:colors.n800,background:colors.white,outline:"none"}}>
            {QAIDA_LESSONS.map((l,i)=><option key={i} value={i}>{l}</option>)}
          </select>
          {/* Progress bar */}
          <div style={{marginTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontFamily:fonts.body,fontSize:10,color:colors.n500}}>Lesson progress</span>
              <span style={{fontFamily:fonts.mono,fontSize:10,color:AMBER}}>{lesson+1}/{QAIDA_LESSONS.length}</span>
            </div>
            <div style={{height:6,background:colors.n100,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${((lesson+1)/QAIDA_LESSONS.length)*100}%`,background:`linear-gradient(90deg,${AMBER},#f59e0b)`,borderRadius:3,transition:"width 0.3s"}}/>
            </div>
          </div>
        </div>

        {/* Competency level */}
        <div style={{background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14}}>
          <div style={{fontSize:10,letterSpacing:2,color:AMBER,fontFamily:fonts.mono,marginBottom:12}}>COMPETENCY LEVEL *</div>
          <div style={{display:"flex",gap:10}}>
            {COMP.map(c=>(
              <button key={c.id} onClick={()=>setComp(c.id)} style={{
                flex:1,padding:"14px 8px",borderRadius:12,border:`2px solid ${comp===c.id?c.color:colors.n200}`,
                background:comp===c.id?c.bg:colors.n50,cursor:"pointer",textAlign:"center",
              }}>
                <div style={{fontSize:18,marginBottom:4}}>{c.id==="INTRODUCED"?"📖":c.id==="PRACTICING"?"✍️":"🏆"}</div>
                <div style={{fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:comp===c.id?c.color:colors.n600}}>{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mistakes */}
        <div style={{background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:10,letterSpacing:2,color:AMBER,fontFamily:fonts.mono}}>MISTAKES</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setMistakes(Math.max(0,mistakes-1))} style={{width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16}}>−</button>
              <span style={{fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:mistakes===0?colors.success:mistakes<5?colors.warning:colors.error,width:32,textAlign:"center"}}>{mistakes}</span>
              <button onClick={()=>setMistakes(mistakes+1)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16}}>+</button>
            </div>
          </div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes about this lesson..."
            style={{width:"100%",padding:"10px",border:`1px solid ${colors.n200}`,borderRadius:8,fontSize:13,fontFamily:fonts.body,color:colors.n700,resize:"none",outline:"none"}}/>
        </div>

        {error&&<div style={{background:colors.errorBg,borderRadius:10,padding:"12px",marginBottom:12}}><span style={{fontFamily:fonts.body,fontSize:12,color:colors.errorText}}>⚠ {error}</span></div>}
        {saved&&<div style={{background:colors.successBg,borderRadius:10,padding:"12px",marginBottom:12,textAlign:"center"}}><span style={{fontFamily:fonts.heading,fontSize:13,fontWeight:600,color:colors.successText}}>✓ Saved!</span></div>}

        <button onClick={handleSave} disabled={saving||!comp||!selected} style={{
          width:"100%",padding:"15px",borderRadius:12,background:!comp||!selected?colors.n300:AMBER,
          color:colors.white,fontSize:15,fontWeight:700,border:"none",cursor:!comp||!selected||saving?"not-allowed":"pointer",fontFamily:fonts.heading,
        }}>
          {saving?"Saving...":"Save Qaida Entry"}
        </button>
      </div>
    </div>
  );
}
