import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceSupabase } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";
import { sendEmail, EmailTemplates } from "@/lib/email";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("Stripe webhook signature error", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceSupabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (userId && customerId) {
          await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
        }
        const subId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (userId && subId) {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(supabase, userId, sub);
          const profile = await supabase.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
          if (profile.data?.email) {
            await sendEmail({
              to: profile.data.email,
              ...EmailTemplates.subscriptionActive(profile.data.full_name ?? "there"),
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await upsertSubscription(supabase, userId, sub);
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          if (prof?.email) {
            await sendEmail({
              to: prof.email,
              ...EmailTemplates.paymentFailed(prof.full_name ?? "there"),
            });
          }
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json({ received: true, error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceSupabase>,
  userId: string,
  sub: Stripe.Subscription,
) {
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const interval = sub.items.data[0]?.price?.recurring?.interval ?? null;
  const row = {
    user_id: userId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
    stripe_subscription_id: sub.id,
    price_id: priceId,
    plan_interval: interval === "year" || interval === "month" ? interval : null,
    status: mapStripeStatus(sub.status),
    current_period_start: sub.current_period_start
      ? new Date(sub.current_period_start * 1000).toISOString()
      : null,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    metadata: sub.metadata as Record<string, string>,
  };

  await supabase.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return status;
    default:
      return "inactive";
  }
}
