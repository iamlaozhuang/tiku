import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

export const POST = adminFlowRuntimeRouteHandlers.users.revealPhone.POST;
