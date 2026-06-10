import {
  authStatusValues,
  professionValues,
  type AuthStatus,
  type Profession,
} from "../models/auth";
import type { AuthorizationContextSourceType } from "../models/authorization-context";
import type {
  AuthorizationSourceTypeSummaryInput,
  AuthorizationSourceTypeSummarySource,
} from "../models/authorization-source-type-summary";

export type AuthorizationSourceTypeSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationSourceTypeSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_SOURCE_TYPE_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization source type summary input.";

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

function normalizeAuthorizationType(
  value: unknown,
): AuthorizationContextSourceType | null {
  if (value === "personal_auth" || value === "org_auth") {
    return value;
  }

  return null;
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
): AuthorizationSourceTypeSummarySource | null {
  if (!isRecord(value)) {
    return null;
  }

  const authorizationType = normalizeAuthorizationType(value.authorizationType);
  const publicId = normalizeRequiredText(value.publicId);
  const level = normalizePositiveInteger(value.level);
  const startsAt = normalizeDate(value.startsAt);
  const expiresAt = normalizeDate(value.expiresAt);
  const organizationPublicId = normalizeOptionalText(
    value.organizationPublicId,
  );

  if (
    authorizationType === null ||
    publicId === null ||
    !isProfession(value.profession) ||
    level === null ||
    startsAt === null ||
    expiresAt === null ||
    expiresAt <= startsAt ||
    !isAuthStatus(value.status)
  ) {
    return null;
  }

  if (
    (authorizationType === "personal_auth" && organizationPublicId !== null) ||
    (authorizationType === "org_auth" && organizationPublicId === null)
  ) {
    return null;
  }

  return {
    authorizationType,
    publicId,
    profession: value.profession,
    level,
    startsAt,
    expiresAt,
    status: value.status,
    organizationPublicId,
  };
}

function isAuthorizationSourceTypeSummarySource(
  value: AuthorizationSourceTypeSummarySource | null,
): value is AuthorizationSourceTypeSummarySource {
  return value !== null;
}

export function normalizeAuthorizationSourceTypeSummaryInput(
  input: unknown,
): AuthorizationSourceTypeSummaryValidationResult {
  if (!isRecord(input) || !Array.isArray(input.authorizationSources)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_TYPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationSources = input.authorizationSources.map(
    normalizeAuthorizationSource,
  );

  if (userPublicId === null || authorizationSources.length === 0) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_TYPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const normalizedAuthorizationSources = authorizationSources.filter(
    isAuthorizationSourceTypeSummarySource,
  );

  if (normalizedAuthorizationSources.length !== authorizationSources.length) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_TYPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationSources: normalizedAuthorizationSources,
    },
  };
}
