import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";

const adminOrganizationOrgAuthRuntimeRouteHandlers =
  createAdminOrganizationOrgAuthRuntimeRouteHandlers();

export const GET =
  adminOrganizationOrgAuthRuntimeRouteHandlers.orgAuths.collection.GET;

export const POST =
  adminOrganizationOrgAuthRuntimeRouteHandlers.orgAuths.collection.POST;
