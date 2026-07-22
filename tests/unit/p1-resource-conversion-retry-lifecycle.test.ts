import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";

const resourcePublicId = "resource-conversion-retry-public-1";
const claimVersion = "2026-07-22T12:00:00.000Z";
const repositorySource = readFileSync(
  join(
    process.cwd(),
    "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
  ),
  "utf8",
);

function createSessionService(
  roles: ReadonlyArray<
    "content_admin" | "ops_admin" | "student" | "super_admin"
  > | null,
): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      if (roles === null) {
        return { code: 401001, message: "unauthorized", data: null };
      }

      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-22T20:00:00.000Z" },
          user: {
            publicId: "resource-retry-user-public-1",
            phone: "13800000082",
            name: "Resource Retry Actor",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "resource-retry-admin-public-1",
            adminRoles: roles.filter(
              (role): role is "content_admin" | "ops_admin" | "super_admin" =>
                role !== "student",
            ),
          },
        },
      };
    },
  };
}

function createResourceSummary(
  resourceStatus: "conversion_failed" | "converting" | "draft" | "uploaded",
) {
  return {
    publicId: resourcePublicId,
    title: "受控转换重试资料",
    resourceType: "knowledge_doc" as const,
    resourceStatus,
    profession: "marketing" as const,
    level: 3,
    levelList: [3],
    knowledgeNodePublicIds: [],
    originalFileName: "controlled-retry.md",
    downloadAvailable: true,
    markdownPreviewAvailable: resourceStatus === "draft",
    isVectorStale: false,
    publishedAt: null,
    indexingErrorSummary:
      resourceStatus === "conversion_failed" ? "redacted_indexing_error" : null,
    uploadedAt: "2026-07-22T11:00:00.000Z",
    updatedAt: claimVersion,
  };
}

async function createStoredMarkdown() {
  const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-retry-"));
  const bytes = Buffer.from(
    "# 受控转换重试\n\n只允许匹配 claim 完成。",
    "utf8",
  );
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const objectStoragePath = `dev/resource/marketing/202607/${contentHash}.md`;
  const targetPath = join(storageRoot, ...objectStoragePath.split("/"));
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, bytes);
  return {
    contentHash,
    fileSizeByte: bytes.length,
    objectStoragePath,
    storageRoot,
  };
}

function createRepositories(input: {
  contentHash: string;
  fileSizeByte: number;
  objectStoragePath: string;
  claimResult?: unknown;
  finalizeResult?: unknown;
}) {
  const appendAuditLog = vi.fn(async () => undefined);
  const claimResourceConversion = vi.fn(async () =>
    input.claimResult === undefined
      ? {
          status: "claimed",
          claim: {
            publicId: resourcePublicId,
            claimVersion,
            objectStoragePath: input.objectStoragePath,
            originalFileName: "controlled-retry.md",
            contentHash: input.contentHash,
            fileSizeByte: input.fileSizeByte,
            profession: "marketing",
          },
        }
      : input.claimResult,
  );
  const finalizeResourceConversion = vi.fn(async () =>
    input.finalizeResult === undefined
      ? { status: "completed", resource: createResourceSummary("draft") }
      : input.finalizeResult,
  );

  return {
    calls: {
      appendAuditLog,
      claimResourceConversion,
      finalizeResourceConversion,
    },
    repositories: {
      resourceRepository: {
        claimResourceConversion,
        finalizeResourceConversion,
        async listResources() {
          return {
            resources: [],
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "updatedAt",
              sortOrder: "desc",
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
        async listKnowledgeNodes() {
          return {
            knowledgeNodes: [],
            pagination: {
              page: 1,
              pageSize: 20,
              sortBy: "updatedAt",
              sortOrder: "desc",
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
      auditLogRepository: { appendAuditLog },
    },
  };
}

function createRetryRequest() {
  return new Request(
    `http://localhost/api/v1/resources/${resourcePublicId}/retry-conversion`,
    {
      headers: { authorization: "Bearer resource-retry-session" },
      method: "POST",
    },
  );
}

const routeContext = {
  params: Promise.resolve({ publicId: resourcePublicId }),
};

describe("F-0082 durable resource conversion retry lifecycle", () => {
  it.each([
    { roles: null, expectedStatus: 401 },
    { roles: ["student"] as const, expectedStatus: 401 },
    { roles: ["ops_admin"] as const, expectedStatus: 403 },
  ])(
    "rejects an unauthorized retry before repository or file access",
    async ({ roles, expectedStatus }) => {
      const { contentHash, fileSizeByte, objectStoragePath, storageRoot } =
        await createStoredMarkdown();
      const { calls, repositories } = createRepositories({
        contentHash,
        fileSizeByte,
        objectStoragePath,
      });
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        localResourceStorageRoot: storageRoot,
        useLocalResourceAdapter: false,
        repositories,
        sessionService: createSessionService(roles),
      } as never);

      const response = await handlers.resources.retryConversion.POST(
        createRetryRequest(),
        routeContext,
      );

      expect(response.status).toBe(expectedStatus);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(calls.claimResourceConversion).not.toHaveBeenCalled();
      expect(calls.finalizeResourceConversion).not.toHaveBeenCalled();
    },
  );

  it.each(["content_admin", "super_admin"] as const)(
    "claims and finalizes a retry for %s with one authoritative version",
    async (role) => {
      const { contentHash, fileSizeByte, objectStoragePath, storageRoot } =
        await createStoredMarkdown();
      const { calls, repositories } = createRepositories({
        contentHash,
        fileSizeByte,
        objectStoragePath,
      });
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        localResourceStorageRoot: storageRoot,
        useLocalResourceAdapter: false,
        repositories,
        sessionService: createSessionService([role]),
      } as never);

      const response = await handlers.resources.retryConversion.POST(
        createRetryRequest(),
        routeContext,
      );
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(payload).toMatchObject({
        code: 0,
        data: { resource: { resourceStatus: "draft" } },
      });
      expect(calls.claimResourceConversion).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: resourcePublicId,
          staleBefore: expect.any(Date),
        }),
      );
      expect(calls.finalizeResourceConversion).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: resourcePublicId,
          claimVersion,
          resourceStatus: "draft",
          markdownContent: expect.stringContaining("受控转换重试"),
          markdownContentHash: expect.stringMatching(/^[a-f0-9]{64}$/u),
          conversionErrorMessage: null,
          mutationContext: expect.objectContaining({
            auditLog: expect.objectContaining({
              actionType: "resource.retry_conversion",
            }),
          }),
        }),
      );
      expect(calls.appendAuditLog).not.toHaveBeenCalled();
    },
  );

  it("returns a conflict without parsing when another non-stale claim is active", async () => {
    const { contentHash, fileSizeByte, objectStoragePath, storageRoot } =
      await createStoredMarkdown();
    const { calls, repositories } = createRepositories({
      contentHash,
      fileSizeByte,
      objectStoragePath,
      claimResult: { status: "conflict", reason: "conversion_active" },
    });
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createSessionService(["content_admin"]),
    } as never);

    const response = await handlers.resources.retryConversion.POST(
      createRetryRequest(),
      routeContext,
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload.code).not.toBe(0);
    expect(payload.data).toBeNull();
    expect(calls.finalizeResourceConversion).not.toHaveBeenCalled();
  });

  it("persists a redacted conversion failure and returns a non-success command result", async () => {
    const { contentHash, fileSizeByte, objectStoragePath, storageRoot } =
      await createStoredMarkdown();
    await writeFile(
      join(storageRoot, ...objectStoragePath.split("/")),
      new Uint8Array([0xc3, 0x28]),
    );
    const { calls, repositories } = createRepositories({
      contentHash,
      fileSizeByte,
      objectStoragePath,
      finalizeResult: {
        status: "completed",
        resource: createResourceSummary("conversion_failed"),
      },
    });
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createSessionService(["content_admin"]),
    } as never);

    const response = await handlers.resources.retryConversion.POST(
      createRetryRequest(),
      routeContext,
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.code).not.toBe(0);
    expect(payload.data).toBeNull();
    expect(calls.finalizeResourceConversion).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceStatus: "conversion_failed",
        markdownContent: null,
        markdownContentHash: null,
        conversionErrorMessage: "conversion_failed",
      }),
    );
    expect(
      JSON.stringify(calls.finalizeResourceConversion.mock.calls),
    ).not.toContain(storageRoot);
  });

  it("requires repository receipt, claim, and finalize transactions to bind state and version", () => {
    const receiptStart = repositorySource.indexOf(
      "async function completeResourceUploadReceipt",
    );
    const claimStart = repositorySource.indexOf(
      "async function claimResourceConversion",
    );
    const finalizeStart = repositorySource.indexOf(
      "async function finalizeResourceConversion",
    );
    const receiptSource = repositorySource.slice(receiptStart, claimStart);
    const claimSource = repositorySource.slice(claimStart, finalizeStart);
    const finalizeSource = repositorySource.slice(
      finalizeStart,
      repositorySource.indexOf("\nasync function", finalizeStart + 1),
    );

    expect(receiptStart).toBeGreaterThan(-1);
    expect(claimStart).toBeGreaterThan(receiptStart);
    expect(finalizeStart).toBeGreaterThan(claimStart);
    expect(receiptSource).toContain("database.transaction(async (transaction)");
    expect(receiptSource).toContain('resourceStatus: "uploaded"');
    expect(receiptSource).toContain('operation_status: "completed"');
    expect(receiptSource).toContain("await appendResourceMutationAuditLog(");
    expect(claimSource).toContain('.for("update")');
    expect(claimSource).toContain('resource_status: "converting"');
    expect(claimSource).toContain("staleBefore");
    expect(finalizeSource).toContain(
      "database.transaction(async (transaction)",
    );
    expect(finalizeSource).toContain("input.claimVersion");
    expect(finalizeSource).toContain("resource.updated_at");
    expect(finalizeSource).toContain("await appendResourceMutationAuditLog(");
  });
});
