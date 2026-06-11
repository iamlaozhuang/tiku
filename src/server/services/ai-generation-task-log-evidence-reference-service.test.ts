import { describe, expect, it } from "vitest";

import { buildAiGenerationTaskLogEvidenceReferenceReadModel } from "./ai-generation-task-log-evidence-reference-service";

function createTaskLogEvidenceInput() {
  const omittedFixtureOne = "OMITTED-FIXTURE-ONE";
  const omittedFixtureTwo = "OMITTED-FIXTURE-TWO";
  const omittedFixtureThree = "OMITTED-FIXTURE-THREE";
  const omittedFixtureFour = "OMITTED-FIXTURE-FOUR";

  return {
    internalId: 907,
    taskPublicId: "ai_task_public_107",
    taskType: "ai_question_generation",
    status: "succeeded",
    failureCategory: null,
    resultPublicId: "ai_result_public_107",
    evidenceStatus: "sufficient",
    auditLogPublicId: "audit_log_public_107",
    aiCallLogPublicId: "ai_call_log_public_107",
    auditLogRetentionDay: 1095,
    aiCallLogRetentionDay: 180,
    omittedFixtureOne,
    omittedFixtureTwo,
    omittedFixtureThree,
    omittedFixtureFour,
  };
}

describe("ai_generation_task log evidence reference service", () => {
  it("builds redacted audit_log and ai_call_log evidence references for a task", () => {
    const input = createTaskLogEvidenceInput();
    const result = buildAiGenerationTaskLogEvidenceReferenceReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai_task_public_107",
        taskType: "ai_question_generation",
        status: "succeeded",
        failureCategory: null,
        resultReference: {
          publicId: "ai_result_public_107",
          visibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "sufficient",
        },
        evidenceReferences: {
          auditLog: {
            kind: "audit_log",
            publicId: "audit_log_public_107",
            visibility: "summary_only",
            redactionStatus: "redacted",
            retentionDay: 1095,
          },
          aiCallLog: {
            kind: "ai_call_log",
            publicId: "ai_call_log_public_107",
            visibility: "summary_only",
            redactionStatus: "redacted",
            retentionDay: 180,
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"internalId":/);
    expect(serializedResult).not.toContain(input.omittedFixtureOne);
    expect(serializedResult).not.toContain(input.omittedFixtureTwo);
    expect(serializedResult).not.toContain(input.omittedFixtureThree);
    expect(serializedResult).not.toContain(input.omittedFixtureFour);
  });

  it("supports failed tasks with a single audit_log reference and no result body", () => {
    expect(
      buildAiGenerationTaskLogEvidenceReferenceReadModel({
        taskPublicId: "ai_task_public_failed_107",
        taskType: "organization_training_generation",
        status: "failed",
        failureCategory: "production_enablement_blocked",
        resultPublicId: null,
        evidenceStatus: "none",
        auditLogPublicId: "audit_log_public_failed_107",
        aiCallLogPublicId: null,
        auditLogRetentionDay: 1095,
        aiCallLogRetentionDay: 180,
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        runtimeStatus: "local_contract_only",
        taskPublicId: "ai_task_public_failed_107",
        taskType: "organization_training_generation",
        status: "failed",
        failureCategory: "production_enablement_blocked",
        resultReference: {
          publicId: null,
          visibility: "summary_only",
          redactionStatus: "redacted",
          evidenceStatus: "none",
        },
        evidenceReferences: {
          auditLog: {
            kind: "audit_log",
            publicId: "audit_log_public_failed_107",
            visibility: "summary_only",
            redactionStatus: "redacted",
            retentionDay: 1095,
          },
          aiCallLog: {
            kind: "ai_call_log",
            publicId: null,
            visibility: "summary_only",
            redactionStatus: "redacted",
            retentionDay: 180,
          },
        },
      },
    });
  });

  it("rejects task log evidence input without any log public reference", () => {
    expect(
      buildAiGenerationTaskLogEvidenceReferenceReadModel({
        taskPublicId: "ai_task_public_missing_107",
        taskType: "ai_paper_generation",
        status: "pending",
        failureCategory: null,
        resultPublicId: null,
        evidenceStatus: "weak",
        auditLogPublicId: "",
        aiCallLogPublicId: null,
        auditLogRetentionDay: 1095,
        aiCallLogRetentionDay: 180,
      }),
    ).toEqual({
      code: 400013,
      message: "Invalid ai_generation_task log evidence reference input.",
      data: null,
    });
  });
});
