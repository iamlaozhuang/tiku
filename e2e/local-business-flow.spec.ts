import { expect, test, type Page } from "@playwright/test";

type ApiPayload = {
  code: number;
  message: string;
  data: unknown;
  pagination?: unknown;
};

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

async function ensureStudentHomeReady(page: Page) {
  for (let attemptIndex = 0; attemptIndex < 3; attemptIndex += 1) {
    if (await isLoginFormVisible(page)) {
      await loginViaUi(page, studentCredential);
      await expect(page).toHaveURL(/\/home$/);
    }

    const firstPaperCard = page.locator('[data-testid^="paper-card-"]').first();

    try {
      await expect(firstPaperCard).toBeVisible({ timeout: 5_000 });
      return;
    } catch (error) {
      if (attemptIndex === 2) {
        throw error;
      }

      if (await isLoginFormVisible(page)) {
        continue;
      }

      await page.goto("/home");
    }
  }
}

async function isLoginFormVisible(page: Page): Promise<boolean> {
  return page.locator('input[name="phone"]').isVisible();
}

function expectStandardApiEnvelope(
  payload: unknown,
): asserts payload is ApiPayload {
  expect(payload).toEqual(expect.any(Object));

  const payloadRecord = payload as Record<string, unknown>;
  const allowedKeys = ["code", "message", "data", "pagination"];

  expect(
    Object.keys(payloadRecord).every((key) => allowedKeys.includes(key)),
  ).toBe(true);
  expect(payloadRecord.code).toEqual(expect.any(Number));
  expect(payloadRecord.message).toEqual(expect.any(String));
  expect(Object.hasOwn(payloadRecord, "data")).toBe(true);

  if (Object.hasOwn(payloadRecord, "pagination")) {
    expect(payloadRecord.pagination).toEqual(
      expect.objectContaining({
        page: expect.any(Number),
        pageSize: expect.any(Number),
        total: expect.any(Number),
        sortBy: expect.any(String),
        sortOrder: expect.stringMatching(/^(asc|desc)$/u),
      }),
    );
  }
}

function expectCamelCaseJsonKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      expectCamelCaseJsonKeys(item);
    }
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).toMatch(/^[a-z][A-Za-z0-9]*$/u);
    expectCamelCaseJsonKeys(childValue);
  }
}

function expectNoInternalIdKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      expectNoInternalIdKeys(item);
    }
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).not.toBe("id");
    expectNoInternalIdKeys(childValue);
  }
}

function expectNoSensitivePayload(
  value: unknown,
  tokens: (string | null)[] = [],
) {
  const serializedValue = JSON.stringify(value);
  const sensitiveTerms = [
    "TikuDevStudent#2026",
    "TikuDevAdmin#2026",
    "sk-real-secret",
    "RAW_PROMPT",
    "RAW_ANSWER",
    "raw prompt",
    "raw answer",
    "code_hash",
    "codeHash",
    "RC-2026-0001-PLAIN",
    "providerRequestPayload",
    "providerResponsePayload",
  ];

  for (const sensitiveTerm of sensitiveTerms) {
    expect(serializedValue).not.toContain(sensitiveTerm);
  }

  for (const token of tokens) {
    if (token !== null) {
      expect(serializedValue).not.toContain(token);
    }
  }
}

test("runs the local student, admin, audit, and mock AI business flow", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);

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
  await ensureStudentHomeReady(page);
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
      firstMistakeBookItem.getByRole("button", { name: "AI讲解" }),
    ).toBeEnabled();

    const favoriteButton = firstMistakeBookItem.getByRole("button", {
      name: /收藏/,
    });
    const favoriteResponsePromise = page.waitForResponse((response) => {
      const request = response.request();

      return (
        request.method() === "POST" &&
        /\/api\/v1\/mistake-books\/[^/]+\/(?:favorite|unfavorite)$/.test(
          new URL(response.url()).pathname,
        )
      );
    });
    await favoriteButton.click();
    const favoriteResponse = await favoriteResponsePromise;
    expect(favoriteResponse.ok()).toBe(true);
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

  for (const responseEnvelope of [
    studentFlow.papers.body,
    studentFlow.paperDetail.body,
    studentFlow.practice.body,
    studentFlow.restartedPractice.body,
    studentFlow.practiceAnswer.body,
    studentFlow.mockExam.body,
    studentFlow.mockAnswer.body,
    studentFlow.submit.body,
    studentFlow.report.body,
    studentFlow.retryLearningSuggestion.body,
  ]) {
    expectStandardApiEnvelope(responseEnvelope);
    expectCamelCaseJsonKeys(responseEnvelope);
    expectNoInternalIdKeys(responseEnvelope);
    expectNoSensitivePayload(responseEnvelope, [studentToken]);
  }

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
  await expect(page.locator("body")).not.toContainText("正在加载模拟考试记录");
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

  for (const contentRoute of [
    {
      path: "/content/questions",
      emptyText: "没有匹配的题目",
      heading: "题库与材料管理",
      testIdPrefix: "question-row-",
    },
    {
      path: "/content/materials",
      emptyText: "没有匹配的材料",
      heading: "题库与材料管理",
      testIdPrefix: "material-row-",
    },
    {
      path: "/content/papers",
      emptyText: "没有匹配的试卷",
      heading: "试卷管理",
      testIdPrefix: "paper-row-",
    },
    {
      path: "/content/knowledge-nodes",
      emptyText: "没有匹配的知识点",
      heading: "知识点树维护",
      testIdPrefix: "knowledge-node-row-",
    },
  ]) {
    await page.goto(contentRoute.path);
    await expect(
      page.getByRole("heading", { name: contentRoute.heading }),
    ).toBeVisible();
    const contentRow = page
      .locator(`[data-testid^="${contentRoute.testIdPrefix}"]`)
      .first();

    if ((await contentRow.count()) > 0) {
      await expect(contentRow).toBeVisible();
      await expect(contentRow).not.toHaveAttribute("data-id", /.*/);
    } else {
      await expect(page.locator("body")).toContainText(contentRoute.emptyText);
    }

    await expect(page.locator("body")).not.toContainText(adminToken ?? "");
  }

  await page.goto("/ops/users");
  await expect(
    page.getByRole("heading", { name: "运营后台闭环" }),
  ).toBeVisible();
  const adminUserRow = page.locator('[data-testid^="admin-user-row-"]').first();

  if ((await adminUserRow.count()) > 0) {
    await expect(adminUserRow).toBeVisible();
    await expect(adminUserRow).not.toHaveAttribute("data-id", /.*/);
    await expect(adminUserRow).toHaveAttribute("data-public-id", /user-/);
    await expect(page.getByLabel("用户状态")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "注册时间排序" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "重置密码" }).first().click();
    await expect(page.getByRole("alertdialog")).toContainText(
      "确认重置用户密码？",
    );
    await page.getByRole("button", { name: "取消" }).click();
  } else {
    await expect(page.locator("body")).toContainText("暂无运营后台数据");
  }

  await expect(page.locator("body")).toContainText("审计日志只读");
  await expect(page.locator("body")).toContainText("AI 调用日志只读");
  await expect(page.locator("body")).not.toContainText(adminToken ?? "");
  await expect(page.locator("body")).not.toContainText("code_hash");
  await expect(page.locator("body")).not.toContainText("raw prompt");
  await expect(page.locator("body")).not.toContainText("sk-real-secret");
  await testInfo.attach("admin-ops-users", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await page.waitForLoadState("networkidle");

  await page.goto("/ops/resources");
  await expect(
    page.getByRole("heading", { name: "资源与知识库管理" }),
  ).toBeVisible();
  await expect(page.getByLabel("本地资源标题")).toBeVisible();
  await page.getByLabel("本地资源标题").fill("E2E 本地资源验证资料");
  await page.locator('input[type="file"]').setInputFiles({
    name: "local-resource-e2e.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# E2E 本地资源\n\n受控测试摘要"),
  });
  await page.getByRole("button", { name: "上传本地资源" }).click();
  await expect(page.getByRole("status")).toContainText(
    "资源上传完成，已生成 Markdown 草稿",
  );
  await expect(page.locator("body")).toContainText("E2E 本地资源验证资料");
  const resourceRow = page.locator('[data-testid^="resource-row-"]').first();

  if ((await resourceRow.count()) > 0) {
    await expect(resourceRow).toBeVisible();
    await expect(resourceRow).not.toHaveAttribute("data-id", /.*/);
    await expect(resourceRow).toHaveAttribute("data-public-id", /resource-/);
    await expect(
      resourceRow.getByRole("button", { name: "Markdown 校对" }),
    ).toBeVisible();
    await resourceRow.getByRole("button", { name: "重建向量" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("确认重建");
    await page.getByRole("button", { name: "取消" }).click();
  } else {
    await expect(page.locator("body")).toContainText("暂无资源与知识库数据");
  }

  await expect(page.locator("body")).not.toContainText(adminToken ?? "");
  await expect(page.locator("body")).not.toContainText("objectStoragePath");
  await expect(page.locator("body")).not.toContainText("embedding");
  await expect(page.locator("body")).not.toContainText("RAW_CHUNK_TEXT");
  await testInfo.attach("admin-resources", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.goto("/ops/ai-audit-logs");
  await expect(page.locator("body")).not.toBeEmpty();

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
      resources: await getJson("/api/v1/resources?page=1&pageSize=20"),
      auditLogs: await getJson("/api/v1/audit-logs?page=1&pageSize=20"),
      aiCallLogs: await getJson("/api/v1/ai-call-logs?page=1&pageSize=20"),
      modelConfigs: await getJson("/api/v1/model-configs?page=1&pageSize=20"),
    };
  }, adminToken);

  for (const responseEnvelope of [
    adminReads.users.body,
    adminReads.organizations.body,
    adminReads.orgAuths.body,
    adminReads.employees.body,
    adminReads.redeemCodes.body,
    adminReads.questions.body,
    adminReads.papers.body,
    adminReads.resources.body,
    adminReads.auditLogs.body,
    adminReads.aiCallLogs.body,
    adminReads.modelConfigs.body,
  ]) {
    expectStandardApiEnvelope(responseEnvelope);
    expectCamelCaseJsonKeys(responseEnvelope);
    expectNoInternalIdKeys(responseEnvelope);
    expectNoSensitivePayload(responseEnvelope, [adminToken, studentToken]);
  }

  expect(adminReads.users.body.code).toBe(0);
  expect(adminReads.organizations.body.code).toBe(0);
  expect(adminReads.orgAuths.body.code).toBe(0);
  expect(adminReads.employees.body.code).toBe(0);
  expect(adminReads.redeemCodes.body.code).toBe(0);
  expect(adminReads.questions.body.code).toBe(0);
  expect(adminReads.papers.body.code).toBe(0);
  expect(adminReads.resources.body.code).toBe(0);
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

  const consoleErrorCountBeforeReadOnlyWriteGuards = consoleErrors.length;
  const restContractGuards = await page.evaluate(async (token) => {
    const authorizedHeaders = {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
    const readJson = async (url: string, headers?: HeadersInit) => {
      const response = await fetch(url, { headers });
      return { status: response.status, body: await response.json() };
    };
    const postStatus = async (url: string) => {
      const response = await fetch(url, {
        method: "POST",
        headers: authorizedHeaders,
        body: JSON.stringify({
          attemptedFromClientAt: new Date().toISOString(),
        }),
      });

      return response.status;
    };

    return {
      unauthenticatedUsers: await readJson("/api/v1/users?page=1&pageSize=20"),
      auditLogsPostStatus: await postStatus("/api/v1/audit-logs"),
      aiCallLogsPostStatus: await postStatus("/api/v1/ai-call-logs"),
      aiCallLogSummaryPostStatus: await postStatus(
        "/api/v1/ai-call-logs/summary",
      ),
    };
  }, adminToken);

  expectStandardApiEnvelope(restContractGuards.unauthenticatedUsers.body);
  expect(restContractGuards.unauthenticatedUsers.body.code).toBe(401001);
  expect(restContractGuards.unauthenticatedUsers.body.data).toBeNull();
  expect([404, 405]).toContain(restContractGuards.auditLogsPostStatus);
  expect([404, 405]).toContain(restContractGuards.aiCallLogsPostStatus);
  expect([404, 405]).toContain(restContractGuards.aiCallLogSummaryPostStatus);

  const readOnlyWriteGuardConsoleErrors = consoleErrors.slice(
    consoleErrorCountBeforeReadOnlyWriteGuards,
  );
  expect(readOnlyWriteGuardConsoleErrors).toHaveLength(3);
  for (const consoleError of readOnlyWriteGuardConsoleErrors) {
    expect(consoleError).toContain(
      "the server responded with a status of 405 (Method Not Allowed)",
    );
  }

  const unexpectedNetworkFailures = networkFailures.filter(
    (networkFailure) => !isExpectedTransitionAbort(networkFailure),
  );

  expect(
    consoleErrors.slice(0, consoleErrorCountBeforeReadOnlyWriteGuards),
  ).toEqual([]);
  expect(unexpectedNetworkFailures).toEqual([]);
});

function isExpectedTransitionAbort(networkFailure: string) {
  if (!networkFailure.includes("net::ERR_ABORTED")) {
    return false;
  }

  if (
    networkFailure.startsWith("POST ") &&
    [
      "/api/v1/audit-logs",
      "/api/v1/ai-call-logs",
      "/api/v1/ai-call-logs/summary",
    ].some((expectedUrlPart) => networkFailure.includes(expectedUrlPart))
  ) {
    return true;
  }

  return [
    "/api/v1/sessions",
    "/api/v1/audit-logs?",
    "/api/v1/ai-call-logs?",
    "/api/v1/ai-call-logs/summary?",
    "/api/v1/exam-reports?",
    "/api/v1/users?",
    "/api/v1/redeem-codes?",
    "/api/v1/organizations?",
    "/api/v1/employees?",
    "/api/v1/org-auths?",
    "/_next/static/chunks/",
    "__nextjs_font/geist-latin.woff2",
  ].some((expectedUrlPart) => networkFailure.includes(expectedUrlPart));
}
