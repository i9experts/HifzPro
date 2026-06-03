import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const values = [
  { icon: "📖", title: "The Quran First", desc: "Every design decision begins with the same question: does this protect the memorization? Technology is the servant, never the master." },
  { icon: "🤝", title: "Built for Pakistan", desc: "We understand Pakistani Islamic education — the halqa system, the role of the Ustadh, the importance of the Sanad, the reality of intermittent internet." },
  { icon: "📊", title: "Intelligence, Not Just Records", desc: "A diary records. HifzPro protects. The difference is the intelligence layer — spaced repetition, Manzil health, early warning — that no paper can provide." },
  { icon: "🌍", title: "Global Ummah", desc: "Born in Pakistan. Built for the global Muslim community. Every Hifz institute in the world deserves the same quality of management system." },
];

const team = [
  { name: "Atiq ur Rehman Ayubi", role: "Founder & CEO", desc: "Islamic education entrepreneur. Founder of The Deenway and e-Furqan. Building HifzPro to give every institution the system he wished existed." },
  { name: "Product Team", role: "Design & Engineering", desc: "A team of Muslim technologists and educators who understand both the deen and the software craft." },
];

export default function AboutPage() {
  return (
    <main>
      <SiteNav />
      <PageHero label="ABOUT" title="Built by Muslims,<br/>for Muslim Institutions." subtitle="HifzPro exists because the Quran deserves better than a paper diary." />

      {/* Mission */}
      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>OUR MISSION</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "2.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 20px", lineHeight: 1.2 }}>
              From a Diary to a System. From Recording to Protecting.
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n500, lineHeight: 1.9, marginBottom: 16 }}>
              Across Pakistan, thousands of Hifz institutes run on the same tool they have used for generations — a paper diary. The Ustadh writes the Sabaq. The student brings the diary. The parent never sees it.
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n500, lineHeight: 1.9, marginBottom: 16 }}>
              This system works — until it doesn&apos;t. Until a student&apos;s Manzil quietly weakens over three months and nobody notices. Until the Khatm test reveals gaps that a smarter system would have caught in week two.
            </p>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n500, lineHeight: 1.9 }}>
              HifzPro does not replace the Ustadh or the method. It removes every friction between the teaching moment and the institution&apos;s ability to understand, protect, and improve that moment — at scale.
            </p>
          </div>
          <div style={{ background: colors.deep, borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { val: "2026", label: "Founded" },
              { val: "500+", label: "Institutions Served" },
              { val: "12,000+", label: "Active Students" },
              { val: "Pakistan", label: "Headquarters" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < 3 ? "1px solid #1a2e1a" : "none" }}>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                <span style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 700, color: colors.white }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: colors.n50, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>OUR VALUES</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.n800 }}>What We Stand For</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: colors.white, borderRadius: 16, padding: 24, border: `1px solid ${colors.n200}`, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.n800, marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, lineHeight: 1.7 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>THE TEAM</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.n800 }}>Who Builds HifzPro</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {team.map((t, i) => (
              <div key={i} style={{ background: colors.n50, borderRadius: 16, padding: 24, border: `1px solid ${colors.n200}` }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: "white" }}>{t.name.charAt(0)}</span>
                </div>
                <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.n800, marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.gold, letterSpacing: 1, marginBottom: 10 }}>{t.role}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, lineHeight: 1.7 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: colors.deep, padding: "80px 5%", textAlign: "center" }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.white, marginBottom: 16 }}>Ready to Join the Mission?</h2>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>Start your free trial or reach out to talk about your institution&apos;s needs.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/get-started" style={{ padding: "14px 32px", borderRadius: 10, background: colors.gold, color: colors.white, fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>Start Free Trial</Link>
          <Link href="/contact" style={{ padding: "14px 28px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: colors.white, fontSize: 15, textDecoration: "none", fontFamily: fonts.heading }}>Contact Us</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
