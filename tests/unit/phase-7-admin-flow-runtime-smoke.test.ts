import { describe, expect, it } from "vitest";

import {
  createAdminFlowRuntimeRouteHandlers,
  type AdminFlowRuntimeRepositories,
} from "@/server/services/admin-flow-runtime";
import type { SessionService } from "@/server/services/session-service";

const now = new Date("2026-05-21T08:00:00.000Z");
const updatedAt = "2026-05-21T08:00:00.000Z";
const expiresAt = new Date("2027-05-21T08:00:00.000Z");

function createSessionService(): SessionService {
  return {
    async login() {
      throw new Error("login should not be called by admin flow routes");
    },
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
          session: {
            expiresAt: expiresAt.toISOString(),
          },
          user: {
            publicId: "admin-dev-super-admin",
            phone: "13800000001",
            name: "Dev Super Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-dev-super-admin",
            adminRoles: ["super_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(): AdminFlowRuntimeRepositories {
  return {
    userOrgAuthRepository: {
      async listUsers(query) {
        return {
          users: [
            {
              publicId: "user-dev-student",
              phone: "13900000002",
              name: "Dev Student",
              registeredAt: now.toISOString(),
              status: "active",
              userType: "personal",
              organizationPublicId: null,
              organizationName: null,
              authStatus: "active",
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 1,
          },
        };
      },
    },
    contentKnowledgeRepository: {
      async listQuestions(query) {
        return {
          questions: [
            {
              publicId: "question-dev-single-choice",
              stemSummary: "Phase 7 dev single choice",
              questionType: "single_choice",
              profession: "monopoly",
              level: 3,
              subject: "theory",
              status: "available",
              knowledgeNodeNames: [],
              tagNames: [],
              referencedPaperCount: 1,
              updatedAt,
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 1,
          },
        };
      },
      async listPapers(query) {
        return {
          papers: [
            {
              publicId: "paper-dev-theory",
              name: "Phase 7 dev theory paper",
              profession: "monopoly",
              level: 3,
              subject: "theory",
              paperStatus: "published",
              paperType: "mock_paper",
              year: 2026,
              totalScore: "5.0",
              questionCount: 1,
              mockExamCount: 0,
              sourceFileName: null,
              publishValidationSummary: "published seed paper",
              updatedAt,
            },
          ],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 1,
          },
        };
      },
    },
    auditLogRepository: {
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

describe("phase 7 admin flow runtime smoke", () => {
  it("requires an authenticated admin session before returning admin data", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      sessionService: createSessionService(),
      repositories: createRepositories(),
    });

    const response = await handlers.users.collection.GET(
      new Request("http://localhost/api/v1/users"),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 401001,
      message: "Admin session is required.",
      data: null,
    });
  });

  it("runs the narrow admin users, question, paper, and audit log read path with public ids", async () => {
    const handlers = createAdminFlowRuntimeRouteHandlers({
      sessionService: createSessionService(),
      repositories: createRepositories(),
    });
    const authorizedHeaders = {
      authorization: "Bearer admin-session-token",
    };

    const usersResponse = await handlers.users.collection.GET(
      new Request("http://localhost/api/v1/users?page=1&pageSize=20", {
        headers: authorizedHeaders,
      }),
    );
    const usersPayload = await usersResponse.json();
    expect(usersPayload.code).toBe(0);
    expect(usersPayload.data.users[0]).toMatchObject({
      publicId: "user-dev-student",
      authStatus: "active",
    });
    expect(usersPayload.data.users[0]).not.toHaveProperty("id");

    const questionsResponse = await handlers.questions.collection.GET(
      new Request("http://localhost/api/v1/questions?keyword=single", {
        headers: authorizedHeaders,
      }),
    );
    const questionsPayload = await questionsResponse.json();
    expect(questionsPayload.code).toBe(0);
    expect(questionsPayload.data.questions[0]).toMatchObject({
      publicId: "question-dev-single-choice",
      profession: "monopoly",
    });

    const papersResponse = await handlers.papers.collection.GET(
      new Request("http://localhost/api/v1/papers", {
        headers: authorizedHeaders,
      }),
    );
    const papersPayload = await papersResponse.json();
    expect(papersPayload.code).toBe(0);
    expect(papersPayload.data.papers[0]).toMatchObject({
      publicId: "paper-dev-theory",
      paperStatus: "published",
    });

    const auditLogsResponse = await handlers.auditLogs.collection.GET(
      new Request("http://localhost/api/v1/audit-logs", {
        headers: authorizedHeaders,
      }),
    );
    const auditLogsPayload = await auditLogsResponse.json();
    expect(auditLogsPayload).toMatchObject({
      code: 0,
      data: { auditLogs: [] },
      pagination: { total: 0 },
    });

    const combinedPayload = JSON.stringify({
      usersPayload,
      questionsPayload,
      papersPayload,
      auditLogsPayload,
    });
    expect(combinedPayload).not.toContain('"id"');
    expect(combinedPayload).not.toContain("password");
    expect(combinedPayload).not.toContain("session-token");
    expect(combinedPayload).not.toContain("runtime is not configured");
  });
});
