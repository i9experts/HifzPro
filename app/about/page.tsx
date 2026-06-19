// ─────────────────────────────────────────────────────────────
// ABOUT PAGE  →  app/about/page.tsx
// ─────────────────────────────────────────────────────────────
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";

const G = {
  deep: "#050D0A", dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary: "#10B981", gold: "#C4882A", white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.08)",
};
const sans   = "'Inter','Segoe UI',system-ui,sans-serif";
const mono   = "'JetBrains Mono','Fira Code','Courier New',monospace";
const serif  = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";

const TIMELINE = [
  { year: "2023", title: "The Problem",      desc: "Visited dozens of Hifz institutes in Karachi. Saw attendance registers, paper records, no parent communication system. Students were being lost to the system." },
  { year: "2024", title: "The Vision",       desc: "Decided to build Pakistan's first intelligent Hifz Management platform — one that respects the sanctity of Quran education while embracing modern technology." },
  { year: "2025", title: "First Institute",  desc: "Al-Noor Hifz Institute, Karachi became our seed partner. Every module was built from their real-world feedback and daily operational needs." },
  { year: "2026", title: "Going National",   desc: "HifzPro is now live with 18 modules, serving institutions across Pakistan. The journey of preserving the Quran through technology has begun." },
];
const VALUES = [
  { icon: "📖", title: "Quran First", titleAr: "القرآن أولاً",       desc: "Every decision starts with one question: does this serve the students memorizing the Quran? If the answer is no, we don't build it." },
  { icon: "🇵🇰", title: "Built for Pakistan", titleAr: "صُنع لباكستان", desc: "Urdu interface, JazzCash payments, Hijri calendar, Madani mushaf — designed for how Pakistani institutes actually work." },
  { icon: "🔒", title: "Trust & Privacy", titleAr: "الثقة والخصوصية",  desc: "Student data is sacred. No third-party sharing, no advertising, no data mining. Ever. Your students' data stays with you." },
  { icon: "🤝", title: "Accessible to All", titleAr: "في متناول الجميع", desc: "From a 10-student Halqa in a mosque to a 500-student institute — HifzPro works for every size, with pricing that reflects that reality." },
];
const TEAM = [
  { avatar: "👨‍💼", name: "Atiq ur Rehman Ayubi",        role: "Founder & CEO",          roleUr: "بانی و سی ای او",   bio: "Passionate about combining Islamic education with modern technology. Built HifzPro to solve real challenges faced by Hifz institutes across Pakistan." },
  { avatar: "👨‍💻", name: "Technology Team",       role: "Platform & Engineering", roleUr: "ٹیکنالوجی ٹیم",     bio: "A dedicated team of developers and designers working to build the world's most comprehensive Hifz management platform." },
  { avatar: "🕌",  name: "Islamic Advisory Board", role: "Shariah & Curriculum",   roleUr: "شرعی مشاورتی بورڈ",  bio: "Senior Asatidha and Ulama ensuring every feature aligns with Islamic pedagogical principles and the sanctity of Quran education." },
];
const STATS = [
  { val: "18+",  label: "Platform Modules",    ar: "وحدة نشطة" },
  { val: "100%", label: "WhatsApp Automated",  ar: "واتساب تلقائي" },
  { val: "PKR 0",label: "Trial Cost",          ar: "تجربة مجانية" },
  { val: "5 min",label: "Setup Time",          ar: "وقت الإعداد" },
];

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ background: G.deep, minHeight: "100vh", color: G.white, fontFamily: sans }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 64, paddingLeft: 24, paddingRight: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(16,185,129,0.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          <Link href="/" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Home</Link>
          <span style={{ color: G.dim, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: G.primary }}>About</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>OUR STORY</div>
        <h1 style={{ fontFamily: serif, fontSize: isMobile ? "2.2rem" : "clamp(2.2rem,5vw,4rem)", fontWeight: 700, color: G.white, margin: "0 0 16px", lineHeight: 1.1 }}>
          Built with Purpose.<br />Driven by Faith.
        </h1>
        <p style={{ fontFamily: sans, fontSize: 16, color: G.dim, maxWidth: 540, margin: "0 auto 20px", lineHeight: 1.75 }}>
          HifzPro was built by people who understand what it means to sit in a Halqa, memorize the words of Allah, and work hard every day to keep them.
        </p>
        <div style={{ fontFamily: arabic, fontSize: isMobile ? 18 : 24, color: G.gold, opacity: 0.75 }}>
          إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
        </div>
      </section>

      {/* Mission + Timeline */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 64, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>OUR MISSION</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.7rem" : "2rem", fontWeight: 700, color: G.white, margin: "0 0 16px", lineHeight: 1.2 }}>To preserve the Quran through technology</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.8, marginBottom: 16 }}>
              Every Hafiz carries a piece of Allah's word in their heart. Our mission is to support the institutions and teachers who make that possible — giving them tools to track every student, communicate with every parent, and never let a single student fall through the cracks.
            </p>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.8, marginBottom: 24 }}>
              HifzPro is not just software. It is a service to the Quran — built with the intention that every feature should ultimately help one more person memorize the words of Allah ﷻ.
            </p>
            <div style={{ background: G.card, borderLeft: `4px solid ${G.primary}`, borderRadius: "0 12px 12px 0", padding: "20px 24px" }}>
              <div style={{ fontFamily: arabic, fontSize: 20, color: G.gold, marginBottom: 8 }}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</div>
              <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, fontStyle: "italic", margin: "0 0 6px" }}>"The best of you are those who learn the Quran and teach it."</p>
              <cite style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>— Prophet Muhammad ﷺ (Sahih al-Bukhari)</cite>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>THE ORIGIN</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.7rem" : "2rem", fontWeight: 700, color: G.white, margin: "0 0 24px", lineHeight: 1.2 }}>Why We Built HifzPro</h2>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 2, background: G.border }} />
              {TIMELINE.map((item, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 28 }}>
                  <div style={{ position: "absolute", left: -28, top: 4, width: 14, height: 14, borderRadius: "50%", background: G.primary, border: `3px solid ${G.card}`, zIndex: 1 }} />
                  <div style={{ fontFamily: mono, fontSize: 10, color: G.primary, letterSpacing: 2, marginBottom: 4 }}>{item.year}</div>
                  <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: G.white, marginBottom: 6 }}>{item.title}</div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}`, background: G.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>WHAT WE STAND FOR</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 700, color: G.white, margin: 0 }}>Our Core Values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ background: G.card, borderRadius: 16, padding: "24px", border: `1px solid ${G.border}`, display: "flex", gap: 16 }}>
                <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, background: G.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{v.icon}</div>
                <div>
                  <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: G.white, marginBottom: 2 }}>
                    {v.title} <span style={{ fontFamily: arabic, fontSize: 13, color: G.primary, opacity: 0.8 }}>{v.titleAr}</span>
                  </div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>THE PEOPLE</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 700, color: G.white, margin: "0 0 10px" }}>Who Built HifzPro</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim }}>A small team with a big mission — serving the Huffaz of Pakistan</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {TEAM.map((member, i) => (
              <div key={i} style={{ background: G.card, borderRadius: 16, padding: 28, border: `1px solid ${G.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>{member.avatar}</div>
                <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, marginBottom: 4 }}>{member.name}</div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: G.primary, marginBottom: 4 }}>{member.role}</div>
                <div style={{ fontFamily: arabic, fontSize: 13, color: G.dim, marginBottom: 12 }}>{member.roleUr}</div>
                <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, margin: 0, lineHeight: 1.65 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: G.primary, padding: isMobile ? "40px 20px" : "56px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 0, textAlign: "center" }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: "16px 8px", borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                <div style={{ fontFamily: mono, fontSize: isMobile ? 22 : 28, fontWeight: 700, color: G.dark }}>{s.val}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: "rgba(0,0,0,0.65)", marginTop: 4 }}>{s.label}</div>
                <div style={{ fontFamily: arabic, fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>{s.ar}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "56px 20px" : "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,4vw,3rem)", fontWeight: 700, color: G.white, margin: "0 0 14px" }}>Join Pakistan's Hifz Revolution</h2>
        <p style={{ fontFamily: sans, fontSize: 15, color: G.dim, margin: "0 auto 28px", maxWidth: 440 }}>Start your 14-day free trial or book a live demo with our team.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "13px 28px", borderRadius: 12, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 28px rgba(16,185,129,0.35)" }}>Start Free Trial →</Link>
          <Link href="/contact" style={{ padding: "13px 28px", borderRadius: 12, border: `1px solid ${G.border}`, color: G.white, fontFamily: sans, fontSize: 15, fontWeight: 600, textDecoration: "none", background: G.faint }}>Get in Touch</Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
