import type { AuthorizationAccessReasonSummaryInput } from "../models/authorization-access-reason-summary";
import { normalizeAuthorizationContextReasonSummaryInput } from "./authorization-context-reason-summary";
import { normalizeAuthorizationSourceReasonSummaryInput } from "./authorization-source-reason-summary";
import { normalizeAuthorizationWindowReasonSummaryInput } from "./authorization-window-reason-summary";

export type AuthorizationAccessReasonSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationAccessReasonSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_ACCESS_REASON_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization access reason summary input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

export function normalizeAuthorizationAccessReasonSummaryInput(
  input: unknown,
): AuthorizationAccessReasonSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_ACCESS_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  const windowReason = normalizeAuthorizationWindowReasonSummaryInput({
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    currentAt: input.currentAt,
  });
  const contextReason = normalizeAuthorizationContextReasonSummaryInput({
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    authorizationProfession: input.authorizationProfession,
    authorizationLevel: input.authorizationLevel,
    paperContext: input.paperContext,
    mockExamContext: input.mockExamContext,
  });
  const sourceReason = normalizeAuthorizationSourceReasonSummaryInput({
    userPublicId: input.userPublicId,
    selectedAuthorizationPublicId: input.authorizationPublicId,
    authorizationSources: input.authorizationSources,
  });

  if (
    !windowReason.success ||
    !contextReason.success ||
    !sourceReason.success
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_ACCESS_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  const hasSelectedAuthorization = sourceReason.value.authorizationSources.some(
    (authorizationSource) =>
      authorizationSource.publicId === windowReason.value.authorizationPublicId,
  );

  if (!hasSelectedAuthorization) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_ACCESS_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId: windowReason.value.userPublicId,
      authorizationPublicId: windowReason.value.authorizationPublicId,
      windowReason: windowReason.value,
      contextReason: contextReason.value,
      sourceReason: sourceReason.value,
      redeemCodePublicId: normalizeOptionalText(input.redeemCodePublicId),
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}
