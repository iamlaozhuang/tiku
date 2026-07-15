import { orgTierValues } from "../models/auth";

export type OrgStatus = "active" | "disabled";
type OrgTier = (typeof orgTierValues)[number];

export type NormalizedCreateOrganizationInput = {
  name: string;
  orgTier: OrgTier;
  parentOrganizationPublicId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  remark: string | null;
};

export type NormalizedUpdateOrganizationInput = Pick<
  NormalizedCreateOrganizationInput,
  "contactName" | "contactPhone" | "name" | "remark"
> & {
  expectedRevision: number;
};

export type NormalizedMoveOrganizationInput = {
  expectedRevision: number;
  parentOrganizationPublicId: string | null;
};

export type NormalizedDisableOrganizationInput = {
  expectedRevision: number;
  isCascade: boolean;
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

const INVALID_ORGANIZATION_INPUT_MESSAGE = "Invalid organization input.";
const expectedParentTierByOrgTier = {
  city: "province",
  district: "city",
  province: null,
  station: "district",
} satisfies Record<OrgTier, OrgTier | null>;

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

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  return text.length === 0 ? null : text;
}

function isOrgTier(value: unknown): value is (typeof orgTierValues)[number] {
  return (
    typeof value === "string" &&
    orgTierValues.includes(value as (typeof orgTierValues)[number])
  );
}

function normalizeExpectedRevision(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function hasOwnKey(input: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

export function normalizeCreateOrganizationInput(
  input: unknown,
): ValidationResult<NormalizedCreateOrganizationInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  const name = normalizeRequiredText(input.name);

  if (name === null || !isOrgTier(input.orgTier)) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      name,
      orgTier: input.orgTier,
      parentOrganizationPublicId: normalizeNullableText(
        input.parentOrganizationPublicId,
      ),
      contactName: normalizeNullableText(input.contactName),
      contactPhone: normalizeNullableText(input.contactPhone),
      remark: normalizeNullableText(input.remark),
    },
  };
}

export function normalizeUpdateOrganizationInput(
  input: unknown,
): ValidationResult<NormalizedUpdateOrganizationInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  if (
    hasOwnKey(input, "orgTier") ||
    hasOwnKey(input, "parentOrganizationPublicId") ||
    hasOwnKey(input, "status")
  ) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  const name = normalizeRequiredText(input.name);
  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);

  if (name === null || expectedRevision === null) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      contactName: normalizeNullableText(input.contactName),
      contactPhone: normalizeNullableText(input.contactPhone),
      expectedRevision,
      name,
      remark: normalizeNullableText(input.remark),
    },
  };
}

export function normalizeMoveOrganizationInput(
  input: unknown,
): ValidationResult<NormalizedMoveOrganizationInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  if (
    hasOwnKey(input, "orgTier") ||
    hasOwnKey(input, "status") ||
    hasOwnKey(input, "name") ||
    !hasOwnKey(input, "parentOrganizationPublicId")
  ) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);

  if (expectedRevision === null) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      expectedRevision,
      parentOrganizationPublicId: normalizeNullableText(
        input.parentOrganizationPublicId,
      ),
    },
  };
}

export function normalizeDisableOrganizationInput(
  input: unknown,
): ValidationResult<NormalizedDisableOrganizationInput> {
  if (!isRecord(input)) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  const expectedRevision = normalizeExpectedRevision(input.expectedRevision);

  if (expectedRevision === null) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      expectedRevision,
      isCascade: input.isCascade === true,
    },
  };
}

export function validateOrganizationTierParent(input: {
  orgTier: OrgTier;
  parentOrganization: { orgTier: OrgTier } | null;
}): { success: true } | { success: false; message: string } {
  const expectedParentTier = expectedParentTierByOrgTier[input.orgTier];

  if (expectedParentTier === null) {
    return input.parentOrganization === null
      ? { success: true }
      : {
          success: false,
          message: "Province organization cannot have a parent organization.",
        };
  }

  if (input.parentOrganization?.orgTier === expectedParentTier) {
    return { success: true };
  }

  const orgTierLabel =
    input.orgTier.charAt(0).toUpperCase() + input.orgTier.slice(1);

  return {
    success: false,
    message: `${orgTierLabel} organization parent must be a ${expectedParentTier} organization.`,
  };
}
