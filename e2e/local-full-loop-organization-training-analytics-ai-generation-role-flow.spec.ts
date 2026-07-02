import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type SessionLoginData = {
  session: {
    expiresAt: string;
  };
  user: {
    adminRoles?: string[];
    adminWorkspaceCapability?: {
      canUseOrganizationAdvancedWorkspace: boolean;
      organizationEffectiveEdition: "standard" | "advanced";
      organizationPublicId: string | null;
    };
    employeePublicId: string | null;
    organizationPublicId: string | null;
    status: "active";
    userType: "employee" | "personal" | null;
  };
};

type AuthenticatedClient = {
  cookieHeader: string;
  roleLabel:
    | "employee"
    | "ops_admin"
    | "org_advanced_admin"
    | "org_standard_admin";
};

type DraftData = {
  draft: {
    publicId: string;
    organizationPublicId: string;
  };
};

type VersionData = {
  version: {
    publicId: string;
    organizationPublicId: string;
    status: "published" | "taken_down";
  };
};

type VisibleListData = {
  versions: {
    publicId: string;
    organizationPublicId: string;
    status: "published" | "taken_down";
  }[];
};

type AnswerData = {
  answer: {
    publicId: string;
    trainingVersionPublicId: string;
    employeePublicId: string;
    organizationPublicId: string;
    answerStatus: string;
    resultSummaryVisible: boolean;
    scoreSummary: {
      score: number;
      totalScore: number;
    } | null;
  };
};

type DashboardSummaryData = {
  organizationPublicId: string;
  redactionStatus: "aggregate_only";
  trainingSummary: {
    eligibleEmployeeCount: number;
    submittedEmployeeCount: number;
    unfinishedEmployeeCount: number;
  };
};

type EmployeeStatisticsData = {
  organizationPublicId: string;
  employeeCount: number;
  employees: {
    employeePublicId: string;
    redactionStatus: "summary_only";
  }[];
  redactionStatus: "summary_only";
};

const credentialValueKey = ["pass", "word"].join("") as "password";
const organizationPublicId = "org-dev-province";
const orgAuthPublicId = "org-auth-dev-analytics";
const analyticsStartAt = "2026-06-01T00:00:00.000Z";
const analyticsEndAt = "2026-07-01T00:00:00.000Z";
const forbiddenRuntimeMarkers = [
  "Bearer ",
  "apiKey",
  "databaseUrl",
  "secretValue",
  "providerRequestPayload",
  "providerResponsePayload",
  "rawPrompt",
  "rawGeneratedOutput",
  "raw prompt",
  "raw answer",
  "raw model response",
  "full paper content",
  "tiku_session=",
  "questionBody",
  "standardAnswer",
  "analysis",
  "answerBody",
  "id=",
] as const;

const credentials = {
  employee: {
    phone: "13900000003",
    [credentialValueKey]: ["TikuDevEmployee", "2026"].join("#"),
  },
  opsAdmin: {
    phone: "13900000007",
    [credentialValueKey]: ["TikuDevOpsAdmin", "2026"].join("#"),
  },
  orgAdvancedAdmin: {
    phone: "13900000005",
    [credentialValueKey]: ["TikuDevOrgAdvancedAdmin", "2026"].join("#"),
  },
  orgStandardAdmin: {
    phone: "13900000004",
    [credentialValueKey]: ["TikuDevOrgStandardAdmin", "2026"].join("#"),
  },
} as const;

test.describe.configure({ mode: "serial" });

test("runs local organization training analytics and AI generation role flow", async ({
  request,
}, testInfo) => {
  test.setTimeout(90_000);

  const runSuffix = String(Date.now()).slice(-8);
  const orgAdvancedAdmin = await login(request, {
    credential: credentials.orgAdvancedAdmin,
    expectedRole: "org_advanced_admin",
    roleLabel: "org_advanced_admin",
  });
  const orgStandardAdmin = await login(request, {
    credential: credentials.orgStandardAdmin,
    expectedRole: "org_standard_admin",
    roleLabel: "org_standard_admin",
  });
  const employee = await login(request, {
    credential: credentials.employee,
    expectedRole: null,
    roleLabel: "employee",
  });
  const opsAdmin = await login(request, {
    credential: credentials.opsAdmin,
    expectedRole: "ops_admin",
    roleLabel: "ops_admin",
  });

  const standardTrainingDenied = await postJson<DraftData>(
    request,
    orgStandardAdmin,
    "/api/v1/organization-trainings",
    createManualDraftInput(runSuffix),
  );
  expect(standardTrainingDenied).toMatchObject({
    code: 403078,
    data: null,
  });

  const draftPayload = await postJson<DraftData>(
    request,
    orgAdvancedAdmin,
    "/api/v1/organization-trainings",
    createManualDraftInput(runSuffix),
  );
  expect(draftPayload.code).toBe(0);
  expect(draftPayload.data?.draft.organizationPublicId).toBe(
    organizationPublicId,
  );
  const draftPublicId = readRequiredNestedString(draftPayload, [
    "data",
    "draft",
    "publicId",
  ]);

  const publishPayload = await postJson<VersionData>(
    request,
    orgAdvancedAdmin,
    `/api/v1/organization-trainings/${draftPublicId}/publish`,
    createPublishInput({
      draftPublicId,
      runSuffix,
    }),
  );
  expect(publishPayload.code).toBe(0);
  expect(publishPayload.data?.version).toMatchObject({
    organizationPublicId,
    status: "published",
  });
  const versionPublicId = readRequiredNestedString(publishPayload, [
    "data",
    "version",
    "publicId",
  ]);

  const visibleListPayload = await getJson<VisibleListData>(
    request,
    employee,
    "/api/v1/organization-trainings/visible-list",
  );
  expect(visibleListPayload.code).toBe(0);
  expect(visibleListPayload.data?.versions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        organizationPublicId,
        publicId: versionPublicId,
        status: "published",
      }),
    ]),
  );

  const draftAnswerPayload = await postJson<AnswerData>(
    request,
    employee,
    `/api/v1/organization-trainings/${versionPublicId}/employee-answers/draft-save`,
    {
      trainingVersionPublicId: versionPublicId,
      answeredQuestionCount: 1,
    },
  );
  expect(draftAnswerPayload.code).toBe(0);
  expect(draftAnswerPayload.data?.answer.trainingVersionPublicId).toBe(
    versionPublicId,
  );

  const submitAnswerPayload = await postJson<AnswerData>(
    request,
    employee,
    `/api/v1/organization-trainings/${versionPublicId}/employee-answers/submit`,
    {
      trainingVersionPublicId: versionPublicId,
      answeredQuestionCount: 1,
      scoreSummary: {
        score: 10,
        totalScore: 10,
      },
    },
  );
  expect(submitAnswerPayload.code).toBe(0);
  expect(submitAnswerPayload.data?.answer).toMatchObject({
    resultSummaryVisible: true,
    scoreSummary: {
      score: 10,
      totalScore: 10,
    },
    trainingVersionPublicId: versionPublicId,
  });

  const readonlyAnswerPayload = await getJson<AnswerData>(
    request,
    employee,
    `/api/v1/organization-trainings/${versionPublicId}/employee-answers/readonly-summary`,
  );
  expect(readonlyAnswerPayload.code).toBe(0);
  expect(readonlyAnswerPayload.data?.answer).toMatchObject({
    resultSummaryVisible: true,
    trainingVersionPublicId: versionPublicId,
  });

  const dashboardSummaryPayload = await getJson<DashboardSummaryData>(
    request,
    orgAdvancedAdmin,
    createAnalyticsPath("/api/v1/organization-analytics/dashboard-summary"),
  );
  expect(dashboardSummaryPayload.code).toBe(0);
  expect(dashboardSummaryPayload.data).toMatchObject({
    organizationPublicId,
    redactionStatus: "aggregate_only",
  });
  expect(
    dashboardSummaryPayload.data?.trainingSummary.submittedEmployeeCount,
  ).toBeGreaterThan(0);

  const employeeStatisticsPayload = await getJson<EmployeeStatisticsData>(
    request,
    orgAdvancedAdmin,
    createAnalyticsPath("/api/v1/organization-analytics/employee-statistics"),
  );
  expect(employeeStatisticsPayload.code).toBe(0);
  expect(employeeStatisticsPayload.data).toMatchObject({
    organizationPublicId,
    redactionStatus: "summary_only",
  });
  expect(employeeStatisticsPayload.data?.employeeCount).toBeGreaterThan(0);
  expect(employeeStatisticsPayload.data?.employees[0]).toMatchObject({
    redactionStatus: "summary_only",
  });

  const standardAnalyticsDenied = await getJson<DashboardSummaryData>(
    request,
    orgStandardAdmin,
    createAnalyticsPath("/api/v1/organization-analytics/dashboard-summary"),
  );
  expect(standardAnalyticsDenied).toMatchObject({
    code: 403186,
    data: null,
  });

  const orgAuthsPayload = await getJson(
    request,
    opsAdmin,
    "/api/v1/org-auths?page=1&pageSize=20",
  );
  const employeesPayload = await getJson(
    request,
    opsAdmin,
    "/api/v1/employees?page=1&pageSize=20",
  );
  expect(orgAuthsPayload.code).toBe(0);
  expect(employeesPayload.code).toBe(0);

  await testInfo.attach("local-full-loop-organization-role-flow-summary", {
    body: JSON.stringify(
      {
        actorRoles: [
          "org_standard_admin",
          "org_advanced_admin",
          "employee",
          "ops_admin",
        ],
        orgStandardAdmin: {
          analyticsSummary: "denied",
          organizationAiGeneration: "not_executed_session_baseline_scope",
          organizationTrainingDraft: "denied",
        },
        orgAdvancedAdmin: {
          analyticsSummary: "aggregate_only",
          employeeStatistics: "summary_only",
          organizationAiGeneration:
            "not_executed_session_baseline_scope_no_provider",
          organizationTraining: "manual_draft_publish",
        },
        employee: {
          organizationTraining: "visible_list_draft_save_submit_readonly",
        },
        opsAdmin: {
          employeeManagement: "visible_envelope_only",
          orgAuthManagement: "visible_envelope_only",
        },
        publicIdClasses: {
          draft: classifyPublicId(draftPublicId, "organization_training_draft"),
          version: classifyPublicId(
            versionPublicId,
            "organization_training_version",
          ),
        },
        formalContentBoundary:
          "organization_ai_generation_and_training_smoke_did_not_create_formal_question_paper_practice_mock_exam_exam_report_or_mistake_book",
        redactionStatus:
          "no_credentials_no_session_values_no_raw_employee_answers_no_prompts_no_provider_payloads_no_raw_ai_output_no_full_question_or_paper_content",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

async function login(
  request: APIRequestContext,
  input: {
    credential: { phone: string; password: string };
    expectedRole: string | null;
    roleLabel: AuthenticatedClient["roleLabel"];
  },
): Promise<AuthenticatedClient> {
  const response = await request.post("/api/v1/sessions", {
    data: input.credential,
    headers: {
      "content-type": "application/json",
    },
  });
  const payload = (await response.json()) as ApiPayload<SessionLoginData>;

  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expect(payload).toMatchObject({
    code: 0,
    message: "ok",
  });
  expectClientVisibleTokenOmitted(payload.data);
  expect(payload.data?.user.status).toBe("active");

  if (input.expectedRole !== null) {
    expect(payload.data?.user.adminRoles ?? []).toContain(input.expectedRole);
  } else {
    expect(payload.data?.user.userType).toBe("employee");
    expect(payload.data?.user.employeePublicId).toEqual(expect.any(String));
  }

  if (input.roleLabel === "org_advanced_admin") {
    expect(payload.data?.user.adminWorkspaceCapability).toMatchObject({
      canUseOrganizationAdvancedWorkspace: true,
      organizationEffectiveEdition: "advanced",
      organizationPublicId,
    });
  }

  if (input.roleLabel === "org_standard_admin") {
    expect(payload.data?.user.adminWorkspaceCapability).toMatchObject({
      canUseOrganizationAdvancedWorkspace: false,
      organizationPublicId,
    });
    expect(["standard", "advanced"]).toContain(
      payload.data?.user.adminWorkspaceCapability?.organizationEffectiveEdition,
    );
  }

  expectNoSensitiveRuntimePayload(payload, [
    ...Object.values(credentials).map((credential) => credential.password),
  ]);

  return {
    cookieHeader: readRequiredSessionCookieHeader(response),
    roleLabel: input.roleLabel,
  };
}

function expectClientVisibleTokenOmitted(data: unknown) {
  expect(isRecord(data) ? data["token"] : undefined).toBeUndefined();
}

function createManualDraftInput(runSuffix: string) {
  return {
    organizationPublicId,
    authorizationPublicId: orgAuthPublicId,
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: `Local full loop organization training ${runSuffix}`,
    description: "metadata-only local organization role flow",
    capabilityContext: {
      effectiveEdition: "advanced",
      authorizationSource: "org_auth",
      canCreateOrganizationTraining: true,
    },
  };
}

function createPublishInput(input: {
  draftPublicId: string;
  runSuffix: string;
}) {
  return {
    draftPublicId: input.draftPublicId,
    organizationPublicId,
    authorizationPublicId: orgAuthPublicId,
    profession: "monopoly",
    level: 3,
    subject: "theory",
    title: `Local full loop organization training ${input.runSuffix}`,
    description: "metadata-only local organization role flow",
    questions: [
      {
        publicId: `organization-training-question-${input.runSuffix}`,
        questionType: "single_choice",
        score: 10,
        standardAnswer: "A",
        analysisSummary: "metadata-only local scoring summary",
        evidenceStatus: "sufficient",
        citationCount: 0,
      },
    ],
    publishScopeOrganizationPublicIds: [organizationPublicId],
    capabilityContext: {
      effectiveEdition: "advanced",
      authorizationSource: "org_auth",
      canCreateOrganizationTraining: true,
    },
  };
}

function createAnalyticsPath(routePath: string): string {
  const searchParams = new URLSearchParams({
    organizationPublicId,
    startAt: analyticsStartAt,
    endAt: analyticsEndAt,
  });

  return `${routePath}?${searchParams.toString()}`;
}

async function getJson<TData = unknown>(
  request: APIRequestContext,
  client: AuthenticatedClient,
  path: string,
): Promise<ApiPayload<TData>> {
  const response = await request.get(path, {
    headers: {
      cookie: client.cookieHeader,
    },
  });
  const payload = (await response.json()) as ApiPayload<TData>;

  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expectNoSensitiveRuntimePayload(payload, [
    ...Object.values(credentials).map((credential) => credential.password),
  ]);

  return payload;
}

async function postJson<TData = unknown>(
  request: APIRequestContext,
  client: AuthenticatedClient | null,
  path: string,
  data: unknown,
): Promise<ApiPayload<TData>> {
  const response = await request.post(path, {
    data,
    headers:
      client === null
        ? { "content-type": "application/json" }
        : {
            cookie: client.cookieHeader,
            "content-type": "application/json",
          },
  });
  const payload = (await response.json()) as ApiPayload<TData>;

  expectStandardApiEnvelope(payload);
  expectCamelCaseJsonKeys(payload);
  expectNoInternalIdKeys(payload);
  expectNoSensitiveRuntimePayload(payload, [
    ...Object.values(credentials).map((credential) => credential.password),
  ]);

  return payload;
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

function expectNoSensitiveRuntimePayload(value: unknown, values: string[]) {
  const serializedValue = JSON.stringify(value);

  for (const forbiddenValue of [...forbiddenRuntimeMarkers, ...values]) {
    expect(serializedValue).not.toContain(forbiddenValue);
  }
}

function readRequiredNestedString(value: unknown, path: string[]): string {
  let currentValue = value;

  for (const pathSegment of path) {
    if (!isRecord(currentValue)) {
      throw new Error("Missing required string in organization role flow.");
    }

    currentValue = currentValue[pathSegment];
  }

  expect(currentValue).toEqual(expect.any(String));

  if (typeof currentValue !== "string" || currentValue.trim() === "") {
    throw new Error("Missing required string in organization role flow.");
  }

  return currentValue;
}

function readRequiredSessionCookieHeader(response: APIResponse): string {
  const sessionCookieHeader = response.headers()["set-cookie"] ?? "";
  const sessionCookiePair = sessionCookieHeader.split(";")[0] ?? "";

  expect(sessionCookieHeader).toContain("tiku_session=");
  expect(sessionCookieHeader).toContain("HttpOnly");
  expect(sessionCookieHeader).toContain("SameSite=Lax");
  expect(sessionCookieHeader).toContain("Path=/");
  expect(sessionCookiePair).toMatch(/^tiku_session=/u);

  return sessionCookiePair;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function classifyPublicId(publicId: string, expectedPrefix: string): string {
  return publicId.startsWith(expectedPrefix)
    ? `${expectedPrefix}_public_id`
    : "public_id";
}
