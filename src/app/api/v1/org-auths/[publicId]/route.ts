import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";

const adminOrganizationOrgAuthRuntimeRouteHandlers =
  createAdminOrganizationOrgAuthRuntimeRouteHandlers();

export const GET =
  adminOrganizationOrgAuthRuntimeRouteHandlers.orgAuths.item.GET;
