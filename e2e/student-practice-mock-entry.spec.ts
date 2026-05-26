import { expect, test, type Page } from "@playwright/test";

const studentCredential = {
  phone: "13900000002",
  password: "TikuDevStudent#2026",
};

const stablePaperPublicId = "paper-dev-theory";

const forbiddenVisibleMarkers = [
  "<p>",
  "<script>",
  "do-not-render",
  "raw prompt",
  "raw answer",
  "raw model response",
  "raw provider payload",
  "Authorization",
  "Bearer ",
  "apiKey",
  "databaseUrl",
];

async function loginAsStudent(page: Page) {
  await page.goto("/login");
  await page.getByLabel("手机号").fill(studentCredential.phone);
  await page.getByLabel("密码").fill(studentCredential.password);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

async function expectForbiddenMarkersHidden(page: Page) {
  const body = page.locator("body");

  for (const marker of forbiddenVisibleMarkers) {
    await expect(body).not.toContainText(marker);
  }
}

test.describe("student practice mock entry", () => {
  test("covers practice answer, mock pre-submit secrecy, reports, mistake_book, and redaction", async ({
    page,
  }) => {
    await loginAsStudent(page);

    await expect(
      page.locator('a[href^="/practice?paperPublicId="]').first(),
    ).toBeVisible();
    await page.goto(`/practice?paperPublicId=${stablePaperPublicId}`);
    await expect(page).toHaveURL(/\/practice\?paperPublicId=/);
    await expect(
      page.locator('[data-testid^="practice-surface-"]'),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText("practice-");

    const restartResponse = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "POST" &&
        /\/api\/v1\/practices\/[^/]+\/restart$/.test(
          new URL(response.url()).pathname,
        )
      );
    });
    await page.getByTestId("practice-restart-button").click();
    await expect((await restartResponse).ok()).toBeTruthy();

    await page.getByRole("button", { name: /^A\./ }).first().click();
    const practiceAnswerResponse = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "POST" &&
        /\/api\/v1\/practices\/[^/]+\/answers$/.test(
          new URL(response.url()).pathname,
        )
      );
    });
    await page.getByRole("button", { name: "提交答案" }).click();
    await expect((await practiceAnswerResponse).ok()).toBeTruthy();
    await expect(page.getByText(/回答(正确|错误)/)).toBeVisible();
    await expectForbiddenMarkersHidden(page);

    await page.goto("/home");
    await expect(
      page.locator('a[href^="/mock-exam?paperPublicId="]').first(),
    ).toBeVisible();
    await page.goto(`/mock-exam?paperPublicId=${stablePaperPublicId}`);
    await expect(page).toHaveURL(/\/mock-exam\?paperPublicId=/);
    await expect(
      page.locator('[data-testid^="mock-exam-surface-"]'),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText("正确答案：");
    await expect(page.locator("body")).not.toContainText("标准答案");
    await expect(page.locator("body")).not.toContainText("解析：");
    await expect(
      page.getByRole("button", { name: "保存本题作答" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "交卷" }).click();
    await expect(
      page.getByTestId("mock-exam-submit-confirmation"),
    ).toBeVisible();

    await page.goto("/exam-report");
    await expect(page).toHaveURL(/\/exam-report$/);
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.locator("body")).not.toContainText("考试报告加载失败");
    await expect(
      page.locator('a[href^="/exam-report?examReportPublicId="]').first(),
    ).toBeVisible();

    await page.goto("/mistake-book");
    await expect(page).toHaveURL(/\/mistake-book$/);
    const firstMistakeBookItem = page
      .locator('[data-testid^="mistake-book-item-"]')
      .first();
    await expect(firstMistakeBookItem).toBeVisible();
    await expectForbiddenMarkersHidden(page);

    const aiExplanationResponse = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "POST" &&
        /\/api\/v1\/mistake-books\/[^/]+\/ai-explanation$/.test(
          new URL(response.url()).pathname,
        )
      );
    });
    await firstMistakeBookItem.getByRole("button", { name: /AI讲解/ }).click();
    await expect((await aiExplanationResponse).ok()).toBeTruthy();
    await expect(
      firstMistakeBookItem.locator("section").filter({ hasText: "AI讲解" }),
    ).toBeVisible();
    await expect(firstMistakeBookItem).toContainText(
      "RAG evidence is insufficient",
    );
    await expectForbiddenMarkersHidden(page);
  });
});
