import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
  window.history.replaceState(null, "", "/");
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

function expectAdminFetchAuthorization(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
) {
  const matchedCall = fetchMock.mock.calls.find(
    ([requestUrl]) => String(requestUrl) === path,
  );

  expect(matchedCall).toBeDefined();
  expect(new Headers(matchedCall?.[1]?.headers).get("authorization")).toBe(
    "Bearer unit-test-admin-token",
  );
}

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
        publishedAt: "2026-05-20T12:00:00.000Z",
        indexingErrorSummary: null,
        uploadedAt: "2026-05-19T08:00:00.000Z",
        updatedAt: "2026-05-20T12:00:00.000Z",
        knowledgeNodePublicIds: [
          "knowledge-node-public-001",
          "knowledge-node-public-002",
        ],
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
        publishedAt: "2026-05-20T13:00:00.000Z",
        indexingErrorSummary: null,
        uploadedAt: "2026-05-18T08:00:00.000Z",
        updatedAt: "2026-05-20T13:00:00.000Z",
        knowledgeNodePublicIds: [],
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
        const body =
          typeof init.body === "string"
            ? (JSON.parse(init.body) as Record<string, unknown>)
            : {};

        if ("parentKnowledgeNodePublicId" in body) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              knowledgeNode: {
                ...knowledgeNodePayload.data.knowledgeNodes[0],
                parentKnowledgeNodePublicId: "knowledge-node-public-002",
                pathName: "物流/成本核算/市场调研",
                sortOrder: 30,
                updatedAt: "2026-05-20T15:30:00.000Z",
                id: 501,
              },
            },
          });
        }

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
        if (
          path.includes("keyword=%E4%B8%8D%E5%AD%98%E5%9C%A8") &&
          (payload as { code?: number }).code === 0
        ) {
          return createJsonResponse({
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
        }
        return createJsonResponse(payload);
      }

      if (path.startsWith("/api/v1/knowledge-nodes?")) {
        return createJsonResponse(knowledgeNodePayload);
      }

      if (path === "/api/v1/resources" && init?.method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            resource: {
              publicId: "resource-local-uploaded",
              title: "资料校对示例",
              resourceType: "knowledge_doc",
              resourceStatus: "draft",
              profession: "marketing",
              level: 3,
              originalFileName: "local-resource.md",
              downloadAvailable: true,
              markdownPreviewAvailable: true,
              isVectorStale: false,
              publishedAt: null,
              indexingErrorSummary: null,
              uploadedAt: "2026-05-25T08:00:00.000Z",
              updatedAt: "2026-05-25T08:00:00.000Z",
              knowledgeNodePublicIds: ["knowledge-node-public-001"],
            },
            localResource: {
              parserMode: "local_only",
              markdownContentHash: "local-markdown-hash",
              charLength: 80,
              lineCount: 5,
              chunkCandidateCount: 2,
              headingPaths: [["第一章"]],
              redactedPreview: "[redacted:123456789abc]",
              skippedReason: null,
            },
          },
        });
      }

      if (path === "/api/v1/resources/resource-public-001") {
        if (init?.method === "PATCH") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              resource: {
                ...resourcePayload.data.resources[0],
                resourceStatus: "draft",
                isVectorStale: true,
              },
            },
          });
        }

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            resource: resourcePayload.data.resources[0],
            localOnly: true,
            markdownContent: "# 第一章\n\n## 第一节\n\n仅用于单元测试",
          },
        });
      }

      if (
        path === "/api/v1/resources/resource-public-001/publish" &&
        init?.method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            resource: {
              ...resourcePayload.data.resources[0],
              resourceStatus: "published",
              isVectorStale: true,
              publishedAt: "2026-05-20T14:00:00.000Z",
              updatedAt: "2026-05-20T14:00:00.000Z",
            },
          },
        });
      }

      if (
        path === "/api/v1/resources/resource-public-001/rebuild-vector" &&
        init?.method === "POST"
      ) {
        return createJsonResponse(resourceVectorRebuildPayload);
      }

      if (
        path === "/api/v1/resources/resource-public-001/disable" &&
        init?.method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            resource: {
              ...resourcePayload.data.resources[0],
              resourceStatus: "disabled",
            },
          },
        });
      }

      if (
        path === "/api/v1/resources/resource-public-001/enable" &&
        init?.method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            resource: {
              ...resourcePayload.data.resources[0],
              resourceStatus: "rag_ready",
              isVectorStale: false,
              updatedAt: "2026-05-20T15:00:00.000Z",
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

    expect(
      screen.queryByTestId("content-ops-staging-required-role-arrangement"),
    ).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("内容运营本地验收");
    expect(document.body).not.toHaveTextContent("内容运营体验安排");
    expect(document.body).not.toHaveTextContent("本轮可写闭环");
    expect(document.body).not.toHaveTextContent("先验只读筛选");

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
    expect(
      screen.getByRole("button", {
        name: "查看市场调研抽样方法的核心目标是什么？",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "查看营销知识库讲义" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发布资料" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认发布资料？");
    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));
    expect(screen.getByRole("status")).toHaveTextContent("资料发布已提交");

    fireEvent.click(screen.getByRole("button", { name: "重建检索索引" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "检索索引重建需要二次确认",
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
    expect(
      screen.queryByTestId("content-ops-staging-required-role-arrangement"),
    ).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("内容运营本地验收");
    expect(document.body).not.toHaveTextContent("内容运营体验安排");

    const firstNode = screen.getByTestId(
      "knowledge-node-row-knowledge-node-public-001",
    );
    const marketingTree = screen.getByRole("tree", {
      name: "营销知识点树",
    });

    expect(firstNode).toHaveAttribute(
      "data-public-id",
      "knowledge-node-public-001",
    );
    expect(firstNode).toHaveAttribute("data-depth", "1");
    expect(marketingTree).toContainElement(firstNode);
    expect(firstNode).not.toHaveAttribute("data-id");
    expect(within(firstNode).getByText("营销/市场调研")).toBeInTheDocument();
    fireEvent.click(firstNode);
    const detailPanel = screen.getByRole("region", { name: "知识点详情" });
    expect(within(detailPanel).getByText("18 题")).toBeInTheDocument();
    expect(
      within(detailPanel).getByRole("link", {
        name: "查看 市场调研 的知识点推荐绑定",
      }),
    ).toHaveAttribute(
      "href",
      "/content/questions?knowledgeNodePublicId=knowledge-node-public-001&recommendationMode=durable_question_binding",
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expectAdminFetchAuthorization(
      fetchMock,
      "/api/v1/knowledge-nodes?page=1&pageSize=100&sortBy=sortOrder&sortOrder=asc",
    );
  });

  it("requires explicit knowledge node selection and uses readable tree controls", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockKnowledgeNodeFetch();

    render(createElement(AdminKnowledgeNodeManagement));

    const firstNode = await screen.findByTestId(
      "knowledge-node-row-knowledge-node-public-001",
    );

    expect(screen.getByRole("button", { name: "编辑节点" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "移动节点" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "停用节点" })).toBeDisabled();
    expect(screen.getByText("请选择一个知识点")).toBeInTheDocument();

    fireEvent.click(firstNode);

    expect(firstNode).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: "编辑节点" })).toBeEnabled();
    expect(
      screen.getByRole("heading", { name: "市场调研" }),
    ).toBeInTheDocument();
    expect(screen.getByText("完整路径")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "移动节点" }));
    const moveDialog = screen.getByRole("alertdialog");
    expect(
      within(moveDialog).getByLabelText("新父级知识点"),
    ).toBeInTheDocument();
    expect(within(moveDialog).getByLabelText("显示顺序")).toBeInTheDocument();
    expect(within(moveDialog).queryByLabelText("新父级业务标识")).toBeNull();
  });

  it("filters knowledge_node rows and renders empty, unauthorized, and error states", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse({
          code: 401001,
          message: "Admin session is required.",
          data: null,
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminKnowledgeNodeManagement));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);

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

  it("renders a complete tree without destructive global pagination", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockKnowledgeNodeFetch();

    render(createElement(AdminKnowledgeNodeManagement));

    await screen.findByText("营销/市场调研");

    expect(screen.queryByLabelText("每页条数")).toBeNull();
    expect(screen.queryByLabelText("列表分页")).toBeNull();
    expect(
      screen.getByRole("region", { name: "知识点树工作区" }),
    ).toBeInTheDocument();
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
    const createDialog = within(screen.getByRole("alertdialog"));
    fireEvent.change(createDialog.getByLabelText("节点名称"), {
      target: { value: "客户分层" },
    });
    fireEvent.change(createDialog.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(createDialog.getByLabelText("适用等级"), {
      target: { value: "2,3" },
    });
    fireEvent.change(createDialog.getByLabelText("父级知识点"), {
      target: { value: "knowledge-node-public-001" },
    });
    fireEvent.change(createDialog.getByLabelText("显示顺序"), {
      target: { value: "40" },
    });
    fireEvent.click(screen.getByRole("button", { name: "确认新增" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "知识点节点已新增",
    );
    expect(
      screen.getByRole("button", { name: "关闭操作反馈" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "关闭操作反馈" }));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getAllByText("营销/新增知识点").length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes",
      expect.objectContaining({
        body: JSON.stringify({
          parentKnowledgeNodePublicId: "knowledge-node-public-001",
          profession: "marketing",
          levelList: [2, 3],
          name: "客户分层",
          sortOrder: 40,
        }),
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
        }),
        method: "POST",
      }),
    );

    fireEvent.click(
      screen.getByTestId("knowledge-node-row-knowledge-node-public-001"),
    );
    fireEvent.click(screen.getByRole("button", { name: "编辑节点" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("编辑知识点节点");
    const editDialog = within(screen.getByRole("alertdialog"));
    expect(editDialog.getByLabelText("节点名称")).toHaveValue("市场调研");
    fireEvent.change(editDialog.getByLabelText("节点名称"), {
      target: { value: "市场调研（新版）" },
    });
    fireEvent.change(editDialog.getByLabelText("适用等级"), {
      target: { value: "3,4" },
    });
    fireEvent.change(editDialog.getByLabelText("显示顺序"), {
      target: { value: "15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "确认更新" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "知识点节点已更新",
    );
    expect(
      screen.getAllByText("营销/市场调研（已更新）").length,
    ).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes/knowledge-node-public-001",
      expect.objectContaining({
        body: JSON.stringify({
          levelList: [3, 4],
          name: "市场调研（新版）",
          sortOrder: 15,
        }),
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

  it("moves and sorts knowledge_node rows through publicId-safe runtime actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockKnowledgeNodeFetch();

    render(createElement(AdminKnowledgeNodeManagement));

    expect(
      await screen.findByRole("heading", { name: "知识点树维护" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId("knowledge-node-row-knowledge-node-public-001"),
    );
    fireEvent.click(screen.getByRole("button", { name: "移动节点" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("移动知识点节点");
    const moveDialog = within(screen.getByRole("alertdialog"));
    fireEvent.change(moveDialog.getByLabelText("新父级知识点"), {
      target: { value: "knowledge-node-public-002" },
    });
    fireEvent.change(moveDialog.getByLabelText("显示顺序"), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByRole("button", { name: "确认移动" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "知识点节点已移动",
    );
    expect(
      screen.getAllByText("物流/成本核算/市场调研").length,
    ).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/knowledge-nodes/knowledge-node-public-001",
      expect.objectContaining({
        body: JSON.stringify({
          parentKnowledgeNodePublicId: "knowledge-node-public-002",
          sortOrder: 45,
        }),
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
        }),
        method: "PATCH",
      }),
    );
    expect(screen.queryByRole("button", { name: "删除节点" })).toBeNull();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
  });

  it("loads resource management through the protected runtime and confirms vector rebuild by publicId", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch();

    render(createElement(AdminResourceKnowledgeManagement));

    expect(screen.getByText("正在加载资料与知识库")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "资料与知识库管理" }),
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
    expect(
      within(firstResource).getByText(/讲义 \/ marketing-guide\.md/),
    ).toBeInTheDocument();
    expect(
      within(firstResource).getByText("已发布，待重建检索索引"),
    ).toBeInTheDocument();
    expect(
      within(firstResource).getByText("解析草稿 可校对"),
    ).toBeInTheDocument();
    expect(
      within(firstResource).getByText(/检索索引\s*待重建/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("每页条数")).toHaveValue("20");
    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "50" },
    });
    expect(await screen.findByLabelText("每页条数")).toHaveValue("50");
    expect(window.location.search).toContain("pageSize=50");
    expect(screen.getByLabelText("排序字段")).toHaveValue("updatedAt");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "dev/resources/marketing/raw.pdf",
    );
    expect(document.body.textContent).not.toContain("embedding");
    expect(document.body.textContent).not.toContain("RAW_CHUNK_TEXT");

    const refreshedFirstResource = await screen.findByTestId(
      "resource-row-resource-public-001",
    );
    fireEvent.click(
      within(refreshedFirstResource).getByRole("button", {
        name: /^重建检索索引 /u,
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认重建营销知识库讲义的检索索引？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认重建" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "检索索引重建完成，已生成 2 段可检索内容",
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

  it("uses server-side resource pagination and separates upload from read-only detail", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch();

    render(createElement(AdminResourceKnowledgeManagement));

    const firstResource = await screen.findByTestId(
      "resource-row-resource-public-001",
    );

    expect(screen.queryByLabelText("资料名称")).toBeNull();
    expect(
      screen.getByRole("button", { name: "上传资料" }),
    ).toBeInTheDocument();
    expect(
      within(firstResource).getByRole("button", {
        name: "查看资料 营销知识库讲义",
      }),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes(
          "/api/v1/resources?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
        ),
      ),
    ).toBe(true);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("pageSize=100"),
      ),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "上传资料" }));
    expect(screen.getByLabelText("资料名称")).toBeInTheDocument();

    fireEvent.click(
      within(firstResource).getByRole("button", {
        name: "查看资料 营销知识库讲义",
      }),
    );
    const detailDialog = await screen.findByRole("dialog", {
      name: "资料详情",
    });
    expect(detailDialog).toHaveTextContent("章节目录");
    expect(detailDialog).toHaveTextContent("检索状态");
    expect(detailDialog.textContent).not.toContain("objectStoragePath");
    expect(detailDialog.textContent).not.toContain("embedding");

    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "50" },
    });
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("page=1&pageSize=50"),
        ),
      ).toBe(true),
    );
  });

  it("publishes a draft resource through the protected runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch({
      ...resourcePayload,
      data: {
        resources: [
          {
            ...resourcePayload.data.resources[0],
            resourceStatus: "draft",
            isVectorStale: false,
            publishedAt: null,
            indexingErrorSummary: null,
          },
        ],
      },
    });

    render(createElement(AdminResourceKnowledgeManagement));

    const firstResource = await screen.findByTestId(
      "resource-row-resource-public-001",
    );

    fireEvent.click(
      within(firstResource).getByRole("button", { name: /^发布资料 /u }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认发布营销知识库讲义的解析草稿？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "资料已发布，待重建检索索引",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources/resource-public-001/publish",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
        method: "POST",
      }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("objectStoragePath");
  });

  it("uploads, reviews, and disables resources through protected resource actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch();

    render(createElement(AdminResourceKnowledgeManagement));

    expect(
      await screen.findByRole("heading", { name: "资料与知识库管理" }),
    ).toBeInTheDocument();
    expect(
      within(
        await screen.findByTestId("resource-row-resource-public-001"),
      ).getByText("绑定知识点 2 个"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "上传资料" }));
    fireEvent.change(screen.getByLabelText("资料文件"), {
      target: {
        files: [
          new File(["# 本地资源\n\n受控测试资料"], "local-resource.md", {
            type: "text/markdown",
          }),
        ],
      },
    });
    fireEvent.change(screen.getByLabelText("搜索知识点"), {
      target: { value: "营销" },
    });
    fireEvent.click(
      await screen.findByRole("checkbox", { name: "营销/市场调研" }),
    );
    fireEvent.change(screen.getByLabelText("搜索知识点"), {
      target: { value: "物流" },
    });
    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: "物流/成本核算/物流成本",
      }),
    );
    expect(screen.queryByText("知识点业务标识")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "上传资料并生成草稿" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "资料上传完成，已生成解析草稿",
    );
    expect(screen.getByText("资料校对示例")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
        method: "POST",
      }),
    );
    const uploadCall = fetchMock.mock.calls.find(
      ([path, init]) => path === "/api/v1/resources" && init?.method === "POST",
    );
    const uploadBody = uploadCall?.[1]?.body;
    expect(uploadBody).toBeInstanceOf(FormData);
    expect((uploadBody as FormData).getAll("knowledgeNodePublicIds")).toEqual([
      "knowledge-node-public-001",
      "knowledge-node-public-002",
    ]);

    const firstResource = screen.getByTestId(
      "resource-row-resource-public-001",
    );

    fireEvent.click(
      within(firstResource).getByRole("button", { name: /^校对内容 /u }),
    );
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "校对营销知识库讲义的解析草稿",
    );
    fireEvent.change(screen.getByLabelText("解析草稿原文"), {
      target: { value: "# 已校对\n\n受控摘要" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "解析草稿已保存",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources/resource-public-001",
      expect.objectContaining({
        body: JSON.stringify({ markdownContent: "# 已校对\n\n受控摘要" }),
        method: "PATCH",
      }),
    );

    fireEvent.click(
      within(firstResource).getByRole("button", { name: /^停用资料 /u }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认停用营销知识库讲义？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));
    expect(await screen.findByRole("status")).toHaveTextContent("资料已停用");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources/resource-public-001/disable",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
        method: "POST",
      }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("objectStoragePath");
  });

  it("enables a disabled resource through the protected resource action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch({
      ...resourcePayload,
      data: {
        resources: [
          {
            ...resourcePayload.data.resources[0],
            resourceStatus: "disabled",
            isVectorStale: false,
          },
        ],
      },
    });

    render(createElement(AdminResourceKnowledgeManagement));

    const disabledResource = await screen.findByTestId(
      "resource-row-resource-public-001",
    );

    expect(within(disabledResource).getByText("已停用")).toBeInTheDocument();
    fireEvent.click(
      within(disabledResource).getByRole("button", { name: /^启用资料 /u }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认启用营销知识库讲义？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认启用" }));

    expect(await screen.findByRole("status")).toHaveTextContent("资料已启用");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources/resource-public-001/enable",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
        method: "POST",
      }),
    );
    expect(within(disabledResource).getByText("检索可用")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("objectStoragePath");
  });

  it("reviews and adjusts Markdown chapter hierarchy before saving a local resource draft", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockResourceFetch();

    render(createElement(AdminResourceKnowledgeManagement));

    const firstResource = await screen.findByTestId(
      "resource-row-resource-public-001",
    );

    fireEvent.click(
      within(firstResource).getByRole("button", { name: /^校对内容 /u }),
    );

    const reviewDialog = await screen.findByRole("dialog");

    expect(reviewDialog).toHaveTextContent("章节层级校对");
    expect(reviewDialog).toHaveTextContent("第 1 行");
    expect(reviewDialog).toHaveTextContent("1级");
    expect(reviewDialog).toHaveTextContent("第一章");
    expect(reviewDialog).toHaveTextContent("第 3 行");
    expect(reviewDialog).toHaveTextContent("2级");
    expect(reviewDialog).toHaveTextContent("第一章 > 第一节");

    fireEvent.click(
      within(reviewDialog).getByRole("button", {
        name: "提升 第一节 的章节层级",
      }),
    );

    expect(screen.getByLabelText("解析草稿原文")).toHaveValue(
      "# 第一章\n\n# 第一节\n\n仅用于单元测试",
    );

    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "解析草稿已保存",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/resources/resource-public-001",
      expect.objectContaining({
        body: JSON.stringify({
          markdownContent: "# 第一章\n\n# 第一节\n\n仅用于单元测试",
        }),
        method: "PATCH",
      }),
    );
  });

  it("treats a resource publicId as one opaque encoded path segment for every resource action", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const opaqueResourcePublicId = "resource_legacy/segment?mode#view";
    const encodedResourcePublicId = encodeURIComponent(opaqueResourcePublicId);
    const resourcePath = `/api/v1/resources/${encodedResourcePublicId}`;
    const opaqueResource = {
      ...resourcePayload.data.resources[0],
      publicId: opaqueResourcePublicId,
      resourceStatus: "draft" as const,
      publishedAt: null,
    };
    const fetchMock = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const path = String(url);

        if (path === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }
        if (path.startsWith("/api/v1/resources?")) {
          return createJsonResponse({
            ...resourcePayload,
            data: { resources: [opaqueResource] },
            pagination: { ...resourcePayload.pagination, total: 1 },
          });
        }
        if (path === resourcePath && init?.method === "PATCH") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              resource: {
                ...opaqueResource,
                isVectorStale: true,
              },
            },
          });
        }
        if (path === resourcePath) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              resource: opaqueResource,
              localOnly: true,
              markdownContent: "# 第一章\n\n仅用于单元测试",
            },
          });
        }
        if (path === `${resourcePath}/publish` && init?.method === "POST") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              resource: {
                ...opaqueResource,
                resourceStatus: "published",
                isVectorStale: true,
                publishedAt: "2026-05-20T14:00:00.000Z",
              },
            },
          });
        }
        if (
          path === `${resourcePath}/rebuild-vector` &&
          init?.method === "POST"
        ) {
          return createJsonResponse({
            ...resourceVectorRebuildPayload,
            data: {
              resourceVector: {
                ...resourceVectorRebuildPayload.data.resourceVector,
                resourcePublicId: opaqueResourcePublicId,
              },
            },
          });
        }
        if (path === `${resourcePath}/disable` && init?.method === "POST") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              resource: {
                ...opaqueResource,
                resourceStatus: "disabled",
              },
            },
          });
        }
        if (path === `${resourcePath}/enable` && init?.method === "POST") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              resource: {
                ...opaqueResource,
                resourceStatus: "rag_ready",
                isVectorStale: false,
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

    render(createElement(AdminResourceKnowledgeManagement));

    const resourceRow = await screen.findByTestId(
      "resource-row-resource-legacy-segment-mode-view",
    );
    const resourceDetailTrigger = within(resourceRow).getByRole("button", {
      name: /^查看资料 /u,
    });
    resourceDetailTrigger.focus();
    fireEvent.click(resourceDetailTrigger);
    expect(
      await screen.findByRole("dialog", { name: "资料详情" }),
    ).toHaveTextContent("营销知识库讲义");
    expect(screen.getByRole("button", { name: "关闭资料详情" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "资料详情" })).toBeNull();
    expect(resourceDetailTrigger).toHaveFocus();

    fireEvent.click(
      within(resourceRow).getByRole("button", { name: /^校对内容 /u }),
    );
    expect(await screen.findByLabelText("解析草稿原文")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "解析草稿已保存",
    );
    expect(
      screen.getByRole("button", { name: "关闭操作反馈" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "关闭操作反馈" }));

    fireEvent.click(
      within(resourceRow).getByRole("button", { name: /^发布资料 /u }),
    );
    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "资料已发布，待重建检索索引",
    );

    fireEvent.click(
      within(resourceRow).getByRole("button", { name: /^重建检索索引 /u }),
    );
    fireEvent.click(screen.getByRole("button", { name: "确认重建" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "检索索引重建完成",
    );

    fireEvent.click(
      within(resourceRow).getByRole("button", { name: /^停用资料 /u }),
    );
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));
    expect(await screen.findByRole("status")).toHaveTextContent("资料已停用");

    fireEvent.click(
      within(resourceRow).getByRole("button", { name: /^启用资料 /u }),
    );
    fireEvent.click(screen.getByRole("button", { name: "确认启用" }));
    expect(await screen.findByRole("status")).toHaveTextContent("资料已启用");

    expect(fetchMock).toHaveBeenCalledWith(
      resourcePath,
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      resourcePath,
      expect.objectContaining({ method: "PATCH" }),
    );
    for (const action of ["publish", "rebuild-vector", "disable", "enable"]) {
      expect(fetchMock).toHaveBeenCalledWith(
        `${resourcePath}/${action}`,
        expect.objectContaining({ method: "POST" }),
      );
    }
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).startsWith(`/api/v1/resources/${opaqueResourcePublicId}`),
      ),
    ).toBe(false);
  });

  it("renders resource empty, unauthorized, error, filtered-empty, and empty publicId boundaries", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse({
          code: 401001,
          message: "Admin session is required.",
          data: null,
        });
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminResourceKnowledgeManagement));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);

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

    expect(await screen.findByText("暂无资料与知识库数据")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch();
    render(createElement(AdminResourceKnowledgeManagement));
    expect(await screen.findByText("物流成本知识点")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的资料" },
    });
    expect(await screen.findByText("没有匹配的资料")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch({
      code: 503621,
      message: "unavailable",
      data: null,
    });
    render(createElement(AdminResourceKnowledgeManagement));
    expect(await screen.findByText("资料与知识库加载失败")).toBeInTheDocument();

    cleanup();
    window.history.replaceState(null, "", "/");
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockResourceFetch({
      code: 0,
      message: "ok",
      data: {
        resources: [
          {
            ...resourcePayload.data.resources[0],
            publicId: "",
          },
        ],
      },
      pagination: resourcePayload.pagination,
    });
    render(createElement(AdminResourceKnowledgeManagement));

    const emptyIdRow = await screen.findByTestId("resource-row-");
    expect(
      within(emptyIdRow).getByRole("button", { name: /^资料编号异常 /u }),
    ).toBeDisabled();
  });
});
