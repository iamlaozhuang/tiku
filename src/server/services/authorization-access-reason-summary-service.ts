import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationAccessContextReasonDto,
  AuthorizationAccessReasonSummaryDto,
} from "../contracts/authorization-access-reason-summary-contract";
import type {
  AuthorizationAccessReasonCode,
  AuthorizationAccessReasonSummaryInput,
  AuthorizationEvidenceReferenceReasonCode,
} from "../models/authorization-access-reason-summary";
import type { AuthorizationContextReasonCode } from "../models/authorization-context-reason-summary";
import type { AuthorizationSourceReasonCode } from "../models/authorization-source-reason-summary";
import type { AuthorizationWindowReasonCode } from "../models/authorization-window-reason-summary";
import { normalizeAuthorizationAccessReasonSummaryInput } from "../validators/authorization-access-reason-summary";

const INVALID_AUTHORIZATION_ACCESS_REASON_SUMMARY_INPUT_CODE = 400023;

function resolveWindowReasonCode(
  input: AuthorizationAccessReasonSummaryInput,
): AuthorizationWindowReasonCode {
  const startsAtTime = new Date(input.windowReason.startsAt).getTime();
  const currentAtTime = new Date(input.windowReason.currentAt).getTime();

  if (currentAtTime < startsAtTime) {
    return "authorization_window_not_started";
  }

  if (input.windowReason.expiresAt === null) {
    return "authorization_window_open_ended";
  }

  const expiresAtTime = new Date(input.windowReason.expiresAt).getTime();

  return currentAtTime > expiresAtTime
    ? "authorization_window_expired"
    : "authorization_window_within_window";
}

function resolveContextReasonCode(
  input: AuthorizationAccessReasonSummaryInput,
  context:
    | AuthorizationAccessReasonSummaryInput["contextReason"]["paperContext"]
    | AuthorizationAccessReasonSummaryInput["contextReason"]["mockExamContext"],
): AuthorizationContextReasonCode | null {
  if (context === null) {
    return null;
  }

  return context.profession === input.contextReason.authorizationProfession &&
    context.level === input.contextReason.authorizationLevel
    ? "context_matches_authorization"
    : "context_mismatch";
}

function mapContextReasonToDto(
  input: AuthorizationAccessReasonSummaryInput,
): AuthorizationAccessContextReasonDto {
  return {
    paperReasonCode: resolveContextReasonCode(
      input,
      input.contextReason.paperContext,
    ),
    mockExamReasonCode: resolveContextReasonCode(
      input,
      input.contextReason.mockExamContext,
    ),
  };
}

function resolveAggregateContextReasonCode(
  contextReason: AuthorizationAccessContextReasonDto,
): AuthorizationContextReasonCode | null {
  const reasonCodes = [
    contextReason.paperReasonCode,
    contextReason.mockExamReasonCode,
  ];

  if (reasonCodes.includes("context_mismatch")) {
    return "context_mismatch";
  }

  return reasonCodes.includes("context_matches_authorization")
    ? "context_matches_authorization"
    : null;
}

function resolveSelectedAuthorizationSource(
  input: AuthorizationAccessReasonSummaryInput,
) {
  return input.sourceReason.authorizationSources.find(
    (authorizationSource) =>
      authorizationSource.publicId === input.authorizationPublicId,
  );
}

function resolveSourceReasonCode(
  input: AuthorizationAccessReasonSummaryInput,
): AuthorizationSourceReasonCode {
  const selectedAuthorization = resolveSelectedAuthorizationSource(input);

  if (selectedAuthorization?.status === "active") {
    return "selected_authorization_active";
  }

  return "selected_authorization_inactive";
}

function resolveEvidenceReferenceReasonCode(
  input: AuthorizationAccessReasonSummaryInput,
): AuthorizationEvidenceReferenceReasonCode {
  return [
    input.redeemCodePublicId,
    input.auditLogPublicId,
    input.aiCallLogPublicId,
  ].some((publicId) => publicId !== null)
    ? "redacted_references_present"
    : "redacted_references_missing";
}

function appendUniqueReasonCode(
  reasonCodes: AuthorizationAccessReasonCode[],
  reasonCode: AuthorizationAccessReasonCode | null,
): AuthorizationAccessReasonCode[] {
  if (reasonCode === null || reasonCodes.includes(reasonCode)) {
    return reasonCodes;
  }

  return [...reasonCodes, reasonCode];
}

function resolveReasonCodes(
  input: AuthorizationAccessReasonSummaryInput,
): AuthorizationAccessReasonCode[] {
  const contextReason = mapContextReasonToDto(input);

  return [
    resolveSourceReasonCode(input),
    resolveWindowReasonCode(input),
    resolveAggregateContextReasonCode(contextReason),
    resolveEvidenceReferenceReasonCode(input),
  ].reduce<AuthorizationAccessReasonCode[]>(appendUniqueReasonCode, []);
}

function mapAuthorizationAccessReasonSummaryToDto(
  input: AuthorizationAccessReasonSummaryInput,
): AuthorizationAccessReasonSummaryDto {
  const selectedAuthorization = resolveSelectedAuthorizationSource(input);
  const sourceReasonCode = resolveSourceReasonCode(input);
  const windowReasonCode = resolveWindowReasonCode(input);

  if (selectedAuthorization === undefined) {
    throw new Error("selected authorization must be validated before mapping.");
  }

  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    reasonStatus: "reason_summary_only",
    reasonCodes: resolveReasonCodes(input),
    sourceReason: {
      selectedAuthorizationPublicId: input.authorizationPublicId,
      sourceReasonCode,
    },
    windowReason: {
      windowReasonCode,
    },
    contextReason: mapContextReasonToDto(input),
    evidenceReferences: {
      redeemCodeReference: {
        publicId: input.redeemCodePublicId,
        redactionStatus: "redacted",
        referenceStatus: "redacted_reference",
      },
      auditLogPublicId: input.auditLogPublicId,
      aiCallLogPublicId: input.aiCallLogPublicId,
      redactionStatus: "redacted",
      referenceStatus: "redacted_reference",
    },
  };
}

export function buildAuthorizationAccessReasonSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationAccessReasonSummaryDto | null> {
  const authorizationAccessReasonSummaryInput =
    normalizeAuthorizationAccessReasonSummaryInput(input);

  if (!authorizationAccessReasonSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_ACCESS_REASON_SUMMARY_INPUT_CODE,
      authorizationAccessReasonSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationAccessReasonSummaryToDto(
      authorizationAccessReasonSummaryInput.value,
    ),
  );
}
