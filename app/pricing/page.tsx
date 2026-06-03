"use client";
import { useState } from "react";
import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const plans = [
  {
    name: "Starter", tier: "Single campus", priceM: 4999, priceA: 3999,
    features: [
      { label: "1 Campus", inc: true },
      { label: "Up to 100 students", inc: true },
      { label: "5 Ustadh accounts", inc: true },
      { label: "Sabaq/Sabqi/Manzil engine", inc: true },
      { label: "WhatsApp parent updates", inc: true },
      { label: "Attendance tracking", inc: true },
      { label: "Basic reports & exports", inc: true },
      { label: "Analytics dashboard", inc: false },
      { label: "Multi-campus management", inc: false },
      { label: "Digital Sanad issuance", inc: false },
      { label: "Fee management", inc: false },
      { label: "Mutashabihat module", inc: false },
    ],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Growth", tier: "Growing institutions", priceM: 12999, priceA: 9999,
    features: [
      { label: "Up to 3 campuses", inc: true },
      { label: "Up to 500 students", inc: true },
      { label: "Unlimited Asatidha", inc: true },
      { label: "Sabaq/Sabqi/Manzil engine", inc: true },
      { label: "WhatsApp parent updates", inc: true },
      { label: "Attendance tracking", inc: true },
      { label: "Advanced reports & exports", inc: true },
      { label: "Analytics dashboard", inc: true },
      { label: "Multi-campus management", inc: true },
      { label: "Digital Sanad issuance", inc: true },
      { label: "Fee management", inc: true },
      { label: "Mutashabihat module", inc: false },
    ],
    cta: "Begin Your Journey", highlight: true,
  },
  {
    name: "Enterprise", tier: "Large networks", priceM: null, priceA: null,
    features: [
      { label: "Unlimited campuses", inc: true },
      { label: "Unlimited students", inc: true },
      { label: "Unlimited Asatidha", inc: true },
      { label: "Sabaq/Sabqi/Manzil engine", inc: true },
      { label: "WhatsApp parent updates", inc: true },
      { label: "Attendance tracking", inc: true },
      { label: "Advanced reports & exports", inc: true },
      { label: "Analytics dashboard", inc: true },
      { label: "Multi-campus management", inc: true },
      { label: "Digital Sanad issuance", inc: true },
      { label: "Fee management", inc: true },
      { label: "Mutashabihat module", inc: true },
    ],
    cta: "Contact Us", highlight: false,
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes — every plan starts with a 30-day free trial. No credit card required. You can invite your entire team and test every feature before committing." },
  { q: "Can I change plans later?", a: "Absolutely. You can upgrade or downgrade at any time. When you upgrade, you are billed pro-rata for the remainder of the month." },
  { q: "What currency are the prices in?", a: "All prices shown are in Pakistani Rupees (PKR). For international institutions, we also accept USD — contact us for international pricing." },
  { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. Each institution's data is fully isolated. We never share student data with third parties." },
  { q: "Do parents need to download an app?", a: "No. Parents receive updates via WhatsApp — the most accessible channel in Pakistan. A parent web portal is also available for those who want more detail." },
  { q: "Can I migrate from my existing system?", a: "Yes. We provide a CSV import tool for student data. Our onboarding team assists with migration for Growth and Enterprise plans." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main>
      <SiteNav />
      <PageHero label="PRICING" title="Simple, Transparent Pricing." subtitle="No hidden fees. No per-student charges. One flat fee for your entire institution." />

      {/* Plans */}
      <section style={{ background: colors.n50, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 999, padding: "6px 6px 6px 16px" }}>
              <span style={{ fontSize: 13, color: annual ? colors.n400 : colors.n700, fontFamily: fonts.body }}>Monthly</span>
              <div onClick={() => setAnnual(!annual)} style={{ width: 40, height: 22, borderRadius: 999, background: annual ? colors.primary : colors.n300, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: annual ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: colors.white, transition: "left 0.2s" }} />
              </div>
              <span style={{ fontSize: 13, color: annual ? colors.n700 : colors.n400, fontFamily: fonts.body }}>Annual</span>
              {annual && <span style={{ fontSize: 10, background: colors.successBg, color: colors.successText, padding: "3px 8px", borderRadius: 999, fontFamily: fonts.mono }}>Save 20%</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {plans.map((p, i) => (
              <div key={i} style={{ background: p.highlight ? colors.primary : colors.white, borderRadius: 20, padding: 28, border: p.highlight ? "none" : `1px solid ${colors.n200}`, boxShadow: p.highlight ? "0 8px 32px rgba(13,92,58,0.25)" : "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", transform: p.highlight ? "scale(1.03)" : "none" }}>
                {p.highlight && <div style={{ fontSize: 9, background: colors.gold, color: colors.white, padding: "4px 12px", borderRadius: 999, fontFamily: fonts.mono, letterSpacing: 1, display: "inline-block", marginBottom: 12, alignSelf: "flex-start" }}>MOST POPULAR</div>}
                <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.gold, marginBottom: 4 }}>{p.tier.toUpperCase()}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: p.highlight ? colors.white : colors.n800, marginBottom: 16 }}>{p.name}</div>
                <div style={{ marginBottom: 24 }}>
                  {p.priceM ? (
                    <>
                      <span style={{ fontFamily: fonts.display, fontSize: 38, fontWeight: 700, color: p.highlight ? colors.white : colors.n800 }}>
                        PKR {(annual ? p.priceA! : p.priceM).toLocaleString()}
                      </span>
                      <span style={{ fontFamily: fonts.body, fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.55)" : colors.n400 }}>/mo</span>
                    </>
                  ) : (
                    <div style={{ fontFamily: fonts.display, fontSize: 32, fontWeight: 700, color: p.highlight ? colors.white : colors.n800 }}>Custom</div>
                  )}
                </div>
                <div style={{ flex: 1, marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center", opacity: f.inc ? 1 : 0.35 }}>
                      <span style={{ fontSize: 12, color: f.inc ? (p.highlight ? colors.white : colors.successText) : colors.n400, flexShrink: 0 }}>{f.inc ? "✓" : "✗"}</span>
                      <span style={{ fontFamily: fonts.body, fontSize: 12, color: p.highlight ? "rgba(255,255,255,0.8)" : colors.n600, lineHeight: 1.5 }}>{f.label}</span>
                    </div>
                  ))}
                </div>
                <Link href={p.name === "Enterprise" ? "/contact" : "/get-started"} style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 10, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none", background: p.highlight ? colors.gold : "transparent", border: p.highlight ? "none" : `2px solid ${colors.primary}`, color: p.highlight ? colors.white : colors.primary }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24, fontFamily: fonts.body, fontSize: 13, color: colors.n400 }}>
            All plans include a 30-day free trial · No credit card required · Cancel anytime
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>FAQS</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "2.5rem", fontWeight: 700, color: colors.n800, margin: 0 }}>Common Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: colors.n50, borderRadius: 12, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: "18px 20px", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 600, color: colors.n800 }}>{f.q}</span>
                  <span style={{ color: colors.primary, fontSize: 18, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontFamily: fonts.body, fontSize: 13, color: colors.n500, lineHeight: 1.8 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
