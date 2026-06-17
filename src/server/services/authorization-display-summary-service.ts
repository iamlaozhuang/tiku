import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationDisplayContextDto,
  AuthorizationDisplaySummaryDto,
  AuthorizationDisplayWindowDto,
} from "../contracts/authorization-display-summary-contract";
import type { AuthorizationAudienceSummaryInput } from "../models/authorization-audience-summary";
import type {
  AuthorizationDisplayContextInput,
  AuthorizationDisplaySummaryInput,
} from "../models/authorization-display-summary";
import type { AuthorizationEvidenceReferenceSummaryInput } from "../models/authorization-evidence-reference-summary";
import type {
  AuthorizationWindowStatus,
  AuthorizationWindowSummaryInput,
} from "../models/authorization-window-summary";
import { normalizeAuthorizationDisplaySummaryInput } from "../validators/authorization-display-summary";

const INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_CODE = 400019;

function resolveAuthorizationWindowStatus(
  input: AuthorizationWindowSummaryInput,
): AuthorizationWindowStatus {
  const startsAtTime = new Date(input.startsAt).getTime();
  const currentAtTime = new Date(input.currentAt).getTime();

  if (currentAtTime < startsAtTime) {
    return "not_started";
  }

  if (input.expiresAt === null) {
    return "open_ended";
  }

  const expiresAtTime = new Date(input.expiresAt).getTime();

  return currentAtTime > expiresAtTime ? "expired" : "within_window";
}

function mapAuthorizationDisplayWindowToDto(
  input: AuthorizationWindowSummaryInput,
): AuthorizationDisplayWindowDto {
  return {
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    currentAt: input.currentAt,
    windowStatus: resolveAuthorizationWindowStatus(input),
  };
}

function mapAuthorizationDisplayContextToDto(
  input: AuthorizationDisplayContextInput | null,
): AuthorizationDisplayContextDto | null {
  if (input === null) {
    return null;
  }

  return {
    publicId: input.publicId,
    profession: input.profession,
    level: input.level,
  };
}

function countPresentEvidenceReferences(
  input: AuthorizationEvidenceReferenceSummaryInput,
): number {
  return [
    input.redeemCodePublicId,
    input.auditLogPublicId,
    input.aiCallLogPublicId,
  ].filter((publicId) => publicId !== null).length;
}

function mapAudienceSummary(input: AuthorizationAudienceSummaryInput) {
  const personalAuthCount = input.authorizationSources.filter(
    (authorizationSource) =>
      authorizationSource.authorizationType === "personal_auth",
  ).length;
  const orgAuthCount = input.authorizationSources.filter(
    (authorizationSource) =>
      authorizationSource.authorizationType === "org_auth",
  ).length;
  const organizationReferenceCount = input.authorizationSources.filter(
    (authorizationSource) => authorizationSource.organizationPublicId !== null,
  ).length;

  return {
    totalCount: input.authorizationSources.length,
    personalAuthCount,
    orgAuthCount,
    organizationReferenceCount,
  };
}

function mapAuthorizationDisplaySummaryToDto(
  input: AuthorizationDisplaySummaryInput,
): AuthorizationDisplaySummaryDto {
  const totalReferenceCount = countPresentEvidenceReferences(
    input.evidenceReferenceSummary,
  );

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    readModelStatus: "read_model_only",
    displayStatus: "display_only",
    window: mapAuthorizationDisplayWindowToDto(input.windowSummary),
    audienceSummary: mapAudienceSummary(input.audienceSummary),
    evidenceSummary: {
      totalReferenceCount,
      missingReferenceCount: 3 - totalReferenceCount,
    },
    context: {
      contentAccessStatus: "display_only",
      paper: mapAuthorizationDisplayContextToDto(input.paperContext),
      mockExam: mapAuthorizationDisplayContextToDto(input.mockExamContext),
    },
  };
}

export function buildAuthorizationDisplaySummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationDisplaySummaryDto | null> {
  const authorizationDisplaySummaryInput =
    normalizeAuthorizationDisplaySummaryInput(input);

  if (!authorizationDisplaySummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_DISPLAY_SUMMARY_INPUT_CODE,
      authorizationDisplaySummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationDisplaySummaryToDto(authorizationDisplaySummaryInput.value),
  );
}
