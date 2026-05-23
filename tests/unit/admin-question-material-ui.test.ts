import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 1,
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

function mockContentFetch() {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(adminSessionPayload);
    }

    if (path.startsWith("/api/v1/questions?")) {
      return createJsonResponse(questionPayload);
    }

    if (path.startsWith("/api/v1/materials?")) {
      return createJsonResponse(materialPayload);
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
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
    expect(screen.getByRole("button", { name: "新建题目" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "编辑题目" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "停用题目" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "复制题目" })).toBeDisabled();
    expect(
      screen.getByTestId("content-action-unavailable"),
    ).toBeInTheDocument();

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
    expect(screen.getByRole("button", { name: "新建材料" })).toBeDisabled();
    expect(
      screen.getByTestId("content-action-unavailable"),
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
});
