import { createOrganizationAnalyticsEmployeeStatisticsRouteHandlers } from "../../../../../server/services/organization-analytics-route";

const { employeeStatistics } =
  createOrganizationAnalyticsEmployeeStatisticsRouteHandlers();

export const { GET } = employeeStatistics;
