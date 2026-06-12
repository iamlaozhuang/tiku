import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestFlowReadModel } from "./personal-ai-generation-request-flow-service";

function createBaseInput() {
  const omittedPromptFixture = ["OMITTED", "PROMPT", "FLOW"].join("-");
  const omittedGeneratedFixture = ["OMITTED", "GENERATED", "FLOW"].join("-");
  const omittedProviderFixture = ["OMITTED", "PROVIDER", "FLOW"].join("-");
  const omittedTokenFixture = ["OMITTED", "TOKEN", "FLOW"].join("-");
  const omittedPaperFixture = ["OMITTED", "PAPER", "FLOW"].join("-");

  return {
    id: 119,
    userPublicId: "student_public_119",
    authorizationPublicId: "personal_auth_public_119",
    aiFuncType: "explanation",
    questionPublicId: "question_public_119",
    answerRecordPublicId: "answer_record_public_119",
    paperPublicId: "paper_public_119",
    mockExamPublicId: null,
    redeemCodePublicId: "redeem_code_public_119",
    auditLogPublicId: "audit_log_public_119",
    aiCallLogPublicId: "ai_call_log_public_119",
    taskPublicId: "ai_generation_task_public_119",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_119",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student_public_119",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student_public_119",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:personal_generation_flow_119",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    omittedPromptFixture,
    omittedGeneratedFixture,
    omittedProviderFixture,
    omittedTokenFixture,
    omittedPaperFixture,
  };
}

describe("personal AI generation request flow service", () => {
  it("builds a redacted accepted local personal generation request flow", () => {
    const input = createBaseInput();
    const result = buildPersonalAiGenerationRequestFlowReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        flowStatus: "accepted",
        redactionStatus: "redacted",
        request: {
          userPublicId: "student_public_119",
          authorizationPublicId: "personal_auth_public_119",
          aiFuncType: "explanation",
          runtimeStatus: "local_contract_only",
          generationContext: {
            questionPublicId: "question_public_119",
            answerRecordPublicId: "answer_record_public_119",
            paperPublicId: "paper_public_119",
            mockExamPublicId: null,
            selectedContext: {
              contextType: "paper",
              contextPublicId: "paper_public_119",
            },
          },
          redeemCodeReference: {
            publicId: "redeem_code_public_119",
            redactionStatus: "redacted",
          },
          evidenceReferences: {
            auditLogPublicId: "audit_log_public_119",
            aiCallLogPublicId: "ai_call_log_public_119",
            redactionStatus: "redacted",
          },
        },
        taskRequest: {
          runtimeStatus: "local_contract_only",
          decision: "create_pending_task",
          taskPublicId: "ai_generation_task_public_119",
          taskType: "ai_question_generation",
          initialStatus: "pending",
          blockedFailureCategory: null,
          authorizationSource: "personal_auth",
          authorizationPublicId: "personal_auth_public_119",
          actorPublicId: "student_public_119",
          ownerType: "personal",
          ownerPublicId: "student_public_119",
          organizationPublicId: null,
          quotaOwnerType: "personal",
          quotaOwnerPublicId: "student_public_119",
          idempotency: {
            keyHash: "sha256:personal_generation_flow_119",
            reuseTaskPublicId: null,
          },
          resultReference: {
            resultKind: "ai_generated_question_set",
            resultPublicId: null,
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
            evidenceStatus: "none",
            citationCount: 0,
          },
          evidenceReferences: {
            auditLogPublicId: "audit_log_public_119",
            aiCallLogPublicId: "ai_call_log_public_119",
            redactionStatus: "redacted",
          },
        },
        resultReference: {
          runtimeStatus: "local_contract_only",
          taskPublicId: "ai_generation_task_public_119",
          taskType: "ai_question_generation",
          status: "pending",
          failureCategory: null,
          resultReference: {
            resultPublicId: null,
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
            evidenceStatus: "none",
            citationCount: 0,
          },
          aiCallLogReference: {
            aiCallLogPublicId: "ai_call_log_public_119",
            contentVisibility: "summary_only",
            redactionStatus: "redacted",
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.omittedPromptFixture);
    expect(serializedResult).not.toContain(input.omittedGeneratedFixture);
    expect(serializedResult).not.toContain(input.omittedProviderFixture);
    expect(serializedResult).not.toContain(input.omittedTokenFixture);
    expect(serializedResult).not.toContain(input.omittedPaperFixture);
  });

  it("maps an idempotent existing task to a reused personal flow", () => {
    expect(
      buildPersonalAiGenerationRequestFlowReadModel({
        ...createBaseInput(),
        existingTaskPublicId: "ai_generation_task_public_existing_119",
        existingTaskStatus: "running",
        resultPublicId: "ai_generated_question_set_public_119",
        evidenceStatus: "weak",
        citationCount: 2,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        flowStatus: "reused",
        taskRequest: {
          decision: "reuse_existing_task",
          taskPublicId: "ai_generation_task_public_existing_119",
        },
        resultReference: {
          taskPublicId: "ai_generation_task_public_existing_119",
          status: "running",
          resultReference: {
            resultPublicId: "ai_generated_question_set_public_119",
            evidenceStatus: "weak",
            citationCount: 2,
          },
        },
      },
    });
  });

  it("rejects non-personal generation boundaries before provider execution", () => {
    expect(
      buildPersonalAiGenerationRequestFlowReadModel({
        ...createBaseInput(),
        taskType: "organization_training_generation",
        authorizationSource: "org_auth",
      }),
    ).toEqual({
      code: 400015,
      message: "Invalid personal AI generation request flow input.",
      data: null,
    });

    expect(
      buildPersonalAiGenerationRequestFlowReadModel({
        ...createBaseInput(),
        actorPublicId: "student_public_other",
      }),
    ).toEqual({
      code: 400015,
      message: "Invalid personal AI generation request flow input.",
      data: null,
    });
  });
});
