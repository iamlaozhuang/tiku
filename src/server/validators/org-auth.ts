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

export type NormalizedOrgAuthClosureMetadataInput = {
  externalReference: string;
  opsNote: string;
};

export type NormalizedOrgAuthQuotaExpansionInput =
  NormalizedOrgAuthClosureMetadataInput & {
    accountQuota: number;
  };

export type NormalizedOrgAuthReplacementInput =
  NormalizedOrgAuthClosureMetadataInput & {
    replacement: NormalizedCreateOrgAuthInput;
  };

export type NormalizedOrgAuthRenewalInput =
  NormalizedOrgAuthClosureMetadataInput & {
    accountQuota: number;
    expiresAt: Date;
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
const MAX_EXTERNAL_REFERENCE_LENGTH = 128;
const MAX_OPS_NOTE_LENGTH = 1_000;

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

function normalizeExternalReference(value: unknown): string | null {
  const text = normalizeRequiredText(value);

  return text !== null &&
    text.length <= MAX_EXTERNAL_REFERENCE_LENGTH &&
    !/[\u0000-\u001f\u007f]/u.test(text)
    ? text
    : null;
}

function normalizeOpsNote(value: unknown): string | null {
  const text = normalizeRequiredText(value);

  return text !== null && text.length <= MAX_OPS_NOTE_LENGTH ? text : null;
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

export function normalizeOrgAuthClosureMetadataInput(
  input: unknown,
): ValidationResult<NormalizedOrgAuthClosureMetadataInput> {
  if (!isRecord(input)) {
    return { success: false, message: INVALID_ORG_AUTH_INPUT_MESSAGE };
  }

  const externalReference = normalizeExternalReference(input.externalReference);
  const opsNote = normalizeOpsNote(input.opsNote);

  return externalReference === null || opsNote === null
    ? { success: false, message: INVALID_ORG_AUTH_INPUT_MESSAGE }
    : { success: true, value: { externalReference, opsNote } };
}

export function normalizeOrgAuthQuotaExpansionInput(
  input: unknown,
): ValidationResult<NormalizedOrgAuthQuotaExpansionInput> {
  const metadata = normalizeOrgAuthClosureMetadataInput(input);
  const accountQuota = isRecord(input)
    ? normalizePositiveInteger(input.accountQuota)
    : null;

  return !metadata.success || accountQuota === null
    ? { success: false, message: INVALID_ORG_AUTH_INPUT_MESSAGE }
    : { success: true, value: { ...metadata.value, accountQuota } };
}

export function normalizeOrgAuthReplacementInput(
  input: unknown,
): ValidationResult<NormalizedOrgAuthReplacementInput> {
  const metadata = normalizeOrgAuthClosureMetadataInput(input);
  const replacement = normalizeCreateOrgAuthInput(input);

  return !metadata.success || !replacement.success
    ? { success: false, message: INVALID_ORG_AUTH_INPUT_MESSAGE }
    : {
        success: true,
        value: { ...metadata.value, replacement: replacement.value },
      };
}

export function normalizeOrgAuthRenewalInput(
  input: unknown,
): ValidationResult<NormalizedOrgAuthRenewalInput> {
  const metadata = normalizeOrgAuthClosureMetadataInput(input);
  const accountQuota = isRecord(input)
    ? normalizePositiveInteger(input.accountQuota)
    : null;
  const expiresAt = isRecord(input) ? normalizeDate(input.expiresAt) : null;

  return !metadata.success || accountQuota === null || expiresAt === null
    ? { success: false, message: INVALID_ORG_AUTH_INPUT_MESSAGE }
    : {
        success: true,
        value: { ...metadata.value, accountQuota, expiresAt },
      };
}
