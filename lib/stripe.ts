// lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript:  true,
});

// ── Price IDs ──
export const PRICES = {
  basic: {
    monthly: "price_1TgHwNGTlXYof3w6ZX9bmB65",
    annual:  "price_1TgHwNGTlXYof3w6QacVXfSu",
  },
  professional: {
    monthly: "price_1TgI3JGTlXYof3w6ReiBOQG9",
    annual:  "price_1TgI3JGTlXYof3w61zueJbeP",
  },
  enterprise: {
    monthly: "price_1TgI4RGTlXYof3w6C9ljon3A",
    annual:  "price_1TgI4RGTlXYof3w6rBn4r8IB",
  },
} as const;

export type PlanKey = keyof typeof PRICES;
export type IntervalKey = "monthly" | "annual";

// ── Plan metadata (display info) ──
export const PLAN_META: Record<PlanKey, {
  name: string; nameUr: string;
  monthlyUSD: number; annualUSD: number;
  monthlyPKR: number; annualPKR: number;
  students: string; color: string;
  features: string[];
}> = {
  basic: {
    name: "Basic", nameUr: "بنیادی",
    monthlyUSD: 9.99,  annualUSD: 95.90,
    monthlyPKR: 2999,  annualPKR: 28790,
    students: "Up to 50",
    color: "#3b82f6",
    features: [
      "All Core Modules",
      "Attendance Reports",
      "Test & Assessment",
      "Batch Management",
      "WhatsApp Updates",
      "Parent Portal",
    ],
  },
  professional: {
    name: "Professional", nameUr: "پروفیشنل",
    monthlyUSD: 19.99, annualUSD: 191.90,
    monthlyPKR: 5999,  annualPKR: 57590,
    students: "Up to 200",
    color: "#0D5C3A",
    features: [
      "Everything in Basic",
      "Fee Management",
      "Sanad & Certificates",
      "Advanced Analytics",
      "Mutashabihat AI",
      "Hijri Calendar",
      "Priority Support",
    ],
  },
  enterprise: {
    name: "Enterprise", nameUr: "انٹرپرائز",
    monthlyUSD: 29.99, annualUSD: 287.90,
    monthlyPKR: 9999,  annualPKR: 95990,
    students: "Unlimited",
    color: "#C4882A",
    features: [
      "Everything in Professional",
      "Multi-Campus Support",
      "Super Admin Access",
      "Bulk CSV Import",
      "Donor Portal",
      "Dedicated Support",
      "Custom Onboarding",
    ],
  },
};

// ── Reverse lookup: priceId → plan + interval ──
export function getPlanFromPriceId(priceId: string): {
  plan: PlanKey; interval: IntervalKey;
} | null {
  for (const [plan, intervals] of Object.entries(PRICES)) {
    for (const [interval, id] of Object.entries(intervals)) {
      if (id === priceId) {
        return { plan: plan as PlanKey, interval: interval as IntervalKey };
      }
    }
  }
  return null;
}

// ── Subscription status helpers ──
export function isSubscriptionActive(status: string, trialEndsAt: Date | null, currentPeriodEnd: Date | null): boolean {
  const now = new Date();
  if (status === "TRIAL" && trialEndsAt && trialEndsAt > now) return true;
  if (status === "ACTIVE" && currentPeriodEnd && currentPeriodEnd > now) return true;
  if (status === "PAST_DUE") {
    // 3-day grace period
    const gracePeriod = new Date(now);
    gracePeriod.setDate(gracePeriod.getDate() - 3);
    if (currentPeriodEnd && currentPeriodEnd > gracePeriod) return true;
  }
  return false;
}

export type LockoutReason = "trial_expired" | "past_due" | "cancelled" | "suspended" | "no_subscription";

export function getLockoutReason(status: string, trialEndsAt: Date | null): LockoutReason {
  if (status === "TRIAL") return "trial_expired";
  if (status === "PAST_DUE") return "past_due";
  if (status === "CANCELLED") return "cancelled";
  if (status === "SUSPENDED") return "suspended";
  return "no_subscription";
}
