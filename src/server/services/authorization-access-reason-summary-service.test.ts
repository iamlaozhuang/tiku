import { describe, expect, it } from "vitest";

import { buildAuthorizationAccessReasonSummaryReadModel } from "./authorization-access-reason-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createBaseInput() {
  return {
    id: 977,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    authorizationProfession: "monopoly",
    authorizationLevel: 3,
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-07-01T00:00:00.000Z",
    currentAt: "2026-06-08T00:00:00.000Z",
    authorizationSources: [
      {
        id: 978,
        publicId: "personal_auth_public_123",
        authorizationType: "personal_auth",
        profession: "monopoly",
        level: 3,
        startsAt: "2026-06-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        status: "active",
        organizationPublicId: null,
        redeemCodePublicId: "redeem_code_public_123",
        plaintextRedeemCode,
      },
    ],
    paperContext: {
      id: 979,
      publicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
    },
    mockExamContext: {
      id: 980,
      publicId: "mock_exam_public_123",
      profession: "monopoly",
      level: 3,
    },
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    rawAiCallLogPayload,
  };
}

describe("authorization access reason summary service", () => {
  it("builds an aggregate reason_summary_only authorization contract", () => {
    const result =
      buildAuthorizationAccessReasonSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        reasonStatus: "reason_summary_only",
        reasonCodes: [
          "selected_authorization_active",
          "authorization_window_within_window",
          "context_matches_authorization",
          "redacted_references_present",
        ],
        sourceReason: {
          selectedAuthorizationPublicId: "personal_auth_public_123",
          sourceReasonCode: "selected_authorization_active",
        },
        windowReason: {
          windowReasonCode: "authorization_window_within_window",
        },
        contextReason: {
          paperReasonCode: "context_matches_authorization",
          mockExamReasonCode: "context_matches_authorization",
        },
        evidenceReferences: {
          redeemCodeReference: {
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("summarizes inactive context-mismatched authorization signals without enforcing permissions", () => {
    expect(
      buildAuthorizationAccessReasonSummaryReadModel({
        ...createBaseInput(),
        currentAt: "2026-08-01T00:00:00.000Z",
        authorizationSources: [
          {
            ...createBaseInput().authorizationSources[0],
            status: "expired",
          },
        ],
        paperContext: {
          publicId: "paper_public_456",
          profession: "marketing",
          level: 3,
        },
      }).data,
    ).toMatchObject({
      reasonCodes: [
        "selected_authorization_inactive",
        "authorization_window_expired",
        "context_mismatch",
        "redacted_references_present",
      ],
    });
  });

  it("rejects missing selected authorization references", () => {
    expect(
      buildAuthorizationAccessReasonSummaryReadModel({
        ...createBaseInput(),
        authorizationPublicId: "org_auth_public_missing",
      }),
    ).toEqual({
      code: 400023,
      message: "Invalid authorization access reason summary input.",
      data: null,
    });
  });
});
