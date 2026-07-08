import { describe, expect, it, vi } from "vitest";

import { createAiGenerationKnowledgeNodeOptionsRouteHandlers } from "@/server/services/ai-generation-knowledge-node-options-route";
import type { ContentKnowledgeNodeRuntimeRepository } from "@/server/repositories/content-knowledge-node-runtime-repository";
import type { AdminRole } from "@/server/models/auth";
import type { SessionService } from "@/server/services/session-service";

const updatedAt = "2026-07-08T10:00:00.000Z";

function createSessionService(input: {
  userType: "personal" | "employee" | null;
  adminRoles: AdminRole[];
}): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession(request) {
      if (request.authorization !== "Bearer ai-options-session-token") {
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
            expiresAt: "2026-07-08T12:00:00.000Z",
          },
          user: {
            publicId: "ai-options-user-public-001",
            phone: "13800000000",
            name: "AI options user",
            userType: input.userType,
            status: "active",
            lockedUntilAt: null,
            employeePublicId:
              input.userType === "employee"
                ? "employee-ai-options-public-001"
                : null,
            organizationPublicId:
              input.userType === "employee"
                ? "organization-ai-options-public-001"
                : null,
            adminPublicId:
              input.adminRoles.length > 0
                ? "admin-ai-options-public-001"
                : null,
            adminRoles: input.adminRoles,
          },
        },
      };
    },
  };
}

function createKnowledgeNodeRepository(): ContentKnowledgeNodeRuntimeRepository {
  return {
    async listKnowledgeNodes(query) {
      return {
        knowledgeNodes: [
          {
            publicId: "knowledge-node-public-marketing-3",
            parentKnowledgeNodePublicId: null,
            profession: "marketing",
            levelList: [3],
            name: "市场调研",
            pathName: "营销/基础知识/市场调研",
            sortOrder: 10,
            knStatus: "active",
            questionCount: 0,
            isRecommendable: true,
            updatedAt,
          },
          {
            publicId: "knowledge-node-public-marketing-4",
            parentKnowledgeNodePublicId: null,
            profession: "marketing",
            levelList: [4],
            name: "渠道管理",
            pathName: "营销/技能知识/渠道管理",
            sortOrder: 20,
            knStatus: "active",
            questionCount: 0,
            isRecommendable: true,
            updatedAt,
          },
          {
            publicId: "knowledge-node-public-disabled",
            parentKnowledgeNodePublicId: null,
            profession: "marketing",
            levelList: [3],
            name: "停用节点",
            pathName: "营销/停用节点",
            sortOrder: 30,
            knStatus: "disabled",
            questionCount: 0,
            isRecommendable: true,
            updatedAt,
          },
          {
            publicId: "knowledge-node-public-not-recommendable",
            parentKnowledgeNodePublicId: null,
            profession: "marketing",
            levelList: [3],
            name: "不可推荐节点",
            pathName: "营销/不可推荐节点",
            sortOrder: 40,
            knStatus: "active",
            questionCount: 0,
            isRecommendable: false,
            updatedAt,
          },
        ],
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          total: 4,
        },
      };
    },
  };
}

describe("AI generation knowledge node options route", () => {
  it("returns only active recommendable public knowledge-node options for the requested profession and level", async () => {
    const repository = createKnowledgeNodeRepository();
    const listSpy = vi.spyOn(repository, "listKnowledgeNodes");
    const handlers = createAiGenerationKnowledgeNodeOptionsRouteHandlers({
      knowledgeNodeRepository: repository,
      sessionService: createSessionService({
        userType: "personal",
        adminRoles: [],
      }),
    });

    const response = await handlers.collection.GET(
      new Request(
        "http://localhost/api/v1/ai-generation/knowledge-nodes?profession=marketing&level=3",
        {
          headers: {
            authorization: "Bearer ai-options-session-token",
          },
        },
      ),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      data: {
        knowledgeNodes: [
          {
            publicId: "knowledge-node-public-marketing-3",
            profession: "marketing",
            levelList: [3],
            pathName: "营销/基础知识/市场调研",
          },
        ],
      },
      pagination: {
        total: 1,
      },
    });
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        profession: "marketing",
        status: "active",
        pageSize: 100,
      }),
    );
  });

  it("rejects unauthenticated option reads before touching the repository", async () => {
    const repository = createKnowledgeNodeRepository();
    const listSpy = vi.spyOn(repository, "listKnowledgeNodes");
    const handlers = createAiGenerationKnowledgeNodeOptionsRouteHandlers({
      knowledgeNodeRepository: repository,
      sessionService: createSessionService({
        userType: "personal",
        adminRoles: [],
      }),
    });

    const response = await handlers.collection.GET(
      new Request("http://localhost/api/v1/ai-generation/knowledge-nodes"),
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 401001,
      data: null,
    });
    expect(listSpy).not.toHaveBeenCalled();
  });
});
