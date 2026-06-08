import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonStatusViewModelDto,
  AuthorizationReasonStatusViewModelRowDto,
} from "../contracts/authorization-reason-status-view-model-contract";
import type { AuthorizationReasonStatusViewModelStatusItemInput } from "../models/authorization-reason-status-view-model";
import { normalizeAuthorizationReasonStatusViewModelInput } from "../validators/authorization-reason-status-view-model";

const INVALID_AUTHORIZATION_REASON_STATUS_VIEW_MODEL_INPUT_CODE = 400032;

function resolveStatusRowKey(
  statusItem: AuthorizationReasonStatusViewModelStatusItemInput,
): AuthorizationReasonStatusViewModelRowDto["rowKey"] {
  return statusItem.itemKey === "authorization.reason.status.source"
    ? "authorization.reason.view_model.status.source"
    : "authorization.reason.view_model.status.window";
}

function mapStatusRow(
  statusItem: AuthorizationReasonStatusViewModelStatusItemInput,
): AuthorizationReasonStatusViewModelRowDto {
  return {
    rowKey: resolveStatusRowKey(statusItem),
    reasonCode: statusItem.reasonCode,
    presentationKey: statusItem.presentationKey,
    severity: statusItem.severity,
    sortOrder: statusItem.sortOrder,
  };
}

export function buildAuthorizationReasonStatusViewModelReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonStatusViewModelDto | null> {
  const authorizationReasonStatusViewModelInput =
    normalizeAuthorizationReasonStatusViewModelInput(input);

  if (!authorizationReasonStatusViewModelInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_STATUS_VIEW_MODEL_INPUT_CODE,
      authorizationReasonStatusViewModelInput.message,
    );
  }

  const statusRows = [
    ...authorizationReasonStatusViewModelInput.value.statusItems,
  ]
    .sort((leftStatusItem, rightStatusItem) => {
      return leftStatusItem.sortOrder - rightStatusItem.sortOrder;
    })
    .map(mapStatusRow);

  return createSuccessResponse({
    viewModelStatus: "local_view_model_only",
    sourceSectionStatus:
      authorizationReasonStatusViewModelInput.value.sectionStatus,
    modelKey: "authorization.reason.view_model.status",
    severity: authorizationReasonStatusViewModelInput.value.sectionSeverity,
    selectedAuthorizationPublicId:
      authorizationReasonStatusViewModelInput.value
        .selectedAuthorizationPublicId,
    statusRows,
  });
}
