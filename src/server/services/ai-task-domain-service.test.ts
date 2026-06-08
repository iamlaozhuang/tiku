import { describe, expect, it } from "vitest";

import { buildAiTaskDomainReadModel } from "./ai-task-domain-service";

function createBaseInput() {
  const promptText = ["RAW", "PROMPT", "TEXT"].join("-");
  const answerText = ["RAW", "ANSWER", "TEXT"].join("-");
  const executionPayload = ["EXECUTION", "PAYLOAD"].join("-");

  return {
    id: 301,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "scoring",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: "mock_exam_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    promptText,
    answerText,
    executionPayload,
  };
}

describe("AI task domain service", () => {
  it("builds a local scoring task contract without execution payload or raw answer", () => {
    const input = createBaseInput();
    const result = buildAiTaskDomainReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "scoring",
        runtimeStatus: "local_contract_only",
        taskContext: {
          questionPublicId: "question_public_123",
          answerRecordPublicId: "answer_record_public_123",
          paperPublicId: "paper_public_123",
          mockExamPublicId: "mock_exam_public_123",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.promptText);
    expect(serializedResult).not.toContain(input.answerText);
    expect(serializedResult).not.toContain(input.executionPayload);
  });

  it("builds an explanation task contract with nullable paper and mock_exam scope", () => {
    const result = buildAiTaskDomainReadModel({
      userPublicId: "user_public_456",
      authorizationPublicId: "org_auth_public_456",
      aiFuncType: "explanation",
      questionPublicId: "question_public_456",
      answerRecordPublicId: null,
      paperPublicId: null,
      mockExamPublicId: null,
      auditLogPublicId: null,
      aiCallLogPublicId: null,
    });

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_456",
        authorizationPublicId: "org_auth_public_456",
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        taskContext: {
          questionPublicId: "question_public_456",
          answerRecordPublicId: null,
          paperPublicId: null,
          mockExamPublicId: null,
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
          redactionStatus: "redacted",
        },
      },
    });
  });

  it("returns a failure result when required task references are missing", () => {
    expect(
      buildAiTaskDomainReadModel({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "hint",
        questionPublicId: "",
        answerRecordPublicId: null,
        paperPublicId: null,
        mockExamPublicId: null,
        auditLogPublicId: null,
        aiCallLogPublicId: null,
      }),
    ).toEqual({
      code: 400007,
      message: "Invalid AI task domain input.",
      data: null,
    });
  });
});
