import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";

import {
  admin,
  auditLog,
  authAccount,
  authSession,
  authUpgrade,
  authUser,
  employee,
  employeeImportCommand,
  employeeImportRow,
  employeeOrgAuth,
  organization,
  orgAuth,
  user,
} from "@/db/schema";

import type {
  ClaimEmployeeImportCommandInput,
  EmployeeImportCommandRepository,
  ProcessEmployeeImportRowInput,
} from "./employee-import-command-repository";
import { EmployeeImportCommandError } from "./employee-import-command-repository";
import {
  createPostgresEmployeeImportCommandRepository,
  type EmployeeImportCommandDatabase,
} from "./postgres-employee-import-command-repository";

const actor = {
  publicId: "admin-public-001",
  role: "ops_admin" as const,
  requestIp: "203.0.113.10",
};
const CREDENTIAL_PROVIDER_ID_FOR_TEST = "credential";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function createRowInput(): ProcessEmployeeImportRowInput {
  return {
    actor,
    commandPublicId: "employee-import-command-public-001",
    rowNumber: 1,
    rowRequestHash: "v1:row-hash",
    phone: "13900000001",
    name: "Employee One",
    preparedCredential: {
      credentialMode: "generated",
      passwordHash: "placeholder-password-hash",
    },
    prevalidatedRejectionReason: null,
  };
}

function createClaimInput(
  requestHash = "v1:request-hash",
): ClaimEmployeeImportCommandInput {
  return {
    actor,
    commandKind: "batch_import",
    idempotencyScopeHash: "v1:idempotency-scope-hash",
    organizationPublicId: "organization-public-001",
    requestHash,
    rows: [
      { rowNumber: 1, rowRequestHash: "v1:row-hash-001" },
      { rowNumber: 2, rowRequestHash: "v1:row-hash-002" },
    ],
  };
}

describe("postgres employee import command repository", () => {
  it("claims command, row shells and started audit in one transaction", async () => {
    const database = createCommandBehaviorDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    const command = await repository.claimCommand(createClaimInput());

    expect(command.rowCount).toBe(2);
    expect(command.rows).toHaveLength(2);
    expect(database.transactionCount).toBe(1);
    expect(database.commandInsertCount).toBe(1);
    expect(database.rowInsertCount).toBe(2);
    expect(database.startedAuditCount).toBe(1);
    expect(database.mutationTransactionIds).toEqual([1, 1, 1]);
  });

  it("recovers the same claim without duplicating rows or audit", async () => {
    const database = createCommandBehaviorDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    const first = await repository.claimCommand(createClaimInput());
    const replay = await repository.claimCommand(createClaimInput());

    expect(replay).toEqual(first);
    expect(database.commandInsertCount).toBe(1);
    expect(database.rowInsertCount).toBe(2);
    expect(database.startedAuditCount).toBe(1);
  });

  it("rejects the same idempotency scope with a different request", async () => {
    const database = createCommandBehaviorDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    await repository.claimCommand(createClaimInput());

    await expect(
      repository.claimCommand(createClaimInput("v1:different-request-hash")),
    ).rejects.toMatchObject({
      reason: "idempotency_request_mismatch",
    });
    expect(database.commandInsertCount).toBe(1);
    expect(database.rowInsertCount).toBe(2);
    expect(database.startedAuditCount).toBe(1);
  });

  it("models a stateful claim conflict with one row and audit set", async () => {
    const database = createCommandBehaviorDatabase();
    const firstRepository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const secondRepository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    const first = await firstRepository.claimCommand(createClaimInput());
    const second = await secondRepository.claimCommand(createClaimInput());

    expect(second).toEqual(first);
    expect(database.commandInsertCount).toBe(1);
    expect(database.rowInsertCount).toBe(2);
    expect(database.startedAuditCount).toBe(1);
  });

  it("lets the owner read a command under a shared command lock", async () => {
    const database = createCommandBehaviorDatabase({
      actorAdminId: 11,
      commandOwnerAdminId: 11,
      seedCommand: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.findCommand({
        actor,
        commandPublicId: "employee-import-command-public-001",
      }),
    ).resolves.toMatchObject({
      publicId: "employee-import-command-public-001",
    });
    expect(database.lockLog).toContain(
      "employee_import_command:share:of=employee_import_command",
    );
  });

  it("lets a super admin read another actor's command", async () => {
    const superActor = {
      ...actor,
      publicId: "admin-public-super",
      role: "super_admin" as const,
    };
    const database = createCommandBehaviorDatabase({
      actorAdminId: 99,
      actorPublicId: superActor.publicId,
      actorRole: "super_admin",
      commandOwnerAdminId: 11,
      seedCommand: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.findCommand({
        actor: superActor,
        commandPublicId: "employee-import-command-public-001",
      }),
    ).resolves.toMatchObject({
      publicId: "employee-import-command-public-001",
    });
  });

  it("hides another ops admin's command", async () => {
    const database = createCommandBehaviorDatabase({
      actorAdminId: 22,
      commandOwnerAdminId: 11,
      seedCommand: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.findCommand({
        actor,
        commandPublicId: "employee-import-command-public-001",
      }),
    ).resolves.toBeNull();
  });

  it("keeps an invalid actor distinct from a hidden command", async () => {
    const database = createCommandBehaviorDatabase({
      actorIsValid: false,
      commandOwnerAdminId: 11,
      seedCommand: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.findCommand({
        actor,
        commandPublicId: "employee-import-command-public-001",
      }),
    ).rejects.toEqual(new EmployeeImportCommandError("actor_forbidden"));
  });

  it("reads organization, authorization and all phone identities with fixed set queries", async () => {
    const database = createPreflightDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    const facts = await repository.preflightRows({
      actor,
      organizationPublicId: "organization-public-001",
      rows: [
        { rowNumber: 1, phone: "13900000001" },
        { rowNumber: 2, phone: "13900000002" },
        { rowNumber: 3, phone: "13900000003" },
        { rowNumber: 4, phone: "13900000004" },
        { rowNumber: 5, phone: "13900000005" },
        { rowNumber: 6, phone: "13900000006" },
      ],
    });

    expect(facts).toEqual({
      organizationStatus: "active",
      authorization: {
        status: "available",
        activeScopeCount: 2,
        effectiveEdition: "advanced",
        availableSeatCount: 4,
      },
      rows: [
        { rowNumber: 1, identityState: "absent" },
        { rowNumber: 2, identityState: "personal_active" },
        { rowNumber: 3, identityState: "employee_same_organization" },
        { rowNumber: 4, identityState: "employee_other_organization" },
        { rowNumber: 5, identityState: "disabled_user" },
        { rowNumber: 6, identityState: "admin_phone_conflict" },
      ],
    });
    expect(database.selectCounts).toEqual({
      actor: 1,
      adminPhones: 1,
      authUpgrades: 1,
      organization: 1,
      orgAuths: 1,
      users: 1,
    });
    expect(database.writeCount).toBe(0);
  });

  it("includes a future covering authorization in the JIT quota reservation set", async () => {
    const database = createPreflightDatabase({
      orgAuthRows: [
        {
          account_quota: 10,
          edition: "standard",
          id: 51,
          starts_at: new Date("2026-01-01T00:00:00.000Z"),
          used_quota: 2,
        },
        {
          account_quota: 5,
          edition: "advanced",
          id: 52,
          starts_at: new Date("2099-01-01T00:00:00.000Z"),
          used_quota: 5,
        },
      ],
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    const facts = await repository.preflightRows({
      actor,
      organizationPublicId: "organization-public-001",
      rows: [{ rowNumber: 1, phone: "13900000001" }],
    });

    expect(facts.authorization).toEqual({
      status: "available",
      activeScopeCount: 1,
      effectiveEdition: "advanced",
      availableSeatCount: 0,
    });
  });

  it("does not read identity or authorization facts when the target organization is unavailable", async () => {
    const database = createPreflightDatabase({ organizationExists: false });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.preflightRows({
        actor,
        organizationPublicId: "organization-public-missing",
        rows: [{ rowNumber: 1, phone: "13900000001" }],
      }),
    ).resolves.toEqual({
      organizationStatus: "not_found",
      authorization: {
        status: "unavailable",
        activeScopeCount: 0,
        effectiveEdition: null,
        availableSeatCount: null,
      },
      rows: [{ rowNumber: 1, identityState: "absent" }],
    });
    expect(database.selectCounts).toEqual({
      actor: 1,
      adminPhones: 0,
      authUpgrades: 0,
      organization: 1,
      orgAuths: 0,
      users: 0,
    });
  });

  it("keeps preflight query count constant for 500 rows", async () => {
    const database = createPreflightDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await repository.preflightRows({
      actor,
      organizationPublicId: "organization-public-001",
      rows: Array.from({ length: 500 }, (_, index) => ({
        rowNumber: index + 1,
        phone: `138${String(index).padStart(8, "0")}`,
      })),
    });

    expect(
      Object.values(database.selectCounts).reduce(
        (sum, count) => sum + count,
        0,
      ),
    ).toBe(6);
    expect(database.writeCount).toBe(0);
  });

  it("recovers a claimed command by idempotency scope without mutation", async () => {
    const database = createCommandBehaviorDatabase({ seedCommand: true });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.findClaimedCommand({
        actor,
        idempotencyScopeHash: "v1:idempotency-scope-hash",
      }),
    ).resolves.toMatchObject({
      requestHash: "v1:request-hash",
      command: { publicId: "employee-import-command-public-001" },
    });
    expect(database.commandInsertCount).toBe(0);
    expect(database.rowInsertCount).toBe(0);
    expect(database.startedAuditCount).toBe(0);
  });

  it("implements the complete Task 3 repository port", () => {
    const repository: EmployeeImportCommandRepository =
      createPostgresEmployeeImportCommandRepository({
        createDatabase: () => ({}) as EmployeeImportCommandDatabase,
      });

    expect(Object.keys(repository).sort()).toEqual(
      [
        "claimCommand",
        "confirmDistribution",
        "findClaimedCommand",
        "findCommand",
        "issueCredentials",
        "listIssueTargets",
        "preflightRows",
        "processRow",
      ].sort(),
    );
  });

  it("uses an outer transaction and a mandatory nested savepoint for row mutation", () => {
    const source = readSource(
      "src/server/repositories/postgres-employee-import-command-repository.ts",
    );

    expect(source).toContain("database.transaction(async (transaction)");
    expect(source).toContain("transaction.transaction(async (savepoint)");
    expect(source).toContain("mapDeterministicEmployeeMutationError");
    expect(source).toContain("if (reason === null)");
    expect(source).toContain("throw error");
  });

  it("takes update locks on the command before its row", async () => {
    const database = createFailureInjectionDatabase({
      pendingRowCountAfterOutcome: 1,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await repository.processRow({
      ...createRowInput(),
      preparedCredential: null,
      prevalidatedRejectionReason: "invalid_row",
    });

    expect(database.lockLog.slice(0, 2)).toEqual([
      "employee_import_command:update:of=employee_import_command",
      "employee_import_row:update:of=employee_import_row",
    ]);
  });

  it("locks organization, phone and user identity before mapping a concurrent disable", async () => {
    const database = createFailureInjectionDatabase({
      existingUserBecomesDisabledOnIdentityLock: true,
      pendingRowCountAfterOutcome: 1,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await repository.processRow({
      ...createRowInput(),
      preparedCredential: {
        credentialMode: "provided",
        passwordHash: "provided-password-hash",
      },
    });

    expect(database.operationLog).toEqual(
      expect.arrayContaining([
        "lock:organization",
        "lock:phone",
        "discover:user_identity",
        "lock:user_or_employee",
        "read:user_state",
      ]),
    );
    expect(database.operationLog.indexOf("lock:organization")).toBeLessThan(
      database.operationLog.indexOf("lock:phone"),
    );
    expect(database.operationLog.indexOf("lock:phone")).toBeLessThan(
      database.operationLog.indexOf("lock:user_or_employee"),
    );
    expect(database.operationLog.indexOf("lock:user_or_employee")).toBeLessThan(
      database.operationLog.indexOf("read:user_state"),
    );
    expect(database.persistedValues.join(" ")).toContain("disabled_account");
    expect(database.persistedValues.join(" ")).not.toContain(
      "cross_organization_conflict",
    );
  });

  it("authorizes the actor through the current role assignment model", () => {
    const source = readSource(
      "src/server/repositories/postgres-employee-import-command-repository.ts",
    );

    expect(source).toContain("adminRoleAssignment");
    expect(source).toContain("eq(adminRoleAssignment.admin_role, actor.role)");
  });

  it.each([
    "auth_user",
    "auth_account",
    "user",
    "employee",
    "quota",
    "outcome",
    "audit",
  ])(
    "rolls back every staged mutation after an unknown %s failure",
    async (failurePoint) => {
      const database = createFailureInjectionDatabase({
        failurePoint,
      });
      const repository = createPostgresEmployeeImportCommandRepository({
        createDatabase: () => database,
      });

      await expect(repository.processRow(createRowInput())).rejects.toThrow(
        `unknown failure after ${failurePoint}`,
      );
      expect(database.committedMutationLog).toEqual([]);
    },
  );

  it("commits only a rejected outcome and redacted audit after a deterministic quota failure", async () => {
    const database = createFailureInjectionDatabase({
      deterministicQuotaFailure: true,
      pendingRowCountAfterOutcome: 1,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.processRow(createRowInput()),
    ).resolves.toBeUndefined();
    expect(database.committedMutationLog).toEqual(["outcome", "audit"]);
    expect(database.persistedValues.join(" ")).toContain("quota_insufficient");
    expect(database.persistedValues.join(" ")).not.toMatch(
      /13900000001|Employee One|placeholder-password-hash/u,
    );
  });

  it("does not duplicate open completion after command-lock handoff and replay", async () => {
    const database = createFailureInjectionDatabase({
      generatedSucceededCountAfterOutcome: 1,
      pendingRowCountAfterOutcome: 0,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await repository.processRow(createRowInput());
    await repository.processRow(createRowInput());

    expect(database.commandState).toEqual({
      credentialDistributionStatus: "open",
      status: "completed",
    });
    expect(database.rowOutcomeWriteCount).toBe(1);
    expect(database.commandCompletionWriteCount).toBe(1);
    expect(database.rowAuditCount).toBe(1);
    expect(database.completedAuditCount).toBe(1);
    expect(
      database.lockLog.filter((entry) =>
        entry.startsWith("employee_import_command:update"),
      ),
    ).toHaveLength(2);
  });

  it("completes the last non-generated row with not-required distribution", async () => {
    const database = createFailureInjectionDatabase({
      generatedSucceededCountAfterOutcome: 0,
      pendingRowCountAfterOutcome: 0,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await repository.processRow({
      ...createRowInput(),
      preparedCredential: null,
      prevalidatedRejectionReason: "invalid_row",
    });

    expect(database.commandState).toEqual({
      credentialDistributionStatus: "not_required",
      status: "completed",
    });
    expect(database.commandCompletionWriteCount).toBe(1);
    expect(database.completedAuditCount).toBe(1);
  });

  it("rolls back identity, quota, outcome and completion when the completion audit fails", async () => {
    const database = createFailureInjectionDatabase({
      failurePoint: "completion_audit",
      generatedSucceededCountAfterOutcome: 1,
      pendingRowCountAfterOutcome: 0,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(repository.processRow(createRowInput())).rejects.toThrow(
      "unknown failure after completion_audit",
    );
    expect(database.attemptedMutationLog).toEqual([
      "auth_user",
      "auth_account",
      "user",
      "employee",
      "quota",
      "outcome",
      "audit",
      "completion",
      "completion_audit",
    ]);
    expect(database.committedMutationLog).toEqual([]);
    expect(database.commandState).toEqual({
      credentialDistributionStatus: "pending",
      status: "processing",
    });
    expect(database.rowStatus).toBe("pending");
    expect(database.rowOutcomeWriteCount).toBe(0);
    expect(database.commandCompletionWriteCount).toBe(0);
    expect(database.rowAuditCount).toBe(0);
    expect(database.completedAuditCount).toBe(0);
  });

  it("lists only generated issue targets without credential material", async () => {
    const database = createCredentialDistributionDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository.listIssueTargets({
        actor,
        commandPublicId: "employee-import-command-public-001",
      }),
    ).resolves.toEqual({
      commandPublicId: "employee-import-command-public-001",
      credentialRevision: 0,
      targets: [
        {
          employeePublicId: "employee-public-001",
          rowNumber: 1,
          rowPublicId: "employee-import-row-public-001",
        },
        {
          employeePublicId: "employee-public-002",
          rowNumber: 2,
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    });
    expect(JSON.stringify(database.persistedSnapshot)).not.toContain(
      "issued-password-hash",
    );
  });

  it("atomically rotates every credential after deterministic advisory locks", async () => {
    const database = createCredentialDistributionDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    const firstIssue = await repository.issueCredentials({
      actor,
      commandPublicId: "employee-import-command-public-001",
      expectedCredentialRevision: 0,
      credentials: [
        {
          passwordHash: "issued-password-hash-1",
          rowPublicId: "employee-import-row-public-001",
        },
        {
          passwordHash: "issued-password-hash-2",
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    });

    expect(firstIssue).toMatchObject({
      credentialRevision: 1,
      rows: [
        {
          employeePublicId: "employee-public-001",
          phone: "13900000001",
          rowPublicId: "employee-import-row-public-001",
        },
        {
          employeePublicId: "employee-public-002",
          phone: "13900000002",
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    });
    expect(database.advisoryLockAuthUserIds).toEqual([
      "auth-user-001",
      "auth-user-002",
    ]);
    expect(database.credentialLockEvents).toEqual([
      "target_rows",
      "advisory:auth-user-001",
      "advisory:auth-user-002",
      "target_identities",
    ]);
    expect(database.persistedSnapshot).toMatchObject({
      auditActions: ["employee.credentials_issued"],
      command: {
        credentialRevision: 1,
        credentialDistributionStatus: "open",
      },
      passwordHashes: ["issued-password-hash-2", "issued-password-hash-1"],
      sessionAuthUserIds: [],
    });
    expect(database.credentialMutationCounts).toEqual({
      account: 1,
      command: 1,
      row: 1,
    });
    expect(JSON.stringify(database.persistedSnapshot.auditValues)).not.toMatch(
      /1390000000|Employee One|Employee Two|issued-password-hash/u,
    );

    await expect(
      repository.issueCredentials({
        actor,
        commandPublicId: "employee-import-command-public-001",
        expectedCredentialRevision: 1,
        credentials: [
          {
            passwordHash: "second-password-hash-1",
            rowPublicId: "employee-import-row-public-001",
          },
          {
            passwordHash: "second-password-hash-2",
            rowPublicId: "employee-import-row-public-002",
          },
        ],
      }),
    ).resolves.toMatchObject({ credentialRevision: 2 });
    expect(database.persistedSnapshot.passwordHashes).toEqual([
      "second-password-hash-2",
      "second-password-hash-1",
    ]);
    expect(database.persistedSnapshot.passwordHashes.join(" ")).not.toContain(
      "issued-password-hash",
    );
  });

  it("serializes concurrent requests with the same expected credential revision", async () => {
    const database = createCredentialDistributionDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const input = {
      actor,
      commandPublicId: "employee-import-command-public-001",
      expectedCredentialRevision: 0,
      credentials: [
        {
          passwordHash: "issued-password-hash-1",
          rowPublicId: "employee-import-row-public-001",
        },
        {
          passwordHash: "issued-password-hash-2",
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    };

    const results = await Promise.allSettled([
      repository.issueCredentials(input),
      repository.issueCredentials(input),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toEqual([
      expect.objectContaining({
        status: "fulfilled",
        value: expect.objectContaining({ credentialRevision: 1 }),
      }),
    ]);
    expect(results.filter((result) => result.status === "rejected")).toEqual([
      expect.objectContaining({
        reason: expect.objectContaining({
          reason: "credential_revision_stale",
        }),
        status: "rejected",
      }),
    ]);
    expect(database.persistedSnapshot.command.credentialRevision).toBe(1);
    expect(database.persistedSnapshot.auditActions).toEqual([
      "employee.credentials_issued",
    ]);
    expect(database.commandUpdateLockCount).toBe(2);
  });

  it("recovers an acknowledged issue through GET without returning credential material", async () => {
    const database = createCredentialDistributionDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });

    await expect(
      repository
        .issueCredentials({
          actor,
          commandPublicId: "employee-import-command-public-001",
          expectedCredentialRevision: 0,
          credentials: [
            {
              passwordHash: "issued-password-hash-1",
              rowPublicId: "employee-import-row-public-001",
            },
            {
              passwordHash: "issued-password-hash-2",
              rowPublicId: "employee-import-row-public-002",
            },
          ],
        })
        .then(() => {
          throw new Error("credential issue acknowledgement was lost");
        }),
    ).rejects.toThrow("credential issue acknowledgement was lost");

    const recovered = await repository.findCommand({
      actor,
      commandPublicId: "employee-import-command-public-001",
    });

    expect(recovered).toMatchObject({
      credentialRevision: 1,
      currentIssuePublicId: expect.stringMatching(/^employee-import-issue-/u),
    });
    expect(JSON.stringify(recovered)).not.toMatch(
      /issued-password|placeholder-password|1390000000|Employee One|Employee Two/u,
    );
  });

  it.each([
    [
      "active session",
      { activeSessionAuthUserId: "auth-user-001" },
      "active_session",
    ],
    ["disabled employee", { disabledEmployeeId: 71 }, "account_state_changed"],
    ["unbound employee", { unboundEmployeeId: 71 }, "account_state_changed"],
    [
      "transferred employee",
      { transferredEmployeeId: 71 },
      "account_state_changed",
    ],
    [
      "credential reset",
      { changedCredentialAuthUserId: "auth-user-001" },
      "credential_baseline_changed",
    ],
  ] as const)(
    "fails the whole batch on %s",
    async (_, databaseOptions, reason) => {
      const database = createCredentialDistributionDatabase(databaseOptions);
      const repository = createPostgresEmployeeImportCommandRepository({
        createDatabase: () => database,
      });
      const before = database.persistedSnapshot;

      await expect(
        repository.issueCredentials({
          actor,
          commandPublicId: "employee-import-command-public-001",
          expectedCredentialRevision: 0,
          credentials: [
            {
              passwordHash: "issued-password-hash-1",
              rowPublicId: "employee-import-row-public-001",
            },
            {
              passwordHash: "issued-password-hash-2",
              rowPublicId: "employee-import-row-public-002",
            },
          ],
        }),
      ).rejects.toMatchObject({ reason });
      expect(database.persistedSnapshot).toEqual(before);
    },
  );

  it("rejects a prepared target mismatch before credential writes", async () => {
    const database = createCredentialDistributionDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const before = database.persistedSnapshot;

    await expect(
      repository.issueCredentials({
        actor,
        commandPublicId: "employee-import-command-public-001",
        expectedCredentialRevision: 0,
        credentials: [
          {
            passwordHash: "issued-password-hash-1",
            rowPublicId: "employee-import-row-public-001",
          },
        ],
      }),
    ).rejects.toMatchObject({ reason: "account_state_changed" });
    expect(database.persistedSnapshot).toEqual(before);
  });

  it("rolls back all credential, session, baseline and revision writes when audit fails", async () => {
    const database = createCredentialDistributionDatabase({
      failIssueAudit: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const before = database.persistedSnapshot;

    await expect(
      repository.issueCredentials({
        actor,
        commandPublicId: "employee-import-command-public-001",
        expectedCredentialRevision: 0,
        credentials: [
          {
            passwordHash: "issued-password-hash-1",
            rowPublicId: "employee-import-row-public-001",
          },
          {
            passwordHash: "issued-password-hash-2",
            rowPublicId: "employee-import-row-public-002",
          },
        ],
      }),
    ).rejects.toThrow("issue audit failure");
    expect(database.persistedSnapshot).toEqual(before);
  });

  it.each([
    [
      "a missing credential account update",
      { omitAccountUpdateAuthUserId: "auth-user-001" },
      "credential account update set mismatch.",
    ],
    [
      "an unexpected credential account update",
      { extraAccountUpdateAuthUserId: "auth-user-unexpected" },
      "credential account update set mismatch.",
    ],
    [
      "a missing row baseline update",
      { omitRowBaselineUpdateId: 41 },
      "credential baseline update set mismatch.",
    ],
    [
      "a missing command revision update",
      { failIssueCommandUpdate: true },
      "credential command update set mismatch.",
    ],
  ] as const)(
    "rolls back the whole issue batch after %s",
    async (_, databaseOptions, expectedMessage) => {
      const database = createCredentialDistributionDatabase(databaseOptions);
      const repository = createPostgresEmployeeImportCommandRepository({
        createDatabase: () => database,
      });
      const before = database.persistedSnapshot;

      await expect(
        repository.issueCredentials({
          actor,
          commandPublicId: "employee-import-command-public-001",
          expectedCredentialRevision: 0,
          credentials: [
            {
              passwordHash: "issued-password-hash-1",
              rowPublicId: "employee-import-row-public-001",
            },
            {
              passwordHash: "issued-password-hash-2",
              rowPublicId: "employee-import-row-public-002",
            },
          ],
        }),
      ).rejects.toThrow(expectedMessage);
      expect(database.persistedSnapshot).toEqual(before);
    },
  );

  it("rolls back distribution confirmation when its audit insert fails", async () => {
    const database = createCredentialDistributionDatabase({
      failConfirmAudit: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const issue = await repository.issueCredentials({
      actor,
      commandPublicId: "employee-import-command-public-001",
      expectedCredentialRevision: 0,
      credentials: [
        {
          passwordHash: "issued-password-hash-1",
          rowPublicId: "employee-import-row-public-001",
        },
        {
          passwordHash: "issued-password-hash-2",
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    });
    const before = database.persistedSnapshot;

    await expect(
      repository.confirmDistribution({
        actor,
        commandPublicId: "employee-import-command-public-001",
        expectedCredentialRevision: issue.credentialRevision,
        issuePublicId: issue.issuePublicId,
      }),
    ).rejects.toThrow("confirm audit failure");
    expect(database.persistedSnapshot).toEqual(before);
  });

  it("rolls back distribution confirmation when the command update misses", async () => {
    const database = createCredentialDistributionDatabase({
      failConfirmCommandUpdate: true,
    });
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const issue = await repository.issueCredentials({
      actor,
      commandPublicId: "employee-import-command-public-001",
      expectedCredentialRevision: 0,
      credentials: [
        {
          passwordHash: "issued-password-hash-1",
          rowPublicId: "employee-import-row-public-001",
        },
        {
          passwordHash: "issued-password-hash-2",
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    });
    const before = database.persistedSnapshot;

    await expect(
      repository.confirmDistribution({
        actor,
        commandPublicId: "employee-import-command-public-001",
        expectedCredentialRevision: issue.credentialRevision,
        issuePublicId: issue.issuePublicId,
      }),
    ).rejects.toThrow("credential distribution command update set mismatch.");
    expect(database.persistedSnapshot).toEqual(before);
  });

  it("allows same-manifest confirm replay and permanently closes later issue", async () => {
    const database = createCredentialDistributionDatabase();
    const repository = createPostgresEmployeeImportCommandRepository({
      createDatabase: () => database,
    });
    const issue = await repository.issueCredentials({
      actor,
      commandPublicId: "employee-import-command-public-001",
      expectedCredentialRevision: 0,
      credentials: [
        {
          passwordHash: "issued-password-hash-1",
          rowPublicId: "employee-import-row-public-001",
        },
        {
          passwordHash: "issued-password-hash-2",
          rowPublicId: "employee-import-row-public-002",
        },
      ],
    });

    const confirmationInput = {
      actor,
      commandPublicId: "employee-import-command-public-001",
      expectedCredentialRevision: issue.credentialRevision,
      issuePublicId: issue.issuePublicId,
    };
    const confirmation =
      await repository.confirmDistribution(confirmationInput);
    const replay = await repository.confirmDistribution(confirmationInput);

    expect(replay).toEqual(confirmation);
    expect(database.persistedSnapshot.auditActions).toEqual([
      "employee.credentials_issued",
      "employee.credential_distribution_confirmed",
    ]);
    await expect(
      repository.issueCredentials({
        actor,
        commandPublicId: "employee-import-command-public-001",
        expectedCredentialRevision: 1,
        credentials: [
          {
            passwordHash: "third-password-hash-1",
            rowPublicId: "employee-import-row-public-001",
          },
          {
            passwordHash: "third-password-hash-2",
            rowPublicId: "employee-import-row-public-002",
          },
        ],
      }),
    ).rejects.toMatchObject({ reason: "credential_distribution_closed" });
    await expect(
      repository.confirmDistribution({
        ...confirmationInput,
        issuePublicId: "employee-import-issue-old",
      }),
    ).rejects.toMatchObject({ reason: "credential_manifest_stale" });
  });
});

type CommandBehaviorDatabase = EmployeeImportCommandDatabase & {
  commandInsertCount: number;
  lockLog: string[];
  mutationTransactionIds: number[];
  rowInsertCount: number;
  startedAuditCount: number;
  transactionCount: number;
};

function createCommandBehaviorDatabase(
  options: {
    actorAdminId?: number;
    actorIsValid?: boolean;
    actorPublicId?: string;
    actorRole?: "ops_admin" | "super_admin";
    commandOwnerAdminId?: number;
    seedCommand?: boolean;
  } = {},
): CommandBehaviorDatabase {
  const actorAdminId = options.actorAdminId ?? 11;
  const actorPublicId = options.actorPublicId ?? actor.publicId;
  const actorRole = options.actorRole ?? "ops_admin";
  const commandOwnerAdminId = options.commandOwnerAdminId ?? actorAdminId;
  const fixedNow = new Date("2026-07-17T00:00:00.000Z");
  let commandInsertCount = 0;
  let rowInsertCount = 0;
  let startedAuditCount = 0;
  let transactionCount = 0;
  let lockLog: string[] = [];
  let mutationTransactionIds: number[] = [];
  let activeTransactionId: number | null = null;
  let commandRow: Record<string, unknown> | null =
    options.seedCommand === true
      ? {
          actor_admin_id: commandOwnerAdminId,
          command_kind: "batch_import",
          completed_at: null,
          created_at: fixedNow,
          credential_distribution_status: "pending",
          credential_revision: 0,
          current_issue_public_id: null,
          distribution_confirmed_at: null,
          employee_import_status: "processing",
          id: 21,
          idempotency_scope_hash: "v1:idempotency-scope-hash",
          organization_id: 31,
          public_id: "employee-import-command-public-001",
          request_hash: "v1:request-hash",
          row_count: 1,
          updated_at: fixedNow,
        }
      : null;
  let commandRows: Record<string, unknown>[] =
    options.seedCommand === true
      ? [
          {
            credential_mode: null,
            employee_id: null,
            employee_import_command_id: 21,
            employee_import_row_status: "pending",
            id: 41,
            outcome_kind: null,
            public_id: "employee-import-row-public-001",
            rejection_reason: null,
            row_number: 1,
            row_request_hash: "v1:row-hash-001",
            warning_reason: null,
          },
        ]
      : [];

  const resolveSelectedRows = (
    selectedTable: unknown,
    fields: Record<string, unknown>,
  ): unknown[] => {
    if (selectedTable === admin) {
      return options.actorIsValid === false
        ? []
        : [
            {
              admin_role: actorRole,
              id: actorAdminId,
              public_id: actorPublicId,
            },
          ];
    }
    if (selectedTable === organization) {
      return [
        {
          id: 31,
          name: "Organization One",
          public_id: "organization-public-001",
        },
      ];
    }
    if (selectedTable === employeeImportCommand && commandRow !== null) {
      if ("command_kind" in fields) {
        return [
          {
            ...commandRow,
            actor_admin_public_id: "admin-public-owner",
            organization_public_id: "organization-public-001",
          },
        ];
      }
      if ("employee_import_status" in fields) {
        return [
          {
            ...commandRow,
            organization_public_id: "organization-public-001",
          },
        ];
      }
      return [commandRow];
    }
    if (selectedTable === employeeImportRow) {
      return commandRows;
    }
    if (selectedTable === employee) {
      return [];
    }
    return [];
  };

  const createSelectBuilder = (
    fields: Record<string, unknown>,
  ): Record<string, unknown> => {
    let selectedTable: unknown;
    const builder: Record<string, unknown> = {
      for: (strength: string, options?: { of?: unknown }) => {
        const tableName =
          selectedTable === employeeImportCommand
            ? "employee_import_command"
            : selectedTable === employeeImportRow
              ? "employee_import_row"
              : "unknown";
        const ofTableName =
          options?.of === employeeImportCommand
            ? "employee_import_command"
            : options?.of === employeeImportRow
              ? "employee_import_row"
              : "none";
        lockLog = [...lockLog, `${tableName}:${strength}:of=${ofTableName}`];
        return builder;
      },
      from: (table: unknown) => {
        selectedTable = table;
        return builder;
      },
      innerJoin: () => builder,
      leftJoin: () => builder,
      limit: () => builder,
      orderBy: () => builder,
      then: (
        resolve: (rows: unknown[]) => unknown,
        reject: (error: unknown) => unknown,
      ) =>
        Promise.resolve(resolveSelectedRows(selectedTable, fields)).then(
          resolve,
          reject,
        ),
      where: () => builder,
    };
    return builder;
  };

  const createInsertBuilder = (table: unknown): Record<string, unknown> => {
    let values: unknown;
    let executed = false;
    let result: unknown[] = [];
    const execute = (): unknown[] => {
      if (executed) return result;
      executed = true;

      if (
        table === employeeImportCommand ||
        table === employeeImportRow ||
        table === auditLog
      ) {
        if (activeTransactionId === null) {
          throw new Error("Claim mutation escaped its transaction.");
        }
        mutationTransactionIds = [
          ...mutationTransactionIds,
          activeTransactionId,
        ];
      }

      if (table === employeeImportCommand) {
        const commandValues = values as Record<string, unknown>;
        if (
          commandRow !== null &&
          commandRow.idempotency_scope_hash ===
            commandValues.idempotency_scope_hash
        ) {
          result = [];
          return result;
        }
        commandInsertCount += 1;
        commandRow = {
          ...commandValues,
          completed_at: null,
          credential_distribution_status: "pending",
          credential_revision: 0,
          current_issue_public_id: null,
          distribution_confirmed_at: null,
          employee_import_status: "processing",
          id: 21,
        };
        result = [{ id: commandRow.id, public_id: commandRow.public_id }];
        return result;
      }
      if (table === employeeImportRow) {
        const rowValues = values as Record<string, unknown>[];
        commandRows = rowValues.map((rowValue, index) => ({
          ...rowValue,
          credential_mode: null,
          employee_id: null,
          employee_import_row_status: "pending",
          id: 41 + index,
          outcome_kind: null,
          rejection_reason: null,
          warning_reason: null,
        }));
        rowInsertCount += rowValues.length;
      }
      if (table === auditLog) {
        const auditValues = values as Record<string, unknown>;
        if (auditValues.action_type === "employee.import_command.started") {
          startedAuditCount += 1;
        }
      }
      return result;
    };
    const builder: Record<string, unknown> = {
      onConflictDoNothing: () => builder,
      returning: () => Promise.resolve(execute()),
      then: (
        resolve: (rows: unknown[]) => unknown,
        reject: (error: unknown) => unknown,
      ) => Promise.resolve().then(execute).then(resolve, reject),
      values: (nextValues: unknown) => {
        values = nextValues;
        return builder;
      },
    };
    return builder;
  };

  const databaseShape = {
    get commandInsertCount() {
      return commandInsertCount;
    },
    insert: (table: unknown) => createInsertBuilder(table),
    get lockLog() {
      return lockLog;
    },
    get mutationTransactionIds() {
      return mutationTransactionIds;
    },
    get rowInsertCount() {
      return rowInsertCount;
    },
    select: (fields: Record<string, unknown>) => createSelectBuilder(fields),
    get startedAuditCount() {
      return startedAuditCount;
    },
    transaction: <TResult>(
      callback: (
        transaction: EmployeeImportCommandDatabase,
      ) => Promise<TResult>,
    ): Promise<TResult> => {
      transactionCount += 1;
      const transactionId = transactionCount;
      activeTransactionId = transactionId;
      return callback(database).finally(() => {
        activeTransactionId = null;
      });
    },
    get transactionCount() {
      return transactionCount;
    },
  };
  const database = databaseShape as unknown as CommandBehaviorDatabase;

  return database;
}

type PreflightDatabase = EmployeeImportCommandDatabase & {
  selectCounts: {
    actor: number;
    adminPhones: number;
    authUpgrades: number;
    organization: number;
    orgAuths: number;
    users: number;
  };
  writeCount: number;
};

function createPreflightDatabase(
  options: {
    actorIsValid?: boolean;
    organizationExists?: boolean;
    orgAuthRows?: {
      account_quota: number;
      edition: "standard" | "advanced";
      id: number;
      starts_at: Date;
      used_quota: number;
    }[];
  } = {},
): PreflightDatabase {
  const selectCounts = {
    actor: 0,
    adminPhones: 0,
    authUpgrades: 0,
    organization: 0,
    orgAuths: 0,
    users: 0,
  };
  let writeCount = 0;

  const createSelectBuilder = (
    fields: Record<string, unknown>,
  ): Record<string, unknown> => {
    let selectedTable: unknown;
    const resolveRows = (): unknown[] => {
      if (selectedTable === admin && "admin_role" in fields) {
        selectCounts.actor += 1;
        return options.actorIsValid === false
          ? []
          : [
              {
                admin_role: actor.role,
                id: 11,
                public_id: actor.publicId,
              },
            ];
      }
      if (selectedTable === admin) {
        selectCounts.adminPhones += 1;
        return [{ phone: "13900000006" }];
      }
      if (selectedTable === organization) {
        selectCounts.organization += 1;
        return options.organizationExists === false
          ? []
          : [{ id: 31, public_id: "organization-public-001" }];
      }
      if (selectedTable === orgAuth) {
        selectCounts.orgAuths += 1;
        return (
          options.orgAuthRows ?? [
            {
              account_quota: 10,
              edition: "standard",
              id: 51,
              starts_at: new Date("2026-01-01T00:00:00.000Z"),
              used_quota: 2,
            },
            {
              account_quota: 5,
              edition: "standard",
              id: 52,
              starts_at: new Date("2026-01-01T00:00:00.000Z"),
              used_quota: 1,
            },
          ]
        );
      }
      if (selectedTable === authUpgrade) {
        selectCounts.authUpgrades += 1;
        return [
          {
            expires_at: new Date("2099-01-01T00:00:00.000Z"),
            org_auth_id: 51,
            revoked_at: null,
            starts_at: new Date("2026-01-01T00:00:00.000Z"),
            status: "active",
            target_edition: "advanced",
          },
        ];
      }
      if (selectedTable === user) {
        selectCounts.users += 1;
        return [
          {
            employee_organization_id: null,
            phone: "13900000002",
            status: "active",
            user_type: "personal",
          },
          {
            employee_organization_id: 31,
            phone: "13900000003",
            status: "active",
            user_type: "employee",
          },
          {
            employee_organization_id: 32,
            phone: "13900000004",
            status: "active",
            user_type: "employee",
          },
          {
            employee_organization_id: null,
            phone: "13900000005",
            status: "disabled",
            user_type: "personal",
          },
        ];
      }
      return [];
    };
    const builder: Record<string, unknown> = {
      from: (table: unknown) => {
        selectedTable = table;
        return builder;
      },
      innerJoin: () => builder,
      leftJoin: () => builder,
      limit: () => builder,
      orderBy: () => builder,
      then: (
        resolve: (rows: unknown[]) => unknown,
        reject: (error: unknown) => unknown,
      ) => Promise.resolve(resolveRows()).then(resolve, reject),
      where: () => builder,
    };
    return builder;
  };

  const rejectWrite = () => {
    writeCount += 1;
    throw new Error("Preflight attempted a write.");
  };
  const databaseShape = {
    delete: rejectWrite,
    insert: rejectWrite,
    select: (fields: Record<string, unknown>) => createSelectBuilder(fields),
    transaction: <TResult>(
      callback: (
        transaction: EmployeeImportCommandDatabase,
      ) => Promise<TResult>,
    ) => callback(database),
    update: rejectWrite,
    get selectCounts() {
      return { ...selectCounts };
    },
    get writeCount() {
      return writeCount;
    },
  };
  const database = databaseShape as unknown as PreflightDatabase;

  return database;
}

type FailureInjectionDatabase = EmployeeImportCommandDatabase & {
  attemptedMutationLog: string[];
  commandCompletionWriteCount: number;
  commandState: {
    credentialDistributionStatus: "pending" | "open" | "not_required";
    status: "processing" | "completed";
  };
  committedMutationLog: string[];
  completedAuditCount: number;
  lockLog: string[];
  operationLog: string[];
  persistedValues: string[];
  rowAuditCount: number;
  rowOutcomeWriteCount: number;
  rowStatus: "pending" | "succeeded" | "rejected";
};

function createFailureInjectionDatabase(_input: {
  deterministicQuotaFailure?: boolean;
  existingUserBecomesDisabledOnIdentityLock?: boolean;
  failurePoint?: string;
  generatedSucceededCountAfterOutcome?: number;
  pendingRowCountAfterOutcome?: number;
}): FailureInjectionDatabase {
  const input = _input;
  let committedMutationLog: string[] = [];
  let attemptedMutationLog: string[] = [];
  let persistedValues: string[] = [];
  let workingMutationLog: string[] = [];
  let workingPersistedValues: string[] = [];
  let lockLog: string[] = [];
  let operationLog: string[] = [];
  let existingUserStatus: "active" | "disabled" = "active";
  let transactionDepth = 0;
  let rowCountQueryCount = 0;
  let rowStatus: "pending" | "succeeded" | "rejected" = "pending";
  let commandStatus: "processing" | "completed" = "processing";
  let credentialDistributionStatus: "pending" | "open" | "not_required" =
    "pending";
  let rowOutcomeWriteCount = 0;
  let commandCompletionWriteCount = 0;
  let rowAuditCount = 0;
  let completedAuditCount = 0;

  const executeMutation = (
    stage: string | null,
    values: unknown,
    result: unknown[],
  ): unknown[] => {
    if (stage !== null) {
      attemptedMutationLog = [...attemptedMutationLog, stage];
      workingMutationLog = [...workingMutationLog, stage];
      workingPersistedValues = [
        ...workingPersistedValues,
        JSON.stringify(values),
      ];
      if (input.failurePoint === stage) {
        throw new Error(`unknown failure after ${stage}`);
      }
    }
    return result;
  };

  const createSelectBuilder = (
    fields: Record<string, unknown>,
  ): Record<string, unknown> => {
    let selectedTable: unknown;
    const resolveRows = (): unknown[] => {
      if (selectedTable === admin) {
        return "admin_role" in fields
          ? [{ admin_role: "ops_admin", id: 11, public_id: actor.publicId }]
          : [];
      }
      if (selectedTable === employeeImportCommand) {
        return [
          {
            actor_admin_id: 11,
            employee_import_status: commandStatus,
            id: 21,
            organization_id: 31,
            organization_public_id: "organization-public-001",
            public_id: "employee-import-command-public-001",
            request_hash: "v1:request-hash",
          },
        ];
      }
      if (selectedTable === employeeImportRow) {
        if ("value" in fields) {
          rowCountQueryCount += 1;
          return [
            {
              value:
                rowCountQueryCount === 1
                  ? (input.pendingRowCountAfterOutcome ?? 1)
                  : (input.generatedSucceededCountAfterOutcome ?? 0),
            },
          ];
        }
        return [
          {
            employee_import_row_status: rowStatus,
            id: 41,
            public_id: "employee-import-row-public-001",
            row_number: 1,
            row_request_hash: "v1:row-hash",
          },
        ];
      }
      if (selectedTable === organization) {
        return [
          {
            id: 31,
            name: "Organization One",
            public_id: "organization-public-001",
          },
        ];
      }
      if (selectedTable === user) {
        if (input.existingUserBecomesDisabledOnIdentityLock !== true) {
          return [];
        }
        if ("id" in fields && !("public_id" in fields)) {
          return [{ id: 61 }];
        }
        if (!("status" in fields)) {
          operationLog = [...operationLog, "discover:user_identity"];
          return [
            {
              employee_public_id: null,
              public_id: "user-public-existing-001",
            },
          ];
        }
        operationLog = [...operationLog, "read:user_state"];
        return [
          {
            auth_user_id: "auth-user-existing-001",
            employee_id: null,
            employee_public_id: null,
            id: 61,
            locked_until_at: null,
            name: "Existing Learner",
            phone: "13900000001",
            public_id: "user-public-existing-001",
            status: existingUserStatus,
            user_type: "personal",
          },
        ];
      }
      if (selectedTable === authAccount) {
        return [{ updated_at: new Date("2026-07-17T00:00:00.000Z") }];
      }
      if (selectedTable === orgAuth) {
        return [
          {
            account_quota: input.deterministicQuotaFailure === true ? 1 : 10,
            id: 51,
            purchaser_organization_id: 31,
            starts_at: new Date("2026-07-01T00:00:00.000Z"),
          },
        ];
      }
      if (selectedTable === employeeOrgAuth) {
        return "value" in fields
          ? [{ value: input.deterministicQuotaFailure === true ? 1 : 0 }]
          : [];
      }
      return [];
    };
    const builder: Record<string, unknown> = {
      for: (strength: string, options?: { of?: unknown }) => {
        const tableName =
          selectedTable === employeeImportCommand
            ? "employee_import_command"
            : selectedTable === employeeImportRow
              ? "employee_import_row"
              : "unknown";
        const ofTableName =
          options?.of === employeeImportCommand
            ? "employee_import_command"
            : options?.of === employeeImportRow
              ? "employee_import_row"
              : "none";
        lockLog = [...lockLog, `${tableName}:${strength}:of=${ofTableName}`];
        return builder;
      },
      from: (table: unknown) => {
        selectedTable = table;
        return builder;
      },
      innerJoin: () => builder,
      leftJoin: () => builder,
      limit: () => builder,
      orderBy: () => builder,
      then: (
        resolve: (rows: unknown[]) => unknown,
        reject: (error: unknown) => unknown,
      ) => Promise.resolve(resolveRows()).then(resolve, reject),
      where: () => builder,
    };
    return builder;
  };

  const createInsertBuilder = (table: unknown): Record<string, unknown> => {
    let mutationValues: unknown;
    let executed = false;
    let executionResult: unknown[] = [];
    const resolveStage = (): string | null => {
      if (table === authUser) return "auth_user";
      if (table === authAccount) return "auth_account";
      if (table === user) return "user";
      if (table === employee) return "employee";
      if (table === employeeOrgAuth) return "quota";
      if (table === auditLog) {
        const auditValues = mutationValues as Record<string, unknown>;
        return auditValues.action_type === "employee.import_command.completed"
          ? "completion_audit"
          : "audit";
      }
      return null;
    };
    const resolveResult = (): unknown[] => {
      if (table === user) {
        return [
          {
            auth_user_id: "auth-user-created-001",
            id: 61,
            locked_until_at: null,
            name: "Employee One",
            phone: "13900000001",
            public_id: "user-public-001",
            status: "active",
            user_type: "employee",
          },
        ];
      }
      if (table === employee) {
        const now = new Date("2026-07-17T00:00:00.000Z");
        return [
          {
            created_at: now,
            id: 71,
            public_id: "employee-public-001",
            updated_at: now,
          },
        ];
      }
      return [];
    };
    const execute = (): unknown[] => {
      if (!executed) {
        executed = true;
        executionResult = executeMutation(
          resolveStage(),
          mutationValues,
          resolveResult(),
        );
        if (table === auditLog) {
          const auditValues = mutationValues as Record<string, unknown>;
          if (auditValues.action_type === "employee.import_command.completed") {
            completedAuditCount += 1;
          } else if (
            auditValues.action_type === "employee.import_command.row_processed"
          ) {
            rowAuditCount += 1;
          }
        }
      }
      return executionResult;
    };
    const builder: Record<string, unknown> = {
      onConflictDoNothing: () => builder,
      returning: () => Promise.resolve(execute()),
      then: (
        resolve: (rows: unknown[]) => unknown,
        reject: (error: unknown) => unknown,
      ) => Promise.resolve().then(execute).then(resolve, reject),
      values: (values: unknown) => {
        mutationValues = values;
        return builder;
      },
    };
    return builder;
  };

  const createUpdateBuilder = (table: unknown): Record<string, unknown> => {
    let mutationValues: unknown;
    let executed = false;
    const execute = (): unknown[] => {
      if (executed) return [];
      executed = true;
      const result = executeMutation(
        table === employeeImportRow
          ? "outcome"
          : table === employeeImportCommand
            ? "completion"
            : null,
        mutationValues,
        [],
      );
      if (table === employeeImportRow) {
        const rowValues = mutationValues as Record<string, unknown>;
        rowStatus = rowValues.employee_import_row_status as
          | "succeeded"
          | "rejected";
        rowOutcomeWriteCount += 1;
      } else if (table === employeeImportCommand) {
        const commandValues = mutationValues as Record<string, unknown>;
        commandStatus = commandValues.employee_import_status as "completed";
        credentialDistributionStatus =
          commandValues.credential_distribution_status as
            | "open"
            | "not_required";
        commandCompletionWriteCount += 1;
      }
      return result;
    };
    const builder: Record<string, unknown> = {
      returning: () => Promise.resolve(execute()),
      set: (values: unknown) => {
        mutationValues = values;
        return builder;
      },
      then: (
        resolve: (rows: unknown[]) => unknown,
        reject: (error: unknown) => unknown,
      ) => Promise.resolve().then(execute).then(resolve, reject),
      where: () => builder,
    };
    return builder;
  };

  const readSqlText = (query: unknown): string => {
    if (typeof query === "string" || typeof query === "number") {
      return String(query);
    }
    if (Array.isArray(query)) {
      return query.map(readSqlText).join(" ");
    }
    if (query !== null && typeof query === "object") {
      const queryRecord = query as Record<string, unknown>;
      return [queryRecord.value, queryRecord.queryChunks]
        .map(readSqlText)
        .join(" ");
    }
    return "";
  };

  const databaseShape = {
    get attemptedMutationLog() {
      return attemptedMutationLog;
    },
    get commandCompletionWriteCount() {
      return commandCompletionWriteCount;
    },
    get commandState() {
      return {
        credentialDistributionStatus,
        status: commandStatus,
      };
    },
    get committedMutationLog() {
      return committedMutationLog;
    },
    get completedAuditCount() {
      return completedAuditCount;
    },
    execute: async (query: unknown) => {
      const sqlText = readSqlText(query);
      if (sqlText.includes("200110")) {
        operationLog = [...operationLog, "lock:organization"];
      } else if (sqlText.includes("200113")) {
        operationLog = [...operationLog, "lock:phone"];
      } else if (sqlText.includes("200112")) {
        operationLog = [...operationLog, "lock:user_or_employee"];
        if (input.existingUserBecomesDisabledOnIdentityLock === true) {
          existingUserStatus = "disabled";
        }
      }
      return [];
    },
    insert: (table: unknown) => createInsertBuilder(table),
    get lockLog() {
      return lockLog;
    },
    get operationLog() {
      return operationLog;
    },
    get persistedValues() {
      return persistedValues;
    },
    get rowAuditCount() {
      return rowAuditCount;
    },
    get rowOutcomeWriteCount() {
      return rowOutcomeWriteCount;
    },
    get rowStatus() {
      return rowStatus;
    },
    select: (fields: Record<string, unknown>) => createSelectBuilder(fields),
    transaction: async <TResult>(
      callback: (
        transaction: EmployeeImportCommandDatabase,
      ) => Promise<TResult>,
    ): Promise<TResult> => {
      const mutationSnapshot = workingMutationLog.length;
      const valueSnapshot = workingPersistedValues.length;
      const rowCountQuerySnapshot = rowCountQueryCount;
      const rowStatusSnapshot = rowStatus;
      const commandStatusSnapshot = commandStatus;
      const distributionStatusSnapshot = credentialDistributionStatus;
      const rowOutcomeWriteCountSnapshot = rowOutcomeWriteCount;
      const commandCompletionWriteCountSnapshot = commandCompletionWriteCount;
      const rowAuditCountSnapshot = rowAuditCount;
      const completedAuditCountSnapshot = completedAuditCount;
      const existingUserStatusSnapshot = existingUserStatus;
      transactionDepth += 1;
      try {
        const result = await callback(database);
        transactionDepth -= 1;
        if (transactionDepth === 0) {
          committedMutationLog = [...workingMutationLog];
          persistedValues = [...workingPersistedValues];
        }
        return result;
      } catch (error) {
        workingMutationLog = workingMutationLog.slice(0, mutationSnapshot);
        workingPersistedValues = workingPersistedValues.slice(0, valueSnapshot);
        rowCountQueryCount = rowCountQuerySnapshot;
        rowStatus = rowStatusSnapshot;
        commandStatus = commandStatusSnapshot;
        credentialDistributionStatus = distributionStatusSnapshot;
        rowOutcomeWriteCount = rowOutcomeWriteCountSnapshot;
        commandCompletionWriteCount = commandCompletionWriteCountSnapshot;
        rowAuditCount = rowAuditCountSnapshot;
        completedAuditCount = completedAuditCountSnapshot;
        existingUserStatus = existingUserStatusSnapshot;
        transactionDepth -= 1;
        throw error;
      }
    },
    update: (table: unknown) => createUpdateBuilder(table),
  };
  const database = databaseShape as unknown as FailureInjectionDatabase;

  return database;
}

type CredentialDistributionDatabase = EmployeeImportCommandDatabase & {
  advisoryLockAuthUserIds: string[];
  commandUpdateLockCount: number;
  credentialLockEvents: string[];
  credentialMutationCounts: {
    account: number;
    command: number;
    row: number;
  };
  persistedSnapshot: {
    auditActions: string[];
    auditValues: unknown[];
    command: {
      credentialDistributionStatus: "open" | "confirmed";
      credentialRevision: number;
      currentIssuePublicId: string | null;
    };
    passwordHashes: string[];
    rowCredentialBaselines: string[];
    sessionAuthUserIds: string[];
  };
};

function createCredentialDistributionDatabase(
  options: {
    activeSessionAuthUserId?: string;
    changedCredentialAuthUserId?: string;
    disabledEmployeeId?: number;
    extraAccountUpdateAuthUserId?: string;
    failConfirmAudit?: boolean;
    failConfirmCommandUpdate?: boolean;
    failIssueCommandUpdate?: boolean;
    failIssueAudit?: boolean;
    omitAccountUpdateAuthUserId?: string;
    omitRowBaselineUpdateId?: number;
    transferredEmployeeId?: number;
    unboundEmployeeId?: number;
  } = {},
): CredentialDistributionDatabase {
  const actorAdminId = 11;
  const organizationId = 31;
  const fixedCreatedAt = new Date("2026-07-17T00:00:00.000Z");
  const initialBaseline = new Date("2026-07-17T00:01:00.000Z");
  let command = {
    actor_admin_id: actorAdminId,
    command_kind: "batch_import" as const,
    completed_at: fixedCreatedAt,
    created_at: fixedCreatedAt,
    credential_distribution_status: "open" as "open" | "confirmed",
    credential_revision: 0,
    current_issue_public_id: null as string | null,
    distribution_confirmed_at: null as Date | null,
    employee_import_status: "completed" as const,
    id: 21,
    organization_id: organizationId,
    organization_public_id: "organization-public-001",
    public_id: "employee-import-command-public-001",
    request_hash: "v1:request-hash",
    row_count: 2,
    updated_at: fixedCreatedAt,
  };
  let rows = [
    {
      credential_mode: "generated" as const,
      credential_updated_at: initialBaseline,
      employee_id: 71,
      employee_import_command_id: 21,
      employee_import_row_status: "succeeded" as const,
      id: 41,
      outcome_kind: "created" as const,
      public_id: "employee-import-row-public-001",
      rejection_reason: null,
      row_number: 1,
      row_request_hash: "v1:row-hash-001",
      warning_reason: null,
    },
    {
      credential_mode: "generated" as const,
      credential_updated_at: initialBaseline,
      employee_id: 72,
      employee_import_command_id: 21,
      employee_import_row_status: "succeeded" as const,
      id: 42,
      outcome_kind: "created" as const,
      public_id: "employee-import-row-public-002",
      rejection_reason: null,
      row_number: 2,
      row_request_hash: "v1:row-hash-002",
      warning_reason: null,
    },
  ];
  const employees = [
    {
      id: 71,
      organization_id:
        options.transferredEmployeeId === 71 ? 999 : organizationId,
      public_id: "employee-public-001",
      user_id: options.unboundEmployeeId === 71 ? 999 : 61,
    },
    {
      id: 72,
      organization_id:
        options.transferredEmployeeId === 72 ? 999 : organizationId,
      public_id: "employee-public-002",
      user_id: options.unboundEmployeeId === 72 ? 999 : 62,
    },
  ];
  const users = [
    {
      auth_user_id: "auth-user-002",
      id: 61,
      name: "Employee One",
      phone: "13900000001",
      public_id: "user-public-001",
      status: options.disabledEmployeeId === 71 ? "disabled" : "active",
      user_type: "employee",
    },
    {
      auth_user_id: "auth-user-001",
      id: 62,
      name: "Employee Two",
      phone: "13900000002",
      public_id: "user-public-002",
      status: options.disabledEmployeeId === 72 ? "disabled" : "active",
      user_type: "employee",
    },
  ];
  let accounts = [
    {
      password: "placeholder-password-hash-2",
      updated_at:
        options.changedCredentialAuthUserId === "auth-user-001"
          ? new Date("2026-07-17T00:02:00.000Z")
          : initialBaseline,
      user_id: "auth-user-001",
    },
    {
      password: "placeholder-password-hash-1",
      updated_at:
        options.changedCredentialAuthUserId === "auth-user-002"
          ? new Date("2026-07-17T00:02:00.000Z")
          : initialBaseline,
      user_id: "auth-user-002",
    },
  ];
  let sessions = [
    {
      expires_at: new Date("2026-07-16T00:00:00.000Z"),
      user_id: "auth-user-001",
    },
    {
      expires_at: new Date("2026-07-16T00:00:00.000Z"),
      user_id: "auth-user-002",
    },
  ];
  if (options.activeSessionAuthUserId !== undefined) {
    sessions = [
      ...sessions,
      {
        expires_at: new Date("2026-07-18T00:00:00.000Z"),
        user_id: options.activeSessionAuthUserId,
      },
    ];
  }
  let auditValues: Record<string, unknown>[] = [];
  let advisoryLockAuthUserIds: string[] = [];
  let commandUpdateLockCount = 0;
  let credentialLockEvents: string[] = [];
  let accountMutationCount = 0;
  let commandMutationCount = 0;
  let rowMutationCount = 0;
  let transactionTail: Promise<void> = Promise.resolve();

  const cloneState = () => ({
    accounts: accounts.map((account) => ({ ...account })),
    auditValues: auditValues.map((value) => ({ ...value })),
    command: { ...command },
    rows: rows.map((row) => ({ ...row })),
    sessions: sessions.map((session) => ({ ...session })),
  });
  const restoreState = (snapshot: ReturnType<typeof cloneState>) => {
    accounts = snapshot.accounts;
    auditValues = snapshot.auditValues;
    command = snapshot.command;
    rows = snapshot.rows;
    sessions = snapshot.sessions;
  };
  const resolveTargets = () =>
    rows.flatMap((row) => {
      const employeeRow = employees.find(
        (candidate) => candidate.id === row.employee_id,
      );
      const userRow = users.find(
        (candidate) => candidate.id === employeeRow?.user_id,
      );
      const accountRow = accounts.find(
        (candidate) => candidate.user_id === userRow?.auth_user_id,
      );
      if (employeeRow === undefined || userRow === undefined) {
        return [
          {
            ...row,
            account_updated_at: accountRow?.updated_at,
            auth_user_id: userRow?.auth_user_id,
            employee_organization_id: employeeRow?.organization_id,
            employee_public_id: employeeRow?.public_id,
            name: userRow?.name,
            phone: userRow?.phone,
            row_id: row.id,
            row_public_id: row.public_id,
            user_id: employeeRow?.user_id,
            user_status: userRow?.status,
            user_type: userRow?.user_type,
          },
        ];
      }
      return [
        {
          ...row,
          account_updated_at: accountRow?.updated_at,
          auth_user_id: userRow.auth_user_id,
          employee_organization_id: employeeRow.organization_id,
          employee_public_id: employeeRow.public_id,
          name: userRow.name,
          phone: userRow.phone,
          row_id: row.id,
          row_public_id: row.public_id,
          user_id: employeeRow.user_id,
          user_status: userRow.status,
          user_type: userRow.user_type,
        },
      ];
    });
  const resolveSelectedRows = (
    selectedTable: unknown,
    fields: Record<string, unknown>,
  ): unknown[] => {
    if (selectedTable === admin) {
      return [
        {
          admin_role: "ops_admin",
          id: actorAdminId,
          public_id: actor.publicId,
        },
      ];
    }
    if (selectedTable === employeeImportCommand) {
      if ("command_kind" in fields) {
        return [{ ...command, actor_admin_public_id: actor.publicId }];
      }
      return [{ ...command }];
    }
    if (selectedTable === employeeImportRow) {
      if ("auth_user_id" in fields || "account_updated_at" in fields) {
        return resolveTargets();
      }
      return rows.map((row) => ({ ...row }));
    }
    if (selectedTable === employee) {
      return employees.map((employeeRow) => ({
        id: employeeRow.id,
        public_id: employeeRow.public_id,
      }));
    }
    if (selectedTable === authSession) {
      return sessions
        .filter(
          (session) =>
            session.expires_at > new Date("2026-07-17T00:00:00.000Z"),
        )
        .map((session, index) => ({
          id: `session-${index}`,
          user_id: session.user_id,
        }));
    }
    return [];
  };
  const createSelectBuilder = (fields: Record<string, unknown>) => {
    let selectedTable: unknown;
    let leftJoinedTables: unknown[] = [];
    const builder = {
      for: (strength: string, config?: { of?: unknown | unknown[] }) => {
        if (
          selectedTable === employeeImportCommand &&
          strength === "update" &&
          config?.of === employeeImportCommand
        ) {
          commandUpdateLockCount += 1;
        }
        if (
          selectedTable === employeeImportRow &&
          ("auth_user_id" in fields || "account_updated_at" in fields)
        ) {
          const lockedTables = Array.isArray(config?.of)
            ? config.of
            : config?.of === undefined
              ? []
              : [config.of];
          if (lockedTables.some((table) => leftJoinedTables.includes(table))) {
            throw new Error(
              "FOR UPDATE cannot be applied to the nullable side of an outer join.",
            );
          }
          credentialLockEvents = [
            ...credentialLockEvents,
            lockedTables.length === 1 && lockedTables[0] === employeeImportRow
              ? "target_rows"
              : "target_identities",
          ];
        }
        return builder;
      },
      from: (table: unknown) => {
        selectedTable = table;
        return builder;
      },
      innerJoin: () => builder,
      leftJoin: (table: unknown) => {
        leftJoinedTables = [...leftJoinedTables, table];
        return builder;
      },
      limit: () => builder,
      orderBy: () => builder,
      then: (
        resolveSelection: (value: unknown[]) => unknown,
        rejectSelection: (error: unknown) => unknown,
      ) =>
        Promise.resolve(resolveSelectedRows(selectedTable, fields)).then(
          resolveSelection,
          rejectSelection,
        ),
      where: () => builder,
    };
    return builder;
  };
  const createMutationBuilder = (
    executeMutation: (
      values: Record<string, unknown>,
      condition: unknown,
    ) => unknown[],
  ) => {
    let mutationValues: Record<string, unknown> = {};
    let mutationCondition: unknown;
    let executed = false;
    let result: unknown[] = [];
    const execute = () => {
      if (!executed) {
        executed = true;
        result = executeMutation(mutationValues, mutationCondition);
      }
      return result;
    };
    const builder = {
      returning: () => Promise.resolve(execute()),
      set: (values: Record<string, unknown>) => {
        mutationValues = values;
        return builder;
      },
      then: (
        resolveMutation: (value: unknown[]) => unknown,
        rejectMutation: (error: unknown) => unknown,
      ) =>
        Promise.resolve().then(execute).then(resolveMutation, rejectMutation),
      values: (values: Record<string, unknown>) => {
        mutationValues = values;
        return builder;
      },
      where: (condition: unknown) => {
        mutationCondition = condition;
        return builder;
      },
    };
    return builder;
  };
  const readQueryValues = (value: unknown): string[] => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(readQueryValues);
    if (value !== null && typeof value === "object") {
      return Object.values(value as Record<string, unknown>).flatMap(
        readQueryValues,
      );
    }
    return [];
  };
  const readSqlParams = (value: unknown): unknown[] =>
    value instanceof SQL ? new PgDialect().sqlToQuery(value).params : [];
  const databaseShape = {
    delete: (table: unknown) =>
      createMutationBuilder((_, condition) => {
        if (table === authSession) {
          const targetAuthUserIds = new Set(readSqlParams(condition));
          sessions = sessions.filter(
            (session) => !targetAuthUserIds.has(session.user_id),
          );
        }
        return [];
      }),
    execute: async (query: unknown) => {
      const queryValues = readQueryValues(query);
      const authUserId = queryValues.find((value) =>
        value.startsWith("auth-user-"),
      );
      if (authUserId !== undefined) {
        advisoryLockAuthUserIds = [...advisoryLockAuthUserIds, authUserId];
        credentialLockEvents = [
          ...credentialLockEvents,
          `advisory:${authUserId}`,
        ];
      }
      return [];
    },
    insert: (table: unknown) =>
      createMutationBuilder((values) => {
        if (table === auditLog) {
          if (
            options.failConfirmAudit === true &&
            values.action_type === "employee.credential_distribution_confirmed"
          ) {
            throw new Error("confirm audit failure");
          }
          if (
            options.failIssueAudit === true &&
            values.action_type === "employee.credentials_issued"
          ) {
            throw new Error("issue audit failure");
          }
          auditValues = [...auditValues, values];
        }
        return [];
      }),
    select: (fields: Record<string, unknown>) => createSelectBuilder(fields),
    transaction: async <TResult>(
      callback: (
        transaction: EmployeeImportCommandDatabase,
      ) => Promise<TResult>,
    ) => {
      const previousTransaction = transactionTail;
      let releaseTransaction: () => void = () => undefined;
      transactionTail = new Promise<void>((resolve) => {
        releaseTransaction = resolve;
      });
      await previousTransaction;
      const snapshot = cloneState();
      const lockSnapshot = advisoryLockAuthUserIds;
      try {
        return await callback(database);
      } catch (error) {
        restoreState(snapshot);
        advisoryLockAuthUserIds = lockSnapshot;
        throw error;
      } finally {
        releaseTransaction();
      }
    },
    update: (table: unknown) => {
      if (table === authAccount) accountMutationCount += 1;
      if (table === employeeImportCommand) commandMutationCount += 1;
      if (table === employeeImportRow) rowMutationCount += 1;
      return createMutationBuilder((values, condition) => {
        if (table === authAccount) {
          const passwordParams = new PgDialect().sqlToQuery(
            values.password as SQL,
          ).params;
          const passwordByAuthUserId = new Map<string, string>();
          const conditionParams = readSqlParams(condition);
          const targetedAuthUserIds = new Set(
            conditionParams.filter(
              (value): value is string =>
                typeof value === "string" && value.startsWith("auth-user-"),
            ),
          );
          const targetsCredentialProvider = conditionParams.includes(
            CREDENTIAL_PROVIDER_ID_FOR_TEST,
          );
          for (let index = 0; index < passwordParams.length; index += 2) {
            const authUserId = passwordParams[index];
            const passwordHash = passwordParams[index + 1];
            if (
              typeof authUserId === "string" &&
              typeof passwordHash === "string"
            ) {
              passwordByAuthUserId.set(authUserId, passwordHash);
            }
          }
          const updatedAuthUserIds: string[] = [];
          accounts = accounts.map((account) => {
            const passwordHash = passwordByAuthUserId.get(account.user_id);
            if (
              passwordHash === undefined ||
              !targetedAuthUserIds.has(account.user_id) ||
              !targetsCredentialProvider ||
              account.user_id === options.omitAccountUpdateAuthUserId
            ) {
              return account;
            }
            updatedAuthUserIds.push(account.user_id);
            return {
              ...account,
              password: passwordHash,
              updated_at: values.updated_at as Date,
            };
          });
          if (options.extraAccountUpdateAuthUserId !== undefined) {
            updatedAuthUserIds.push(options.extraAccountUpdateAuthUserId);
          }
          return updatedAuthUserIds.map((authUserId) => ({ authUserId }));
        } else if (table === employeeImportRow) {
          const targetedRowIds = new Set(
            readSqlParams(condition).filter(
              (value): value is number => typeof value === "number",
            ),
          );
          const updatedRowIds: number[] = [];
          rows = rows.map((row) => {
            if (
              !targetedRowIds.has(row.id) ||
              row.id === options.omitRowBaselineUpdateId
            ) {
              return row;
            }
            updatedRowIds.push(row.id);
            return {
              ...row,
              credential_updated_at: values.credential_updated_at as Date,
              updated_at: values.updated_at as Date,
            };
          });
          return updatedRowIds.map((rowId) => ({ rowId }));
        } else if (table === employeeImportCommand) {
          const targetsCommand = readSqlParams(condition).includes(command.id);
          if (!targetsCommand) return [];
          if (
            options.failIssueCommandUpdate === true &&
            values.credential_revision !== undefined
          ) {
            return [];
          }
          if (
            options.failConfirmCommandUpdate === true &&
            values.credential_distribution_status === "confirmed"
          ) {
            return [];
          }
          command = {
            ...command,
            credential_distribution_status:
              (values.credential_distribution_status as "open" | "confirmed") ??
              command.credential_distribution_status,
            credential_revision:
              (values.credential_revision as number) ??
              command.credential_revision,
            current_issue_public_id:
              (values.current_issue_public_id as string | null) ??
              command.current_issue_public_id,
            distribution_confirmed_at:
              (values.distribution_confirmed_at as Date | null) ??
              command.distribution_confirmed_at,
            updated_at: (values.updated_at as Date) ?? command.updated_at,
          };
          return [{ commandId: command.id }];
        }
        return [];
      });
    },
  };
  const database = databaseShape as unknown as CredentialDistributionDatabase;
  Object.defineProperties(database, {
    advisoryLockAuthUserIds: {
      get: () => advisoryLockAuthUserIds,
    },
    commandUpdateLockCount: {
      get: () => commandUpdateLockCount,
    },
    credentialLockEvents: {
      get: () => credentialLockEvents,
    },
    credentialMutationCounts: {
      get: () => ({
        account: accountMutationCount,
        command: commandMutationCount,
        row: rowMutationCount,
      }),
    },
    persistedSnapshot: {
      get: () => ({
        auditActions: auditValues.map((value) => String(value.action_type)),
        auditValues: auditValues.map((value) => ({ ...value })),
        command: {
          credentialDistributionStatus: command.credential_distribution_status,
          credentialRevision: command.credential_revision,
          currentIssuePublicId: command.current_issue_public_id,
        },
        passwordHashes: accounts.map((account) => account.password),
        rowCredentialBaselines: rows.map((row) =>
          row.credential_updated_at.toISOString(),
        ),
        sessionAuthUserIds: sessions.map((session) => session.user_id),
      }),
    },
  });

  return database;
}
