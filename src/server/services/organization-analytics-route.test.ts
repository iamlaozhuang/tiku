import { describe, expect, it, vi } from "vitest";

import { createSuccessResponse } from "../contracts/api-response";
import {
  createOrganizationAnalyticsRedactedStatisticsBoundary,
  type OrganizationAnalyticsDashboardSummaryDto,
  type OrganizationAnalyticsDateRangeDto,
  type OrganizationAnalyticsEmployeeStatisticsSummaryDto,
} from "../contracts/organization-analytics-contract";
import type { OrganizationAnalyticsRepository } from "../repositories/organization-analytics-repository";
import type { RuntimeDatabase } from "../repositories/runtime-database";
import type { AdminRole } from "../models/auth";
import type { OrganizationAnalyticsAdminContext } from "./organization-analytics-service";
import type { SessionService } from "./session-service";
import { GET as dashboardSummaryGET } from "../../app/api/v1/organization-analytics/dashboard-summary/route";
import { GET as employeeStatisticsGET } from "../../app/api/v1/organization-analytics/employee-statistics/route";
import {
  createOrganizationAnalyticsDashboardSummaryRouteHandlers,
  createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers,
  createOrganizationAnalyticsEmployeeStatisticsRouteHandlers,
  createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers,
  type OrganizationAnalyticsDashboardSummaryRouteAdminContext,
  type OrganizationAnalyticsEmployeeStatisticsRouteAdminContext,
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

function createFormalLearningSummaryFixture() {
  return {
    formalPracticeCount: 7,
    formalMockExamCount: 3,
    formalExamReportCount: 2,
    formalMistakeBookCount: 5,
    redactionStatus: "summary_only" as const,
    hiddenSourceMarker: "hidden formal learning source",
  };
}

function createQuotaSummaryFixture() {
  return {
    employeeAiTaskCount: 11,
    employeeAiSucceededTaskCount: 9,
    employeeAiFailedTaskCount: 2,
    employeeAiQuotaConsumedPoint: 135,
    organizationTrainingGenerationConsumedPoint: 42,
    quotaRemainingPoint: 823,
    redactionStatus: "summary_only" as const,
    hiddenSourceMarker: "hidden quota source",
  };
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
    formalLearningSummary: createFormalLearningSummaryFixture(),
    quotaSummary: createQuotaSummaryFixture(),
    redactedStatisticsBoundary:
      createOrganizationAnalyticsRedactedStatisticsBoundary(),
    redactionStatus: "aggregate_only",
    updatedAt: "2026-06-16T08:00:00.000Z",
  };
}

function createEmployeeStatisticsSummary(
  dateRange: OrganizationAnalyticsDateRangeDto,
): OrganizationAnalyticsEmployeeStatisticsSummaryDto {
  return {
    organizationPublicId: "organization_analytics_route_org_public_001",
    scopeOrganizationPublicIds: [
      "organization_analytics_route_org_public_001",
      "organization_analytics_route_child_public_002",
    ],
    dateRange,
    employeeCount: 1,
    employees: [
      {
        employeePublicId: "organization_analytics_employee_public_001",
        employeeDisplayName: "Employee 001",
        organizationPublicId: "organization_analytics_route_org_public_001",
        organizationName: "Organization Analytics Route Org",
        answerOrganizationSnapshot: {
          organizationPublicId: "organization_analytics_route_org_public_001",
          organizationName: "Organization Analytics Route Org",
          capturedAt: "2026-06-02T08:00:00.000Z",
        },
        visibleTrainingCount: 3,
        submittedTrainingCount: 2,
        unfinishedTrainingCount: 1,
        trainingCompletionRate: 0.67,
        trainingAverageScore: 86,
        latestTrainingSubmittedAt: "2026-06-10T09:00:00.000Z",
        redactionStatus: "summary_only",
      },
    ],
    redactedStatisticsBoundary:
      createOrganizationAnalyticsRedactedStatisticsBoundary(),
    redactionStatus: "summary_only",
    updatedAt: "2026-06-16T08:30:00.000Z",
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

function createEmployeeStatisticsAdminContext(
  overrides: Partial<OrganizationAnalyticsAdminContext> = {},
): OrganizationAnalyticsEmployeeStatisticsRouteAdminContext {
  return createAdminContext(
    overrides,
  ) as OrganizationAnalyticsEmployeeStatisticsRouteAdminContext;
}

function createRepositoryBackedDashboardSummaryRepository(
  observedReads: Array<{
    readName?: string;
    adminPublicId?: string;
    organizationPublicId?: string;
    scopeOrganizationPublicIds?: readonly string[];
    dateRange?: OrganizationAnalyticsDateRangeDto;
  }>,
): OrganizationAnalyticsRepository {
  return {
    async lookupVisibleOrganizationScope(input) {
      observedReads.push({
        readName: "visible_scope",
        adminPublicId: input.adminPublicId,
      });

      return [
        "organization_analytics_route_org_public_001",
        "organization_analytics_route_child_public_002",
      ];
    },
    async readTrainingAggregateMetricsInput(input) {
      observedReads.push({
        readName: "training_summary",
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
    async readFormalLearningSummary(input) {
      observedReads.push({
        readName: "formal_learning_summary",
        organizationPublicId: input.organizationPublicId,
        scopeOrganizationPublicIds: input.scopeOrganizationPublicIds,
        dateRange: input.dateRange,
      });

      return createFormalLearningSummaryFixture();
    },
    async readQuotaSummary(input) {
      observedReads.push({
        readName: "quota_summary",
        organizationPublicId: input.organizationPublicId,
        scopeOrganizationPublicIds: input.scopeOrganizationPublicIds,
        dateRange: input.dateRange,
      });

      return createQuotaSummaryFixture();
    },
    async readExportReadinessRows() {
      return [];
    },
  };
}

function createRepositoryBackedEmployeeStatisticsRepository(
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
    async readTrainingAggregateMetricsInput() {
      return null;
    },
    async readEmployeeTrainingSummaryInputs(input) {
      observedReads.push({
        organizationPublicId: input.organizationPublicId,
        scopeOrganizationPublicIds: input.scopeOrganizationPublicIds,
        dateRange: input.dateRange,
      });

      return [
        {
          employeePublicId: "organization_analytics_employee_public_001",
          employeeDisplayName: "Employee 001",
          organizationPublicId: "organization_analytics_route_org_public_001",
          organizationName: "Organization Analytics Route Org",
          visibleTrainingVersionPublicIds: [
            "organization_analytics_training_version_public_001",
            "organization_analytics_training_version_public_002",
          ],
          officialSubmissions: [
            {
              employeePublicId: "organization_analytics_employee_public_001",
              trainingVersionPublicId:
                "organization_analytics_training_version_public_001",
              score: 86,
              totalScore: 100,
              submittedAt: "2026-06-10T09:00:00.000Z",
              answerOrganizationSnapshot: {
                organizationPublicId:
                  "organization_analytics_route_org_public_001",
                organizationName: "Organization Analytics Route Org",
                capturedAt: "2026-06-02T08:00:00.000Z",
              },
            },
          ],
        },
      ];
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
const organizationAdvancedAdminRoles: AdminRole[] = ["org_advanced_admin"];
const organizationStandardAdminRoles: AdminRole[] = ["org_standard_admin"];

function createAdminAuthContext(
  overrides: Partial<NonNullable<CurrentSessionResult["data"]>["user"]> = {},
): NonNullable<CurrentSessionResult["data"]> {
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
      adminRoles: organizationAdvancedAdminRoles,
      adminWorkspaceCapability: {
        adminRoles: organizationAdvancedAdminRoles,
        organizationPublicId: "organization_analytics_route_org_public_001",
        organizationEffectiveEdition: "advanced",
        organizationAuthorizationSource: "org_auth",
        capabilitySource: "service_computed",
        canUseOrganizationAdvancedWorkspace: true,
      },
      ...overrides,
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
        formalLearningSummary: {
          formalPracticeCount: 7,
          formalMockExamCount: 3,
          formalExamReportCount: 2,
          formalMistakeBookCount: 5,
          redactionStatus: "summary_only",
        },
        quotaSummary: {
          employeeAiTaskCount: 11,
          employeeAiSucceededTaskCount: 9,
          employeeAiFailedTaskCount: 2,
          employeeAiQuotaConsumedPoint: 135,
          organizationTrainingGenerationConsumedPoint: 42,
          quotaRemainingPoint: 823,
          redactionStatus: "summary_only",
        },
        redactedStatisticsBoundary:
          createOrganizationAnalyticsRedactedStatisticsBoundary(),
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T08:00:00.000Z",
      },
    });
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
    expect(JSON.stringify(payload)).not.toMatch(/hidden formal|hidden quota/u);
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
      readName?: string;
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
        formalLearningSummary: {
          formalPracticeCount: 7,
          formalMockExamCount: 3,
          formalExamReportCount: 2,
          formalMistakeBookCount: 5,
          redactionStatus: "summary_only",
        },
        quotaSummary: {
          employeeAiTaskCount: 11,
          employeeAiSucceededTaskCount: 9,
          employeeAiFailedTaskCount: 2,
          employeeAiQuotaConsumedPoint: 135,
          organizationTrainingGenerationConsumedPoint: 42,
          quotaRemainingPoint: 823,
          redactionStatus: "summary_only",
        },
        redactedStatisticsBoundary:
          createOrganizationAnalyticsRedactedStatisticsBoundary(),
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T09:30:00.000Z",
      },
    });
    expect(observedReads).toEqual([
      {
        readName: "visible_scope",
        adminPublicId: "organization_analytics_admin_public_001",
      },
      {
        readName: "training_summary",
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
      {
        readName: "formal_learning_summary",
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
      {
        readName: "quota_summary",
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
    expect(JSON.stringify(payload)).not.toMatch(/hidden formal|hidden quota/u);
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
          employeeDisplayName: "Employee 001",
          organizationPublicId: "organization_analytics_route_org_public_001",
          organizationTrainingVersionPublicId:
            "organization_analytics_training_version_public_001",
          score: "90.0",
          totalScore: "100.0",
          submittedAt: new Date("2026-06-02T08:00:00.000Z"),
          answerOrganizationSnapshot: {
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationName: "Organization Analytics Route Org",
            capturedAt: "2026-06-02T07:59:00.000Z",
          },
          hiddenSourceMarker: "hidden answer detail",
        },
        {
          employeePublicId: "organization_analytics_employee_public_002",
          employeeDisplayName: "Employee 002",
          organizationPublicId: "organization_analytics_route_child_public_002",
          organizationTrainingVersionPublicId:
            "organization_analytics_training_version_public_002",
          score: "70.0",
          totalScore: "100.0",
          submittedAt: new Date("2026-06-03T08:00:00.000Z"),
          answerOrganizationSnapshot: {
            organizationPublicId:
              "organization_analytics_route_child_public_002",
            organizationName: "Organization Analytics Route Child",
            capturedAt: "2026-06-03T07:59:00.000Z",
          },
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
        formalLearningSummary: null,
        quotaSummary: null,
        redactedStatisticsBoundary:
          createOrganizationAnalyticsRedactedStatisticsBoundary(),
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
        "employeeDisplayName",
        "organizationPublicId",
        "organizationTrainingVersionPublicId",
        "score",
        "totalScore",
        "submittedAt",
        "answerOrganizationSnapshot",
      ],
    ]);
    expect(selectCalls[0]?.innerJoin).toHaveBeenCalledTimes(2);
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
    expect(JSON.stringify(payload)).not.toMatch(/hidden|SourceMarker/u);
  });

  it("rejects standard organization admins before dashboard summary reads", async () => {
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createAdminAuthContext({
          adminRoles: organizationStandardAdminRoles,
          adminWorkspaceCapability: {
            adminRoles: organizationStandardAdminRoles,
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationEffectiveEdition: "standard",
            organizationAuthorizationSource: "org_auth",
            capabilitySource: "service_computed",
            canUseOrganizationAdvancedWorkspace: false,
          },
        }),
      ),
    );
    const observedReads: Array<{
      readName?: string;
      adminPublicId?: string;
      organizationPublicId?: string;
      scopeOrganizationPublicIds?: readonly string[];
      dateRange?: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers({
        repository:
          createRepositoryBackedDashboardSummaryRepository(observedReads),
        sessionService,
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
    expect(sessionService.requests).toHaveLength(1);
    expect(observedReads).toEqual([]);
  });

  it("rejects advanced role sessions without service-computed organization capability before dashboard reads", async () => {
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createAdminAuthContext({
          adminWorkspaceCapability: undefined,
        }),
      ),
    );
    const observedReads: Array<{
      readName?: string;
      adminPublicId?: string;
      organizationPublicId?: string;
      scopeOrganizationPublicIds?: readonly string[];
      dateRange?: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const { dashboardSummary } =
      createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers({
        repository:
          createRepositoryBackedDashboardSummaryRepository(observedReads),
        sessionService,
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
    expect(sessionService.requests).toHaveLength(1);
    expect(observedReads).toEqual([]);
  });

  it("exports a dashboard summary GET route from the App Router runtime entrypoint", () => {
    expect(dashboardSummaryGET).toEqual(expect.any(Function));
  });
});

describe("organization analytics employee statistics route handlers", () => {
  function createEmployeeStatisticsRequest(query = ""): Request {
    return new Request(
      `http://localhost/api/v1/organization-analytics/employee-statistics${query}`,
      { method: "GET" },
    );
  }

  it("resolves admin context before returning mapped summary-only response", async () => {
    const observedQueries: Array<{
      organizationPublicId: string;
      dateRange: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const observedAdminContextInputs: Array<{
      organizationPublicId: string;
      dateRange: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const adminContext = createEmployeeStatisticsAdminContext();
    const { employeeStatistics } =
      createOrganizationAnalyticsEmployeeStatisticsRouteHandlers({
        async resolveAdminContext({ routeQuery }) {
          observedAdminContextInputs.push(routeQuery);

          return adminContext;
        },
        async readEmployeeStatistics(input) {
          observedQueries.push({
            organizationPublicId: input.organizationPublicId,
            dateRange: input.dateRange,
          });

          expect(input.adminContext).toEqual(adminContext);

          return createSuccessResponse(
            createEmployeeStatisticsSummary(input.dateRange),
            "employee statistics ready",
          );
        },
      });

    const response = await employeeStatistics.GET(
      createEmployeeStatisticsRequest(
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
      message: "employee statistics ready",
      data: {
        organizationPublicId: "organization_analytics_route_org_public_001",
        dateRange: {
          startAt: "2026-06-01T00:00:00.000Z",
          endAt: "2026-06-16T00:00:00.000Z",
        },
        employeeCount: 1,
        employees: [
          {
            employeePublicId: "organization_analytics_employee_public_001",
            employeeDisplayName: "Employee 001",
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationName: "Organization Analytics Route Org",
            answerOrganizationSnapshot: {
              organizationPublicId:
                "organization_analytics_route_org_public_001",
              organizationName: "Organization Analytics Route Org",
              capturedAt: "2026-06-02T08:00:00.000Z",
            },
            visibleTrainingCount: 3,
            submittedTrainingCount: 2,
            unfinishedTrainingCount: 1,
            trainingCompletionRate: 0.67,
            trainingAverageScore: 86,
            latestTrainingSubmittedAt: "2026-06-10T09:00:00.000Z",
            redactionStatus: "summary_only",
          },
        ],
        redactedStatisticsBoundary:
          createOrganizationAnalyticsRedactedStatisticsBoundary(),
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T08:30:00.000Z",
      },
    });
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
    expect(JSON.stringify(payload)).not.toMatch(
      /question|standardAnswer|analysis|itemLevel|rawModel/u,
    );
  });

  it("returns invalid input envelope before calling employee statistics reader", async () => {
    const observedQueries: unknown[] = [];
    const observedAdminContextInputs: unknown[] = [];
    const { employeeStatistics } =
      createOrganizationAnalyticsEmployeeStatisticsRouteHandlers({
        async resolveAdminContext(input) {
          observedAdminContextInputs.push(input);

          return createEmployeeStatisticsAdminContext();
        },
        async readEmployeeStatistics(input) {
          observedQueries.push(input);

          return createSuccessResponse(
            createEmployeeStatisticsSummary(input.dateRange),
          );
        },
      });

    const response = await employeeStatistics.GET(
      createEmployeeStatisticsRequest(
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

  it("returns admin context unavailable before calling employee statistics reader", async () => {
    const observedQueries: unknown[] = [];
    const { employeeStatistics } =
      createOrganizationAnalyticsEmployeeStatisticsRouteHandlers({
        async resolveAdminContext() {
          return null;
        },
        async readEmployeeStatistics(input) {
          observedQueries.push(input);

          return createSuccessResponse(
            createEmployeeStatisticsSummary(input.dateRange),
          );
        },
      });

    const response = await employeeStatistics.GET(
      createEmployeeStatisticsRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403188,
      message:
        "Organization analytics employee statistics admin context is unavailable.",
      data: null,
    });
    expect(observedQueries).toEqual([]);
  });

  it("composes injected runtime dependencies through repository-backed employee statistics service", async () => {
    const observedReads: Array<{
      adminPublicId?: string;
      organizationPublicId?: string;
      scopeOrganizationPublicIds?: readonly string[];
      dateRange?: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const adminContext = createEmployeeStatisticsAdminContext();
    const { employeeStatistics } =
      createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers({
        repository:
          createRepositoryBackedEmployeeStatisticsRepository(observedReads),
        resolveAdminContext: async () => adminContext,
        readUpdatedAt: () => "2026-06-16T10:30:00.000Z",
      });

    const response = await employeeStatistics.GET(
      createEmployeeStatisticsRequest(
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
        employeeCount: 1,
        employees: [
          {
            employeePublicId: "organization_analytics_employee_public_001",
            employeeDisplayName: "Employee 001",
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationName: "Organization Analytics Route Org",
            answerOrganizationSnapshot: {
              organizationPublicId:
                "organization_analytics_route_org_public_001",
              organizationName: "Organization Analytics Route Org",
              capturedAt: "2026-06-02T08:00:00.000Z",
            },
            visibleTrainingCount: 2,
            submittedTrainingCount: 1,
            unfinishedTrainingCount: 1,
            trainingCompletionRate: 0.5,
            trainingAverageScore: 86,
            latestTrainingSubmittedAt: "2026-06-10T09:00:00.000Z",
            redactionStatus: "summary_only",
          },
        ],
        redactedStatisticsBoundary:
          createOrganizationAnalyticsRedactedStatisticsBoundary(),
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T10:30:00.000Z",
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
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
    expect(JSON.stringify(payload)).not.toMatch(
      /question|standardAnswer|analysis|itemLevel|rawModel/u,
    );
  });

  it("wires injected runtime database and session through Postgres visible-scope source reader", async () => {
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
          employeeDisplayName: "Employee 001",
          organizationPublicId: "organization_analytics_route_org_public_001",
          organizationTrainingVersionPublicId:
            "organization_analytics_training_version_public_001",
          score: "86.0",
          totalScore: "100.0",
          submittedAt: new Date("2026-06-10T09:00:00.000Z"),
          answerOrganizationSnapshot: {
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationName: "Organization Analytics Route Org",
            capturedAt: "2026-06-10T08:59:00.000Z",
          },
          hiddenSourceMarker: "hidden answer detail",
        },
      ],
    ]);
    const sessionService = createCurrentSessionService(
      createSuccessResponse(createAdminAuthContext()),
    );
    const { employeeStatistics } =
      createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers({
        createDatabase: () => database,
        sessionService,
        readUpdatedAt: () => "2026-06-16T10:45:00.000Z",
      });

    const response = await employeeStatistics.GET(
      createEmployeeStatisticsRequest(
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
        employeeCount: 1,
        employees: [
          {
            employeePublicId: "organization_analytics_employee_public_001",
            employeeDisplayName: "Employee 001",
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationName: "Organization Analytics Route Org",
            answerOrganizationSnapshot: {
              organizationPublicId:
                "organization_analytics_route_org_public_001",
              organizationName: "Organization Analytics Route Org",
              capturedAt: "2026-06-10T08:59:00.000Z",
            },
            visibleTrainingCount: 1,
            submittedTrainingCount: 1,
            unfinishedTrainingCount: 0,
            trainingCompletionRate: 1,
            trainingAverageScore: 86,
            latestTrainingSubmittedAt: "2026-06-10T09:00:00.000Z",
            redactionStatus: "summary_only",
          },
        ],
        redactedStatisticsBoundary:
          createOrganizationAnalyticsRedactedStatisticsBoundary(),
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T10:45:00.000Z",
      },
    });
    expect(sessionService.requests).toHaveLength(1);
    expect(select).toHaveBeenCalledTimes(3);
    expect(selectCalls.map((selectCall) => selectCall.selectionKeys)).toEqual([
      ["organizationId"],
      ["organizationId", "organizationPublicId", "parentOrganizationId"],
      [
        "employeePublicId",
        "employeeDisplayName",
        "organizationPublicId",
        "organizationTrainingVersionPublicId",
        "score",
        "totalScore",
        "submittedAt",
        "answerOrganizationSnapshot",
      ],
    ]);
    expect(payload.data).not.toHaveProperty("scopeOrganizationPublicIds");
    expect(JSON.stringify(payload)).not.toMatch(/hidden|SourceMarker/u);
  });

  it("rejects advanced role sessions with false service-computed capability before employee statistics reads", async () => {
    const sessionService = createCurrentSessionService(
      createSuccessResponse(
        createAdminAuthContext({
          adminWorkspaceCapability: {
            adminRoles: organizationAdvancedAdminRoles,
            organizationPublicId: "organization_analytics_route_org_public_001",
            organizationEffectiveEdition: "advanced",
            organizationAuthorizationSource: "org_auth",
            capabilitySource: "service_computed",
            canUseOrganizationAdvancedWorkspace: false,
          },
        }),
      ),
    );
    const observedReads: Array<{
      adminPublicId?: string;
      organizationPublicId?: string;
      scopeOrganizationPublicIds?: readonly string[];
      dateRange?: OrganizationAnalyticsDateRangeDto;
    }> = [];
    const { employeeStatistics } =
      createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers({
        repository:
          createRepositoryBackedEmployeeStatisticsRepository(observedReads),
        sessionService,
      });

    const response = await employeeStatistics.GET(
      createEmployeeStatisticsRequest(
        "?organizationPublicId=organization_analytics_route_org_public_001&startAt=2026-06-01T00%3A00%3A00.000Z&endAt=2026-06-16T00%3A00%3A00.000Z",
      ),
    );

    await expect(response.json()).resolves.toEqual({
      code: 403188,
      message:
        "Organization analytics employee statistics admin context is unavailable.",
      data: null,
    });
    expect(sessionService.requests).toHaveLength(1);
    expect(observedReads).toEqual([]);
  });

  it("exports an employee statistics GET route from the App Router entrypoint", () => {
    expect(employeeStatisticsGET).toEqual(expect.any(Function));
  });

  it("uses the employee statistics runtime factory at the App Router entrypoint", async () => {
    vi.resetModules();
    const runtimeGET = vi.fn();
    const nonRuntimeGET = vi.fn();
    const createRuntimeHandlers = vi.fn(() => ({
      employeeStatistics: { GET: runtimeGET },
    }));
    const createNonRuntimeHandlers = vi.fn(() => ({
      employeeStatistics: { GET: nonRuntimeGET },
    }));

    vi.doMock("./organization-analytics-route", () => ({
      createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers:
        createRuntimeHandlers,
      createOrganizationAnalyticsEmployeeStatisticsRouteHandlers:
        createNonRuntimeHandlers,
    }));

    try {
      const route =
        await import("../../app/api/v1/organization-analytics/employee-statistics/route");

      expect(route.GET).toBe(runtimeGET);
      expect(createRuntimeHandlers).toHaveBeenCalledTimes(1);
      expect(createNonRuntimeHandlers).not.toHaveBeenCalled();
    } finally {
      vi.doUnmock("./organization-analytics-route");
    }
  });
});
