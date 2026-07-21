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
        actorPublicId: query.actorPublicId,
        fromCreatedAt: query.fromCreatedAt,
        toCreatedAt: query.toCreatedAt,
      });

      return {
        auditLogs: legacyResult.auditLogs,
        pagination: createAuditLogPagination(
          query,
          legacyResult.pagination.total,
        ),
      };
    },
  };
}
