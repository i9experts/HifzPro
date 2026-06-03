"use client";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import { useLanguage } from "@/providers/LanguageProvider";
import { colors } from "@/lib/tokens";
import HifzMark from "@/components/ui/HifzMark";
import Link from "next/link";

function useF() {
  const { t, isRTL } = useLanguage();
  const f = isRTL ? "'Cairo',sans-serif" : "'DM Sans',sans-serif";
  const fh = isRTL ? "'Cairo',sans-serif" : "'Outfit',sans-serif";
  const fd = isRTL ? "'Cairo',sans-serif" : "'Cormorant Garamond',serif";
  return { t, isRTL, f, fh, fd };
}

function Problem() {
  const { t, isRTL, f, fh, fd } = useF();
  return (
    <section style={{ background: colors.n50, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: isRTL?0:4, color: colors.gold, fontFamily: isRTL?"'Cairo',sans-serif":"monospace", marginBottom: 12 }}>{t.problem.label}</div>
          <h2 style={{ fontFamily: fd, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>{t.problem.title}</h2>
          <p style={{ fontFamily: f, fontSize: 16, color: colors.n500, maxWidth: 520, margin: "0 auto", lineHeight: isRTL?2:1.8 }}>{t.problem.subtitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {t.problem.items.map((p, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", textAlign: isRTL?"right":"left" }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{p.icon}</div>
              <div style={{ fontFamily: fh, fontSize: 17, fontWeight: 700, color: colors.n800, marginBottom: 10 }}>{p.title}</div>
              <div style={{ fontFamily: f, fontSize: 13, color: colors.n500, lineHeight: isRTL?2:1.8 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t, isRTL, f, fh, fd } = useF();
  return (
    <section style={{ background: colors.white, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: isRTL?0:4, color: colors.gold, fontFamily: isRTL?"'Cairo',sans-serif":"monospace", marginBottom: 12 }}>{t.features.label}</div>
          <h2 style={{ fontFamily: fd, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>{t.features.title}</h2>
          <p style={{ fontFamily: f, fontSize: 16, color: colors.n500, maxWidth: 500, margin: "0 auto", lineHeight: isRTL?2:1.8 }}>{t.features.subtitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {t.features.items.map((feat, i) => (
            <div key={i} style={{ background: colors.n50, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}`, borderTop: `3px solid ${i < 3 ? colors.primary : colors.gold}`, textAlign: isRTL?"right":"left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexDirection: isRTL?"row-reverse":"row" }}>
                <span style={{ fontSize: 26 }}>{feat.icon}</span>
                <span style={{ fontSize: 9, background: feat.tag==="Phase 2"||feat.tag==="المرحلة 2" ? colors.warningBg : colors.green50, color: feat.tag==="Phase 2"||feat.tag==="المرحلة 2" ? colors.warningText : colors.primary, padding: "3px 8px", borderRadius: 999, fontFamily: isRTL?"'Cairo',sans-serif":"monospace" }}>{feat.tag}</span>
              </div>
              <div style={{ fontFamily: fh, fontSize: 15, fontWeight: 700, color: colors.n800, marginBottom: 8 }}>{feat.title}</div>
              <div style={{ fontFamily: f, fontSize: 13, color: colors.n500, lineHeight: isRTL?2:1.8 }}>{feat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t, isRTL, f, fh, fd } = useF();
  return (
    <section style={{ background: `linear-gradient(180deg,${colors.deep} 0%,#0A2E1A 100%)`, padding: "100px 5%", position: "relative", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <defs><pattern id="hiw" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#hiw)"/>
      </svg>
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: isRTL?0:4, color: colors.gold, fontFamily: isRTL?"'Cairo',sans-serif":"monospace", marginBottom: 12 }}>{t.howItWorks.label}</div>
          <h2 style={{ fontFamily: fd, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.white, margin: 0 }}>{t.howItWorks.title}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {t.howItWorks.steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "32px 24px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: colors.primary, border: `2px solid ${colors.gold}55`, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{s.icon}</div>
              <div style={{ fontFamily: isRTL?"'Cairo',sans-serif":"monospace", fontSize: 11, color: colors.gold, letterSpacing: isRTL?0:2, marginBottom: 10 }}>{s.num}</div>
              <div style={{ fontFamily: fh, fontSize: 17, fontWeight: 700, color: colors.white, marginBottom: 12 }}>{s.title}</div>
              <div style={{ fontFamily: f, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: isRTL?2:1.85 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Programs() {
  const { t, isRTL, f, fh, fd } = useF();
  const progColors = [colors.primary, colors.primaryDark, colors.goldDark, "#5a4a2a"];
  return (
    <section style={{ background: colors.n50, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: isRTL?0:4, color: colors.gold, fontFamily: isRTL?"'Cairo',sans-serif":"monospace", marginBottom: 12 }}>{t.programs.label}</div>
          <h2 style={{ fontFamily: fd, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>{t.programs.title}</h2>
          <p style={{ fontFamily: f, fontSize: 16, color: colors.n500, maxWidth: 480, margin: "0 auto", lineHeight: isRTL?2:1.8 }}>{t.programs.subtitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {t.programs.items.map((p, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${colors.n200}` }}>
              <div style={{ background: progColors[i], padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.1 }}><HifzMark size={120} primary="white" gold="white"/></div>
                <div style={{ position: "relative", textAlign: isRTL?"right":"left" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{p.arabic}</div>
                  <div style={{ fontFamily: fh, fontSize: 20, fontWeight: 700, color: colors.white }}>{p.name}</div>
                </div>
              </div>
              <div style={{ padding: 24, textAlign: isRTL?"right":"left" }}>
                <p style={{ fontFamily: f, fontSize: 13, color: colors.n500, lineHeight: isRTL?2:1.8, marginBottom: 16 }}>{p.desc}</p>
                {p.features.map((feat, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexDirection: isRTL?"row-reverse":"row" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: colors.successBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: colors.successText }}>✓</span>
                    </div>
                    <span style={{ fontFamily: f, fontSize: 13, color: colors.n700 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { t, isRTL, f, fh, fd } = useF();
  return (
    <section style={{ background: `linear-gradient(135deg,${colors.deep} 0%,${colors.primaryDark} 100%)`, padding: "100px 5%", position: "relative", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <defs><pattern id="cta" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#cta)"/>
      </svg>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: 24 }}>
          <HifzMark size={72} primary="#10B981" gold={colors.gold}/>
        </div>
        <h2 style={{ fontFamily: fd, fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 700, color: colors.white, margin: "0 0 20px", lineHeight: 1.15 }}>
          {t.cta.title1}<br/><span style={{ color: colors.gold }}>{t.cta.title2}</span>
        </h2>
        <p style={{ fontFamily: f, fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: isRTL?2:1.85, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>{t.cta.subtitle}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexDirection: isRTL?"row-reverse":"row" }}>
          <Link href="/get-started" style={{ padding: "16px 36px", borderRadius: 10, background: colors.gold, color: colors.white, fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: fh, boxShadow: "0 4px 24px rgba(196,136,42,0.45)" }}>{t.cta.cta1}</Link>
          <Link href="/contact" style={{ padding: "16px 28px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: colors.white, fontSize: 16, textDecoration: "none", fontFamily: fh }}>{t.cta.cta2}</Link>
        </div>
        <div style={{ marginTop: 28, fontFamily: f, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{t.cta.note}</div>
      </div>
    </section>
  );
}

function Footer() {
  const { t, isRTL, f, fh } = useF();
  const cols = [
    { title: t.footer.product, links: [{ label: t.footer.links.features, href: "/solutions" }, { label: t.footer.links.programs, href: "/programs" }, { label: t.footer.links.pricing, href: "/pricing" }] },
    { title: t.footer.company, links: [{ label: t.footer.links.about, href: "/about" }, { label: t.footer.links.contact, href: "/contact" }, { label: t.footer.links.careers, href: "/contact" }] },
    { title: t.footer.legal,   links: [{ label: t.footer.links.privacy, href: "/privacy" }, { label: t.footer.links.terms, href: "/terms" }, { label: t.footer.links.help, href: "/contact" }] },
  ];
  return (
    <footer style={{ background: colors.deep, padding: "60px 5% 32px", borderTop: "1px solid #1a2e1a", direction: t.dir }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div style={{ textAlign: isRTL?"right":"left" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16, textDecoration: "none", flexDirection: isRTL?"row-reverse":"row" }}>
              <HifzMark size={40} primary="#10B981" gold={colors.gold}/>
              <div style={{ textAlign: isRTL?"right":"left" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
                <div style={{ fontSize: 7, letterSpacing: isRTL?0:2.5, color: colors.gold, fontFamily: "monospace", marginTop: 3, opacity: 0.7 }}>{isRTL?"احفظ · احمِ · تفوّق":"MEMORIZE · PROTECT · EXCEL"}</div>
              </div>
            </Link>
            <p style={{ fontFamily: f, fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: isRTL?2:1.8, maxWidth: 260 }}>{t.footer.tagline}</p>
          </div>
          {cols.map((col, i) => (
            <div key={i} style={{ textAlign: isRTL?"right":"left" }}>
              <div style={{ fontFamily: fh, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontFamily: f, fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, textDecoration: "none" }}>{l.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1a2e1a", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, flexDirection: isRTL?"row-reverse":"row" }}>
          <div style={{ fontFamily: f, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>{t.footer.copyright}</div>
          <div style={{ display: "flex", gap: 16, flexDirection: isRTL?"row-reverse":"row" }}>
            {[{ label: t.footer.links.privacy, href:"/privacy" },{ label: t.footer.links.terms, href:"/terms" },{ label: t.footer.links.contact, href:"/contact" }].map(l=>(
              <Link key={l.href} href={l.href} style={{ fontFamily: f, fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main>
      <Nav/>
      <Hero/>
      <Problem/>
      <Features/>
      <HowItWorks/>
      <Programs/>
      <FinalCTA/>
      <Footer/>
    </main>
  );
}
