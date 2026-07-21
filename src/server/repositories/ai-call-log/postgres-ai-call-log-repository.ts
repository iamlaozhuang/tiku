import type { ApiPagination } from "@/server/contracts/api-response";
import type {
  AiCallLogCostSummaryDto,
  AdminAiAuditLogListQuery,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type {
  AiCallLogListQuery,
  AiCallLogRecord,
} from "@/server/contracts/ai-call-log/log-governance-contract";
import {
  createAiCallLogPagination,
  type AiCallLogRepository,
} from "@/server/repositories/ai-call-log/ai-call-log-repository";
import {
  createPostgresAdminAiAuditLogRuntimeRepositories,
  type AdminAiAuditLogRuntimeRepositoryOptions,
} from "@/server/repositories/admin-ai-audit-log-runtime-repository";

export type AiCallLogFactQuery = AiCallLogListQuery &
  Pick<
    AdminAiAuditLogListQuery,
    "bucketType" | "fromStartedAt" | "toStartedAt"
  >;

export type PostgresAiCallLogRepository = AiCallLogRepository & {
  summarizeAiCallLogs(query: AiCallLogFactQuery): Promise<{
    dailySummaries: AiCallLogCostSummaryDto[];
    pagination: ApiPagination;
  }>;
};

export function createPostgresAiCallLogRepository(
  options: AdminAiAuditLogRuntimeRepositoryOptions = {},
): PostgresAiCallLogRepository {
  const repositories =
    createPostgresAdminAiAuditLogRuntimeRepositories(options);

  return {
    async listAiCallLogs(query: AiCallLogFactQuery) {
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
        organizationPublicId: query.organizationPublicId,
        userPublicId: query.userPublicId,
        fromStartedAt: query.fromStartedAt,
        toStartedAt: query.toStartedAt,
        bucketType: query.bucketType,
      });
      const aiCallLogs = legacyResult.aiCallLogs.map<AiCallLogRecord>(
        (aiCallLog) => ({
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
        }),
      );

      return {
        aiCallLogs,
        pagination: createAiCallLogPagination(
          query,
          legacyResult.pagination.total,
        ),
      };
    },

    async summarizeAiCallLogs(query) {
      return repositories.summarizeAiCallLogs({
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
        organizationPublicId: query.organizationPublicId,
        userPublicId: query.userPublicId,
        fromStartedAt: query.fromStartedAt,
        toStartedAt: query.toStartedAt,
        bucketType: query.bucketType,
      });
    },
  };
}
