import { expect, test, type Page } from "@playwright/test";

const representativeProtectedRoutes = [
  "/home",
  "/ops/users",
  "/content/questions",
] as const;

const studentProtectedRoutes = [
  "/practice?paperPublicId=paper-dev-theory",
  "/mock-exam?paperPublicId=paper-dev-theory",
  "/exam-report",
  "/mistake-book",
  "/profile",
  "/redeem-code",
] as const;

async function expectLoginRedirectWithoutProtectedChrome(page: Page) {
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('form button[type="submit"]')).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByRole("tablist")).toHaveCount(0);
}

test.describe("local auth route guards", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  for (const protectedRoute of representativeProtectedRoutes) {
    test(`redirects ${protectedRoute} to login without a local session`, async ({
      page,
    }) => {
      await page.goto(protectedRoute);

      await expectLoginRedirectWithoutProtectedChrome(page);
    });
  }

  for (const studentRoute of studentProtectedRoutes) {
    test(`redirects student route ${studentRoute} to login without a local session`, async ({
      page,
    }) => {
      await page.goto(studentRoute);

      await expectLoginRedirectWithoutProtectedChrome(page);
    });
  }

  test("redirects a stale student session token without exposing it", async ({
    page,
  }) => {
    const syntheticStaleToken = "synthetic-stale-session-token";
    await page.addInitScript((sessionToken) => {
      localStorage.setItem("tiku.localSessionToken", sessionToken);
    }, syntheticStaleToken);

    const sessionResponsePromise = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "GET" &&
        new URL(response.url()).pathname === "/api/v1/sessions"
      );
    });
    await page.goto("/home");

    const sessionResponse = await sessionResponsePromise;
    const sessionPayload = (await sessionResponse.json()) as {
      code: number;
      data: unknown;
    };

    expect(sessionPayload.code).not.toBe(0);
    expect(sessionPayload.data).toBeNull();
    await expectLoginRedirectWithoutProtectedChrome(page);
    await expect(page.locator("body")).not.toContainText(syntheticStaleToken);
  });
});
