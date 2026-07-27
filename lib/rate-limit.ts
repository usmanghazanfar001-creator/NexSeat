/**
 * Lightweight in-memory rate limiter (sliding window).
 *
 * This is fine for a single Node.js instance / demo purposes. For a
 * multi-instance production deployment, swap the Map for Redis (e.g.
 * Upstash) so limits are shared across serverless/edge instances -
 * see docs/DEPLOYMENT.md.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

/** Convenience wrapper for API routes: 20 requests / minute per IP by default. */
export function rateLimitByIp(ip: string, routeKey: string, limit = 20, windowMs = 60_000) {
  return rateLimit(`${routeKey}:${ip}`, limit, windowMs);
}
