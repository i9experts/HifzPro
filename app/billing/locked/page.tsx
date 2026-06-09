"use client";
// app/billing/locked/page.tsx
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const REASONS: Record<string, { icon: string; title: string; titleUr: string; body: string; cta: string }> = {
  trial_expired: {
    icon:    "⏰",
    title:   "Your Free Trial Has Ended",
    titleUr: "آپ کا مفت ٹرائل ختم ہو گیا",
    body:    "Your 14-day free trial has expired. Subscribe to continue managing your Hifz program without interruption.",
    cta:     "Continue with a Plan →",
  },
  past_due: {
    icon:    "💳",
    title:   "Payment Failed",
    titleUr: "ادائیگی ناکام ہوئی",
    body:    "Your last payment could not be processed. Please update your payment method to restore access. Your data is safe.",
    cta:     "Update Payment Method →",
  },
  cancelled: {
    icon:    "✕",
    title:   "Subscription Cancelled",
    titleUr: "سبسکرپشن منسوخ ہو گئی",
    body:    "Your subscription has been cancelled. Resubscribe anytime to restore full access to HifzPro.",
    cta:     "Resubscribe →",
  },
  suspended: {
    icon:    "⚠️",
    title:   "Account Suspended",
    titleUr: "اکاؤنٹ معطل",
    body:    "Your account has been suspended. Please contact support to resolve this.",
    cta:     "Contact Support →",
  },
  no_subscription: {
    icon:    "📋",
    title:   "No Active Subscription",
    titleUr: "کوئی فعال سبسکرپشن نہیں",
    body:    "You don't have an active subscription. Choose a plan to get started.",
    cta:     "Choose a Plan →",
  },
};

export default function BillingLockedPage() {
  const params = useSearchParams();
  const reason = (params.get("reason") || "no_subscription") as keyof typeof REASONS;
  const info   = REASONS[reason] || REASONS.no_subscription;
  const isPastDue = reason === "past_due";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#050D0A,#1a0505)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: "white" }}>HifzPro</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.gold, letterSpacing: 2, opacity: 0.7 }}>MEMORIZE · PROTECT · EXCEL</div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px 36px" }}>

          <div style={{ fontSize: 52, marginBottom: 16 }}>{info.icon}</div>

          <h1 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: "white", margin: "0 0 8px" }}>{info.title}</h1>
          <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 16, color: colors.gold, marginBottom: 16, opacity: 0.8 }}>{info.titleUr}</div>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 28 }}>{info.body}</p>

          {/* CTA */}
          {isPastDue ? (
            <a
              href="/api/billing/portal-redirect"
              style={{ display: "block", padding: "14px", borderRadius: 12, background: colors.error, color: "white", fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 12 }}>
              {info.cta}
            </a>
          ) : (
            <Link href="/billing" style={{ display: "block", padding: "14px", borderRadius: 12, background: colors.primary, color: "white", fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 12 }}>
              {info.cta}
            </Link>
          )}

          <div style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>
            Your data is safe and will be restored immediately upon resubscription
          </div>
        </div>

        {/* Support link */}
        <div style={{ marginTop: 20 }}>
          <a href="mailto:support@hifzpro.com" style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            Need help? support@hifzpro.com
          </a>
        </div>
      </div>
    </div>
  );
}
