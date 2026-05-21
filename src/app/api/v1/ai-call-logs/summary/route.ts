import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";

const adminAiAuditLogRuntimeRouteHandlers =
  createAdminAiAuditLogRuntimeRouteHandlers();

export const GET = adminAiAuditLogRuntimeRouteHandlers.aiCallLogSummary.GET;
