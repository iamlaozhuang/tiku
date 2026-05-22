import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";

const adminOrganizationOrgAuthRuntimeRouteHandlers =
  createAdminOrganizationOrgAuthRuntimeRouteHandlers();

export const GET =
  adminOrganizationOrgAuthRuntimeRouteHandlers.organizations.collection.GET;
export const POST =
  adminOrganizationOrgAuthRuntimeRouteHandlers.organizations.collection.POST;
