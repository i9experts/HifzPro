import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const solutions = [
  {
    icon: "📖", title: "Sabaq · Sabqi · Manzil Engine",
    desc: "The complete digital diary. Every lesson logged with Para, Surah, Ayah, page number, quality grade, mistake count, and type. Three streams — new lesson, recent consolidation, long-term revision — all tracked in under 2 minutes per student.",
    features: ["Madani 15-line Mushaf reference", "Quality grading: Excellent / Good / Weak / Repeat", "Mistake types: Atak, Tajweed, Lahn Jali, Lahn Khafi", "Auto-timer per lesson", "Ustadh voice notes"],
  },
  {
    icon: "💚", title: "Manzil Health Score",
    desc: "Our proprietary 0–100 score that tells you — in real time — how strong each student's long-term memorization is. Calculated from historical mistake patterns, revision frequency, and retention quality.",
    features: ["Live score per student", "Institutional average dashboard", "Alert when score drops below threshold", "30/90/180-day trend charts", "Batch comparison view"],
  },
  {
    icon: "💬", title: "WhatsApp Parent Updates",
    desc: "Automatic daily messages to parents in Urdu — no app download required. Every parent stays informed without the Ustadh making a single phone call.",
    features: ["Daily Sabaq summary in Urdu", "Absence alert same day", "Para completion announcement", "Test result notification", "Fee due reminder", "Custom institution templates"],
  },
  {
    icon: "📊", title: "Analytics & Intelligence",
    desc: "Turn accumulated lesson data into actionable intelligence. See which Ayahs students most commonly forget, which Ustadh has the highest retention quality, and which students are at dropout risk — weeks before it happens.",
    features: ["Institutional dashboard", "Dropout risk flagging", "Mutashabihat weakness map", "Ustadh effectiveness score", "Completion rate trends"],
  },
  {
    icon: "🏛", title: "Digital Sanad & Certification",
    desc: "Issue tamper-proof digital Sanads and Ijazahs with QR verification. Every certificate links to a permanent record in the HifzPro registry — verifiable by anyone, anywhere.",
    features: ["QR-verified Sanad PDF", "Institutional seal and signature", "Silsila / chain of transmission", "Para test records", "Full exam history"],
  },
  {
    icon: "🌐", title: "Multi-Campus Management",
    desc: "Built for networks, not just single madrasas. Run your entire institution network from one dashboard with full data isolation between campuses.",
    features: ["Unlimited campus branches", "Role-based access control", "Cross-campus student transfer", "Network-wide analytics", "Per-campus fee structures"],
  },
];

export default function SolutionsPage() {
  return (
    <main>
      <SiteNav />
      <PageHero label="SOLUTIONS" title="Everything a Serious<br/>Hifz Institution Needs" subtitle="Six powerful modules — each designed around how Asatidha actually work. In the halqa. On a phone. Under time pressure." />

      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {solutions.map((s, i) => (
            <div key={i} style={{ background: colors.n50, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}`, borderTop: `3px solid ${i % 2 === 0 ? colors.primary : colors.gold}` }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.n800, marginBottom: 10 }}>{s.title}</div>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, lineHeight: 1.8, marginBottom: 16 }}>{s.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {s.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: colors.successBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: colors.successText }}>✓</span>
                    </div>
                    <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: colors.deep, padding: "80px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.white, marginBottom: 16 }}>Ready to See It in Action?</h2>
          <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32, lineHeight: 1.8 }}>Book a free demo and we will walk you through every module tailored to your institution.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/get-started" style={{ padding: "14px 32px", borderRadius: 10, background: colors.gold, color: colors.white, fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
              Start Free Trial
            </Link>
            <Link href="/contact" style={{ padding: "14px 28px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", color: colors.white, fontSize: 15, textDecoration: "none", fontFamily: fonts.heading }}>
              Book a Demo →
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
