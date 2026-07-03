import { describe, expect, it } from "vitest";

import {
  createOrganizationAnalyticsAuditLogRedactedReference,
  createOrganizationAnalyticsEmployeeTrainingSummary,
  createOrganizationAnalyticsExportReadinessAssessment,
  createOrganizationAnalyticsKnowledgeWeakPointSummary,
  createOrganizationTrainingAggregateMetrics,
  rankOrganizationTrainingEmployeeSummaries,
  selectHistoricalOrganizationTrainingVersionPublicIds,
} from "./organization-analytics";

describe("organization analytics aggregate metrics", () => {
  it("calculates completion, score, and submitted trend from official submissions", () => {
    const metrics = createOrganizationTrainingAggregateMetrics({
      eligibleEmployeePublicIds: [
        "employee_public_a",
        "employee_public_b",
        "employee_public_c",
      ],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_a",
          score: 82,
          totalScore: 100,
          submittedAt: "2026-06-10T09:30:00Z",
        },
        {
          employeePublicId: "employee_public_b",
          score: 91,
          totalScore: 100,
          submittedAt: "2026-06-10T11:00:00Z",
        },
        {
          employeePublicId: "employee_public_c",
          score: 77,
          totalScore: 100,
          submittedAt: "2026-06-13T08:00:00Z",
        },
      ],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });

    expect(metrics).toEqual({
      eligibleEmployeeCount: 3,
      submittedEmployeeCount: 2,
      unfinishedEmployeeCount: 1,
      completionRate: 2 / 3,
      averageScore: 86.5,
      maxScore: 91,
      minScore: 82,
      submittedTrend: [{ date: "2026-06-10", submittedCount: 2 }],
    });
  });

  it("ignores official submissions from employees outside the eligible organization scope", () => {
    const metrics = createOrganizationTrainingAggregateMetrics({
      eligibleEmployeePublicIds: ["employee_public_a", "employee_public_b"],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_a",
          score: 86,
          totalScore: 100,
          submittedAt: "2026-06-10T09:30:00Z",
        },
        {
          employeePublicId: "employee_public_outside_scope",
          score: 100,
          totalScore: 100,
          submittedAt: "2026-06-10T10:30:00Z",
        },
      ],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });

    expect(metrics).toEqual({
      eligibleEmployeeCount: 2,
      submittedEmployeeCount: 1,
      unfinishedEmployeeCount: 1,
      completionRate: 0.5,
      averageScore: 86,
      maxScore: 86,
      minScore: 86,
      submittedTrend: [{ date: "2026-06-10", submittedCount: 1 }],
    });
  });

  it("returns zero completion and null score summaries for empty inputs", () => {
    const metrics = createOrganizationTrainingAggregateMetrics({
      eligibleEmployeePublicIds: [],
      officialSubmissions: [],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });

    expect(metrics).toEqual({
      eligibleEmployeeCount: 0,
      submittedEmployeeCount: 0,
      unfinishedEmployeeCount: 0,
      completionRate: 0,
      averageScore: null,
      maxScore: null,
      minScore: null,
      submittedTrend: [],
    });
  });

  it("keeps taken_down versions in historical aggregate selection", () => {
    expect(
      selectHistoricalOrganizationTrainingVersionPublicIds([
        {
          trainingVersionPublicId: "training_version_public_published",
          status: "published",
        },
        {
          trainingVersionPublicId: "training_version_public_taken_down",
          status: "taken_down",
        },
      ]),
    ).toEqual([
      "training_version_public_published",
      "training_version_public_taken_down",
    ]);
  });

  it("sorts employee training rankings by score, completion, and earliest latest submission", () => {
    const rankedRows = rankOrganizationTrainingEmployeeSummaries([
      {
        employeePublicId: "employee_public_lower_completion",
        trainingAverageScore: 90,
        trainingCompletionRate: 0.5,
        latestTrainingSubmittedAt: "2026-06-11T08:00:00Z",
      },
      {
        employeePublicId: "employee_public_later_submission",
        trainingAverageScore: 90,
        trainingCompletionRate: 0.8,
        latestTrainingSubmittedAt: "2026-06-11T09:00:00Z",
      },
      {
        employeePublicId: "employee_public_first",
        trainingAverageScore: 90,
        trainingCompletionRate: 0.8,
        latestTrainingSubmittedAt: "2026-06-10T09:00:00Z",
      },
      {
        employeePublicId: "employee_public_null_score",
        trainingAverageScore: null,
        trainingCompletionRate: 1,
        latestTrainingSubmittedAt: null,
      },
    ]);

    expect(rankedRows.map((row) => row.employeePublicId)).toEqual([
      "employee_public_first",
      "employee_public_later_submission",
      "employee_public_lower_completion",
      "employee_public_null_score",
    ]);
  });

  it("calculates privacy-preserving employee training statistics", () => {
    const guardedMarkerOne = ["guarded", "employee", "marker", "one"].join("-");
    const guardedMarkerTwo = ["guarded", "employee", "marker", "two"].join("-");
    const officialSubmission = {
      id: 501,
      employeePublicId: "employee_public_a",
      trainingVersionPublicId: "training_version_public_alpha",
      score: 92,
      totalScore: 100,
      submittedAt: "2026-06-11T09:30:00Z",
      answerOrganizationSnapshot: {
        organizationPublicId: "org_district_public_456",
        organizationName: "District One",
        capturedAt: "2026-06-11T09:30:00Z",
      },
      guardedMarkerOne,
      guardedMarkerTwo,
    };

    const summary = createOrganizationAnalyticsEmployeeTrainingSummary({
      employeePublicId: "employee_public_a",
      employeeDisplayName: "Employee A",
      organizationPublicId: "org_city_public_123",
      organizationName: "City Org",
      visibleTrainingVersionPublicIds: [
        "training_version_public_alpha",
        "training_version_public_beta",
      ],
      weakPointLabels: [" 客户异议处理 ", "客户异议处理", ""],
      officialSubmissions: [
        officialSubmission,
        {
          ...officialSubmission,
          trainingVersionPublicId: "training_version_public_out_of_range",
          score: 75,
          submittedAt: "2026-06-14T09:30:00Z",
        },
      ],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });
    const serializedSummary = JSON.stringify(summary);

    expect(summary).toEqual({
      employeePublicId: "employee_public_a",
      employeeDisplayName: "Employee A",
      organizationPublicId: "org_city_public_123",
      organizationName: "City Org",
      answerOrganizationSnapshot: {
        organizationPublicId: "org_district_public_456",
        organizationName: "District One",
        capturedAt: "2026-06-11T09:30:00Z",
      },
      visibleTrainingCount: 2,
      submittedTrainingCount: 1,
      unfinishedTrainingCount: 1,
      trainingCompletionRate: 0.5,
      trainingAverageScore: 92,
      latestTrainingSubmittedAt: "2026-06-11T09:30:00Z",
      weakPointSummary: {
        sourceDomain: "organization_training",
        knowledgeNodeLabels: ["客户异议处理"],
        redactionStatus: "summary_only",
      },
      redactionStatus: "summary_only",
    });
    expect(serializedSummary).not.toMatch(/"id":/);
    expect(serializedSummary).not.toContain(guardedMarkerOne);
    expect(serializedSummary).not.toContain(guardedMarkerTwo);
  });

  it("uses the latest submission per visible training version for employee score summaries", () => {
    const summary = createOrganizationAnalyticsEmployeeTrainingSummary({
      employeePublicId: "employee_public_a",
      employeeDisplayName: "Employee A",
      organizationPublicId: "org_city_public_123",
      organizationName: "City Org",
      visibleTrainingVersionPublicIds: [
        "training_version_public_alpha",
        "training_version_public_beta",
      ],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_a",
          trainingVersionPublicId: "training_version_public_alpha",
          score: 80,
          totalScore: 100,
          submittedAt: "2026-06-10T09:30:00Z",
          answerOrganizationSnapshot: {
            organizationPublicId: "org_city_public_123",
            organizationName: "City Org",
            capturedAt: "2026-06-10T09:30:00Z",
          },
        },
        {
          employeePublicId: "employee_public_a",
          trainingVersionPublicId: "training_version_public_alpha",
          score: 92,
          totalScore: 100,
          submittedAt: "2026-06-11T09:30:00Z",
          answerOrganizationSnapshot: {
            organizationPublicId: "org_district_public_456",
            organizationName: "District One",
            capturedAt: "2026-06-11T09:30:00Z",
          },
        },
        {
          employeePublicId: "employee_public_a",
          trainingVersionPublicId: "training_version_public_beta",
          score: 88,
          totalScore: 100,
          submittedAt: "2026-06-10T10:30:00Z",
          answerOrganizationSnapshot: {
            organizationPublicId: "org_city_public_123",
            organizationName: "City Org",
            capturedAt: "2026-06-10T10:30:00Z",
          },
        },
      ],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });

    expect(summary).toMatchObject({
      visibleTrainingCount: 2,
      submittedTrainingCount: 2,
      unfinishedTrainingCount: 0,
      trainingCompletionRate: 1,
      trainingAverageScore: 90,
      latestTrainingSubmittedAt: "2026-06-11T09:30:00Z",
      weakPointSummary: {
        sourceDomain: "organization_training",
        knowledgeNodeLabels: [],
        redactionStatus: "summary_only",
      },
      answerOrganizationSnapshot: {
        organizationPublicId: "org_district_public_456",
        organizationName: "District One",
        capturedAt: "2026-06-11T09:30:00Z",
      },
    });
  });

  it("returns zero employee completion and null score summaries when no training is visible", () => {
    expect(
      createOrganizationAnalyticsEmployeeTrainingSummary({
        employeePublicId: "employee_public_empty",
        employeeDisplayName: "Employee Empty",
        organizationPublicId: "org_city_public_123",
        organizationName: "City Org",
        visibleTrainingVersionPublicIds: [],
        officialSubmissions: [],
        dateRange: {
          startAt: "2026-06-10T00:00:00Z",
          endAt: "2026-06-12T23:59:59Z",
        },
      }),
    ).toEqual({
      employeePublicId: "employee_public_empty",
      employeeDisplayName: "Employee Empty",
      organizationPublicId: "org_city_public_123",
      organizationName: "City Org",
      answerOrganizationSnapshot: null,
      visibleTrainingCount: 0,
      submittedTrainingCount: 0,
      unfinishedTrainingCount: 0,
      trainingCompletionRate: 0,
      trainingAverageScore: null,
      latestTrainingSubmittedAt: null,
      weakPointSummary: {
        sourceDomain: "organization_training",
        knowledgeNodeLabels: [],
        redactionStatus: "summary_only",
      },
      redactionStatus: "summary_only",
    });
  });

  it("creates low-sample knowledge weak-point summaries without detail payloads", () => {
    const guardedInput = {
      sampleSize: 4.8,
      trainingWeakPoints: [
        {
          sourceDomain: "organization_training",
          knowledgeNodeLabel: " 客户异议处理 ",
          affectedEmployeeCount: 3.6,
          affectedEmployeePercent: 1.2,
          guardedMarker: "hidden weak point detail",
        },
        {
          sourceDomain: "organization_training",
          knowledgeNodeLabel: " ",
          affectedEmployeeCount: 1,
          affectedEmployeePercent: 0.25,
        },
      ],
      formalLearningWeakPoints: [
        {
          sourceDomain: "formal_learning",
          knowledgeNodeLabel: "案例分析",
          affectedEmployeeCount: 2,
          affectedEmployeePercent: 0.5,
        },
      ],
    } as const;
    const summary =
      createOrganizationAnalyticsKnowledgeWeakPointSummary(guardedInput);

    expect(summary).toEqual({
      sampleSize: 4,
      lowConfidence: true,
      trainingWeakPoints: [
        {
          sourceDomain: "organization_training",
          knowledgeNodeLabel: "客户异议处理",
          affectedEmployeeCount: 3,
          affectedEmployeePercent: 1,
          confidenceStatus: "low_sample",
          redactionStatus: "summary_only",
        },
      ],
      formalLearningWeakPoints: [
        {
          sourceDomain: "formal_learning",
          knowledgeNodeLabel: "案例分析",
          affectedEmployeeCount: 2,
          affectedEmployeePercent: 0.5,
          confidenceStatus: "low_sample",
          redactionStatus: "summary_only",
        },
      ],
      redactionStatus: "summary_only",
    });
    expect(JSON.stringify(summary)).not.toContain("hidden weak point detail");
  });

  it("marks export readiness as blocked without object storage or external delivery", () => {
    const guardedMarkerOne = ["guarded", "export", "marker", "one"].join("-");
    const guardedMarkerTwo = ["guarded", "export", "marker", "two"].join("-");
    const summaryRows = [
      {
        sourceRowId: 701,
        rowPublicId: "employee_public_a",
        redactionStatus: "summary_only" as const,
        guardedMarkerOne,
      },
      {
        sourceRowId: 702,
        rowPublicId: "org_city_public_123",
        redactionStatus: "aggregate_only" as const,
        guardedMarkerTwo,
      },
    ];

    const assessment = createOrganizationAnalyticsExportReadinessAssessment({
      exportScope: "employee_statistics_summary",
      summaryRows,
      objectStorageAvailable: false,
      externalDeliveryAvailable: false,
    });
    const serializedAssessment = JSON.stringify(assessment);

    expect(assessment).toEqual({
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
    });
    expect(serializedAssessment).not.toMatch(/"id":/);
    expect(serializedAssessment).not.toContain("sourceRowId");
    expect(serializedAssessment).not.toContain("employee_public_a");
    expect(serializedAssessment).not.toContain("org_city_public_123");
    expect(serializedAssessment).not.toContain(guardedMarkerOne);
    expect(serializedAssessment).not.toContain(guardedMarkerTwo);
  });

  it("blocks export readiness for non-summary detail rows", () => {
    expect(
      createOrganizationAnalyticsExportReadinessAssessment({
        exportScope: "dashboard_summary",
        summaryRows: [
          {
            rowPublicId: "detail_row_public_a",
            redactionStatus: "detail_only",
          },
        ],
        objectStorageAvailable: true,
        externalDeliveryAvailable: true,
      }),
    ).toMatchObject({
      readinessStatus: "blocked",
      summaryRowCount: 1,
      blockedReasons: ["non_summary_detail_detected"],
      generatedFile: null,
      downloadUrl: null,
      externalDelivery: null,
    });
  });

  it("blocks export readiness when configured rows still carry internal source identifiers", () => {
    expect(
      createOrganizationAnalyticsExportReadinessAssessment({
        exportScope: "employee_statistics_summary",
        summaryRows: [
          {
            sourceRowId: 701,
            redactionStatus: "summary_only",
          },
        ],
        objectStorageAvailable: true,
        externalDeliveryAvailable: true,
      }),
    ).toEqual({
      exportScope: "employee_statistics_summary",
      readinessStatus: "blocked",
      summaryRowCount: 1,
      blockedReasons: ["non_summary_detail_detected"],
      objectStorageStatus: "configured",
      externalDeliveryStatus: "configured",
      generatedFile: null,
      downloadUrl: null,
      externalDelivery: null,
      redactionStatus: "summary_only",
    });
  });

  it("creates an audit log redacted reference without scope lists or source rows", () => {
    const guardedMarkerOne = ["guarded", "audit", "marker", "one"].join("-");
    const guardedMarkerTwo = ["guarded", "audit", "marker", "two"].join("-");
    const rawAuditLogReferenceInput = {
      action: "export_readiness_checked" as const,
      organizationPublicId: "org_city_public_123",
      scopeOrganizationPublicIds: [
        "org_city_public_123",
        "org_district_public_456",
      ],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
      referencePublicId: "audit_reference_public_123",
      summaryRowCount: 2,
      recordedAt: "2026-06-16T09:05:00Z",
      sourceRowId: 901,
      guardedMarkerOne,
      guardedMarkerTwo,
    };

    const reference = createOrganizationAnalyticsAuditLogRedactedReference(
      rawAuditLogReferenceInput,
    );
    const serializedReference = JSON.stringify(reference);

    expect(reference).toEqual({
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
    });
    expect(serializedReference).not.toMatch(/"id":/);
    expect(serializedReference).not.toContain("scopeOrganizationPublicIds");
    expect(serializedReference).not.toContain("sourceRowId");
    expect(serializedReference).not.toContain("org_district_public_456");
    expect(serializedReference).not.toContain(guardedMarkerOne);
    expect(serializedReference).not.toContain(guardedMarkerTwo);
  });
});
