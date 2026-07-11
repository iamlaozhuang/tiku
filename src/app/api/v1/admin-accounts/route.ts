import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

export const POST = adminFlowRuntimeRouteHandlers.adminAccounts.collection.POST;
export const GET = adminFlowRuntimeRouteHandlers.adminAccounts.collection.GET;
