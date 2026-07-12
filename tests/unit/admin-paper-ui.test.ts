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

const { navigationPush } = vi.hoisted(() => ({ navigationPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationPush }),
}));

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
      const payloadRecord = payload as typeof paperPayload;
      const searchParams = new URL(path, "http://localhost").searchParams;
      const rows = Array.isArray(payloadRecord.data?.papers)
        ? payloadRecord.data.papers.filter((paper) => {
            const keyword = searchParams.get("keyword")?.toLowerCase();

            return (
              (keyword === undefined ||
                [paper.name, paper.publicId, paper.sourceFileName]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase()
                  .includes(keyword)) &&
              (searchParams.get("profession") === null ||
                paper.profession === searchParams.get("profession")) &&
              (searchParams.get("subject") === null ||
                paper.subject === searchParams.get("subject")) &&
              (searchParams.get("level") === null ||
                String(paper.level) === searchParams.get("level")) &&
              (searchParams.get("year") === null ||
                String(paper.year) === searchParams.get("year")) &&
              (searchParams.get("status") === null ||
                paper.paperStatus === searchParams.get("status")) &&
              (searchParams.get("paperType") === null ||
                paper.paperType === searchParams.get("paperType"))
            );
          })
        : null;

      return createJsonResponse(
        rows === null
          ? payload
          : {
              ...payloadRecord,
              data: { papers: rows },
              pagination: {
                ...payloadRecord.pagination,
                total:
                  searchParams.size > 4
                    ? rows.length
                    : payloadRecord.pagination.total,
              },
            },
      );
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

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
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
    const lifecycleBand = screen.getByTestId("paper-lifecycle-context-band");

    expect(lifecycleBand).toHaveTextContent("内容生命周期");
    expect(lifecycleBand).toHaveTextContent("草稿 1");
    expect(lifecycleBand).toHaveTextContent("已发布 1");
    expect(lifecycleBand).toHaveTextContent("已下架 0");
    expect(lifecycleBand).toHaveTextContent("发布校验待处理 1");
    expect(lifecycleBand).toHaveTextContent("AI 草稿采用需先进入待审试卷草稿");
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
      within(firstRow).getByRole("link", {
        name: "查看试卷 2026 春季营销理论模拟卷",
      }),
    ).toHaveAttribute("href", "/content/papers/paper-marketing-2026-spring");
    expect(
      within(firstRow).getByRole("link", {
        name: "组卷 2026 春季营销理论模拟卷",
      }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      within(firstRow).getByRole("button", {
        name: "发布 2026 春季营销理论模拟卷",
      }),
    ).toBeDisabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "下架 2026 春季营销理论模拟卷",
      }),
    ).toBeEnabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "复制 2026 春季营销理论模拟卷",
      }),
    ).toBeEnabled();
    expect(
      within(firstRow).getByRole("button", {
        name: "绑定原始文件 2026 春季营销理论模拟卷",
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
      within(draftRow).getByRole("link", {
        name: "组卷 物流技能练习卷",
      }),
    ).toHaveAttribute(
      "href",
      "/content/papers/paper-logistics-2026-practice/compose",
    );
    expect(
      within(draftRow).getByRole("button", {
        name: "发布 物流技能练习卷",
      }),
    ).toBeEnabled();
    expect(
      within(draftRow).getByRole("button", {
        name: "下架 物流技能练习卷",
      }),
    ).toBeDisabled();
    expect(
      within(draftRow).getByRole("button", {
        name: "复制 物流技能练习卷",
      }),
    ).toBeDisabled();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expectAdminFetchAuthorization(
      fetchMock,
      "/api/v1/papers?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
    );
  });

  it("opens a paper draft management entry from a public id query target", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    mockPaperFetch();

    render(
      createElement(AdminPaperManagement, {
        initialPaperPublicId: "paper-logistics-2026-practice",
      }),
    );

    expect(
      await screen.findByText("已定位待审试卷草稿 物流技能练习卷"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("paper-row-paper-logistics-2026-practice"),
    ).toHaveAttribute("data-selected", "true");
  });

  it("forwards paper filters to the server and persists them in the URL", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockPaperFetch();

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

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("keyword=%E7%89%A9%E6%B5%81%E6%8A%80%E8%83%BD"),
        expect.anything(),
      ),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("status=draft"),
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("paperType=mock_paper"),
      expect.anything(),
    );
    expect(window.location.search).toContain("year=2026");
    expect(window.location.search).toContain("subject=skill");
  });

  it("uses the shared ledger toolbar and requests the next server page", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockPaperFetch({
      ...paperPayload,
      pagination: { ...paperPayload.pagination, total: 45 },
    });

    render(createElement(AdminPaperManagement));

    await screen.findByText("2026 春季营销理论模拟卷");

    expect(
      screen.getByRole("region", { name: "试卷筛选" }),
    ).toBeInTheDocument();
    expect(screen.getByText("共 45 套试卷")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "试卷列表" })).toHaveAttribute(
      "data-slot",
      "admin-table-frame",
    );
    expect(screen.getByRole("table", { name: "试卷列表" })).toBeInTheDocument();
    expect(screen.getByLabelText("每页条数")).toHaveValue("20");
    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "100" },
    });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=100"),
        expect.anything(),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "更新时间排序" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("sortOrder=asc"),
        expect.anything(),
      ),
    );

    fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "20" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "下一页" }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("page=2"),
        expect.anything(),
      ),
    );
  });

  it("restores paper list query state from the URL", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    window.history.replaceState(
      null,
      "",
      "/content/papers?page=2&pageSize=50&sortBy=updatedAt&sortOrder=asc&status=draft",
    );
    const fetchMock = mockPaperFetch();

    render(createElement(AdminPaperManagement));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("page=2&pageSize=50"),
        expect.anything(),
      ),
    );
    expect(screen.getByLabelText("状态")).toHaveValue("draft");
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
    expect(await screen.findByText("暂无试卷")).toBeInTheDocument();

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
    expect(await screen.findByText("没有匹配的试卷")).toBeInTheDocument();
  });

  it("creates a draft, enters the workbench, and preserves list lifecycle actions", async () => {
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
      await screen.findByText("草稿已保存，正在进入组卷工作台。"),
    ).toBeInTheDocument();
    expect(navigationPush).toHaveBeenCalledWith(
      "/content/papers/paper-created-001/compose",
    );
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

    expect(
      screen.getByRole("link", {
        name: "组卷 物流技能练习卷",
      }),
    ).toHaveAttribute(
      "href",
      "/content/papers/paper-logistics-2026-practice/compose",
    );
    expect(screen.queryByLabelText("题目业务标识")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: "发布 物流技能练习卷",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认发布试卷？");
    fireEvent.click(screen.getByRole("button", { name: "确认发布" }));
    expect(
      await screen.findByText("试卷“物流技能练习卷”已发布"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers/paper-logistics-2026-practice/publish",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "下架 2026 春季营销理论模拟卷",
      }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确认下架试卷？");
    fireEvent.click(screen.getByRole("button", { name: "确认下架" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "复制 2026 春季营销理论模拟卷",
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
        name: "绑定原始文件 物流技能练习卷",
      }),
    );
    expect(
      screen.getByText(
        "本地会把文件写入忽略目录；不会创建对象存储、公网识别或公开链接。",
      ),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("metadata");
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
      await screen.findByText("附件“local-paper-source.pdf”元数据已登记"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/paper-assets",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain("dev/paper-asset");
  });
});
