import type { ApiResponse } from "../contracts/api-response";
import {
  createOrganizationAnalyticsDashboardRouteResponse,
  createOrganizationAnalyticsEmployeeStatisticsRouteResponse,
  createOrganizationAnalyticsExportReadinessRouteResponse,
  type OrganizationAnalyticsDashboardRouteResponse,
  type OrganizationAnalyticsDashboardSummaryDto,
  type OrganizationAnalyticsEmployeeStatisticsRouteResponse,
  type OrganizationAnalyticsEmployeeStatisticsSummaryDto,
  type OrganizationAnalyticsExportReadinessRouteResponse,
  type OrganizationAnalyticsExportReadinessSummaryDto,
} from "../contracts/organization-analytics-contract";

function createMappedNullResponse(
  response: ApiResponse<unknown>,
): ApiResponse<null> {
  return {
    code: response.code,
    message: response.message,
    data: null,
  };
}

export function mapOrganizationAnalyticsDashboardRouteResponse(
  response: ApiResponse<OrganizationAnalyticsDashboardSummaryDto | null>,
): OrganizationAnalyticsDashboardRouteResponse {
  return response.data === null
    ? createMappedNullResponse(response)
    : createOrganizationAnalyticsDashboardRouteResponse(
        response.data,
        response.message,
      );
}

export function mapOrganizationAnalyticsEmployeeStatisticsRouteResponse(
  response: ApiResponse<OrganizationAnalyticsEmployeeStatisticsSummaryDto | null>,
): OrganizationAnalyticsEmployeeStatisticsRouteResponse {
  return response.data === null
    ? createMappedNullResponse(response)
    : createOrganizationAnalyticsEmployeeStatisticsRouteResponse(
        response.data,
        response.message,
        response.pagination,
      );
}

export function mapOrganizationAnalyticsExportReadinessRouteResponse(
  response: ApiResponse<OrganizationAnalyticsExportReadinessSummaryDto | null>,
): OrganizationAnalyticsExportReadinessRouteResponse {
  return response.data === null
    ? createMappedNullResponse(response)
    : createOrganizationAnalyticsExportReadinessRouteResponse(
        response.data,
        response.message,
      );
}
