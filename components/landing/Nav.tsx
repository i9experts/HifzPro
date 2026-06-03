"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/providers/LanguageProvider";
import { colors } from "@/lib/tokens";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: t.nav.solutions, href: "/solutions" },
    { label: t.nav.programs,  href: "/programs" },
    { label: t.nav.pricing,   href: "/pricing" },
    { label: t.nav.about,     href: "/about" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? colors.deep : "transparent",
      borderBottom: scrolled ? "1px solid #1a2e1a" : "1px solid transparent",
      transition: "all 0.3s", padding: "0 5%",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 68,
      flexDirection: isRTL ? "row-reverse" : "row",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexDirection: isRTL ? "row-reverse" : "row" }}>
        <HifzMark size={38} primary="#10B981" gold={colors.gold} />
        <div style={{ textAlign: isRTL ? "right" : "left" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: colors.white, letterSpacing: 0.5, lineHeight: 1 }}>HifzPro</div>
          <div style={{ fontSize: 7, letterSpacing: isRTL ? 0 : 2.5, color: colors.gold, fontFamily: "monospace", marginTop: 2, opacity: 0.8 }}>
            {isRTL ? "احفظ · احمِ · تفوّق" : "MEMORIZE · PROTECT · EXCEL"}
          </div>
        </div>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexDirection: isRTL ? "row-reverse" : "row" }}>
        {navLinks.map(n => (
          <Link key={n.href} href={n.href} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: isRTL ? "'Cairo',sans-serif" : "'Outfit',sans-serif", textDecoration: "none" }}>
            {n.label}
          </Link>
        ))}
      </div>

      {/* CTAs + Language */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isRTL ? "row-reverse" : "row" }}>
        <LanguageSwitcher />
        <Link href="/signin" style={{ padding: "9px 16px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, textDecoration: "none", fontFamily: isRTL ? "'Cairo',sans-serif" : "'Outfit',sans-serif" }}>
          {t.nav.signIn}
        </Link>
        <Link href="/get-started" style={{ padding: "9px 16px", borderRadius: 8, background: colors.gold, color: colors.white, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: isRTL ? "'Cairo',sans-serif" : "'Outfit',sans-serif", boxShadow: "0 2px 12px rgba(196,136,42,0.35)" }}>
          {t.nav.getStarted}
        </Link>
      </div>
    </nav>
  );
}
