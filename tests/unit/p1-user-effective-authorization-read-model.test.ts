import { describe, expect, it } from "vitest";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminAuthOperationListQuery } from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AdminFlowRuntimeRepositories } from "@/server/repositories/admin-flow-runtime-repository";
import * as adminFlowRepository from "@/server/repositories/admin-flow-runtime-repository";
import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";

function createRepositories(
  observeQuery: (query: AdminAuthOperationListQuery) => void,
): AdminFlowRuntimeRepositories {
  const pagination = {
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortOrder: "desc" as const,
    total: 0,
  };

  return {
    userOrgAuthRepository: {
      async listUsers(query) {
        observeQuery(query);
        return { users: [], pagination };
      },
    },
    contentKnowledgeRepository: {
      async listPapers() {
        return { papers: [], pagination };
      },
      async listQuestions() {
        return { questions: [], pagination };
      },
    },
    auditLogRepository: {
      async appendAuditLog() {},
      async listAuditLogs() {
        return { auditLogs: [], pagination };
      },
    },
  };
}

describe("P1 F-0107 user effective authorization read model", () => {
  it("forwards user category and effective edition filters to the repository", async () => {
    let observedQuery: AdminAuthOperationListQuery | null = null;
    const handlers = createAdminFlowRuntimeRouteHandlers({
      repositories: createRepositories((query) => {
        observedQuery = query;
      }),
      sessionService: {
        async getCurrentSession(): Promise<ApiResponse<AuthContextDto | null>> {
          return {
            code: 0,
            message: "ok",
            data: {
              session: { expiresAt: "2026-07-22T00:00:00.000Z" },
              user: {
                publicId: "user-admin-public-001",
                phone: "139****0001",
                name: "运营管理员",
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
      },
    });

    const response = await handlers.users.collection.GET(
      new Request(
        "http://localhost/api/v1/users?userCategory=employee&authFilter=advanced",
        { headers: { authorization: "Bearer admin-session" } },
      ),
    );

    expect(response.status).toBe(200);
    expect(observedQuery).toMatchObject({
      userCategory: "employee",
      authFilter: "advanced",
    });
  });

  it("prefers an active organization authorization over an expired personal authorization", () => {
    expect(
      adminFlowRepository.resolveAdminUserEffectiveAuthorizationSummary({
        accountStatus: "active",
        now: new Date("2026-07-21T12:00:00.000Z"),
        sources: [
          {
            edition: "advanced",
            expiresAt: new Date("2026-07-20T12:00:00.000Z"),
            startsAt: new Date("2026-06-20T12:00:00.000Z"),
            status: "active",
          },
          {
            edition: "standard",
            expiresAt: new Date("2026-08-21T12:00:00.000Z"),
            startsAt: new Date("2026-06-21T12:00:00.000Z"),
            status: "active",
            upgrade: {
              expiresAt: new Date("2026-08-21T12:00:00.000Z"),
              revokedAt: null,
              startsAt: new Date("2026-07-21T12:00:00.000Z"),
              status: "active",
              targetEdition: "advanced",
            },
          },
        ],
        userType: "employee",
      }),
    ).toEqual({
      authEditionLabel: "advanced",
      authStatus: "active",
      userCategory: "employee",
    });
  });

  it("treats authorization boundaries as inclusive and keeps disabled classification", () => {
    expect(
      adminFlowRepository.resolveAdminUserEffectiveAuthorizationSummary({
        accountStatus: "disabled",
        now: new Date("2026-07-21T12:00:00.000Z"),
        sources: [
          {
            edition: "standard",
            expiresAt: new Date("2026-07-21T12:00:00.000Z"),
            startsAt: new Date("2026-07-21T12:00:00.000Z"),
            status: "active",
          },
        ],
        userType: "employee",
      }),
    ).toEqual({
      authEditionLabel: "standard",
      authStatus: "active",
      userCategory: "disabled",
    });
  });

  it("aggregates multiple sources and keeps expired above cancelled when none are active", () => {
    expect(
      adminFlowRepository.resolveAdminUserEffectiveAuthorizationSummary({
        accountStatus: "active",
        now: new Date("2026-07-21T12:00:00.000Z"),
        sources: [
          {
            edition: "advanced",
            expiresAt: new Date("2026-07-20T12:00:00.000Z"),
            startsAt: new Date("2026-06-20T12:00:00.000Z"),
            status: "active",
          },
          {
            edition: "standard",
            expiresAt: new Date("2026-08-21T12:00:00.000Z"),
            startsAt: new Date("2026-06-21T12:00:00.000Z"),
            status: "cancelled",
          },
        ],
        userType: "employee",
      }),
    ).toEqual({
      authEditionLabel: "expired",
      authStatus: "expired",
      userCategory: "employee",
    });
  });
});
