import { createAuditLogRouteHandlers } from "@/server/services/audit-log/route-handlers";

const auditLogRouteHandlers = createAuditLogRouteHandlers();

export const GET = auditLogRouteHandlers.collection.GET;
