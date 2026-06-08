import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { AuthorizationWindowSummaryDto } from "../contracts/authorization-window-summary-contract";
import type {
  AuthorizationWindowStatus,
  AuthorizationWindowSummaryInput,
} from "../models/authorization-window-summary";
import { normalizeAuthorizationWindowSummaryInput } from "../validators/authorization-window-summary";

const INVALID_AUTHORIZATION_WINDOW_SUMMARY_INPUT_CODE = 400016;

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

function mapAuthorizationWindowSummaryToDto(
  input: AuthorizationWindowSummaryInput,
): AuthorizationWindowSummaryDto {
  return {
    userPublicId: input.userPublicId,
    authorizationPublicId: input.authorizationPublicId,
    displayStatus: "display_only",
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    currentAt: input.currentAt,
    windowStatus: resolveAuthorizationWindowStatus(input),
  };
}

export function buildAuthorizationWindowSummaryReadModel(
  input: unknown,
): ApiResponse<AuthorizationWindowSummaryDto | null> {
  const authorizationWindowSummaryInput =
    normalizeAuthorizationWindowSummaryInput(input);

  if (!authorizationWindowSummaryInput.success) {
    return createErrorResponse(
      INVALID_AUTHORIZATION_WINDOW_SUMMARY_INPUT_CODE,
      authorizationWindowSummaryInput.message,
    );
  }

  return createSuccessResponse(
    mapAuthorizationWindowSummaryToDto(authorizationWindowSummaryInput.value),
  );
}
