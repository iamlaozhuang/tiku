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

import AdminOrganizationAnalyticsRoutePage from "@/app/(admin)/content/organization-analytics/page";
import { AdminOrganizationAnalyticsPage } from "@/features/admin/organization-analytics/AdminOrganizationAnalyticsPage";

const adminSessionPayload = {
  code: 0,
  message: "ok",
  data: {
    user: {
      publicId: "user-admin-organization-analytics",
      phone: "13900000003",
      name: "Organization Analytics Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: "organization-analytics-scope-001",
      adminPublicId: "admin-organization-analytics-001",
      adminRoles: ["organization_admin"],
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
  it("is wired as the admin content organization analytics route page", () => {
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
      await screen.findByRole("heading", { name: "Organization Analytics" }),
    ).toBeInTheDocument();

    const summaryForm = within(
      screen.getByRole("form", {
        name: "Organization analytics summary form",
      }),
    );
    fireEvent.change(summaryForm.getByLabelText("Organization publicId"), {
      target: { value: "organization-analytics-scope-001" },
    });
    fireEvent.change(summaryForm.getByLabelText("Start at"), {
      target: { value: "2026-06-01T00:00:00.000Z" },
    });
    fireEvent.change(summaryForm.getByLabelText("End at"), {
      target: { value: "2026-06-16T00:00:00.000Z" },
    });
    fireEvent.click(
      summaryForm.getByRole("button", { name: "Load dashboard summary" }),
    );

    const summaryCard = await screen.findByTestId(
      "organization-analytics-summary-organization-analytics-scope-001",
    );
    expect(summaryCard).toHaveAttribute(
      "data-public-id",
      "organization-analytics-scope-001",
    );
    expect(summaryCard).not.toHaveAttribute("data-id", expect.any(String));
    expect(summaryCard).toHaveTextContent("12 eligible employees");
    expect(summaryCard).toHaveTextContent("8 submitted employees");
    expect(summaryCard).toHaveTextContent("67% completion");
    expect(summaryCard).toHaveTextContent("82 average score");
    expect(summaryCard).toHaveTextContent("7 formal practices");
    expect(summaryCard).toHaveTextContent("823 quota remaining");
    expect(summaryCard).toHaveTextContent("aggregate_only");
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
