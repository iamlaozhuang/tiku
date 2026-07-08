import { createOrganizationPortalOverviewRuntimeRouteHandlers } from "@/server/services/organization-portal-overview-route";

const organizationPortalOverviewRouteHandlers =
  createOrganizationPortalOverviewRuntimeRouteHandlers();

export const GET = organizationPortalOverviewRouteHandlers.overview.GET;
