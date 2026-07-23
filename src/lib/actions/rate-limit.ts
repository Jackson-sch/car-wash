/**
 * Rate Limiter — In-memory sliding window rate limiter for server actions.
 *
 * No external dependencies. Uses a Map<string, number[]> to track
 * timestamps per key. Stale entries are cleaned up at configurable
 * intervals to prevent memory leaks.
 *
 * Usage:
 *   const rl = rateLimit({ max: 5, windowMs: 60_000 }); // 5 req/min
 *   const result = rl.check("some-key");
 *   if (!result.allowed) {
 *     return { success: false, error: "Demasiadas solicitudes. Intenta de nuevo en un momento." };
 *   }
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Optional unique name for this limiter (used for logging / debugging) */
  name?: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests per window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Milliseconds until the window resets */
  reset: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

export function createRateLimiter(config: RateLimitConfig) {
  const { max, windowMs, name = "anonymous" } = config;
  const store = new Map<string, RateLimitEntry>();

  // Cleanup stale entries every 5 minutes
  let cleanupTimer: ReturnType<typeof setInterval> | null = null;

  function scheduleCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store) {
        // Remove expired timestamps
        entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);
        if (entry.timestamps.length === 0) {
            store.delete(key);
        }
      }
      if (store.size === 0 && cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    }, 5 * 60 * 1000); // every 5 minutes
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();
    let entry = store.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
      scheduleCleanup();
    }

    // Remove expired timestamps from this window
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    if (entry.timestamps.length >= max) {
      const oldest = entry.timestamps[0];
      const reset = windowMs - (now - oldest);

      return {
        allowed: false,
        limit: max,
        remaining: 0,
        reset: Math.max(reset, 0),
      };
    }

    // Record this request
    entry.timestamps.push(now);

    return {
      allowed: true,
      limit: max,
      remaining: max - entry.timestamps.length,
      reset: windowMs - (now - entry.timestamps[0]),
    };
  }

  /** Get current store size (for monitoring / testing) */
  function size(): number {
    return store.size;
  }

  /** Reset the entire store (useful in tests) */
  function reset(): void {
    store.clear();
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }

  return { check, size, reset, name };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

// ─── Pre-built limiters for common scenarios ───

/** Public CSAT evaluation: max 3 attempts per ticket per hour */
export const evaluacionLimiter = createRateLimiter({
  max: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  name: "evaluacion-csat",
});

/** Global API throttle: max 20 requests per minute from the same IP */
export const globalLimiter = createRateLimiter({
  max: 20,
  windowMs: 60 * 1000, // 1 minute
  name: "global",
});

// ─── Helper to extract a client identifier from request headers ───
// Works in both server components and server actions

export async function getClientIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("x-client-ip") ||
    "unknown"
  );
}
