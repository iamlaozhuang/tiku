import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type {
  OrganizationAnalyticsAuditLogReferenceAction,
  OrganizationAnalyticsAuditLogReferenceDto,
  OrganizationAnalyticsDashboardSummaryDto,
  OrganizationAnalyticsDateRangeDto,
  OrganizationAnalyticsEmployeeStatisticsSummaryDto,
  OrganizationAnalyticsExportReadinessSummaryDto,
  OrganizationAnalyticsExportScope,
} from "../contracts/organization-analytics-contract";
import {
  createOrganizationAnalyticsAuditLogRedactedReference,
  createOrganizationAnalyticsEmployeeTrainingSummary,
  createOrganizationAnalyticsExportReadinessAssessment,
  createOrganizationTrainingAggregateMetrics,
  type OrganizationAnalyticsAuditLogReferenceInput,
  type OrganizationAnalyticsEmployeeTrainingSummaryInput,
  type OrganizationAnalyticsExportReadinessInput,
  type OrganizationTrainingAggregateMetricsInput,
} from "../models/organization-analytics";
import type { OrganizationAnalyticsRepository } from "../repositories/organization-analytics-repository";

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

export type OrganizationAnalyticsServiceRepository =
  OrganizationAnalyticsRepository;

type BuildOrganizationAnalyticsRepositoryBackedSummaryCommand = {
  adminContext: OrganizationAnalyticsAdminContext;
  adminPublicId: string;
  organizationPublicId: string;
  dateRange: OrganizationAnalyticsDateRangeDto;
  updatedAt: string;
  repository: OrganizationAnalyticsServiceRepository;
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

export type BuildOrganizationAnalyticsAuditLogReferenceCommand =
  OrganizationAnalyticsSummaryAccessCommand & {
    dateRange: OrganizationAnalyticsDateRangeDto;
    action: OrganizationAnalyticsAuditLogReferenceAction;
    referencePublicId: string;
    summaryRowCount: number;
    recordedAt: string;
  };

export type BuildOrganizationAnalyticsDashboardSummaryFromRepositoryCommand =
  BuildOrganizationAnalyticsRepositoryBackedSummaryCommand;

export type BuildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepositoryCommand =
  BuildOrganizationAnalyticsRepositoryBackedSummaryCommand;

export type BuildOrganizationAnalyticsExportReadinessSummaryFromRepositoryCommand =
  BuildOrganizationAnalyticsRepositoryBackedSummaryCommand & {
    exportScope: OrganizationAnalyticsExportScope;
    objectStorageAvailable: boolean;
    externalDeliveryAvailable: boolean;
  };

function hasOrganizationAnalyticsSummaryBaseAccess(
  command: Omit<
    OrganizationAnalyticsSummaryAccessCommand,
    "scopeOrganizationPublicIds"
  >,
) {
  return (
    command.adminContext.effectiveEdition === "advanced" &&
    command.adminContext.authorizationSource === "org_auth" &&
    command.adminContext.canViewOrganizationTrainingSummary === true &&
    command.adminContext.organizationPublicId === command.organizationPublicId
  );
}

function canViewOrganizationAnalyticsSummary(
  command: OrganizationAnalyticsSummaryAccessCommand,
) {
  return (
    hasOrganizationAnalyticsSummaryBaseAccess(command) &&
    command.scopeOrganizationPublicIds.includes(command.organizationPublicId)
  );
}

async function resolveVisibleOrganizationAnalyticsScope(
  command: BuildOrganizationAnalyticsRepositoryBackedSummaryCommand,
) {
  if (!hasOrganizationAnalyticsSummaryBaseAccess(command)) {
    return null;
  }

  const scopeOrganizationPublicIds =
    await command.repository.lookupVisibleOrganizationScope({
      adminPublicId: command.adminPublicId,
    });

  if (
    scopeOrganizationPublicIds === null ||
    !scopeOrganizationPublicIds.includes(command.organizationPublicId)
  ) {
    return null;
  }

  return scopeOrganizationPublicIds;
}

function createOrganizationAnalyticsAccessDeniedResponse() {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_ACCESS_DENIED_CODE,
    ORGANIZATION_ANALYTICS_ACCESS_DENIED_MESSAGE,
  );
}

export function buildOrganizationAnalyticsDashboardSummary(
  command: BuildOrganizationAnalyticsDashboardSummaryCommand,
): ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createOrganizationAnalyticsAccessDeniedResponse();
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

export async function buildOrganizationAnalyticsDashboardSummaryFromRepository(
  command: BuildOrganizationAnalyticsDashboardSummaryFromRepositoryCommand,
): Promise<ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null>> {
  const scopeOrganizationPublicIds =
    await resolveVisibleOrganizationAnalyticsScope(command);

  if (scopeOrganizationPublicIds === null) {
    return createOrganizationAnalyticsAccessDeniedResponse();
  }

  const trainingMetricsInput =
    await command.repository.readTrainingAggregateMetricsInput({
      organizationPublicId: command.organizationPublicId,
      scopeOrganizationPublicIds,
      dateRange: command.dateRange,
    });

  if (trainingMetricsInput === null) {
    return createOrganizationAnalyticsAccessDeniedResponse();
  }

  return buildOrganizationAnalyticsDashboardSummary({
    adminContext: command.adminContext,
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: command.dateRange,
    trainingMetricsInput,
    updatedAt: command.updatedAt,
  });
}

export function buildOrganizationAnalyticsExportReadinessSummary(
  command: BuildOrganizationAnalyticsExportReadinessSummaryCommand,
): ApiResponse<OrganizationAnalyticsExportReadinessSummaryDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createOrganizationAnalyticsAccessDeniedResponse();
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

export async function buildOrganizationAnalyticsExportReadinessSummaryFromRepository(
  command: BuildOrganizationAnalyticsExportReadinessSummaryFromRepositoryCommand,
): Promise<ApiResponse<OrganizationAnalyticsExportReadinessSummaryDto | null>> {
  const scopeOrganizationPublicIds =
    await resolveVisibleOrganizationAnalyticsScope(command);

  if (scopeOrganizationPublicIds === null) {
    return createOrganizationAnalyticsAccessDeniedResponse();
  }

  const summaryRows = await command.repository.readExportReadinessRows({
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: command.dateRange,
  });

  return buildOrganizationAnalyticsExportReadinessSummary({
    adminContext: command.adminContext,
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: command.dateRange,
    exportScope: command.exportScope,
    summaryRows,
    objectStorageAvailable: command.objectStorageAvailable,
    externalDeliveryAvailable: command.externalDeliveryAvailable,
    updatedAt: command.updatedAt,
  });
}

export function buildOrganizationAnalyticsAuditLogRedactedReference(
  command: BuildOrganizationAnalyticsAuditLogReferenceCommand,
): ApiResponse<OrganizationAnalyticsAuditLogReferenceDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createOrganizationAnalyticsAccessDeniedResponse();
  }

  const auditLogReferenceInput: OrganizationAnalyticsAuditLogReferenceInput = {
    action: command.action,
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds: command.scopeOrganizationPublicIds,
    dateRange: command.dateRange,
    referencePublicId: command.referencePublicId,
    summaryRowCount: command.summaryRowCount,
    recordedAt: command.recordedAt,
  };

  return createSuccessResponse(
    createOrganizationAnalyticsAuditLogRedactedReference(
      auditLogReferenceInput,
    ),
  );
}

export function buildOrganizationAnalyticsEmployeeStatisticsSummary(
  command: BuildOrganizationAnalyticsEmployeeStatisticsSummaryCommand,
): ApiResponse<OrganizationAnalyticsEmployeeStatisticsSummaryDto | null> {
  if (!canViewOrganizationAnalyticsSummary(command)) {
    return createOrganizationAnalyticsAccessDeniedResponse();
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

export async function buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository(
  command: BuildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepositoryCommand,
): Promise<
  ApiResponse<OrganizationAnalyticsEmployeeStatisticsSummaryDto | null>
> {
  const scopeOrganizationPublicIds =
    await resolveVisibleOrganizationAnalyticsScope(command);

  if (scopeOrganizationPublicIds === null) {
    return createOrganizationAnalyticsAccessDeniedResponse();
  }

  const employeeTrainingSummaryInputs =
    await command.repository.readEmployeeTrainingSummaryInputs({
      organizationPublicId: command.organizationPublicId,
      scopeOrganizationPublicIds,
      dateRange: command.dateRange,
    });

  return buildOrganizationAnalyticsEmployeeStatisticsSummary({
    adminContext: command.adminContext,
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: command.dateRange,
    employeeTrainingSummaryInputs,
    updatedAt: command.updatedAt,
  });
}
