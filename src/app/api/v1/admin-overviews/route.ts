import { createAdminRoleOverviewRuntimeRouteHandlers } from "@/server/services/admin-role-overview-route";

const adminRoleOverviewRouteHandlers =
  createAdminRoleOverviewRuntimeRouteHandlers();

export const GET = adminRoleOverviewRouteHandlers.overview.GET;
