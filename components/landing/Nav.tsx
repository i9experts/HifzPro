"use client";
import { useState, useEffect } from "react";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const navLinks = ["Solutions", "Programs", "Pricing", "About"];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? colors.deep : "transparent",
        borderBottom: scrolled ? "1px solid #1a2e1a" : "1px solid transparent",
        transition: "all 0.3s ease",
        padding: "0 5%",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 68,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <HifzMark size={38} primary={scrolled ? colors.success : "#10B981"} gold={colors.gold} />
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.white, letterSpacing: 0.5, lineHeight: 1 }}>
            HifzPro
          </div>
          <div style={{ fontSize: 7, letterSpacing: 2.5, color: colors.gold, fontFamily: fonts.mono, marginTop: 2, opacity: 0.8 }}>
            MEMORIZE · PROTECT · EXCEL
          </div>
        </div>
      </div>

      {/* Desktop Links */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="hidden md:flex">
        {navLinks.map((n) => (
          <span key={n} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: fonts.heading, cursor: "pointer" }}>
            {n}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{
          padding: "9px 20px", borderRadius: 8,
          background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
          color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: fonts.heading,
        }}>
          Sign In
        </button>
        <button style={{
          padding: "9px 22px", borderRadius: 8,
          background: colors.gold, border: "none",
          color: colors.white, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: fonts.heading,
          boxShadow: "0 2px 12px rgba(196,136,42,0.35)",
        }}>
          Get Started
        </button>
      </div>
    </nav>
  );
}
