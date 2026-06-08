import { describe, expect, it } from "vitest";

import { buildAuthorizationScopeSummaryReadModel } from "./authorization-scope-summary-service";

const sensitiveQuestionContent = "private-question-content";

function createBaseInput() {
  return {
    id: 910,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    authorizationType: "personal_auth",
    profession: "monopoly",
    level: 3,
    paperScope: {
      id: 911,
      publicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
      questionContent: sensitiveQuestionContent,
    },
    mockExamScope: {
      id: 912,
      publicId: "mock_exam_public_123",
      profession: "monopoly",
      level: 3,
      token: "secret-token",
    },
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
  };
}

describe("authorization scope summary service", () => {
  it("builds scope_only paper and mock_exam context for matching authorization references", () => {
    const input = createBaseInput();
    const result = buildAuthorizationScopeSummaryReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        runtimeStatus: "local_contract_only",
        authorization: {
          publicId: "personal_auth_public_123",
          authorizationType: "personal_auth",
          profession: "monopoly",
          level: 3,
        },
        contextScope: {
          contentAccessStatus: "scope_only",
          paper: {
            publicId: "paper_public_123",
            profession: "monopoly",
            level: 3,
            scopeMatchStatus: "matches_authorization",
          },
          mockExam: {
            publicId: "mock_exam_public_123",
            profession: "monopoly",
            level: 3,
            scopeMatchStatus: "matches_authorization",
          },
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(sensitiveQuestionContent);
    expect(serializedResult).not.toContain(input.mockExamScope.token);
  });

  it("reports paper and mock_exam context mismatches without changing authorization permissions", () => {
    expect(
      buildAuthorizationScopeSummaryReadModel({
        ...createBaseInput(),
        paperScope: {
          publicId: "paper_public_456",
          profession: "marketing",
          level: 3,
        },
        mockExamScope: {
          publicId: "mock_exam_public_456",
          profession: "monopoly",
          level: 2,
        },
      }).data,
    ).toMatchObject({
      contextScope: {
        paper: {
          scopeMatchStatus: "context_mismatch",
        },
        mockExam: {
          scopeMatchStatus: "context_mismatch",
        },
      },
    });
  });

  it("rejects invalid authorization scope context input", () => {
    expect(
      buildAuthorizationScopeSummaryReadModel({
        ...createBaseInput(),
        authorizationPublicId: "",
      }),
    ).toEqual({
      code: 400014,
      message: "Invalid authorization scope summary input.",
      data: null,
    });
  });
});
