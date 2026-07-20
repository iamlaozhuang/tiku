import { randomUUID } from "node:crypto";

import { and, asc, count, eq, gt, inArray, notInArray, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as databaseSchema from "@/db/schema";
import {
  createOrgAuthCoversOrganizationCondition,
  lockOrganizationScopeMutation,
  type OrganizationScopeDatabase,
} from "./organization-scope-query";

const {
  auditLog,
  authSession,
  employee,
  employeeOrgAuth,
  mockExam,
  orgAuth,
  organizationTrainingAnswer,
  practice,
  user,
} = databaseSchema;

export type EmployeeOrgAuthQuotaDatabase = PostgresJsDatabase<
  typeof databaseSchema
>;

export type EmployeeOrgAuthQuotaReservationResult =
  | "no_active_authorization"
  | "quota_insufficient"
  | "reserved";

export type EmployeeAccountStatusWithQuotaResult =
  | "not_found"
  | "quota_insufficient"
  | "updated"
  | "updated_with_audit";

export type EmployeeAccountLifecycleSuccessAudit = {
  actorPublicId: string;
  actorRole: string;
  actionType: "user.disable";
  metadataSummary: string;
  requestIp: string | null;
  targetPublicId: string;
};

async function lockEmployeeIdentity(
  database: EmployeeOrgAuthQuotaDatabase,
  employeeIdentity: string,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(200112, hashtext(${employeeIdentity})) as employee_identity_lock`,
  );
}

async function lockOrgAuthQuotaIds(
  database: EmployeeOrgAuthQuotaDatabase,
  orgAuthIds: number[],
): Promise<void> {
  for (const orgAuthId of [...new Set(orgAuthIds)].sort(
    (left, right) => left - right,
  )) {
    await database.execute(
      sql`select pg_advisory_xact_lock(200111, hashtext(${`org-auth:${orgAuthId}`})) as org_auth_quota_lock`,
    );
  }
}

async function listCoveringOrgAuthQuotaRows(
  database: EmployeeOrgAuthQuotaDatabase,
  organizationId: number,
  now: Date,
) {
  return database
    .select({
      account_quota: orgAuth.account_quota,
      id: orgAuth.id,
      purchaser_organization_id: orgAuth.purchaser_organization_id,
      starts_at: orgAuth.starts_at,
    })
    .from(orgAuth)
    .where(
      and(
        eq(orgAuth.status, "active"),
        gt(orgAuth.expires_at, now),
        createOrgAuthCoversOrganizationCondition({
          authScopeType: orgAuth.auth_scope_type,
          orgAuthId: orgAuth.id,
          organizationId,
          purchaserOrganizationId: orgAuth.purchaser_organization_id,
        }),
      ),
    )
    .orderBy(asc(orgAuth.id));
}

async function refreshOrgAuthUsedQuota(
  database: EmployeeOrgAuthQuotaDatabase,
  orgAuthIds: number[],
): Promise<void> {
  for (const orgAuthId of [...new Set(orgAuthIds)]) {
    const [row] = await database
      .select({ value: count() })
      .from(employeeOrgAuth)
      .where(eq(employeeOrgAuth.org_auth_id, orgAuthId));

    await database
      .update(orgAuth)
      .set({
        updated_at: new Date(),
        used_quota: row?.value ?? 0,
      })
      .where(eq(orgAuth.id, orgAuthId));
  }
}

export async function reserveEmployeeOrgAuthQuota(
  database: EmployeeOrgAuthQuotaDatabase,
  input: {
    employeeId: number;
    organizationId: number;
    requireCurrentAuthorization?: boolean;
  },
): Promise<EmployeeOrgAuthQuotaReservationResult> {
  const now = new Date();
  const orgAuthRows = await listCoveringOrgAuthQuotaRows(
    database,
    input.organizationId,
    now,
  );

  if (
    input.requireCurrentAuthorization === true &&
    !orgAuthRows.some((row) => row.starts_at <= now)
  ) {
    return "no_active_authorization";
  }

  await lockOrgAuthQuotaIds(
    database,
    orgAuthRows.map((row) => row.id),
  );

  const existingReservations =
    orgAuthRows.length === 0
      ? []
      : await database
          .select({ org_auth_id: employeeOrgAuth.org_auth_id })
          .from(employeeOrgAuth)
          .where(
            and(
              eq(employeeOrgAuth.employee_id, input.employeeId),
              inArray(
                employeeOrgAuth.org_auth_id,
                orgAuthRows.map((row) => row.id),
              ),
            ),
          );
  const existingOrgAuthIds = new Set(
    existingReservations.map((row) => row.org_auth_id),
  );

  for (const orgAuthRow of orgAuthRows) {
    if (existingOrgAuthIds.has(orgAuthRow.id)) {
      continue;
    }

    const [reservationCount] = await database
      .select({ value: count() })
      .from(employeeOrgAuth)
      .where(eq(employeeOrgAuth.org_auth_id, orgAuthRow.id));

    if ((reservationCount?.value ?? 0) >= orgAuthRow.account_quota) {
      return "quota_insufficient";
    }
  }

  const reservationsToCreate = orgAuthRows
    .filter((row) => !existingOrgAuthIds.has(row.id))
    .map((row) => ({
      employee_id: input.employeeId,
      org_auth_id: row.id,
    }));

  if (reservationsToCreate.length > 0) {
    await database
      .insert(employeeOrgAuth)
      .values(reservationsToCreate)
      .onConflictDoNothing();
  }

  await refreshOrgAuthUsedQuota(
    database,
    orgAuthRows.map((row) => row.id),
  );

  return "reserved";
}

export async function releaseEmployeeOrgAuthQuota(
  database: EmployeeOrgAuthQuotaDatabase,
  employeeId: number,
): Promise<void> {
  const rows = await database
    .delete(employeeOrgAuth)
    .where(eq(employeeOrgAuth.employee_id, employeeId))
    .returning({ org_auth_id: employeeOrgAuth.org_auth_id });

  await refreshOrgAuthUsedQuota(
    database,
    rows.map((row) => row.org_auth_id),
  );
}

export async function reconcileCurrentAndDescendantQuotaReservations(
  database: EmployeeOrgAuthQuotaDatabase,
): Promise<boolean> {
  const now = new Date();
  const orgAuthRows = await database
    .select({
      account_quota: orgAuth.account_quota,
      id: orgAuth.id,
      purchaser_organization_id: orgAuth.purchaser_organization_id,
    })
    .from(orgAuth)
    .where(
      and(
        eq(orgAuth.auth_scope_type, "current_and_descendants"),
        eq(orgAuth.status, "active"),
        gt(orgAuth.expires_at, now),
      ),
    )
    .orderBy(asc(orgAuth.id));

  await lockOrgAuthQuotaIds(
    database,
    orgAuthRows.map((row) => row.id),
  );

  for (const orgAuthRow of orgAuthRows) {
    const employeeRows = await database
      .select({ id: employee.id })
      .from(employee)
      .innerJoin(user, eq(user.id, employee.user_id))
      .where(
        and(
          eq(user.user_type, "employee"),
          eq(user.status, "active"),
          createOrgAuthCoversOrganizationCondition({
            authScopeType: "current_and_descendants",
            orgAuthId: orgAuthRow.id,
            organizationId: employee.organization_id,
            purchaserOrganizationId: orgAuthRow.purchaser_organization_id,
          }),
        ),
      );
    const employeeIds = employeeRows.map((row) => row.id);

    if (employeeIds.length > orgAuthRow.account_quota) {
      return false;
    }

    await database
      .delete(employeeOrgAuth)
      .where(
        employeeIds.length === 0
          ? eq(employeeOrgAuth.org_auth_id, orgAuthRow.id)
          : and(
              eq(employeeOrgAuth.org_auth_id, orgAuthRow.id),
              notInArray(employeeOrgAuth.employee_id, employeeIds),
            ),
      );

    if (employeeIds.length > 0) {
      await database
        .insert(employeeOrgAuth)
        .values(
          employeeIds.map((employeeId) => ({
            employee_id: employeeId,
            org_auth_id: orgAuthRow.id,
          })),
        )
        .onConflictDoNothing();
    }
  }

  await refreshOrgAuthUsedQuota(
    database,
    orgAuthRows.map((row) => row.id),
  );

  return true;
}

export async function setEmployeeAccountStatusWithQuota(
  database: EmployeeOrgAuthQuotaDatabase,
  input: {
    successAudit?: EmployeeAccountLifecycleSuccessAudit;
    status: "active" | "disabled";
    userPublicId: string;
  },
): Promise<EmployeeAccountStatusWithQuotaResult> {
  return database.transaction(async (transaction) => {
    const transactionalDatabase = transaction as EmployeeOrgAuthQuotaDatabase &
      OrganizationScopeDatabase;

    await lockOrganizationScopeMutation(transactionalDatabase);
    await lockEmployeeIdentity(transactionalDatabase, input.userPublicId);

    const [row] = await transactionalDatabase
      .select({
        auth_user_id: user.auth_user_id,
        employee_id: employee.id,
        organization_id: employee.organization_id,
        user_id: user.id,
        user_type: user.user_type,
      })
      .from(user)
      .leftJoin(employee, eq(employee.user_id, user.id))
      .where(eq(user.public_id, input.userPublicId))
      .limit(1);

    if (row === undefined) {
      return "not_found";
    }

    if (
      row.user_type === "employee" &&
      row.employee_id !== null &&
      row.organization_id !== null
    ) {
      if (input.status === "active") {
        const reservationResult = await reserveEmployeeOrgAuthQuota(
          transactionalDatabase,
          {
            employeeId: row.employee_id,
            organizationId: row.organization_id,
          },
        );

        if (reservationResult === "quota_insufficient") {
          return "quota_insufficient";
        }
      } else {
        await releaseEmployeeOrgAuthQuota(
          transactionalDatabase,
          row.employee_id,
        );
      }
    }

    const lifecycleChangedAt = new Date();

    await transactionalDatabase
      .update(user)
      .set({
        disabled_at: input.status === "disabled" ? lifecycleChangedAt : null,
        locked_until_at: input.status === "active" ? null : undefined,
        status: input.status,
        updated_at: lifecycleChangedAt,
      })
      .where(eq(user.id, row.user_id));

    if (input.status === "disabled") {
      if (row.auth_user_id !== null) {
        await transactionalDatabase
          .delete(authSession)
          .where(eq(authSession.user_id, row.auth_user_id));
      }

      await transactionalDatabase
        .update(practice)
        .set({
          practice_status: "terminated",
          terminated_at: lifecycleChangedAt,
          termination_reason: "account_disabled",
          updated_at: lifecycleChangedAt,
        })
        .where(
          and(
            eq(practice.user_id, row.user_id),
            eq(practice.practice_status, "in_progress"),
          ),
        );
      await transactionalDatabase
        .update(mockExam)
        .set({
          exam_status: "terminated",
          terminated_at: lifecycleChangedAt,
          termination_reason: "account_disabled",
          updated_at: lifecycleChangedAt,
        })
        .where(
          and(
            eq(mockExam.user_id, row.user_id),
            inArray(mockExam.exam_status, [
              "in_progress",
              "scoring",
              "scoring_partial_failed",
            ]),
          ),
        );

      if (row.employee_id !== null && row.organization_id !== null) {
        await transactionalDatabase
          .update(organizationTrainingAnswer)
          .set({
            organization_training_answer_status: "read_only",
            updated_at: lifecycleChangedAt,
          })
          .where(
            and(
              eq(organizationTrainingAnswer.employee_id, row.employee_id),
              eq(
                organizationTrainingAnswer.organization_id,
                row.organization_id,
              ),
              eq(
                organizationTrainingAnswer.organization_training_answer_status,
                "in_progress",
              ),
            ),
          );
      }
    }

    if (input.successAudit !== undefined) {
      await transactionalDatabase.insert(auditLog).values({
        public_id: `audit-log-${randomUUID()}`,
        actor_public_id: input.successAudit.actorPublicId,
        actor_role: input.successAudit.actorRole,
        action_type: input.successAudit.actionType,
        target_resource_type: "user",
        target_public_id: input.successAudit.targetPublicId,
        result_status: "success",
        metadata_summary: input.successAudit.metadataSummary,
        request_ip: input.successAudit.requestIp,
      });
    }

    return input.successAudit === undefined ? "updated" : "updated_with_audit";
  });
}

export { lockEmployeeIdentity, lockOrgAuthQuotaIds, refreshOrgAuthUsedQuota };
