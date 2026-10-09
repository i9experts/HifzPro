"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { colors, fonts, shadows } from "@/lib/tokens";

const CATEGORIES = [
  {
    id: "feat-core",
    badge: "Core",
    badgeColor: colors.primary,
    badgeBg: colors.green50,
    title: "Core Modules",
    sub: "Available on all plans",
    modules: [
      { icon: "👨‍🎓", title: "Student Management",  desc: "5-step enrollment wizard with 6-tab student profile including photo upload, document storage, guardian info, and academic history." },
      { icon: "📖", title: "Hifz Diary",            desc: "Daily Sabaq, Sabqi, and Manzil recording with grade and mistake tracking. The digital replacement for the traditional paper diary." },
      { icon: "📋", title: "Attendance",            desc: "One-tap dot grid attendance system with absence reason codes, automatic parent WhatsApp notification, and absence pattern alerts." },
      { icon: "👨‍🏫", title: "Asatidha Management",  desc: "3-step Ustadh onboarding wizard. Store qualifications, assign Halqas, and track teaching performance analytics over time." },
      { icon: "👨‍👩‍👦", title: "Parent Portal",        desc: "Mobile-first portal with 5 tabs: dashboard, progress, attendance, fees, and messages. Supports multi-child families. Live progress tracking." },
      { icon: "💬", title: "WhatsApp Integration",  desc: "7 bilingual Urdu/English templates auto-sent on lesson entry, attendance, test results, fees, and certificates. Zero manual effort." },
      { icon: "📝", title: "Test & Assessment",     desc: "7 test types including Sabqi, Manzil, and comprehensive Para tests. 30-Para visual progress board. Auto WhatsApp result notifications." },
      { icon: "👥", title: "Batch Management",      desc: "Create Halqas, assign Ustadh, and manage student assignments with an intuitive two-panel interface." },
    ],
  },
  {
    id: "feat-intelligence",
    badge: "Intelligence",
    badgeColor: "#7c3aed",
    badgeBg: "#f5f3ff",
    title: "AI & Intelligence",
    sub: "Professional & Enterprise plans",
    modules: [
      { icon: "📊", title: "Admin Analytics",       desc: "Dropout risk scoring with early warning alerts, Manzil health map across all students, and a 6-tab insight dashboard for institute leadership." },
      { icon: "🧠", title: "Mutashabihat Module",   desc: "Automatically detects 35 classical similar-verse pairs. AI priority scoring highlights highest-risk Mutashabihat. Manzil-linked alerts per student." },
      { icon: "📈", title: "Attendance Reports",    desc: "Calendar heatmap view, batch-level comparison, chronic absentee flagging, and one-click PDF export for parent meetings." },
    ],
  },
  {
    id: "feat-premium",
    badge: "Premium",
    badgeColor: "#b45309",
    badgeBg: "#fffbeb",
    title: "Premium Modules",
    sub: "Professional & Enterprise plans",
    modules: [
      { icon: "🏆", title: "Sanad & Certificates", desc: "3 professionally designed certificate templates with QR verification, bilingual Urdu/English text, Hijri date, and instant PDF download." },
      { icon: "💰", title: "Fee Management",        desc: "Create fee structures, record payments, generate branded receipts, manage outstanding balances, and track collection rates by batch." },
      { icon: "🎓", title: "Scholarship Manager",   desc: "Full and partial scholarship waivers with merit-based and need-based categorization. Automatic discount application on fee calculations." },
    ],
  },
  {
    id: "feat-enterprise",
    badge: "Enterprise",
    badgeColor: "#c2410c",
    badgeBg: "#fff7ed",
    title: "Enterprise Modules",
    sub: "Enterprise plan only",
    modules: [
      { icon: "🏫", title: "Multi-Campus Support",  desc: "Manage one institution across multiple campuses from a single admin panel. Unified student records, analytics, and financial reporting across all branches." },
      { icon: "📊", title: "Finance Data Bridge",   desc: "Export financial data in structured format for ERP integration (ERPNext, Tally, Peachtree). CSV, Excel, and JSON formats supported." },
    ],
  },
  {
    id: "feat-platform",
    badge: "Platform",
    badgeColor: "#0f766e",
    badgeBg: "#f0fdfa",
    title: "Platform Infrastructure",
    sub: "Included on all plans",
    modules: [
      { icon: "🆔", title: "Onboarding Flow",       desc: "5-step guided setup wizard that takes any institution from zero to live in under 5 minutes. No IT team or training required." },
      { icon: "📱", title: "PWA Ready",             desc: "Install HifzPro as a native-like app on iPhone and Android. Offline-capable Parent Portal. Background sync for Ustadh app." },
      { icon: "🔐", title: "Super Admin Panel",     desc: "Full SaaS control center — manage institutions, subscriptions, revenue tracking, and platform health from one secure panel." },
    ],
  },
];

const INTEGRATIONS = [
  { icon: "💬", name: "WhatsApp",  desc: "UltraMsg & Meta Cloud API" },
  { icon: "📱", name: "JazzCash",  desc: "Pakistan mobile payments" },
  { icon: "💳", name: "EasyPaisa", desc: "Pakistan digital wallet" },
  { icon: "☁️", name: "Cloudinary",desc: "Photo & document storage" },
  { icon: "💳", name: "Stripe",    desc: "International card payments" },
  { icon: "🏦", name: "Railway",   desc: "Cloud database & hosting" },
];

export default function FeaturesPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ background: colors.white, minHeight: "100vh", color: colors.n800, fontFamily: fonts.body }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: 56, paddingLeft: 24, paddingRight: 24, maxWidth: 1100, margin: "0 auto", background: `linear-gradient(180deg, ${colors.green50} 0%, ${colors.white} 100%)` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n500, textDecoration: "none" }}>Home</Link>
          <span style={{ color: colors.n400, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.primary }}>Features</span>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>COMPLETE FEATURE SET</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.2rem)", fontWeight: 800, color: colors.n800, margin: "0 0 16px", lineHeight: 1.15 }}>
          18 Modules. One Platform.
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.n600, maxWidth: 560, lineHeight: 1.75, margin: "0 0 32px" }}>
          Every tool your Hifz institution needs — from daily lesson diaries to AI-powered dropout risk detection.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "12px 26px", borderRadius: 999, background: colors.primary, color: colors.white, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(13,92,58,0.3)" }}>
            Start Free Trial →
          </Link>
          <Link href="/demo" style={{ padding: "12px 26px", borderRadius: 999, border: `1.5px solid ${colors.n200}`, color: colors.n800, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none", background: colors.white }}>
            Book a Demo
          </Link>
        </div>
      </section>

      {/* Categories */}
      {CATEGORIES.map((cat, idx) => (
        <section key={cat.id} id={cat.id} style={{ padding: isMobile ? "40px 20px" : "56px 24px", scrollMarginTop: 80, background: idx % 2 === 1 ? colors.n50 : colors.white }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Category header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
              <span style={{
                background: cat.badgeBg, color: cat.badgeColor,
                padding: "4px 12px", borderRadius: 999,
                fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
              }}>
                {cat.badge.toUpperCase()}
              </span>
              <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.4rem" : "1.6rem", fontWeight: 800, color: colors.n800, margin: 0 }}>
                {cat.title}
              </h2>
              <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500 }}>— {cat.sub}</span>
              <div style={{ flex: 1, height: 1, background: colors.n200, minWidth: 40 }} />
            </div>

            {/* Module cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : cat.modules.length === 2 ? "1fr 1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}>
              {cat.modules.map((mod, i) => (
                <div key={i} style={{
                  background: colors.white, borderRadius: 16, padding: "22px 20px",
                  border: `1px solid ${colors.n200}`,
                  borderTop: `3px solid ${cat.badgeColor}`,
                  boxShadow: shadows.sm,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{mod.icon}</div>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 800, color: colors.n800, margin: "0 0 8px" }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, margin: 0, lineHeight: 1.65 }}>
                    {mod.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Integrations */}
      <section style={{ padding: isMobile ? "40px 20px" : "56px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.4rem" : "1.6rem", fontWeight: 800, color: colors.n800, margin: 0 }}>
              Integrations
            </h2>
            <div style={{ flex: 1, height: 1, background: colors.n200 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)", gap: 14 }}>
            {INTEGRATIONS.map((intg, i) => (
              <div key={i} style={{
                background: colors.white, borderRadius: 16, padding: "20px 16px",
                border: `1px solid ${colors.n200}`, boxShadow: shadows.sm, textAlign: "center",
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{intg.icon}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>{intg.name}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>{intg.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "56px 20px" : "88px 24px", textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.9rem" : "clamp(1.9rem,4vw,2.8rem)", fontWeight: 800, color: colors.white, margin: "0 0 16px" }}>
          Ready to see all 18 modules in action?
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "0 auto 28px", maxWidth: 480 }}>
          Book a live demo or start your free 14-day trial today.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "14px 30px", borderRadius: 999, background: colors.white, color: colors.primary, fontFamily: fonts.heading, fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 28px rgba(0,0,0,0.2)" }}>
            Start Free Trial →
          </Link>
          <Link href="/demo" style={{ padding: "14px 30px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.4)", color: colors.white, fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, textDecoration: "none", background: "rgba(255,255,255,0.08)" }}>
            Book a Demo
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
