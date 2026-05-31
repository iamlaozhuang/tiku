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
    return <AdminModelConfigStatePanel title="Loading model configuration" />;
  }

  if (state === "empty") {
    return <AdminModelConfigStatePanel title="No model configuration yet" />;
  }

  if (state === "error") {
    return (
      <AdminModelConfigStatePanel title="Model configuration failed to load" />
    );
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
      setActionMessage("Model provider saved.");
    } catch {
      setActionMessage("Model provider save failed.");
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
      setActionMessage("Model config saved.");
    } catch {
      setActionMessage("Model config save failed.");
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
      setActionMessage("Prompt template saved.");
    } catch {
      setActionMessage("Prompt template save failed.");
    }
  }

  return (
    <section className="space-y-5" aria-label="Model configuration management">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          Model configuration
        </h1>
        <p className="text-text-muted max-w-3xl text-sm">
          Manage local redaction-safe provider metadata, fallback ordering, and
          prompt template metadata without exposing secret values or raw
          prompts.
        </p>
      </header>

      <div className="border-border bg-surface flex flex-wrap gap-2 rounded-md border p-2">
        <AdminModelConfigTab
          activeTab={activeTab}
          label="Model providers"
          tab="model_provider"
          onSelect={setActiveTab}
        />
        <AdminModelConfigTab
          activeTab={activeTab}
          label="Model configs"
          tab="model_config"
          onSelect={setActiveTab}
        />
        <AdminModelConfigTab
          activeTab={activeTab}
          label="Prompt templates"
          tab="prompt_template"
          onSelect={setActiveTab}
        />
      </div>

      {!hasAnyData ? (
        <p className="text-text-muted text-sm">No saved model metadata yet.</p>
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
              setActionMessage("Model provider status update failed.");
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
              setActionMessage("Model config status update failed.");
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
              setActionMessage("Prompt template status update failed.");
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
      <AdminPanel title="Provider form">
        <div className="space-y-3">
          <AdminTextField
            label="Provider key"
            value={form.providerKey}
            onChange={(value) => onChange({ ...form, providerKey: value })}
          />
          <AdminTextField
            label="Provider display name"
            value={form.displayName}
            onChange={(value) => onChange({ ...form, displayName: value })}
          />
          <AdminTextField
            label="Secret value"
            type="password"
            value={form.secretValue}
            onChange={(value) => onChange({ ...form, secretValue: value })}
          />
          <AdminTextField
            label="Base URL"
            value={form.baseUrl}
            onChange={(value) => onChange({ ...form, baseUrl: value })}
          />
          <Button disabled={!canSave} onClick={onSave}>
            <Save aria-hidden="true" className="mr-2 size-4" />
            Save provider
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="Model providers">
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
      <AdminPanel title="Config form">
        <div className="space-y-3">
          <AdminTextField
            label="Provider public id"
            value={form.modelProviderPublicId}
            onChange={(value) =>
              onChange({ ...form, modelProviderPublicId: value })
            }
          />
          <AdminTextField
            label="Model name"
            value={form.modelName}
            onChange={(value) => onChange({ ...form, modelName: value })}
          />
          <AdminTextField
            label="Model alias"
            value={form.modelAlias}
            onChange={(value) => onChange({ ...form, modelAlias: value })}
          />
          <AdminTextField
            label="Config display name"
            value={form.displayName}
            onChange={(value) => onChange({ ...form, displayName: value })}
          />
          <AdminTextField
            label="Fallback model config public id"
            value={form.fallbackModelConfigPublicId}
            onChange={(value) =>
              onChange({ ...form, fallbackModelConfigPublicId: value })
            }
          />
          <AdminTextField
            label="Fallback priority"
            value={form.fallbackPriority}
            onChange={(value) => onChange({ ...form, fallbackPriority: value })}
          />
          <Button disabled={!canSave} onClick={onSave}>
            <Save aria-hidden="true" className="mr-2 size-4" />
            Save config
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="Model configs">
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
      <AdminPanel title="Template form">
        <div className="space-y-3">
          <AdminTextField
            label="Template key"
            value={form.promptTemplateKey}
            onChange={(value) =>
              onChange({ ...form, promptTemplateKey: value })
            }
          />
          <AdminTextField
            label="Template title"
            value={form.title}
            onChange={(value) => onChange({ ...form, title: value })}
          />
          <AdminTextField
            label="Body digest"
            value={form.bodyDigest}
            onChange={(value) => onChange({ ...form, bodyDigest: value })}
          />
          <AdminTextField
            label="Masked body preview"
            value={form.bodyPreviewMasked}
            onChange={(value) =>
              onChange({ ...form, bodyPreviewMasked: value })
            }
          />
          <Button disabled={!canSave} onClick={onSave}>
            <Save aria-hidden="true" className="mr-2 size-4" />
            Save template
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="Prompt templates">
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
  const statusText = provider.isEnabled ? "enabled" : "disabled";
  const actionLabel = provider.isEnabled
    ? "Disable provider"
    : "Enable provider";

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
          {provider.providerKey} / {provider.secretStatus} /{" "}
          {provider.maskedSecret ?? "not configured"} / {statusText}
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
  const actionLabel = modelConfig.isEnabled
    ? "Disable config"
    : "Enable config";
  const runtimeAlignment = modelConfig.runtimeAlignment ?? null;
  const runtimeText =
    runtimeAlignment === null
      ? "runtime: not evaluated"
      : runtimeAlignment.isRuntimeSelected
        ? `runtime: selected ${runtimeAlignment.selectionReason ?? "primary"} / ${runtimeAlignment.promptTemplateKey ?? "template pending"}`
        : `runtime: standby / selected: ${runtimeAlignment.selectedModelConfigPublicId ?? "none"}`;

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
          {modelConfig.aiFuncType} / {modelConfig.modelAlias} /{" "}
          {modelConfig.status} / priority: {modelConfig.fallbackPriority} /
          fallback: {modelConfig.fallbackModelConfigPublicId ?? "none"} /{" "}
          {modelConfig.snapshotPolicy} / {runtimeText}
        </p>
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

function AdminPromptTemplateRow({
  onToggle,
  promptTemplate,
}: {
  onToggle: (publicId: string) => void;
  promptTemplate: PromptTemplateSummaryDto;
}) {
  const actionLabel = promptTemplate.isActive
    ? "Disable template"
    : "Enable template";

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
          {promptTemplate.status} / {promptTemplate.bodyDigest} /{" "}
          {promptTemplate.bodyPreviewMasked}
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
