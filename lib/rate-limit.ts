/**
 * Rate limiting configuration using Upstash Redis.
 *
 * Three limiters are exported:
 * - `generalLimiter` — for all non-static routes (30 req per 10s per IP)
 * - `authLimiter` — stricter limit for auth API routes (5 req per 60s per IP)
 * - `forgotPasswordLimiter` — per-email cooldown (3 req per hour per email)
 *
 * If Upstash credentials are missing (e.g., local development), all limiters
 * are replaced with pass-through no-ops that always allow requests.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Shape of a rate limit check result */
interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
}

/** Interface matching the subset of Ratelimit we use */
interface RateLimiter {
  limit: (identifier: string) => Promise<RateLimitResult>;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Pass-through limiter that always allows requests (used when Redis is not configured) */
const noopLimiter: RateLimiter = {
  limit: async () => ({ success: true, limit: 0, reset: 0, remaining: 0 }),
};

/**
 * Creates rate limiters if Upstash credentials are available,
 * otherwise returns no-op limiters for local development.
 */
function createLimiters(): {
  generalLimiter: RateLimiter;
  authLimiter: RateLimiter;
  forgotPasswordLimiter: RateLimiter;
} {
  if (!redisUrl || !redisToken) {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. " +
      "Rate limiting is DISABLED. Set these env vars for production."
    );
    return {
      generalLimiter: noopLimiter,
      authLimiter: noopLimiter,
      forgotPasswordLimiter: noopLimiter,
    };
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  return {
    /** General rate limiter: 30 requests per 10 seconds per IP */
    generalLimiter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: false,
      prefix: "rl:general",
    }),

    /** Auth API rate limiter: 5 requests per 60 seconds per IP (stricter) */
    authLimiter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: false,
      prefix: "rl:auth",
    }),

    /** Forgot password per-email limiter: 3 requests per hour per email */
    forgotPasswordLimiter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: false,
      prefix: "rl:forgot-pw",
    }),
  };
}

const limiters = createLimiters();

export const generalLimiter = limiters.generalLimiter;
export const authLimiter = limiters.authLimiter;
export const forgotPasswordLimiter = limiters.forgotPasswordLimiter;
