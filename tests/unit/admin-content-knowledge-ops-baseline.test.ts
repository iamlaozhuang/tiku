import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminContentKnowledgeOpsBaseline } from "@/app/(admin)/content/ContentKnowledgeOpsBaseline";
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
});

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
});
