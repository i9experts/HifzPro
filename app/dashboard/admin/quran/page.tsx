"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

// ── Surah metadata (local — no API call needed for list) ──
const SURAHS = [
  {n:1,  ar:"الْفَاتِحَة",     en:"Al-Fatiha",      juz:1,  ayahs:7,   type:"Meccan"},
  {n:2,  ar:"الْبَقَرَة",      en:"Al-Baqara",      juz:1,  ayahs:286, type:"Medinan"},
  {n:3,  ar:"آلِ عِمْرَان",   en:"Aal-E-Imran",    juz:3,  ayahs:200, type:"Medinan"},
  {n:4,  ar:"النِّسَاء",      en:"An-Nisa",         juz:4,  ayahs:176, type:"Medinan"},
  {n:5,  ar:"الْمَائِدَة",    en:"Al-Maida",        juz:6,  ayahs:120, type:"Medinan"},
  {n:6,  ar:"الْأَنْعَام",    en:"Al-An'am",        juz:7,  ayahs:165, type:"Meccan"},
  {n:7,  ar:"الْأَعْرَاف",    en:"Al-A'raf",        juz:8,  ayahs:206, type:"Meccan"},
  {n:8,  ar:"الْأَنْفَال",    en:"Al-Anfal",        juz:9,  ayahs:75,  type:"Medinan"},
  {n:9,  ar:"التَّوْبَة",     en:"At-Tawba",        juz:10, ayahs:129, type:"Medinan"},
  {n:10, ar:"يُونُس",          en:"Yunus",           juz:11, ayahs:109, type:"Meccan"},
  {n:11, ar:"هُود",            en:"Hud",             juz:11, ayahs:123, type:"Meccan"},
  {n:12, ar:"يُوسُف",          en:"Yusuf",           juz:12, ayahs:111, type:"Meccan"},
  {n:13, ar:"الرَّعْد",        en:"Ar-Ra'd",         juz:13, ayahs:43,  type:"Medinan"},
  {n:14, ar:"إِبْرَاهِيم",    en:"Ibrahim",         juz:13, ayahs:52,  type:"Meccan"},
  {n:15, ar:"الْحِجْر",        en:"Al-Hijr",         juz:14, ayahs:99,  type:"Meccan"},
  {n:16, ar:"النَّحْل",        en:"An-Nahl",         juz:14, ayahs:128, type:"Meccan"},
  {n:17, ar:"الْإِسْرَاء",    en:"Al-Isra",         juz:15, ayahs:111, type:"Meccan"},
  {n:18, ar:"الْكَهْف",        en:"Al-Kahf",         juz:15, ayahs:110, type:"Meccan"},
  {n:19, ar:"مَرْيَم",         en:"Maryam",          juz:16, ayahs:98,  type:"Meccan"},
  {n:20, ar:"طه",               en:"Ta-Ha",           juz:16, ayahs:135, type:"Meccan"},
  {n:21, ar:"الْأَنبِيَاء",   en:"Al-Anbiya",       juz:17, ayahs:112, type:"Meccan"},
  {n:22, ar:"الْحَج",          en:"Al-Hajj",         juz:17, ayahs:78,  type:"Medinan"},
  {n:23, ar:"الْمُؤْمِنُون",  en:"Al-Muminun",      juz:18, ayahs:118, type:"Meccan"},
  {n:24, ar:"النُّور",          en:"An-Nur",          juz:18, ayahs:64,  type:"Medinan"},
  {n:25, ar:"الْفُرْقَان",    en:"Al-Furqan",       juz:18, ayahs:77,  type:"Meccan"},
  {n:26, ar:"الشُّعَرَاء",    en:"Ash-Shu'ara",     juz:19, ayahs:227, type:"Meccan"},
  {n:27, ar:"النَّمْل",        en:"An-Naml",         juz:19, ayahs:93,  type:"Meccan"},
  {n:28, ar:"الْقَصَص",        en:"Al-Qasas",        juz:20, ayahs:88,  type:"Meccan"},
  {n:29, ar:"الْعَنكَبُوت",   en:"Al-Ankabut",      juz:20, ayahs:69,  type:"Meccan"},
  {n:30, ar:"الرُّوم",          en:"Ar-Rum",          juz:21, ayahs:60,  type:"Meccan"},
  {n:31, ar:"لُقْمَان",        en:"Luqman",          juz:21, ayahs:34,  type:"Meccan"},
  {n:32, ar:"السَّجْدَة",     en:"As-Sajda",        juz:21, ayahs:30,  type:"Meccan"},
  {n:33, ar:"الْأَحْزَاب",    en:"Al-Ahzab",        juz:21, ayahs:73,  type:"Medinan"},
  {n:34, ar:"سَبَأ",            en:"Saba",            juz:22, ayahs:54,  type:"Meccan"},
  {n:35, ar:"فَاطِر",          en:"Fatir",           juz:22, ayahs:45,  type:"Meccan"},
  {n:36, ar:"يس",               en:"Ya-Sin",          juz:22, ayahs:83,  type:"Meccan"},
  {n:37, ar:"الصَّافَّات",    en:"As-Saffat",       juz:23, ayahs:182, type:"Meccan"},
  {n:38, ar:"ص",                en:"Sad",             juz:23, ayahs:88,  type:"Meccan"},
  {n:39, ar:"الزُّمَر",        en:"Az-Zumar",        juz:23, ayahs:75,  type:"Meccan"},
  {n:40, ar:"غَافِر",          en:"Ghafir",          juz:24, ayahs:85,  type:"Meccan"},
  {n:41, ar:"فُصِّلَت",        en:"Fussilat",        juz:24, ayahs:54,  type:"Meccan"},
  {n:42, ar:"الشُّورَى",      en:"Ash-Shura",       juz:25, ayahs:53,  type:"Meccan"},
  {n:43, ar:"الزُّخْرُف",     en:"Az-Zukhruf",      juz:25, ayahs:89,  type:"Meccan"},
  {n:44, ar:"الدُّخَان",      en:"Ad-Dukhan",       juz:25, ayahs:59,  type:"Meccan"},
  {n:45, ar:"الْجَاثِيَة",    en:"Al-Jathiya",      juz:25, ayahs:37,  type:"Meccan"},
  {n:46, ar:"الْأَحْقَاف",    en:"Al-Ahqaf",        juz:26, ayahs:35,  type:"Meccan"},
  {n:47, ar:"مُحَمَّد",        en:"Muhammad",        juz:26, ayahs:38,  type:"Medinan"},
  {n:48, ar:"الْفَتْح",        en:"Al-Fath",         juz:26, ayahs:29,  type:"Medinan"},
  {n:49, ar:"الْحُجُرَات",    en:"Al-Hujurat",      juz:26, ayahs:18,  type:"Medinan"},
  {n:50, ar:"ق",                en:"Qaf",             juz:26, ayahs:45,  type:"Meccan"},
  {n:51, ar:"الذَّارِيَات",   en:"Adh-Dhariyat",   juz:26, ayahs:60,  type:"Meccan"},
  {n:52, ar:"الطُّور",          en:"At-Tur",          juz:27, ayahs:49,  type:"Meccan"},
  {n:53, ar:"النَّجْم",        en:"An-Najm",         juz:27, ayahs:62,  type:"Meccan"},
  {n:54, ar:"الْقَمَر",        en:"Al-Qamar",        juz:27, ayahs:55,  type:"Meccan"},
  {n:55, ar:"الرَّحْمَن",      en:"Ar-Rahman",       juz:27, ayahs:78,  type:"Medinan"},
  {n:56, ar:"الْوَاقِعَة",    en:"Al-Waqi'a",       juz:27, ayahs:96,  type:"Meccan"},
  {n:57, ar:"الْحَدِيد",      en:"Al-Hadid",        juz:27, ayahs:29,  type:"Medinan"},
  {n:58, ar:"الْمُجَادِلَة",  en:"Al-Mujadila",     juz:28, ayahs:22,  type:"Medinan"},
  {n:59, ar:"الْحَشْر",        en:"Al-Hashr",        juz:28, ayahs:24,  type:"Medinan"},
  {n:60, ar:"الْمُمْتَحَنَة", en:"Al-Mumtahana",    juz:28, ayahs:13,  type:"Medinan"},
  {n:61, ar:"الصَّف",          en:"As-Saf",          juz:28, ayahs:14,  type:"Medinan"},
  {n:62, ar:"الْجُمُعَة",     en:"Al-Jum'a",        juz:28, ayahs:11,  type:"Medinan"},
  {n:63, ar:"الْمُنَافِقُون", en:"Al-Munafiqun",    juz:28, ayahs:11,  type:"Medinan"},
  {n:64, ar:"التَّغَابُن",    en:"At-Taghabun",     juz:28, ayahs:18,  type:"Medinan"},
  {n:65, ar:"الطَّلَاق",      en:"At-Talaq",        juz:28, ayahs:12,  type:"Medinan"},
  {n:66, ar:"التَّحْرِيم",    en:"At-Tahrim",       juz:28, ayahs:12,  type:"Medinan"},
  {n:67, ar:"الْمُلْك",        en:"Al-Mulk",         juz:29, ayahs:30,  type:"Meccan"},
  {n:68, ar:"الْقَلَم",        en:"Al-Qalam",        juz:29, ayahs:52,  type:"Meccan"},
  {n:69, ar:"الْحَاقَّة",     en:"Al-Haqqah",       juz:29, ayahs:52,  type:"Meccan"},
  {n:70, ar:"الْمَعَارِج",    en:"Al-Ma'arij",      juz:29, ayahs:44,  type:"Meccan"},
  {n:71, ar:"نُوح",             en:"Nuh",             juz:29, ayahs:28,  type:"Meccan"},
  {n:72, ar:"الْجِن",          en:"Al-Jinn",         juz:29, ayahs:28,  type:"Meccan"},
  {n:73, ar:"الْمُزَّمِّل",   en:"Al-Muzzammil",    juz:29, ayahs:20,  type:"Meccan"},
  {n:74, ar:"الْمُدَّثِّر",   en:"Al-Muddaththir",  juz:29, ayahs:56,  type:"Meccan"},
  {n:75, ar:"الْقِيَامَة",    en:"Al-Qiyama",       juz:29, ayahs:40,  type:"Meccan"},
  {n:76, ar:"الْإِنسَان",     en:"Al-Insan",        juz:29, ayahs:31,  type:"Medinan"},
  {n:77, ar:"الْمُرْسَلَات",  en:"Al-Mursalat",     juz:29, ayahs:50,  type:"Meccan"},
  {n:78, ar:"النَّبَأ",        en:"An-Naba",         juz:30, ayahs:40,  type:"Meccan"},
  {n:79, ar:"النَّازِعَات",   en:"An-Nazi'at",      juz:30, ayahs:46,  type:"Meccan"},
  {n:80, ar:"عَبَسَ",          en:"Abasa",           juz:30, ayahs:42,  type:"Meccan"},
  {n:81, ar:"التَّكْوِير",    en:"At-Takwir",       juz:30, ayahs:29,  type:"Meccan"},
  {n:82, ar:"الْإِنفِطَار",   en:"Al-Infitar",      juz:30, ayahs:19,  type:"Meccan"},
  {n:83, ar:"الْمُطَفِّفِين", en:"Al-Mutaffifin",   juz:30, ayahs:36,  type:"Meccan"},
  {n:84, ar:"الِانشِقَاق",    en:"Al-Inshiqaq",     juz:30, ayahs:25,  type:"Meccan"},
  {n:85, ar:"الْبُرُوج",      en:"Al-Buruj",        juz:30, ayahs:22,  type:"Meccan"},
  {n:86, ar:"الطَّارِق",      en:"At-Tariq",        juz:30, ayahs:17,  type:"Meccan"},
  {n:87, ar:"الْأَعْلَى",     en:"Al-A'la",         juz:30, ayahs:19,  type:"Meccan"},
  {n:88, ar:"الْغَاشِيَة",    en:"Al-Ghashiya",     juz:30, ayahs:26,  type:"Meccan"},
  {n:89, ar:"الْفَجْر",        en:"Al-Fajr",         juz:30, ayahs:30,  type:"Meccan"},
  {n:90, ar:"الْبَلَد",        en:"Al-Balad",        juz:30, ayahs:20,  type:"Meccan"},
  {n:91, ar:"الشَّمْس",        en:"Ash-Shams",       juz:30, ayahs:15,  type:"Meccan"},
  {n:92, ar:"اللَّيْل",        en:"Al-Layl",         juz:30, ayahs:21,  type:"Meccan"},
  {n:93, ar:"الضُّحَى",        en:"Ad-Duha",         juz:30, ayahs:11,  type:"Meccan"},
  {n:94, ar:"الشَّرْح",        en:"Ash-Sharh",       juz:30, ayahs:8,   type:"Meccan"},
  {n:95, ar:"التِّين",          en:"At-Tin",          juz:30, ayahs:8,   type:"Meccan"},
  {n:96, ar:"الْعَلَق",        en:"Al-Alaq",         juz:30, ayahs:19,  type:"Meccan"},
  {n:97, ar:"الْقَدْر",        en:"Al-Qadr",         juz:30, ayahs:5,   type:"Meccan"},
  {n:98, ar:"الْبَيِّنَة",    en:"Al-Bayyina",      juz:30, ayahs:8,   type:"Medinan"},
  {n:99, ar:"الزَّلْزَلَة",   en:"Az-Zalzala",      juz:30, ayahs:8,   type:"Medinan"},
  {n:100,ar:"الْعَادِيَات",   en:"Al-Adiyat",       juz:30, ayahs:11,  type:"Meccan"},
  {n:101,ar:"الْقَارِعَة",    en:"Al-Qari'a",       juz:30, ayahs:11,  type:"Meccan"},
  {n:102,ar:"التَّكَاثُر",    en:"At-Takathur",     juz:30, ayahs:8,   type:"Meccan"},
  {n:103,ar:"الْعَصْر",        en:"Al-Asr",          juz:30, ayahs:3,   type:"Meccan"},
  {n:104,ar:"الْهُمَزَة",     en:"Al-Humaza",       juz:30, ayahs:9,   type:"Meccan"},
  {n:105,ar:"الْفِيل",         en:"Al-Fil",          juz:30, ayahs:5,   type:"Meccan"},
  {n:106,ar:"قُرَيْش",         en:"Quraysh",         juz:30, ayahs:4,   type:"Meccan"},
  {n:107,ar:"الْمَاعُون",     en:"Al-Ma'un",        juz:30, ayahs:7,   type:"Meccan"},
  {n:108,ar:"الْكَوْثَر",     en:"Al-Kawthar",      juz:30, ayahs:3,   type:"Meccan"},
  {n:109,ar:"الْكَافِرُون",   en:"Al-Kafirun",      juz:30, ayahs:6,   type:"Meccan"},
  {n:110,ar:"النَّصْر",        en:"An-Nasr",         juz:30, ayahs:3,   type:"Medinan"},
  {n:111,ar:"الْمَسَد",        en:"Al-Masad",        juz:30, ayahs:5,   type:"Meccan"},
  {n:112,ar:"الْإِخْلَاص",    en:"Al-Ikhlas",       juz:30, ayahs:4,   type:"Meccan"},
  {n:113,ar:"الْفَلَق",        en:"Al-Falaq",        juz:30, ayahs:5,   type:"Meccan"},
  {n:114,ar:"النَّاس",          en:"An-Nas",          juz:30, ayahs:6,   type:"Meccan"},
];

const JUZ_STARTS: Record<number,{surah:number;ayah:number}> = {
  1:{surah:1,ayah:1}, 2:{surah:2,ayah:142}, 3:{surah:2,ayah:253}, 4:{surah:3,ayah:92},
  5:{surah:4,ayah:24}, 6:{surah:4,ayah:148}, 7:{surah:5,ayah:82}, 8:{surah:6,ayah:111},
  9:{surah:7,ayah:87}, 10:{surah:8,ayah:40}, 11:{surah:9,ayah:93}, 12:{surah:11,ayah:6},
  13:{surah:12,ayah:53}, 14:{surah:15,ayah:1}, 15:{surah:17,ayah:1}, 16:{surah:18,ayah:75},
  17:{surah:21,ayah:1}, 18:{surah:23,ayah:1}, 19:{surah:25,ayah:21}, 20:{surah:27,ayah:56},
  21:{surah:29,ayah:46}, 22:{surah:33,ayah:31}, 23:{surah:36,ayah:28}, 24:{surah:39,ayah:32},
  25:{surah:41,ayah:47}, 26:{surah:46,ayah:1}, 27:{surah:51,ayah:31}, 28:{surah:58,ayah:1},
  29:{surah:67,ayah:1}, 30:{surah:78,ayah:1},
};

export default function QuranBrowserPage() {
  const [view,    setView]    = useState<"surah"|"juz">("surah");
  const [search,  setSearch]  = useState("");
  const [selJuz,  setSelJuz]  = useState<number|null>(null);

  const handleSignOut = async() => {
    await fetch("/api/auth/signout",{method:"POST"});
    window.location.href="/signin";
  };

  const filtered = SURAHS.filter(s =>
    !search ||
    s.en.toLowerCase().includes(search.toLowerCase()) ||
    s.ar.includes(search) ||
    String(s.n).includes(search)
  );

  const juzSurahs = selJuz ? SURAHS.filter(s => s.juz === selJuz) : [];

  return (
    <div style={{ minHeight:"100vh", background:"#0a1510", color:"white", fontFamily:"'Inter',sans-serif" }}>

      {/* Google Fonts for Arabic */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=Cormorant+Garamond:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Nav */}
      <nav style={{ background:"#0D1F17", borderBottom:"1px solid #1a2e22", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"white",fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold="#C4882A"/>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"white", lineHeight:1 }}>Quran Module</div>
            <div style={{ fontFamily:"monospace", fontSize:8, color:"#10B981", letterSpacing:2 }}>Powered by Tanzil.net · Al-Quran Cloud</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.3)" }}>Text: Tanzil.net (CC) · Audio: Islamic.Network CDN</span>
          <button onClick={handleSignOut} style={{ padding:"6px 12px",borderRadius:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 20px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontFamily:"'Scheherazade New',serif", fontSize:"clamp(28px,5vw,52px)", color:"#C4882A", lineHeight:1.6, marginBottom:8 }}>
            الْقُرْآنُ الْكَرِيم
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:700, color:"white", margin:"0 0 6px" }}>
            Quran Reference Module
          </h1>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:"rgba(255,255,255,0.4)", margin:0 }}>
            Arabic text · Urdu translation · Audio recitation · Memorization tools
          </p>
        </div>

        {/* View toggle + Search */}
        <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.05)", borderRadius:10, padding:3 }}>
            {[{id:"surah",label:"By Surah"},{id:"juz",label:"By Juz"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id as any)} style={{ padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",background:view===v.id?"#10B981":"transparent",color:view===v.id?"#052e16":"rgba(255,255,255,0.5)",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700 }}>{v.label}</button>
            ))}
          </div>
          {view==="surah"&&(
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or number..."
              style={{ flex:1,minWidth:200,padding:"9px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,fontSize:12,fontFamily:"'Inter',sans-serif",color:"white",outline:"none" }}/>
          )}
        </div>

        {/* ── SURAH VIEW ── */}
        {view==="surah"&&(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
            {filtered.map(s=>(
              <Link key={s.n} href={`/dashboard/admin/quran/${s.n}`} style={{ textDecoration:"none" }}>
                <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", gap:12, alignItems:"center", transition:"background 0.15s" }}>
                  {/* Number */}
                  <div style={{ width:36,height:36,borderRadius:10,background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <span style={{ fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#10B981" }}>{s.n}</span>
                  </div>
                  {/* Names */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Scheherazade New',serif",fontSize:16,color:"white",direction:"rtl",textAlign:"left",lineHeight:1.3,marginBottom:2 }}>{s.ar}</div>
                    <div style={{ fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(255,255,255,0.5)" }}>{s.en}</div>
                    <div style={{ display:"flex",gap:6,marginTop:3 }}>
                      <span style={{ fontFamily:"monospace",fontSize:8,color:"rgba(16,185,129,0.6)" }}>Juz {s.juz}</span>
                      <span style={{ fontFamily:"monospace",fontSize:8,color:"rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontFamily:"monospace",fontSize:8,color:"rgba(255,255,255,0.3)" }}>{s.ayahs} ayahs</span>
                      <span style={{ fontFamily:"monospace",fontSize:8,color:"rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontFamily:"monospace",fontSize:8,color:s.type==="Meccan"?"rgba(196,136,42,0.6)":"rgba(96,165,250,0.6)" }}>{s.type}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── JUZ VIEW ── */}
        {view==="juz"&&(
          <div>
            {/* Juz grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:24 }}>
              {Array.from({length:30},(_,i)=>{
                const juz    = i+1;
                const start  = JUZ_STARTS[juz];
                const surah  = SURAHS.find(s=>s.n===start?.surah);
                return (
                  <button key={juz} onClick={()=>setSelJuz(selJuz===juz?null:juz)}
                    style={{ padding:"12px 8px",borderRadius:12,border:`1.5px solid ${selJuz===juz?"#10B981":"rgba(255,255,255,0.1)"}`,background:selJuz===juz?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"center" }}>
                    <div style={{ fontFamily:"monospace",fontSize:16,fontWeight:700,color:selJuz===juz?"#10B981":"white" }}>{juz}</div>
                    <div style={{ fontFamily:"'Scheherazade New',serif",fontSize:11,color:selJuz===juz?"rgba(16,185,129,0.8)":"rgba(255,255,255,0.3)",marginTop:2 }}>{surah?.ar}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Juz surahs */}
            {selJuz&&(
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"white",marginBottom:16 }}>
                  Juz {selJuz} — {juzSurahs.length} Surah{juzSurahs.length!==1?"s":""}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
                  {juzSurahs.map(s=>(
                    <Link key={s.n} href={`/dashboard/admin/quran/${s.n}`} style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"14px 16px",border:"1px solid rgba(16,185,129,0.2)",cursor:"pointer",display:"flex",gap:12,alignItems:"center" }}>
                        <div style={{ width:36,height:36,borderRadius:10,background:"rgba(16,185,129,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <span style={{ fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#10B981" }}>{s.n}</span>
                        </div>
                        <div>
                          <div style={{ fontFamily:"'Scheherazade New',serif",fontSize:16,color:"white",direction:"rtl",textAlign:"left" }}>{s.ar}</div>
                          <div style={{ fontFamily:"'Inter',sans-serif",fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2 }}>{s.en} · {s.ayahs} ayahs</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attribution */}
        <div style={{ textAlign:"center",marginTop:40,padding:"16px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily:"'Inter',sans-serif",fontSize:10,color:"rgba(255,255,255,0.2)",lineHeight:1.7 }}>
            Quran text sourced from <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer" style={{ color:"rgba(16,185,129,0.5)" }}>Tanzil.net</a> (Creative Commons) · Audio from <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer" style={{ color:"rgba(16,185,129,0.5)" }}>Al-Quran Cloud</a> & Islamic Network CDN · Translations via Al-Quran Cloud API
          </div>
        </div>
      </div>
    </div>
  );
}
