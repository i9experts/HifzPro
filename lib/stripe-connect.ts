// lib/stripe-connect.ts
// Marketplace payments — separate from the institution-billing Stripe client
// in lib/stripe.ts (that one is subscription/Checkout only, no Connect).
// Teachers receive payouts via a Stripe Connect Express account; a parent
// pays for an accepted Booking through a hosted Checkout Session whose
// PaymentIntent is a destination charge (application_fee_amount to HifzPro,
// transfer_data.destination to the teacher's connected account).
import { stripe } from "@/lib/stripe";

// HifzPro's cut of every marketplace booking payment.
export const PLATFORM_FEE_PERCENT = 15;

// Currencies the marketplace supports are all 2-decimal (no zero-decimal
// currencies like JPY in this list), so this conversion is safe as-is.
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export async function createExpressAccount(email: string, country: string) {
  return stripe.accounts.create({
    type: "express",
    email,
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers:     { requested: true },
    },
  });
}

export async function createOnboardingLink(accountId: string, refreshUrl: string, returnUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url:  returnUrl,
    type: "account_onboarding",
  });
}

export async function isAccountReady(accountId: string): Promise<boolean> {
  const account = await stripe.accounts.retrieve(accountId);
  return !!account.charges_enabled && !!account.payouts_enabled;
}

export async function createBookingCheckoutSession(params: {
  bookingId: string;
  teacherAccountId: string;
  currency: string;
  totalAmount: number;
  sessions: number;
  teacherName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const platformFeeAmount = Math.round(params.totalAmount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_intent_data: {
      application_fee_amount: toMinorUnits(platformFeeAmount),
      transfer_data: { destination: params.teacherAccountId },
      metadata: { bookingId: params.bookingId },
    },
    line_items: [{
      price_data: {
        currency: params.currency.toLowerCase(),
        unit_amount: toMinorUnits(params.totalAmount),
        product_data: {
          name: `${params.sessions} lesson${params.sessions === 1 ? "" : "s"} with ${params.teacherName}`,
        },
      },
      quantity: 1,
    }],
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
    metadata: { bookingId: params.bookingId },
  });

  return { session, platformFeeAmount };
}

export async function refundBookingPayment(paymentIntentId: string) {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}
