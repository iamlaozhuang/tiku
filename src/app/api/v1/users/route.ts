import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createUnavailableUserRegistrationRouteHandlers } from "@/server/auth/user-registration-route";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

const userRegistrationRouteHandlers =
  createUnavailableUserRegistrationRouteHandlers();

export const GET = adminFlowRuntimeRouteHandlers.users.collection.GET;
export const POST = userRegistrationRouteHandlers.POST;
