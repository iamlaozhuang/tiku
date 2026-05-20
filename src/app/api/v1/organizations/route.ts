import { createAdminUserOrgAuthOpsRouteHandlers } from "@/server/services/admin-user-org-auth-ops-route";
import { createUnavailableAdminUserOrgAuthOpsService } from "@/server/services/admin-user-org-auth-ops-service";
import { createUnavailableOrganizationAuthService } from "@/server/services/organization-auth-service";
import { createOrganizationRouteHandlers } from "@/server/services/organization-auth-route";

const adminUserOrgAuthOpsRouteHandlers = createAdminUserOrgAuthOpsRouteHandlers(
  createUnavailableAdminUserOrgAuthOpsService(),
);

const organizationRouteHandlers = createOrganizationRouteHandlers(
  createUnavailableOrganizationAuthService(),
);

const responseContract = {
  code: 503005,
  message: "Organization runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = adminUserOrgAuthOpsRouteHandlers.organizations.GET;
export const POST = organizationRouteHandlers.POST;
