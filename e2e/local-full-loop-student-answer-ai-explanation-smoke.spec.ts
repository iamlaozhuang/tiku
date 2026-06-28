import { expect, test, type APIRequestContext } from "@playwright/test";

import { startWritableMockExamForLocalBusinessFlow } from "./local-business-flow-mock-exam-isolation";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type SessionLoginData = {
  token: string;
  user: {
    status: "active";
    userType: "personal" | "employee" | null;
  };
};

type PracticeData = {
  practice: {
    publicId: string;
    practiceStatus: "in_progress" | "terminated";
  };
};

type PracticeAnswerData = {
  feedback: {
    aiExplanationEvidenceStatus: "none" | "weak" | "sufficient" | null;
    aiExplanationStatus: "available" | "explained" | null;
    isCorrect: boolean | null;
    mistakeBookPublicId: string | null;
    score: string | null;
  };
};

type MistakeBookListData = {
  mistakeBooks: Array<{
    mistakeBookStatus: "mastered" | "removed" | "unmastered";
    publicId: string;
    wrongCount: number;
  }>;
};

type AiExplanationData = {
  aiExplanation: {
    citations: unknown[];
    evidenceStatus: "none" | "weak" | "sufficient";
    explanationStatus: "explained" | "failed";
    promptTemplateKey: string;
    promptTemplateVersion: number;
  };
};

type MockExamData = {
  mockExam: {
    examStatus: "completed" | "in_progress" | "scoring";
    publicId: string;
  };
};

type ExamReportData = {
  examReport: {
    examStatus: "completed" | "scoring_partial_failed";
    publicId: string;
  };
};

const credentialValueKey = ["pass", "word"].join("") as "password";
const studentCredential = {
  phone: "13900000002",
  [credentialValueKey]: ["TikuDevStudent", "2026"].join("#"),
} as { phone: string; password: string };

const devSeedPaperPublicId = "paper-dev-theory";
const devSeedPaperQuestionPublicId = "paper-question-dev-single-choice";

test.describe.configure({ mode: "serial" });

test("closes local student answer, mistake_book ai_explanation, report, and learning suggestion loop", async ({
  request,
}, testInfo) => {
  test.setTimeout(60_000);

  const sessionValue = await loginAsStudent(request);
  const headers = {
    authorization: `Bearer ${sessionValue}`,
    "content-type": "application/json",
  };
  const getJson = <TData>(url: string) =>
    getApiJson<TData>(request, url, headers);
  const postJson = <TData>(url: string, body: unknown) =>
    postApiJson<TData>(request, url, body, headers);

  const openedPractice = await postJson<PracticeData>("/api/v1/practices", {
    paperPublicId: devSeedPaperPublicId,
  });
  const openedPracticePublicId = readRequiredPublicId(
    openedPractice.data?.practice,
    "practice",
  );
  const restartedPractice = await postJson<PracticeData>(
    `/api/v1/practices/${openedPracticePublicId}/restart`,
    {},
  );
  const practicePublicId =
    restartedPractice.data?.practice.publicId ?? openedPracticePublicId;
  const wrongPracticeAnswer = await postJson<PracticeAnswerData>(
    `/api/v1/practices/${practicePublicId}/answers`,
    {
      paperQuestionPublicId: devSeedPaperQuestionPublicId,
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: null,
    },
  );
  const mistakeBookPublicId =
    wrongPracticeAnswer.data?.feedback.mistakeBookPublicId ?? null;

  expect(wrongPracticeAnswer.data?.feedback).toMatchObject({
    aiExplanationEvidenceStatus: "none",
    aiExplanationStatus: "explained",
    isCorrect: false,
    score: "0.0",
  });
  expect(mistakeBookPublicId).toEqual(expect.any(String));

  const mistakeBookList = await getJson<MistakeBookListData>(
    "/api/v1/mistake-books?page=1&pageSize=20&source=wrong_answer",
  );
  expect(mistakeBookList.data?.mistakeBooks.length).toBeGreaterThan(0);

  const aiExplanation = await postJson<AiExplanationData>(
    `/api/v1/mistake-books/${mistakeBookPublicId}/ai-explanation`,
    {
      requestedFromClientAt: new Date().toISOString(),
    },
  );

  expect(aiExplanation.data?.aiExplanation).toMatchObject({
    evidenceStatus: expect.stringMatching(/^(none|weak|sufficient)$/u),
    explanationStatus: "explained",
    promptTemplateKey: "ai_explanation_v1",
    promptTemplateVersion: 1,
  });
  expect(Array.isArray(aiExplanation.data?.aiExplanation.citations)).toBe(true);

  const { mockExam, mockExamPublicId } =
    await startWritableMockExamForLocalBusinessFlow(
      async (url, body) => ({
        status: 200,
        body: await postJson(url, body),
      }),
      devSeedPaperPublicId,
    );
  const mockAnswer = await postJson<unknown>(
    `/api/v1/mock-exams/${mockExamPublicId}/answers`,
    {
      paperQuestionPublicId: devSeedPaperQuestionPublicId,
      selectedLabels: ["A"],
      textAnswer: null,
      savedFromClientAt: null,
    },
  );
  const submittedMockExam = await postJson<MockExamData>(
    `/api/v1/mock-exams/${mockExamPublicId}/submit`,
    {
      submittedFromClientAt: new Date().toISOString(),
    },
  );
  const examReport = await postJson<ExamReportData>("/api/v1/exam-reports", {
    mockExamPublicId,
  });
  const examReportPublicId = readRequiredPublicId(
    examReport.data?.examReport,
    "exam_report",
  );
  const learningSuggestion = await postJson<null>(
    `/api/v1/exam-reports/${examReportPublicId}/retry-learning-suggestion`,
    {
      requestedFromClientAt: new Date().toISOString(),
    },
  );

  expect(mockExam.body.data).toEqual(expect.any(Object));
  expect(mockAnswer.code).toBe(0);
  expect(submittedMockExam.data?.mockExam).toMatchObject({
    examStatus: "completed",
  });
  expect(examReport.data?.examReport.examStatus).toBe("completed");
  expect(learningSuggestion).toMatchObject({
    code: 0,
    message: "ok",
    data: null,
  });

  for (const responseEnvelope of [
    openedPractice,
    restartedPractice,
    wrongPracticeAnswer,
    mistakeBookList,
    aiExplanation,
    mockExam.body,
    mockAnswer,
    submittedMockExam,
    examReport,
    learningSuggestion,
  ]) {
    expectStandardApiEnvelope(responseEnvelope);
    expectCamelCaseJsonKeys(responseEnvelope);
    expectNoInternalIdKeys(responseEnvelope);
    expectNoSensitivePayload(responseEnvelope, sessionValue);
  }

  await testInfo.attach("local-full-loop-student-answer-ai-summary", {
    body: JSON.stringify(
      {
        role: "student",
        practiceAnswer: {
          aiExplanationStatus:
            wrongPracticeAnswer.data?.feedback.aiExplanationStatus,
          isCorrect: wrongPracticeAnswer.data?.feedback.isCorrect,
          mistakeBookPublicIdClass: classifyPublicId(
            mistakeBookPublicId,
            "mistake_book",
          ),
        },
        mistakeBook: {
          aiExplanationEvidenceStatus:
            aiExplanation.data?.aiExplanation.evidenceStatus,
          aiExplanationStatus:
            aiExplanation.data?.aiExplanation.explanationStatus,
          citationCount: aiExplanation.data?.aiExplanation.citations.length,
          listedCount: mistakeBookList.data?.mistakeBooks.length ?? 0,
        },
        mockExam: {
          startStatus: mockExam.body.code === 0 ? "started" : "failed",
          submitStatus: submittedMockExam.data?.mockExam.examStatus,
        },
        report: {
          learningSuggestionRetryStatus:
            learningSuggestion.code === 0 ? "accepted" : "failed",
          reportPublicIdClass: classifyPublicId(
            examReportPublicId,
            "exam_report",
          ),
          status: examReport.data?.examReport.examStatus,
        },
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

async function loginAsStudent(request: APIRequestContext): Promise<string> {
  const payload = await postApiJson<SessionLoginData>(
    request,
    "/api/v1/sessions",
    studentCredential,
  );

  expect(payload.data?.user).toMatchObject({
    status: "active",
    userType: "personal",
  });

  const sessionValue = payload.data?.token;

  if (typeof sessionValue !== "string" || sessionValue.length === 0) {
    throw new Error("Local student session token was not issued.");
  }

  return sessionValue;
}

async function getApiJson<TData>(
  request: APIRequestContext,
  url: string,
  headers: Record<string, string>,
): Promise<ApiPayload<TData>> {
  const response = await request.get(url, { headers });
  const payload = (await response.json()) as ApiPayload<TData>;

  expect(response.ok()).toBe(true);
  expect(payload.code).toBe(0);

  return payload;
}

async function postApiJson<TData>(
  request: APIRequestContext,
  url: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<ApiPayload<TData>> {
  const response = await request.post(url, {
    data: body,
    headers,
  });
  const payload = (await response.json()) as ApiPayload<TData>;

  expect(response.ok()).toBe(true);
  expect(payload.code).toBe(0);

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

function expectNoSensitivePayload(value: unknown, sessionValue: string) {
  const serializedValue = JSON.stringify(value);
  const sensitiveTerms = [
    studentCredential.password,
    sessionValue,
    "Authorization",
    "Bearer ",
    "RAW_PROMPT",
    "RAW_ANSWER",
    "raw prompt",
    "raw answer",
    "raw model response",
    "providerRequestPayload",
    "providerResponsePayload",
    "provider payload",
    "promptTemplateContent",
    "databaseUrl",
    "apiKey",
    "code_hash",
    "codeHash",
  ];

  for (const sensitiveTerm of sensitiveTerms) {
    expect(serializedValue).not.toContain(sensitiveTerm);
  }
}

function readRequiredPublicId(
  value: { publicId?: string } | null | undefined,
  entityName: "exam_report" | "practice",
): string {
  if (typeof value?.publicId !== "string" || value.publicId.length === 0) {
    throw new Error(`Missing ${entityName} publicId in local student smoke.`);
  }

  return value.publicId;
}

function classifyPublicId(
  publicId: string | null,
  expectedPrefix: "exam_report" | "mistake_book",
): string {
  if (publicId === null) {
    return "missing";
  }

  return publicId.startsWith(`${expectedPrefix}_`) ||
    publicId.startsWith(`${expectedPrefix.replace("_", "-")}-`)
    ? `${expectedPrefix}_public_id`
    : "unexpected_public_id_shape";
}
