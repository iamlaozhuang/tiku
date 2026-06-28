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
    quotaSummary: {
      employeeAiTaskCount: 11,
      employeeAiSucceededTaskCount: 9,
      employeeAiFailedTaskCount: 2,
      employeeAiQuotaConsumedPoint: 135,
      organizationTrainingGenerationConsumedPoint: 42,
      quotaRemainingPoint: 823,
      redactionStatus: "summary_only",
      internalNumericId: 77123,
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
        redactionStatus: "summary_only",
      },
    ],
    redactedStatisticsBoundary: redactedStatisticsBoundaryPayload,
    redactionStatus: "summary_only",
    updatedAt: "2026-06-16T08:00:00.000Z",
    id: 77124,
  },
};

function createJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AdminOrganizationAnalyticsPage", () => {
  it("is wired as the organization analytics route page", () => {
    expect(AdminOrganizationAnalyticsRoutePage()).toEqual(
      createElement(AdminOrganizationAnalyticsPage),
    );
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
      "升级需由运营管理员维护高级版 org_auth",
    );
    expect(screen.getByRole("link", { name: "返回组织概览" })).toHaveAttribute(
      "href",
      "/organization/portal",
    );
    expect(screen.queryByRole("form", { name: "组织统计摘要表单" })).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("loads scoped summary and employee statistics without manual organization id entry or hidden details", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(async (url: RequestInfo | URL) => {
      const path = String(url);

      if (path === "/api/v1/sessions") {
        return createJsonResponse(adminSessionPayload);
      }

      if (
        path ===
        "/api/v1/organization-analytics/dashboard-summary?organizationPublicId=organization-analytics-scope-001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z"
      ) {
        return createJsonResponse(dashboardSummaryPayload);
      }

      if (
        path ===
        "/api/v1/organization-analytics/employee-statistics?organizationPublicId=organization-analytics-scope-001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z"
      ) {
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
      await screen.findByRole("heading", { name: "统计摘要" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("仅展示汇总趋势和脱敏员工统计"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/加载统计摘要后显示脱敏员工统计/u),
    ).toBeInTheDocument();
    expect(screen.getByText(/导出仍需单独审批/u)).toBeInTheDocument();

    const scopeContext = await screen.findByTestId(
      "organization-analytics-scope-context",
    );
    expect(scopeContext).toHaveTextContent("organization-analytics-scope-001");
    expect(
      screen.queryByDisplayValue("organization-analytics-scope-001"),
    ).toBeNull();

    const summaryForm = within(
      screen.getByRole("form", {
        name: "组织统计摘要表单",
      }),
    );
    fireEvent.change(summaryForm.getByLabelText("开始时间"), {
      target: { value: "2026-06-01T00:00:00.000Z" },
    });
    fireEvent.change(summaryForm.getByLabelText("结束时间"), {
      target: { value: "2026-06-16T00:00:00.000Z" },
    });
    fireEvent.click(summaryForm.getByRole("button", { name: "加载统计摘要" }));

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
    expect(summaryCard).toHaveTextContent("7 次正式练习");
    expect(summaryCard).toHaveTextContent("823 剩余额度");
    expect(summaryCard).toHaveTextContent("聚合脱敏");
    const redactedBoundaryPanel = within(summaryCard).getByTestId(
      "organization-analytics-redacted-statistics-boundary",
    );
    expect(redactedBoundaryPanel).toHaveTextContent(
      "organization_admin_own_scope",
    );
    expect(redactedBoundaryPanel).toHaveTextContent(
      "summary_counts_score_time_only",
    );
    expect(redactedBoundaryPanel).toHaveTextContent("status_score_time_only");
    expect(redactedBoundaryPanel).toHaveTextContent("blocked");
    expect(redactedBoundaryPanel).toHaveTextContent(
      "blocked_requires_fresh_approval",
    );
    expect(redactedBoundaryPanel).toHaveTextContent("redacted_boundary");

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
    expect(employeeStatistics).toHaveTextContent("员工乙");
    expect(employeeStatistics).toHaveTextContent("0 / 2");
    expect(employeeStatistics).toHaveTextContent("暂无");
    expect(
      screen.getByTestId("organization-analytics-export-readiness"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("organization-analytics-export-readiness"),
    ).toHaveTextContent("导出需单独审批");
    expect(summaryCard).not.toHaveTextContent("Dashboard summary");
    expect(summaryCard).not.toHaveTextContent("eligible employees");
    expect(summaryCard).not.toHaveTextContent("aggregate_only");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "organization-analytics-child-hidden-002",
    );
    expect(document.body.textContent).not.toContain(
      "organization-analytics-child-hidden-003",
    );
    expect(document.body.textContent).not.toContain("99123");
    expect(document.body.textContent).not.toContain("77123");
    expect(document.body.textContent).not.toContain("77124");
    expect(document.body.textContent).not.toContain("66123");
    expect(document.body.textContent).not.toContain("hidden formal");
    expect(document.body.textContent).not.toContain("hidden employee");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });
});
