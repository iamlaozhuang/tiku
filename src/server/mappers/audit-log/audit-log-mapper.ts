import {
  AUDIT_LOG_RETENTION_DAY,
  type AuditLogDto,
  type AuditLogRecord,
  type AuditLogRetentionDto,
} from "@/server/contracts/audit-log/log-governance-contract";

export function mapAuditLogRecordToDto(auditLog: AuditLogRecord): AuditLogDto {
  return {
    actionType: auditLog.actionType,
    actorPublicId: auditLog.actorPublicId,
    actorRole: auditLog.actorRole,
    createdAt: auditLog.createdAt,
    metadataSummary: auditLog.metadataSummary,
    publicId: auditLog.publicId,
    redactionStatus: "redacted",
    requestIp: auditLog.requestIp,
    resultStatus: auditLog.resultStatus,
    retention: createAuditLogRetentionDto(),
    targetPublicId: auditLog.targetPublicId,
    targetResourceType: auditLog.targetResourceType,
    visibility: "summary_only",
  };
}

export function createAuditLogRetentionDto(): AuditLogRetentionDto {
  return {
    retentionDay: AUDIT_LOG_RETENTION_DAY,
    retentionSource: "advanced_ops_config_contract",
  };
}
