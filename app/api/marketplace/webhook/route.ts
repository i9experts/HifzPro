// app/api/marketplace/webhook/route.ts
// Stripe Connect webhook for marketplace payments — separate endpoint and
// signing secret from the institution-billing webhook (app/api/billing/webhook/route.ts),
// since these are unrelated products. Configure this URL as its own
// endpoint in the Stripe dashboard with STRIPE_CONNECT_WEBHOOK_SECRET.
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // Required — edge runtime can't verify Stripe signatures

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[marketplace-webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[marketplace-webhook] STRIPE_CONNECT_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[marketplace-webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  console.log("[marketplace-webhook] Event received:", event.type);

  try {
    switch (event.type) {

      // ── A parent's booking payment went through ──
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode !== "payment") break;

        const bookingId = session.metadata?.bookingId;
        if (!bookingId) {
          console.error("[marketplace-webhook] checkout.session.completed: no bookingId in metadata");
          break;
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
          console.error("[marketplace-webhook] checkout.session.completed: booking not found", bookingId);
          break;
        }
        // Idempotency — Stripe can redeliver the same event.
        if (booking.status === "PAYMENT_CONFIRMED") break;

        const paymentIntentId = session.payment_intent as string;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const amountCharged     = (session.amount_total ?? 0) / 100;
        const platformFeeAmount = (paymentIntent.application_fee_amount ?? 0) / 100;

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "PAYMENT_CONFIRMED",
            paymentConfirmedAt: new Date(),
            stripePaymentIntentId: paymentIntentId,
            amountCharged,
            platformFeeAmount,
          },
        });

        console.log("[marketplace-webhook] checkout.session.completed → PAYMENT_CONFIRMED for booking:", bookingId);
        break;
      }

      // ── Teacher's Connect account onboarding status changed ──
      case "account.updated": {
        const account = event.data.object as any;
        const ready = !!account.charges_enabled && !!account.payouts_enabled;

        const updated = await prisma.teacherProfile.updateMany({
          where: { stripeConnectAccountId: account.id },
          data:  { stripeOnboardingComplete: ready },
        });

        if (updated.count > 0) {
          console.log("[marketplace-webhook] account.updated → onboardingComplete:", ready, "for account:", account.id);
        }
        break;
      }

      // ── A booking payment was refunded ──
      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent as string;
        if (!paymentIntentId) break;

        const booking = await prisma.booking.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
        if (!booking) break;

        await prisma.booking.update({
          where: { id: booking.id },
          data:  { status: "REFUNDED", refundedAt: new Date() },
        });

        console.log("[marketplace-webhook] charge.refunded → REFUNDED for booking:", booking.id);
        break;
      }

      default:
        console.log("[marketplace-webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[marketplace-webhook] Handler error:", error?.message, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
