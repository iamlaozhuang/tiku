import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";
import type {
  RagResourceKnowledgeAuditLogRepository,
  RagResourceKnowledgeRuntimeRepositoriesWithAudit,
} from "@/server/services/rag-resource-knowledge-runtime";
import type { RagResourceRuntimeRepository } from "@/server/repositories/rag-resource-knowledge-runtime-repository";
import type { SessionService } from "@/server/services/session-service";

const sourceContentHash = "a".repeat(64);
const markdownContentHash = "b".repeat(64);
const updatedAt = "2026-07-22T08:00:00.000Z";

const resourceSummary = {
  publicId: "resource-public-lineage",
  title: "来源明确的资源",
  resourceType: "knowledge_doc" as const,
  resourceStatus: "draft" as const,
  profession: "marketing" as const,
  level: 3,
  levelList: [3],
  knowledgeNodePublicIds: [],
  originalFileName: "source.md",
  downloadAvailable: true,
  markdownPreviewAvailable: true,
  isVectorStale: false,
  publishedAt: null,
  indexingErrorSummary: null,
  uploadedAt: "2026-07-22T07:00:00.000Z",
  updatedAt,
};

function createAdminSessionService(): Pick<
  SessionService,
  "getCurrentSession"
> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-22T18:00:00.000Z" },
          user: {
            publicId: "user-public-lineage",
            phone: "13800000000",
            name: "Resource Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-lineage",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  updateResourceMarkdown: NonNullable<
    RagResourceRuntimeRepository["updateResourceMarkdown"]
  >;
  appendAuditLog?: RagResourceKnowledgeAuditLogRepository["appendAuditLog"];
}): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  const repositories: RagResourceKnowledgeRuntimeRepositoriesWithAudit = {
    auditLogRepository: {
      appendAuditLog: input.appendAuditLog ?? vi.fn(async () => undefined),
    },
    knowledgeNodeRepository: {
      listKnowledgeNodes: vi.fn(),
      createKnowledgeNode: vi.fn(),
      updateKnowledgeNode: vi.fn(),
      disableKnowledgeNode: vi.fn(),
    },
    resourceRepository: {
      listResources: vi.fn(),
      findResourceDetail: vi.fn(async () => ({
        resource: resourceSummary,
        markdownContent: "# 转换草稿",
        sourceContentHash,
        markdownContentHash,
      })),
      updateResourceMarkdown: input.updateResourceMarkdown,
      publishResourceMarkdown: vi.fn(),
      findResourceForIndexing: vi.fn(),
    },
  };

  return repositories;
}

function createPatchRequest(body: unknown): Request {
  return new Request(
    "http://localhost/api/v1/resources/resource-public-lineage",
    {
      body: JSON.stringify(body),
      headers: {
        authorization: "Bearer admin-session-token",
        "content-type": "application/json",
      },
      method: "PATCH",
    },
  );
}

describe("F-0086 resource Markdown lineage guard", () => {
  it("binds a review save to source, prior Markdown, and updatedAt facts", async () => {
    const updateResourceMarkdown = vi.fn(async () => ({
      status: "updated" as const,
      resource: { ...resourceSummary, updatedAt: "2026-07-22T08:01:00.000Z" },
    }));
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRepositories({ updateResourceMarkdown }),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.resources.detail.PATCH(
      createPatchRequest({
        markdownContent: "# 已校对草稿",
        expectedSourceContentHash: sourceContentHash,
        expectedMarkdownContentHash: markdownContentHash,
        expectedUpdatedAt: updatedAt,
      }),
      { params: Promise.resolve({ publicId: resourceSummary.publicId }) },
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { resource: { publicId: resourceSummary.publicId } },
    });
    expect(updateResourceMarkdown).toHaveBeenCalledWith(
      expect.objectContaining({
        publicId: resourceSummary.publicId,
        expectedSourceContentHash: sourceContentHash,
        expectedMarkdownContentHash: markdownContentHash,
        expectedUpdatedAt: updatedAt,
      }),
    );
  });

  it.each([
    {
      markdownContent: "# 缺来源",
      expectedMarkdownContentHash: markdownContentHash,
      expectedUpdatedAt: updatedAt,
    },
    {
      markdownContent: "# 缺正文版本",
      expectedSourceContentHash: sourceContentHash,
      expectedUpdatedAt: updatedAt,
    },
    {
      markdownContent: "# 缺资源版本",
      expectedSourceContentHash: sourceContentHash,
      expectedMarkdownContentHash: markdownContentHash,
    },
  ])(
    "rejects an incomplete conditional command before mutation",
    async (body) => {
      const updateResourceMarkdown = vi.fn();
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        repositories: createRepositories({ updateResourceMarkdown }),
        sessionService: createAdminSessionService(),
      });

      const response = await handlers.resources.detail.PATCH(
        createPatchRequest(body),
        { params: Promise.resolve({ publicId: resourceSummary.publicId }) },
      );

      await expect(response.json()).resolves.toMatchObject({ data: null });
      expect(updateResourceMarkdown).not.toHaveBeenCalled();
    },
  );

  it("rejects oversized Markdown before mutation", async () => {
    const updateResourceMarkdown = vi.fn();
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRepositories({ updateResourceMarkdown }),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.resources.detail.PATCH(
      createPatchRequest({
        markdownContent: "中".repeat(1_048_577),
        expectedSourceContentHash: sourceContentHash,
        expectedMarkdownContentHash: markdownContentHash,
        expectedUpdatedAt: updatedAt,
      }),
      { params: Promise.resolve({ publicId: resourceSummary.publicId }) },
    );

    await expect(response.json()).resolves.toMatchObject({ data: null });
    expect(updateResourceMarkdown).not.toHaveBeenCalled();
  });

  it("maps stale or ineligible repository results to a conflict", async () => {
    const updateResourceMarkdown = vi.fn(async () => ({
      status: "conflict" as const,
      reason: "resource_not_editable" as const,
    }));
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      repositories: createRepositories({ updateResourceMarkdown }),
      sessionService: createAdminSessionService(),
    });

    const response = await handlers.resources.detail.PATCH(
      createPatchRequest({
        markdownContent: "# 不应保存",
        expectedSourceContentHash: sourceContentHash,
        expectedMarkdownContentHash: markdownContentHash,
        expectedUpdatedAt: updatedAt,
      }),
      { params: Promise.resolve({ publicId: resourceSummary.publicId }) },
    );
    const payload = await response.json();

    expect(payload.code).not.toBe(0);
    expect(payload.data).toBeNull();
  });

  it("keeps status, lineage, revision, mutation, and success audit in one transaction", () => {
    const repositorySource = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
      ),
      "utf8",
    );
    const methodStart = repositorySource.indexOf(
      "async updateResourceMarkdown",
    );
    const methodEnd = repositorySource.indexOf(
      "\n    async disableResource",
      methodStart,
    );
    const methodSource = repositorySource.slice(methodStart, methodEnd);

    expect(methodSource).toContain(
      'inArray(resource.resource_status, ["draft", "rag_ready"])',
    );
    expect(methodSource).toContain(
      "eq(resource.content_hash, input.expectedSourceContentHash)",
    );
    expect(methodSource).toContain("resource.markdown_content_hash,");
    expect(methodSource).toContain("input.expectedMarkdownContentHash,");
    expect(methodSource).toContain(
      "eq(resource.updated_at, expectedUpdatedAt)",
    );
    expect(
      methodSource.indexOf("appendResourceMutationAuditLog"),
    ).toBeGreaterThan(methodSource.indexOf(".returning("));
  });
});
