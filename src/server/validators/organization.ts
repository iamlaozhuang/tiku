import { orgTierValues } from "../models/auth";

export type OrgStatus = "active" | "disabled";

export type NormalizedCreateOrganizationInput = {
  name: string;
  orgTier: (typeof orgTierValues)[number];
  parentOrganizationPublicId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  remark: string | null;
};

export type NormalizedUpdateOrganizationInput =
  NormalizedCreateOrganizationInput & {
    status: OrgStatus;
  };

export type NormalizedDisableOrganizationInput = {
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

function isOrgStatus(value: unknown): value is OrgStatus {
  return value === "active" || value === "disabled";
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
  const organizationInput = normalizeCreateOrganizationInput(input);

  if (
    !organizationInput.success ||
    !isRecord(input) ||
    !isOrgStatus(input.status)
  ) {
    return {
      success: false,
      message: INVALID_ORGANIZATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      ...organizationInput.value,
      status: input.status,
    },
  };
}

export function normalizeDisableOrganizationInput(
  input: unknown,
): ValidationResult<NormalizedDisableOrganizationInput> {
  if (!isRecord(input)) {
    return {
      success: true,
      value: {
        isCascade: false,
      },
    };
  }

  return {
    success: true,
    value: {
      isCascade: input.isCascade === true,
    },
  };
}
