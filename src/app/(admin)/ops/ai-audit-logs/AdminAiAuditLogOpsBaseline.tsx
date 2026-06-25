"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AdminModelConfigManagement,
  type ModelConfigFormInput,
  type ModelProviderFormInput,
  type PromptTemplateFormInput,
} from "@/features/admin/model-config-management/AdminModelConfigManagement";
import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  AiCallLogCostSummaryDto,
  AiCallLogListDto,
  AuditLogSummaryDto,
  AuditLogListDto,
  ModelConfigListDto,
  ModelConfigSummaryDto,
  ModelProviderListDto,
  ModelProviderSummaryDto,
  PromptTemplateListDto,
  PromptTemplateSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";
import type { PersonalAiGenerationFormalAdoptionReviewDto } from "@/server/contracts/personal-ai-generation-formal-adoption-contract";

type AdminAiAuditLogOpsState = "ready" | "loading" | "empty" | "error";
type AdminFormalAdoptionReviewState = "idle" | "loading" | "success" | "error";

type AdminAiAuditRuntimeData = {
  aiCallLogs: AiCallLogListDto["aiCallLogs"];
  auditLogs: AuditLogListDto["auditLogs"];
  costSummaries: AiCallLogCostSummaryDto[];
  modelConfigs: ModelConfigListDto["modelConfigs"];
  modelProviders: ModelProviderListDto["modelProviders"];
  promptTemplates: PromptTemplateListDto["promptTemplates"];
};

const sessionTokenStorageKey = "tiku.localSessionToken";
const runtimeQuery = "page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc";
const formalAdoptionTargetResourceType = "personal_ai_generation_result";
const formalAdoptionReviewTargetType = "question";
const formalAdoptionReviewReasonCategory = "content_quality_passed";

const adminOpsDefinitionLabelMap: Record<string, string> = {
  formalTargetWriteStatus: "正式写入状态",
  redactionStatus: "脱敏状态",
  reviewStatus: "复核状态",
};

const adminOpsDisplayValueMap: Record<string, string> = {
  ai_scoring: "AI 评分",
  approved_for_manual_adoption: "已通过人工入库复核",
  awaiting_metadata_review: "等待元数据复核",
  blocked_without_follow_up_task: "待后续任务审批",
  metadata_only: "仅元数据",
  "metadata-only": "仅元数据",
  model_config: "模型配置",
  "model_config.enable": "启用模型配置",
  personal_ai_generation_result: "个人 AI 训练结果",
  "personal_ai_generation_result.formal_adoption_review.ready":
    "正式入库复核就绪",
  redacted: "已脱敏",
  success: "成功",
  summary_only: "仅摘要",
};

function formatAdminOpsDisplayValue(value: string) {
  return adminOpsDisplayValueMap[value] ?? value;
}

const staticRuntimeData: AdminAiAuditRuntimeData = {
  modelProviders: [
    {
      publicId: "model-provider-public-001",
      providerKey: "qwen",
      displayName: "通义千问",
      baseUrl: null,
      isEnabled: true,
      secretStatus: "configured",
      maskedSecret: "****1234",
      providerMetadata: { runtime: "local_preview" },
      updatedAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  modelConfigs: [
    {
      publicId: "model-config-public-001",
      providerPublicId: "model-provider-public-001",
      providerDisplayName: "通义千问",
      providerKey: "qwen",
      modelName: "qwen-plus",
      modelAlias: "qwen-plus",
      displayName: "通义千问评分模型",
      aiFuncType: "ai_scoring",
      apiKeyDisplay: "****1234",
      secretStatus: "configured",
      maskedSecret: "****1234",
      fallbackModelConfigPublicId: "model-config-public-002",
      isEnabled: true,
      status: "enabled",
      fallbackPriority: 10,
      snapshotPolicy: "redacted_metadata",
      configVersion: 1,
      timeoutSecond: 15,
      maxRetryCount: 1,
      updatedAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  promptTemplates: [
    {
      publicId: "prompt-template-public-001",
      promptTemplateKey: "ai_scoring_v1",
      aiFuncType: "ai_scoring",
      version: 1,
      title: "AI scoring v1",
      description: "Metadata only",
      bodyDigest: "sha256:redacted",
      bodyPreviewMasked: "Scoring template preview [redacted]",
      status: "active",
      isActive: true,
      updatedAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  auditLogs: [
    {
      publicId: "audit-log-formal-review-candidate-public-001",
      actorPublicId: "admin-content-public-001",
      actorRole: "content_admin",
      actionType: "personal_ai_generation_result.formal_adoption_review.ready",
      targetResourceType: formalAdoptionTargetResourceType,
      targetPublicId: "personal_ai_result_public_admin_901",
      resultStatus: "success",
      metadataSummary: "redacted formal adoption candidate metadata",
      requestIp: null,
      createdAt: "2026-05-21T08:00:00.000Z",
    },
    {
      publicId: "audit-log-public-001",
      actorPublicId: "admin-super-001",
      actorRole: "super_admin",
      actionType: "model_config.enable",
      targetResourceType: "model_config",
      targetPublicId: "model-config-public-001",
      resultStatus: "success",
      metadataSummary: "redacted model_config mutation metadata",
      requestIp: null,
      createdAt: "2026-05-21T08:00:00.000Z",
    },
  ],
  aiCallLogs: [
    {
      publicId: "ai-call-log-public-001",
      userPublicId: null,
      organizationPublicId: null,
      profession: "monopoly",
      level: 3,
      aiFuncType: "ai_scoring",
      callStatus: "success",
      providerDisplayName: "通义千问",
      modelAlias: "qwen-plus",
      promptSummary: "redacted prompt and answer snapshot",
      outputSummary: "redacted scoring snapshot",
      promptTokenCount: 900,
      completionTokenCount: 800,
      totalTokenCount: 1700,
      estimatedCostCny: "3.60",
      latencyMs: 1200,
      startedAt: "2026-05-21T08:00:00.000Z",
      completedAt: "2026-05-21T08:00:01.200Z",
    },
  ],
  costSummaries: [
    {
      bucket: "2026-05-21",
      bucketType: "day",
      aiFuncType: "ai_scoring",
      providerDisplayName: "通义千问",
      modelAlias: "qwen-plus",
      callCount: 12,
      successCount: 12,
      failedCount: 0,
      totalTokenCount: 1700,
      estimatedCostCny: "3.60",
    },
  ],
};

export function AdminAiAuditLogOpsBaseline({
  runtimeEnabled = false,
  state = "ready",
}: {
  runtimeEnabled?: boolean;
  state?: AdminAiAuditLogOpsState;
}) {
  const [runtimeState, setRuntimeState] =
    useState<AdminAiAuditLogOpsState>(state);
  const [runtimeData, setRuntimeData] =
    useState<AdminAiAuditRuntimeData>(staticRuntimeData);
  const [formalAdoptionReviewState, setFormalAdoptionReviewState] =
    useState<AdminFormalAdoptionReviewState>("idle");
  const [formalAdoptionReview, setFormalAdoptionReview] = useState<
    PersonalAiGenerationFormalAdoptionReviewDto["adoptionReview"] | null
  >(null);
  const shouldLoadRuntimeData = runtimeEnabled && state === "ready";
  const effectiveRuntimeState = shouldLoadRuntimeData ? runtimeState : state;
  const formalAdoptionReviewCandidate = useMemo(
    () => findFormalAdoptionReviewCandidate(runtimeData.auditLogs),
    [runtimeData.auditLogs],
  );
  const managementKey = [
    runtimeData.modelProviders.map((provider) => provider.publicId).join(","),
    runtimeData.modelConfigs
      .map((modelConfig) => modelConfig.publicId)
      .join(","),
    runtimeData.promptTemplates
      .map((promptTemplate) => promptTemplate.publicId)
      .join(","),
  ].join("|");

  useEffect(() => {
    if (!shouldLoadRuntimeData) {
      return;
    }

    let isCurrentLoad = true;
    const storedSessionToken = readStoredSessionToken();

    if (storedSessionToken === null) {
      queueMicrotask(() => {
        if (isCurrentLoad) {
          setRuntimeState("error");
        }
      });
      return;
    }

    queueMicrotask(() => {
      if (isCurrentLoad) {
        setRuntimeState("loading");
      }
    });

    loadRuntimeData(storedSessionToken)
      .then((loadedData) => {
        if (!isCurrentLoad) {
          return;
        }

        setRuntimeData(loadedData);
        setRuntimeState(hasAnyRuntimeData(loadedData) ? "ready" : "empty");
      })
      .catch(() => {
        if (!isCurrentLoad) {
          return;
        }

        setRuntimeState("error");
      });

    return () => {
      isCurrentLoad = false;
    };
  }, [shouldLoadRuntimeData]);

  const runtimeCallbacks = useMemo(() => {
    if (!runtimeEnabled) {
      return {};
    }

    return createRuntimeCallbacks();
  }, [runtimeEnabled]);

  async function handleSubmitFormalAdoptionReview() {
    if (formalAdoptionReviewCandidate === null) {
      return;
    }

    setFormalAdoptionReview(null);
    setFormalAdoptionReviewState("loading");

    try {
      const response =
        await postAdminApi<PersonalAiGenerationFormalAdoptionReviewDto>(
          `/api/v1/personal-ai-generation-results/${encodeURIComponent(
            formalAdoptionReviewCandidate.targetPublicId,
          )}/formal-adoption-reviews`,
          readRequiredSessionToken(),
          {
            reviewDecision: "approved",
            reviewReasonCategory: formalAdoptionReviewReasonCategory,
            reviewerConfirmed: true,
            targetType: formalAdoptionReviewTargetType,
          },
        );

      setFormalAdoptionReview(readApiData(response).adoptionReview);
      setFormalAdoptionReviewState("success");
    } catch {
      setFormalAdoptionReviewState("error");
    }
  }

  if (effectiveRuntimeState === "loading") {
    return (
      <AdminOpsStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载 AI 与日志运营数据"
      />
    );
  }

  if (effectiveRuntimeState === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无 AI 与日志运营数据"
      />
    );
  }

  if (effectiveRuntimeState === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="AI 与日志运营数据加载失败"
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-ai-audit-runtime-ready">
      <header className="flex flex-col gap-2">
        <p className="text-brand-primary text-sm font-medium">AI 配置与日志</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          AI 配置与日志运营
        </h1>
        <p className="text-text-secondary max-w-3xl text-sm leading-6">
          模型配置、Prompt 模板、审计日志与 AI
          调用日志均通过本地受保护接口加载；页面默认折叠标识符值，仅展示脱敏摘要和状态语义。
        </p>
      </header>

      <AdminModelConfigManagement
        key={managementKey}
        initialModelConfigs={runtimeData.modelConfigs}
        initialModelProviders={runtimeData.modelProviders}
        initialPromptTemplates={runtimeData.promptTemplates}
        {...runtimeCallbacks}
      />

      <AdminFormalAdoptionReviewPanel
        candidate={formalAdoptionReviewCandidate}
        review={formalAdoptionReview}
        state={formalAdoptionReviewState}
        onSubmit={() => void handleSubmitFormalAdoptionReview()}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminOpsPanel title="审计日志">
          <p className="text-text-muted mb-2 text-xs">审计日志只读</p>
          {runtimeData.auditLogs.map((auditLog) => (
            <AdminOpsSummaryRow
              key={auditLog.publicId}
              label={formatAdminOpsDisplayValue(auditLog.actionType)}
              meta={[
                "标识符已隐藏",
                formatAdminOpsDisplayValue(auditLog.targetResourceType),
                formatAdminOpsDisplayValue(auditLog.resultStatus),
                auditLog.metadataSummary ?? "已脱敏元数据",
              ].join(" / ")}
              badges={["metadata-only", "redacted", "summary_only"]}
              publicId={auditLog.publicId}
              testId={`admin-audit-log-${auditLog.publicId}`}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="AI 调用日志">
          <p className="text-text-muted mb-2 text-xs">AI 调用日志只读</p>
          {runtimeData.aiCallLogs.map((aiCallLog) => (
            <AdminOpsSummaryRow
              key={aiCallLog.publicId}
              label={formatAdminOpsDisplayValue(aiCallLog.aiFuncType)}
              meta={[
                aiCallLog.providerDisplayName,
                aiCallLog.modelAlias,
                formatAdminOpsDisplayValue(aiCallLog.callStatus),
                `Token 数：${aiCallLog.totalTokenCount ?? 0}`,
                aiCallLog.promptSummary ?? "Prompt 摘要已脱敏",
              ].join(" / ")}
              publicId={aiCallLog.publicId}
              testId={`admin-ai-call-log-${aiCallLog.publicId}`}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="成本汇总">
          {runtimeData.costSummaries.map((costSummary) => (
            <AdminOpsSummaryRow
              key={[
                costSummary.bucket,
                costSummary.aiFuncType,
                costSummary.modelAlias,
              ].join("-")}
              label={`${costSummary.bucket} / ${formatAdminOpsDisplayValue(
                costSummary.aiFuncType,
              )}`}
              meta={[
                costSummary.providerDisplayName,
                costSummary.modelAlias,
                `调用次数：${costSummary.callCount}`,
                `预估成本：${costSummary.estimatedCostCny} 元`,
              ].join(" / ")}
              publicId={`${costSummary.bucket}-${costSummary.aiFuncType}`}
            />
          ))}
        </AdminOpsPanel>
      </div>
    </div>
  );
}

function findFormalAdoptionReviewCandidate(
  auditLogs: AuditLogSummaryDto[],
): { targetPublicId: string } | null {
  const candidate = auditLogs.find(
    (auditLog) =>
      auditLog.targetResourceType === formalAdoptionTargetResourceType &&
      auditLog.targetPublicId !== null,
  );

  return candidate?.targetPublicId === undefined ||
    candidate.targetPublicId === null
    ? null
    : { targetPublicId: candidate.targetPublicId };
}

async function loadRuntimeData(
  sessionToken: string,
): Promise<AdminAiAuditRuntimeData> {
  const [
    modelProviders,
    modelConfigs,
    promptTemplates,
    auditLogs,
    aiCallLogs,
    costSummaries,
  ] = await Promise.all([
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<ModelProviderListDto>(
            `/api/v1/model-providers?${runtimeQuery}`,
            sessionToken,
          ),
        ).modelProviders,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<ModelConfigListDto>(
            `/api/v1/model-configs?${runtimeQuery}`,
            sessionToken,
          ),
        ).modelConfigs,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<PromptTemplateListDto>(
            `/api/v1/prompt-templates?${runtimeQuery}`,
            sessionToken,
          ),
        ).promptTemplates,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<AuditLogListDto>(
            `/api/v1/audit-logs?${runtimeQuery}`,
            sessionToken,
          ),
        ).auditLogs,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<AiCallLogListDto>(
            `/api/v1/ai-call-logs?${runtimeQuery}`,
            sessionToken,
          ),
        ).aiCallLogs,
      [],
    ),
    loadOptionalRuntimeData(
      async () =>
        readApiData(
          await fetchAdminApi<{ dailySummaries: AiCallLogCostSummaryDto[] }>(
            `/api/v1/ai-call-logs/summary?${runtimeQuery}`,
            sessionToken,
          ),
        ).dailySummaries,
      [],
    ),
  ]);

  return {
    modelProviders,
    modelConfigs,
    promptTemplates,
    auditLogs,
    aiCallLogs,
    costSummaries,
  };
}

async function loadOptionalRuntimeData<TData>(
  loader: () => Promise<TData>,
  fallbackData: TData,
): Promise<TData> {
  try {
    return await loader();
  } catch {
    return fallbackData;
  }
}

function createRuntimeCallbacks() {
  return {
    onSaveProvider: async (
      form: ModelProviderFormInput,
    ): Promise<ModelProviderSummaryDto> => {
      const response = await postAdminApi<{
        modelProvider: ModelProviderSummaryDto;
      }>("/api/v1/model-providers", readRequiredSessionToken(), {
        baseUrl: form.baseUrl,
        displayName: form.displayName,
        isEnabled: true,
        providerKey: form.providerKey,
        secretValue: form.secretValue,
      });

      return readApiData(response).modelProvider;
    },
    onSaveConfig: async (
      form: ModelConfigFormInput,
    ): Promise<ModelConfigSummaryDto> => {
      const response = await postAdminApi<{
        modelConfig: ModelConfigSummaryDto;
      }>("/api/v1/model-configs", readRequiredSessionToken(), {
        aiFuncType: form.aiFuncType,
        configVersion: 1,
        displayName: form.displayName,
        fallbackModelConfigPublicId: form.fallbackModelConfigPublicId,
        fallbackPriority: Number.parseInt(form.fallbackPriority, 10) || 0,
        isEnabled: true,
        maxRetryCount: 1,
        modelAlias: form.modelAlias,
        modelName: form.modelName,
        modelProviderPublicId: form.modelProviderPublicId,
        status: "enabled",
        timeoutSecond: 15,
      });

      return readApiData(response).modelConfig;
    },
    onSaveTemplate: async (
      form: PromptTemplateFormInput,
    ): Promise<PromptTemplateSummaryDto> => {
      const response = await postAdminApi<{
        promptTemplate: PromptTemplateSummaryDto;
      }>("/api/v1/prompt-templates", readRequiredSessionToken(), {
        aiFuncType: "ai_explanation",
        bodyDigest: form.bodyDigest,
        bodyPreviewMasked: form.bodyPreviewMasked,
        description: "Metadata only",
        isActive: true,
        promptTemplateKey: form.promptTemplateKey,
        status: "active",
        title: form.title,
        version: 1,
      });

      return readApiData(response).promptTemplate;
    },
    onToggleConfig: (publicId: string, isEnabled: boolean) =>
      postAdminAction(
        `/api/v1/model-configs/${publicId}/${isEnabled ? "enable" : "disable"}`,
        readRequiredSessionToken(),
      ),
    onToggleProvider: (publicId: string, isEnabled: boolean) =>
      postAdminAction(
        `/api/v1/model-providers/${publicId}/${isEnabled ? "enable" : "disable"}`,
        readRequiredSessionToken(),
      ),
    onToggleTemplate: (publicId: string, isActive: boolean) =>
      postAdminAction(
        `/api/v1/prompt-templates/${publicId}/${isActive ? "enable" : "disable"}`,
        readRequiredSessionToken(),
      ),
  };
}

function readStoredSessionToken(): string | null {
  return localStorage.getItem(sessionTokenStorageKey)?.trim() || null;
}

function readRequiredSessionToken(): string {
  const sessionToken = readStoredSessionToken();

  if (sessionToken === null) {
    throw new Error("Admin session is required.");
  }

  return sessionToken;
}

async function fetchAdminApi<TData>(
  path: string,
  sessionToken: string,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function postAdminApi<TData>(
  path: string,
  sessionToken: string,
  body: Record<string, unknown>,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "POST",
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function postAdminAction(
  path: string,
  sessionToken: string,
): Promise<void> {
  const response = await postAdminApi<null>(path, sessionToken, {});

  ensureApiSuccess(response);
}

function ensureApiSuccess(response: ApiResponse<unknown>): void {
  if (response.code !== 0) {
    throw new Error(response.message);
  }
}

function readApiData<TData>(response: ApiResponse<TData | null>): TData {
  if (response.code !== 0 || response.data === null) {
    throw new Error(response.message);
  }

  return response.data;
}

function hasAnyRuntimeData(data: AdminAiAuditRuntimeData): boolean {
  return (
    data.modelProviders.length > 0 ||
    data.modelConfigs.length > 0 ||
    data.promptTemplates.length > 0 ||
    data.auditLogs.length > 0 ||
    data.aiCallLogs.length > 0 ||
    data.costSummaries.length > 0
  );
}

function AdminFormalAdoptionReviewPanel({
  candidate,
  onSubmit,
  review,
  state,
}: {
  candidate: { targetPublicId: string } | null;
  onSubmit: () => void;
  review: PersonalAiGenerationFormalAdoptionReviewDto["adoptionReview"] | null;
  state: AdminFormalAdoptionReviewState;
}) {
  const isSubmitting = state === "loading";
  const reviewStatus = review?.reviewStatus ?? "awaiting_metadata_review";
  const formalTargetWriteStatus =
    review?.formalTargetWriteStatus ?? "blocked_without_follow_up_task";
  const redactionStatus = review?.sourceReference.redactionStatus ?? "redacted";

  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 className="text-text-primary text-base font-semibold">
            正式入库复核
          </h2>
          <p className="text-text-secondary max-w-3xl text-sm leading-6">
            仅提交元数据人工复核，结果保持脱敏；正式题库写入仍被后续任务阻断。
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminOpsStatusBadge label="metadata-only" />
            <AdminOpsStatusBadge label={redactionStatus} />
            <AdminOpsStatusBadge label={formalTargetWriteStatus} />
          </div>
        </div>
        <button
          type="button"
          disabled={candidate === null || isSubmitting}
          onClick={onSubmit}
          className="bg-secondary text-secondary-foreground flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          提交元数据复核
        </button>
      </div>

      <dl className="border-border mt-4 grid gap-0 rounded-md border px-3 md:grid-cols-3">
        <AdminOpsDefinition label="reviewStatus" value={reviewStatus} />
        <AdminOpsDefinition
          label="formalTargetWriteStatus"
          value={formalTargetWriteStatus}
        />
        <AdminOpsDefinition label="redactionStatus" value={redactionStatus} />
      </dl>

      {candidate === null ? (
        <p className="text-text-muted mt-3 text-sm">暂无可复核的脱敏结果</p>
      ) : null}
      {state === "loading" ? (
        <p className="text-brand-primary mt-3 text-sm font-medium">
          正式入库复核提交中
        </p>
      ) : null}
      {state === "error" ? (
        <p className="text-warning bg-warning/10 mt-3 rounded-lg px-3 py-2 text-sm font-medium">
          正式入库复核暂不可用
        </p>
      ) : null}
    </section>
  );
}

function AdminOpsStatePanel({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="bg-surface border-border rounded-md border p-8 text-center shadow-sm">
      <div className="text-brand-primary mx-auto flex justify-center">
        {icon}
      </div>
      <h1 className="text-text-primary mt-4 text-base font-semibold">
        {title}
      </h1>
    </div>
  );
}

function AdminOpsStatusBadge({ label }: { label: string }) {
  return (
    <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
      {formatAdminOpsDisplayValue(label)}
    </span>
  );
}

function AdminOpsDefinition({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-border border-b py-3 last:border-b-0 md:border-r md:border-b-0 md:px-3 md:first:pl-0 md:last:border-r-0">
      <dt className="text-text-muted text-xs">
        {adminOpsDefinitionLabelMap[label] ?? label}
      </dt>
      <dd className="text-text-primary mt-1 text-sm font-medium">
        {formatAdminOpsDisplayValue(value)}
      </dd>
    </div>
  );
}

function AdminOpsPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function AdminOpsSummaryRow({
  badges = [],
  label,
  meta,
  publicId,
  testId,
}: {
  badges?: string[];
  label: string;
  meta: string;
  publicId: string;
  testId?: string;
}) {
  return (
    <div
      className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
      data-public-id={publicId}
      data-testid={testId}
    >
      <div>
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-muted text-xs">{meta}</p>
        {badges.length === 0 ? null : (
          <div className="mt-2 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <AdminOpsStatusBadge key={badge} label={badge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
