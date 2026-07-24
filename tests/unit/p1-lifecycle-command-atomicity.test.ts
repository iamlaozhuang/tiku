import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLog,
  employee,
  organizationTrainingAnswer,
  user,
} from "@/db/schema";
import { setEmployeeAccountStatusWithQuota } from "@/server/repositories/employee-org-auth-quota-repository";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function readBetween(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

type LifecycleIdentityRow = {
  auth_user_id: string | null;
  employee_id: number | null;
  employee_public_id: string | null;
  organization_id: number | null;
  organization_public_id: string | null;
  user_id: number;
  user_public_id: string;
  user_type: "employee" | "personal";
};

function createLifecycleDatabase(
  identityRows: LifecycleIdentityRow[],
  options: { failAuditInsert?: boolean } = {},
) {
  const attemptedOperations: string[] = [];
  const committedOperations: string[] = [];
  const readTargetLabel = (target: unknown): string => {
    if (target === auditLog) {
      return "audit_log";
    }

    if (target === employee) {
      return "employee";
    }

    if (target === organizationTrainingAnswer) {
      return "organization_training_answer";
    }

    if (target === user) {
      return "user";
    }

    return "other";
  };
  const database = {
    async transaction(
      run: (transaction: unknown) => Promise<unknown>,
    ): Promise<unknown> {
      const pendingOperations: string[] = [];
      type SelectionBuilder = {
        from(): SelectionBuilder;
        leftJoin(): SelectionBuilder;
        where(): SelectionBuilder;
        limit(): Promise<LifecycleIdentityRow[]>;
      };
      const selectionBuilder: SelectionBuilder = {
        from() {
          return selectionBuilder;
        },
        leftJoin() {
          return selectionBuilder;
        },
        where() {
          return selectionBuilder;
        },
        async limit() {
          return identityRows;
        },
      };
      const record = (operation: string): void => {
        attemptedOperations.push(operation);
        pendingOperations.push(operation);
      };
      const transaction = {
        async execute() {
          return [];
        },
        delete(target: unknown) {
          return {
            where() {
              record(`delete:${readTargetLabel(target)}`);
              return {
                async returning() {
                  return [];
                },
              };
            },
          };
        },
        insert(target: unknown) {
          return {
            async values() {
              if (target === auditLog && options.failAuditInsert === true) {
                throw new Error("injected audit failure");
              }

              record(`insert:${readTargetLabel(target)}`);
            },
          };
        },
        select() {
          return selectionBuilder;
        },
        update(target: unknown) {
          return {
            set() {
              return {
                async where() {
                  record(`update:${readTargetLabel(target)}`);
                },
              };
            },
          };
        },
      };

      const result = await run(transaction);
      committedOperations.push(...pendingOperations);
      return result;
    },
  };

  return { attemptedOperations, committedOperations, database };
}

describe("F-0015 lifecycle command atomicity", () => {
  it("rolls back account lifecycle writes when the transactional audit insert fails", async () => {
    const { committedOperations, database } = createLifecycleDatabase(
      [
        {
          auth_user_id: null,
          employee_id: null,
          employee_public_id: null,
          organization_id: null,
          organization_public_id: null,
          user_id: 41,
          user_public_id: "user-public-001",
          user_type: "personal",
        },
      ],
      { failAuditInsert: true },
    );

    await expect(
      setEmployeeAccountStatusWithQuota(database as never, {
        identityKind: "user",
        status: "disabled",
        successAudit: {
          actorPublicId: "admin-public-001",
          actorRole: "ops_admin",
          actionType: "user.disable",
          metadataSummary: "redacted user disable metadata",
          requestIp: null,
          targetPublicId: "user-public-001",
        },
        userPublicId: "user-public-001",
      }),
    ).rejects.toThrow("injected audit failure");
    expect(committedOperations).toEqual([]);
  });

  it("fails a missing authoritative employee organization before any mutation", async () => {
    const { attemptedOperations, committedOperations, database } =
      createLifecycleDatabase([
        {
          auth_user_id: "auth-user-employee-001",
          employee_id: 71,
          employee_public_id: "employee-public-001",
          organization_id: 81,
          organization_public_id: null,
          user_id: 61,
          user_public_id: "user-public-employee-001",
          user_type: "employee",
        },
      ]);

    await expect(
      setEmployeeAccountStatusWithQuota(database as never, {
        employeePublicId: "employee-public-001",
        identityKind: "employee",
        operator: {
          publicId: "admin-public-001",
          requestIp: null,
          role: "ops_admin",
        },
        status: "disabled",
      }),
    ).resolves.toBeNull();
    expect(attemptedOperations).toEqual([]);
    expect(committedOperations).toEqual([]);
  });

  it("rolls back the employee lifecycle when its final success audit fails", async () => {
    const { attemptedOperations, committedOperations, database } =
      createLifecycleDatabase(
        [
          {
            auth_user_id: "auth-user-employee-001",
            employee_id: 71,
            employee_public_id: "employee-public-001",
            organization_id: 81,
            organization_public_id: "organization-public-001",
            user_id: 61,
            user_public_id: "user-public-employee-001",
            user_type: "employee",
          },
        ],
        { failAuditInsert: true },
      );

    await expect(
      setEmployeeAccountStatusWithQuota(database as never, {
        employeePublicId: "employee-public-001",
        identityKind: "employee",
        operator: {
          publicId: "admin-public-001",
          requestIp: null,
          role: "ops_admin",
        },
        status: "disabled",
      }),
    ).rejects.toThrow("injected audit failure");
    expect(attemptedOperations).toContain("update:employee");
    expect(attemptedOperations).toContain(
      "update:organization_training_answer",
    );
    expect(committedOperations).toEqual([]);
  });

  it("keeps the generic user command from mutating employee identity rows", async () => {
    const { committedOperations, database } = createLifecycleDatabase([
      {
        auth_user_id: "auth-user-employee-001",
        employee_id: 71,
        employee_public_id: "employee-public-001",
        organization_id: 81,
        organization_public_id: "organization-public-001",
        user_id: 61,
        user_public_id: "user-public-employee-001",
        user_type: "employee",
      },
    ]);

    await expect(
      setEmployeeAccountStatusWithQuota(database as never, {
        identityKind: "user",
        status: "disabled",
        successAudit: {
          actorPublicId: "admin-public-001",
          actorRole: "ops_admin",
          actionType: "user.disable",
          metadataSummary: "redacted user disable metadata",
          requestIp: null,
          targetPublicId: "user-public-employee-001",
        },
        userPublicId: "user-public-employee-001",
      }),
    ).resolves.toBe("updated_with_audit");
    expect(committedOperations).toContain("update:user");
    expect(committedOperations).not.toContain("update:employee");
  });

  it("keeps account disable, access termination, training blocking and success audit in one transaction", () => {
    const adminRepository = readSource(
      "src/server/repositories/admin-flow-runtime-repository.ts",
    );
    const quotaRepository = readSource(
      "src/server/repositories/employee-org-auth-quota-repository.ts",
    );
    const disableCommand = readBetween(
      quotaRepository,
      "export async function setEmployeeAccountStatusWithQuota",
      "export { lockEmployeeIdentity",
    );

    expect(adminRepository).toContain("async disableUser(publicId, operator)");
    expect(adminRepository).toContain("actorPublicId: operator.publicId");
    expect(disableCommand).toContain("database.transaction");
    expect(disableCommand).toContain("organizationTrainingAnswer");
    expect(disableCommand).toContain(
      'organization_training_answer_status: "read_only"',
    );
    expect(disableCommand).toContain("auditLog");
    expect(disableCommand.indexOf("auditLog")).toBeGreaterThan(
      disableCommand.indexOf("organizationTrainingAnswer"),
    );
    expect(adminRepository).toContain("redacted user disable metadata");
  });

  it("keeps organization disable, affected flow termination, training blocking and success audit in one transaction", () => {
    const repository = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const disableCommand = readBetween(
      repository,
      "async disableOrganization(input, operator)",
      "async enableOrganization(input)",
    );

    expect(disableCommand).toContain("database.transaction");
    expect(disableCommand).toContain("terminateOrganizationActiveFlows");
    expect(disableCommand).toContain("blockOrganizationTrainingAnswers");
    expect(disableCommand).toContain("appendTransactionalLifecycleAuditLog");
    expect(
      disableCommand.indexOf("appendTransactionalLifecycleAuditLog"),
    ).toBeGreaterThan(
      disableCommand.indexOf("blockOrganizationTrainingAnswers"),
    );
    expect(disableCommand).toContain("redacted organization disable metadata");
  });

  it("cancels org_auth, terminates only its lineage and writes success audit in one transaction", () => {
    const repository = readSource(
      "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
    );
    const cancelCommand = readBetween(
      repository,
      "async cancelOrgAuth(publicId, operator)",
      "async upgradeOrgAuth(input)",
    );
    const terminationCommand = readBetween(
      repository,
      "async function terminateOrgAuthActiveFlowsInTransaction",
      "function mapOrgAuthMutationRowToDto",
    );

    expect(cancelCommand).toContain("database.transaction");
    expect(cancelCommand).toContain("terminateOrgAuthActiveFlowsInTransaction");
    expect(terminationCommand).toContain(
      "organizationTrainingVersion.org_auth_id",
    );
    expect(terminationCommand).toContain("organizationTrainingAnswer");
    expect(cancelCommand).toContain("appendTransactionalOrgAuthAuditLog");
    expect(
      cancelCommand.indexOf("appendTransactionalOrgAuthAuditLog"),
    ).toBeGreaterThan(
      cancelCommand.indexOf("terminateOrgAuthActiveFlowsInTransaction"),
    );
    expect(cancelCommand).toContain("redacted org_auth cancel metadata");
    expect(repository).not.toContain("async terminateOrgAuthActiveFlows(");
  });

  it("does not sequence successful lifecycle side effects after repository commit", () => {
    const adminService = readSource(
      "src/server/services/admin-flow-runtime.ts",
    );
    const organizationService = readSource(
      "src/server/services/admin-organization-org-auth-runtime.ts",
    );
    const userDisableRoute = readBetween(
      adminService,
      "users: {",
      "questions: {",
    );
    const organizationDisableRoute = readBetween(
      organizationService,
      "organizations: {",
      "orgAuths: {",
    );
    const orgAuthCancelRoute = readBetween(
      organizationService,
      "cancel: {",
      "employees: {",
    );

    expect(adminService).toContain('mutationResult !== "updated_with_audit"');
    expect(userDisableRoute).toContain(
      "repositories.userOrgAuthRepository.disableUser",
    );
    expect(organizationDisableRoute).toContain(
      "organizationMutationRepositories.disableOrganization",
    );
    expect(organizationDisableRoute).toContain("role: actorOrError.roles[0]");
    expect(orgAuthCancelRoute).toContain("repositories.cancelOrgAuth(");
    expect(orgAuthCancelRoute).toContain("role: actorOrError.roles[0]");
    expect(orgAuthCancelRoute).not.toContain("terminateOrgAuthActiveFlows");
    expect(orgAuthCancelRoute).toContain(
      "!commandResult.successAuditPersisted",
    );
  });

  it("keeps the atomic audit metadata redacted and excludes credential material", () => {
    const sources = [
      readSource("src/server/repositories/admin-flow-runtime-repository.ts"),
      readSource(
        "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
      ),
      readSource(
        "src/server/repositories/employee-org-auth-quota-repository.ts",
      ),
    ].join("\n");

    expect(sources).toContain("redacted user disable metadata");
    expect(sources).toContain("redacted organization disable metadata");
    expect(sources).toContain("redacted org_auth cancel metadata");
    expect(sources).not.toMatch(
      /user disable metadata[^\n]*(?:password|token|authorization header)/iu,
    );
  });
});
