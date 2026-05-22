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

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminPaperManagement", () => {
  it("renders unauthorized state without calling protected paper APIs when the local session token is missing", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminPaperManagement));

    expect(screen.getByText("请先登录后台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往登录" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads the paper management runtime with lifecycle actions and safe public identifiers", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = mockPaperFetch();

    render(createElement(AdminPaperManagement));

    expect(screen.getByText("正在加载试卷")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "试卷管理" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "新建草稿" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "组卷" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "发布" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "下架" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "复制" })).toBeEnabled();

    const firstRow = screen.getByTestId(
      "paper-row-paper-marketing-2026-spring",
    );

    expect(firstRow).toHaveAttribute(
      "data-public-id",
      "paper-marketing-2026-spring",
    );
    expect(firstRow).not.toHaveAttribute("data-id");
    expect(
      within(firstRow).getByText("2026 春季营销理论模拟卷"),
    ).toBeInTheDocument();
    expect(within(firstRow).getByText("模拟记录 18")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain('"id"');
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/papers?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc",
      expect.objectContaining({
        headers: { authorization: "Bearer unit-test-admin-token" },
      }),
    );
  });

  it("filters papers by keyword, status, subject, and type", async () => {
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
    fireEvent.change(screen.getByLabelText("科目"), {
      target: { value: "skill" },
    });
    fireEvent.change(screen.getByLabelText("类型"), {
      target: { value: "mock_paper" },
    });

    expect(screen.getByText("物流技能练习卷")).toBeInTheDocument();
    expect(screen.queryByText("2026 春季营销理论模拟卷")).toBeNull();
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
});
