import { describe, expect, it } from "vitest";

import { buildPaperMockExamScopeReadModel } from "./paper-mock-exam-scope-service";

function createBaseInput() {
  const questionText = ["QUESTION", "TEXT"].join("-");
  const standardAnswer = ["STANDARD", "ANSWER"].join("-");
  const analysis = ["TEACHER", "ANALYSIS"].join("-");
  const paperSnapshot = { title: "formal paper snapshot" };

  return {
    id: 401,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    paperPublicId: "paper_public_123",
    mockExamPublicId: "mock_exam_public_123",
    profession: "monopoly",
    level: 3,
    subject: "theory",
    paperType: "mock_paper",
    questionText,
    standardAnswer,
    analysis,
    answerRecordPublicId: "answer_record_public_123",
    paperSnapshot,
  };
}

describe("paper mock_exam scope service", () => {
  it("builds a scope-only read model without formal paper content", () => {
    const input = createBaseInput();
    const result = buildPaperMockExamScopeReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        paperScope: {
          paperPublicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          paperType: "mock_paper",
        },
        mockExamScope: {
          mockExamPublicId: "mock_exam_public_123",
        },
        contentAccessStatus: "scope_only",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(input.questionText);
    expect(serializedResult).not.toContain(input.standardAnswer);
    expect(serializedResult).not.toContain(input.analysis);
    expect(serializedResult).not.toContain("paperSnapshot");
    expect(serializedResult).not.toContain("answerRecordPublicId");
  });

  it("builds a paper-only scope read model with nullable mock_exam", () => {
    expect(
      buildPaperMockExamScopeReadModel({
        userPublicId: "user_public_456",
        authorizationPublicId: "org_auth_public_456",
        paperPublicId: "paper_public_456",
        mockExamPublicId: null,
        profession: "marketing",
        level: 2,
        subject: "skill",
        paperType: "past_paper",
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_456",
        authorizationPublicId: "org_auth_public_456",
        paperScope: {
          paperPublicId: "paper_public_456",
          profession: "marketing",
          level: 2,
          subject: "skill",
          paperType: "past_paper",
        },
        mockExamScope: {
          mockExamPublicId: null,
        },
        contentAccessStatus: "scope_only",
      },
    });
  });

  it("returns a failure result when paper scope is missing", () => {
    expect(
      buildPaperMockExamScopeReadModel({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        paperPublicId: "",
        mockExamPublicId: "mock_exam_public_123",
        profession: "monopoly",
        level: 3,
        subject: "theory",
        paperType: "mock_paper",
      }),
    ).toEqual({
      code: 400008,
      message: "Invalid paper mock_exam scope input.",
      data: null,
    });
  });
});
