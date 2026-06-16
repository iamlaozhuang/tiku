import { describe, expect, it, vi } from "vitest";

import {
  buildOrganizationAnalyticsAuditLogRedactedReference,
  buildOrganizationAnalyticsDashboardSummary,
  buildOrganizationAnalyticsDashboardSummaryFromRepository,
  buildOrganizationAnalyticsEmployeeStatisticsSummary,
  buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository,
  buildOrganizationAnalyticsExportReadinessSummary,
  buildOrganizationAnalyticsExportReadinessSummaryFromRepository,
  type BuildOrganizationAnalyticsAuditLogReferenceCommand,
  type BuildOrganizationAnalyticsDashboardSummaryCommand,
  type BuildOrganizationAnalyticsEmployeeStatisticsSummaryCommand,
  type BuildOrganizationAnalyticsExportReadinessSummaryCommand,
  type OrganizationAnalyticsServiceRepository,
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

function createValidEmployeeStatisticsCommand(): BuildOrganizationAnalyticsEmployeeStatisticsSummaryCommand &
  GuardedFixtureFields {
  const dashboardCommand = createValidCommand();
  const guardedMarkerOne = ["guarded", "employee", "service", "one"].join("-");
  const guardedMarkerTwo = ["guarded", "employee", "service", "two"].join("-");
  const officialSubmission = {
    id: 502,
    employeePublicId: "employee_public_a",
    trainingVersionPublicId: "training_version_public_alpha",
    score: 88,
    totalScore: 100,
    submittedAt: "2026-06-10T09:30:00Z",
    answerOrganizationSnapshot: {
      organizationPublicId: "org_district_public_456",
      organizationName: "District One",
      capturedAt: "2026-06-10T09:30:00Z",
    },
    guardedMarkerOne,
    guardedMarkerTwo,
  };

  return {
    adminContext: dashboardCommand.adminContext,
    organizationPublicId: dashboardCommand.organizationPublicId,
    scopeOrganizationPublicIds: dashboardCommand.scopeOrganizationPublicIds,
    dateRange: dashboardCommand.dateRange,
    employeeTrainingSummaryInputs: [
      {
        employeePublicId: "employee_public_a",
        employeeDisplayName: "Employee A",
        organizationPublicId: "org_city_public_123",
        organizationName: "City Org",
        visibleTrainingVersionPublicIds: [
          "training_version_public_alpha",
          "training_version_public_beta",
        ],
        officialSubmissions: [officialSubmission],
      },
    ],
    updatedAt: dashboardCommand.updatedAt,
    guardedMarkerOne,
    guardedMarkerTwo,
    guardedMarkerThree: dashboardCommand.guardedMarkerThree,
    guardedMarkerFour: dashboardCommand.guardedMarkerFour,
    guardedMarkerFive: dashboardCommand.guardedMarkerFive,
    guardedMarkerSix: dashboardCommand.guardedMarkerSix,
    guardedMarkerSeven: dashboardCommand.guardedMarkerSeven,
    guardedMarkerEight: dashboardCommand.guardedMarkerEight,
  };
}

function createValidExportReadinessCommand(): BuildOrganizationAnalyticsExportReadinessSummaryCommand &
  GuardedFixtureFields {
  const dashboardCommand = createValidCommand();
  const guardedMarkerOne = ["guarded", "export", "service", "one"].join("-");
  const guardedMarkerTwo = ["guarded", "export", "service", "two"].join("-");
  const summaryRows = [
    {
      sourceRowId: 801,
      rowPublicId: "employee_public_a",
      redactionStatus: "summary_only" as const,
      guardedMarkerOne,
    },
    {
      sourceRowId: 802,
      rowPublicId: "employee_public_b",
      redactionStatus: "summary_only" as const,
      guardedMarkerTwo,
    },
  ];

  return {
    adminContext: dashboardCommand.adminContext,
    organizationPublicId: dashboardCommand.organizationPublicId,
    scopeOrganizationPublicIds: dashboardCommand.scopeOrganizationPublicIds,
    dateRange: dashboardCommand.dateRange,
    exportScope: "employee_statistics_summary",
    summaryRows,
    objectStorageAvailable: false,
    externalDeliveryAvailable: false,
    updatedAt: dashboardCommand.updatedAt,
    guardedMarkerOne,
    guardedMarkerTwo,
    guardedMarkerThree: dashboardCommand.guardedMarkerThree,
    guardedMarkerFour: dashboardCommand.guardedMarkerFour,
    guardedMarkerFive: dashboardCommand.guardedMarkerFive,
    guardedMarkerSix: dashboardCommand.guardedMarkerSix,
    guardedMarkerSeven: dashboardCommand.guardedMarkerSeven,
    guardedMarkerEight: dashboardCommand.guardedMarkerEight,
  };
}

function createValidAuditLogReferenceCommand(): BuildOrganizationAnalyticsAuditLogReferenceCommand &
  GuardedFixtureFields {
  const exportReadinessCommand = createValidExportReadinessCommand();
  const guardedMarkerOne = ["guarded", "audit", "service", "one"].join("-");
  const guardedMarkerTwo = ["guarded", "audit", "service", "two"].join("-");

  return {
    adminContext: exportReadinessCommand.adminContext,
    organizationPublicId: exportReadinessCommand.organizationPublicId,
    scopeOrganizationPublicIds:
      exportReadinessCommand.scopeOrganizationPublicIds,
    dateRange: exportReadinessCommand.dateRange,
    action: "export_readiness_checked",
    referencePublicId: "audit_reference_public_123",
    summaryRowCount: exportReadinessCommand.summaryRows.length,
    recordedAt: "2026-06-16T09:05:00Z",
    guardedMarkerOne,
    guardedMarkerTwo,
    guardedMarkerThree: exportReadinessCommand.guardedMarkerThree,
    guardedMarkerFour: exportReadinessCommand.guardedMarkerFour,
    guardedMarkerFive: exportReadinessCommand.guardedMarkerFive,
    guardedMarkerSix: exportReadinessCommand.guardedMarkerSix,
    guardedMarkerSeven: exportReadinessCommand.guardedMarkerSeven,
    guardedMarkerEight: exportReadinessCommand.guardedMarkerEight,
  };
}

function createOrganizationAnalyticsServiceRepositoryFake(
  overrides: Partial<OrganizationAnalyticsServiceRepository> = {},
): OrganizationAnalyticsServiceRepository {
  return {
    lookupVisibleOrganizationScope: vi.fn(async () => [
      "org_city_public_123",
      "org_district_public_456",
    ]),
    readTrainingAggregateMetricsInput: vi.fn(
      async () => createValidCommand().trainingMetricsInput,
    ),
    readEmployeeTrainingSummaryInputs: vi.fn(
      async () =>
        createValidEmployeeStatisticsCommand().employeeTrainingSummaryInputs,
    ),
    readFormalLearningSummary: vi.fn(async () => null),
    readQuotaSummary: vi.fn(async () => null),
    readExportReadinessRows: vi.fn(async () => [
      {
        rowPublicId: "employee_public_a",
        redactionStatus: "summary_only" as const,
      },
      {
        rowPublicId: "employee_public_b",
        redactionStatus: "summary_only" as const,
      },
    ]),
    ...overrides,
  };
}

function createRepositoryBackedSummaryCommand(
  repository: OrganizationAnalyticsServiceRepository,
) {
  const command = createValidCommand();

  return {
    adminContext: command.adminContext,
    adminPublicId: "admin_public_123",
    organizationPublicId: command.organizationPublicId,
    dateRange: command.dateRange,
    updatedAt: command.updatedAt,
    repository,
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

describe("organization analytics repository-backed service", () => {
  it("builds dashboard summary from injected repository read models", async () => {
    const repository = createOrganizationAnalyticsServiceRepositoryFake();
    const command = createRepositoryBackedSummaryCommand(repository);
    const result =
      await buildOrganizationAnalyticsDashboardSummaryFromRepository(command);

    expect(repository.lookupVisibleOrganizationScope).toHaveBeenCalledWith({
      adminPublicId: "admin_public_123",
    });
    expect(repository.readTrainingAggregateMetricsInput).toHaveBeenCalledWith({
      organizationPublicId: "org_city_public_123",
      scopeOrganizationPublicIds: [
        "org_city_public_123",
        "org_district_public_456",
      ],
      dateRange: command.dateRange,
    });
    expect(result).toEqual(
      buildOrganizationAnalyticsDashboardSummary(createValidCommand()),
    );
  });

  it("stops repository reads when visible organization scope excludes the target", async () => {
    const repository = createOrganizationAnalyticsServiceRepositoryFake({
      lookupVisibleOrganizationScope: vi.fn(async () => [
        "org_other_public_999",
      ]),
    });
    const result =
      await buildOrganizationAnalyticsDashboardSummaryFromRepository(
        createRepositoryBackedSummaryCommand(repository),
      );

    expect(result).toEqual({
      code: 403185,
      message: "Organization analytics summary access denied.",
      data: null,
    });
    expect(repository.readTrainingAggregateMetricsInput).not.toHaveBeenCalled();
  });

  it("builds employee statistics summary from injected repository read models", async () => {
    const repository = createOrganizationAnalyticsServiceRepositoryFake();
    const command = createRepositoryBackedSummaryCommand(repository);
    const result =
      await buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository(
        command,
      );

    expect(repository.readEmployeeTrainingSummaryInputs).toHaveBeenCalledWith({
      organizationPublicId: "org_city_public_123",
      scopeOrganizationPublicIds: [
        "org_city_public_123",
        "org_district_public_456",
      ],
      dateRange: command.dateRange,
    });
    expect(result).toEqual(
      buildOrganizationAnalyticsEmployeeStatisticsSummary(
        createValidEmployeeStatisticsCommand(),
      ),
    );
  });

  it("builds export readiness summary from injected repository read models", async () => {
    const repository = createOrganizationAnalyticsServiceRepositoryFake();
    const command = createRepositoryBackedSummaryCommand(repository);
    const result =
      await buildOrganizationAnalyticsExportReadinessSummaryFromRepository({
        ...command,
        exportScope: "employee_statistics_summary",
        objectStorageAvailable: false,
        externalDeliveryAvailable: false,
      });
    const serializedResult = JSON.stringify(result);

    expect(repository.readExportReadinessRows).toHaveBeenCalledWith({
      organizationPublicId: "org_city_public_123",
      scopeOrganizationPublicIds: [
        "org_city_public_123",
        "org_district_public_456",
      ],
      dateRange: command.dateRange,
    });
    expect(result).toEqual(
      buildOrganizationAnalyticsExportReadinessSummary(
        createValidExportReadinessCommand(),
      ),
    );
    expect(serializedResult).not.toContain("employee_public_a");
    expect(serializedResult).not.toContain("employee_public_b");
  });
});

describe("organization analytics employee statistics service", () => {
  it("builds summary-only employee statistics without sensitive payloads", () => {
    const command = createValidEmployeeStatisticsCommand();
    const result = buildOrganizationAnalyticsEmployeeStatisticsSummary(command);
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
        employeeCount: 1,
        employees: [
          {
            employeePublicId: "employee_public_a",
            employeeDisplayName: "Employee A",
            organizationPublicId: "org_city_public_123",
            organizationName: "City Org",
            answerOrganizationSnapshot: {
              organizationPublicId: "org_district_public_456",
              organizationName: "District One",
              capturedAt: "2026-06-10T09:30:00Z",
            },
            visibleTrainingCount: 2,
            submittedTrainingCount: 1,
            unfinishedTrainingCount: 1,
            trainingCompletionRate: 0.5,
            trainingAverageScore: 88,
            latestTrainingSubmittedAt: "2026-06-10T09:30:00Z",
            redactionStatus: "summary_only",
          },
        ],
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T08:15:00Z",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain(command.guardedMarkerOne);
    expect(serializedResult).not.toContain(command.guardedMarkerTwo);
  });

  it("rejects employee statistics when organization analytics access is not available", () => {
    expect(
      buildOrganizationAnalyticsEmployeeStatisticsSummary({
        ...createValidEmployeeStatisticsCommand(),
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
      buildOrganizationAnalyticsEmployeeStatisticsSummary({
        ...createValidEmployeeStatisticsCommand(),
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

describe("organization analytics export readiness service", () => {
  it("builds readiness-only export metadata without artifacts or row identifiers", () => {
    const command = createValidExportReadinessCommand();
    const result = buildOrganizationAnalyticsExportReadinessSummary(command);
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
        exportScope: "employee_statistics_summary",
        readinessStatus: "blocked",
        summaryRowCount: 2,
        blockedReasons: [
          "object_storage_not_configured",
          "external_delivery_not_configured",
        ],
        objectStorageStatus: "not_configured",
        externalDeliveryStatus: "not_configured",
        generatedFile: null,
        downloadUrl: null,
        externalDelivery: null,
        redactionStatus: "summary_only",
        updatedAt: "2026-06-16T08:15:00Z",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain("sourceRowId");
    expect(serializedResult).not.toContain("employee_public_a");
    expect(serializedResult).not.toContain("employee_public_b");
    expect(serializedResult).not.toContain(command.guardedMarkerOne);
    expect(serializedResult).not.toContain(command.guardedMarkerTwo);
  });

  it("rejects export readiness when organization analytics access is not available", () => {
    expect(
      buildOrganizationAnalyticsExportReadinessSummary({
        ...createValidExportReadinessCommand(),
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
      buildOrganizationAnalyticsExportReadinessSummary({
        ...createValidExportReadinessCommand(),
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

describe("organization analytics audit log reference service", () => {
  it("builds a redacted audit log reference without writing source details", () => {
    const command = createValidAuditLogReferenceCommand();
    const result = buildOrganizationAnalyticsAuditLogRedactedReference(command);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      code: 0,
      message: "ok",
      data: {
        action: "export_readiness_checked",
        organizationPublicId: "org_city_public_123",
        scopeOrganizationCount: 2,
        dateRange: {
          startAt: "2026-06-10T00:00:00Z",
          endAt: "2026-06-12T23:59:59Z",
        },
        referencePublicId: "audit_reference_public_123",
        summaryRowCount: 2,
        redactionStatus: "redacted_reference",
        persistenceStatus: "not_written",
        recordedAt: "2026-06-16T09:05:00Z",
      },
    });
    expect(serializedResult).not.toMatch(/"id":/);
    expect(serializedResult).not.toContain("scopeOrganizationPublicIds");
    expect(serializedResult).not.toContain("org_district_public_456");
    expect(serializedResult).not.toContain(command.guardedMarkerOne);
    expect(serializedResult).not.toContain(command.guardedMarkerTwo);
    expect(serializedResult).not.toContain(command.guardedMarkerThree);
    expect(serializedResult).not.toContain(command.guardedMarkerFour);
    expect(serializedResult).not.toContain(command.guardedMarkerFive);
    expect(serializedResult).not.toContain(command.guardedMarkerSix);
    expect(serializedResult).not.toContain(command.guardedMarkerSeven);
    expect(serializedResult).not.toContain(command.guardedMarkerEight);
  });

  it("rejects audit log references when organization analytics access is not available", () => {
    expect(
      buildOrganizationAnalyticsAuditLogRedactedReference({
        ...createValidAuditLogReferenceCommand(),
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
      buildOrganizationAnalyticsAuditLogRedactedReference({
        ...createValidAuditLogReferenceCommand(),
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
