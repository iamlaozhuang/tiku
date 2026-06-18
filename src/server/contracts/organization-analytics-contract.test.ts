import { describe, expect, it } from "vitest";

import * as organizationAnalyticsContract from "./organization-analytics-contract";

type DashboardRouteResponseFactory = (data: {
  organizationPublicId: string;
  scopeOrganizationPublicIds: readonly string[];
  dateRange: {
    startAt: string;
    endAt: string;
  };
  trainingSummary: {
    eligibleEmployeeCount: number;
    submittedEmployeeCount: number;
    unfinishedEmployeeCount: number;
    completionRate: number;
    averageScore: number | null;
    maxScore: number | null;
    minScore: number | null;
    submittedTrend: readonly { date: string; submittedCount: number }[];
  };
  redactionStatus: "aggregate_only";
  updatedAt: string;
}) => unknown;

type ContractExports = typeof organizationAnalyticsContract & {
  createOrganizationAnalyticsDashboardRouteResponse?: DashboardRouteResponseFactory;
};

describe("organization analytics route contract", () => {
  it("creates a standard dashboard response without scoped organization identifier arrays", () => {
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
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T10:30:00Z",
      },
    });
    expect(JSON.stringify(response)).not.toContain(
      "scopeOrganizationPublicIds",
    );
    expect(JSON.stringify(response)).not.toContain("organization_public_child");
  });
});
