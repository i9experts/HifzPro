"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";
import { SURAHS, JUZ_STARTS } from "@/lib/quran-data";

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
