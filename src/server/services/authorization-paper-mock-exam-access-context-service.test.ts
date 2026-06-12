import { describe, expect, it } from "vitest";

import { buildAuthorizationPaperMockExamAccessContextReadModel } from "./authorization-paper-mock-exam-access-context-service";

const paperContent = "full-paper-content";
const standardAnswer = "standard-answer";
const analysis = "teacher-analysis";

function createBaseInput() {
  return {
    id: 1081,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    authorizationSource: "personal_auth",
    effectiveEdition: "advanced",
    organizationPublicId: null,
    authorizationProfession: "monopoly",
    authorizationLevel: 3,
    paperContext: {
      id: 1082,
      paperPublicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      paperContent,
      standardAnswer,
      analysis,
    },
    mockExamContext: {
      id: 1083,
      mockExamPublicId: "mock_exam_public_123",
      paperPublicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      subject: "theory",
      paperType: "mock_paper",
      paperContent,
      standardAnswer,
      analysis,
    },
  };
}

describe("authorization paper mock_exam access context service", () => {
  it("builds context_summary_only metadata without changing permission behavior", () => {
    const result =
      buildAuthorizationPaperMockExamAccessContextReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorization: {
          authorizationPublicId: "personal_auth_public_123",
          authorizationSource: "personal_auth",
          effectiveEdition: "advanced",
          profession: "monopoly",
          level: 3,
          organizationPublicId: null,
        },
        accessContextStatus: "context_summary_only",
        permissionBehaviorStatus: "unchanged",
        paper: {
          paperPublicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          paperType: "mock_paper",
          contextMatchStatus: "matches_authorization",
        },
        mockExam: {
          mockExamPublicId: "mock_exam_public_123",
          paperPublicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
          subject: "theory",
          paperType: "mock_paper",
          contextMatchStatus: "matches_authorization",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(paperContent);
    expect(serializedResult).not.toContain(standardAnswer);
    expect(serializedResult).not.toContain(analysis);
  });

  it("summarizes paper and mock_exam context mismatch without denying access", () => {
    expect(
      buildAuthorizationPaperMockExamAccessContextReadModel({
        ...createBaseInput(),
        authorizationSource: "org_auth",
        authorizationPublicId: "org_auth_public_123",
        effectiveEdition: "standard",
        organizationPublicId: "org_public_123",
        authorizationProfession: "marketing",
        authorizationLevel: 2,
      }).data,
    ).toMatchObject({
      authorization: {
        authorizationSource: "org_auth",
        effectiveEdition: "standard",
        organizationPublicId: "org_public_123",
      },
      permissionBehaviorStatus: "unchanged",
      paper: {
        contextMatchStatus: "context_mismatch",
      },
      mockExam: {
        contextMatchStatus: "context_mismatch",
      },
    });
  });

  it("keeps absent paper or mock_exam context as null", () => {
    expect(
      buildAuthorizationPaperMockExamAccessContextReadModel({
        ...createBaseInput(),
        paperContext: null,
        mockExamContext: null,
      }).data,
    ).toMatchObject({
      accessContextStatus: "context_summary_only",
      paper: null,
      mockExam: null,
    });
  });

  it("rejects invalid access context input", () => {
    expect(
      buildAuthorizationPaperMockExamAccessContextReadModel({
        ...createBaseInput(),
        authorizationSource: "unsupported_authorization",
      }),
    ).toEqual({
      code: 400042,
      message: "Invalid authorization paper mock_exam access context input.",
      data: null,
    });
  });

  it("rejects invalid effective edition values", () => {
    expect(
      buildAuthorizationPaperMockExamAccessContextReadModel({
        ...createBaseInput(),
        effectiveEdition: "enterprise",
      }),
    ).toEqual({
      code: 400042,
      message: "Invalid authorization paper mock_exam access context input.",
      data: null,
    });
  });
});
