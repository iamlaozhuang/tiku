import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  AuthorizationContextReasonSummaryDto,
  AuthorizationReasonContextDto,
} from "../contracts/authorization-context-reason-summary-contract";
import type {
  AuthorizationContextReasonCode,
  AuthorizationContextReasonSummaryInput,
  AuthorizationReasonContextInput,
} from "../models/authorization-context-reason-summary";
import { normalizeAuthorizationContextReasonSummaryInput } from "../validators/authorization-context-reason-summary";

const INVALID_AUTHORIZATION_CONTEXT_REASON_SUMMARY_INPUT_CODE = 400021;

function resolveContextReasonCode(
  input: AuthorizationContextReasonSummaryInput,
  context: AuthorizationReasonContextInput,
): AuthorizationContextReasonCode {
  return context.profession === input.authorizationProfession &&
    context.level === input.authorizationLevel
    ? "context_matches_authorization"
    : "context_mismatch";
}

function mapReasonContextToDto(
  input: AuthorizationContextReasonSummaryInput,
  context: AuthorizationReasonContextInput | null,
): AuthorizationReasonContextDto | null {
  if (context === null) {
    return null;
  }

  return {
    publicId: context.publicId,
    profession: context.profession,
    level: context.level,
    contextReasonCode: resolveContextReasonCode(input, context),
  };
}

function mapAuthorizationContextReasonSummaryToDto(
  input: AuthorizationContextReasonSummaryInput,
): AuthorizationContextReasonSummaryDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    reasonStatus: "reason_summary_only",
    paper: mapReasonContextToDto(input, input.paperContext),
    mockExam: mapReasonContextToDto(input, input.mockExamContext),
  };
}

export function buildAuthorizationContextReasonSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationContextReasonSummaryDto | null> {
  const authorizationContextReasonSummaryInput =
    normalizeAuthorizationContextReasonSummaryInput(input);

  if (!authorizationContextReasonSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_CONTEXT_REASON_SUMMARY_INPUT_CODE,
      authorizationContextReasonSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationContextReasonSummaryToDto(
      authorizationContextReasonSummaryInput.value,
    ),
  );
}
