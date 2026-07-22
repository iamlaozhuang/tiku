import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import {
  localResourceMaxFileSizeByte,
  resourceMultipartOverheadAllowanceByte,
  createRagResourceKnowledgeRuntimeRouteHandlers,
} from "@/server/services/rag-resource-knowledge-runtime";
import { prepareLocalResourceFile } from "@/server/services/local-paper-asset-storage";
import type { SessionService } from "@/server/services/session-service";

const uploadIdempotencyKey = "76aca5d6-a60b-4a4f-b8f7-7fca40b84609";

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
            publicId: "admin-user-upload-size",
            phone: "13800000000",
            name: "Upload Size Actor",
            userType: null,
            status: "active",
            lockedUntilAt: null,
            employeePublicId: null,
            organizationPublicId: null,
            adminPublicId: "admin-upload-size",
            adminRoles: ["content_admin"],
          },
        },
      };
    },
  };
}

function createResourceSummary() {
  return {
    publicId: "resource-size-boundary",
    title: "受控大小资料",
    resourceType: "knowledge_doc" as const,
    resourceStatus: "draft" as const,
    profession: "marketing" as const,
    level: 3,
    levelList: [3],
    knowledgeNodePublicIds: [],
    originalFileName: "controlled.md",
    downloadAvailable: true,
    markdownPreviewAvailable: true,
    isVectorStale: false,
    publishedAt: null,
    indexingErrorSummary: null,
    uploadedAt: "2026-07-22T08:00:00.000Z",
    updatedAt: "2026-07-22T08:00:00.000Z",
  };
}

function createRepositories() {
  const prepareResourceUpload = vi.fn(async () => ({
    status: "completed" as const,
    resource: createResourceSummary(),
    replayed: true,
  }));
  const markResourceUploadFileStored = vi.fn(async () => true);
  const completeResourceUpload = vi.fn();
  const recordResourceUploadFailure = vi.fn();
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
        listResources: vi.fn(),
        publishResourceMarkdown: vi.fn(),
        findResourceForIndexing: vi.fn(),
      },
      knowledgeNodeRepository: {
        listKnowledgeNodes: vi.fn(),
        createKnowledgeNode: vi.fn(),
        updateKnowledgeNode: vi.fn(),
        disableKnowledgeNode: vi.fn(),
      },
      auditLogRepository: { appendAuditLog },
    },
  };
}

function createFileLike(input: {
  arrayBuffer?: ReturnType<typeof vi.fn>;
  name?: string;
  size: number;
}) {
  const arrayBuffer =
    input.arrayBuffer ?? vi.fn(async () => new ArrayBuffer(0));
  const stream = vi.fn();

  return {
    file: {
      arrayBuffer,
      name: input.name ?? "controlled.md",
      size: input.size,
      stream,
      type: "text/markdown",
    } as unknown as File,
    arrayBuffer,
    stream,
  };
}

function createFormDataLike(files: Array<{ field: string; file: File }>) {
  const values = new Map<string, FormDataEntryValue | FormDataEntryValue[]>([
    ["title", "受控大小资料"],
    ["profession", "marketing"],
    ["coverageMode", "specified_levels"],
    ["levelList", ["3"]],
    ["resourceType", "knowledge_doc"],
    ["fileName", "controlled.md"],
  ]);

  for (const { field, file } of files) {
    const current = values.get(field);
    values.set(
      field,
      current === undefined
        ? file
        : Array.isArray(current)
          ? [...current, file]
          : [current, file],
    );
  }

  const flattened = Array.from(values.values()).flatMap((value) =>
    Array.isArray(value) ? value : [value],
  );

  return {
    get(name: string) {
      const value = values.get(name);
      return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
    },
    getAll(name: string) {
      const value = values.get(name);
      return value === undefined ? [] : Array.isArray(value) ? value : [value];
    },
    values() {
      return flattened.values();
    },
  } as unknown as FormData;
}

function createRequest(input: { contentLength?: string; formData: FormData }) {
  const request = new Request("http://localhost/api/v1/resources", {
    headers: {
      authorization: "Bearer controlled-session",
      "idempotency-key": uploadIdempotencyKey,
      ...(input.contentLength === undefined
        ? {}
        : { "content-length": input.contentLength }),
    },
    method: "POST",
  });
  const formData = vi
    .spyOn(request, "formData")
    .mockResolvedValue(input.formData);

  return { request, formData };
}

function createHandlers() {
  const repositoryFixture = createRepositories();
  const handlers = createRagResourceKnowledgeRuntimeRouteHandlers({
    repositories: repositoryFixture.repositories,
    sessionService: createAdminSessionService(),
    useLocalResourceAdapter: false,
  } as never);

  return { handlers, ...repositoryFixture };
}

describe("F-0037 resource upload application-amplification foundation", () => {
  it("fast-fails a definitely oversized multipart length before formData", async () => {
    const { handlers, calls } = createHandlers();
    const file = createFileLike({ size: 1 });
    const { request, formData } = createRequest({
      contentLength: String(
        localResourceMaxFileSizeByte +
          resourceMultipartOverheadAllowanceByte +
          1,
      ),
      formData: createFormDataLike([{ field: "file", file: file.file }]),
    });

    const response = await handlers.resources.collection.POST(request);

    expect(response.status).toBe(413);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(formData).not.toHaveBeenCalled();
    expect(file.arrayBuffer).not.toHaveBeenCalled();
    expect(file.stream).not.toHaveBeenCalled();
    expect(calls.prepareResourceUpload).not.toHaveBeenCalled();
  });

  it.each([undefined, "invalid", "1"])(
    "uses File.size when Content-Length is %s and rejects before downstream work",
    async (contentLength) => {
      const { handlers, calls } = createHandlers();
      const file = createFileLike({
        size: localResourceMaxFileSizeByte + 1,
      });
      const { request } = createRequest({
        contentLength,
        formData: createFormDataLike([{ field: "file", file: file.file }]),
      });

      const response = await handlers.resources.collection.POST(request);

      expect(response.status).toBe(413);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(file.arrayBuffer).not.toHaveBeenCalled();
      expect(file.stream).not.toHaveBeenCalled();
      expect(calls.prepareResourceUpload).not.toHaveBeenCalled();
      expect(calls.completeResourceUpload).not.toHaveBeenCalled();
      expect(calls.appendAuditLog).not.toHaveBeenCalledWith(
        expect.objectContaining({ resultStatus: "success" }),
      );
    },
  );

  it.each([Number.NaN, -1, Number.MAX_SAFE_INTEGER + 1])(
    "fails closed for an invalid File.size of %s",
    async (size) => {
      const { handlers, calls } = createHandlers();
      const file = createFileLike({ size });
      const { request } = createRequest({
        formData: createFormDataLike([{ field: "file", file: file.file }]),
      });

      const response = await handlers.resources.collection.POST(request);

      expect(response.status).toBe(413);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(file.arrayBuffer).not.toHaveBeenCalled();
      expect(file.stream).not.toHaveBeenCalled();
      expect(calls.prepareResourceUpload).not.toHaveBeenCalled();
    },
  );

  it("rejects a second File part before consuming either file", async () => {
    const { handlers, calls } = createHandlers();
    const primary = createFileLike({ size: 16 });
    const second = createFileLike({ name: "second.bin", size: 16 });
    const { request } = createRequest({
      formData: createFormDataLike([
        { field: "file", file: primary.file },
        { field: "attachment", file: second.file },
      ]),
    });

    const response = await handlers.resources.collection.POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(primary.arrayBuffer).not.toHaveBeenCalled();
    expect(second.arrayBuffer).not.toHaveBeenCalled();
    expect(calls.prepareResourceUpload).not.toHaveBeenCalled();
  });

  it("keeps exact 50 MiB inside the final boundary and does not early-reject normal multipart overhead", async () => {
    const file = createFileLike({ size: localResourceMaxFileSizeByte });
    const { handlers } = createHandlers();
    const { request, formData } = createRequest({
      contentLength: String(
        localResourceMaxFileSizeByte + resourceMultipartOverheadAllowanceByte,
      ),
      formData: createFormDataLike([{ field: "file", file: file.file }]),
    });

    const response = await handlers.resources.collection.POST(request);

    expect(formData).toHaveBeenCalledOnce();
    expect(file.arrayBuffer).toHaveBeenCalledOnce();
    expect(response.status).not.toBe(413);
  });

  it("protects the storage preparation boundary before arrayBuffer", async () => {
    const oversized = createFileLike({
      size: localResourceMaxFileSizeByte + 1,
    });

    await expect(
      prepareLocalResourceFile({
        file: oversized.file,
        profession: "marketing",
        resourceType: "knowledge_doc",
      }),
    ).rejects.toThrow(/too large/u);
    expect(oversized.arrayBuffer).not.toHaveBeenCalled();
  });

  it("keeps the client gate before FormData construction and fetch", async () => {
    const source = await readFile(
      "src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx",
      "utf8",
    );
    const guardIndex = source.indexOf(
      "uploadState.file.size > localResourceMaxFileSizeByte",
    );

    expect(guardIndex).toBeGreaterThan(0);
    expect(
      source.indexOf(
        "const uploadResult = await postLocalResourceUpload(",
        guardIndex,
      ),
    ).toBeGreaterThan(guardIndex);
    expect(source).toContain("new FormData()");
    expect(source).toContain('fetch("/api/v1/resources"');
    expect(source).toContain("文件过大，请压缩或拆分后上传");
  });
});
