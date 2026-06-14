import type {
  AiCallLogListQuery,
  AiCallLogRecord,
} from "@/server/contracts/ai-call-log/log-governance-contract";
import type { ApiPagination } from "@/server/contracts/api-response";

export type AiCallLogRepositoryListResult = {
  aiCallLogs: AiCallLogRecord[];
  pagination: ApiPagination;
};

export type AiCallLogRepository = {
  listAiCallLogs(
    query: AiCallLogListQuery,
  ): Promise<AiCallLogRepositoryListResult>;
};

export function createAiCallLogPagination(
  query: AiCallLogListQuery,
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
