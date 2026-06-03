"use client";
import { useState } from "react";
import { colors, fonts } from "@/lib/tokens";

const plans = [
  {
    name: "Starter", tier: "For single campuses",
    priceM: 4999, priceA: 3999, currency: "PKR",
    features: [
      "1 campus", "Up to 100 students", "5 Ustadh accounts",
      "Sabaq/Sabqi/Manzil engine", "WhatsApp parent updates",
      "Basic attendance & reports",
    ],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Growth", tier: "For growing institutions",
    priceM: 12999, priceA: 9999, currency: "PKR",
    features: [
      "Up to 3 campuses", "Up to 500 students", "Unlimited Asatidha",
      "Everything in Starter", "Analytics dashboard",
      "Assessment & certification", "Fee management", "Digital Sanad issuance",
    ],
    cta: "Begin Your Journey", highlight: true,
  },
  {
    name: "Enterprise", tier: "For large networks",
    priceM: null, priceA: null, currency: "PKR",
    features: [
      "Unlimited campuses", "Unlimited students", "Unlimited Asatidha",
      "Everything in Growth", "Mutashabihat module",
      "Custom branding & domain", "Dedicated support", "SLA guarantee",
    ],
    cta: "Contact Us", highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section style={{ background: colors.n50, padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: colors.gold, fontFamily: fonts.mono, marginBottom: 12 }}>PRICING</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: colors.n800, margin: "0 0 24px" }}>
            Transparent Pricing.<br />No Hidden Fees.
          </h2>
          {/* Toggle */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: colors.white, border: `1px solid ${colors.n200}`,
            borderRadius: 999, padding: "6px 6px 6px 16px",
          }}>
            <span style={{ fontSize: 13, color: annual ? colors.n400 : colors.n700, fontFamily: fonts.body }}>Monthly</span>
            <div onClick={() => setAnnual(!annual)} style={{
              width: 40, height: 22, borderRadius: 999,
              background: annual ? colors.primary : colors.n300,
              cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}>
              <div style={{
                position: "absolute", top: 3,
                left: annual ? 20 : 3, width: 16, height: 16,
                borderRadius: "50%", background: colors.white,
                transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </div>
            <span style={{ fontSize: 13, color: annual ? colors.n700 : colors.n400, fontFamily: fonts.body }}>Annual</span>
            {annual && (
              <span style={{
                fontSize: 10, background: colors.successBg, color: colors.successText,
                padding: "3px 8px", borderRadius: 999, fontFamily: fonts.mono,
              }}>Save 20%</span>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "stretch" }}>
          {plans.map((p, i) => (
            <div key={i} style={{
              background: p.highlight ? colors.primary : colors.white,
              borderRadius: 20, padding: 28,
              border: p.highlight ? "none" : `1px solid ${colors.n200}`,
              boxShadow: p.highlight ? "0 8px 32px rgba(13,92,58,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
              display: "flex", flexDirection: "column",
              transform: p.highlight ? "scale(1.03)" : "none",
            }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.gold, marginBottom: 4 }}>
                  {p.tier.toUpperCase()}
                </div>
                <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: p.highlight ? colors.white : colors.n800 }}>
                  {p.name}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                {p.priceM ? (
                  <>
                    <span style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, color: p.highlight ? colors.white : colors.n800 }}>
                      PKR {(annual ? p.priceA! : p.priceM).toLocaleString()}
                    </span>
                    <span style={{ fontFamily: fonts.body, fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.55)" : colors.n400 }}>/month</span>
                  </>
                ) : (
                  <div style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: p.highlight ? colors.white : colors.n800 }}>Custom</div>
                )}
              </div>
              <div style={{ flex: 1, marginBottom: 24 }}>
                {p.features.map((feat, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      background: p.highlight ? "rgba(255,255,255,0.15)" : colors.successBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 9, color: p.highlight ? colors.white : colors.successText }}>✓</span>
                    </div>
                    <span style={{ fontFamily: fonts.body, fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.8)" : colors.n600, lineHeight: 1.5 }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%", padding: "13px", borderRadius: 10,
                fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, cursor: "pointer",
                background: p.highlight ? colors.gold : "transparent",
                border: p.highlight ? "none" : `2px solid ${colors.primary}`,
                color: p.highlight ? colors.white : colors.primary,
              }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400 }}>
            All plans include a 30-day free trial. No credit card required. Cancel anytime.
          </span>
        </div>
      </div>
    </section>
  );
}
