type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000
const MS_PER_SECOND = 1000
const MIN_RETRY_AFTER_SEC = 1

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey)
      }
    }
    if (buckets.size > MAX_BUCKETS) {
      buckets.clear()
    }
  }

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true as const }
  }

  if (existing.count >= limit) {
    return {
      ok: false as const,
      retryAfterSec: Math.max(
        MIN_RETRY_AFTER_SEC,
        Math.ceil((existing.resetAt - now) / MS_PER_SECOND)
      ),
    }
  }

  existing.count += 1
  return { ok: true as const }
}
