import { describe, expect, it, vi } from "vitest";

import { createSuccessResponse } from "../contracts/api-response";
import type {
  OrganizationAnalyticsDashboardSummaryDto,
  OrganizationAnalyticsDateRangeDto,
} from "../contracts/organization-analytics-contract";
import type { OrganizationAnalyticsRepository } from "../repositories/organization-analytics-repository";
import type { RuntimeDatabase } from "../repositories/runtime-database";
import type { OrganizationAnalyticsAdminContext } from "./organization-analytics-service";
import type { SessionService } from "./session-service";
import { GET as dashboardSummaryGET } from "../../app/api/v1/organization-analytics/dashboard-summary/route";
import {
  createOrganizationAnalyticsDashboardSummaryRouteHandlers,
  createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers,
  type OrganizationAnalyticsDashboardSummaryRouteAdminContext,
} from "./organization-analytics-route";

function createDashboardSummaryRequest(
  query = "",
  init: Omit<RequestInit, "method"> = {},
): Request {
  return new Request(
    `http://localhost/api/v1/organization-analytics/dashboard-summary${query}`,
    {
      ...init,
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

function createRepositoryBackedDashboardSummaryRepository(
  observedReads: Array<{
    adminPublicId?: string;
    organizationPublicId?: string;
    scopeOrganizationPublicIds?: readonly string[];
    dateRange?: OrganizationAnalyticsDateRangeDto;
  }>,
): OrganizationAnalyticsRepository {
  return {
    async lookupVisibleOrganizationScope(input) {
      observedReads.push({ adminPublicId: input.adminPublicId });

      return [
        "organization_analytics_route_org_public_001",
        "organization_analytics_route_child_public_002",
      ];
    },
    async readTrainingAggregateMetricsInput(input) {
      observedReads.push({
        organizationPublicId: input.organizationPublicId,
        scopeOrganizationPublicIds: input.scopeOrganizationPublicIds,
        dateRange: input.dateRange,
      });

      return {
        eligibleEmployeePublicIds: [
          "organization_analytics_employee_public_001",
          "organization_analytics_employee_public_002",
          "organization_analytics_employee_public_003",
        ],
        officialSubmissions: [
          {
            employeePublicId: "organization_analytics_employee_public_001",
            score: 90,
            totalScore: 100,
            submittedAt: "2026-06-02T08:00:00.000Z",
          },
          {
            employeePublicId: "organization_analytics_employee_public_002",
            score: 70,
            totalScore: 100,
            submittedAt: "2026-06-03T08:00:00.000Z",
          },
        ],
      };
    },
    async readEmployeeTrainingSummaryInputs() {
      return [];
    },
    async readFormalLearningSummary() {
      return null;
    },
    async readQuotaSummary() {
      return null;
    },
    async readExportReadinessRows() {
      return [];
    },
  };
}

type CurrentSessionRequest = Parameters<SessionService["getCurrentSession"]>[0];
type CurrentSessionResult = Awaited<
  ReturnType<SessionService["getCurrentSession"]>
>;
type CapturingSessionService = Pick<SessionService, "getCurrentSession"> & {
  requests: CurrentSessionRequest[];
};
type FakeSelectCall = {
  selectionKeys: string[];
  from: ReturnType<typeof vi.fn>;
  innerJoin: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
};

function createAdminAuthContext(): NonNullable<CurrentSessionResult["data"]> {
  return {
    user: {
      publicId: "organization_analytics_route_user_public_001",
      phone: "13800000000",
      name: "Organization Analytics Admin",
      userType: null,
      status: "active",
      lockedUntilAt: null,
      employeePublicId: null,
      organizationPublicId: null,
      adminPublicId: "organization_analytics_admin_public_001",
      adminRoles: ["ops_admin"],
    },
    session: {
      expiresAt: "2026-06-16T11:00:00.000Z",
    },
  };
}

function createCurrentSessionService(
  result: CurrentSessionResult,
): CapturingSessionService {
  const requests: CurrentSessionRequest[] = [];

  return {
    requests,
    async getCurrentSession(input) {
      requests.push(input);

      return result;
    },
  };
}

function createFakeRuntimeDatabase(selectRowsByCall: readonly unknown[][]) {
  const selectCalls: FakeSelectCall[] = [];
  const select = vi.fn((selection: Record<string, unknown>) => {
    const rows = selectRowsByCall[selectCalls.length] ?? [];
    const queryBuilder = {
      from: vi.fn(() => queryBuilder),
      innerJoin: vi.fn(() => queryBuilder),
      where: vi.fn(async () => rows),
    };

    selectCalls.push({
      selectionKeys: Object.keys(selection),
      from: queryBuilder.from,
      innerJoin: queryBuilder.innerJoin,
      where: queryBuilder.where,
    });

    return queryBuilder;
  });

  return {
    database: { select } as unknown as RuntimeDatabase,
    select,
    selectCalls,
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

  it("composes injected runtime dependencies through repository-backed dashboard summary service", async () => {
    const observedReads: Array<{
      adminPublicId?: string;
      organizationPublicId?: string;
      scopeOrganizationPublicIds?: readonly string[];
      dateRange?: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const adminContext = createAdminContext();
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers({
        repository:
          createRepositoryBackedDashboardSummaryRepository(observedReads),
        resolveAdminContext: async () => adminContext,
        readUpdatedAt: () => "2026-06-16T09:30:00.000Z",
      });

    const response = await dashboardSummary.GET(
      createDashboardSummaryRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_analytics_route_org_public_001",
        dateRange: {
          startAt: "2026-06-01T00:00:00.000Z",
          endAt: "2026-06-16T00:00:00.000Z",
        },
        trainingSummary: {
          eligibleEmployeeCount: 3,
          submittedEmployeeCount: 2,
          unfinishedEmployeeCount: 1,
          completionRate: 0.6666666666666666,
          averageScore: 80,
          maxScore: 90,
          minScore: 70,
          submittedTrend: [
            {
              date: "2026-06-02",
              submittedCount: 1,
            },
            {
              date: "2026-06-03",
              submittedCount: 1,
            },
          ],
        },
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T09:30:00.000Z",
      },
    });
    expect(observedReads).toEqual([
      {
        adminPublicId: "organization_analytics_admin_public_001",
      },
      {
        organizationPublicId: "organization_analytics_route_org_public_001",
        scopeOrganizationPublicIds: [
          "organization_analytics_route_org_public_001",
          "organization_analytics_route_child_public_002",
        ],
        dateRange: {
          startAt: "2026-06-01T00:00:00.000Z",
          endAt: "2026-06-16T00:00:00.000Z",
        },
      },
    ]);
  });

  it("wires injected runtime database and session through Postgres source readers", async () => {
    const { database, select, selectCalls } = createFakeRuntimeDatabase([
      [{ organizationId: 101 }],
      [
        {
          organizationId: 101,
          organizationPublicId: "organization_analytics_route_org_public_001",
          parentOrganizationId: null,
        },
        {
          organizationId: 102,
          organizationPublicId: "organization_analytics_route_child_public_002",
          parentOrganizationId: 101,
        },
      ],
      [
        {
          employeePublicId: "organization_analytics_employee_public_001",
          organizationPublicId: "organization_analytics_route_org_public_001",
          organizationTrainingVersionPublicId:
            "organization_analytics_training_version_public_001",
          score: "90.0",
          totalScore: "100.0",
          submittedAt: new Date("2026-06-02T08:00:00.000Z"),
          hiddenSourceMarker: "hidden answer detail",
        },
        {
          employeePublicId: "organization_analytics_employee_public_002",
          organizationPublicId: "organization_analytics_route_child_public_002",
          organizationTrainingVersionPublicId:
            "organization_analytics_training_version_public_002",
          score: "70.0",
          totalScore: "100.0",
          submittedAt: new Date("2026-06-03T08:00:00.000Z"),
          hiddenSourceMarker: "hidden answer detail",
        },
      ],
    ]);
    const sessionService = createCurrentSessionService(
      createSuccessResponse(createAdminAuthContext()),
    );
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers({
        createDatabase: () => database,
        sessionService,
        readUpdatedAt: () => "2026-06-16T10:00:00.000Z",
      });

    const response = await dashboardSummary.GET(
      createDashboardSummaryRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );
    const payload = await response.json();

    expect(payload).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_analytics_route_org_public_001",
        dateRange: {
          startAt: "2026-06-01T00:00:00.000Z",
          endAt: "2026-06-16T00:00:00.000Z",
        },
        trainingSummary: {
          eligibleEmployeeCount: 2,
          submittedEmployeeCount: 2,
          unfinishedEmployeeCount: 0,
          completionRate: 1,
          averageScore: 80,
          maxScore: 90,
          minScore: 70,
          submittedTrend: [
            {
              date: "2026-06-02",
              submittedCount: 1,
            },
            {
              date: "2026-06-03",
              submittedCount: 1,
            },
          ],
        },
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T10:00:00.000Z",
      },
    });
    expect(sessionService.requests).toHaveLength(1);
    expect(select).toHaveBeenCalledTimes(3);
    expect(selectCalls.map((selectCall) => selectCall.selectionKeys)).toEqual([
      ["organizationId"],
      ["organizationId", "organizationPublicId", "parentOrganizationId"],
      [
        "employeePublicId",
        "organizationPublicId",
        "organizationTrainingVersionPublicId",
        "score",
        "totalScore",
        "submittedAt",
      ],
    ]);
    expect(selectCalls[0]?.innerJoin).toHaveBeenCalledTimes(2);
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
    expect(JSON.stringify(payload)).not.toMatch(/hidden|SourceMarker/u);
  });

  it("exports a dashboard summary GET route from the App Router runtime entrypoint", () => {
    expect(dashboardSummaryGET).toEqual(expect.any(Function));
  });
});
