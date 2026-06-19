import { createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers } from "../../../../../server/services/organization-analytics-route";

const organizationAnalyticsEmployeeStatisticsRouteHandlers =
  createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers();

export const GET =
  organizationAnalyticsEmployeeStatisticsRouteHandlers.employeeStatistics.GET;
