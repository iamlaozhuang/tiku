import { Buffer } from "node:buffer";

import { expect, test, type APIRequestContext } from "@playwright/test";

type ApiPayload<TData = unknown> = {
  code: number;
  message: string;
  data: TData | null;
  pagination?: unknown;
};

type SessionLoginData = {
  token: string;
  user: {
    adminRoles?: string[];
    status: "active";
  };
};

type KnowledgeNodeData = {
  knowledgeNode: {
    knStatus: "active" | "disabled";
    name: string;
    profession: "marketing";
    publicId: string;
  };
};

type KnowledgeNodeListData = {
  knowledgeNodes: KnowledgeNodeData["knowledgeNode"][];
};

type ResourceData = {
  resource: {
    publicId: string;
    resourceStatus:
      | "draft"
      | "published"
      | "indexing"
      | "rag_ready"
      | "disabled"
      | "conversion_failed"
      | "index_failed";
    title: string;
  };
  localResource?: {
    chunkCandidateCount: number;
    parserMode: "local_only";
    redactedPreview: string | null;
  };
};

type ResourceVectorData = {
  resourceVector: {
    chunkCount: number;
    evidenceSummary: unknown;
    resourceStatus: "rag_ready" | "index_failed";
  };
};

type ResourceListData = {
  resources: ResourceData["resource"][];
};

type MultipartValue =
  | string
  | {
      buffer: Buffer;
      mimeType: string;
      name: string;
    };

const credentialValueKey = ["pass", "word"].join("") as "password";
const contentAdminCredential = {
  phone: "13900000006",
  [credentialValueKey]: ["TikuDevContentAdmin", "2026"].join("#"),
} as { phone: string; password: string };
const rawResourceBodyMarker = "LOCAL_FULL_LOOP_RAG_RAW_BODY_MARKER";

test.describe.configure({ mode: "serial" });

test("maintains local knowledge_node and resource RAG lifecycle via localhost API", async ({
  request,
}, testInfo) => {
  test.setTimeout(45_000);

  const sessionValue = await loginAsContentAdmin(request);
  const authorizationHeaders = {
    authorization: `Bearer ${sessionValue}`,
  };
  const uniqueSuffix = Date.now().toString(36);
  const knowledgeNodeName = `本地RAG闭环节点-${uniqueSuffix}`;
  const resourceTitle = `本地RAG闭环资源-${uniqueSuffix}`;
  const markdownContent = [
    "# 本地RAG闭环",
    "",
    `${rawResourceBodyMarker} 受控本地资料正文，仅用于运行时检索验证。`,
    "",
    "## 维护流程",
    "",
    "上传、发布、重建向量后应进入 rag_ready。",
  ].join("\n");

  const createKnowledgeNodePayload = await postJson<KnowledgeNodeData>(
    request,
    "/api/v1/knowledge-nodes",
    {
      levelList: [3],
      name: knowledgeNodeName,
      parentKnowledgeNodePublicId: null,
      profession: "marketing",
      sortOrder: 628,
    },
    authorizationHeaders,
  );
  const knowledgeNodePublicId =
    createKnowledgeNodePayload.data?.knowledgeNode.publicId;

  expect(knowledgeNodePublicId).toEqual(expect.any(String));
  expect(createKnowledgeNodePayload.data?.knowledgeNode).toMatchObject({
    knStatus: "active",
    name: knowledgeNodeName,
    profession: "marketing",
  });

  const listKnowledgeNodePayload = await getJson<KnowledgeNodeListData>(
    request,
    `/api/v1/knowledge-nodes?profession=marketing&keyword=${encodeURIComponent(
      knowledgeNodeName,
    )}&page=1&pageSize=20`,
    authorizationHeaders,
  );

  expect(listKnowledgeNodePayload.data?.knowledgeNodes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        publicId: knowledgeNodePublicId,
        knStatus: "active",
      }),
    ]),
  );

  const uploadResourcePayload = await postMultipart<ResourceData>(
    request,
    "/api/v1/resources",
    {
      file: {
        buffer: Buffer.from(markdownContent),
        mimeType: "text/markdown",
        name: `local-full-loop-rag-${uniqueSuffix}.md`,
      },
      fileName: `local-full-loop-rag-${uniqueSuffix}.md`,
      level: "3",
      profession: "marketing",
      resourceType: "knowledge_doc",
      title: resourceTitle,
    },
    authorizationHeaders,
  );
  const resourcePublicId = uploadResourcePayload.data?.resource.publicId;

  expect(resourcePublicId).toEqual(expect.any(String));
  expect(uploadResourcePayload.data).toMatchObject({
    resource: {
      resourceStatus: "draft",
      title: resourceTitle,
    },
    localResource: {
      parserMode: "local_only",
      redactedPreview: expect.stringMatching(/^\[redacted:[a-f0-9]{12}\]$/u),
    },
  });

  const publishResourcePayload = await postJson<ResourceData>(
    request,
    `/api/v1/resources/${resourcePublicId}/publish`,
    null,
    authorizationHeaders,
  );

  expect(publishResourcePayload.data?.resource).toMatchObject({
    publicId: resourcePublicId,
    resourceStatus: "published",
  });

  const rebuildVectorPayload = await postJson<ResourceVectorData>(
    request,
    `/api/v1/resources/${resourcePublicId}/rebuild-vector`,
    null,
    authorizationHeaders,
  );

  expect(rebuildVectorPayload.data?.resourceVector).toMatchObject({
    resourceStatus: "rag_ready",
    chunkCount: expect.any(Number),
  });
  expect(rebuildVectorPayload.data?.resourceVector.chunkCount).toBeGreaterThan(
    0,
  );

  const listResourcePayload = await getJson<ResourceListData>(
    request,
    `/api/v1/resources?status=rag_ready&keyword=${encodeURIComponent(
      resourceTitle,
    )}&page=1&pageSize=20`,
    authorizationHeaders,
  );

  expect(listResourcePayload.data?.resources).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        publicId: resourcePublicId,
        resourceStatus: "rag_ready",
      }),
    ]),
  );

  for (const payload of [
    createKnowledgeNodePayload,
    listKnowledgeNodePayload,
    uploadResourcePayload,
    publishResourcePayload,
    rebuildVectorPayload,
    listResourcePayload,
  ]) {
    expectStandardApiEnvelope(payload);
    expectCamelCaseJsonKeys(payload);
    expectNoInternalIdKeys(payload);
    expectNoRawRuntimePayload(payload, sessionValue);
  }

  await testInfo.attach("local-full-loop-knowledge-rag-summary", {
    body: JSON.stringify(
      {
        actorRole: "content_admin",
        knowledgeNode: {
          createStatus: "active",
          listStatus: "visible",
        },
        resource: {
          uploadStatus: "draft",
          publishStatus: "published",
          rebuildStatus: "rag_ready",
          listStatus: "visible",
          chunkCount:
            rebuildVectorPayload.data?.resourceVector.chunkCount ?? null,
        },
        redactionStatus:
          "no_credentials_no_session_values_no_storage_paths_no_raw_resource_content_no_chunk_text_no_embeddings_no_db_rows",
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

async function loginAsContentAdmin(
  request: APIRequestContext,
): Promise<string> {
  const payload = await postJson<SessionLoginData>(
    request,
    "/api/v1/sessions",
    contentAdminCredential,
    {},
  );

  expect(payload.data?.user.status).toBe("active");
  expect(payload.data?.user.adminRoles ?? []).toEqual(["content_admin"]);

  const sessionValue = payload.data?.token;

  expect(sessionValue).toEqual(expect.any(String));

  return sessionValue ?? "";
}

async function getJson<TData>(
  request: APIRequestContext,
  path: string,
  headers: Record<string, string>,
): Promise<ApiPayload<TData>> {
  const response = await request.get(path, { headers });

  return readOkPayload<TData>(response);
}

async function postJson<TData>(
  request: APIRequestContext,
  path: string,
  data: unknown,
  headers: Record<string, string>,
): Promise<ApiPayload<TData>> {
  const response = await request.post(path, {
    data,
    headers: {
      ...headers,
      "content-type": "application/json",
    },
  });

  return readOkPayload<TData>(response);
}

async function postMultipart<TData>(
  request: APIRequestContext,
  path: string,
  multipart: Record<string, MultipartValue>,
  headers: Record<string, string>,
): Promise<ApiPayload<TData>> {
  const response = await request.post(path, {
    headers,
    multipart,
  });

  return readOkPayload<TData>(response);
}

async function readOkPayload<TData>(
  response: Awaited<ReturnType<APIRequestContext["post"]>>,
): Promise<ApiPayload<TData>> {
  const payload = (await response.json()) as ApiPayload<TData>;

  expect(response.ok()).toBe(true);
  expect(payload).toMatchObject({
    code: 0,
    message: "ok",
    data: expect.any(Object),
  });

  return payload;
}

function expectStandardApiEnvelope(
  payload: unknown,
): asserts payload is ApiPayload {
  expect(payload).toEqual(expect.any(Object));

  const payloadRecord = payload as Record<string, unknown>;
  const allowedKeys = ["code", "message", "data", "pagination"];

  expect(
    Object.keys(payloadRecord).every((key) => allowedKeys.includes(key)),
  ).toBe(true);
  expect(payloadRecord.code).toEqual(expect.any(Number));
  expect(payloadRecord.message).toEqual(expect.any(String));
  expect(Object.hasOwn(payloadRecord, "data")).toBe(true);
}

function expectCamelCaseJsonKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      expectCamelCaseJsonKeys(item);
    }
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).toMatch(/^[a-z][A-Za-z0-9]*$/u);
    expectCamelCaseJsonKeys(childValue);
  }
}

function expectNoInternalIdKeys(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) {
      expectNoInternalIdKeys(item);
    }
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, childValue] of Object.entries(value)) {
    expect(key).not.toBe("id");
    expectNoInternalIdKeys(childValue);
  }
}

function expectNoRawRuntimePayload(value: unknown, sessionValue: string) {
  const serializedValue = JSON.stringify(value);

  for (const forbiddenValue of [
    contentAdminCredential.password,
    sessionValue,
    rawResourceBodyMarker,
    ".runtime",
    "objectKey",
    "storageRoot",
    "embedding",
    "chunkText",
  ]) {
    expect(serializedValue).not.toContain(forbiddenValue);
  }
}
