import { createUnavailableOrganizationAuthService } from "@/server/services/organization-auth-service";
import { createOrgAuthRouteHandlers } from "@/server/services/organization-auth-route";

const orgAuthRouteHandlers = createOrgAuthRouteHandlers(
  createUnavailableOrganizationAuthService(),
);

const responseContract = {
  code: 503006,
  message: "Org auth runtime is not configured.",
  data: null,
};

void responseContract;

export const POST = orgAuthRouteHandlers.cancel.POST;
