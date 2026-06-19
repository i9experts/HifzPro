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
const sans  = "'Inter','Segoe UI',system-ui,sans-serif";
const mono  = "'JetBrains Mono','Fira Code','Courier New',monospace";
const serif = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";

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

export default function SolutionsPage() {
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
      <section style={{ paddingTop: 120, paddingBottom: 56, paddingLeft: 24, paddingRight: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Home</Link>
          <span style={{ color: G.dim, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: G.primary }}>Solutions</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>SOLUTIONS</div>
        <h1 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: G.white, margin: "0 0 16px", lineHeight: 1.15 }}>
          Built for Every Hifz Institution
        </h1>
        <p style={{ fontFamily: sans, fontSize: 16, color: G.dim, maxWidth: 560, lineHeight: 1.75, margin: 0 }}>
          Whether you run a single Halqa in a mosque or a large multi-campus institute, HifzPro has a solution tailored to your context.
        </p>
      </section>

      {/* For Madrasas */}
      <section id="sol-madrasas" style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}`, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>FOR MADRASAS</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.7rem" : "2.2rem", fontWeight: 700, color: G.white, margin: "0 0 16px", lineHeight: 1.2 }}>Full-Scale Madrasa Management</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.8, marginBottom: 20 }}>
              Large Hifz institutes and madrasas have complex needs — multiple Halqas, dozens of Asatidha, hundreds of students, fee structures, scholarship programmes, and multi-campus branches. HifzPro was designed from the ground up for institutions at this scale.
            </p>
            {["Unlimited student enrollment with 6-tab detailed profiles", "Multi-Halqa management with batch-level analytics", "Full fee management, scholarships, and payment receipts", "Dropout risk alerts and AI-powered Mutashabihat detection", "Sanad certificate generation with QR verification", "Finance data export for ERP and accounting systems"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: G.primary, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: G.dim }}>{f}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/signup" style={{ padding: "11px 22px", borderRadius: 10, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: "11px 22px", borderRadius: 10, border: `1px solid ${G.border}`, color: G.white, fontFamily: sans, fontSize: 14, fontWeight: 600, textDecoration: "none", background: G.faint }}>View Enterprise Plan</Link>
            </div>
          </div>
          <div style={{ background: `${G.primary}0A`, border: `1px solid ${G.primary}30`, borderRadius: 18, padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: G.primary, marginBottom: 10 }}>RECOMMENDED PLAN</div>
            <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: G.white, marginBottom: 4 }}>Enterprise</div>
            <div style={{ fontFamily: sans, fontSize: 14, color: G.dim, marginBottom: 20 }}>PKR 9,999/month · Unlimited students</div>
            <div style={{ height: 1, background: G.border, marginBottom: 16 }} />
            {["All 18 modules included", "Multi-Campus management", "Mutashabihat AI", "Super Admin panel", "Dedicated WhatsApp support"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: G.primary }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: G.dim }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Mosque Halqas */}
      <section id="sol-halqas" style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}`, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 28, order: isMobile ? 2 : 1 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: G.primary, marginBottom: 10 }}>RECOMMENDED PLAN</div>
            <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: G.white, marginBottom: 4 }}>Free Trial → Basic</div>
            <div style={{ fontFamily: sans, fontSize: 14, color: G.dim, marginBottom: 20 }}>Start free · PKR 2,999/month after</div>
            <div style={{ height: 1, background: G.border, marginBottom: 16 }} />
            {["Up to 50 students", "Full Core modules", "WhatsApp parent updates", "5-minute setup"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ color: G.primary }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: G.dim }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ order: isMobile ? 1 : 2 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>FOR MOSQUE HALQAS</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.7rem" : "2.2rem", fontWeight: 700, color: G.white, margin: "0 0 16px", lineHeight: 1.2 }}>Simple Setup for Small Halqas</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.8, marginBottom: 20 }}>
              Many of Pakistan's most impactful Hifz programmes run in mosque basements with a single Ustadh and 10–30 students. HifzPro works just as well for a small Halqa — and you can be live in under 5 minutes.
            </p>
            {["No IT team, no training — guided 5-step setup wizard", "Automatic WhatsApp updates to every parent, every day", "Free 14-day trial — no credit card required", "PKR 2,999/month — less than a part-time admin's daily wage"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: G.primary, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: G.dim }}>{f}</span>
              </div>
            ))}
            <Link href="/signup" style={{ display: "inline-block", marginTop: 24, padding: "11px 22px", borderRadius: 10, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Start Free — No Card Needed →
            </Link>
          </div>
        </div>
      </section>

      {/* For Diaspora */}
      <section id="sol-diaspora" style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}`, scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>FOR DIASPORA INSTITUTES</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.7rem" : "2.2rem", fontWeight: 700, color: G.white, margin: "0 0 16px", lineHeight: 1.2 }}>UK, UAE, and Beyond</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.8, marginBottom: 20 }}>
              Pakistani and South Asian diaspora communities in the UK, UAE, USA, and Canada run hundreds of weekend Hifz programmes and Islamic schools. HifzPro now offers GBP pricing for diaspora institutions.
            </p>
            {["GBP pricing — from £14/month", "Bilingual Urdu/English interface and WhatsApp templates", "Sanad certificates with Hijri date — accepted globally", "GDPR-aware data handling for UK-based institutions", "Stripe payment processing for international subscriptions"].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: G.primary, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: G.dim }}>{f}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <Link href="/demo" style={{ padding: "11px 22px", borderRadius: 10, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Book a Demo →</Link>
              <Link href="/pricing" style={{ padding: "11px 22px", borderRadius: 10, border: `1px solid ${G.border}`, color: G.white, fontFamily: sans, fontSize: 14, fontWeight: 600, textDecoration: "none", background: G.faint }}>View GBP Pricing</Link>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg,#0A2E1A,#052e16)", border: `1px solid ${G.primary}30`, borderRadius: 18, padding: 28 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>INTERNATIONAL PRICING (GBP)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { name: "Basic", price: "£14", sub: "/month · 50 students" },
                { name: "Professional", price: "£29", sub: "/month · 200 students", highlight: true },
                { name: "Enterprise", price: "£49", sub: "/month · Unlimited" },
                { name: "Annual saving", price: "20%", sub: "off all annual plans" },
              ].map((p, i) => (
                <div key={i} style={{ background: p.highlight ? `${G.primary}20` : G.faint, border: `1px solid ${p.highlight ? G.primary : G.border}`, borderRadius: 12, padding: "16px 14px" }}>
                  <div style={{ fontFamily: sans, fontSize: 11, color: G.dim, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: p.highlight ? G.primary : G.white }}>{p.price}</div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: G.dim }}>{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* By Role */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>BY ROLE</div>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 700, color: G.white, margin: "0 0 12px" }}>HifzPro Works for Everyone</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: G.dim }}>Every role in a Hifz institution gets a purpose-built experience.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {ROLES.map(role => (
              <div key={role.id} id={role.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, scrollMarginTop: 80 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{role.icon}</div>
                <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, margin: "0 0 4px" }}>{role.title}</h3>
                <div style={{ fontFamily: arabic, fontSize: 13, color: G.primary, marginBottom: 12, opacity: 0.8 }}>{role.titleAr}</div>
                <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, lineHeight: 1.65, marginBottom: 16 }}>{role.desc}</p>
                {role.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: G.primary, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: sans, fontSize: 13, color: G.dim }}>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "56px 20px" : "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,4vw,3rem)", fontWeight: 700, color: G.white, margin: "0 0 14px" }}>Find the right plan for your institution</h2>
        <p style={{ fontFamily: sans, fontSize: 15, color: G.dim, margin: "0 auto 28px", maxWidth: 440 }}>Start with a free 14-day trial or book a personalised demo with our team.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "13px 28px", borderRadius: 12, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 28px rgba(16,185,129,0.35)" }}>Start Free Trial →</Link>
          <Link href="/demo" style={{ padding: "13px 28px", borderRadius: 12, border: `1px solid ${G.border}`, color: G.white, fontFamily: sans, fontSize: 15, fontWeight: 600, textDecoration: "none", background: G.faint }}>Book a Demo</Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
