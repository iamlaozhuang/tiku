import type { AuditLogListQuery } from "@/server/contracts/audit-log/log-governance-contract";
import {
  createPostgresAdminFlowRuntimeRepositories,
  type AdminFlowRuntimeRepositoryOptions,
} from "@/server/repositories/admin-flow-runtime-repository";
import {
  createAuditLogPagination,
  type AuditLogRepository,
} from "@/server/repositories/audit-log/audit-log-repository";

export function createPostgresAuditLogRepository(
  options: AdminFlowRuntimeRepositoryOptions = {},
): AuditLogRepository {
  const repositories = createPostgresAdminFlowRuntimeRepositories(options);

  return {
    async listAuditLogs(query) {
      const legacyResult = await repositories.auditLogRepository.listAuditLogs({
        actionType: query.actionType,
        aiFuncType: "all",
        callStatus: "all",
        keyword: query.keyword,
        level: null,
        page: query.page,
        pageSize: query.pageSize,
        profession: "all",
        resultStatus: query.resultStatus,
        sortBy: "createdAt",
        sortOrder: query.sortOrder,
        targetResourceType: query.targetResourceType,
      });
      const filteredAuditLogs = legacyResult.auditLogs.filter(
        (auditLog) =>
          (query.actorPublicId === null ||
            auditLog.actorPublicId === query.actorPublicId) &&
          matchesCreatedAtRange(auditLog.createdAt, query),
      );

      return {
        auditLogs: filteredAuditLogs,
        pagination: createAuditLogPagination(query, filteredAuditLogs.length),
      };
    },
  };
}

function matchesCreatedAtRange(
  createdAt: string,
  query: AuditLogListQuery,
): boolean {
  const createdTimestamp = Date.parse(createdAt);
  const fromTimestamp =
    query.fromCreatedAt === null ? null : Date.parse(query.fromCreatedAt);
  const toTimestamp =
    query.toCreatedAt === null ? null : Date.parse(query.toCreatedAt);

  return (
    (fromTimestamp === null || createdTimestamp >= fromTimestamp) &&
    (toTimestamp === null || createdTimestamp <= toTimestamp)
  );
}
