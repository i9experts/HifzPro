"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";

const G = {
  deep: "#050D0A", dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary: "#10B981", gold: "#C4882A", white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.08)",
};
const sans  = "'Inter','Segoe UI',system-ui,sans-serif";
const mono  = "'JetBrains Mono','Fira Code','Courier New',monospace";
const serif = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";

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
  { nameUr: "مفت ٹرائل",  name: "Free Trial",    pricePKR: "Free",  priceGBP: "Free",  period: "14 days",  students: "Up to 20",   color: "#6b7280", highlight: false, features: ["All Core Modules", "WhatsApp Updates", "Parent Portal", "Email Support"] },
  { nameUr: "بنیادی",      name: "Basic",         pricePKR: "2,999", priceGBP: "14",    period: "/ month",  students: "Up to 50",   color: "#60a5fa", highlight: false, features: ["Everything in Trial", "Attendance Reports", "Test Module", "Batch Management"] },
  { nameUr: "پروفیشنل",    name: "Professional",  pricePKR: "5,999", priceGBP: "29",    period: "/ month",  students: "Up to 200",  color: "#10B981", highlight: true,  features: ["Everything in Basic", "Fee Management", "Sanad / Certificates", "Analytics Dashboard", "Priority Support"] },
  { nameUr: "انٹرپرائز",   name: "Enterprise",    pricePKR: "9,999", priceGBP: "49",    period: "/ month",  students: "Unlimited",  color: "#C4882A", highlight: false, features: ["Everything in Pro", "Multi-Campus", "Mutashabihat AI", "Super Admin Access", "Dedicated Support"] },
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
    <div style={{ background: G.deep, minHeight: "100vh", color: G.white, fontFamily: sans }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 56, paddingLeft: 24, paddingRight: 24, textAlign: "center" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          <Link href="/" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Home</Link>
          <span style={{ color: G.dim, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: G.primary }}>Pricing</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 3, color: G.primary, marginBottom: 12 }}>TRANSPARENT PRICING</div>
        <h1 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: G.white, margin: "0 0 16px" }}>
          Simple, Honest Pricing
        </h1>
        <p style={{ fontFamily: sans, fontSize: 16, color: G.dim, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.75 }}>
          No hidden fees. No per-student charges. Cancel anytime. All plans include a 14-day free trial.
        </p>

        {/* Toggle row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {/* Currency */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "6px 14px" }}>
            <span style={{ fontFamily: sans, fontSize: 13, fontWeight: gbp ? 400 : 700, color: gbp ? G.dim : G.primary }}>PKR</span>
            <div onClick={() => setGbp(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: gbp ? G.primary : G.border, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: G.white, position: "absolute", top: 3, left: gbp ? 21 : 3, transition: "left 0.2s" }} />
            </div>
            <span style={{ fontFamily: sans, fontSize: 13, fontWeight: gbp ? 700 : 400, color: gbp ? G.primary : G.dim }}>GBP</span>
          </div>
          {/* Annual */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "6px 14px" }}>
            <span style={{ fontFamily: sans, fontSize: 13, fontWeight: annual ? 400 : 700, color: annual ? G.dim : G.primary }}>Monthly</span>
            <div onClick={() => setAnnual(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: annual ? G.primary : G.border, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: G.white, position: "absolute", top: 3, left: annual ? 21 : 3, transition: "left 0.2s" }} />
            </div>
            <span style={{ fontFamily: sans, fontSize: 13, fontWeight: annual ? 700 : 400, color: annual ? G.primary : G.dim }}>Annual</span>
            <span style={{ background: `${G.gold}22`, color: G.gold, fontFamily: mono, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>20% OFF</span>
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
                background: plan.highlight ? "linear-gradient(160deg,#0A2E1A,#052e16)" : G.card,
                borderRadius: 18, padding: isMobile ? "24px 20px" : "28px 24px",
                border: `1px solid ${plan.highlight ? G.primary : G.border}`,
                position: "relative",
                boxShadow: plan.highlight ? "0 0 48px rgba(16,185,129,0.2)" : "none",
              }}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: G.primary, color: G.dark,
                    padding: "4px 16px", borderRadius: 999,
                    fontFamily: mono, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontFamily: arabic, fontSize: 14, color: plan.color, opacity: 0.75, marginBottom: 4 }}>{plan.nameUr}</div>
                <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: G.white, marginBottom: 14 }}>{plan.name}</div>

                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: plan.color }}>
                    {displayPrice(plan)}
                  </span>
                  {plan.pricePKR !== "Free" && (
                    <span style={{ fontFamily: sans, fontSize: 12, color: G.dim }}>{" "}{plan.period}</span>
                  )}
                </div>
                {annual && plan.pricePKR !== "Free" && (
                  <div style={{ fontFamily: sans, fontSize: 11, color: G.gold, marginBottom: 4 }}>Save 20% with annual billing</div>
                )}

                <div style={{ fontFamily: sans, fontSize: 12, color: G.dim, marginBottom: 18 }}>
                  Students: <span style={{ color: plan.color, fontWeight: 700 }}>{plan.students}</span>
                </div>

                <div style={{ height: 1, background: G.border, marginBottom: 16 }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: plan.color, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ fontFamily: sans, fontSize: 13, color: G.dim, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup" style={{
                  display: "block", textAlign: "center",
                  padding: "12px", borderRadius: 10,
                  background: plan.highlight ? G.primary : G.faint,
                  color: plan.highlight ? G.dark : G.white,
                  fontFamily: sans, fontSize: 14, fontWeight: 700,
                  textDecoration: "none",
                  border: plan.highlight ? "none" : `1px solid ${G.border}`,
                }}>
                  {plan.pricePKR === "Free" ? "Start Free Trial" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>

          {/* Annual notice */}
          <div style={{
            marginTop: 24, padding: "16px 24px", borderRadius: 12,
            background: `${G.gold}10`, border: `1px solid ${G.gold}30`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, margin: 0 }}>
              <strong style={{ color: G.gold }}>Annual Plan Discount:</strong>{" "}
              Pay annually and save 20% — equivalent to over 2 months free. Contact{" "}
              <a href="mailto:info@i9experts.com" style={{ color: G.primary }}>info@i9experts.com</a>{" "}
              for an annual invoice.
            </p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 700, color: G.white, textAlign: "center", margin: "0 0 36px" }}>
            What's Included in Every Plan
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {INCLUDED.map((item, i) => (
              <div key={i} style={{ background: G.card, borderRadius: 14, padding: "28px 24px", border: `1px solid ${G.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, margin: "0 0 10px" }}>{item.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 13, color: G.dim, margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px", borderTop: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 700, color: G.white, textAlign: "center", margin: "0 0 36px" }}>
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${G.border}` }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 0", gap: 16,
                  fontFamily: sans, fontSize: 15, fontWeight: 600,
                  color: openFaq === i ? G.primary : G.white,
                  textAlign: "left",
                }}
              >
                {faq.q}
                <span style={{ fontSize: 13, color: G.dim, flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </button>
              {openFaq === i && (
                <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, lineHeight: 1.75, margin: "0 0 18px", paddingRight: 24 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "56px 20px" : "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? "2rem" : "clamp(2rem,4vw,3rem)", fontWeight: 700, color: G.white, margin: "0 0 14px" }}>
          Start your 14-day free trial today
        </h2>
        <p style={{ fontFamily: sans, fontSize: 15, color: G.dim, margin: "0 auto 28px", maxWidth: 420 }}>
          No credit card required. Full access to all features on your selected plan.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ padding: "13px 28px", borderRadius: 12, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 28px rgba(16,185,129,0.35)" }}>
            Start Free Trial →
          </Link>
          <Link href="/contact" style={{ padding: "13px 28px", borderRadius: 12, border: `1px solid ${G.border}`, color: G.white, fontFamily: sans, fontSize: 15, fontWeight: 600, textDecoration: "none", background: G.faint }}>
            Talk to Sales
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
