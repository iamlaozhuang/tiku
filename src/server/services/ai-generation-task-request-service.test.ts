import { describe, expect, it } from "vitest";

import { buildAiGenerationTaskRequestPolicyReadModel } from "./ai-generation-task-request-service";

function createBaseInput() {
  const omittedFixtureOne = ["OMITTED", "FIXTURE", "ONE"].join("-");
  const omittedFixtureTwo = ["OMITTED", "FIXTURE", "TWO"].join("-");
  const omittedFixtureThree = ["OMITTED", "FIXTURE", "THREE"].join("-");
  const omittedFixtureFour = ["OMITTED", "FIXTURE", "FOUR"].join("-");
  const omittedFixtureFive = ["OMITTED", "FIXTURE", "FIVE"].join("-");

  return {
    id: 901,
    taskPublicId: "ai_generation_task_public_123",
    taskType: "ai_question_generation",
    actorPublicId: "student_public_123",
    authorizationSource: "personal_auth",
    authorizationPublicId: "personal_auth_public_123",
    ownerType: "personal",
    ownerPublicId: "student_public_123",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student_public_123",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:idempotency_hash_123",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    omittedFixtureOne,
    omittedFixtureTwo,
    omittedFixtureThree,
    omittedFixtureFour,
    omittedFixtureFive,
  };
}

describe("AI generation task request policy service", () => {
  it("builds a local accepted personal request without sensitive payloads", () => {
    const input = createBaseInput();
    const result = buildAiGenerationTaskRequestPolicyReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        decision: "create_pending_task",
        taskPublicId: "ai_generation_task_public_123",
        taskType: "ai_question_generation",
        initialStatus: "pending",
        blockedFailureCategory: null,
        authorizationSource: "personal_auth",
        authorizationPublicId: "personal_auth_public_123",
        actorPublicId: "student_public_123",
        ownerType: "personal",
        ownerPublicId: "student_public_123",
        organizationPublicId: null,
        quotaOwnerType: "personal",
        quotaOwnerPublicId: "student_public_123",
        idempotency: {
          keyHash: "sha256:idempotency_hash_123",
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
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.omittedFixtureOne);
    expect(serializedResult).not.toContain(input.omittedFixtureTwo);
    expect(serializedResult).not.toContain(input.omittedFixtureThree);
    expect(serializedResult).not.toContain(input.omittedFixtureFour);
    expect(serializedResult).not.toContain(input.omittedFixtureFive);
  });

  it("reuses an existing compatible task for duplicate idempotent requests", () => {
    expect(
      buildAiGenerationTaskRequestPolicyReadModel({
        ...createBaseInput(),
        existingTaskPublicId: "ai_generation_task_public_existing",
        existingTaskStatus: "running",
        resultPublicId: "ai_generated_question_set_public_existing",
        evidenceStatus: "weak",
        citationCount: 2,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "reuse_existing_task",
        taskPublicId: "ai_generation_task_public_existing",
        initialStatus: "running",
        blockedFailureCategory: null,
        idempotency: {
          reuseTaskPublicId: "ai_generation_task_public_existing",
        },
        resultReference: {
          resultKind: "ai_generated_question_set",
          resultPublicId: "ai_generated_question_set_public_existing",
          contentVisibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "weak",
          citationCount: 2,
        },
      },
    });
  });

  it("blocks deterministic local request failures without provider execution", () => {
    expect(
      buildAiGenerationTaskRequestPolicyReadModel({
        ...createBaseInput(),
        effectiveEdition: "standard",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "reject_request",
        initialStatus: null,
        blockedFailureCategory: "edition_not_allowed",
      },
    });

    expect(
      buildAiGenerationTaskRequestPolicyReadModel({
        ...createBaseInput(),
        isRuntimeConfigReady: false,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "reject_request",
        initialStatus: null,
        blockedFailureCategory: "production_enablement_blocked",
      },
    });
  });

  it("does not echo caller-supplied result references for new or rejected requests", () => {
    const callerSuppliedResultPublicId =
      "client_supplied_result_public_should_not_echo";

    expect(
      buildAiGenerationTaskRequestPolicyReadModel({
        ...createBaseInput(),
        resultPublicId: callerSuppliedResultPublicId,
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "create_pending_task",
        resultReference: {
          resultPublicId: null,
        },
      },
    });

    const rejectedResponse = buildAiGenerationTaskRequestPolicyReadModel({
      ...createBaseInput(),
      effectiveEdition: "standard",
      resultPublicId: callerSuppliedResultPublicId,
    });

    expect(rejectedResponse).toMatchObject({
      code: 0,
      data: {
        decision: "reject_request",
        resultReference: {
          resultPublicId: null,
        },
      },
    });
    expect(JSON.stringify(rejectedResponse)).not.toContain(
      callerSuppliedResultPublicId,
    );
  });

  it("requires org_auth and organization quota ownership for organization training generation", () => {
    expect(
      buildAiGenerationTaskRequestPolicyReadModel({
        ...createBaseInput(),
        taskType: "organization_training_generation",
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        ownerType: "organization",
        ownerPublicId: "organization_public_123",
        organizationPublicId: "organization_public_123",
        quotaOwnerType: "organization",
        quotaOwnerPublicId: "organization_public_123",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "create_pending_task",
        resultReference: {
          resultKind: "organization_training_draft",
        },
      },
    });

    expect(
      buildAiGenerationTaskRequestPolicyReadModel({
        ...createBaseInput(),
        taskType: "organization_training_generation",
        authorizationSource: "personal_auth",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        decision: "reject_request",
        blockedFailureCategory: "authorization_invalid",
      },
    });
  });
});
