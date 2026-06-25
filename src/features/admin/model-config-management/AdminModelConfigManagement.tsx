"use client";

import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminAiFunctionType,
  ModelConfigSummaryDto,
  ModelProviderSummaryDto,
  PromptTemplateSummaryDto,
} from "@/server/contracts/admin-ai-audit-log-ops-contract";

type AdminModelConfigManagementState = "ready" | "loading" | "empty" | "error";

type AdminModelConfigManagementProps = {
  state?: AdminModelConfigManagementState;
  initialModelProviders?: ModelProviderSummaryDto[];
  initialModelConfigs?: ModelConfigSummaryDto[];
  initialPromptTemplates?: PromptTemplateSummaryDto[];
  onSaveProvider?: (
    form: ModelProviderFormInput,
  ) => Promise<ModelProviderSummaryDto>;
  onSaveConfig?: (form: ModelConfigFormInput) => Promise<ModelConfigSummaryDto>;
  onSaveTemplate?: (
    form: PromptTemplateFormInput,
  ) => Promise<PromptTemplateSummaryDto>;
  onToggleProvider?: (publicId: string, isEnabled: boolean) => Promise<void>;
  onToggleConfig?: (publicId: string, isEnabled: boolean) => Promise<void>;
  onToggleTemplate?: (publicId: string, isActive: boolean) => Promise<void>;
};

type ActiveTab = "model_provider" | "model_config" | "prompt_template";

const emptyModelProviders: ModelProviderSummaryDto[] = [];
const emptyModelConfigs: ModelConfigSummaryDto[] = [];
const emptyPromptTemplates: PromptTemplateSummaryDto[] = [];

const emptyProviderForm = {
  providerKey: "",
  displayName: "",
  secretValue: "",
  baseUrl: "",
};

export type ModelProviderFormInput = typeof emptyProviderForm;

const emptyConfigForm = {
  modelProviderPublicId: "",
  aiFuncType: "ai_explanation" as AdminAiFunctionType,
  modelName: "",
  modelAlias: "",
  displayName: "",
  fallbackModelConfigPublicId: "",
  fallbackPriority: "0",
};

export type ModelConfigFormInput = typeof emptyConfigForm;

const emptyTemplateForm = {
  promptTemplateKey: "",
  title: "",
  bodyDigest: "",
  bodyPreviewMasked: "",
};

export type PromptTemplateFormInput = typeof emptyTemplateForm;

const aiFuncTypeLabels: Partial<Record<AdminAiFunctionType, string>> = {
  ai_explanation: "AI 讲解",
  ai_hint: "AI 提示",
  ai_scoring: "AI 评分",
};

const modelConfigStatusLabels: Record<string, string> = {
  active: "已启用",
  configured: "已配置",
  disabled: "已停用",
  enabled: "已启用",
  not_configured: "未配置",
  redacted_metadata: "脱敏元数据",
};

function formatModelConfigStatus(value: string) {
  return modelConfigStatusLabels[value] ?? value;
}

export function AdminModelConfigManagement({
  state = "ready",
  initialModelProviders = emptyModelProviders,
  initialModelConfigs = emptyModelConfigs,
  initialPromptTemplates = emptyPromptTemplates,
  onSaveConfig,
  onSaveProvider,
  onSaveTemplate,
  onToggleConfig,
  onToggleProvider,
  onToggleTemplate,
}: AdminModelConfigManagementProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("model_provider");
  const [modelProviders, setModelProviders] = useState(initialModelProviders);
  const [modelConfigs, setModelConfigs] = useState(initialModelConfigs);
  const [promptTemplates, setPromptTemplates] = useState(
    initialPromptTemplates,
  );
  const [providerForm, setProviderForm] = useState(emptyProviderForm);
  const [configForm, setConfigForm] = useState(emptyConfigForm);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const hasAnyData = useMemo(
    () =>
      modelProviders.length > 0 ||
      modelConfigs.length > 0 ||
      promptTemplates.length > 0,
    [modelConfigs.length, modelProviders.length, promptTemplates.length],
  );

  if (state === "loading") {
    return <AdminModelConfigStatePanel title="正在加载模型配置" />;
  }

  if (state === "empty") {
    return <AdminModelConfigStatePanel title="暂无模型配置" />;
  }

  if (state === "error") {
    return <AdminModelConfigStatePanel title="模型配置加载失败" />;
  }

  async function handleSaveProvider() {
    const providerKey = providerForm.providerKey.trim();
    const displayName = providerForm.displayName.trim();

    if (providerKey.length === 0 || displayName.length === 0) {
      return;
    }

    try {
      const provider =
        onSaveProvider === undefined
          ? createLocalProvider(providerForm)
          : await onSaveProvider(providerForm);

      setModelProviders((current) => [...current, provider]);
      setProviderForm(emptyProviderForm);
      setActionMessage("模型供应商已保存。");
    } catch {
      setActionMessage("模型供应商保存失败。");
    }
  }

  async function handleSaveConfig() {
    const modelName = configForm.modelName.trim();
    const displayName = configForm.displayName.trim();

    if (modelName.length === 0 || displayName.length === 0) {
      return;
    }

    try {
      const modelConfig =
        onSaveConfig === undefined
          ? createLocalModelConfig(configForm, modelProviders)
          : await onSaveConfig(configForm);

      setModelConfigs((current) => [...current, modelConfig]);
      setConfigForm(emptyConfigForm);
      setActionMessage("模型配置已保存。");
    } catch {
      setActionMessage("模型配置保存失败。");
    }
  }

  async function handleSaveTemplate() {
    const promptTemplateKey = templateForm.promptTemplateKey.trim();
    const title = templateForm.title.trim();
    const bodyDigest = templateForm.bodyDigest.trim();
    const bodyPreviewMasked = templateForm.bodyPreviewMasked.trim();

    if (
      promptTemplateKey.length === 0 ||
      title.length === 0 ||
      bodyDigest.length === 0 ||
      bodyPreviewMasked.length === 0
    ) {
      return;
    }

    try {
      const promptTemplate =
        onSaveTemplate === undefined
          ? createLocalPromptTemplate(templateForm)
          : await onSaveTemplate(templateForm);

      setPromptTemplates((current) => [...current, promptTemplate]);
      setTemplateForm(emptyTemplateForm);
      setActionMessage("Prompt 模板已保存。");
    } catch {
      setActionMessage("Prompt 模板保存失败。");
    }
  }

  return (
    <section className="space-y-5" aria-label="模型配置管理">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          模型配置
        </h1>
        <p className="text-text-muted max-w-3xl text-sm">
          维护脱敏的模型供应商元数据、备用顺序和 Prompt
          模板元数据，不展示密钥值或原始 Prompt。
        </p>
      </header>

      <div className="border-border bg-surface flex flex-wrap gap-2 rounded-md border p-2">
        <AdminModelConfigTab
          activeTab={activeTab}
          label="模型供应商"
          tab="model_provider"
          onSelect={setActiveTab}
        />
        <AdminModelConfigTab
          activeTab={activeTab}
          label="模型配置"
          tab="model_config"
          onSelect={setActiveTab}
        />
        <AdminModelConfigTab
          activeTab={activeTab}
          label="Prompt 模板"
          tab="prompt_template"
          onSelect={setActiveTab}
        />
      </div>

      {!hasAnyData ? (
        <p className="text-text-muted text-sm">暂无已保存的模型元数据。</p>
      ) : null}

      {activeTab === "model_provider" ? (
        <AdminModelProviderPanel
          form={providerForm}
          modelProviders={modelProviders}
          onChange={setProviderForm}
          onSave={() => void handleSaveProvider()}
          onToggle={(publicId) => {
            const targetProvider = modelProviders.find(
              (provider) => provider.publicId === publicId,
            );
            const nextEnabled = !(targetProvider?.isEnabled ?? false);

            setModelProviders((current) =>
              current.map((provider) =>
                provider.publicId === publicId
                  ? {
                      ...provider,
                      isEnabled: nextEnabled,
                    }
                  : provider,
              ),
            );
            void onToggleProvider?.(publicId, nextEnabled).catch(() => {
              setActionMessage("模型供应商状态更新失败。");
            });
          }}
        />
      ) : null}

      {activeTab === "model_config" ? (
        <AdminModelConfigPanel
          form={configForm}
          modelConfigs={modelConfigs}
          onChange={setConfigForm}
          onSave={() => void handleSaveConfig()}
          onToggle={(publicId) => {
            const targetConfig = modelConfigs.find(
              (modelConfig) => modelConfig.publicId === publicId,
            );
            const nextEnabled = !(targetConfig?.isEnabled ?? false);

            setModelConfigs((current) =>
              current.map((modelConfig) =>
                modelConfig.publicId === publicId
                  ? {
                      ...modelConfig,
                      isEnabled: nextEnabled,
                      status: nextEnabled ? "enabled" : "disabled",
                    }
                  : modelConfig,
              ),
            );
            void onToggleConfig?.(publicId, nextEnabled).catch(() => {
              setActionMessage("模型配置状态更新失败。");
            });
          }}
        />
      ) : null}

      {activeTab === "prompt_template" ? (
        <AdminPromptTemplatePanel
          form={templateForm}
          promptTemplates={promptTemplates}
          onChange={setTemplateForm}
          onSave={() => void handleSaveTemplate()}
          onToggle={(publicId) => {
            const targetTemplate = promptTemplates.find(
              (promptTemplate) => promptTemplate.publicId === publicId,
            );
            const nextActive = !(targetTemplate?.isActive ?? false);

            setPromptTemplates((current) =>
              current.map((promptTemplate) =>
                promptTemplate.publicId === publicId
                  ? {
                      ...promptTemplate,
                      isActive: nextActive,
                      status: nextActive ? "active" : "disabled",
                    }
                  : promptTemplate,
              ),
            );
            void onToggleTemplate?.(publicId, nextActive).catch(() => {
              setActionMessage("Prompt 模板状态更新失败。");
            });
          }}
        />
      ) : null}

      {actionMessage === null ? null : (
        <p className="text-text-secondary text-sm" role="status">
          {actionMessage}
        </p>
      )}
    </section>
  );
}

function AdminModelConfigStatePanel({ title }: { title: string }) {
  return (
    <section className="border-border bg-surface rounded-md border p-6">
      <h1 className="text-text-primary text-base font-semibold">{title}</h1>
    </section>
  );
}

function createLocalProvider(
  form: ModelProviderFormInput,
): ModelProviderSummaryDto {
  const providerKey = form.providerKey.trim();
  const lastFour = readLastFour(form.secretValue);

  return {
    publicId: `model-provider-${providerKey}`,
    providerKey,
    displayName: form.displayName.trim(),
    baseUrl: readOptionalText(form.baseUrl),
    isEnabled: true,
    secretStatus: lastFour === null ? "not_configured" : "configured",
    maskedSecret: lastFour === null ? null : `****${lastFour}`,
    providerMetadata: {
      source: "admin_ui",
    },
    updatedAt: new Date("2026-05-26T00:00:00.000Z").toISOString(),
  };
}

function createLocalModelConfig(
  form: ModelConfigFormInput,
  modelProviders: ModelProviderSummaryDto[],
): ModelConfigSummaryDto {
  const modelName = form.modelName.trim();
  const selectedProvider = modelProviders[0] ?? null;
  const modelProviderPublicId =
    readOptionalText(form.modelProviderPublicId) ??
    selectedProvider?.publicId ??
    "model-provider-local";
  const providerDisplayName = selectedProvider?.displayName ?? "Local Mock";
  const providerKey = selectedProvider?.providerKey ?? "local_mock";
  const maskedSecret = selectedProvider?.maskedSecret ?? null;
  const secretStatus =
    selectedProvider?.secretStatus ?? ("not_configured" as const);

  return {
    publicId: `model-config-${modelName}`,
    providerPublicId: modelProviderPublicId,
    providerDisplayName,
    providerKey,
    modelName,
    modelAlias: form.modelAlias.trim() || modelName,
    displayName: form.displayName.trim(),
    aiFuncType: form.aiFuncType,
    apiKeyDisplay: maskedSecret,
    secretStatus,
    maskedSecret,
    fallbackModelConfigPublicId: readOptionalText(
      form.fallbackModelConfigPublicId,
    ),
    isEnabled: true,
    status: "enabled",
    fallbackPriority: Number.parseInt(form.fallbackPriority, 10) || 0,
    snapshotPolicy: "redacted_metadata",
    configVersion: 1,
    timeoutSecond: 15,
    maxRetryCount: 1,
    updatedAt: new Date("2026-05-26T00:00:00.000Z").toISOString(),
  };
}

function createLocalPromptTemplate(
  form: PromptTemplateFormInput,
): PromptTemplateSummaryDto {
  const promptTemplateKey = form.promptTemplateKey.trim();

  return {
    publicId: `prompt-template-${promptTemplateKey}`,
    promptTemplateKey,
    aiFuncType: "ai_explanation",
    version: 1,
    title: form.title.trim(),
    description: "Metadata only",
    bodyDigest: form.bodyDigest.trim(),
    bodyPreviewMasked: form.bodyPreviewMasked.trim(),
    status: "active",
    isActive: true,
    updatedAt: new Date("2026-05-26T00:00:00.000Z").toISOString(),
  };
}

function AdminModelConfigTab({
  activeTab,
  label,
  onSelect,
  tab,
}: {
  activeTab: ActiveTab;
  label: string;
  onSelect: (tab: ActiveTab) => void;
  tab: ActiveTab;
}) {
  return (
    <button
      aria-selected={activeTab === tab}
      className={
        activeTab === tab
          ? "bg-brand-primary text-brand-foreground rounded-md px-3 py-2 text-sm font-medium"
          : "text-text-secondary hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
      }
      onClick={() => onSelect(tab)}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}

function AdminModelProviderPanel({
  form,
  modelProviders,
  onChange,
  onSave,
  onToggle,
}: {
  form: typeof emptyProviderForm;
  modelProviders: ModelProviderSummaryDto[];
  onChange: (form: typeof emptyProviderForm) => void;
  onSave: () => void;
  onToggle: (publicId: string) => void;
}) {
  const canSave =
    form.providerKey.trim().length > 0 && form.displayName.trim().length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <AdminPanel title="供应商表单">
        <div className="space-y-3">
          <AdminTextField
            label="供应商标识"
            value={form.providerKey}
            onChange={(value) => onChange({ ...form, providerKey: value })}
          />
          <AdminTextField
            label="供应商显示名称"
            value={form.displayName}
            onChange={(value) => onChange({ ...form, displayName: value })}
          />
          <AdminTextField
            label="密钥值"
            type="password"
            value={form.secretValue}
            onChange={(value) => onChange({ ...form, secretValue: value })}
          />
          <AdminTextField
            label="基础地址"
            value={form.baseUrl}
            onChange={(value) => onChange({ ...form, baseUrl: value })}
          />
          <Button disabled={!canSave} onClick={onSave}>
            <Save aria-hidden="true" className="mr-2 size-4" />
            保存供应商
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="模型供应商">
        {modelProviders.map((provider) => (
          <AdminProviderRow
            key={provider.publicId}
            provider={provider}
            onToggle={onToggle}
          />
        ))}
      </AdminPanel>
    </div>
  );
}

function AdminModelConfigPanel({
  form,
  modelConfigs,
  onChange,
  onSave,
  onToggle,
}: {
  form: typeof emptyConfigForm;
  modelConfigs: ModelConfigSummaryDto[];
  onChange: (form: typeof emptyConfigForm) => void;
  onSave: () => void;
  onToggle: (publicId: string) => void;
}) {
  const canSave =
    form.modelName.trim().length > 0 && form.displayName.trim().length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <AdminPanel title="配置表单">
        <div className="space-y-3">
          <AdminTextField
            label="供应商业务标识"
            value={form.modelProviderPublicId}
            onChange={(value) =>
              onChange({ ...form, modelProviderPublicId: value })
            }
          />
          <AdminTextField
            label="模型名称"
            value={form.modelName}
            onChange={(value) => onChange({ ...form, modelName: value })}
          />
          <AdminTextField
            label="模型别名"
            value={form.modelAlias}
            onChange={(value) => onChange({ ...form, modelAlias: value })}
          />
          <AdminTextField
            label="配置显示名称"
            value={form.displayName}
            onChange={(value) => onChange({ ...form, displayName: value })}
          />
          <AdminTextField
            label="备用模型配置业务标识"
            value={form.fallbackModelConfigPublicId}
            onChange={(value) =>
              onChange({ ...form, fallbackModelConfigPublicId: value })
            }
          />
          <AdminTextField
            label="备用优先级"
            value={form.fallbackPriority}
            onChange={(value) => onChange({ ...form, fallbackPriority: value })}
          />
          <Button disabled={!canSave} onClick={onSave}>
            <Save aria-hidden="true" className="mr-2 size-4" />
            保存配置
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="模型配置">
        {modelConfigs.map((modelConfig) => (
          <AdminConfigRow
            key={modelConfig.publicId}
            modelConfig={modelConfig}
            onToggle={onToggle}
          />
        ))}
      </AdminPanel>
    </div>
  );
}

function AdminPromptTemplatePanel({
  form,
  onChange,
  onSave,
  onToggle,
  promptTemplates,
}: {
  form: typeof emptyTemplateForm;
  onChange: (form: typeof emptyTemplateForm) => void;
  onSave: () => void;
  onToggle: (publicId: string) => void;
  promptTemplates: PromptTemplateSummaryDto[];
}) {
  const canSave =
    form.promptTemplateKey.trim().length > 0 &&
    form.title.trim().length > 0 &&
    form.bodyDigest.trim().length > 0 &&
    form.bodyPreviewMasked.trim().length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <AdminPanel title="模板表单">
        <div className="space-y-3">
          <AdminTextField
            label="模板标识"
            value={form.promptTemplateKey}
            onChange={(value) =>
              onChange({ ...form, promptTemplateKey: value })
            }
          />
          <AdminTextField
            label="模板标题"
            value={form.title}
            onChange={(value) => onChange({ ...form, title: value })}
          />
          <AdminTextField
            label="正文摘要"
            value={form.bodyDigest}
            onChange={(value) => onChange({ ...form, bodyDigest: value })}
          />
          <AdminTextField
            label="脱敏正文预览"
            value={form.bodyPreviewMasked}
            onChange={(value) =>
              onChange({ ...form, bodyPreviewMasked: value })
            }
          />
          <Button disabled={!canSave} onClick={onSave}>
            <Save aria-hidden="true" className="mr-2 size-4" />
            保存模板
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="Prompt 模板">
        {promptTemplates.map((promptTemplate) => (
          <AdminPromptTemplateRow
            key={promptTemplate.publicId}
            onToggle={onToggle}
            promptTemplate={promptTemplate}
          />
        ))}
      </AdminPanel>
    </div>
  );
}

function AdminPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border-border bg-surface rounded-md border p-4">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function AdminTextField({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: "password" | "text";
  value: string;
}) {
  return (
    <label className="text-text-secondary flex flex-col gap-1 text-sm font-medium">
      <span>{label}</span>
      <Input
        aria-label={label}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AdminProviderRow({
  onToggle,
  provider,
}: {
  onToggle: (publicId: string) => void;
  provider: ModelProviderSummaryDto;
}) {
  const statusText = provider.isEnabled ? "已启用" : "已停用";
  const actionLabel = provider.isEnabled ? "禁用供应商" : "启用供应商";

  return (
    <div
      className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0"
      data-public-id={provider.publicId}
      data-testid={`admin-model-provider-${provider.providerKey}`}
    >
      <div>
        <p className="text-text-primary text-sm font-medium">
          {provider.displayName}
        </p>
        <p className="text-text-muted text-xs">
          {provider.providerKey} /{" "}
          {formatModelConfigStatus(provider.secretStatus)} /{" "}
          {provider.maskedSecret ?? "未配置"} / {statusText}
        </p>
      </div>
      <Button variant="outline" onClick={() => onToggle(provider.publicId)}>
        {provider.isEnabled ? (
          <ToggleLeft aria-hidden="true" className="mr-2 size-4" />
        ) : (
          <ToggleRight aria-hidden="true" className="mr-2 size-4" />
        )}
        {actionLabel}
      </Button>
    </div>
  );
}

function AdminConfigRow({
  modelConfig,
  onToggle,
}: {
  modelConfig: ModelConfigSummaryDto;
  onToggle: (publicId: string) => void;
}) {
  const actionLabel = modelConfig.isEnabled ? "禁用配置" : "启用配置";
  const runtimeAlignment = modelConfig.runtimeAlignment ?? null;
  const runtimeText =
    runtimeAlignment === null
      ? "运行时：未评估"
      : runtimeAlignment.isRuntimeSelected
        ? `运行时：已选中 ${
            runtimeAlignment.selectionReason === "primary"
              ? "主配置"
              : (runtimeAlignment.selectionReason ?? "主配置")
          } / ${runtimeAlignment.promptTemplateKey ?? "模板待定"}`
        : runtimeAlignment.selectedModelConfigPublicId === null
          ? "运行时：备用 / 未选中"
          : "运行时：备用 / 已隐藏选中标识";
  const fallbackText =
    modelConfig.fallbackModelConfigPublicId === null
      ? "备用：无"
      : "备用：标识符已隐藏";

  return (
    <div
      className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0"
      data-public-id={modelConfig.publicId}
      data-testid={`admin-model-config-${modelConfig.publicId}`}
    >
      <div>
        <p className="text-text-primary text-sm font-medium">
          {modelConfig.displayName}
        </p>
        <p className="text-text-muted text-xs">
          {aiFuncTypeLabels[modelConfig.aiFuncType] ?? modelConfig.aiFuncType} /{" "}
          {modelConfig.modelAlias} /{" "}
          {formatModelConfigStatus(modelConfig.status)} / 优先级：{" "}
          {modelConfig.fallbackPriority} / {fallbackText} /{" "}
          {formatModelConfigStatus(modelConfig.snapshotPolicy)} / {runtimeText}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <AdminMetadataBadge label="仅元数据" />
          <AdminMetadataBadge label="已脱敏" />
        </div>
      </div>
      <Button variant="outline" onClick={() => onToggle(modelConfig.publicId)}>
        {modelConfig.isEnabled ? (
          <ToggleLeft aria-hidden="true" className="mr-2 size-4" />
        ) : (
          <ToggleRight aria-hidden="true" className="mr-2 size-4" />
        )}
        {actionLabel}
      </Button>
    </div>
  );
}

function AdminMetadataBadge({ label }: { label: string }) {
  return (
    <span className="border-border bg-muted text-text-secondary rounded-full border px-2 py-0.5 text-[11px] font-medium">
      {label}
    </span>
  );
}

function AdminPromptTemplateRow({
  onToggle,
  promptTemplate,
}: {
  onToggle: (publicId: string) => void;
  promptTemplate: PromptTemplateSummaryDto;
}) {
  const actionLabel = promptTemplate.isActive ? "禁用模板" : "启用模板";

  return (
    <div
      className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0"
      data-public-id={promptTemplate.publicId}
      data-testid={`admin-prompt-template-${promptTemplate.publicId}`}
    >
      <div>
        <p className="text-text-primary text-sm font-medium">
          {promptTemplate.title ?? promptTemplate.promptTemplateKey}
        </p>
        <p className="text-text-muted text-xs">
          {promptTemplate.promptTemplateKey} / v{promptTemplate.version} /{" "}
          {formatModelConfigStatus(promptTemplate.status)} /{" "}
          {promptTemplate.bodyDigest} / {promptTemplate.bodyPreviewMasked}
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => onToggle(promptTemplate.publicId)}
      >
        {promptTemplate.isActive ? (
          <ToggleLeft aria-hidden="true" className="mr-2 size-4" />
        ) : (
          <ToggleRight aria-hidden="true" className="mr-2 size-4" />
        )}
        {actionLabel}
      </Button>
    </div>
  );
}

function readLastFour(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length < 4 ? null : trimmedValue.slice(-4);
}

function readOptionalText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? null : trimmedValue;
}
