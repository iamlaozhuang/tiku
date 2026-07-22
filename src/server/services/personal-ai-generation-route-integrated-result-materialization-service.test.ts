import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";
import {
  materializeRouteIntegratedRedactedResult,
  type PersonalAiGenerationRouteIntegratedResultMaterializationControl,
} from "./personal-ai-generation-route-integrated-result-materialization-service";
import type { PersonalAiGenerationRequestFlowDto } from "../contracts/personal-ai-generation-request-flow-contract";
import { createPersonalAiGenerationPrivateQuestionDraftSnapshot } from "../validators/personal-ai-generation-result-persistence";

function createPrivateQuestionDraftSnapshot() {
  const snapshot = createPersonalAiGenerationPrivateQuestionDraftSnapshot({
    taskPublicId: "ai_generation_task_public_materialization_121",
    ownerPublicId: "student_public_materialization_121",
    requestedQuestionCount: 1,
    questions: [
      {
        draftPublicId: "ai_question_draft_materialization_1",
        draftNumber: 1,
        questionType: "short_answer",
        difficulty: "medium",
        knowledgeNodeCount: 1,
        knowledgeNodeLabels: ["测试知识点"],
        questionStem: "测试题干",
        questionOptions: [],
        standardAnswer: "测试答案",
        analysis: "测试解析",
        scoringPoints: [{ description: "要点", score: "1", sortOrder: 1 }],
        fillBlankAnswers: [],
        reviewStatus: "draft_review_required",
      },
    ],
  });

  if (snapshot === null) {
    throw new Error("test snapshot must be valid");
  }

  return snapshot;
}

function createRequestFlow(): PersonalAiGenerationRequestFlowDto {
  const requestFlowResponse = buildPersonalAiGenerationRequestFlowReadModel({
    userPublicId: "student_public_materialization_121",
    authorizationPublicId: "personal_auth_public_materialization_121",
    aiFuncType: "explanation",
    questionPublicId: "question_public_materialization_121",
    answerRecordPublicId: "answer_record_public_materialization_121",
    paperPublicId: "paper_public_materialization_121",
    mockExamPublicId: null,
    redeemCodePublicId: null,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
    taskPublicId: "ai_generation_task_public_materialization_121",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_materialization_121",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student_public_materialization_121",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student_public_materialization_121",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:personal_generation_materialization_121",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  });

  expect(requestFlowResponse.code).toBe(0);
  expect(requestFlowResponse.data).not.toBeNull();

  return requestFlowResponse.data as PersonalAiGenerationRequestFlowDto;
}

function createControl(
  overrides: Partial<PersonalAiGenerationRouteIntegratedResultMaterializationControl> = {},
): PersonalAiGenerationRouteIntegratedResultMaterializationControl {
  return {
    materializationMode: "fake_sanitized_in_memory_output",
    resultPublicId: "ai_generation_result_public_materialization_121",
    contentDigest: "sha256:materialization_digest_121",
    contentPreviewMasked: "masked materialized preview",
    privateQuestionDraftSnapshot: createPrivateQuestionDraftSnapshot(),
    evidenceStatus: "none",
    citationCount: 0,
    aiCallLogPublicId: "ai-call-log-materialization-121",
    now: () => new Date("2026-06-19T00:00:00.000Z"),
    persistDraftResult: async () => ({
      code: 0,
      message: "ok",
      data: {
        persistenceStatus: "created",
        result: {
          resultPublicId: "ai_generation_result_public_materialization_121",
          taskPublicId: "ai_generation_task_public_materialization_121",
          requestPublicId: "personal_ai_request_public_materialization_121",
          taskType: "ai_question_generation",
          status: "draft",
          persistedAt: "2026-06-19T00:00:00.000Z",
          contentReference: {
            contentDigest: "sha256:materialization_digest_121",
            contentPreviewMasked: "masked materialized preview",
            contentVisibility: "redacted_snapshot",
            redactionStatus: "redacted",
          },
          evidenceReference: {
            evidenceStatus: "none",
            citationCount: 0,
            aiCallLogPublicId: null,
            redactionStatus: "redacted",
          },
          formalAdoption: {
            isBlocked: true,
            status: "blocked",
          },
          paperAssembly: null,
        },
      },
    }),
    ...overrides,
  };
}

describe("personal AI route-integrated result materialization service", () => {
  it("persists only redacted snapshot, digest, and masked preview inputs", async () => {
    const persistedInputs: unknown[] = [];

    const summary = await materializeRouteIntegratedRedactedResult(
      createRequestFlow(),
      createControl({
        persistDraftResult: async (input) => {
          persistedInputs.push(input);

          return createControl().persistDraftResult(input);
        },
      }),
    );

    expect(summary).toEqual({
      materializationStatus: "created",
      failureCategory: null,
      resultPublicId: "ai_generation_result_public_materialization_121",
      contentDigest: "sha256:materialization_digest_121",
      contentPreviewMasked: "masked materialized preview",
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
      evidenceStatus: "none",
      citationCount: 0,
      formalAdoptionStatus: "blocked",
    });
    expect(persistedInputs).toEqual([
      expect.objectContaining({
        resultPublicId: "ai_generation_result_public_materialization_121",
        taskPublicId: "ai_generation_task_public_materialization_121",
        ownerPublicId: "student_public_materialization_121",
        actorPublicId: "student_public_materialization_121",
        taskType: "ai_question_generation",
        contentDigest: "sha256:materialization_digest_121",
        contentPreviewMasked: "masked materialized preview",
        citationRedactedSnapshot: {
          redactionStatus: "redacted",
          citationCount: 0,
          citations: [],
        },
        evidenceStatus: "none",
        citationCount: 0,
        aiCallLogPublicId: "ai-call-log-materialization-121",
        createdAt: new Date("2026-06-19T00:00:00.000Z"),
      }),
    ]);
    expect(JSON.stringify(persistedInputs)).toContain(
      '"providerOutputIncluded":false',
    );
  });

  it("blocks materialization before persistence when redaction guard finds a forbidden token", async () => {
    const persistedInputs: unknown[] = [];
    const forbiddenPreview = ["raw", "Prompt"].join("");

    const summary = await materializeRouteIntegratedRedactedResult(
      createRequestFlow(),
      createControl({
        contentPreviewMasked: forbiddenPreview,
        persistDraftResult: async (input) => {
          persistedInputs.push(input);

          return createControl().persistDraftResult(input);
        },
      }),
    );

    expect(summary).toMatchObject({
      materializationStatus: "blocked",
      failureCategory: "redaction_violation",
      contentVisibility: "redacted_snapshot",
      redactionStatus: "redacted",
      formalAdoptionStatus: "blocked",
    });
    expect(persistedInputs).toEqual([]);
  });
});
