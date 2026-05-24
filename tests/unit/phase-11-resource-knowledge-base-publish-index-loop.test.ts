import { describe, expect, it } from "vitest";

import {
  createRagCitationSourceDtos,
  buildRagRetrievalContextFromChunks,
} from "@/server/services/rag-retrieval-service";
import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";
import type { RagResourceKnowledgeRuntimeRepositoriesWithAudit } from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";

const createdAt = new Date("2026-05-24T08:00:00.000Z");
const updatedAt = new Date("2026-05-24T08:30:00.000Z");

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
            expiresAt: "2026-05-24T16:00:00.000Z",
          },
          user: {
            publicId: "admin-user-public-010",
            phone: "13800000010",
            name: "Resource Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-010",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  auditLogEntries: unknown[];
  publishCalls: string[];
}): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  return {
    resourceRepository: {
      async listResources(query) {
        return {
          resources: [
            {
              publicId: "resource-public-draft",
              title: "安全知识库草稿",
              resourceType: "knowledge_doc",
              resourceStatus: "draft",
              profession: "marketing",
              level: 3,
              originalFileName: "safe-knowledge.md",
              downloadAvailable: true,
              markdownPreviewAvailable: true,
              isVectorStale: false,
              publishedAt: null,
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
      async findResourceForIndexing(publicId) {
        if (publicId !== "resource-public-draft") {
          return null;
        }

        return {
          publicId,
          title: "安全知识库草稿",
          resourceStatus: "published",
          resourceType: "knowledge_doc",
          profession: "marketing",
          level: 3,
          markdownContent: "# safe\n\nbounded fixture markdown only",
          markdownContentHash: "safe-markdown-hash",
          originalFileName: "safe-knowledge.md",
          isVectorStale: true,
          createdAt,
          updatedAt,
        };
      },
      async saveResourceIndexingResult(result) {
        return {
          publicId: result.resourcePublicId,
          title: "安全知识库草稿",
          resourceType: "knowledge_doc",
          resourceStatus:
            result.status === "success" ? "rag_ready" : "index_failed",
          profession: "marketing",
          level: 3,
          originalFileName: "safe-knowledge.md",
          downloadAvailable: true,
          markdownPreviewAvailable: true,
          isVectorStale: false,
          publishedAt: updatedAt.toISOString(),
          indexingErrorSummary: result.indexingErrorMessage,
          uploadedAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        };
      },
      async publishResourceMarkdown(publicId) {
        input.publishCalls.push(publicId);

        if (publicId !== "resource-public-draft") {
          return { status: "not_found" };
        }

        return {
          status: "published",
          resource: {
            publicId,
            title: "安全知识库草稿",
            resourceType: "knowledge_doc",
            resourceStatus: "published",
            profession: "marketing",
            level: 3,
            originalFileName: "safe-knowledge.md",
            downloadAvailable: true,
            markdownPreviewAvailable: true,
            isVectorStale: true,
            publishedAt: updatedAt.toISOString(),
            indexingErrorSummary: null,
            uploadedAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          },
        };
      },
      async markResourceIndexingStarted() {
        return undefined;
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
      async createKnowledgeNode() {
        throw new Error("not used");
      },
      async updateKnowledgeNode() {
        throw new Error("not used");
      },
      async disableKnowledgeNode() {
        throw new Error("not used");
      },
    },
    auditLogRepository: {
      async appendAuditLog(auditLogInput) {
        input.auditLogEntries.push(auditLogInput);
      },
    },
  };
}

describe("phase 11 resource knowledge_base publish index loop", () => {
  it("publishes a Markdown draft through a publicId route and writes redacted audit evidence", async () => {
    const auditLogEntries: unknown[] = [];
    const publishCalls: string[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRepositories({ auditLogEntries, publishCalls }),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.resources.publish.POST(
      new Request(
        "http://localhost/api/v1/resources/resource-public-draft/publish",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      {
        params: Promise.resolve({ publicId: "resource-public-draft" }),
      },
    );
    const payload = await response.json();

    expect(payload).toMatchObject({
      code: 0,
      message: "ok",
      data: {
        resource: {
          publicId: "resource-public-draft",
          resourceStatus: "published",
          isVectorStale: true,
          publishedAt: updatedAt.toISOString(),
          indexingErrorSummary: null,
        },
      },
    });
    expect(publishCalls).toEqual(["resource-public-draft"]);
    expect(auditLogEntries).toEqual([
      expect.objectContaining({
        actionType: "resource.publish_markdown",
        targetResourceType: "resource",
        targetPublicId: "resource-public-draft",
        resultStatus: "success",
        metadataSummary: "redacted resource publish metadata",
      }),
    ]);
    expect(JSON.stringify(payload)).not.toContain("bounded fixture markdown");
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });

  it("creates external citation source DTOs without raw chunk text or text hashes", () => {
    const retrievalResult = buildRagRetrievalContextFromChunks({
      query: "customer demand",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: ["resource-public-ready"],
      chunks: [
        {
          chunkPublicId: "chunk-public-ready",
          resourcePublicId: "resource-public-ready",
          resourceTitle: "营销资料",
          resourceStatus: "rag_ready",
          profession: "marketing",
          level: 3,
          headingPath: ["客户需求"],
          chunkIndex: 1,
          text: "customer demand raw chunk text for internal AI only",
          textHash: "raw-text-hash",
        },
      ],
    });

    const citationSources = createRagCitationSourceDtos(
      retrievalResult.citations,
    );
    const serializedSources = JSON.stringify(citationSources);

    expect(citationSources).toEqual([
      {
        chunkPublicId: "chunk-public-ready",
        resourcePublicId: "resource-public-ready",
        resourceTitle: "营销资料",
        headingPath: ["客户需求"],
        chunkIndex: 1,
        score: 1,
      },
    ]);
    expect(serializedSources).not.toContain("raw chunk text");
    expect(serializedSources).not.toContain("raw-text-hash");
  });

  it("records indexing before saving the final vector rebuild result", async () => {
    const lifecycleEvents: string[] = [];
    const auditLogEntries: unknown[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: {
        ...createRepositories({ auditLogEntries, publishCalls: [] }),
        resourceRepository: {
          ...createRepositories({ auditLogEntries, publishCalls: [] })
            .resourceRepository,
          async markResourceIndexingStarted(publicId: string) {
            lifecycleEvents.push(`indexing:${publicId}`);
          },
          async saveResourceIndexingResult(result) {
            lifecycleEvents.push(`${result.status}:${result.resourcePublicId}`);

            return {
              publicId: result.resourcePublicId,
              title: "安全知识库草稿",
              resourceType: "knowledge_doc",
              resourceStatus:
                result.status === "success" ? "rag_ready" : "index_failed",
              profession: "marketing",
              level: 3,
              originalFileName: "safe-knowledge.md",
              downloadAvailable: true,
              markdownPreviewAvailable: true,
              isVectorStale: false,
              publishedAt: updatedAt.toISOString(),
              indexingErrorSummary: result.indexingErrorMessage,
              uploadedAt: createdAt.toISOString(),
              updatedAt: updatedAt.toISOString(),
            };
          },
        },
      },
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.resources.rebuildVector.POST(
      new Request(
        "http://localhost/api/v1/resources/resource-public-draft/rebuild-vector",
        {
          method: "POST",
          headers: { authorization: "Bearer admin-session-token" },
        },
      ),
      {
        params: Promise.resolve({ publicId: "resource-public-draft" }),
      },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resourceVector: {
          resourcePublicId: "resource-public-draft",
          resourceStatus: "rag_ready",
        },
      },
    });
    expect(lifecycleEvents).toEqual([
      "indexing:resource-public-draft",
      "success:resource-public-draft",
    ]);
  });
});
