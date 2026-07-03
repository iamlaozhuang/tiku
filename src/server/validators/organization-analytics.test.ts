import { describe, expect, it } from "vitest";

import * as organizationAnalyticsValidator from "./organization-analytics";

type ValidatorExports = typeof organizationAnalyticsValidator & {
  parseOrganizationAnalyticsSummaryRouteQuery?: (input: unknown) => unknown;
  parseOrganizationAnalyticsExportReadinessRouteQuery?: (
    input: unknown,
  ) => unknown;
  parseOrganizationAnalyticsEmployeeStatisticsRouteQuery?: (
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

  it("parses employee statistics route query with pagination defaults and allowed page sizes", () => {
    const validatorExports = organizationAnalyticsValidator as ValidatorExports;

    expect(
      validatorExports.parseOrganizationAnalyticsEmployeeStatisticsRouteQuery,
    ).toBeTypeOf("function");

    expect(
      validatorExports.parseOrganizationAnalyticsEmployeeStatisticsRouteQuery?.(
        {
          organizationPublicId: "organization_public_root",
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
      ),
    ).toEqual({
      code: 0,
      message: "ok",
      data: {
        organizationPublicId: "organization_public_root",
        dateRange: {
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
        },
        pagination: {
          page: 1,
          pageSize: 20,
        },
      },
    });

    expect(
      validatorExports.parseOrganizationAnalyticsEmployeeStatisticsRouteQuery?.(
        {
          organizationPublicId: " organization_public_root ",
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
          page: "2",
          pageSize: "50",
        },
      ),
    ).toMatchObject({
      code: 0,
      data: {
        organizationPublicId: "organization_public_root",
        pagination: {
          page: 2,
          pageSize: 50,
        },
      },
    });
  });

  it("rejects unsupported employee statistics page sizes", () => {
    const validatorExports = organizationAnalyticsValidator as ValidatorExports;

    expect(
      validatorExports.parseOrganizationAnalyticsEmployeeStatisticsRouteQuery?.(
        {
          organizationPublicId: "organization_public_root",
          startAt: "2026-06-01T00:00:00Z",
          endAt: "2026-06-16T23:59:59Z",
          page: "1",
          pageSize: "500",
        },
      ),
    ).toEqual({
      code: 400185,
      message: "Invalid organization analytics route input.",
      data: null,
    });
  });
});
