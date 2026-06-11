import { describe, expect, it } from "vitest";

import { buildPersonalAiGenerationRequestContextReadModel } from "./personal-ai-generation-request-context-service";

function createBaseInput() {
  const omittedFixtureOne = ["OMITTED", "FIXTURE", "ONE"].join("-");
  const omittedFixtureTwo = ["OMITTED", "FIXTURE", "TWO"].join("-");
  const omittedFixtureThree = ["OMITTED", "FIXTURE", "THREE"].join("-");
  const omittedFixtureFour = ["OMITTED", "FIXTURE", "FOUR"].join("-");

  return {
    id: 701,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    aiFuncType: "explanation",
    questionPublicId: "question_public_123",
    answerRecordPublicId: "answer_record_public_123",
    paperPublicId: null,
    mockExamPublicId: null,
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    omittedFixtureOne,
    omittedFixtureTwo,
    omittedFixtureThree,
    omittedFixtureFour,
  };
}

describe("personal AI generation request context service", () => {
  it("builds a redacted personal_auth request context without paper or mock_exam selection", () => {
    expect(
      buildPersonalAiGenerationRequestContextReadModel(createBaseInput()),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationBoundary: {
          authorizationSource: "personal_auth",
          authorizationPublicId: "personal_auth_public_123",
          ownerType: "personal",
          quotaOwnerType: "personal",
        },
        aiFuncType: "explanation",
        runtimeStatus: "local_contract_only",
        selectedContext: {
          contextType: "none",
          contextPublicId: null,
        },
        redactionStatus: "redacted",
      },
    });
  });

  it("selects a paper context by public id only", () => {
    expect(
      buildPersonalAiGenerationRequestContextReadModel({
        ...createBaseInput(),
        paperPublicId: "paper_public_123",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        selectedContext: {
          contextType: "paper",
          contextPublicId: "paper_public_123",
        },
      },
    });
  });

  it("selects a mock_exam context by public id only", () => {
    expect(
      buildPersonalAiGenerationRequestContextReadModel({
        ...createBaseInput(),
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).toMatchObject({
      code: 0,
      data: {
        selectedContext: {
          contextType: "mock_exam",
          contextPublicId: "mock_exam_public_123",
        },
      },
    });
  });

  it("rejects ambiguous paper and mock_exam context selection", () => {
    expect(
      buildPersonalAiGenerationRequestContextReadModel({
        ...createBaseInput(),
        paperPublicId: "paper_public_123",
        mockExamPublicId: "mock_exam_public_123",
      }),
    ).toEqual({
      code: 400011,
      message: "Invalid personal AI generation request input.",
      data: null,
    });
  });

  it("does not expose numeric ids or omitted request-only fixtures", () => {
    const input = {
      ...createBaseInput(),
      paperPublicId: "paper_public_123",
    };
    const serializedResult = JSON.stringify(
      buildPersonalAiGenerationRequestContextReadModel(input),
    );

    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.omittedFixtureOne);
    expect(serializedResult).not.toContain(input.omittedFixtureTwo);
    expect(serializedResult).not.toContain(input.omittedFixtureThree);
    expect(serializedResult).not.toContain(input.omittedFixtureFour);
  });
});
