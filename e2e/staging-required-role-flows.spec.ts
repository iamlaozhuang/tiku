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
    await expect(redeemCodeEntry).toContainText("系统运营 staging 必验");
    await expect(
      redeemCodeEntry.getByRole("link", { name: "生成卡密" }),
    ).toHaveAttribute("href", "/ops/users");

    await page.goto("/ops/organizations");
    const orgAuthEntry = page.getByTestId("system-ops-org-auth-create-entry");
    await expect(orgAuthEntry).toBeVisible();
    await expect(orgAuthEntry).toContainText("系统运营 staging 必验");
    await expect(
      orgAuthEntry.getByRole("link", { name: "新增企业授权" }),
    ).toHaveAttribute("href", "/ops/users");

    await page.goto("/content/questions");
    const questionArrangement = page.getByTestId(
      "content-ops-staging-required-role-arrangement",
    );
    await expect(questionArrangement).toBeVisible();
    await expect(questionArrangement).toContainText("内容运营 staging 必验");
    await expect(questionArrangement).toContainText(
      "题目、材料、试卷先验只读筛选",
    );
    await expect(page.getByTestId("content-action-unavailable")).toBeVisible();

    await page.goto("/content/papers");
    const paperArrangement = page.getByTestId(
      "content-ops-staging-required-role-arrangement",
    );
    await expect(paperArrangement).toBeVisible();
    await expect(paperArrangement).toContainText(
      "不可用写操作必须显示原因和下一步",
    );
    await expect(page.getByTestId("paper-action-unavailable")).toBeVisible();

    await page.goto("/content/knowledge-nodes");
    const knowledgeNodeArrangement = page.getByTestId(
      "content-ops-staging-required-role-arrangement",
    );
    await expect(knowledgeNodeArrangement).toBeVisible();
    await expect(knowledgeNodeArrangement).toContainText(
      "知识点节点新增、编辑、停用",
    );
    await expect(page.getByRole("button", { name: "新增节点" })).toBeVisible();
  });
});
