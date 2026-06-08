import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationWindowReasonSummaryDto } from "../contracts/authorization-window-reason-summary-contract";
import type {
  AuthorizationWindowReasonCode,
  AuthorizationWindowReasonSummaryInput,
} from "../models/authorization-window-reason-summary";
import { normalizeAuthorizationWindowReasonSummaryInput } from "../validators/authorization-window-reason-summary";

const INVALID_AUTHORIZATION_WINDOW_REASON_SUMMARY_INPUT_CODE = 400020;

function resolveAuthorizationWindowReasonCode(
  input: AuthorizationWindowReasonSummaryInput,
): AuthorizationWindowReasonCode {
  const startsAtTime = new Date(input.startsAt).getTime();
  const currentAtTime = new Date(input.currentAt).getTime();

  if (currentAtTime < startsAtTime) {
    return "authorization_window_not_started";
  }

  if (input.expiresAt === null) {
    return "authorization_window_open_ended";
  }

  const expiresAtTime = new Date(input.expiresAt).getTime();

  return currentAtTime > expiresAtTime
    ? "authorization_window_expired"
    : "authorization_window_within_window";
}

function mapAuthorizationWindowReasonSummaryToDto(
  input: AuthorizationWindowReasonSummaryInput,
): AuthorizationWindowReasonSummaryDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    reasonStatus: "reason_summary_only",
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    currentAt: input.currentAt,
    windowReasonCode: resolveAuthorizationWindowReasonCode(input),
  };
}

export function buildAuthorizationWindowReasonSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationWindowReasonSummaryDto | null> {
  const authorizationWindowReasonSummaryInput =
    normalizeAuthorizationWindowReasonSummaryInput(input);

  if (!authorizationWindowReasonSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_WINDOW_REASON_SUMMARY_INPUT_CODE,
      authorizationWindowReasonSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationWindowReasonSummaryToDto(
      authorizationWindowReasonSummaryInput.value,
    ),
  );
}
