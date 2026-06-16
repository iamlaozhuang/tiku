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

export type OrganizationAnalyticsDashboardSummaryDto = {
  organizationPublicId: string;
  scopeOrganizationPublicIds: string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  trainingSummary: OrganizationTrainingAggregateMetricsDto;
  redactionStatus: "aggregate_only";
  updatedAt: string;
};
