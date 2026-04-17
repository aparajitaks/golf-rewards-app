/**
 * Rate limiting placeholder — connect to Upstash Redis, Vercel KV, or edge middleware.
 * Call `assertRateLimit` from sensitive server actions / route handlers.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export async function assertRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (b.count >= max) {
    return { ok: false, retryAfterMs: Math.max(0, b.reset - now) };
  }
  b.count += 1;
  return { ok: true };
}
