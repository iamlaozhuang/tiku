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

function createCommandService(
  commandInputs: unknown[],
): EmployeeImportCommandService {
  return {
    async submit(input) {
      commandInputs.push(input);
      return {
        httpStatus: 200,
        response: {
          code: 0,
          message: "ok",
          data: {
            commandKind: "batch_import",
            completedAt: "2026-07-17T12:01:00.000Z",
            counts: { pending: 0, rejected: 0, succeeded: 2 },
            createdAt: "2026-07-17T12:00:00.000Z",
            credentialDistributionStatus: "not_required",
            credentialRevision: 0,
            currentIssuePublicId: null,
            distributionConfirmedAt: null,
            organizationPublicId: "organization-public-001",
            publicId: "employee-import-command-public-001",
            rowCount: 2,
            rows: [],
            status: "completed",
            updatedAt: "2026-07-17T12:01:00.000Z",
          },
        },
      };
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
  };
}

function createHandlers(input: {
  auditInputs: unknown[];
  commandInputs: unknown[];
}) {
  return createAdminOrganizationOrgAuthRuntimeRouteHandlers({
    employeeImportCommandService: createCommandService(input.commandInputs),
    repositories: createRepositories(input.auditInputs),
    sessionService: createAdminSessionService(),
  });
}

describe("phase 20 RA-01-04 employee import", () => {
  it("maps ordered CSV rows to one batch command and leaves command audit ownership to the repository", async () => {
    const auditInputs: unknown[] = [];
    const commandInputs: unknown[] = [];
    const handlers = createHandlers({ auditInputs, commandInputs });
    const response = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "idempotency-key": "123e4567-e89b-42d3-a456-426614174000",
        },
        body: JSON.stringify({
          content: [
            "phone,name,initialPassword",
            "13900001001,Employee One,abc12345",
            "13900001002,Employee Two,def67890",
          ].join("\n"),
          sourceFormat: "csv",
          targetOrganizationPublicId: "organization-public-001",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        commandKind: "batch_import",
        publicId: "employee-import-command-public-001",
      },
    });
    expect(commandInputs).toEqual([
      expect.objectContaining({
        body: {
          commandKind: "batch_import",
          organizationPublicId: "organization-public-001",
          rows: [
            {
              initialPassword: "abc12345",
              name: "Employee One",
              phone: "13900001001",
            },
            {
              initialPassword: "def67890",
              name: "Employee Two",
              phone: "13900001002",
            },
          ],
        },
        idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
      }),
    ]);
    expect(auditInputs).toEqual([]);
  });

  it("preserves duplicate and invalid raw rows for command-level classification", async () => {
    const auditInputs: unknown[] = [];
    const commandInputs: unknown[] = [];
    const handlers = createHandlers({ auditInputs, commandInputs });
    await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "idempotency-key": "123e4567-e89b-42d3-a456-426614174000",
        },
        body: JSON.stringify({
          content: [
            "phone,name,initialPassword",
            "13900001001,Employee One,abc12345",
            "13900001001,Employee Duplicate,abc12345",
            "not-phone,Employee Invalid,abc12345",
          ].join("\n"),
          sourceFormat: "csv",
          targetOrganizationPublicId: "organization-public-001",
        }),
      }),
    );

    expect(commandInputs).toEqual([
      expect.objectContaining({
        body: expect.objectContaining({
          rows: [
            expect.objectContaining({ phone: "13900001001" }),
            expect.objectContaining({ phone: "13900001001" }),
            expect.objectContaining({ phone: "not-phone" }),
          ],
        }),
      }),
    ]);
    expect(auditInputs).toEqual([]);
  });

  it.each([
    {
      content: [
        "phone,name,initialPassword,organizationPublicId,profession",
        "13900001001,Employee One,abc12345,organization-public-001,monopoly",
      ].join("\n"),
      label: "forbidden authorization scope headers",
    },
    {
      content: [
        "phone,name,initialPassword",
        ...Array.from(
          { length: 501 },
          (_, index) =>
            `1390000${String(index + 1).padStart(4, "0")},Employee,abc12345`,
        ),
      ].join("\n"),
      label: "more than 500 rows",
    },
  ])("rejects $label before command submission", async ({ content }) => {
    const auditInputs: unknown[] = [];
    const commandInputs: unknown[] = [];
    const handlers = createHandlers({ auditInputs, commandInputs });
    const response = await handlers.employees.importBatch.POST(
      new Request("http://localhost/api/v1/employees/import", {
        method: "POST",
        headers: {
          authorization: "Bearer admin-session-token",
          "idempotency-key": "123e4567-e89b-42d3-a456-426614174000",
        },
        body: JSON.stringify({
          content,
          sourceFormat: "csv",
          targetOrganizationPublicId: "organization-public-001",
        }),
      }),
    );

    expect(response.status).toBe(422);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(commandInputs).toEqual([]);
    expect(auditInputs).toEqual([]);
  });
});
