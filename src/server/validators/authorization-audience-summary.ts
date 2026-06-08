import type {
  AuthorizationAudienceSourceInput,
  AuthorizationAudienceSummaryInput,
} from "../models/authorization-audience-summary";
import type { AuthorizationContextSourceType } from "../models/authorization-context";

export type AuthorizationAudienceSummaryValidationResult =
  | {
      success: true;
      value: AuthorizationAudienceSummaryInput;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_AUTHORIZATION_AUDIENCE_SUMMARY_INPUT_MESSAGE =
  "Invalid authorization audience summary input.";

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

function normalizeAuthorizationType(
  value: unknown,
): AuthorizationContextSourceType | null {
  if (value === "personal_auth" || value === "org_auth") {
    return value;
  }

  return null;
}

function normalizeAuthorizationAudienceSource(
  value: unknown,
): AuthorizationAudienceSourceInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const publicId = normalizeRequiredText(value.publicId);
  const authorizationType = normalizeAuthorizationType(value.authorizationType);
  const organizationPublicId = normalizeOptionalText(
    value.organizationPublicId,
  );

  if (publicId === null || authorizationType === null) {
    return null;
  }

  if (authorizationType === "org_auth" && organizationPublicId === null) {
    return null;
  }

  if (authorizationType === "personal_auth" && organizationPublicId !== null) {
    return null;
  }

  return {
    publicId,
    authorizationType,
    organizationPublicId,
  };
}

function isAuthorizationAudienceSourceInput(
  value: AuthorizationAudienceSourceInput | null,
): value is AuthorizationAudienceSourceInput {
  return value !== null;
}

export function normalizeAuthorizationAudienceSummaryInput(
  input: unknown,
): AuthorizationAudienceSummaryValidationResult {
  if (!isRecord(input) || !Array.isArray(input.authorizationSources)) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_AUDIENCE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const userPublicId = normalizeRequiredText(input.userPublicId);
  const authorizationSources = input.authorizationSources.map(
    normalizeAuthorizationAudienceSource,
  );

  if (userPublicId === null || authorizationSources.length === 0) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_AUDIENCE_SUMMARY_INPUT_MESSAGE,
    };
  }

  const normalizedAuthorizationSources = authorizationSources.filter(
    isAuthorizationAudienceSourceInput,
  );

  if (normalizedAuthorizationSources.length !== authorizationSources.length) {
    return {
      success: false,
      message: INVALID_AUTHORIZATION_AUDIENCE_SUMMARY_INPUT_MESSAGE,
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
