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
  test("keeps content write actions wired and paper context-only actions guarded", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/content/questions");
    await expect(
      page.getByRole("heading", { name: "题库与材料管理" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "新建题目" })).toBeEnabled();
    await expect(
      page.getByTestId("content-action-runtime-ready"),
    ).toBeVisible();
    const editableQuestionEdit = page
      .locator('button[data-testid^="question-edit-"]:not([disabled])')
      .first();
    await expect(editableQuestionEdit).toBeEnabled();
    const firstQuestionRow = editableQuestionEdit.locator(
      "xpath=ancestor::article[1]",
    );
    await expect(firstQuestionRow).toBeVisible();
    await editableQuestionEdit.click();
    await expect(page.getByTestId("content-edit-context-panel")).toBeVisible();
    await expect(firstQuestionRow).toHaveAttribute("data-selected", "true");
    await expect(
      page.getByTestId("content-edit-context-panel").getByRole("form"),
    ).toBeVisible();
    const lockedQuestionEdit = page
      .locator('button[data-testid^="question-edit-"][disabled]')
      .first();
    if ((await lockedQuestionEdit.count()) > 0) {
      await expect(lockedQuestionEdit).toBeDisabled();
      await expect(
        page.getByText("已锁定题目只能复制新题后编辑").first(),
      ).toBeVisible();
    }

    await page.goto("/content/materials");
    await expect(
      page.getByRole("heading", { name: "题库与材料管理" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "新建材料" })).toBeEnabled();
    await expect(
      page.getByTestId("content-action-runtime-ready"),
    ).toBeVisible();

    await page.goto("/content/papers");
    await expect(page.getByRole("heading", { name: "试卷管理" })).toBeVisible();
    await expect(page.getByRole("button", { name: "新建草稿" })).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "组卷", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "发布", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "下架", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "复制", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "绑定原始文件", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByTestId("paper-action-unavailable")).toBeVisible();
  });
});
