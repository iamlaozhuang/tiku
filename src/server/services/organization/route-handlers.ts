import {
  createAdminOrganizationOrgAuthRuntimeRouteHandlers,
  type AdminOrganizationOrgAuthRuntimeOptions,
} from "../admin-organization-org-auth-runtime";

export type OrganizationRouteHandlers = ReturnType<
  typeof createAdminOrganizationOrgAuthRuntimeRouteHandlers
>;

export function createOrganizationRouteHandlers(
  options: AdminOrganizationOrgAuthRuntimeOptions = {},
): OrganizationRouteHandlers {
  return createAdminOrganizationOrgAuthRuntimeRouteHandlers(options);
}
