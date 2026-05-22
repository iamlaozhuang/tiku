import { expect, test, type Page } from "@playwright/test";

const studentCredential = {
  phone: "13900000002",
  password: "TikuDevStudent#2026",
};
const adminCredential = {
  phone: "13900000001",
  password: "TikuDevAdmin#2026",
};

async function loginViaUi(
  page: Page,
  credential: { phone: string; password: string },
) {
  await page.goto("/login");
  await expect(page.getByLabel("手机号")).toBeVisible();
  await expect(page.getByRole("button", { name: "登录" })).toBeDisabled();

  await page.getByLabel("手机号").fill(credential.phone);
  await page.getByLabel("密码").fill(credential.password);
  await expect(page.getByRole("button", { name: "登录" })).toBeEnabled();
  await page.getByRole("button", { name: "登录" }).click();
}

test("runs the local student, admin, audit, and mock AI business flow", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  const networkFailures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("requestfailed", (request) => {
    networkFailures.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText}`,
    );
  });

  await page.goto("/");
  await expect(page.locator("body")).toContainText("题库系统");
  await testInfo.attach("root-page", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await loginViaUi(page, studentCredential);
  await expect(page).toHaveURL(/\/home$/);
  const studentToken = await page.evaluate(() =>
    localStorage.getItem("tiku.localSessionToken"),
  );
  expect(studentToken).toEqual(expect.any(String));

  await expect(
    page.locator('[data-testid^="paper-card-"]').first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "个人中心" })).toHaveAttribute(
    "href",
    "/profile",
  );
  await expect(page.getByRole("link", { name: "兑换卡密" })).toHaveAttribute(
    "href",
    "/redeem-code",
  );
  await expect(page.getByRole("link", { name: "错题本" })).toHaveAttribute(
    "href",
    "/mistake-book",
  );
  await testInfo.attach("student-home", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/profile");
  await expect(page.locator("body")).toContainText("有效授权");
  await expect(page.locator("body")).toContainText("个人授权记录");
  await expect(page.locator("body")).not.toContainText(studentToken ?? "");
  await testInfo.attach("student-profile", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/redeem-code");
  await expect(page.getByRole("heading", { name: "兑换码" })).toBeVisible();
  await page.getByLabel("兑换码").fill("ABCD2345");
  await expect(page.getByRole("button", { name: "兑换" })).toBeEnabled();
  await page.getByRole("button", { name: "兑换" }).click();
  await expect(page.locator("body")).toContainText("兑换码不存在");
  await expect(page.locator("body")).not.toContainText("兑换成功");
  await expect(page.locator("body")).not.toContainText(studentToken ?? "");
  await testInfo.attach("student-redeem-code", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/mistake-book");
  await expect(page.getByRole("heading", { name: "错题本" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(studentToken ?? "");
  await expect(page.locator("body")).not.toContainText("code_hash");
  await expect(page.locator("body")).not.toContainText("raw answer");
  await expect(page.locator("body")).not.toContainText("do-not-render");

  const firstMistakeBookItem = page
    .locator('[data-testid^="mistake-book-item-"]')
    .first();

  if ((await firstMistakeBookItem.count()) > 0) {
    await expect(firstMistakeBookItem).toBeVisible();
    await expect(firstMistakeBookItem).not.toHaveAttribute("data-id", /.*/);
    await expect(
      firstMistakeBookItem.getByRole("button", { name: "AI讲解暂不可用" }),
    ).toBeDisabled();

    const favoriteButton = firstMistakeBookItem.getByRole("button", {
      name: /收藏/,
    });
    await favoriteButton.click();
    await expect(
      firstMistakeBookItem.getByRole("button", {
        name: /收藏/,
      }),
    ).toBeVisible();
  } else {
    await expect(page.locator("body")).toContainText("暂无错题记录");
    await expect(
      page.getByRole("link", { name: "返回首页" }).first(),
    ).toHaveAttribute("href", "/home");
  }

  await testInfo.attach("student-mistake-book", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/mock-exam?paperPublicId=paper-dev-theory");
  await expect(page.locator("body")).not.toBeEmpty();

  const studentFlow = await page.evaluate(async (token) => {
    const headers = {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
    const getJson = async (url: string, init?: RequestInit) => {
      const response = await fetch(url, init);
      return { status: response.status, body: await response.json() };
    };
    const papers = await getJson(
      "/api/v1/student-papers?profession=monopoly&level=3",
      { headers },
    );
    const paperDetail = await getJson(
      "/api/v1/student-papers/paper-dev-theory",
      {
        headers,
      },
    );
    const practice = await getJson("/api/v1/practices", {
      method: "POST",
      headers,
      body: JSON.stringify({ paperPublicId: "paper-dev-theory" }),
    });
    const openedPracticePublicId = practice.body.data?.practice?.publicId;
    const restartedPractice = await getJson(
      `/api/v1/practices/${openedPracticePublicId}/restart`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      },
    );
    const practicePublicId =
      restartedPractice.body.data?.practice?.publicId ?? openedPracticePublicId;
    const practiceAnswer = await getJson(
      `/api/v1/practices/${practicePublicId}/answers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          paperQuestionPublicId: "paper-question-dev-single-choice",
          selectedLabels: ["A"],
          textAnswer: null,
          savedFromClientAt: null,
        }),
      },
    );
    const mockExam = await getJson("/api/v1/mock-exams", {
      method: "POST",
      headers,
      body: JSON.stringify({ paperPublicId: "paper-dev-theory" }),
    });
    const mockExamPublicId = mockExam.body.data?.mockExam?.publicId;
    const mockAnswer = await getJson(
      `/api/v1/mock-exams/${mockExamPublicId}/answers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          paperQuestionPublicId: "paper-question-dev-single-choice",
          selectedLabels: ["A"],
          textAnswer: null,
          savedFromClientAt: null,
        }),
      },
    );
    const submit = await getJson(
      `/api/v1/mock-exams/${mockExamPublicId}/submit`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          submittedFromClientAt: new Date().toISOString(),
        }),
      },
    );
    const report = await getJson("/api/v1/exam-reports", {
      method: "POST",
      headers,
      body: JSON.stringify({ mockExamPublicId: mockExamPublicId }),
    });
    const reportPublicId = report.body.data?.examReport?.publicId;
    const retryLearningSuggestion = await getJson(
      `/api/v1/exam-reports/${reportPublicId}/retry-learning-suggestion`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestedFromClientAt: new Date().toISOString(),
        }),
      },
    );

    return {
      papers,
      paperDetail,
      practice,
      restartedPractice,
      practiceAnswer,
      mockExam,
      mockAnswer,
      submit,
      report,
      retryLearningSuggestion,
      practicePublicId,
      mockExamPublicId,
      reportPublicId,
    };
  }, studentToken);

  expect(studentFlow.papers.body.code).toBe(0);
  expect(studentFlow.paperDetail.body.code).toBe(0);
  expect(studentFlow.practice.body.code).toBe(0);
  expect(studentFlow.restartedPractice.body.code).toBe(0);
  expect(studentFlow.practiceAnswer.body.code).toBe(0);
  expect(studentFlow.practiceAnswer.body.data.feedback.isCorrect).toBe(true);
  expect(studentFlow.mockExam.body.code).toBe(0);
  expect(studentFlow.mockAnswer.body.code).toBe(0);
  expect(studentFlow.submit.body.data.mockExam.examStatus).toBe("completed");
  expect(studentFlow.report.body.data.examReport.publicId).toEqual(
    expect.any(String),
  );
  expect(studentFlow.retryLearningSuggestion.body).toEqual({
    code: 0,
    message: "ok",
    data: null,
  });

  await page.goto("/exam-report");
  await expect(page.locator("body")).not.toBeEmpty();
  await testInfo.attach("exam-report-page", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await loginViaUi(page, adminCredential);
  await expect(page).toHaveURL(/\/ops\/users$/);
  const adminToken = await page.evaluate(() =>
    localStorage.getItem("tiku.localSessionToken"),
  );
  expect(adminToken).toEqual(expect.any(String));

  for (const route of [
    "/ops/users",
    "/content/questions",
    "/content/papers",
    "/ops/ai-audit-logs",
  ]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toBeEmpty();
  }

  await page.goto("/ops/organizations");
  await expect(
    page.getByRole("heading", { name: "企业授权运营" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(adminToken ?? "");
  await testInfo.attach("admin-organizations", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/ops/redeem-codes");
  await expect(page.getByRole("heading", { name: "卡密管理" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(adminToken ?? "");
  await expect(page.locator("body")).not.toContainText("code_hash");
  await testInfo.attach("admin-redeem-codes", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  const adminReads = await page.evaluate(async (token) => {
    const headers = { authorization: `Bearer ${token}` };
    const getJson = async (url: string) => {
      const response = await fetch(url, { headers });
      return { status: response.status, body: await response.json() };
    };

    return {
      users: await getJson("/api/v1/users?page=1&pageSize=20"),
      organizations: await getJson("/api/v1/organizations?page=1&pageSize=20"),
      orgAuths: await getJson("/api/v1/org-auths?page=1&pageSize=20"),
      employees: await getJson("/api/v1/employees?page=1&pageSize=20"),
      redeemCodes: await getJson("/api/v1/redeem-codes?page=1&pageSize=20"),
      questions: await getJson("/api/v1/questions?page=1&pageSize=20"),
      papers: await getJson("/api/v1/papers?page=1&pageSize=20"),
      auditLogs: await getJson("/api/v1/audit-logs?page=1&pageSize=20"),
      aiCallLogs: await getJson("/api/v1/ai-call-logs?page=1&pageSize=20"),
      modelConfigs: await getJson("/api/v1/model-configs?page=1&pageSize=20"),
    };
  }, adminToken);

  expect(adminReads.users.body.code).toBe(0);
  expect(adminReads.organizations.body.code).toBe(0);
  expect(adminReads.orgAuths.body.code).toBe(0);
  expect(adminReads.employees.body.code).toBe(0);
  expect(adminReads.redeemCodes.body.code).toBe(0);
  expect(adminReads.questions.body.code).toBe(0);
  expect(adminReads.papers.body.code).toBe(0);
  expect(adminReads.auditLogs.body.data.auditLogs.length).toBeGreaterThan(0);
  expect(adminReads.aiCallLogs.body.data.aiCallLogs.length).toBeGreaterThan(0);
  expect(adminReads.modelConfigs.body.data.modelConfigs[0]).toMatchObject({
    providerKey: "mock",
    apiKeyDisplay: null,
  });

  const serializedAdminReads = JSON.stringify(adminReads);
  expect(serializedAdminReads).not.toContain("TikuDevStudent#2026");
  expect(serializedAdminReads).not.toContain("TikuDevAdmin#2026");
  expect(serializedAdminReads).not.toContain("sk-real-secret");
  expect(serializedAdminReads).not.toContain("RAW_PROMPT");
  expect(serializedAdminReads).not.toContain("RAW_ANSWER");
  expect(serializedAdminReads).not.toContain("code_hash");
  expect(serializedAdminReads).not.toContain("RC-2026-0001-PLAIN");
  expect(serializedAdminReads).not.toContain(studentToken);
  expect(serializedAdminReads).not.toContain(adminToken);
  expect(consoleErrors).toEqual([]);
  expect(networkFailures).toEqual([]);
});
