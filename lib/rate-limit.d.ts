export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds (e.g. 60_000 for 1 minute) */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export declare function checkRateLimit(
  identifier: string,
  options?: RateLimitOptions
): RateLimitResult;
