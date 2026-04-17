"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not open portal");
      if (body.url) window.location.href = body.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Portal error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" disabled={loading} onClick={() => void open()}>
      {loading ? "Opening…" : "Open billing portal"}
    </Button>
  );
}
