import type { AuthorizationLocalContractSummaryInput } from "../models/authorization-local-contract-summary";
import { normalizeAuthorizationScopeSummaryInput } from "./authorization-scope-summary";
import { normalizeAuthorizationSourceSummaryInput } from "./authorization-source-summary";

export type AuthorizationLocalContractSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationLocalContractSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization local contract summary input.";

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

export function normalizeAuthorizationLocalContractSummaryInput(
  input: unknown,
): AuthorizationLocalContractSummaryValidationResult {
  if (!isRecord(input) || !isRecord(input.scopeSummary)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);

  if (userPublicId === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_MESSAGE,
    };
  }

  const sourceSummary = normalizeAuthorizationSourceSummaryInput({
    userPublicId,
    authorizationSources: input.authorizationSources,
  });
  const scopeSummary = normalizeAuthorizationScopeSummaryInput({
    userPublicId,
    authorizationPublicId: input.scopeSummary.authorizationPublicId,
    authorizationType: input.scopeSummary.authorizationType,
    profession: input.scopeSummary.profession,
    level: input.scopeSummary.level,
    paperScope: input.scopeSummary.paperScope,
    mockExamScope: input.scopeSummary.mockExamScope,
    auditLogPublicId: input.auditLogPublicId,
    aiCallLogPublicId: input.aiCallLogPublicId,
  });

  if (!sourceSummary.success || !scopeSummary.success) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_MESSAGE,
    };
  }

  const hasSelectedAuthorizationSource =
    sourceSummary.value.authorizationSources.some(
      (authorizationSource) =>
        authorizationSource.publicId ===
        scopeSummary.value.authorizationPublicId,
    );

  if (!hasSelectedAuthorizationSource) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_LOCAL_CONTRACT_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      sourceSummary: sourceSummary.value,
      scopeSummary: scopeSummary.value,
      redeemCodePublicId: normalizeOptionalText(input.redeemCodePublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}
