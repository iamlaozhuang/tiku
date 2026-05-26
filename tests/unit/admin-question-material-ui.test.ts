import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminQuestionMaterialManagement } from "@/features/admin/question-material-management/AdminQuestionMaterialManagement";

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

const questionPayload = {
  code: 0,
  message: "ok",
  data: [
    {
      publicId: "question-marketing-001",
      questionType: "single_choice",
      profession: "marketing",
      level: 3,
      subject: "theory",
      stemRichText: "市场调研抽样方法的核心目标是什么？",
      analysisRichText: "抽样方法需要确保样本代表目标总体。",
      standardAnswerRichText: "提高样本代表性。",
      status: "available",
      isLocked: false,
      lockedAt: null,
      multiChoiceRule: "all_correct_only",
      scoringMethod: "auto_match",
      materialPublicId: "material-marketing-001",
      questionOptions: [],
      scoringPoints: [],
      knowledgeNodePublicIds: ["knowledge-node-sampling"],
      tagPublicIds: ["tag-research"],
      createdAt: "2026-05-19T06:20:00.000Z",
      updatedAt: "2026-05-19T06:20:00.000Z",
      id: 101,
    },
    {
      publicId: "question-logistics-002",
      questionType: "short_answer",
      profession: "logistics",
      level: 2,
      subject: "skill",
      stemRichText: "物流成本核算适用于哪类场景？",
      analysisRichText: "物流成本核算用于评估运输、仓储和配送成本。",
      standardAnswerRichText: "适用于运输、仓储、配送等成本分析场景。",
      status: "disabled",
      isLocked: true,
      lockedAt: "2026-05-18T08:00:00.000Z",
      multiChoiceRule: "all_correct_only",
      scoringMethod: "ai_scoring",
      materialPublicId: null,
      questionOptions: [],
      scoringPoints: [],
      knowledgeNodePublicIds: ["knowledge-node-costing"],
      tagPublicIds: [],
      createdAt: "2026-05-18T05:10:00.000Z",
      updatedAt: "2026-05-19T03:10:00.000Z",
      id: 102,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
};

const caseAnalysisQuestionPayload = {
  ...questionPayload.data[0],
  publicId: "question-case-analysis-001",
  questionType: "case_analysis",
  profession: "logistics",
  level: 4,
  subject: "skill",
  stemRichText: "Synthetic case_analysis stem",
  analysisRichText: "Synthetic case_analysis analysis",
  standardAnswerRichText: "Synthetic case_analysis reference",
  scoringMethod: "ai_scoring",
  materialPublicId: "material-marketing-001",
  questionOptions: [],
  scoringPoints: [
    {
      description: "Synthetic case_analysis scoring_point",
      score: "2.0",
      sortOrder: 1,
    },
  ],
  knowledgeNodePublicIds: ["knowledge-node-case-analysis"],
  tagPublicIds: ["tag-case-analysis"],
  createdAt: "2026-05-19T06:25:00.000Z",
  updatedAt: "2026-05-19T06:25:00.000Z",
};

const calculationQuestionPayload = {
  ...questionPayload.data[0],
  publicId: "question-calculation-001",
  questionType: "calculation",
  profession: "logistics",
  level: 4,
  subject: "skill",
  stemRichText: "Synthetic calculation stem",
  analysisRichText: "Synthetic calculation analysis",
  standardAnswerRichText: "Synthetic calculation reference",
  scoringMethod: "ai_scoring",
  materialPublicId: "material-marketing-001",
  questionOptions: [],
  scoringPoints: [
    {
      description: "Synthetic calculation scoring_point",
      score: "2.0",
      sortOrder: 1,
    },
  ],
  knowledgeNodePublicIds: ["knowledge-node-calculation"],
  tagPublicIds: ["tag-calculation"],
  createdAt: "2026-05-19T06:26:00.000Z",
  updatedAt: "2026-05-19T06:26:00.000Z",
};

const materialPayload = {
  code: 0,
  message: "ok",
  data: [
    {
      publicId: "material-marketing-001",
      title: "营销案例材料 A",
      contentRichText: "某品牌计划进入区域市场，需要完成消费者抽样调研。",
      profession: "marketing",
      level: 3,
      subject: "theory",
      status: "available",
      isLocked: false,
      lockedAt: null,
      createdAt: "2026-05-19T06:00:00.000Z",
      updatedAt: "2026-05-19T06:00:00.000Z",
      id: 201,
    },
    {
      publicId: "material-locked-002",
      title: "已锁定物流材料 B",
      contentRichText: "已发布试卷快照引用的材料正文。",
      profession: "logistics",
      level: 2,
      subject: "skill",
      status: "available",
      isLocked: true,
      lockedAt: "2026-05-19T07:00:00.000Z",
      createdAt: "2026-05-19T05:00:00.000Z",
      updatedAt: "2026-05-19T07:00:00.000Z",
      id: 202,
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function createQuestionListPayload(
  data: Array<Record<string, unknown>> = questionPayload.data,
) {
  return {
    ...questionPayload,
    data,
    pagination: {
      ...questionPayload.pagination,
      total: data.length,
    },
  };
}

function mockContentFetch(
  data: Array<Record<string, unknown>> = questionPayload.data,
) {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(adminSessionPayload);
    }

    if (path.startsWith("/api/v1/questions?")) {
      return createJsonResponse(createQuestionListPayload(data));
    }

    if (path.startsWith("/api/v1/materials?")) {
      return createJsonResponse(materialPayload);
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockWritableContentFetch(
  data: Array<Record<string, unknown>> = questionPayload.data,
) {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);
      const method = init?.method ?? "GET";

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/questions?")) {
        return createJsonResponse(createQuestionListPayload(data));
      }

      if (path.startsWith("/api/v1/materials?")) {
        return createJsonResponse(materialPayload);
      }

      if (path === "/api/v1/questions" && method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              publicId: "question-created-001",
              stemRichText: "新建题目题干",
            },
          },
        });
      }

      if (
        path === "/api/v1/questions/question-marketing-001" &&
        method === "PATCH"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              stemRichText: "编辑后的题干",
              updatedAt: "2026-05-19T06:30:00.000Z",
            },
          },
        });
      }

      if (
        path === "/api/v1/questions/question-marketing-001/disable" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              status: "disabled",
            },
          },
        });
      }

      if (
        path === "/api/v1/questions/question-marketing-001/copy" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            question: {
              ...questionPayload.data[0],
              publicId: "question-marketing-001-copy",
            },
          },
        });
      }

      if (
        path ===
          "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            recommendation: {
              questionPublicId: "question-marketing-001",
              recommendationStatus: "recommended",
              reviewState: {
                questionUpdatedAt: "2026-05-19T06:20:00.000Z",
                staleCheck: "question_updated_at_mismatch",
                bindingMode: "local_review_only",
              },
              recommendations: [
                {
                  knowledgeNodePublicId: "knowledge-node-sampling-v2",
                  name: "Sampling v2",
                  pathName: "Marketing / Research / Sampling v2",
                  confidence: "high",
                  reason: "bounded local fixture reason",
                  source: "ai_recommended",
                  confirmationStatus: "pending_confirmation",
                },
                {
                  knowledgeNodePublicId: "knowledge-node-segmentation",
                  name: "Segmentation",
                  pathName: "Marketing / Research / Segmentation",
                  confidence: "low",
                  reason: "bounded local fallback reason",
                  source: "ai_recommended",
                  confirmationStatus: "pending_confirmation",
                },
              ],
              modelConfig: {
                modelConfigPublicId: "model-config-dev-kn-recommendation",
                providerPublicId: "model-provider-dev-local",
                providerDisplayName: "Local deterministic provider",
                providerKey: "local_deterministic",
                modelName: "local-kn-recommendation-v1",
                displayName: "Local knowledge recommendation model",
                aiFuncType: "kn_recommendation",
                configVersion: 1,
                promptTemplateKey: "dev_kn_recommendation_v1",
                promptTemplateVersion: 1,
              },
              failureReason: null,
            },
          },
        });
      }

      if (path === "/api/v1/materials" && method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              publicId: "material-created-001",
              title: "新建案例材料",
            },
          },
        });
      }

      if (
        path === "/api/v1/materials/material-marketing-001" &&
        method === "PATCH"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              title: "编辑后的材料",
            },
          },
        });
      }

      if (
        path === "/api/v1/materials/material-marketing-001/disable" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              status: "disabled",
            },
          },
        });
      }

      if (
        path === "/api/v1/materials/material-marketing-001/copy" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            material: {
              ...materialPayload.data[0],
              publicId: "material-marketing-001-copy",
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

function readJsonRequestBody(
  fetchMock: ReturnType<typeof vi.fn>,
  path: string,
  method: string,
) {
  const matchedCall = fetchMock.mock.calls.find(
    ([requestUrl, requestInit]) =>
      String(requestUrl) === path && requestInit?.method === method,
  );

  expect(matchedCall).toBeDefined();

  const requestBody = matchedCall?.[1]?.body;

  expect(typeof requestBody).toBe("string");

  return JSON.parse(String(requestBody)) as Record<string, unknown>;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminQuestionMaterialManagement", () => {
  it("renders unauthorized state without calling protected content APIs when the local session token is missing", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminQuestionMaterialManagement));

    expect(screen.getByText("请先登录后台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads question management through the protected runtime with filters and safe actions", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    expect(screen.getByText("正在加载题库数据")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "题库与材料管理" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "题目" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "新建题目" })).toBeEnabled();
    expect(
      screen.getByTestId("content-action-runtime-ready"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "编辑题目 question-marketing-001",
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: "停用题目 question-marketing-001",
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: "复制题目 question-marketing-001",
      }),
    ).toBeEnabled();

    expect(
      screen.getByTestId("question-row-question-marketing-001"),
    ).toHaveAttribute("data-public-id", "question-marketing-001");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
  });

  it("filters questions by keyword and status without exposing numeric ids", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    expect(
      await screen.findByText("市场调研抽样方法的核心目标是什么？"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "物流成本" },
    });
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "disabled" },
    });

    expect(
      screen.getByText("物流成本核算适用于哪类场景？"),
    ).toBeInTheDocument();
    expect(screen.queryByText("市场调研抽样方法的核心目标是什么？")).toBeNull();

    const row = screen
      .getByText("物流成本核算适用于哪类场景？")
      .closest("article");
    expect(row).not.toBeNull();
    expect(row).toHaveAttribute("data-public-id", "question-logistics-002");
    expect(row).not.toHaveAttribute("data-id");
  });

  it("renders common pagination and updated-at sorting controls for question lists", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");

    expect(screen.getByLabelText("每页条数")).toHaveValue("20");
    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "50" },
    });
    expect(screen.getByLabelText("每页条数")).toHaveValue("50");

    fireEvent.click(screen.getByRole("button", { name: "更新时间排序" }));
    const rows = screen.getAllByTestId(/question-row-/);

    expect(rows[0]).toHaveAttribute("data-public-id", "question-logistics-002");
    expect(rows[1]).toHaveAttribute("data-public-id", "question-marketing-001");
  });

  it("filters questions by level, question type, knowledge_node, and tag", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");

    fireEvent.change(screen.getByLabelText("等级筛选"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "short_answer" },
    });
    fireEvent.change(screen.getByLabelText("知识点筛选"), {
      target: { value: "knowledge-node-costing" },
    });

    expect(
      screen.getByText("物流成本核算适用于哪类场景？"),
    ).toBeInTheDocument();
    expect(screen.queryByText("市场调研抽样方法的核心目标是什么？")).toBeNull();

    fireEvent.change(screen.getByLabelText("等级筛选"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "single_choice" },
    });
    fireEvent.change(screen.getByLabelText("知识点筛选"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("标签筛选"), {
      target: { value: "tag-research" },
    });

    expect(
      screen.getByText("市场调研抽样方法的核心目标是什么？"),
    ).toBeInTheDocument();
    expect(screen.queryByText("物流成本核算适用于哪类场景？")).toBeNull();
  });

  it("lists and filters case_analysis and calculation question types", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch([caseAnalysisQuestionPayload, calculationQuestionPayload]);

    render(createElement(AdminQuestionMaterialManagement));

    expect(
      await screen.findByText("Synthetic case_analysis stem"),
    ).toBeInTheDocument();
    expect(screen.getByText("Synthetic calculation stem")).toBeInTheDocument();
    expect(screen.getAllByText("案例分析题").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("计算题").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText("knowledge-node-case-analysis"),
    ).toBeInTheDocument();
    expect(screen.getByText("tag-calculation")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "case_analysis" },
    });

    expect(
      screen.getByText("Synthetic case_analysis stem"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Synthetic calculation stem")).toBeNull();

    fireEvent.change(screen.getByLabelText("题型"), {
      target: { value: "calculation" },
    });

    expect(screen.getByText("Synthetic calculation stem")).toBeInTheDocument();
    expect(screen.queryByText("Synthetic case_analysis stem")).toBeNull();
  });

  it("keeps locked questions copy-only in the content admin list", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-logistics-002");

    expect(
      screen.getByTestId("question-edit-question-logistics-002"),
    ).toBeDisabled();
    expect(
      screen.getByText("已锁定题目只能复制新题后编辑"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "复制题目 question-logistics-002",
      }),
    ).toBeEnabled();
  });

  it("renders material management with runtime loading and an empty filtered state", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    expect(await screen.findByText("营销案例材料 A")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "材料" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "新建材料" })).toBeEnabled();
    expect(
      screen.getByTestId("content-action-runtime-ready"),
    ).toBeInTheDocument();

    const materialRow = screen.getByTestId(
      "material-row-material-marketing-001",
    );
    expect(materialRow).toHaveAttribute(
      "data-public-id",
      "material-marketing-001",
    );
    expect(materialRow).toHaveTextContent("营销 / 3级 / 理论");

    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的材料" },
    });

    expect(screen.getByText("没有匹配的材料")).toBeInTheDocument();
  });

  it("keeps locked materials copy-only and exposes their lock boundary", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByTestId("material-row-material-locked-002");

    expect(
      screen.getByTestId("material-edit-material-locked-002"),
    ).toBeDisabled();
    expect(
      screen.getByText("已锁定材料只能复制新材料后编辑"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "复制材料 material-locked-002",
      }),
    ).toBeEnabled();
  });

  it("creates, edits, disables, and copies questions through the protected runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "新建题目题干" },
    });
    fireEvent.change(screen.getByLabelText("标准答案"), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText("老师解析"), {
      target: { value: "新建题目解析" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目 question-created-001 已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
          "content-type": "application/json",
        }),
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "编辑题目 question-marketing-001",
      }),
    );
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "编辑后的题干" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目 question-marketing-001 已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001",
      expect.objectContaining({ method: "PATCH" }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "停用题目 question-marketing-001",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认停用题目？");
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "复制题目 question-marketing-001",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001/disable",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001/copy",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("posts selected existing question type fields instead of hardcoded single_choice defaults", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "multi_choice" },
    });
    fireEvent.change(questionForm.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(questionForm.getByLabelText("等级"), {
      target: { value: "2" },
    });
    fireEvent.change(questionForm.getByLabelText("科目"), {
      target: { value: "skill" },
    });
    fireEvent.change(questionForm.getByLabelText("关联材料 publicId"), {
      target: { value: "material-marketing-001" },
    });
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "多选题题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "A,B" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "多选题解析" },
    });
    fireEvent.change(questionForm.getByLabelText("多选评分规则"), {
      target: { value: "partial_credit" },
    });
    fireEvent.change(questionForm.getByLabelText("选项 A"), {
      target: { value: "候选项 A" },
    });
    fireEvent.change(questionForm.getByLabelText("选项 B"), {
      target: { value: "候选项 B" },
    });
    fireEvent.click(questionForm.getByLabelText("选项 A 正确"));
    fireEvent.click(questionForm.getByLabelText("选项 B 正确"));
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目 question-created-001 已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );

    expect(requestBody).toMatchObject({
      level: 2,
      materialPublicId: "material-marketing-001",
      multiChoiceRule: "partial_credit",
      profession: "marketing",
      questionType: "multi_choice",
      scoringMethod: "auto_match",
      subject: "skill",
    });
    expect(requestBody.questionOptions).toEqual([
      {
        contentRichText: "候选项 A",
        isCorrect: true,
        label: "A",
        sortOrder: 1,
      },
      {
        contentRichText: "候选项 B",
        isCorrect: true,
        label: "B",
        sortOrder: 2,
      },
      {
        contentRichText: "C",
        isCorrect: false,
        label: "C",
        sortOrder: 3,
      },
      {
        contentRichText: "D",
        isCorrect: false,
        label: "D",
        sortOrder: 4,
      },
    ]);
    expect(requestBody.scoringPoints).toEqual([]);
  });

  it("normalizes true_false A/B authoring into correct and incorrect answers", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "true_false" },
    });

    expect(questionForm.getByLabelText("标准答案")).toHaveValue("A");
    expect(questionForm.getByLabelText("选项 A")).toHaveValue("正确");
    expect(questionForm.getByLabelText("选项 B")).toHaveValue("错误");
    expect(questionForm.queryByLabelText("选项 C")).toBeNull();

    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "判断题题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "B" },
    });
    fireEvent.change(questionForm.getByLabelText("老师解析"), {
      target: { value: "判断题解析" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目 question-created-001 已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );

    expect(requestBody).toMatchObject({
      questionType: "true_false",
      standardAnswerRichText: "错误",
    });
    expect(requestBody.questionOptions).toEqual([
      {
        contentRichText: "正确",
        isCorrect: true,
        label: "A",
        sortOrder: 1,
      },
      {
        contentRichText: "错误",
        isCorrect: false,
        label: "B",
        sortOrder: 2,
      },
    ]);
  });

  it("prevents saving question rich text above the SSOT 10000 character limit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "题".repeat(10001) },
    });

    expect(questionForm.getByText("10001/10000")).toBeInTheDocument();
    expect(
      questionForm.getByText("题干超过 10000 字符，不能保存。"),
    ).toBeInTheDocument();
    expect(
      questionForm.getByRole("button", { name: "保存题目" }),
    ).toBeDisabled();

    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/questions" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);
  });

  it("offers bounded rich text helpers for managed paper_asset image references and table markup", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));

    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.click(
      questionForm.getByRole("button", { name: "插入受管图片引用" }),
    );
    fireEvent.click(questionForm.getByRole("button", { name: "插入表格模板" }));

    const stemInput = questionForm.getByLabelText(
      "题干",
    ) as HTMLTextAreaElement;

    expect(stemInput.value).toContain("<img");
    expect(stemInput.value).toContain(
      'data-paper-asset-public-id="paper-asset-local-question-image"',
    );
    expect(stemInput.value).toContain("/api/v1/paper-assets/");
    expect(stemInput.value).not.toContain("local-image-placeholder");
    expect(stemInput.value).not.toContain("dev/paper-asset");
    expect(stemInput.value).toContain("<table>");
  });

  it("posts non-option existing question type scoring points without option rows", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByText("市场调研抽样方法的核心目标是什么？");
    fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
    const questionForm = within(screen.getByRole("form", { name: "题目表单" }));
    fireEvent.change(questionForm.getByLabelText("题型"), {
      target: { value: "short_answer" },
    });
    fireEvent.change(questionForm.getByLabelText("评分方式"), {
      target: { value: "ai_scoring" },
    });
    fireEvent.change(questionForm.getByLabelText("题干"), {
      target: { value: "简答题题干" },
    });
    fireEvent.change(questionForm.getByLabelText("标准答案"), {
      target: { value: "简答题参考答案" },
    });
    fireEvent.change(questionForm.getByLabelText("评分点 1"), {
      target: { value: "说明关键步骤" },
    });
    fireEvent.change(questionForm.getByLabelText("评分点 1 分值"), {
      target: { value: "2.5" },
    });
    fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

    expect(
      await screen.findByText("题目 question-created-001 已保存"),
    ).toBeInTheDocument();

    const requestBody = readJsonRequestBody(
      fetchMock,
      "/api/v1/questions",
      "POST",
    );

    expect(requestBody).toMatchObject({
      questionType: "short_answer",
      scoringMethod: "ai_scoring",
    });
    expect(requestBody.questionOptions).toEqual([]);
    expect(requestBody.scoringPoints).toEqual([
      {
        description: "说明关键步骤",
        score: "2.5",
        sortOrder: 1,
      },
    ]);
  });

  it.each(["case_analysis", "calculation"] as const)(
    "posts %s through the subjective authoring path",
    async (questionType) => {
      localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
      const fetchMock = mockWritableContentFetch();

      render(createElement(AdminQuestionMaterialManagement));

      await screen.findByText("市场调研抽样方法的核心目标是什么？");
      fireEvent.click(screen.getByRole("button", { name: "新建题目" }));
      const questionForm = within(
        screen.getByRole("form", { name: "题目表单" }),
      );
      fireEvent.change(questionForm.getByLabelText("题型"), {
        target: { value: questionType },
      });

      expect(questionForm.queryByLabelText("选项 A")).toBeNull();
      expect(questionForm.getByLabelText("评分点 1")).toBeInTheDocument();
      expect(questionForm.getByLabelText("标准答案")).toBeInTheDocument();

      fireEvent.change(questionForm.getByLabelText("评分方式"), {
        target: { value: "ai_scoring" },
      });
      fireEvent.change(questionForm.getByLabelText("关联材料 publicId"), {
        target: { value: "material-marketing-001" },
      });
      fireEvent.change(questionForm.getByLabelText("题干"), {
        target: { value: `Synthetic ${questionType} stem` },
      });
      fireEvent.change(questionForm.getByLabelText("标准答案"), {
        target: { value: `Synthetic ${questionType} reference` },
      });
      fireEvent.change(questionForm.getByLabelText("老师解析"), {
        target: { value: `Synthetic ${questionType} analysis` },
      });
      fireEvent.change(questionForm.getByLabelText("评分点 1"), {
        target: { value: `Synthetic ${questionType} scoring_point` },
      });
      fireEvent.change(questionForm.getByLabelText("评分点 1 分值"), {
        target: { value: "3.0" },
      });
      fireEvent.click(questionForm.getByRole("button", { name: "保存题目" }));

      expect(
        await screen.findByText("题目 question-created-001 已保存"),
      ).toBeInTheDocument();

      const requestBody = readJsonRequestBody(
        fetchMock,
        "/api/v1/questions",
        "POST",
      );

      expect(requestBody).toMatchObject({
        materialPublicId: "material-marketing-001",
        questionType,
        scoringMethod: "ai_scoring",
        standardAnswerRichText: `Synthetic ${questionType} reference`,
      });
      expect(requestBody.questionOptions).toEqual([]);
      expect(requestBody.scoringPoints).toEqual([
        {
          description: `Synthetic ${questionType} scoring_point`,
          score: "3.0",
          sortOrder: 1,
        },
      ]);
    },
  );

  it("opens question edit in a contextual panel tied to the selected row", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    fireEvent.click(screen.getByTestId("question-edit-question-marketing-001"));

    const editPanel = screen.getByTestId("content-edit-context-panel");

    expect(editPanel).toHaveTextContent("question-marketing-001");
    expect(
      screen.getByTestId("question-row-question-marketing-001"),
    ).toHaveAttribute("data-selected", "true");
    expect(
      screen.getByTestId("question-row-question-logistics-002"),
    ).toHaveAttribute("data-selected", "false");
    expect(within(editPanel).getByRole("form")).toBeInTheDocument();
  });

  it("reviews knowledge_node recommendations with confidence, stale, accept, and discard states", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(createElement(AdminQuestionMaterialManagement));

    await screen.findByTestId("question-row-question-marketing-001");
    fireEvent.click(
      screen.getByRole("button", {
        name: "Recommend knowledge nodes for question-marketing-001",
      }),
    );

    const panel = await screen.findByTestId(
      "knowledge-recommendation-panel-question-marketing-001",
    );
    expect(panel).toHaveAttribute("data-stale", "false");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-row-knowledge-node-sampling-v2",
      ),
    ).toHaveTextContent("high");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-row-knowledge-node-segmentation",
      ),
    ).toHaveTextContent("low");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-marketing-001/recommend-knowledge-nodes",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Accept recommendation knowledge-node-sampling-v2",
      }),
    );
    expect(
      screen.getByTestId("question-row-question-marketing-001"),
    ).toHaveTextContent("knowledge-node-sampling-v2");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Discard recommendation knowledge-node-segmentation",
      }),
    );
    expect(
      screen.getByTestId(
        "knowledge-recommendation-row-knowledge-node-segmentation",
      ),
    ).toHaveTextContent("discarded");

    fireEvent.click(
      screen.getByRole("button", {
        name: "编辑题目 question-marketing-001",
      }),
    );
    fireEvent.change(screen.getByLabelText("题干"), {
      target: { value: "updated bounded fixture stem" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存题目" }));

    await screen.findByText("题目 question-marketing-001 已保存");
    expect(
      screen.getByTestId(
        "knowledge-recommendation-panel-question-marketing-001",
      ),
    ).toHaveAttribute("data-stale", "true");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("creates, edits, disables, and copies materials through the protected runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));
    const createMaterialForm = within(
      screen.getByRole("form", { name: "材料表单" }),
    );
    fireEvent.change(screen.getByLabelText("材料标题"), {
      target: { value: "新建案例材料" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("专业"), {
      target: { value: "marketing" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("等级"), {
      target: { value: "4" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("科目"), {
      target: { value: "theory" },
    });
    fireEvent.change(createMaterialForm.getByLabelText("材料正文"), {
      target: { value: "新建材料正文" },
    });
    fireEvent.click(
      createMaterialForm.getByRole("button", { name: "保存材料" }),
    );

    expect(
      await screen.findByText("材料 material-created-001 已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer unit-test-admin-token",
          "content-type": "application/json",
        }),
      }),
    );
    expect(
      readJsonRequestBody(fetchMock, "/api/v1/materials", "POST"),
    ).toMatchObject({
      contentRichText: "新建材料正文",
      level: 4,
      profession: "marketing",
      subject: "theory",
      title: "新建案例材料",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "编辑材料 material-marketing-001",
      }),
    );
    const editMaterialForm = within(
      screen.getByRole("form", { name: "材料表单" }),
    );
    fireEvent.change(editMaterialForm.getByLabelText("材料标题"), {
      target: { value: "编辑后的材料" },
    });
    fireEvent.change(editMaterialForm.getByLabelText("等级"), {
      target: { value: "5" },
    });
    fireEvent.click(editMaterialForm.getByRole("button", { name: "保存材料" }));

    expect(
      await screen.findByText("材料 material-marketing-001 已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-marketing-001",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/materials/material-marketing-001",
        "PATCH",
      ),
    ).toMatchObject({
      level: 5,
      profession: "marketing",
      status: "available",
      subject: "theory",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "停用材料 material-marketing-001",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认停用材料？");
    fireEvent.click(screen.getByRole("button", { name: "确认停用" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "复制材料 material-marketing-001",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-marketing-001/disable",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/materials/material-marketing-001/copy",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
  });

  it("prevents saving material rich text above the SSOT 30000 character limit", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritableContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));

    const materialForm = within(screen.getByRole("form", { name: "材料表单" }));
    fireEvent.change(materialForm.getByLabelText("材料正文"), {
      target: { value: "材".repeat(30001) },
    });

    expect(materialForm.getByText("30001/30000")).toBeInTheDocument();
    expect(
      materialForm.getByText("材料正文超过 30000 字符，不能保存。"),
    ).toBeInTheDocument();
    expect(
      materialForm.getByRole("button", { name: "保存材料" }),
    ).toBeDisabled();
    expect(
      fetchMock.mock.calls.some(
        ([requestUrl, requestInit]) =>
          String(requestUrl) === "/api/v1/materials" &&
          requestInit?.method === "POST",
      ),
    ).toBe(false);
  });

  it("offers bounded rich text helpers for managed material paper_asset image references and table markup", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockWritableContentFetch();

    render(
      createElement(AdminQuestionMaterialManagement, {
        defaultView: "materials",
      }),
    );

    await screen.findByText("营销案例材料 A");
    fireEvent.click(screen.getByRole("button", { name: "新建材料" }));

    const materialForm = within(screen.getByRole("form", { name: "材料表单" }));
    fireEvent.click(
      materialForm.getByRole("button", { name: "插入受管图片引用" }),
    );
    fireEvent.click(materialForm.getByRole("button", { name: "插入表格模板" }));

    const contentInput = materialForm.getByLabelText(
      "材料正文",
    ) as HTMLTextAreaElement;

    expect(contentInput.value).toContain("<img");
    expect(contentInput.value).toContain(
      'data-paper-asset-public-id="paper-asset-local-material-image"',
    );
    expect(contentInput.value).toContain("/api/v1/paper-assets/");
    expect(contentInput.value).not.toContain("local-image-placeholder");
    expect(contentInput.value).not.toContain("dev/paper-asset");
    expect(contentInput.value).toContain("<table>");
  });
});
