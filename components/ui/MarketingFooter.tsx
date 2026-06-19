"use client";
import Link from "next/link";
import { HifzWordmark } from "@/components/ui/HifzMark";

const G = {
  dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary: "#10B981", gold: "#C4882A",
  dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.08)",
};
const sans = "'Inter','Segoe UI',system-ui,sans-serif";
const mono = "'JetBrains Mono','Fira Code','Courier New',monospace";
const arabic = "'Scheherazade New',serif";

const FOOTER_COLS = [
  {
    title: "Platform",
    links: [
      { label: "Features",    href: "/features" },
      { label: "Pricing",     href: "/pricing" },
      { label: "Solutions",   href: "/solutions" },
      { label: "Book a Demo", href: "/demo" },
      { label: "Sign Up",     href: "/signup" },
      { label: "Sign In",     href: "/signin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",  href: "/about" },
      { label: "Blog",      href: "/blog" },
      { label: "Contact",   href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",    href: "/privacy-policy" },
      { label: "Terms of Service",  href: "/terms-of-service" },
      { label: "Safety Policy",     href: "/safety-policy" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer style={{ background: G.dark, borderTop: `1px solid ${G.border}`, padding: "56px 28px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
          marginBottom: 40,
        }}
          className="footer-grid"
        >
          {/* Brand col */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <HifzWordmark size={34} textColor="#10B981" goldColor="#C4882A" />
            </div>
            <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, lineHeight: 1.75, maxWidth: 280, margin: "0 0 16px" }}>
              Pakistan's first intelligent Hifz Management platform. Built with love for the preservation of the Holy Quran.
            </p>
            <div style={{ fontFamily: arabic, fontSize: 16, color: G.gold, opacity: 0.6, marginBottom: 20 }}>
              وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
            </div>
            {/* Contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { icon: "📍", text: "D-8/5, Shahrah-e-Jahangir, Gulberg Town, Karachi, Sindh, Pakistan" },
                { icon: "📧", text: "info@i9experts.com", href: "mailto:info@i9experts.com" },
                { icon: "💬", text: "+92-300-2517280", href: "https://wa.me/923002517280" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
                  {c.href ? (
                    <a href={c.href} style={{ fontFamily: sans, fontSize: 12, color: G.dim, textDecoration: "none" }}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {c.text}
                    </a>
                  ) : (
                    <span style={{ fontFamily: sans, fontSize: 12, color: G.dim }}>{c.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
                {col.title.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map(link => (
                  <Link key={link.href} href={link.href} style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#10B981")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} HifzPro® — A product of <strong style={{ color: "rgba(255,255,255,0.35)" }}>i9 Experts Private Limited</strong>. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Terms",   href: "/terms-of-service" },
              { label: "Safety",  href: "/safety-policy" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
