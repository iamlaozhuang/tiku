import { describe, expect, it } from "vitest";

import { normalizeAuthorizationScopeSummaryInput } from "./authorization-scope-summary";

describe("authorization scope summary validator", () => {
  it("normalizes paper and mock_exam scope references", () => {
    expect(
      normalizeAuthorizationScopeSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        authorizationType: "personal_auth",
        profession: "monopoly",
        level: 3,
        paperScope: {
          publicId: " paper_public_123 ",
          profession: "monopoly",
          level: 3,
        },
        mockExamScope: {
          publicId: " mock_exam_public_123 ",
          profession: "monopoly",
          level: 3,
        },
        auditLogPublicId: " audit_log_public_123 ",
        aiCallLogPublicId: " ai_call_log_public_123 ",
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        authorizationType: "personal_auth",
        profession: "monopoly",
        level: 3,
        paperScope: {
          publicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
        },
        mockExamScope: {
          publicId: "mock_exam_public_123",
          profession: "monopoly",
          level: 3,
        },
        auditLogPublicId: "audit_log_public_123",
        aiCallLogPublicId: "ai_call_log_public_123",
      },
    });
  });

  it("rejects invalid paper and mock_exam context", () => {
    expect(
      normalizeAuthorizationScopeSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        authorizationType: "personal_auth",
        profession: "monopoly",
        level: 3,
        paperScope: {
          publicId: "paper_public_123",
          profession: "monopoly",
          level: 0,
        },
        mockExamScope: null,
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization scope summary input.",
    });
  });
});
