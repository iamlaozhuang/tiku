import { createAdminFlowRuntimeRouteHandlers } from "@/server/services/admin-flow-runtime";

const adminFlowRuntimeRouteHandlers = createAdminFlowRuntimeRouteHandlers();

export const GET = adminFlowRuntimeRouteHandlers.adminAccounts.detail.GET;
export const PATCH = adminFlowRuntimeRouteHandlers.adminAccounts.detail.PATCH;
