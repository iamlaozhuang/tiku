import {
  authScopeTypeValues,
  professionValues,
  type AuthScopeType,
  type Profession,
} from "../models/auth";
import type { OrgAuthTrainingScopeSummaryInput } from "../models/org-auth-training-scope-summary";

export type OrgAuthTrainingScopeSummaryValidationResult =
  | {
      success: true;
      value: OrgAuthTrainingScopeSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_ORG_AUTH_TRAINING_SCOPE_SUMMARY_INPUT_MESSAGE =
  "Invalid org auth training scope summary input.";

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

function normalizePositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeNonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function isAuthScopeType(value: unknown): value is AuthScopeType {
  return (
    typeof value === "string" &&
    authScopeTypeValues.includes(value as AuthScopeType)
  );
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" && professionValues.includes(value as Profession)
  );
}

function normalizePublicIdList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  ];
}

export function normalizeOrgAuthTrainingScopeSummaryInput(
  input: unknown,
): OrgAuthTrainingScopeSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ORG_AUTH_TRAINING_SCOPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const employeePublicId = normalizeOptionalText(input.employeePublicId);
  const orgAuthPublicId = normalizeRequiredText(input.orgAuthPublicId);
  const purchaserOrganizationPublicId = normalizeRequiredText(
    input.purchaserOrganizationPublicId,
  );
  const coveredOrganizationPublicIds = normalizePublicIdList(
    input.coveredOrganizationPublicIds,
  );
  const level = normalizePositiveInteger(input.level);
  const accountQuota = normalizePositiveInteger(input.accountQuota);
  const usedQuota = normalizeNonNegativeInteger(input.usedQuota);

  if (
    userPublicId === null ||
    orgAuthPublicId === null ||
    purchaserOrganizationPublicId === null ||
    !isAuthScopeType(input.authScopeType) ||
    !isProfession(input.profession) ||
    level === null ||
    accountQuota === null ||
    usedQuota === null ||
    usedQuota > accountQuota ||
    (input.authScopeType === "specified_nodes" &&
      coveredOrganizationPublicIds.length === 0)
  ) {
    return {
      success: false,
      message: INVALID_ORG_AUTH_TRAINING_SCOPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      employeePublicId,
      orgAuthPublicId,
      purchaserOrganizationPublicId,
      coveredOrganizationPublicIds:
        input.authScopeType === "specified_nodes"
          ? coveredOrganizationPublicIds
          : [],
      authScopeType: input.authScopeType,
      profession: input.profession,
      level,
      accountQuota,
      usedQuota,
      paperPublicId: normalizeOptionalText(input.paperPublicId),
      mockExamPublicId: normalizeOptionalText(input.mockExamPublicId),
      redeemCodePublicId: normalizeOptionalText(input.redeemCodePublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}
