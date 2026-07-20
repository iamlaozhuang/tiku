import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type {
  DisableOrganizationResultDto,
  OrganizationDto,
} from "@/server/contracts/organization-auth-contract";
import type { SessionService } from "@/server/services/session-service";

type OrganizationMutationRepositories =
  AdminOrganizationOrgAuthRuntimeRepositories & {
    disableOrganization?(
      input: {
        expectedRevision: number;
        publicId: string;
        isCascade: boolean;
      },
      operator: {
        publicId: string;
        requestIp: string | null;
        role: string;
      },
    ): Promise<
      | DisableOrganizationResultDto
      | { data: DisableOrganizationResultDto; successAuditPersisted: true }
      | null
    >;
  };

function createAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession(input) {
      expect(input.authorization).toBe("Bearer admin-session-value");

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-31T18:00:00.000Z" },
          user: {
            publicId: "admin-user-public-001",
            phone: "13900000001",
            name: "Admin User",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["ops_admin"],
          },
        },
      };
    },
  };
}

function createOrganization(overrides: Partial<OrganizationDto> = {}) {
  return {
    publicId: "organization-public-001",
    name: "Organization",
    orgTier: "city" as const,
    parentOrganizationPublicId: null,
    status: "active" as const,
    contactName: null,
    contactPhone: null,
    remark: null,
    revision: 1,
    createdAt: "2026-05-31T09:00:00.000Z",
    updatedAt: "2026-05-31T09:00:00.000Z",
    ...overrides,
  };
}

function createRepositories(input: {
  auditInputs: unknown[];
  mutationInputs: unknown[];
}): OrganizationMutationRepositories {
  return {
    async listOrganizations(query) {
      return {
        organizations: [],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 0,
        },
      };
    },
    async listOrgAuths(query) {
      return {
        orgAuths: [],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 0,
        },
      };
    },
    async listEmployees(query) {
      return {
        employees: [],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 0,
        },
      };
    },
    async disableOrganization(disableInput, operator) {
      input.mutationInputs.push({ ...disableInput, operator });

      return {
        data: {
          activeFlowTermination: {
            mockExamCount: 1,
            practiceCount: 2,
          },
          affectedOrganizationPublicIds: [
            disableInput.publicId,
            "organization-public-child",
          ],
          organization: createOrganization({
            publicId: disableInput.publicId,
            status: "disabled",
          }),
        },
        successAuditPersisted: true,
      };
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
    },
  };
}

describe("phase 20 RA-01-10 organization disable termination", () => {
  it("returns active flow termination counts and redacted audit metadata", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.organizations.disable.POST(
      new Request(
        "http://localhost/api/v1/organizations/organization-public-001/disable",
        {
          body: JSON.stringify({ expectedRevision: 1, isCascade: true }),
          headers: { authorization: "Bearer admin-session-value" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: "organization-public-001" }) },
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        activeFlowTermination: {
          mockExamCount: 1,
          practiceCount: 2,
        },
        affectedOrganizationPublicIds: [
          "organization-public-001",
          "organization-public-child",
        ],
        organization: {
          publicId: "organization-public-001",
          status: "disabled",
        },
      },
      message: "ok",
    });
    expect(mutationInputs).toEqual([
      {
        expectedRevision: 1,
        isCascade: true,
        operator: {
          publicId: "admin-public-001",
          requestIp: null,
          role: "ops_admin",
        },
        publicId: "organization-public-001",
      },
    ]);
    expect(auditInputs).toEqual([]);
    expect(JSON.stringify({ auditInputs, payload })).not.toContain(
      "admin-session-value",
    );
    expect(JSON.stringify({ auditInputs, payload })).not.toContain('"id"');
  });

  it("keeps repository termination scoped to affected organization employees and active flows", () => {
    const repositorySource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/admin-organization-org-auth-runtime-repository.ts",
      ),
      "utf8",
    );

    expect(repositorySource).toContain("terminateOrganizationActiveFlows");
    expect(repositorySource).toContain(
      "inArray(employee.organization_id, organizationIds)",
    );
    expect(repositorySource).toContain(
      'eq(practice.practice_status, "in_progress")',
    );
    expect(repositorySource).toContain("inArray(mockExam.exam_status");
    expect(repositorySource).toContain('"scoring_partial_failed"');
  });
});
