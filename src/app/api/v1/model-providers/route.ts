import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";

const adminAiAuditLogRuntimeRouteHandlers =
  createAdminAiAuditLogRuntimeRouteHandlers();

export const GET = adminAiAuditLogRuntimeRouteHandlers.modelProviders.GET;
export const POST = adminAiAuditLogRuntimeRouteHandlers.modelProviders.POST;
