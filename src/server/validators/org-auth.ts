import {
  authorizationEditionValues,
  authScopeTypeValues,
  professionValues,
  type AuthorizationEdition,
  type AuthScopeType,
  type Profession,
} from "../models/auth";

export type NormalizedCreateOrgAuthInput = {
  name: string;
  purchaserOrganizationPublicId: string;
  authScopeType: AuthScopeType;
  profession: Profession;
  level: number;
  edition: AuthorizationEdition;
  accountQuota: number;
  startsAt: Date;
  expiresAt: Date;
  organizationPublicIds: string[];
};

type ValidationResult<TValue> =
  | {
      success: true;
      value: TValue;
    }
  | {
      success: false;
      message: string;
    };

const INVALID_ORG_AUTH_INPUT_MESSAGE = "Invalid org auth input.";

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

function isAuthScopeType(value: unknown): value is AuthScopeType {
  return (
    typeof value === "string" &&
    authScopeTypeValues.includes(value as AuthScopeType)
  );
}

function isProfession(value: unknown): value is Profession {
  return (
    typeof value === "string" && professionValues.includes(value as Profession)
  );
}

function normalizeAuthorizationEdition(
  value: unknown,
): AuthorizationEdition | null {
  return typeof value === "string" &&
    authorizationEditionValues.includes(value as AuthorizationEdition)
    ? (value as AuthorizationEdition)
    : null;
}

function normalizeOrganizationPublicIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function normalizeCreateOrgAuthInput(
  input: unknown,
): ValidationResult<NormalizedCreateOrgAuthInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ORG_AUTH_INPUT_MESSAGE,
    };
  }

  const name = normalizeRequiredText(input.name);
  const purchaserOrganizationPublicId = normalizeRequiredText(
    input.purchaserOrganizationPublicId,
  );
  const level = normalizePositiveInteger(input.level);
  const edition = normalizeAuthorizationEdition(input.edition);
  const accountQuota = normalizePositiveInteger(input.accountQuota);
  const startsAt = normalizeDate(input.startsAt);
  const expiresAt = normalizeDate(input.expiresAt);
  const organizationPublicIds = normalizeOrganizationPublicIds(
    input.organizationPublicIds,
  );

  if (
    name === null ||
    purchaserOrganizationPublicId === null ||
    !isAuthScopeType(input.authScopeType) ||
    !isProfession(input.profession) ||
    level === null ||
    edition === null ||
    accountQuota === null ||
    startsAt === null ||
    expiresAt === null ||
    expiresAt <= startsAt ||
    (input.authScopeType === "specified_nodes" &&
      organizationPublicIds.length === 0)
  ) {
    return {
      success: false,
      message: INVALID_ORG_AUTH_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      name,
      purchaserOrganizationPublicId,
      authScopeType: input.authScopeType,
      profession: input.profession,
      level,
      edition,
      accountQuota,
      startsAt,
      expiresAt,
      organizationPublicIds:
        input.authScopeType === "specified_nodes" ? organizationPublicIds : [],
    },
  };
}
