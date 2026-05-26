import { createAdminAiAuditLogRuntimeRouteHandlers } from "@/server/services/admin-ai-audit-log-runtime";

const adminAiAuditLogRuntimeRouteHandlers =
  createAdminAiAuditLogRuntimeRouteHandlers();

export const PATCH = adminAiAuditLogRuntimeRouteHandlers.promptTemplates.PATCH;
