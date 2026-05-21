import { createAdminAiAuditLogOpsRouteHandlers } from "@/server/services/admin-ai-audit-log-ops-route";
import { createUnavailableAdminAiAuditLogOpsService } from "@/server/services/admin-ai-audit-log-ops-service";

const adminAiAuditLogOpsRouteHandlers = createAdminAiAuditLogOpsRouteHandlers(
  createUnavailableAdminAiAuditLogOpsService(),
);

const responseContract = {
  code: 503641,
  message: "Admin AI and audit log runtime is not configured.",
  data: null,
};

void responseContract;

export const GET = adminAiAuditLogOpsRouteHandlers.aiCallLogs.GET;
