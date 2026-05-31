import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";

const adminOrganizationOrgAuthRuntimeRouteHandlers =
  createAdminOrganizationOrgAuthRuntimeRouteHandlers();

export const POST =
  adminOrganizationOrgAuthRuntimeRouteHandlers.organizations.enable.POST;
