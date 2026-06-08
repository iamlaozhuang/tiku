import { describe, expect, it } from "vitest";

import { normalizeAuthorizationContextReasonSummaryInput } from "./authorization-context-reason-summary";

describe("authorization context reason summary validator", () => {
  it("normalizes valid authorization context reason input", () => {
    expect(
      normalizeAuthorizationContextReasonSummaryInput({
        userPublicId: " user_public_123 ",
        authorizationPublicId: " personal_auth_public_123 ",
        authorizationProfession: "monopoly",
        authorizationLevel: 3,
        paperContext: {
          publicId: " paper_public_123 ",
          profession: "monopoly",
          level: 3,
        },
        mockExamContext: null,
      }),
    ).toMatchObject({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        authorizationProfession: "monopoly",
        authorizationLevel: 3,
        paperContext: {
          publicId: "paper_public_123",
          profession: "monopoly",
          level: 3,
        },
        mockExamContext: null,
      },
    });
  });

  it("rejects invalid paper or mock_exam context", () => {
    expect(
      normalizeAuthorizationContextReasonSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        authorizationProfession: "monopoly",
        authorizationLevel: 3,
        paperContext: {
          publicId: "paper_public_123",
          profession: "unknown",
          level: 3,
        },
      }).success,
    ).toBe(false);

    expect(
      normalizeAuthorizationContextReasonSummaryInput({
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        authorizationProfession: "monopoly",
        authorizationLevel: 3,
        mockExamContext: {
          publicId: "",
          profession: "monopoly",
          level: 3,
        },
      }).success,
    ).toBe(false);
  });
});
