import type {
  EmployeeImportCommandConfirmationInput,
  EmployeeCredentialIssueInput,
  EmployeeDistributionConfirmationInput,
  EmployeeImportPreflightInput,
  NormalizedEmployeeImportCommandInput,
} from "../contracts/employee-import-command-contract";

export type EmployeeImportCommandValidationResult<TValue> =
  | { success: true; value: TValue }
  | { success: false; message: string };

type EmployeeImportRowInput = {
  phone: string;
  name: string;
  initialPassword?: string | null;
};

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/u;
const PREVIEW_REVISION_PATTERN = /^[a-f0-9]{64}$/u;
const COMMAND_KEYS = ["commandKind", "organizationPublicId", "rows"];
const ROW_KEYS = ["phone", "name", "initialPassword"];
const SINGLE_PREFLIGHT_KEYS = [
  "commandKind",
  "organizationPublicId",
  "phone",
  "name",
  "initialPassword",
];
const BATCH_PREFLIGHT_KEYS = [
  "commandKind",
  "organizationPublicId",
  "sourceFormat",
  "content",
];
const SINGLE_CONFIRMATION_KEYS = [
  ...SINGLE_PREFLIGHT_KEYS,
  "expectedPreviewRevision",
];
const BATCH_CONFIRMATION_KEYS = [
  ...BATCH_PREFLIGHT_KEYS,
  "expectedPreviewRevision",
];
const CREDENTIAL_ISSUE_KEYS = ["expectedCredentialRevision"];
const DISTRIBUTION_CONFIRMATION_KEYS = [
  "issuePublicId",
  "expectedCredentialRevision",
];
const INVALID_IDEMPOTENCY_KEY_MESSAGE = "Idempotency-Key must be a UUID v4.";
const INVALID_EMPLOYEE_IMPORT_COMMAND_INPUT_MESSAGE =
  "Invalid employee import command input.";
const INVALID_EMPLOYEE_IMPORT_PREFLIGHT_INPUT_MESSAGE =
  "Invalid employee import preflight input.";
const INVALID_EMPLOYEE_IMPORT_CONFIRMATION_INPUT_MESSAGE =
  "Invalid employee import confirmation input.";
const INVALID_CREDENTIAL_ISSUE_INPUT_MESSAGE =
  "Invalid credential issue input.";
const INVALID_DISTRIBUTION_CONFIRMATION_INPUT_MESSAGE =
  "Invalid distribution confirmation input.";

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyOwnKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Reflect.ownKeys(value).every(
    (key) => typeof key === "string" && allowedKeys.includes(key),
  );
}

function hasRequiredOwnKeys(
  value: Record<string, unknown>,
  requiredKeys: readonly string[],
): boolean {
  return requiredKeys.every((key) => Object.hasOwn(value, key));
}

function isCredentialRevision(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isEmployeeImportCommandKind(
  value: unknown,
): value is NormalizedEmployeeImportCommandInput["commandKind"] {
  return value === "single_create" || value === "batch_import";
}

function isEmployeeImportRowInput(
  value: unknown,
): value is EmployeeImportRowInput {
  if (!isRecord(value)) {
    return false;
  }

  const hasOwnInitialPassword = Object.hasOwn(value, "initialPassword");

  return (
    hasOnlyOwnKeys(value, ROW_KEYS) &&
    hasRequiredOwnKeys(value, ["phone", "name"]) &&
    typeof value.phone === "string" &&
    typeof value.name === "string" &&
    (!hasOwnInitialPassword ||
      value.initialPassword === null ||
      typeof value.initialPassword === "string")
  );
}

function hasDenseEmployeeImportRows(
  rows: unknown[],
): rows is EmployeeImportRowInput[] {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    if (
      !Object.hasOwn(rows, rowIndex) ||
      !isEmployeeImportRowInput(rows[rowIndex])
    ) {
      return false;
    }
  }

  return true;
}

function normalizeEmployeeImportTransport(
  input: unknown,
  requiresPreviewRevision: boolean,
): {
  preflightInput: EmployeeImportPreflightInput;
  expectedPreviewRevision: string | null;
} | null {
  if (!isRecord(input)) {
    return null;
  }

  const requiredKeys = ["commandKind", "organizationPublicId"];
  const expectedPreviewRevision = requiresPreviewRevision
    ? input.expectedPreviewRevision
    : null;
  if (
    !hasRequiredOwnKeys(input, requiredKeys) ||
    (requiresPreviewRevision &&
      (!Object.hasOwn(input, "expectedPreviewRevision") ||
        typeof expectedPreviewRevision !== "string" ||
        !PREVIEW_REVISION_PATTERN.test(expectedPreviewRevision)))
  ) {
    return null;
  }

  const organizationPublicId =
    typeof input.organizationPublicId === "string"
      ? input.organizationPublicId.trim()
      : "";
  if (!PUBLIC_ID_PATTERN.test(organizationPublicId)) {
    return null;
  }

  if (input.commandKind === "single_create") {
    const allowedKeys = requiresPreviewRevision
      ? SINGLE_CONFIRMATION_KEYS
      : SINGLE_PREFLIGHT_KEYS;
    const hasInitialPassword = Object.hasOwn(input, "initialPassword");
    if (
      !hasOnlyOwnKeys(input, allowedKeys) ||
      !hasRequiredOwnKeys(input, [...requiredKeys, "phone", "name"]) ||
      typeof input.phone !== "string" ||
      typeof input.name !== "string" ||
      (hasInitialPassword &&
        input.initialPassword !== null &&
        typeof input.initialPassword !== "string")
    ) {
      return null;
    }

    return {
      expectedPreviewRevision:
        typeof expectedPreviewRevision === "string"
          ? expectedPreviewRevision
          : null,
      preflightInput: {
        commandKind: "single_create",
        initialPassword:
          hasInitialPassword && typeof input.initialPassword === "string"
            ? input.initialPassword.trim()
            : null,
        name: input.name.trim(),
        organizationPublicId,
        phone: input.phone.trim(),
      },
    };
  }

  if (input.commandKind === "batch_import") {
    const allowedKeys = requiresPreviewRevision
      ? BATCH_CONFIRMATION_KEYS
      : BATCH_PREFLIGHT_KEYS;
    if (
      !hasOnlyOwnKeys(input, allowedKeys) ||
      !hasRequiredOwnKeys(input, [
        ...requiredKeys,
        "sourceFormat",
        "content",
      ]) ||
      (input.sourceFormat !== "csv" && input.sourceFormat !== "tsv") ||
      typeof input.content !== "string"
    ) {
      return null;
    }

    return {
      expectedPreviewRevision:
        typeof expectedPreviewRevision === "string"
          ? expectedPreviewRevision
          : null,
      preflightInput: {
        commandKind: "batch_import",
        content: input.content,
        organizationPublicId,
        sourceFormat: input.sourceFormat,
      },
    };
  }

  return null;
}

export function normalizeIdempotencyKey(
  input: unknown,
): EmployeeImportCommandValidationResult<string> {
  const idempotencyKey = typeof input === "string" ? input.trim() : "";

  if (!UUID_V4_PATTERN.test(idempotencyKey)) {
    return { success: false, message: INVALID_IDEMPOTENCY_KEY_MESSAGE };
  }

  return { success: true, value: idempotencyKey.toLowerCase() };
}

export function normalizeEmployeeImportCommandInput(
  input: unknown,
): EmployeeImportCommandValidationResult<NormalizedEmployeeImportCommandInput> {
  if (
    !isRecord(input) ||
    !hasOnlyOwnKeys(input, COMMAND_KEYS) ||
    !hasRequiredOwnKeys(input, COMMAND_KEYS)
  ) {
    return {
      success: false,
      message: INVALID_EMPLOYEE_IMPORT_COMMAND_INPUT_MESSAGE,
    };
  }

  const organizationPublicId =
    typeof input.organizationPublicId === "string"
      ? input.organizationPublicId.trim()
      : "";
  const commandKind = input.commandKind;
  const rows = input.rows;

  if (
    !isEmployeeImportCommandKind(commandKind) ||
    !PUBLIC_ID_PATTERN.test(organizationPublicId) ||
    !Array.isArray(rows) ||
    rows.length < 1 ||
    rows.length > 500 ||
    (commandKind === "single_create" && rows.length !== 1) ||
    !hasDenseEmployeeImportRows(rows)
  ) {
    return {
      success: false,
      message: INVALID_EMPLOYEE_IMPORT_COMMAND_INPUT_MESSAGE,
    };
  }

  const normalizedRows: NormalizedEmployeeImportCommandInput["rows"] =
    Array.from({ length: rows.length }, (_, rowIndex) => {
      const row = rows[rowIndex];
      return {
        rowNumber: rowIndex + 1,
        phone: row.phone.trim(),
        name: row.name.trim(),
        initialPassword:
          Object.hasOwn(row, "initialPassword") &&
          typeof row.initialPassword === "string"
            ? row.initialPassword.trim()
            : "",
      };
    });

  return {
    success: true,
    value: {
      commandKind,
      organizationPublicId,
      rows: normalizedRows,
    },
  };
}

export function normalizeEmployeeImportPreflightInput(
  input: unknown,
): EmployeeImportCommandValidationResult<EmployeeImportPreflightInput> {
  const normalized = normalizeEmployeeImportTransport(input, false);
  if (normalized !== null) {
    return { success: true, value: normalized.preflightInput };
  }

  return {
    success: false,
    message: INVALID_EMPLOYEE_IMPORT_PREFLIGHT_INPUT_MESSAGE,
  };
}

export function normalizeEmployeeImportCommandConfirmationInput(
  input: unknown,
): EmployeeImportCommandValidationResult<EmployeeImportCommandConfirmationInput> {
  const normalized = normalizeEmployeeImportTransport(input, true);
  if (normalized !== null && normalized.expectedPreviewRevision !== null) {
    return {
      success: true,
      value: {
        ...normalized.preflightInput,
        expectedPreviewRevision: normalized.expectedPreviewRevision,
      },
    };
  }

  return {
    success: false,
    message: INVALID_EMPLOYEE_IMPORT_CONFIRMATION_INPUT_MESSAGE,
  };
}

export function normalizeCredentialIssueInput(
  input: unknown,
): EmployeeImportCommandValidationResult<EmployeeCredentialIssueInput> {
  if (
    !isRecord(input) ||
    !hasOnlyOwnKeys(input, CREDENTIAL_ISSUE_KEYS) ||
    !hasRequiredOwnKeys(input, CREDENTIAL_ISSUE_KEYS) ||
    !isCredentialRevision(input.expectedCredentialRevision)
  ) {
    return { success: false, message: INVALID_CREDENTIAL_ISSUE_INPUT_MESSAGE };
  }

  return {
    success: true,
    value: { expectedCredentialRevision: input.expectedCredentialRevision },
  };
}

export function normalizeDistributionConfirmationInput(
  input: unknown,
): EmployeeImportCommandValidationResult<EmployeeDistributionConfirmationInput> {
  if (
    !isRecord(input) ||
    !hasOnlyOwnKeys(input, DISTRIBUTION_CONFIRMATION_KEYS) ||
    !hasRequiredOwnKeys(input, DISTRIBUTION_CONFIRMATION_KEYS) ||
    typeof input.issuePublicId !== "string" ||
    !PUBLIC_ID_PATTERN.test(input.issuePublicId.trim()) ||
    !isCredentialRevision(input.expectedCredentialRevision)
  ) {
    return {
      success: false,
      message: INVALID_DISTRIBUTION_CONFIRMATION_INPUT_MESSAGE,
    };
  }

  return {
    success: true,
    value: {
      issuePublicId: input.issuePublicId.trim(),
      expectedCredentialRevision: input.expectedCredentialRevision,
    },
  };
}
