import Nav     from "@/components/landing/Nav";
import Hero    from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";
import { colors, fonts } from "@/lib/tokens";
import HifzMark from "@/components/ui/HifzMark";

/* ── Problem Section ── */
function Problem() {
  const points = [
    { icon: "📓", title: "No Early Warning", desc: "By the time you notice a student is falling behind, weeks of Manzil have already weakened. The paper diary never alerts you." },
    { icon: "📊", title: "Zero Analytics", desc: "You cannot see which Ayahs 80% of your students forget. You cannot compare batch performance. You are flying blind." },
    { icon: "👨‍👩‍👧", title: "Parents Are Disconnected", desc: "Parents wait for weekly updates — or worse, find out at the Sanad test that their child was struggling for months." },
  ];
  return (
    <section style={{ background: colors.n50, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>THE PROBLEM</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>
            The Manual Diary Is Failing<br />Your Institution
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.n500, maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
            Paper diaries cannot scale. They record — but they do not protect. They fill up — but they do not warn you when a student&apos;s Manzil is at risk.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {points.map((p, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{p.icon}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: colors.n800, marginBottom: 10 }}>{p.title}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, lineHeight: 1.8 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features Section ── */
function Features() {
  const features = [
    { icon: "📖", title: "Sabaq · Sabqi · Manzil Engine", desc: "The full three-stream daily lesson system — digitized, graded, and timed. Every entry tagged to exact Para, Surah, Ayah, and page of the Madani Mushaf.", tag: "Core" },
    { icon: "💚", title: "Manzil Health Score", desc: "Our proprietary 0–100 score shows each student's long-term retention strength. Drops below 60%? You are alerted before it becomes a crisis.", tag: "Intelligent" },
    { icon: "💬", title: "WhatsApp Parent Updates", desc: "Automatic daily Sabaq summaries, attendance alerts, and test results delivered to parents in Urdu — no app download required.", tag: "Engagement" },
    { icon: "📊", title: "Analytics Dashboard", desc: "Institutional-level insights: completion rates, dropout risk, Ustadh effectiveness, and the specific Ayahs your students most commonly forget.", tag: "Phase 2" },
    { icon: "🏛", title: "Digital Sanad & Certification", desc: "Issue QR-verified Sanads and Ijazahs. Every certificate links to a permanent, tamper-proof record in the HifzPro registry.", tag: "Certification" },
    { icon: "🌐", title: "Multi-Campus Ready", desc: "One platform for your entire network. Super Admin sees all. Campus admins see theirs. Ustadh sees their halqa. Full role-based access.", tag: "Enterprise" },
  ];
  return (
    <section style={{ background: colors.white, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>THE SOLUTION</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>
            Everything Your Institution<br />Needs. Nothing It Doesn&apos;t.
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.n500, maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
            Six modules. One platform. Every feature built around how Asatidha actually work — in the halqa, on a phone, under time pressure.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: colors.n50, borderRadius: 16, padding: 28,
              border: `1px solid ${colors.n200}`,
              borderTop: `3px solid ${i < 3 ? colors.primary : colors.gold}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 26 }}>{f.icon}</span>
                <span style={{
                  fontSize: 9,
                  background: f.tag === "Phase 2" ? colors.warningBg : colors.green50,
                  color: f.tag === "Phase 2" ? colors.warningText : colors.primary,
                  padding: "3px 8px", borderRadius: 999, fontFamily: fonts.mono, letterSpacing: 0.5,
                }}>{f.tag}</span>
              </div>
              <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.n800, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, lineHeight: 1.8 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorks() {
  function HeroPattern() {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.045 }}>
        <defs>
          <pattern id="octPat2" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#octPat2)" />
      </svg>
    );
  }
  const steps = [
    { num: "01", title: "Enrol Your Institution", desc: "Set up your campus, add Asatidha, enrol students, and assign halqas — in under 30 minutes. Import existing student lists via CSV.", icon: "🏫" },
    { num: "02", title: "Ustadh Records Daily", desc: "Each Ustadh logs Sabaq, Sabqi, and Manzil from their phone in under 2 minutes per student. Offline-capable — syncs when connected.", icon: "📱" },
    { num: "03", title: "The System Protects Hifz", desc: "HifzPro monitors Manzil health, schedules smart revision, alerts parents, and surfaces students at risk — automatically, every single day.", icon: "🛡" },
  ];
  return (
    <section style={{ background: `linear-gradient(180deg,${colors.deep} 0%,#0A2E1A 100%)`, padding: "100px 5%", position: "relative", overflow: "hidden" }}>
      <HeroPattern />
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.white, margin: 0 }}>
            From Setup to Protection<br />in Three Steps
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "32px 24px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: colors.primary, border: `2px solid ${colors.gold}55`, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.gold, letterSpacing: 2, marginBottom: 10 }}>{s.num}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: colors.white, marginBottom: 12 }}>{s.title}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.85 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Programs ── */
function Programs() {
  const programs = [
    { name: "Hifz ul Quran", arabic: "حفظ القرآن", color: colors.primary, desc: "Full memorization — Sabaq, Sabqi, Manzil engine at its most complete.", features: ["Sabaq/Sabqi/Manzil tracking", "Manzil Health Score", "Para & half-Quran milestones", "Digital Sanad on completion"] },
    { name: "Nazra", arabic: "ناظرہ", color: colors.primaryDark, desc: "Recitation with Tajweed. Track fluency progression from Surah to Surah.", features: ["Surah-by-Surah tracking", "Fluency grading", "Tajweed error logging", "Khatm certificate"] },
    { name: "Tajweed / Qaidah", arabic: "تجوید", color: colors.goldDark, desc: "Rule-by-rule mastery tracking through every Tajweed rule.", features: ["Rule-by-rule progress", "Makharij tracking", "Certification on completion", "Linked to Hifz program"] },
    { name: "Girdaan / Dohraai", arabic: "گردان", color: "#5a4a2a", desc: "Intensive revision cycles for Huffaz, protecting memorization quality.", features: ["Cycle tracking", "Quality scoring per Para", "Rotation schedule", "Annual Khatm record"] },
  ];
  return (
    <section style={{ background: colors.n50, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>PROGRAMS</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>
            Four Programs. One Platform.
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.n500, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
            Whether your institution offers Nazra, full Hifz, or post-Hifz revision — HifzPro handles every program with the same precision.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {programs.map((p, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 20, overflow: "hidden", border: `1px solid ${colors.n200}`, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ background: p.color, padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, opacity: 0.1 }}>
                  <HifzMark size={120} primary="white" gold="white" />
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ fontFamily: fonts.display, fontSize: 22, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{p.arabic}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white }}>{p.name}</div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, lineHeight: 1.8, marginBottom: 16 }}>{p.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.features.map((feat, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: colors.successBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: colors.successText }}>✓</span>
                      </div>
                      <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  function HeroPattern() {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.045 }}>
        <defs>
          <pattern id="octPat3" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#octPat3)" />
      </svg>
    );
  }
  return (
    <section style={{ background: `linear-gradient(135deg,${colors.deep} 0%,${colors.primaryDark} 100%)`, padding: "100px 5%", position: "relative", overflow: "hidden" }}>
      <HeroPattern />
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: 24 }}>
          <HifzMark size={72} primary="#10B981" gold={colors.gold} />
        </div>
        <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 700, color: colors.white, margin: "0 0 20px", lineHeight: 1.15 }}>
          Your Students&apos; Hifz Deserves<br />
          <span style={{ color: colors.gold }}>Better Than a Diary.</span>
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.85, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
          Join 500+ institutions across Pakistan who have upgraded from paper to protection. Begin your free 30-day trial today.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ padding: "16px 36px", borderRadius: 10, background: colors.gold, border: "none", color: colors.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading, boxShadow: "0 4px 24px rgba(196,136,42,0.45)" }}>
            Begin Your Institution&apos;s Journey
          </button>
          <button style={{ padding: "16px 28px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: colors.white, fontSize: 16, fontWeight: 500, cursor: "pointer", fontFamily: fonts.heading }}>
            Book a Demo →
          </button>
        </div>
        <div style={{ marginTop: 28, fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          No credit card required · 30-day free trial · Cancel anytime
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const cols = [
    { title: "Product",  links: ["Features","Programs","Pricing","Integrations","Roadmap"] },
    { title: "Company",  links: ["About Us","Contact","Blog","Careers","Press Kit"] },
    { title: "Support",  links: ["Help Center","Documentation","Status","Privacy Policy","Terms"] },
  ];
  return (
    <footer style={{ background: colors.deep, padding: "60px 5% 32px", borderTop: "1px solid #1a2e1a" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <HifzMark size={40} primary="#10B981" gold={colors.gold} />
              <div>
                <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
                <div style={{ fontSize: 7, letterSpacing: 2.5, color: colors.gold, fontFamily: fonts.mono, marginTop: 3, opacity: 0.7 }}>MEMORIZE · PROTECT · EXCEL</div>
              </div>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, maxWidth: 260 }}>
              The world&apos;s leading Hifz management platform. Serving Huffaz, Asatidha, and institutions across Pakistan and beyond.
            </p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>{col.title}</div>
              {col.links.map((l) => (
                <div key={l} style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1a2e1a", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © 2026 HifzPro. All rights reserved. Built with care for the Huffaz of the Ummah.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["Privacy","Terms","Sitemap"].map((l) => (
              <span key={l} style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.25)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── PAGE EXPORT ── */
export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <Programs />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
