"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HifzWordmark } from "@/components/ui/HifzMark";

const G = {
  deep: "#050D0A", dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary: "#10B981", gold: "#C4882A", white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.08)",
};
const sans = "'Inter','Segoe UI',system-ui,sans-serif";
const mono = "'JetBrains Mono','Fira Code','Courier New',monospace";

type MegaLink = {
  icon: string;
  label: string;
  sub: string;
  href: string;
};

type MegaCol = {
  heading: string;
  links: MegaLink[];
};

type NavItem = {
  label: string;
  cols: MegaCol[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Product",
    cols: [
      {
        heading: "Features",
        links: [
          { icon: "📋", label: "All 18 Modules",       sub: "Complete feature overview",              href: "/features" },
          { icon: "🧠", label: "AI & Intelligence",     sub: "Mutashabihat, dropout risk, analytics",  href: "/features#feat-intelligence" },
          { icon: "📱", label: "Mobile & PWA",          sub: "Parent Portal & Ustadh app",             href: "/features#feat-platform" },
        ],
      },
      {
        heading: "Platform",
        links: [
          { icon: "💬", label: "WhatsApp Integration",  sub: "7 bilingual Urdu/English templates",     href: "/features#feat-core" },
          { icon: "🏫", label: "Multi-Campus",          sub: "One institution, multiple campuses",      href: "/features#feat-enterprise" },
          { icon: "🔐", label: "Super Admin",           sub: "Enterprise SaaS control center",          href: "/features#feat-platform" },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    cols: [
      {
        heading: "By Institution Type",
        links: [
          { icon: "🕌", label: "For Madrasas",          sub: "Full-scale institute management",         href: "/solutions#sol-madrasas" },
          { icon: "🏡", label: "For Mosque Halqas",     sub: "Small groups, simple setup",              href: "/solutions#sol-halqas" },
          { icon: "🌍", label: "For Diaspora Institutes",sub: "UK, UAE, USA — multi-currency",          href: "/solutions#sol-diaspora" },
        ],
      },
      {
        heading: "By Role",
        links: [
          { icon: "👨‍🏫", label: "For Asatidha",         sub: "Ustadh app, offline-first",               href: "/solutions#sol-asatidha" },
          { icon: "👨‍👩‍👦", label: "For Parents",           sub: "Live progress, WhatsApp updates",        href: "/solutions#sol-parents" },
          { icon: "👨‍💼", label: "For Admins",             sub: "Analytics, fees, multi-campus",          href: "/solutions#sol-admins" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    cols: [
      {
        heading: "Learn",
        links: [
          { icon: "📝", label: "Blog & Insights",       sub: "Quran education & tech guides",           href: "/blog" },
          { icon: "🎥", label: "Book a Demo",           sub: "Live walkthrough with our team",          href: "/demo" },
        ],
      },
      {
        heading: "Commercial",
        links: [
          { icon: "💰", label: "Pricing",               sub: "Transparent PKR & GBP plans",             href: "/pricing" },
          { icon: "💬", label: "Contact Support",       sub: "WhatsApp · Email · Office",               href: "/contact" },
        ],
      },
    ],
  },
  {
    label: "Company",
    cols: [
      {
        heading: "About",
        links: [
          { icon: "🌱", label: "Our Story",             sub: "Mission, values & team",                  href: "/about" },
          { icon: "📍", label: "Contact Us",            sub: "Karachi office & WhatsApp",               href: "/contact" },
        ],
      },
      {
        heading: "Legal",
        links: [
          { icon: "🔒", label: "Privacy Policy",        sub: "PECA-compliant data protection",          href: "/privacy-policy" },
          { icon: "📜", label: "Terms of Service",      sub: "Usage terms & conditions",                href: "/terms-of-service" },
          { icon: "🛡️", label: "Safety Policy",         sub: "Child & student data safety",             href: "/safety-policy" },
        ],
      },
    ],
  },
];

export default function MarketingNav() {
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 1024);
    checkSize();
    window.addEventListener("resize", checkSize);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", checkSize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close mega on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const toggle = (label: string) =>
    setOpenMenu(prev => (prev === label ? null : label));

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          height: 64, display: "flex", alignItems: "center",
          padding: "0 24px",
          background: scrolled ? "rgba(5,13,10,0.98)" : "rgba(5,13,10,0.90)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${scrolled ? G.border : "transparent"}`,
          transition: "all 0.3s",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <HifzWordmark size={34} textColor="#10B981" goldColor="#C4882A" />
        </Link>

        {/* Desktop mega menu */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.label} style={{ position: "relative" }}>
                <button
                  onClick={() => toggle(item.label)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 14px", borderRadius: 8,
                    fontFamily: sans, fontSize: 14, fontWeight: 500,
                    color: openMenu === item.label ? G.primary : G.dim,
                    background: openMenu === item.label ? "rgba(16,185,129,0.08)" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {item.label}
                  <svg
                    width={12} height={12} viewBox="0 0 12 12" fill="currentColor"
                    style={{ transition: "transform 0.2s", transform: openMenu === item.label ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.6 }}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {openMenu === item.label && (
                  <div
                    style={{
                      position: "absolute", top: "calc(100% + 12px)",
                      left: "50%", transform: "translateX(-50%)",
                      background: G.card,
                      border: `1px solid ${G.border}`,
                      borderRadius: 16,
                      boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                      padding: 20,
                      display: "grid",
                      gridTemplateColumns: `repeat(${item.cols.length}, 200px)`,
                      gap: 24,
                      minWidth: item.cols.length * 200 + 40,
                      zIndex: 300,
                    }}
                  >
                    {item.cols.map(col => (
                      <div key={col.heading}>
                        <div style={{
                          fontFamily: mono, fontSize: 9, letterSpacing: 2,
                          color: "rgba(255,255,255,0.3)", marginBottom: 10,
                          paddingBottom: 8, borderBottom: `1px solid ${G.border}`,
                        }}>
                          {col.heading.toUpperCase()}
                        </div>
                        {col.links.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpenMenu(null)}
                            style={{ textDecoration: "none" }}
                          >
                            <div style={{
                              display: "flex", alignItems: "flex-start", gap: 10,
                              padding: "8px", borderRadius: 10,
                              transition: "background 0.15s",
                              cursor: "pointer",
                            }}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.08)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{
                                width: 30, height: 30, minWidth: 30,
                                borderRadius: 8, background: G.faint,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 14,
                              }}>
                                {link.icon}
                              </div>
                              <div>
                                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: G.white, marginBottom: 2 }}>
                                  {link.label}
                                </div>
                                <div style={{ fontFamily: sans, fontSize: 11, color: G.dim, lineHeight: 1.4 }}>
                                  {link.sub}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Desktop CTA */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Link href="/signin" style={{
              fontFamily: sans, fontSize: 13, fontWeight: 500,
              color: G.dim, textDecoration: "none",
              padding: "8px 14px", borderRadius: 8,
            }}>
              Sign In
            </Link>
            <Link href="/signup" style={{
              fontFamily: sans, fontSize: 13, fontWeight: 700,
              color: G.dark, textDecoration: "none",
              padding: "9px 20px", borderRadius: 8,
              background: G.primary,
            }}>
              Get Started Free
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{ background: "none", border: "none", color: G.white, fontSize: 22, cursor: "pointer", padding: "4px 8px" }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && mobileOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
          zIndex: 199, background: "rgba(5,13,10,0.99)",
          backdropFilter: "blur(16px)",
          overflowY: "auto", padding: "8px 20px 40px",
        }}>
          {NAV_ITEMS.map(item => (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                style={{
                  width: "100%", background: "none", border: "none",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 4px",
                  borderBottom: `1px solid ${G.border}`,
                  fontFamily: sans, fontSize: 16, fontWeight: 600,
                  color: openMenu === item.label ? G.primary : G.white,
                  cursor: "pointer",
                }}
              >
                {item.label}
                <span style={{ fontSize: 12, opacity: 0.5, transform: openMenu === item.label ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </button>
              {openMenu === item.label && (
                <div style={{ padding: "8px 0 4px 12px" }}>
                  {item.cols.flatMap(col => col.links).map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{ textDecoration: "none" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 8px", borderRadius: 8,
                      }}>
                        <span style={{ fontSize: 16 }}>{link.icon}</span>
                        <div>
                          <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: G.white }}>{link.label}</div>
                          <div style={{ fontFamily: sans, fontSize: 11, color: G.dim }}>{link.sub}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/signin" style={{
              fontFamily: sans, fontSize: 15, fontWeight: 600,
              color: G.white, textDecoration: "none",
              padding: "13px", borderRadius: 10, textAlign: "center",
              border: `1px solid ${G.border}`, background: G.faint,
            }}>
              Sign In
            </Link>
            <Link href="/signup" style={{
              fontFamily: sans, fontSize: 15, fontWeight: 700,
              color: G.dark, textDecoration: "none",
              padding: "14px", borderRadius: 10, textAlign: "center",
              background: G.primary,
            }}>
              Get Started Free →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
