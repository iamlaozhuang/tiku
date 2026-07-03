import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiResponse,
} from "../contracts/api-response";
import {
  createOrganizationAnalyticsRedactedStatisticsBoundary,
  type OrganizationAnalyticsAuditLogReferenceAction,
  type OrganizationAnalyticsAuditLogReferenceDto,
  type OrganizationAnalyticsDashboardSummaryDto,
  type OrganizationAnalyticsDateRangeDto,
  type OrganizationAnalyticsEmployeeStatisticsPaginationInput,
  type OrganizationAnalyticsEmployeeStatisticsSummaryDto,
  type OrganizationAnalyticsExportReadinessSummaryDto,
  type OrganizationAnalyticsExportScope,
  type OrganizationAnalyticsFormalLearningSummaryDto,
} from "../contracts/organization-analytics-contract";
import {
  createOrganizationAnalyticsAuditLogRedactedReference,
  createOrganizationAnalyticsEmployeeTrainingSummary,
  createOrganizationAnalyticsExportReadinessAssessment,
  createOrganizationAnalyticsKnowledgeWeakPointSummary,
  createOrganizationTrainingAggregateMetrics,
  type OrganizationAnalyticsAuditLogReferenceInput,
  type OrganizationAnalyticsEmployeeTrainingSummaryInput,
  type OrganizationAnalyticsExportReadinessInput,
  type OrganizationAnalyticsWeakPointSummaryInput,
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
    formalLearningSummary: OrganizationAnalyticsFormalLearningSummaryDto | null;
    knowledgeWeakPointSummary: OrganizationAnalyticsWeakPointSummaryInput | null;
    updatedAt: string;
  };

export type BuildOrganizationAnalyticsEmployeeStatisticsSummaryCommand =
  OrganizationAnalyticsSummaryAccessCommand & {
    dateRange: OrganizationAnalyticsDateRangeDto;
    employeeTrainingSummaryInputs: readonly Omit<
      OrganizationAnalyticsEmployeeTrainingSummaryInput,
      "dateRange"
    >[];
    pagination: OrganizationAnalyticsEmployeeStatisticsPaginationInput;
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
  BuildOrganizationAnalyticsRepositoryBackedSummaryCommand & {
    pagination: OrganizationAnalyticsEmployeeStatisticsPaginationInput;
  };

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
    command.adminContext.canViewOrganizationTrainingSummary === true
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

function createFormalLearningSummary(
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
    formalLearningSummary: createFormalLearningSummary(
      command.formalLearningSummary,
    ),
    knowledgeWeakPointSummary:
      createOrganizationAnalyticsKnowledgeWeakPointSummary(
        command.knowledgeWeakPointSummary,
      ),
    redactedStatisticsBoundary:
      createOrganizationAnalyticsRedactedStatisticsBoundary(),
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

  const summaryReadInput = {
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: command.dateRange,
  };

  const trainingMetricsInput =
    await command.repository.readTrainingAggregateMetricsInput(
      summaryReadInput,
    );

  if (trainingMetricsInput === null) {
    return createOrganizationAnalyticsAccessDeniedResponse();
  }

  const [formalLearningSummary, knowledgeWeakPointSummary] = await Promise.all([
    command.repository.readFormalLearningSummary(summaryReadInput),
    command.repository.readKnowledgeWeakPointSummary(summaryReadInput),
  ]);

  return buildOrganizationAnalyticsDashboardSummary({
    adminContext: command.adminContext,
    organizationPublicId: command.organizationPublicId,
    scopeOrganizationPublicIds,
    dateRange: command.dateRange,
    trainingMetricsInput,
    formalLearningSummary,
    knowledgeWeakPointSummary,
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
  const total = employees.length;
  const page = Math.max(command.pagination.page, 1);
  const pageSize = command.pagination.pageSize;
  const paginatedEmployees = employees.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return createPaginatedResponse(
    {
      organizationPublicId: command.organizationPublicId,
      scopeOrganizationPublicIds: [...command.scopeOrganizationPublicIds],
      dateRange: command.dateRange,
      employeeCount: total,
      employees: paginatedEmployees,
      redactedStatisticsBoundary:
        createOrganizationAnalyticsRedactedStatisticsBoundary(),
      redactionStatus: "summary_only",
      updatedAt: command.updatedAt,
    },
    {
      page,
      pageSize,
      total,
      sortBy: "employeeDisplayName",
      sortOrder: "asc",
    },
  );
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
    pagination: {
      page: command.pagination.page,
      pageSize: command.pagination.pageSize,
    },
    updatedAt: command.updatedAt,
  });
}
