import { createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers } from "../../../../../server/services/organization-analytics-route";

const { employeeStatistics } =
  createOrganizationAnalyticsEmployeeStatisticsRuntimeRouteHandlers();

export const { GET } = employeeStatistics;
