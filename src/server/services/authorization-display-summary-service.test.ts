import { describe, expect, it } from "vitest";

import { buildAuthorizationDisplaySummaryReadModel } from "./authorization-display-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const rawAiCallLogPayload = "raw-ai-call-log-payload";

function createBaseInput() {
  return {
    id: 960,
    userPublicId: "user_public_123",
    authorizationPublicId: "personal_auth_public_123",
    startsAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-07-01T00:00:00.000Z",
    currentAt: "2026-06-08T00:00:00.000Z",
    authorizationSources: [
      {
        id: 961,
        publicId: "personal_auth_public_123",
        authorizationType: "personal_auth",
        organizationPublicId: null,
        plaintextRedeemCode,
      },
    ],
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    paperContext: {
      id: 962,
      publicId: "paper_public_123",
      profession: "monopoly",
      level: 3,
    },
    mockExamContext: {
      id: 963,
      publicId: "mock_exam_public_123",
      profession: "monopoly",
      level: 3,
    },
    rawAiCallLogPayload,
  };
}

describe("authorization display summary service", () => {
  it("builds an aggregate display_only authorization contract", () => {
    const result = buildAuthorizationDisplaySummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        authorizationPublicId: "personal_auth_public_123",
        displayStatus: "display_only",
        window: {
          startsAt: "2026-06-01T00:00:00.000Z",
          expiresAt: "2026-07-01T00:00:00.000Z",
          currentAt: "2026-06-08T00:00:00.000Z",
          windowStatus: "within_window",
        },
        audienceSummary: {
          totalCount: 1,
          personalAuthCount: 1,
          orgAuthCount: 0,
          organizationReferenceCount: 0,
        },
        evidenceSummary: {
          totalReferenceCount: 3,
          missingReferenceCount: 0,
        },
        context: {
          contentAccessStatus: "display_only",
          paper: {
            publicId: "paper_public_123",
            profession: "monopoly",
            level: 3,
          },
          mockExam: {
            publicId: "mock_exam_public_123",
            profession: "monopoly",
            level: 3,
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(rawAiCallLogPayload);
  });

  it("keeps paper and mock_exam as display context only", () => {
    expect(
      buildAuthorizationDisplaySummaryReadModel({
        ...createBaseInput(),
        paperContext: null,
      }).data,
    ).toMatchObject({
      context: {
        contentAccessStatus: "display_only",
        paper: null,
        mockExam: {
          publicId: "mock_exam_public_123",
        },
      },
    });
  });

  it("rejects inconsistent selected authorization references", () => {
    expect(
      buildAuthorizationDisplaySummaryReadModel({
        ...createBaseInput(),
        authorizationPublicId: "org_auth_public_missing",
      }),
    ).toEqual({
      code: 400019,
      message: "Invalid authorization display summary input.",
      data: null,
    });
  });
});
