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

test.describe("staging required role flows", () => {
  test("keeps system ops and content ops required validation paths discoverable", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/ops/redeem-codes");
    const redeemCodeEntry = page.getByTestId(
      "system-ops-redeem-code-generate-entry",
    );
    await expect(redeemCodeEntry).toBeVisible();
    await expect(redeemCodeEntry).toContainText("系统运营本地验收");
    await expect(redeemCodeEntry).not.toContainText("staging 必验");
    await expect(
      redeemCodeEntry.getByRole("link", { name: "生成卡密" }),
    ).toHaveAttribute("href", "#redeem-code-generate-panel");
    await expect(page.getByRole("button", { name: "生成卡密" })).toBeVisible();
    await expect(page.getByLabel("卡密状态")).toBeVisible();
    await expect(page.getByLabel("卡密搜索")).toBeVisible();

    await page.goto("/ops/organizations");
    const orgAuthEntry = page.getByTestId("system-ops-org-auth-create-entry");
    await expect(orgAuthEntry).toBeVisible();
    await expect(orgAuthEntry).toContainText("系统运营本地验收");
    await expect(orgAuthEntry).not.toContainText("staging 必验");
    await expect(
      orgAuthEntry.getByRole("link", { name: "新增企业授权" }),
    ).toHaveAttribute("href", "#org-auth-create-panel");
    await expect(
      page.getByRole("button", { name: "创建企业授权" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "取消授权" }).first(),
    ).toBeVisible();

    const orgAuthCreateForm = page.getByTestId("org-auth-create-form");
    await expect(orgAuthCreateForm).toBeVisible();
    await expect(orgAuthCreateForm.locator("select")).toHaveCount(3);
    await expect(orgAuthCreateForm.locator('input[type="number"]')).toHaveCount(
      2,
    );
    await expect(orgAuthCreateForm.locator('input[type="date"]')).toHaveCount(
      2,
    );
    await expect(
      page.locator('input[type="checkbox"][aria-label]').first(),
    ).toBeVisible();

    await page.goto("/content/questions");
    const questionArrangement = page.getByTestId(
      "content-ops-staging-required-role-arrangement",
    );
    await expect(questionArrangement).toBeVisible();
    await expect(questionArrangement).toContainText("内容运营本地验收");
    await expect(questionArrangement).not.toContainText("staging 必验");
    await expect(questionArrangement).toContainText(
      "题目、材料、试卷先验只读筛选",
    );
    await expect(
      page.getByTestId("content-action-runtime-ready"),
    ).toBeVisible();

    await page.goto("/content/papers");
    const paperArrangement = page.getByTestId(
      "content-ops-staging-required-role-arrangement",
    );
    await expect(paperArrangement).toBeVisible();
    await expect(paperArrangement).not.toContainText("staging 必验");
    await expect(paperArrangement).toContainText(
      "不可用写操作必须显示原因和下一步",
    );
    await expect(page.getByTestId("paper-action-unavailable")).toBeVisible();
  });
});
