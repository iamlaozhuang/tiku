import { Buffer } from "node:buffer";
import { createHmac, randomBytes } from "node:crypto";

import { hashPassword as hashPasswordWithBetterAuth } from "better-auth/crypto";

import type {
  IssuedEmployeeCredential,
  NormalizedEmployeeImportCommandInput,
  PreparedEmployeeCredential,
} from "../contracts/employee-import-command-contract";

export type EmployeeCredentialPreparationDependencies = {
  generateRandomBytes?: (size: number) => Buffer;
  hashPassword?: (password: string) => Promise<string>;
};

const HMAC_VERSION_PREFIX = "v1:";
const PLACEHOLDER_RANDOM_BYTE_COUNT = 32;
const ISSUED_PASSWORD_RANDOM_BYTE_COUNT = 12;
const ISSUED_PASSWORD_RANDOM_PREFIX_LENGTH = 10;
const PASSWORD_POLICY_SUFFIX = "A1";

function createVersionedHmac(idempotencyKey: string, value: string): string {
  return `${HMAC_VERSION_PREFIX}${createHmac("sha256", idempotencyKey)
    .update(value, "utf8")
    .digest("base64url")}`;
}

function resolveCredentialPreparationDependencies(
  dependencies: EmployeeCredentialPreparationDependencies,
) {
  return {
    generateRandomBytes: dependencies.generateRandomBytes ?? randomBytes,
    hashPassword: dependencies.hashPassword ?? hashPasswordWithBetterAuth,
  };
}

function createCanonicalCommand(
  command: NormalizedEmployeeImportCommandInput,
): NormalizedEmployeeImportCommandInput {
  return {
    commandKind: command.commandKind,
    organizationPublicId: command.organizationPublicId,
    rows: command.rows.map((row) => ({
      rowNumber: row.rowNumber,
      phone: row.phone,
      name: row.name,
      initialPassword: row.initialPassword,
    })),
  };
}

export function createEmployeeImportCommandHashes(input: {
  actorPublicId: string;
  idempotencyKey: string;
  command: NormalizedEmployeeImportCommandInput;
}) {
  const canonicalCommand = createCanonicalCommand(input.command);
  const canonicalRequest = JSON.stringify(canonicalCommand);

  return {
    idempotencyScopeHash: createVersionedHmac(
      input.idempotencyKey,
      `employee-import-scope:v1\0${input.actorPublicId}\0${input.command.organizationPublicId}`,
    ),
    requestHash: createVersionedHmac(
      input.idempotencyKey,
      `employee-import-request:v1\0${canonicalRequest}`,
    ),
    rowHashes: canonicalCommand.rows.map((row) =>
      createVersionedHmac(
        input.idempotencyKey,
        `employee-import-row:v1\0${JSON.stringify(row)}`,
      ),
    ),
  };
}

export async function prepareEmployeeCreationCredential(
  initialPassword: string,
  dependencies: EmployeeCredentialPreparationDependencies = {},
): Promise<PreparedEmployeeCredential> {
  const { generateRandomBytes, hashPassword } =
    resolveCredentialPreparationDependencies(dependencies);

  if (initialPassword.length > 0) {
    return {
      credentialMode: "provided",
      passwordHash: await hashPassword(initialPassword),
    };
  }

  const placeholderPassword = `${generateRandomBytes(
    PLACEHOLDER_RANDOM_BYTE_COUNT,
  ).toString("base64url")}${PASSWORD_POLICY_SUFFIX}`;

  return {
    credentialMode: "generated",
    passwordHash: await hashPassword(placeholderPassword),
  };
}

export async function prepareIssuedEmployeeCredential(
  dependencies: EmployeeCredentialPreparationDependencies = {},
): Promise<IssuedEmployeeCredential> {
  const { generateRandomBytes, hashPassword } =
    resolveCredentialPreparationDependencies(dependencies);
  const randomPasswordPrefix = generateRandomBytes(
    ISSUED_PASSWORD_RANDOM_BYTE_COUNT,
  )
    .toString("base64url")
    .slice(0, ISSUED_PASSWORD_RANDOM_PREFIX_LENGTH);
  const initialPassword = `${randomPasswordPrefix}${PASSWORD_POLICY_SUFFIX}`;

  return {
    initialPassword,
    passwordHash: await hashPassword(initialPassword),
  };
}
