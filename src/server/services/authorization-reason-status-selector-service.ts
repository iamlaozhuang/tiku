import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationReasonStatusSelectorDto } from "../contracts/authorization-reason-status-selector-contract";
import type { AuthorizationReasonStatusSelectorInput } from "../models/authorization-reason-status-selector";
import type { AuthorizationReasonStatusViewModelRowDto } from "../contracts/authorization-reason-status-view-model-contract";
import { normalizeAuthorizationReasonStatusSelectorInput } from "../validators/authorization-reason-status-selector";

const INVALID_AUTHORIZATION_REASON_STATUS_SELECTOR_INPUT_CODE = 400036;

function resolveHighestSeverity(
  statusRows: AuthorizationReasonStatusViewModelRowDto[],
  fallbackSeverity: AuthorizationReasonStatusSelectorInput["severity"],
) {
  return statusRows.some((statusRow) => statusRow.severity === "attention")
    ? "attention"
    : fallbackSeverity;
}

function resolvePrimaryStatusRow(
  statusRows: AuthorizationReasonStatusViewModelRowDto[],
): AuthorizationReasonStatusViewModelRowDto {
  const attentionRow = statusRows
    .filter((statusRow) => statusRow.severity === "attention")
    .sort((leftStatusRow, rightStatusRow) => {
      return leftStatusRow.sortOrder - rightStatusRow.sortOrder;
    })[0];

  if (attentionRow !== undefined) {
    return attentionRow;
  }

  return [...statusRows].sort((leftStatusRow, rightStatusRow) => {
    return leftStatusRow.sortOrder - rightStatusRow.sortOrder;
  })[0] as AuthorizationReasonStatusViewModelRowDto;
}

export function buildAuthorizationReasonStatusSelectorReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonStatusSelectorDto | null> {
  const authorizationReasonStatusSelectorInput =
    normalizeAuthorizationReasonStatusSelectorInput(input);

  if (!authorizationReasonStatusSelectorInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_STATUS_SELECTOR_INPUT_CODE,
      authorizationReasonStatusSelectorInput.message,
    );
  }

  const primaryStatusRow = resolvePrimaryStatusRow(
    authorizationReasonStatusSelectorInput.value.statusRows,
  );

  return createSuccessResponse({
    selectorStatus: "local_selector_only",
    sourceViewModelStatus:
      authorizationReasonStatusSelectorInput.value.viewModelStatus,
    selectorKey: "authorization.reason.selector.status",
    selectedAuthorizationPublicId:
      authorizationReasonStatusSelectorInput.value
        .selectedAuthorizationPublicId,
    severity: resolveHighestSeverity(
      authorizationReasonStatusSelectorInput.value.statusRows,
      authorizationReasonStatusSelectorInput.value.severity,
    ),
    primaryReasonCode: primaryStatusRow.reasonCode,
    statusRowCount:
      authorizationReasonStatusSelectorInput.value.statusRows.length,
  });
}
