import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  RagResourceRuntimeRepository,
  ResourceCleanupIdentity,
} from "@/server/repositories/rag-resource-knowledge-runtime-repository";
import {
  createRagResourceKnowledgeRuntimeRouteHandlers,
  type RagResourceKnowledgeRuntimeRepositoriesWithAudit,
} from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";
import { deleteLocalResourceFile } from "@/server/services/local-paper-asset-storage";

const resourcePublicId = "resource-conversion-failed-delete-001";
const repositorySource = readFileSync(
  join(
    process.cwd(),
    "src/server/repositories/rag-resource-knowledge-runtime-repository.ts",
  ),
  "utf8",
);
const schemaSource = readFileSync(
  join(process.cwd(), "src/db/schema/ai-rag.ts"),
  "utf8",
);
const routeSource = readFileSync(
  join(process.cwd(), "src/app/api/v1/resources/[publicId]/route.ts"),
  "utf8",
);
const adminSource = readFileSync(
  join(
    process.cwd(),
    "src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx",
  ),
  "utf8",
);
const migrationSource = readFileSync(
  join(
    process.cwd(),
    "drizzle/20260722063000_p1_rc_06_resource_failed_delete_recovery.sql",
  ),
  "utf8",
);
const migrationSnapshot = JSON.parse(
  readFileSync(
    join(process.cwd(), "drizzle/meta/20260722063000_snapshot.json"),
    "utf8",
  ),
) as { id: string; prevId: string; tables: Record<string, unknown> };
const migrationJournal = JSON.parse(
  readFileSync(join(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
) as { entries: Array<{ idx: number; tag: string }> };
const temporaryRoots: string[] = [];

type AdminRole = "content_admin" | "ops_admin" | "super_admin";

afterEach(async () => {
  for (const root of temporaryRoots.splice(0)) {
    if (!root.startsWith(`${tmpdir()}${sep}`)) {
      throw new Error("Synthetic resource cleanup root escaped temp.");
    }
    await rm(root, { force: true, recursive: true });
  }
});

function createSessionService(
  roles: AdminRole[] | null,
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
            publicId: "resource-delete-user-001",
            phone: "13800000082",
            name: "Resource Delete Actor",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "resource-delete-admin-001",
            adminRoles: roles,
          },
        },
      };
    },
  };
}

function createRepositories(
  deleteConversionFailedResource: NonNullable<
    RagResourceRuntimeRepository["deleteConversionFailedResource"]
  >,
  appendAuditLog = vi.fn(async () => undefined),
): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  return {
    resourceRepository: {
      deleteConversionFailedResource,
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
  };
}

function createDeleteRequest() {
  return new Request(`http://localhost/api/v1/resources/${resourcePublicId}`, {
    headers: { authorization: "Bearer resource-delete-session" },
    method: "DELETE",
  });
}

function createIdentity(
  bytes: Buffer,
  storageRoot: string,
): ResourceCleanupIdentity & { storageRoot: string } {
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  return {
    contentHash,
    fileSizeByte: bytes.byteLength,
    objectStoragePath: `dev/resource/marketing/202607/${contentHash}.pdf`,
    originalFileName: "受控资料.pdf",
    profession: "marketing" as const,
    storageRoot,
  };
}

describe("F-0082 conversion_failed resource delete recovery", () => {
  it.each([
    { roles: null, expectedStatus: 401 },
    { roles: ["ops_admin"] as AdminRole[], expectedStatus: 403 },
  ])(
    "rejects unauthorized actors before repository, storage or audit access",
    async ({ roles, expectedStatus }) => {
      const deleteConversionFailedResource = vi.fn();
      const deleteResourceFile = vi.fn();
      const appendAuditLog = vi.fn(async () => undefined);
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        deleteResourceFile,
        repositories: createRepositories(
          deleteConversionFailedResource,
          appendAuditLog,
        ),
        sessionService: createSessionService(roles),
      });

      const response = await handlers.resources.detail.DELETE(
        createDeleteRequest(),
        { params: Promise.resolve({ publicId: resourcePublicId }) },
      );

      expect(response.status).toBe(expectedStatus);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(deleteConversionFailedResource).not.toHaveBeenCalled();
      expect(deleteResourceFile).not.toHaveBeenCalled();
      expect(appendAuditLog).not.toHaveBeenCalled();
    },
  );

  it.each(["content_admin", "super_admin"] as const)(
    "deletes through the repository-owned two-phase command for %s",
    async (role) => {
      const deleteConversionFailedResource = vi.fn(async () => ({
        status: "completed" as const,
      }));
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        repositories: createRepositories(deleteConversionFailedResource),
        sessionService: createSessionService([role]),
      });

      const response = await handlers.resources.detail.DELETE(
        createDeleteRequest(),
        { params: Promise.resolve({ publicId: resourcePublicId }) },
      );
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(payload).toEqual({
        code: 0,
        message: "ok",
        data: { deletedResourcePublicId: resourcePublicId },
      });
      expect(deleteConversionFailedResource).toHaveBeenCalledWith(
        resourcePublicId,
        expect.objectContaining({
          actorPublicId: "resource-delete-admin-001",
          auditLog: expect.objectContaining({
            actionType: "resource.delete",
            metadataSummary: "redacted resource delete metadata",
          }),
        }),
        expect.any(Function),
      );
    },
  );

  it("returns stable no-store outcomes for conflict, retryable, missing and completed replay", async () => {
    for (const [result, expectedStatus] of [
      [{ status: "conflict" as const }, 409],
      [{ status: "retryable" as const }, 503],
      [{ status: "not_found" as const }, 404],
      [{ status: "completed" as const }, 200],
    ] as const) {
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        repositories: createRepositories(vi.fn(async () => result)),
        sessionService: createSessionService(["content_admin"]),
      });
      const response = await handlers.resources.detail.DELETE(
        createDeleteRequest(),
        { params: Promise.resolve({ publicId: resourcePublicId }) },
      );
      expect(response.status).toBe(expectedStatus);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(JSON.stringify(await response.json())).not.toMatch(
        /objectStoragePath|contentHash|internal|stack/iu,
      );
    }
  });

  it("does not invoke physical deletion when the metadata transaction fails", async () => {
    const deleteResourceFile = vi.fn();
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      deleteResourceFile,
      repositories: createRepositories(
        vi.fn(async () => {
          throw new Error("T1 commit failed with internal object path");
        }),
      ),
      sessionService: createSessionService(["content_admin"]),
    });

    const response = await handlers.resources.detail.DELETE(
      createDeleteRequest(),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    expect(response.status).toBe(503);
    expect(deleteResourceFile).not.toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toContain("object path");
  });

  it("replays a missing target after unlink succeeds but T2 commit fails", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-replay-"));
    temporaryRoots.push(storageRoot);
    const bytes = Buffer.from("resource cleanup commit replay bytes");
    const identity = createIdentity(bytes, storageRoot);
    const targetPath = join(
      storageRoot,
      ...identity.objectStoragePath.split("/"),
    );
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, bytes);

    const deleteConversionFailedResource = vi
      .fn<
        NonNullable<
          RagResourceRuntimeRepository["deleteConversionFailedResource"]
        >
      >()
      .mockImplementationOnce(async (_publicId, _context, deleteLocalFile) => {
        await expect(deleteLocalFile(identity)).resolves.toBe("deleted");
        throw new Error("synthetic T2 commit failure");
      })
      .mockImplementationOnce(async (_publicId, _context, deleteLocalFile) => {
        await expect(deleteLocalFile(identity)).resolves.toBe("missing");
        return { status: "completed" };
      })
      .mockResolvedValueOnce({ status: "completed" });
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      localResourceStorageRoot: storageRoot,
      repositories: createRepositories(deleteConversionFailedResource),
      sessionService: createSessionService(["content_admin"]),
      useLocalResourceAdapter: false,
    });

    const first = await handlers.resources.detail.DELETE(
      createDeleteRequest(),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    expect(first.status).toBe(503);
    await expect(lstat(targetPath)).rejects.toMatchObject({ code: "ENOENT" });

    const replay = await handlers.resources.detail.DELETE(
      createDeleteRequest(),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    expect(replay.status).toBe(200);

    const responseLossReplay = await handlers.resources.detail.DELETE(
      createDeleteRequest(),
      { params: Promise.resolve({ publicId: resourcePublicId }) },
    );
    expect(responseLossReplay.status).toBe(200);
    expect(deleteConversionFailedResource).toHaveBeenCalledTimes(3);
  });

  it("deletes only an exact contained resource identity and replays missing as completed", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-cleanup-"));
    temporaryRoots.push(storageRoot);
    const bytes = Buffer.from("controlled resource cleanup bytes");
    const identity = createIdentity(bytes, storageRoot);
    const targetPath = join(
      storageRoot,
      ...identity.objectStoragePath.split("/"),
    );
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, bytes);

    await expect(deleteLocalResourceFile(identity)).resolves.toBe("deleted");
    await expect(lstat(targetPath)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(deleteLocalResourceFile(identity)).resolves.toBe("missing");
  });

  it("fails closed without deleting on path, identity, integrity, type or symlink mismatch", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-guard-"));
    temporaryRoots.push(storageRoot);
    const bytes = Buffer.from("guarded resource cleanup bytes");
    const identity = createIdentity(bytes, storageRoot);
    const targetPath = join(
      storageRoot,
      ...identity.objectStoragePath.split("/"),
    );
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, bytes);

    for (const invalid of [
      { contentHash: identity.contentHash.toUpperCase() },
      { fileSizeByte: identity.fileSizeByte + 1 },
      { profession: "logistics" as const },
      { objectStoragePath: `../${identity.objectStoragePath}` },
      {
        objectStoragePath: identity.objectStoragePath.replace(
          "/202607/",
          "/202613/",
        ),
      },
    ]) {
      await expect(
        deleteLocalResourceFile({ ...identity, ...invalid }),
      ).rejects.toThrow();
      await expect(readFile(targetPath)).resolves.toEqual(bytes);
    }

    await writeFile(targetPath, Buffer.from("tampered resource cleanup data"));
    await expect(deleteLocalResourceFile(identity)).rejects.toThrow();
    await writeFile(targetPath, bytes);

    const outside = await mkdtemp(join(tmpdir(), "tiku-resource-outside-"));
    temporaryRoots.push(outside);
    const linkedRoot = await mkdtemp(join(tmpdir(), "tiku-resource-link-"));
    temporaryRoots.push(linkedRoot);
    const linkedIdentity = createIdentity(bytes, linkedRoot);
    const linkedMonth = join(
      linkedRoot,
      "dev",
      "resource",
      "marketing",
      "202607",
    );
    await mkdir(dirname(linkedMonth), { recursive: true });
    await writeFile(join(outside, `${linkedIdentity.contentHash}.pdf`), bytes);
    await symlink(outside, linkedMonth, "junction");
    await expect(deleteLocalResourceFile(linkedIdentity)).rejects.toThrow();
    await expect(
      readFile(join(outside, `${linkedIdentity.contentHash}.pdf`)),
    ).resolves.toEqual(bytes);

    const finalLinkRoot = await mkdtemp(
      join(tmpdir(), "tiku-resource-final-link-"),
    );
    temporaryRoots.push(finalLinkRoot);
    const finalLinkIdentity = createIdentity(bytes, finalLinkRoot);
    const finalLinkTarget = join(
      finalLinkRoot,
      ...finalLinkIdentity.objectStoragePath.split("/"),
    );
    const outsideDirectory = join(outside, "final-link-target");
    await mkdir(outsideDirectory, { recursive: true });
    await mkdir(dirname(finalLinkTarget), { recursive: true });
    await symlink(outsideDirectory, finalLinkTarget, "junction");
    await expect(deleteLocalResourceFile(finalLinkIdentity)).rejects.toThrow();

    const directoryRoot = await mkdtemp(join(tmpdir(), "tiku-resource-dir-"));
    temporaryRoots.push(directoryRoot);
    const directoryIdentity = createIdentity(bytes, directoryRoot);
    await mkdir(
      join(directoryRoot, ...directoryIdentity.objectStoragePath.split("/")),
      { recursive: true },
    );
    await expect(deleteLocalResourceFile(directoryIdentity)).rejects.toThrow();
    await expect(
      deleteLocalResourceFile({
        ...identity,
        storageRoot: join(storageRoot, "missing-root"),
      }),
    ).rejects.toThrow();
  });

  it("defines a no-FK durable cleanup job with stale-claim recovery fields", () => {
    const cleanupStart = schemaSource.indexOf(
      "export const resourceCleanupJob =",
    );
    const cleanupEnd = schemaSource.indexOf(
      "export const knowledgeNode =",
      cleanupStart,
    );
    const cleanupSource = schemaSource.slice(cleanupStart, cleanupEnd);

    expect(cleanupStart).toBeGreaterThan(-1);
    expect(schemaSource).toContain("resourceCleanupJobStatusValues");
    expect(cleanupSource).toContain('"resource_cleanup_job"');
    expect(cleanupSource).toContain("source_resource_public_id");
    expect(cleanupSource).toContain("object_storage_path");
    expect(cleanupSource).toContain("attempt_count");
    expect(cleanupSource).toContain("last_failure_message_digest");
    expect(cleanupSource).toContain("claimed_at");
    expect(cleanupSource).toContain("completed_at");
    expect(cleanupSource).not.toContain("references(");
  });

  it("generates one additive cleanup migration without data or destructive SQL", () => {
    expect(migrationSource).toContain(
      'CREATE TYPE "public"."resource_cleanup_job_status"',
    );
    expect(migrationSource).toContain('CREATE TABLE "resource_cleanup_job"');
    expect(migrationSource).toContain(
      'CREATE UNIQUE INDEX "udx_resource_cleanup_job_source_resource_public_id"',
    );
    expect(migrationSource).not.toMatch(
      /\b(?:DROP|TRUNCATE|UPDATE|DELETE\s+FROM|ALTER\s+TABLE)\b/iu,
    );
    expect(migrationSource).not.toContain("REFERENCES");
    expect(migrationSnapshot.tables).toHaveProperty(
      "public.resource_cleanup_job",
    );
    const finalEntry = migrationJournal.entries.at(-1);
    expect(finalEntry).toEqual({
      idx: 46,
      tag: "20260722063000_p1_rc_06_resource_failed_delete_recovery",
      version: "7",
      when: expect.any(Number),
      breakpoints: true,
    });
  });

  it("keeps T1 commit before T2 physical cleanup and exact-once audit", () => {
    const commandStart = repositorySource.indexOf(
      "async function deleteConversionFailedResourceWithCleanup",
    );
    const commandEnd = repositorySource.indexOf(
      "async function appendResourceMutationAuditLog",
      commandStart,
    );
    const commandSource = repositorySource.slice(commandStart, commandEnd);
    const t1Start = commandSource.indexOf(
      "deleteConversionFailedResourceMetadata(",
    );
    const t1Await = commandSource.indexOf(
      "await deleteConversionFailedResourceMetadata(",
    );
    const t2Start = commandSource.indexOf("processResourceCleanupJob(");

    expect(commandStart).toBeGreaterThan(-1);
    expect(t1Start).toBeGreaterThan(-1);
    expect(t1Await).toBeGreaterThan(-1);
    expect(t2Start).toBeGreaterThan(t1Await);
    expect(
      commandSource.lastIndexOf("processResourceCleanupJob("),
    ).toBeGreaterThan(t1Await);

    const metadataStart = repositorySource.indexOf(
      "async function deleteConversionFailedResourceMetadata",
    );
    const cleanupStart = repositorySource.indexOf(
      "async function processResourceCleanupJob",
      metadataStart,
    );
    const metadataSource = repositorySource.slice(metadataStart, cleanupStart);
    expect(metadataSource).toContain(
      'eq(resource.resource_status, "conversion_failed")',
    );
    expect(metadataSource).toContain("knowledgeNodeResource");
    expect(metadataSource).toContain("resourceIndexGeneration");
    expect(metadataSource).toContain("resourceChunk");
    expect(
      metadataSource.indexOf("appendResourceMutationAuditLog("),
    ).toBeLessThan(metadataSource.indexOf(".insert(resourceCleanupJob)"));
    expect(
      metadataSource.match(/appendResourceMutationAuditLog\(/gu),
    ).toHaveLength(1);
    expect(metadataSource).toContain("resource_id: null");
    expect(metadataSource).toContain(".delete(resource)");
  });

  it("uses one resource object lock before row locks across every competing path", () => {
    expect(repositorySource).toContain("RESOURCE_OBJECT_LOCK_NAMESPACE");
    expect(repositorySource).toContain("pg_advisory_xact_lock");
    for (const functionName of [
      "prepareResourceUpload",
      "completeResourceUploadReceipt",
      "claimResourceConversion",
      "finalizeResourceConversion",
      "deleteConversionFailedResourceMetadata",
      "processResourceCleanupJob",
    ]) {
      const start = repositorySource.indexOf(`function ${functionName}`);
      const next = repositorySource.indexOf("\nasync function ", start + 1);
      const source = repositorySource.slice(
        start,
        next === -1 ? undefined : next,
      );
      const lock = source.indexOf("lockResourceObjectIdentity");
      const rowLock = source.indexOf('.for("update")');
      expect(start, functionName).toBeGreaterThan(-1);
      expect(lock, functionName).toBeGreaterThan(-1);
      if (rowLock !== -1) {
        expect(lock, functionName).toBeLessThan(rowLock);
      }
    }
    const prepareStart = repositorySource.indexOf(
      "async function prepareResourceUpload",
    );
    const prepareEnd = repositorySource.indexOf(
      "async function markResourceUploadFileStored",
      prepareStart,
    );
    const prepareSource = repositorySource.slice(prepareStart, prepareEnd);
    expect(prepareSource).toContain(
      'operationRow.operation_status === "completed"',
    );
    expect(prepareSource).toContain("operationRow.resource_id === null");
    expect(prepareSource).toContain(
      '{ status: "conflict", reason: "invalid_state" }',
    );
  });

  it("rechecks references and live uploads under lock before exact physical deletion", () => {
    const cleanupStart = repositorySource.indexOf(
      "async function processResourceCleanupJob",
    );
    const cleanupEnd = repositorySource.indexOf(
      "async function deleteConversionFailedResourceWithCleanup",
      cleanupStart,
    );
    const cleanupSource = repositorySource.slice(cleanupStart, cleanupEnd);

    expect(cleanupSource).toMatch(/"pending",\s*"file_stored"/u);
    expect(cleanupSource.indexOf("resourceReferences.length > 0")).toBeLessThan(
      cleanupSource.indexOf("liveUploadRows.length > 0"),
    );
    expect(cleanupSource.indexOf("liveUploadRows.length > 0")).toBeLessThan(
      cleanupSource.indexOf("deleteLocalFile(unlockedIdentity)"),
    );
    expect(repositorySource).toContain('cleanup_status: "failed"');
    expect(cleanupSource).toContain("markResourceCleanupFailed(");
    expect(cleanupSource).toContain('cleanup_status: "pending"');
    expect(cleanupSource).toContain('cleanup_status: "cancelled"');
    expect(cleanupSource).toContain('cleanup_status: "completed"');
    expect(cleanupSource).toContain("staleBefore");
  });

  it("exposes only a public-id DELETE command and a conversion-failed admin action", () => {
    expect(routeSource).toContain(
      "ragResourceKnowledgeRuntimeRouteHandlers.resources.detail.DELETE",
    );
    expect(adminSource).toContain('method: "DELETE"');
    expect(adminSource).toContain(
      'resource.resourceStatus === "conversion_failed"',
    );
    expect(adminSource).not.toMatch(/DELETE[\s\S]{0,300}objectStoragePath/u);
  });
});
