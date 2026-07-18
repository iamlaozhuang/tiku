import { describe, expect, it } from "vitest";

import type {
  EmployeeImportCommandActor,
  IssuedEmployeeCredential,
  PreparedEmployeeCredential,
} from "../contracts/employee-import-command-contract";
import {
  EmployeeImportCommandError,
  type ClaimEmployeeImportCommandInput,
  type ConfirmEmployeeCredentialDistributionInput,
  type EmployeeImportCommandRecord,
  type EmployeeImportCommandRepository,
  type IssueEmployeeCredentialsInput,
  type ProcessEmployeeImportRowInput,
} from "../repositories/employee-import-command-repository";
import { createEmployeeImportCommandService } from "./employee-import-command-service";

const ACTOR: EmployeeImportCommandActor = {
  publicId: "admin-public-1",
  requestIp: "127.0.0.1",
  role: "ops_admin",
};
const IDEMPOTENCY_KEY = "123e4567-e89b-42d3-a456-426614174000";
const CREATED_AT = new Date("2026-07-17T12:00:00.000Z");
const UPDATED_AT = new Date("2026-07-17T12:01:00.000Z");

type SubmitBody = {
  commandKind: "single_create" | "batch_import";
  organizationPublicId: string;
  rows: { phone: string; name: string; initialPassword?: string | null }[];
};

type RepositoryHarnessOptions = {
  claimedStatuses?: Record<number, "pending" | "succeeded" | "rejected">;
  onFindCommand?: () => Promise<EmployeeImportCommandRecord | null>;
  onProcessRow?: (input: {
    commit: (outcome?: {
      rejectionReason?:
        | "invalid_row"
        | "duplicate_phone"
        | "organization_not_found"
        | "cross_domain_conflict"
        | "cross_organization_conflict"
        | "disabled_account"
        | "current_authorization_insufficient"
        | "quota_insufficient";
    }) => void;
    processInput: ProcessEmployeeImportRowInput;
  }) => Promise<void>;
};

function createSubmitBody(rows: SubmitBody["rows"]): SubmitBody {
  return {
    commandKind: rows.length === 1 ? "single_create" : "batch_import",
    organizationPublicId: "organization-public-1",
    rows,
  };
}

function createRow(index: number): SubmitBody["rows"][number] {
  return {
    initialPassword: "Password1",
    name: `Employee ${index}`,
    phone: `139${String(index).padStart(8, "0")}`,
  };
}

function cloneRecord(
  record: EmployeeImportCommandRecord,
): EmployeeImportCommandRecord {
  return {
    ...record,
    completedAt:
      record.completedAt === null ? null : new Date(record.completedAt),
    counts: { ...record.counts },
    createdAt: new Date(record.createdAt),
    distributionConfirmedAt:
      record.distributionConfirmedAt === null
        ? null
        : new Date(record.distributionConfirmedAt),
    rows: record.rows.map((row) => ({ ...row })),
    updatedAt: new Date(record.updatedAt),
  };
}

function countRows(record: EmployeeImportCommandRecord) {
  return record.rows.reduce(
    (counts, row) => ({
      ...counts,
      [row.status]: counts[row.status] + 1,
    }),
    { pending: 0, rejected: 0, succeeded: 0 },
  );
}

function createRepositoryHarness(options: RepositoryHarnessOptions = {}): {
  repository: EmployeeImportCommandRepository;
  getClaimInputs: () => ClaimEmployeeImportCommandInput[];
  getProcessInputs: () => ProcessEmployeeImportRowInput[];
  getCredentialActionCallCount: () => number;
  getRecord: () => EmployeeImportCommandRecord | null;
} {
  type CommandState = {
    record: EmployeeImportCommandRecord;
    requestHash: string;
  };

  let commandStates = new Map<string, CommandState>();
  let claimInputs: ClaimEmployeeImportCommandInput[] = [];
  let processInputs: ProcessEmployeeImportRowInput[] = [];
  let credentialActionCallCount = 0;

  function finalizeRecordWhenTerminal(
    record: EmployeeImportCommandRecord,
  ): EmployeeImportCommandRecord {
    const counts = countRows(record);
    const isCompleted = counts.pending === 0;
    const hasGeneratedCredential = record.rows.some(
      (row) => row.status === "succeeded" && row.credentialMode === "generated",
    );

    return {
      ...record,
      completedAt: isCompleted ? UPDATED_AT : null,
      counts,
      credentialDistributionStatus: isCompleted
        ? hasGeneratedCredential
          ? "open"
          : "not_required"
        : "pending",
      status: isCompleted ? "completed" : "processing",
      updatedAt: UPDATED_AT,
    };
  }

  function findCommandStateByPublicId(
    commandPublicId: string,
  ): [string, CommandState] | null {
    return (
      [...commandStates.entries()].find(
        ([, commandState]) => commandState.record.publicId === commandPublicId,
      ) ?? null
    );
  }

  function replaceCommandState(
    idempotencyScopeHash: string,
    commandState: CommandState,
  ): void {
    const replacementEntry: [string, CommandState] = [
      idempotencyScopeHash,
      commandState,
    ];
    commandStates = new Map([...commandStates.entries(), replacementEntry]);
  }

  function commitRow(
    processInput: ProcessEmployeeImportRowInput,
    outcome: Parameters<
      NonNullable<RepositoryHarnessOptions["onProcessRow"]>
    >[0]["commit"] extends (value?: infer TValue) => void
      ? TValue
      : never = {},
  ): void {
    const commandEntry = findCommandStateByPublicId(
      processInput.commandPublicId,
    );
    if (commandEntry === null) {
      throw new Error("Repository harness command is missing.");
    }
    const [idempotencyScopeHash, commandState] = commandEntry;

    const rejectionReason =
      outcome?.rejectionReason ?? processInput.prevalidatedRejectionReason;

    const updatedRecord = finalizeRecordWhenTerminal({
      ...commandState.record,
      rows: commandState.record.rows.map((row) => {
        if (
          row.rowNumber !== processInput.rowNumber ||
          row.status !== "pending"
        ) {
          return row;
        }
        if (rejectionReason !== null && rejectionReason !== undefined) {
          return {
            ...row,
            rejectionReason,
            status: "rejected" as const,
          };
        }

        return {
          ...row,
          credentialMode:
            processInput.preparedCredential?.credentialMode ??
            "existing_account",
          employeePublicId: `employee-public-${row.rowNumber}`,
          outcomeKind: "created" as const,
          status: "succeeded" as const,
        };
      }),
    });
    replaceCommandState(idempotencyScopeHash, {
      ...commandState,
      record: updatedRecord,
    });
  }

  const repository: EmployeeImportCommandRepository = {
    async claimCommand(input) {
      claimInputs = [...claimInputs, input];
      const existingCommandState = commandStates.get(
        input.idempotencyScopeHash,
      );

      if (existingCommandState !== undefined) {
        if (input.requestHash !== existingCommandState.requestHash) {
          throw new EmployeeImportCommandError("idempotency_request_mismatch");
        }
        return cloneRecord(existingCommandState.record);
      }

      const commandSequence = commandStates.size + 1;
      const record = finalizeRecordWhenTerminal({
        actorAdminPublicId: input.actor.publicId,
        commandKind: input.commandKind,
        completedAt: null,
        counts: { pending: input.rows.length, rejected: 0, succeeded: 0 },
        createdAt: CREATED_AT,
        credentialDistributionStatus: "pending",
        credentialRevision: 0,
        currentIssuePublicId: null,
        distributionConfirmedAt: null,
        organizationPublicId: input.organizationPublicId,
        publicId: `employee-import-command-public-${commandSequence}`,
        rowCount: input.rows.length,
        rows: input.rows.map((row) => {
          const status = options.claimedStatuses?.[row.rowNumber] ?? "pending";

          return {
            credentialMode: status === "succeeded" ? "provided" : null,
            employeePublicId:
              status === "succeeded"
                ? `employee-public-${row.rowNumber}`
                : null,
            outcomeKind: status === "succeeded" ? "created" : null,
            publicId: `employee-import-row-public-${commandSequence}-${row.rowNumber}`,
            rejectionReason:
              status === "rejected" ? "quota_insufficient" : null,
            rowNumber: row.rowNumber,
            status,
            warningReason: null,
          };
        }),
        status: "processing",
        updatedAt: CREATED_AT,
      });
      replaceCommandState(input.idempotencyScopeHash, {
        record,
        requestHash: input.requestHash,
      });
      return cloneRecord(record);
    },

    async processRow(input) {
      processInputs = [...processInputs, input];

      if (options.onProcessRow !== undefined) {
        await options.onProcessRow({
          commit: (outcome) => commitRow(input, outcome),
          processInput: input,
        });
        return;
      }

      commitRow(input);
    },

    async findCommand(input) {
      if (options.onFindCommand !== undefined) {
        return options.onFindCommand();
      }
      const commandEntry = findCommandStateByPublicId(input.commandPublicId);
      if (commandEntry === null) {
        return null;
      }
      return cloneRecord(commandEntry[1].record);
    },

    async listIssueTargets() {
      credentialActionCallCount += 1;
      throw new Error("Task 5 list targets must not be called.");
    },

    async issueCredentials() {
      credentialActionCallCount += 1;
      throw new Error("Task 5 issue must not be called.");
    },

    async confirmDistribution() {
      credentialActionCallCount += 1;
      throw new Error("Task 5 confirm must not be called.");
    },
  };

  return {
    getClaimInputs: () => claimInputs,
    getCredentialActionCallCount: () => credentialActionCallCount,
    getProcessInputs: () => processInputs,
    getRecord: () => {
      const firstCommandState = [...commandStates.values()][0];
      return firstCommandState === undefined
        ? null
        : cloneRecord(firstCommandState.record);
    },
    repository,
  };
}

function createFastCredentialPreparer(input?: {
  onPrepare?: (initialPassword: string) => Promise<void> | void;
}) {
  return async (
    initialPassword: string,
  ): Promise<PreparedEmployeeCredential> => {
    await input?.onPrepare?.(initialPassword);
    return {
      credentialMode: initialPassword.length === 0 ? "generated" : "provided",
      passwordHash: `synthetic-hash-${initialPassword.length}`,
    };
  };
}

function createCredentialServiceHarness(input?: {
  targetCount?: number;
  onIssue?: (issueInput: IssueEmployeeCredentialsInput) => void;
}) {
  const targetCount = input?.targetCount ?? 2;
  let issueInputs: IssueEmployeeCredentialsInput[] = [];
  let confirmInputs: ConfirmEmployeeCredentialDistributionInput[] = [];
  let confirmCallCount = 0;
  const record: EmployeeImportCommandRecord = {
    actorAdminPublicId: ACTOR.publicId,
    commandKind: "batch_import",
    completedAt: UPDATED_AT,
    counts: { pending: 0, rejected: 0, succeeded: targetCount },
    createdAt: CREATED_AT,
    credentialDistributionStatus: "open",
    credentialRevision: 0,
    currentIssuePublicId: null,
    distributionConfirmedAt: null,
    organizationPublicId: "organization-public-1",
    publicId: "employee-import-command-public-1",
    rowCount: targetCount,
    rows: Array.from({ length: targetCount }, (_, index) => ({
      credentialMode: "generated" as const,
      employeePublicId: `employee-public-${index + 1}`,
      outcomeKind: "created" as const,
      publicId: `employee-import-row-public-${index + 1}`,
      rejectionReason: null,
      rowNumber: index + 1,
      status: "succeeded" as const,
      warningReason: null,
    })),
    status: "completed",
    updatedAt: UPDATED_AT,
  };
  const repository: EmployeeImportCommandRepository = {
    async claimCommand() {
      throw new Error("submit is not expected");
    },
    async processRow() {
      throw new Error("processRow is not expected");
    },
    async findCommand() {
      return cloneRecord(record);
    },
    async listIssueTargets() {
      return {
        commandPublicId: record.publicId,
        credentialRevision: record.credentialRevision,
        targets: record.rows.map((row) => ({
          employeePublicId: row.employeePublicId ?? "",
          rowNumber: row.rowNumber,
          rowPublicId: row.publicId,
        })),
      };
    },
    async issueCredentials(issueInput) {
      issueInputs = [...issueInputs, issueInput];
      input?.onIssue?.(issueInput);
      return {
        credentialRevision: issueInput.expectedCredentialRevision + 1,
        issuePublicId: "employee-import-issue-public-1",
        rows: [...record.rows].reverse().map((row) => ({
          employeePublicId: row.employeePublicId ?? "",
          name: `Employee ${row.rowNumber}`,
          phone: `1390000000${row.rowNumber}`,
          rowNumber: row.rowNumber,
          rowPublicId: row.publicId,
        })),
      };
    },
    async confirmDistribution(confirmInput) {
      confirmCallCount += 1;
      confirmInputs = [...confirmInputs, confirmInput];
      return {
        ...cloneRecord(record),
        credentialDistributionStatus: "confirmed",
        credentialRevision: 1,
        currentIssuePublicId: "employee-import-issue-public-1",
        distributionConfirmedAt: UPDATED_AT,
      };
    },
  };

  return {
    getConfirmCallCount: () => confirmCallCount,
    getConfirmInputs: () => confirmInputs,
    getIssueInputs: () => issueInputs,
    repository,
  };
}

describe("employee import command service", () => {
  it("resumes the same command and hashes or processes only claimed pending rows", async () => {
    const harness = createRepositoryHarness({
      claimedStatuses: { 1: "succeeded", 2: "pending" },
    });
    let prepareCount = 0;
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer({
        onPrepare: () => {
          prepareCount += 1;
        },
      }),
    });
    const body = createSubmitBody([createRow(1), createRow(2)]);

    const firstResult = await service.submit({
      actor: ACTOR,
      body,
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    const replayResult = await service.submit({
      actor: ACTOR,
      body,
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(firstResult.httpStatus).toBe(200);
    expect(replayResult).toEqual(firstResult);
    expect(harness.getClaimInputs()).toHaveLength(2);
    expect(harness.getProcessInputs().map((row) => row.rowNumber)).toEqual([2]);
    expect(prepareCount).toBe(1);
  });

  it.each([
    [
      "kind",
      {
        body: {
          ...createSubmitBody([createRow(1), createRow(2)]),
          commandKind: "single_create",
          rows: [createRow(1)],
        },
      },
    ],
    ["row order", { body: createSubmitBody([createRow(2), createRow(1)]) }],
    [
      "phone",
      {
        body: createSubmitBody([
          { ...createRow(1), phone: "13800000000" },
          createRow(2),
        ]),
      },
    ],
    [
      "name",
      {
        body: createSubmitBody([
          { ...createRow(1), name: "Changed Employee" },
          createRow(2),
        ]),
      },
    ],
    [
      "password",
      {
        body: createSubmitBody([
          { ...createRow(1), initialPassword: "Changed9" },
          createRow(2),
        ]),
      },
    ],
  ] as const)(
    "maps same-key %s mismatch to the stable 409",
    async (_, change) => {
      const harness = createRepositoryHarness();
      const service = createEmployeeImportCommandService(harness.repository, {
        prepareCredential: createFastCredentialPreparer(),
      });
      const body = createSubmitBody([createRow(1), createRow(2)]);

      await service.submit({
        actor: ACTOR,
        body,
        idempotencyKey: IDEMPOTENCY_KEY,
      });
      const result = await service.submit({
        actor: ACTOR,
        body: "body" in change ? change.body : body,
        idempotencyKey: IDEMPOTENCY_KEY,
      });

      expect(result).toEqual({
        httpStatus: 409,
        response: {
          code: 409601,
          data: null,
          message: "Idempotency request mismatch.",
        },
      });
    },
  );

  it.each([
    [
      "actor",
      {
        actor: { ...ACTOR, publicId: "admin-public-2" },
        body: createSubmitBody([createRow(1)]),
      },
    ],
    [
      "organization",
      {
        actor: ACTOR,
        body: {
          ...createSubmitBody([createRow(1)]),
          organizationPublicId: "organization-public-2",
        },
      },
    ],
  ] as const)(
    "derives an independent command scope when %s changes",
    async (_, changedInput) => {
      const harness = createRepositoryHarness();
      const service = createEmployeeImportCommandService(harness.repository, {
        prepareCredential: createFastCredentialPreparer(),
      });
      const originalInput = {
        actor: ACTOR,
        body: createSubmitBody([createRow(1)]),
        idempotencyKey: IDEMPOTENCY_KEY,
      };

      const originalResult = await service.submit(originalInput);
      const changedResult = await service.submit({
        ...changedInput,
        idempotencyKey: IDEMPOTENCY_KEY,
      });
      const originalReplay = await service.submit(originalInput);
      const changedReplay = await service.submit({
        ...changedInput,
        idempotencyKey: IDEMPOTENCY_KEY,
      });
      const claimScopeHashes = harness
        .getClaimInputs()
        .map((input) => input.idempotencyScopeHash);

      expect(originalResult.httpStatus).toBe(200);
      expect(changedResult.httpStatus).toBe(200);
      expect(originalResult.response.data?.publicId).not.toBe(
        changedResult.response.data?.publicId,
      );
      expect(originalReplay.response.data?.publicId).toBe(
        originalResult.response.data?.publicId,
      );
      expect(changedReplay.response.data?.publicId).toBe(
        changedResult.response.data?.publicId,
      );
      expect(claimScopeHashes).toEqual([
        claimScopeHashes[0],
        claimScopeHashes[1],
        claimScopeHashes[0],
        claimScopeHashes[1],
      ]);
      expect(claimScopeHashes[0]).not.toBe(claimScopeHashes[1]);
      expect(harness.getProcessInputs()).toHaveLength(2);
    },
  );

  it("persists every occurrence of a duplicate phone as duplicate_phone", async () => {
    const harness = createRepositoryHarness();
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });
    const duplicateRow = createRow(1);

    const result = await service.submit({
      actor: ACTOR,
      body: createSubmitBody([
        duplicateRow,
        { ...duplicateRow, name: "Duplicate Employee" },
      ]),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(harness.getProcessInputs()).toHaveLength(2);
    expect(
      harness
        .getProcessInputs()
        .map((row) => [
          row.prevalidatedRejectionReason,
          row.preparedCredential,
        ]),
    ).toEqual([
      ["duplicate_phone", null],
      ["duplicate_phone", null],
    ]);
    expect(
      result.response.data?.rows.map((row) => row.rejectionReason),
    ).toEqual(["duplicate_phone", "duplicate_phone"]);
  });

  it("uses the employee-account validator for invalid rows without hashing them", async () => {
    const harness = createRepositoryHarness();
    let prepareCount = 0;
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer({
        onPrepare: () => {
          prepareCount += 1;
        },
      }),
    });

    const result = await service.submit({
      actor: ACTOR,
      body: createSubmitBody([
        { ...createRow(1), phone: "invalid-phone" },
        createRow(2),
      ]),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(harness.getProcessInputs()).toHaveLength(2);
    expect(harness.getProcessInputs()[0]).toMatchObject({
      preparedCredential: null,
      prevalidatedRejectionReason: "invalid_row",
      rowNumber: 1,
    });
    expect(result.response.data?.rows[0]).toMatchObject({
      rejectionReason: "invalid_row",
      status: "rejected",
    });
    expect(prepareCount).toBe(1);
  });

  it("continues after the Nth deterministic repository rejection", async () => {
    const harness = createRepositoryHarness({
      async onProcessRow({ commit, processInput }) {
        if (processInput.rowNumber === 2) {
          commit({ rejectionReason: "quota_insufficient" });
          return;
        }
        commit();
      },
    });
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });

    const result = await service.submit({
      actor: ACTOR,
      body: createSubmitBody([createRow(1), createRow(2), createRow(3)]),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(harness.getProcessInputs().map((row) => row.rowNumber)).toEqual([
      1, 2, 3,
    ]);
    expect(result.httpStatus).toBe(200);
    expect(result.response.data?.counts).toEqual({
      pending: 0,
      rejected: 1,
      succeeded: 2,
    });
    expect(result.response.data?.rows[1]?.rejectionReason).toBe(
      "quota_insufficient",
    );
  });

  it("returns a redacted 503 on the Nth unknown result and stops later rows", async () => {
    const harness = createRepositoryHarness({
      async onProcessRow({ commit, processInput }) {
        if (processInput.rowNumber === 2) {
          throw new Error("database failed for 13900000002 Password1");
        }
        commit();
      },
    });
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });

    const result = await service.submit({
      actor: ACTOR,
      body: createSubmitBody([createRow(1), createRow(2), createRow(3)]),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(result).toEqual({
      httpStatus: 503,
      response: {
        code: 503601,
        data: null,
        message: "Employee import command is temporarily unavailable.",
      },
    });
    expect(JSON.stringify(result)).not.toContain("13900000002");
    expect(JSON.stringify(result)).not.toContain("Password1");
    expect(harness.getProcessInputs().map((row) => row.rowNumber)).toEqual([
      1, 2,
    ]);
    expect(harness.getRecord()?.rows.map((row) => row.status)).toEqual([
      "succeeded",
      "pending",
      "pending",
    ]);
  });

  it("recovers commit-ack loss from the terminal row without processing it again", async () => {
    let losesAcknowledgement = true;
    const harness = createRepositoryHarness({
      async onProcessRow({ commit }) {
        commit();
        if (losesAcknowledgement) {
          losesAcknowledgement = false;
          throw new Error("commit acknowledgement lost");
        }
      },
    });
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });
    const input = {
      actor: ACTOR,
      body: createSubmitBody([createRow(1)]),
      idempotencyKey: IDEMPOTENCY_KEY,
    };

    const unknownResult = await service.submit(input);
    const replayResult = await service.submit(input);

    expect(unknownResult.httpStatus).toBe(503);
    expect(replayResult.httpStatus).toBe(200);
    expect(replayResult.response.data?.rows[0]?.status).toBe("succeeded");
    expect(harness.getProcessInputs()).toHaveLength(1);
  });

  it("accepts 500 rows and rejects 501 before repository or hash work", async () => {
    const acceptedHarness = createRepositoryHarness();
    const acceptedService = createEmployeeImportCommandService(
      acceptedHarness.repository,
      { prepareCredential: createFastCredentialPreparer() },
    );

    const acceptedResult = await acceptedService.submit({
      actor: ACTOR,
      body: createSubmitBody(
        Array.from({ length: 500 }, (_, index) => createRow(index)),
      ),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(acceptedResult.httpStatus).toBe(200);
    expect(acceptedHarness.getProcessInputs()).toHaveLength(500);

    const rejectedHarness = createRepositoryHarness();
    let prepareCount = 0;
    const rejectedService = createEmployeeImportCommandService(
      rejectedHarness.repository,
      {
        prepareCredential: createFastCredentialPreparer({
          onPrepare: () => {
            prepareCount += 1;
          },
        }),
      },
    );
    const rejectedResult = await rejectedService.submit({
      actor: ACTOR,
      body: createSubmitBody(
        Array.from({ length: 501 }, (_, index) => createRow(index)),
      ),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(rejectedResult).toEqual({
      httpStatus: 422,
      response: {
        code: 422601,
        data: null,
        message: "Invalid employee import command input.",
      },
    });
    expect(rejectedHarness.getClaimInputs()).toHaveLength(0);
    expect(prepareCount).toBe(0);
  });

  it("returns a complete secret-free DTO from GET with ISO dates and explicit nulls", async () => {
    const harness = createRepositoryHarness({
      claimedStatuses: { 1: "pending" },
    });
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });
    await service.submit({
      actor: ACTOR,
      body: createSubmitBody([createRow(1)]),
      idempotencyKey: IDEMPOTENCY_KEY,
    });
    const persistedRecord = harness.getRecord();
    if (persistedRecord === null) {
      throw new Error("Expected a persisted command.");
    }
    const secretBearingRecord = {
      ...persistedRecord,
      name: "Secret Employee",
      passwordHash: "secret-hash",
      phone: "13900000001",
    };
    const secretBearingRepository = createRepositoryHarness({
      onFindCommand: async () => secretBearingRecord,
    });
    const getService = createEmployeeImportCommandService(
      secretBearingRepository.repository,
      { prepareCredential: createFastCredentialPreparer() },
    );

    const result = await getService.get({
      actor: ACTOR,
      commandPublicId: persistedRecord.publicId,
    });

    expect(result.httpStatus).toBe(200);
    expect(result.response.data).toMatchObject({
      completedAt: "2026-07-17T12:01:00.000Z",
      currentIssuePublicId: null,
      distributionConfirmedAt: null,
      rows: [
        {
          credentialMode: "provided",
          employeePublicId: "employee-public-1",
          outcomeKind: "created",
          rejectionReason: null,
          warningReason: null,
        },
      ],
      updatedAt: "2026-07-17T12:01:00.000Z",
    });
    expect(Object.keys(result.response.data ?? {}).sort()).toEqual(
      [
        "commandKind",
        "completedAt",
        "counts",
        "createdAt",
        "credentialDistributionStatus",
        "credentialRevision",
        "currentIssuePublicId",
        "distributionConfirmedAt",
        "organizationPublicId",
        "publicId",
        "rowCount",
        "rows",
        "status",
        "updatedAt",
      ].sort(),
    );
    expect(JSON.stringify(result)).not.toContain("Secret Employee");
    expect(JSON.stringify(result)).not.toContain("13900000001");
    expect(JSON.stringify(result)).not.toContain("secret-hash");
  });

  it.each([
    ["actor_forbidden", 403, 403601, "Employee import command is forbidden."],
    [
      "command_not_found",
      404,
      404601,
      "Employee import command does not exist.",
    ],
    [
      "idempotency_request_mismatch",
      409,
      409601,
      "Idempotency request mismatch.",
    ],
    ["credential_revision_stale", 409, 409602, "Credential revision is stale."],
    ["credential_manifest_stale", 409, 409603, "Credential manifest is stale."],
    [
      "credential_distribution_closed",
      409,
      409604,
      "Credential distribution is closed.",
    ],
    ["active_session", 409, 409605, "Employee session is active."],
    ["account_state_changed", 409, 409606, "Employee account state changed."],
    [
      "credential_baseline_changed",
      409,
      409607,
      "Employee credential changed.",
    ],
  ] as const)(
    "maps %s to the exact stable envelope",
    async (reason, httpStatus, code, message) => {
      const harness = createRepositoryHarness({
        onFindCommand: async () => {
          throw new EmployeeImportCommandError(reason);
        },
      });
      const service = createEmployeeImportCommandService(harness.repository, {
        prepareCredential: createFastCredentialPreparer(),
      });

      const result = await service.get({
        actor: ACTOR,
        commandPublicId: "employee-import-command-public-1",
      });

      expect(result).toEqual({
        httpStatus,
        response: { code, data: null, message },
      });
    },
  );

  it("maps unknown query errors to a redacted 503", async () => {
    const harness = createRepositoryHarness({
      onFindCommand: async () => {
        throw new Error("database leaked 13900000001 Password1");
      },
    });
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });

    const result = await service.get({
      actor: ACTOR,
      commandPublicId: "employee-import-command-public-1",
    });

    expect(result).toEqual({
      httpStatus: 503,
      response: {
        code: 503601,
        data: null,
        message: "Employee import command is temporarily unavailable.",
      },
    });
    expect(JSON.stringify(result)).not.toContain("13900000001");
    expect(JSON.stringify(result)).not.toContain("Password1");
  });

  it("limits credential hashing to four concurrent operations", async () => {
    const harness = createRepositoryHarness();
    let activeHashCount = 0;
    let maximumHashCount = 0;
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer({
        onPrepare: async () => {
          activeHashCount += 1;
          maximumHashCount = Math.max(maximumHashCount, activeHashCount);
          await new Promise((resolve) => setTimeout(resolve, 5));
          activeHashCount -= 1;
        },
      }),
    });

    const result = await service.submit({
      actor: ACTOR,
      body: createSubmitBody(
        Array.from({ length: 12 }, (_, index) => createRow(index)),
      ),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(result.httpStatus).toBe(200);
    expect(maximumHashCount).toBe(4);
  });

  it("fails closed when credential preparation fails before row locks", async () => {
    const harness = createRepositoryHarness();
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: async (initialPassword) => {
        if (initialPassword === "Failure9") {
          throw new Error(`hash failed for ${initialPassword}`);
        }
        return createFastCredentialPreparer()(initialPassword);
      },
    });

    const result = await service.submit({
      actor: ACTOR,
      body: createSubmitBody([
        createRow(1),
        { ...createRow(2), initialPassword: "Failure9" },
        createRow(3),
      ]),
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(result.httpStatus).toBe(503);
    expect(result.response.data).toBeNull();
    expect(JSON.stringify(result)).not.toContain("Failure9");
    expect(harness.getProcessInputs()).toHaveLength(0);
    expect(harness.getRecord()?.counts.pending).toBe(3);
  });

  it("maps an unexpected outer-input access failure to the redacted 503", async () => {
    const harness = createRepositoryHarness();
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });
    const hostileBody = {
      organizationPublicId: "organization-public-1",
      rows: [createRow(1)],
    } as Record<string, unknown>;
    Object.defineProperty(hostileBody, "commandKind", {
      enumerable: true,
      get() {
        throw new Error("outer input leaked Password1");
      },
    });

    const result = await service.submit({
      actor: ACTOR,
      body: hostileBody,
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(result).toEqual({
      httpStatus: 503,
      response: {
        code: 503601,
        data: null,
        message: "Employee import command is temporarily unavailable.",
      },
    });
    expect(JSON.stringify(result)).not.toContain("Password1");
    expect(harness.getClaimInputs()).toHaveLength(0);
  });

  it("prepares every issue target outside the repository and pairs plaintext by row public id", async () => {
    const harness = createCredentialServiceHarness();
    let sequence = 0;
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
      prepareIssuedCredential: async (): Promise<IssuedEmployeeCredential> => {
        sequence += 1;
        return {
          initialPassword: `Password${sequence}A1`,
          passwordHash: `issued-hash-${sequence}`,
        };
      },
    });

    const issueResult = await service.issueCredentials({
      actor: ACTOR,
      body: { expectedCredentialRevision: 0 },
      commandPublicId: "employee-import-command-public-1",
    });

    expect(issueResult).toEqual({
      httpStatus: 200,
      response: {
        code: 0,
        data: {
          credentialRevision: 1,
          issuePublicId: "employee-import-issue-public-1",
          rows: [
            {
              employeePublicId: "employee-public-2",
              initialPassword: "Password2A1",
              name: "Employee 2",
              phone: "139****0002",
              rowNumber: 2,
              rowPublicId: "employee-import-row-public-2",
            },
            {
              employeePublicId: "employee-public-1",
              initialPassword: "Password1A1",
              name: "Employee 1",
              phone: "139****0001",
              rowNumber: 1,
              rowPublicId: "employee-import-row-public-1",
            },
          ],
        },
        message: "ok",
      },
    });
    expect(harness.getIssueInputs()).toEqual([
      {
        actor: ACTOR,
        commandPublicId: "employee-import-command-public-1",
        credentials: [
          {
            passwordHash: "issued-hash-1",
            rowPublicId: "employee-import-row-public-1",
          },
          {
            passwordHash: "issued-hash-2",
            rowPublicId: "employee-import-row-public-2",
          },
        ],
        expectedCredentialRevision: 0,
      },
    ]);
    expect(JSON.stringify(harness.getIssueInputs())).not.toContain("Password");
  });

  it("bounds up to 500 issue hash operations at four and fails closed before repository issue", async () => {
    const successHarness = createCredentialServiceHarness({ targetCount: 12 });
    let activeHashCount = 0;
    let maximumHashCount = 0;
    const successService = createEmployeeImportCommandService(
      successHarness.repository,
      {
        prepareIssuedCredential: async () => {
          activeHashCount += 1;
          maximumHashCount = Math.max(maximumHashCount, activeHashCount);
          await new Promise((resolve) => setTimeout(resolve, 5));
          activeHashCount -= 1;
          return { initialPassword: "Password1A1", passwordHash: "hash" };
        },
      },
    );

    await expect(
      successService.issueCredentials({
        actor: ACTOR,
        body: { expectedCredentialRevision: 0 },
        commandPublicId: "employee-import-command-public-1",
      }),
    ).resolves.toMatchObject({ httpStatus: 200 });
    expect(maximumHashCount).toBe(4);

    const failureHarness = createCredentialServiceHarness({ targetCount: 12 });
    let preparationCount = 0;
    const failureService = createEmployeeImportCommandService(
      failureHarness.repository,
      {
        prepareIssuedCredential: async () => {
          preparationCount += 1;
          if (preparationCount === 6) {
            throw new Error("hash failed with Password1A1");
          }
          return { initialPassword: "Password1A1", passwordHash: "hash" };
        },
      },
    );
    const failedResult = await failureService.issueCredentials({
      actor: ACTOR,
      body: { expectedCredentialRevision: 0 },
      commandPublicId: "employee-import-command-public-1",
    });

    expect(failedResult).toMatchObject({
      httpStatus: 503,
      response: { code: 503601, data: null },
    });
    expect(JSON.stringify(failedResult)).not.toContain("Password1A1");
    expect(failureHarness.getIssueInputs()).toHaveLength(0);
  });

  it("validates and delegates idempotent distribution confirmation", async () => {
    const harness = createCredentialServiceHarness();
    const service = createEmployeeImportCommandService(harness.repository);
    const confirmResult = await service.confirmDistribution({
      actor: ACTOR,
      body: {
        expectedCredentialRevision: 1,
        issuePublicId: "employee-import-issue-public-1",
      },
      commandPublicId: "employee-import-command-public-1",
    });

    expect(confirmResult).toMatchObject({
      httpStatus: 200,
      response: {
        data: {
          credentialDistributionStatus: "confirmed",
          credentialRevision: 1,
          currentIssuePublicId: "employee-import-issue-public-1",
          distributionConfirmedAt: "2026-07-17T12:01:00.000Z",
        },
      },
    });
    expect(harness.getConfirmCallCount()).toBe(1);
    expect(harness.getConfirmInputs()).toEqual([
      {
        actor: ACTOR,
        commandPublicId: "employee-import-command-public-1",
        expectedCredentialRevision: 1,
        issuePublicId: "employee-import-issue-public-1",
      },
    ]);

    const invalid = await service.confirmDistribution({
      actor: ACTOR,
      body: {
        expectedCredentialRevision: 1,
        issuePublicId: "employee-import-issue-public-1",
        password: "Secret9",
      },
      commandPublicId: "employee-import-command-public-1",
    });
    expect(invalid.httpStatus).toBe(422);
    expect(harness.getConfirmCallCount()).toBe(1);
    expect(harness.getConfirmInputs()).toHaveLength(1);
  });

  it("rejects invalid outer inputs with 422 before repository access", async () => {
    const harness = createRepositoryHarness();
    const service = createEmployeeImportCommandService(harness.repository, {
      prepareCredential: createFastCredentialPreparer(),
    });

    const invalidKeyResult = await service.submit({
      actor: ACTOR,
      body: createSubmitBody([createRow(1)]),
      idempotencyKey: "not-a-uuid",
    });
    const invalidBodyResult = await service.submit({
      actor: ACTOR,
      body: { commandKind: "batch_import", rows: [] },
      idempotencyKey: IDEMPOTENCY_KEY,
    });

    expect(invalidKeyResult).toEqual({
      httpStatus: 422,
      response: {
        code: 422601,
        data: null,
        message: "Idempotency-Key must be a UUID v4.",
      },
    });
    expect(invalidBodyResult).toEqual({
      httpStatus: 422,
      response: {
        code: 422601,
        data: null,
        message: "Invalid employee import command input.",
      },
    });
    expect(harness.getClaimInputs()).toHaveLength(0);
  });
});
