import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";
import { createLocalUserRegistrationRouteHandlers } from "@/server/auth/local-session-runtime";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

const userRegistrationRouteHandlers =
  createLocalUserRegistrationRouteHandlers();

export const GET = adminFlowRuntimeRouteHandlers.users.collection.GET;
export const POST = userRegistrationRouteHandlers.POST;
