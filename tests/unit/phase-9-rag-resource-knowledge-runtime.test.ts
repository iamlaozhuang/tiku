import { describe, expect, it } from "vitest";

import { buildRagRetrievalContextFromChunks } from "@/server/services/rag-retrieval-service";
import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";
import type { RagResourceKnowledgeRuntimeRepositoriesWithAudit } from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";

const createdAt = new Date("2026-05-23T04:00:00.000Z");

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
          session: {
            expiresAt: "2026-05-23T12:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-001",
            phone: "13800000001",
            name: "RAG Admin",
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

function createRuntimeRepositories(input: {
  auditLogEntries: unknown[];
  knowledgeNodeMutationContexts?: unknown[];
  resourceMutationContexts?: unknown[];
}): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  return {
    resourceRepository: {
      async listResources(query) {
        return {
          resources: [
            {
              publicId: "resource-public-001",
              title: "专卖教材",
              resourceType: "textbook",
              resourceStatus: "rag_ready",
              profession: "monopoly",
              level: 3,
              knowledgeNodePublicIds: ["knowledge-node-public-permit"],
              originalFileName: "monopoly.md",
              downloadAvailable: true,
              markdownPreviewAvailable: true,
              isVectorStale: false,
              publishedAt: createdAt.toISOString(),
              indexingErrorSummary: null,
              uploadedAt: createdAt.toISOString(),
              updatedAt: createdAt.toISOString(),
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
      async publishResourceMarkdown() {
        throw new Error("not used");
      },
      async findResourceForIndexing(publicId) {
        if (publicId !== "resource-public-001") {
          return null;
        }

        return {
          publicId,
          title: "专卖教材",
          resourceStatus: "published",
          resourceType: "textbook",
          profession: "monopoly",
          level: 3,
          markdownContent:
            "# 第一章 证件管理\n\n许可证办理需要核验申请材料、身份信息和经营场所。\n\n## 第一节 许可证办理\n\n申请材料不完整时应一次性告知补正内容。",
          markdownContentHash: "markdown-content-hash",
          originalFileName: "monopoly.md",
          isVectorStale: true,
          createdAt,
          updatedAt: createdAt,
        };
      },
      async requestResourceIndexRebuild(
        resourcePublicId,
        _requestPublicId,
        mutationContext,
      ) {
        input.resourceMutationContexts?.push(mutationContext);
        return {
          status: "accepted",
          generationPublicId: "resource-index-generation-public-001",
          resourcePublicId,
          resourceStatus: "indexing",
          replayed: false,
        };
      },
    },
    knowledgeNodeRepository: {
      async listKnowledgeNodes(query) {
        return {
          knowledgeNodes: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
      async createKnowledgeNode(createInput, mutationContext) {
        input.knowledgeNodeMutationContexts?.push(mutationContext);
        return {
          publicId: "knowledge-node-public-permit",
          parentKnowledgeNodePublicId: createInput.parentKnowledgeNodePublicId,
          profession: createInput.profession,
          levelList: createInput.levelList,
          name: createInput.name,
          pathName: `专卖/${createInput.name}`,
          sortOrder: createInput.sortOrder,
          knStatus: "active",
          questionCount: 0,
          isRecommendable: true,
          updatedAt: createdAt.toISOString(),
        };
      },
      async updateKnowledgeNode() {
        throw new Error("not used");
      },
      async disableKnowledgeNode(publicId, mutationContext) {
        input.knowledgeNodeMutationContexts?.push(mutationContext);
        return {
          publicId,
          parentKnowledgeNodePublicId: null,
          profession: "monopoly",
          levelList: [3],
          name: "许可证办理",
          pathName: "专卖/许可证办理",
          sortOrder: 10,
          knStatus: "disabled",
          questionCount: 0,
          isRecommendable: false,
          updatedAt: createdAt.toISOString(),
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

describe("phase 9 RAG resource knowledge runtime", () => {
  it("denies ops admins from resource management runtime access", async () => {
    const auditLogEntries: unknown[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRuntimeRepositories({ auditLogEntries }),
      sessionService: createAdminSessionService("ops_admin"),
    });

    const response = await handlers.resources.collection.GET(
      new Request("http://localhost/api/v1/resources?page=1&pageSize=20", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 403621,
      message: "Admin permission denied.",
      data: null,
    });
    expect(JSON.stringify(payload)).not.toContain("resource-public-001");
    expect(auditLogEntries).toEqual([]);
  });

  it("creates a durable resource index generation without fabricating ready chunks", async () => {
    const auditLogEntries: unknown[] = [];
    const resourceMutationContexts: unknown[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRuntimeRepositories({
        auditLogEntries,
        resourceMutationContexts,
      }),
      sessionService: createAdminSessionService("content_admin"),
    });

    const response = await handlers.resources.rebuildVector.POST(
      new Request(
        "http://localhost/api/v1/resources/resource-public-001/rebuild-vector",
        {
          method: "POST",
          headers: {
            authorization: "Bearer admin-session-token",
            "idempotency-key": "resource-index-request-public-001",
          },
        },
      ),
      { params: Promise.resolve({ publicId: "resource-public-001" }) },
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        resourceVector: {
          resourcePublicId: "resource-public-001",
          resourceStatus: "indexing",
          generationPublicId: "resource-index-generation-public-001",
          requestReplayed: false,
          chunkCount: 0,
          evidenceSummary: {
            chunkCount: 0,
            resourcePublicIds: [],
          },
        },
      },
    });
    expect(JSON.stringify(payload)).not.toContain('"id"');
    expect(JSON.stringify(payload)).not.toContain("admin-session-token");
    expect(JSON.stringify(payload)).not.toContain("许可证办理需要核验");
    expect(resourceMutationContexts).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        auditLog: expect.objectContaining({
          actorRole: "content_admin",
          actionType: "resource.rebuild_vector",
          metadataSummary: "redacted resource vector rebuild metadata",
          requestIp: null,
        }),
      }),
    ]);
    expect(auditLogEntries).toEqual([]);
  });

  it("rejects a disabled resource rebuild without invoking the generation writer", async () => {
    const auditLogEntries: unknown[] = [];
    const repositories = createRuntimeRepositories({ auditLogEntries });
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: {
        ...repositories,
        resourceRepository: {
          ...repositories.resourceRepository,
          async findResourceForIndexing(publicId) {
            const source =
              await repositories.resourceRepository.findResourceForIndexing(
                publicId,
              );
            return source === null
              ? null
              : { ...source, resourceStatus: "disabled" };
          },
          async requestResourceIndexRebuild() {
            throw new Error("disabled resource must not reach writer");
          },
        },
      },
      sessionService: createAdminSessionService("content_admin"),
    });

    const response = await handlers.resources.rebuildVector.POST(
      new Request(
        "http://localhost/api/v1/resources/resource-public-001/rebuild-vector",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      { params: Promise.resolve({ publicId: "resource-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 409621,
      message: "Resource status does not allow index rebuild.",
      data: null,
    });
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "resource.rebuild_vector",
        targetPublicId: "resource-public-001",
        resultStatus: "failed",
      }),
    ]);
  });

  it("retrieves authorized top 3 citations with evidence status and no fabricated references", () => {
    const result = buildRagRetrievalContextFromChunks({
      query: "许可证办理 申请材料",
      profession: "monopoly",
      level: 3,
      authorizedResourcePublicIds: [
        "resource-public-exact",
        "resource-public-common",
      ],
      chunks: [
        {
          chunkPublicId: "chunk-public-unauthorized",
          resourcePublicId: "resource-public-private",
          resourceTitle: "未授权资料",
          resourceStatus: "rag_ready",
          profession: "monopoly",
          level: 3,
          headingPath: ["内部资料"],
          chunkIndex: 1,
          text: "许可证办理 申请材料 身份信息",
          textHash: "private-hash",
        },
        {
          chunkPublicId: "chunk-public-draft",
          resourcePublicId: "resource-public-exact",
          resourceTitle: "草稿资料",
          resourceStatus: "draft",
          profession: "monopoly",
          level: 3,
          headingPath: ["草稿"],
          chunkIndex: 1,
          text: "许可证办理 申请材料",
          textHash: "draft-hash",
        },
        {
          chunkPublicId: "chunk-public-common",
          resourcePublicId: "resource-public-common",
          resourceTitle: "通用资料",
          resourceStatus: "rag_ready",
          profession: "monopoly",
          levelList: [],
          headingPath: ["证件管理", "通用要求"],
          chunkIndex: 2,
          text: "许可证办理 申请材料 应当 完整",
          textHash: "common-hash",
        },
        {
          chunkPublicId: "chunk-public-exact",
          resourcePublicId: "resource-public-exact",
          resourceTitle: "三级教材",
          resourceStatus: "rag_ready",
          profession: "monopoly",
          level: 3,
          headingPath: ["证件管理", "许可证办理"],
          chunkIndex: 1,
          text: "许可证办理 申请材料 身份信息 经营场所",
          textHash: "exact-hash",
        },
      ],
    });

    expect(result.evidenceStatus).toBe("sufficient");
    expect(result.citations).toHaveLength(2);
    expect(result.citations[0]).toMatchObject({
      chunkPublicId: "chunk-public-exact",
      resourcePublicId: "resource-public-exact",
      headingPath: ["证件管理", "许可证办理"],
    });
    expect(result.citations[1]).toMatchObject({
      chunkPublicId: "chunk-public-common",
      resourcePublicId: "resource-public-common",
      headingPath: ["证件管理", "通用要求"],
    });
    expect(JSON.stringify(result)).not.toContain("未授权资料");
    expect(JSON.stringify(result)).not.toContain("草稿资料");
  });

  it("creates and disables knowledge nodes through public ids and audit logs", async () => {
    const auditLogEntries: unknown[] = [];
    const knowledgeNodeMutationContexts: unknown[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRuntimeRepositories({
        auditLogEntries,
        knowledgeNodeMutationContexts,
      }),
      sessionService: createAdminSessionService("content_admin"),
    });

    const createResponse = await handlers.knowledgeNodes.collection.POST(
      new Request("http://localhost/api/v1/knowledge-nodes", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          parentKnowledgeNodePublicId: null,
          profession: "monopoly",
          levelList: [3],
          name: "许可证办理",
          sortOrder: 10,
        }),
      }),
    );
    const disableResponse = await handlers.knowledgeNodes.disable.POST(
      new Request(
        "http://localhost/api/v1/knowledge-nodes/knowledge-node-public-permit/disable",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      {
        params: Promise.resolve({
          publicId: "knowledge-node-public-permit",
        }),
      },
    );

    await expect(createResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        knowledgeNode: {
          publicId: "knowledge-node-public-permit",
          name: "许可证办理",
          knStatus: "active",
        },
      },
    });
    await expect(disableResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        knowledgeNode: {
          publicId: "knowledge-node-public-permit",
          knStatus: "disabled",
          isRecommendable: false,
        },
      },
    });
    expect(knowledgeNodeMutationContexts).toEqual([
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        auditLog: expect.objectContaining({
          actorRole: "content_admin",
          actionType: "knowledge_node.create",
          metadataSummary: "redacted knowledge_node create metadata",
          requestIp: null,
        }),
      }),
      expect.objectContaining({
        actorPublicId: "admin-public-001",
        auditLog: expect.objectContaining({
          actorRole: "content_admin",
          actionType: "knowledge_node.disable",
          metadataSummary: "redacted knowledge_node disable metadata",
          requestIp: null,
        }),
      }),
    ]);
    expect(auditLogEntries).toEqual([]);
    expect(JSON.stringify(knowledgeNodeMutationContexts)).not.toContain(
      "admin-session-token",
    );
  });
});
