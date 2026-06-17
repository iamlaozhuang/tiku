import { describe, expect, it } from "vitest";

import { buildOpsGovernanceAuthorizationQuotaSummaryReadModel } from "./ops-governance-authorization-quota-summary-service";

const plaintextRedeemCode = "RC-PRIVATE-2026-0001";
const privatePurchaserName = "private purchaser";
const privateOrganizationPublicId = "organization-public-private";

function createBaseInput() {
  return {
    generatedAt: "2026-06-17T10:40:00.000Z",
    authorizationSummaries: [
      {
        authorizationPublicId: "authorization-public-active",
        authorizationType: "org_auth",
        status: "active",
        accountQuota: 100,
        usedQuota: 82,
        startsAt: "2026-01-01T00:00:00.000Z",
        expiresAt: "2026-07-01T00:00:00.000Z",
        purchaserName: privatePurchaserName,
        organizationPublicIds: [privateOrganizationPublicId],
        plaintextRedeemCode,
      },
      {
        authorizationPublicId: "authorization-public-expired",
        authorizationType: "personal_auth",
        status: "expired",
        accountQuota: null,
        usedQuota: null,
        startsAt: "2026-01-01T00:00:00.000Z",
        expiresAt: "2026-06-01T00:00:00.000Z",
      },
      {
        authorizationPublicId: "authorization-public-cancelled",
        authorizationType: "org_auth",
        status: "cancelled",
        accountQuota: 50,
        usedQuota: 50,
        startsAt: "2026-01-01T00:00:00.000Z",
        expiresAt: "2026-09-01T00:00:00.000Z",
      },
    ],
    auditLogPublicId: "audit-log-public-001",
    aiCallLogPublicId: "ai-call-log-public-001",
  };
}

describe("ops governance authorization quota summary service", () => {
  it("builds aggregate authorization and quota governance without private rows or publicId inventories", () => {
    const result =
      buildOpsGovernanceAuthorizationQuotaSummaryReadModel(createBaseInput());
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        generatedAt: "2026-06-17T10:40:00.000Z",
        runtimeStatus: "local_read_model_only",
        authorizationSummary: {
          totalCount: 3,
          activeCount: 1,
          expiredCount: 1,
          cancelledCount: 1,
          inactiveCount: 2,
        },
        quotaSummary: {
          authorizationWithQuotaCount: 2,
          allocatedQuota: 150,
          usedQuota: 132,
          remainingQuota: 18,
          usageRatio: 0.88,
          quotaRiskStatus: "attention_required",
        },
        expirySummary: {
          expiredCount: 1,
          expiringSoonCount: 1,
          earliestExpiresAt: "2026-06-01T00:00:00.000Z",
        },
        operationsReview: {
          authorizationReviewStatus: "review_inactive_authorization",
          quotaReviewStatus: "review_quota_pressure",
          evidenceReviewStatus: "redacted_evidence_only",
        },
        evidencePolicy: {
          auditLogReferenceStatus: "redacted_reference",
          aiCallLogReferenceStatus: "redacted_reference",
          publicIdInventoryStatus: "not_included",
          rowDataStatus: "not_included",
        },
      },
    });
    expect(serializedResult).not.toContain(plaintextRedeemCode);
    expect(serializedResult).not.toContain(privatePurchaserName);
    expect(serializedResult).not.toContain(privateOrganizationPublicId);
    expect(serializedResult).not.toMatch(/authorization-public-/);
    expect(serializedResult).not.toMatch(/"organizationPublicIds"/);
  });

  it("rejects invalid quota usage instead of silently normalizing impossible data", () => {
    expect(
      buildOpsGovernanceAuthorizationQuotaSummaryReadModel({
        ...createBaseInput(),
        authorizationSummaries: [
          {
            authorizationPublicId: "authorization-public-invalid",
            authorizationType: "org_auth",
            status: "active",
            accountQuota: 1,
            usedQuota: 2,
            startsAt: "2026-01-01T00:00:00.000Z",
            expiresAt: "2026-09-01T00:00:00.000Z",
          },
        ],
      }),
    ).toEqual({
      code: 400061,
      message: "Invalid ops governance authorization quota summary input.",
      data: null,
    });
  });
});
