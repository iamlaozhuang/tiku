import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import { createLocalSessionRuntime } from "../auth/local-session-runtime";
import { getRequestAuthorization } from "../auth/session-cookie";
import type { OrganizationAnalyticsDashboardSummaryDto } from "../contracts/organization-analytics-contract";
import { mapOrganizationAnalyticsDashboardRouteResponse } from "../mappers/organization-analytics-mapper";
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

export type OrganizationAnalyticsDashboardSummaryRouteAdminContext =
  OrganizationAnalyticsAdminContext & {
    adminPublicId: string;
  };

export type OrganizationAnalyticsDashboardSummaryAdminContextResolverInput = {
  request: Request;
  routeQuery: OrganizationAnalyticsSummaryRouteQuery;
};

export type OrganizationAnalyticsDashboardSummaryAdminContextResolver = (
  input: OrganizationAnalyticsDashboardSummaryAdminContextResolverInput,
) =>
  | OrganizationAnalyticsDashboardSummaryRouteAdminContext
  | null
  | Promise<OrganizationAnalyticsDashboardSummaryRouteAdminContext | null>;

export type OrganizationAnalyticsDashboardSummaryReaderInput =
  OrganizationAnalyticsSummaryRouteQuery & {
    adminContext: OrganizationAnalyticsDashboardSummaryRouteAdminContext;
  };

export type OrganizationAnalyticsDashboardSummaryReader = (
  input: OrganizationAnalyticsDashboardSummaryReaderInput,
) =>
  | ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null>
  | Promise<ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null>>;

export type OrganizationAnalyticsDashboardSummaryRouteOptions = {
  readDashboardSummary?: OrganizationAnalyticsDashboardSummaryReader;
  resolveAdminContext?: OrganizationAnalyticsDashboardSummaryAdminContextResolver;
};

export type OrganizationAnalyticsDashboardSummaryRuntimeRouteOptions =
  RuntimeDatabaseOptions & {
    readUpdatedAt?: () => string;
    repository?: OrganizationAnalyticsServiceRepository;
    resolveAdminContext?: OrganizationAnalyticsDashboardSummaryAdminContextResolver;
    sessionService?: Pick<SessionService, "getCurrentSession">;
  };

type OrganizationAnalyticsDashboardSummaryRuntimeAdminRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function readDashboardSummaryRouteQuery(
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
  return (
    role === "super_admin" || role === "ops_admin" || role === "content_admin"
  );
}

async function readUnavailableDashboardSummary(): Promise<ApiResponse<null>> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_DASHBOARD_RUNTIME_NOT_CONFIGURED_CODE,
    ORGANIZATION_ANALYTICS_DASHBOARD_RUNTIME_NOT_CONFIGURED_MESSAGE,
  );
}

function createAdminContextUnavailableResponse(): ApiResponse<null> {
  return createErrorResponse(
    ORGANIZATION_ANALYTICS_DASHBOARD_ADMIN_CONTEXT_UNAVAILABLE_CODE,
    ORGANIZATION_ANALYTICS_DASHBOARD_ADMIN_CONTEXT_UNAVAILABLE_MESSAGE,
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

function createSessionBackedOrganizationAnalyticsAdminContextResolver(
  sessionService: Pick<SessionService, "getCurrentSession">,
): OrganizationAnalyticsDashboardSummaryAdminContextResolver {
  return async ({ request, routeQuery }) => {
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

    if (adminPublicId === null || !hasAdminRole) {
      return null;
    }

    return {
      adminPublicId,
      effectiveEdition: "advanced",
      authorizationSource: "org_auth",
      canViewOrganizationTrainingSummary: true,
      organizationPublicId: routeQuery.organizationPublicId,
    };
  };
}

function createRuntimePostgresOrganizationAnalyticsRepository(
  options: RuntimeDatabaseOptions,
): OrganizationAnalyticsServiceRepository {
  const getDatabase = createLazyRuntimeDatabaseGetter(
    options,
    "DATABASE_URL is required for organization analytics dashboard summary runtime.",
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
          readDashboardSummaryRouteQuery(request),
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

export function createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers(
  options: OrganizationAnalyticsDashboardSummaryRuntimeRouteOptions = {},
) {
  const repository =
    options.repository ??
    createRuntimePostgresOrganizationAnalyticsRepository({
      createDatabase: options.createDatabase,
    });
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
