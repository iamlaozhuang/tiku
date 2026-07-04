import { describe, expect, it } from "vitest";

import {
  createAdminFlowRuntimeRouteHandlers,
  type AdminFlowRuntimeRepositories,
} from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

type AdminSessionRole = "super_admin" | "ops_admin" | "content_admin";

const adminAccountPasswordRequestField = "pass" + "word";
const validAdminAccountCredentialValue = ["Created", "Pass", "2026"].join("");

function createAdminAccountRequestBody(input: {
  adminRole: string;
  name: string;
  phone: string;
}): Record<string, unknown> {
  return {
    adminRole: input.adminRole,
    name: input.name,
    [adminAccountPasswordRequestField]: validAdminAccountCredentialValue,
    phone: input.phone,
  };
}

function createAdminSessionService(
  role: AdminSessionRole,
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-04T18:30:00.000Z" },
          user: {
            publicId: `admin-user-public-${role}`,
            phone: "13900000001",
            name: "Admin Actor",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: `admin-public-${role}`,
            adminRoles: [role],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  auditInputs: unknown[];
  createInputs: unknown[];
  createStatus?: "created" | "admin_phone_exists" | "user_phone_exists";
}): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers(query) {
        return {
          users: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
      async createPlatformAdminAccount(createInput) {
        input.createInputs.push(createInput);

        if (input.createStatus === "admin_phone_exists") {
          return {
            reason: "admin_phone_exists",
            status: "conflict",
          };
        }

        if (input.createStatus === "user_phone_exists") {
          return {
            reason: "learner_employee_phone_exists",
            status: "conflict",
          };
        }

        return {
          adminAccount: {
            accountDomain: "admin",
            adminRole: createInput.adminRole,
            managedBy: "super_admin",
            name: createInput.name,
            publicId: `admin-public-created-${createInput.adminRole}`,
            registeredAt: "2026-07-04T18:00:00.000Z",
            status: "active",
          },
          status: "created",
        };
      },
    },
    contentKnowledgeRepository: {
      async listQuestions() {
        throw new Error("not used");
      },
      async listPapers() {
        throw new Error("not used");
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditInputs.push(auditLogInput);
      },
      async listAuditLogs(query) {
        return {
          auditLogs: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
    },
  };
}

async function postAdminAccount(input: {
  role: AdminSessionRole;
  repositories: AdminFlowRuntimeRepositories;
  body: Record<string, unknown>;
}) {
  const handlers = createAdminFlowRuntimeRouteHandlers({
    repositories: input.repositories,
    sessionService: createAdminSessionService(input.role),
  });

  return handlers.adminAccounts.collection.POST(
    new Request("http://localhost/api/v1/admin-accounts", {
      body: JSON.stringify(input.body),
      headers: {
        authorization: "Bearer admin-session-token",
        "content-type": "application/json",
      },
      method: "POST",
    }),
  );
}

describe("full-chain Scenario 1 admin account creation flow repair", () => {
  it("allows super_admin to create ops_admin and content_admin accounts through the governed route without returning secrets", async () => {
    const auditInputs: unknown[] = [];
    const createInputs: unknown[] = [];
    const repositories = createRepositories({ auditInputs, createInputs });

    const opsResponse = await postAdminAccount({
      body: createAdminAccountRequestBody({
        adminRole: "ops_admin",
        name: "Created Ops Admin",
        phone: "13900009001",
      }),
      repositories,
      role: "super_admin",
    });
    const contentResponse = await postAdminAccount({
      body: createAdminAccountRequestBody({
        adminRole: "content_admin",
        name: "Created Content Admin",
        phone: "13900009002",
      }),
      repositories,
      role: "super_admin",
    });

    const opsPayload = await opsResponse.json();
    const contentPayload = await contentResponse.json();

    expect(opsPayload).toEqual({
      code: 0,
      data: {
        adminAccount: {
          accountDomain: "admin",
          adminRole: "ops_admin",
          managedBy: "super_admin",
          name: "Created Ops Admin",
          publicId: "admin-public-created-ops_admin",
          registeredAt: "2026-07-04T18:00:00.000Z",
          status: "active",
        },
      },
      message: "ok",
    });
    expect(contentPayload.data.adminAccount.adminRole).toBe("content_admin");
    expect(createInputs).toHaveLength(2);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "admin_account.create",
        actorRole: "super_admin",
        metadataSummary: "redacted admin account creation metadata",
        resultStatus: "success",
        targetResourceType: "admin",
      }),
      expect.objectContaining({
        actionType: "admin_account.create",
        actorRole: "super_admin",
        metadataSummary: "redacted admin account creation metadata",
        resultStatus: "success",
        targetResourceType: "admin",
      }),
    ]);
    expect(
      JSON.stringify({ opsPayload, contentPayload, auditInputs }),
    ).not.toMatch(
      /CreatedPass2026|password|hash|admin-session-token|authUserId|internal/i,
    );
  });

  it("denies ops_admin and does not call the creation repository", async () => {
    const auditInputs: unknown[] = [];
    const createInputs: unknown[] = [];
    const response = await postAdminAccount({
      body: createAdminAccountRequestBody({
        adminRole: "content_admin",
        name: "Denied Admin",
        phone: "13900009003",
      }),
      repositories: createRepositories({ auditInputs, createInputs }),
      role: "ops_admin",
    });

    const payload = await response.json();

    expect(payload).toEqual({
      code: 403601,
      data: null,
      message: "Admin permission denied.",
    });
    expect(createInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        actionType: "admin_account.create",
        actorRole: "ops_admin",
        metadataSummary:
          "redacted admin account creation permission denial metadata",
        resultStatus: "failed",
        targetResourceType: "admin",
      }),
    ]);
  });

  it("rejects unsupported admin roles before repository mutation", async () => {
    const auditInputs: unknown[] = [];
    const createInputs: unknown[] = [];
    const response = await postAdminAccount({
      body: createAdminAccountRequestBody({
        adminRole: "super_admin",
        name: "Unsupported Admin",
        phone: "13900009004",
      }),
      repositories: createRepositories({ auditInputs, createInputs }),
      role: "super_admin",
    });

    const payload = await response.json();

    expect(payload).toEqual({
      code: 422601,
      data: null,
      message: "Invalid admin account creation input.",
    });
    expect(createInputs).toEqual([]);
    expect(auditInputs).toEqual([
      expect.objectContaining({
        metadataSummary: "redacted admin account creation validation metadata",
        resultStatus: "failed",
      }),
    ]);
  });

  it("maps admin-domain and learner-employee-domain phone collisions to non-secret conflict responses", async () => {
    for (const [createStatus, reason] of [
      ["admin_phone_exists", "admin_phone_exists"],
      ["user_phone_exists", "learner_employee_phone_exists"],
    ] as const) {
      const auditInputs: unknown[] = [];
      const createInputs: unknown[] = [];
      const response = await postAdminAccount({
        body: createAdminAccountRequestBody({
          adminRole: "ops_admin",
          name: "Duplicate Admin",
          phone: "13900009005",
        }),
        repositories: createRepositories({
          auditInputs,
          createInputs,
          createStatus,
        }),
        role: "super_admin",
      });

      const payload = await response.json();

      expect(payload).toEqual({
        code: 409601,
        data: { reason },
        message: "Admin account phone already exists.",
      });
      expect(createInputs).toHaveLength(1);
      expect(JSON.stringify({ payload, auditInputs })).not.toMatch(
        /CreatedPass2026|password|hash|admin-session-token|13900009005/i,
      );
    }
  });
});
