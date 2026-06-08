import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";

function createBaseInput() {
  const promptText = ["RAW", "PROMPT"].join("-");
  const rawAnswer = ["RAW", "ANSWER"].join("-");
  const generatedContent = ["GENERATED", "CONTENT"].join("-");
  const redeemCodePlaintext = ["PLAIN", "REDEEM", "CODE"].join("-");

  return {
    id: 701,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "explanation",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: "mock_exam_public_123",
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    promptText,
    rawAnswer,
    generatedContent,
    redeemCodePlaintext,
    token: "secret-token",
  };
}

describe("personal AI generation request service", () => {
  it("builds a local ai_explanation request contract without sensitive payloads", () => {
    const input = createBaseInput();
    const result = buildPersonalAiGenerationRequestReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        generationContext: {
          questionPublicId: "question_public_123",
          answerRecordPublicId: "answer_record_public_123",
          paperPublicId: "paper_public_123",
          mockExamPublicId: "mock_exam_public_123",
        },
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
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
    expect(serializedResult).not.toContain(input.rawAnswer);
    expect(serializedResult).not.toContain(input.generatedContent);
    expect(serializedResult).not.toContain(input.redeemCodePlaintext);
    expect(serializedResult).not.toContain(input.token);
  });

  it("builds local ai_hint and kn_recommendation request contracts", () => {
    expect(
      buildPersonalAiGenerationRequestReadModel({
        ...createBaseInput(),
        aiFuncType: "hint",
        answerRecordPublicId: null,
      }).code,
    ).toBe(0);
    expect(
      buildPersonalAiGenerationRequestReadModel({
        ...createBaseInput(),
        aiFuncType: "kn_recommendation",
        redeemCodePublicId: null,
      }).code,
    ).toBe(0);
  });

  it("rejects ai_scoring because this contract is generation-only", () => {
    expect(
      buildPersonalAiGenerationRequestReadModel({
        ...createBaseInput(),
        aiFuncType: "scoring",
      }),
    ).toEqual({
      code: 400011,
      message: "Invalid personal AI generation request input.",
      data: null,
    });
  });
});
