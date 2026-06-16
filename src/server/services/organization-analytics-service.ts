import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OrganizationAnalyticsDashboardSummaryDto,
  OrganizationAnalyticsDateRangeDto,
} from "../contracts/organization-analytics-contract";
import {
  createOrganizationTrainingAggregateMetrics,
  type OrganizationTrainingAggregateMetricsInput,
} from "../models/organization-analytics";

const ORGANIZATION_ANALYTICS_ACCESS_DENIED_CODE = 403185;
const ORGANIZATION_ANALYTICS_ACCESS_DENIED_MESSAGE =
  "Organization analytics summary access denied.";

export type OrganizationAnalyticsAdminContext = {
  effectiveEdition: "advanced" | "standard";
  authorizationSource: "org_auth" | "personal_auth";
  canViewOrganizationTrainingSummary: boolean;
  organizationPublicId: string;
};

export type BuildOrganizationAnalyticsDashboardSummaryCommand = {
  adminContext: OrganizationAnalyticsAdminContext;
  organizationPublicId: string;
  scopeOrganizationPublicIds: readonly string[];
  dateRange: OrganizationAnalyticsDateRangeDto;
  trainingMetricsInput: Omit<
    OrganizationTrainingAggregateMetricsInput,
    "dateRange"
  >;
  updatedAt: string;
};

function canViewOrganizationAnalyticsSummary(
  command: BuildOrganizationAnalyticsDashboardSummaryCommand,
) {
  return (
    command.adminContext.effectiveEdition === "advanced" &&
    command.adminContext.authorizationSource === "org_auth" &&
    command.adminContext.canViewOrganizationTrainingSummary === true &&
    command.adminContext.organizationPublicId ===
      command.organizationPublicId &&
    command.scopeOrganizationPublicIds.includes(command.organizationPublicId)
  );
}

export function buildOrganizationAnalyticsDashboardSummary(
  command: BuildOrganizationAnalyticsDashboardSummaryCommand,
): ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createErrorResponse(
      ORGANIZATION_ANALYTICS_ACCESS_DENIED_CODE,
      ORGANIZATION_ANALYTICS_ACCESS_DENIED_MESSAGE,
    );
  }

  return createSuccessResponse({
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds: [...command.scopeOrganizationPublicIds],
    dateRange: command.dateRange,
    trainingSummary: createOrganizationTrainingAggregateMetrics({
      ...command.trainingMetricsInput,
      dateRange: command.dateRange,
    }),
    redactionStatus: "aggregate_only",
    updatedAt: command.updatedAt,
  });
}
