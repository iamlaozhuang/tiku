import { createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers } from "@/server/services/organization-analytics-route";

const organizationAnalyticsDashboardSummaryRouteHandlers =
  createOrganizationAnalyticsDashboardSummaryRuntimeRouteHandlers();

export const GET =
  organizationAnalyticsDashboardSummaryRouteHandlers.dashboardSummary.GET;
