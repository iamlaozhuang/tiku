import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { OrganizationAnalyticsDashboardSummaryDto } from "../contracts/organization-analytics-contract";
import type { OrganizationAnalyticsEmployeeStatisticsSummaryDto } from "../contracts/organization-analytics-contract";
import type { AdminWorkspaceCapabilitySummary } from "../contracts/admin-workspace-role-guard-contract";
import {
  mapOrganizationAnalyticsDashboardRouteResponse,
  mapOrganizationAnalyticsEmployeeStatisticsRouteResponse,
} from "../mappers/organization-analytics-mapper";
import {
  createOrganizationAnalyticsPostgresGateway,
  createOrganizationAnalyticsTrainingAnswerSourceReader,
  createOrganizationAnalyticsVisibleOrganizationScopeReader,
  createPostgresOrganizationAnalyticsRepository,
} from "../repositories/organization-analytics-repository";
import {
  createLazyRuntimeDatabaseGetter,
  type RuntimeDatabaseOptions,
} from "../repositories/runtime-database";
import {
  parseOrganizationAnalyticsSummaryRouteQuery,
  type OrganizationAnalyticsSummaryRouteQuery,
} from "../validators/organization-analytics";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import {
  buildOrganizationAnalyticsDashboardSummaryFromRepository,
  buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository,
  type OrganizationAnalyticsAdminContext,
  type OrganizationAnalyticsServiceRepository,
} from "./organization-analytics-service";
import type { SessionService } from "./session-service";

const ORGANIZATION_ANALYTICS_DASHBOARD_RUNTIME_NOT_CONFIGURED_CODE = 503185;
const ORGANIZATION_ANALYTICS_DASHBOARD_RUNTIME_NOT_CONFIGURED_MESSAGE =
  "Organization analytics dashboard summary runtime is not configured.";
const ORGANIZATION_ANALYTICS_DASHBOARD_ADMIN_CONTEXT_UNAVAILABLE_CODE = 403186;
const ORGANIZATION_ANALYTICS_DASHBOARD_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE =
  "Organization analytics dashboard summary admin context is unavailable.";
const ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_RUNTIME_NOT_CONFIGURED_CODE = 503187;
const ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_RUNTIME_NOT_CONFIGURED_MESSAGE =
  "Organization analytics employee statistics runtime is not configured.";
const ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_ADMIN_CONTEXT_UNAVAILABLE_CODE = 403188;
const ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE =
  "Organization analytics employee statistics admin context is unavailable.";

export type OrganizationAnalyticsDashboardSummaryRouteAdminContext =
  OrganizationAnalyticsAdminContext & {
    adminPublicId: string;
  };

export type OrganizationAnalyticsEmployeeStatisticsRouteAdminContext =
  OrganizationAnalyticsAdminContext & {
    adminPublicId: string;
  };

type OrganizationAnalyticsRouteAdminContextResolverInput = {
  request: Request;
  routeQuery: OrganizationAnalyticsSummaryRouteQuery;
};

export type OrganizationAnalyticsDashboardSummaryAdminContextResolver = (
  input: OrganizationAnalyticsRouteAdminContextResolverInput,
) =>
  | OrganizationAnalyticsDashboardSummaryRouteAdminContext
  | null
  | Promise<OrganizationAnalyticsDashboardSummaryRouteAdminContext | null>;

export type OrganizationAnalyticsEmployeeStatisticsAdminContextResolver = (
  input: OrganizationAnalyticsRouteAdminContextResolverInput,
) =>
  | OrganizationAnalyticsEmployeeStatisticsRouteAdminContext
  | null
  | Promise<OrganizationAnalyticsEmployeeStatisticsRouteAdminContext | null>;

export type OrganizationAnalyticsDashboardSummaryReaderInput =
  OrganizationAnalyticsSummaryRouteQuery & {
    adminContext: OrganizationAnalyticsDashboardSummaryRouteAdminContext;
  };

export type OrganizationAnalyticsEmployeeStatisticsReaderInput =
  OrganizationAnalyticsSummaryRouteQuery & {
    adminContext: OrganizationAnalyticsEmployeeStatisticsRouteAdminContext;
  };

export type OrganizationAnalyticsDashboardSummaryReader = (
  input: OrganizationAnalyticsDashboardSummaryReaderInput,
) =>
  | ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null>
  | Promise<ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null>>;

export type OrganizationAnalyticsEmployeeStatisticsReader = (
  input: OrganizationAnalyticsEmployeeStatisticsReaderInput,
) =>
  | ApiResponse<OrganizationAnalyticsEmployeeStatisticsSummaryDto | null>
  | Promise<
      ApiResponse<OrganizationAnalyticsEmployeeStatisticsSummaryDto | null>
    >;

export type OrganizationAnalyticsDashboardSummaryRouteOptions = {
  readDashboardSummary?: OrganizationAnalyticsDashboardSummaryReader;
  resolveAdminContext?: OrganizationAnalyticsDashboardSummaryAdminContextResolver;
};

export type OrganizationAnalyticsEmployeeStatisticsRouteOptions = {
  readEmployeeStatistics?: OrganizationAnalyticsEmployeeStatisticsReader;
  resolveAdminContext?: OrganizationAnalyticsEmployeeStatisticsAdminContextResolver;
};

export type OrganizationAnalyticsDashboardSummaryRuntimeRouteOptions =
  RuntimeDatabaseOptions & {
    readUpdatedAt?: () => string;
    repository?: OrganizationAnalyticsServiceRepository;
    resolveAdminContext?: OrganizationAnalyticsDashboardSummaryAdminContextResolver;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

export type OrganizationAnalyticsEmployeeStatisticsRuntimeRouteOptions =
  RuntimeDatabaseOptions & {
    readUpdatedAt?: () => string;
    repository?: OrganizationAnalyticsServiceRepository;
    resolveAdminContext?: OrganizationAnalyticsEmployeeStatisticsAdminContextResolver;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type OrganizationAnalyticsDashboardSummaryRuntimeAdminRole =
  | "super_admin"
  | "org_advanced_admin";

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function readOrganizationAnalyticsSummaryRouteQuery(
  request: Request,
): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

function normalizeRequiredText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isOrganizationAnalyticsDashboardSummaryRuntimeAdminRole(
  role: string,
): role is OrganizationAnalyticsDashboardSummaryRuntimeAdminRole {
  return role === "super_admin" || role === "org_advanced_admin";
}

function canUseServiceComputedOrganizationAnalyticsCapability(
  capabilitySummary: AdminWorkspaceCapabilitySummary | undefined,
): capabilitySummary is AdminWorkspaceCapabilitySummary & {
  organizationPublicId: string;
  organizationEffectiveEdition: "advanced";
  organizationAuthorizationSource: "org_auth";
  capabilitySource: "service_computed";
  canUseOrganizationAdvancedWorkspace: true;
} {
  return (
    capabilitySummary !== undefined &&
    capabilitySummary.capabilitySource === "service_computed" &&
    capabilitySummary.organizationAuthorizationSource === "org_auth" &&
    capabilitySummary.organizationPublicId !== null &&
    capabilitySummary.organizationEffectiveEdition === "advanced" &&
    capabilitySummary.canUseOrganizationAdvancedWorkspace === true
  );
}

async function readUnavailableDashboardSummary(): Promise<ApiResponse<null>> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_DASHBOARD_RUNTIME_NOT_CONFIGURED_CODE,
    ORGANIZATION_ANALYTICS_DASHBOARD_RUNTIME_NOT_CONFIGURED_MESSAGE,
  );
}

async function readUnavailableEmployeeStatistics(): Promise<ApiResponse<null>> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_RUNTIME_NOT_CONFIGURED_CODE,
    ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_RUNTIME_NOT_CONFIGURED_MESSAGE,
  );
}

function createAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_DASHBOARD_ADMIN_CONTEXT_UNAVAILABLE_CODE,
    ORGANIZATION_ANALYTICS_DASHBOARD_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE,
  );
}

function createEmployeeStatisticsAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_ADMIN_CONTEXT_UNAVAILABLE_CODE,
    ORGANIZATION_ANALYTICS_EMPLOYEE_STATISTICS_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE,
  );
}

function createRepositoryBackedDashboardSummaryReader(
  repository: OrganizationAnalyticsServiceRepository,
  readUpdatedAt: () => string,
): OrganizationAnalyticsDashboardSummaryReader {
  return (input) =>
    buildOrganizationAnalyticsDashboardSummaryFromRepository({
      adminContext: input.adminContext,
      adminPublicId: input.adminContext.adminPublicId,
      organizationPublicId: input.organizationPublicId,
      dateRange: input.dateRange,
      updatedAt: readUpdatedAt(),
      repository,
    });
}

function createRepositoryBackedEmployeeStatisticsReader(
  repository: OrganizationAnalyticsServiceRepository,
  readUpdatedAt: () => string,
): OrganizationAnalyticsEmployeeStatisticsReader {
  return (input) =>
    buildOrganizationAnalyticsEmployeeStatisticsSummaryFromRepository({
      adminContext: input.adminContext,
      adminPublicId: input.adminContext.adminPublicId,
      organizationPublicId: input.organizationPublicId,
      dateRange: input.dateRange,
      updatedAt: readUpdatedAt(),
      repository,
    });
}

function createSessionBackedOrganizationAnalyticsAdminContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
):
  | OrganizationAnalyticsDashboardSummaryAdminContextResolver
  | OrganizationAnalyticsEmployeeStatisticsAdminContextResolver {
  return async ({ request }) => {
    const sessionResponse = await sessionService.getCurrentSession({
      authorization: getRequestAuthorization(request),
    });

    if (sessionResponse.code !== 0 || sessionResponse.data === null) {
      return null;
    }

    const rawAdminPublicId = sessionResponse.data.user.adminPublicId;
    const adminPublicId =
      typeof rawAdminPublicId === "string"
        ? normalizeRequiredText(rawAdminPublicId)
        : null;
    const hasAdminRole = (sessionResponse.data.user.adminRoles ?? []).some(
      (adminRole) =>
        isOrganizationAnalyticsDashboardSummaryRuntimeAdminRole(adminRole),
    );
    const adminWorkspaceCapability =
      sessionResponse.data.user.adminWorkspaceCapability;

    if (
      adminPublicId === null ||
      !hasAdminRole ||
      !canUseServiceComputedOrganizationAnalyticsCapability(
        adminWorkspaceCapability,
      )
    ) {
      return null;
    }

    return {
      adminPublicId,
      effectiveEdition: adminWorkspaceCapability.organizationEffectiveEdition,
      authorizationSource:
        adminWorkspaceCapability.organizationAuthorizationSource,
      canViewOrganizationTrainingSummary:
        adminWorkspaceCapability.canUseOrganizationAdvancedWorkspace,
      organizationPublicId: adminWorkspaceCapability.organizationPublicId,
    };
  };
}

function createRuntimePostgresOrganizationAnalyticsRepository(
  options: RuntimeDatabaseOptions,
  databaseUrlErrorMessage: string,
): OrganizationAnalyticsServiceRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    databaseUrlErrorMessage,
  );
  const gateway = createOrganizationAnalyticsPostgresGateway({
    async findVisibleOrganizationScopeByAdminPublicId(input) {
      return createOrganizationAnalyticsVisibleOrganizationScopeReader(
        getDatabase(),
      )(input);
    },
    async readTrainingAnswerSourceRows(input) {
      return createOrganizationAnalyticsTrainingAnswerSourceReader(
        getDatabase(),
      )(input);
    },
  });

  return createPostgresOrganizationAnalyticsRepository({ gateway });
}

export function createOrganizationAnalyticsDashboardSummaryRouteHandlers(
  options: OrganizationAnalyticsDashboardSummaryRouteOptions = {},
) {
  const readDashboardSummary =
    options.readDashboardSummary ?? readUnavailableDashboardSummary;
  const resolveAdminContext = options.resolveAdminContext;

  return createRouteHandlersWithErrorEnvelope({
    dashboardSummary: {
      async GET(request: Request): Promise<Response> {
        const queryResponse = parseOrganizationAnalyticsSummaryRouteQuery(
          readOrganizationAnalyticsSummaryRouteQuery(request),
        );

        if (queryResponse.data === null) {
          return createJsonResponse(queryResponse);
        }

        if (resolveAdminContext === undefined) {
          return createJsonResponse(await readUnavailableDashboardSummary());
        }

        const adminContext = await resolveAdminContext({
          request,
          routeQuery: queryResponse.data,
        });

        if (adminContext === null) {
          return createJsonResponse(createAdminContextUnavailableResponse());
        }

        const dashboardSummaryResponse = await readDashboardSummary({
          ...queryResponse.data,
          adminContext,
        });

        return createJsonResponse(
          mapOrganizationAnalyticsDashboardRouteResponse(
            dashboardSummaryResponse,
          ),
        );
      },
    },
  });
}

export function createOrganizationAnalyticsEmployeeStatisticsRouteHandlers(
  options: OrganizationAnalyticsEmployeeStatisticsRouteOptions = {},
) {
  const readEmployeeStatistics =
    options.readEmployeeStatistics ?? readUnavailableEmployeeStatistics;
  const resolveAdminContext = options.resolveAdminContext;

  return createRouteHandlersWithErrorEnvelope({
    employeeStatistics: {
      async GET(request: Request): Promise<Response> {
        const queryResponse = parseOrganizationAnalyticsSummaryRouteQuery(
          readOrganizationAnalyticsSummaryRouteQuery(request),
        );

        if (queryResponse.data === null) {
          return createJsonResponse(queryResponse);
        }

        if (resolveAdminContext === undefined) {
          return createJsonResponse(await readUnavailableEmployeeStatistics());
        }

        const adminContext = await resolveAdminContext({
          request,
          routeQuery: queryResponse.data,
        });

        if (adminContext === null) {
          return createJsonResponse(
            createEmployeeStatisticsAdminContextUnavailableResponse(),
          );
        }

        const employeeStatisticsResponse = await readEmployeeStatistics({
          ...queryResponse.data,
          adminContext,
        });

        return createJsonResponse(
          mapOrganizationAnalyticsEmployeeStatisticsRouteResponse(
            employeeStatisticsResponse,
          ),
        );
      },
    },
  });
}

export function createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers(
  options: OrganizationAnalyticsDashboardSummaryRuntimeRouteOptions = {},
) {
  const repository =
    options.repository ??
    createRuntimePostgresOrganizationAnalyticsRepository(
      {
        createDatabase: options.createDatabase,
      },
      "DATABASE_URL is required for organization analytics dashboard summary runtime.",
    );
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveAdminContext =
    options.resolveAdminContext ??
    createSessionBackedOrganizationAnalyticsAdminContextResolver(
      sessionService,
    );
  const readUpdatedAt =
    options.readUpdatedAt ?? (() => new Date().toISOString());

  return createOrganizationAnalyticsDashboardSummaryRouteHandlers({
    readDashboardSummary: createRepositoryBackedDashboardSummaryReader(
      repository,
      readUpdatedAt,
    ),
    resolveAdminContext,
  });
}

export function createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers(
  options: OrganizationAnalyticsEmployeeStatisticsRuntimeRouteOptions = {},
) {
  const repository =
    options.repository ??
    createRuntimePostgresOrganizationAnalyticsRepository(
      {
        createDatabase: options.createDatabase,
      },
      "DATABASE_URL is required for organization analytics employee statistics runtime.",
    );
  const sessionService = options.sessionService ?? createLocalSessionRuntime();
  const resolveAdminContext =
    options.resolveAdminContext ??
    createSessionBackedOrganizationAnalyticsAdminContextResolver(
      sessionService,
    );
  const readUpdatedAt =
    options.readUpdatedAt ?? (() => new Date().toISOString());

  return createOrganizationAnalyticsEmployeeStatisticsRouteHandlers({
    readEmployeeStatistics: createRepositoryBackedEmployeeStatisticsReader(
      repository,
      readUpdatedAt,
    ),
    resolveAdminContext,
  });
}
