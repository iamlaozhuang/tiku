import type { AuthorizationWindowSummaryInput } from "../models/authorization-window-summary";

export type AuthorizationWindowSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationWindowSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_WINDOW_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization window summary input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRequiredText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return normalizeRequiredText(value);
}

function normalizeIsoTimestamp(value: unknown): string | null {
  const text = normalizeRequiredText(value);

  if (text === null) {
    return null;
  }

  const timestamp = new Date(text);

  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function normalizeOptionalIsoTimestamp(value: unknown): string | null {
  const text = normalizeOptionalText(value);

  if (text === null) {
    return null;
  }

  return normalizeIsoTimestamp(text);
}

export function normalizeAuthorizationWindowSummaryInput(
  input: unknown,
): AuthorizationWindowSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_WINDOW_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const startsAt = normalizeIsoTimestamp(input.startsAt);
  const expiresAt = normalizeOptionalIsoTimestamp(input.expiresAt);
  const currentAt = normalizeIsoTimestamp(input.currentAt);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    startsAt === null ||
    currentAt === null
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_WINDOW_SUMMARY_INPUT_MESSAGE,
    };
  }

  if (
    expiresAt !== null &&
    new Date(expiresAt).getTime() <= new Date(startsAt).getTime()
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_WINDOW_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      startsAt,
      expiresAt,
      currentAt,
    },
  };
}
