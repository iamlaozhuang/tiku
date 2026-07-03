"use client";

import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { adminFilterGridPanelClassName } from "@/components/admin/admin-layout-primitives";
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

type PreviewUser = {
  publicId: string;
  phone: string;
  name: string;
  organizationName: string | null;
  statusLabel: string;
  userCategoryLabel: string;
  authEditionLabel: string;
  accountDomainLabel: string;
  managedByLabel: string;
  canResetPassword: boolean;
  canDisable: boolean;
  canEnable: boolean;
};

type PreviewAdminRole = {
  role: string;
  label: string;
  scopeLabel: string;
  managerLabel: string;
  canManageAdminAccount: boolean;
};

export function AdminUserOrgAuthOpsBaseline({
  state = "ready",
}: {
  state?: AdminUserOrgAuthOpsState;
}) {
  const [confirmationKind, setConfirmationKind] =
    useState<ConfirmationKind | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [resetUserPublicId, setResetUserPublicId] = useState<string | null>(
    null,
  );

  const preview = useMemo(
    () => ({
      users: [
        {
          publicId: "user-public-000",
          phone: "13700000000",
          name: "王五",
          organizationName: null,
          statusLabel: "正常",
          userCategoryLabel: "未授权个人",
          authEditionLabel: "未授权",
          accountDomainLabel: "学员/员工账号域",
          managedByLabel: "平台运营",
          canResetPassword: true,
          canDisable: true,
          canEnable: false,
        },
        {
          publicId: "user-public-standard-001",
          phone: "13600000000",
          name: "赵六",
          organizationName: null,
          statusLabel: "正常",
          userCategoryLabel: "标准版个人",
          authEditionLabel: "标准版",
          accountDomainLabel: "学员/员工账号域",
          managedByLabel: "平台运营",
          canResetPassword: true,
          canDisable: true,
          canEnable: false,
        },
        {
          publicId: "user-public-advanced-001",
          phone: "13500000000",
          name: "孙七",
          organizationName: null,
          statusLabel: "正常",
          userCategoryLabel: "高级版个人",
          authEditionLabel: "高级版",
          accountDomainLabel: "学员/员工账号域",
          managedByLabel: "平台运营",
          canResetPassword: true,
          canDisable: true,
          canEnable: false,
        },
        {
          publicId: "user-public-001",
          phone: "13800000000",
          name: "张三",
          organizationName: "杭州烟草",
          statusLabel: "正常",
          userCategoryLabel: "企业员工",
          authEditionLabel: "继承企业授权",
          accountDomainLabel: "学员/员工账号域",
          managedByLabel: "平台运营",
          canResetPassword: true,
          canDisable: true,
          canEnable: false,
        },
        {
          publicId: "user-public-002",
          phone: "13900000000",
          name: "李四",
          organizationName: null,
          statusLabel: "停用",
          userCategoryLabel: "停用用户",
          authEditionLabel: "已过期",
          accountDomainLabel: "学员/员工账号域",
          managedByLabel: "平台运营",
          canResetPassword: true,
          canDisable: false,
          canEnable: true,
        },
        {
          publicId: "admin-public-001",
          phone: "13100000000",
          name: "内容老师账号",
          organizationName: null,
          statusLabel: "正常",
          userCategoryLabel: "后台管理员",
          authEditionLabel: "后台角色",
          accountDomainLabel: "后台管理员账号域",
          managedByLabel: "超级管理员",
          canResetPassword: true,
          canDisable: true,
          canEnable: false,
        },
        {
          publicId: "admin-org-public-001",
          phone: "13000000000",
          name: "企业管理员账号",
          organizationName: "杭州烟草",
          statusLabel: "正常",
          userCategoryLabel: "后台管理员",
          authEditionLabel: "组织管理员",
          accountDomainLabel: "后台管理员账号域",
          managedByLabel: "运营管理员限组织管理员",
          canResetPassword: true,
          canDisable: true,
          canEnable: false,
        },
      ] satisfies PreviewUser[],
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
        {
          role: "super_admin",
          label: "超级管理员",
          scopeLabel: "全局",
          managerLabel: "超级管理员维护",
          canManageAdminAccount: true,
        },
        {
          role: "ops_admin",
          label: "运营管理员",
          scopeLabel: "运营后台",
          managerLabel: "超级管理员维护",
          canManageAdminAccount: false,
        },
        {
          role: "content_admin",
          label: "内容老师",
          scopeLabel: "内容后台",
          managerLabel: "超级管理员维护",
          canManageAdminAccount: false,
        },
        {
          role: "org_standard_admin",
          label: "标准版企业管理员",
          scopeLabel: "组织后台",
          managerLabel: "运营管理员限明确组织范围维护",
          canManageAdminAccount: true,
        },
        {
          role: "org_advanced_admin",
          label: "高级版企业管理员",
          scopeLabel: "组织后台",
          managerLabel: "运营管理员限明确组织范围维护",
          canManageAdminAccount: true,
        },
      ] satisfies PreviewAdminRole[],
    }),
    [],
  );

  const resetUser = preview.users.find(
    (user) => user.publicId === resetUserPublicId,
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

      <div className={adminFilterGridPanelClassName}>
        <AdminOpsSelect label="每页条数" defaultValue="20">
          {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </AdminOpsSelect>
        <AdminOpsSelect label="运营范围" defaultValue="user">
          <option value="user">用户</option>
          <option value="organization">企业组织</option>
          <option value="authorization">企业授权</option>
          <option value="redeemCode">卡密</option>
        </AdminOpsSelect>
        <AdminOpsSelect label="用户分类" defaultValue="all">
          <option value="all">全部用户</option>
          <option value="no_auth_personal">未授权个人</option>
          <option value="personal_standard">标准版个人</option>
          <option value="personal_advanced">高级版个人</option>
          <option value="employee">企业员工</option>
          <option value="backend_admin">后台管理员</option>
          <option value="disabled">停用用户</option>
        </AdminOpsSelect>
        <AdminOpsSelect label="授权状态" defaultValue="all">
          <option value="all">全部授权</option>
          <option value="none">未授权</option>
          <option value="standard">标准版</option>
          <option value="advanced">高级版</option>
          <option value="expired">已过期</option>
        </AdminOpsSelect>
        <div className="text-text-muted flex items-end text-sm">
          后台账号与学员/员工账号独立管理
        </div>
      </div>

      <AdminOpsPanel title="用户管理">
        <div className="space-y-3">
          {preview.users.map((user) => (
            <div
              className="border-border grid gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto]"
              data-public-id={user.publicId}
              data-testid={`admin-user-${user.publicId}`}
              key={user.publicId}
            >
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-text-primary text-sm font-medium">
                    {user.name} / {user.phone}
                  </p>
                  <AdminOpsBadge>{user.userCategoryLabel}</AdminOpsBadge>
                  <AdminOpsBadge>{user.statusLabel}</AdminOpsBadge>
                  <AdminOpsBadge>{user.authEditionLabel}</AdminOpsBadge>
                </div>
                <p className="text-text-muted text-xs">
                  {user.organizationName ?? "未绑定企业"} /{" "}
                  {user.accountDomainLabel} / {user.managedByLabel}
                </p>
                <p className="text-text-muted text-xs">
                  手机号不可修改；首期不做物理删除
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Button variant="outline">查看详情</Button>
                <Button
                  variant="outline"
                  disabled={!user.canResetPassword}
                  onClick={() => setResetUserPublicId(user.publicId)}
                >
                  <KeyRound aria-hidden="true" className="size-4" />
                  重置密码
                </Button>
                {user.canEnable ? (
                  <Button variant="outline">启用</Button>
                ) : (
                  <Button variant="destructive" disabled={!user.canDisable}>
                    停用
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </AdminOpsPanel>

      {resetUser === undefined ? null : (
        <section
          className="border-border bg-surface rounded-md border p-4 shadow-sm"
          data-testid="admin-user-reset-distribution-window"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <KeyRound
                  aria-hidden="true"
                  className="text-brand-primary size-4"
                />
                <h2 className="text-text-primary text-base font-semibold">
                  一次性密码分发窗口
                </h2>
              </div>
              <p className="text-text-secondary text-sm">
                {resetUser.name}{" "}
                的重置结果仅在本次窗口展示；提交审计时不记录明文。
              </p>
              <p className="text-text-primary text-sm font-medium">
                LOCAL-RESET-ONCE
              </p>
              <p className="text-text-muted text-xs">
                正式重置流程会撤销该账号已有活跃会话；本地合同仅展示一次性分发窗口。
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setResetUserPublicId(null)}
            >
              关闭
            </Button>
          </div>
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
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
          <div className="space-y-3">
            {preview.adminRoles.map((adminRole) => (
              <div
                className="border-border flex items-center justify-between gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
                data-public-id={adminRole.role}
                key={adminRole.role}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-text-primary text-sm font-medium">
                      {adminRole.label}
                    </p>
                    <AdminOpsBadge>{adminRole.scopeLabel}</AdminOpsBadge>
                  </div>
                  <p className="text-text-muted text-xs">
                    {adminRole.managerLabel}
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={!adminRole.canManageAdminAccount}
                >
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  管理账号
                </Button>
              </div>
            ))}
          </div>
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

function AdminOpsSelect({
  children,
  defaultValue,
  label,
}: {
  children: React.ReactNode;
  defaultValue: string;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <select
        aria-label={label}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
        defaultValue={defaultValue}
      >
        {children}
      </select>
    </label>
  );
}

function AdminOpsBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-muted text-text-secondary rounded-md px-2 py-1 text-xs font-medium">
      {children}
    </span>
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
