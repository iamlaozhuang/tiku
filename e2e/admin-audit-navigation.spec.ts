import { expect, test, type Page } from "@playwright/test";

const adminCredential = {
  phone: "13900000001",
  password: "TikuDevAdmin#2026",
};

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("手机号").fill(adminCredential.phone);
  await page.getByLabel("密码").fill(adminCredential.password);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/ops\/users$/);
}

test.describe("admin audit navigation", () => {
  test("opens the existing AI audit log route from the admin shell", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.getByRole("link", { name: /审计日志/u }).click();

    await expect(page).toHaveURL(/\/ops\/ai-audit-logs$/);
    await expect(page.locator("body")).toContainText("审计日志只读");
    await expect(page).not.toHaveURL(/\/ops\/audit-logs$/);
  });
});
