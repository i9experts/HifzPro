"use client";
import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";

const RECITERS = [
  { id:"ar.alafasy",            label:"Mishary Alafasy",       labelAr:"مشاري العفاسي" },
  { id:"ar.abdurrahmaansudais", label:"Abdurrahman As-Sudais", labelAr:"عبدالرحمن السديس" },
  { id:"ar.minshawi",           label:"Mohamed Al-Minshawi",   labelAr:"محمد المنشاوي" },
  { id:"ar.shaatree",           label:"Abu Bakr Al-Shatri",    labelAr:"أبو بكر الشاطري" },
  { id:"ar.husary",             label:"Mahmoud Al-Husary",     labelAr:"محمود خليل الحصري" },
];

const TRANSLATIONS = [
  { id:"none",         label:"Arabic Only",         flag:"🕌" },
  { id:"ur.jalandhry", label:"Urdu (Jalandhry)",    flag:"🇵🇰" },
  { id:"en.asad",      label:"English (Asad)",      flag:"🇬🇧" },
  { id:"en.pickthall", label:"English (Pickthall)", flag:"🇬🇧" },
];

interface Ayah {
  number: number; numberInSurah: number;
  text: string; translation?: string;
  juz: number; audio: string;
}

const CDN = "https://cdn.islamic.network/quran/audio/128";

// ── AyahCard — each card owns its own "revealed" state ──
function AyahCard({
  ayah, prevJuz, isPlaying, isRepeating, isSaved, memMode, fontSize,
  theme, translation, onPlay, onStop, onRepeat, onSave,
}: {
  ayah:Ayah; prevJuz:number|null; isPlaying:boolean; isRepeating:boolean;
  isSaved:boolean; memMode:boolean; fontSize:number; theme:"dark"|"cream";
  translation:string;
  onPlay:()=>void; onStop:()=>void; onRepeat:()=>void; onSave:()=>void;
}) {
  const [revealed, setRevealed] = useState(false);

  // Reset revealed when memMode turns off
  useEffect(() => { if (!memMode) setRevealed(false); }, [memMode]);

  const CARD = theme==="dark" ? "#111d16" : "#f4e8c1";
  const BORD = theme==="dark" ? "#1a2e22" : "#d4b896";
  const TXT  = theme==="dark" ? "white"   : "#2c1810";
  const DIM  = theme==="dark" ? "rgba(255,255,255,0.45)" : "rgba(44,24,16,0.6)";

  return (
    <div style={{ background:isPlaying?"rgba(16,185,129,0.08)":CARD, borderRadius:12, padding:"18px 20px", border:`1px solid ${isPlaying?"rgba(16,185,129,0.4)":BORD}`, transition:"all 0.2s", position:"relative" }}>

      {/* Header row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {prevJuz !== ayah.juz && (
            <span style={{ background:"rgba(196,136,42,0.2)", color:"#C4882A", padding:"2px 7px", borderRadius:5, fontFamily:"monospace", fontSize:9, fontWeight:700 }}>
              Juz {ayah.juz}
            </span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <button onClick={isPlaying ? onStop : onPlay}
            style={{ width:30,height:30,borderRadius:"50%",background:isPlaying?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.06)",border:`1px solid ${isPlaying?"#10B981":BORD}`,color:isPlaying?"#10B981":DIM,cursor:"pointer",fontSize:12 }}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={onRepeat} title="Loop this Ayah"
            style={{ width:30,height:30,borderRadius:"50%",background:isRepeating?"rgba(109,40,217,0.2)":"rgba(255,255,255,0.06)",border:`1px solid ${isRepeating?"#7c3aed":BORD}`,color:isRepeating?"#7c3aed":DIM,cursor:"pointer",fontSize:12 }}>
            🔁
          </button>
          <button onClick={onSave} title="Bookmark"
            style={{ width:30,height:30,borderRadius:"50%",background:isSaved?"rgba(196,136,42,0.2)":"rgba(255,255,255,0.06)",border:`1px solid ${isSaved?"#C4882A":BORD}`,color:isSaved?"#C4882A":DIM,cursor:"pointer",fontSize:12 }}>
            🔖
          </button>
          <div style={{ width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:`1px solid ${BORD}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ fontFamily:"'Scheherazade New',serif",fontSize:13,color:DIM }}>{ayah.numberInSurah}</span>
          </div>
        </div>
      </div>

      {/* Arabic text OR memorization mask */}
      {memMode && !revealed ? (
        <div style={{ textAlign:"center", padding:"16px 0" }}>
          <div style={{ fontFamily:"'Inter',sans-serif",fontSize:12,color:"rgba(109,40,217,0.6)",marginBottom:8 }}>
            Ayah {ayah.numberInSurah} — hidden for memorization
          </div>
          <button onClick={()=>setRevealed(true)}
            style={{ padding:"5px 14px",borderRadius:7,background:"rgba(109,40,217,0.2)",border:"1px solid rgba(109,40,217,0.3)",color:"#a78bfa",fontSize:11,cursor:"pointer" }}>
            👁 Reveal
          </button>
        </div>
      ) : (
        <div style={{ direction:"rtl", textAlign:"right", fontFamily:"'Scheherazade New',serif", fontSize:fontSize, lineHeight:2.2, color:isPlaying?"#10B981":TXT, marginBottom:ayah.translation?12:0, letterSpacing:"0.02em" }}>
          {ayah.text}
          {memMode && revealed && (
            <button onClick={()=>setRevealed(false)}
              style={{ marginRight:12,fontSize:11,fontFamily:"'Inter',sans-serif",padding:"2px 8px",borderRadius:5,background:"rgba(109,40,217,0.2)",border:"none",color:"#a78bfa",cursor:"pointer",direction:"ltr" }}>
              🙈 Hide
            </button>
          )}
        </div>
      )}

      {/* Translation */}
      {ayah.translation && !memMode && (
        <div style={{ fontFamily:translation.startsWith("ur.")?"'Scheherazade New',serif":"'Cormorant Garamond',serif", fontSize:translation.startsWith("ur.")?16:14, color:DIM, lineHeight:1.8, direction:translation.startsWith("ur.")?"rtl":"ltr", textAlign:translation.startsWith("ur.")?"right":"left", paddingTop:10, borderTop:`1px solid ${BORD}` }}>
          {ayah.translation}
        </div>
      )}

      {/* Playing / repeat side indicators */}
      {isPlaying   && <div style={{ position:"absolute",left:0,top:0,bottom:0,width:3,background:"#10B981",borderRadius:"12px 0 0 12px" }}/>}
      {isRepeating && <div style={{ position:"absolute",right:0,top:0,bottom:0,width:3,background:"#7c3aed",borderRadius:"0 12px 12px 0" }}/>}
    </div>
  );
}

// ── Main page ──
export default function SurahViewerPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah: surahParam } = use(params);
  const surahNum = parseInt(surahParam);

  const [ayahs,       setAyahs]       = useState<Ayah[]>([]);
  const [surahInfo,   setSurahInfo]   = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [reciter,     setReciter]     = useState("ar.alafasy");
  const [translation, setTranslation] = useState("ur.jalandhry");
  const [playingAyah, setPlayingAyah] = useState<number|null>(null);
  const [repeatAyah,  setRepeatAyah]  = useState<number|null>(null);
  const [savedAyah,   setSavedAyah]   = useState<number|null>(null);
  const [memMode,     setMemMode]     = useState(false);
  const [fontSize,    setFontSize]    = useState(28);
  const [theme,       setTheme]       = useState<"dark"|"cream">("dark");
  const [autoPlay,    setAutoPlay]    = useState(false);
  const [playSpeed,   setPlaySpeed]   = useState(1);
  const [showSettings,setShowSettings]= useState(false);

  const audioRef = useRef<HTMLAudioElement|null>(null);
  const autoPlayRef = useRef(autoPlay);
  const repeatRef   = useRef(repeatAyah);
  const ayahsRef    = useRef(ayahs);

  useEffect(()=>{ autoPlayRef.current = autoPlay; },[autoPlay]);
  useEffect(()=>{ repeatRef.current   = repeatAyah; },[repeatAyah]);
  useEffect(()=>{ ayahsRef.current    = ayahs; },[ayahs]);

  useEffect(()=>{
    setLoading(true);
    const editions = translation==="none" ? "quran-uthmani" : `quran-uthmani,${translation}`;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/${editions}`)
      .then(r=>r.json())
      .then(d=>{
        if(d.code===200){
          const arabic = Array.isArray(d.data)?d.data[0]:d.data;
          const trans  = Array.isArray(d.data)&&d.data[1]?d.data[1]:null;
          setSurahInfo({ name:arabic.name, englishName:arabic.englishName, numberOfAyahs:arabic.numberOfAyahs, revelationType:arabic.revelationType });
          setAyahs(arabic.ayahs.map((a:any,i:number)=>({
            number:a.number, numberInSurah:a.numberInSurah,
            text:a.text, translation:trans?.ayahs[i]?.text,
            juz:a.juz, audio:`${CDN}/${reciter}/${a.number}.mp3`,
          })));
        }
      })
      .finally(()=>setLoading(false));
  },[surahNum, translation]);

  useEffect(()=>{
    setAyahs(prev=>prev.map(a=>({...a,audio:`${CDN}/${reciter}/${a.number}.mp3`})));
  },[reciter]);

  const playAyah = (ayah:Ayah) => {
    audioRef.current?.pause();
    const audio = new Audio(ayah.audio);
    audio.playbackRate = playSpeed;
    audio.play().catch(console.error);
    audioRef.current = audio;
    setPlayingAyah(ayah.numberInSurah);
    audio.onended = ()=>{
      if(repeatRef.current===ayah.numberInSurah){
        playAyah(ayah);
      } else if(autoPlayRef.current){
        const next = ayahsRef.current.find(a=>a.numberInSurah===ayah.numberInSurah+1);
        if(next) playAyah(next); else setPlayingAyah(null);
      } else { setPlayingAyah(null); }
    };
  };

  const stopAudio = ()=>{ audioRef.current?.pause(); audioRef.current=null; setPlayingAyah(null); };
  const playSurah = ()=>{ if(ayahs.length>0){ setAutoPlay(true); playAyah(ayahs[0]); } };

  const BG   = theme==="dark"?"#0a1510":"#fdf6e3";
  const BORD = theme==="dark"?"#1a2e22":"#d4b896";
  const TXT  = theme==="dark"?"white":"#2c1810";
  const DIM  = theme==="dark"?"rgba(255,255,255,0.45)":"rgba(44,24,16,0.6)";
  const NAV  = theme==="dark"?"#0D1F17":"#e8d5a3";

  return (
    <div style={{ minHeight:"100vh", background:BG, color:TXT, fontFamily:"'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=Cormorant+Garamond:wght@400;600;700&display=swap');*{box-sizing:border-box}`}</style>

      {/* Nav */}
      <nav style={{ background:NAV,borderBottom:`1px solid ${BORD}`,padding:"0 20px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <Link href="/dashboard/admin/quran" style={{ width:32,height:32,borderRadius:8,background:"rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:TXT,fontSize:16 }}>←</Link>
          <HifzMark size={26} primary="#10B981" gold="#C4882A"/>
          {surahInfo&&<div>
            <div style={{ fontFamily:"'Scheherazade New',serif",fontSize:18,color:TXT,lineHeight:1 }}>{surahInfo.name}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:11,color:DIM }}>{surahInfo.englishName} · {surahInfo.numberOfAyahs} Ayahs · {surahInfo.revelationType}</div>
          </div>}
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
          <button onClick={playingAyah?stopAudio:playSurah} style={{ padding:"7px 14px",borderRadius:8,background:playingAyah?"#dc2626":"#10B981",color:"white",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>
            {playingAyah?"⏹ Stop":"▶ Play Surah"}
          </button>
          <button onClick={()=>setMemMode(!memMode)} style={{ padding:"7px 12px",borderRadius:8,background:memMode?"#6d28d9":"rgba(0,0,0,0.15)",border:"none",color:"white",fontSize:12,fontWeight:700,cursor:"pointer" }}>
            {memMode?"👁 Show":"🧠 Memorize"}
          </button>
          <button onClick={()=>setShowSettings(!showSettings)} style={{ padding:"7px 12px",borderRadius:8,background:"rgba(0,0,0,0.15)",border:"none",color:TXT,fontSize:14,cursor:"pointer" }}>⚙️</button>
          <button onClick={()=>setTheme(theme==="dark"?"cream":"dark")} style={{ padding:"7px 10px",borderRadius:8,background:"rgba(0,0,0,0.15)",border:"none",color:TXT,fontSize:16,cursor:"pointer" }}>{theme==="dark"?"🌙":"☀️"}</button>
          {surahNum>1&&<Link href={`/dashboard/admin/quran/${surahNum-1}`} style={{ padding:"7px 10px",borderRadius:8,background:"rgba(0,0,0,0.15)",color:TXT,textDecoration:"none",fontSize:12,fontWeight:700 }}>‹ Prev</Link>}
          {surahNum<114&&<Link href={`/dashboard/admin/quran/${surahNum+1}`} style={{ padding:"7px 10px",borderRadius:8,background:"rgba(0,0,0,0.15)",color:TXT,textDecoration:"none",fontSize:12,fontWeight:700 }}>Next ›</Link>}
        </div>
      </nav>

      {/* Settings panel */}
      {showSettings&&(
        <div style={{ background:theme==="dark"?"#111d16":"#e8d5a3",borderBottom:`1px solid ${BORD}`,padding:"14px 24px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"monospace",fontSize:9,color:DIM,letterSpacing:1,marginBottom:4 }}>RECITER</div>
            <select value={reciter} onChange={e=>setReciter(e.target.value)} style={{ background:BG,border:`1px solid ${BORD}`,borderRadius:7,padding:"6px 10px",fontSize:12,color:TXT,outline:"none" }}>
              {RECITERS.map(r=><option key={r.id} value={r.id} style={{ background:BG }}>{r.label} — {r.labelAr}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontFamily:"monospace",fontSize:9,color:DIM,letterSpacing:1,marginBottom:4 }}>TRANSLATION</div>
            <select value={translation} onChange={e=>setTranslation(e.target.value)} style={{ background:BG,border:`1px solid ${BORD}`,borderRadius:7,padding:"6px 10px",fontSize:12,color:TXT,outline:"none" }}>
              {TRANSLATIONS.map(t=><option key={t.id} value={t.id} style={{ background:BG }}>{t.flag} {t.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontFamily:"monospace",fontSize:9,color:DIM,letterSpacing:1,marginBottom:4 }}>ARABIC SIZE</div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <button onClick={()=>setFontSize(f=>Math.max(18,f-2))} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${BORD}`,background:"transparent",color:TXT,cursor:"pointer",fontSize:14 }}>−</button>
              <span style={{ fontFamily:"monospace",fontSize:13,color:TXT,minWidth:32,textAlign:"center" }}>{fontSize}</span>
              <button onClick={()=>setFontSize(f=>Math.min(56,f+2))} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${BORD}`,background:"transparent",color:TXT,cursor:"pointer",fontSize:14 }}>+</button>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:"monospace",fontSize:9,color:DIM,letterSpacing:1,marginBottom:4 }}>SPEED</div>
            <div style={{ display:"flex",gap:4 }}>
              {[0.75,1,1.25].map(s=>(
                <button key={s} onClick={()=>setPlaySpeed(s)} style={{ padding:"5px 10px",borderRadius:6,border:`1px solid ${playSpeed===s?"#10B981":BORD}`,background:playSpeed===s?"rgba(16,185,129,0.15)":"transparent",color:playSpeed===s?"#10B981":TXT,fontSize:11,cursor:"pointer",fontWeight:700 }}>{s}×</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily:"monospace",fontSize:9,color:DIM,letterSpacing:1,marginBottom:4 }}>AUTO PLAY</div>
            <div onClick={()=>setAutoPlay(!autoPlay)} style={{ width:44,height:24,borderRadius:12,background:autoPlay?"#10B981":"rgba(255,255,255,0.15)",position:"relative",cursor:"pointer" }}>
              <div style={{ width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:autoPlay?23:3,transition:"left 0.2s" }}/>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:900,margin:"0 auto",padding:"24px 20px" }}>

        {/* Bismillah */}
        {surahNum!==9&&(
          <div style={{ textAlign:"center",marginBottom:24,padding:"16px",background:theme==="dark"?"#111d16":"#f4e8c1",borderRadius:14,border:`1px solid ${BORD}` }}>
            <div style={{ fontFamily:"'Scheherazade New',serif",fontSize:"clamp(22px,4vw,36px)",color:"#C4882A",lineHeight:1.8 }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>
        )}

        {/* Memorization banner */}
        {memMode&&(
          <div style={{ background:"rgba(109,40,217,0.15)",borderRadius:10,padding:"10px 16px",marginBottom:16,border:"1px solid rgba(109,40,217,0.3)",display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:20 }}>🧠</span>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:"#a78bfa" }}>Memorization Mode</div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(167,139,250,0.7)" }}>Text hidden. Use audio to test recall, then click Reveal to check.</div>
            </div>
            <button onClick={()=>setMemMode(false)} style={{ marginLeft:"auto",padding:"5px 10px",borderRadius:6,background:"rgba(109,40,217,0.3)",border:"none",color:"#a78bfa",fontSize:11,cursor:"pointer" }}>Exit</button>
          </div>
        )}

        {loading?(
          <div style={{ padding:60,textAlign:"center",color:DIM }}>
            <div style={{ fontFamily:"'Scheherazade New',serif",fontSize:36,marginBottom:12,opacity:0.4 }}>الْقُرْآنُ الْكَرِيم</div>
            <div>Loading Surah {surahNum}...</div>
          </div>
        ):(
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {ayahs.map((ayah,idx)=>(
              <AyahCard
                key={ayah.number}
                ayah={ayah}
                prevJuz={idx>0?ayahs[idx-1].juz:null}
                isPlaying={playingAyah===ayah.numberInSurah}
                isRepeating={repeatAyah===ayah.numberInSurah}
                isSaved={savedAyah===ayah.numberInSurah}
                memMode={memMode}
                fontSize={fontSize}
                theme={theme}
                translation={translation}
                onPlay={()=>playAyah(ayah)}
                onStop={stopAudio}
                onRepeat={()=>setRepeatAyah(repeatAyah===ayah.numberInSurah?null:ayah.numberInSurah)}
                onSave={()=>setSavedAyah(savedAyah===ayah.numberInSurah?null:ayah.numberInSurah)}
              />
            ))}
          </div>
        )}

        {!loading&&(
          <div style={{ textAlign:"center",marginTop:28,padding:"14px",background:theme==="dark"?"#111d16":"#f4e8c1",borderRadius:10,border:`1px solid ${BORD}` }}>
            <div style={{ fontFamily:"'Inter',sans-serif",fontSize:10,color:DIM,lineHeight:1.7 }}>
              Arabic text from <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer" style={{ color:"#10B981" }}>Tanzil.net</a> (Uthmani, CC) ·
              Audio via <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer" style={{ color:"#10B981" }}>Al-Quran Cloud</a> &amp; Islamic Network CDN ·
              Translation via Al-Quran Cloud API
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
