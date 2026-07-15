import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  buildLocalResourceRagRetrievalResult,
  createRagResourceKnowledgeRuntimeRouteHandlers,
  type RagResourceKnowledgeRuntimeRepositoriesWithAudit,
} from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";

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
            expiresAt: "2026-05-29T12:00:00.000Z",
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
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createLocalOnlyRepositories(): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  return {
    resourceRepository: {
      async listResources(query) {
        return {
          resources: [],
          pagination: {
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            total: 0,
          },
        };
      },
      async publishResourceMarkdown() {
        return { status: "not_found" };
      },
      async findResourceForIndexing() {
        return null;
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
        return null;
      },
      async updateKnowledgeNode() {
        return null;
      },
      async disableKnowledgeNode() {
        return null;
      },
    },
    auditLogRepository: {
      async appendAuditLog() {
        return undefined;
      },
    },
  };
}

async function uploadPublishAndRebuildResource(input: {
  storageRoot: string;
  markdownContent: string;
}) {
  const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
    localResourceStorageRoot: input.storageRoot,
    repositories: createLocalOnlyRepositories(),
    sessionService: createAdminSessionService(),
  });
  const formData = new FormData();

  formData.set("title", "Local vector lifecycle note");
  formData.set("profession", "marketing");
  formData.set("level", "3");
  formData.set("resourceType", "knowledge_doc");
  formData.set("fileName", "local-vector-lifecycle.md");
  formData.set(
    "file",
    new File([input.markdownContent], "local-vector-lifecycle.md", {
      type: "text/markdown",
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
  const resourcePublicId = uploadPayload.data.resource.publicId as string;

  await handlers.resources.publish.POST(
    new Request(
      `http://localhost/api/v1/resources/${resourcePublicId}/publish`,
      {
        headers: { authorization: "Bearer admin-session-token" },
        method: "POST",
      },
    ),
    { params: Promise.resolve({ publicId: resourcePublicId }) },
  );

  await handlers.resources.rebuildVector.POST(
    new Request(
      `http://localhost/api/v1/resources/${resourcePublicId}/rebuild-vector`,
      {
        headers: { authorization: "Bearer admin-session-token" },
        method: "POST",
      },
    ),
    { params: Promise.resolve({ publicId: resourcePublicId }) },
  );

  return { handlers, resourcePublicId };
}

describe("phase 20 RA-05-06 local vector rebuild stale marker", () => {
  it("preserves old chunks with stale citation markers until a successful rebuild switches atomically", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-vector-stale-"));
    const { handlers, resourcePublicId } =
      await uploadPublishAndRebuildResource({
        storageRoot,
        markdownContent:
          "# Legacy vector\n\nlegacy permit renewal alpha phrase keeps old vector evidence.",
      });
    const initialRetrieval = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "legacy permit renewal alpha",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [resourcePublicId],
    });
    const initialChunkPublicId = initialRetrieval.citations[0]?.chunkPublicId;

    await handlers.resources.detail.PATCH(
      new Request(`http://localhost/api/v1/resources/${resourcePublicId}`, {
        body: JSON.stringify({
          markdownContent:
            "# Fresh vector\n\nfresh compliance beta phrase should wait for rebuild.",
        }),
        headers: {
          authorization: "Bearer admin-session-token",
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );

    const staleRetrieval = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "legacy permit renewal alpha",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [resourcePublicId],
    });

    expect(staleRetrieval.citations).toEqual([
      expect.objectContaining({
        resourcePublicId,
        isStale: true,
      }),
    ]);
    expect(staleRetrieval.evidenceSummary).toMatchObject({
      staleCitationCount: 1,
      staleResourcePublicIds: [resourcePublicId],
    });
    expect(staleRetrieval.citations[0]?.chunkPublicId).toBe(
      initialChunkPublicId,
    );

    const freshBeforeRebuild = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "fresh compliance beta",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [resourcePublicId],
    });

    expect(freshBeforeRebuild.citations[0]?.chunkPublicId).toBe(
      initialChunkPublicId,
    );

    await handlers.resources.rebuildVector.POST(
      new Request(
        `http://localhost/api/v1/resources/${resourcePublicId}/rebuild-vector`,
        {
          headers: { authorization: "Bearer admin-session-token" },
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );

    const freshAfterRebuild = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "fresh compliance beta",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [resourcePublicId],
    });

    expect(freshAfterRebuild.citations).toEqual([
      expect.objectContaining({
        resourcePublicId,
        isStale: false,
      }),
    ]);
    expect(freshAfterRebuild.evidenceSummary).toMatchObject({
      staleCitationCount: 0,
      staleResourcePublicIds: [],
    });
    expect(freshAfterRebuild.citations[0]?.chunkPublicId).not.toBe(
      initialChunkPublicId,
    );
  });

  it("keeps the last active snapshot when a stale local rebuild fails", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-vector-failed-"));
    const { handlers, resourcePublicId } =
      await uploadPublishAndRebuildResource({
        storageRoot,
        markdownContent:
          "# Stable vector\n\nstable authorization gamma phrase remains usable.",
      });
    const initialRetrieval = await buildLocalResourceRagRetrievalResult({
      storageRoot,
      query: "stable authorization gamma",
      profession: "marketing",
      level: 3,
      authorizedResourcePublicIds: [resourcePublicId],
    });
    const initialChunkPublicId = initialRetrieval.citations[0]?.chunkPublicId;
    const catalogPath = join(storageRoot, "dev", "resource", "catalog.json");
    const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as {
      resources: Array<Record<string, unknown>>;
    };

    catalog.resources = catalog.resources.map((resource) =>
      resource.publicId === resourcePublicId
        ? {
            ...resource,
            markdownContent: null,
            markdownContentHash: null,
            isVectorStale: true,
          }
        : resource,
    );
    await writeFile(catalogPath, JSON.stringify(catalog, null, 2));

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
      code: 422621,
      data: null,
    });

    const retrievalAfterFailedRebuild =
      await buildLocalResourceRagRetrievalResult({
        storageRoot,
        query: "stable authorization gamma",
        profession: "marketing",
        level: 3,
        authorizedResourcePublicIds: [resourcePublicId],
      });

    expect(retrievalAfterFailedRebuild.citations).toEqual([
      expect.objectContaining({
        resourcePublicId,
        isStale: true,
      }),
    ]);
    expect(retrievalAfterFailedRebuild.citations[0]?.chunkPublicId).toBe(
      initialChunkPublicId,
    );
  });
});
