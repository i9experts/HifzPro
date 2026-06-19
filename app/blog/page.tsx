// ─────────────────────────────────────────────────────────────
// BLOG INDEX  →  app/blog/page.tsx
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
const sans  = "'Inter','Segoe UI',system-ui,sans-serif";
const mono  = "'JetBrains Mono','Fira Code','Courier New',monospace";
const serif = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";

export default function BlogPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ background: G.deep, minHeight: "100vh", color: G.white, fontFamily: sans }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Home</Link>
          <span style={{ color: G.dim, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: G.primary }}>Blog</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>INSIGHTS & RESOURCES</div>
        <h1 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: G.white, margin: "0 0 14px" }}>Hifz Education Blog</h1>
        <p style={{ fontFamily: sans, fontSize: 15, color: G.dim, maxWidth: 540, lineHeight: 1.75, margin: 0 }}>
          Guides, insights, and perspectives on Quran memorization, Islamic education, and running effective Hifz institutions.
        </p>
      </section>

      {/* Content grid */}
      <section style={{ padding: isMobile ? "0 20px 64px" : "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 40 }}>

          {/* Featured article */}
          <div>
            <Link href="/blog/quran-education" style={{ textDecoration: "none" }}>
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, overflow: "hidden", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = G.primary)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = G.border)}
              >
                {/* Cover */}
                <div style={{ background: "linear-gradient(135deg,#0A2E1A,#052e16)", height: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ fontFamily: arabic, fontSize: "10rem", color: "rgba(255,255,255,0.04)", position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>بِسْمِ اللَّهِ</div>
                  <div style={{ position: "absolute", top: 16, left: 16, background: G.gold, color: G.dark, fontFamily: mono, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>FEATURED</div>
                  <span style={{ fontSize: "4rem", opacity: 0.5 }}>📖</span>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: sans, fontSize: 12, color: G.dim }}>📅 June 2026</span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: G.dim }}>⏱ 12 min read</span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: G.dim }}>✍️ HifzPro Editorial</span>
                  </div>
                  <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.3rem" : "1.6rem", fontWeight: 700, color: G.white, margin: "0 0 12px", lineHeight: 1.3 }}>
                    The Importance of Quran Education in the Modern Age: Why Hifz Is More Vital Than Ever
                  </h2>
                  <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.7, margin: "0 0 16px" }}>
                    In a world saturated with screens, social media, and digital distraction, the ancient tradition of Hifz — memorizing the entire Quran — stands as one of the most profound acts of spiritual discipline and intellectual achievement available to a Muslim...
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {["Quran Education", "Hifz", "Islamic Studies", "Modern Education"].map(t => (
                      <span key={t} style={{ background: G.faint, color: G.dim, fontFamily: sans, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 4 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 13, fontWeight: 700 }}>
                    Read Full Article →
                  </div>
                </div>
              </div>
            </Link>

            {/* Coming soon */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, marginTop: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🚀</div>
              <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, margin: "0 0 8px" }}>More Articles Coming Soon</h3>
              <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, margin: "0 0 16px", lineHeight: 1.7 }}>
                We're working on in-depth guides on Hifz pedagogy, institute management, and technology for Islamic education.
              </p>
              <div style={{ display: "flex", gap: 8, maxWidth: 380, margin: "0 auto" }}>
                <input
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${G.border}`, background: G.dark, color: G.white, fontFamily: sans, fontSize: 13, outline: "none" }}
                />
                <button style={{ padding: "10px 18px", borderRadius: 8, background: G.primary, border: "none", color: G.dark, fontFamily: sans, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Notify Me
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>QUICK RESOURCES</div>
              {[
                { icon: "📋", title: "Explore All 18 Modules", sub: "Full feature overview", href: "/features" },
                { icon: "🎥", title: "Book a Live Demo",       sub: "See HifzPro in action", href: "/demo" },
                { icon: "💰", title: "View Pricing Plans",     sub: "Transparent PKR & GBP", href: "/pricing" },
              ].map((item, i) => (
                <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${G.border}` : "none" }}>
                    <div style={{ width: 34, height: 34, minWidth: 34, borderRadius: 8, background: G.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: G.white, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontFamily: sans, fontSize: 11, color: G.dim }}>{item.sub}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>TOPICS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Quran Education", "Hifz Methods", "Institute Management", "Technology", "Parent Engagement", "Pakistan"].map(t => (
                  <span key={t} style={{ background: `${G.primary}15`, color: G.primary, fontFamily: sans, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg,#0A2E1A,#052e16)", border: `1px solid ${G.primary}30`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>READY TO GET STARTED?</div>
              <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, margin: "0 0 8px" }}>Start your free 14-day trial</h3>
              <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, margin: "0 0 16px" }}>Join institutes already using HifzPro. No credit card required.</p>
              <Link href="/signup" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 10, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Start Free Trial →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
