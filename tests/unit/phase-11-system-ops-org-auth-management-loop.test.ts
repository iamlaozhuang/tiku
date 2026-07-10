import { describe, expect, it } from "vitest";

import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeRepositories,
} from "@/server/services/admin-organization-org-auth-runtime";
import type { OrgAuthDto } from "@/server/contracts/organization-auth-contract";
import type { SessionService } from "@/server/services/session-service";

function createAdminSessionService(
  role: "super_admin" | "ops_admin" | "content_admin",
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(input) {
      if (input.authorization !== "Bearer admin-session-token") {
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
          session: { expiresAt: "2026-05-24T15:00:00.000Z" },
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

function createOrgAuth(overrides: Partial<OrgAuthDto> = {}): OrgAuthDto {
  return {
    publicId: "org-auth-public-001",
    name: "2026 杭州企业授权",
    purchaserOrganizationPublicId: "organization-public-001",
    authScopeType: "specified_nodes",
    profession: "monopoly",
    level: 3,
    accountQuota: 100,
    usedQuota: 2,
    startsAt: "2026-05-24T00:00:00.000Z",
    expiresAt: "2027-05-24T00:00:00.000Z",
    status: "active",
    cancelledAt: null,
    organizationPublicIds: ["organization-public-001"],
    createdAt: "2026-05-24T06:30:00.000Z",
    updatedAt: "2026-05-24T06:30:00.000Z",
    ...overrides,
  };
}

function createRepositories(input: {
  auditInputs: unknown[];
  mutationInputs: unknown[];
  hasOverlap?: boolean;
  createResult?: OrgAuthDto | null;
  cancelResult?: OrgAuthDto | null;
}): AdminOrganizationOrgAuthRuntimeRepositories {
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
    async hasOverlappingOrgAuth(orgAuthInput) {
      input.mutationInputs.push({
        action: "hasOverlappingOrgAuth",
        orgAuthInput,
      });

      return input.hasOverlap ?? false;
    },
    async createOrgAuth(orgAuthInput) {
      input.mutationInputs.push({ action: "createOrgAuth", orgAuthInput });

      return input.createResult === undefined
        ? createOrgAuth()
        : input.createResult;
    },
    async cancelOrgAuth(publicId) {
      input.mutationInputs.push({ action: "cancelOrgAuth", publicId });

      return input.cancelResult === undefined
        ? createOrgAuth({
            publicId,
            status: "cancelled",
            cancelledAt: "2026-05-24T06:35:00.000Z",
          })
        : input.cancelResult;
    },
    async terminateOrgAuthActiveFlows(publicId) {
      input.mutationInputs.push({
        action: "terminateOrgAuthActiveFlows",
        publicId,
      });

      return { practiceCount: 2, mockExamCount: 1 };
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
    },
  };
}

describe("phase 11 system ops org auth management loop", () => {
  it("creates org_auth with overlap guard, public identifiers, and redacted audit metadata", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    });
    const headers = {
      authorization: "Bearer admin-session-token",
      "x-forwarded-for": "203.0.113.30, 10.0.0.1",
    };

    const response = await handlers.orgAuths.collection.POST(
      new Request("http://localhost/api/v1/org-auths", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "2026 杭州企业授权",
          purchaserOrganizationPublicId: "organization-public-001",
          authScopeType: "specified_nodes",
          edition: "standard",
          profession: "monopoly",
          level: 3,
          accountQuota: 100,
          startsAt: "2026-05-24T00:00:00.000Z",
          expiresAt: "2027-05-24T00:00:00.000Z",
          organizationPublicIds: ["organization-public-001"],
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org-auth-public-001",
          purchaserOrganizationPublicId: "organization-public-001",
          organizationPublicIds: ["organization-public-001"],
        },
      },
    });
    expect(mutationInputs).toEqual([
      expect.objectContaining({ action: "hasOverlappingOrgAuth" }),
      expect.objectContaining({ action: "createOrgAuth" }),
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "org_auth.create",
        targetResourceType: "org_auth",
        targetPublicId: "org-auth-public-001",
        resultStatus: "success",
        metadataSummary: "redacted org_auth create metadata",
        requestIp: "203.0.113.30",
      }),
    ]);
    expect(JSON.stringify({ auditInputs, mutationInputs })).not.toContain(
      "admin-session-token",
    );
  });

  it("creates a multi-scope org_auth package after checking every atomic scope", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const createdAtoms: OrgAuthDto[] = [
      createOrgAuth({
        publicId: "org-auth-public-monopoly-3",
        profession: "monopoly",
        level: 3,
      }),
      createOrgAuth({
        publicId: "org-auth-public-marketing-4",
        profession: "marketing",
        level: 4,
      }),
    ];
    let createIndex = 0;
    const packageRepositories = createRepositories({
      auditInputs,
      mutationInputs,
    });

    packageRepositories.createOrgAuth = async (orgAuthInput) => {
      mutationInputs.push({ action: "createOrgAuth", orgAuthInput });

      return createdAtoms[createIndex++] ?? null;
    };

    const response = await createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: packageRepositories,
      sessionService: createAdminSessionService("ops_admin"),
    }).orgAuths.collection.POST(
      new Request("http://localhost/api/v1/org-auths", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          name: "2026 多专业等级授权包",
          purchaserOrganizationPublicId: "organization-public-001",
          authScopeType: "specified_nodes",
          edition: "advanced",
          accountQuota: 100,
          startsAt: "2026-05-24T00:00:00.000Z",
          expiresAt: "2027-05-24T00:00:00.000Z",
          organizationPublicIds: ["organization-public-001"],
          scopeSelections: [
            { profession: "monopoly", level: 3 },
            { profession: "marketing", level: 4 },
          ],
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org-auth-public-monopoly-3",
        },
        orgAuths: [
          { publicId: "org-auth-public-monopoly-3" },
          { publicId: "org-auth-public-marketing-4" },
        ],
      },
    });
    expect(
      mutationInputs.filter(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          "action" in entry &&
          entry.action === "hasOverlappingOrgAuth",
      ),
    ).toHaveLength(2);
    expect(
      mutationInputs.filter(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          "action" in entry &&
          entry.action === "createOrgAuth",
      ),
    ).toHaveLength(2);
    expect(auditInputs).toContainEqual(
      expect.objectContaining({
        actionType: "org_auth.create",
        resultStatus: "success",
        metadataSummary: "redacted org_auth create metadata",
      }),
    );
  });

  it("rejects overlapping org_auth scopes before creating records", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({
        auditInputs,
        mutationInputs,
        hasOverlap: true,
      }),
      sessionService: createAdminSessionService("super_admin"),
    });

    const response = await handlers.orgAuths.collection.POST(
      new Request("http://localhost/api/v1/org-auths", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          name: "2026 重叠授权",
          purchaserOrganizationPublicId: "organization-public-001",
          authScopeType: "specified_nodes",
          edition: "standard",
          profession: "monopoly",
          level: 3,
          accountQuota: 100,
          startsAt: "2026-05-24T00:00:00.000Z",
          expiresAt: "2027-05-24T00:00:00.000Z",
          organizationPublicIds: ["organization-public-001"],
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      code: 409005,
      message: "Org auth scope overlaps an existing active authorization.",
      data: null,
    });
    expect(mutationInputs).toEqual([
      expect.objectContaining({ action: "hasOverlappingOrgAuth" }),
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "org_auth.create",
        resultStatus: "failed",
        metadataSummary: "redacted org_auth overlap metadata",
      }),
    ]);
  });

  it("cancels org_auth and terminates active practice and mock_exam flows", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.orgAuths.cancel.POST(
      new Request(
        "http://localhost/api/v1/org-auths/org-auth-public-001/cancel",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      { params: Promise.resolve({ publicId: "org-auth-public-001" }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        orgAuth: {
          publicId: "org-auth-public-001",
          status: "cancelled",
        },
      },
    });
    expect(mutationInputs).toEqual([
      { action: "cancelOrgAuth", publicId: "org-auth-public-001" },
      {
        action: "terminateOrgAuthActiveFlows",
        publicId: "org-auth-public-001",
      },
    ]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "org_auth.cancel",
        targetResourceType: "org_auth",
        targetPublicId: "org-auth-public-001",
        resultStatus: "success",
        metadataSummary:
          "redacted org_auth cancel metadata; terminated practice=2 mock_exam=1",
      }),
    ]);
  });

  it("denies org_auth mutation for content admins without touching authorization records", async () => {
    const auditInputs: unknown[] = [];
    const mutationInputs: unknown[] = [];
    const handlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers({
      repositories: createRepositories({ auditInputs, mutationInputs }),
      sessionService: createAdminSessionService("content_admin"),
    });

    const response = await handlers.orgAuths.cancel.POST(
      new Request(
        "http://localhost/api/v1/org-auths/org-auth-public-001/cancel",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      { params: Promise.resolve({ publicId: "org-auth-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 403601,
      message: "Admin permission denied.",
      data: null,
    });
    expect(mutationInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "org_auth.cancel",
        resultStatus: "failed",
        metadataSummary: "redacted org_auth permission denial metadata",
      }),
    ]);
  });
});
