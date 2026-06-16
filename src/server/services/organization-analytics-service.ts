import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OrganizationAnalyticsDashboardSummaryDto,
  OrganizationAnalyticsDateRangeDto,
  OrganizationAnalyticsEmployeeStatisticsSummaryDto,
  OrganizationAnalyticsExportReadinessSummaryDto,
  OrganizationAnalyticsExportScope,
} from "../contracts/organization-analytics-contract";
import {
  createOrganizationAnalyticsEmployeeTrainingSummary,
  createOrganizationAnalyticsExportReadinessAssessment,
  createOrganizationTrainingAggregateMetrics,
  type OrganizationAnalyticsEmployeeTrainingSummaryInput,
  type OrganizationAnalyticsExportReadinessInput,
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

type OrganizationAnalyticsSummaryAccessCommand = {
  adminContext: OrganizationAnalyticsAdminContext;
  organizationPublicId: string;
  scopeOrganizationPublicIds: readonly string[];
};

export type BuildOrganizationAnalyticsDashboardSummaryCommand =
  OrganizationAnalyticsSummaryAccessCommand & {
    dateRange: OrganizationAnalyticsDateRangeDto;
    trainingMetricsInput: Omit<
      OrganizationTrainingAggregateMetricsInput,
      "dateRange"
    >;
    updatedAt: string;
  };

export type BuildOrganizationAnalyticsEmployeeStatisticsSummaryCommand =
  OrganizationAnalyticsSummaryAccessCommand & {
    dateRange: OrganizationAnalyticsDateRangeDto;
    employeeTrainingSummaryInputs: readonly Omit<
      OrganizationAnalyticsEmployeeTrainingSummaryInput,
      "dateRange"
    >[];
    updatedAt: string;
  };

export type BuildOrganizationAnalyticsExportReadinessSummaryCommand =
  OrganizationAnalyticsSummaryAccessCommand & {
    dateRange: OrganizationAnalyticsDateRangeDto;
    exportScope: OrganizationAnalyticsExportScope;
    summaryRows: OrganizationAnalyticsExportReadinessInput["summaryRows"];
    objectStorageAvailable: boolean;
    externalDeliveryAvailable: boolean;
    updatedAt: string;
  };

function canViewOrganizationAnalyticsSummary(
  command: OrganizationAnalyticsSummaryAccessCommand,
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

export function buildOrganizationAnalyticsExportReadinessSummary(
  command: BuildOrganizationAnalyticsExportReadinessSummaryCommand,
): ApiResponse<OrganizationAnalyticsExportReadinessSummaryDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createErrorResponse(
      ORGANIZATION_ANALYTICS_ACCESS_DENIED_CODE,
      ORGANIZATION_ANALYTICS_ACCESS_DENIED_MESSAGE,
    );
  }

  const readinessAssessment =
    createOrganizationAnalyticsExportReadinessAssessment({
      exportScope: command.exportScope,
      summaryRows: command.summaryRows,
      objectStorageAvailable: command.objectStorageAvailable,
      externalDeliveryAvailable: command.externalDeliveryAvailable,
    });

  return createSuccessResponse({
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds: [...command.scopeOrganizationPublicIds],
    dateRange: command.dateRange,
    ...readinessAssessment,
    updatedAt: command.updatedAt,
  });
}

export function buildOrganizationAnalyticsEmployeeStatisticsSummary(
  command: BuildOrganizationAnalyticsEmployeeStatisticsSummaryCommand,
): ApiResponse<OrganizationAnalyticsEmployeeStatisticsSummaryDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createErrorResponse(
      ORGANIZATION_ANALYTICS_ACCESS_DENIED_CODE,
      ORGANIZATION_ANALYTICS_ACCESS_DENIED_MESSAGE,
    );
  }

  const employees = command.employeeTrainingSummaryInputs.map((employeeInput) =>
    createOrganizationAnalyticsEmployeeTrainingSummary({
      ...employeeInput,
      dateRange: command.dateRange,
    }),
  );

  return createSuccessResponse({
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds: [...command.scopeOrganizationPublicIds],
    dateRange: command.dateRange,
    employeeCount: employees.length,
    employees,
    redactionStatus: "summary_only",
    updatedAt: command.updatedAt,
  });
}
