import { describe, expect, it } from "vitest";

import type { EmployeeImportCommandService } from "@/server/services/employee-import-command-service";
import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { SessionService } from "@/server/services/session-service";

function createAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
        return { code: 401001, message: "Unauthorized.", data: null };
      }
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-17T20:00:00.000Z" },
          user: {
            adminPublicId: "admin-public-001",
            adminRoles: ["ops_admin"],
            employeePublicId: null,
            lockedUntilAt: null,
            name: "Ops Admin",
            organizationPublicId: null,
            phone: "13900000001",
            publicId: "admin-user-public-001",
            status: "active",
            userType: null,
          },
        },
      };
    },
  };
}

function createRepositories(
  auditInputs: unknown[],
): AdminOrganizationOrgAuthRuntimeRepositories {
  return {
    async listEmployees(query) {
      return { employees: [], pagination: { ...query, total: 0 } };
    },
    async listOrganizations(query) {
      return { organizations: [], pagination: { ...query, total: 0 } };
    },
    async listOrgAuths(query) {
      return { orgAuths: [], pagination: { ...query, total: 0 } };
    },
    auditLogRepository: {
      async appendAuditLog(input) {
        auditInputs.push(input);
      },
    },
  };
}

describe("phase 20 RA-01-03 employee account runtime", () => {
  it("adapts legacy employee create to a single command without route-level secret audit", async () => {
    const auditInputs: unknown[] = [];
    const commandInputs: unknown[] = [];
    const commandService = {
      async submit(input) {
        commandInputs.push(input);
        return {
          httpStatus: 200,
          response: {
            code: 0,
            message: "ok",
            data: {
              commandKind: "single_create",
              completedAt: "2026-07-17T12:01:00.000Z",
              counts: { pending: 0, rejected: 0, succeeded: 1 },
              createdAt: "2026-07-17T12:00:00.000Z",
              credentialDistributionStatus: "not_required",
              credentialRevision: 0,
              currentIssuePublicId: null,
              distributionConfirmedAt: null,
              organizationPublicId: "organization-public-001",
              publicId: "employee-import-command-public-001",
              rowCount: 1,
              rows: [],
              status: "completed",
              updatedAt: "2026-07-17T12:01:00.000Z",
            },
          },
        } as const;
      },
      async get() {
        throw new Error("Unexpected get.");
      },
      async issueCredentials() {
        throw new Error("Unexpected issue.");
      },
      async confirmDistribution() {
        throw new Error("Unexpected confirm.");
      },
    } satisfies EmployeeImportCommandService;
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      employeeImportCommandService: commandService,
      repositories: createRepositories(auditInputs),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.employees.collection.POST(
      new Request("http://localhost/api/v1/employees", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "idempotency-key": "123e4567-e89b-42d3-a456-426614174000",
          "x-forwarded-for": "203.0.113.60, 10.0.0.1",
        },
        body: JSON.stringify({
          expectedPreviewRevision: "a".repeat(64),
          initialPassword: "RequestSecret1",
          name: "Employee One",
          organizationPublicId: "organization-public-001",
          phone: "13900000002",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const responsePayload = await response.json();
    expect(responsePayload).toMatchObject({
      code: 0,
      data: {
        commandKind: "single_create",
        publicId: "employee-import-command-public-001",
      },
    });
    expect(commandInputs).toEqual([
      {
        actor: {
          publicId: "admin-public-001",
          requestIp: "203.0.113.60",
          role: "ops_admin",
        },
        body: {
          commandKind: "single_create",
          expectedPreviewRevision: "a".repeat(64),
          initialPassword: "RequestSecret1",
          name: "Employee One",
          organizationPublicId: "organization-public-001",
          phone: "13900000002",
        },
        idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
      },
    ]);
    expect(auditInputs).toEqual([]);
    expect(JSON.stringify(responsePayload)).not.toContain("RequestSecret1");
  });
});
