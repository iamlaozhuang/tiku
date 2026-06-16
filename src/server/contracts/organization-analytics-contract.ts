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

export type OrganizationAnalyticsDashboardSummaryDto = {
  organizationPublicId: string;
  scopeOrganizationPublicIds: string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  trainingSummary: OrganizationTrainingAggregateMetricsDto;
  redactionStatus: "aggregate_only";
  updatedAt: string;
};
