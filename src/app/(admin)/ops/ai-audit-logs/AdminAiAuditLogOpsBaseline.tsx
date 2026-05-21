"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ADMIN_CONFLICT_MESSAGE,
  ADMIN_PAGE_SIZE_OPTIONS,
} from "@/server/contracts/admin-interaction-contract";

type AdminAiAuditLogOpsState = "ready" | "loading" | "empty" | "error";

type ConfirmationKind = "enableModelConfig" | "disableModelConfig";

type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

export function AdminAiAuditLogOpsBaseline({
  state = "ready",
}: {
  state?: AdminAiAuditLogOpsState;
}) {
  const [confirmationKind, setConfirmationKind] =
    useState<ConfirmationKind | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const preview = useMemo(
    () => ({
      modelConfigs: [
        {
          publicId: "model-config-public-001",
          displayName: "通义千问评分模型",
          apiKeyDisplay: "****1234",
          meta: "ai_scoring / qwen-plus / fallback: model-config-public-002",
        },
      ],
      auditLogs: [
        {
          publicId: "audit-log-public-001",
          actionType: "model_config.enable",
          meta: "admin-super-001 / model_config / success",
        },
      ],
      aiCallLogs: [
        {
          publicId: "ai-call-log-public-001",
          aiFuncType: "ai_scoring",
          meta: "qwen-plus / success / 1700 tokens / 已按策略脱敏",
        },
      ],
      costSummaries: [
        {
          publicId: "ai-call-cost-summary-2026-05-21",
          label: "2026-05-21 / ai_scoring",
          meta: "12 次调用 / 3.60 CNY",
        },
      ],
    }),
    [],
  );

  if (state === "loading") {
    return (
      <AdminOpsStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载 AI 与日志运营数据"
      />
    );
  }

  if (state === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无 AI 与日志运营数据"
      />
    );
  }

  if (state === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="AI 与日志运营数据加载失败"
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">AI Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            AI 配置与日志运营
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setConfirmationKind("enableModelConfig")}>
            启用模型配置
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmationKind("disableModelConfig")}
          >
            停用模型配置
          </Button>
        </div>
      </header>

      <div className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm lg:grid-cols-[12rem_14rem_1fr]">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">每页条数</span>
          <select
            aria-label="每页条数"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            defaultValue="20"
          >
            {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">运营范围</span>
          <select
            aria-label="运营范围"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            defaultValue="modelConfig"
          >
            <option value="modelConfig">模型配置</option>
            <option value="auditLog">审计日志</option>
            <option value="aiCallLog">AI 调用日志</option>
          </select>
        </label>
        <div className="text-text-muted flex items-end text-sm">
          API Key 仅密文展示，日志内容保持只读和脱敏
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminOpsPanel title="模型供应商与用途映射">
          {preview.modelConfigs.map((modelConfig) => (
            <div
              className="border-border flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
              data-public-id={modelConfig.publicId}
              data-testid={`admin-model-config-${modelConfig.publicId}`}
              key={modelConfig.publicId}
            >
              <div>
                <p className="text-text-primary text-sm font-medium">
                  {modelConfig.displayName}
                </p>
                <p className="text-text-muted text-xs">
                  <span>{modelConfig.apiKeyDisplay}</span>
                  <span> / {modelConfig.meta}</span>
                </p>
              </div>
              <Button variant="outline">查看</Button>
            </div>
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="审计日志">
          <p className="text-text-muted mb-2 text-xs">审计日志只读</p>
          {preview.auditLogs.map((auditLog) => (
            <AdminOpsSummaryRow
              key={auditLog.publicId}
              label={auditLog.actionType}
              meta={auditLog.meta}
              publicId={auditLog.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="AI 调用日志">
          <p className="text-text-muted mb-2 text-xs">AI 调用日志只读</p>
          {preview.aiCallLogs.map((aiCallLog) => (
            <AdminOpsSummaryRow
              key={aiCallLog.publicId}
              label={aiCallLog.aiFuncType}
              meta={aiCallLog.meta}
              publicId={aiCallLog.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="成本汇总">
          {preview.costSummaries.map((costSummary) => (
            <AdminOpsSummaryRow
              key={costSummary.publicId}
              label={costSummary.label}
              meta={costSummary.meta}
              publicId={costSummary.publicId}
            />
          ))}
        </AdminOpsPanel>
      </div>

      {confirmationKind === null ? null : (
        <AdminOpsConfirmationDialog
          confirmationKind={confirmationKind}
          onCancel={() => setConfirmationKind(null)}
          onConfirm={() => {
            setConfirmationKind(null);

            if (confirmationKind === "enableModelConfig") {
              setToastMessage({
                tone: "success",
                message: "模型配置已启用",
              });
              return;
            }

            setToastMessage({
              tone: "error",
              message: ADMIN_CONFLICT_MESSAGE,
            });
          }}
        />
      )}

      {toastMessage === null ? null : <AdminOpsToast message={toastMessage} />}
    </div>
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
      <Button variant="outline">查看</Button>
    </div>
  );
}

function AdminOpsConfirmationDialog({
  confirmationKind,
  onCancel,
  onConfirm,
}: {
  confirmationKind: ConfirmationKind;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDisableModelConfig = confirmationKind === "disableModelConfig";
  const title = isDisableModelConfig
    ? "模型配置停用需要二次确认"
    : "确认启用模型配置？";
  const confirmLabel = isDisableModelConfig ? "确认停用" : "确认启用";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <h2 className="text-text-primary text-base font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant={isDisableModelConfig ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminOpsToast({ message }: { message: ToastMessage }) {
  return (
    <div
      className={
        message.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={message.tone === "success" ? "status" : "alert"}
    >
      {message.message}
    </div>
  );
}
