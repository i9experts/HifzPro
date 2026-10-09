"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { colors, fonts, shadows } from "@/lib/tokens";

const arabic = "'Cairo', sans-serif";

const ROLES = [
  {
    id: "sol-asatidha",
    icon: "👨‍🏫", title: "For Asatidha", titleAr: "للأساتذة",
    desc: "The Ustadh app is built offline-first — record lessons, attendance, and test results even without internet. Background sync keeps everything up to date when connectivity is restored.",
    features: ["Offline-first Ustadh mobile app", "One-tap Sabaq / Sabqi / Manzil entry", "Dot-grid attendance in under 30 seconds", "Automatic parent WhatsApp on save", "Test entry and result notifications"],
  },
  {
    id: "sol-parents",
    icon: "👨‍👩‍👦", title: "For Parents", titleAr: "للآباء والأمهات",
    desc: "Parents get a mobile-first portal with 5 tabs covering everything from live progress to attendance, test results, fees, and announcements. Supports multiple children from one login.",
    features: ["Daily WhatsApp progress updates in Urdu", "Live 30-Para visual progress board", "Attendance calendar and absence alerts", "Fee status and payment history", "Multi-child support from one login"],
  },
  {
    id: "sol-admins",
    icon: "👨‍💼", title: "For Admins & Muhtamimeen", titleAr: "للمديرين",
    desc: "Campus Admins and Muhtamimeen get a comprehensive dashboard with analytics, dropout risk alerts, fee oversight, staff management, and full reporting.",
    features: ["6-tab analytics dashboard", "AI dropout risk scoring", "Fee collection & scholarship management", "Asatidha performance analytics", "PDF reports for parents and boards"],
  },
];

function Check({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      <span style={{ color: colors.primary, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
      <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{text}</span>
    </div>
  );
}

export default function SolutionsPage() {
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
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/" style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n500, textDecoration: "none" }}>Home</Link>
          <span style={{ color: colors.n400, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.primary }}>Solutions</span>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>SOLUTIONS</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.2rem)", fontWeight: 800, color: colors.n800, margin: "0 0 16px", lineHeight: 1.15 }}>
          Built for Every Hifz Institution
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.n600, maxWidth: 560, lineHeight: 1.75, margin: 0 }}>
          Whether you run a single Halqa in a mosque or a large multi-campus institute, HifzPro has a solution tailored to your context.
        </p>
      </section>

      {/* For Madrasas */}
      <section id="sol-madrasas" style={{ padding: isMobile ? "40px 20px" : "64px 24px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>FOR MADRASAS</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.6rem" : "2rem", fontWeight: 800, color: colors.n800, margin: "0 0 16px", lineHeight: 1.2 }}>Full-Scale Madrasa Management</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, lineHeight: 1.8, marginBottom: 20 }}>
              Large Hifz institutes and madrasas have complex needs — multiple Halqas, dozens of Asatidha, hundreds of students, fee structures, scholarship programmes, and multi-campus branches. HifzPro was designed from the ground up for institutions at this scale.
            </p>
            {["Unlimited student enrollment with 6-tab detailed profiles", "Multi-Halqa management with batch-level analytics", "Full fee management, scholarships, and payment receipts", "Dropout risk alerts and AI-powered Mutashabihat detection", "Sanad certificate generation with QR verification", "Finance data export for ERP and accounting systems"].map((f, i) => <Check key={i} text={f} />)}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/signup" style={{ padding: "12px 24px", borderRadius: 999, background: colors.primary, color: colors.white, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: "12px 24px", borderRadius: 999, border: `1.5px solid ${colors.n200}`, color: colors.n800, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>View Enterprise Plan</Link>
            </div>
          </div>
          <div style={{ background: colors.green50, border: `1px solid ${colors.green200}`, borderRadius: 20, padding: 28 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.primary, marginBottom: 10, fontWeight: 700 }}>RECOMMENDED PLAN</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 800, color: colors.n800, marginBottom: 4 }}>Enterprise</div>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, marginBottom: 20 }}>PKR 9,999/month · Unlimited students</div>
            <div style={{ height: 1, background: colors.green200, marginBottom: 16 }} />
            {["All 18 modules included", "Multi-Campus management", "Mutashabihat AI", "Super Admin panel", "Dedicated WhatsApp support"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: colors.primary, fontWeight: 700 }}>✓</span>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Mosque Halqas */}
      <section id="sol-halqas" style={{ padding: isMobile ? "40px 20px" : "64px 24px", scrollMarginTop: 80, background: colors.n50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 20, padding: 28, order: isMobile ? 2 : 1, boxShadow: shadows.sm }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.primary, marginBottom: 10, fontWeight: 700 }}>RECOMMENDED PLAN</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 800, color: colors.n800, marginBottom: 4 }}>Free Trial → Basic</div>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, marginBottom: 20 }}>Start free · PKR 2,999/month after</div>
            <div style={{ height: 1, background: colors.n100, marginBottom: 16 }} />
            {["Up to 50 students", "Full Core modules", "WhatsApp parent updates", "5-minute setup"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: colors.primary, fontWeight: 700 }}>✓</span>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ order: isMobile ? 1 : 2 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>FOR MOSQUE HALQAS</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.6rem" : "2rem", fontWeight: 800, color: colors.n800, margin: "0 0 16px", lineHeight: 1.2 }}>Simple Setup for Small Halqas</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, lineHeight: 1.8, marginBottom: 20 }}>
              Many of Pakistan's most impactful Hifz programmes run in mosque basements with a single Ustadh and 10–30 students. HifzPro works just as well for a small Halqa — and you can be live in under 5 minutes.
            </p>
            {["No IT team, no training — guided 5-step setup wizard", "Automatic WhatsApp updates to every parent, every day", "Free 14-day trial — no credit card required", "PKR 2,999/month — less than a part-time admin's daily wage"].map((f, i) => <Check key={i} text={f} />)}
            <Link href="/signup" style={{ display: "inline-block", marginTop: 24, padding: "12px 24px", borderRadius: 999, background: colors.primary, color: colors.white, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Start Free — No Card Needed →
            </Link>
          </div>
        </div>
      </section>

      {/* For Diaspora */}
      <section id="sol-diaspora" style={{ padding: isMobile ? "40px 20px" : "64px 24px", scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>FOR DIASPORA INSTITUTES</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.6rem" : "2rem", fontWeight: 800, color: colors.n800, margin: "0 0 16px", lineHeight: 1.2 }}>UK, UAE, and Beyond</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, lineHeight: 1.8, marginBottom: 20 }}>
              Pakistani and South Asian diaspora communities in the UK, UAE, USA, and Canada run hundreds of weekend Hifz programmes and Islamic schools. HifzPro now offers GBP pricing for diaspora institutions.
            </p>
            {["GBP pricing — from £14/month", "Bilingual Urdu/English interface and WhatsApp templates", "Sanad certificates with Hijri date — accepted globally", "GDPR-aware data handling for UK-based institutions", "Stripe payment processing for international subscriptions"].map((f, i) => <Check key={i} text={f} />)}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/demo" style={{ padding: "12px 24px", borderRadius: 999, background: colors.primary, color: colors.white, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Book a Demo →</Link>
              <Link href="/pricing" style={{ padding: "12px 24px", borderRadius: 999, border: `1.5px solid ${colors.n200}`, color: colors.n800, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>View GBP Pricing</Link>
            </div>
          </div>
          <div style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, borderRadius: 20, padding: 28, boxShadow: "0 16px 40px rgba(13,92,58,0.25)" }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>INTERNATIONAL PRICING (GBP)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { name: "Basic", price: "£14", sub: "/month · 50 students" },
                { name: "Professional", price: "£29", sub: "/month · 200 students", highlight: true },
                { name: "Enterprise", price: "£49", sub: "/month · Unlimited" },
                { name: "Annual saving", price: "20%", sub: "off all annual plans" },
              ].map((p, i) => (
                <div key={i} style={{ background: p.highlight ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", border: `1px solid ${p.highlight ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`, borderRadius: 14, padding: "16px 14px" }}>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 800, color: colors.white }}>{p.price}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* By Role */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", background: colors.n50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>BY ROLE</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.7rem" : "2.1rem", fontWeight: 800, color: colors.n800, margin: "0 0 12px" }}>HifzPro Works for Everyone</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600 }}>Every role in a Hifz institution gets a purpose-built experience.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {ROLES.map(role => (
              <div key={role.id} id={role.id} style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 18, padding: 28, scrollMarginTop: 80, boxShadow: shadows.sm }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{role.icon}</div>
                <h3 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 800, color: colors.n800, margin: "0 0 4px" }}>{role.title}</h3>
                <div style={{ fontFamily: arabic, fontSize: 13, color: colors.primary, marginBottom: 12, fontWeight: 600 }}>{role.titleAr}</div>
                <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, lineHeight: 1.65, marginBottom: 16 }}>{role.desc}</p>
                {role.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: colors.primary, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "56px 20px" : "88px 24px", textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.9rem" : "clamp(1.9rem,4vw,2.8rem)", fontWeight: 800, color: colors.white, margin: "0 0 14px" }}>Find the right plan for your institution</h2>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "0 auto 28px", maxWidth: 440 }}>Start with a free 14-day trial or book a personalised demo with our team.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "14px 30px", borderRadius: 999, background: colors.white, color: colors.primary, fontFamily: fonts.heading, fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 28px rgba(0,0,0,0.2)" }}>Start Free Trial →</Link>
          <Link href="/demo" style={{ padding: "14px 30px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.4)", color: colors.white, fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, textDecoration: "none", background: "rgba(255,255,255,0.08)" }}>Book a Demo</Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
