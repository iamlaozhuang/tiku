import { createOrganizationRouteHandlers } from "@/server/services/organization/route-handlers";

const organizationRouteHandlers = createOrganizationRouteHandlers();

export const GET = organizationRouteHandlers.organizations.collection.GET;
export const POST = organizationRouteHandlers.organizations.collection.POST;
