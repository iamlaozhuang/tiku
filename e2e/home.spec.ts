import { expect, test } from "@playwright/test";

test("loads the root navigation page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "题库系统" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "进入学员端" })).toHaveAttribute(
    "href",
    "/home",
  );
});
