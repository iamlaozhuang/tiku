import { describe, expect, it } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type {
  DisableOrganizationResultDto,
  OrganizationDto,
} from "@/server/contracts/organization-auth-contract";
import { createPostgresAdminOrganizationOrgAuthRuntimeRepositories } from "@/server/repositories/admin-organization-org-auth-runtime-repository";
import type { SessionService } from "@/server/services/session-service";

type OrganizationMutationRepositories =
  AdminOrganizationOrgAuthRuntimeRepositories & {
    createOrganization?(input: unknown): Promise<OrganizationDto | null>;
    updateOrganization?(
      publicId: string,
      input: unknown,
    ): Promise<OrganizationDto | null>;
    disableOrganization?(input: {
      publicId: string;
      isCascade: boolean;
    }): Promise<DisableOrganizationResultDto | null>;
  };

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-value") {
        return {
          code: 401001,
          message: "Unauthorized.",
          data: null,
        };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-05-24T18:00:00.000Z" },
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
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createOrganization(
  overrides: Partial<OrganizationDto> = {},
): OrganizationDto {
  return {
    publicId: "organization-public-001",
    name: "杭州烟草",
    orgTier: "city",
    parentOrganizationPublicId: "organization-public-000",
    status: "active",
    contactName: null,
    contactPhone: null,
    remark: null,
    createdAt: "2026-05-24T07:00:00.000Z",
    updatedAt: "2026-05-24T07:00:00.000Z",
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
    async createOrganization(organizationInput) {
      input.mutationInputs.push({
        action: "createOrganization",
        organizationInput,
      });

      return createOrganization();
    },
    async updateOrganization(publicId, organizationInput) {
      input.mutationInputs.push({
        action: "updateOrganization",
        organizationInput,
        publicId,
      });

      return createOrganization({
        publicId,
        name: "杭州烟草更新",
        status: "active",
      });
    },
    async disableOrganization(disableInput) {
      input.mutationInputs.push({
        action: "disableOrganization",
        disableInput,
      });

      return {
        organization: createOrganization({
          publicId: disableInput.publicId,
          status: "disabled",
        }),
        affectedOrganizationPublicIds: disableInput.isCascade
          ? [disableInput.publicId, "organization-public-child"]
          : [disableInput.publicId],
      };
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
    },
  };
}

describe("phase 11 system ops organization management loop", () => {
  it("exposes default local organization mutation repository hooks", () => {
    const repositories =
      createPostgresAdminOrganizationOrgAuthRuntimeRepositories({
        createDatabase() {
          throw new Error("database should not be opened for hook inventory");
        },
      }) as OrganizationMutationRepositories;

    expect(repositories.createOrganization).toEqual(expect.any(Function));
    expect(repositories.updateOrganization).toEqual(expect.any(Function));
    expect(repositories.disableOrganization).toEqual(expect.any(Function));
  });

  it("creates and updates organizations with publicId-only responses and redacted audit metadata", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    });
    const headers = {
      authorization: "Bearer admin-session-value",
      "x-forwarded-for": "203.0.113.40, 10.0.0.1",
    };

    const createResponse = await handlers.organizations.collection.POST(
      new Request("http://localhost/api/v1/organizations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "杭州烟草",
          orgTier: "city",
          parentOrganizationPublicId: "organization-public-000",
        }),
      }),
    );
    const updateResponse = await handlers.organizations.item.PATCH(
      new Request(
        "http://localhost/api/v1/organizations/organization-public-001",
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            name: "杭州烟草更新",
            orgTier: "city",
            parentOrganizationPublicId: "organization-public-000",
            status: "active",
          }),
        },
      ),
      { params: Promise.resolve({ publicId: "organization-public-001" }) },
    );

    await expect(createResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          publicId: "organization-public-001",
          orgTier: "city",
        },
      },
    });
    await expect(updateResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        organization: {
          publicId: "organization-public-001",
          name: "杭州烟草更新",
        },
      },
    });
    expect(mutationInputs).toEqual([
      expect.objectContaining({ action: "createOrganization" }),
      expect.objectContaining({ action: "updateOrganization" }),
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "organization.create",
        targetResourceType: "organization",
        targetPublicId: "organization-public-001",
        resultStatus: "success",
        metadataSummary: "redacted organization create metadata",
        requestIp: "203.0.113.40",
      }),
      expect.objectContaining({
        actionType: "organization.update",
        targetResourceType: "organization",
        targetPublicId: "organization-public-001",
        resultStatus: "success",
        metadataSummary: "redacted organization update metadata",
        requestIp: "203.0.113.40",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      "admin-session-value",
    );
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      '"id"',
    );
  });

  it("disables organizations with cascade metadata and redacted audit evidence", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("super_admin"),
    });

    const response = await handlers.organizations.disable.POST(
      new Request(
        "http://localhost/api/v1/organizations/organization-public-001/disable",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-value" },
          body: JSON.stringify({ isCascade: true }),
        },
      ),
      { params: Promise.resolve({ publicId: "organization-public-001" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        affectedOrganizationPublicIds: [
          "organization-public-001",
          "organization-public-child",
        ],
        organization: {
          publicId: "organization-public-001",
          status: "disabled",
        },
      },
    });
    expect(mutationInputs).toEqual([
      {
        action: "disableOrganization",
        disableInput: {
          publicId: "organization-public-001",
          isCascade: true,
        },
      },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "organization.disable",
        targetResourceType: "organization",
        targetPublicId: "organization-public-001",
        resultStatus: "success",
        metadataSummary:
          "redacted organization disable metadata; affected organization=2",
      }),
    ]);
  });

  it("denies organization mutations for content admins without touching organization records", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("content_admin"),
    });

    const response = await handlers.organizations.disable.POST(
      new Request(
        "http://localhost/api/v1/organizations/organization-public-001/disable",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-value" },
        },
      ),
      { params: Promise.resolve({ publicId: "organization-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(mutationInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "organization.disable",
        resultStatus: "failed",
        metadataSummary: "redacted organization permission denial metadata",
      }),
    ]);
  });
});
