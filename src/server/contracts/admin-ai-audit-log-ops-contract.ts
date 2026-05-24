import type { AiCallStatus } from "../models/ai-rag";
import type { Profession } from "../models/paper";

export const ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

export const ADMIN_AI_AUDIT_LOG_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "startedAt",
  "completedAt",
] as const;

export const ADMIN_AI_AUDIT_LOG_ERROR_CODES = {
  adminPermissionDenied: 403641,
  resourceNotFound: 404641,
  concurrentConflict: 409641,
  validationFailed: 422641,
} as const;

export type AdminAiAuditLogPageSize =
  (typeof ADMIN_AI_AUDIT_LOG_PAGE_SIZE_OPTIONS)[number];

export type AdminAiAuditLogSortField =
  (typeof ADMIN_AI_AUDIT_LOG_SORT_FIELDS)[number];

export type AdminAiAuditLogSortOrder = "asc" | "desc";

export type AdminAiFunctionType =
  | "ai_scoring"
  | "ai_explanation"
  | "ai_hint"
  | "kn_recommendation"
  | "learning_suggestion";

export type AdminAuditResultStatus = "success" | "failed";

export type AdminAiAuditLogListQuery = {
  page: number;
  pageSize: AdminAiAuditLogPageSize;
  sortBy: AdminAiAuditLogSortField;
  sortOrder: AdminAiAuditLogSortOrder;
  keyword: string | null;
  actionType: string | "all";
  targetResourceType: string | "all";
  resultStatus: AdminAuditResultStatus | "all";
  aiFuncType: AdminAiFunctionType | "all";
  callStatus: AiCallStatus | "all";
  profession: Profession | "all";
  level: number | null;
};

export type ModelConfigSummaryDto = {
  publicId: string;
  providerPublicId: string;
  providerDisplayName: string;
  providerKey: string;
  modelName: string;
  modelAlias: string;
  displayName: string;
  aiFuncType: AdminAiFunctionType;
  apiKeyDisplay: string | null;
  fallbackModelConfigPublicId: string | null;
  isEnabled: boolean;
  configVersion: number;
  timeoutSecond: number;
  maxRetryCount: number;
  updatedAt: string;
};

export type ModelConfigListDto = {
  modelConfigs: ModelConfigSummaryDto[];
};

export type AuditLogSummaryDto = {
  publicId: string;
  actorPublicId: string;
  actorRole: string;
  actionType: string;
  targetResourceType: string;
  targetPublicId: string | null;
  resultStatus: AdminAuditResultStatus;
  metadataSummary: string | null;
  requestIp: string | null;
  createdAt: string;
};

export type AuditLogListDto = {
  auditLogs: AuditLogSummaryDto[];
};

export type AiCallLogSummaryDto = {
  publicId: string;
  userPublicId: string | null;
  organizationPublicId: string | null;
  profession: Profession | null;
  level: number | null;
  aiFuncType: AdminAiFunctionType;
  callStatus: AiCallStatus;
  providerDisplayName: string;
  modelAlias: string;
  promptSummary: string | null;
  outputSummary: string | null;
  promptTokenCount: number | null;
  completionTokenCount: number | null;
  totalTokenCount: number | null;
  estimatedCostCny: string | null;
  latencyMs: number | null;
  startedAt: string;
  completedAt: string | null;
};

export type AiCallLogListDto = {
  aiCallLogs: AiCallLogSummaryDto[];
};

export type AiCallLogCostSummaryDto = {
  bucket: string;
  bucketType: "day" | "month";
  aiFuncType: AdminAiFunctionType;
  providerDisplayName: string;
  modelAlias: string;
  callCount: number;
  successCount: number;
  failedCount: number;
  totalTokenCount: number;
  estimatedCostCny: string;
};

export type AiCallLogSummaryListDto = {
  dailySummaries: AiCallLogCostSummaryDto[];
};

export function createAdminAiAuditLogListQuery(
  overrides: Partial<AdminAiAuditLogListQuery> = {},
): AdminAiAuditLogListQuery {
  const {
    actionType,
    keyword,
    resultStatus,
    targetResourceType,
    ...queryOverrides
  } = overrides;

  return {
    page: 1,
    pageSize: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
    aiFuncType: "all",
    callStatus: "all",
    profession: "all",
    level: null,
    ...queryOverrides,
    actionType:
      typeof actionType === "string" ? normalizeFilterText(actionType) : "all",
    resultStatus:
      resultStatus === "success" || resultStatus === "failed"
        ? resultStatus
        : "all",
    targetResourceType:
      typeof targetResourceType === "string"
        ? normalizeFilterText(targetResourceType)
        : "all",
    keyword: typeof keyword === "string" ? normalizeKeyword(keyword) : null,
  };
}

function normalizeKeyword(value: string): string | null {
  const keyword = value.trim();

  return keyword.length === 0 ? null : keyword;
}

function normalizeFilterText(value: string): string | "all" {
  const filterText = value.trim();

  return filterText.length === 0 ? "all" : filterText;
}
