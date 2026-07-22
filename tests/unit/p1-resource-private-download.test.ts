import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, it, vi, type Mock } from "vitest";

import type {
  RagResourceRuntimeRepository,
  ResourceDownloadIdentity,
} from "@/server/repositories/rag-resource-knowledge-runtime-repository";
import {
  createRagResourceKnowledgeRuntimeRouteHandlers,
  type RagResourceKnowledgeAuditLogRepository,
  type RagResourceKnowledgeRuntimeRepositoriesWithAudit,
} from "@/server/services/rag-resource-knowledge-runtime";
import type { SessionService } from "@/server/services/session-service";
import { readLocalResourceFile } from "@/server/services/local-paper-asset-storage";

const bytes = Buffer.from("controlled private resource bytes");
const contentHash = createHash("sha256").update(bytes).digest("hex");
const resourcePublicId = "resource-private-download-001";
const downloadIdentity = {
  contentHash,
  fileSizeByte: bytes.byteLength,
  objectStoragePath: `dev/resource/marketing/202607/${contentHash}.pdf`,
  originalFileName: "教材复核.pdf",
  profession: "marketing" as const,
};

type AdminRoles = Array<"super_admin" | "ops_admin" | "content_admin">;
type FindResourceDownload = (
  publicId: string,
) => Promise<ResourceDownloadIdentity | null>;

function createSessionService(input: {
  adminPublicId?: string | null;
  roles?: AdminRoles;
}): Pick<SessionService, "getCurrentSession"> {
  return {
    async getCurrentSession() {
      return {
        code: 0,
        message: "ok",
        data: {
          session: { expiresAt: "2026-07-22T18:00:00.000Z" },
          user: {
            publicId: "user-resource-download",
            phone: "13800000000",
            name: "Resource Download Actor",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: input.adminPublicId ?? "admin-resource-download",
            adminRoles: input.roles ?? ["content_admin"],
          },
        },
      };
    },
  };
}

function createRepositories(input: {
  findResourceDownload: Mock<FindResourceDownload>;
  appendAuditLog?: RagResourceKnowledgeAuditLogRepository["appendAuditLog"];
}): RagResourceKnowledgeRuntimeRepositoriesWithAudit {
  const resourceRepository: RagResourceRuntimeRepository & {
    findResourceDownload: typeof input.findResourceDownload;
  } = {
    listResources: vi.fn(),
    publishResourceMarkdown: vi.fn(),
    findResourceForIndexing: vi.fn(),
    findResourceDownload: input.findResourceDownload,
  };

  return {
    auditLogRepository: {
      appendAuditLog: input.appendAuditLog ?? vi.fn(async () => undefined),
    },
    knowledgeNodeRepository: {
      listKnowledgeNodes: vi.fn(),
      createKnowledgeNode: vi.fn(),
      updateKnowledgeNode: vi.fn(),
      disableKnowledgeNode: vi.fn(),
    },
    resourceRepository,
  };
}

function createRequest(headers?: HeadersInit): Request {
  return new Request(
    `http://localhost/api/v1/resources/${resourcePublicId}/download`,
    {
      headers: {
        authorization: "Bearer controlled-session",
        ...headers,
      },
    },
  );
}

describe("F-0090 private resource download", () => {
  it.each([
    { adminPublicId: null, roles: [] as AdminRoles },
    { roles: ["ops_admin"] as AdminRoles },
  ])(
    "rejects actors outside the existing content-management roles before resource or file access",
    async (sessionInput) => {
      const findResourceDownload = vi.fn<FindResourceDownload>();
      const readResourceFile = vi.fn();
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        readResourceFile,
        repositories: createRepositories({ findResourceDownload }),
        sessionService: createSessionService(sessionInput),
      });

      const response = await handlers.resources.download.GET(createRequest(), {
        params: Promise.resolve({ publicId: resourcePublicId }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(findResourceDownload).not.toHaveBeenCalled();
      expect(readResourceFile).not.toHaveBeenCalled();
    },
  );

  it.each([["content_admin"], ["super_admin"]] as AdminRoles[])(
    "returns verified private bytes for %s with safe headers and redacted pre-response audit",
    async (role) => {
      const findResourceDownload = vi.fn(async () => downloadIdentity);
      const readResourceFile = vi.fn(async () => ({
        bytes,
        contentType: "application/pdf",
      }));
      const appendAuditLog = vi.fn(async () => undefined);
      const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
        readResourceFile,
        repositories: createRepositories({
          appendAuditLog,
          findResourceDownload,
        }),
        sessionService: createSessionService({ roles: [role] }),
      });

      const response = await handlers.resources.download.GET(
        createRequest({ range: "bytes=0-1" }),
        { params: Promise.resolve({ publicId: resourcePublicId }) },
      );

      expect(response.status).toBe(200);
      await expect(response.arrayBuffer()).resolves.toEqual(
        bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ),
      );
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("content-disposition")).toMatch(
        /^attachment; filename="[^"]+"; filename\*=UTF-8''/u,
      );
      expect(response.headers.get("content-length")).toBe(String(bytes.length));
      expect(response.headers.get("content-type")).toBe("application/pdf");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(findResourceDownload).toHaveBeenCalledWith(resourcePublicId);
      expect(readResourceFile).toHaveBeenCalledWith(downloadIdentity);
      expect(appendAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: "resource.download",
          resultStatus: "success",
          targetPublicId: resourcePublicId,
        }),
      );
      expect(JSON.stringify(appendAuditLog.mock.calls)).not.toContain(
        contentHash,
      );
      expect(JSON.stringify(appendAuditLog.mock.calls)).not.toContain(
        "objectStoragePath",
      );
    },
  );

  it("fails closed before returning bytes when the audit cannot be persisted", async () => {
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      readResourceFile: vi.fn(async () => ({
        bytes,
        contentType: "application/pdf",
      })),
      repositories: createRepositories({
        appendAuditLog: vi.fn(async () => {
          throw new Error("audit unavailable");
        }),
        findResourceDownload: vi.fn(async () => downloadIdentity),
      }),
      sessionService: createSessionService({ roles: ["content_admin"] }),
    });

    const response = await handlers.resources.download.GET(createRequest(), {
      params: Promise.resolve({ publicId: resourcePublicId }),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers.get("cache-control")).toContain("no-store");
    const payload = await response.json();
    expect(JSON.stringify(payload)).not.toContain("audit unavailable");
    expect(JSON.stringify(payload)).not.toContain(contentHash);
  });

  it("returns the same private no-store error for missing metadata and file failures", async () => {
    const missingHandlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      readResourceFile: vi.fn(),
      repositories: createRepositories({
        findResourceDownload: vi.fn(async () => null),
      }),
      sessionService: createSessionService({ roles: ["content_admin"] }),
    });
    const failedHandlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      readResourceFile: vi.fn(async () => {
        throw new Error(`private path ${downloadIdentity.objectStoragePath}`);
      }),
      repositories: createRepositories({
        findResourceDownload: vi.fn(async () => downloadIdentity),
      }),
      sessionService: createSessionService({ roles: ["content_admin"] }),
    });

    const [missingResponse, failedResponse] = await Promise.all([
      missingHandlers.resources.download.GET(createRequest(), {
        params: Promise.resolve({ publicId: resourcePublicId }),
      }),
      failedHandlers.resources.download.GET(createRequest(), {
        params: Promise.resolve({ publicId: resourcePublicId }),
      }),
    ]);
    const missingPayload = await missingResponse.json();
    const failedPayload = await failedResponse.json();

    expect(missingResponse.headers.get("cache-control")).toContain("no-store");
    expect(failedResponse.headers.get("cache-control")).toContain("no-store");
    expect(failedPayload).toEqual(missingPayload);
    expect(JSON.stringify(failedPayload)).not.toContain("private path");
    expect(JSON.stringify(failedPayload)).not.toContain(contentHash);
  });

  it("sanitizes injected filenames without reflecting private identity", async () => {
    const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
      readResourceFile: vi.fn(async () => ({
        bytes,
        contentType: "application/octet-stream",
      })),
      repositories: createRepositories({
        findResourceDownload: vi.fn(async () => ({
          ...downloadIdentity,
          originalFileName: "../\r\nX-Leak: secret/教材.bin",
        })),
      }),
      sessionService: createSessionService({ roles: ["content_admin"] }),
    });

    const response = await handlers.resources.download.GET(createRequest(), {
      params: Promise.resolve({ publicId: resourcePublicId }),
    });
    const disposition = response.headers.get("content-disposition") ?? "";

    expect(response.status).toBe(200);
    expect(disposition).not.toMatch(/[\r\n]/u);
    expect(disposition).not.toContain("X-Leak");
    expect(disposition).not.toContain(contentHash);
    expect(response.headers.get("content-type")).toBe(
      "application/octet-stream",
    );
  });
});

describe("F-0090 strict local resource reader", () => {
  async function createFixture() {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-read-"));
    const objectStoragePath = downloadIdentity.objectStoragePath;
    const targetPath = join(storageRoot, ...objectStoragePath.split("/"));
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, bytes);

    return { storageRoot, targetPath };
  }

  it("returns bytes only for an exact resource identity", async () => {
    const fixture = await createFixture();

    try {
      await expect(
        readLocalResourceFile({ ...downloadIdentity, ...fixture }),
      ).resolves.toEqual({ bytes, contentType: "application/pdf" });
    } finally {
      await rm(fixture.storageRoot, { force: true, recursive: true });
    }
  });

  it.each([
    {
      objectStoragePath: `dev/paper-asset/marketing/202607/${contentHash}.pdf`,
    },
    { objectStoragePath: `dev/resource/logistics/202607/${contentHash}.pdf` },
    { objectStoragePath: `../resource/marketing/202607/${contentHash}.pdf` },
    { objectStoragePath: `C:/resource/marketing/202607/${contentHash}.pdf` },
    { objectStoragePath: `dev/resource/marketing/202613/${contentHash}.pdf` },
    { contentHash: contentHash.toUpperCase() },
    { fileSizeByte: -1 },
    { originalFileName: "教材.exe" },
  ])("rejects malformed or mismatched identity %#", async (override) => {
    const fixture = await createFixture();

    try {
      await expect(
        readLocalResourceFile({
          ...downloadIdentity,
          storageRoot: fixture.storageRoot,
          ...override,
        }),
      ).rejects.toThrow();
    } finally {
      await rm(fixture.storageRoot, { force: true, recursive: true });
    }
  });

  it.each([
    { contentHash: "0".repeat(64) },
    { fileSizeByte: bytes.byteLength + 1 },
  ])("rejects byte integrity mismatch %#", async (override) => {
    const fixture = await createFixture();

    try {
      await expect(
        readLocalResourceFile({
          ...downloadIdentity,
          storageRoot: fixture.storageRoot,
          ...override,
        }),
      ).rejects.toThrow();
    } finally {
      await rm(fixture.storageRoot, { force: true, recursive: true });
    }
  });

  it("rejects intermediate and final symbolic-link escapes", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-links-"));
    const outside = await mkdtemp(join(tmpdir(), "tiku-resource-outside-"));
    const outsideTarget = join(outside, "202607", `${contentHash}.pdf`);
    await mkdir(dirname(outsideTarget), { recursive: true });
    await writeFile(outsideTarget, bytes);
    await mkdir(join(storageRoot, "dev", "resource"), { recursive: true });
    await symlink(
      outside,
      join(storageRoot, "dev", "resource", "marketing"),
      "junction",
    );

    try {
      await expect(
        readLocalResourceFile({ ...downloadIdentity, storageRoot }),
      ).rejects.toThrow(/symbolic link/u);
    } finally {
      await rm(storageRoot, { force: true, recursive: true });
      await rm(outside, { force: true, recursive: true });
    }

    const finalRoot = await mkdtemp(join(tmpdir(), "tiku-resource-final-"));
    const finalOutside = await mkdtemp(join(tmpdir(), "tiku-resource-file-"));
    const finalTarget = join(
      finalRoot,
      "dev",
      "resource",
      "marketing",
      "202607",
      `${contentHash}.pdf`,
    );
    await mkdir(dirname(finalTarget), { recursive: true });
    await symlink(finalOutside, finalTarget, "junction");

    try {
      await expect(
        readLocalResourceFile({ ...downloadIdentity, storageRoot: finalRoot }),
      ).rejects.toThrow(/symbolic link/u);
    } finally {
      await rm(finalRoot, { force: true, recursive: true });
      await rm(finalOutside, { force: true, recursive: true });
    }
  });

  it("fails closed for unavailable roots, missing targets, and directories", async () => {
    const storageRoot = await mkdtemp(join(tmpdir(), "tiku-resource-missing-"));
    const missingRoot = join(storageRoot, "missing-root");

    await expect(
      readLocalResourceFile({ ...downloadIdentity, storageRoot: missingRoot }),
    ).rejects.toThrow(/root is unavailable/u);
    await expect(
      readLocalResourceFile({ ...downloadIdentity, storageRoot }),
    ).rejects.toThrow();

    const targetPath = join(
      storageRoot,
      ...downloadIdentity.objectStoragePath.split("/"),
    );
    await mkdir(targetPath, { recursive: true });
    await expect(
      readLocalResourceFile({ ...downloadIdentity, storageRoot }),
    ).rejects.toThrow(/not a file/u);

    await rm(storageRoot, { force: true, recursive: true });
  });
});

describe("F-0090 content-admin download action", () => {
  it("uses only the protected public-id route and revokes the temporary URL", async () => {
    const source = await readFile(
      "src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx",
      "utf8",
    );

    expect(source).toContain("resource.downloadAvailable ?");
    expect(source).toContain(
      "`/api/v1/resources/${encodeURIComponent(resource.publicId)}/download`",
    );
    expect(source).toContain('credentials: "same-origin"');
    expect(source).toContain('cache: "no-store"');
    expect(source).toContain("URL.revokeObjectURL(objectUrl)");
    expect(source).not.toMatch(/objectStoragePath|contentHash/u);
  });
});
