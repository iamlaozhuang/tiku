import { createAdminOrganizationOrgAuthRuntimeRouteHandlers } from "@/server/services/admin-organization-org-auth-runtime";

const routeHandlers = createAdminOrganizationOrgAuthRuntimeRouteHandlers();

export const GET = routeHandlers.organizationTreeNodes.collection.GET;
