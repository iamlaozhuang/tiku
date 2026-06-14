import type { AiCallLogRecord } from "@/server/contracts/ai-call-log/log-governance-contract";
import {
  createAiCallLogPagination,
  type AiCallLogRepository,
} from "@/server/repositories/ai-call-log/ai-call-log-repository";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";

export function createPostgresAiCallLogRepository(
  options: AdminAiAuditLogRuntimeRepositoryOptions = {},
): AiCallLogRepository {
  const repositories =
    createPostgresAdminAiAuditLogRuntimeRepositories(options);

  return {
    async listAiCallLogs(query) {
      const legacyResult = await repositories.listAiCallLogs({
        actionType: "all",
        aiFuncType: query.aiFuncType,
        callStatus: query.callStatus,
        keyword: null,
        level: query.level,
        page: query.page,
        pageSize: query.pageSize,
        profession: query.profession,
        resultStatus: "all",
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        targetResourceType: "all",
      });
      const filteredAiCallLogs = legacyResult.aiCallLogs
        .map<AiCallLogRecord>((aiCallLog) => ({
          aiFuncType: aiCallLog.aiFuncType,
          callStatus: aiCallLog.callStatus,
          completedAt: aiCallLog.completedAt,
          completionTokenCount: aiCallLog.completionTokenCount,
          estimatedCostCny: aiCallLog.estimatedCostCny,
          evidenceStatus: "none",
          latencyMs: aiCallLog.latencyMs,
          level: aiCallLog.level,
          modelAlias: aiCallLog.modelAlias,
          organizationPublicId: aiCallLog.organizationPublicId,
          outputSummary: aiCallLog.outputSummary,
          profession: aiCallLog.profession,
          promptSummary: aiCallLog.promptSummary,
          promptTokenCount: aiCallLog.promptTokenCount,
          providerDisplayName: aiCallLog.providerDisplayName,
          publicId: aiCallLog.publicId,
          startedAt: aiCallLog.startedAt,
          totalTokenCount: aiCallLog.totalTokenCount,
          userPublicId: aiCallLog.userPublicId,
        }))
        .filter(
          (aiCallLog) =>
            (query.organizationPublicId === null ||
              aiCallLog.organizationPublicId === query.organizationPublicId) &&
            (query.userPublicId === null ||
              aiCallLog.userPublicId === query.userPublicId),
        );

      return {
        aiCallLogs: filteredAiCallLogs,
        pagination: createAiCallLogPagination(query, filteredAiCallLogs.length),
      };
    },
  };
}
