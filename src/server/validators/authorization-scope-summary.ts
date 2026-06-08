import { professionValues, type Profession } from "../models/auth";
import type {
  AuthorizationScopeContext,
  AuthorizationScopeSummaryInput,
} from "../models/authorization-scope-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationScopeSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationScopeSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_SCOPE_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization scope summary input.";

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

function normalizeScopeContext(
  value: unknown,
): AuthorizationScopeContext | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const level = normalizePositiveInteger(value.level);

  if (publicId === null || !isProfession(value.profession) || level === null) {
    return undefined;
  }

  return {
    publicId,
    profession: value.profession,
    level,
  };
}

export function normalizeAuthorizationScopeSummaryInput(
  input: unknown,
): AuthorizationScopeSummaryValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SCOPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationPublicId = normalizeRequiredText(
    input.authorizationPublicId,
  );
  const level = normalizePositiveInteger(input.level);
  const paperScope = normalizeScopeContext(input.paperScope);
  const mockExamScope = normalizeScopeContext(input.mockExamScope);

  if (
    userPublicId === null ||
    authorizationPublicId === null ||
    !isAuthorizationType(input.authorizationType) ||
    !isProfession(input.profession) ||
    level === null ||
    paperScope === undefined ||
    mockExamScope === undefined
  ) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_SCOPE_SUMMARY_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      userPublicId,
      authorizationPublicId,
      authorizationType: input.authorizationType,
      profession: input.profession,
      level,
      paperScope,
      mockExamScope,
      auditLogPublicId: normalizeOptionalText(input.auditLogPublicId),
      aiCallLogPublicId: normalizeOptionalText(input.aiCallLogPublicId),
    },
  };
}
