import type {
  OpsGovernanceAuthorizationQuotaSource,
  OpsGovernanceAuthorizationQuotaSummaryInput,
  OpsGovernanceAuthorizationStatus,
  OpsGovernanceAuthorizationType,
} from "../models/ops-governance-authorization-quota-summary";

export type OpsGovernanceAuthorizationQuotaSummaryValidationResult =
  | {
      success: true;
      value: OpsGovernanceAuthorizationQuotaSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

export const INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_MESSAGE =
  "Invalid ops governance authorization quota summary input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizeNonNegativeInteger(
  value: unknown,
): number | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
}

function isAuthorizationType(
  value: unknown,
): value is OpsGovernanceAuthorizationType {
  return value === "personal_auth" || value === "org_auth";
}

function isAuthorizationStatus(
  value: unknown,
): value is OpsGovernanceAuthorizationStatus {
  return value === "active" || value === "expired" || value === "cancelled";
}

function normalizeIsoText(value: unknown): string | null {
  const text = normalizeRequiredText(value);

  if (text === null || Number.isNaN(Date.parse(text))) {
    return null;
  }

  return text;
}

function normalizeAuthorizationSummary(
  value: unknown,
): OpsGovernanceAuthorizationQuotaSource | null {
  if (!isRecord(value)) {
    return null;
  }

  const authorizationPublicId = normalizeRequiredText(
    value.authorizationPublicId,
  );
  const accountQuota = normalizeNonNegativeInteger(value.accountQuota);
  const usedQuota = normalizeNonNegativeInteger(value.usedQuota);
  const startsAt = normalizeIsoText(value.startsAt);
  const expiresAt = normalizeIsoText(value.expiresAt);

  if (
    authorizationPublicId === null ||
    !isAuthorizationType(value.authorizationType) ||
    !isAuthorizationStatus(value.status) ||
    accountQuota === undefined ||
    usedQuota === undefined ||
    startsAt === null ||
    expiresAt === null
  ) {
    return null;
  }

  if (
    (accountQuota === null && usedQuota !== null) ||
    (accountQuota !== null && usedQuota === null) ||
    (accountQuota !== null && usedQuota !== null && usedQuota > accountQuota)
  ) {
    return null;
  }

  return {
    authorizationPublicId,
    authorizationType: value.authorizationType,
    status: value.status,
    accountQuota,
    usedQuota,
    startsAt,
    expiresAt,
  };
}

export function normalizeOpsGovernanceAuthorizationQuotaSummaryInput(
  input: unknown,
): OpsGovernanceAuthorizationQuotaSummaryValidationResult {
  if (!isRecord(input) || !Array.isArray(input.authorizationSummaries)) {
    return {
      success: false,
      message: INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_MESSAGE,
    };
  }

  const generatedAt = normalizeIsoText(input.generatedAt);
  const authorizationSummaries = input.authorizationSummaries.map(
    normalizeAuthorizationSummary,
  );

  if (
    generatedAt === null ||
    authorizationSummaries.length === 0 ||
    authorizationSummaries.some(
      (authorizationSummary) => authorizationSummary === null,
    )
  ) {
    return {
      success: false,
      message: INVALID_OPS_GOVERNANCE_AUTHORIZATION_QUOTA_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      generatedAt,
      authorizationSummaries:
        authorizationSummaries as OpsGovernanceAuthorizationQuotaSource[],
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}
