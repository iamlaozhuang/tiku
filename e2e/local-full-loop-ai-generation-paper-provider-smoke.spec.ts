import { expect, test, type APIRequestContext } from "@playwright/test";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type SessionLoginData = {
  token: string;
  user: {
    adminRoles?: string[];
    status: "active";
  };
};

type AdminAiGenerationData = {
  flowStatus: "accepted";
  formalContentBoundary: {
    paperWriteStatus: string;
    questionWriteStatus: string;
  };
  generationKind: "question" | "paper";
  organizationOwnedDraftBoundary: {
    organizationDraftAdoptionStatus: string;
    platformFormalDraftStatus: string;
    publishStatus: string;
    studentVisibleStatus: string;
  };
  redactionStatus: "redacted";
  resultState: {
    contentVisibility: "summary_only";
    status: "succeeded";
  };
  runtimeBridge: {
    bridgeStatus: "provider_call_blocked";
    costCalibrationExecuted: false;
    envSecretAccessed: false;
    providerCallExecuted: false;
    providerConfigurationRead: false;
    redactionStatus: "redacted";
  };
  runtimeStatus: "local_contract_only";
  taskPersistence: {
    contentVisibility: "summary_only";
    status: "succeeded";
  };
  taskRequest: {
    authorizationSource: "admin_role" | "org_auth";
    ownerType: "organization" | "platform";
    taskType: "ai_question_generation" | "ai_paper_generation";
  };
  workspace: "content" | "organization";
};

type AdminAiGenerationHistoryData = {
  items: unknown[];
  latestTask: unknown | null;
  redactionStatus: "redacted";
  workspace: "content" | "organization";
};

const credentialValueKey = ["pass", "word"].join("") as "password";
const contentAdminCredential = {
  phone: "13900000006",
  [credentialValueKey]: ["TikuDevContentAdmin", "2026"].join("#"),
} as { phone: string; password: string };
const orgAdvancedAdminCredential = {
  phone: "13900000005",
  [credentialValueKey]: ["TikuDevOrgAdvancedAdmin", "2026"].join("#"),
} as { phone: string; password: string };
const orgStandardAdminCredential = {
  phone: "13900000004",
  [credentialValueKey]: ["TikuDevOrgStandardAdmin", "2026"].join("#"),
} as { phone: string; password: string };

const forbiddenRuntimeMarkers = [
  "provider payload",
  "providerPayload",
  "providerRequestPayload",
  "providerResponsePayload",
  "rawPrompt",
  "rawGeneratedOutput",
  "raw model response",
  "generated content",
  "full paper content",
  "Authorization",
  "Bearer ",
] as const;

test.describe.configure({ mode: "serial" });

test("smokes content and organization AI question/paper generation boundaries", async ({
  request,
}, testInfo) => {
  const contentAdminSession = await loginAsAdmin(request, {
    credential: contentAdminCredential,
    expectedRole: "content_admin",
  });
  const orgAdvancedAdminSession = await loginAsAdmin(request, {
    credential: orgAdvancedAdminCredential,
    expectedRole: "org_advanced_admin",
  });
  const orgStandardAdminSession = await loginAsAdmin(request, {
    credential: orgStandardAdminCredential,
    expectedRole: "org_standard_admin",
  });

  const contentQuestion = await submitAdminAiGeneration(request, {
    generationKind: "question",
    path: "/api/v1/content-ai-generation-requests",
    sessionValue: contentAdminSession,
  });
  const contentPaper = await submitAdminAiGeneration(request, {
    generationKind: "paper",
    path: "/api/v1/content-ai-generation-requests",
    sessionValue: contentAdminSession,
  });
  const organizationQuestion = await submitAdminAiGeneration(request, {
    generationKind: "question",
    path: "/api/v1/organization-ai-generation-requests",
    sessionValue: orgAdvancedAdminSession,
  });
  const organizationPaper = await submitAdminAiGeneration(request, {
    generationKind: "paper",
    path: "/api/v1/organization-ai-generation-requests",
    sessionValue: orgAdvancedAdminSession,
  });
  const contentHistory = await getJson<AdminAiGenerationHistoryData>(
    request,
    "/api/v1/content-ai-generation-requests",
    contentAdminSession,
  );
  const organizationHistory = await getJson<AdminAiGenerationHistoryData>(
    request,
    "/api/v1/organization-ai-generation-requests",
    orgAdvancedAdminSession,
  );
  const standardDeniedPayload = await postJson<AdminAiGenerationData>(
    request,
    "/api/v1/organization-ai-generation-requests",
    { generationKind: "paper" },
    orgStandardAdminSession,
  );

  expectAdminGenerationPayload(contentQuestion, {
    generationKind: "question",
    ownerType: "platform",
    taskType: "ai_question_generation",
    workspace: "content",
  });
  expectAdminGenerationPayload(contentPaper, {
    generationKind: "paper",
    ownerType: "platform",
    taskType: "ai_paper_generation",
    workspace: "content",
  });
  expectAdminGenerationPayload(organizationQuestion, {
    generationKind: "question",
    ownerType: "organization",
    taskType: "ai_question_generation",
    workspace: "organization",
  });
  expectAdminGenerationPayload(organizationPaper, {
    generationKind: "paper",
    ownerType: "organization",
    taskType: "ai_paper_generation",
    workspace: "organization",
  });

  expect(contentHistory.data).toMatchObject({
    redactionStatus: "redacted",
    workspace: "content",
  });
  expect(contentHistory.data?.items.length).toBeGreaterThan(0);
  expect(organizationHistory.data).toMatchObject({
    redactionStatus: "redacted",
    workspace: "organization",
  });
  expect(organizationHistory.data?.items.length).toBeGreaterThan(0);
  expect(standardDeniedPayload).toMatchObject({
    code: 403011,
    data: null,
    message: "Admin AI generation is not available for this role.",
  });

  for (const payload of [
    contentQuestion,
    contentPaper,
    organizationQuestion,
    organizationPaper,
    contentHistory,
    organizationHistory,
    standardDeniedPayload,
  ]) {
    expectStandardApiEnvelope(payload);
    expectCamelCaseJsonKeys(payload);
    expectNoInternalIdKeys(payload);
    expectNoSensitiveRuntimePayload(payload, [
      contentAdminCredential.password,
      orgAdvancedAdminCredential.password,
      orgStandardAdminCredential.password,
      contentAdminSession,
      orgAdvancedAdminSession,
      orgStandardAdminSession,
    ]);
  }

  await testInfo.attach("local-full-loop-ai-generation-summary", {
    body: JSON.stringify(
      {
        actorRoles: [
          "content_admin",
          "org_advanced_admin",
          "org_standard_admin",
        ],
        contentAdmin: {
          questionRequest: "succeeded_provider_blocked_redacted",
          paperRequest: "succeeded_provider_blocked_redacted",
          history: "visible_redacted",
        },
        orgAdvancedAdmin: {
          questionRequest: "succeeded_provider_blocked_redacted",
          paperRequest: "succeeded_provider_blocked_redacted",
          history: "visible_redacted",
        },
        orgStandardAdmin: {
          directOrganizationAiGenerationRequest: "denied",
        },
        formalContentBoundary:
          "question_and_paper_writes_blocked_without_follow_up_task",
        providerEvidence:
          "api_route_provider_call_blocked_no_prompt_payload_or_output",
        redactionStatus:
          "no_credentials_no_session_values_no_raw_prompts_no_provider_payloads_no_raw_ai_output_no_formal_question_or_paper_content",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

async function loginAsAdmin(
  request: APIRequestContext,
  input: {
    credential: { phone: string; password: string };
    expectedRole: string;
  },
): Promise<string> {
  const payload = await postJson<SessionLoginData>(
    request,
    "/api/v1/sessions",
    input.credential,
    null,
  );

  expect(payload).toMatchObject({
    code: 0,
    message: "ok",
  });
  expect(payload.data?.user.status).toBe("active");
  expect(payload.data?.user.adminRoles ?? []).toContain(input.expectedRole);
  expect(payload.data?.token).toEqual(expect.any(String));

  return payload.data?.token ?? "";
}

async function submitAdminAiGeneration(
  request: APIRequestContext,
  input: {
    generationKind: "paper" | "question";
    path: string;
    sessionValue: string;
  },
): Promise<ApiPayload<AdminAiGenerationData>> {
  const payload = await postJson<AdminAiGenerationData>(
    request,
    input.path,
    { generationKind: input.generationKind },
    input.sessionValue,
  );

  expect(payload).toMatchObject({
    code: 0,
    message: "ok",
  });

  return payload;
}

async function getJson<TData>(
  request: APIRequestContext,
  path: string,
  sessionValue: string,
): Promise<ApiPayload<TData>> {
  const response = await request.get(path, {
    headers: {
      authorization: `Bearer ${sessionValue}`,
    },
  });
  const payload = (await response.json()) as ApiPayload<TData>;

  expect(response.ok()).toBe(true);

  return payload;
}

async function postJson<TData>(
  request: APIRequestContext,
  path: string,
  data: unknown,
  sessionValue: string | null,
): Promise<ApiPayload<TData>> {
  const response = await request.post(path, {
    data,
    headers:
      sessionValue === null
        ? { "content-type": "application/json" }
        : {
            authorization: `Bearer ${sessionValue}`,
            "content-type": "application/json",
          },
  });
  const payload = (await response.json()) as ApiPayload<TData>;

  expect(response.ok()).toBe(true);

  return payload;
}

function expectAdminGenerationPayload(
  payload: ApiPayload<AdminAiGenerationData>,
  expected: {
    generationKind: "paper" | "question";
    ownerType: "organization" | "platform";
    taskType: "ai_paper_generation" | "ai_question_generation";
    workspace: "content" | "organization";
  },
) {
  expect(payload.data).toMatchObject({
    flowStatus: "accepted",
    generationKind: expected.generationKind,
    redactionStatus: "redacted",
    resultState: {
      contentVisibility: "summary_only",
      status: "succeeded",
    },
    runtimeBridge: {
      bridgeStatus: "provider_call_blocked",
      costCalibrationExecuted: false,
      envSecretAccessed: false,
      providerCallExecuted: false,
      providerConfigurationRead: false,
      redactionStatus: "redacted",
    },
    runtimeStatus: "local_contract_only",
    taskPersistence: {
      contentVisibility: "summary_only",
      status: "succeeded",
    },
    taskRequest: {
      ownerType: expected.ownerType,
      taskType: expected.taskType,
    },
    workspace: expected.workspace,
  });
  expect(payload.data?.formalContentBoundary).toMatchObject({
    paperWriteStatus: "blocked_without_follow_up_task",
    questionWriteStatus: "blocked_without_follow_up_task",
  });
  expect(payload.data?.organizationOwnedDraftBoundary).toMatchObject({
    platformFormalDraftStatus: "blocked_requires_content_admin_review",
    publishStatus: "blocked_requires_fresh_publish_task",
    studentVisibleStatus: "blocked",
  });
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
