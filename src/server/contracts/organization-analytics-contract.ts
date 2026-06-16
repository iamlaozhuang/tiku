import { createSuccessResponse, type ApiResponse } from "./api-response";

export type OrganizationAnalyticsDateRangeDto = {
  startAt: string;
  endAt: string;
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
  redactionStatus: "summary_only";
};

export type OrganizationAnalyticsEmployeeStatisticsSummaryDto = {
  organizationPublicId: string;
  scopeOrganizationPublicIds: string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  employeeCount: number;
  employees: OrganizationAnalyticsEmployeeTrainingSummaryDto[];
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
  redactionStatus: "aggregate_only";
  updatedAt: string;
};

export type OrganizationAnalyticsDashboardRouteDto = Omit<
  OrganizationAnalyticsDashboardSummaryDto,
  "scopeOrganizationPublicIds"
>;

export type OrganizationAnalyticsDashboardRouteResponse =
  ApiResponse<OrganizationAnalyticsDashboardRouteDto | null>;

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
      redactionStatus: data.redactionStatus,
      updatedAt: data.updatedAt,
    },
    message,
  );
}

export function createOrganizationAnalyticsEmployeeStatisticsRouteResponse(
  data: OrganizationAnalyticsEmployeeStatisticsSummaryDto | null,
  message = "ok",
): OrganizationAnalyticsEmployeeStatisticsRouteResponse {
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
        redactionStatus: employee.redactionStatus,
      })),
      redactionStatus: data.redactionStatus,
      updatedAt: data.updatedAt,
    },
    message,
  );
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
