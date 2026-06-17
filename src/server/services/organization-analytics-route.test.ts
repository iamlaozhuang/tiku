import { describe, expect, it } from "vitest";

import { createSuccessResponse } from "../contracts/api-response";
import type {
  OrganizationAnalyticsDashboardSummaryDto,
  OrganizationAnalyticsDateRangeDto,
} from "../contracts/organization-analytics-contract";
import type { OrganizationAnalyticsAdminContext } from "./organization-analytics-service";
import { GET as dashboardSummaryGET } from "../../app/api/v1/organization-analytics/dashboard-summary/route";
import {
  createOrganizationAnalyticsDashboardSummaryRouteHandlers,
  type OrganizationAnalyticsDashboardSummaryRouteAdminContext,
} from "./organization-analytics-route";

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

function createAdminContext(
  overrides: Partial<OrganizationAnalyticsAdminContext> = {},
): OrganizationAnalyticsDashboardSummaryRouteAdminContext {
  return {
    adminPublicId: "organization_analytics_admin_public_001",
    effectiveEdition: "advanced",
    authorizationSource: "org_auth",
    canViewOrganizationTrainingSummary: true,
    organizationPublicId: "organization_analytics_route_org_public_001",
    ...overrides,
  };
}

describe("organization analytics dashboard summary route handlers", () => {
  it("resolves admin context before returning mapped aggregate-only response", async () => {
    const observedQueries: Array<{
      organizationPublicId: string;
      dateRange: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const observedAdminContextInputs: Array<{
      organizationPublicId: string;
      dateRange: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const adminContext = createAdminContext();
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRouteHandlers({
        async resolveAdminContext({ routeQuery }) {
          observedAdminContextInputs.push(routeQuery);

          return adminContext;
        },
        async readDashboardSummary(input) {
          observedQueries.push({
            organizationPublicId: input.organizationPublicId,
            dateRange: input.dateRange,
          });

          expect(input.adminContext).toEqual(adminContext);

          return createSuccessResponse(
            createDashboardSummary(input.dateRange),
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
    expect(observedAdminContextInputs).toEqual(observedQueries);
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
    const observedAdminContextInputs: unknown[] = [];
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRouteHandlers({
        async resolveAdminContext(input) {
          observedAdminContextInputs.push(input);

          return createAdminContext();
        },
        async readDashboardSummary(input) {
          observedQueries.push(input);

          return createSuccessResponse(createDashboardSummary(input.dateRange));
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
    expect(observedAdminContextInputs).toEqual([]);
    expect(observedQueries).toEqual([]);
  });

  it("returns admin context unavailable before calling dashboard reader", async () => {
    const observedQueries: unknown[] = [];
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRouteHandlers({
        async resolveAdminContext() {
          return null;
        },
        async readDashboardSummary(input) {
          observedQueries.push(input);

          return createSuccessResponse(createDashboardSummary(input.dateRange));
        },
      });

    const response = await dashboardSummary.GET(
      createDashboardSummaryRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403186,
      message:
        "Organization analytics dashboard summary admin context is unavailable.",
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
