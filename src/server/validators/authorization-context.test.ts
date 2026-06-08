import { describe, expect, it } from "vitest";

import { normalizeAuthorizationContextInput } from "./authorization-context";

const startsAt = "2026-06-01T00:00:00.000Z";
const expiresAt = "2026-12-01T00:00:00.000Z";

describe("authorization context validator", () => {
  it("normalizes personal_auth input while keeping redeem_code secret material out of the value", () => {
    const redeemCodeSecret = ["SHOULD", "NOT", "LEAK"].join("-");

    expect(
      normalizeAuthorizationContextInput({
        userPublicId: " user_public_123 ",
        authorizationSources: [
          {
            id: 101,
            authorizationType: "personal_auth",
            publicId: " personal_auth_public_123 ",
            profession: "monopoly",
            level: 3,
            startsAt,
            expiresAt,
            status: "active",
            redeemCodePublicId: " redeem_code_public_123 ",
            redeemCodeSecret,
          },
        ],
        scope: {
          paperPublicId: " paper_public_123 ",
          mockExamPublicId: null,
        },
        evidenceReferences: {
          auditLogPublicId: " audit_log_public_123 ",
          aiCallLogPublicId: null,
        },
      }),
    ).toEqual({
      success: true,
      value: {
        userPublicId: "user_public_123",
        authorizationSources: [
          {
            authorizationType: "personal_auth",
            publicId: "personal_auth_public_123",
            profession: "monopoly",
            level: 3,
            startsAt: new Date(startsAt),
            expiresAt: new Date(expiresAt),
            status: "active",
            organizationPublicId: null,
            redeemCodePublicId: "redeem_code_public_123",
          },
        ],
        scope: {
          paperPublicId: "paper_public_123",
          mockExamPublicId: null,
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: null,
        },
      },
    });
  });

  it("normalizes org_auth input with an organization public id", () => {
    expect(
      normalizeAuthorizationContextInput({
        userPublicId: "employee_public_123",
        authorizationSources: [
          {
            authorizationType: "org_auth",
            publicId: "org_auth_public_123",
            organizationPublicId: "org_public_123",
            profession: "marketing",
            level: 2,
            startsAt,
            expiresAt,
            status: "active",
          },
        ],
        scope: {
          paperPublicId: null,
          mockExamPublicId: "mock_exam_public_123",
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: "ai_call_log_public_123",
        },
      }),
    ).toMatchObject({
      success: true,
      value: {
        authorizationSources: [
          {
            authorizationType: "org_auth",
            organizationPublicId: "org_public_123",
            redeemCodePublicId: null,
          },
        ],
      },
    });
  });

  it("rejects invalid authorization context input", () => {
    expect(
      normalizeAuthorizationContextInput({
        userPublicId: "",
        authorizationSources: [
          {
            authorizationType: "invalid_auth",
            publicId: "bad",
            profession: "monopoly",
            level: 3,
            startsAt,
            expiresAt,
            status: "active",
          },
        ],
        scope: {
          paperPublicId: null,
          mockExamPublicId: null,
        },
        evidenceReferences: {
          auditLogPublicId: null,
          aiCallLogPublicId: null,
        },
      }),
    ).toEqual({
      success: false,
      message: "Invalid authorization context input.",
    });
  });
});
