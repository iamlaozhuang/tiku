export type RedeemCodePreviewRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSecond: number };

export type RedeemCodePreviewRateLimiter = {
  consume(userPublicId: string): RedeemCodePreviewRateLimitResult;
};

type RedeemCodePreviewRateLimiterOptions = {
  maxAttempt?: number;
  maxTrackedUsers?: number;
  now?: () => number;
  windowMillisecond?: number;
};

type WindowState = {
  attemptCount: number;
  startedAt: number;
};

export function createRedeemCodePreviewRateLimiter(
  options: RedeemCodePreviewRateLimiterOptions = {},
): RedeemCodePreviewRateLimiter {
  const maxAttempt = options.maxAttempt ?? 10;
  const maxTrackedUsers = options.maxTrackedUsers ?? 10_000;
  const now = options.now ?? Date.now;
  const windowMillisecond = options.windowMillisecond ?? 60_000;
  const windows = new Map<string, WindowState>();

  return {
    consume(userPublicId) {
      const checkedAt = now();
      const existingWindow = windows.get(userPublicId);

      if (
        existingWindow !== undefined &&
        checkedAt - existingWindow.startedAt >= windowMillisecond
      ) {
        windows.delete(userPublicId);
      }

      const currentWindow = windows.get(userPublicId);

      if (currentWindow !== undefined) {
        if (currentWindow.attemptCount >= maxAttempt) {
          return {
            allowed: false,
            retryAfterSecond: retryAfterSecond(
              currentWindow.startedAt,
              checkedAt,
              windowMillisecond,
            ),
          };
        }

        currentWindow.attemptCount += 1;
        return { allowed: true };
      }

      removeExpiredWindows(windows, checkedAt, windowMillisecond);

      if (windows.size >= maxTrackedUsers) {
        return {
          allowed: false,
          retryAfterSecond: Math.max(1, Math.ceil(windowMillisecond / 1_000)),
        };
      }

      windows.set(userPublicId, { attemptCount: 1, startedAt: checkedAt });
      return { allowed: true };
    },
  };
}

function removeExpiredWindows(
  windows: Map<string, WindowState>,
  checkedAt: number,
  windowMillisecond: number,
): void {
  for (const [userPublicId, window] of windows) {
    if (checkedAt - window.startedAt >= windowMillisecond) {
      windows.delete(userPublicId);
    }
  }
}

function retryAfterSecond(
  startedAt: number,
  checkedAt: number,
  windowMillisecond: number,
): number {
  return Math.max(
    1,
    Math.ceil((startedAt + windowMillisecond - checkedAt) / 1_000),
  );
}
