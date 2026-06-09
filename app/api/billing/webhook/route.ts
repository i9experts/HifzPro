// app/api/billing/webhook/route.ts
// IMPORTANT: This route must use raw body — do NOT use bodyParser
import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // Required — edge runtime can't verify Stripe signatures

export async function POST(req: NextRequest) {
  const body      = await req.text(); // raw body for signature verification
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  console.log("[webhook] Event received:", event.type);

  try {
    switch (event.type) {

      // ── Payment succeeded (new subscription or renewal) ──
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const customerId     = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;
        const priceId        = invoice.lines?.data?.[0]?.price?.id as string;
        const periodEnd      = invoice.lines?.data?.[0]?.period?.end as number;

        const planInfo = getPlanFromPriceId(priceId);

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status:               "ACTIVE",
            plan:                 planInfo?.plan?.toUpperCase() || "BASIC",
            billingCycle:         planInfo?.interval === "annual" ? "ANNUAL" : "MONTHLY",
            stripeSubscriptionId: subscriptionId,
            stripePriceId:        priceId,
            currentPeriodEnd:     periodEnd ? new Date(periodEnd * 1000) : undefined,
            lastPaymentAt:        new Date(),
            nextBillingAt:        periodEnd ? new Date(periodEnd * 1000) : undefined,
          },
        });

        console.log("[webhook] invoice.paid → subscription ACTIVE for customer:", customerId);
        break;
      }

      // ── Checkout completed (first-time subscription) ──
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode !== "subscription") break;

        const institutionId  = session.metadata?.institutionId;
        const customerId     = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan           = session.metadata?.plan || "basic";
        const interval       = session.metadata?.interval || "monthly";

        if (!institutionId) {
          console.error("[webhook] checkout.session.completed: no institutionId in metadata");
          break;
        }

        // Fetch full subscription from Stripe for period end
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd          = stripeSubscription.current_period_end;
        const priceId            = stripeSubscription.items.data[0]?.price?.id;

        await prisma.subscription.updateMany({
          where: { institutionId },
          data: {
            status:               "ACTIVE",
            plan:                 plan.toUpperCase(),
            billingCycle:         interval === "annual" ? "ANNUAL" : "MONTHLY",
            stripeCustomerId:     customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId:        priceId,
            currentPeriodEnd:     new Date(periodEnd * 1000),
            startDate:            new Date(),
            lastPaymentAt:        new Date(),
            nextBillingAt:        new Date(periodEnd * 1000),
          },
        });

        console.log("[webhook] checkout.session.completed → ACTIVE for institution:", institutionId);
        break;
      }

      // ── Payment failed ──
      case "invoice.payment_failed": {
        const invoice    = event.data.object as any;
        const customerId = invoice.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data:  { status: "PAST_DUE" },
        });

        console.log("[webhook] invoice.payment_failed → PAST_DUE for customer:", customerId);
        break;
      }

      // ── Subscription cancelled ──
      case "customer.subscription.deleted": {
        const sub        = event.data.object as any;
        const customerId = sub.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status:      "CANCELLED",
            cancelledAt: new Date(),
          },
        });

        console.log("[webhook] subscription.deleted → CANCELLED for customer:", customerId);
        break;
      }

      // ── Subscription updated (plan change, pause, etc.) ──
      case "customer.subscription.updated": {
        const sub        = event.data.object as any;
        const customerId = sub.customer as string;
        const priceId    = sub.items?.data?.[0]?.price?.id as string;
        const periodEnd  = sub.current_period_end as number;
        const planInfo   = getPlanFromPriceId(priceId);

        const stripeStatus = sub.status;
        let dbStatus = "ACTIVE";
        if (stripeStatus === "past_due")  dbStatus = "PAST_DUE";
        if (stripeStatus === "canceled")  dbStatus = "CANCELLED";
        if (stripeStatus === "paused")    dbStatus = "SUSPENDED";
        if (stripeStatus === "trialing")  dbStatus = "TRIAL";

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status:           dbStatus,
            plan:             planInfo?.plan?.toUpperCase() || undefined,
            billingCycle:     planInfo?.interval === "annual" ? "ANNUAL" : "MONTHLY",
            stripePriceId:    priceId,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
            nextBillingAt:    periodEnd ? new Date(periodEnd * 1000) : undefined,
          },
        });

        console.log("[webhook] subscription.updated →", dbStatus, "for customer:", customerId);
        break;
      }

      default:
        console.log("[webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[webhook] Handler error:", error?.message, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
