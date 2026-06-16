import { describe, expect, it } from "vitest";

import * as organizationAnalyticsValidator from "./organization-analytics";

type ValidatorExports = typeof organizationAnalyticsValidator & {
  parseOrganizationAnalyticsSummaryRouteQuery?: (input: unknown) => unknown;
  parseOrganizationAnalyticsExportReadinessRouteQuery?: (
    input: unknown,
  ) => unknown;
};

describe("organization analytics route validator", () => {
  it("parses trimmed summary route query values into a typed date range", () => {
    const validatorExports = organizationAnalyticsValidator as ValidatorExports;

    expect(
      validatorExports.parseOrganizationAnalyticsSummaryRouteQuery,
    ).toBeTypeOf("function");

    expect(
      validatorExports.parseOrganizationAnalyticsSummaryRouteQuery?.({
        organizationPublicId: " organization_public_root ",
        startAt: "2026-06-01T00:00:00Z",
        endAt: "2026-06-16T23:59:59Z",
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_public_root",
        dateRange: {
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
      },
    });
  });

  it("rejects invalid summary route query values with a standard error response", () => {
    const validatorExports = organizationAnalyticsValidator as ValidatorExports;

    expect(
      validatorExports.parseOrganizationAnalyticsSummaryRouteQuery?.({
        organizationPublicId: " ",
        startAt: "not-a-date",
        endAt: "2026-06-16T23:59:59Z",
      }),
    ).toEqual({
      code: 400185,
      message: "Invalid organization analytics route input.",
      data: null,
    });
  });

  it("parses export readiness route query values with an allowed export scope", () => {
    const validatorExports = organizationAnalyticsValidator as ValidatorExports;

    expect(
      validatorExports.parseOrganizationAnalyticsExportReadinessRouteQuery,
    ).toBeTypeOf("function");

    expect(
      validatorExports.parseOrganizationAnalyticsExportReadinessRouteQuery?.({
        organizationPublicId: "organization_public_root",
        startAt: "2026-06-01T00:00:00Z",
        endAt: "2026-06-16T23:59:59Z",
        exportScope: "employee_statistics_summary",
      }),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_public_root",
        dateRange: {
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
        exportScope: "employee_statistics_summary",
      },
    });
  });
});
