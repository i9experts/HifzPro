import { colors, fonts } from "@/lib/tokens";

function HeroPattern() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.045 }}>
      <defs>
        <pattern id="octPat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6" />
          <polygon points="28,10 52,10 70,28 70,52 52,70 28,70 10,52 10,28" fill="none" stroke="white" strokeWidth="0.3" />
          <circle cx="40" cy="40" r="6" fill="none" stroke="white" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#octPat)" />
    </svg>
  );
}

const stats = [
  { val: "500+",   label: "Institutions" },
  { val: "12,000+", label: "Active Students" },
  { val: "60M+",  label: "Ayahs Tracked" },
  { val: "98%",   label: "Ustadh Adoption" },
];

export default function Hero() {
  return (
    <section style={{
      background: `linear-gradient(160deg, ${colors.deep} 0%, #0A2E1A 50%, ${colors.deep} 100%)`,
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px 5% 80px", position: "relative", overflow: "hidden",
    }}>
      <HeroPattern />

      {/* Gold glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 300,
        background: `radial-gradient(ellipse, ${colors.gold}12 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 860 }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(196,136,42,0.12)", border: "1px solid rgba(196,136,42,0.3)",
          borderRadius: 999, padding: "7px 18px", marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.gold }} />
          <span style={{ fontSize: 12, color: colors.gold, fontFamily: fonts.mono, letterSpacing: 1.5 }}>
            PAKISTAN&apos;S FIRST INTELLIGENT HIFZ PLATFORM
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: fonts.display, fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 700, color: colors.white, lineHeight: 1.12,
          margin: "0 0 24px", letterSpacing: 0.5,
        }}>
          Empowering Every<br />
          Hifz Journey,{" "}
          <span style={{ color: colors.gold }}>Professionally.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: fonts.body, fontSize: "clamp(1rem, 2vw, 1.15rem)",
          color: "rgba(255,255,255,0.62)", lineHeight: 1.85,
          maxWidth: 600, margin: "0 auto 40px",
        }}>
          Replace the manual diary with intelligent Sabaq–Sabqi–Manzil tracking.
          Built for Hifz institutes, Asatidha, and parents — serving every program
          from Nazra to full Hifz ul Quran.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          <button style={{
            padding: "15px 34px", borderRadius: 10,
            background: colors.gold, border: "none",
            color: colors.white, fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: fonts.heading,
            boxShadow: "0 4px 20px rgba(196,136,42,0.4)", letterSpacing: 0.3,
          }}>
            Begin Your Institution&apos;s Journey
          </button>
          <button style={{
            padding: "15px 28px", borderRadius: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: colors.white, fontSize: 15, fontWeight: 500,
            cursor: "pointer", fontFamily: fonts.heading,
          }}>
            ▶ Watch Demo
          </button>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 0, justifyContent: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16, overflow: "hidden",
          maxWidth: 600, margin: "0 auto",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "20px 12px", textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, color: colors.white, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: fonts.body }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4,
      }}>
        <span style={{ fontSize: 9, letterSpacing: 3, color: "white", fontFamily: fonts.mono }}>SCROLL</span>
        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.3)" }} />
      </div>
    </section>
  );
}
