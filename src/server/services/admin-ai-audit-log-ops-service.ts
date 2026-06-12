import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  type ApiPagination,
  type ApiResponse,
} from "../contracts/api-response";
import {
  ADMIN_AI_AUDIT_LOG_ERROR_CODES,
  type AdminAiAuditLogListQuery,
  type AiCallLogListDto,
  type AiCallLogSummaryListDto,
  type AuditLogListDto,
  type ModelConfigListDto,
} from "../contracts/admin-ai-audit-log-ops-contract";
import { attachModelConfigRuntimeAlignment } from "./model-config-runtime";

export type AdminAiAuditLogOpsRole =
  | "super_admin"
  | "ops_admin"
  | "content_admin";

export type AdminAiAuditLogOpsActor = {
  publicId: string;
  roles: AdminAiAuditLogOpsRole[];
  status?: "active" | "disabled";
};

export type AdminAiAuditLogOpsServiceContext = {
  actor: AdminAiAuditLogOpsActor;
};

export type AdminAiAuditLogApiResponse<TData> = Omit<
  ApiResponse<TData>,
  "pagination"
> & {
  pagination?: ApiPagination | null;
};

export type AdminAiAuditLogOpsService = {
  listModelConfigs(
    query: Partial<AdminAiAuditLogListQuery>,
  ): Promise<AdminAiAuditLogApiResponse<ModelConfigListDto | null>>;
  listAuditLogs(
    query: Partial<AdminAiAuditLogListQuery>,
  ): Promise<AdminAiAuditLogApiResponse<AuditLogListDto | null>>;
  listAiCallLogs(
    query: Partial<AdminAiAuditLogListQuery>,
  ): Promise<AdminAiAuditLogApiResponse<AiCallLogListDto | null>>;
  summarizeAiCallLogs(
    query: Partial<AdminAiAuditLogListQuery>,
  ): Promise<AdminAiAuditLogApiResponse<AiCallLogSummaryListDto | null>>;
  enableModelConfig(publicId: string): Promise<ApiResponse<null>>;
  disableModelConfig(publicId: string): Promise<ApiResponse<null>>;
};

const unavailableResponse = {
  code: 503641,
  message: "Admin AI and audit log runtime is not configured.",
  data: null,
  pagination: null,
} as const;

const sampleModelConfigs: ModelConfigListDto["modelConfigs"] = [
  {
    publicId: "model-config-public-001",
    providerPublicId: "model-provider-public-001",
    providerDisplayName: "通义千问",
    providerKey: "alibaba",
    modelName: "qwen-plus",
    modelAlias: "qwen-plus",
    displayName: "通义千问评分模型",
    aiFuncType: "ai_scoring",
    apiKeyDisplay: "****1234",
    secretStatus: "configured",
    maskedSecret: "****1234",
    fallbackModelConfigPublicId: null,
    isEnabled: true,
    status: "enabled",
    fallbackPriority: 0,
    snapshotPolicy: "redacted_metadata",
    configVersion: 3,
    timeoutSecond: 30,
    maxRetryCount: 2,
    updatedAt: "2026-05-21T08:00:00.000Z",
  },
  {
    publicId: "model-config-public-002",
    providerPublicId: "model-provider-public-001",
    providerDisplayName: "通义千问",
    providerKey: "alibaba",
    modelName: "qwen-turbo",
    modelAlias: "qwen-turbo",
    displayName: "通义千问备用模型",
    aiFuncType: "ai_explanation",
    apiKeyDisplay: "****5678",
    secretStatus: "configured",
    maskedSecret: "****5678",
    fallbackModelConfigPublicId: "model-config-public-003",
    isEnabled: true,
    status: "enabled",
    fallbackPriority: 10,
    snapshotPolicy: "redacted_metadata",
    configVersion: 1,
    timeoutSecond: 20,
    maxRetryCount: 1,
    updatedAt: "2026-05-20T08:00:00.000Z",
  },
  {
    publicId: "model-config-public-003",
    providerPublicId: "model-provider-public-001",
    providerDisplayName: "通义千问",
    providerKey: "alibaba",
    modelName: "qwen-turbo-fallback",
    modelAlias: "qwen-turbo-fallback",
    displayName: "通义千问讲解备用模型",
    aiFuncType: "ai_explanation",
    apiKeyDisplay: "****5678",
    secretStatus: "configured",
    maskedSecret: "****5678",
    fallbackModelConfigPublicId: null,
    isEnabled: false,
    status: "disabled",
    fallbackPriority: 20,
    snapshotPolicy: "redacted_metadata",
    configVersion: 1,
    timeoutSecond: 20,
    maxRetryCount: 1,
    updatedAt: "2026-05-20T08:00:00.000Z",
  },
];

const sampleAuditLogs: AuditLogListDto["auditLogs"] = [
  {
    publicId: "audit-log-public-001",
    actorPublicId: "admin-super-001",
    actorRole: "super_admin",
    actionType: "model_config.enable",
    targetResourceType: "model_config",
    targetPublicId: "model-config-public-001",
    resultStatus: "success",
    metadataSummary: "redacted model_config operation metadata",
    requestIp: "127.0.0.1",
    createdAt: "2026-05-21T08:30:00.000Z",
  },
];

const sampleAiCallLogs: AiCallLogListDto["aiCallLogs"] = [
  {
    publicId: "ai-call-log-public-001",
    userPublicId: "user-public-001",
    organizationPublicId: "organization-public-001",
    profession: "marketing",
    level: 3,
    aiFuncType: "ai_scoring",
    callStatus: "success",
    providerDisplayName: "通义千问",
    modelAlias: "qwen-plus",
    promptSummary: "已按策略脱敏",
    outputSummary: "已按策略脱敏",
    promptTokenCount: 1200,
    completionTokenCount: 500,
    totalTokenCount: 1700,
    estimatedCostCny: "0.30",
    latencyMs: 850,
    startedAt: "2026-05-21T09:00:00.000Z",
    completedAt: "2026-05-21T09:00:01.000Z",
  },
];

const sampleAiCallLogSummaries: AiCallLogSummaryListDto["dailySummaries"] = [
  {
    bucket: "2026-05-21",
    bucketType: "day",
    aiFuncType: "ai_scoring",
    providerDisplayName: "通义千问",
    modelAlias: "qwen-plus",
    callCount: 12,
    successCount: 11,
    failedCount: 1,
    totalTokenCount: 20400,
    estimatedCostCny: "3.60",
  },
];

const samplePromptTemplates = [
  {
    publicId: "prompt-template-public-001",
    promptTemplateKey: "ai_scoring_admin_v3",
    aiFuncType: "ai_scoring",
    version: 3,
    title: "评分模板",
    description: null,
    bodyDigest: "sha256-scoring-admin-v3",
    bodyPreviewMasked: "[redacted]",
    status: "active",
    isActive: true,
    updatedAt: "2026-05-21T08:00:00.000Z",
  },
] satisfies Parameters<
  typeof attachModelConfigRuntimeAlignment
>[0]["promptTemplates"];

function createPagination(
  query: Partial<AdminAiAuditLogListQuery>,
  total: number,
): ApiPagination {
  return {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    sortBy: query.sortBy ?? "updatedAt",
    sortOrder: query.sortOrder ?? "desc",
    total,
  };
}

function canManageModelConfig(actor: AdminAiAuditLogOpsActor): boolean {
  return (
    (actor.status ?? "active") === "active" &&
    actor.roles.includes("super_admin")
  );
}

function findSampleModelConfigByPublicId(publicId: string) {
  return (
    sampleModelConfigs.find(
      (modelConfig) => modelConfig.publicId === publicId,
    ) ?? null
  );
}

export function createAdminAiAuditLogOpsService({
  actor,
}: AdminAiAuditLogOpsServiceContext): AdminAiAuditLogOpsService {
  return {
    async listModelConfigs(query) {
      const modelConfigs = attachModelConfigRuntimeAlignment({
        modelConfigs: sampleModelConfigs,
        promptTemplates: samplePromptTemplates,
      });

      return createPaginatedResponse(
        { modelConfigs },
        createPagination(query, modelConfigs.length),
      );
    },
    async listAuditLogs(query) {
      return createPaginatedResponse(
        { auditLogs: sampleAuditLogs },
        createPagination(query, sampleAuditLogs.length),
      );
    },
    async listAiCallLogs(query) {
      return createPaginatedResponse(
        { aiCallLogs: sampleAiCallLogs },
        createPagination(query, sampleAiCallLogs.length),
      );
    },
    async summarizeAiCallLogs(query) {
      return createPaginatedResponse(
        { dailySummaries: sampleAiCallLogSummaries },
        createPagination(query, sampleAiCallLogSummaries.length),
      );
    },
    async enableModelConfig(publicId) {
      if (!canManageModelConfig(actor)) {
        return createErrorResponse(
          ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
          "Admin permission denied.",
        );
      }

      if (findSampleModelConfigByPublicId(publicId) === null) {
        return createErrorResponse(
          ADMIN_AI_AUDIT_LOG_ERROR_CODES.resourceNotFound,
          "Admin resource not found.",
        );
      }

      return createSuccessResponse(null);
    },
    async disableModelConfig(publicId) {
      if (!canManageModelConfig(actor)) {
        return createErrorResponse(
          ADMIN_AI_AUDIT_LOG_ERROR_CODES.adminPermissionDenied,
          "Admin permission denied.",
        );
      }

      if (findSampleModelConfigByPublicId(publicId) === null) {
        return createErrorResponse(
          ADMIN_AI_AUDIT_LOG_ERROR_CODES.resourceNotFound,
          "Admin resource not found.",
        );
      }

      return createSuccessResponse(null);
    },
  };
}

export function createUnavailableAdminAiAuditLogOpsService(): AdminAiAuditLogOpsService {
  return {
    async listModelConfigs() {
      return unavailableResponse;
    },
    async listAuditLogs() {
      return unavailableResponse;
    },
    async listAiCallLogs() {
      return unavailableResponse;
    },
    async summarizeAiCallLogs() {
      return unavailableResponse;
    },
    async enableModelConfig() {
      return createErrorResponse(
        unavailableResponse.code,
        unavailableResponse.message,
      );
    },
    async disableModelConfig() {
      return createErrorResponse(
        unavailableResponse.code,
        unavailableResponse.message,
      );
    },
  };
}
