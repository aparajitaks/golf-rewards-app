import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { CheckoutButton } from "@/components/checkout-button";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const sp = await searchParams;
  const plan = sp.plan === "year" ? "year" : "month";
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/checkout?plan=" + plan)}`);

  const monthly = process.env.STRIPE_PRICE_MONTHLY ?? "";
  const yearly = process.env.STRIPE_PRICE_YEARLY ?? "";
  const priceId = plan === "year" ? yearly : monthly;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are subscribing to the <span className="font-medium text-foreground">{plan === "year" ? "annual" : "monthly"}</span>{" "}
        plan. You will be redirected to Stripe’s secure hosted checkout.
      </p>
      <div className="mt-8">
        <CheckoutButton priceId={priceId} label="Continue to Stripe" />
      </div>
      <p className="mt-6 text-center text-sm">
        <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
          ← Back to pricing
        </Link>
      </p>
    </div>
  );
}
