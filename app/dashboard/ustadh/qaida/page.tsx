"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";
import { QAIDA_LESSONS, ARABIC_LETTERS, MAKHRAJ_CATEGORIES } from "@/lib/qaida-content";
import MakharijChart from "@/components/qaida/MakharijChart";

type Grade = "EXCELLENT"|"GOOD"|"WEAK"|"REPEAT";
type CompLevel = "INTRODUCED"|"PRACTICING"|"MASTERED";

const COMP: {id:CompLevel;label:string;color:string;bg:string}[] = [
  {id:"INTRODUCED", label:"Introduced",color:"#b45309",bg:"#fffbeb"},
  {id:"PRACTICING", label:"Practicing", color:colors.primary,bg:colors.green50},
  {id:"MASTERED",   label:"Mastered",   color:"#166534",bg:"#dcfce7"},
];

const AMBER = "#b45309";

function LessonContent({ lessonIndex, selectedLetter, onSelectLetter }: {
  lessonIndex: number; selectedLetter: string; onSelectLetter: (l: string) => void;
}) {
  const lesson = QAIDA_LESSONS[lessonIndex];

  if (lesson.type === "letters") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}` }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: AMBER, fontFamily: fonts.mono, marginBottom: 12 }}>
            {ARABIC_LETTERS.length} LETTERS — TAP ONE FOR ITS MAKHRAJ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))", gap: 8 }}>
            {ARABIC_LETTERS.map(l => {
              const cat = MAKHRAJ_CATEGORIES.find(c => c.id === l.makhraj)!;
              const isSel = selectedLetter === l.letter;
              return (
                <button key={l.letter} onClick={() => onSelectLetter(l.letter)} style={{
                  padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${isSel ? cat.color : colors.n200}`,
                  background: isSel ? `${cat.color}15` : colors.n50, cursor: "pointer", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: isSel ? cat.color : colors.n800, lineHeight: 1 }}>{l.letter}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 4 }}>{l.transliteration}</div>
                </button>
              );
            })}
          </div>
          {selectedLetter && (() => {
            const l = ARABIC_LETTERS.find(x => x.letter === selectedLetter)!;
            const cat = MAKHRAJ_CATEGORIES.find(c => c.id === l.makhraj)!;
            return (
              <div style={{ marginTop: 14, padding: "12px 14px", background: `${cat.color}0d`, borderRadius: 10, border: `1px solid ${cat.color}30` }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: cat.color }}>{l.name} ({l.nameUrdu})</div>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, marginTop: 4, lineHeight: 1.5 }}>{l.makhrajPoint}</div>
              </div>
            );
          })()}
        </div>
        <MakharijChart highlightLetter={selectedLetter} />
      </div>
    );
  }

  if (lesson.type === "combo") {
    return (
      <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}` }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: AMBER, fontFamily: fonts.mono, marginBottom: 4 }}>{lesson.summary}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
          {lesson.combo!.map((c, i) => (
            <div key={i}>
              <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n700, marginBottom: 6 }}>
                {c.label} <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: colors.n400 }}>{c.labelUrdu}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {c.examples.map((ex, j) => (
                  <div key={j} style={{ padding: "10px 16px", borderRadius: 10, background: colors.n50, border: `1px solid ${colors.n200}`, fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: colors.n800 }}>
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lesson.type === "rules") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, padding: "0 2px" }}>{lesson.summary}</div>
        {lesson.rules!.map((r, i) => (
          <div key={i} style={{ background: colors.white, borderRadius: 14, padding: 16, border: `1px solid ${colors.n200}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{r.name}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: AMBER }}>{r.nameArabic}</div>
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, lineHeight: 1.5, marginBottom: r.letters || r.example ? 8 : 0 }}>{r.desc}</div>
            {r.letters && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: r.example ? 8 : 0 }}>
                {r.letters.map((l, j) => (
                  <div key={j} style={{ width: 30, height: 30, borderRadius: 8, background: colors.green50, border: `1px solid ${colors.green200}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: colors.primary }}>{l}</div>
                ))}
              </div>
            )}
            {r.example && (
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: colors.n700, background: colors.n50, borderRadius: 8, padding: "6px 10px", display: "inline-block" }}>{r.example}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (lesson.type === "practice") {
    return (
      <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}` }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: AMBER, fontFamily: fonts.mono, marginBottom: 12 }}>{lesson.summary}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lesson.items!.map((ex, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: colors.n50, border: `1px solid ${colors.n200}`, fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: colors.n800, textAlign: "right", direction: "rtl" }}>
              {ex}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // "revision"
  return (
    <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}` }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: AMBER, fontFamily: fonts.mono, marginBottom: 12 }}>{lesson.summary}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lesson.items!.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${colors.n300}`, flexShrink: 0 }} />
            <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{it}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QaidaPage() {
  const [students,setStudents] = useState<{id:string;name:string}[]>([]);
  const [selected,setSelected] = useState("");
  const [lesson,  setLesson]   = useState(0);
  const [selectedLetter, setSelectedLetter] = useState("");
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
          notes:`Qaida/Tajweed: ${QAIDA_LESSONS[lesson].title} — ${comp}${notes?` — ${notes}`:""}`,
        }),
      });
      const data = await res.json();
      if(data.success){setSaved(true);setTimeout(()=>setSaved(false),2000);setComp("");setMistakes(0);setNotes("");}
      else setError(data.error||"Failed to save");
    }catch{setError("Connection error");}finally{setSaving(false);}
  };

  const current = QAIDA_LESSONS[lesson];

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>
      <div style={{background:`linear-gradient(135deg,#78350f,${AMBER})`,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:0,zIndex:50}}>
        <Link href="/dashboard/ustadh" style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:18}}>←</Link>
        <div>
          <div style={{fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:colors.white}}>✏️ Qaida / Tajweed</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(255,255,255,0.6)"}}>قاعدہ · تجوید</div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px"}}>

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

        {/* Lesson stepper */}
        <div style={{background:colors.white,borderRadius:14,padding:18,border:`1px solid ${colors.n200}`,marginBottom:14}}>
          <div style={{fontSize:10,letterSpacing:2,color:AMBER,fontFamily:fonts.mono,marginBottom:10}}>LESSON {lesson+1} OF {QAIDA_LESSONS.length}</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:10}}>
            {QAIDA_LESSONS.map((l,i)=>(
              <button key={i} onClick={()=>{setLesson(i);setSelectedLetter("");}} style={{
                flexShrink:0,width:34,height:34,borderRadius:8,border:`1.5px solid ${lesson===i?AMBER:colors.n200}`,
                background:lesson===i?AMBER:colors.white,color:lesson===i?colors.white:colors.n500,
                cursor:"pointer",fontFamily:fonts.mono,fontSize:12,fontWeight:700,
              }}>{i+1}</button>
            ))}
          </div>
          <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.n800}}>
            {current.title} <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:AMBER,fontWeight:400}}>{current.titleArabic}</span>
          </div>
          <div style={{fontFamily:fonts.body,fontSize:11,color:colors.n500,marginTop:2}}>{current.titleUrdu}</div>
          <div style={{marginTop:10}}>
            <div style={{height:6,background:colors.n100,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${((lesson+1)/QAIDA_LESSONS.length)*100}%`,background:`linear-gradient(90deg,${AMBER},#f59e0b)`,borderRadius:3,transition:"width 0.3s"}}/>
            </div>
          </div>
        </div>

        {/* Lesson content */}
        <div style={{marginBottom:14}}>
          <LessonContent lessonIndex={lesson} selectedLetter={selectedLetter} onSelectLetter={setSelectedLetter} />
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
