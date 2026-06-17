import {
  createErrorResponse,
  type ApiResponse,
} from "../contracts/api-response";
import type { OrganizationAnalyticsDashboardSummaryDto } from "../contracts/organization-analytics-contract";
import { mapOrganizationAnalyticsDashboardRouteResponse } from "../mappers/organization-analytics-mapper";
import {
  parseOrganizationAnalyticsSummaryRouteQuery,
  type OrganizationAnalyticsSummaryRouteQuery,
} from "../validators/organization-analytics";
import { createRouteHandlersWithErrorEnvelope } from "./route-error-response";
import type { OrganizationAnalyticsAdminContext } from "./organization-analytics-service";

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

function createJsonResponse<TData>(response: ApiResponse<TData>): Response {
  return Response.json(response);
}

function readDashboardSummaryRouteQuery(
  request: Request,
): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
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

export function createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers() {
  return createOrganizationAnalyticsDashboardSummaryRouteHandlers();
}
