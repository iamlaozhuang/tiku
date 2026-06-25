"use client";

import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ADMIN_CONFLICT_MESSAGE,
  ADMIN_PAGE_SIZE_OPTIONS,
} from "@/server/contracts/admin-interaction-contract";

type AdminUserOrgAuthOpsState = "ready" | "loading" | "empty" | "error";

type ConfirmationKind = "createAuthorization" | "generateRedeemCode";

type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

export function AdminUserOrgAuthOpsBaseline({
  state = "ready",
}: {
  state?: AdminUserOrgAuthOpsState;
}) {
  const [confirmationKind, setConfirmationKind] =
    useState<ConfirmationKind | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const preview = useMemo(
    () => ({
      users: [
        {
          publicId: "user-public-001",
          phone: "13800000000",
          name: "张三",
          organizationName: "杭州烟草",
          authStatus: "active",
        },
        {
          publicId: "user-public-002",
          phone: "13900000000",
          name: "李四",
          organizationName: null,
          authStatus: "expired",
        },
      ],
      organizations: [
        {
          publicId: "organization-public-001",
          name: "杭州烟草",
          orgTier: "city",
          employeeCount: 42,
        },
      ],
      authorizations: [
        {
          publicId: "authorization-public-001",
          purchaserName: "杭州烟草",
          quota: "42 / 100",
          status: "active",
        },
      ],
      redeemCodes: [
        {
          publicId: "redeem-code-public-001",
          codeDisplay: "RC-2026-****",
          status: "unused",
        },
      ],
      adminRoles: [
        { role: "super_admin", label: "超级管理员" },
        { role: "ops_admin", label: "运营管理员" },
        { role: "content_admin", label: "内容老师" },
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
        title="正在加载用户与授权运营数据"
      />
    );
  }

  if (state === "empty") {
    return (
      <AdminOpsStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无用户与授权运营数据"
      />
    );
  }

  if (state === "error") {
    return (
      <AdminOpsStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="用户与授权运营数据加载失败"
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">运营后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            用户、组织与授权运营
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setConfirmationKind("createAuthorization")}>
            创建企业授权
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmationKind("generateRedeemCode")}
          >
            生成卡密
          </Button>
        </div>
      </header>

      <div className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm lg:grid-cols-[12rem_12rem_1fr]">
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
            defaultValue="user"
          >
            <option value="user">用户</option>
            <option value="organization">企业组织</option>
            <option value="authorization">企业授权</option>
            <option value="redeemCode">卡密</option>
          </select>
        </label>
        <div className="text-text-muted flex items-end text-sm">
          后台账号与学员账号独立管理
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminOpsPanel title="用户管理">
          {preview.users.map((user) => (
            <div
              className="border-border flex items-center justify-between border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
              data-public-id={user.publicId}
              data-testid={`admin-user-${user.publicId}`}
              key={user.publicId}
            >
              <div>
                <p className="text-text-primary text-sm font-medium">
                  {user.name} / {user.phone}
                </p>
                <p className="text-text-muted text-xs">
                  {user.organizationName ?? "未绑定企业"} / {user.authStatus}
                </p>
              </div>
              <Button variant="outline">查看详情</Button>
            </div>
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="企业组织">
          {preview.organizations.map((organization) => (
            <AdminOpsSummaryRow
              key={organization.publicId}
              label={organization.name}
              meta={`${organization.orgTier} / ${organization.employeeCount} 名员工`}
              publicId={organization.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="企业授权">
          {preview.authorizations.map((authorization) => (
            <AdminOpsSummaryRow
              key={authorization.publicId}
              label={authorization.purchaserName}
              meta={`${authorization.quota} / ${authorization.status}`}
              publicId={authorization.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="卡密管理">
          {preview.redeemCodes.map((redeemCode) => (
            <AdminOpsSummaryRow
              key={redeemCode.publicId}
              label={redeemCode.codeDisplay}
              meta={redeemCode.status}
              publicId={redeemCode.publicId}
            />
          ))}
        </AdminOpsPanel>

        <AdminOpsPanel title="后台角色与权限">
          {preview.adminRoles.map((adminRole) => (
            <AdminOpsSummaryRow
              key={adminRole.role}
              label={adminRole.label}
              meta={adminRole.role}
              publicId={adminRole.role}
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

            if (confirmationKind === "createAuthorization") {
              setToastMessage({
                tone: "success",
                message: "企业授权已提交",
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
  icon: React.ReactNode;
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
  children: React.ReactNode;
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
}: {
  label: string;
  meta: string;
  publicId: string;
}) {
  return (
    <div
      className="border-border flex items-center justify-between border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
      data-public-id={publicId}
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
  const isRedeemCode = confirmationKind === "generateRedeemCode";
  const title = isRedeemCode ? "卡密生成需要二次确认" : "确认创建企业授权？";
  const confirmLabel = isRedeemCode ? "确认生成" : "确认创建";

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
            variant={isRedeemCode ? "destructive" : "default"}
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
