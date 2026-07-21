import { describe, expect, it } from "vitest";

import {
  createAdminAiAuditLogListQuery,
  type AiCallLogCostSummaryDto,
  type AiCallLogListDto,
  type ModelConfigListDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type { AdminAiAuditLogRuntimeRepositories } from "@/server/repositories/admin-ai-audit-log-runtime-repository";
import type {
  MistakeBookAuthorizationScopeRow,
  MistakeBookRepository,
  MistakeBookRow,
} from "@/server/repositories/mistake-book-repository";
import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";
import { createStudentMistakeBookRuntimeRouteHandlers } from "@/server/services/student-mistake-book-runtime";
import { createPersistedModelConfigRuntimeCatalog } from "@/server/services/model-config-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = "2026-05-24T09:30:00.000Z";

function createSessionService(): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-24T12:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Ops Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["super_admin", "ops_admin"],
          },
        },
      };
    },
  };
}

function createStudentSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer student-session-token") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-24T12:00:00.000Z" },
          user: {
            publicId: "student-user-public-001",
            phone: "13900000001",
            name: "Student User",
            userType: "personal",
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: null,
            adminRoles: [],
          },
        },
      };
    },
  };
}

function createMistakeBookRow(): MistakeBookRow {
  return {
    id: 1001,
    public_id: "mistake-book-public-rag",
    question_public_id: "question-public-rag",
    paper_question_public_id: "paper-question-public-rag",
    profession: "marketing",
    level: 3,
    subject: "theory",
    question_snapshot: {
      profession: "marketing",
      level: 3,
      stemRichText: "marketing citation keyword question text",
      standardAnswerRichText: "marketing citation keyword standard answer",
      analysisRichText: "marketing citation keyword analysis",
      questionType: "single_choice",
    },
    latest_answer_snapshot: {
      selectedLabels: ["B"],
      textAnswer: null,
      savedFromClientAt: "2026-05-24T09:00:00.000Z",
    },
    mistake_book_source: "wrong_answer",
    mistake_book_status: "unmastered",
    wrong_count: 1,
    is_favorite: false,
    is_removed: false,
    mastered_at: null,
    latest_wrong_at: new Date(now),
    created_at: new Date(now),
    updated_at: new Date(now),
  };
}

function createMistakeBookRepository(): MistakeBookRepository {
  return {
    async listEffectiveAuthorizationScopes(): Promise<
      MistakeBookAuthorizationScopeRow[]
    > {
      return [
        {
          profession: "marketing",
          level: 3,
          authorization_types: ["personal_auth"],
          expires_at: new Date("2026-06-24T09:00:00.000Z"),
        },
      ];
    },
    async listMistakeBooks() {
      return { rows: [createMistakeBookRow()], total: 1 };
    },
    async findMistakeBookByPublicId() {
      return createMistakeBookRow();
    },
    async updateMistakeBookState() {
      return createMistakeBookRow();
    },
  };
}

function createRepositories(input: {
  capturedQueries: unknown[];
}): AdminAiAuditLogRuntimeRepositories {
  const aiCallLogs: AiCallLogListDto["aiCallLogs"] = [
    {
      publicId: "ai-call-log-learning-failed",
      userPublicId: "user-public-001",
      organizationPublicId: "organization-public-001",
      profession: "marketing",
      level: 3,
      aiFuncType: "learning_suggestion",
      callStatus: "failed",
      providerDisplayName: "Local Mock Provider",
      modelAlias: "mock-learning-suggestion",
      promptSummary: "redacted prompt and answer snapshot",
      outputSummary: "redacted provider error snapshot",
      promptTokenCount: 120,
      completionTokenCount: 0,
      totalTokenCount: 120,
      estimatedCostCny: "0.00",
      latencyMs: 32,
      startedAt: now,
      completedAt: now,
    },
    {
      publicId: "ai-call-log-scoring-success",
      userPublicId: "user-public-002",
      organizationPublicId: "organization-public-002",
      profession: "monopoly",
      level: 2,
      aiFuncType: "ai_scoring",
      callStatus: "success",
      providerDisplayName: "Qwen Provider",
      modelAlias: "qwen-plus",
      promptSummary: "redacted prompt and answer snapshot",
      outputSummary: "redacted scoring snapshot",
      promptTokenCount: 500,
      completionTokenCount: 100,
      totalTokenCount: 600,
      estimatedCostCny: "0.10",
      latencyMs: 88,
      startedAt: now,
      completedAt: now,
    },
  ];
  const dailySummaries: AiCallLogCostSummaryDto[] = [
    {
      bucket: "2026-05-24",
      bucketType: "day",
      aiFuncType: "learning_suggestion",
      providerDisplayName: "Local Mock Provider",
      modelAlias: "mock-learning-suggestion",
      callCount: 1,
      successCount: 0,
      failedCount: 1,
      totalTokenCount: 120,
      estimatedCostCny: "0.00",
    },
    {
      bucket: "2026-05-24",
      bucketType: "day",
      aiFuncType: "ai_scoring",
      providerDisplayName: "Qwen Provider",
      modelAlias: "qwen-plus",
      callCount: 1,
      successCount: 1,
      failedCount: 0,
      totalTokenCount: 600,
      estimatedCostCny: "0.10",
    },
  ];

  return {
    async listModelConfigs() {
      return {
        modelConfigs: [] satisfies ModelConfigListDto["modelConfigs"],
        pagination: {
          page: 1,
          pageSize: 20,
          sortBy: "updatedAt",
          sortOrder: "desc",
          total: 0,
        },
      };
    },
    async appendAiCallLog() {
      throw new Error("appendAiCallLog should not be called by list tests");
    },
    async listAiCallLogs(query) {
      input.capturedQueries.push(query);

      const filteredAiCallLogs = aiCallLogs.filter((aiCallLog) => {
        const searchableText = [
          aiCallLog.publicId,
          aiCallLog.userPublicId ?? "",
          aiCallLog.organizationPublicId ?? "",
          aiCallLog.aiFuncType,
          aiCallLog.callStatus,
          aiCallLog.providerDisplayName,
          aiCallLog.modelAlias,
          aiCallLog.promptSummary ?? "",
          aiCallLog.outputSummary ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return (
          (query.aiFuncType === "all" ||
            aiCallLog.aiFuncType === query.aiFuncType) &&
          (query.callStatus === "all" ||
            aiCallLog.callStatus === query.callStatus) &&
          (query.profession === "all" ||
            aiCallLog.profession === query.profession) &&
          (query.level === null || aiCallLog.level === query.level) &&
          (query.keyword === null ||
            searchableText.includes(query.keyword.toLowerCase()))
        );
      });

      return {
        aiCallLogs: filteredAiCallLogs,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: filteredAiCallLogs.length,
        },
      };
    },
    async summarizeAiCallLogs(query) {
      input.capturedQueries.push(query);

      return {
        dailySummaries,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: dailySummaries.length,
        },
      };
    },
  };
}

describe("phase 11 ai_call_log coverage hardening", () => {
  it("normalizes ai_call_log filters without accepting raw fields", () => {
    const query = createAdminAiAuditLogListQuery({
      aiFuncType: " learning_suggestion ",
      callStatus: "failed",
      profession: " marketing ",
      keyword: "  mock  ",
      level: 3,
    } as Parameters<typeof createAdminAiAuditLogListQuery>[0]);

    expect(query).toMatchObject({
      aiFuncType: "learning_suggestion",
      callStatus: "failed",
      profession: "marketing",
      keyword: "mock",
      level: 3,
    });
    expect(query).not.toHaveProperty("requestBody");
    expect(query).not.toHaveProperty("authorization");
    expect(query).not.toHaveProperty("providerPayload");
  });

  it("filters ai_call_logs by function, status, profession, level, and keyword", async () => {
    const capturedQueries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: createRepositories({ capturedQueries }),
      sessionService: createSessionService(),
    });

    const response = await handlers.aiCallLogs.GET(
      new Request(
        "http://localhost/api/v1/ai-call-logs?page=1&pageSize=20&keyword=mock&aiFuncType=learning_suggestion&callStatus=failed&profession=marketing&level=3",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(capturedQueries[0]).toMatchObject({
      aiFuncType: "learning_suggestion",
      callStatus: "failed",
      profession: "marketing",
      level: 3,
      keyword: "mock",
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        aiCallLogs: [
          expect.objectContaining({
            publicId: "ai-call-log-learning-failed",
            aiFuncType: "learning_suggestion",
            callStatus: "failed",
            profession: "marketing",
            level: 3,
            promptSummary: "redacted prompt and answer snapshot",
            outputSummary: "redacted provider error snapshot",
          }),
        ],
      },
      pagination: {
        total: 1,
      },
    });
    expect(payload.data.aiCallLogs).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("requestBody");
    expect(JSON.stringify(payload)).not.toContain("providerPayload");
    expect(JSON.stringify(payload)).not.toContain("rawModelResponse");
  });

  it("filters ai_call_log summaries without leaking raw provider details", async () => {
    const capturedQueries: unknown[] = [];
    const handlers = createAdminAiAuditLogRuntimeRouteHandlers({
      repositories: createRepositories({ capturedQueries }),
      sessionService: createSessionService(),
    });

    const response = await handlers.aiCallLogSummary.GET(
      new Request(
        "http://localhost/api/v1/ai-call-logs/summary?page=1&pageSize=20&keyword=mock&aiFuncType=learning_suggestion",
        { headers: { authorization: "Bearer admin-session-token" } },
      ),
    );
    const payload = await response.json();

    expect(capturedQueries[0]).toMatchObject({
      aiFuncType: "learning_suggestion",
      keyword: "mock",
    });
    expect(payload).toMatchObject({
      code: 0,
      data: {
        dailySummaries: [
          expect.objectContaining({
            aiFuncType: "learning_suggestion",
            providerDisplayName: "Local Mock Provider",
            modelAlias: "mock-learning-suggestion",
            callCount: 1,
            failedCount: 1,
          }),
        ],
      },
      pagination: {
        total: 1,
      },
    });
    expect(payload.data.dailySummaries).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("providerPayload");
    expect(JSON.stringify(payload)).not.toContain("rawModelResponse");
  });

  it("records redacted AI explanation call logs while attaching sufficient local RAG citations", async () => {
    const aiCallLogEntries: unknown[] = [];
    const handlers = createStudentMistakeBookRuntimeRouteHandlers({
      mistakeBookRepository: createMistakeBookRepository(),
      sessionService: createStudentSessionService(),
      modelConfigRuntimeCatalog: createPersistedModelConfigRuntimeCatalog({
        modelConfigs: [
          {
            publicId: "model-config-public-explanation",
            providerPublicId: "model-provider-public-governed",
            providerDisplayName: "Governed Provider",
            providerKey: "qwen",
            modelName: "qwen-plus",
            modelAlias: "qwen-plus",
            displayName: "Governed explanation",
            aiFuncType: "ai_explanation",
            apiKeyDisplay: "****3456",
            secretStatus: "configured",
            maskedSecret: "****3456",
            fallbackModelConfigPublicId: null,
            isEnabled: true,
            status: "enabled",
            fallbackPriority: 0,
            snapshotPolicy: "redacted_metadata",
            configVersion: 2,
            timeoutSecond: 60,
            maxRetryCount: 3,
            updatedAt: now,
          },
        ],
        promptTemplates: [
          {
            publicId: "prompt-template-public-explanation",
            promptTemplateKey: "ai_explanation_v1",
            aiFuncType: "ai_explanation",
            version: 2,
            title: "Explanation v2",
            description: null,
            bodyDigest: "sha256:explanation-v2",
            bodyPreviewMasked: "[redacted]",
            bodyFullText: null,
            status: "active",
            isActive: true,
            registrationSource: "runtime_registry",
            catalogGapStatus: "registered",
            canViewFullText: false,
            requiredVariables: ["question", "learnerAnswer"],
            updatedAt: now,
          },
        ],
      }),
      async explanationRunner() {
        return {
          explanationText: "Explicit governed test explanation.",
          keyPoints: ["Governed test key point"],
          learningSuggestion: "Explicit governed test suggestion.",
          providerRequestPayload: { request: "provider request marker" },
          providerResponsePayload: { response: "provider response marker" },
        };
      },
      aiCallLogRepository: {
        async appendAiCallLog(aiCallLogInput) {
          aiCallLogEntries.push(aiCallLogInput);

          return {
            publicId: "ai-call-log-public-rag",
            userPublicId: aiCallLogInput.userPublicId,
            organizationPublicId: null,
            profession: null,
            level: null,
            aiFuncType: aiCallLogInput.aiFuncType,
            callStatus: aiCallLogInput.callStatus,
            providerDisplayName:
              aiCallLogInput.modelConfigSnapshot.providerDisplayName,
            modelAlias: aiCallLogInput.modelConfigSnapshot.modelName,
            promptSummary: "redacted prompt snapshot",
            outputSummary: "redacted model output snapshot",
            promptTokenCount: aiCallLogInput.promptTokenCount,
            completionTokenCount: aiCallLogInput.completionTokenCount,
            totalTokenCount: aiCallLogInput.totalTokenCount,
            estimatedCostCny: "0.00",
            latencyMs: aiCallLogInput.latencyMs,
            startedAt: aiCallLogInput.startedAt.toISOString(),
            completedAt: aiCallLogInput.completedAt?.toISOString() ?? null,
          };
        },
      },
      ragRetrievalRuntime: {
        async retrieveForAiExplanation() {
          return {
            evidenceStatus: "sufficient",
            citations: [
              {
                chunkPublicId: "chunk-public-001",
                generationPublicId: "resource-index-generation-public-001",
                resourcePublicId: "resource-public-001",
                resourceTitle: "Local Citation Resource",
                headingPath: ["Marketing Citation"],
                chunkIndex: 1,
                chunkText: "raw local chunk text must stay out of evidence",
                textHash: "chunk-text-hash-001",
                score: 1,
              },
              {
                chunkPublicId: "chunk-public-002",
                generationPublicId: "resource-index-generation-public-001",
                resourcePublicId: "resource-public-001",
                resourceTitle: "Local Citation Resource",
                headingPath: ["Retail Rule"],
                chunkIndex: 2,
                chunkText: "second raw local chunk text must stay internal",
                textHash: "chunk-text-hash-002",
                score: 1,
              },
            ],
            evidenceSummary: {
              evidenceStatus: "sufficient",
              citationCount: 2,
              resourcePublicIds: ["resource-public-001"],
              chunkPublicIds: ["chunk-public-001", "chunk-public-002"],
              generationPublicIds: ["resource-index-generation-public-001"],
              chunkIndexes: [1, 2],
              textHashes: ["chunk-text-hash-001", "chunk-text-hash-002"],
              queryHash: "redacted-query-hash",
              maxScore: 1,
              retrievalMode: "fusion_sort",
            },
          };
        },
      },
    });

    const response = await handlers.aiExplanation.POST(
      new Request(
        "http://localhost/api/v1/mistake-books/mistake-book-public-rag/ai-explanation",
        {
          method: "POST",
          headers: { authorization: "Bearer student-session-token" },
        },
      ),
      {
        params: Promise.resolve({ publicId: "mistake-book-public-rag" }),
      },
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        aiExplanation: {
          evidenceStatus: "sufficient",
          citations: expect.arrayContaining([
            expect.objectContaining({
              resourcePublicId: "resource-public-001",
              resourceTitle: "Local Citation Resource",
            }),
          ]),
          insufficientEvidenceMessage: null,
        },
      },
    });
    expect(aiCallLogEntries).toHaveLength(1);
    expect(JSON.stringify(aiCallLogEntries)).not.toContain(
      "student-session-token",
    );
    expect(JSON.stringify(aiCallLogEntries)).not.toContain(
      "raw local chunk text",
    );
    expect(JSON.stringify(aiCallLogEntries)).not.toContain(
      "marketing citation keyword standard answer",
    );
  });
});
