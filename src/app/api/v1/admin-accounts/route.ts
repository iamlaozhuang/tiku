import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

export const POST = adminFlowRuntimeRouteHandlers.adminAccounts.collection.POST;
