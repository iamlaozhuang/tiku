import { describe, expect, it } from "vitest";

import { buildAuthorizationLocalContractSummaryReadModel } from "./authorization-local-contract-summary-service";

const plaintextRedeemCode = "plain-redeem-code-value";
const sensitiveEvidencePayload = "private-audit-evidence-payload";

function createBaseInput() {
  return {
    id: 920,
    userPublicId: "user_public_123",
    authorizationSources: [
      {
        id: 921,
        authorizationType: "personal_auth",
        publicId: "personal_auth_public_123",
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
    scopeSummary: {
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
    },
    redeemCodePublicId: "redeem_code_public_123",
    auditLogPublicId: "audit_log_public_123",
    aiCallLogPublicId: "ai_call_log_public_123",
    sensitiveEvidencePayload,
  };
}

describe("authorization local contract summary service", () => {
  it("builds an aggregate local authorization contract without sensitive evidence", () => {
    const input = createBaseInput();
    const result = buildAuthorizationLocalContractSummaryReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        userPublicId: "user_public_123",
        runtimeStatus: "local_contract_only",
        sourceSummary: {
          totalCount: 1,
          activeCount: 1,
          inactiveCount: 0,
        },
        authorizationSources: [
          {
            publicId: "personal_auth_public_123",
            authorizationType: "personal_auth",
            profession: "monopoly",
            level: 3,
            startsAt: "2026-06-01T00:00:00.000Z",
            expiresAt: "2026-07-01T00:00:00.000Z",
            status: "active",
            organizationPublicId: null,
            redeemCodeReference: {
              publicId: "redeem_code_public_123",
              redactionStatus: "redacted",
            },
          },
        ],
        selectedAuthorization: {
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
        redeemCodeReference: {
          publicId: "redeem_code_public_123",
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
        },
        evidenceReferences: {
          auditLogPublicId: "audit_log_public_123",
          aiCallLogPublicId: "ai_call_log_public_123",
          redactionStatus: "redacted",
          referenceStatus: "redacted_reference",
        },
        redactedEvidenceReferences: {
          redeemCodeReference: {
            publicId: "redeem_code_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          auditLogReference: {
            publicId: "audit_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
          aiCallLogReference: {
            publicId: "ai_call_log_public_123",
            redactionStatus: "redacted",
            referenceStatus: "redacted_reference",
          },
        },
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(sensitiveEvidencePayload);
  });

  it("groups redeem_code, audit_log, and ai_call_log as redacted evidence references", () => {
    const input = {
      ...createBaseInput(),
      privateSourceText: "private-source-text",
      privateRuntimeBody: "private-runtime-body",
      privateCodeDigest: "private-code-digest",
    };
    const result = buildAuthorizationLocalContractSummaryReadModel(input);
    const serializedResult = JSON.stringify(result);

    expect(result.data?.redactedEvidenceReferences).toEqual({
      redeemCodeReference: {
        publicId: "redeem_code_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
      },
      auditLogReference: {
        publicId: "audit_log_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
      },
      aiCallLogReference: {
        publicId: "ai_call_log_public_123",
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
      },
    });
    expect(serializedResult).not.toContain(input.privateSourceText);
    expect(serializedResult).not.toContain(input.privateRuntimeBody);
    expect(serializedResult).not.toContain(input.privateCodeDigest);
  });

  it("keeps paper and mock_exam as scope context when they mismatch authorization metadata", () => {
    expect(
      buildAuthorizationLocalContractSummaryReadModel({
        ...createBaseInput(),
        scopeSummary: {
          ...createBaseInput().scopeSummary,
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
        },
      }).data,
    ).toMatchObject({
      contextScope: {
        contentAccessStatus: "scope_only",
        paper: {
          scopeMatchStatus: "context_mismatch",
        },
        mockExam: {
          scopeMatchStatus: "context_mismatch",
        },
      },
    });
  });

  it("rejects missing user or empty authorization source list", () => {
    expect(
      buildAuthorizationLocalContractSummaryReadModel({
        ...createBaseInput(),
        userPublicId: "",
      }),
    ).toEqual({
      code: 400015,
      message: "Invalid authorization local contract summary input.",
      data: null,
    });

    expect(
      buildAuthorizationLocalContractSummaryReadModel({
        ...createBaseInput(),
        authorizationSources: [],
      }).code,
    ).toBe(400015);
  });
});
