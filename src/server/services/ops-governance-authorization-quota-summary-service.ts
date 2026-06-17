import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OpsGovernanceAuthorizationQuotaSummaryDto,
  OpsGovernanceQuotaRiskStatus,
} from "../contracts/ops-governance-authorization-quota-summary-contract";
import type {
  OpsGovernanceAuthorizationQuotaSource,
  OpsGovernanceAuthorizationQuotaSummaryInput,
} from "../models/ops-governance-authorization-quota-summary";
import {
  INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_MESSAGE,
  normalizeOpsGovernanceAuthorizationQuotaSummaryInput,
} from "../validators/ops-governance-authorization-quota-summary";

const INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_CODE = 400061;
const EXPIRING_SOON_DAY_WINDOW = 30;

function countByStatus(
  authorizationSummaries: OpsGovernanceAuthorizationQuotaSource[],
  status: OpsGovernanceAuthorizationQuotaSource["status"],
): number {
  return authorizationSummaries.filter(
    (authorizationSummary) => authorizationSummary.status === status,
  ).length;
}

function calculateUsageRatio(allocatedQuota: number, usedQuota: number) {
  if (allocatedQuota === 0) {
    return null;
  }

  return Math.round((usedQuota / allocatedQuota) * 100) / 100;
}

function resolveQuotaRiskStatus(
  remainingQuota: number,
  usageRatio: number | null,
): OpsGovernanceQuotaRiskStatus {
  if (usageRatio === null) {
    return "not_applicable";
  }

  if (remainingQuota === 0) {
    return "exhausted";
  }

  return usageRatio >= 0.8 ? "attention_required" : "healthy";
}

function resolveQuotaReviewStatus(
  quotaRiskStatus: OpsGovernanceQuotaRiskStatus,
) {
  if (quotaRiskStatus === "exhausted") {
    return "quota_exhausted";
  }

  return quotaRiskStatus === "attention_required"
    ? "review_quota_pressure"
    : "no_action_needed";
}

function countExpiringSoon(
  authorizationSummaries: OpsGovernanceAuthorizationQuotaSource[],
  generatedAt: string,
): number {
  const generatedAtTime = Date.parse(generatedAt);
  const expiringSoonTime =
    generatedAtTime + EXPIRING_SOON_DAY_WINDOW * 24 * 60 * 60 * 1000;

  return authorizationSummaries.filter((authorizationSummary) => {
    const expiresAtTime = Date.parse(authorizationSummary.expiresAt);

    return (
      authorizationSummary.status === "active" &&
      expiresAtTime >= generatedAtTime &&
      expiresAtTime <= expiringSoonTime
    );
  }).length;
}

function getEarliestExpiresAt(
  authorizationSummaries: OpsGovernanceAuthorizationQuotaSource[],
): string | null {
  const sortedExpiresAt = authorizationSummaries
    .map((authorizationSummary) => authorizationSummary.expiresAt)
    .sort((left, right) => Date.parse(left) - Date.parse(right));

  return sortedExpiresAt[0] ?? null;
}

function mapOpsGovernanceAuthorizationQuotaSummaryToDto(
  input: OpsGovernanceAuthorizationQuotaSummaryInput,
): OpsGovernanceAuthorizationQuotaSummaryDto {
  const activeCount = countByStatus(input.authorizationSummaries, "active");
  const expiredCount = countByStatus(input.authorizationSummaries, "expired");
  const cancelledCount = countByStatus(
    input.authorizationSummaries,
    "cancelled",
  );
  const quotaSummaries = input.authorizationSummaries.filter(
    (authorizationSummary) => authorizationSummary.accountQuota !== null,
  );
  const allocatedQuota = quotaSummaries.reduce(
    (total, authorizationSummary) =>
      total + (authorizationSummary.accountQuota ?? 0),
    0,
  );
  const usedQuota = quotaSummaries.reduce(
    (total, authorizationSummary) =>
      total + (authorizationSummary.usedQuota ?? 0),
    0,
  );
  const remainingQuota = allocatedQuota - usedQuota;
  const usageRatio = calculateUsageRatio(allocatedQuota, usedQuota);
  const quotaRiskStatus = resolveQuotaRiskStatus(remainingQuota, usageRatio);

  return {
    generatedAt: input.generatedAt,
    runtimeStatus: "local_read_model_only",
    authorizationSummary: {
      totalCount: input.authorizationSummaries.length,
      activeCount,
      expiredCount,
      cancelledCount,
      inactiveCount: expiredCount + cancelledCount,
    },
    quotaSummary: {
      authorizationWithQuotaCount: quotaSummaries.length,
      allocatedQuota,
      usedQuota,
      remainingQuota,
      usageRatio,
      quotaRiskStatus,
    },
    expirySummary: {
      expiredCount,
      expiringSoonCount: countExpiringSoon(
        input.authorizationSummaries,
        input.generatedAt,
      ),
      earliestExpiresAt: getEarliestExpiresAt(input.authorizationSummaries),
    },
    operationsReview: {
      authorizationReviewStatus:
        expiredCount + cancelledCount > 0
          ? "review_inactive_authorization"
          : "no_action_needed",
      quotaReviewStatus: resolveQuotaReviewStatus(quotaRiskStatus),
      evidenceReviewStatus: "redacted_evidence_only",
    },
    evidencePolicy: {
      auditLogReferenceStatus:
        input.auditLogPublicId === null ? "none" : "redacted_reference",
      aiCallLogReferenceStatus:
        input.aiCallLogPublicId === null ? "none" : "redacted_reference",
      publicIdInventoryStatus: "not_included",
      rowDataStatus: "not_included",
    },
  };
}

export function buildOpsGovernanceAuthorizationQuotaSummaryReadModel(
  input: unknown,
): ApiResponse<OpsGovernanceAuthorizationQuotaSummaryDto | null> {
  const summaryInput =
    normalizeOpsGovernanceAuthorizationQuotaSummaryInput(input);

  if (!summaryInput.success) {
    return createErrorResponse(
      INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_CODE,
      INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_MESSAGE,
    );
  }

  return createSuccessResponse(
    mapOpsGovernanceAuthorizationQuotaSummaryToDto(summaryInput.value),
  );
}
