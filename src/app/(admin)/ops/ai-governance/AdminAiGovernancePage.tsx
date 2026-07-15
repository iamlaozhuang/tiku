"use client";

import { AdminAiAuditLogOpsBaseline } from "../ai-audit-logs/AdminAiAuditLogOpsBaseline";
import { useAdminDashboardRoles } from "@/components/AdminDashboardLayout/AdminDashboardLayout";

export function AdminAiGovernancePage() {
  const roles = useAdminDashboardRoles();
  const currentRole = roles.includes("super_admin")
    ? "super_admin"
    : "ops_admin";

  return (
    <AdminAiAuditLogOpsBaseline currentRole={currentRole} runtimeEnabled />
  );
}
