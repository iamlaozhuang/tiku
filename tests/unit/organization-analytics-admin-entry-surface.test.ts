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
    },
    session: {
      expiresAt: "2026-06-30T04:00:00.000Z",
    },
  },
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
    redactionStatus: "aggregate_only",
    updatedAt: "2026-06-16T08:00:00.000Z",
    id: 99123,
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
      "permission-denied",
    );
    expect(unavailableState).toHaveTextContent("标准版暂不可用");
    expect(unavailableState).toHaveTextContent(
      "标准版组织后台暂不开放统计摘要",
    );
    expect(screen.queryByRole("form", { name: "组织统计摘要表单" })).toBeNull();
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "/api/v1/sessions",
    ]);
  });

  it("loads aggregate-only dashboard summary from the admin route without exposing hidden scope or internal ids", async () => {
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

    const summaryForm = within(
      screen.getByRole("form", {
        name: "组织统计摘要表单",
      }),
    );
    fireEvent.change(summaryForm.getByLabelText("组织业务标识"), {
      target: { value: "organization-analytics-scope-001" },
    });
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
    expect(summaryCard).not.toHaveTextContent("Dashboard summary");
    expect(summaryCard).not.toHaveTextContent("eligible employees");
    expect(summaryCard).not.toHaveTextContent("aggregate_only");
    expect(document.body.textContent).not.toContain("unit-test-admin-token");
    expect(document.body.textContent).not.toContain(
      "organization-analytics-child-hidden-002",
    );
    expect(document.body.textContent).not.toContain("99123");
    expect(document.body.textContent).not.toContain("77123");
    expect(document.body.textContent).not.toContain("hidden formal");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
