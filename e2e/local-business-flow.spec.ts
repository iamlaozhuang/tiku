import { expect, test, type Page } from "@playwright/test";

const studentCredential = {
  phone: "13900000002",
  password: "TikuDevStudent#2026",
};
const adminCredential = {
  phone: "13900000001",
  password: "TikuDevAdmin#2026",
};

async function loginViaBrowserFetch(
  page: Page,
  credential: { phone: string; password: string },
) {
  return page.evaluate(async (input) => {
    const response = await fetch("/api/v1/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await response.json();

    return {
      status: response.status,
      code: payload.code,
      token: payload.data?.token ?? null,
      userType: payload.data?.user?.userType ?? null,
      adminRoles: payload.data?.user?.adminRoles ?? [],
    };
  }, credential);
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

  await page.goto("/login");
  await expect(page.locator("body")).not.toBeEmpty();

  const studentLogin = await loginViaBrowserFetch(page, studentCredential);
  expect(studentLogin).toMatchObject({
    status: 200,
    code: 0,
    userType: "personal",
  });
  expect(studentLogin.token).toEqual(expect.any(String));

  await page.goto("/home");
  await expect(
    page.locator('[data-testid^="paper-card-"]').first(),
  ).toBeVisible();
  await testInfo.attach("student-home", {
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
  }, studentLogin.token);

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

  const adminLogin = await loginViaBrowserFetch(page, adminCredential);
  expect(adminLogin).toMatchObject({
    status: 200,
    code: 0,
    adminRoles: expect.arrayContaining(["super_admin"]),
  });
  expect(adminLogin.token).toEqual(expect.any(String));

  for (const route of [
    "/ops/users",
    "/content/questions",
    "/content/papers",
    "/ops/ai-audit-logs",
  ]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toBeEmpty();
  }

  const adminReads = await page.evaluate(async (token) => {
    const headers = { authorization: `Bearer ${token}` };
    const getJson = async (url: string) => {
      const response = await fetch(url, { headers });
      return { status: response.status, body: await response.json() };
    };

    return {
      users: await getJson("/api/v1/users?page=1&pageSize=20"),
      questions: await getJson("/api/v1/questions?page=1&pageSize=20"),
      papers: await getJson("/api/v1/papers?page=1&pageSize=20"),
      auditLogs: await getJson("/api/v1/audit-logs?page=1&pageSize=20"),
      aiCallLogs: await getJson("/api/v1/ai-call-logs?page=1&pageSize=20"),
      modelConfigs: await getJson("/api/v1/model-configs?page=1&pageSize=20"),
    };
  }, adminLogin.token);

  expect(adminReads.users.body.code).toBe(0);
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
  expect(serializedAdminReads).not.toContain(studentLogin.token);
  expect(serializedAdminReads).not.toContain(adminLogin.token);
  expect(consoleErrors).toEqual([]);
  expect(networkFailures).toEqual([]);
});
