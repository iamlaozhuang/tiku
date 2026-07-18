import {
  createErrorResponse,
  createSuccessResponse,
} from "../contracts/api-response";
import type {
  EmployeeCredentialManifestDto,
  EmployeeImportCommandActor,
  EmployeeImportCommandDto,
  EmployeeImportCommandServiceResult,
  IssuedEmployeeCredential,
  PreparedEmployeeCredential,
} from "../contracts/employee-import-command-contract";
import { maskPhoneForDisplay } from "../mappers/phone-display-mapper";
import {
  EmployeeImportCommandError,
  type EmployeeImportCommandRecord,
  type EmployeeImportCommandRepository,
  type EmployeeImportRejectionReason,
} from "../repositories/employee-import-command-repository";
import {
  normalizeCredentialIssueInput,
  normalizeDistributionConfirmationInput,
  normalizeEmployeeImportCommandInput,
  normalizeIdempotencyKey,
} from "../validators/employee-import-command";
import { normalizeCreateEmployeeAccountInput } from "../validators/employee-account";
import {
  createEmployeeImportCommandHashes,
  prepareEmployeeCreationCredential,
  prepareIssuedEmployeeCredential,
} from "./employee-import-command-crypto";

export type EmployeeImportCommandService = {
  submit(input: {
    actor: EmployeeImportCommandActor;
    idempotencyKey: unknown;
    body: unknown;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>>;
  get(input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>>;
  issueCredentials(input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
    body: unknown;
  }): Promise<
    EmployeeImportCommandServiceResult<EmployeeCredentialManifestDto>
  >;
  confirmDistribution(input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
    body: unknown;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>>;
};

export type EmployeeImportCommandServiceDependencies = {
  prepareCredential?: (
    initialPassword: string,
  ) => Promise<PreparedEmployeeCredential>;
  prepareIssuedCredential?: () => Promise<IssuedEmployeeCredential>;
};

type PendingRowWork = {
  name: string;
  phone: string;
  preparedCredential: PreparedEmployeeCredential | null;
  prevalidatedRejectionReason: EmployeeImportRejectionReason | null;
  rowNumber: number;
  rowRequestHash: string;
};

const CREDENTIAL_HASH_CONCURRENCY = 4;
const VALIDATION_ERROR_CODE = 422601;
const UNKNOWN_ERROR_CODE = 503601;
const UNKNOWN_ERROR_MESSAGE =
  "Employee import command is temporarily unavailable.";

const errorMap = {
  actor_forbidden: [403, 403601, "Employee import command is forbidden."],
  command_not_found: [404, 404601, "Employee import command does not exist."],
  idempotency_request_mismatch: [409, 409601, "Idempotency request mismatch."],
  credential_revision_stale: [409, 409602, "Credential revision is stale."],
  credential_manifest_stale: [409, 409603, "Credential manifest is stale."],
  credential_distribution_closed: [
    409,
    409604,
    "Credential distribution is closed.",
  ],
  active_session: [409, 409605, "Employee session is active."],
  account_state_changed: [409, 409606, "Employee account state changed."],
  credential_baseline_changed: [409, 409607, "Employee credential changed."],
} as const;

export function createEmployeeImportCommandService(
  repository: EmployeeImportCommandRepository,
  dependencies: EmployeeImportCommandServiceDependencies = {},
): EmployeeImportCommandService {
  const prepareCredential =
    dependencies.prepareCredential ?? prepareEmployeeCreationCredential;
  const prepareIssuedCredential =
    dependencies.prepareIssuedCredential ?? prepareIssuedEmployeeCredential;

  return {
    async submit(input) {
      try {
        const normalizedIdempotencyKey = normalizeIdempotencyKey(
          input.idempotencyKey,
        );
        if (!normalizedIdempotencyKey.success) {
          return createValidationError(normalizedIdempotencyKey.message);
        }

        const normalizedCommand = normalizeEmployeeImportCommandInput(
          input.body,
        );
        if (!normalizedCommand.success) {
          return createValidationError(normalizedCommand.message);
        }

        const commandHashes = createEmployeeImportCommandHashes({
          actorPublicId: input.actor.publicId,
          command: normalizedCommand.value,
          idempotencyKey: normalizedIdempotencyKey.value,
        });
        const claimedCommand = await repository.claimCommand({
          actor: input.actor,
          commandKind: normalizedCommand.value.commandKind,
          idempotencyScopeHash: commandHashes.idempotencyScopeHash,
          organizationPublicId: normalizedCommand.value.organizationPublicId,
          requestHash: commandHashes.requestHash,
          rows: normalizedCommand.value.rows.map((row) => ({
            rowNumber: row.rowNumber,
            rowRequestHash: resolveRowRequestHash(
              commandHashes.rowHashes,
              row.rowNumber,
            ),
          })),
        });
        const duplicatePhones = findDuplicatePhones(
          normalizedCommand.value.rows.map((row) => row.phone),
        );
        const pendingRowNumbers = new Set(
          claimedCommand.rows
            .filter((row) => row.status === "pending")
            .map((row) => row.rowNumber),
        );
        const pendingRows = normalizedCommand.value.rows
          .filter((row) => pendingRowNumbers.has(row.rowNumber))
          .sort((leftRow, rightRow) => leftRow.rowNumber - rightRow.rowNumber)
          .map((row) => ({
            initialPassword: row.initialPassword,
            name: row.name,
            phone: row.phone,
            prevalidatedRejectionReason: resolvePrevalidatedRejectionReason({
              duplicatePhones,
              initialPassword: row.initialPassword,
              name: row.name,
              organizationPublicId:
                normalizedCommand.value.organizationPublicId,
              phone: row.phone,
            }),
            rowNumber: row.rowNumber,
            rowRequestHash: resolveRowRequestHash(
              commandHashes.rowHashes,
              row.rowNumber,
            ),
          }));
        const preparedRows = await preparePendingRows(
          pendingRows,
          prepareCredential,
        );

        for (const row of preparedRows) {
          await repository.processRow({
            actor: input.actor,
            commandPublicId: claimedCommand.publicId,
            name: row.name,
            phone: row.phone,
            preparedCredential: row.preparedCredential,
            prevalidatedRejectionReason: row.prevalidatedRejectionReason,
            rowNumber: row.rowNumber,
            rowRequestHash: row.rowRequestHash,
          });
        }

        return await readCommand(repository, {
          actor: input.actor,
          commandPublicId: claimedCommand.publicId,
        });
      } catch (error) {
        return mapServiceError(error);
      }
    },

    async get(input) {
      try {
        return await readCommand(repository, input);
      } catch (error) {
        return mapServiceError(error);
      }
    },

    async issueCredentials(input) {
      try {
        const normalizedInput = normalizeCredentialIssueInput(input.body);
        if (!normalizedInput.success) {
          return createValidationError(normalizedInput.message);
        }

        const targetSet = await repository.listIssueTargets({
          actor: input.actor,
          commandPublicId: input.commandPublicId,
        });
        if (
          targetSet.credentialRevision !==
          normalizedInput.value.expectedCredentialRevision
        ) {
          throw new EmployeeImportCommandError("credential_revision_stale");
        }
        const preparedTargets = await prepareCredentialIssueTargets(
          targetSet.targets,
          prepareIssuedCredential,
        );
        const issueResult = await repository.issueCredentials({
          actor: input.actor,
          commandPublicId: input.commandPublicId,
          credentials: preparedTargets.map((target) => ({
            passwordHash: target.passwordHash,
            rowPublicId: target.rowPublicId,
          })),
          expectedCredentialRevision:
            normalizedInput.value.expectedCredentialRevision,
        });
        const plaintextByRowPublicId = new Map(
          preparedTargets.map((target) => [
            target.rowPublicId,
            target.initialPassword,
          ]),
        );
        const manifestRows = issueResult.rows.map((row) => {
          const initialPassword = plaintextByRowPublicId.get(row.rowPublicId);
          if (initialPassword === undefined) {
            throw new Error("Credential issue result target is unavailable.");
          }

          return {
            employeePublicId: row.employeePublicId,
            initialPassword,
            name: row.name,
            phone: maskPhoneForDisplay(row.phone),
            rowNumber: row.rowNumber,
            rowPublicId: row.rowPublicId,
          };
        });
        if (
          manifestRows.length !== preparedTargets.length ||
          new Set(manifestRows.map((row) => row.rowPublicId)).size !==
            preparedTargets.length
        ) {
          throw new Error("Credential issue result target set changed.");
        }

        return {
          httpStatus: 200,
          response: createSuccessResponse({
            credentialRevision: issueResult.credentialRevision,
            issuePublicId: issueResult.issuePublicId,
            rows: manifestRows,
          }),
        };
      } catch (error) {
        return mapServiceError(error);
      }
    },

    async confirmDistribution(input) {
      try {
        const normalizedInput = normalizeDistributionConfirmationInput(
          input.body,
        );
        if (!normalizedInput.success) {
          return createValidationError(normalizedInput.message);
        }

        const command = await repository.confirmDistribution({
          actor: input.actor,
          commandPublicId: input.commandPublicId,
          expectedCredentialRevision:
            normalizedInput.value.expectedCredentialRevision,
          issuePublicId: normalizedInput.value.issuePublicId,
        });

        return {
          httpStatus: 200,
          response: createSuccessResponse(mapCommandRecordToDto(command)),
        };
      } catch (error) {
        return mapServiceError(error);
      }
    },
  };
}

async function prepareCredentialIssueTargets(
  targets: {
    employeePublicId: string;
    rowNumber: number;
    rowPublicId: string;
  }[],
  prepareCredential: () => Promise<IssuedEmployeeCredential>,
): Promise<
  (IssuedEmployeeCredential & {
    rowPublicId: string;
  })[]
> {
  let preparedTargets: (IssuedEmployeeCredential & {
    rowPublicId: string;
  })[] = [];

  for (
    let targetOffset = 0;
    targetOffset < targets.length;
    targetOffset += CREDENTIAL_HASH_CONCURRENCY
  ) {
    const targetBatch = targets.slice(
      targetOffset,
      targetOffset + CREDENTIAL_HASH_CONCURRENCY,
    );
    const preparationResults = await Promise.allSettled(
      targetBatch.map(async (target) => ({
        ...(await prepareCredential()),
        rowPublicId: target.rowPublicId,
      })),
    );
    const rejectedPreparation = preparationResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (rejectedPreparation !== undefined) {
      throw rejectedPreparation.reason;
    }

    preparedTargets = [
      ...preparedTargets,
      ...preparationResults.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      ),
    ];
  }

  return preparedTargets;
}

function resolveRowRequestHash(rowHashes: string[], rowNumber: number): string {
  const rowRequestHash = rowHashes[rowNumber - 1];
  if (rowRequestHash === undefined) {
    throw new Error("Employee import row hash is unavailable.");
  }
  return rowRequestHash;
}

function findDuplicatePhones(phones: string[]): Set<string> {
  const phoneCounts = new Map<string, number>();

  for (const phone of phones) {
    phoneCounts.set(phone, (phoneCounts.get(phone) ?? 0) + 1);
  }

  return new Set(
    [...phoneCounts.entries()].flatMap(([phone, count]) =>
      count > 1 ? [phone] : [],
    ),
  );
}

function resolvePrevalidatedRejectionReason(input: {
  duplicatePhones: Set<string>;
  initialPassword: string;
  name: string;
  organizationPublicId: string;
  phone: string;
}): EmployeeImportRejectionReason | null {
  if (input.duplicatePhones.has(input.phone)) {
    return "duplicate_phone";
  }

  const validationResult = normalizeCreateEmployeeAccountInput({
    initialPassword: input.initialPassword,
    name: input.name,
    organizationPublicId: input.organizationPublicId,
    phone: input.phone,
  });

  return validationResult.success ? null : "invalid_row";
}

async function preparePendingRows(
  rows: (Omit<PendingRowWork, "preparedCredential"> & {
    initialPassword: string;
  })[],
  prepareCredential: (
    initialPassword: string,
  ) => Promise<PreparedEmployeeCredential>,
): Promise<PendingRowWork[]> {
  let preparedRows: PendingRowWork[] = [];

  for (
    let rowOffset = 0;
    rowOffset < rows.length;
    rowOffset += CREDENTIAL_HASH_CONCURRENCY
  ) {
    const rowBatch = rows.slice(
      rowOffset,
      rowOffset + CREDENTIAL_HASH_CONCURRENCY,
    );
    const preparationResults = await Promise.allSettled(
      rowBatch.map(async (row) => ({
        name: row.name,
        phone: row.phone,
        preparedCredential:
          row.prevalidatedRejectionReason === null
            ? await prepareCredential(row.initialPassword)
            : null,
        prevalidatedRejectionReason: row.prevalidatedRejectionReason,
        rowNumber: row.rowNumber,
        rowRequestHash: row.rowRequestHash,
      })),
    );
    const rejectedPreparation = preparationResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (rejectedPreparation !== undefined) {
      throw rejectedPreparation.reason;
    }

    preparedRows = [
      ...preparedRows,
      ...preparationResults.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      ),
    ];
  }

  return preparedRows;
}

async function readCommand(
  repository: EmployeeImportCommandRepository,
  input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
  },
): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>> {
  const record = await repository.findCommand(input);
  if (record === null) {
    return createDomainError("command_not_found");
  }

  return {
    httpStatus: 200,
    response: createSuccessResponse(mapCommandRecordToDto(record)),
  };
}

function mapCommandRecordToDto(
  record: EmployeeImportCommandRecord,
): EmployeeImportCommandDto {
  return {
    commandKind: record.commandKind,
    completedAt:
      record.completedAt === null ? null : record.completedAt.toISOString(),
    counts: {
      pending: record.counts.pending,
      rejected: record.counts.rejected,
      succeeded: record.counts.succeeded,
    },
    createdAt: record.createdAt.toISOString(),
    credentialDistributionStatus: record.credentialDistributionStatus,
    credentialRevision: record.credentialRevision,
    currentIssuePublicId: record.currentIssuePublicId,
    distributionConfirmedAt:
      record.distributionConfirmedAt === null
        ? null
        : record.distributionConfirmedAt.toISOString(),
    organizationPublicId: record.organizationPublicId,
    publicId: record.publicId,
    rowCount: record.rowCount,
    rows: [...record.rows]
      .sort((leftRow, rightRow) => leftRow.rowNumber - rightRow.rowNumber)
      .map((row) => ({
        credentialMode: row.credentialMode,
        employeePublicId: row.employeePublicId,
        outcomeKind: row.outcomeKind,
        publicId: row.publicId,
        rejectionReason: row.rejectionReason,
        rowNumber: row.rowNumber,
        status: row.status,
        warningReason: row.warningReason,
      })),
    status: record.status,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function createValidationError<TData>(
  message: string,
): EmployeeImportCommandServiceResult<TData> {
  return {
    httpStatus: 422,
    response: createErrorResponse(VALIDATION_ERROR_CODE, message),
  };
}

function createDomainError<TData>(
  reason: EmployeeImportCommandError["reason"],
): EmployeeImportCommandServiceResult<TData> {
  const [httpStatus, code, message] = errorMap[reason];

  return {
    httpStatus,
    response: createErrorResponse(code, message),
  };
}

function createUnknownError<
  TData,
>(): EmployeeImportCommandServiceResult<TData> {
  return {
    httpStatus: 503,
    response: createErrorResponse(UNKNOWN_ERROR_CODE, UNKNOWN_ERROR_MESSAGE),
  };
}

function mapServiceError<TData>(
  error: unknown,
): EmployeeImportCommandServiceResult<TData> {
  return error instanceof EmployeeImportCommandError
    ? createDomainError(error.reason)
    : createUnknownError();
}
