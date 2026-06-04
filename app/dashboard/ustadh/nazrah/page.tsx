"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const SURAHS = [
  {id:1,name:"Al-Fatiha",arabic:"الفاتحة",ayahs:7,juz:1},
  {id:2,name:"Al-Baqarah",arabic:"البقرة",ayahs:286,juz:1},
  {id:3,name:"Ali Imran",arabic:"آل عمران",ayahs:200,juz:3},
  {id:4,name:"An-Nisa",arabic:"النساء",ayahs:176,juz:4},
  {id:5,name:"Al-Maidah",arabic:"المائدة",ayahs:120,juz:6},
  {id:6,name:"Al-Anam",arabic:"الأنعام",ayahs:165,juz:7},
  {id:7,name:"Al-Araf",arabic:"الأعراف",ayahs:206,juz:8},
  {id:8,name:"Al-Anfal",arabic:"الأنفال",ayahs:75,juz:9},
  {id:9,name:"At-Tawbah",arabic:"التوبة",ayahs:129,juz:10},
  {id:10,name:"Yunus",arabic:"يونس",ayahs:109,juz:11},
  {id:78,name:"An-Naba",arabic:"النبأ",ayahs:40,juz:30},
  {id:108,name:"Al-Kawthar",arabic:"الكوثر",ayahs:3,juz:30},
  {id:110,name:"An-Nasr",arabic:"النصر",ayahs:3,juz:30},
  {id:112,name:"Al-Ikhlas",arabic:"الإخلاص",ayahs:4,juz:30},
  {id:113,name:"Al-Falaq",arabic:"الفلق",ayahs:5,juz:30},
  {id:114,name:"An-Nas",arabic:"الناس",ayahs:6,juz:30},
];

type Grade = "EXCELLENT"|"GOOD"|"WEAK"|"REPEAT";
const GRADES: {id:Grade;label:string;color:string;bg:string}[] = [
  {id:"EXCELLENT",label:"Excellent ⭐",color:"#166534",bg:"#dcfce7"},
  {id:"GOOD",     label:"Good 👍",     color:colors.primary,bg:colors.green50},
  {id:"WEAK",     label:"Weak ⚠️",     color:colors.warningText,bg:colors.warningBg},
  {id:"REPEAT",   label:"Repeat 🔄",  color:colors.errorText,bg:colors.errorBg},
];

interface NazrahStudent { id:string; name:string; }

export default function NazrahDiary() {
  const [students, setStudents]  = useState<NazrahStudent[]>([]);
  const [selected, setSelected]  = useState<string>("");
  const [surahId,  setSurahId]   = useState(1);
  const [ayahFrom, setAyahFrom]  = useState(1);
  const [ayahTo,   setAyahTo]    = useState(10);
  const [grade,    setGrade]     = useState<Grade|"">("");
  const [mistakes, setMistakes]  = useState(0);
  const [notes,    setNotes]     = useState("");
  const [saving,   setSaving]    = useState(false);
  const [saved,    setSaved]     = useState(false);
  const [error,    setError]     = useState("");

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

  const surah = SURAHS.find(s => s.id === surahId) || SURAHS[0];

  const handleSave = async () => {
    if (!selected || !grade) { setError("Please select a student and grade"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/lesson-entries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selected, lessonType: "SABAQ",
          surahFrom: surahId, ayahFrom, surahTo: surahId, ayahTo,
          juzFrom: surah.juz, juzTo: surah.juz,
          grade, mistakeCount: mistakes, notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); setGrade(""); setMistakes(0); setNotes(""); }
      else setError(data.error || "Failed to save");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <div style={{ background: `linear-gradient(135deg,#4c1d95,#7c3aed)`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/ustadh" style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 18 }}>←</Link>
        <div>
          <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>📚 Nazrah Diary</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>ناظرہ ڈائری</div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>

        {/* Student selector */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#7c3aed", fontFamily: fonts.mono, marginBottom: 10 }}>SELECT STUDENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {students.map(s => (
              <button key={s.id} onClick={() => setSelected(s.id)} style={{
                padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${selected===s.id?"#7c3aed":colors.n200}`,
                background: selected===s.id?"#f5f3ff":colors.white, cursor: "pointer", textAlign: "left",
                fontFamily: fonts.heading, fontSize: 13, fontWeight: selected===s.id?700:400,
                color: selected===s.id?"#7c3aed":colors.n700,
              }}>{s.name}</button>
            ))}
          </div>
        </div>

        {/* Surah selector */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#7c3aed", fontFamily: fonts.mono, marginBottom: 10 }}>SURAH</div>
          <select value={surahId} onChange={e => setSurahId(Number(e.target.value))}
            style={{ width: "100%", padding: "11px 14px", border: `1.5px solid #7c3aed`, borderRadius: 10, fontSize: 13, fontFamily: fonts.body, color: colors.n800, background: colors.white, outline: "none", marginBottom: 12 }}>
            {SURAHS.map(s => (
              <option key={s.id} value={s.id}>{s.id}. {s.name} — {s.arabic} ({s.ayahs} ayahs)</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: colors.n500, fontFamily: fonts.body, marginBottom: 4 }}>Ayah From</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setAyahFrom(Math.max(1,ayahFrom-1))} style={{ width: 30,height: 30,borderRadius:6,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
                <input type="number" value={ayahFrom} min={1} max={surah.ayahs} onChange={e=>setAyahFrom(Math.max(1,Math.min(surah.ayahs,parseInt(e.target.value)||1)))}
                  style={{ width:48,textAlign:"center",padding:"5px",border:`1.5px solid #7c3aed`,borderRadius:6,fontSize:13,fontFamily:fonts.mono,fontWeight:700,color:"#7c3aed",outline:"none" }}/>
                <button onClick={() => setAyahFrom(Math.min(surah.ayahs,ayahFrom+1))} style={{ width:30,height:30,borderRadius:6,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: colors.n500, fontFamily: fonts.body, marginBottom: 4 }}>Ayah To</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setAyahTo(Math.max(ayahFrom,ayahTo-1))} style={{ width:30,height:30,borderRadius:6,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
                <input type="number" value={ayahTo} min={ayahFrom} max={surah.ayahs} onChange={e=>setAyahTo(Math.max(ayahFrom,Math.min(surah.ayahs,parseInt(e.target.value)||ayahFrom)))}
                  style={{ width:48,textAlign:"center",padding:"5px",border:`1.5px solid #7c3aed`,borderRadius:6,fontSize:13,fontFamily:fonts.mono,fontWeight:700,color:"#7c3aed",outline:"none" }}/>
                <button onClick={() => setAyahTo(Math.min(surah.ayahs,ayahTo+1))} style={{ width:30,height:30,borderRadius:6,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Grade */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#7c3aed", fontFamily: fonts.mono, marginBottom: 12 }}>GRADE *</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {GRADES.map(g => (
              <button key={g.id} onClick={() => setGrade(g.id)} style={{
                padding: "13px 10px", borderRadius: 10, border: `2px solid ${grade===g.id?g.color:colors.n200}`,
                background: grade===g.id?g.bg:colors.n50, cursor: "pointer",
                fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: grade===g.id?g.color:colors.n500,
              }}>{g.label}</button>
            ))}
          </div>
        </div>

        {/* Mistakes + Notes */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}`, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#7c3aed", fontFamily: fonts.mono }}>MISTAKES</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
              <button onClick={() => setMistakes(Math.max(0,mistakes-1))} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>−</button>
              <span style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: mistakes===0?colors.success:mistakes<5?colors.warning:colors.error, width:32, textAlign:"center" }}>{mistakes}</span>
              <button onClick={() => setMistakes(mistakes+1)} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>+</button>
            </div>
          </div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes..."
            style={{ width:"100%",padding:"10px",border:`1px solid ${colors.n200}`,borderRadius:8,fontSize:13,fontFamily:fonts.body,color:colors.n700,resize:"none",outline:"none" }}/>
        </div>

        {error && <div style={{ background:colors.errorBg,borderRadius:10,padding:"12px",marginBottom:12 }}><span style={{ fontFamily:fonts.body,fontSize:12,color:colors.errorText }}>⚠ {error}</span></div>}
        {saved && <div style={{ background:colors.successBg,borderRadius:10,padding:"12px",marginBottom:12,textAlign:"center" }}><span style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:600,color:colors.successText }}>✓ Saved!</span></div>}

        <button onClick={handleSave} disabled={saving||!grade||!selected} style={{
          width:"100%",padding:"15px",borderRadius:12,background:!grade||!selected?colors.n300:"#7c3aed",
          color:colors.white,fontSize:15,fontWeight:700,border:"none",cursor:!grade||!selected||saving?"not-allowed":"pointer",fontFamily:fonts.heading,
        }}>
          {saving?"Saving...":"Save Nazrah Entry"}
        </button>
      </div>
    </div>
  );
}
