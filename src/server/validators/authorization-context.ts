import {
  authStatusValues,
  professionValues,
  type AuthStatus,
  type Profession,
} from "../models/auth";
import type {
  AuthorizationContextInput,
  AuthorizationContextSource,
  AuthorizationContextSourceType,
} from "../models/authorization-context";

export type AuthorizationContextValidationResult =
  | {
      success: true;
      value: AuthorizationContextInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_CONTEXT_INPUT_MESSAGE =
  "Invalid authorization context input.";

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

function isAuthorizationContextSourceType(
  value: unknown,
): value is AuthorizationContextSourceType {
  return value === "personal_auth" || value === "org_auth";
}

function normalizeAuthorizationSource(
  value: unknown,
): AuthorizationContextSource | null {
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
  const redeemCodePublicId = normalizeOptionalText(value.redeemCodePublicId);

  if (
    !isAuthorizationContextSourceType(authorizationType) ||
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
    redeemCodePublicId,
  };
}

function normalizeAuthorizationSources(
  value: unknown,
): AuthorizationContextSource[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const authorizationSources = value.map(normalizeAuthorizationSource);

  return authorizationSources.includes(null)
    ? null
    : (authorizationSources as AuthorizationContextSource[]);
}

export function normalizeAuthorizationContextInput(
  input: unknown,
): AuthorizationContextValidationResult {
  if (!isRecord(input) || !isRecord(input.scope)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_CONTEXT_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationSources = normalizeAuthorizationSources(
    input.authorizationSources,
  );
  const evidenceReferences = isRecord(input.evidenceReferences)
    ? input.evidenceReferences
    : {};

  if (userPublicId === null || authorizationSources === null) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_CONTEXT_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationSources,
      scope: {
        paperPublicId: normalizeOptionalText(input.scope.paperPublicId),
        mockExamPublicId: normalizeOptionalText(input.scope.mockExamPublicId),
      },
      evidenceReferences: {
        auditLogPublicId: normalizeOptionalText(
          evidenceReferences.auditLogPublicId,
        ),
        aiCallLogPublicId: normalizeOptionalText(
          evidenceReferences.aiCallLogPublicId,
        ),
      },
    },
  };
}
