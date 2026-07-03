import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminOrganizationAnalyticsRoutePage from "@/app/(admin)/organization/organization-analytics/page";
import { AdminOrganizationAnalyticsPage } from "@/features/admin/organization-analytics/AdminOrganizationAnalyticsPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-analytics",
      phone: "13900000003",
      name: "组织高级统计管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-analytics-scope-001",
      adminPublicId: "admin-organization-analytics-001",
      adminRoles: ["org_advanced_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_advanced_admin"],
        organizationPublicId: "organization-analytics-scope-001",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: true,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

const standardAdminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-analytics-standard",
      phone: "13900000005",
      name: "组织标准统计管理员",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-analytics-scope-001",
      adminPublicId: "admin-organization-analytics-standard-001",
      adminRoles: ["org_standard_admin"],
      adminWorkspaceCapability: {
        adminRoles: ["org_standard_admin"],
        organizationPublicId: "organization-analytics-scope-001",
        organizationEffectiveEdition: "standard",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: false,
      },
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
};

const redactedStatisticsBoundaryPayload = {
  visibilityScope: "organization_admin_own_scope",
  trainingStatisticsPolicy: "summary_counts_score_time_only",
  employeeStatisticsPolicy: "status_score_time_only",
  rawEmployeeAnswerPolicy: "blocked",
  rawAiGeneratedContentPolicy: "blocked",
  promptProviderPayloadPolicy: "blocked",
  exportPolicy: "blocked_requires_fresh_approval",
  crossOrganizationAnalyticsPolicy: "blocked",
  redactionStatus: "redacted_boundary",
};

const dashboardSummaryPayload = {
  code: 0,
  message: "ok",
  data: {
    organizationPublicId: "organization-analytics-scope-001",
    scopeOrganizationPublicIds: [
      "organization-analytics-scope-001",
      "organization-analytics-child-hidden-002",
    ],
    dateRange: {
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-16T00:00:00.000Z",
    },
    trainingSummary: {
      eligibleEmployeeCount: 12,
      submittedEmployeeCount: 8,
      unfinishedEmployeeCount: 4,
      completionRate: 0.67,
      averageScore: 82,
      maxScore: 96,
      minScore: 61,
      submittedTrend: [
        {
          date: "2026-06-01",
          submittedCount: 3,
        },
      ],
    },
    formalLearningSummary: {
      formalPracticeCount: 7,
      formalMockExamCount: 3,
      formalExamReportCount: 2,
      formalMistakeBookCount: 5,
      redactionStatus: "summary_only",
      hiddenSourceMarker: "hidden formal learning source",
    },
    knowledgeWeakPointSummary: {
      sampleSize: 4,
      lowConfidence: true,
      trainingWeakPoints: [
        {
          sourceDomain: "organization_training",
          knowledgeNodeLabel: "客户异议处理",
          affectedEmployeeCount: 3,
          affectedEmployeePercent: 0.75,
          confidenceStatus: "low_sample",
          redactionStatus: "summary_only",
        },
      ],
      formalLearningWeakPoints: [
        {
          sourceDomain: "formal_learning",
          knowledgeNodeLabel: "案例分析",
          affectedEmployeeCount: 2,
          affectedEmployeePercent: 0.5,
          confidenceStatus: "low_sample",
          redactionStatus: "summary_only",
        },
      ],
      redactionStatus: "summary_only",
    },
    redactedStatisticsBoundary: redactedStatisticsBoundaryPayload,
    redactionStatus: "aggregate_only",
    updatedAt: "2026-06-16T08:00:00.000Z",
    id: 99123,
  },
};

const employeeStatisticsPayload = {
  code: 0,
  message: "ok",
  data: {
    organizationPublicId: "organization-analytics-scope-001",
    scopeOrganizationPublicIds: [
      "organization-analytics-scope-001",
      "organization-analytics-child-hidden-003",
    ],
    dateRange: {
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-16T00:00:00.000Z",
    },
    employeeCount: 2,
    employees: [
      {
        employeePublicId: "employee-analytics-001",
        employeeDisplayName: "员工甲",
        organizationPublicId: "organization-analytics-scope-001",
        organizationName: "组织统计范围",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization-analytics-scope-001",
          organizationName: "组织统计范围",
          capturedAt: "2026-06-01T00:00:00.000Z",
        },
        visibleTrainingCount: 5,
        submittedTrainingCount: 4,
        unfinishedTrainingCount: 1,
        trainingCompletionRate: 0.8,
        trainingAverageScore: 88,
        latestTrainingSubmittedAt: "2026-06-15T07:00:00.000Z",
        weakPointSummary: {
          sourceDomain: "organization_training",
          knowledgeNodeLabels: ["客户异议处理"],
          redactionStatus: "summary_only",
        },
        redactionStatus: "summary_only",
        rawAnswerText: "hidden employee subjective answer",
        id: 66123,
      },
      {
        employeePublicId: "employee-analytics-002",
        employeeDisplayName: "员工乙",
        organizationPublicId: "organization-analytics-scope-001",
        organizationName: "组织统计范围",
        answerOrganizationSnapshot: null,
        visibleTrainingCount: 2,
        submittedTrainingCount: 0,
        unfinishedTrainingCount: 2,
        trainingCompletionRate: 0,
        trainingAverageScore: null,
        latestTrainingSubmittedAt: null,
        weakPointSummary: {
          sourceDomain: "organization_training",
          knowledgeNodeLabels: [],
          redactionStatus: "summary_only",
        },
        redactionStatus: "summary_only",
      },
    ],
    redactedStatisticsBoundary: redactedStatisticsBoundaryPayload,
    redactionStatus: "summary_only",
    updatedAt: "2026-06-16T08:00:00.000Z",
    id: 77124,
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 2,
    sortBy: "employeeDisplayName",
    sortOrder: "asc",
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function resolveRequestPath(value: RequestInfo | URL) {
  return String(value);
}

function isOrganizationAnalyticsDashboardSummaryPath(path: string) {
  return path.startsWith(
    "/api/v1/organization-analytics/dashboard-summary?organizationPublicId=organization-analytics-scope-001&",
  );
}

function isOrganizationAnalyticsEmployeeStatisticsPath(path: string) {
  return path.startsWith(
    "/api/v1/organization-analytics/employee-statistics?organizationPublicId=organization-analytics-scope-001&",
  );
}

function expectDefaultEmployeeStatisticsPaging(path: string) {
  expect(path).toContain("page=1");
  expect(path).toContain("pageSize=20");
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("AdminOrganizationAnalyticsPage", () => {
  it("is wired as the organization analytics route page", () => {
    expect(AdminOrganizationAnalyticsRoutePage()).toEqual(
      createElement(AdminOrganizationAnalyticsPage),
    );
  });

  it("redirects the content workspace alias back to the organization analytics workspace", () => {
    const contentAliasSource = readFileSync(
      join(
        process.cwd(),
        "src",
        "app",
        "(admin)",
        "content",
        "organization-analytics",
        "page.tsx",
      ),
      "utf8",
    );

    expect(contentAliasSource).toContain(
      'redirect("/organization/organization-analytics")',
    );
    expect(contentAliasSource).not.toContain("AdminOrganizationAnalyticsPage");
  });

  it("renders unauthorized state without calling organization analytics reads when session is missing", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
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

    render(createElement(AdminOrganizationAnalyticsPage));

    expect(await screen.findByRole("alert")).toHaveAttribute(
      "data-admin-ux-state",
      "permission-denied",
    );
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("shows a Chinese unavailable state for standard organization admins", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url) === "/api/v1/sessions") {
        return createJsonResponse(standardAdminSessionPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationAnalyticsPage));

    const unavailableState = await screen.findByRole("alert");
    expect(unavailableState).toHaveAttribute(
      "data-admin-ux-state",
      "standard-unavailable",
    );
    expect(unavailableState).toHaveTextContent("标准版暂不可用");
    expect(unavailableState).toHaveTextContent(
      "标准版组织后台暂不开放统计摘要",
    );
    expect(unavailableState).toHaveTextContent(
      "升级需由运营管理员维护高级版企业授权",
    );
    expect(unavailableState).not.toHaveTextContent("org_auth");
    expect(screen.getByRole("link", { name: "返回组织概览" })).toHaveAttribute(
      "href",
      "/organization/portal",
    );
    expect(screen.queryByRole("form", { name: "组织统计摘要表单" })).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("automatically loads scoped summary and redacted employee statistics for advanced organization admins", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = resolveRequestPath(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationAnalyticsDashboardSummaryPath(path)) {
        return createJsonResponse(dashboardSummaryPayload);
      }

      if (isOrganizationAnalyticsEmployeeStatisticsPath(path)) {
        expectDefaultEmployeeStatisticsPaging(path);

        return createJsonResponse(employeeStatisticsPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationAnalyticsPage));

    expect(
      await screen.findByTestId("organization-analytics-scope-context"),
    ).toHaveTextContent("organization-analytics-scope-001");
    expect(
      await screen.findByTestId(
        "organization-analytics-summary-organization-analytics-scope-001",
      ),
    ).toHaveTextContent("12 可参与员工");
    expect(
      await screen.findByTestId("organization-analytics-employee-statistics"),
    ).toHaveTextContent("员工甲");
    expect(screen.queryByText("统计摘要加载失败。")).toBeNull();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it("loads scoped summary and employee statistics without manual organization id entry or hidden details", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = resolveRequestPath(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationAnalyticsDashboardSummaryPath(path)) {
        return createJsonResponse(dashboardSummaryPayload);
      }

      if (isOrganizationAnalyticsEmployeeStatisticsPath(path)) {
        expectDefaultEmployeeStatisticsPaging(path);

        return createJsonResponse(employeeStatisticsPayload);
      }

      return createJsonResponse({
        code: 404001,
        message: "missing",
        data: null,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(createElement(AdminOrganizationAnalyticsPage));

    expect(
      await screen.findByRole("heading", { name: "组织统计" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "按企业训练、正式学习信号和知识薄弱点分区查看汇总结果；员工原始作答和个人无关学习内容不展示。",
      ),
    ).toBeInTheDocument();

    const scopeContext = await screen.findByTestId(
      "organization-analytics-scope-context",
    );
    expect(scopeContext).toHaveTextContent("organization-analytics-scope-001");
    expect(
      screen.queryByDisplayValue("organization-analytics-scope-001"),
    ).toBeNull();

    const summaryCard = await screen.findByTestId(
      "organization-analytics-summary-organization-analytics-scope-001",
    );
    expect(summaryCard).toHaveAttribute(
      "data-public-id",
      "organization-analytics-scope-001",
    );
    expect(summaryCard).not.toHaveAttribute("data-id", expect.any(String));
    expect(summaryCard).toHaveTextContent("12 可参与员工");
    expect(summaryCard).toHaveTextContent("8 已提交员工");
    expect(summaryCard).toHaveTextContent("67% 完成率");
    expect(summaryCard).toHaveTextContent("82 平均分");
    expect(summaryCard).toHaveTextContent("企业训练统计");
    expect(summaryCard).toHaveTextContent("训练明细");
    expect(summaryCard).toHaveTextContent("正式学习聚合信号");
    expect(summaryCard).toHaveTextContent("7 正式练习");
    expect(summaryCard).toHaveTextContent("知识薄弱点");
    expect(summaryCard).toHaveTextContent("客户异议处理");
    expect(summaryCard).toHaveTextContent("案例分析");
    expect(summaryCard).toHaveTextContent("低置信");
    expect(summaryCard).toHaveTextContent("聚合脱敏");
    const redactedBoundaryPanel = within(summaryCard).getByTestId(
      "organization-analytics-redacted-statistics-boundary",
    );
    expect(redactedBoundaryPanel).toHaveTextContent("隐私边界");
    expect(redactedBoundaryPanel).toHaveTextContent("仅限本组织范围的脱敏统计");
    expect(redactedBoundaryPanel).toHaveTextContent(
      "只展示人数、完成率、分数和时间汇总",
    );
    expect(redactedBoundaryPanel).toHaveTextContent(
      "只展示状态、分数、时间和弱点标签",
    );
    expect(redactedBoundaryPanel).toHaveTextContent("Prompt 与模型请求");
    expect(redactedBoundaryPanel).toHaveTextContent("首期不提供");

    expect(
      within(summaryCard).getByTestId("organization-analytics-submitted-trend"),
    ).toHaveTextContent("2026-06-01");
    expect(
      within(summaryCard).getByTestId("organization-analytics-submitted-trend"),
    ).toHaveTextContent("3");

    const employeeStatistics = await screen.findByTestId(
      "organization-analytics-employee-statistics",
    );
    expect(employeeStatistics).toHaveTextContent("员工甲");
    expect(employeeStatistics).toHaveTextContent("4 / 5");
    expect(employeeStatistics).toHaveTextContent("80%");
    expect(employeeStatistics).toHaveTextContent("88");
    expect(employeeStatistics).toHaveTextContent("客户异议处理");
    expect(employeeStatistics).toHaveTextContent("员工乙");
    expect(employeeStatistics).toHaveTextContent("0 / 2");
    expect(employeeStatistics).toHaveTextContent("暂无");
    expect(
      screen.getByTestId("organization-analytics-export-readiness"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("organization-analytics-export-readiness"),
    ).toHaveTextContent("首期不提供导出");
    expect(
      screen.getByTestId("organization-analytics-employee-pagination"),
    ).toHaveTextContent("第 1 / 1 页，共 2 条");
    expect(summaryCard).not.toHaveTextContent("Dashboard summary");
    expect(summaryCard).not.toHaveTextContent("eligible employees");
    expect(summaryCard).not.toHaveTextContent("aggregate_only");
    expect(summaryCard).not.toHaveTextContent("AI任务");
    expect(summaryCard).not.toHaveTextContent("剩余额度");
    expect(summaryCard).not.toHaveTextContent("summary_counts_score_time_only");
    expect(summaryCard).not.toHaveTextContent(
      "blocked_requires_fresh_approval",
    );
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "organization-analytics-child-hidden-002",
    );
    expect(document.body.textContent).not.toContain(
      "organization-analytics-child-hidden-003",
    );
    expect(document.body.textContent).not.toContain("99123");
    expect(document.body.textContent).not.toContain("77124");
    expect(document.body.textContent).not.toContain("66123");
    expect(document.body.textContent).not.toContain("hidden formal");
    expect(document.body.textContent).not.toContain("hidden employee");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it("shows an explicit employee statistics error state after the load action fails partially", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = resolveRequestPath(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (isOrganizationAnalyticsDashboardSummaryPath(path)) {
        return createJsonResponse(dashboardSummaryPayload);
      }

      if (isOrganizationAnalyticsEmployeeStatisticsPath(path)) {
        expectDefaultEmployeeStatisticsPaging(path);

        return createJsonResponse({
          code: 500001,
          message: "employee statistics unavailable",
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

    render(createElement(AdminOrganizationAnalyticsPage));

    expect(
      await screen.findByTestId(
        "organization-analytics-summary-organization-analytics-scope-001",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("员工统计加载失败。")).toBeInTheDocument();
    expect(
      screen.getByText("员工统计暂不可用，请稍后重试。"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/加载统计摘要后显示脱敏员工统计/u)).toBeNull();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });
});
