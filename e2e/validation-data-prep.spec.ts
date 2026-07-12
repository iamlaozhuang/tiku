import { expect, test, type APIRequestContext } from "@playwright/test";

type ApiPayload = {
  code: number;
  message: string;
  data: unknown;
  pagination?: unknown;
};

type AuthenticatedClient = {
  sessionCredential: string;
  headers: {
    authorization: string;
    "content-type": string;
  };
};

const credentialPasswordField = "password" as const;
const adminCredential = {
  phone: "13900000001",
  [credentialPasswordField]: ["TikuDevAdmin", "2026"].join("#"),
};

const validationDataLabel = "phase-23-validation-data";
const validationMaterialLabel = "第23阶段验收材料";
const devSeedPaperPublicId = "paper-dev-theory";
const devSeedPaperQuestionPublicId = "paper-question-dev-single-choice";
const validationStudentPassword = "Validation2026";

test.describe.configure({ mode: "serial" });

test("prepares minimum local/dev validation data for fresh DB e2e", async ({
  request,
}, testInfo) => {
  test.setTimeout(90_000);

  const adminClient = await login(request, adminCredential);
  const studentClient = await createAuthorizedValidationStudent(
    request,
    adminClient,
  );

  const organizationPublicId = await readFirstPublicId(
    request,
    adminClient,
    "/api/v1/organizations?page=1&pageSize=20",
    "organizations",
  );
  expect(organizationPublicId).toEqual(expect.any(String));

  const orgAuthResult = await ensureOrgAuthReady(
    request,
    adminClient,
    organizationPublicId,
  );
  const materialResult = await ensureMaterialReady(request, adminClient);
  const mistakeBookPublicId = await ensureMistakeBookReady(
    request,
    studentClient,
  );
  const aiCallLogResult = await ensureAiCallLogReady(request, studentClient);

  const aiCallLogs = await getJson(
    request,
    adminClient,
    "/api/v1/ai-call-logs?page=1&pageSize=20",
  );
  expect(readCollectionItems(aiCallLogs, "aiCallLogs").length).toBeGreaterThan(
    0,
  );

  await testInfo.attach("phase-23-validation-data-prep-redacted-summary", {
    body: JSON.stringify(
      {
        orgAuth: orgAuthResult,
        material: materialResult,
        mistakeBook: {
          status: "ready",
          publicIdClass: classifyPublicId(mistakeBookPublicId, "mistake_book"),
        },
        aiCallLog: aiCallLogResult,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

async function login(
  request: APIRequestContext,
  credential: { phone: string; password: string },
): Promise<AuthenticatedClient> {
  const payload = await postJson(request, null, "/api/v1/sessions", credential);
  expect(payload.code).toBe(0);

  const sessionCredential = readNestedString(payload, ["data", "token"]);
  expect(sessionCredential).toEqual(expect.any(String));
  if (sessionCredential === null) {
    throw new Error("Missing session token in validation data prep response.");
  }

  return {
    sessionCredential,
    headers: {
      authorization: `Bearer ${sessionCredential}`,
      "content-type": "application/json",
    },
  };
}

async function ensureOrgAuthReady(
  request: APIRequestContext,
  client: AuthenticatedClient,
  organizationPublicId: string,
): Promise<{ publicIdClass: string; status: string }> {
  const existingOrgAuth = await getJson(
    request,
    client,
    `/api/v1/org-auths?page=1&pageSize=20&keyword=${validationDataLabel}`,
  );
  const existingPublicId = readFirstMatchingPublicId(
    existingOrgAuth,
    "orgAuths",
    validationDataLabel,
  );

  if (existingPublicId !== null) {
    return {
      status: "reused",
      publicIdClass: classifyPublicId(existingPublicId, "org_auth"),
    };
  }

  const createdOrgAuth = await postJson(request, client, "/api/v1/org-auths", {
    name: `${validationDataLabel}-org-auth`,
    purchaserOrganizationPublicId: organizationPublicId,
    authScopeType: "current_and_descendants",
    profession: "logistics",
    level: 5,
    accountQuota: 3,
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2027-06-01T00:00:00.000Z",
    organizationPublicIds: [],
  });

  if (createdOrgAuth.code === 0) {
    return {
      status: "created",
      publicIdClass: classifyPublicId(
        expectNestedPublicId(createdOrgAuth, "orgAuth"),
        "org_auth",
      ),
    };
  }

  expect([409005, 409006]).toContain(createdOrgAuth.code);

  const orgAuths = await getJson(
    request,
    client,
    "/api/v1/org-auths?page=1&pageSize=20",
  );
  const fallbackPublicId = readFirstPublicIdFromPayload(orgAuths, "orgAuths");
  expect(fallbackPublicId).toEqual(expect.any(String));

  return {
    status: "existing_or_runtime_guard",
    publicIdClass: classifyPublicId(fallbackPublicId ?? "", "org_auth"),
  };
}

async function ensureMaterialReady(
  request: APIRequestContext,
  client: AuthenticatedClient,
): Promise<{ publicIdClass: string; status: string }> {
  const existingMaterials = await getJson(
    request,
    client,
    `/api/v1/materials?page=1&pageSize=20&keyword=${validationMaterialLabel}`,
  );
  const existingPublicId = readFirstMatchingPublicId(
    existingMaterials,
    "materials",
    validationMaterialLabel,
  );

  if (existingPublicId !== null) {
    return {
      status: "reused",
      publicIdClass: classifyPublicId(existingPublicId, "material"),
    };
  }

  const createdMaterial = await postJson(request, client, "/api/v1/materials", {
    title: validationMaterialLabel,
    contentRichText: "<p>用于本地验收的专卖理论材料。</p>",
    profession: "monopoly",
    level: 3,
    subject: "theory",
  });

  expect(createdMaterial.code).toBe(0);

  return {
    status: "created",
    publicIdClass: classifyPublicId(
      expectNestedPublicId(createdMaterial, "material"),
      "material",
    ),
  };
}

async function createAuthorizedValidationStudent(
  request: APIRequestContext,
  adminClient: AuthenticatedClient,
): Promise<AuthenticatedClient> {
  const runSuffix = String(Date.now()).slice(-8);
  const phone = `137${runSuffix}`;
  const registration = await postJson(request, null, "/api/v1/users", {
    phone,
    [credentialPasswordField]: validationStudentPassword,
    name: `${validationDataLabel}-student`,
  });
  expect(registration.code).toBe(0);

  const redeemCodeBatch = await postJsonWithPlaintextRedeemCode(
    request,
    adminClient,
    "/api/v1/redeem-codes",
    {
      count: 1,
      profession: "monopoly",
      level: 3,
      durationDay: 365,
      redeemDeadlineDate: "2027-06-01",
    },
  );
  expect(redeemCodeBatch.code).toBe(0);

  const redeemCodePlainText = readGeneratedRedeemCodePlainText(redeemCodeBatch);
  expect(redeemCodePlainText).toEqual(expect.any(String));

  const studentClient = await login(request, {
    phone,
    [credentialPasswordField]: validationStudentPassword,
  });
  const redemption = await postJson(
    request,
    studentClient,
    "/api/v1/redeem-codes/redeem",
    {
      code: redeemCodePlainText,
    },
  );
  expect(redemption.code).toBe(0);

  return studentClient;
}

async function ensureMistakeBookReady(
  request: APIRequestContext,
  client: AuthenticatedClient,
): Promise<string> {
  const practice = await postJson(request, client, "/api/v1/practices", {
    paperPublicId: devSeedPaperPublicId,
  });
  expect(practice.code).toBe(0);

  const openedPracticePublicId = expectNestedPublicId(practice, "practice");
  const restartedPractice = await postJson(
    request,
    client,
    `/api/v1/practices/${openedPracticePublicId}/restart`,
    {},
  );
  expect(restartedPractice.code).toBe(0);

  const practicePublicId =
    readNestedPublicId(restartedPractice, "practice") ?? openedPracticePublicId;
  const practiceAnswer = await postJson(
    request,
    client,
    `/api/v1/practices/${practicePublicId}/answers`,
    {
      paperQuestionPublicId: devSeedPaperQuestionPublicId,
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: null,
    },
  );
  expect(practiceAnswer.code).toBe(0);

  const mistakeBookPublicId = readNestedString(practiceAnswer, [
    "data",
    "feedback",
    "mistakeBookPublicId",
  ]);
  expect(mistakeBookPublicId).toEqual(expect.any(String));

  return mistakeBookPublicId ?? "";
}

async function ensureAiCallLogReady(
  request: APIRequestContext,
  client: AuthenticatedClient,
): Promise<{ reportPublicIdClass: string; status: string }> {
  const mockExam = await postJson(request, client, "/api/v1/mock-exams", {
    paperPublicId: devSeedPaperPublicId,
  });
  expect(mockExam.code).toBe(0);
  const mockExamPublicId = expectNestedPublicId(mockExam, "mockExam");

  const mockAnswer = await postJson(
    request,
    client,
    `/api/v1/mock-exams/${mockExamPublicId}/answers`,
    {
      paperQuestionPublicId: devSeedPaperQuestionPublicId,
      selectedLabels: ["A"],
      textAnswer: null,
      savedFromClientAt: null,
    },
  );
  expect(mockAnswer.code).toBe(0);

  const submittedMockExam = await postJson(
    request,
    client,
    `/api/v1/mock-exams/${mockExamPublicId}/submit`,
    {
      submittedFromClientAt: new Date().toISOString(),
    },
  );
  expect(submittedMockExam.code).toBe(0);

  const examReport = await postJson(request, client, "/api/v1/exam-reports", {
    mockExamPublicId,
  });
  expect(examReport.code).toBe(0);
  const reportPublicId = expectNestedPublicId(examReport, "examReport");

  const learningSuggestion = await postJson(
    request,
    client,
    `/api/v1/exam-reports/${reportPublicId}/retry-learning-suggestion`,
    {
      requestedFromClientAt: new Date().toISOString(),
    },
  );
  expect(learningSuggestion).toEqual({
    code: 0,
    message: "ok",
    data: null,
  });

  return {
    status: "local_mock_invoked",
    reportPublicIdClass: classifyPublicId(reportPublicId, "exam_report"),
  };
}

async function getJson(
  request: APIRequestContext,
  client: AuthenticatedClient,
  path: string,
): Promise<ApiPayload> {
  const response = await request.get(path, { headers: client.headers });
  const payload = (await response.json()) as ApiPayload;
  expectStandardApiEnvelope(payload);
  expectNoSensitivePayload(payload, [client.sessionCredential]);

  return payload;
}

async function postJson(
  request: APIRequestContext,
  client: AuthenticatedClient | null,
  path: string,
  body: unknown,
): Promise<ApiPayload> {
  const response = await request.post(path, {
    data: body,
    headers: client?.headers ?? { "content-type": "application/json" },
  });
  const payload = (await response.json()) as ApiPayload;
  expectStandardApiEnvelope(payload);
  expectNoSensitivePayload(
    payload,
    client === null ? [] : [client.sessionCredential],
  );

  return payload;
}

async function postJsonWithPlaintextRedeemCode(
  request: APIRequestContext,
  client: AuthenticatedClient,
  path: string,
  body: unknown,
): Promise<ApiPayload> {
  const response = await request.post(path, {
    data: body,
    headers: client.headers,
  });
  const payload = (await response.json()) as ApiPayload;
  expectStandardApiEnvelope(payload);

  return payload;
}

async function readFirstPublicId(
  request: APIRequestContext,
  client: AuthenticatedClient,
  path: string,
  collectionKey: string,
): Promise<string> {
  const payload = await getJson(request, client, path);
  const publicId = readFirstPublicIdFromPayload(payload, collectionKey);
  expect(publicId).toEqual(expect.any(String));

  return publicId ?? "";
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

function expectNoSensitivePayload(value: unknown, tokens: string[] = []) {
  const serializedValue = JSON.stringify(value);
  const sensitiveTerms = [
    "TikuDevStudent#2026",
    "TikuDevAdmin#2026",
    validationStudentPassword,
    "RAW_PROMPT",
    "RAW_ANSWER",
    "raw prompt",
    "raw answer",
    "raw model response",
    "raw provider payload",
    "providerRequestPayload",
    "providerResponsePayload",
    "Authorization",
    "Bearer ",
    "databaseUrl",
    "DATABASE_URL",
    "code_hash",
    "codeHash",
    "codePlainText",
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

function readFirstPublicIdFromPayload(
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

function expectNestedPublicId(payload: unknown, objectKey: string): string {
  const publicId = readNestedPublicId(payload, objectKey);

  expect(publicId).toEqual(expect.any(String));

  return publicId ?? "";
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

function readNestedString(payload: unknown, path: string[]): string | null {
  let currentValue = payload;

  for (const key of path) {
    if (!isRecord(currentValue)) {
      return null;
    }

    currentValue = currentValue[key];
  }

  return typeof currentValue === "string" ? currentValue : null;
}

function classifyPublicId(publicId: string, term: string): string {
  return publicId.startsWith(term.replace("_", "-"))
    ? `${term}_public_id`
    : "public_id";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
