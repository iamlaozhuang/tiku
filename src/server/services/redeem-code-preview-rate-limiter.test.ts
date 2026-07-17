import { describe, expect, it } from "vitest";

import { createRedeemCodePreviewRateLimiter } from "./redeem-code-preview-rate-limiter";

describe("redeem code preview rate limiter", () => {
  it("shares one quota per user and restores it after the window", () => {
    let currentTime = 1_000;
    const limiter = createRedeemCodePreviewRateLimiter({
      maxAttempt: 2,
      now: () => currentTime,
      windowMillisecond: 10_000,
    });

    expect(limiter.consume("user-public-1")).toEqual({ allowed: true });
    expect(limiter.consume("user-public-1")).toEqual({ allowed: true });
    expect(limiter.consume("user-public-1")).toEqual({
      allowed: false,
      retryAfterSecond: 10,
    });
    expect(limiter.consume("user-public-2")).toEqual({ allowed: true });

    currentTime = 11_000;
    expect(limiter.consume("user-public-1")).toEqual({ allowed: true });
  });

  it("fails closed for a new user while bounded active-key capacity is full", () => {
    const limiter = createRedeemCodePreviewRateLimiter({
      maxAttempt: 2,
      maxTrackedUsers: 1,
      now: () => 1_000,
      windowMillisecond: 10_000,
    });

    expect(limiter.consume("user-public-1")).toEqual({ allowed: true });
    expect(limiter.consume("user-public-2")).toEqual({
      allowed: false,
      retryAfterSecond: 10,
    });
    expect(limiter.consume("user-public-1")).toEqual({ allowed: true });
  });
});
