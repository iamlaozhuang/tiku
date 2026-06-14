import type {
  AiCallLogListQuery,
  AiCallLogRecord,
} from "@/server/contracts/ai-call-log/log-governance-contract";
import {
  createAiCallLogPagination,
  type AiCallLogRepository,
} from "@/server/repositories/ai-call-log/ai-call-log-repository";

export type InMemoryAiCallLogRepositoryInput = {
  aiCallLogs: AiCallLogRecord[];
};

export function createInMemoryAiCallLogRepository(
  input: InMemoryAiCallLogRepositoryInput,
): AiCallLogRepository {
  const aiCallLogs = input.aiCallLogs.map(cloneAiCallLogRecord);

  return {
    async listAiCallLogs(query) {
      const filteredAiCallLogs = aiCallLogs
        .filter((aiCallLog) => matchesAiCallLogQuery(aiCallLog, query))
        .sort((leftAiCallLog, rightAiCallLog) =>
          compareAiCallLogTime(leftAiCallLog, rightAiCallLog, query),
        );
      const pageStartIndex = (query.page - 1) * query.pageSize;
      const pagedAiCallLogs = filteredAiCallLogs
        .slice(pageStartIndex, pageStartIndex + query.pageSize)
        .map(cloneAiCallLogRecord);

      return {
        aiCallLogs: pagedAiCallLogs,
        pagination: createAiCallLogPagination(query, filteredAiCallLogs.length),
      };
    },
  };
}

function cloneAiCallLogRecord(aiCallLog: AiCallLogRecord): AiCallLogRecord {
  return {
    ...aiCallLog,
  };
}

function compareAiCallLogTime(
  leftAiCallLog: AiCallLogRecord,
  rightAiCallLog: AiCallLogRecord,
  query: AiCallLogListQuery,
): number {
  const leftValue =
    query.sortBy === "completedAt"
      ? (leftAiCallLog.completedAt ?? leftAiCallLog.startedAt)
      : leftAiCallLog.startedAt;
  const rightValue =
    query.sortBy === "completedAt"
      ? (rightAiCallLog.completedAt ?? rightAiCallLog.startedAt)
      : rightAiCallLog.startedAt;
  const comparison = Date.parse(leftValue) - Date.parse(rightValue);

  return query.sortOrder === "asc" ? comparison : -comparison;
}

function matchesAiCallLogQuery(
  aiCallLog: AiCallLogRecord,
  query: AiCallLogListQuery,
): boolean {
  return (
    matchesAiFunction(aiCallLog.aiFuncType, query.aiFuncType) &&
    matchesCallStatus(aiCallLog.callStatus, query.callStatus) &&
    matchesProfession(aiCallLog.profession, query.profession) &&
    matchesLevel(aiCallLog.level, query.level) &&
    matchesNullableTextFilter(
      aiCallLog.organizationPublicId,
      query.organizationPublicId,
    ) &&
    matchesNullableTextFilter(aiCallLog.userPublicId, query.userPublicId)
  );
}

function matchesAiFunction(
  value: AiCallLogRecord["aiFuncType"],
  expected: AiCallLogListQuery["aiFuncType"],
): boolean {
  return expected === "all" || value === expected;
}

function matchesCallStatus(
  value: AiCallLogRecord["callStatus"],
  expected: AiCallLogListQuery["callStatus"],
): boolean {
  return expected === "all" || value === expected;
}

function matchesProfession(
  value: AiCallLogRecord["profession"],
  expected: AiCallLogListQuery["profession"],
): boolean {
  return expected === "all" || value === expected;
}

function matchesLevel(value: number | null, expected: number | null): boolean {
  return expected === null || value === expected;
}

function matchesNullableTextFilter(
  value: string | null,
  expected: string | null,
): boolean {
  return expected === null || value === expected;
}
