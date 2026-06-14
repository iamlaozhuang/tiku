import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";

export const AUDIT_LOG_RETENTION_DAY = 1095;

export type AuditLogRole = "super_admin" | "ops_admin" | "content_admin";

export type AuditLogResultStatus = "success" | "failed";

export type AuditLogListQuery = {
  actionType: string | "all";
  actorPublicId: string | null;
  fromCreatedAt: string | null;
  keyword: string | null;
  page: number;
  pageSize: 20 | 50 | 100;
  resultStatus: AuditLogResultStatus | "all";
  sortBy: "createdAt";
  sortOrder: "asc" | "desc";
  targetResourceType: string | "all";
  toCreatedAt: string | null;
};

export type AuditLogRetentionDto = {
  retentionDay: typeof AUDIT_LOG_RETENTION_DAY;
  retentionSource: "advanced_ops_config_contract";
};

export type AuditLogGovernanceHandoff = {
  auditLogRetentionDay: typeof AUDIT_LOG_RETENTION_DAY;
  blockedCapabilities: [
    "raw_prompt_provider_response_viewer",
    "raw_sensitive_viewer",
    "hard_delete_executor",
    "export_file_generation_download",
    "provider_env_secret",
    "schema_migration",
  ];
  exportStatus: "blocked";
  hardDeleteStatus: "blocked";
  rawViewerStatus: "blocked";
  readOnly: true;
  status: "blocked";
};

export type AuditLogRecord = {
  actionType: string;
  actorPublicId: string;
  actorRole: AuditLogRole | string;
  createdAt: string;
  databaseUrl?: unknown;
  internalNumericId?: number;
  metadataSummary: string | null;
  publicId: string;
  rawRequestBody?: unknown;
  requestIp: string | null;
  resultStatus: AuditLogResultStatus;
  secret?: unknown;
  targetPublicId: string | null;
  targetResourceType: string;
  token?: unknown;
};

export type AuditLogDto = {
  actionType: string;
  actorPublicId: string;
  actorRole: string;
  createdAt: string;
  metadataSummary: string | null;
  publicId: string;
  redactionStatus: "redacted";
  requestIp: string | null;
  resultStatus: AuditLogResultStatus;
  retention: AuditLogRetentionDto;
  targetPublicId: string | null;
  targetResourceType: string;
  visibility: "summary_only";
};

export type AuditLogListDto = {
  auditLogs: AuditLogDto[];
  governance: AuditLogGovernanceHandoff;
};

export type AuditLogListResponse = ApiResponse<AuditLogListDto> & {
  pagination: ApiPagination;
};
