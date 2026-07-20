import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

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

describe("F-0015 lifecycle command atomicity", () => {
  it("rolls back account lifecycle writes when the transactional audit insert fails", async () => {
    const committedOperations: string[] = [];
    const database = {
      async transaction(
        run: (transaction: unknown) => Promise<unknown>,
      ): Promise<unknown> {
        const pendingOperations: string[] = [];
        const transaction = {
          async execute() {
            return [];
          },
          insert() {
            return {
              async values() {
                throw new Error("injected audit failure");
              },
            };
          },
          select() {
            return {
              from() {
                return {
                  leftJoin() {
                    return {
                      where() {
                        return {
                          async limit() {
                            return [
                              {
                                auth_user_id: null,
                                employee_id: null,
                                organization_id: null,
                                user_id: 41,
                                user_type: "personal",
                              },
                            ];
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          update() {
            return {
              set() {
                return {
                  async where() {
                    pendingOperations.push("update");
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

    await expect(
      setEmployeeAccountStatusWithQuota(database as never, {
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
