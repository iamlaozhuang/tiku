import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminPaperManagement } from "@/features/admin/paper-management/AdminPaperManagement";

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

const paperPayload = {
  code: 0,
  message: "ok",
  data: {
    papers: [
      {
        publicId: "paper-marketing-2026-spring",
        name: "2026 春季营销理论模拟卷",
        profession: "marketing",
        level: 3,
        subject: "theory",
        paperStatus: "published",
        paperType: "mock_paper",
        year: 2026,
        totalScore: "100.0",
        questionCount: 42,
        mockExamCount: 18,
        sourceFileName: "spring-marketing.pdf",
        publishValidationSummary: "发布校验已通过",
        updatedAt: "2026-05-19T08:20:00.000Z",
        id: 301,
      },
      {
        publicId: "paper-logistics-2026-practice",
        name: "物流技能练习卷",
        profession: "logistics",
        level: 2,
        subject: "skill",
        paperStatus: "draft",
        paperType: "mock_paper",
        year: 2026,
        totalScore: "0.0",
        questionCount: 8,
        mockExamCount: 0,
        sourceFileName: null,
        publishValidationSummary: "缺少题目分值",
        updatedAt: "2026-05-19T07:30:00.000Z",
        id: 302,
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

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function mockPaperFetch(payload: unknown = paperPayload) {
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
    const path = String(url);

    if (path === "/api/v1/sessions") {
      return createJsonResponse(adminSessionPayload);
    }

    if (path.startsWith("/api/v1/papers?")) {
      return createJsonResponse(payload);
    }

    return createJsonResponse({ code: 404001, message: "missing", data: null });
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function mockWritablePaperFetch() {
  const fetchMock = vi.fn(
    async (url: RequestInfo | URL, init?: RequestInit) => {
      const path = String(url);
      const method = init?.method ?? "GET";
      const draftPaper = paperPayload.data.papers[1];
      const publishedPaper = paperPayload.data.papers[0];

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (path.startsWith("/api/v1/papers?")) {
        return createJsonResponse(paperPayload);
      }

      if (path === "/api/v1/papers" && method === "POST") {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            paper: {
              ...draftPaper,
              publicId: "paper-created-001",
              name: "新建本地组卷",
              totalScore: "5.0",
              paperStatus: "draft",
              questionCount: 0,
            },
          },
        });
      }

      if (
        path === "/api/v1/papers/paper-logistics-2026-practice/questions" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            paperQuestion: {
              publicId: "paper-question-created-001",
              sourceQuestionPublicId: "question-marketing-001",
              score: "5.0",
              sortOrder: 1,
            },
          },
        });
      }

      if (
        path === "/api/v1/papers/paper-logistics-2026-practice/publish" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            paper: {
              ...draftPaper,
              paperStatus: "published",
              publishValidationSummary: "发布校验已通过",
            },
            lockedQuestionPublicIds: ["question-marketing-001"],
            lockedMaterialPublicIds: [],
          },
        });
      }

      if (
        path === "/api/v1/papers/paper-marketing-2026-spring/archive" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            paper: {
              ...publishedPaper,
              paperStatus: "archived",
            },
          },
        });
      }

      if (
        path === "/api/v1/papers/paper-marketing-2026-spring/copy" &&
        method === "POST"
      ) {
        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            copiedFromPaperPublicId: "paper-marketing-2026-spring",
            paper: {
              ...publishedPaper,
              publicId: "paper-copy-001",
              name: "2026 春季营销理论模拟卷（副本）",
              paperStatus: "draft",
              paperSections: [
                {
                  title: "Copy section",
                  description: null,
                  sortOrder: 1,
                  totalScore: "2.0",
                  paperQuestions: [
                    {
                      publicId: "paper-question-copy-001",
                      sourceQuestionPublicId: "question-disabled-001",
                      paperSectionSortOrder: 1,
                      questionGroupSortOrder: null,
                      score: "2.0",
                      sortOrder: 1,
                      questionSnapshot: {
                        questionPublicId: "question-disabled-001",
                        questionType: "single_choice",
                        profession: "marketing",
                        level: 3,
                        subject: "theory",
                        stemRichText: "Disabled source question",
                        questionOptions: [],
                        standardAnswerRichText: "A",
                        analysisRichText: "Disabled source analysis",
                        multiChoiceRule: "all_correct_only",
                        scoringMethod: "auto_match",
                        questionStatus: "disabled",
                      },
                      materialSnapshot: null,
                      scoringPoints: [],
                      createdAt: "2026-05-19T08:20:00.000Z",
                      updatedAt: "2026-05-19T08:20:00.000Z",
                    },
                  ],
                },
              ],
              questionGroups: [],
              publishedAt: null,
              archivedAt: null,
              createdAt: "2026-05-19T08:20:00.000Z",
              updatedAt: "2026-05-19T08:20:00.000Z",
            },
          },
        });
      }

      if (path === "/api/v1/paper-assets" && method === "POST") {
        expect(init?.body).toBeInstanceOf(FormData);

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: {
            paperAsset: {
              publicId: "paper-asset-created-001",
              paperPublicId: "paper-logistics-2026-practice",
              paperAttachmentUsage: "paper_source",
              fileName: "local-paper-source.pdf",
              contentType: "application/pdf",
              fileSizeByte: 2048,
              fileHash: "abc123def4567890abc123def4567890",
              createdAt: "2026-05-24T04:20:00.000Z",
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

describe("AdminPaperManagement", () => {
  it("renders unauthorized state without calling protected paper APIs when the local session token is missing", async () => {
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

    render(createElement(AdminPaperManagement));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/login");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("loads the paper management runtime with lifecycle actions and safe public identifiers", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockPaperFetch();

    render(createElement(AdminPaperManagement));

    expect(screen.getByText("正在加载试卷")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "试卷管理" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建草稿" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "组卷" })).toBeNull();
    expect(screen.queryByRole("button", { name: "发布" })).toBeNull();
    expect(screen.queryByRole("button", { name: "下架" })).toBeNull();
    expect(screen.queryByRole("button", { name: "复制" })).toBeNull();
    expect(screen.queryByRole("button", { name: "绑定原始文件" })).toBeNull();
    expect(screen.getByTestId("paper-action-unavailable")).toBeInTheDocument();

    const firstRow = screen.getByTestId(
      "paper-row-paper-marketing-2026-spring",
    );

    expect(firstRow).toHaveAttribute(
      "data-public-id",
      "paper-marketing-2026-spring",
    );
    expect(firstRow).not.toHaveAttribute("data-id");
    expect(
      within(firstRow).getByRole("button", {
        name: "组卷 paper-marketing-2026-spring",
      }),
    ).toBeDisabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "发布 paper-marketing-2026-spring",
      }),
    ).toBeDisabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "下架 paper-marketing-2026-spring",
      }),
    ).toBeEnabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "复制 paper-marketing-2026-spring",
      }),
    ).toBeEnabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "绑定原始文件 paper-marketing-2026-spring",
      }),
    ).toBeEnabled();
    expect(
      within(firstRow).getByText("2026 春季营销理论模拟卷"),
    ).toBeInTheDocument();
    expect(within(firstRow).getByText("模拟记录 18")).toBeInTheDocument();
    expect(
      within(firstRow).getByText(
        "已发布；可下架终止未完成作答；可复制为新草稿",
      ),
    ).toBeInTheDocument();

    const draftRow = screen.getByTestId(
      "paper-row-paper-logistics-2026-practice",
    );
    expect(
      within(draftRow).getByText(/草稿可继续组卷；发布前需处理/),
    ).toBeInTheDocument();
    expect(
      within(draftRow).getByRole("button", {
        name: "组卷 paper-logistics-2026-practice",
      }),
    ).toBeEnabled();
    expect(
      within(draftRow).getByRole("button", {
        name: "发布 paper-logistics-2026-practice",
      }),
    ).toBeEnabled();
    expect(
      within(draftRow).getByRole("button", {
        name: "下架 paper-logistics-2026-practice",
      }),
    ).toBeDisabled();
    expect(
      within(draftRow).getByRole("button", {
        name: "复制 paper-logistics-2026-practice",
      }),
    ).toBeDisabled();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
  });

  it("filters papers by keyword, status, level, year, subject, and type", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch();

    render(createElement(AdminPaperManagement));

    expect(await screen.findByText("物流技能练习卷")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "物流技能" },
    });
    fireEvent.change(screen.getByLabelText("状态"), {
      target: { value: "draft" },
    });
    fireEvent.change(screen.getByLabelText("等级筛选"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("年份筛选"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText("科目"), {
      target: { value: "skill" },
    });
    fireEvent.change(screen.getByLabelText("类型"), {
      target: { value: "mock_paper" },
    });

    expect(screen.getByText("物流技能练习卷")).toBeInTheDocument();
    expect(screen.queryByText("2026 春季营销理论模拟卷")).toBeNull();
  });

  it("renders common pagination and updated-at sorting controls for paper lists", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch();

    render(createElement(AdminPaperManagement));

    await screen.findByText("2026 春季营销理论模拟卷");

    expect(screen.getByLabelText("每页条数")).toHaveValue("20");
    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "100" },
    });
    expect(screen.getByLabelText("每页条数")).toHaveValue("100");

    fireEvent.click(screen.getByRole("button", { name: "更新时间排序" }));
    const rows = screen.getAllByTestId(/paper-row-/);

    expect(rows[0]).toHaveAttribute(
      "data-public-id",
      "paper-logistics-2026-practice",
    );
    expect(rows[1]).toHaveAttribute(
      "data-public-id",
      "paper-marketing-2026-spring",
    );
  });

  it("shows source file summaries, validation issues, empty, loading, and error states", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch();

    render(createElement(AdminPaperManagement));

    const publishedRow = await screen.findByTestId(
      "paper-row-paper-marketing-2026-spring",
    );

    expect(
      within(publishedRow).getByText("spring-marketing.pdf"),
    ).toBeInTheDocument();
    expect(
      within(publishedRow).getByText("发布校验已通过"),
    ).toBeInTheDocument();

    const draftRow = screen.getByTestId(
      "paper-row-paper-logistics-2026-practice",
    );

    expect(within(draftRow).getByText("缺少题目分值")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "/api/v1/sessions") {
          return createJsonResponse(adminSessionPayload);
        }

        return new Promise(() => undefined);
      }),
    );
    render(createElement(AdminPaperManagement));
    expect(screen.getByText("正在加载试卷")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch({
      code: 503621,
      message: "unavailable",
      data: null,
    });
    render(createElement(AdminPaperManagement));
    expect(await screen.findByText("试卷加载失败")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch({
      code: 0,
      message: "ok",
      data: { papers: [] },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        sortBy: "updatedAt",
        sortOrder: "desc",
      },
    });
    render(createElement(AdminPaperManagement));
    expect(await screen.findByText("没有匹配的试卷")).toBeInTheDocument();

    cleanup();
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch();
    render(createElement(AdminPaperManagement));
    expect(
      await screen.findByText("2026 春季营销理论模拟卷"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("关键词"), {
      target: { value: "不存在的试卷" },
    });
    expect(screen.getByText("没有匹配的试卷")).toBeInTheDocument();
  });

  it("creates, composes, publishes, archives, copies, and binds paper assets through the protected runtime", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockWritablePaperFetch();

    render(createElement(AdminPaperManagement));

    await screen.findByText("物流技能练习卷");
    fireEvent.click(screen.getByRole("button", { name: "新建草稿" }));
    const paperForm = within(screen.getByRole("form", { name: "试卷表单" }));
    fireEvent.change(paperForm.getByLabelText("试卷名称"), {
      target: { value: "新建本地组卷" },
    });
    fireEvent.change(paperForm.getByLabelText("专业"), {
      target: { value: "logistics" },
    });
    fireEvent.change(paperForm.getByLabelText("等级"), {
      target: { value: "4" },
    });
    fireEvent.change(paperForm.getByLabelText("科目"), {
      target: { value: "skill" },
    });
    fireEvent.change(paperForm.getByLabelText("类型"), {
      target: { value: "past_paper" },
    });
    fireEvent.change(paperForm.getByLabelText("年份"), {
      target: { value: "2025" },
    });
    fireEvent.change(paperForm.getByLabelText("考试时长"), {
      target: { value: "120" },
    });
    fireEvent.change(paperForm.getByLabelText("总分"), {
      target: { value: "5.0" },
    });
    fireEvent.change(paperForm.getByLabelText("来源说明"), {
      target: { value: "本地受控真题引用" },
    });
    fireEvent.click(paperForm.getByRole("button", { name: "保存草稿" }));

    expect(
      await screen.findByText("试卷 paper-created-001 已保存"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      readJsonRequestBody(fetchMock, "/api/v1/papers", "POST"),
    ).toMatchObject({
      durationMinute: 120,
      level: 4,
      name: "新建本地组卷",
      paperType: "past_paper",
      profession: "logistics",
      source: "本地受控真题引用",
      subject: "skill",
      totalScore: "5.0",
      year: 2025,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "组卷 paper-logistics-2026-practice",
      }),
    );
    const composeForm = within(screen.getByRole("form", { name: "组卷表单" }));
    fireEvent.change(composeForm.getByLabelText("题目 publicId"), {
      target: { value: "question-marketing-001" },
    });
    fireEvent.change(composeForm.getByLabelText("题目分值"), {
      target: { value: "4.5" },
    });
    fireEvent.change(composeForm.getByLabelText("题目顺序"), {
      target: { value: "2" },
    });
    fireEvent.change(composeForm.getByLabelText("大题名称"), {
      target: { value: "案例分析" },
    });
    fireEvent.change(composeForm.getByLabelText("大题说明"), {
      target: { value: "技能题" },
    });
    fireEvent.change(composeForm.getByLabelText("大题顺序"), {
      target: { value: "3" },
    });
    fireEvent.change(composeForm.getByLabelText("材料 publicId"), {
      target: { value: "material-marketing-001" },
    });
    fireEvent.change(composeForm.getByLabelText("题组名称"), {
      target: { value: "材料题组" },
    });
    fireEvent.change(composeForm.getByLabelText("题组顺序"), {
      target: { value: "1" },
    });
    fireEvent.click(composeForm.getByRole("button", { name: "加入试卷" }));

    expect(
      await screen.findByText("题目 paper-question-created-001 已加入试卷"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers/paper-logistics-2026-practice/questions",
      expect.objectContaining({ method: "POST" }),
    );
    expect(
      readJsonRequestBody(
        fetchMock,
        "/api/v1/papers/paper-logistics-2026-practice/questions",
        "POST",
      ),
    ).toMatchObject({
      questionPublicId: "question-marketing-001",
      score: "4.5",
      sortOrder: 2,
      paperSection: {
        title: "案例分析",
        description: "技能题",
        sortOrder: 3,
      },
      questionGroup: {
        title: "材料题组",
        materialPublicId: "material-marketing-001",
        sortOrder: 1,
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "发布 paper-logistics-2026-practice",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认发布试卷？");
    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));
    expect(
      await screen.findByText("试卷 paper-logistics-2026-practice 已发布"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers/paper-logistics-2026-practice/publish",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "下架 paper-marketing-2026-spring",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认下架试卷？");
    fireEvent.click(screen.getByRole("button", { name: "确认下架" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "复制 paper-marketing-2026-spring",
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers/paper-marketing-2026-spring/archive",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers/paper-marketing-2026-spring/copy",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByText(/已停用源题.*1/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "绑定原始文件 paper-logistics-2026-practice",
      }),
    );
    expect(
      screen.getByText(
        "本地会把文件写入 ignored runtime 目录；不会创建 COS、OCR 或公开 URL。",
      ),
    ).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).not.toBeNull();
    fireEvent.change(screen.getByLabelText("本地文件"), {
      target: {
        files: [
          new File(["controlled local upload"], "local-paper-source.txt", {
            type: "text/plain",
          }),
        ],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存附件" }));

    expect(
      await screen.findByText("附件 paper-asset-created-001 metadata 已登记"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/paper-assets",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("dev/paper-asset");
  });
});
