import { expect, test } from "@playwright/test";

const protectedRoutes = ["/home", "/ops/users", "/content/questions"] as const;

test.describe("local auth route guards", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  for (const protectedRoute of protectedRoutes) {
    test(`redirects ${protectedRoute} to login without a local session`, async ({
      page,
    }) => {
      await page.goto(protectedRoute);

      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
      await expect(page.getByRole("navigation")).toHaveCount(0);
      await expect(page.getByRole("tablist")).toHaveCount(0);
    });
  }
});
