"use client";
import { useState, useEffect, useRef } from "react";
import HifzMark, { HifzWordmark } from "@/components/ui/HifzMark";
import Link from "next/link";

const G = {
  deep:   "#050D0A", dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary:"#10B981", gold:"#C4882A", white:"#FFFFFF",
  dim:    "rgba(255,255,255,0.55)", faint:"rgba(255,255,255,0.08)",
};
const serif  = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";
const mono   = "'JetBrains Mono','Fira Code','Courier New',monospace";
const sans   = "'Inter','Segoe UI',system-ui,sans-serif";

const MODULES = [
  { icon:"👨‍🎓", title:"Student Management",   desc:"5-step enrollment wizard, 6-tab profile, photo upload, documents",       tag:"Core" },
  { icon:"📖", title:"Hifz Diary",             desc:"Daily Sabaq, Sabqi, Manzil recording with grade and mistake tracking",    tag:"Core" },
  { icon:"📋", title:"Attendance",             desc:"One-tap dot grid, absence reasons, parent auto-notify",                   tag:"Core" },
  { icon:"👨‍🏫", title:"Asatidha Management",   desc:"Add Ustadh, 3-step wizard, qualifications, performance analytics",        tag:"Core" },
  { icon:"👨‍👩‍👦", title:"Parent Portal",         desc:"Mobile-first, 5 tabs, multi-child, live progress tracking",               tag:"Core" },
  { icon:"💬", title:"WhatsApp Integration",   desc:"7 bilingual Urdu/English templates, auto-send on lesson entry",           tag:"Core" },
  { icon:"📊", title:"Admin Analytics",        desc:"Dropout risk scoring, Manzil health map, 6-tab insight dashboard",        tag:"Intelligence" },
  { icon:"🧠", title:"Mutashabihat Module",    desc:"35 classical pairs, AI priority scoring, Manzil alerts",                  tag:"Intelligence" },
  { icon:"📈", title:"Attendance Reports",     desc:"Calendar heatmap, batch comparison, chronic absentees, print to PDF",     tag:"Reporting" },
  { icon:"📝", title:"Test & Assessment",      desc:"7 test types, 30-Para visual board, WhatsApp result notifications",       tag:"Core" },
  { icon:"👥", title:"Batch Management",       desc:"Create Halqas, assign Ustadh, two-panel student assignment",              tag:"Core" },
  { icon:"🏆", title:"Sanad & Certificates",  desc:"3 templates, QR verification, bilingual, PDF download",                   tag:"Premium" },
  { icon:"💰", title:"Fee Management",         desc:"Fee structures, payment recording, receipts, scholarship management",      tag:"Premium" },
  { icon:"🎓", title:"Scholarship Manager",    desc:"Full/partial waivers, merit/need-based, automatic discount application",   tag:"Premium" },
  { icon:"🏫", title:"Multi-Campus Support",   desc:"One institution, multiple campuses, unified analytics",                   tag:"Enterprise" },
  { icon:"🆔", title:"Onboarding Flow",        desc:"5-step guided setup — live institution in under 5 minutes",               tag:"Platform" },
  { icon:"📱", title:"PWA Ready",              desc:"Install as app on iPhone/Android, offline-capable parent portal",         tag:"Platform" },
  { icon:"🔐", title:"Super Admin Panel",      desc:"SaaS control center — institutions, subscriptions, revenue",              tag:"Platform" },
];
const TAG_COLORS: Record<string,{color:string;bg:string}> = {
  Core:         { color:"#10B981", bg:"rgba(16,185,129,0.12)" },
  Intelligence: { color:"#a78bfa", bg:"rgba(167,139,250,0.12)" },
  Reporting:    { color:"#60a5fa", bg:"rgba(96,165,250,0.12)" },
  Premium:      { color:"#fbbf24", bg:"rgba(251,191,36,0.12)" },
  Enterprise:   { color:"#f97316", bg:"rgba(249,115,22,0.12)" },
  Platform:     { color:"#34d399", bg:"rgba(52,211,153,0.12)" },
};
const PLANS = [
  { name:"Free Trial", nameUr:"مفت ٹرائل", price:0,    period:"14 days",  color:"#6b7280", highlight:false, students:"Up to 20",  features:["All Core Modules","WhatsApp Updates","Parent Portal","Email Support"] },
  { name:"Basic",      nameUr:"بنیادی",     price:2999, period:"/ month",  color:"#60a5fa", highlight:false, students:"Up to 50",  features:["Everything in Trial","Attendance Reports","Test Module","Batch Management"] },
  { name:"Professional",nameUr:"پروفیشنل",  price:5999, period:"/ month",  color:G.primary, highlight:true,  students:"Up to 200", features:["Everything in Basic","Fee Management","Sanad/Certificates","Analytics","Priority Support"] },
  { name:"Enterprise", nameUr:"انٹرپرائز",  price:9999, period:"/ month",  color:G.gold,    highlight:false, students:"Unlimited",  features:["Everything in Pro","Multi-Campus","Mutashabihat AI","Super Admin Access","Dedicated Support"] },
];
const HOW = [
  { step:"01", icon:"📝", title:"Sign Up Free",        desc:"Create your institution account in 2 minutes. No credit card, no commitment.",  arabic:"سجّل مجاناً" },
  { step:"02", icon:"⚙️", title:"5-Minute Setup",       desc:"Our wizard guides you: add your campus, Ustadh, create a Halqa, enroll first student.", arabic:"الإعداد في 5 دقائق" },
  { step:"03", icon:"🚀", title:"Go Live Immediately",  desc:"Start recording lessons, WhatsApp updates go to parents automatically from Day 1.", arabic:"ابدأ فوراً" },
];
const STATS = [
  { val:"18+",  label:"Live Modules",        arabic:"وحدة نشطة" },
  { val:"100%", label:"WhatsApp Automated",  arabic:"واتساب تلقائي" },
  { val:"5min", label:"Setup Time",          arabic:"وقت الإعداد" },
  { val:"3",    label:"Certificate Templates",arabic:"نماذج السند" },
];
const PAKISTAN_FEATURES = [
  "🇵🇰 Urdu interface & WhatsApp templates",
  "📱 JazzCash & EasyPaisa payment tracking",
  "📖 Madani 15-line mushaf page references",
  "🌙 Hijri date on all certificates",
  "🕌 Fajr/Asr/Isha session time scheduling",
  "💳 PKR billing in all fee modules",
];

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeTab,  setActiveTab]  = useState("Core");
  const [isMobile,   setIsMobile]   = useState(false);
  const [isTablet,   setIsTablet]   = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const filteredModules = activeTab === "All" ? MODULES : MODULES.filter(m => m.tag === activeTab);

  return (
    <div style={{ background:G.deep, minHeight:"100vh", color:G.white, fontFamily:sans }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", background: scrolled?"rgba(5,13,10,0.97)":"rgba(5,13,10,0.85)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${scrolled?G.border:"transparent"}`, transition:"all 0.3s" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", textDecoration:"none" }}>
          <HifzWordmark size={isMobile?30:36} textColor="#10B981" goldColor="#C4882A" />
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display:"flex", gap:24, alignItems:"center" }}>
            {["Features","Pricing","About"].map(l=>(
             <a key={l} href={l === "About" ? "/about" : `#${l.toLowerCase()}`} style={{ fontSize:13, color:G.dim, textDecoration:"none" }}>{l}</a>
            ))}
            <Link href="/signin" style={{ fontSize:13, color:G.dim, textDecoration:"none" }}>Sign In</Link>
            <Link href="/signup" style={{ padding:"8px 18px", borderRadius:8, background:G.primary, color:G.dark, fontSize:12, fontWeight:700, textDecoration:"none" }}>
              Get Started Free
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMobileMenu(!mobileMenu)} style={{ background:"none", border:"none", color:G.white, fontSize:22, cursor:"pointer", padding:"4px 8px" }}>
            {mobileMenu ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && mobileMenu && (
        <div style={{ position:"fixed", top:60, left:0, right:0, zIndex:99, background:"rgba(5,13,10,0.98)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${G.border}`, padding:"20px", display:"flex", flexDirection:"column", gap:0 }}>
          {["Features","Pricing","About"].map(l=>(
            <a key={l} href={l === "About" ? "/about" : `#${l.toLowerCase()}`} onClick={()=>setMobileMenu(false)} style={{ padding:"14px 0", fontSize:16, color:G.white, textDecoration:"none", borderBottom:`1px solid ${G.border}`, fontFamily:sans, fontWeight:500 }}>{l}</a>
          ))}
          <Link href="/signin" onClick={()=>setMobileMenu(false)} style={{ padding:"14px 0", fontSize:16, color:G.dim, textDecoration:"none", borderBottom:`1px solid ${G.border}` }}>Sign In</Link>
          <Link href="/signup" onClick={()=>setMobileMenu(false)} style={{ marginTop:16, padding:"14px", borderRadius:10, background:G.primary, color:G.dark, fontSize:15, fontWeight:700, textDecoration:"none", textAlign:"center" }}>
            Get Started Free →
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:isMobile?"100px 20px 60px":"120px 24px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:isMobile?300:600, height:isMobile?300:600, background:"radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)", pointerEvents:"none" }}/>

        {!isMobile && (
          <>
            <svg style={{ position:"absolute", top:80, right:"5%", opacity:0.04 }} width="300" height="300" viewBox="0 0 200 200">
              {[...Array(6)].map((_,i)=><polygon key={i} points={`100,${10+i*8} ${185-i*8},${55+i*4} ${185-i*8},${145-i*4} ${100},${190-i*8} ${15+i*8},${145-i*4} ${15+i*8},${55+i*4}`} fill="none" stroke="white" strokeWidth="0.5"/>)}
            </svg>
            <svg style={{ position:"absolute", bottom:80, left:"5%", opacity:0.04 }} width="200" height="200" viewBox="0 0 200 200">
              {[...Array(5)].map((_,i)=><polygon key={i} points={`100,${10+i*10} ${180-i*10},${100} ${100},${190-i*10} ${20+i*10},${100}`} fill="none" stroke="white" strokeWidth="0.5"/>)}
            </svg>
          </>
        )}

        {/* Badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:999, background:G.faint, border:`1px solid ${G.border}`, marginBottom:24 }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:G.primary }}/>
          <span style={{ fontFamily:mono, fontSize:isMobile?9:11, color:G.primary, letterSpacing:1 }}>PAKISTAN'S FIRST INTELLIGENT HIFZ PLATFORM</span>
        </div>

        {/* Arabic headline */}
        <div style={{ fontFamily:arabic, fontSize:isMobile?"20px":"clamp(22px,4vw,36px)", color:G.gold, marginBottom:12, opacity:0.8 }}>
          إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
        </div>

        {/* Main headline */}
        <h1 style={{ fontFamily:serif, fontSize:isMobile?"2.4rem":"clamp(2.8rem,7vw,5.5rem)", fontWeight:700, color:G.white, margin:"0 0 20px", lineHeight:1.1, maxWidth:900 }}>
          The Complete Platform<br/>
          <span style={{ color:G.primary }}>for Hifz Management</span>
        </h1>

        <p style={{ fontFamily:sans, fontSize:isMobile?"14px":"clamp(14px,2vw,18px)", color:G.dim, maxWidth:560, margin:"0 auto 32px", lineHeight:1.75 }}>
          Track every student's memorization journey, automate parent updates via WhatsApp, and grow your Hifz program — all in one place.
        </p>

        {/* CTA buttons */}
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:40 }}>
          <Link href="/signup" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:isMobile?"13px 24px":"15px 32px", borderRadius:12, background:G.primary, color:G.dark, fontSize:isMobile?14:15, fontWeight:700, textDecoration:"none", boxShadow:"0 6px 28px rgba(16,185,129,0.35)" } as any}>
            Start Free 14-Day Trial →
          </Link>
          <Link href="/signin" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:isMobile?"13px 20px":"15px 28px", borderRadius:12, background:"transparent", color:G.white, fontSize:isMobile?14:15, fontWeight:600, textDecoration:"none", border:`1px solid ${G.border}` } as any}>
            Sign In
          </Link>
        </div>

        {/* Stats strip — 2x2 on mobile */}
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:0, background:G.card, borderRadius:16, border:`1px solid ${G.border}`, overflow:"hidden", maxWidth:isMobile?"100%":640, width:"100%" }}>
          {STATS.map((s,i)=>(
            <div key={i} style={{ padding:"14px 8px", textAlign:"center", borderRight:isMobile?(i%2===0?`1px solid ${G.border}`:"none"):(i<3?`1px solid ${G.border}`:"none"), borderBottom:isMobile&&i<2?`1px solid ${G.border}`:"none" }}>
              <div style={{ fontFamily:mono, fontSize:isMobile?18:22, fontWeight:700, color:G.primary }}>{s.val}</div>
              <div style={{ fontFamily:sans, fontSize:9, color:G.dim, marginTop:2 }}>{s.label}</div>
              <div style={{ fontFamily:arabic, fontSize:9, color:"rgba(255,255,255,0.2)", marginTop:1 }}>{s.arabic}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:isMobile?"48px 20px":"80px 24px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:isMobile?32:56 }}>
          <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>GETTING STARTED</div>
          <h2 style={{ fontFamily:serif, fontSize:isMobile?"1.9rem":"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:"0 0 12px" }}>Live in 5 Minutes</h2>
          <p style={{ fontFamily:sans, fontSize:14, color:G.dim }}>No IT team needed. No training required. Just sign up and go.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(3,1fr)":"repeat(3,1fr)", gap:isMobile?14:20 }}>
          {HOW.map((h,i)=>(
            <div key={i} style={{ background:G.card, borderRadius:16, padding:isMobile?"20px":"28px", border:`1px solid ${G.border}`, textAlign:"center", position:"relative" }}>
              <div style={{ fontFamily:mono, fontSize:28, fontWeight:700, color:G.border, position:"absolute", top:12, right:16, lineHeight:1 }}>{h.step}</div>
              <div style={{ fontSize:32, marginBottom:10 }}>{h.icon}</div>
              <div style={{ fontFamily:arabic, fontSize:13, color:G.gold, marginBottom:5, opacity:0.7 }}>{h.arabic}</div>
              <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:G.white, margin:"0 0 8px" }}>{h.title}</h3>
              <p style={{ fontFamily:sans, fontSize:13, color:G.dim, lineHeight:1.7, margin:0 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES / MODULES ── */}
      <section id="features" style={{ padding:isMobile?"48px 20px":"80px 24px", background:G.dark }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:isMobile?28:48 }}>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>COMPLETE FEATURE SET</div>
            <h2 style={{ fontFamily:serif, fontSize:isMobile?"1.9rem":"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:"0 0 12px" }}>Everything Your Institution Needs</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim, maxWidth:500, margin:"0 auto" }}>18 fully integrated modules — from lesson diaries to certificates, fees to AI intelligence.</p>
          </div>

          {/* Tag filter — scrollable on mobile */}
          <div style={{ display:"flex", gap:8, justifyContent:isMobile?"flex-start":"center", flexWrap:isMobile?"nowrap":"wrap", marginBottom:28, overflowX:isMobile?"auto":"visible", paddingBottom:isMobile?8:0 }}>
            {["All","Core","Intelligence","Reporting","Premium","Enterprise","Platform"].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${activeTab===t?TAG_COLORS[t]?.color||G.primary:G.border}`, background:activeTab===t?`${TAG_COLORS[t]?.color||G.primary}15`:G.faint, color:activeTab===t?TAG_COLORS[t]?.color||G.primary:G.dim, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:sans, whiteSpace:"nowrap", flexShrink:0 }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {filteredModules.map((m,i)=>{
              const tc = TAG_COLORS[m.tag] || { color:G.primary, bg:"rgba(16,185,129,0.12)" };
              return (
                <div key={i} style={{ background:G.card, borderRadius:14, padding:"18px 16px", border:`1px solid ${G.border}`, borderTop:`2px solid ${tc.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:26 }}>{m.icon}</span>
                    <span style={{ background:tc.bg, color:tc.color, padding:"2px 8px", borderRadius:5, fontSize:9, fontFamily:mono, fontWeight:700 }}>{m.tag}</span>
                  </div>
                  <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, color:G.white, margin:"0 0 6px" }}>{m.title}</h3>
                  <p style={{ fontFamily:sans, fontSize:12, color:G.dim, margin:0, lineHeight:1.65 }}>{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOR PAKISTAN SECTION ── */}
      <section style={{ padding:isMobile?"48px 20px":"80px 24px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ background:G.card, borderRadius:20, padding:isMobile?"28px 20px":"48px 40px", border:`1px solid ${G.border}`, display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:isMobile?28:40, alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.gold, marginBottom:12 }}>BUILT FOR YOUR CONTEXT</div>
            <h2 style={{ fontFamily:serif, fontSize:isMobile?"1.6rem":"clamp(1.6rem,3vw,2.5rem)", fontWeight:700, color:G.white, margin:"0 0 16px", lineHeight:1.2 }}>Designed for Pakistan. Ready for the World.</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim, lineHeight:1.8, marginBottom:20 }}>
              Every detail is tailored to how Pakistani Islamic institutions work — Urdu WhatsApp templates, JazzCash/EasyPaisa, Madani mushaf references, Hijri calendar, and bilingual interface.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {PAKISTAN_FEATURES.map((f,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:G.primary, flexShrink:0 }}/>
                  <span style={{ fontFamily:sans, fontSize:13, color:G.dim }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:arabic, fontSize:isMobile?"32px":"clamp(36px,5vw,64px)", color:G.gold, lineHeight:1.5, opacity:0.85 }}>
              حِفْظُ الْقُرْآنِ<br/>
              <span style={{ fontSize:"0.5em", color:"rgba(255,255,255,0.3)" }}>في عصر التقنية</span>
            </div>
            <div style={{ fontFamily:sans, fontSize:12, color:G.dim, marginTop:16 }}>Quran Memorization · In the Age of Technology</div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:isMobile?"48px 20px":"80px 24px", background:G.dark }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:isMobile?32:56 }}>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>TRANSPARENT PRICING</div>
            <h2 style={{ fontFamily:serif, fontSize:isMobile?"1.9rem":"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:"0 0 12px" }}>Simple, Honest Pricing</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim }}>No hidden fees. Cancel anytime. All prices in PKR.</p>
          </div>

          {/* Pricing grid — 1 col mobile, 2 col tablet, 4 col desktop */}
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(4,1fr)", gap:14 }}>
            {PLANS.map((p,i)=>(
              <div key={i} style={{ background:p.highlight?"linear-gradient(160deg,#0A2E1A,#052e16)":G.card, borderRadius:18, padding:isMobile?"20px":"24px", border:`1px solid ${p.highlight?G.primary:G.border}`, position:"relative", boxShadow:p.highlight?"0 0 40px rgba(16,185,129,0.2)":"none" }}>
                {p.highlight && (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:G.primary, color:G.dark, padding:"4px 14px", borderRadius:999, fontFamily:mono, fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily:arabic, fontSize:14, color:p.color, marginBottom:4, opacity:0.7 }}>{p.nameUr}</div>
                <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:G.white, marginBottom:12 }}>{p.name}</div>
                <div style={{ marginBottom:8 }}>
                  {p.price===0
                    ? <span style={{ fontFamily:mono, fontSize:28, fontWeight:700, color:p.color }}>Free</span>
                    : <><span style={{ fontFamily:mono, fontSize:28, fontWeight:700, color:p.color }}>PKR {p.price.toLocaleString()}</span><span style={{ fontFamily:sans, fontSize:11, color:G.dim }}>{p.period}</span></>
                  }
                </div>
                <div style={{ fontFamily:sans, fontSize:12, color:G.dim, marginBottom:16 }}>Students: <span style={{ color:p.color, fontWeight:700 }}>{p.students}</span></div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                  {p.features.map((f,j)=>(
                    <div key={j} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ color:p.color, fontSize:12 }}>✓</span>
                      <span style={{ fontFamily:sans, fontSize:12, color:G.dim }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display:"block", textAlign:"center", padding:"11px", borderRadius:10, background:p.highlight?G.primary:G.faint, color:p.highlight?G.dark:G.white, fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:sans, border:p.highlight?"none":`1px solid ${G.border}` } as any}>
                  {p.price===0?"Start Free Trial":"Get Started"}
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center", fontFamily:sans, fontSize:12, color:G.dim, marginTop:24 }}>
            All plans include 14-day free trial. WhatsApp support available on all plans.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:isMobile?"60px 20px":"100px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:400, height:400, background:"radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ fontFamily:arabic, fontSize:isMobile?20:28, color:G.gold, marginBottom:16, opacity:0.7 }}>
          ابدأ رحلة الحفظ الرقمية اليوم
        </div>
        <h2 style={{ fontFamily:serif, fontSize:isMobile?"2rem":"clamp(2rem,5vw,4rem)", fontWeight:700, color:G.white, margin:"0 0 16px", lineHeight:1.1 }}>
          Ready to Transform Your<br/>Hifz Program?
        </h2>
        <p style={{ fontFamily:sans, fontSize:isMobile?14:15, color:G.dim, maxWidth:480, margin:"0 auto 32px", lineHeight:1.8 }}>
          Join institutions already using HifzPro. Set up in 5 minutes, see results from day one.
        </p>
        <Link href="/signup" style={{ display:"inline-flex", alignItems:"center", gap:10, padding:isMobile?"13px 28px":"16px 40px", borderRadius:14, background:G.primary, color:G.dark, fontSize:isMobile?14:16, fontWeight:700, textDecoration:"none", fontFamily:sans, boxShadow:"0 8px 32px rgba(16,185,129,0.4)" } as any}>
           Start Free 14-Day Trial →
        </Link>
        <div style={{ fontFamily:sans, fontSize:12, color:G.dim, marginTop:14 }}>
          No credit card · Setup in 5 minutes · Cancel anytime
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:G.dark, borderTop:`1px solid ${G.border}`, padding:isMobile?"40px 20px 28px":"48px 28px 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          {/* Footer grid — stacked on mobile */}
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":isTablet?"1fr 1fr":"2fr 1fr 1fr 1fr", gap:isMobile?28:32, marginBottom:32 }}>
            <div>
              <div style={{ marginBottom:12 }}>
                <HifzWordmark size={34} textColor="#10B981" goldColor="#C4882A" />
              </div>
              <p style={{ fontFamily:sans, fontSize:13, color:G.dim, lineHeight:1.7, maxWidth:280, margin:"0 0 16px" }}>
                Pakistan's first intelligent Hifz Management platform. Built with love for the preservation of the Holy Quran.
              </p>
              <div style={{ fontFamily:arabic, fontSize:16, color:G.gold, opacity:0.6 }}>
                وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
              </div>
            </div>
            {[
              { title:"Platform", links:[["Features","#features"],["Pricing","#pricing"],["About","/about"],["Sign Up","/signup"],["Sign In","/signin"]] },
              { title:"Modules",  links:[["Hifz Diary","#features"],["Attendance","#features"],["Fee Management","#features"],["Sanad/Certificates","#features"]] },
              { title:"Support",  links:[["WhatsApp","https://wa.me/923000000000"],["Email","mailto:support@hifzpro.com"],["Documentation","#"],["Contact","#"]] },
            ].map((col,i)=>(
              <div key={i}>
                <div style={{ fontFamily:mono, fontSize:9, letterSpacing:2, color:G.dim, marginBottom:14 }}>{col.title.toUpperCase()}</div>
                {col.links.map(([label,href],j)=>(
                  <div key={j} style={{ marginBottom:8 }}>
                    <a href={href} style={{ fontFamily:sans, fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>{label}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${G.border}`, paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ fontFamily:sans, fontSize:12, color:"rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} HifzPro® — A product of Edudeen, LLC, thoughtfully designed and engineered. All rights reserved.
            </div>
            <div style={{ fontFamily:mono, fontSize:10, color:G.primary, opacity:0.5 }}>
              www.hifzpro.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
