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

test.describe("content action closures", () => {
  test("marks unsupported content and paper primary actions unavailable instead of enabled dead ends", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/content/questions");
    await expect(
      page.getByRole("heading", { name: "题库与材料管理" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "新建题目" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "编辑题目" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "停用题目" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "复制题目" })).toBeDisabled();
    await expect(page.getByTestId("content-action-unavailable")).toBeVisible();

    await page.goto("/content/materials");
    await expect(
      page.getByRole("heading", { name: "题库与材料管理" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "新建材料" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "编辑材料" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "停用材料" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "复制材料" })).toBeDisabled();
    await expect(page.getByTestId("content-action-unavailable")).toBeVisible();

    await page.goto("/content/papers");
    await expect(page.getByRole("heading", { name: "试卷管理" })).toBeVisible();
    await expect(page.getByRole("button", { name: "新建草稿" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "组卷" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "发布" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "下架" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "复制" })).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "绑定原始文件" }),
    ).toBeDisabled();
    await expect(page.getByTestId("paper-action-unavailable")).toBeVisible();
  });
});
