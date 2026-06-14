import type {
  AuditLogListQuery,
  AuditLogRecord,
} from "@/server/contracts/audit-log/log-governance-contract";
import type { ApiPagination } from "@/server/contracts/api-response";

export type AuditLogRepositoryListResult = {
  auditLogs: AuditLogRecord[];
  pagination: ApiPagination;
};

export type AuditLogRepository = {
  listAuditLogs(
    query: AuditLogListQuery,
  ): Promise<AuditLogRepositoryListResult>;
};

export function createAuditLogPagination(
  query: AuditLogListQuery,
  total: number,
): ApiPagination {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    total,
  };
}
