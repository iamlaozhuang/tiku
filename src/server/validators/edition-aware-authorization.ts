import {
  authorizationEditionValues,
  professionValues,
  type AuthorizationEdition,
  type Profession,
} from "../models/auth";
import type { EditionAwareAuthorizationSource } from "../contracts/edition-aware-authorization-contract";

export type EditionAwareAuthorizationQuery = {
  profession: Profession | null;
  level: number | null;
  authorizationSource: EditionAwareAuthorizationSource | null;
  effectiveEdition: AuthorizationEdition | null;
};

export type EditionAwareAuthorizationQueryValidationResult =
  | {
      success: true;
      value: EditionAwareAuthorizationQuery;
    }
  | {
      success: false;
      message: string;
    };

const authorizationSourceValues = ["personal_auth", "org_auth"] as const;
const invalidEditionAwareAuthorizationQueryMessage =
  "Invalid edition-aware authorization query.";

function readQueryValue(
  input: URLSearchParams | Record<string, unknown>,
  key: string,
): string | null {
  if (input instanceof URLSearchParams) {
    const value = input.get(key);
    return value === null || value.trim() === "" ? null : value.trim();
  }

  const value = input[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue === "" ? null : normalizedValue;
}

function isProfession(value: string): value is Profession {
  return professionValues.includes(value as Profession);
}

function isAuthorizationSource(
  value: string,
): value is EditionAwareAuthorizationSource {
  return authorizationSourceValues.includes(
    value as EditionAwareAuthorizationSource,
  );
}

function isAuthorizationEdition(value: string): value is AuthorizationEdition {
  return authorizationEditionValues.includes(value as AuthorizationEdition);
}

function normalizeOptionalLevel(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return Number.NaN;
  }

  return Number(value);
}

export function normalizeEditionAwareAuthorizationQuery(
  input: URLSearchParams | Record<string, unknown>,
): EditionAwareAuthorizationQueryValidationResult {
  const profession = readQueryValue(input, "profession");
  const level = normalizeOptionalLevel(readQueryValue(input, "level"));
  const authorizationSource = readQueryValue(input, "authorizationSource");
  const effectiveEdition = readQueryValue(input, "effectiveEdition");

  if (
    Number.isNaN(level) ||
    (profession !== null && !isProfession(profession)) ||
    (authorizationSource !== null &&
      !isAuthorizationSource(authorizationSource)) ||
    (effectiveEdition !== null && !isAuthorizationEdition(effectiveEdition))
  ) {
    return {
      success: false,
      message: invalidEditionAwareAuthorizationQueryMessage,
    };
  }

  return {
    success: true,
    value: {
      profession,
      level,
      authorizationSource,
      effectiveEdition,
    },
  };
}
