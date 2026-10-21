/**
 * Lightweight, in-memory sliding window rate limiter for Server Actions and Route Handlers.
 * In a distributed multi-region serverless deployment, this acts as a node-local shield
 * against rapid brute-force, scraping, or spamming.
 */

const store = new Map();

// Cleanup stale records periodically to avoid memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000).unref?.();
}

/**
 * Checks if a given identifier exceeds rate limit.
 * @param {string} identifier
 * @param {{ limit: number, windowMs: number }} [options]
 * @returns {{ success: boolean, limit: number, remaining: number, resetAt: number }}
 */
export function checkRateLimit(
  identifier,
  options = { limit: 10, windowMs: 60_000 }
) {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetAt: record.resetAt,
  };
}
