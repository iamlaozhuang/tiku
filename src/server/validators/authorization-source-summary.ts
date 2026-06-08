import {
  authStatusValues,
  professionValues,
  type AuthStatus,
  type Profession,
} from "../models/auth";
import type {
  AuthorizationSourceSummaryInput,
  AuthorizationSourceSummarySource,
} from "../models/authorization-source-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationSourceSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationSourceSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_SOURCE_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization source summary input.";

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
): AuthorizationSourceSummarySource | null {
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
    authorizationType,
    publicId,
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
): AuthorizationSourceSummarySource[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const authorizationSources = value.map(normalizeAuthorizationSource);

  return authorizationSources.includes(null)
    ? null
    : (authorizationSources as AuthorizationSourceSummarySource[]);
}

export function normalizeAuthorizationSourceSummaryInput(
  input: unknown,
): AuthorizationSourceSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationSources = normalizeAuthorizationSources(
    input.authorizationSources,
  );

  if (userPublicId === null || authorizationSources === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SOURCE_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationSources,
    },
  };
}
