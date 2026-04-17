import type { SubscriptionRow } from "@/lib/types";

export function isPremiumActive(sub: SubscriptionRow | null | undefined): boolean {
  if (!sub) return false;
  if (!["active", "trialing"].includes(sub.status)) return false;
  if (!sub.current_period_end) return true;
  return new Date(sub.current_period_end).getTime() > Date.now();
}
