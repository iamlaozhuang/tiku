import {
  authStatusValues,
  professionValues,
  type AuthStatus,
  type Profession,
} from "../models/auth";
import type { AuthorizationContextSourceType } from "../models/authorization-context";
import type {
  AuthorizationSourceReasonSummaryInput,
  AuthorizationSourceReasonSummarySource,
} from "../models/authorization-source-reason-summary";

export type AuthorizationSourceReasonSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationSourceReasonSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_SOURCE_REASON_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization source reason summary input.";

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

function normalizePositiveInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeDate(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isAuthorizationType(
  value: unknown,
): value is AuthorizationContextSourceType {
  return value === "personal_auth" || value === "org_auth";
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" && professionValues.includes(value as Profession)
  );
}

function isAuthStatus(value: unknown): value is AuthStatus {
  return (
    typeof value === "string" && authStatusValues.includes(value as AuthStatus)
  );
}

function normalizeAuthorizationSource(
  value: unknown,
): AuthorizationSourceReasonSummarySource | null {
  if (!isRecord(value)) {
    return null;
  }

  const authorizationType = value.authorizationType;
  const publicId = normalizeRequiredText(value.publicId);
  const level = normalizePositiveInteger(value.level);
  const startsAt = normalizeDate(value.startsAt);
  const expiresAt = normalizeDate(value.expiresAt);
  const organizationPublicId = normalizeOptionalText(
    value.organizationPublicId,
  );

  if (
    !isAuthorizationType(authorizationType) ||
    publicId === null ||
    !isProfession(value.profession) ||
    level === null ||
    startsAt === null ||
    expiresAt === null ||
    expiresAt <= startsAt ||
    !isAuthStatus(value.status) ||
    (authorizationType === "org_auth" && organizationPublicId === null)
  ) {
    return null;
  }

  return {
    publicId,
    authorizationType,
    profession: value.profession,
    level,
    startsAt,
    expiresAt,
    status: value.status,
    organizationPublicId:
      authorizationType === "org_auth" ? organizationPublicId : null,
    redeemCodePublicId: normalizeOptionalText(value.redeemCodePublicId),
  };
}

function normalizeAuthorizationSources(
  value: unknown,
): AuthorizationSourceReasonSummarySource[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const authorizationSources = value.map(normalizeAuthorizationSource);

  return authorizationSources.includes(null)
    ? null
    : (authorizationSources as AuthorizationSourceReasonSummarySource[]);
}

export function normalizeAuthorizationSourceReasonSummaryInput(
  input: unknown,
): AuthorizationSourceReasonSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const selectedAuthorizationPublicId = normalizeRequiredText(
    input.selectedAuthorizationPublicId,
  );
  const authorizationSources = normalizeAuthorizationSources(
    input.authorizationSources,
  );

  if (
    userPublicId === null ||
    selectedAuthorizationPublicId === null ||
    authorizationSources === null
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_REASON_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      selectedAuthorizationPublicId,
      authorizationSources,
    },
  };
}
