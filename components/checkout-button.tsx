"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ priceId, label }: { priceId: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!priceId) {
      toast.error("Stripe price ID missing — set STRIPE_PRICE_MONTHLY / YEARLY in .env");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Checkout failed");
      if (body.url) window.location.href = body.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" disabled={loading} onClick={() => void start()}>
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
