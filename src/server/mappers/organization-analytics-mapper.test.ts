import { describe, expect, it } from "vitest";

import * as organizationAnalyticsMapper from "./organization-analytics-mapper";

type MapperExports = typeof organizationAnalyticsMapper & {
  mapOrganizationAnalyticsDashboardRouteResponse?: (
    response: unknown,
  ) => unknown;
  mapOrganizationAnalyticsEmployeeStatisticsRouteResponse?: (
    response: unknown,
  ) => unknown;
  mapOrganizationAnalyticsExportReadinessRouteResponse?: (
    response: unknown,
  ) => unknown;
};

const redactedStatisticsBoundary = {
  visibilityScope: "organization_admin_own_scope",
  trainingStatisticsPolicy: "summary_counts_score_time_only",
  employeeStatisticsPolicy: "status_score_time_only",
};

describe("organization analytics route mapper", () => {
  it("maps dashboard summaries without scoped organization identifier arrays", () => {
    const mapperExports = organizationAnalyticsMapper as MapperExports;

    expect(
      mapperExports.mapOrganizationAnalyticsDashboardRouteResponse,
    ).toBeTypeOf("function");

    const response =
      mapperExports.mapOrganizationAnalyticsDashboardRouteResponse?.({
        code: 0,
        message: "ok",
        data: {
          organizationPublicId: "organization_public_root",
          scopeOrganizationPublicIds: [
            "organization_public_root",
            "organization_public_child",
          ],
          dateRange: {
            startAt: "2026-06-01T00:00:00Z",
            endAt: "2026-06-16T23:59:59Z",
          },
          trainingSummary: {
            eligibleEmployeeCount: 2,
            submittedEmployeeCount: 1,
            unfinishedEmployeeCount: 1,
            completionRate: 0.5,
            averageScore: null,
            maxScore: null,
            minScore: null,
            submittedTrend: [],
          },
          formalLearningSummary: null,
          quotaSummary: null,
          redactedStatisticsBoundary,
          redactionStatus: "aggregate_only",
          updatedAt: "2026-06-16T10:30:00Z",
        },
      });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_public_root",
        dateRange: {
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
        trainingSummary: {
          eligibleEmployeeCount: 2,
          submittedEmployeeCount: 1,
          unfinishedEmployeeCount: 1,
          completionRate: 0.5,
          averageScore: null,
          maxScore: null,
          minScore: null,
          submittedTrend: [],
        },
        formalLearningSummary: null,
        quotaSummary: null,
        redactedStatisticsBoundary,
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T10:30:00Z",
      },
    });
    expect(JSON.stringify(response)).not.toContain(
      "scopeOrganizationPublicIds",
    );
    expect(JSON.stringify(response)).not.toContain("organization_public_child");
  });

  it("maps employee statistics summaries with summary-only employees", () => {
    const mapperExports = organizationAnalyticsMapper as MapperExports;

    expect(
      mapperExports.mapOrganizationAnalyticsEmployeeStatisticsRouteResponse,
    ).toBeTypeOf("function");

    const response =
      mapperExports.mapOrganizationAnalyticsEmployeeStatisticsRouteResponse?.({
        code: 0,
        message: "ok",
        data: {
          organizationPublicId: "organization_public_root",
          scopeOrganizationPublicIds: [
            "organization_public_root",
            "organization_public_child",
          ],
          dateRange: {
            startAt: "2026-06-01T00:00:00Z",
            endAt: "2026-06-16T23:59:59Z",
          },
          employeeCount: 1,
          employees: [
            {
              employeePublicId: "employee_public_001",
              employeeDisplayName: "Employee One",
              organizationPublicId: "organization_public_child",
              organizationName: "Child Organization",
              answerOrganizationSnapshot: null,
              visibleTrainingCount: 0,
              submittedTrainingCount: 0,
              unfinishedTrainingCount: 0,
              trainingCompletionRate: 0,
              trainingAverageScore: null,
              latestTrainingSubmittedAt: null,
              redactionStatus: "summary_only",
            },
          ],
          redactedStatisticsBoundary,
          redactionStatus: "summary_only",
          updatedAt: "2026-06-16T10:30:00Z",
        },
      });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_public_root",
        dateRange: {
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
        employeeCount: 1,
        employees: [
          {
            employeePublicId: "employee_public_001",
            employeeDisplayName: "Employee One",
            organizationPublicId: "organization_public_child",
            organizationName: "Child Organization",
            answerOrganizationSnapshot: null,
            visibleTrainingCount: 0,
            submittedTrainingCount: 0,
            unfinishedTrainingCount: 0,
            trainingCompletionRate: 0,
            trainingAverageScore: null,
            latestTrainingSubmittedAt: null,
            redactionStatus: "summary_only",
          },
        ],
        redactedStatisticsBoundary,
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T10:30:00Z",
      },
    });
    expect(JSON.stringify(response)).not.toContain(
      "scopeOrganizationPublicIds",
    );
  });

  it("maps export readiness metadata without generated artifacts", () => {
    const mapperExports = organizationAnalyticsMapper as MapperExports;

    expect(
      mapperExports.mapOrganizationAnalyticsExportReadinessRouteResponse,
    ).toBeTypeOf("function");

    const response =
      mapperExports.mapOrganizationAnalyticsExportReadinessRouteResponse?.({
        code: 0,
        message: "ok",
        data: {
          organizationPublicId: "organization_public_root",
          scopeOrganizationPublicIds: [
            "organization_public_root",
            "organization_public_child",
          ],
          dateRange: {
            startAt: "2026-06-01T00:00:00Z",
            endAt: "2026-06-16T23:59:59Z",
          },
          exportScope: "employee_statistics_summary",
          readinessStatus: "blocked",
          summaryRowCount: 0,
          blockedReasons: ["no_summary_rows"],
          objectStorageStatus: "not_configured",
          externalDeliveryStatus: "not_configured",
          generatedFile: null,
          downloadUrl: null,
          externalDelivery: null,
          redactionStatus: "summary_only",
          updatedAt: "2026-06-16T10:30:00Z",
        },
      });

    expect(response).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_public_root",
        dateRange: {
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
        exportScope: "employee_statistics_summary",
        readinessStatus: "blocked",
        summaryRowCount: 0,
        blockedReasons: ["no_summary_rows"],
        objectStorageStatus: "not_configured",
        externalDeliveryStatus: "not_configured",
        generatedFile: null,
        downloadUrl: null,
        externalDelivery: null,
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T10:30:00Z",
      },
    });
    expect(JSON.stringify(response)).not.toContain(
      "scopeOrganizationPublicIds",
    );
    expect(JSON.stringify(response)).not.toContain("organization_public_child");
  });
});
