import { createOrganizationRouteHandlers } from "@/server/services/organization/route-handlers";

const organizationRouteHandlers = createOrganizationRouteHandlers();

export const PATCH = organizationRouteHandlers.organizations.item.PATCH;
