import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminRoleOverviewPage } from "@/features/admin/admin-role-overview/AdminRoleOverviewPage";

const boundary = {
  dataMode: "aggregate_only",
  highRiskMutationAllowed: false,
  sensitiveDetailIncluded: false,
} as const;

const operations = {
  userTotal: 17,
  disabledUserTotal: 2,
  organizationTotal: 8,
  authorizationAttentionTotal: 3,
  unusedRedeemCodeTotal: 5,
  failedAiCallTotal: 1,
};

const content = {
  availableQuestionTotal: 120,
  disabledQuestionTotal: 4,
  draftPaperTotal: 6,
  publishedPaperTotal: 10,
  archivedPaperTotal: 2,
  aiDraftReviewTotal: 3,
};

function stubOverviewResponse(data: unknown, code = 0) {
  const fetchMock = vi.fn(async () => ({
    json: async () => ({
      code,
      message: code === 0 ? "ok" : "overview unavailable",
      data,
    }),
  }));

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("admin role overview UI", () => {
  it("renders the super-admin platform risk radar and safe workspace entries", async () => {
    localStorage.setItem("tiku.localSessionToken", "overview-test-token");
    const fetchMock = stubOverviewResponse({
      scope: "platform",
      roleLabel: "超级管理员",
      operations,
      content,
      boundary,
      updatedAt: "2026-07-11T08:00:00.000Z",
    });

    render(createElement(AdminRoleOverviewPage, { scope: "platform" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "平台监督总览" }),
    ).toBeInTheDocument();
    expect(screen.getByText("超级管理员")).toBeInTheDocument();
    expect(screen.getByText("停用账号")).toBeInTheDocument();
    expect(screen.getByText("授权需核对")).toBeInTheDocument();
    expect(screen.getByText("内容待处理")).toBeInTheDocument();
    expect(screen.getByText("AI调用失败")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "进入运营后台" })).toHaveAttribute(
      "href",
      "/ops/overview",
    );
    expect(screen.getByRole("link", { name: "进入内容后台" })).toHaveAttribute(
      "href",
      "/content/overview",
    );
    expect(
      screen.getByRole("link", { name: "选择企业与组织上下文" }),
    ).toHaveAttribute("href", "/ops/organizations");
    expect(
      screen.queryByRole("button", { name: /发布|授权|禁用/u }),
    ).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin-overviews?scope=platform",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("keeps operations governance entries separate from content authoring", async () => {
    stubOverviewResponse({
      scope: "operations",
      roleLabel: "运营管理员",
      summary: operations,
      boundary,
      updatedAt: "2026-07-11T08:00:00.000Z",
    });

    render(createElement(AdminRoleOverviewPage, { scope: "operations" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "运营工作台" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "用户管理" })).toHaveAttribute(
      "href",
      "/ops/users",
    );
    expect(screen.getByRole("link", { name: "企业管理" })).toHaveAttribute(
      "href",
      "/ops/organizations",
    );
    expect(
      screen.getByRole("link", { name: "卡密与企业授权" }),
    ).toHaveAttribute("href", "/ops/redeem-codes");
    expect(
      screen.getByRole("link", { name: "审计与AI调用日志" }),
    ).toHaveAttribute("href", "/ops/ai-audit-logs");
    expect(screen.queryByRole("link", { name: "试卷与发布" })).toBeNull();
  });

  it("renders a lifecycle-first content workbench with isolated AI drafts", async () => {
    stubOverviewResponse({
      scope: "content",
      roleLabel: "内容管理员",
      summary: content,
      boundary,
      updatedAt: "2026-07-11T08:00:00.000Z",
    });

    render(createElement(AdminRoleOverviewPage, { scope: "content" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "内容工作台" }),
    ).toBeInTheDocument();
    expect(screen.getByText("正式内容")).toBeInTheDocument();
    expect(screen.getByText("AI草稿待审")).toBeInTheDocument();
    expect(screen.getByText(/AI组卷先生成方案/u)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "试卷与发布" })).toHaveAttribute(
      "href",
      "/content/papers",
    );
    expect(screen.getByRole("link", { name: "题库题目" })).toHaveAttribute(
      "href",
      "/content/questions",
    );
    expect(screen.queryByRole("link", { name: "用户管理" })).toBeNull();
  });

  it("shows a clear empty attention state when trusted aggregate counts are zero", async () => {
    stubOverviewResponse({
      scope: "operations",
      roleLabel: "运营管理员",
      summary: {
        ...operations,
        disabledUserTotal: 0,
        authorizationAttentionTotal: 0,
        failedAiCallTotal: 0,
      },
      boundary,
      updatedAt: "2026-07-11T08:00:00.000Z",
    });

    render(createElement(AdminRoleOverviewPage, { scope: "operations" }));

    expect(
      await screen.findByText("当前没有需要优先处理的异常"),
    ).toBeInTheDocument();
  });

  it("uses shared unauthorized and error states without exposing diagnostics", async () => {
    stubOverviewResponse(null, 401190);
    render(createElement(AdminRoleOverviewPage, { scope: "operations" }));

    expect(await screen.findByText("请先登录后台")).toBeInTheDocument();

    cleanup();
    vi.unstubAllGlobals();
    stubOverviewResponse(null, 503190);
    render(createElement(AdminRoleOverviewPage, { scope: "content" }));

    expect(await screen.findByText("总览数据加载失败")).toBeInTheDocument();
    expect(screen.queryByText(/DATABASE_URL|token|payload/iu)).toBeNull();
  });
});
