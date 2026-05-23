import { expect, test, type Page } from "@playwright/test";

const studentCredential = {
  phone: "13900000002",
  password: "TikuDevStudent#2026",
};

async function loginAsStudent(page: Page) {
  await page.goto("/login");
  await page.getByLabel("手机号").fill(studentCredential.phone);
  await page.getByLabel("密码").fill(studentCredential.password);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test.describe("student practice mock entry", () => {
  test("opens actionable practice and mock exam flows from student home paper links", async ({
    page,
  }) => {
    await loginAsStudent(page);

    const practiceLink = page.locator('a[href^="/practice?paperPublicId="]');
    await expect(practiceLink.first()).toBeVisible();
    await practiceLink.first().click();
    await expect(page).toHaveURL(/\/practice\?paperPublicId=/);
    await expect(page.getByRole("button", { name: "提交答案" })).toBeVisible();

    await page.goto("/home");
    const mockExamLink = page.locator('a[href^="/mock-exam?paperPublicId="]');
    await expect(mockExamLink.first()).toBeVisible();
    await mockExamLink.first().click();
    await expect(page).toHaveURL(/\/mock-exam\?paperPublicId=/);
    await expect(
      page.getByRole("button", { name: "保存本题作答" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "交卷" })).toBeVisible();
  });
});
