import { createUnavailableOrganizationAuthService } from "@/server/services/organization-auth-service";
import { createOrganizationRouteHandlers } from "@/server/services/organization-auth-route";

const organizationRouteHandlers = createOrganizationRouteHandlers(
  createUnavailableOrganizationAuthService(),
);

const responseContract = {
  code: 503005,
  message: "Organization runtime is not configured.",
  data: null,
};

void responseContract;

export const PATCH = organizationRouteHandlers.PATCH;
