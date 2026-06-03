import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const programs = [
  {
    name: "Hifz ul Quran", arabic: "حفظ القرآن", color: colors.primary,
    tagline: "Full Quran memorization — the complete program.",
    desc: "The flagship program. Every feature of HifzPro is built around the Hifz ul Quran journey — from the first Sabaq of Surah Fatiha to the final Dour before the Sanad. Sabaq, Sabqi, and Manzil all tracked with intelligent spaced-repetition scheduling.",
    milestones: ["Enrolment placement test", "Amm Para (Juz 30) secured", "5 Paras complete", "15 Paras — Nuss milestone", "25 Paras complete", "30 Paras — Khatm", "Sanad / Ijazah issued"],
    features: ["Full Sabaq/Sabqi/Manzil engine", "Smart Manzil health scoring", "Para test management", "Tarteeb (random Ayah) test", "Projected Khatm date", "Digital Sanad on completion", "WhatsApp parent daily updates"],
  },
  {
    name: "Nazra", arabic: "ناظرہ", color: colors.primaryDark,
    tagline: "Fluent recitation with Tajweed — from start to Khatm.",
    desc: "Track every student's Nazra journey Surah by Surah, with quality grading for fluency and Tajweed accuracy. The Ustadh records which Surahs have been completed and their recitation quality — building a clear picture of readiness for the Hifz program.",
    milestones: ["Qaidah completion", "Juz Amma (Juz 30)", "First 10 Juz", "First 20 Juz", "Full Quran Khatm", "Nazra certificate issued"],
    features: ["Surah-by-Surah completion tracking", "Fluency quality grading", "Tajweed error logging", "Readiness for Hifz assessment", "Khatm certificate generation", "Parent progress updates"],
  },
  {
    name: "Tajweed / Qaidah", arabic: "تجوید", color: colors.goldDark,
    tagline: "Rule-by-rule Tajweed mastery — properly tracked.",
    desc: "Whether your institution uses Noorani Qaidah, Qaida Baghdadia, or a custom curriculum — HifzPro tracks rule-by-rule progress with competency grading. The Ustadh marks each rule as Introduced, Practising, or Mastered.",
    milestones: ["Qaidah basics complete", "Makharij mastered", "Sifaat al-Huroof", "Madd rules complete", "Waqf and Ibtida", "Tajweed certification"],
    features: ["Rule-by-rule progress tracker", "Makharij and Sifaat logging", "Competency levels per rule", "Custom curriculum support", "Linked to Hifz/Nazra program", "Tajweed certification"],
  },
  {
    name: "Girdaan / Dohraai", arabic: "گردان", color: "#5a4a2a",
    tagline: "Intensive revision cycles for Huffaz — protecting what is memorized.",
    desc: "For completed Huffaz who need structured revision cycles. Track every Girdaan round with Para-level quality scoring. The system automatically identifies which Paras are weakening and prioritizes them in the next cycle.",
    milestones: ["1st Girdaan complete", "3rd Girdaan — solid retention", "Annual Dour cycle", "Ramadan intensive cycle", "Scholar certification"],
    features: ["Cycle-by-cycle tracking", "Para quality scoring per round", "Weak Para identification", "Rotation schedule management", "Annual Khatm record", "Revision certificate"],
  },
];

export default function ProgramsPage() {
  return (
    <main>
      <SiteNav />
      <PageHero label="PROGRAMS" title="Four Programs.<br/>One Platform." subtitle="Every Islamic learning program your institution offers — managed with the same precision and intelligence." />

      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          {programs.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1.4fr" : "1.4fr 1fr", gap: 40, alignItems: "center", padding: "40px 0", borderBottom: `1px solid ${colors.n100}` }}>
              {/* Color card */}
              {i % 2 !== 0 && (
                <div style={{ background: colors.n50, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}` }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: colors.n600, marginBottom: 12 }}>Milestones</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {p.milestones.map((m, j) => (
                      <div key={j} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>{j + 1}</span>
                        </div>
                        <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Content */}
              <div>
                <div style={{ fontFamily: fonts.display, fontSize: 28, color: `${p.color}88`, marginBottom: 4 }}>{p.arabic}</div>
                <h2 style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: colors.n800, margin: "0 0 8px" }}>{p.name}</h2>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.color, letterSpacing: 1, marginBottom: 16 }}>{p.tagline}</div>
                <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500, lineHeight: 1.85, marginBottom: 20 }}>{p.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: p.color, fontWeight: 700, flexShrink: 0 }}>◆</span>
                      <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Milestones — right side */}
              {i % 2 === 0 && (
                <div style={{ background: colors.n50, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}` }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: colors.n600, marginBottom: 12 }}>Milestones</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {p.milestones.map((m, j) => (
                      <div key={j} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>{j + 1}</span>
                        </div>
                        <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: colors.green50, padding: "80px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.n800, marginBottom: 16 }}>Which Programs Does Your Institution Offer?</h2>
          <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n500, marginBottom: 32, lineHeight: 1.8 }}>HifzPro supports all four programs simultaneously — enrol students in any combination.</p>
          <Link href="/get-started" style={{ padding: "14px 36px", borderRadius: 10, background: colors.primary, color: colors.white, fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
            Start Free Trial
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
