import { expect, test, type Page } from "@playwright/test";

type ApiPayload = {
  code: number;
  message: string;
  data: unknown;
  pagination?: unknown;
};

type RuntimeFetchResult = {
  status: number;
  body: unknown;
};

type RuntimeRequest = {
  body?: string;
  method?: "GET" | "POST";
};

type RuntimeInventory = {
  adminToken: string;
  authorizedStudentRedeemCodePlainText: string | null;
  contentPaperPublicId: string | null;
  contentPaperQuestionPublicId: string | null;
  contentQuestionPublicId: string | null;
  materialPublicId: string | null;
  noAuthStudentPhone: string;
  positiveMockExamPublicId: string | null;
  positivePracticePublicId: string | null;
  positiveReportPublicId: string | null;
  studentToken: string;
};

const acceptanceRunLabel = `acceptance-20260524-role-flow-${Date.now()}`;
const devSeedPaperPublicId = "paper-dev-theory";
const devSeedPaperQuestionPublicId = "paper-question-dev-single-choice";
const localSessionStorageKey = "tiku.localSessionToken";

const adminCredential = {
  phone: "13900000001",
  password: "TikuDevAdmin#2026",
};

const authorizedStudentCredential = {
  phone: `139${String(Date.now()).slice(-8)}`,
  password: "Acceptance2026",
  name: "acceptance-20260524-authorized-student",
};

const noAuthStudentCredential = {
  phone: "13900000924",
  password: "Acceptance2026",
  name: "acceptance-20260524-no-auth-student",
};

const runtimeInventory: RuntimeInventory = {
  adminToken: "",
  authorizedStudentRedeemCodePlainText: null,
  contentPaperPublicId: null,
  contentPaperQuestionPublicId: null,
  contentQuestionPublicId: null,
  materialPublicId: null,
  noAuthStudentPhone: noAuthStudentCredential.phone,
  positiveMockExamPublicId: null,
  positivePracticePublicId: null,
  positiveReportPublicId: null,
  studentToken: "",
};

test.describe.configure({ mode: "serial" });

test.describe("phase 11 role-based full-flow acceptance rerun", () => {
  test("1. Preflight Data Inventory", async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    await loginViaUi(page, adminCredential);
    await expect(page).toHaveURL(/\/ops\/users$/);
    runtimeInventory.adminToken = await readLocalSessionToken(page);

    const adminInventory = {
      users: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/users?page=1&pageSize=20",
      ),
      organizations: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/organizations?page=1&pageSize=20",
      ),
      orgAuths: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/org-auths?page=1&pageSize=20",
      ),
      redeemCodes: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/redeem-codes?page=1&pageSize=20",
      ),
      materials: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/materials?page=1&pageSize=20",
      ),
      questions: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/questions?page=1&pageSize=20",
      ),
      papers: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/papers?page=1&pageSize=20",
      ),
      auditLogs: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/audit-logs?page=1&pageSize=20",
      ),
      aiCallLogs: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/ai-call-logs?page=1&pageSize=20",
      ),
      modelConfigs: await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/model-configs?page=1&pageSize=20",
      ),
    };

    for (const inventoryResponse of Object.values(adminInventory)) {
      expectStandardApiEnvelope(inventoryResponse.body);
      expectCamelCaseJsonKeys(inventoryResponse.body);
      expectNoInternalIdKeys(inventoryResponse.body);
      expectNoSensitivePayload(inventoryResponse.body, [
        runtimeInventory.adminToken,
      ]);
    }

    const inventorySummary = {
      users: readCollectionItems(adminInventory.users.body, "users").length,
      organizations: readCollectionItems(
        adminInventory.organizations.body,
        "organizations",
      ).length,
      orgAuths: readCollectionItems(adminInventory.orgAuths.body, "orgAuths")
        .length,
      redeemCodes: readCollectionItems(
        adminInventory.redeemCodes.body,
        "redeemCodes",
      ).length,
      materials: readCollectionItems(adminInventory.materials.body, "materials")
        .length,
      questions: readCollectionItems(adminInventory.questions.body, "questions")
        .length,
      papers: readCollectionItems(adminInventory.papers.body, "papers").length,
      auditLogs: readCollectionItems(adminInventory.auditLogs.body, "auditLogs")
        .length,
      aiCallLogs: readCollectionItems(
        adminInventory.aiCallLogs.body,
        "aiCallLogs",
      ).length,
      modelConfigs: readCollectionItems(
        adminInventory.modelConfigs.body,
        "modelConfigs",
      ).length,
      studentScopes: "deferred_to_acceptance_student",
      studentPapers: "deferred_to_acceptance_student",
    };

    expect(inventorySummary.users).toBeGreaterThan(0);
    expect(inventorySummary.organizations).toBeGreaterThan(0);
    expect(inventorySummary.redeemCodes).toBeGreaterThan(0);
    expect(inventorySummary.questions).toBeGreaterThan(0);
    expect(inventorySummary.papers).toBeGreaterThan(0);
    expect(inventorySummary.modelConfigs).toBeGreaterThan(0);
    await testInfo.attach("preflight-data-inventory-redacted-summary", {
      body: JSON.stringify(inventorySummary, null, 2),
      contentType: "application/json",
    });
  });

  test("2. System Ops Data Readiness", async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    await loginViaUi(page, adminCredential);
    await expect(page).toHaveURL(/\/ops\/users$/);
    runtimeInventory.adminToken = await readLocalSessionToken(page);

    const users = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/users?page=1&pageSize=20",
    );
    const organizations = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/organizations?page=1&pageSize=20",
    );
    const redeemCodes = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/redeem-codes?page=1&pageSize=20",
    );
    const organizationPublicId = readFirstPublicId(
      organizations.body,
      "organizations",
    );

    expect(organizationPublicId).toEqual(expect.any(String));
    expect(readCollectionItems(users.body, "users").length).toBeGreaterThan(0);
    expect(
      readCollectionItems(redeemCodes.body, "redeemCodes").length,
    ).toBeGreaterThan(0);

    const existingOrgAuth = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      `/api/v1/org-auths?page=1&pageSize=20&keyword=${acceptanceRunLabel}`,
    );
    let orgAuthReadinessResult = "reused";

    if (readCollectionItems(existingOrgAuth.body, "orgAuths").length === 0) {
      const createdOrgAuth = await fetchJsonFromPage(
        page,
        runtimeInventory.adminToken,
        "/api/v1/org-auths",
        {
          method: "POST",
          body: JSON.stringify({
            name: `${acceptanceRunLabel}-org-auth`,
            purchaserOrganizationPublicId: organizationPublicId,
            authScopeType: "current_and_descendants",
            profession: "logistics",
            level: 5,
            accountQuota: 3,
            startsAt: "2026-05-24T00:00:00.000Z",
            expiresAt: "2027-05-24T00:00:00.000Z",
            organizationPublicIds: [],
          }),
        },
      );

      expectStandardApiEnvelope(createdOrgAuth.body);
      expectNoSensitivePayload(createdOrgAuth.body, [
        runtimeInventory.adminToken,
      ]);
      expect([0, 409005, 409006]).toContain(
        (createdOrgAuth.body as ApiPayload).code,
      );
      orgAuthReadinessResult =
        (createdOrgAuth.body as ApiPayload).code === 0
          ? "created_test_only"
          : "existing_or_blocked_by_runtime_guard";
    }

    const registration = await registerPersonalStudent(
      page,
      authorizedStudentCredential,
    );
    expect([0, 409001]).toContain((registration.body as ApiPayload).code);

    const createdRedeemCodeBatch = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/redeem-codes",
      {
        method: "POST",
        body: JSON.stringify({
          count: 1,
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          redeemDeadlineDate: "2027-05-24",
        }),
      },
    );
    expect((createdRedeemCodeBatch.body as ApiPayload).code).toBe(0);
    runtimeInventory.authorizedStudentRedeemCodePlainText =
      readGeneratedRedeemCodePlainText(createdRedeemCodeBatch.body);
    expect(runtimeInventory.authorizedStudentRedeemCodePlainText).toEqual(
      expect.any(String),
    );

    await page.goto("/ops/redeem-codes");
    await expect(page.getByRole("heading", { name: "卡密管理" })).toBeVisible();
    await expect(
      page.getByTestId("system-ops-purchase-guidance-contact-config"),
    ).toContainText("购买支持");

    await testInfo.attach("system-ops-readiness-redacted-summary", {
      body: JSON.stringify(
        {
          userRuntime: "present",
          organizationRuntime: "present",
          orgAuthRuntime: orgAuthReadinessResult,
          redeemCodeRuntime: "created_test_only_plaintext_not_recorded",
          authorizedStudentRuntime: "created_or_reused_test_only",
          contactConfigRuntime: "rendered",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("3. Content Ops Readiness", async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    await loginViaUi(page, adminCredential);
    await expect(page).toHaveURL(/\/ops\/users$/);
    runtimeInventory.adminToken = await readLocalSessionToken(page);

    runtimeInventory.materialPublicId = await ensureMaterialReady(
      page,
      runtimeInventory.adminToken,
    );
    runtimeInventory.contentQuestionPublicId = await ensureQuestionReady(
      page,
      runtimeInventory.adminToken,
      runtimeInventory.materialPublicId,
    );
    const contentPaperReadiness = await ensurePaperReady(
      page,
      runtimeInventory.adminToken,
      runtimeInventory.contentQuestionPublicId,
    );
    runtimeInventory.contentPaperPublicId = contentPaperReadiness.paperPublicId;
    runtimeInventory.contentPaperQuestionPublicId =
      contentPaperReadiness.paperQuestionPublicId;

    await page.goto("/content/questions");
    await expect(
      page.getByRole("heading", { name: "题库与材料管理" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("content-action-runtime-ready"),
    ).toBeVisible();

    await page.goto("/content/papers");
    await expect(page.getByRole("heading", { name: "试卷管理" })).toBeVisible();
    await expect(page.getByTestId("paper-action-unavailable")).toBeVisible();

    await testInfo.attach("content-ops-readiness-redacted-summary", {
      body: JSON.stringify(
        {
          materialPublicId: runtimeInventory.materialPublicId,
          questionPublicId: runtimeInventory.contentQuestionPublicId,
          paperPublicId: runtimeInventory.contentPaperPublicId,
          paperQuestionPublicId: runtimeInventory.contentPaperQuestionPublicId,
          publishState: "published_or_reused",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("4. Student Positive Flow", async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    await loginViaUi(page, authorizedStudentCredential);
    await expect(page).toHaveURL(/\/home$/);
    runtimeInventory.studentToken = await readLocalSessionToken(page);

    const redemption = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      "/api/v1/redeem-codes/redeem",
      {
        method: "POST",
        body: JSON.stringify({
          code: runtimeInventory.authorizedStudentRedeemCodePlainText,
        }),
      },
    );
    expect((redemption.body as ApiPayload).code).toBe(0);
    expectNoSensitivePayload(redemption.body, [runtimeInventory.studentToken]);

    await page.goto("/home");

    await expect(
      page.locator('[data-testid^="paper-card-"]').first(),
    ).toBeVisible();
    const targetPaperPublicId =
      runtimeInventory.contentPaperPublicId ?? devSeedPaperPublicId;
    const targetPaperQuestionPublicId =
      runtimeInventory.contentPaperQuestionPublicId ??
      devSeedPaperQuestionPublicId;

    const practice = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      "/api/v1/practices",
      {
        method: "POST",
        body: JSON.stringify({ paperPublicId: targetPaperPublicId }),
      },
    );
    expect((practice.body as ApiPayload).code).toBe(0);
    const openedPracticePublicId = readNestedPublicId(
      practice.body,
      "practice",
    );
    expect(openedPracticePublicId).toEqual(expect.any(String));

    const restartedPractice = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      `/api/v1/practices/${openedPracticePublicId}/restart`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    expect((restartedPractice.body as ApiPayload).code).toBe(0);
    runtimeInventory.positivePracticePublicId =
      readNestedPublicId(restartedPractice.body, "practice") ??
      openedPracticePublicId;

    const practiceAnswer = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      `/api/v1/practices/${runtimeInventory.positivePracticePublicId}/answers`,
      {
        method: "POST",
        body: JSON.stringify({
          paperQuestionPublicId: targetPaperQuestionPublicId,
          selectedLabels: ["A"],
          textAnswer: null,
          savedFromClientAt: null,
        }),
      },
    );
    expect((practiceAnswer.body as ApiPayload).code).toBe(0);
    expect(practiceAnswer.body).toMatchObject({
      data: {
        feedback: {
          answerRecordPublicId: expect.any(String),
          isCorrect: true,
          score: "5.0",
        },
      },
    });

    const mockExam = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      "/api/v1/mock-exams",
      {
        method: "POST",
        body: JSON.stringify({ paperPublicId: targetPaperPublicId }),
      },
    );
    expect((mockExam.body as ApiPayload).code).toBe(0);
    runtimeInventory.positiveMockExamPublicId = readNestedPublicId(
      mockExam.body,
      "mockExam",
    );
    expect(runtimeInventory.positiveMockExamPublicId).toEqual(
      expect.any(String),
    );

    const mockAnswer = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      `/api/v1/mock-exams/${runtimeInventory.positiveMockExamPublicId}/answers`,
      {
        method: "POST",
        body: JSON.stringify({
          paperQuestionPublicId: targetPaperQuestionPublicId,
          selectedLabels: ["A"],
          textAnswer: null,
          savedFromClientAt: null,
        }),
      },
    );
    expect((mockAnswer.body as ApiPayload).code).toBe(0);

    const submittedMockExam = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      `/api/v1/mock-exams/${runtimeInventory.positiveMockExamPublicId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({
          submittedFromClientAt: new Date().toISOString(),
        }),
      },
    );
    expect(submittedMockExam.body).toMatchObject({
      code: 0,
      data: {
        mockExam: {
          examStatus: "completed",
        },
      },
    });

    const examReport = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      "/api/v1/exam-reports",
      {
        method: "POST",
        body: JSON.stringify({
          mockExamPublicId: runtimeInventory.positiveMockExamPublicId,
        }),
      },
    );
    expect((examReport.body as ApiPayload).code).toBe(0);
    runtimeInventory.positiveReportPublicId = readNestedPublicId(
      examReport.body,
      "examReport",
    );
    expect(runtimeInventory.positiveReportPublicId).toEqual(expect.any(String));

    const learningSuggestion = await fetchJsonFromPage(
      page,
      runtimeInventory.studentToken,
      `/api/v1/exam-reports/${runtimeInventory.positiveReportPublicId}/retry-learning-suggestion`,
      {
        method: "POST",
        body: JSON.stringify({
          requestedFromClientAt: new Date().toISOString(),
        }),
      },
    );
    expectStandardApiEnvelope(learningSuggestion.body);
    expectNoSensitivePayload(learningSuggestion.body, [
      runtimeInventory.studentToken,
    ]);

    await page.goto("/exam-report");
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.locator("body")).not.toContainText(
      runtimeInventory.studentToken,
    );

    await testInfo.attach("student-positive-flow-redacted-summary", {
      body: JSON.stringify(
        {
          practicePublicId: runtimeInventory.positivePracticePublicId,
          mockExamPublicId: runtimeInventory.positiveMockExamPublicId,
          reportPublicId: runtimeInventory.positiveReportPublicId,
          learningSuggestion: "local_mock_invoked_or_noop",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("5. Student Negative Flow", async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    const registration = await registerPersonalStudent(
      page,
      noAuthStudentCredential,
    );
    expect([0, 409001]).toContain((registration.body as ApiPayload).code);

    await loginViaUi(page, noAuthStudentCredential);
    await expect(page).toHaveURL(/\/home$/);
    const noAuthStudentToken = await readLocalSessionToken(page);

    await expect(page.locator("body")).toContainText("暂无有效授权");
    await expect(page.locator('[data-testid^="paper-card-"]')).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("本地专卖理论模拟卷");
    await expect(page.locator("body")).not.toContainText(noAuthStudentToken);

    await page.getByRole("link", { name: "前往兑换卡密" }).click();
    await expect(page).toHaveURL(/\/redeem-code$/);
    await expect(
      page.getByTestId("student-purchase-guidance-contact-config"),
    ).toContainText("购买支持");
    await expect(page.locator("body")).not.toContainText(noAuthStudentToken);

    await testInfo.attach("student-negative-flow-redacted-summary", {
      body: JSON.stringify(
        {
          studentLabel: "acceptance no-auth student",
          registration: (registration.body as ApiPayload).code,
          contentLeakage: "not_detected",
          purchaseGuidance: "rendered",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  test("6. Oversight Flow", async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    await loginViaUi(page, adminCredential);
    await expect(page).toHaveURL(/\/ops\/users$/);
    runtimeInventory.adminToken = await readLocalSessionToken(page);

    const auditLogs = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/audit-logs?page=1&pageSize=20",
    );
    const aiCallLogs = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/ai-call-logs?page=1&pageSize=20",
    );
    const aiCallLogSummary = await fetchJsonFromPage(
      page,
      runtimeInventory.adminToken,
      "/api/v1/ai-call-logs/summary?page=1&pageSize=20",
    );

    for (const oversightResponse of [auditLogs, aiCallLogs, aiCallLogSummary]) {
      expectStandardApiEnvelope(oversightResponse.body);
      expectNoInternalIdKeys(oversightResponse.body);
      expectNoSensitivePayload(oversightResponse.body, [
        runtimeInventory.adminToken,
        runtimeInventory.studentToken,
      ]);
    }

    expect(
      readCollectionItems(auditLogs.body, "auditLogs").length,
    ).toBeGreaterThan(0);
    expect(
      readCollectionItems(aiCallLogs.body, "aiCallLogs").length,
    ).toBeGreaterThan(0);

    await page.goto("/ops/ai-audit-logs");
    await expect(page.locator("body")).toContainText("审计日志只读");
    await expect(page.locator("body")).toContainText("AI 调用日志只读");
    await expect(page.locator("body")).not.toContainText(
      runtimeInventory.adminToken,
    );
    await expect(page.locator("body")).not.toContainText("RAW_PROMPT");
    await expect(page.locator("body")).not.toContainText("RAW_ANSWER");

    await testInfo.attach("oversight-flow-redacted-summary", {
      body: JSON.stringify(
        {
          auditLogRows: readCollectionItems(auditLogs.body, "auditLogs").length,
          aiCallLogRows: readCollectionItems(aiCallLogs.body, "aiCallLogs")
            .length,
          readonlyUi: "rendered",
          sensitivePayloadLeakage: "not_detected",
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });
});

async function loginViaUi(
  page: Page,
  credential: { phone: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("手机号").fill(credential.phone);
  await page.getByLabel("密码").fill(credential.password);
  await expect(page.getByRole("button", { name: "登录" })).toBeEnabled();
  await page.getByRole("button", { name: "登录" }).click();
}

async function readLocalSessionToken(page: Page): Promise<string> {
  const token = await page.evaluate((storageKey) => {
    return localStorage.getItem(storageKey);
  }, localSessionStorageKey);

  expect(token).toEqual(expect.any(String));

  return token ?? "";
}

async function fetchJsonFromPage(
  page: Page,
  token: string,
  path: string,
  request: RuntimeRequest = {},
): Promise<RuntimeFetchResult> {
  return page.evaluate(
    async ({ path: requestPath, request: runtimeRequest, token: bearer }) => {
      const response = await fetch(requestPath, {
        method: runtimeRequest.method ?? "GET",
        headers: {
          authorization: `Bearer ${bearer}`,
          "content-type": "application/json",
        },
        body: runtimeRequest.body,
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    { path, request, token },
  );
}

async function registerPersonalStudent(
  page: Page,
  credential: { name: string; password: string; phone: string },
): Promise<RuntimeFetchResult> {
  await page.goto("/");

  return page.evaluate(async (studentInput) => {
    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        phone: studentInput.phone,
        password: studentInput.password,
        name: studentInput.name,
      }),
    });

    return {
      status: response.status,
      body: await response.json(),
    };
  }, credential);
}

async function ensureMaterialReady(page: Page, token: string): Promise<string> {
  const existingMaterials = await fetchJsonFromPage(
    page,
    token,
    `/api/v1/materials?page=1&pageSize=20&keyword=${acceptanceRunLabel}`,
  );
  const reusedMaterialPublicId = readFirstMatchingPublicId(
    existingMaterials.body,
    "materials",
    acceptanceRunLabel,
  );

  if (reusedMaterialPublicId !== null) {
    return reusedMaterialPublicId;
  }

  const createdMaterial = await fetchJsonFromPage(
    page,
    token,
    "/api/v1/materials",
    {
      method: "POST",
      body: JSON.stringify({
        title: `${acceptanceRunLabel}-material`,
        contentRichText: "<p>acceptance material bounded sample</p>",
        profession: "monopoly",
        level: 3,
        subject: "theory",
      }),
    },
  );

  expect((createdMaterial.body as ApiPayload).code).toBe(0);

  return expectNestedPublicId(createdMaterial.body, "material");
}

async function ensureQuestionReady(
  page: Page,
  token: string,
  materialPublicId: string,
): Promise<string> {
  const existingQuestions = await fetchJsonFromPage(
    page,
    token,
    `/api/v1/questions?page=1&pageSize=20&keyword=${acceptanceRunLabel}`,
  );
  const reusedQuestionPublicId = readFirstMatchingPublicId(
    existingQuestions.body,
    "questions",
    acceptanceRunLabel,
  );

  if (reusedQuestionPublicId !== null) {
    return reusedQuestionPublicId;
  }

  const createdQuestion = await fetchJsonFromPage(
    page,
    token,
    "/api/v1/questions",
    {
      method: "POST",
      body: JSON.stringify({
        questionType: "single_choice",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        stemRichText: `<p>${acceptanceRunLabel} objective readiness question?</p>`,
        analysisRichText: "<p>bounded teacher analysis</p>",
        standardAnswerRichText: "<p>A</p>",
        multiChoiceRule: "all_correct_only",
        scoringMethod: "auto_match",
        materialPublicId,
        questionOptions: [
          {
            label: "A",
            contentRichText: "<p>bounded correct option</p>",
            isCorrect: true,
            sortOrder: 1,
          },
          {
            label: "B",
            contentRichText: "<p>bounded distractor option</p>",
            isCorrect: false,
            sortOrder: 2,
          },
        ],
        scoringPoints: [],
      }),
    },
  );

  expect((createdQuestion.body as ApiPayload).code).toBe(0);

  return expectNestedPublicId(createdQuestion.body, "question");
}

async function ensurePaperReady(
  page: Page,
  token: string,
  questionPublicId: string,
): Promise<{ paperPublicId: string; paperQuestionPublicId: string }> {
  const existingPapers = await fetchJsonFromPage(
    page,
    token,
    `/api/v1/papers?page=1&pageSize=20&keyword=${acceptanceRunLabel}`,
  );
  const reusedPaperPublicId = readFirstMatchingPublicId(
    existingPapers.body,
    "papers",
    acceptanceRunLabel,
  );

  if (reusedPaperPublicId !== null) {
    const existingPaper = readCollectionItems(
      existingPapers.body,
      "papers",
    ).find((candidatePaper) => candidatePaper.publicId === reusedPaperPublicId);

    if (existingPaper?.paperStatus === "published") {
      const paperQuestionPublicId =
        readFirstPaperQuestionPublicId(existingPaper) ??
        devSeedPaperQuestionPublicId;

      return { paperPublicId: reusedPaperPublicId, paperQuestionPublicId };
    }
  }

  const createdPaper = await fetchJsonFromPage(page, token, "/api/v1/papers", {
    method: "POST",
    body: JSON.stringify({
      name: `${acceptanceRunLabel}-paper`,
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      year: 2026,
      source: "acceptance_test",
      durationMinute: 30,
      totalScore: "5.0",
    }),
  });
  expect((createdPaper.body as ApiPayload).code).toBe(0);
  const paperPublicId = expectNestedPublicId(createdPaper.body, "paper");

  const addedQuestion = await fetchJsonFromPage(
    page,
    token,
    `/api/v1/papers/${paperPublicId}/questions`,
    {
      method: "POST",
      body: JSON.stringify({
        questionPublicId,
        score: "5.0",
        sortOrder: 1,
        paperSection: {
          title: "Acceptance Objective",
          description: null,
          sortOrder: 1,
        },
        questionGroup: null,
      }),
    },
  );
  expect((addedQuestion.body as ApiPayload).code).toBe(0);
  const paperQuestionPublicId = expectNestedPublicId(
    addedQuestion.body,
    "paperQuestion",
  );

  const publishedPaper = await fetchJsonFromPage(
    page,
    token,
    `/api/v1/papers/${paperPublicId}/publish`,
    {
      method: "POST",
    },
  );
  expect((publishedPaper.body as ApiPayload).code).toBe(0);
  expect(publishedPaper.body).toMatchObject({
    data: {
      paper: {
        paperStatus: "published",
      },
    },
  });

  return { paperPublicId, paperQuestionPublicId };
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
}

function expectCamelCaseJsonKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const childValue of value) {
      expectCamelCaseJsonKeys(childValue);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).toMatch(/^[a-z][A-Za-z0-9]*$/u);
    expectCamelCaseJsonKeys(childValue);
  }
}

function expectNoInternalIdKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const childValue of value) {
      expectNoInternalIdKeys(childValue);
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).not.toBe("id");
    expectNoInternalIdKeys(childValue);
  }
}

function expectNoSensitivePayload(value: unknown, tokens: string[] = []) {
  const serializedValue = JSON.stringify(value);
  const sensitiveTerms = [
    "TikuDevStudent#2026",
    "TikuDevAdmin#2026",
    "Acceptance2026",
    "RAW_PROMPT",
    "RAW_ANSWER",
    "raw prompt",
    "raw answer",
    "providerRequestPayload",
    "providerResponsePayload",
    "Authorization",
    "Bearer ",
    "secretValue",
    "apiKeySecret",
    "providerSecret",
    "token",
    "code_hash",
    "codeHash",
  ];

  for (const sensitiveTerm of sensitiveTerms) {
    expect(serializedValue).not.toContain(sensitiveTerm);
  }

  for (const token of tokens) {
    expect(serializedValue).not.toContain(token);
  }
}

function readCollectionItems(
  payload: unknown,
  collectionKey: string,
): Record<string, unknown>[] {
  expectStandardApiEnvelope(payload);
  const payloadContent = (payload as ApiPayload).data;

  if (Array.isArray(payloadContent)) {
    return payloadContent.filter(isRecord);
  }

  if (
    isRecord(payloadContent) &&
    Array.isArray(payloadContent[collectionKey])
  ) {
    return payloadContent[collectionKey].filter(isRecord);
  }

  return [];
}

function readFirstPublicId(
  payload: unknown,
  collectionKey: string,
): string | null {
  const [firstItem] = readCollectionItems(payload, collectionKey);
  const publicId = firstItem?.publicId;

  return typeof publicId === "string" ? publicId : null;
}

function readFirstMatchingPublicId(
  payload: unknown,
  collectionKey: string,
  marker: string,
): string | null {
  const matchingItem = readCollectionItems(payload, collectionKey).find(
    (candidateItem) => JSON.stringify(candidateItem).includes(marker),
  );
  const publicId = matchingItem?.publicId;

  return typeof publicId === "string" ? publicId : null;
}

function readNestedPublicId(
  payload: unknown,
  objectKey: string,
): string | null {
  expectStandardApiEnvelope(payload);
  const payloadContent = (payload as ApiPayload).data;

  if (!isRecord(payloadContent) || !isRecord(payloadContent[objectKey])) {
    return null;
  }

  const publicId = payloadContent[objectKey].publicId;

  return typeof publicId === "string" ? publicId : null;
}

function readGeneratedRedeemCodePlainText(payload: unknown): string | null {
  expectStandardApiEnvelope(payload);
  const payloadContent = (payload as ApiPayload).data;

  if (!isRecord(payloadContent) || !Array.isArray(payloadContent.redeemCodes)) {
    return null;
  }

  const [redeemCodeItem] = payloadContent.redeemCodes.filter(isRecord);
  const codePlainText = redeemCodeItem?.codePlainText;

  return typeof codePlainText === "string" ? codePlainText : null;
}

function expectNestedPublicId(payload: unknown, objectKey: string): string {
  const publicId = readNestedPublicId(payload, objectKey);

  expect(publicId).toEqual(expect.any(String));

  return publicId ?? "";
}

function readFirstPaperQuestionPublicId(
  paper: Record<string, unknown>,
): string | null {
  const paperSections = Array.isArray(paper.paperSections)
    ? paper.paperSections
    : [];

  for (const paperSection of paperSections) {
    if (
      !isRecord(paperSection) ||
      !Array.isArray(paperSection.paperQuestions)
    ) {
      continue;
    }

    const [paperQuestion] = paperSection.paperQuestions.filter(isRecord);
    const paperQuestionPublicId = paperQuestion?.publicId;

    if (typeof paperQuestionPublicId === "string") {
      return paperQuestionPublicId;
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
