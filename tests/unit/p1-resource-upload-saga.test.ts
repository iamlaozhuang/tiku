import { readFileSync } from "node:fs";
import { readFile, readdir, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import * as localStorage from "@/server/services/local-paper-asset-storage";
import { createRagResourceKnowledgeRuntimeRouteHandlers } from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";

const uploadIdempotencyKey = "76aca5d6-a60b-4a4f-b8f7-7fca40b84609";
const repositorySource = readFileSync(
  join(
    process.cwd(),
    "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
  ),
  "utf8",
);

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
          session: { expiresAt: "2026-07-21T16:00:00.000Z" },
          user: {
            publicId: "admin-user-public-upload",
            phone: "13800000071",
            name: "Resource Upload Admin",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-public-upload",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createResourceSummary() {
  return {
    publicId: "resource-upload-public-1",
    title: "受控上传资料",
    resourceType: "knowledge_doc" as const,
    resourceStatus: "draft" as const,
    profession: "marketing" as const,
    level: 3,
    levelList: [3],
    knowledgeNodePublicIds: [],
    originalFileName: "controlled-upload.md",
    downloadAvailable: true,
    markdownPreviewAvailable: true,
    isVectorStale: false,
    publishedAt: null,
    indexingErrorSummary: null,
    uploadedAt: "2026-07-21T08:00:00.000Z",
    updatedAt: "2026-07-21T08:00:00.000Z",
  };
}

function createUploadRequest(includeIdempotencyKey = true) {
  const formData = new FormData();
  formData.set("title", "受控上传资料");
  formData.set("profession", "marketing");
  formData.set("coverageMode", "specified_levels");
  formData.append("levelList", "3");
  formData.set("resourceType", "knowledge_doc");
  formData.set("fileName", "controlled-upload.md");
  formData.set(
    "file",
    new File(["# 受控上传\n\n仅用于上传 saga 测试。"], "controlled-upload.md", {
      type: "text/markdown",
    }),
  );

  return new Request("http://localhost/api/v1/resources", {
    method: "POST",
    headers: {
      authorization: "Bearer admin-session-token",
      ...(includeIdempotencyKey
        ? { "idempotency-key": uploadIdempotencyKey }
        : {}),
    },
    body: formData,
  });
}

function createRepositories(input?: {
  prepareResult?: unknown;
  completeResult?: unknown;
}) {
  const resource = createResourceSummary();
  const prepareResourceUpload = vi.fn(async (prepareInput?: unknown) =>
    input?.prepareResult === undefined
      ? {
          status: "prepared",
          operation: {
            publicId: "resource-upload-operation-public-1",
            resourcePublicId: resource.publicId,
            objectStoragePath: (prepareInput as { objectStoragePath: string })
              .objectStoragePath,
          },
        }
      : input.prepareResult,
  );
  const markResourceUploadFileStored = vi.fn(async () => true);
  const completeResourceUpload = vi.fn(async () =>
    input?.completeResult === undefined
      ? { status: "completed", resource, replayed: false }
      : input.completeResult,
  );
  const recordResourceUploadFailure = vi.fn(async () => undefined);
  const appendAuditLog = vi.fn(async () => undefined);

  return {
    calls: {
      appendAuditLog,
      completeResourceUpload,
      markResourceUploadFileStored,
      prepareResourceUpload,
      recordResourceUploadFailure,
    },
    repositories: {
      resourceRepository: {
        prepareResourceUpload,
        markResourceUploadFileStored,
        completeResourceUpload,
        recordResourceUploadFailure,
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

describe("F-0031 database-backed resource upload saga", () => {
  it("fails closed without an explicit UUID idempotency key", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-upload-saga-key-"));
    const { calls, repositories } = createRepositories();
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createAdminSessionService(),
    } as never);

    const response = await handlers.resources.collection.POST(
      createUploadRequest(false),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 422621,
      data: null,
    });
    expect(calls.prepareResourceUpload).not.toHaveBeenCalled();
    expect(calls.completeResourceUpload).not.toHaveBeenCalled();
  });

  it("rejects a non-UUID upload idempotency key before claiming an operation", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-upload-saga-invalid-key-"),
    );
    const { calls, repositories } = createRepositories();
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createAdminSessionService(),
    } as never);
    const request = createUploadRequest();
    request.headers.set("idempotency-key", "not-a-uuid");

    const response = await handlers.resources.collection.POST(request);

    await expect(response.json()).resolves.toMatchObject({
      code: 422621,
      data: null,
    });
    expect(calls.prepareResourceUpload).not.toHaveBeenCalled();
  });

  it("uses a hashed request identity and commits resource audit operation together", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-upload-saga-ok-"));
    const { calls, repositories } = createRepositories();
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createAdminSessionService(),
    } as never);

    const response = await handlers.resources.collection.POST(
      createUploadRequest(),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { resource: { publicId: "resource-upload-public-1" } },
    });
    expect(calls.prepareResourceUpload).toHaveBeenCalledOnce();
    expect(calls.prepareResourceUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        actorPublicId: "admin-public-upload",
        idempotencyKeyHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
        requestFingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
      }),
    );
    expect(
      JSON.stringify(calls.prepareResourceUpload.mock.calls),
    ).not.toContain(uploadIdempotencyKey);
    expect(calls.markResourceUploadFileStored).toHaveBeenCalledOnce();
    expect(calls.completeResourceUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        operationPublicId: "resource-upload-operation-public-1",
        mutationContext: expect.objectContaining({
          actorPublicId: "admin-public-upload",
          auditLog: expect.objectContaining({
            actionType: "resource.upload",
            metadataSummary: "redacted resource upload metadata",
          }),
        }),
      }),
    );
    expect(calls.appendAuditLog).not.toHaveBeenCalled();
  });

  it("replays a completed operation without writing another file or audit", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-upload-saga-replay-"),
    );
    const resource = createResourceSummary();
    const { calls, repositories } = createRepositories({
      prepareResult: { status: "completed", resource },
    });
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createAdminSessionService(),
    } as never);

    const response = await handlers.resources.collection.POST(
      createUploadRequest(),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: 0,
      data: { resource: { publicId: resource.publicId } },
    });
    expect(calls.markResourceUploadFileStored).not.toHaveBeenCalled();
    expect(calls.completeResourceUpload).not.toHaveBeenCalled();
    expect(calls.appendAuditLog).not.toHaveBeenCalled();
    await expect(readdir(storageRoot, { recursive: true })).resolves.toEqual(
      [],
    );
  });

  it("fails a mismatched replay closed and records only a failed external audit", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-upload-saga-conflict-"),
    );
    const { calls, repositories } = createRepositories({
      prepareResult: { status: "conflict", reason: "request_mismatch" },
    });
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createAdminSessionService(),
    } as never);

    const response = await handlers.resources.collection.POST(
      createUploadRequest(),
    );
    const payload = await response.json();

    expect(payload.code).not.toBe(0);
    expect(payload.data).toBeNull();
    expect(calls.completeResourceUpload).not.toHaveBeenCalled();
    expect(calls.appendAuditLog).toHaveBeenCalledOnce();
    expect(calls.appendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "resource.upload",
        resultStatus: "failed",
        metadataSummary: "redacted resource upload metadata",
      }),
    );
    await expect(readdir(storageRoot, { recursive: true })).resolves.toEqual(
      [],
    );
  });

  it("records a retryable operation failure when deterministic file storage fails", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-upload-saga-failure-"),
    );
    const invalidStorageRoot = join(storageRoot, "not-a-directory");
    await writeFile(invalidStorageRoot, "occupied by a file", "utf8");
    const { calls, repositories } = createRepositories();
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: invalidStorageRoot,
      useLocalResourceAdapter: false,
      repositories,
      sessionService: createAdminSessionService(),
    } as never);

    const response = await handlers.resources.collection.POST(
      createUploadRequest(),
    );
    await expect(response.json()).resolves.toMatchObject({
      code: 500001,
      data: null,
    });
    expect(calls.recordResourceUploadFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        operationPublicId: "resource-upload-operation-public-1",
        failureMessageDigest: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
      }),
    );
    expect(calls.completeResourceUpload).not.toHaveBeenCalled();
    expect(calls.appendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "resource.upload",
        resultStatus: "failed",
      }),
    );
  });

  it("writes prepared content to the same deterministic path on retry", async () => {
    const storageRoot = await mkdtemp(
      join(tmpdir(), "tiku-upload-saga-storage-"),
    );
    const storageApi = localStorage as unknown as {
      prepareLocalResourceFile(input: unknown): Promise<{
        bytes: Buffer;
        fileHash: string;
        objectKey: string;
      }>;
      storePreparedLocalResourceFile(input: unknown): Promise<{
        fileHash: string;
        objectKey: string;
      }>;
    };
    const preparedFile = await storageApi.prepareLocalResourceFile({
      file: new File(["stable bytes"], "stable.md", {
        type: "text/markdown",
      }),
      profession: "marketing",
      resourceType: "knowledge_doc",
      uploadedAt: new Date("2026-07-21T08:00:00.000Z"),
    });

    const first = await storageApi.storePreparedLocalResourceFile({
      preparedFile,
      objectKey: preparedFile.objectKey,
      storageRoot,
    });
    const second = await storageApi.storePreparedLocalResourceFile({
      preparedFile,
      objectKey: preparedFile.objectKey,
      storageRoot,
    });

    expect(second).toEqual(first);
    expect(first.fileHash).toMatch(/^[a-f0-9]{64}$/u);
    await expect(
      readFile(join(storageRoot, ...first.objectKey.split("/")), "utf8"),
    ).resolves.toBe("stable bytes");
  });

  it("binds completion to the operation identity before one transaction commits audit and state", () => {
    const completeStart = repositorySource.indexOf(
      "async function completeResourceUpload",
    );
    const completeSource = repositorySource.slice(
      completeStart,
      repositorySource.indexOf(
        "\nasync function insertResourceFromUpload",
        completeStart,
      ),
    );

    expect(completeStart).toBeGreaterThan(-1);
    expect(completeSource).toContain(
      "database.transaction(async (transaction)",
    );
    expect(completeSource).toContain(
      "operationRow.actor_public_id !== input.mutationContext.actorPublicId",
    );
    expect(completeSource).toContain(
      'input.mutationContext.auditLog.actionType !== "resource.upload"',
    );
    expect(completeSource).toContain(
      "operationRow.resource_public_id !== input.publicId",
    );
    expect(completeSource).toContain(
      "operationRow.object_storage_path !== input.objectStoragePath",
    );
    expect(completeSource).toContain(
      "operationRow.file_hash !== input.contentHash",
    );
    expect(completeSource).toContain("await appendResourceMutationAuditLog(");
    expect(completeSource).toContain('operation_status: "completed"');
    expect(
      completeSource.indexOf("await appendResourceMutationAuditLog("),
    ).toBeLessThan(completeSource.indexOf('operation_status: "completed"'));
  });

  it("claims a globally unique hashed idempotency key and keeps failures replayable", () => {
    const prepareStart = repositorySource.indexOf(
      "async function prepareResourceUpload",
    );
    const prepareSource = repositorySource.slice(
      prepareStart,
      repositorySource.indexOf(
        "\nasync function markResourceUploadFileStored",
        prepareStart,
      ),
    );
    const failureStart = repositorySource.indexOf(
      "async function recordResourceUploadFailure",
    );
    const failureSource = repositorySource.slice(
      failureStart,
      repositorySource.indexOf(
        "\nasync function completeResourceUpload",
        failureStart,
      ),
    );

    expect(prepareSource).toContain(".onConflictDoNothing({");
    expect(prepareSource).toContain(
      "target: resourceUploadOperation.idempotency_key_hash",
    );
    expect(prepareSource).toContain('operation_status: "pending"');
    expect(prepareSource).toContain("file_stored_at: null");
    expect(failureSource).toContain('operation_status: "failed"');
    expect(failureSource).toContain("last_failure_message_digest:");
    expect(repositorySource).not.toContain("idempotency_key:");
    expect(repositorySource).not.toContain("createResourceFromUpload");
  });

  it("stores a digest rather than a raw scope failure label", () => {
    expect(repositorySource).toMatch(
      /createSha256Digest\(\s*"scope_validation_failed",?\s*\)/u,
    );
    expect(repositorySource).not.toContain(
      'last_failure_message_digest: "scope_validation_failed"',
    );
  });

  it("treats a concurrent completion as an idempotent file-stored acknowledgement", () => {
    const markStart = repositorySource.indexOf(
      "async function markResourceUploadFileStored",
    );
    const markSource = repositorySource.slice(
      markStart,
      repositorySource.indexOf(
        "\nasync function recordResourceUploadFailure",
        markStart,
      ),
    );

    expect(markSource).toContain(
      'completedOperation?.operation_status === "completed"',
    );
  });
});
