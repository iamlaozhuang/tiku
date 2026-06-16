import { describe, expect, it } from "vitest";

import {
  buildOrganizationAnalyticsDashboardSummary,
  type BuildOrganizationAnalyticsDashboardSummaryCommand,
} from "./organization-analytics-service";

type GuardedFixtureFields = {
  guardedMarkerOne: string;
  guardedMarkerTwo: string;
  guardedMarkerThree: string;
  guardedMarkerFour: string;
  guardedMarkerFive: string;
  guardedMarkerSix: string;
  guardedMarkerSeven: string;
  guardedMarkerEight: string;
};

function createValidCommand(): BuildOrganizationAnalyticsDashboardSummaryCommand &
  GuardedFixtureFields {
  const guardedMarkerOne = ["guarded", "marker", "one"].join("-");
  const guardedMarkerTwo = ["guarded", "marker", "two"].join("-");
  const guardedMarkerThree = ["guarded", "marker", "three"].join("-");
  const guardedMarkerFour = ["guarded", "marker", "four"].join("-");
  const guardedMarkerFive = ["guarded", "marker", "five"].join("-");
  const guardedMarkerSix = ["guarded", "marker", "six"].join("-");
  const guardedMarkerSeven = ["guarded", "marker", "seven"].join("-");
  const guardedMarkerEight = ["guarded", "marker", "eight"].join("-");

  const officialSubmission = {
    id: 99,
    employeePublicId: "employee_public_a",
    score: 88,
    totalScore: 100,
    submittedAt: "2026-06-10T09:30:00Z",
    guardedMarkerOne,
    guardedMarkerTwo,
    guardedMarkerThree,
    guardedMarkerFour,
    guardedMarkerFive,
    guardedMarkerSix,
    guardedMarkerSeven,
    guardedMarkerEight,
  };

  return {
    adminContext: {
      effectiveEdition: "advanced",
      authorizationSource: "org_auth",
      canViewOrganizationTrainingSummary: true,
      organizationPublicId: "org_city_public_123",
    },
    organizationPublicId: "org_city_public_123",
    scopeOrganizationPublicIds: [
      "org_city_public_123",
      "org_district_public_456",
    ],
    dateRange: {
      startAt: "2026-06-10T00:00:00Z",
      endAt: "2026-06-12T23:59:59Z",
    },
    trainingMetricsInput: {
      eligibleEmployeePublicIds: ["employee_public_a", "employee_public_b"],
      officialSubmissions: [officialSubmission],
    },
    updatedAt: "2026-06-16T08:15:00Z",
    guardedMarkerOne,
    guardedMarkerTwo,
    guardedMarkerThree,
    guardedMarkerFour,
    guardedMarkerFive,
    guardedMarkerSix,
    guardedMarkerSeven,
    guardedMarkerEight,
  };
}

describe("organization analytics dashboard service", () => {
  it("builds an aggregate-only dashboard summary without sensitive payloads", () => {
    const command = createValidCommand();
    const result = buildOrganizationAnalyticsDashboardSummary(command);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "org_city_public_123",
        scopeOrganizationPublicIds: [
          "org_city_public_123",
          "org_district_public_456",
        ],
        dateRange: {
          startAt: "2026-06-10T00:00:00Z",
          endAt: "2026-06-12T23:59:59Z",
        },
        trainingSummary: {
          eligibleEmployeeCount: 2,
          submittedEmployeeCount: 1,
          unfinishedEmployeeCount: 1,
          completionRate: 0.5,
          averageScore: 88,
          maxScore: 88,
          minScore: 88,
          submittedTrend: [{ date: "2026-06-10", submittedCount: 1 }],
        },
        redactionStatus: "aggregate_only",
        updatedAt: "2026-06-16T08:15:00Z",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(command.guardedMarkerOne);
    expect(serializedResult).not.toContain(command.guardedMarkerTwo);
    expect(serializedResult).not.toContain(command.guardedMarkerThree);
    expect(serializedResult).not.toContain(command.guardedMarkerFour);
    expect(serializedResult).not.toContain(command.guardedMarkerFive);
    expect(serializedResult).not.toContain(command.guardedMarkerSix);
    expect(serializedResult).not.toContain(command.guardedMarkerSeven);
    expect(serializedResult).not.toContain(command.guardedMarkerEight);
  });

  it("rejects non-advanced org_auth capability contexts", () => {
    expect(
      buildOrganizationAnalyticsDashboardSummary({
        ...createValidCommand(),
        adminContext: {
          effectiveEdition: "standard",
          authorizationSource: "org_auth",
          canViewOrganizationTrainingSummary: true,
          organizationPublicId: "org_city_public_123",
        },
      }),
    ).toEqual({
      code: 403185,
      message: "Organization analytics summary access denied.",
      data: null,
    });

    expect(
      buildOrganizationAnalyticsDashboardSummary({
        ...createValidCommand(),
        adminContext: {
          effectiveEdition: "advanced",
          authorizationSource: "personal_auth",
          canViewOrganizationTrainingSummary: true,
          organizationPublicId: "org_city_public_123",
        },
      }).code,
    ).toBe(403185);

    expect(
      buildOrganizationAnalyticsDashboardSummary({
        ...createValidCommand(),
        adminContext: {
          effectiveEdition: "advanced",
          authorizationSource: "org_auth",
          canViewOrganizationTrainingSummary: false,
          organizationPublicId: "org_city_public_123",
        },
      }).code,
    ).toBe(403185);
  });
});
