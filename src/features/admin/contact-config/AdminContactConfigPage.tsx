"use client";

import { Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "@/features/admin/content-admin-runtime";
import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type {
  ContactConfigChannelDto,
  PurchaseGuidanceContactConfigDto,
  PurchaseGuidanceContactConfigResultDto,
} from "@/server/contracts/contact-config-contract";

type LoadState = "loading" | "ready" | "unauthorized" | "error";

type ContactConfigFormState = {
  title: string;
  summary: string;
  channelType: ContactConfigChannelDto["channelType"];
  channelLabel: string;
  channelValue: string;
  serviceHours: string;
  usage: string;
  href: string;
  safetyNotice: string;
};

type ToastMessage = {
  message: string;
  tone: "success" | "error";
};

const emptyFormState: ContactConfigFormState = {
  channelLabel: "",
  channelType: "phone",
  channelValue: "",
  href: "",
  safetyNotice: "",
  serviceHours: "",
  summary: "",
  title: "",
  usage: "",
};

function toFormState(
  contactConfig: PurchaseGuidanceContactConfigDto,
): ContactConfigFormState {
  const firstChannel = contactConfig.channels[0];

  return {
    channelLabel: firstChannel?.label ?? "",
    channelType: firstChannel?.channelType ?? "phone",
    channelValue: firstChannel?.value ?? "",
    href: firstChannel?.href ?? "",
    safetyNotice: contactConfig.safetyNotice,
    serviceHours: firstChannel?.serviceHours ?? "",
    summary: contactConfig.summary,
    title: contactConfig.title,
    usage: firstChannel?.usage ?? "",
  };
}

async function putContactConfig(
  formState: ContactConfigFormState,
  sessionToken: string,
): Promise<ApiResponse<PurchaseGuidanceContactConfigResultDto | null>> {
  const response = await fetch("/api/v1/contact-configs", {
    body: JSON.stringify({
      channels: [
        {
          channelType: formState.channelType,
          href: formState.href.trim().length === 0 ? null : formState.href,
          label: formState.channelLabel,
          serviceHours: formState.serviceHours,
          usage: formState.usage,
          value: formState.channelValue,
        },
      ],
      safetyNotice: formState.safetyNotice,
      summary: formState.summary,
      title: formState.title,
    }),
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "PUT",
  });

  return (await response.json()) as ApiResponse<PurchaseGuidanceContactConfigResultDto | null>;
}

export function AdminContactConfigPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [contactConfig, setContactConfig] =
    useState<PurchaseGuidanceContactConfigDto | null>(null);
  const [formState, setFormState] =
    useState<ContactConfigFormState>(emptyFormState);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadContactConfig() {
      const sessionToken = getStoredSessionToken();

      if (sessionToken === null) {
        setLoadState("unauthorized");
        return;
      }

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        const contactConfigResponse =
          await fetchAdminApi<PurchaseGuidanceContactConfigResultDto>(
            "/api/v1/contact-configs",
            sessionToken,
          );

        if (
          !isActive ||
          contactConfigResponse.code !== 0 ||
          contactConfigResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        setContactConfig(contactConfigResponse.data.contactConfig);
        setFormState(toFormState(contactConfigResponse.data.contactConfig));
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadContactConfig();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmitContactConfig() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    setIsSaving(true);
    setToastMessage(null);

    try {
      const response = await putContactConfig(formState, sessionToken);

      if (response.code !== 0 || response.data === null) {
        setToastMessage({
          message: response.message,
          tone: "error",
        });
        return;
      }

      setContactConfig(response.data.contactConfig);
      setFormState(toFormState(response.data.contactConfig));
      setToastMessage({
        message: "购买联系方式已保存。",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "购买联系方式保存失败。",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载购买联系方式" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error" || contactConfig === null) {
    return (
      <AdminErrorState
        description="请刷新页面或重新登录后再管理购买联系方式。"
        title="购买联系方式加载失败"
      />
    );
  }

  return (
    <main className="space-y-6" data-testid="admin-contact-config-page">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">运营后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            购买联系方式
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm leading-6">
            学员购买引导使用当前启用的购买联系方式配置，并通过受保护接口加载。
          </p>
        </div>
        <div className="border-border bg-surface flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4" />
          <span className="text-text-secondary">受保护配置</span>
        </div>
      </header>

      <OperationsContactConfigSummaryFirstBand contactConfig={contactConfig} />

      {toastMessage !== null ? (
        <div
          className="border-border bg-surface rounded-md border px-3 py-2 text-sm shadow-sm"
          data-testid="admin-contact-config-toast"
        >
          {toastMessage.message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          className="border-border bg-surface space-y-4 rounded-md border p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmitContactConfig();
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">展示标题</span>
            <Input
              aria-label="购买联系方式标题"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">展示摘要</span>
            <textarea
              aria-label="购买联系方式摘要"
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={formState.summary}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">联系渠道类型</span>
              <select
                aria-label="联系渠道类型"
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                value={formState.channelType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    channelType: event.target
                      .value as ContactConfigChannelDto["channelType"],
                  }))
                }
              >
                <option value="phone">电话</option>
                <option value="wechat_work">企业微信</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">渠道名称</span>
              <Input
                aria-label="购买联系方式渠道名称"
                value={formState.channelLabel}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    channelLabel: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">渠道值</span>
              <Input
                aria-label="购买联系方式渠道值"
                value={formState.channelValue}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    channelValue: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">服务时间</span>
              <Input
                aria-label="购买联系方式服务时间"
                value={formState.serviceHours}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    serviceHours: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">使用场景</span>
            <Input
              aria-label="购买联系方式使用场景"
              value={formState.usage}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  usage: event.target.value,
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">跳转链接</span>
            <Input
              aria-label="购买联系方式跳转链接"
              value={formState.href}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  href: event.target.value,
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="text-text-secondary">安全提示</span>
            <textarea
              aria-label="购买联系方式安全提示"
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={formState.safetyNotice}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  safetyNotice: event.target.value,
                }))
              }
            />
          </label>

          <Button disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "保存中" : "保存购买联系方式"}
          </Button>
        </form>

        <aside className="border-border bg-surface space-y-4 rounded-md border p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="font-heading text-text-primary text-base font-semibold">
              当前预览
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              {contactConfig.title}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            {contactConfig.channels.map((channel) => (
              <div
                className="border-border rounded-md border p-3"
                key={`${channel.channelType}:${channel.value}`}
              >
                <p className="text-text-primary font-medium">{channel.label}</p>
                <p className="text-text-secondary">{channel.value}</p>
                <p className="text-text-muted">{channel.serviceHours}</p>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-xs">
            更新时间 {contactConfig.updatedAt}
          </p>
        </aside>
      </section>
    </main>
  );
}

function OperationsContactConfigSummaryFirstBand({
  contactConfig,
}: {
  contactConfig: PurchaseGuidanceContactConfigDto;
}) {
  return (
    <section
      aria-label="购买联系方式摘要优先"
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      data-testid="ops-contact-config-summary-first-band"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            购买配置 summary-first
          </p>
          <h2 className="text-text-primary text-base font-semibold">
            购买引导总览
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            标准版与高级版购买入口共用这组运营配置；保存只更新购买引导文案和渠道元数据，不改变授权版本、额度或升级判定。
          </p>
        </div>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
          {contactConfig.channels.length} 个渠道
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="border-border bg-background rounded-md border p-3">
          <p className="text-text-muted text-xs">当前标题</p>
          <p className="text-text-primary mt-2 text-sm font-medium">
            {contactConfig.title}
          </p>
        </div>
        <div className="border-border bg-background rounded-md border p-3">
          <p className="text-text-muted text-xs">安全边界</p>
          <p className="text-text-primary mt-2 text-sm leading-6">
            错误态提示刷新或重新登录；禁用态由保存中状态控制。
          </p>
        </div>
        <div className="border-border bg-background rounded-md border p-3">
          <p className="text-text-muted text-xs">版本边界</p>
          <p className="text-text-primary mt-2 text-sm leading-6">
            只说明标准版和高级版购买联系路径，不生成卡密、不写授权。
          </p>
        </div>
      </div>
    </section>
  );
}
