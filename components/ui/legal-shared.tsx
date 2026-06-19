// ─────────────────────────────────────────────────────────────
// SHARED LEGAL PAGE WRAPPER — used by all 3 legal pages
// ─────────────────────────────────────────────────────────────
"use client";
import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";

export const G = {
  deep: "#050D0A", dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary: "#10B981", gold: "#C4882A", white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.08)",
};
export const sans   = "'Inter','Segoe UI',system-ui,sans-serif";
export const mono   = "'JetBrains Mono','Fira Code','Courier New',monospace";
export const serif  = "'Cormorant Garamond','Georgia',serif";
export const arabic = "'Scheherazade New',serif";

export function LegalPage({ breadcrumb, eyebrow, title, subtitle, effectiveLine, toc, children }: {
  breadcrumb: string; eyebrow: string; title: string; subtitle: string;
  effectiveLine: string; toc: { label: string; id: string }[]; children: ReactNode;
}) {
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
      <section style={{ paddingTop: 120, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Home</Link>
          <span style={{ color: G.dim, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: G.primary }}>{breadcrumb}</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>{eyebrow}</div>
        <h1 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,4vw,3rem)", fontWeight: 700, color: G.white, margin: "0 0 14px" }}>{title}</h1>
        <p style={{ fontFamily: sans, fontSize: 15, color: G.dim, maxWidth: 560, lineHeight: 1.75, margin: 0 }}>{subtitle}</p>
      </section>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Effective date */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${G.primary}12`, border: `1px solid ${G.primary}30`, borderRadius: 8, padding: "6px 14px", marginBottom: 28 }}>
          <span style={{ fontFamily: mono, fontSize: 12, color: G.primary, fontWeight: 700 }}>{effectiveLine}</span>
        </div>

        {/* TOC */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 36 }}>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>TABLE OF CONTENTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {toc.map(item => (
              <a key={item.id} href={`#${item.id}`} style={{ fontFamily: sans, fontSize: 13, color: G.primary, textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
              >{item.label}</a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="legal-content">{children}</div>
      </div>

      <MarketingFooter />
      <style>{`
        .legal-content h2 { font-family: ${serif}; font-size: 1.25rem; font-weight: 700; color: ${G.primary}; margin: 36px 0 12px; scroll-margin-top: 80px; }
        .legal-content h3 { font-family: ${serif}; font-size: 1rem; font-weight: 700; color: ${G.white}; margin: 24px 0 8px; }
        .legal-content p  { font-family: ${sans}; font-size: 14px; color: ${G.dim}; line-height: 1.85; margin-bottom: 14px; }
        .legal-content ul { padding-left: 22px; margin-bottom: 14px; }
        .legal-content li { font-family: ${sans}; font-size: 14px; color: ${G.dim}; line-height: 1.75; margin-bottom: 6px; list-style: disc; }
        .legal-content a  { color: ${G.primary}; }
        .legal-content strong { color: ${G.white}; font-weight: 600; }
        .legal-callout { background: ${G.card}; border: 1px solid ${G.border}; border-left: 4px solid ${G.primary}; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 24px 0; }
        .legal-callout h3 { margin-top: 0 !important; }
      `}</style>
    </div>
  );
}
