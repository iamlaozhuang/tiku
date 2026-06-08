import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationReasonPresentationSummaryDto,
  AuthorizationReasonSourcePresentationDto,
} from "../contracts/authorization-reason-presentation-summary-contract";
import type { AuthorizationReasonPresentationSummaryInput } from "../models/authorization-reason-presentation-summary";
import { normalizeAuthorizationReasonPresentationSummaryInput } from "../validators/authorization-reason-presentation-summary";
import { buildAuthorizationReasonContextPresentationReadModel } from "./authorization-reason-context-presentation-service";
import { buildAuthorizationReasonEvidencePresentationReadModel } from "./authorization-reason-evidence-presentation-service";
import { buildAuthorizationReasonItemPresentationReadModel } from "./authorization-reason-item-presentation-service";

const INVALID_AUTHORIZATION_REASON_PRESENTATION_SUMMARY_INPUT_CODE = 400027;

function mapSourcePresentation(
  input: AuthorizationReasonPresentationSummaryInput,
): AuthorizationReasonSourcePresentationDto {
  return {
    selectedAuthorizationPublicId:
      input.sourceReason.selectedAuthorizationPublicId,
    sourceReasonCode: input.sourceReason.sourceReasonCode,
    presentationKey: `authorization.reason.source.${input.sourceReason.sourceReasonCode}`,
    severity:
      input.sourceReason.sourceReasonCode === "selected_authorization_inactive"
        ? "attention"
        : "info",
  };
}

function mapPresentationSummary(
  input: AuthorizationReasonPresentationSummaryInput,
): AuthorizationReasonPresentationSummaryDto {
  const reasonItems = buildAuthorizationReasonItemPresentationReadModel({
    reasonStatus: input.reasonStatus,
    reasonCodes: input.reasonCodes,
  });
  const contextPresentation =
    buildAuthorizationReasonContextPresentationReadModel({
      reasonStatus: input.reasonStatus,
      paperContext:
        input.contextReason.paperReasonCode === null
          ? null
          : {
              publicId: input.paperContextPublicId,
              reasonCode: input.contextReason.paperReasonCode,
            },
      mockExamContext:
        input.contextReason.mockExamReasonCode === null
          ? null
          : {
              publicId: input.mockExamContextPublicId,
              reasonCode: input.contextReason.mockExamReasonCode,
            },
    });
  const evidencePresentation =
    buildAuthorizationReasonEvidencePresentationReadModel({
      reasonStatus: input.reasonStatus,
      redeemCodePublicId: input.evidenceReferences.redeemCodeReference.publicId,
      auditLogPublicId: input.evidenceReferences.auditLogPublicId,
      aiCallLogPublicId: input.evidenceReferences.aiCallLogPublicId,
    });

  if (
    reasonItems.data === null ||
    contextPresentation.data === null ||
    evidencePresentation.data === null
  ) {
    throw new Error(
      "presentation summary input must be validated before mapping.",
    );
  }

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    reasonStatus: input.reasonStatus,
    presentationStatus: "local_presentation_only",
    sourcePresentation: mapSourcePresentation(input),
    reasonItems: reasonItems.data.reasonItems,
    contextPresentation: contextPresentation.data,
    evidencePresentation: evidencePresentation.data,
  };
}

export function buildAuthorizationReasonPresentationSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationReasonPresentationSummaryDto | null> {
  const authorizationReasonPresentationSummaryInput =
    normalizeAuthorizationReasonPresentationSummaryInput(input);

  if (!authorizationReasonPresentationSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_REASON_PRESENTATION_SUMMARY_INPUT_CODE,
      authorizationReasonPresentationSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapPresentationSummary(authorizationReasonPresentationSummaryInput.value),
  );
}
