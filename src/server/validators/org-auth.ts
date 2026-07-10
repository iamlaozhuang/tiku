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

export type OrgAuthScopeSelectionInput = Pick<
  NormalizedCreateOrgAuthInput,
  "profession" | "level"
>;

export type NormalizedCreateOrgAuthPackageInput = {
  orgAuthInputs: NormalizedCreateOrgAuthInput[];
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

function normalizeScopeSelections(
  input: Record<string, unknown>,
): OrgAuthScopeSelectionInput[] | null {
  if (Array.isArray(input.scopeSelections)) {
    const selections: OrgAuthScopeSelectionInput[] = [];
    const selectionKeys = new Set<string>();

    for (const item of input.scopeSelections) {
      if (!isRecord(item) || !isProfession(item.profession)) {
        return null;
      }

      const level = normalizePositiveInteger(item.level);

      if (level === null) {
        return null;
      }

      const selectionKey = `${item.profession}:${level}`;

      if (selectionKeys.has(selectionKey)) {
        continue;
      }

      selectionKeys.add(selectionKey);
      selections.push({
        profession: item.profession,
        level,
      });
    }

    return selections.length === 0 ? null : selections;
  }

  const level = normalizePositiveInteger(input.level);

  return !isProfession(input.profession) || level === null
    ? null
    : [
        {
          profession: input.profession,
          level,
        },
      ];
}

export function normalizeCreateOrgAuthPackageInput(
  input: unknown,
): ValidationResult<NormalizedCreateOrgAuthPackageInput> {
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
  const edition = normalizeAuthorizationEdition(input.edition);
  const accountQuota = normalizePositiveInteger(input.accountQuota);
  const startsAt = normalizeDate(input.startsAt);
  const expiresAt = normalizeDate(input.expiresAt);
  const organizationPublicIds = normalizeOrganizationPublicIds(
    input.organizationPublicIds,
  );
  const scopeSelections = normalizeScopeSelections(input);
  const authScopeType = isAuthScopeType(input.authScopeType)
    ? input.authScopeType
    : null;

  if (
    name === null ||
    purchaserOrganizationPublicId === null ||
    authScopeType === null ||
    scopeSelections === null ||
    edition === null ||
    accountQuota === null ||
    startsAt === null ||
    expiresAt === null ||
    expiresAt <= startsAt ||
    (authScopeType === "specified_nodes" && organizationPublicIds.length === 0)
  ) {
    return {
      success: false,
      message: INVALID_ORG_AUTH_INPUT_MESSAGE,
    };
  }

  const scopedOrganizationPublicIds =
    authScopeType === "specified_nodes" ? organizationPublicIds : [];

  return {
    success: true,
    value: {
      orgAuthInputs: scopeSelections.map((scopeSelection) => ({
        name,
        purchaserOrganizationPublicId,
        authScopeType,
        profession: scopeSelection.profession,
        level: scopeSelection.level,
        edition,
        accountQuota,
        startsAt,
        expiresAt,
        organizationPublicIds: scopedOrganizationPublicIds,
      })),
    },
  };
}

export function normalizeCreateOrgAuthInput(
  input: unknown,
): ValidationResult<NormalizedCreateOrgAuthInput> {
  const packageInput = normalizeCreateOrgAuthPackageInput(input);

  return packageInput.success
    ? {
        success: true,
        value: packageInput.value.orgAuthInputs[0],
      }
    : packageInput;
}
