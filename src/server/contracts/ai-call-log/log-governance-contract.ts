import type {
  ApiPagination,
  ApiResponse,
} from "@/server/contracts/api-response";
import type { EvidenceStatus } from "@/server/models/ai-rag";

export const AI_CALL_LOG_RETENTION_DAY = 180;

export type AiCallLogRole = "super_admin" | "ops_admin" | "content_admin";

export type AiCallLogFunctionType =
  | "ai_scoring"
  | "ai_explanation"
  | "ai_hint"
  | "kn_recommendation"
  | "learning_suggestion";

export type AiCallLogStatus = "success" | "failed";

export type AiCallLogProfession = "monopoly" | "marketing" | "logistics";

export type AiCallLogListQuery = {
  aiFuncType: AiCallLogFunctionType | "all";
  callStatus: AiCallLogStatus | "all";
  level: number | null;
  organizationPublicId: string | null;
  page: number;
  pageSize: 20 | 50 | 100;
  profession: AiCallLogProfession | "all";
  sortBy: "startedAt" | "completedAt";
  sortOrder: "asc" | "desc";
  userPublicId: string | null;
};

export type AiCallLogRetentionDto = {
  retentionDay: typeof AI_CALL_LOG_RETENTION_DAY;
  retentionSource: "advanced_ops_config_contract";
};

export type AiCallLogGovernanceHandoff = {
  aiCallLogRetentionDay: typeof AI_CALL_LOG_RETENTION_DAY;
  blockedCapabilities: [
    "raw_prompt_provider_response_viewer",
    "provider_model_request",
    "quota_use",
    "cost_calibration",
    "export_file_generation_download",
    "schema_migration",
  ];
  exportStatus: "blocked";
  providerExecutionStatus: "blocked";
  rawViewerStatus: "blocked";
  readOnly: true;
  status: "blocked";
};

export type AiCallLogRecord = {
  aiFuncType: AiCallLogFunctionType;
  callStatus: AiCallLogStatus;
  completedAt: string | null;
  completionTokenCount: number | null;
  databaseUrl?: unknown;
  estimatedCostCny: string | null;
  evidenceStatus: EvidenceStatus;
  internalNumericId?: number;
  latencyMs: number | null;
  level: number | null;
  modelAlias: string;
  organizationPublicId: string | null;
  outputSummary: string | null;
  profession: AiCallLogProfession | null;
  promptSummary: string | null;
  promptTokenCount: number | null;
  providerDisplayName: string;
  providerResponse?: unknown;
  publicId: string;
  rawPrompt?: unknown;
  startedAt: string;
  totalTokenCount: number | null;
  userPublicId: string | null;
};

export type AiCallLogDto = {
  aiFuncType: AiCallLogFunctionType;
  callStatus: AiCallLogStatus;
  completedAt: string | null;
  completionTokenCount: number | null;
  estimatedCostCny: string | null;
  evidenceStatus: EvidenceStatus;
  latencyMs: number | null;
  level: number | null;
  modelAlias: string;
  organizationPublicId: string | null;
  outputSummary: string | null;
  profession: AiCallLogProfession | null;
  promptSummary: string | null;
  promptTokenCount: number | null;
  providerDisplayName: string;
  publicId: string;
  redactionStatus: "redacted";
  retention: AiCallLogRetentionDto;
  startedAt: string;
  totalTokenCount: number | null;
  userPublicId: string | null;
  visibility: "summary_only";
};

export type AiCallLogDailySummaryDto = {
  aiFuncType: AiCallLogFunctionType;
  bucket: string;
  bucketType: "day";
  callCount: number;
  estimatedCostCny: string;
  evidenceStatusCounts: Record<EvidenceStatus, number>;
  failedCount: number;
  modelAlias: string;
  providerDisplayName: string;
  successCount: number;
  totalTokenCount: number;
};

export type AiCallLogListDto = {
  aiCallLogs: AiCallLogDto[];
  governance: AiCallLogGovernanceHandoff;
};

export type AiCallLogSummaryListDto = {
  dailySummaries: AiCallLogDailySummaryDto[];
  governance: AiCallLogGovernanceHandoff;
};

export type AiCallLogListResponse = ApiResponse<AiCallLogListDto> & {
  pagination: ApiPagination;
};

export type AiCallLogSummaryListResponse =
  ApiResponse<AiCallLogSummaryListDto> & {
    pagination: ApiPagination;
  };
