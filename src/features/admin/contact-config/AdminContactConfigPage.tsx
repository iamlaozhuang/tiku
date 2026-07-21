"use client";

import {
  Image as ImageIcon,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminToast } from "@/components/admin/AdminToast";
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
  ContactConfigQrImageUploadResultDto,
  PurchaseGuidanceContactConfigDto,
  PurchaseGuidanceContactConfigResultDto,
  UpdateContactConfigInputDto,
} from "@/server/contracts/contact-config-contract";

type LoadState = "loading" | "ready" | "unauthorized" | "error";
type UploadState = "error" | "idle" | "success" | "uploading";

type ContactConfigChannelFormState = ContactConfigChannelDto & {
  formId: string;
  uploadState: UploadState;
};

type ContactConfigFormState = {
  title: string;
  summary: string;
  channels: ContactConfigChannelFormState[];
  safetyNotice: string;
};

type ToastMessage = {
  message: string;
  tone: "success" | "error";
};

const emptyFormState: ContactConfigFormState = {
  channels: [],
  safetyNotice: "",
  summary: "",
  title: "",
};

function createEmptyChannelFormState(
  index: number,
  channelType: ContactConfigChannelDto["channelType"] = "phone",
): ContactConfigChannelFormState {
  return {
    channelType,
    formId: `contact-channel-${index}-${channelType}`,
    href: channelType === "phone" ? "tel:" : null,
    isEnabled: true,
    label: channelType === "phone" ? "运营电话" : "企业微信",
    qrImageUrl: null,
    serviceHours: "工作日 09:00-18:00",
    uploadState: "idle",
    usage: channelType === "phone" ? "购买咨询" : "企业微信购买咨询",
    value: "",
  };
}

function toChannelFormState(
  channel: ContactConfigChannelDto,
  index: number,
): ContactConfigChannelFormState {
  const compatibleChannel = channel as ContactConfigChannelDto &
    Partial<Pick<ContactConfigChannelDto, "isEnabled" | "qrImageUrl">>;

  return {
    ...channel,
    formId: `contact-channel-${index}-${channel.channelType}`,
    isEnabled: compatibleChannel.isEnabled ?? true,
    qrImageUrl: compatibleChannel.qrImageUrl ?? null,
    uploadState: "idle",
  };
}

function toFormState(
  contactConfig: PurchaseGuidanceContactConfigDto,
): ContactConfigFormState {
  return {
    channels:
      contactConfig.channels.length === 0
        ? [createEmptyChannelFormState(0)]
        : contactConfig.channels.map(toChannelFormState),
    safetyNotice: contactConfig.safetyNotice,
    summary: contactConfig.summary,
    title: contactConfig.title,
  };
}

function toUpdateContactConfigInput(
  formState: ContactConfigFormState,
  expectedRevision: number,
): UpdateContactConfigInputDto {
  return {
    channels: formState.channels.map((channel) => ({
      channelType: channel.channelType,
      href:
        channel.href === null || channel.href.trim().length === 0
          ? null
          : channel.href.trim(),
      isEnabled: channel.isEnabled,
      label: channel.label.trim(),
      qrImageUrl: channel.qrImageUrl,
      serviceHours: channel.serviceHours.trim(),
      usage: channel.usage.trim(),
      value: channel.value.trim(),
    })),
    expectedRevision,
    safetyNotice: formState.safetyNotice.trim(),
    summary: formState.summary.trim(),
    title: formState.title.trim(),
  };
}

async function putContactConfig(
  formState: ContactConfigFormState,
  expectedRevision: number,
  sessionToken: string,
): Promise<ApiResponse<PurchaseGuidanceContactConfigResultDto | null>> {
  const response = await fetch("/api/v1/contact-configs", {
    body: JSON.stringify(
      toUpdateContactConfigInput(formState, expectedRevision),
    ),
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "PUT",
  });

  return (await response.json()) as ApiResponse<PurchaseGuidanceContactConfigResultDto | null>;
}

async function postContactConfigQrImage(
  file: File,
  sessionToken: string,
): Promise<ApiResponse<ContactConfigQrImageUploadResultDto | null>> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/v1/contact-configs/qr-images", {
    body: formData,
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
    method: "POST",
  });

  return (await response.json()) as ApiResponse<ContactConfigQrImageUploadResultDto | null>;
}

function buildContactConfigPreview(
  formState: ContactConfigFormState,
): PurchaseGuidanceContactConfigDto {
  return {
    channels: formState.channels.map((channel) => ({
      channelType: channel.channelType,
      href: channel.href,
      isEnabled: channel.isEnabled,
      label: channel.label,
      qrImageUrl: channel.qrImageUrl,
      serviceHours: channel.serviceHours,
      usage: channel.usage,
      value: channel.value,
    })),
    publicId: "contact-config-preview",
    revision: 0,
    safetyNotice: formState.safetyNotice,
    summary: formState.summary,
    title: formState.title,
    updatedAt: "",
  };
}

export function AdminContactConfigPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [contactConfig, setContactConfig] =
    useState<PurchaseGuidanceContactConfigDto | null>(null);
  const [formState, setFormState] =
    useState<ContactConfigFormState>(emptyFormState);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previewContactConfig = useMemo(
    () => buildContactConfigPreview(formState),
    [formState],
  );

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

  function updateChannel(
    index: number,
    nextFields: Partial<ContactConfigChannelFormState>,
  ) {
    setFormState((current) => ({
      ...current,
      channels: current.channels.map((channel, channelIndex) =>
        channelIndex === index
          ? {
              ...channel,
              ...nextFields,
            }
          : channel,
      ),
    }));
  }

  function handleAddChannel() {
    setFormState((current) => ({
      ...current,
      channels: [
        ...current.channels,
        createEmptyChannelFormState(current.channels.length, "wechat_work"),
      ],
    }));
  }

  function handleRemoveChannel(index: number) {
    setFormState((current) => ({
      ...current,
      channels:
        current.channels.length <= 1
          ? current.channels
          : current.channels.filter(
              (_, channelIndex) => channelIndex !== index,
            ),
    }));
  }

  async function handleUploadQrImage(index: number, file: File | undefined) {
    if (file === undefined) {
      return;
    }

    const sessionToken = getStoredSessionToken();

    if (sessionToken === null) {
      setLoadState("unauthorized");
      return;
    }

    updateChannel(index, { uploadState: "uploading" });
    setToastMessage(null);

    try {
      const response = await postContactConfigQrImage(file, sessionToken);

      if (response.code !== 0 || response.data === null) {
        updateChannel(index, { uploadState: "error" });
        setToastMessage({
          message: response.message,
          tone: "error",
        });
        return;
      }

      updateChannel(index, {
        qrImageUrl: response.data.qrImage.qrImageUrl,
        uploadState: "success",
      });
      setToastMessage({
        message: "二维码图片已上传，请保存购买联系方式。",
        tone: "success",
      });
    } catch {
      updateChannel(index, { uploadState: "error" });
      setToastMessage({
        message: "二维码图片上传失败。",
        tone: "error",
      });
    }
  }

  async function handleSubmitContactConfig() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || contactConfig === null) {
      setLoadState("unauthorized");
      return;
    }

    setIsSaving(true);
    setToastMessage(null);

    try {
      const response = await putContactConfig(
        formState,
        contactConfig.revision,
        sessionToken,
      );

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
            学员购买引导使用当前启用的购买联系方式配置；电话、企业微信和二维码使用同一份渠道数据。
          </p>
        </div>
        <div className="border-border bg-surface flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4" />
          <span className="text-text-secondary">受保护配置</span>
        </div>
      </header>

      <OperationsContactConfigSummaryFirstBand contactConfig={contactConfig} />

      {toastMessage === null ? null : (
        <AdminToast
          feedback={{
            message: toastMessage.message,
            title:
              toastMessage.tone === "success"
                ? "购买联系方式已更新"
                : "购买联系方式操作失败",
            tone: toastMessage.tone,
          }}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(24rem,0.75fr)]">
        <form
          className="border-border bg-surface space-y-5 rounded-md border p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmitContactConfig();
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
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
              <span className="text-text-secondary">安全提示</span>
              <Input
                aria-label="购买联系方式安全提示"
                value={formState.safetyNotice}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    safetyNotice: event.target.value,
                  }))
                }
              />
            </label>
          </div>

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

          <section aria-label="联系渠道" className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h2 className="text-text-primary text-base font-semibold">
                  联系渠道
                </h2>
                <p className="text-text-muted text-sm">
                  电话和企业微信按同一结构保存；停用渠道不会出现在学员预览中。
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddChannel}
              >
                <Plus aria-hidden="true" className="size-4" />
                添加渠道
              </Button>
            </div>

            {formState.channels.map((channel, index) => (
              <ContactChannelEditor
                channel={channel}
                index={index}
                key={channel.formId}
                canRemove={formState.channels.length > 1}
                onChange={(nextFields) => updateChannel(index, nextFields)}
                onRemove={() => handleRemoveChannel(index)}
                onUploadQrImage={(file) =>
                  void handleUploadQrImage(index, file)
                }
              />
            ))}
          </section>

          <Button disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "保存中" : "保存购买联系方式"}
          </Button>
        </form>

        <PurchaseGuidancePreview contactConfig={previewContactConfig} />
      </section>
    </main>
  );
}

function ContactChannelEditor({
  canRemove,
  channel,
  index,
  onChange,
  onRemove,
  onUploadQrImage,
}: {
  canRemove: boolean;
  channel: ContactConfigChannelFormState;
  index: number;
  onChange: (nextFields: Partial<ContactConfigChannelFormState>) => void;
  onRemove: () => void;
  onUploadQrImage: (file: File | undefined) => void;
}) {
  const channelNumber = index + 1;

  return (
    <article className="border-border rounded-md border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h3 className="text-text-primary text-sm font-semibold">
            渠道 {channelNumber}
          </h3>
          <p className="text-text-muted text-sm">
            {channel.channelType === "phone"
              ? "电话渠道支持拨号链接。"
              : "企业微信渠道支持二维码上传和文字说明。"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-text-secondary inline-flex items-center gap-2 text-sm">
            <input
              aria-label={`渠道 ${channelNumber} 启用`}
              checked={channel.isEnabled}
              type="checkbox"
              onChange={(event) =>
                onChange({ isEnabled: event.currentTarget.checked })
              }
            />
            启用
          </label>
          <Button
            disabled={!canRemove}
            type="button"
            variant="outline"
            onClick={onRemove}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">渠道类型</span>
          <select
            aria-label={`渠道 ${channelNumber} 类型`}
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={channel.channelType}
            onChange={(event) => {
              const nextChannelType = event.target
                .value as ContactConfigChannelDto["channelType"];

              onChange({
                channelType: nextChannelType,
                href: nextChannelType === "phone" ? "tel:" : null,
                qrImageUrl:
                  nextChannelType === "wechat_work" ? channel.qrImageUrl : null,
              });
            }}
          >
            <option value="phone">电话</option>
            <option value="wechat_work">企业微信</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">渠道名称</span>
          <Input
            aria-label={`渠道 ${channelNumber} 名称`}
            value={channel.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">联系方式</span>
          <Input
            aria-label={`渠道 ${channelNumber} 联系方式`}
            value={channel.value}
            onChange={(event) => onChange({ value: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">服务时间</span>
          <Input
            aria-label={`渠道 ${channelNumber} 服务时间`}
            value={channel.serviceHours}
            onChange={(event) => onChange({ serviceHours: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
          <span className="text-text-secondary">使用场景</span>
          <Input
            aria-label={`渠道 ${channelNumber} 使用场景`}
            value={channel.usage}
            onChange={(event) => onChange({ usage: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
          <span className="text-text-secondary">跳转链接</span>
          <Input
            aria-label={`渠道 ${channelNumber} 跳转链接`}
            value={channel.href ?? ""}
            onChange={(event) =>
              onChange({
                href:
                  event.target.value.trim().length === 0
                    ? null
                    : event.target.value,
              })
            }
          />
        </label>
      </div>

      {channel.channelType === "wechat_work" ? (
        <div className="border-border bg-background mt-4 rounded-md border p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">二维码图片地址</span>
              <Input
                aria-label={`渠道 ${channelNumber} 二维码图片地址`}
                readOnly
                value={channel.qrImageUrl ?? ""}
              />
            </label>
            <label className="border-border bg-surface hover:bg-muted hover:text-foreground inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]">
              <Upload aria-hidden="true" className="size-4" />
              {channel.uploadState === "uploading" ? "上传中" : "上传二维码"}
              <input
                accept="image/jpeg,image/png,image/webp"
                aria-label={`渠道 ${channelNumber} 上传二维码`}
                className="sr-only"
                type="file"
                onChange={(event) =>
                  onUploadQrImage(event.currentTarget.files?.[0])
                }
              />
            </label>
            <Button
              disabled={channel.qrImageUrl === null}
              type="button"
              variant="outline"
              onClick={() => onChange({ qrImageUrl: null })}
            >
              删除二维码
            </Button>
          </div>
          {channel.qrImageUrl === null ? (
            <p className="text-text-muted mt-2 text-xs">
              企业微信渠道建议上传清晰二维码，并保留文字账号作为兜底。
            </p>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <div className="border-border flex size-24 items-center justify-center overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${channel.label}二维码配置预览`}
                  className="size-full object-cover"
                  src={channel.qrImageUrl}
                />
              </div>
              <p className="text-text-muted text-xs leading-5">
                保存后学员购买引导将展示该二维码；审计只记录上传元数据。
              </p>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

function PurchaseGuidancePreview({
  contactConfig,
}: {
  contactConfig: PurchaseGuidanceContactConfigDto;
}) {
  const enabledChannels = contactConfig.channels.filter(
    (channel) => channel.isEnabled,
  );

  return (
    <aside className="border-border bg-surface space-y-4 rounded-md border p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-brand-primary text-xs font-medium">学员端实时预览</p>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {contactConfig.title}
        </h2>
        <p className="text-text-secondary text-sm leading-6">
          {contactConfig.summary}
        </p>
      </div>
      <div className="space-y-3 text-sm">
        {enabledChannels.length === 0 ? (
          <div className="border-border rounded-md border p-3">
            <p className="text-text-muted">当前没有启用的购买渠道。</p>
          </div>
        ) : (
          enabledChannels.map((channel) => (
            <div
              className="border-border rounded-md border p-3"
              key={`${channel.channelType}:${channel.value}:${channel.label}`}
            >
              <div className="flex items-start gap-3">
                <div className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                  <ImageIcon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-text-primary font-medium">
                    {channel.label}
                  </p>
                  {channel.href === null ? (
                    <p className="text-brand-primary font-medium">
                      {channel.value}
                    </p>
                  ) : (
                    <a
                      className="text-brand-primary font-medium transition-transform active:scale-[0.98]"
                      href={channel.href}
                    >
                      {channel.value}
                    </a>
                  )}
                  <p className="text-text-secondary">{channel.serviceHours}</p>
                  <p className="text-text-muted">{channel.usage}</p>
                  {channel.qrImageUrl === null ? null : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      alt={`${channel.label}二维码`}
                      className="border-border mt-2 size-28 rounded-md border object-cover"
                      src={channel.qrImageUrl}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-text-muted text-xs leading-5">
        {contactConfig.safetyNotice}
      </p>
    </aside>
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
          <p className="text-brand-primary text-xs font-medium">购买配置总览</p>
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
