"use client";

import { Eye, PlugZap, Save, ToggleLeft, ToggleRight } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminAiFunctionType,
  ModelConfigConnectionTestDto,
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
  canManageModelConfig?: boolean;
  canViewPromptFullText?: boolean;
  onSaveProvider?: (
    form: ModelProviderFormInput,
  ) => Promise<ModelProviderSummaryDto>;
  onSaveConfig?: (form: ModelConfigFormInput) => Promise<ModelConfigSummaryDto>;
  onTestConnection?: (
    publicId: string,
  ) => Promise<ModelConfigConnectionTestDto>;
  onToggleProvider?: (publicId: string, isEnabled: boolean) => Promise<void>;
  onToggleConfig?: (publicId: string, isEnabled: boolean) => Promise<void>;
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
  pricingVersion: "",
  inputTokenPriceCnyPerMillion: "",
  outputTokenPriceCnyPerMillion: "",
  fallbackModelConfigPublicId: "",
  fallbackPriority: "0",
};

export type ModelConfigFormInput = typeof emptyConfigForm;

type ConnectionTestState = ModelConfigConnectionTestDto | "testing" | "error";

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
  canManageModelConfig = false,
  canViewPromptFullText = false,
  onSaveConfig,
  onSaveProvider,
  onTestConnection,
  onToggleConfig,
  onToggleProvider,
}: AdminModelConfigManagementProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("model_provider");
  const [modelProviders, setModelProviders] = useState(initialModelProviders);
  const [modelConfigs, setModelConfigs] = useState(initialModelConfigs);
  const [providerForm, setProviderForm] = useState(emptyProviderForm);
  const [configForm, setConfigForm] = useState(emptyConfigForm);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [connectionTestsByConfig, setConnectionTestsByConfig] = useState<
    Record<string, ConnectionTestState>
  >({});
  const [selectedPromptTemplatePublicId, setSelectedPromptTemplatePublicId] =
    useState<string | null>(null);
  const promptTemplates = initialPromptTemplates;

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
      if (onSaveProvider === undefined) {
        throw new Error("model_provider runtime callback is unavailable");
      }

      const provider = await onSaveProvider(providerForm);

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
      if (onSaveConfig === undefined) {
        throw new Error("model_config runtime callback is unavailable");
      }

      const modelConfig = await onSaveConfig(configForm);

      setModelConfigs((current) => [...current, modelConfig]);
      setConfigForm(emptyConfigForm);
      setActionMessage("模型配置已保存。");
    } catch {
      setActionMessage("模型配置保存失败。");
    }
  }

  async function handleTestConnection(publicId: string) {
    const modelConfig =
      modelConfigs.find((item) => item.publicId === publicId) ?? null;

    if (modelConfig === null) {
      setActionMessage("模型配置不存在。");
      return;
    }

    setConnectionTestsByConfig((current) => ({
      ...current,
      [publicId]: "testing",
    }));

    try {
      if (onTestConnection === undefined) {
        throw new Error("model_config connection test callback is unavailable");
      }

      const connectionTest = await onTestConnection(publicId);

      setConnectionTestsByConfig((current) => ({
        ...current,
        [publicId]: connectionTest,
      }));
      setActionMessage(
        connectionTest.status === "succeeded"
          ? "模型配置连接测试已通过。"
          : "模型配置连接测试未通过。",
      );
    } catch {
      setConnectionTestsByConfig((current) => ({
        ...current,
        [publicId]: "error",
      }));
      setActionMessage("模型配置连接测试失败。");
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
          canManageModelConfig={canManageModelConfig}
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
          modelProviders={modelProviders}
          canManageModelConfig={canManageModelConfig}
          connectionTestsByConfig={connectionTestsByConfig}
          onChange={setConfigForm}
          onSave={() => void handleSaveConfig()}
          onTestConnection={(publicId) => void handleTestConnection(publicId)}
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
          canViewPromptFullText={canViewPromptFullText}
          onSelectPromptTemplate={setSelectedPromptTemplatePublicId}
          promptTemplates={promptTemplates}
          selectedPromptTemplatePublicId={selectedPromptTemplatePublicId}
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
          ? "bg-brand-primary text-brand-foreground rounded-md px-3 py-2 text-sm font-medium active:scale-[0.98]"
          : "text-text-secondary hover:bg-muted rounded-md px-3 py-2 text-sm font-medium active:scale-[0.98]"
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
  canManageModelConfig,
  form,
  modelProviders,
  onChange,
  onSave,
  onToggle,
}: {
  canManageModelConfig: boolean;
  form: typeof emptyProviderForm;
  modelProviders: ModelProviderSummaryDto[];
  onChange: (form: typeof emptyProviderForm) => void;
  onSave: () => void;
  onToggle: (publicId: string) => void;
}) {
  const canSave =
    form.providerKey.trim().length > 0 && form.displayName.trim().length > 0;

  return (
    <div
      className={
        canManageModelConfig
          ? "grid gap-4 lg:grid-cols-[20rem_1fr]"
          : "grid gap-4"
      }
    >
      {canManageModelConfig ? (
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
      ) : null}

      <AdminPanel title="模型供应商">
        {modelProviders.map((provider) => (
          <AdminProviderRow
            key={provider.publicId}
            canManageModelConfig={canManageModelConfig}
            provider={provider}
            onToggle={onToggle}
          />
        ))}
      </AdminPanel>
    </div>
  );
}

function AdminModelConfigPanel({
  canManageModelConfig,
  connectionTestsByConfig,
  form,
  modelConfigs,
  modelProviders,
  onChange,
  onSave,
  onTestConnection,
  onToggle,
}: {
  canManageModelConfig: boolean;
  connectionTestsByConfig: Record<string, ConnectionTestState>;
  form: typeof emptyConfigForm;
  modelConfigs: ModelConfigSummaryDto[];
  modelProviders: ModelProviderSummaryDto[];
  onChange: (form: typeof emptyConfigForm) => void;
  onSave: () => void;
  onTestConnection: (publicId: string) => void;
  onToggle: (publicId: string) => void;
}) {
  const pricingValues = [
    form.pricingVersion,
    form.inputTokenPriceCnyPerMillion,
    form.outputTokenPriceCnyPerMillion,
  ];
  const hasAnyPricingValue = pricingValues.some(
    (value) => value.trim().length > 0,
  );
  const hasCompletePricingTuple = pricingValues.every(
    (value) => value.trim().length > 0,
  );
  const canSave =
    form.modelName.trim().length > 0 &&
    form.displayName.trim().length > 0 &&
    (!hasAnyPricingValue || hasCompletePricingTuple);

  return (
    <div
      className={
        canManageModelConfig
          ? "grid gap-4 lg:grid-cols-[20rem_1fr]"
          : "grid gap-4"
      }
    >
      {canManageModelConfig ? (
        <AdminPanel title="配置表单">
          <div className="space-y-3">
            <AdminSelectField
              label="模型供应商"
              options={modelProviders.map((provider) => [
                provider.publicId,
                provider.displayName,
              ])}
              placeholder="请选择模型供应商"
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
              label="价格版本"
              value={form.pricingVersion}
              onChange={(value) => onChange({ ...form, pricingVersion: value })}
            />
            <AdminTextField
              label="输入 Token 单价（元/百万 Token）"
              value={form.inputTokenPriceCnyPerMillion}
              onChange={(value) =>
                onChange({ ...form, inputTokenPriceCnyPerMillion: value })
              }
            />
            <AdminTextField
              label="输出 Token 单价（元/百万 Token）"
              value={form.outputTokenPriceCnyPerMillion}
              onChange={(value) =>
                onChange({ ...form, outputTokenPriceCnyPerMillion: value })
              }
            />
            <p className="text-text-muted text-xs leading-5">
              三项需同时填写；仅保存版本化本地成本估算元数据，不代表 Provider
              实际账单或成本校准。
            </p>
            <AdminSelectField
              label="备用模型配置"
              options={modelConfigs.map((modelConfig) => [
                modelConfig.publicId,
                modelConfig.displayName,
              ])}
              placeholder="无备用配置"
              value={form.fallbackModelConfigPublicId}
              onChange={(value) =>
                onChange({ ...form, fallbackModelConfigPublicId: value })
              }
            />
            <AdminTextField
              label="备用优先级"
              value={form.fallbackPriority}
              onChange={(value) =>
                onChange({ ...form, fallbackPriority: value })
              }
            />
            <Button disabled={!canSave} onClick={onSave}>
              <Save aria-hidden="true" className="mr-2 size-4" />
              保存配置
            </Button>
          </div>
        </AdminPanel>
      ) : null}

      <AdminPanel title="模型配置">
        {modelConfigs.map((modelConfig) => (
          <AdminConfigRow
            key={modelConfig.publicId}
            canManageModelConfig={canManageModelConfig}
            connectionTest={connectionTestsByConfig[modelConfig.publicId]}
            modelConfig={modelConfig}
            fallbackDisplayName={
              modelConfigs.find(
                (candidate) =>
                  candidate.publicId ===
                  modelConfig.fallbackModelConfigPublicId,
              )?.displayName ?? null
            }
            onTestConnection={onTestConnection}
            onToggle={onToggle}
          />
        ))}
      </AdminPanel>
    </div>
  );
}

function AdminPromptTemplatePanel({
  canViewPromptFullText,
  onSelectPromptTemplate,
  promptTemplates,
  selectedPromptTemplatePublicId,
}: {
  canViewPromptFullText: boolean;
  onSelectPromptTemplate: (publicId: string | null) => void;
  promptTemplates: PromptTemplateSummaryDto[];
  selectedPromptTemplatePublicId: string | null;
}) {
  const selectedPromptTemplate =
    promptTemplates.find(
      (promptTemplate) =>
        promptTemplate.publicId === selectedPromptTemplatePublicId,
    ) ?? null;
  const canShowSelectedFullText =
    canViewPromptFullText &&
    selectedPromptTemplate?.canViewFullText === true &&
    selectedPromptTemplate.bodyFullText !== null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
      <AdminPanel title="Prompt 只读注册表">
        <p className="text-text-muted text-sm leading-6">
          首期仅展示项目已注册 Prompt
          的元数据、变量和目录状态，不提供新增、编辑、启停、复制、导出或删除。
        </p>
        {promptTemplates.map((promptTemplate) => (
          <AdminPromptTemplateRow
            key={promptTemplate.publicId}
            canViewPromptFullText={canViewPromptFullText}
            onSelectPromptTemplate={onSelectPromptTemplate}
            promptTemplate={promptTemplate}
          />
        ))}
      </AdminPanel>

      <AdminPanel title="Prompt 全文查看">
        {selectedPromptTemplate === null ? (
          <p className="text-text-muted text-sm">
            选择一个 Prompt 后在此查看授权范围内的信息。
          </p>
        ) : null}
        {selectedPromptTemplate !== null && !canShowSelectedFullText ? (
          <div className="space-y-2">
            <p className="text-text-primary text-sm font-medium">
              {selectedPromptTemplate.title ??
                selectedPromptTemplate.promptTemplateKey}
            </p>
            <p className="text-text-muted text-sm">
              当前角色仅可查看 Prompt 元数据，全文不在此角色范围内展示。
            </p>
            <div className="flex flex-wrap gap-1">
              <AdminMetadataBadge label="只读" />
              <AdminMetadataBadge label="仅元数据" />
              <AdminMetadataBadge label="不导出" />
            </div>
          </div>
        ) : null}
        {selectedPromptTemplate !== null && canShowSelectedFullText ? (
          <div className="space-y-3">
            <div>
              <p className="text-text-primary text-sm font-medium">
                {selectedPromptTemplate.title ??
                  selectedPromptTemplate.promptTemplateKey}
              </p>
              <p className="text-text-muted text-xs">
                全文仅在超级管理员只读视图展示，不写入日志或导出。
              </p>
            </div>
            <pre className="border-border bg-muted text-text-primary max-h-72 overflow-auto rounded-md border p-3 text-xs leading-5 whitespace-pre-wrap">
              {selectedPromptTemplate.bodyFullText}
            </pre>
          </div>
        ) : null}
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

function AdminSelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="text-text-secondary flex flex-col gap-1 text-sm font-medium">
      <span>{label}</span>
      <select
        aria-label={label}
        className="border-input bg-background text-text-primary h-8 rounded-lg border px-2.5 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function AdminProviderRow({
  canManageModelConfig,
  onToggle,
  provider,
}: {
  canManageModelConfig: boolean;
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
      {canManageModelConfig ? (
        <Button
          aria-label={`${actionLabel} ${provider.displayName}`}
          variant="outline"
          onClick={() => onToggle(provider.publicId)}
        >
          {provider.isEnabled ? (
            <ToggleLeft aria-hidden="true" className="mr-2 size-4" />
          ) : (
            <ToggleRight aria-hidden="true" className="mr-2 size-4" />
          )}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function AdminConfigRow({
  canManageModelConfig,
  connectionTest,
  fallbackDisplayName,
  modelConfig,
  onTestConnection,
  onToggle,
}: {
  canManageModelConfig: boolean;
  connectionTest?: ConnectionTestState;
  fallbackDisplayName: string | null;
  modelConfig: ModelConfigSummaryDto;
  onTestConnection: (publicId: string) => void;
  onToggle: (publicId: string) => void;
}) {
  const actionLabel = modelConfig.isEnabled ? "禁用配置" : "启用配置";
  const canTestConnection =
    canManageModelConfig &&
    modelConfig.secretStatus === "configured" &&
    modelConfig.maskedSecret !== null &&
    modelConfig.isEnabled &&
    modelConfig.status === "enabled";
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
      : fallbackDisplayName === null
        ? "备用：配置不可用"
        : `备用：${fallbackDisplayName}`;
  const connectionTestText = formatConnectionTestState(connectionTest);

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
        <p className="text-text-muted mt-1 text-xs">
          {modelConfig.pricingVersion === null
            ? "本地成本估算：未配置"
            : `本地成本估算：${modelConfig.pricingVersion} / 输入 ${modelConfig.inputTokenPriceCnyPerMillion} 元/百万 Token / 输出 ${modelConfig.outputTokenPriceCnyPerMillion} 元/百万 Token`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <AdminMetadataBadge label="仅元数据" />
          <AdminMetadataBadge label="已脱敏" />
          <AdminMetadataBadge
            label={canManageModelConfig ? "超级管理员可测" : "仅超级管理员可测"}
          />
          <AdminMetadataBadge label="不自动停用" />
        </div>
        <p className="text-text-muted mt-2 text-xs">
          连接测试：{connectionTestText} / 不发送真实 Provider 请求 / 不保存原始
          Prompt
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        {canManageModelConfig ? (
          <Button
            aria-label={`测试 ${modelConfig.displayName} 的连接`}
            disabled={!canTestConnection || connectionTest === "testing"}
            variant="outline"
            onClick={() => onTestConnection(modelConfig.publicId)}
          >
            <PlugZap aria-hidden="true" className="mr-2 size-4" />
            测试连接
          </Button>
        ) : null}
        {canManageModelConfig ? (
          <Button
            aria-label={`${actionLabel} ${modelConfig.displayName}`}
            variant="outline"
            onClick={() => onToggle(modelConfig.publicId)}
          >
            {modelConfig.isEnabled ? (
              <ToggleLeft aria-hidden="true" className="mr-2 size-4" />
            ) : (
              <ToggleRight aria-hidden="true" className="mr-2 size-4" />
            )}
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function formatConnectionTestState(
  connectionTest: ConnectionTestState | undefined,
): string {
  if (connectionTest === undefined) {
    return "未测试";
  }

  if (connectionTest === "testing") {
    return "测试中";
  }

  if (connectionTest === "error") {
    return "接口失败";
  }

  if (connectionTest.status === "succeeded") {
    return "已通过";
  }

  if (connectionTest.status === "missing_secret") {
    return "密钥未配置";
  }

  return "未通过";
}

function AdminMetadataBadge({ label }: { label: string }) {
  return (
    <span className="border-border bg-muted text-text-secondary rounded-full border px-2 py-0.5 text-[11px] font-medium">
      {label}
    </span>
  );
}

function AdminPromptTemplateRow({
  canViewPromptFullText,
  onSelectPromptTemplate,
  promptTemplate,
}: {
  canViewPromptFullText: boolean;
  onSelectPromptTemplate: (publicId: string | null) => void;
  promptTemplate: PromptTemplateSummaryDto;
}) {
  const canOpenFullText =
    canViewPromptFullText &&
    promptTemplate.canViewFullText &&
    promptTemplate.bodyFullText !== null;

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
          {promptTemplate.bodyDigest} / {promptTemplate.bodyPreviewMasked} /{" "}
          {promptTemplate.registrationSource === "project_prompt_catalog"
            ? "项目目录"
            : "运行时注册"}{" "}
          /{" "}
          {promptTemplate.catalogGapStatus === "catalog_gap"
            ? "待注册"
            : "已注册"}
        </p>
        <p className="text-text-muted mt-1 text-xs">
          变量：{promptTemplate.requiredVariables.join("、") || "无"}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <AdminMetadataBadge label="只读" />
          <AdminMetadataBadge label="不导出" />
          <AdminMetadataBadge
            label={canOpenFullText ? "可看全文" : "仅元数据"}
          />
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => onSelectPromptTemplate(promptTemplate.publicId)}
      >
        <Eye aria-hidden="true" className="mr-2 size-4" />
        {canOpenFullText ? "查看全文" : "查看元数据"}
      </Button>
    </div>
  );
}
