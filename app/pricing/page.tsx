"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { colors, fonts, shadows } from "@/lib/tokens";

const arabic = "'Cairo', sans-serif";

type Plan = {
  nameUr: string;
  name: string;
  pricePKR: string;
  priceGBP: string;
  period: string;
  students: string;
  color: string;
  highlight: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  { nameUr: "مفت ٹرائل",  name: "Free Trial",    pricePKR: "Free",  priceGBP: "Free",  period: "14 days",  students: "Up to 20",   color: colors.n500, highlight: false, features: ["All Core Modules", "WhatsApp Updates", "Parent Portal", "Email Support"] },
  { nameUr: "بنیادی",      name: "Basic",         pricePKR: "2,999", priceGBP: "14",    period: "/ month",  students: "Up to 50",   color: "#2563eb", highlight: false, features: ["Everything in Trial", "Attendance Reports", "Test Module", "Batch Management"] },
  { nameUr: "پروفیشنل",    name: "Professional",  pricePKR: "5,999", priceGBP: "29",    period: "/ month",  students: "Up to 200",  color: colors.primary, highlight: true,  features: ["Everything in Basic", "Fee Management", "Sanad / Certificates", "Analytics Dashboard", "Priority Support"] },
  { nameUr: "انٹرپرائز",   name: "Enterprise",    pricePKR: "9,999", priceGBP: "49",    period: "/ month",  students: "Unlimited",  color: colors.gold, highlight: false, features: ["Everything in Pro", "Multi-Campus", "Mutashabihat AI", "Super Admin Access", "Dedicated Support"] },
];

const FAQS = [
  { q: "Is there really no credit card required for the free trial?", a: "Correct. You can sign up and use HifzPro for 14 days completely free, with no payment information required. At the end of the trial, you choose a plan or your account pauses." },
  { q: "Can I change my plan later?", a: "Yes. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades take effect at the next billing cycle." },
  { q: "What happens to my data if I cancel?", a: "Your data remains fully accessible for 30 days after cancellation for export. After 30 days, it is permanently deleted from our systems." },
  { q: "Is WhatsApp messaging included in all plans?", a: "Yes. Automated WhatsApp messages to parents are included in all plans including the free trial." },
  { q: "Do you offer discounts for larger institutions or NGOs?", a: "Yes. We offer custom pricing for 500+ student institutions, registered NGOs, and diaspora institutions. Contact info@i9experts.com to discuss." },
  { q: "Is there a long-term contract?", a: "No. Monthly plans are month-to-month with no lock-in. Annual plans offer 20% savings and are non-refundable after the 14-day window." },
  { q: "Do you offer support in Urdu?", a: "Absolutely. Our support team communicates fluently in Urdu and English. Most WhatsApp support conversations are in Urdu." },
];

const INCLUDED = [
  { icon: "🔒", title: "Secure & Compliant",     desc: "Pakistan PECA compliant. Student data never sold or shared. Encrypted at rest and in transit." },
  { icon: "📱", title: "Mobile Apps Included",    desc: "Parent Portal PWA + Ustadh app. No extra charge for mobile access across all plans." },
  { icon: "💬", title: "WhatsApp on All Plans",   desc: "Automated parent updates on all 7 event types included from the very first plan." },
];

export default function PricingPage() {
  const [gbp, setGbp]             = useState(false);
  const [annual, setAnnual]       = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(null);
  const [isMobile, setIsMobile]   = useState(false);
  const [isTablet, setIsTablet]   = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1100);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const displayPrice = (plan: Plan) => {
    if (plan.pricePKR === "Free") return "Free";
    const raw = gbp ? parseInt(plan.priceGBP) : parseInt(plan.pricePKR.replace(",", ""));
    const discounted = annual ? Math.round(raw * 0.8) : raw;
    return gbp ? `£${discounted}` : `PKR ${discounted.toLocaleString()}`;
  };

  return (
    <div style={{ background: colors.white, minHeight: "100vh", color: colors.n800, fontFamily: fonts.body }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: 56, paddingLeft: 24, paddingRight: 24, textAlign: "center", background: `linear-gradient(180deg, ${colors.green50} 0%, ${colors.white} 70%)` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          <Link href="/" style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n500, textDecoration: "none" }}>Home</Link>
          <span style={{ color: colors.n400, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.primary }}>Pricing</span>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>TRANSPARENT PRICING</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.2rem)", fontWeight: 800, color: colors.n800, margin: "0 0 16px" }}>
          Simple, Honest Pricing
        </h1>
        <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.n600, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.75 }}>
          No hidden fees. No per-student charges. Cancel anytime. All plans include a 14-day free trial.
        </p>

        {/* Toggle row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {/* Currency */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 999, padding: "6px 14px", boxShadow: shadows.sm }}>
            <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: gbp ? 400 : 700, color: gbp ? colors.n500 : colors.primary }}>PKR</span>
            <div onClick={() => setGbp(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: gbp ? colors.primary : colors.n200, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: colors.white, position: "absolute", top: 3, left: gbp ? 21 : 3, transition: "left 0.2s", boxShadow: shadows.sm }} />
            </div>
            <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: gbp ? 700 : 400, color: gbp ? colors.primary : colors.n500 }}>GBP</span>
          </div>
          {/* Annual */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 999, padding: "6px 14px", boxShadow: shadows.sm }}>
            <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: annual ? 400 : 700, color: annual ? colors.n500 : colors.primary }}>Monthly</span>
            <div onClick={() => setAnnual(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: annual ? colors.primary : colors.n200, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: colors.white, position: "absolute", top: 3, left: annual ? 21 : 3, transition: "left 0.2s", boxShadow: shadows.sm }} />
            </div>
            <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: annual ? 700 : 400, color: annual ? colors.primary : colors.n500 }}>Annual</span>
            <span style={{ background: "#fffbeb", color: colors.gold, fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>20% OFF</span>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section style={{ padding: "0 24px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 16,
          }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{
                background: colors.white,
                borderRadius: 20, padding: isMobile ? "24px 20px" : "28px 24px",
                border: `1.5px solid ${plan.highlight ? colors.primary : colors.n200}`,
                position: "relative",
                boxShadow: plan.highlight ? "0 16px 40px rgba(13,92,58,0.22)" : shadows.sm,
              }}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: colors.primary, color: colors.white,
                    padding: "5px 16px", borderRadius: 999,
                    fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontFamily: arabic, fontSize: 14, color: plan.color, fontWeight: 600, marginBottom: 6 }}>{plan.nameUr}</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 21, fontWeight: 800, color: colors.n800, marginBottom: 14 }}>{plan.name}</div>

                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 800, color: plan.color }}>
                    {displayPrice(plan)}
                  </span>
                  {plan.pricePKR !== "Free" && (
                    <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{" "}{plan.period}</span>
                  )}
                </div>
                {annual && plan.pricePKR !== "Free" && (
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.gold, marginBottom: 4, fontWeight: 600 }}>Save 20% with annual billing</div>
                )}

                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, marginBottom: 18 }}>
                  Students: <span style={{ color: plan.color, fontWeight: 700 }}>{plan.students}</span>
                </div>

                <div style={{ height: 1, background: colors.n100, marginBottom: 16 }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: plan.color, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" style={{
                  display: "block", textAlign: "center",
                  padding: 12, borderRadius: 999,
                  background: plan.highlight ? colors.primary : colors.n50,
                  color: plan.highlight ? colors.white : colors.n800,
                  fontFamily: fonts.heading, fontSize: 14, fontWeight: 700,
                  textDecoration: "none",
                  border: plan.highlight ? "none" : `1.5px solid ${colors.n200}`,
                }}>
                  {plan.pricePKR === "Free" ? "Start Free Trial" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>

          {/* Annual notice */}
          <div style={{
            marginTop: 24, padding: "16px 24px", borderRadius: 14,
            background: "#fffbeb", border: "1px solid #fde68a",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700, margin: 0 }}>
              <strong style={{ color: colors.gold }}>Annual Plan Discount:</strong>{" "}
              Pay annually and save 20% — equivalent to over 2 months free. Contact{" "}
              <a href="mailto:info@i9experts.com" style={{ color: colors.primary }}>info@i9experts.com</a>{" "}
              for an annual invoice.
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", background: colors.n50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.7rem" : "2.1rem", fontWeight: 800, color: colors.n800, textAlign: "center", margin: "0 0 36px" }}>
            What's Included in Every Plan
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {INCLUDED.map((item, i) => (
              <div key={i} style={{ background: colors.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${colors.n200}`, boxShadow: shadows.sm, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 800, color: colors.n800, margin: "0 0 10px" }}>{item.title}</h3>
                <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.7rem" : "2.1rem", fontWeight: 800, color: colors.n800, textAlign: "center", margin: "0 0 36px" }}>
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${colors.n200}` }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 0", gap: 16,
                  fontFamily: fonts.heading, fontSize: 15, fontWeight: 700,
                  color: openFaq === i ? colors.primary : colors.n800,
                  textAlign: "left",
                }}
              >
                {faq.q}
                <span style={{ fontSize: 13, color: colors.n400, flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </button>
              {openFaq === i && (
                <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n600, lineHeight: 1.75, margin: "0 0 18px", paddingRight: 24 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "56px 20px" : "88px 24px", textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "1.9rem" : "clamp(1.9rem,4vw,2.8rem)", fontWeight: 800, color: colors.white, margin: "0 0 14px" }}>
          Start your 14-day free trial today
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "0 auto 28px", maxWidth: 420 }}>
          No credit card required. Full access to all features on your selected plan.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "14px 30px", borderRadius: 999, background: colors.white, color: colors.primary, fontFamily: fonts.heading, fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 28px rgba(0,0,0,0.2)" }}>
            Start Free Trial →
          </Link>
          <Link href="/contact" style={{ padding: "14px 30px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.4)", color: colors.white, fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, textDecoration: "none", background: "rgba(255,255,255,0.08)" }}>
            Talk to Sales
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
