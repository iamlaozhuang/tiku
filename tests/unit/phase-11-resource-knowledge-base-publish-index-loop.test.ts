import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  createRagCitationSourceDtos,
  buildRagRetrievalContextFromChunks,
} from "@/server/services/rag-retrieval-service";
import {
  buildLocalResourceRagRetrievalResult,
  createRagResourceKnowledgeRuntimeRouteHandlers,
} from "@/server/services/rag-resource-knowledge-runtime";
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
              knowledgeNodePublicIds: [],
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
          knowledgeNodePublicIds: [],
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
            knowledgeNodePublicIds: [],
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
              knowledgeNodePublicIds: [],
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

  it("runs a local-only upload, markdown review, publish, rebuild, and disable lifecycle without exposing storage internals", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-local-resource-"));
    const auditLogEntries: unknown[] = [];
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      repositories: createRepositories({ auditLogEntries, publishCalls: [] }),
      sessionService: createAdminSessionService(),
    });
    const formData = new FormData();

    formData.set("title", "本地资源验证讲义");
    formData.set("profession", "marketing");
    formData.set("level", "3");
    formData.set("resourceType", "knowledge_doc");
    formData.set("fileName", "local-resource.md");
    formData.set(
      "file",
      new File(
        ["# 本地资源验证\n\n受控测试资料摘要\n\n## 第一节\n\n向量处理片段"],
        "local-resource.md",
        { type: "text/markdown" },
      ),
    );

    const uploadResponse = await handlers.resources.collection.POST(
      new Request("http://localhost/api/v1/resources", {
        body: formData,
        headers: { authorization: "Bearer admin-session-token" },
        method: "POST",
      }),
    );
    const uploadPayload = await uploadResponse.json();
    expect(uploadPayload).toMatchObject({ code: 0 });
    const resourcePublicId = uploadPayload.data.resource.publicId as string;

    expect(uploadPayload).toMatchObject({
      code: 0,
      data: {
        resource: {
          title: "本地资源验证讲义",
          resourceStatus: "draft",
          profession: "marketing",
          level: 3,
          markdownPreviewAvailable: true,
          downloadAvailable: true,
        },
        localResource: {
          parserMode: "local_only",
          chunkCandidateCount: expect.any(Number),
          redactedPreview: expect.stringMatching(
            /^\[redacted:[a-f0-9]{12}\]$/u,
          ),
        },
      },
    });
    expect(JSON.stringify(uploadPayload)).not.toContain(storageRoot);
    expect(JSON.stringify(uploadPayload)).not.toContain("受控测试资料摘要");

    const listResponse = await handlers.resources.collection.GET(
      new Request("http://localhost/api/v1/resources?page=1&pageSize=20", {
        headers: { authorization: "Bearer admin-session-token" },
      }),
    );
    await expect(listResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resources: expect.arrayContaining([
          expect.objectContaining({
            publicId: resourcePublicId,
            resourceStatus: "draft",
          }),
        ]),
      },
    });

    const detailResponse = await handlers.resources.detail.GET(
      new Request(`http://localhost/api/v1/resources/${resourcePublicId}`, {
        headers: { authorization: "Bearer admin-session-token" },
      }),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    await expect(detailResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        localOnly: true,
        markdownContent: expect.any(String),
      },
    });

    const updateResponse = await handlers.resources.detail.PATCH(
      new Request(`http://localhost/api/v1/resources/${resourcePublicId}`, {
        body: JSON.stringify({
          markdownContent: "# 本地资源验证\n\n## 第一节\n\n已校对摘要",
        }),
        headers: {
          authorization: "Bearer admin-session-token",
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    await expect(updateResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resource: { publicId: resourcePublicId, resourceStatus: "draft" },
      },
    });

    const publishResponse = await handlers.resources.publish.POST(
      new Request(
        `http://localhost/api/v1/resources/${resourcePublicId}/publish`,
        {
          headers: { authorization: "Bearer admin-session-token" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    await expect(publishResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resource: {
          publicId: resourcePublicId,
          resourceStatus: "published",
          isVectorStale: true,
        },
      },
    });

    const rebuildResponse = await handlers.resources.rebuildVector.POST(
      new Request(
        `http://localhost/api/v1/resources/${resourcePublicId}/rebuild-vector`,
        {
          headers: { authorization: "Bearer admin-session-token" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    await expect(rebuildResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resourceVector: {
          resourcePublicId,
          resourceStatus: "rag_ready",
          chunkCount: expect.any(Number),
        },
      },
    });

    const disableResponse = await handlers.resources.disable.POST(
      new Request(
        `http://localhost/api/v1/resources/${resourcePublicId}/disable`,
        {
          headers: { authorization: "Bearer admin-session-token" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    await expect(disableResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resource: {
          publicId: resourcePublicId,
          resourceStatus: "disabled",
        },
      },
    });

    await expect(
      buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: "本地资源验证",
        profession: "marketing",
        level: 3,
        authorizedResourcePublicIds: [resourcePublicId],
      }),
    ).resolves.toMatchObject({
      evidenceStatus: "none",
      citations: [],
    });

    const enableResponse = await handlers.resources.enable.POST(
      new Request(
        `http://localhost/api/v1/resources/${resourcePublicId}/enable`,
        {
          headers: { authorization: "Bearer admin-session-token" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    await expect(enableResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resource: {
          publicId: resourcePublicId,
          resourceStatus: "rag_ready",
          isVectorStale: false,
        },
      },
    });

    const restoredRetrievalResult = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "本地资源验证",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [resourcePublicId],
    });

    expect(restoredRetrievalResult.evidenceStatus).not.toBe("none");
    expect(restoredRetrievalResult.citations).toEqual([
      expect.objectContaining({ resourcePublicId }),
    ]);
    expect(auditLogEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionType: "resource.enable",
          targetResourceType: "resource",
          targetPublicId: resourcePublicId,
          resultStatus: "success",
          metadataSummary: "redacted local resource enable metadata",
        }),
      ]),
    );
    expect(JSON.stringify(auditLogEntries)).not.toContain(
      "admin-session-token",
    );
  });

  it("builds local RAG retrieval citations from rag_ready resources only", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-local-rag-"));
    const catalogDir = join(storageRoot, "dev", "resource");
    const catalogPath = join(catalogDir, "catalog.json");
    const resourcePublicId = "resource-local-citation";

    await mkdir(catalogDir, { recursive: true });
    await writeFile(
      catalogPath,
      JSON.stringify(
        {
          resources: [
            {
              publicId: resourcePublicId,
              title: "Local Citation Resource",
              resourceType: "knowledge_doc",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              originalFileName: "local-citation.md",
              objectKey: "dev/resource/marketing/202605/local-citation.md",
              contentType: "text/markdown",
              fileSizeByte: 180,
              fileHash: "local-citation-file-hash",
              markdownContent: [
                "# Marketing Citation",
                "",
                "marketing citation keyword controlled first passage",
                "",
                "## Retail Rule",
                "",
                "marketing citation keyword controlled second passage",
              ].join("\n"),
              markdownContentHash: "local-citation-markdown-hash",
              indexingErrorMessage: null,
              isVectorStale: false,
              publishedAt: "2026-05-25T08:00:00.000Z",
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              disabledFromStatus: null,
              chunkCount: 2,
              textHashes: ["redacted-hash-1", "redacted-hash-2"],
              headingPaths: [["Marketing Citation"], ["Retail Rule"]],
            },
            {
              publicId: "resource-local-disabled",
              title: "Disabled Citation Resource",
              resourceType: "knowledge_doc",
              resourceStatus: "disabled",
              profession: "marketing",
              level: 3,
              originalFileName: "disabled-citation.md",
              objectKey: "dev/resource/marketing/202605/disabled-citation.md",
              contentType: "text/markdown",
              fileSizeByte: 120,
              fileHash: "disabled-citation-file-hash",
              markdownContent: "marketing citation keyword disabled passage",
              markdownContentHash: "disabled-citation-markdown-hash",
              indexingErrorMessage: null,
              isVectorStale: false,
              publishedAt: "2026-05-25T08:00:00.000Z",
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              disabledFromStatus: "rag_ready",
              chunkCount: 1,
              textHashes: ["redacted-disabled-hash"],
              headingPaths: [[]],
            },
          ],
        },
        null,
        2,
      ),
    );

    const retrievalResult = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "marketing citation keyword",
      profession: "marketing",
      level: 3,
    });
    const serializedEvidence = JSON.stringify(retrievalResult.evidenceSummary);

    expect(retrievalResult.evidenceStatus).toBe("sufficient");
    expect(retrievalResult.citations).toHaveLength(2);
    expect(retrievalResult.citations[0]).toMatchObject({
      resourcePublicId,
      resourceTitle: "Local Citation Resource",
    });
    expect(serializedEvidence).not.toContain("controlled first passage");
    expect(serializedEvidence).not.toContain("controlled second passage");

    await expect(
      buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: "marketing citation keyword",
        profession: "marketing",
        level: 3,
        authorizedResourcePublicIds: ["resource-local-disabled"],
      }),
    ).resolves.toMatchObject({
      evidenceStatus: "none",
      citations: [],
    });
  });

  it("filters local RAG retrieval by declared knowledge node scope", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-local-rag-kn-"));
    const catalogDir = join(storageRoot, "dev", "resource");
    const catalogPath = join(catalogDir, "catalog.json");

    await mkdir(catalogDir, { recursive: true });
    await writeFile(
      catalogPath,
      JSON.stringify(
        {
          resources: [
            {
              publicId: "resource-local-retail-rule",
              title: "Retail Rule Resource",
              resourceType: "knowledge_doc",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              originalFileName: "retail-rule.md",
              objectKey: "dev/resource/marketing/202605/retail-rule.md",
              contentType: "text/markdown",
              fileSizeByte: 180,
              fileHash: "retail-rule-file-hash",
              markdownContent:
                "marketing scoped keyword retail rule explanation",
              markdownContentHash: "retail-rule-markdown-hash",
              indexingErrorMessage: null,
              isVectorStale: false,
              publishedAt: "2026-05-25T08:00:00.000Z",
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              disabledFromStatus: null,
              chunkCount: 1,
              textHashes: ["retail-rule-text-hash"],
              headingPaths: [["Retail Rule"]],
              knowledgeNodePublicIds: ["knowledge-node-retail-rule"],
            },
            {
              publicId: "resource-local-unrelated",
              title: "Unrelated Resource",
              resourceType: "knowledge_doc",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              originalFileName: "unrelated.md",
              objectKey: "dev/resource/marketing/202605/unrelated.md",
              contentType: "text/markdown",
              fileSizeByte: 180,
              fileHash: "unrelated-file-hash",
              markdownContent: "marketing scoped keyword unrelated explanation",
              markdownContentHash: "unrelated-markdown-hash",
              indexingErrorMessage: null,
              isVectorStale: false,
              publishedAt: "2026-05-25T08:00:00.000Z",
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              disabledFromStatus: null,
              chunkCount: 1,
              textHashes: ["unrelated-text-hash"],
              headingPaths: [["Unrelated"]],
              knowledgeNodePublicIds: ["knowledge-node-unrelated"],
            },
          ],
        },
        null,
        2,
      ),
    );

    const scopedResult = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "marketing scoped keyword",
      profession: "marketing",
      level: 3,
      knowledgeNodePublicIds: ["knowledge-node-retail-rule"],
    });

    expect(scopedResult.evidenceStatus).toBe("weak");
    expect(scopedResult.citations).toEqual([
      expect.objectContaining({
        resourcePublicId: "resource-local-retail-rule",
      }),
    ]);

    await expect(
      buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: "marketing scoped keyword",
        profession: "marketing",
        level: 3,
        knowledgeNodePublicIds: ["knowledge-node-missing"],
      }),
    ).resolves.toMatchObject({
      evidenceStatus: "none",
      citations: [],
    });
  });

  it("filters local AI generation RAG scope by subject and selected descendant knowledge node bindings", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-rag-scope-"));
    const catalogDir = join(storageRoot, "dev", "resource");
    const catalogPath = join(catalogDir, "catalog.json");

    await mkdir(catalogDir, { recursive: true });
    await writeFile(
      catalogPath,
      JSON.stringify(
        {
          resources: [
            {
              publicId: "resource-local-theory-child",
              title: "Theory Child Resource",
              resourceType: "knowledge_doc",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              subject: "theory",
              originalFileName: "theory-child.md",
              objectKey: "dev/resource/marketing/202605/theory-child.md",
              contentType: "text/markdown",
              fileSizeByte: 180,
              fileHash: "theory-child-file-hash",
              markdownContent:
                "marketing scoped descendant theory alpha explanation",
              markdownContentHash: "theory-child-markdown-hash",
              indexingErrorMessage: null,
              isVectorStale: false,
              publishedAt: "2026-05-25T08:00:00.000Z",
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              disabledFromStatus: null,
              chunkCount: 1,
              textHashes: ["theory-child-text-hash"],
              headingPaths: [["Theory Child"]],
              knowledgeNodePublicIds: ["knowledge-node-child"],
              knowledgeNodeAncestorPublicIds: ["knowledge-node-parent"],
            },
            {
              publicId: "resource-local-skill-child",
              title: "Skill Child Resource",
              resourceType: "knowledge_doc",
              resourceStatus: "rag_ready",
              profession: "marketing",
              level: 3,
              subject: "skill",
              originalFileName: "skill-child.md",
              objectKey: "dev/resource/marketing/202605/skill-child.md",
              contentType: "text/markdown",
              fileSizeByte: 180,
              fileHash: "skill-child-file-hash",
              markdownContent:
                "marketing scoped descendant skill alpha explanation",
              markdownContentHash: "skill-child-markdown-hash",
              indexingErrorMessage: null,
              isVectorStale: false,
              publishedAt: "2026-05-25T08:00:00.000Z",
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              disabledFromStatus: null,
              chunkCount: 1,
              textHashes: ["skill-child-text-hash"],
              headingPaths: [["Skill Child"]],
              knowledgeNodePublicIds: ["knowledge-node-child"],
              knowledgeNodeAncestorPublicIds: ["knowledge-node-parent"],
            },
          ],
        },
        null,
        2,
      ),
    );

    const descendantScopedResult = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "marketing scoped descendant alpha",
      profession: "marketing",
      level: 3,
      subject: "theory",
      knowledgeNodePublicIds: ["knowledge-node-parent"],
      includeDescendants: true,
    });

    expect(descendantScopedResult.citations).toEqual([
      expect.objectContaining({
        resourcePublicId: "resource-local-theory-child",
      }),
    ]);

    await expect(
      buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: "marketing scoped descendant alpha",
        profession: "marketing",
        level: 3,
        subject: "theory",
        knowledgeNodePublicIds: ["knowledge-node-parent"],
        includeDescendants: false,
      }),
    ).resolves.toMatchObject({
      evidenceStatus: "none",
      citations: [],
    });
  });

  it("marks DOCX PPTX and PDF local resource uploads as conversion failed without converter dependencies", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-formats-"));
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      repositories: createRepositories({
        auditLogEntries: [],
        publishCalls: [],
      }),
      sessionService: createAdminSessionService(),
    });
    const fileNames = [
      "controlled-resource.docx",
      "controlled-resource.pptx",
      "controlled-resource.pdf",
    ];

    for (const fileName of fileNames) {
      const formData = new FormData();

      formData.set("title", `${fileName} 本地转换验证`);
      formData.set("profession", "marketing");
      formData.set("level", "3");
      formData.set("resourceType", "knowledge_doc");
      formData.set("fileName", fileName);
      formData.set(
        "file",
        new File(["controlled binary placeholder"], fileName, {
          type: "application/octet-stream",
        }),
      );

      const uploadResponse = await handlers.resources.collection.POST(
        new Request("http://localhost/api/v1/resources", {
          body: formData,
          headers: { authorization: "Bearer admin-session-token" },
          method: "POST",
        }),
      );
      const uploadPayload = await uploadResponse.json();

      expect(uploadPayload).toMatchObject({
        code: 0,
        message: "ok",
        data: {
          resource: {
            originalFileName: fileName,
            resourceStatus: "conversion_failed",
            markdownPreviewAvailable: false,
            indexingErrorSummary: "converter_unavailable",
          },
          localResource: {
            parserMode: "local_only",
            markdownContentHash: null,
            charLength: 0,
            lineCount: 0,
            chunkCandidateCount: 0,
            headingPaths: [],
            redactedPreview: null,
            skippedReason: "converter_unavailable",
          },
        },
      });
      expect(JSON.stringify(uploadPayload)).not.toContain(storageRoot);
      expect(JSON.stringify(uploadPayload)).not.toContain(
        "controlled binary placeholder",
      );
    }
  });
});
