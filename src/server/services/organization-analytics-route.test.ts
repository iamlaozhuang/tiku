import { describe, expect, it } from "vitest";

import { createSuccessResponse } from "../contracts/api-response";
import type {
  OrganizationAnalyticsDashboardSummaryDto,
  OrganizationAnalyticsDateRangeDto,
} from "../contracts/organization-analytics-contract";
import { GET as dashboardSummaryGET } from "../../app/api/v1/organization-analytics/dashboard-summary/route";
import { createOrganizationAnalyticsDashboardSummaryRouteHandlers } from "./organization-analytics-route";

function createDashboardSummaryRequest(query = ""): Request {
  return new Request(
    `http://localhost/api/v1/organization-analytics/dashboard-summary${query}`,
    {
      method: "GET",
    },
  );
}

function createDashboardSummary(
  dateRange: OrganizationAnalyticsDateRangeDto,
): OrganizationAnalyticsDashboardSummaryDto {
  return {
    organizationPublicId: "organization_analytics_route_org_public_001",
    scopeOrganizationPublicIds: [
      "organization_analytics_route_org_public_001",
      "organization_analytics_route_child_public_002",
    ],
    dateRange,
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
    redactionStatus: "aggregate_only",
    updatedAt: "2026-06-16T08:00:00.000Z",
  };
}

describe("organization analytics dashboard summary route handlers", () => {
  it("parses dashboard summary query and returns mapped aggregate-only response", async () => {
    const observedQueries: Array<{
      organizationPublicId: string;
      dateRange: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRouteHandlers({
        async readDashboardSummary(query) {
          observedQueries.push(query);

          return createSuccessResponse(
            createDashboardSummary(query.dateRange),
            "dashboard summary ready",
          );
        },
      });

    const response = await dashboardSummary.GET(
      createDashboardSummaryRequest(
        "?organizationPublicId=%20organization_analytics_route_org_public_001%20&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );
    const payload = await response.json();

    expect(observedQueries).toEqual([
      {
        organizationPublicId: "organization_analytics_route_org_public_001",
        dateRange: {
          startAt: "2026-06-01T00:00:00.000Z",
          endAt: "2026-06-16T00:00:00.000Z",
        },
      },
    ]);
    expect(payload).toEqual({
      code: 0,
      message: "dashboard summary ready",
      data: {
        organizationPublicId: "organization_analytics_route_org_public_001",
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
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T08:00:00.000Z",
      },
    });
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
  });

  it("returns invalid input envelope before calling dashboard reader", async () => {
    const observedQueries: unknown[] = [];
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRouteHandlers({
        async readDashboardSummary(query) {
          observedQueries.push(query);

          return createSuccessResponse(createDashboardSummary(query.dateRange));
        },
      });

    const response = await dashboardSummary.GET(
      createDashboardSummaryRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=not-a-date&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 400185,
      message: "Invalid organization analytics route input.",
      data: null,
    });
    expect(observedQueries).toEqual([]);
  });

  it("exports a fail-closed dashboard summary GET route until real runtime wiring is approved", async () => {
    const response = await dashboardSummaryGET(
      createDashboardSummaryRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 503185,
      message:
        "Organization analytics dashboard summary runtime is not configured.",
      data: null,
    });
  });
});
