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
  AuditLogListDto,
  ModelConfigListDto,
  ModelConfigSummaryDto,
  ModelProviderListDto,
  ModelProviderSummaryDto,
  PromptTemplateListDto,
  PromptTemplateSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";

type AdminAiAuditLogOpsState = "ready" | "loading" | "empty" | "error";

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
  const shouldLoadRuntimeData = runtimeEnabled && state === "ready";
  const effectiveRuntimeState = shouldLoadRuntimeData ? runtimeState : state;
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
        <p className="text-brand-primary text-sm font-medium">AI Ops</p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          AI 配置与日志运营
        </h1>
        <p className="text-text-secondary max-w-3xl text-sm leading-6">
          模型配置、Prompt 模板、审计日志与 AI 调用日志均通过本地 runtime API
          加载；页面只展示脱敏摘要和 publicId。
        </p>
      </header>

      <AdminModelConfigManagement
        key={managementKey}
        initialModelConfigs={runtimeData.modelConfigs}
        initialModelProviders={runtimeData.modelProviders}
        initialPromptTemplates={runtimeData.promptTemplates}
        {...runtimeCallbacks}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminOpsPanel title="审计日志">
          <p className="text-text-muted mb-2 text-xs">审计日志只读</p>
          {runtimeData.auditLogs.map((auditLog) => (
            <AdminOpsSummaryRow
              key={auditLog.publicId}
              label={auditLog.actionType}
              meta={[
                auditLog.actorPublicId,
                auditLog.targetResourceType,
                auditLog.resultStatus,
                auditLog.metadataSummary ?? "redacted metadata",
              ].join(" / ")}
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
              label={aiCallLog.aiFuncType}
              meta={[
                aiCallLog.providerDisplayName,
                aiCallLog.modelAlias,
                aiCallLog.callStatus,
                `${aiCallLog.totalTokenCount ?? 0} tokens`,
                aiCallLog.promptSummary ?? "redacted prompt",
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
              label={`${costSummary.bucket} / ${costSummary.aiFuncType}`}
              meta={[
                costSummary.providerDisplayName,
                costSummary.modelAlias,
                `${costSummary.callCount} calls`,
                `${costSummary.estimatedCostCny} CNY`,
              ].join(" / ")}
              publicId={`${costSummary.bucket}-${costSummary.aiFuncType}`}
            />
          ))}
        </AdminOpsPanel>
      </div>
    </div>
  );
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
  label,
  meta,
  publicId,
  testId,
}: {
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
      </div>
    </div>
  );
}
