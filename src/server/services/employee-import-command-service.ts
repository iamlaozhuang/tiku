import { createHash } from "node:crypto";

import {
  createErrorResponse,
  createSuccessResponse,
} from "../contracts/api-response";
import type {
  EmployeeCredentialManifestDto,
  EmployeeImportCommandActor,
  EmployeeImportCommandConfirmationInput,
  EmployeeImportCommandConfirmationResult,
  EmployeeImportCommandDto,
  EmployeeImportPreflightDto,
  EmployeeImportPreflightInput,
  EmployeeImportPreflightReason,
  EmployeeImportPreflightRowDto,
  EmployeeImportCommandServiceResult,
  IssuedEmployeeCredential,
  NormalizedEmployeeImportCommandInput,
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
  normalizeEmployeeImportCommandConfirmationInput,
  normalizeEmployeeImportCommandInput,
  normalizeEmployeeImportPreflightInput,
  normalizeIdempotencyKey,
} from "../validators/employee-import-command";
import { normalizeCreateEmployeeAccountInput } from "../validators/employee-account";
import {
  createEmployeeImportCommandHashes,
  prepareEmployeeCreationCredential,
  prepareIssuedEmployeeCredential,
} from "./employee-import-command-crypto";
import { parseEmployeeImportSource } from "./employee-import-source-parser";

type EmployeeImportCommandPreviewOperation = (input: {
  actor: EmployeeImportCommandActor;
  body: unknown;
}) => Promise<EmployeeImportCommandServiceResult<EmployeeImportPreflightDto>>;

export type EmployeeImportCommandService = {
  preview?: EmployeeImportCommandPreviewOperation;
  submit(input: {
    actor: EmployeeImportCommandActor;
    idempotencyKey: unknown;
    body: unknown;
  }): Promise<
    EmployeeImportCommandServiceResult<EmployeeImportCommandConfirmationResult>
  >;
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

export type EmployeeImportCommandServiceWithPreview =
  EmployeeImportCommandService & {
    preview: EmployeeImportCommandPreviewOperation;
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
): EmployeeImportCommandServiceWithPreview {
  const prepareCredential =
    dependencies.prepareCredential ?? prepareEmployeeCreationCredential;
  const prepareIssuedCredential =
    dependencies.prepareIssuedCredential ?? prepareIssuedEmployeeCredential;

  return {
    async preview(input) {
      try {
        const normalizedInput = normalizeEmployeeImportPreflightInput(
          input.body,
        );
        if (!normalizedInput.success) {
          return createValidationError(normalizedInput.message);
        }
        const normalizedCommand = normalizePreflightSource(
          normalizedInput.value,
        );
        if (!normalizedCommand.success) {
          return createValidationError(normalizedCommand.message);
        }

        return {
          httpStatus: 200,
          response: createSuccessResponse(
            await createEmployeeImportPreview(repository, {
              actor: input.actor,
              command: normalizedCommand.command,
            }),
          ),
        };
      } catch (error) {
        return mapServiceError(error);
      }
    },

    async submit(input) {
      try {
        const normalizedIdempotencyKey = normalizeIdempotencyKey(
          input.idempotencyKey,
        );
        if (!normalizedIdempotencyKey.success) {
          return createValidationError(normalizedIdempotencyKey.message);
        }

        const normalizedConfirmation =
          normalizeEmployeeImportCommandConfirmationInput(input.body);
        if (!normalizedConfirmation.success) {
          return createValidationError(normalizedConfirmation.message);
        }
        const normalizedCommand = normalizePreflightSource(
          toEmployeeImportPreflightInput(normalizedConfirmation.value),
        );
        if (!normalizedCommand.success) {
          return createValidationError(normalizedCommand.message);
        }

        const fullCommandHashes = createEmployeeImportCommandHashes({
          actorPublicId: input.actor.publicId,
          command: normalizedCommand.command,
          idempotencyKey: normalizedIdempotencyKey.value,
        });
        const claimedCommand = await repository.findClaimedCommand({
          actor: input.actor,
          idempotencyScopeHash: fullCommandHashes.idempotencyScopeHash,
        });
        if (claimedCommand !== null) {
          if (claimedCommand.requestHash !== fullCommandHashes.requestHash) {
            throw new EmployeeImportCommandError(
              "idempotency_request_mismatch",
            );
          }
          if (claimedCommand.command.status === "completed") {
            return {
              httpStatus: 200,
              response: createSuccessResponse(
                mapCommandRecordToDto(claimedCommand.command),
              ),
            };
          }

          const claimedRowNumbers = new Set(
            claimedCommand.command.rows.map((row) => row.rowNumber),
          );
          const resumedRows = normalizedCommand.command.rows.filter((row) =>
            claimedRowNumbers.has(row.rowNumber),
          );
          if (resumedRows.length !== claimedRowNumbers.size) {
            throw new Error("Claimed employee import row set changed.");
          }

          return await executeNormalizedEmployeeImportCommand(repository, {
            actor: input.actor,
            command: {
              ...normalizedCommand.command,
              rows: resumedRows,
            },
            fullCommandHashes,
            prepareCredential,
          });
        }

        const currentPreview = await createEmployeeImportPreview(repository, {
          actor: input.actor,
          command: normalizedCommand.command,
        });
        if (
          currentPreview.previewRevision !==
          normalizedConfirmation.value.expectedPreviewRevision
        ) {
          return createPreviewBoundError(
            409,
            409608,
            "Employee import preview is stale.",
            currentPreview,
          );
        }
        if (currentPreview.counts.block > 0) {
          return createPreviewBoundError(
            422,
            422602,
            "Employee import preview contains blocked rows.",
            currentPreview,
          );
        }
        const actionableRowNumbers = new Set(
          currentPreview.rows.flatMap((row) =>
            row.outcome === "new" || row.outcome === "bind"
              ? [row.rowNumber]
              : [],
          ),
        );
        if (actionableRowNumbers.size === 0) {
          return createPreviewBoundError(
            422,
            422603,
            "Employee import preview requires no write.",
            currentPreview,
          );
        }

        return await executeNormalizedEmployeeImportCommand(repository, {
          actor: input.actor,
          command: {
            ...normalizedCommand.command,
            rows: normalizedCommand.command.rows.filter((row) =>
              actionableRowNumbers.has(row.rowNumber),
            ),
          },
          fullCommandHashes,
          prepareCredential,
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

type NormalizedPreflightSourceResult =
  | { success: true; command: NormalizedEmployeeImportCommandInput }
  | { success: false; message: string };

function toEmployeeImportPreflightInput(
  input: EmployeeImportCommandConfirmationInput,
): EmployeeImportPreflightInput {
  if (input.commandKind === "batch_import") {
    return {
      commandKind: input.commandKind,
      content: input.content,
      organizationPublicId: input.organizationPublicId,
      sourceFormat: input.sourceFormat,
    };
  }

  return {
    commandKind: input.commandKind,
    initialPassword: input.initialPassword ?? null,
    name: input.name,
    organizationPublicId: input.organizationPublicId,
    phone: input.phone,
  };
}

function normalizePreflightSource(
  input: EmployeeImportPreflightInput,
): NormalizedPreflightSourceResult {
  const commandInput =
    input.commandKind === "batch_import"
      ? parseEmployeeImportSource({
          content: input.content,
          sourceFormat: input.sourceFormat,
        })
      : {
          success: true as const,
          rows: [
            {
              initialPassword: input.initialPassword ?? "",
              name: input.name,
              phone: input.phone,
              rowNumber: 1,
            },
          ],
        };
  if (!commandInput.success) {
    return { success: false, message: commandInput.message };
  }

  const normalized = normalizeEmployeeImportCommandInput({
    commandKind: input.commandKind,
    organizationPublicId: input.organizationPublicId,
    rows: commandInput.rows.map((row) => ({
      initialPassword: row.initialPassword,
      name: row.name,
      phone: row.phone,
    })),
  });
  if (!normalized.success) {
    return normalized;
  }

  return {
    success: true,
    command: {
      ...normalized.value,
      rows: normalized.value.rows.map((row, index) => ({
        ...row,
        rowNumber: commandInput.rows[index]?.rowNumber ?? row.rowNumber,
      })),
    },
  };
}

async function createEmployeeImportPreview(
  repository: EmployeeImportCommandRepository,
  input: {
    actor: EmployeeImportCommandActor;
    command: NormalizedEmployeeImportCommandInput;
  },
): Promise<EmployeeImportPreflightDto> {
  const facts = await repository.preflightRows({
    actor: input.actor,
    organizationPublicId: input.command.organizationPublicId,
    rows: input.command.rows.map((row) => ({
      phone: row.phone,
      rowNumber: row.rowNumber,
    })),
  });
  const factByRowNumber = new Map(
    facts.rows.map((row) => [row.rowNumber, row]),
  );
  if (
    factByRowNumber.size !== input.command.rows.length ||
    input.command.rows.some((row) => !factByRowNumber.has(row.rowNumber))
  ) {
    throw new Error("Employee import preflight fact set changed.");
  }

  const duplicatePhones = findDuplicatePhones(
    input.command.rows.map((row) => row.phone),
  );
  let remainingSeatCount = facts.authorization.availableSeatCount;
  const rows = input.command.rows.map((row): EmployeeImportPreflightRowDto => {
    const fact = factByRowNumber.get(row.rowNumber);
    if (fact === undefined) {
      throw new Error("Employee import preflight row fact is unavailable.");
    }
    const inheritedAuthorizationSummary = {
      activeScopeCount: facts.authorization.activeScopeCount,
      effectiveEdition: facts.authorization.effectiveEdition,
      status: facts.authorization.status,
    };
    const availableSeatCount = remainingSeatCount;
    const prevalidatedReason = resolvePrevalidatedRejectionReason({
      duplicatePhones,
      initialPassword: row.initialPassword,
      name: row.name,
      organizationPublicId: input.command.organizationPublicId,
      phone: row.phone,
    });
    const blockedRow = (
      reason: EmployeeImportPreflightReason,
      quotaStatus:
        | "insufficient"
        | "not_required"
        | "unavailable" = "not_required",
      requiredSeatCount: 0 | 1 = 0,
    ): EmployeeImportPreflightRowDto => ({
      credentialMode: null,
      inheritedAuthorizationSummary,
      maskedPhone: maskPhoneForDisplay(row.phone),
      name: row.name,
      outcome: "block",
      quotaImpact: {
        availableSeatCount:
          quotaStatus === "unavailable" ? null : availableSeatCount,
        requiredSeatCount,
        status: quotaStatus,
      },
      redactedReason: reason,
      rowNumber: row.rowNumber,
    });

    if (prevalidatedReason !== null) {
      return blockedRow(prevalidatedReason);
    }
    if (facts.organizationStatus === "not_found") {
      return blockedRow("organization_not_found", "unavailable");
    }
    if (facts.authorization.status === "unavailable") {
      return blockedRow("current_authorization_insufficient", "unavailable");
    }
    if (fact.identityState === "admin_phone_conflict") {
      return blockedRow("cross_domain_conflict");
    }
    if (fact.identityState === "disabled_user") {
      return blockedRow("disabled_account");
    }
    if (fact.identityState === "employee_other_organization") {
      return blockedRow("cross_organization_conflict");
    }
    if (fact.identityState === "employee_same_organization") {
      return {
        credentialMode: "existing_account",
        inheritedAuthorizationSummary,
        maskedPhone: maskPhoneForDisplay(row.phone),
        name: row.name,
        outcome: "skip",
        quotaImpact: {
          availableSeatCount,
          requiredSeatCount: 0,
          status: "not_required",
        },
        redactedReason: null,
        rowNumber: row.rowNumber,
      };
    }
    if (remainingSeatCount === null) {
      throw new Error("Employee import available quota is unavailable.");
    }
    if (remainingSeatCount < 1) {
      return blockedRow("quota_insufficient", "insufficient", 1);
    }

    const outcome = fact.identityState === "personal_active" ? "bind" : "new";
    const credentialMode =
      outcome === "bind"
        ? "existing_account"
        : row.initialPassword.length === 0
          ? "generated"
          : "provided";
    remainingSeatCount -= 1;
    return {
      credentialMode,
      inheritedAuthorizationSummary,
      maskedPhone: maskPhoneForDisplay(row.phone),
      name: row.name,
      outcome,
      quotaImpact: {
        availableSeatCount,
        requiredSeatCount: 1,
        status: "available",
      },
      redactedReason: null,
      rowNumber: row.rowNumber,
    };
  });
  const counts = rows.reduce(
    (current, row) => ({
      ...current,
      [row.outcome]: current[row.outcome] + 1,
    }),
    { new: 0, bind: 0, skip: 0, block: 0 },
  );
  const canConfirm = counts.block === 0 && counts.new + counts.bind > 0;
  const semanticPreview = {
    canConfirm,
    commandKind: input.command.commandKind,
    confirmDisabledReason: canConfirm
      ? null
      : counts.block > 0
        ? ("blocked_rows" as const)
        : ("no_action_required" as const),
    counts,
    organizationPublicId: input.command.organizationPublicId,
    rowCount: input.command.rows.length,
    rows,
  };
  const previewRevision = createHash("sha256")
    .update(
      JSON.stringify({
        actorPublicId: input.actor.publicId,
        command: input.command,
        preview: semanticPreview,
        version: 1,
      }),
    )
    .digest("hex");

  return { previewRevision, ...semanticPreview };
}

async function executeNormalizedEmployeeImportCommand(
  repository: EmployeeImportCommandRepository,
  input: {
    actor: EmployeeImportCommandActor;
    command: NormalizedEmployeeImportCommandInput;
    fullCommandHashes: ReturnType<typeof createEmployeeImportCommandHashes>;
    prepareCredential: (
      initialPassword: string,
    ) => Promise<PreparedEmployeeCredential>;
  },
): Promise<
  EmployeeImportCommandServiceResult<EmployeeImportCommandConfirmationResult>
> {
  const rowRequestHashByNumber = new Map(
    input.command.rows.map((row) => [
      row.rowNumber,
      input.fullCommandHashes.rowHashes[row.rowNumber - 1],
    ]),
  );
  const claimedCommand = await repository.claimCommand({
    actor: input.actor,
    commandKind: input.command.commandKind,
    idempotencyScopeHash: input.fullCommandHashes.idempotencyScopeHash,
    organizationPublicId: input.command.organizationPublicId,
    requestHash: input.fullCommandHashes.requestHash,
    rows: input.command.rows.map((row) => ({
      rowNumber: row.rowNumber,
      rowRequestHash: resolveRowRequestHash(
        rowRequestHashByNumber,
        row.rowNumber,
      ),
    })),
  });
  const duplicatePhones = findDuplicatePhones(
    input.command.rows.map((row) => row.phone),
  );
  const pendingRowNumbers = new Set(
    claimedCommand.rows
      .filter((row) => row.status === "pending")
      .map((row) => row.rowNumber),
  );
  const pendingRows = input.command.rows
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
        organizationPublicId: input.command.organizationPublicId,
        phone: row.phone,
      }),
      rowNumber: row.rowNumber,
      rowRequestHash: resolveRowRequestHash(
        rowRequestHashByNumber,
        row.rowNumber,
      ),
    }));
  const preparedRows = await preparePendingRows(
    pendingRows,
    input.prepareCredential,
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

  return readCommand(repository, {
    actor: input.actor,
    commandPublicId: claimedCommand.publicId,
  });
}

function createPreviewBoundError(
  httpStatus: 409 | 422,
  code: 409608 | 422602 | 422603,
  message: string,
  preview: EmployeeImportPreflightDto,
): EmployeeImportCommandServiceResult<EmployeeImportCommandConfirmationResult> {
  return {
    httpStatus,
    response: { code, data: preview, message },
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

function resolveRowRequestHash(
  rowHashes: Map<number, string | undefined>,
  rowNumber: number,
): string {
  const rowRequestHash = rowHashes.get(rowNumber);
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
