import { describe, expect, it } from "vitest";

import * as knowledgeNodeCollectionRoute from "@/app/api/v1/knowledge-nodes/route";
import * as knowledgeNodeDetailRoute from "@/app/api/v1/knowledge-nodes/[publicId]/route";
import * as knowledgeNodeDisableRoute from "@/app/api/v1/knowledge-nodes/[publicId]/disable/route";
import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";
import type { RagResourceKnowledgeRuntimeRepositoriesWithAudit } from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";

const updatedAt = new Date("2026-05-24T09:00:00.000Z");

function createAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
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
          session: {
            expiresAt: "2026-05-24T12:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "Content Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-001",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createRuntimeRepositories(input: {
  auditLogEntries: unknown[];
  mutationAuditContexts: unknown[];
  updateInputs: unknown[];
}): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  return {
    resourceRepository: {
      async listResources() {
        throw new Error("resource list is not used in this test");
      },
      async publishResourceMarkdown() {
        throw new Error("resource publish is not used in this test");
      },
      async findResourceForIndexing() {
        throw new Error("resource indexing is not used in this test");
      },
    },
    knowledgeNodeRepository: {
      async listKnowledgeNodes(query) {
        return {
          knowledgeNodes: [
            {
              publicId: "knowledge-node-public-child",
              parentKnowledgeNodePublicId: "knowledge-node-public-root",
              profession: "marketing",
              levelList: [3],
              name: "市场调研",
              pathName: "营销/基础知识/市场调研",
              sortOrder: 30,
              knStatus: "active",
              questionCount: 2,
              isRecommendable: true,
              updatedAt: updatedAt.toISOString(),
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
      async createKnowledgeNode() {
        throw new Error("create is not used in this test");
      },
      async updateKnowledgeNode(publicId, updateInput, mutationContext) {
        input.updateInputs.push({ publicId, updateInput });
        input.mutationAuditContexts.push(mutationContext);

        if (
          updateInput.parentKnowledgeNodePublicId ===
          "knowledge-node-public-root"
        ) {
          return {
            publicId,
            parentKnowledgeNodePublicId:
              updateInput.parentKnowledgeNodePublicId,
            profession: "marketing",
            levelList: [3],
            name: updateInput.name ?? "市场调研",
            pathName: "营销/基础知识/市场调研",
            sortOrder: updateInput.sortOrder ?? 30,
            knStatus: "active",
            questionCount: 2,
            isRecommendable: true,
            updatedAt: updatedAt.toISOString(),
          };
        }

        return null;
      },
      async disableKnowledgeNode(publicId) {
        return {
          publicId,
          parentKnowledgeNodePublicId: "knowledge-node-public-root",
          profession: "marketing",
          levelList: [3],
          name: "市场调研",
          pathName: "营销/基础知识/市场调研",
          sortOrder: 30,
          knStatus: "disabled",
          questionCount: 2,
          isRecommendable: false,
          updatedAt: updatedAt.toISOString(),
        };
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditLogEntries.push(auditLogInput);
      },
    },
  };
}

describe("phase 11 knowledge_node tree management loop", () => {
  it("moves and sorts knowledge_node rows through PATCH with redacted audit evidence", async () => {
    const auditLogEntries: unknown[] = [];
    const mutationAuditContexts: unknown[] = [];
    const updateInputs: unknown[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRuntimeRepositories({
        auditLogEntries,
        mutationAuditContexts,
        updateInputs,
      }),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.knowledgeNodes.detail.PATCH(
      new Request(
        "http://localhost/api/v1/knowledge-nodes/knowledge-node-public-child",
        {
          method: "PATCH",
          headers: { authorization: "Bearer admin-session-token" },
          body: JSON.stringify({
            parentKnowledgeNodePublicId: "knowledge-node-public-root",
            sortOrder: 30,
            name: "市场调研",
          }),
        },
      ),
      {
        params: Promise.resolve({
          publicId: "knowledge-node-public-child",
        }),
      },
    );

    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        knowledgeNode: {
          publicId: "knowledge-node-public-child",
          parentKnowledgeNodePublicId: "knowledge-node-public-root",
          sortOrder: 30,
          questionCount: 2,
          isRecommendable: true,
        },
      },
    });
    expect(updateInputs).toEqual([
      {
        publicId: "knowledge-node-public-child",
        updateInput: {
          parentKnowledgeNodePublicId: "knowledge-node-public-root",
          sortOrder: 30,
          name: "市场调研",
        },
      },
    ]);
    expect(mutationAuditContexts).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        auditLog: expect.objectContaining({
          actorRole: "content_admin",
          actionType: "knowledge_node.update",
          metadataSummary: "redacted knowledge_node update metadata",
          requestIp: null,
        }),
      }),
    ]);
    expect(auditLogEntries).toEqual([]);
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(mutationAuditContexts)).not.toContain(
      "admin-session-token",
    );
    expect(JSON.stringify(mutationAuditContexts)).not.toContain("市场调研");
  });

  it("keeps knowledge_node runtime disable-only and exposes no hard-delete route", () => {
    expect(knowledgeNodeCollectionRoute).toHaveProperty("GET");
    expect(knowledgeNodeCollectionRoute).toHaveProperty("POST");
    expect(knowledgeNodeDetailRoute).toHaveProperty("PATCH");
    expect(knowledgeNodeDisableRoute).toHaveProperty("POST");
    expect(knowledgeNodeCollectionRoute).not.toHaveProperty("DELETE");
    expect(knowledgeNodeDetailRoute).not.toHaveProperty("DELETE");
    expect(knowledgeNodeDisableRoute).not.toHaveProperty("DELETE");
  });
});
