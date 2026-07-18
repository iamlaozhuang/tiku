import { randomUUID } from "node:crypto";

import {
  and,
  asc,
  count,
  eq,
  gt,
  inArray,
  isNull,
  lte,
  sql,
} from "drizzle-orm";

import {
  admin,
  adminRoleAssignment,
  auditLog,
  authAccount,
  authSession,
  authUpgrade,
  authUser,
  employee,
  employeeImportCommand,
  employeeImportRow,
  orgAuth,
  organization,
  user,
} from "@/db/schema";
import {
  bindEmployeeAccountWithDatabase,
  createEmployeeAccountWithDatabase,
  type AdminOrganizationOrgAuthRuntimeDatabase,
} from "./admin-organization-org-auth-runtime-repository";
import { findAccountPhoneIdentityConflictUnderLock } from "./account-phone-identity-lock";
import { lockEmployeeIdentity } from "./employee-org-auth-quota-repository";
import {
  EmployeeAccountMutationError,
  type EmployeeAccountMutationFailureReason,
} from "./employee-account-repository";
import {
  EmployeeImportCommandError,
  type EmployeeImportCommandRecord,
  type EmployeeImportCommandRepository,
  type EmployeeImportPreflightIdentityState,
  type EmployeeImportRejectionReason,
  type ProcessEmployeeImportRowInput,
} from "./employee-import-command-repository";
import type { EmployeeImportCommandActor } from "../contracts/employee-import-command-contract";
import { createRuntimeDatabaseForSchema } from "./runtime-database";
import {
  createOrgAuthCoversOrganizationCondition,
  lockOrganizationScopeMutation,
} from "./organization-scope-query";
import * as databaseSchema from "@/db/schema";

export type EmployeeImportCommandDatabase =
  AdminOrganizationOrgAuthRuntimeDatabase;

export type PostgresEmployeeImportCommandRepositoryOptions = {
  createDatabase?: () => EmployeeImportCommandDatabase;
};

type ActorRow = {
  id: number;
  public_id: string;
  admin_role: "ops_admin" | "super_admin";
};

type LockedCommandRow = {
  id: number;
  public_id: string;
  actor_admin_id: number;
  organization_id: number;
  organization_public_id: string;
  request_hash: string;
  employee_import_status: "processing" | "completed";
  credential_distribution_status:
    | "pending"
    | "not_required"
    | "open"
    | "confirmed";
  credential_revision: number;
  current_issue_public_id: string | null;
  distribution_confirmed_at: Date | null;
};

type LockedRow = {
  id: number;
  public_id: string;
  row_number: number;
  row_request_hash: string;
  employee_import_row_status: "pending" | "succeeded" | "rejected";
};

type TerminalEmployeeImportRowOutcome =
  | {
      status: "rejected";
      rejectionReason: EmployeeImportRejectionReason;
    }
  | {
      status: "succeeded";
      outcomeKind: "created" | "bound";
      warningReason: "initial_password_not_applied_to_existing_user" | null;
      credentialMode: "generated" | "provided" | "existing_account";
      employeeId: number;
      credentialUpdatedAt: Date | null;
    };

const CREDENTIAL_PROVIDER_ID = "credential";

type CredentialTargetRow = {
  rowId: number;
  rowPublicId: string;
  rowNumber: number;
  credentialUpdatedAt: Date;
  employeeId: number | null;
  employeePublicId: string | null;
  employeeOrganizationId: number | null;
  userId: number | null;
  authUserId: string | null;
  userStatus: "active" | "disabled" | null;
  userType: "personal" | "employee" | null;
  phone: string | null;
  name: string | null;
  accountUpdatedAt: Date | null;
};

export function createPostgresEmployeeImportCommandRepository(
  options: PostgresEmployeeImportCommandRepositoryOptions = {},
): EmployeeImportCommandRepository {
  const getDatabase = createLazyDatabaseGetter(
    options.createDatabase ??
      (() =>
        createRuntimeDatabaseForSchema(
          databaseSchema,
          "DATABASE_URL is required for employee import commands.",
        )),
  );

  return {
    async preflightRows(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const preflightDatabase = transaction as EmployeeImportCommandDatabase;
        await resolveActiveActor(preflightDatabase, input.actor);
        const [organizationRow] = await preflightDatabase
          .select({
            id: organization.id,
            public_id: organization.public_id,
          })
          .from(organization)
          .where(
            and(
              eq(organization.public_id, input.organizationPublicId),
              eq(organization.status, "active"),
            ),
          )
          .limit(1);

        if (organizationRow === undefined) {
          return createUnavailablePreflightFacts(input.rows);
        }

        const now = new Date();
        const orgAuthRows = await preflightDatabase
          .select({
            account_quota: orgAuth.account_quota,
            edition: orgAuth.edition,
            id: orgAuth.id,
            starts_at: orgAuth.starts_at,
            used_quota: orgAuth.used_quota,
          })
          .from(orgAuth)
          .where(
            and(
              eq(orgAuth.status, "active"),
              gt(orgAuth.expires_at, now),
              createOrgAuthCoversOrganizationCondition({
                authScopeType: orgAuth.auth_scope_type,
                orgAuthId: orgAuth.id,
                organizationId: organizationRow.id,
                purchaserOrganizationId: orgAuth.purchaser_organization_id,
              }),
            ),
          )
          .orderBy(asc(orgAuth.id));
        const currentOrgAuthRows = orgAuthRows.filter(
          (row) => row.starts_at <= now,
        );
        const activeUpgradeRows =
          currentOrgAuthRows.length === 0
            ? []
            : await preflightDatabase
                .select({
                  expires_at: authUpgrade.expires_at,
                  org_auth_id: authUpgrade.org_auth_id,
                  revoked_at: authUpgrade.revoked_at,
                  starts_at: authUpgrade.starts_at,
                  status: authUpgrade.status,
                  target_edition: authUpgrade.target_edition,
                })
                .from(authUpgrade)
                .where(
                  and(
                    inArray(
                      authUpgrade.org_auth_id,
                      currentOrgAuthRows.map((row) => row.id),
                    ),
                    eq(authUpgrade.status, "active"),
                    isNull(authUpgrade.revoked_at),
                    lte(authUpgrade.starts_at, now),
                    gt(authUpgrade.expires_at, now),
                  ),
                );
        const uniquePhones = [...new Set(input.rows.map((row) => row.phone))];
        const adminPhoneRows =
          uniquePhones.length === 0
            ? []
            : await preflightDatabase
                .select({ phone: admin.phone })
                .from(admin)
                .where(inArray(admin.phone, uniquePhones));
        const userRows =
          uniquePhones.length === 0
            ? []
            : await preflightDatabase
                .select({
                  employee_organization_id: employee.organization_id,
                  phone: user.phone,
                  status: user.status,
                  user_type: user.user_type,
                })
                .from(user)
                .leftJoin(employee, eq(employee.user_id, user.id))
                .where(inArray(user.phone, uniquePhones));
        const adminPhones = new Set(adminPhoneRows.map((row) => row.phone));
        const userByPhone = new Map(userRows.map((row) => [row.phone, row]));
        const hasAdvancedEdition =
          currentOrgAuthRows.some((row) => row.edition === "advanced") ||
          activeUpgradeRows.some(
            (row) =>
              row.status === "active" &&
              row.revoked_at === null &&
              row.starts_at <= now &&
              row.expires_at > now &&
              row.target_edition === "advanced",
          );

        return {
          authorization:
            currentOrgAuthRows.length === 0
              ? {
                  activeScopeCount: 0,
                  availableSeatCount: null,
                  effectiveEdition: null,
                  status: "unavailable" as const,
                }
              : {
                  activeScopeCount: currentOrgAuthRows.length,
                  availableSeatCount: Math.min(
                    ...orgAuthRows.map((row) =>
                      Math.max(row.account_quota - row.used_quota, 0),
                    ),
                  ),
                  effectiveEdition: hasAdvancedEdition
                    ? ("advanced" as const)
                    : ("standard" as const),
                  status: "available" as const,
                },
          organizationStatus: "active" as const,
          rows: input.rows.map((row) => ({
            identityState: resolvePreflightIdentityState({
              adminPhones,
              organizationId: organizationRow.id,
              phone: row.phone,
              userByPhone,
            }),
            rowNumber: row.rowNumber,
          })),
        };
      });
    },

    async findClaimedCommand(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const [claimedCommand] = await commandDatabase
          .select({
            actor_admin_id: employeeImportCommand.actor_admin_id,
            id: employeeImportCommand.id,
            request_hash: employeeImportCommand.request_hash,
          })
          .from(employeeImportCommand)
          .where(
            eq(
              employeeImportCommand.idempotency_scope_hash,
              input.idempotencyScopeHash,
            ),
          )
          .limit(1)
          .for("share", { of: employeeImportCommand });

        if (
          claimedCommand === undefined ||
          !canActorAccessCommand(actorRow, claimedCommand)
        ) {
          return null;
        }
        const command = await readEmployeeImportCommandRecord(
          commandDatabase,
          claimedCommand.id,
        );
        if (command === null) {
          throw new Error("Claimed employee import command could not be read.");
        }

        return { command, requestHash: claimedCommand.request_hash };
      });
    },

    async claimCommand(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const organizationRow = await resolveActiveOrganization(
          commandDatabase,
          input.organizationPublicId,
        );
        const now = new Date();
        const commandPublicId = `employee-import-command-${randomUUID()}`;
        const [insertedCommand] = await commandDatabase
          .insert(employeeImportCommand)
          .values({
            actor_admin_id: actorRow.id,
            command_kind: input.commandKind,
            created_at: now,
            idempotency_scope_hash: input.idempotencyScopeHash,
            organization_id: organizationRow.id,
            public_id: commandPublicId,
            request_hash: input.requestHash,
            row_count: input.rows.length,
            updated_at: now,
          })
          .onConflictDoNothing({
            target: employeeImportCommand.idempotency_scope_hash,
          })
          .returning({
            id: employeeImportCommand.id,
            public_id: employeeImportCommand.public_id,
          });

        let claimedCommandId: number;
        let claimedCommandPublicId: string;

        if (insertedCommand === undefined) {
          const [existingCommand] = await commandDatabase
            .select({
              id: employeeImportCommand.id,
              public_id: employeeImportCommand.public_id,
              request_hash: employeeImportCommand.request_hash,
            })
            .from(employeeImportCommand)
            .where(
              eq(
                employeeImportCommand.idempotency_scope_hash,
                input.idempotencyScopeHash,
              ),
            )
            .limit(1);

          if (existingCommand === undefined) {
            throw new Error("Employee import command conflict lookup failed.");
          }
          if (existingCommand.request_hash !== input.requestHash) {
            throw new EmployeeImportCommandError(
              "idempotency_request_mismatch",
            );
          }

          claimedCommandId = existingCommand.id;
          claimedCommandPublicId = existingCommand.public_id;
        } else {
          claimedCommandId = insertedCommand.id;
          claimedCommandPublicId = insertedCommand.public_id;
          await commandDatabase.insert(employeeImportRow).values(
            input.rows.map((row) => ({
              employee_import_command_id: claimedCommandId,
              public_id: `employee-import-row-${randomUUID()}`,
              row_number: row.rowNumber,
              row_request_hash: row.rowRequestHash,
            })),
          );
          await insertCommandAudit(commandDatabase, {
            actionType: "employee.import_command.started",
            actor: input.actor,
            commandPublicId: claimedCommandPublicId,
            metadata: {
              commandKind: input.commandKind,
              rowCount: input.rows.length,
            },
            resultStatus: "success",
          });
        }

        const record = await readEmployeeImportCommandRecord(
          commandDatabase,
          claimedCommandId,
        );
        if (record === null) {
          throw new Error("Claimed employee import command could not be read.");
        }

        return record;
      });
    },

    async processRow(input) {
      const database = getDatabase();

      await database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const command = await lockCommand(
          commandDatabase,
          input.commandPublicId,
        );
        assertActorCanAccessCommand(actorRow, command);
        const row = await lockRow(commandDatabase, command.id, input.rowNumber);

        if (row.employee_import_row_status !== "pending") {
          return;
        }
        if (row.row_request_hash !== input.rowRequestHash) {
          throw new EmployeeImportCommandError("idempotency_request_mismatch");
        }

        let terminalOutcome: TerminalEmployeeImportRowOutcome;

        if (input.prevalidatedRejectionReason !== null) {
          terminalOutcome = rejected(input.prevalidatedRejectionReason);
        } else {
          try {
            terminalOutcome = await transaction.transaction(async (savepoint) =>
              mutateEmployeeAccountWithinSavepoint(
                savepoint as EmployeeImportCommandDatabase,
                command,
                input,
              ),
            );
          } catch (error) {
            const reason = mapDeterministicEmployeeMutationError(error);
            if (reason === null) {
              throw error;
            }
            terminalOutcome = rejected(reason);
          }
        }

        await writeTerminalOutcome(commandDatabase, row.id, terminalOutcome);
        await insertRowAudit(
          commandDatabase,
          input.actor,
          command,
          row,
          terminalOutcome,
        );
        await finalizeCommandWhenNoPendingRows(
          commandDatabase,
          input.actor,
          command,
        );
      });
    },

    async findCommand(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const [command] = await commandDatabase
          .select({
            actor_admin_id: employeeImportCommand.actor_admin_id,
            id: employeeImportCommand.id,
          })
          .from(employeeImportCommand)
          .where(eq(employeeImportCommand.public_id, input.commandPublicId))
          .limit(1)
          .for("share", { of: employeeImportCommand });

        if (
          command === undefined ||
          !canActorAccessCommand(actorRow, command)
        ) {
          return null;
        }

        return readEmployeeImportCommandRecord(commandDatabase, command.id);
      });
    },

    async listIssueTargets(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const command = await lockCommandForCredentialRead(
          commandDatabase,
          input.commandPublicId,
        );
        assertActorCanAccessCommand(actorRow, command);
        assertCredentialDistributionIsOpen(command);
        const targets = await readGeneratedCredentialTargets(
          commandDatabase,
          command.id,
          "none",
        );
        assertCompleteCredentialTargets(targets, command.organization_id);

        return {
          commandPublicId: command.public_id,
          credentialRevision: command.credential_revision,
          targets: targets.map((target) => ({
            employeePublicId: requireCredentialTargetValue(
              target.employeePublicId,
            ),
            rowNumber: target.rowNumber,
            rowPublicId: target.rowPublicId,
          })),
        };
      });
    },

    async issueCredentials(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const command = await lockCommand(
          commandDatabase,
          input.commandPublicId,
        );
        assertActorCanAccessCommand(actorRow, command);
        assertCredentialDistributionIsOpen(command);
        if (command.credential_revision !== input.expectedCredentialRevision) {
          throw new EmployeeImportCommandError("credential_revision_stale");
        }

        const lockedTargets = await readGeneratedCredentialTargets(
          commandDatabase,
          command.id,
          "rows",
        );
        assertCompleteCredentialTargets(lockedTargets, command.organization_id);
        assertPreparedCredentialTargetSet(lockedTargets, input.credentials);
        const sortedTargets = [...lockedTargets].sort((left, right) =>
          requireCredentialTargetValue(left.authUserId).localeCompare(
            requireCredentialTargetValue(right.authUserId),
          ),
        );
        for (const target of sortedTargets) {
          await commandDatabase.execute(
            sql`select pg_advisory_xact_lock(hashtext(${requireCredentialTargetValue(
              target.authUserId,
            )}))`,
          );
        }

        const verifiedTargets = await readGeneratedCredentialTargets(
          commandDatabase,
          command.id,
          "identities",
        );
        assertStableCredentialTargets(
          sortedTargets,
          verifiedTargets,
          command.organization_id,
        );
        const sortedVerifiedTargets = [...verifiedTargets].sort((left, right) =>
          requireCredentialTargetValue(left.authUserId).localeCompare(
            requireCredentialTargetValue(right.authUserId),
          ),
        );
        const authUserIds = sortedVerifiedTargets.map((target) =>
          requireCredentialTargetValue(target.authUserId),
        );
        const [activeSession] = await commandDatabase
          .select({ id: authSession.id })
          .from(authSession)
          .where(
            and(
              inArray(authSession.user_id, authUserIds),
              gt(authSession.expires_at, new Date()),
            ),
          )
          .limit(1);
        if (activeSession !== undefined) {
          throw new EmployeeImportCommandError("active_session");
        }

        const credentialByRowPublicId = new Map(
          input.credentials.map((credential) => [
            credential.rowPublicId,
            credential,
          ]),
        );
        const credentialUpdatedAt = new Date();
        const passwordCases = sql.join(
          sortedVerifiedTargets.map((target) => {
            const credential = credentialByRowPublicId.get(target.rowPublicId);
            if (credential === undefined) {
              throw new EmployeeImportCommandError("account_state_changed");
            }
            return sql`when ${authAccount.user_id} = ${requireCredentialTargetValue(
              target.authUserId,
            )} then ${credential.passwordHash}`;
          }),
          sql.raw(" "),
        );
        const updatedAccounts = await commandDatabase
          .update(authAccount)
          .set({
            password: sql`case ${passwordCases} else ${authAccount.password} end`,
            updated_at: credentialUpdatedAt,
          })
          .where(
            and(
              inArray(authAccount.user_id, authUserIds),
              eq(authAccount.provider_id, CREDENTIAL_PROVIDER_ID),
            ),
          )
          .returning({ authUserId: authAccount.user_id });
        assertExactMutationIds(
          updatedAccounts.map((account) => account.authUserId),
          authUserIds,
          "credential account",
        );
        await commandDatabase
          .delete(authSession)
          .where(inArray(authSession.user_id, authUserIds));
        const targetRowIds = sortedVerifiedTargets.map(
          (target) => target.rowId,
        );
        const updatedRows = await commandDatabase
          .update(employeeImportRow)
          .set({
            credential_updated_at: credentialUpdatedAt,
            updated_at: credentialUpdatedAt,
          })
          .where(inArray(employeeImportRow.id, targetRowIds))
          .returning({ rowId: employeeImportRow.id });
        assertExactMutationIds(
          updatedRows.map((row) => row.rowId),
          targetRowIds,
          "credential baseline",
        );

        const credentialRevision = command.credential_revision + 1;
        const issuePublicId = `employee-import-issue-${randomUUID()}`;
        const updatedCommands = await commandDatabase
          .update(employeeImportCommand)
          .set({
            credential_revision: credentialRevision,
            current_issue_public_id: issuePublicId,
            updated_at: credentialUpdatedAt,
          })
          .where(eq(employeeImportCommand.id, command.id))
          .returning({ commandId: employeeImportCommand.id });
        assertExactMutationIds(
          updatedCommands.map((updatedCommand) => updatedCommand.commandId),
          [command.id],
          "credential command",
        );
        await insertCommandAudit(commandDatabase, {
          actionType: "employee.credentials_issued",
          actor: input.actor,
          commandPublicId: command.public_id,
          metadata: {
            credentialRevision,
            targetCount: sortedVerifiedTargets.length,
          },
          resultStatus: "success",
        });

        return {
          credentialRevision,
          issuePublicId,
          rows: [...verifiedTargets]
            .sort((left, right) => left.rowNumber - right.rowNumber)
            .map((target) => ({
              employeePublicId: requireCredentialTargetValue(
                target.employeePublicId,
              ),
              name: requireCredentialTargetValue(target.name),
              phone: requireCredentialTargetValue(target.phone),
              rowNumber: target.rowNumber,
              rowPublicId: target.rowPublicId,
            })),
        };
      });
    },

    async confirmDistribution(input) {
      const database = getDatabase();

      return database.transaction(async (transaction) => {
        const commandDatabase = transaction as EmployeeImportCommandDatabase;
        const actorRow = await resolveActiveActor(commandDatabase, input.actor);
        const command = await lockCommand(
          commandDatabase,
          input.commandPublicId,
        );
        assertActorCanAccessCommand(actorRow, command);

        if (command.credential_distribution_status === "confirmed") {
          if (
            command.credential_revision !== input.expectedCredentialRevision ||
            command.current_issue_public_id !== input.issuePublicId
          ) {
            throw new EmployeeImportCommandError("credential_manifest_stale");
          }
          const replayRecord = await readEmployeeImportCommandRecord(
            commandDatabase,
            command.id,
          );
          if (replayRecord === null) {
            throw new EmployeeImportCommandError("command_not_found");
          }
          return replayRecord;
        }
        if (
          command.credential_distribution_status !== "open" ||
          command.credential_revision !== input.expectedCredentialRevision ||
          command.current_issue_public_id !== input.issuePublicId
        ) {
          throw new EmployeeImportCommandError("credential_manifest_stale");
        }

        const lockedTargets = await readGeneratedCredentialTargets(
          commandDatabase,
          command.id,
          "rows",
        );
        assertCompleteCredentialTargets(lockedTargets, command.organization_id);
        const targets = await readGeneratedCredentialTargets(
          commandDatabase,
          command.id,
          "identities",
        );
        assertStableCredentialTargets(
          lockedTargets,
          targets,
          command.organization_id,
        );
        const confirmedAt = new Date();
        const updatedCommands = await commandDatabase
          .update(employeeImportCommand)
          .set({
            credential_distribution_status: "confirmed",
            distribution_confirmed_at: confirmedAt,
            updated_at: confirmedAt,
          })
          .where(eq(employeeImportCommand.id, command.id))
          .returning({ commandId: employeeImportCommand.id });
        assertExactMutationIds(
          updatedCommands.map((updatedCommand) => updatedCommand.commandId),
          [command.id],
          "credential distribution command",
        );
        await insertCommandAudit(commandDatabase, {
          actionType: "employee.credential_distribution_confirmed",
          actor: input.actor,
          commandPublicId: command.public_id,
          metadata: {
            credentialRevision: command.credential_revision,
            targetCount: targets.length,
          },
          resultStatus: "success",
        });

        const record = await readEmployeeImportCommandRecord(
          commandDatabase,
          command.id,
        );
        if (record === null) {
          throw new EmployeeImportCommandError("command_not_found");
        }
        return record;
      });
    },
  };
}

function createUnavailablePreflightFacts(rows: { rowNumber: number }[]) {
  return {
    authorization: {
      activeScopeCount: 0,
      availableSeatCount: null,
      effectiveEdition: null,
      status: "unavailable" as const,
    },
    organizationStatus: "not_found" as const,
    rows: rows.map((row) => ({
      identityState: "absent" as const,
      rowNumber: row.rowNumber,
    })),
  };
}

function resolvePreflightIdentityState(input: {
  adminPhones: Set<string>;
  organizationId: number;
  phone: string;
  userByPhone: Map<
    string,
    {
      employee_organization_id: number | null;
      phone: string;
      status: "active" | "disabled";
      user_type: "personal" | "employee";
    }
  >;
}): EmployeeImportPreflightIdentityState {
  if (input.adminPhones.has(input.phone)) {
    return "admin_phone_conflict";
  }
  const userRow = input.userByPhone.get(input.phone);
  if (userRow === undefined) {
    return "absent";
  }
  if (userRow.status === "disabled") {
    return "disabled_user";
  }
  if (
    userRow.user_type === "employee" ||
    userRow.employee_organization_id !== null
  ) {
    return userRow.employee_organization_id === input.organizationId
      ? "employee_same_organization"
      : "employee_other_organization";
  }

  return "personal_active";
}

function createLazyDatabaseGetter(
  createDatabase: () => EmployeeImportCommandDatabase,
): () => EmployeeImportCommandDatabase {
  let database: EmployeeImportCommandDatabase | undefined;

  return () => {
    database ??= createDatabase();
    return database;
  };
}

async function resolveActiveActor(
  database: EmployeeImportCommandDatabase,
  actor: EmployeeImportCommandActor,
): Promise<ActorRow> {
  const [actorRow] = await database
    .select({
      admin_role: adminRoleAssignment.admin_role,
      id: admin.id,
      public_id: admin.public_id,
    })
    .from(admin)
    .innerJoin(
      adminRoleAssignment,
      and(
        eq(adminRoleAssignment.admin_id, admin.id),
        eq(adminRoleAssignment.admin_role, actor.role),
      ),
    )
    .where(and(eq(admin.public_id, actor.publicId), eq(admin.status, "active")))
    .limit(1);

  if (
    actorRow === undefined ||
    actorRow.admin_role !== actor.role ||
    (actorRow.admin_role !== "ops_admin" &&
      actorRow.admin_role !== "super_admin")
  ) {
    throw new EmployeeImportCommandError("actor_forbidden");
  }

  return {
    admin_role: actorRow.admin_role,
    id: actorRow.id,
    public_id: actorRow.public_id,
  };
}

async function resolveActiveOrganization(
  database: EmployeeImportCommandDatabase,
  organizationPublicId: string,
) {
  const [organizationRow] = await database
    .select({ id: organization.id, public_id: organization.public_id })
    .from(organization)
    .where(
      and(
        eq(organization.public_id, organizationPublicId),
        eq(organization.status, "active"),
      ),
    )
    .limit(1);

  if (organizationRow === undefined) {
    throw new EmployeeImportCommandError("command_not_found");
  }

  return organizationRow;
}

async function lockCommand(
  database: EmployeeImportCommandDatabase,
  commandPublicId: string,
): Promise<LockedCommandRow> {
  const [command] = await database
    .select({
      actor_admin_id: employeeImportCommand.actor_admin_id,
      credential_distribution_status:
        employeeImportCommand.credential_distribution_status,
      credential_revision: employeeImportCommand.credential_revision,
      current_issue_public_id: employeeImportCommand.current_issue_public_id,
      distribution_confirmed_at:
        employeeImportCommand.distribution_confirmed_at,
      employee_import_status: employeeImportCommand.employee_import_status,
      id: employeeImportCommand.id,
      organization_id: employeeImportCommand.organization_id,
      organization_public_id: organization.public_id,
      public_id: employeeImportCommand.public_id,
      request_hash: employeeImportCommand.request_hash,
    })
    .from(employeeImportCommand)
    .innerJoin(
      organization,
      eq(organization.id, employeeImportCommand.organization_id),
    )
    .where(eq(employeeImportCommand.public_id, commandPublicId))
    .limit(1)
    .for("update", { of: employeeImportCommand });

  if (command === undefined) {
    throw new EmployeeImportCommandError("command_not_found");
  }

  return command;
}

async function lockCommandForCredentialRead(
  database: EmployeeImportCommandDatabase,
  commandPublicId: string,
): Promise<LockedCommandRow> {
  const [command] = await database
    .select({
      actor_admin_id: employeeImportCommand.actor_admin_id,
      credential_distribution_status:
        employeeImportCommand.credential_distribution_status,
      credential_revision: employeeImportCommand.credential_revision,
      current_issue_public_id: employeeImportCommand.current_issue_public_id,
      distribution_confirmed_at:
        employeeImportCommand.distribution_confirmed_at,
      employee_import_status: employeeImportCommand.employee_import_status,
      id: employeeImportCommand.id,
      organization_id: employeeImportCommand.organization_id,
      organization_public_id: organization.public_id,
      public_id: employeeImportCommand.public_id,
      request_hash: employeeImportCommand.request_hash,
    })
    .from(employeeImportCommand)
    .innerJoin(
      organization,
      eq(organization.id, employeeImportCommand.organization_id),
    )
    .where(eq(employeeImportCommand.public_id, commandPublicId))
    .limit(1)
    .for("share", { of: employeeImportCommand });

  if (command === undefined) {
    throw new EmployeeImportCommandError("command_not_found");
  }

  return command;
}

function assertCredentialDistributionIsOpen(command: LockedCommandRow): void {
  if (
    command.employee_import_status !== "completed" ||
    command.credential_distribution_status !== "open"
  ) {
    throw new EmployeeImportCommandError("credential_distribution_closed");
  }
}

async function readGeneratedCredentialTargets(
  database: EmployeeImportCommandDatabase,
  commandId: number,
  lockScope: "none" | "rows" | "identities",
): Promise<CredentialTargetRow[]> {
  const targetSelection = {
    account_updated_at: authAccount.updated_at,
    auth_user_id: user.auth_user_id,
    credential_updated_at: employeeImportRow.credential_updated_at,
    employee_id: employeeImportRow.employee_id,
    employee_organization_id: employee.organization_id,
    employee_public_id: employee.public_id,
    name: user.name,
    phone: user.phone,
    row_id: employeeImportRow.id,
    row_number: employeeImportRow.row_number,
    row_public_id: employeeImportRow.public_id,
    user_id: employee.user_id,
    user_status: user.status,
    user_type: user.user_type,
  };
  const targetCondition = and(
    eq(employeeImportRow.employee_import_command_id, commandId),
    eq(employeeImportRow.employee_import_row_status, "succeeded"),
    eq(employeeImportRow.credential_mode, "generated"),
  );
  const query =
    lockScope === "identities"
      ? database
          .select(targetSelection)
          .from(employeeImportRow)
          .innerJoin(employee, eq(employee.id, employeeImportRow.employee_id))
          .innerJoin(user, eq(user.id, employee.user_id))
          .innerJoin(authUser, eq(authUser.id, user.auth_user_id))
          .innerJoin(
            authAccount,
            and(
              eq(authAccount.user_id, authUser.id),
              eq(authAccount.provider_id, CREDENTIAL_PROVIDER_ID),
            ),
          )
          .where(targetCondition)
          .orderBy(asc(employeeImportRow.row_number))
      : database
          .select(targetSelection)
          .from(employeeImportRow)
          .leftJoin(employee, eq(employee.id, employeeImportRow.employee_id))
          .leftJoin(user, eq(user.id, employee.user_id))
          .leftJoin(authUser, eq(authUser.id, user.auth_user_id))
          .leftJoin(
            authAccount,
            and(
              eq(authAccount.user_id, authUser.id),
              eq(authAccount.provider_id, CREDENTIAL_PROVIDER_ID),
            ),
          )
          .where(targetCondition)
          .orderBy(asc(employeeImportRow.row_number));
  const targetRows =
    lockScope === "identities"
      ? await query.for("update", {
          of: [employeeImportRow, employee, user, authUser, authAccount],
        })
      : lockScope === "rows"
        ? await query.for("update", { of: employeeImportRow })
        : await query;

  return targetRows.map((target) => ({
    accountUpdatedAt: target.account_updated_at,
    authUserId: target.auth_user_id,
    credentialUpdatedAt: requireCredentialTargetValue(
      target.credential_updated_at,
    ),
    employeeId: target.employee_id,
    employeeOrganizationId: target.employee_organization_id,
    employeePublicId: target.employee_public_id,
    name: target.name,
    phone: target.phone,
    rowId: target.row_id,
    rowNumber: target.row_number,
    rowPublicId: target.row_public_id,
    userId: target.user_id,
    userStatus: target.user_status,
    userType: target.user_type,
  }));
}

function assertCompleteCredentialTargets(
  targets: CredentialTargetRow[],
  organizationId: number,
): void {
  if (targets.length === 0) {
    throw new EmployeeImportCommandError("account_state_changed");
  }
  for (const target of targets) {
    if (
      target.employeeId === null ||
      target.employeePublicId === null ||
      target.employeeOrganizationId !== organizationId ||
      target.userId === null ||
      target.authUserId === null ||
      target.userStatus !== "active" ||
      target.userType !== "employee" ||
      target.phone === null ||
      target.name === null ||
      target.accountUpdatedAt === null
    ) {
      throw new EmployeeImportCommandError("account_state_changed");
    }
  }
}

function assertCredentialTargetBaselines(targets: CredentialTargetRow[]): void {
  for (const target of targets) {
    if (
      target.accountUpdatedAt === null ||
      target.accountUpdatedAt.getTime() !== target.credentialUpdatedAt.getTime()
    ) {
      throw new EmployeeImportCommandError("credential_baseline_changed");
    }
  }
}

function assertPreparedCredentialTargetSet(
  targets: CredentialTargetRow[],
  credentials: { rowPublicId: string }[],
): void {
  const targetIds = [...targets].map((target) => target.rowPublicId).sort();
  const credentialIds = credentials
    .map((credential) => credential.rowPublicId)
    .sort();
  if (
    new Set(credentialIds).size !== credentialIds.length ||
    targetIds.length !== credentialIds.length ||
    targetIds.some((targetId, index) => targetId !== credentialIds[index])
  ) {
    throw new EmployeeImportCommandError("account_state_changed");
  }
}

function assertStableCredentialTargets(
  lockedTargets: CredentialTargetRow[],
  verifiedTargets: CredentialTargetRow[],
  organizationId: number,
): void {
  assertCompleteCredentialTargets(verifiedTargets, organizationId);
  const lockedByRowPublicId = new Map(
    lockedTargets.map((target) => [target.rowPublicId, target]),
  );
  if (lockedByRowPublicId.size !== verifiedTargets.length) {
    throw new EmployeeImportCommandError("account_state_changed");
  }
  for (const target of verifiedTargets) {
    const lockedTarget = lockedByRowPublicId.get(target.rowPublicId);
    if (
      lockedTarget === undefined ||
      lockedTarget.authUserId !== target.authUserId ||
      lockedTarget.employeeId !== target.employeeId ||
      lockedTarget.userId !== target.userId
    ) {
      throw new EmployeeImportCommandError("account_state_changed");
    }
  }
  assertCredentialTargetBaselines(verifiedTargets);
}

function assertExactMutationIds<TId extends number | string>(
  actualIds: TId[],
  expectedIds: TId[],
  mutationLabel: string,
): void {
  const actualIdSet = new Set(actualIds);
  const expectedIdSet = new Set(expectedIds);
  if (
    actualIdSet.size !== actualIds.length ||
    expectedIdSet.size !== expectedIds.length ||
    actualIdSet.size !== expectedIdSet.size ||
    [...expectedIdSet].some((expectedId) => !actualIdSet.has(expectedId))
  ) {
    throw new Error(`${mutationLabel} update set mismatch.`);
  }
}

function requireCredentialTargetValue<TValue>(value: TValue | null): TValue {
  if (value === null) {
    throw new EmployeeImportCommandError("account_state_changed");
  }
  return value;
}

function assertActorCanAccessCommand(
  actorRow: ActorRow,
  command: Pick<LockedCommandRow, "actor_admin_id">,
): void {
  if (!canActorAccessCommand(actorRow, command)) {
    throw new EmployeeImportCommandError("actor_forbidden");
  }
}

function canActorAccessCommand(
  actorRow: ActorRow,
  command: Pick<LockedCommandRow, "actor_admin_id">,
): boolean {
  return (
    actorRow.admin_role === "super_admin" ||
    actorRow.id === command.actor_admin_id
  );
}

async function lockRow(
  database: EmployeeImportCommandDatabase,
  commandId: number,
  rowNumber: number,
): Promise<LockedRow> {
  const [row] = await database
    .select({
      employee_import_row_status: employeeImportRow.employee_import_row_status,
      id: employeeImportRow.id,
      public_id: employeeImportRow.public_id,
      row_number: employeeImportRow.row_number,
      row_request_hash: employeeImportRow.row_request_hash,
    })
    .from(employeeImportRow)
    .where(
      and(
        eq(employeeImportRow.employee_import_command_id, commandId),
        eq(employeeImportRow.row_number, rowNumber),
      ),
    )
    .limit(1)
    .for("update", { of: employeeImportRow });

  if (row === undefined) {
    throw new EmployeeImportCommandError("command_not_found");
  }

  return row;
}

async function mutateEmployeeAccountWithinSavepoint(
  savepoint: EmployeeImportCommandDatabase,
  command: LockedCommandRow,
  input: ProcessEmployeeImportRowInput,
): Promise<TerminalEmployeeImportRowOutcome> {
  await lockOrganizationScopeMutation(savepoint);
  const accountConflict = await findAccountPhoneIdentityConflictUnderLock(
    savepoint,
    input.phone,
  );

  if (accountConflict === "admin") {
    return rejected("cross_domain_conflict");
  }

  if (accountConflict === "user") {
    const [existingIdentity] = await savepoint
      .select({
        employee_public_id: employee.public_id,
        public_id: user.public_id,
      })
      .from(user)
      .leftJoin(employee, eq(employee.user_id, user.id))
      .where(eq(user.phone, input.phone))
      .limit(1);

    if (existingIdentity === undefined) {
      throw new Error("Locked employee import identity could not be read.");
    }

    await lockEmployeeIdentity(savepoint, existingIdentity.public_id);
    if (existingIdentity.employee_public_id !== null) {
      await lockEmployeeIdentity(
        savepoint,
        existingIdentity.employee_public_id,
      );
    }

    const [existingUser] = await savepoint
      .select({
        employee_id: employee.id,
        public_id: user.public_id,
        status: user.status,
        user_type: user.user_type,
      })
      .from(user)
      .leftJoin(employee, eq(employee.user_id, user.id))
      .where(eq(user.phone, input.phone))
      .limit(1);

    if (existingUser === undefined) {
      throw new Error("Locked employee import user could not be read.");
    }
    if (existingUser.status === "disabled") {
      return rejected("disabled_account");
    }
    if (
      existingUser.user_type === "employee" ||
      existingUser.employee_id !== null
    ) {
      return rejected("cross_organization_conflict");
    }

    const account = await bindEmployeeAccountWithDatabase(savepoint, {
      organizationPublicId: command.organization_public_id,
      userPublicId: existingUser.public_id,
    });

    return {
      credentialMode: "existing_account",
      credentialUpdatedAt: null,
      employeeId: account.employee.id,
      outcomeKind: "bound",
      status: "succeeded",
      warningReason:
        input.preparedCredential?.credentialMode === "provided"
          ? "initial_password_not_applied_to_existing_user"
          : null,
    };
  }

  if (input.preparedCredential === null) {
    throw new Error("Prepared credential is required for employee creation.");
  }

  const account = await createEmployeeAccountWithDatabase(savepoint, {
    name: input.name,
    organizationPublicId: command.organization_public_id,
    passwordHash: input.preparedCredential.passwordHash,
    phone: input.phone,
  });
  let credentialUpdatedAt: Date | null = null;

  if (input.preparedCredential.credentialMode === "generated") {
    const [credentialAccount] = await savepoint
      .select({ updated_at: authAccount.updated_at })
      .from(authAccount)
      .where(
        and(
          eq(authAccount.user_id, account.user.auth_user_id),
          eq(authAccount.provider_id, CREDENTIAL_PROVIDER_ID),
        ),
      )
      .limit(1);

    if (credentialAccount === undefined) {
      throw new Error("Created employee credential baseline is missing.");
    }
    credentialUpdatedAt = credentialAccount.updated_at;
  }

  return {
    credentialMode: input.preparedCredential.credentialMode,
    credentialUpdatedAt,
    employeeId: account.employee.id,
    outcomeKind: "created",
    status: "succeeded",
    warningReason: null,
  };
}

function rejected(
  rejectionReason: EmployeeImportRejectionReason,
): TerminalEmployeeImportRowOutcome {
  return { rejectionReason, status: "rejected" };
}

function mapDeterministicEmployeeMutationError(
  error: unknown,
): EmployeeImportRejectionReason | null {
  if (!(error instanceof EmployeeAccountMutationError)) {
    return null;
  }

  const reasonMap: Record<
    EmployeeAccountMutationFailureReason,
    EmployeeImportRejectionReason
  > = {
    account_conflict: "cross_organization_conflict",
    no_active_authorization: "current_authorization_insufficient",
    organization_not_found: "organization_not_found",
    quota_insufficient: "quota_insufficient",
  };

  return reasonMap[error.reason];
}

async function writeTerminalOutcome(
  database: EmployeeImportCommandDatabase,
  rowId: number,
  outcome: TerminalEmployeeImportRowOutcome,
): Promise<void> {
  const now = new Date();

  if (outcome.status === "rejected") {
    await database
      .update(employeeImportRow)
      .set({
        employee_import_row_status: "rejected",
        rejection_reason: outcome.rejectionReason,
        updated_at: now,
      })
      .where(eq(employeeImportRow.id, rowId));
    return;
  }

  await database
    .update(employeeImportRow)
    .set({
      credential_mode: outcome.credentialMode,
      credential_updated_at: outcome.credentialUpdatedAt,
      employee_id: outcome.employeeId,
      employee_import_row_status: "succeeded",
      outcome_kind: outcome.outcomeKind,
      updated_at: now,
      warning_reason: outcome.warningReason,
    })
    .where(eq(employeeImportRow.id, rowId));
}

async function insertRowAudit(
  database: EmployeeImportCommandDatabase,
  actor: EmployeeImportCommandActor,
  command: LockedCommandRow,
  row: LockedRow,
  outcome: TerminalEmployeeImportRowOutcome,
): Promise<void> {
  await insertCommandAudit(database, {
    actionType: "employee.import_command.row_processed",
    actor,
    commandPublicId: command.public_id,
    metadata: {
      outcome:
        outcome.status === "rejected"
          ? outcome.rejectionReason
          : outcome.outcomeKind,
      rowNumber: row.row_number,
      status: outcome.status,
    },
    resultStatus: outcome.status === "rejected" ? "rejected" : "success",
  });
}

async function finalizeCommandWhenNoPendingRows(
  database: EmployeeImportCommandDatabase,
  actor: EmployeeImportCommandActor,
  command: LockedCommandRow,
): Promise<void> {
  if (command.employee_import_status === "completed") {
    return;
  }

  const [pendingResult] = await database
    .select({ value: count() })
    .from(employeeImportRow)
    .where(
      and(
        eq(employeeImportRow.employee_import_command_id, command.id),
        eq(employeeImportRow.employee_import_row_status, "pending"),
      ),
    );

  if ((pendingResult?.value ?? 0) > 0) {
    return;
  }

  const [generatedResult] = await database
    .select({ value: count() })
    .from(employeeImportRow)
    .where(
      and(
        eq(employeeImportRow.employee_import_command_id, command.id),
        eq(employeeImportRow.employee_import_row_status, "succeeded"),
        eq(employeeImportRow.credential_mode, "generated"),
      ),
    );
  const credentialDistributionStatus =
    (generatedResult?.value ?? 0) > 0 ? "open" : "not_required";
  const completedAt = new Date();

  await database
    .update(employeeImportCommand)
    .set({
      completed_at: completedAt,
      credential_distribution_status: credentialDistributionStatus,
      employee_import_status: "completed",
      updated_at: completedAt,
    })
    .where(eq(employeeImportCommand.id, command.id));
  await insertCommandAudit(database, {
    actionType: "employee.import_command.completed",
    actor,
    commandPublicId: command.public_id,
    metadata: { credentialDistributionStatus },
    resultStatus: "success",
  });
}

async function insertCommandAudit(
  database: EmployeeImportCommandDatabase,
  input: {
    actionType: string;
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
    metadata: Record<string, unknown>;
    resultStatus: string;
  },
): Promise<void> {
  await database.insert(auditLog).values({
    action_type: input.actionType,
    actor_public_id: input.actor.publicId,
    actor_role: input.actor.role,
    metadata_summary: JSON.stringify(input.metadata),
    public_id: `audit-log-${randomUUID()}`,
    request_ip: input.actor.requestIp,
    result_status: input.resultStatus,
    target_public_id: input.commandPublicId,
    target_resource_type: "employee_import_command",
  });
}

async function readEmployeeImportCommandRecord(
  database: EmployeeImportCommandDatabase,
  commandId: number,
): Promise<EmployeeImportCommandRecord | null> {
  const [command] = await database
    .select({
      actor_admin_public_id: admin.public_id,
      command_kind: employeeImportCommand.command_kind,
      completed_at: employeeImportCommand.completed_at,
      created_at: employeeImportCommand.created_at,
      credential_distribution_status:
        employeeImportCommand.credential_distribution_status,
      credential_revision: employeeImportCommand.credential_revision,
      current_issue_public_id: employeeImportCommand.current_issue_public_id,
      distribution_confirmed_at:
        employeeImportCommand.distribution_confirmed_at,
      employee_import_status: employeeImportCommand.employee_import_status,
      organization_public_id: organization.public_id,
      public_id: employeeImportCommand.public_id,
      row_count: employeeImportCommand.row_count,
      updated_at: employeeImportCommand.updated_at,
    })
    .from(employeeImportCommand)
    .innerJoin(admin, eq(admin.id, employeeImportCommand.actor_admin_id))
    .innerJoin(
      organization,
      eq(organization.id, employeeImportCommand.organization_id),
    )
    .where(eq(employeeImportCommand.id, commandId))
    .limit(1);

  if (command === undefined) {
    return null;
  }

  const rows = await database
    .select({
      credential_mode: employeeImportRow.credential_mode,
      employee_id: employeeImportRow.employee_id,
      employee_import_row_status: employeeImportRow.employee_import_row_status,
      outcome_kind: employeeImportRow.outcome_kind,
      public_id: employeeImportRow.public_id,
      rejection_reason: employeeImportRow.rejection_reason,
      row_number: employeeImportRow.row_number,
      warning_reason: employeeImportRow.warning_reason,
    })
    .from(employeeImportRow)
    .where(eq(employeeImportRow.employee_import_command_id, commandId))
    .orderBy(asc(employeeImportRow.row_number));
  const employeeIds = rows.flatMap((row) =>
    row.employee_id === null ? [] : [row.employee_id],
  );
  const employeeRows =
    employeeIds.length === 0
      ? []
      : await database
          .select({ id: employee.id, public_id: employee.public_id })
          .from(employee)
          .where(inArray(employee.id, employeeIds));
  const employeePublicIdById = new Map(
    employeeRows.map((row) => [row.id, row.public_id]),
  );
  const counts = rows.reduce(
    (currentCounts, row) => ({
      ...currentCounts,
      [row.employee_import_row_status]:
        currentCounts[row.employee_import_row_status] + 1,
    }),
    { pending: 0, rejected: 0, succeeded: 0 },
  );

  return {
    actorAdminPublicId: command.actor_admin_public_id,
    commandKind: command.command_kind,
    completedAt: command.completed_at,
    counts,
    createdAt: command.created_at,
    credentialDistributionStatus: command.credential_distribution_status,
    credentialRevision: command.credential_revision,
    currentIssuePublicId: command.current_issue_public_id,
    distributionConfirmedAt: command.distribution_confirmed_at,
    organizationPublicId: command.organization_public_id,
    publicId: command.public_id,
    rowCount: command.row_count,
    rows: rows.map((row) => ({
      credentialMode: row.credential_mode,
      employeePublicId:
        row.employee_id === null
          ? null
          : (employeePublicIdById.get(row.employee_id) ?? null),
      outcomeKind: row.outcome_kind,
      publicId: row.public_id,
      rejectionReason: row.rejection_reason,
      rowNumber: row.row_number,
      status: row.employee_import_row_status,
      warningReason: row.warning_reason,
    })),
    status: command.employee_import_status,
    updatedAt: command.updated_at,
  };
}
