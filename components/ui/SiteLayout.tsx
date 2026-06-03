"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { colors, fonts } from "@/lib/tokens";
import HifzMark from "@/components/ui/HifzMark";

const navLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Programs",  href: "/programs" },
  { label: "Pricing",   href: "/pricing" },
  { label: "About",     href: "/about" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? colors.deep : "transparent",
      borderBottom: scrolled ? "1px solid #1a2e1a" : "1px solid transparent",
      transition: "all 0.3s", padding: "0 5%",
      display: "flex", alignItems: "center", justifyContent: "space-between", height: 68,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
        <HifzMark size={38} primary="#10B981" gold={colors.gold} />
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.white, letterSpacing: 0.5, lineHeight: 1 }}>HifzPro</div>
          <div style={{ fontSize: 7, letterSpacing: 2.5, color: colors.gold, fontFamily: fonts.mono, marginTop: 2, opacity: 0.8 }}>MEMORIZE · PROTECT · EXCEL</div>
        </div>
      </Link>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {navLinks.map(n => (
          <Link key={n.href} href={n.href} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: fonts.heading, textDecoration: "none" }}>
            {n.label}
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/signin" style={{ padding: "9px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, textDecoration: "none", fontFamily: fonts.heading }}>
          Sign In
        </Link>
        <Link href="/get-started" style={{ padding: "9px 22px", borderRadius: 8, background: colors.gold, color: colors.white, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, boxShadow: "0 2px 12px rgba(196,136,42,0.35)" }}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  const cols = [
    { title: "Product",  links: [{ label: "Features", href: "/solutions" }, { label: "Programs", href: "/programs" }, { label: "Pricing", href: "/pricing" }] },
    { title: "Company",  links: [{ label: "About Us", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Careers", href: "/contact" }] },
    { title: "Legal",    links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Use", href: "/terms" }, { label: "Help Center", href: "/contact" }] },
  ];
  return (
    <footer style={{ background: colors.deep, padding: "60px 5% 32px", borderTop: "1px solid #1a2e1a" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, textDecoration: "none" }}>
              <HifzMark size={40} primary="#10B981" gold={colors.gold} />
              <div>
                <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
                <div style={{ fontSize: 7, letterSpacing: 2.5, color: colors.gold, fontFamily: fonts.mono, marginTop: 3, opacity: 0.7 }}>MEMORIZE · PROTECT · EXCEL</div>
              </div>
            </Link>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, maxWidth: 260 }}>
              The world&apos;s leading Hifz management platform. Serving Huffaz, Asatidha, and institutions across Pakistan and beyond.
            </p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, textDecoration: "none" }}>{l.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1a2e1a", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © 2026 HifzPro. All rights reserved. Built with care for the Huffaz of the Ummah.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Contact", href: "/contact" }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <section style={{
      background: `linear-gradient(160deg, ${colors.deep} 0%, #0A2E1A 100%)`,
      padding: "140px 5% 80px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <defs><pattern id="pp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6" />
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#pp)" />
      </svg>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>{label}</div>
        <h1 style={{ fontFamily: fonts.display, fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 700, color: colors.white, margin: "0 0 16px", lineHeight: 1.15 }}
          dangerouslySetInnerHTML={{ __html: title }} />
        {subtitle && <p style={{ fontFamily: fonts.body, fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: 0 }}>{subtitle}</p>}
      </div>
    </section>
  );
}
