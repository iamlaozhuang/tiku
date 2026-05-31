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
        message: "Contact config saved.",
        tone: "success",
      });
    } catch {
      setToastMessage({
        message: "Contact config save failed.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="Loading contact_config" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error" || contactConfig === null) {
    return (
      <AdminErrorState
        description="Refresh the page or sign in again before managing contact_config."
        title="Contact config failed to load"
      />
    );
  }

  return (
    <main className="space-y-6" data-testid="admin-contact-config-page">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">Admin Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            Contact config
          </h1>
          <p className="text-text-secondary max-w-3xl text-sm leading-6">
            Purchase guidance uses the active contact_config returned by the
            runtime API.
          </p>
        </div>
        <div className="border-border bg-surface flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4" />
          <span className="text-text-secondary">{contactConfig.publicId}</span>
        </div>
      </header>

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
            <span className="text-text-secondary">Title</span>
            <Input
              aria-label="Contact config title"
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
            <span className="text-text-secondary">Summary</span>
            <textarea
              aria-label="Contact config summary"
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
              <span className="text-text-secondary">Channel type</span>
              <select
                aria-label="Contact config channel type"
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
                <option value="phone">phone</option>
                <option value="wechat_work">wechat_work</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span className="text-text-secondary">Channel label</span>
              <Input
                aria-label="Contact config channel label"
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
              <span className="text-text-secondary">Channel value</span>
              <Input
                aria-label="Contact config channel value"
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
              <span className="text-text-secondary">Service hours</span>
              <Input
                aria-label="Contact config service hours"
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
            <span className="text-text-secondary">Usage</span>
            <Input
              aria-label="Contact config usage"
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
            <span className="text-text-secondary">Href</span>
            <Input
              aria-label="Contact config href"
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
            <span className="text-text-secondary">Safety notice</span>
            <textarea
              aria-label="Contact config safety notice"
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
            {isSaving ? "Saving" : "Save contact config"}
          </Button>
        </form>

        <aside className="border-border bg-surface space-y-4 rounded-md border p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="font-heading text-text-primary text-base font-semibold">
              Active preview
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
            Updated at {contactConfig.updatedAt}
          </p>
        </aside>
      </section>
    </main>
  );
}
