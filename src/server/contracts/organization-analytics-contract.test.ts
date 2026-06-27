import { describe, expect, it } from "vitest";

import * as organizationAnalyticsContract from "./organization-analytics-contract";

type ContractExports = typeof organizationAnalyticsContract & {
  createOrganizationAnalyticsDashboardRouteResponse?: typeof organizationAnalyticsContract.createOrganizationAnalyticsDashboardRouteResponse;
};

describe("organization analytics route contract", () => {
  it("creates a standard dashboard response with redacted policy metadata but without scoped organization identifier arrays", () => {
    const contractExports = organizationAnalyticsContract as ContractExports;

    expect(
      contractExports.createOrganizationAnalyticsDashboardRouteResponse,
    ).toBeTypeOf("function");

    const response =
      contractExports.createOrganizationAnalyticsDashboardRouteResponse?.({
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
          averageScore: 86,
          maxScore: 86,
          minScore: 86,
          submittedTrend: [{ date: "2026-06-16", submittedCount: 1 }],
        },
        formalLearningSummary: null,
        quotaSummary: null,
        redactedStatisticsBoundary:
          organizationAnalyticsContract.createOrganizationAnalyticsRedactedStatisticsBoundary(),
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T10:30:00Z",
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
          averageScore: 86,
          maxScore: 86,
          minScore: 86,
          submittedTrend: [{ date: "2026-06-16", submittedCount: 1 }],
        },
        formalLearningSummary: null,
        quotaSummary: null,
        redactedStatisticsBoundary: {
          visibilityScope: "organization_admin_own_scope",
          trainingStatisticsPolicy: "summary_counts_score_time_only",
          employeeStatisticsPolicy: "status_score_time_only",
          rawEmployeeAnswerPolicy: "blocked",
          rawAiGeneratedContentPolicy: "blocked",
          promptProviderPayloadPolicy: "blocked",
          exportPolicy: "blocked_requires_fresh_approval",
          crossOrganizationAnalyticsPolicy: "blocked",
          redactionStatus: "redacted_boundary",
        },
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T10:30:00Z",
      },
    });
    expect(JSON.stringify(response)).not.toContain(
      "scopeOrganizationPublicIds",
    );
    expect(JSON.stringify(response)).not.toContain("organization_public_child");
    expect(JSON.stringify(response)).toContain("redactedStatisticsBoundary");
  });

  it("creates a redacted statistics boundary contract for internal summaries", () => {
    expect(
      organizationAnalyticsContract.createOrganizationAnalyticsRedactedStatisticsBoundary(),
    ).toEqual({
      visibilityScope: "organization_admin_own_scope",
      trainingStatisticsPolicy: "summary_counts_score_time_only",
      employeeStatisticsPolicy: "status_score_time_only",
      rawEmployeeAnswerPolicy: "blocked",
      rawAiGeneratedContentPolicy: "blocked",
      promptProviderPayloadPolicy: "blocked",
      exportPolicy: "blocked_requires_fresh_approval",
      crossOrganizationAnalyticsPolicy: "blocked",
      redactionStatus: "redacted_boundary",
    });
  });
});
