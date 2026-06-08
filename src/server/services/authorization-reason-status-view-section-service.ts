import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonStatusViewSectionDto,
  AuthorizationReasonStatusViewSectionItemDto,
} from "../contracts/authorization-reason-status-view-section-contract";
import type {
  AuthorizationReasonStatusViewSectionInput,
  AuthorizationReasonStatusViewSectionReasonItemInput,
} from "../models/authorization-reason-status-view-section";
import { normalizeAuthorizationReasonStatusViewSectionInput } from "../validators/authorization-reason-status-view-section";

const INVALID_AUTHORIZATION_REASON_STATUS_VIEW_SECTION_INPUT_CODE = 400028;

function isWindowReasonItem(
  reasonItem: AuthorizationReasonStatusViewSectionReasonItemInput,
): boolean {
  return reasonItem.reasonCode.startsWith("authorization_window_");
}

function resolveSectionSeverity(
  statusItems: AuthorizationReasonStatusViewSectionItemDto[],
) {
  return statusItems.some((statusItem) => statusItem.severity === "attention")
    ? "attention"
    : "info";
}

function mapStatusItems(
  input: AuthorizationReasonStatusViewSectionInput,
): AuthorizationReasonStatusViewSectionItemDto[] {
  const sourceItem: AuthorizationReasonStatusViewSectionItemDto = {
    itemKey: "authorization.reason.status.source",
    reasonCode: input.sourcePresentation.sourceReasonCode,
    presentationKey: input.sourcePresentation.presentationKey,
    severity: input.sourcePresentation.severity,
    sortOrder: 1,
  };

  const windowItems = input.reasonItems
    .filter(isWindowReasonItem)
    .map((reasonItem, index) => ({
      itemKey: "authorization.reason.status.window",
      reasonCode: reasonItem.reasonCode,
      presentationKey: reasonItem.presentationKey,
      severity: reasonItem.severity,
      sortOrder: index + 2,
    }));

  return [sourceItem, ...windowItems];
}

export function buildAuthorizationReasonStatusViewSectionReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonStatusViewSectionDto | null> {
  const authorizationReasonStatusViewSectionInput =
    normalizeAuthorizationReasonStatusViewSectionInput(input);

  if (!authorizationReasonStatusViewSectionInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_STATUS_VIEW_SECTION_INPUT_CODE,
      authorizationReasonStatusViewSectionInput.message,
    );
  }

  const statusItems = mapStatusItems(
    authorizationReasonStatusViewSectionInput.value,
  );

  return createSuccessResponse({
    sectionStatus: "local_view_section_only",
    sectionKey: "authorization.reason.view_section.status",
    sectionSeverity: resolveSectionSeverity(statusItems),
    selectedAuthorizationPublicId:
      authorizationReasonStatusViewSectionInput.value.sourcePresentation
        .selectedAuthorizationPublicId,
    statusItems,
  });
}
