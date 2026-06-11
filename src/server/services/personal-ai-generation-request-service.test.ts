import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestReadModel } from "./personal-ai-generation-request-service";

function createBaseInput() {
  const omittedFixtureOne = ["OMITTED", "FIXTURE", "ONE"].join("-");
  const omittedFixtureTwo = ["OMITTED", "FIXTURE", "TWO"].join("-");
  const omittedFixtureThree = ["OMITTED", "FIXTURE", "THREE"].join("-");
  const omittedFixtureFour = ["OMITTED", "FIXTURE", "FOUR"].join("-");
  const omittedFixtureFive = ["OMITTED", "FIXTURE", "FIVE"].join("-");

  return {
    id: 701,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "explanation",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: null,
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    omittedFixtureOne,
    omittedFixtureTwo,
    omittedFixtureThree,
    omittedFixtureFour,
    omittedFixtureFive,
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
          mockExamPublicId: null,
          selectedContext: {
            contextType: "paper",
            contextPublicId: "paper_public_123",
          },
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
    expect(serializedResult).not.toContain(input.omittedFixtureOne);
    expect(serializedResult).not.toContain(input.omittedFixtureTwo);
    expect(serializedResult).not.toContain(input.omittedFixtureThree);
    expect(serializedResult).not.toContain(input.omittedFixtureFour);
    expect(serializedResult).not.toContain(input.omittedFixtureFive);
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
