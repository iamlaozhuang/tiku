import type {
  AuditLogListQuery,
  AuditLogRecord,
} from "@/server/contracts/audit-log/log-governance-contract";
import {
  createAuditLogPagination,
  type AuditLogRepository,
} from "@/server/repositories/audit-log/audit-log-repository";

export type InMemoryAuditLogRepositoryInput = {
  auditLogs: AuditLogRecord[];
};

export function createInMemoryAuditLogRepository(
  input: InMemoryAuditLogRepositoryInput,
): AuditLogRepository {
  const auditLogs = input.auditLogs.map(cloneAuditLogRecord);

  return {
    async listAuditLogs(query) {
      const filteredAuditLogs = auditLogs
        .filter((auditLog) => matchesAuditLogQuery(auditLog, query))
        .sort((leftAuditLog, rightAuditLog) =>
          compareAuditLogCreatedAt(leftAuditLog, rightAuditLog, query),
        );
      const pageStartIndex = (query.page - 1) * query.pageSize;
      const pagedAuditLogs = filteredAuditLogs
        .slice(pageStartIndex, pageStartIndex + query.pageSize)
        .map(cloneAuditLogRecord);

      return {
        auditLogs: pagedAuditLogs,
        pagination: createAuditLogPagination(query, filteredAuditLogs.length),
      };
    },
  };
}

function cloneAuditLogRecord(auditLog: AuditLogRecord): AuditLogRecord {
  return {
    ...auditLog,
  };
}

function compareAuditLogCreatedAt(
  leftAuditLog: AuditLogRecord,
  rightAuditLog: AuditLogRecord,
  query: AuditLogListQuery,
): number {
  const leftTimestamp = Date.parse(leftAuditLog.createdAt);
  const rightTimestamp = Date.parse(rightAuditLog.createdAt);
  const comparison = leftTimestamp - rightTimestamp;

  return query.sortOrder === "asc" ? comparison : -comparison;
}

function matchesAuditLogQuery(
  auditLog: AuditLogRecord,
  query: AuditLogListQuery,
): boolean {
  return (
    matchesTextFilter(auditLog.actionType, query.actionType) &&
    matchesTextFilter(auditLog.targetResourceType, query.targetResourceType) &&
    matchesNullableTextFilter(auditLog.actorPublicId, query.actorPublicId) &&
    matchesResultStatus(auditLog.resultStatus, query.resultStatus) &&
    matchesCreatedAtRange(auditLog.createdAt, query) &&
    matchesKeyword(auditLog, query.keyword)
  );
}

function matchesTextFilter(value: string, expected: string | "all"): boolean {
  return expected === "all" || value === expected;
}

function matchesNullableTextFilter(
  value: string,
  expected: string | null,
): boolean {
  return expected === null || value === expected;
}

function matchesResultStatus(
  value: AuditLogRecord["resultStatus"],
  expected: AuditLogListQuery["resultStatus"],
): boolean {
  return expected === "all" || value === expected;
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

function matchesKeyword(
  auditLog: AuditLogRecord,
  keyword: string | null,
): boolean {
  if (keyword === null) {
    return true;
  }

  const normalizedKeyword = keyword.toLowerCase();
  const searchableText = [
    auditLog.actionType,
    auditLog.actorPublicId,
    auditLog.actorRole,
    auditLog.targetResourceType,
    auditLog.targetPublicId ?? "",
    auditLog.resultStatus,
    auditLog.metadataSummary ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedKeyword);
}
