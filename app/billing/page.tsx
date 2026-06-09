"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";
import type { PlanKey } from "@/lib/stripe";

const PLAN_META = {
  basic: {
    name: "Basic", nameUr: "بنیادی",
    monthlyUSD: 9.99,  annualUSD: 95.90,
    monthlyPKR: 2999,  annualPKR: 28790,
    students: "Up to 50", color: "#3b82f6",
    features: ["All Core Modules","Attendance Reports","Test & Assessment","Batch Management","WhatsApp Updates","Parent Portal"],
  },
  professional: {
    name: "Professional", nameUr: "پروفیشنل",
    monthlyUSD: 19.99, annualUSD: 191.90,
    monthlyPKR: 5999,  annualPKR: 57590,
    students: "Up to 200", color: "#0D5C3A",
    features: ["Everything in Basic","Fee Management","Sanad & Certificates","Advanced Analytics","Mutashabihat AI","Hijri Calendar","Priority Support"],
  },
  enterprise: {
    name: "Enterprise", nameUr: "انٹرپرائز",
    monthlyUSD: 29.99, annualUSD: 287.90,
    monthlyPKR: 9999,  annualPKR: 95990,
    students: "Unlimited", color: "#C4882A",
    features: ["Everything in Professional","Multi-Campus Support","Super Admin Access","Bulk CSV Import","Donor Portal","Dedicated Support","Custom Onboarding"],
  },
} as const;

interface CurrentSub {
  plan: string; status: string; billingCycle: string;
  trialEndsAt: string | null; currentPeriodEnd: string | null;
  nextBillingAt: string | null; stripeCustomerId: string | null;
}

const PLAN_ORDER: PlanKey[] = ["basic", "professional", "enterprise"];

export default function BillingPage() {
  const [sub,      setSub]      = useState<CurrentSub | null>(null);
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [loading,  setLoading]  = useState(true);
  const [upgrading,setUpgrading]= useState<string | null>(null);
  const [portal,   setPortal]   = useState(false);

  useEffect(() => {
    fetch("/api/billing/status")
      .then(r => r.json())
      .then(d => { if (d.success) setSub(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan: PlanKey) => {
    setUpgrading(plan);
    try {
      const res  = await fetch("/api/billing/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch { alert("Connection error. Please try again."); }
    finally { setUpgrading(null); }
  };

  const handlePortal = async () => {
    setPortal(true);
    try {
      const res  = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch { alert("Connection error. Please try again."); }
    finally { setPortal(false); }
  };

  const currentPlan = sub?.plan?.toLowerCase() as PlanKey | undefined;
  const isActive    = sub?.status === "ACTIVE";
  const isTrial     = sub?.status === "TRIAL";

  const trialEnd = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const periodEnd= sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : null;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", fontSize: 16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1 }}>Billing & Plans</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, letterSpacing: 1 }}>SUBSCRIPTION MANAGEMENT</div>
          </div>
        </div>
        {sub?.stripeCustomerId && (
          <button onClick={handlePortal} disabled={portal} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
            {portal ? "Opening..." : "📄 Manage Billing →"}
          </button>
        )}
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>

        {/* Current status banner */}
        {!loading && sub && (
          <div style={{
            borderRadius: 16, padding: "20px 24px", marginBottom: 32,
            background: isActive ? "linear-gradient(135deg,#052e16,#065f46)" : isTrial ? "linear-gradient(135deg,#1e3a5f,#1e40af)" : "linear-gradient(135deg,#450a0a,#7f1d1d)",
            border: `1px solid ${isActive ? "#166534" : isTrial ? "#1d4ed8" : "#991b1b"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>CURRENT PLAN</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: "white" }}>
                  {sub.plan === "TRIAL" ? "Free Trial" : PLAN_META[sub.plan?.toLowerCase() as PlanKey]?.name || sub.plan}
                </span>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 10, fontFamily: fonts.mono, fontWeight: 700,
                  background: isActive ? "#166534" : isTrial ? "#1d4ed8" : "#7f1d1d",
                  color: "white",
                }}>
                  {sub.status}
                </span>
              </div>
              {isTrial && daysLeft !== null && (
                <div style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                  {daysLeft > 0 ? `${daysLeft} days remaining in your free trial` : "Trial has ended — please subscribe to continue"}
                </div>
              )}
              {isActive && periodEnd && (
                <div style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                  Next billing: {periodEnd.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  {sub.billingCycle && <span style={{ marginLeft: 8, opacity: 0.5 }}>· {sub.billingCycle}</span>}
                </div>
              )}
            </div>
            {sub.stripeCustomerId && (
              <button onClick={handlePortal} disabled={portal} style={{ padding: "10px 22px", borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
                {portal ? "Opening..." : "Update Payment Method →"}
              </button>
            )}
          </div>
        )}

        {/* Page title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 8 }}>CHOOSE YOUR PLAN</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2.2rem", fontWeight: 700, color: colors.n800, margin: "0 0 12px" }}>Simple, Transparent Pricing</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500 }}>All plans include a 14-day free trial. No credit card required to start.</p>

          {/* Monthly / Annual toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: colors.n100, borderRadius: 12, padding: 4, marginTop: 20 }}>
            {(["monthly", "annual"] as const).map(i => (
              <button key={i} onClick={() => setInterval(i)} style={{
                padding: "9px 24px", borderRadius: 9, border: "none", cursor: "pointer",
                background: interval === i ? colors.primary : "transparent",
                color: interval === i ? "white" : colors.n500,
                fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, transition: "all 0.2s",
              }}>
                {i === "monthly" ? "Monthly" : "Annual"}
                {i === "annual" && (
                  <span style={{ marginLeft: 6, background: interval === "annual" ? "rgba(255,255,255,0.2)" : colors.gold, color: "white", padding: "1px 6px", borderRadius: 10, fontSize: 9, fontWeight: 700 }}>
                    SAVE 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 40 }}>
          {PLAN_ORDER.map(plan => {
            const meta      = PLAN_META[plan];
            const isPro     = plan === "professional";
            const isCurrent = currentPlan === plan && isActive;
            const price     = interval === "monthly" ? meta.monthlyUSD : meta.annualUSD;
            const pkr       = interval === "monthly" ? meta.monthlyPKR : meta.annualPKR;
            const isLoading = upgrading === plan;

            return (
              <div key={plan} style={{
                background: isPro ? `linear-gradient(160deg,${colors.deep},#052e16)` : "white",
                borderRadius: 20, padding: 28,
                border: `2px solid ${isCurrent ? colors.gold : isPro ? colors.primary : colors.n200}`,
                position: "relative",
                boxShadow: isPro ? `0 0 40px rgba(13,92,58,0.25)` : "none",
              }}>
                {isPro && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: colors.primary, color: "white", padding: "4px 16px", borderRadius: 999, fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: "absolute", top: -14, right: 20, background: colors.gold, color: "white", padding: "4px 12px", borderRadius: 999, fontFamily: fonts.mono, fontSize: 10, fontWeight: 700 }}>
                    CURRENT
                  </div>
                )}

                <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 13, color: isPro ? colors.gold : meta.color, marginBottom: 4, opacity: 0.8 }}>{meta.nameUr}</div>
                <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: isPro ? "white" : colors.n800, marginBottom: 16 }}>{meta.name}</div>

                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: fonts.heading, fontSize: 38, fontWeight: 800, color: isPro ? colors.success : meta.color }}>
                    ${interval === "monthly" ? meta.monthlyUSD : (meta.annualUSD / 12).toFixed(2)}
                  </span>
                  <span style={{ fontFamily: fonts.body, fontSize: 13, color: isPro ? "rgba(255,255,255,0.5)" : colors.n400 }}>/mo</span>
                </div>
                {interval === "annual" && (
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: isPro ? "rgba(255,255,255,0.5)" : colors.n400, marginBottom: 4 }}>
                    Billed ${meta.annualUSD}/year
                  </div>
                )}
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: isPro ? "rgba(255,255,255,0.35)" : colors.n300, marginBottom: 20 }}>
                  ~PKR {interval === "monthly" ? meta.monthlyPKR.toLocaleString() : meta.annualPKR.toLocaleString()}{interval === "annual" ? "/yr" : "/mo"}
                </div>

                <div style={{ fontFamily: fonts.body, fontSize: 11, color: isPro ? "rgba(255,255,255,0.5)" : colors.n400, marginBottom: 16 }}>
                  Students: <strong style={{ color: isPro ? "rgba(255,255,255,0.8)" : colors.n700 }}>{meta.students}</strong>
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {meta.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: isPro ? colors.success : colors.primary, fontSize: 13 }}>✓</span>
                      <span style={{ fontFamily: fonts.body, fontSize: 12, color: isPro ? "rgba(255,255,255,0.75)" : colors.n600 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <button onClick={handlePortal} style={{ width: "100%", padding: 12, borderRadius: 12, background: "transparent", border: `1px solid ${colors.gold}`, color: colors.gold, fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {portal ? "Opening..." : "Manage Plan →"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!upgrading}
                    style={{
                      width: "100%", padding: 13, borderRadius: 12, border: "none", cursor: upgrading ? "not-allowed" : "pointer",
                      background: upgrading ? colors.n300 : isPro ? colors.primary : `${meta.color}15`,
                      color: isPro ? "white" : upgrading ? colors.n400 : meta.color,
                      fontFamily: fonts.heading, fontSize: 13, fontWeight: 700,
                      boxShadow: isPro && !upgrading ? `0 4px 20px rgba(13,92,58,0.4)` : "none",
                    }}>
                    {isLoading ? "Redirecting to Stripe..." : isTrial ? `Start ${meta.name} →` : `Upgrade to ${meta.name} →`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { icon: "🔒", text: "Secured by Stripe" },
            { icon: "✕",  text: "Cancel anytime" },
            { icon: "📄", text: "Invoices included" },
            { icon: "💳", text: "All major cards accepted" },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{b.icon}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
