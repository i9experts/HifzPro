"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { colors, fonts, shadows } from "@/lib/tokens";

const arabic = "'Cairo', sans-serif";

const MODULES = [
  { icon:"👨‍🎓", title:"Student Management",   desc:"5-step enrollment wizard, 6-tab profile, photo upload, documents",       tag:"Core" },
  { icon:"📖",  title:"Hifz Diary",             desc:"Daily Sabaq, Sabqi, Manzil recording with grade and mistake tracking",    tag:"Core" },
  { icon:"📋",  title:"Attendance",             desc:"One-tap dot grid, absence reasons, parent auto-notify",                   tag:"Core" },
  { icon:"👨‍🏫", title:"Asatidha Management",   desc:"Add Ustadh, 3-step wizard, qualifications, performance analytics",        tag:"Core" },
  { icon:"👨‍👩‍👦",title:"Parent Portal",         desc:"Mobile-first, 5 tabs, multi-child, live progress tracking",               tag:"Core" },
  { icon:"💬",  title:"WhatsApp Integration",   desc:"7 bilingual Urdu/English templates, auto-send on lesson entry",           tag:"Core" },
  { icon:"📊",  title:"Admin Analytics",        desc:"Dropout risk scoring, Manzil health map, 6-tab insight dashboard",        tag:"Intelligence" },
  { icon:"🧠",  title:"Mutashabihat Module",    desc:"35 classical pairs, AI priority scoring, Manzil alerts",                  tag:"Intelligence" },
  { icon:"📈",  title:"Attendance Reports",     desc:"Calendar heatmap, batch comparison, chronic absentees, print to PDF",     tag:"Reporting" },
  { icon:"📝",  title:"Test & Assessment",      desc:"7 test types, 30-Para visual board, WhatsApp result notifications",       tag:"Core" },
  { icon:"👥",  title:"Batch Management",       desc:"Create Halqas, assign Ustadh, two-panel student assignment",              tag:"Core" },
  { icon:"🏆",  title:"Sanad & Certificates",  desc:"3 templates, QR verification, bilingual, PDF download",                   tag:"Premium" },
  { icon:"💰",  title:"Fee Management",         desc:"Fee structures, payment recording, receipts, scholarship management",      tag:"Premium" },
  { icon:"🎓",  title:"Scholarship Manager",    desc:"Full/partial waivers, merit/need-based, automatic discount application",   tag:"Premium" },
  { icon:"🏫",  title:"Multi-Campus Support",   desc:"One institution, multiple campuses, unified analytics",                   tag:"Enterprise" },
  { icon:"🆔",  title:"Onboarding Flow",        desc:"5-step guided setup — live institution in under 5 minutes",               tag:"Platform" },
  { icon:"📱",  title:"PWA Ready",              desc:"Install as app on iPhone/Android, offline-capable parent portal",         tag:"Platform" },
  { icon:"🔐",  title:"Super Admin Panel",      desc:"SaaS control center — institutions, subscriptions, revenue",              tag:"Platform" },
];

const TAG_COLORS: Record<string,{color:string;bg:string}> = {
  Core:         { color: colors.primary, bg: colors.green50 },
  Intelligence: { color:"#7c3aed", bg:"#f5f3ff" },
  Reporting:    { color:"#2563eb", bg:"#eff6ff" },
  Premium:      { color:"#b45309", bg:"#fffbeb" },
  Enterprise:   { color:"#c2410c", bg:"#fff7ed" },
  Platform:     { color:"#0f766e", bg:"#f0fdfa" },
};

const PLANS = [
  { name:"Free Trial",    nameUr:"مفت ٹرائل", price:0,    period:"14 days",  color:colors.n500, highlight:false, students:"Up to 20",  features:["All Core Modules","WhatsApp Updates","Parent Portal","Email Support"] },
  { name:"Basic",         nameUr:"بنیادی",     price:2999, period:"/ month",  color:"#2563eb", highlight:false, students:"Up to 50",  features:["Everything in Trial","Attendance Reports","Test Module","Batch Management"] },
  { name:"Professional",  nameUr:"پروفیشنل",   price:5999, period:"/ month",  color:colors.primary, highlight:true,  students:"Up to 200", features:["Everything in Basic","Fee Management","Sanad/Certificates","Analytics","Priority Support"] },
  { name:"Enterprise",    nameUr:"انٹرپرائز",  price:9999, period:"/ month",  color:colors.gold,    highlight:false, students:"Unlimited", features:["Everything in Pro","Multi-Campus","Mutashabihat AI","Super Admin Access","Dedicated Support"] },
];

const HOW = [
  { step:"01", icon:"📝", title:"Sign Up Free",       desc:"Create your institution account in 2 minutes. No credit card, no commitment." },
  { step:"02", icon:"⚙️", title:"5-Minute Setup",      desc:"Our wizard guides you: add your campus, Ustadh, create a Halqa, enroll first student." },
  { step:"03", icon:"🚀", title:"Go Live Immediately", desc:"Start recording lessons, WhatsApp updates go to parents automatically from Day 1." },
];

const STATS = [
  { val:"18+",  label:"Live Modules" },
  { val:"100%", label:"WhatsApp Automated" },
  { val:"5min", label:"Setup Time" },
  { val:"3",    label:"Certificate Templates" },
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
  const [activeTab, setActiveTab] = useState("Core");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth < 640); setIsTablet(window.innerWidth < 1024); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const filteredModules = activeTab === "All" ? MODULES : MODULES.filter(m => m.tag === activeTab);

  return (
    <div style={{ background: colors.white, minHeight: "100vh", color: colors.n800, fontFamily: fonts.body }}>
      <MarketingNav />

      {/* ── HERO ── */}
      <section style={{ padding: isMobile ? "48px 20px 56px" : "80px 24px 90px", textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(180deg, ${colors.green50} 0%, ${colors.white} 65%)` }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: isMobile ? 320 : 700, height: isMobile ? 320 : 700, background: `radial-gradient(circle, rgba(13,92,58,0.10), transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 60, right: "6%", width: 14, height: 14, borderRadius: "50%", background: colors.gold, opacity: 0.5 }} />
        <div style={{ position: "absolute", top: 200, left: "8%", width: 10, height: 10, borderRadius: "50%", background: colors.primary, opacity: 0.4 }} />

        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: colors.white, border: `1px solid ${colors.green200}`, marginBottom: 24, boxShadow: shadows.sm }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary }} />
            <span style={{ fontFamily: fonts.heading, fontSize: isMobile ? 10 : 12, fontWeight: 700, color: colors.primary, letterSpacing: 0.5 }}>PAKISTAN'S FIRST INTELLIGENT HIFZ PLATFORM</span>
          </div>

          <div style={{ fontFamily: arabic, fontSize: isMobile ? 18 : "clamp(20px,3vw,28px)", color: colors.gold, marginBottom: 16, fontWeight: 600 }}>
            إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
          </div>

          <h1 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "2.3rem" : "clamp(2.6rem,6vw,4.4rem)", fontWeight: 800, color: colors.n800, margin: "0 0 20px", lineHeight: 1.08, letterSpacing: -1 }}>
            The Complete Platform<br />
            <span style={{ color: colors.primary }}>for Hifz Management</span>
          </h1>

          <p style={{ fontFamily: fonts.body, fontSize: isMobile ? 15 : "clamp(15px,2vw,19px)", color: colors.n600, maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Track every student's memorization journey, automate parent updates via WhatsApp, and grow your Hifz program — all in one place.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
            <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "14px 26px" : "16px 34px", borderRadius: 999, background: colors.primary, color: colors.white, fontSize: isMobile ? 14 : 16, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, boxShadow: "0 10px 30px rgba(13,92,58,0.35)" }}>
              Start Free 14-Day Trial →
            </Link>
            <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "14px 22px" : "16px 30px", borderRadius: 999, background: colors.white, color: colors.n800, fontSize: isMobile ? 14 : 16, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, border: `1.5px solid ${colors.n200}` }}>
              Book a Demo
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 0, background: colors.white, borderRadius: 18, border: `1px solid ${colors.n200}`, boxShadow: shadows.lg, overflow: "hidden", maxWidth: isMobile ? "100%" : 680, width: "100%", margin: "0 auto" }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: "18px 10px", textAlign: "center", borderRight: isMobile ? (i % 2 === 0 ? `1px solid ${colors.n100}` : "none") : (i < 3 ? `1px solid ${colors.n100}` : "none"), borderBottom: isMobile && i < 2 ? `1px solid ${colors.n100}` : "none" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: colors.primary }}>{s.val}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: isMobile ? "48px 20px" : "88px 24px", maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 56 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 10, fontWeight: 700 }}>GETTING STARTED</div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.8rem" : "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: colors.n800, margin: "0 0 12px" }}>Live in 5 Minutes</h2>
          <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n600 }}>No IT team needed. No training required. Just sign up and go.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 14 : 22 }}>
          {HOW.map((h, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 18, padding: isMobile ? 22 : 30, border: `1px solid ${colors.n200}`, boxShadow: shadows.md, textAlign: "center", position: "relative" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 30, fontWeight: 800, color: colors.n200, position: "absolute", top: 14, right: 18, lineHeight: 1 }}>{h.step}</div>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{h.icon}</div>
              <h3 style={{ fontFamily: fonts.heading, fontSize: 19, fontWeight: 800, color: colors.n800, margin: "0 0 8px" }}>{h.title}</h3>
              <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, lineHeight: 1.7, margin: 0 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARKETPLACE BANNER ── */}
      <section style={{ padding: isMobile ? "0 20px 48px" : "0 24px 88px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ background: `linear-gradient(120deg, ${colors.primary}, ${colors.primaryDark})`, borderRadius: 24, padding: isMobile ? "32px 24px" : "48px 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr", gap: isMobile ? 24 : 32, alignItems: "center", boxShadow: "0 16px 48px rgba(13,92,58,0.3)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.15)", marginBottom: 16 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: colors.goldLight, letterSpacing: 0.5 }}>NEW · TEACHER MARKETPLACE</span>
            </div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.6rem" : "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, color: colors.white, margin: "0 0 12px", lineHeight: 1.15 }}>
              Hire a Qari or Mu'allimah — anywhere in the world
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: 22, maxWidth: 480 }}>
              Browse verified independent teachers by program, language, country, and price. Message them directly, agree on a schedule, and your lessons run through the same Hifz Diary engine institutions use.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/marketplace" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 999, background: colors.white, color: colors.primary, fontSize: 14, fontWeight: 800, textDecoration: "none", fontFamily: fonts.heading }}>
                Find a Teacher →
              </Link>
              <Link href="/marketplace/join/teacher" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 999, background: "rgba(255,255,255,0.12)", color: colors.white, fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, border: "1.5px solid rgba(255,255,255,0.3)" }}>
                Teach on HifzPro
              </Link>
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ fontSize: 120, lineHeight: 1 }}>🧕📖👳</div>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES / MODULES ── */}
      <section id="features" style={{ padding: isMobile ? "48px 20px" : "88px 24px", background: colors.n50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 48 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 10, fontWeight: 700 }}>COMPLETE FEATURE SET</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.8rem" : "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: colors.n800, margin: "0 0 12px" }}>Everything Your Institution Needs</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n600, maxWidth: 520, margin: "0 auto 20px" }}>18 fully integrated modules — from lesson diaries to certificates, fees to AI intelligence.</p>
            <Link href="/features" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 999, border: `1.5px solid ${colors.n200}`, color: colors.primary, fontFamily: fonts.heading, fontSize: 13.5, fontWeight: 700, textDecoration: "none", background: colors.white }}>
              View All 18 Modules →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "nowrap" : "wrap", marginBottom: 28, overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 8 : 0 }}>
            {["All","Core","Intelligence","Reporting","Premium","Enterprise","Platform"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 16px", borderRadius: 999, border: `1.5px solid ${activeTab === t ? (TAG_COLORS[t]?.color || colors.primary) : colors.n200}`, background: activeTab === t ? (TAG_COLORS[t]?.bg || colors.green50) : colors.white, color: activeTab === t ? (TAG_COLORS[t]?.color || colors.primary) : colors.n600, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading, whiteSpace: "nowrap", flexShrink: 0 }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {filteredModules.map((m, i) => {
              const tc = TAG_COLORS[m.tag] || { color: colors.primary, bg: colors.green50 };
              return (
                <div key={i} style={{ background: colors.white, borderRadius: 16, padding: "20px 18px", border: `1px solid ${colors.n200}`, borderTop: `3px solid ${tc.color}`, boxShadow: shadows.sm }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{m.icon}</span>
                    <span style={{ background: tc.bg, color: tc.color, padding: "3px 9px", borderRadius: 999, fontSize: 10, fontFamily: fonts.mono, fontWeight: 700 }}>{m.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 16.5, fontWeight: 800, color: colors.n800, margin: "0 0 6px" }}>{m.title}</h3>
                  <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, margin: 0, lineHeight: 1.65 }}>{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOR PAKISTAN ── */}
      <section style={{ padding: isMobile ? "48px 20px" : "88px 24px", maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ background: colors.white, borderRadius: 24, padding: isMobile ? "28px 20px" : "52px 48px", border: `1px solid ${colors.n200}`, boxShadow: shadows.lg, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 28 : 44, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.gold, marginBottom: 14, fontWeight: 700 }}>BUILT FOR YOUR CONTEXT</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.5rem" : "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: colors.n800, margin: "0 0 16px", lineHeight: 1.2 }}>Designed for Pakistan. Ready for the World.</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14.5, color: colors.n600, lineHeight: 1.8, marginBottom: 22 }}>
              Every detail is tailored to how Pakistani Islamic institutions work — Urdu WhatsApp templates, JazzCash/EasyPaisa, Madani mushaf references, Hijri calendar, and bilingual interface.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {PAKISTAN_FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary, flexShrink: 0 }} />
                  <span style={{ fontFamily: fonts.body, fontSize: 13.5, color: colors.n700 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", background: colors.green50, borderRadius: 18, padding: isMobile ? 24 : 36 }}>
            <div style={{ fontFamily: arabic, fontSize: isMobile ? 28 : "clamp(32px,4vw,52px)", color: colors.gold, lineHeight: 1.5, fontWeight: 700 }}>
              حِفْظُ الْقُرْآنِ
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.n500, marginTop: 12 }}>Quran Memorization · In the Age of Technology</div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: isMobile ? "48px 20px" : "88px 24px", background: colors.n50 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 56 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 10, fontWeight: 700 }}>TRANSPARENT PRICING</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.8rem" : "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: colors.n800, margin: "0 0 12px" }}>Simple, Honest Pricing</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n600, marginBottom: 16 }}>No hidden fees. Cancel anytime. All prices in PKR.</p>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 999, border: `1.5px solid ${colors.n200}`, color: colors.primary, fontFamily: fonts.heading, fontSize: 13.5, fontWeight: 700, textDecoration: "none", background: colors.white }}>
              View Full Pricing & GBP Plans →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 16 }}>
            {PLANS.map((p, i) => (
              <div key={i} style={{ background: colors.white, borderRadius: 20, padding: isMobile ? 22 : 26, border: `1.5px solid ${p.highlight ? colors.primary : colors.n200}`, position: "relative", boxShadow: p.highlight ? "0 16px 40px rgba(13,92,58,0.22)" : shadows.sm }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: colors.primary, color: colors.white, padding: "5px 16px", borderRadius: 999, fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>MOST POPULAR</div>
                )}
                <div style={{ fontFamily: arabic, fontSize: 14, color: p.color, marginBottom: 6, fontWeight: 600 }}>{p.nameUr}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 21, fontWeight: 800, color: colors.n800, marginBottom: 14 }}>{p.name}</div>
                <div style={{ marginBottom: 10 }}>
                  {p.price === 0
                    ? <span style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 800, color: p.color }}>Free</span>
                    : <><span style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 800, color: p.color }}>PKR {p.price.toLocaleString()}</span><span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{" "}{p.period}</span></>
                  }
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.n600, marginBottom: 18 }}>Students: <span style={{ color: p.color, fontWeight: 700 }}>{p.students}</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>✓</span>
                      <span style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.n700 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: 999, background: p.highlight ? colors.primary : colors.n50, color: p.highlight ? colors.white : colors.n800, fontSize: 13.5, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, border: p.highlight ? "none" : `1.5px solid ${colors.n200}` }}>
                  {p.price === 0 ? "Start Free Trial" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontFamily: fonts.body, fontSize: 12.5, color: colors.n500, marginTop: 28 }}>
            All plans include 14-day free trial. WhatsApp support available on all plans.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: isMobile ? "56px 20px" : "100px 24px", textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 420, height: 420, background: "radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontFamily: arabic, fontSize: isMobile ? 18 : 24, color: colors.goldLight, marginBottom: 18, fontWeight: 600 }}>
          ابدأ رحلة الحفظ الرقمية اليوم
        </div>
        <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.9rem" : "clamp(1.9rem,5vw,3.6rem)", fontWeight: 800, color: colors.white, margin: "0 0 16px", lineHeight: 1.1 }}>
          Ready to Transform Your<br />Hifz Program?
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: isMobile ? 14.5 : 16, color: "rgba(255,255,255,0.85)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.8 }}>
          Join institutions already using HifzPro. Set up in 5 minutes, see results from day one.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: isMobile ? "14px 28px" : "17px 40px", borderRadius: 999, background: colors.white, color: colors.primary, fontSize: isMobile ? 14 : 16, fontWeight: 800, textDecoration: "none", fontFamily: fonts.heading, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            Start Free 14-Day Trial →
          </Link>
          <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: isMobile ? "14px 28px" : "17px 40px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.4)", color: colors.white, fontSize: isMobile ? 14 : 16, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, background: "rgba(255,255,255,0.08)" }}>
            Book a Demo
          </Link>
        </div>
        <div style={{ fontFamily: fonts.body, fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>
          No credit card · Setup in 5 minutes · Cancel anytime
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
