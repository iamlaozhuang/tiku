import type { AuthorizationReasonSelectorSummaryDto } from "../contracts/authorization-reason-selector-summary-contract";
import type { AuthorizationReasonSelectorApiContractInput } from "../models/authorization-reason-selector-api-contract";

export type AuthorizationReasonSelectorApiContractValidationResult =
  | {
      success: true;
      value: AuthorizationReasonSelectorApiContractInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_REASON_SELECTOR_API_CONTRACT_INPUT_MESSAGE =
  "Invalid authorization reason selector API contract input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length > 0 ? text : null;
}

function normalizeNullableText(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  return normalizeRequiredText(value);
}

function isLocalSelectorRecord(
  value: unknown,
  selectorKey: string,
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    value.selectorStatus === "local_selector_only" &&
    value.selectorKey === selectorKey
  );
}

function normalizeSelectorSummary(
  value: unknown,
): AuthorizationReasonSelectorSummaryDto | null {
  if (
    !isLocalSelectorRecord(value, "authorization.reason.selector.summary") ||
    value.sourceSummaryStatus !== "local_view_model_only" ||
    !isLocalSelectorRecord(
      value.statusSelector,
      "authorization.reason.selector.status",
    ) ||
    !isLocalSelectorRecord(
      value.contextSelector,
      "authorization.reason.selector.context",
    ) ||
    !isLocalSelectorRecord(
      value.evidenceSelector,
      "authorization.reason.selector.evidence",
    )
  ) {
    return null;
  }

  const userPublicId = normalizeRequiredText(value.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    value.authorizationPublicId,
  );
  const selectedAuthorizationPublicId = normalizeRequiredText(
    value.statusSelector.selectedAuthorizationPublicId,
  );

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    selectedAuthorizationPublicId !== authorizationPublicId
  ) {
    return null;
  }

  return {
    userPublicId,
    authorizationPublicId,
    selectorStatus: "local_selector_only",
    sourceSummaryStatus: "local_view_model_only",
    selectorKey: "authorization.reason.selector.summary",
    statusSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.status",
      selectedAuthorizationPublicId,
      severity:
        value.statusSelector.severity === "attention" ? "attention" : "info",
      primaryReasonCode:
        value.statusSelector.primaryReasonCode === "context_mismatch"
          ? "context_mismatch"
          : "selected_authorization_active",
      statusRowCount:
        typeof value.statusSelector.statusRowCount === "number"
          ? value.statusSelector.statusRowCount
          : 0,
    },
    contextSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.context",
      severity:
        value.contextSelector.severity === "attention" ? "attention" : "info",
      paperPublicId: normalizeNullableText(value.contextSelector.paperPublicId),
      mockExamPublicId: normalizeNullableText(
        value.contextSelector.mockExamPublicId,
      ),
      contextCardCount:
        typeof value.contextSelector.contextCardCount === "number"
          ? value.contextSelector.contextCardCount
          : 0,
    },
    evidenceSelector: {
      selectorStatus: "local_selector_only",
      sourceViewModelStatus: "local_view_model_only",
      selectorKey: "authorization.reason.selector.evidence",
      severity:
        value.evidenceSelector.severity === "attention" ? "attention" : "info",
      redeemCodePublicId: normalizeNullableText(
        value.evidenceSelector.redeemCodePublicId,
      ),
      auditLogPublicId: normalizeNullableText(
        value.evidenceSelector.auditLogPublicId,
      ),
      aiCallLogPublicId: normalizeNullableText(
        value.evidenceSelector.aiCallLogPublicId,
      ),
      evidenceChipCount:
        typeof value.evidenceSelector.evidenceChipCount === "number"
          ? value.evidenceSelector.evidenceChipCount
          : 0,
    },
  };
}

export function normalizeAuthorizationReasonSelectorApiContractInput(
  input: unknown,
): AuthorizationReasonSelectorApiContractValidationResult {
  if (!isRecord(input) || input.method !== "POST") {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_SELECTOR_API_CONTRACT_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const selectorSummary = normalizeSelectorSummary(input.selectorSummary);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    selectorSummary === null ||
    selectorSummary.userPublicId !== userPublicId ||
    selectorSummary.authorizationPublicId !== authorizationPublicId
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_REASON_SELECTOR_API_CONTRACT_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      method: "POST",
      selectorSummary,
    },
  };
}
