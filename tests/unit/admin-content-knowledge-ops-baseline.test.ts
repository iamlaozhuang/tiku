import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminContentKnowledgeOpsBaseline } from "@/app/(admin)/content/ContentKnowledgeOpsBaseline";
import { AdminKnowledgeNodeManagement } from "@/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement";
import { AdminResourceKnowledgeManagement } from "@/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement";
import {
  ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES,
  ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS,
  ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS,
  createAdminContentKnowledgeListQuery,
} from "@/server/contracts/admin-content-knowledge-ops-contract";
import {
  createAdminContentKnowledgeOpsService,
  createUnavailableAdminContentKnowledgeOpsService,
} from "@/server/services/admin-content-knowledge-ops-service";
import { createAdminContentKnowledgeOpsRouteHandlers } from "@/server/services/admin-content-knowledge-ops-route";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-content",
      phone: "13900000001",
      name: "Content Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "admin-content-public-001",
      adminRoles: ["content_admin"],
    },
    session: {
      expiresAt: "2026-05-29T04:00:00.000Z",
    },
  },
};

const knowledgeNodePayload = {
  code: 0,
  message: "ok",
  data: {
    knowledgeNodes: [
      {
        publicId: "knowledge-node-public-001",
        parentKnowledgeNodePublicId: null,
        profession: "marketing",
        levelList: [3],
        name: "市场调研",
        pathName: "营销/市场调研",
        sortOrder: 10,
        knStatus: "active",
        questionCount: 18,
        isRecommendable: true,
        updatedAt: "2026-05-20T12:00:00.000Z",
        id: 501,
      },
      {
        publicId: "knowledge-node-public-002",
        parentKnowledgeNodePublicId: "knowledge-node-public-001",
        profession: "logistics",
        levelList: [2, 3],
        name: "物流成本",
        pathName: "物流/成本核算/物流成本",
        sortOrder: 20,
        knStatus: "disabled",
        questionCount: 4,
        isRecommendable: false,
        updatedAt: "2026-05-20T13:00:00.000Z",
        id: 502,
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
};

const resourcePayload = {
  code: 0,
  message: "ok",
  data: {
    resources: [
      {
        publicId: "resource-public-001",
        title: "营销知识库讲义",
        resourceType: "lecture_note",
        resourceStatus: "published",
        profession: "marketing",
        level: 3,
        originalFileName: "marketing-guide.md",
        downloadAvailable: true,
        markdownPreviewAvailable: true,
        isVectorStale: true,
        uploadedAt: "2026-05-19T08:00:00.000Z",
        updatedAt: "2026-05-20T12:00:00.000Z",
        id: 801,
        objectStoragePath: "dev/resources/marketing/raw.pdf",
        embedding: [0.1, 0.2],
      },
      {
        publicId: "resource-public-002",
        title: "物流成本知识点",
        resourceType: "knowledge_doc",
        resourceStatus: "rag_ready",
        profession: "logistics",
        level: null,
        originalFileName: "logistics-cost.docx",
        downloadAvailable: false,
        markdownPreviewAvailable: false,
        isVectorStale: false,
        uploadedAt: "2026-05-18T08:00:00.000Z",
        updatedAt: "2026-05-20T13:00:00.000Z",
        id: 802,
      },
    ],
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
};

const resourceVectorRebuildPayload = {
  code: 0,
  message: "ok",
  data: {
    resourceVector: {
      resourcePublicId: "resource-public-001",
      resourceStatus: "rag_ready",
      chunkCount: 2,
      evidenceSummary: {
        chunkCount: 2,
        resourcePublicIds: ["resource-public-001"],
        chunkIndexes: [0, 1],
        textHashes: ["hash-one", "hash-two"],
        totalCharLength: 180,
        headingPaths: [["第一章", "第一节"]],
      },
    },
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function mockKnowledgeNodeFetch(payload: unknown = knowledgeNodePayload) {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/knowledge-nodes?")) {
        return createJsonResponse(payload);
      }

      if (path === "/api/v1/knowledge-nodes" && init?.method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            knowledgeNode: {
              parentKnowledgeNodePublicId: null,
              profession: "marketing",
              levelList: [3],
              name: "新增知识点",
              pathName: "营销/新增知识点",
              publicId: "knowledge-node-public-created",
              sortOrder: 30,
              knStatus: "active",
              questionCount: 0,
              isRecommendable: true,
              updatedAt: "2026-05-20T14:00:00.000Z",
              id: 503,
            },
          },
        });
      }

      if (
        path === "/api/v1/knowledge-nodes/knowledge-node-public-001" &&
        init?.method === "PATCH"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            knowledgeNode: {
              ...knowledgeNodePayload.data.knowledgeNodes[0],
              name: "市场调研（已更新）",
              pathName: "营销/市场调研（已更新）",
              updatedAt: "2026-05-20T15:00:00.000Z",
              id: 501,
            },
          },
        });
      }

      if (
        path === "/api/v1/knowledge-nodes/knowledge-node-public-001/disable" &&
        init?.method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            knowledgeNode: {
              ...knowledgeNodePayload.data.knowledgeNodes[0],
              knStatus: "disabled",
              isRecommendable: false,
              updatedAt: "2026-05-20T16:00:00.000Z",
              id: 501,
            },
          },
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockResourceFetch(payload: unknown = resourcePayload) {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/resources?")) {
        return createJsonResponse(payload);
      }

      if (
        path === "/api/v1/resources/resource-public-001/rebuild-vector" &&
        init?.method === "POST"
      ) {
        return createJsonResponse(resourceVectorRebuildPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("admin content and knowledge ops baseline", () => {
  it("defines content and knowledge list contracts with public identifiers only", () => {
    const query = createAdminContentKnowledgeListQuery({
      page: 2,
      pageSize: 50,
      sortBy: "publishedAt",
      sortOrder: "asc",
      keyword: "  市场调研  ",
      status: "published",
      profession: "marketing",
      level: 3,
    });

    expect(ADMIN_CONTENT_KNOWLEDGE_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
    expect(ADMIN_CONTENT_KNOWLEDGE_SORT_FIELDS).toEqual([
      "updatedAt",
      "createdAt",
      "publishedAt",
      "sortOrder",
    ]);
    expect(ADMIN_CONTENT_KNOWLEDGE_ERROR_CODES).toMatchObject({
      adminPermissionDenied: 403621,
      resourceNotFound: 404621,
      concurrentConflict: 409621,
      validationFailed: 422621,
    });
    expect(query).toMatchObject({
      page: 2,
      pageSize: 50,
      sortBy: "publishedAt",
      sortOrder: "asc",
      keyword: "市场调研",
      status: "published",
      profession: "marketing",
      level: 3,
    });
    expect(query).not.toHaveProperty("id");
  });

  it("returns safe content operation summaries and role-gated rebuild actions", async () => {
    const service = createAdminContentKnowledgeOpsService({
      actor: {
        publicId: "admin-content-001",
        roles: ["content_admin"],
      },
    });

    const questionList = await service.listQuestions({ page: 1, pageSize: 20 });
    const paperList = await service.listPapers({});
    const resourceList = await service.listResources({});
    const knowledgeNodeList = await service.listKnowledgeNodes({});
    const rebuildResult = await service.triggerResourceVectorRebuild(
      "resource-public-001",
    );

    expect(questionList).toMatchObject({
      code: 0,
      message: "ok",
      pagination: { page: 1, pageSize: 20, total: 2 },
    });
    expect(questionList.data?.questions[0]).toMatchObject({
      publicId: "question-public-001",
      stemSummary: "市场调研抽样方法的核心目标是什么？",
      questionType: "single_choice",
      knowledgeNodeNames: ["市场调研"],
    });
    expect(questionList.data?.questions[0]).not.toHaveProperty("id");
    expect(paperList.data?.papers[0]).not.toHaveProperty("id");
    expect(resourceList.data?.resources[0]).toMatchObject({
      publicId: "resource-public-001",
      title: "营销知识库讲义",
      resourceStatus: "rag_ready",
      downloadAvailable: true,
      markdownPreviewAvailable: true,
    });
    expect(resourceList.data?.resources[0]).not.toHaveProperty(
      "objectStoragePath",
    );
    expect(resourceList.data?.resources[0]).not.toHaveProperty("embedding");
    expect(knowledgeNodeList.data?.knowledgeNodes[0]).toMatchObject({
      publicId: "knowledge-node-public-001",
      pathName: "营销/市场调研",
      questionCount: 18,
      isRecommendable: true,
    });
    expect(rebuildResult).toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("keeps unavailable runtime services in the standard response envelope", async () => {
    const unavailableService =
      createUnavailableAdminContentKnowledgeOpsService();

    await expect(unavailableService.listResources({})).resolves.toEqual({
      code: 503621,
      message: "Admin content and knowledge runtime is not configured.",
      data: null,
      pagination: null,
    });
  });

  it("adapts content operation route requests to standard paginated responses", async () => {
    const handlers = createAdminContentKnowledgeOpsRouteHandlers(
      createAdminContentKnowledgeOpsService({
        actor: {
          publicId: "admin-content-001",
          roles: ["content_admin"],
        },
      }),
    );

    const questionsResponse = await handlers.questions.GET(
      new Request("http://localhost/api/v1/questions?page=2&pageSize=50"),
    );
    const resourcesResponse = await handlers.resources.GET(
      new Request("http://localhost/api/v1/resources?page=1&pageSize=20"),
    );
    const rebuildResponse = await handlers.rebuildResourceVector.POST(
      new Request(
        "http://localhost/api/v1/resources/resource-public-001/rebuild-vector",
        {
          method: "POST",
        },
      ),
      {
        params: Promise.resolve({
          publicId: "resource-public-001",
        }),
      },
    );

    await expect(questionsResponse.json()).resolves.toMatchObject({
      code: 0,
      message: "ok",
      pagination: {
        page: 2,
        pageSize: 50,
        total: 2,
      },
      data: {
        questions: expect.arrayContaining([
          expect.objectContaining({
            publicId: "question-public-001",
          }),
        ]),
      },
    });
    await expect(resourcesResponse.json()).resolves.toMatchObject({
      code: 0,
      data: {
        resources: [
          expect.objectContaining({
            publicId: "resource-public-001",
            resourceStatus: "rag_ready",
          }),
        ],
      },
    });
    await expect(rebuildResponse.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: null,
    });
  });

  it("renders content operation states, public ids, confirmations, and toast feedback", () => {
    render(
      createElement(AdminContentKnowledgeOpsBaseline, { state: "loading" }),
    );
    expect(
      screen.getByText("正在加载内容与知识库运营数据"),
    ).toBeInTheDocument();

    cleanup();
    render(createElement(AdminContentKnowledgeOpsBaseline, { state: "empty" }));
    expect(screen.getByText("暂无内容与知识库运营数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminContentKnowledgeOpsBaseline, { state: "error" }));
    expect(
      screen.getByText("内容与知识库运营数据加载失败"),
    ).toBeInTheDocument();

    cleanup();
    render(createElement(AdminContentKnowledgeOpsBaseline));

    const requiredRoleArrangement = screen.getByTestId(
      "content-ops-staging-required-role-arrangement",
    );
    expect(requiredRoleArrangement).toHaveTextContent("内容运营 staging 必验");
    expect(requiredRoleArrangement).toHaveTextContent(
      "知识点节点新增、编辑、停用",
    );
    expect(requiredRoleArrangement).toHaveTextContent(
      "题目、材料、试卷先验只读筛选",
    );
    expect(requiredRoleArrangement).toHaveTextContent(
      "不可用写操作必须显示原因和下一步",
    );

    expect(
      screen.getByRole("heading", { name: "内容与知识库运营" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin-question-question-public-001"),
    ).toHaveAttribute("data-public-id", "question-public-001");
    expect(
      screen.getByTestId("admin-question-question-public-001"),
    ).not.toHaveAttribute("data-id");
    expect(screen.getByText("营销知识库讲义")).toBeInTheDocument();
    expect(screen.queryByText("dev/resources/marketing/raw.pdf")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "发布资源" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认发布资源？");
    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));
    expect(screen.getByRole("status")).toHaveTextContent("资源发布已提交");

    fireEvent.click(screen.getByRole("button", { name: "手动重建向量" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "向量重建需要二次确认",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认重建" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "数据已被其他操作更新，请刷新后重试",
    );
  });

  it("loads knowledge_node management through the protected runtime without leaking internals", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockKnowledgeNodeFetch();

    render(createElement(AdminKnowledgeNodeManagement));

    expect(screen.getByText("正在加载知识点树")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "知识点树维护" }),
    ).toBeInTheDocument();

    const firstNode = screen.getByTestId(
      "knowledge-node-row-knowledge-node-public-001",
    );

    expect(firstNode).toHaveAttribute(
      "data-public-id",
      "knowledge-node-public-001",
    );
    expect(firstNode).not.toHaveAttribute("data-id");
    expect(within(firstNode).getByText("营销/市场调研")).toBeInTheDocument();
    expect(within(firstNode).getByText("绑定题目 18")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
  });

  it("filters knowledge_node rows and renders empty, unauthorized, and error states", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminKnowledgeNodeManagement));

    expect(screen.getByText("请先登录后台")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockKnowledgeNodeFetch();
    render(createElement(AdminKnowledgeNodeManagement));

    expect(
      await screen.findByText("物流/成本核算/物流成本"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "物流成本" },
    });
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });

    expect(screen.getByText("物流/成本核算/物流成本")).toBeInTheDocument();
    expect(screen.queryByText("营销/市场调研")).toBeNull();

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的知识点" },
    });
    expect(screen.getByText("没有匹配的知识点")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockKnowledgeNodeFetch({
      code: 503621,
      message: "unavailable",
      data: null,
    });
    render(createElement(AdminKnowledgeNodeManagement));

    expect(await screen.findByText("知识点树加载失败")).toBeInTheDocument();
  });

  it("creates, edits, and disables knowledge_node rows through publicId-safe runtime actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockKnowledgeNodeFetch();

    render(createElement(AdminKnowledgeNodeManagement));

    expect(
      await screen.findByRole("heading", { name: "知识点树维护" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "新增节点" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("新增知识点节点");
    fireEvent.click(screen.getByRole("button", { name: "确认新增" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "知识点节点已新增",
    );
    expect(screen.getByText("营销/新增知识点")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes",
      expect.objectContaining({
        body: JSON.stringify({
          parentKnowledgeNodePublicId: null,
          profession: "marketing",
          levelList: [3],
          name: "新增知识点",
          sortOrder: 30,
        }),
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
        }),
        method: "POST",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "编辑节点" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("编辑知识点节点");
    fireEvent.click(screen.getByRole("button", { name: "确认更新" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "知识点节点已更新",
    );
    expect(screen.getByText("营销/市场调研（已更新）")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes/knowledge-node-public-001",
      expect.objectContaining({
        body: JSON.stringify({ name: "市场调研（已更新）" }),
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
        }),
        method: "PATCH",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "停用节点" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认停用知识点节点？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "知识点节点已停用",
    );
    expect(
      screen.getByTestId("knowledge-node-row-knowledge-node-public-001"),
    ).toHaveTextContent("已停用");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes/knowledge-node-public-001/disable",
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
        }),
        method: "POST",
      }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
  });

  it("loads resource management through the protected runtime and confirms vector rebuild by publicId", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch();

    render(createElement(AdminResourceKnowledgeManagement));

    expect(screen.getByText("正在加载资源与知识库")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "资源与知识库管理" }),
    ).toBeInTheDocument();

    const firstResource = screen.getByTestId(
      "resource-row-resource-public-001",
    );

    expect(firstResource).toHaveAttribute(
      "data-public-id",
      "resource-public-001",
    );
    expect(firstResource).not.toHaveAttribute("data-id");
    expect(
      within(firstResource).getByText("营销知识库讲义"),
    ).toBeInTheDocument();
    expect(within(firstResource).getByText("营销 3级")).toBeInTheDocument();
    expect(within(firstResource).getByText("讲义")).toBeInTheDocument();
    expect(
      within(firstResource).getByText("已发布，待建向量"),
    ).toBeInTheDocument();
    expect(
      within(firstResource).getByText("Markdown 可预览"),
    ).toBeInTheDocument();
    expect(
      within(firstResource).getByText(/向量\s*待重建/),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "dev/resources/marketing/raw.pdf",
    );
    expect(document.body.textContent).not.toContain("embedding");
    expect(document.body.textContent).not.toContain("RAW_CHUNK_TEXT");

    fireEvent.click(
      within(firstResource).getByRole("button", { name: "重建向量" }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认重建营销知识库讲义的向量？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认重建" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "向量重建完成：2 个片段",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources/resource-public-001/rebuild-vector",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
        method: "POST",
      }),
    );
    expect(document.body.textContent).not.toContain("hash-one");
  });

  it("renders resource empty, unauthorized, error, filtered-empty, and unsafe publicId boundaries", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminResourceKnowledgeManagement));

    expect(screen.getByText("请先登录后台")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch({
      code: 0,
      message: "ok",
      data: { resources: [] },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        sortBy: "updatedAt",
        sortOrder: "desc",
      },
    });
    render(createElement(AdminResourceKnowledgeManagement));

    expect(await screen.findByText("暂无资源与知识库数据")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch();
    render(createElement(AdminResourceKnowledgeManagement));
    expect(await screen.findByText("物流成本知识点")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的资源" },
    });
    expect(screen.getByText("没有匹配的资源")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch({
      code: 503621,
      message: "unavailable",
      data: null,
    });
    render(createElement(AdminResourceKnowledgeManagement));
    expect(await screen.findByText("资源与知识库加载失败")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch({
      code: 0,
      message: "ok",
      data: {
        resources: [
          {
            ...resourcePayload.data.resources[0],
            publicId: "resource/public-unsafe",
          },
        ],
      },
      pagination: resourcePayload.pagination,
    });
    render(createElement(AdminResourceKnowledgeManagement));

    const unsafeRow = await screen.findByTestId(
      "resource-row-resource-public-unsafe",
    );
    expect(
      within(unsafeRow).getByRole("button", { name: "publicId 异常" }),
    ).toBeDisabled();
  });
});
