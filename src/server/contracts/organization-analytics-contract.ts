import {
  createPaginatedResponse,
  createSuccessResponse,
  type ApiPagination,
  type ApiResponse,
} from "./api-response";

export type OrganizationAnalyticsDateRangeDto = {
  startAt: string;
  endAt: string;
};

export type OrganizationAnalyticsEmployeeStatisticsPaginationInput = {
  page: number;
  pageSize: 20 | 50 | 100;
};

export type OrganizationAnalyticsSubmittedTrendPointDto = {
  date: string;
  submittedCount: number;
};

export type OrganizationTrainingAggregateMetricsDto = {
  eligibleEmployeeCount: number;
  submittedEmployeeCount: number;
  unfinishedEmployeeCount: number;
  completionRate: number;
  averageScore: number | null;
  maxScore: number | null;
  minScore: number | null;
  submittedTrend: OrganizationAnalyticsSubmittedTrendPointDto[];
};

export type OrganizationAnalyticsFormalLearningSummaryDto = {
  formalPracticeCount: number;
  formalMockExamCount: number;
  formalExamReportCount: number;
  formalMistakeBookCount: number;
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsWeakPointSourceDomain =
  | "organization_training"
  | "formal_learning";

export type OrganizationAnalyticsWeakPointConfidenceStatus =
  | "normal"
  | "low_sample";

export type OrganizationAnalyticsWeakPointItemDto = {
  sourceDomain: OrganizationAnalyticsWeakPointSourceDomain;
  knowledgeNodeLabel: string;
  affectedEmployeeCount: number;
  affectedEmployeePercent: number;
  confidenceStatus: OrganizationAnalyticsWeakPointConfidenceStatus;
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsKnowledgeWeakPointSummaryDto = {
  sampleSize: number;
  lowConfidence: boolean;
  trainingWeakPoints: OrganizationAnalyticsWeakPointItemDto[];
  formalLearningWeakPoints: OrganizationAnalyticsWeakPointItemDto[];
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsEmployeeWeakPointSummaryDto = {
  sourceDomain: "organization_training";
  knowledgeNodeLabels: string[];
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsRedactedStatisticsBoundaryDto = {
  visibilityScope: "organization_admin_own_scope";
  trainingStatisticsPolicy: "summary_counts_score_time_only";
  employeeStatisticsPolicy: "status_score_time_only";
  rawEmployeeAnswerPolicy: "blocked";
  rawAiGeneratedContentPolicy: "blocked";
  promptProviderPayloadPolicy: "blocked";
  exportPolicy: "blocked_requires_fresh_approval";
  crossOrganizationAnalyticsPolicy: "blocked";
  redactionStatus: "redacted_boundary";
};

export type OrganizationAnalyticsAnswerOrganizationSnapshotDto = {
  organizationPublicId: string;
  organizationName: string;
  capturedAt: string;
};

export type OrganizationAnalyticsEmployeeTrainingSummaryDto = {
  employeePublicId: string;
  employeeDisplayName: string;
  organizationPublicId: string;
  organizationName: string;
  answerOrganizationSnapshot: OrganizationAnalyticsAnswerOrganizationSnapshotDto | null;
  visibleTrainingCount: number;
  submittedTrainingCount: number;
  unfinishedTrainingCount: number;
  trainingCompletionRate: number;
  trainingAverageScore: number | null;
  latestTrainingSubmittedAt: string | null;
  weakPointSummary: OrganizationAnalyticsEmployeeWeakPointSummaryDto;
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsEmployeeStatisticsSummaryDto = {
  organizationPublicId: string;
  scopeOrganizationPublicIds: string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  employeeCount: number;
  employees: OrganizationAnalyticsEmployeeTrainingSummaryDto[];
  redactedStatisticsBoundary: OrganizationAnalyticsRedactedStatisticsBoundaryDto;
  redactionStatus: "summary_only";
  updatedAt: string;
};

export type OrganizationAnalyticsEmployeeStatisticsRouteDto = Omit<
  OrganizationAnalyticsEmployeeStatisticsSummaryDto,
  "scopeOrganizationPublicIds"
>;

export type OrganizationAnalyticsEmployeeStatisticsRouteResponse =
  ApiResponse<OrganizationAnalyticsEmployeeStatisticsRouteDto | null>;

export type OrganizationAnalyticsExportScope =
  | "dashboard_summary"
  | "employee_statistics_summary";

export type OrganizationAnalyticsExportReadinessStatus = "ready" | "blocked";

export type OrganizationAnalyticsExportReadinessBlockedReason =
  | "object_storage_not_configured"
  | "external_delivery_not_configured"
  | "non_summary_detail_detected"
  | "no_summary_rows";

export type OrganizationAnalyticsExportDependencyStatus =
  | "configured"
  | "not_configured";

export type OrganizationAnalyticsExportReadinessAssessmentDto = {
  exportScope: OrganizationAnalyticsExportScope;
  readinessStatus: OrganizationAnalyticsExportReadinessStatus;
  summaryRowCount: number;
  blockedReasons: OrganizationAnalyticsExportReadinessBlockedReason[];
  objectStorageStatus: OrganizationAnalyticsExportDependencyStatus;
  externalDeliveryStatus: OrganizationAnalyticsExportDependencyStatus;
  generatedFile: null;
  downloadUrl: null;
  externalDelivery: null;
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsExportReadinessSummaryDto =
  OrganizationAnalyticsExportReadinessAssessmentDto & {
    organizationPublicId: string;
    scopeOrganizationPublicIds: string[];
    dateRange: OrganizationAnalyticsDateRangeDto;
    updatedAt: string;
  };

export type OrganizationAnalyticsExportReadinessRouteDto = Omit<
  OrganizationAnalyticsExportReadinessSummaryDto,
  "scopeOrganizationPublicIds"
>;

export type OrganizationAnalyticsExportReadinessRouteResponse =
  ApiResponse<OrganizationAnalyticsExportReadinessRouteDto | null>;

export type OrganizationAnalyticsAuditLogReferenceAction =
  | "dashboard_summary_viewed"
  | "employee_statistics_summary_viewed"
  | "export_readiness_checked";

export type OrganizationAnalyticsAuditLogReferenceDto = {
  action: OrganizationAnalyticsAuditLogReferenceAction;
  organizationPublicId: string;
  scopeOrganizationCount: number;
  dateRange: OrganizationAnalyticsDateRangeDto;
  referencePublicId: string;
  summaryRowCount: number;
  redactionStatus: "redacted_reference";
  persistenceStatus: "not_written";
  recordedAt: string;
};

export type OrganizationAnalyticsDashboardSummaryDto = {
  organizationPublicId: string;
  scopeOrganizationPublicIds: string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  trainingSummary: OrganizationTrainingAggregateMetricsDto;
  formalLearningSummary: OrganizationAnalyticsFormalLearningSummaryDto | null;
  knowledgeWeakPointSummary: OrganizationAnalyticsKnowledgeWeakPointSummaryDto;
  redactedStatisticsBoundary: OrganizationAnalyticsRedactedStatisticsBoundaryDto;
  redactionStatus: "aggregate_only";
  updatedAt: string;
};

export type OrganizationAnalyticsDashboardRouteDto = Omit<
  OrganizationAnalyticsDashboardSummaryDto,
  "scopeOrganizationPublicIds"
>;

export type OrganizationAnalyticsDashboardRouteResponse =
  ApiResponse<OrganizationAnalyticsDashboardRouteDto | null>;

function createFormalLearningSummaryRouteDto(
  summary: OrganizationAnalyticsFormalLearningSummaryDto | null,
): OrganizationAnalyticsFormalLearningSummaryDto | null {
  if (summary === null) {
    return null;
  }

  return {
    formalPracticeCount: summary.formalPracticeCount,
    formalMockExamCount: summary.formalMockExamCount,
    formalExamReportCount: summary.formalExamReportCount,
    formalMistakeBookCount: summary.formalMistakeBookCount,
    redactionStatus: summary.redactionStatus,
  };
}

function createWeakPointItemRouteDto(
  item: OrganizationAnalyticsWeakPointItemDto,
): OrganizationAnalyticsWeakPointItemDto {
  return {
    sourceDomain: item.sourceDomain,
    knowledgeNodeLabel: item.knowledgeNodeLabel,
    affectedEmployeeCount: item.affectedEmployeeCount,
    affectedEmployeePercent: item.affectedEmployeePercent,
    confidenceStatus: item.confidenceStatus,
    redactionStatus: item.redactionStatus,
  };
}

function createKnowledgeWeakPointSummaryRouteDto(
  summary: OrganizationAnalyticsKnowledgeWeakPointSummaryDto,
): OrganizationAnalyticsKnowledgeWeakPointSummaryDto {
  return {
    sampleSize: summary.sampleSize,
    lowConfidence: summary.lowConfidence,
    trainingWeakPoints: summary.trainingWeakPoints.map(
      createWeakPointItemRouteDto,
    ),
    formalLearningWeakPoints: summary.formalLearningWeakPoints.map(
      createWeakPointItemRouteDto,
    ),
    redactionStatus: summary.redactionStatus,
  };
}

export function createOrganizationAnalyticsRedactedStatisticsBoundary(): OrganizationAnalyticsRedactedStatisticsBoundaryDto {
  return {
    visibilityScope: "organization_admin_own_scope",
    trainingStatisticsPolicy: "summary_counts_score_time_only",
    employeeStatisticsPolicy: "status_score_time_only",
    rawEmployeeAnswerPolicy: "blocked",
    rawAiGeneratedContentPolicy: "blocked",
    promptProviderPayloadPolicy: "blocked",
    exportPolicy: "blocked_requires_fresh_approval",
    crossOrganizationAnalyticsPolicy: "blocked",
    redactionStatus: "redacted_boundary",
  };
}

function createOrganizationAnalyticsRedactedStatisticsBoundaryRouteDto(
  boundary: OrganizationAnalyticsRedactedStatisticsBoundaryDto,
): OrganizationAnalyticsRedactedStatisticsBoundaryDto {
  return {
    visibilityScope: boundary.visibilityScope,
    trainingStatisticsPolicy: boundary.trainingStatisticsPolicy,
    employeeStatisticsPolicy: boundary.employeeStatisticsPolicy,
    rawEmployeeAnswerPolicy: boundary.rawEmployeeAnswerPolicy,
    rawAiGeneratedContentPolicy: boundary.rawAiGeneratedContentPolicy,
    promptProviderPayloadPolicy: boundary.promptProviderPayloadPolicy,
    exportPolicy: boundary.exportPolicy,
    crossOrganizationAnalyticsPolicy: boundary.crossOrganizationAnalyticsPolicy,
    redactionStatus: boundary.redactionStatus,
  };
}

export function createOrganizationAnalyticsDashboardRouteResponse(
  data: OrganizationAnalyticsDashboardSummaryDto | null,
  message = "ok",
): OrganizationAnalyticsDashboardRouteResponse {
  if (data === null) {
    return createSuccessResponse(null, message);
  }

  return createSuccessResponse(
    {
      organizationPublicId: data.organizationPublicId,
      dateRange: {
        startAt: data.dateRange.startAt,
        endAt: data.dateRange.endAt,
      },
      trainingSummary: {
        eligibleEmployeeCount: data.trainingSummary.eligibleEmployeeCount,
        submittedEmployeeCount: data.trainingSummary.submittedEmployeeCount,
        unfinishedEmployeeCount: data.trainingSummary.unfinishedEmployeeCount,
        completionRate: data.trainingSummary.completionRate,
        averageScore: data.trainingSummary.averageScore,
        maxScore: data.trainingSummary.maxScore,
        minScore: data.trainingSummary.minScore,
        submittedTrend: data.trainingSummary.submittedTrend.map(
          (trendPoint) => ({
            date: trendPoint.date,
            submittedCount: trendPoint.submittedCount,
          }),
        ),
      },
      formalLearningSummary: createFormalLearningSummaryRouteDto(
        data.formalLearningSummary,
      ),
      knowledgeWeakPointSummary: createKnowledgeWeakPointSummaryRouteDto(
        data.knowledgeWeakPointSummary,
      ),
      redactedStatisticsBoundary:
        createOrganizationAnalyticsRedactedStatisticsBoundaryRouteDto(
          data.redactedStatisticsBoundary,
        ),
      redactionStatus: data.redactionStatus,
      updatedAt: data.updatedAt,
    },
    message,
  );
}

export function createOrganizationAnalyticsEmployeeStatisticsRouteResponse(
  data: OrganizationAnalyticsEmployeeStatisticsSummaryDto | null,
  message = "ok",
  pagination?: ApiPagination,
): OrganizationAnalyticsEmployeeStatisticsRouteResponse {
  if (data === null) {
    return createSuccessResponse(null, message);
  }

  const routeData: OrganizationAnalyticsEmployeeStatisticsRouteDto = {
    organizationPublicId: data.organizationPublicId,
    dateRange: {
      startAt: data.dateRange.startAt,
      endAt: data.dateRange.endAt,
    },
    employeeCount: data.employeeCount,
    employees: data.employees.map((employee) => ({
      employeePublicId: employee.employeePublicId,
      employeeDisplayName: employee.employeeDisplayName,
      organizationPublicId: employee.organizationPublicId,
      organizationName: employee.organizationName,
      answerOrganizationSnapshot:
        employee.answerOrganizationSnapshot === null
          ? null
          : {
              organizationPublicId:
                employee.answerOrganizationSnapshot.organizationPublicId,
              organizationName:
                employee.answerOrganizationSnapshot.organizationName,
              capturedAt: employee.answerOrganizationSnapshot.capturedAt,
            },
      visibleTrainingCount: employee.visibleTrainingCount,
      submittedTrainingCount: employee.submittedTrainingCount,
      unfinishedTrainingCount: employee.unfinishedTrainingCount,
      trainingCompletionRate: employee.trainingCompletionRate,
      trainingAverageScore: employee.trainingAverageScore,
      latestTrainingSubmittedAt: employee.latestTrainingSubmittedAt,
      weakPointSummary: {
        sourceDomain: employee.weakPointSummary.sourceDomain,
        knowledgeNodeLabels: [...employee.weakPointSummary.knowledgeNodeLabels],
        redactionStatus: employee.weakPointSummary.redactionStatus,
      },
      redactionStatus: employee.redactionStatus,
    })),
    redactedStatisticsBoundary:
      createOrganizationAnalyticsRedactedStatisticsBoundaryRouteDto(
        data.redactedStatisticsBoundary,
      ),
    redactionStatus: data.redactionStatus,
    updatedAt: data.updatedAt,
  };

  return pagination === undefined
    ? createSuccessResponse(routeData, message)
    : createPaginatedResponse(routeData, pagination, message);
}

export function createOrganizationAnalyticsExportReadinessRouteResponse(
  data: OrganizationAnalyticsExportReadinessSummaryDto | null,
  message = "ok",
): OrganizationAnalyticsExportReadinessRouteResponse {
  if (data === null) {
    return createSuccessResponse(null, message);
  }

  return createSuccessResponse(
    {
      organizationPublicId: data.organizationPublicId,
      dateRange: {
        startAt: data.dateRange.startAt,
        endAt: data.dateRange.endAt,
      },
      exportScope: data.exportScope,
      readinessStatus: data.readinessStatus,
      summaryRowCount: data.summaryRowCount,
      blockedReasons: [...data.blockedReasons],
      objectStorageStatus: data.objectStorageStatus,
      externalDeliveryStatus: data.externalDeliveryStatus,
      generatedFile: null,
      downloadUrl: null,
      externalDelivery: null,
      redactionStatus: data.redactionStatus,
      updatedAt: data.updatedAt,
    },
    message,
  );
}
