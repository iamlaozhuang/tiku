import { createOrganizationRouteHandlers } from "@/server/services/organization/route-handlers";

const organizationRouteHandlers = createOrganizationRouteHandlers();

export const POST = organizationRouteHandlers.organizations.enable.POST;
