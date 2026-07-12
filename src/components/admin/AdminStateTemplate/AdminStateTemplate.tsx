"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

type AdminStateTemplateVariant =
  | "loading"
  | "empty"
  | "error"
  | "forbidden"
  | "missing-context"
  | "standard-unavailable"
  | "unauthorized";

type AdminStateTemplateAction =
  | {
      href: string;
      label: string;
    }
  | {
      label: string;
      onClick: () => void;
    };

const adminStateTemplateIcon = {
  empty: <CheckCircle2 aria-hidden="true" className="size-5" />,
  error: <AlertCircle aria-hidden="true" className="size-5" />,
  forbidden: <LockKeyhole aria-hidden="true" className="size-5" />,
  loading: <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />,
  "missing-context": <Building2 aria-hidden="true" className="size-5" />,
  "standard-unavailable": <AlertCircle aria-hidden="true" className="size-5" />,
  unauthorized: <LockKeyhole aria-hidden="true" className="size-5" />,
} satisfies Record<AdminStateTemplateVariant, ReactNode>;

export function AdminStateTemplate({
  action,
  description,
  details,
  title,
  variant,
  withinWorkspace = false,
}: {
  action?: AdminStateTemplateAction | null;
  description: string;
  details?: readonly string[];
  title: string;
  variant: AdminStateTemplateVariant;
  withinWorkspace?: boolean;
}) {
  const isLoading = variant === "loading";
  const isEmpty = variant === "empty";
  const role = isLoading || isEmpty ? "status" : "alert";
  const Container = withinWorkspace ? "div" : "main";

  return (
    <Container
      className={`bg-background flex items-center justify-center px-6 ${
        withinWorkspace ? "min-h-full py-12" : "min-h-screen"
      }`}
    >
      <section
        aria-live={role === "status" ? "polite" : "assertive"}
        className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center"
        data-admin-ux-state={variant}
        role={role}
      >
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
          {adminStateTemplateIcon[variant]}
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-text-primary text-xl font-semibold">
            {title}
          </h1>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
        {details !== undefined && details.length > 0 ? (
          <ul className="border-border bg-surface grid w-full gap-2 rounded-md border p-3 text-left text-sm">
            {details.map((detail) => (
              <li className="text-text-secondary leading-6" key={detail}>
                {detail}
              </li>
            ))}
          </ul>
        ) : null}
        {action !== null && action !== undefined ? (
          "href" in action ? (
            <Link
              className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
              href={action.href}
            >
              {action.label}
            </Link>
          ) : (
            <button
              className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          )
        ) : null}
      </section>
    </Container>
  );
}

export function AdminWorkspaceContextBand({
  capabilityLabel,
  roleLabel,
  scopeLabel,
  workspaceLabel,
}: {
  capabilityLabel: string;
  roleLabel: string;
  scopeLabel: string;
  workspaceLabel: string;
}) {
  return (
    <section
      aria-label="当前后台上下文"
      className="border-border bg-surface mb-4 grid gap-3 rounded-md border px-4 py-3 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      data-testid="admin-workspace-context-band"
    >
      <div className="space-y-1">
        <p className="text-brand-primary text-xs font-medium">
          {workspaceLabel}
        </p>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {roleLabel}
        </h2>
      </div>
      <div className="grid gap-2 text-sm lg:grid-cols-2">
        <p className="text-text-secondary leading-6">{scopeLabel}</p>
        <p className="text-text-secondary leading-6">{capabilityLabel}</p>
      </div>
    </section>
  );
}
