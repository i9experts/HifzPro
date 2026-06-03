"use client";
import { useLanguage } from "@/providers/LanguageProvider";
import { colors } from "@/lib/tokens";

function HeroPattern() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.045 }}>
      <defs>
        <pattern id="octPat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6"/>
          <polygon points="28,10 52,10 70,28 70,52 52,70 28,70 10,52 10,28" fill="none" stroke="white" strokeWidth="0.3"/>
          <circle cx="40" cy="40" r="6" fill="none" stroke="white" strokeWidth="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#octPat)"/>
    </svg>
  );
}

export default function Hero() {
  const { t, isRTL } = useLanguage();

  return (
    <section style={{
      background: `linear-gradient(160deg, ${colors.deep} 0%, #0A2E1A 50%, ${colors.deep} 100%)`,
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px 5% 80px", position: "relative", overflow: "hidden",
    }}>
      <HeroPattern/>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: `radial-gradient(ellipse,${colors.gold}12 0%,transparent 70%)`, pointerEvents: "none" }}/>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 860 }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,136,42,0.12)", border: "1px solid rgba(196,136,42,0.3)", borderRadius: 999, padding: "7px 18px", marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.gold }}/>
          <span style={{ fontSize: isRTL ? 13 : 12, color: colors.gold, fontFamily: isRTL ? "'Cairo',sans-serif" : "monospace", letterSpacing: isRTL ? 0 : 1.5 }}>
            {t.hero.badge}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: isRTL ? "'Cairo',sans-serif" : "'Cormorant Garamond',serif", fontSize: "clamp(2.8rem,6vw,5rem)", fontWeight: 700, color: colors.white, lineHeight: 1.15, margin: "0 0 24px", letterSpacing: isRTL ? 0 : 0.5, direction: t.dir }}>
          {t.hero.headline1}<br/>
          {t.hero.headline2}{" "}
          <span style={{ color: colors.gold }}>{t.hero.headline3}</span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: isRTL ? "'Cairo',sans-serif" : "'DM Sans',sans-serif", fontSize: "clamp(1rem,2vw,1.15rem)", color: "rgba(255,255,255,0.62)", lineHeight: isRTL ? 2 : 1.85, maxWidth: 600, margin: "0 auto 40px", direction: t.dir }}>
          {t.hero.subtitle}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64, flexDirection: isRTL ? "row-reverse" : "row" }}>
          <button style={{ padding: "15px 34px", borderRadius: 10, background: colors.gold, border: "none", color: colors.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: isRTL ? "'Cairo',sans-serif" : "'Outfit',sans-serif", boxShadow: "0 4px 20px rgba(196,136,42,0.4)" }}>
            {t.hero.cta1}
          </button>
          <button style={{ padding: "15px 28px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: colors.white, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: isRTL ? "'Cairo',sans-serif" : "'Outfit',sans-serif" }}>
            {t.hero.cta2}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 0, justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", maxWidth: 600, margin: "0 auto", flexDirection: isRTL ? "row-reverse" : "row" }}>
          {[
            { val: "500+",   label: t.stats.institutions },
            { val: "12,000+", label: t.stats.students },
            { val: "60M+",  label: t.stats.ayahs },
            { val: "98%",   label: t.stats.adoption },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "20px 12px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: colors.white, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: isRTL ? "'Cairo',sans-serif" : "'DM Sans',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
