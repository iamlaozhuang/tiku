"use client";

import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  Ticket,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type {
  EmployeeListDto,
  OrganizationListDto,
  RedeemCodeGenerationDto,
  RedeemCodeListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import { LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG } from "@/server/contracts/contact-config-contract";
import type {
  OrgAuthListDto,
  OrgAuthResultDto,
} from "@/server/contracts/organization-auth-contract";
import type {
  AuthScopeType,
  AuthStatus,
  OrgTier,
  Profession,
  RedeemCodeStatus,
  UserStatus,
} from "@/server/models/auth";

type LoadState = "loading" | "ready" | "empty" | "unauthorized" | "error";

type AdminOrgAuthData = {
  organizations: OrganizationListDto["organizations"];
  orgAuths: OrgAuthListDto["orgAuths"];
  employees: EmployeeListDto["employees"];
};

type AdminRedeemCodeData = RedeemCodeListDto;

type OrgAuthConfirmationState =
  | {
      kind: "createOrgAuth";
    }
  | {
      kind: "cancelOrgAuth";
      publicId: string;
    }
  | null;

type RedeemCodeConfirmationState = {
  kind: "generateRedeemCode";
} | null;

type ToastMessage = {
  message: string;
  tone: "error" | "success";
};

type GeneratedRedeemCode = RedeemCodeGenerationDto["redeemCodes"][number];

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
const DEFAULT_LIST_QUERY = "page=1&pageSize=20";

const professionLabels = {
  logistics: "物流",
  marketing: "营销",
  monopoly: "专卖",
} satisfies Record<Profession, string>;

const orgTierLabels = {
  city: "市级",
  district: "区县级",
  province: "省级",
  station: "站点",
} satisfies Record<OrgTier, string>;

const authScopeTypeLabels = {
  current_and_descendants: "本级及下级",
  specified_nodes: "指定节点",
} satisfies Record<AuthScopeType, string>;

const authStatusLabels = {
  active: "生效中",
  cancelled: "已取消",
  expired: "已过期",
} satisfies Record<AuthStatus, string>;

const redeemCodeStatusLabels = {
  expired: "已过期",
  unused: "未使用",
  used: "已使用",
} satisfies Record<RedeemCodeStatus, string>;

const userStatusLabels = {
  active: "正常",
  disabled: "已禁用",
} satisfies Record<UserStatus, string>;

function getStoredSessionToken(): string | null {
  const sessionToken = localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)?.trim();

  return sessionToken === "" ? null : (sessionToken ?? null);
}

function createAdminAuthHeaders(sessionToken: string) {
  return {
    authorization: `Bearer ${sessionToken}`,
  };
}

async function fetchAdminApi<TData>(
  path: string,
  sessionToken: string,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    headers: createAdminAuthHeaders(sessionToken),
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

async function postAdminApi<TData>(
  path: string,
  sessionToken: string,
  body?: unknown,
): Promise<ApiResponse<TData | null>> {
  const response = await fetch(path, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      ...createAdminAuthHeaders(sessionToken),
      "content-type": "application/json",
    },
    method: "POST",
  });

  return (await response.json()) as ApiResponse<TData | null>;
}

function isUnauthorizedResponse(payload: ApiResponse<unknown>): boolean {
  return payload.code === 401001;
}

function isAdminContext(payload: AuthContextDto): boolean {
  return (
    payload.user.adminPublicId !== null &&
    (payload.user.adminRoles?.length ?? 0) > 0
  );
}

function formatDate(value: string | null): string {
  return value === null ? "未设置" : value.slice(0, 10);
}

function formatProfessionLevel(input: {
  profession: Profession;
  level: number;
}): string {
  return `${professionLabels[input.profession]} ${input.level}级`;
}

function createRedeemCodeListQuery(input: {
  keyword: string;
  status: RedeemCodeStatus | "all";
}): string {
  const searchParams = new URLSearchParams(DEFAULT_LIST_QUERY);
  const keyword = input.keyword.trim();

  if (input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (keyword.length > 0) {
    searchParams.set("keyword", keyword);
  }

  return searchParams.toString();
}

function createDefaultOrgAuthInput(
  organizations: AdminOrgAuthData["organizations"],
) {
  const organizationPublicId = organizations[0]?.publicId ?? "";

  return {
    accountQuota: 100,
    authScopeType: "current_and_descendants",
    expiresAt: "2027-05-25T00:00:00.000Z",
    level: 3,
    name: "本地验证企业授权",
    organizationPublicIds:
      organizationPublicId.length === 0 ? [] : [organizationPublicId],
    profession: "monopoly",
    purchaserOrganizationPublicId: organizationPublicId,
    startsAt: "2026-05-25T00:00:00.000Z",
  };
}

function createDefaultRedeemCodeInput() {
  return {
    count: 3,
    durationDay: 365,
    level: 3,
    profession: "monopoly",
    redeemDeadlineDate: "2026-06-24",
  };
}

function AdminSurfaceStatus({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-text-primary text-xl font-semibold">
          {title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{description}</p>
      </div>
      {action}
    </main>
  );
}

function AdminLoadingState({ label }: { label: string }) {
  return (
    <main className="space-y-4">
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[0, 1, 2].map((itemIndex) => (
          <div
            key={itemIndex}
            className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1"
          >
            <div className="bg-border h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-border mt-3 h-3 w-1/2 animate-pulse rounded" />
            <div className="bg-border mt-5 h-14 w-full animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </main>
  );
}

function AdminUnauthorizedState() {
  return (
    <AdminSurfaceStatus
      title="请先登录后台"
      description="后台数据需要有效的管理员会话，请登录后再查看。"
      icon={<AlertCircle className="size-5" aria-hidden="true" />}
      action={
        <Link
          href="/login"
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          前往登录
        </Link>
      }
    />
  );
}

function AdminErrorState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <AdminSurfaceStatus
      title={title}
      description={description}
      icon={<AlertCircle className="size-5" aria-hidden="true" />}
    />
  );
}

function AdminEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <AdminSurfaceStatus
      title={title}
      description={description}
      icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
    />
  );
}

function AdminPageHeader({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-brand-primary text-sm font-medium">Admin Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {title}
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/ops/organizations"
          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          企业授权
        </Link>
        <Link
          href="/ops/redeem-codes"
          className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          卡密管理
        </Link>
      </div>
    </header>
  );
}

function SystemOpsRequiredRoleEntry({
  actionHref,
  actionLabel,
  description,
  testId,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  testId: string;
  title: string;
}) {
  return (
    <section
      className="bg-surface border-brand-primary/30 rounded-md border p-4 shadow-sm"
      data-testid={testId}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">
            系统运营本地验收
          </p>
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
        <Link
          className="bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1">
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        {icon}
        {label}
      </div>
      <p className="font-heading text-text-primary mt-3 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function AdminPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="bg-surface ring-border rounded-md p-4 shadow-sm ring-1">
      <h2 className="text-text-primary text-base font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function AdminDataRow({
  children,
  publicId,
  testId,
}: {
  children: React.ReactNode;
  publicId: string;
  testId: string;
}) {
  return (
    <article
      className="border-border flex flex-col gap-3 border-t pt-3 first:border-t-0 first:pt-0 lg:flex-row lg:items-center lg:justify-between"
      data-public-id={publicId}
      data-testid={testId}
    >
      {children}
    </article>
  );
}

function OrganizationList({
  organizations,
}: {
  organizations: AdminOrgAuthData["organizations"];
}) {
  return (
    <AdminPanel title="企业组织">
      {organizations.map((organization) => (
        <AdminDataRow
          key={organization.publicId}
          publicId={organization.publicId}
          testId={`admin-organization-${organization.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary text-sm font-medium">
              {organization.name}
            </p>
            <p className="text-text-secondary text-xs">
              {orgTierLabels[organization.orgTier]} /{" "}
              {organization.employeeCount} 名员工
            </p>
            <p className="text-text-muted text-xs">
              父级 {organization.parentOrganizationPublicId ?? "无"} /{" "}
              {organization.authSummary ?? "暂无授权摘要"}
            </p>
          </div>
          <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
            {organization.status === "active" ? "启用" : "停用"}
          </span>
        </AdminDataRow>
      ))}
    </AdminPanel>
  );
}

function OrgAuthList({
  onCancelOrgAuth,
  orgAuths,
}: {
  onCancelOrgAuth: (publicId: string) => void;
  orgAuths: AdminOrgAuthData["orgAuths"];
}) {
  return (
    <AdminPanel title="企业授权">
      {orgAuths.map((orgAuth) => (
        <AdminDataRow
          key={orgAuth.publicId}
          publicId={orgAuth.publicId}
          testId={`admin-org-auth-${orgAuth.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary text-sm font-medium">
              {orgAuth.name}
            </p>
            <p className="text-text-secondary flex flex-wrap gap-1 text-xs">
              <span>{formatProfessionLevel(orgAuth)}</span>
              <span>/</span>
              <span>
                {orgAuth.usedQuota} / {orgAuth.accountQuota}
              </span>
            </p>
            <p className="text-text-muted text-xs">
              {authScopeTypeLabels[orgAuth.authScopeType]} /{" "}
              {formatDate(orgAuth.startsAt)} 至 {formatDate(orgAuth.expiresAt)}
            </p>
            <p className="text-text-muted text-xs">
              覆盖企业 {orgAuth.organizationPublicIds.join("、") || "无"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-success/10 text-success w-fit rounded-lg px-2 py-1 text-xs font-medium">
              {authStatusLabels[orgAuth.status]}
            </span>
            {orgAuth.status === "active" ? (
              <button
                type="button"
                className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                onClick={() => onCancelOrgAuth(orgAuth.publicId)}
              >
                取消授权
              </button>
            ) : null}
          </div>
        </AdminDataRow>
      ))}
    </AdminPanel>
  );
}

function EmployeeList({
  employees,
}: {
  employees: AdminOrgAuthData["employees"];
}) {
  return (
    <AdminPanel title="员工账号">
      {employees.map((employee) => (
        <AdminDataRow
          key={employee.publicId}
          publicId={employee.publicId}
          testId={`admin-employee-${employee.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary text-sm font-medium">
              {employee.name}
            </p>
            <p className="text-text-secondary text-xs">{employee.phone}</p>
            <p className="text-text-muted text-xs">
              用户 {employee.userPublicId} / 企业{" "}
              {employee.organizationPublicId}
            </p>
          </div>
          <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
            {userStatusLabels[employee.status]}
          </span>
        </AdminDataRow>
      ))}
    </AdminPanel>
  );
}

function RedeemCodeList({
  redeemCodes,
}: {
  redeemCodes: AdminRedeemCodeData["redeemCodes"];
}) {
  return (
    <AdminPanel title="卡密列表">
      {redeemCodes.map((redeemCode) => (
        <AdminDataRow
          key={redeemCode.publicId}
          publicId={redeemCode.publicId}
          testId={`admin-redeem-code-${redeemCode.publicId}`}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-text-primary font-mono text-sm font-semibold">
              {redeemCode.codeDisplay}
            </p>
            <p className="text-text-secondary text-xs">
              {formatProfessionLevel(redeemCode)} / 创建于{" "}
              {formatDate(redeemCode.createdAt)}
            </p>
            <p className="text-text-muted flex flex-wrap gap-1 text-xs">
              <span>兑换用户 {redeemCode.redeemedUserPublicId ?? "无"}</span>
              <span>/</span>
              <span>
                {redeemCode.canViewPlainText ? "可查看明文" : "不可查看明文"}
              </span>
            </p>
          </div>
          <span className="bg-secondary text-secondary-foreground w-fit rounded-lg px-2 py-1 text-xs font-medium">
            {redeemCodeStatusLabels[redeemCode.status]}
          </span>
        </AdminDataRow>
      ))}
    </AdminPanel>
  );
}

function RedeemCodePlainTextUnavailableNotice() {
  return (
    <section className="border-border bg-surface rounded-md border border-dashed p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <AlertCircle className="size-4" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-text-primary text-base font-semibold">
            卡密明文不可用
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            当前列表仅返回脱敏卡密，不能直接交给学员兑换。需要通过受控生成流程提供一次性卡密后再验证学生兑换。
          </p>
        </div>
      </div>
    </section>
  );
}

function AdminToast({ toastMessage }: { toastMessage: ToastMessage }) {
  return (
    <div
      className={
        toastMessage.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={toastMessage.tone === "success" ? "status" : "alert"}
    >
      {toastMessage.message}
    </div>
  );
}

function OrgAuthConfirmationDialog({
  confirmationState,
  onCancel,
  onConfirm,
}: {
  confirmationState: Exclude<OrgAuthConfirmationState, null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isCreate = confirmationState.kind === "createOrgAuth";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="text-text-primary text-base font-semibold">
            {isCreate ? "确认创建企业授权？" : "确认取消企业授权？"}
          </h2>
        </div>
        <p className="text-text-muted text-sm">
          {isCreate
            ? "创建会提交企业 publicId、授权范围、专业等级、额度和有效期，由后端执行重叠校验。"
            : "取消会终止该企业授权，并由后端处理受影响的练习和模拟考试会话。"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={
              isCreate
                ? "bg-primary text-primary-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
                : "bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            }
            onClick={onConfirm}
          >
            {isCreate ? "确认创建" : "确认取消"}
          </button>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function RedeemCodeConfirmationDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle
            className="text-brand-primary size-4"
            aria-hidden="true"
          />
          <h2 className="text-text-primary text-base font-semibold">
            确认生成卡密？
          </h2>
        </div>
        <p className="text-text-muted text-sm">
          批量生成会调用后端原子创建流程；明文只在本次响应中显示，不能写入
          evidence。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-destructive text-destructive-foreground inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onConfirm}
          >
            确认生成
          </button>
          <button
            type="button"
            className="border-border bg-background hover:bg-muted hover:text-foreground inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-transform active:scale-[0.98]"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function OrgAuthActionPanel({
  disabled,
  id,
  onCreateOrgAuth,
}: {
  disabled: boolean;
  id?: string;
  onCreateOrgAuth: () => void;
}) {
  return (
    <section
      className="bg-surface border-border rounded-md border p-4 shadow-sm"
      id={id}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-brand-primary text-xs font-medium">org_auth</p>
          <h2 className="text-text-primary text-base font-semibold">
            本页创建企业授权
          </h2>
          <p className="text-text-secondary text-sm leading-6">
            使用第一条企业组织作为购买主体和覆盖范围，提交后由后端校验重叠范围与权限。
          </p>
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={onCreateOrgAuth}
        >
          创建企业授权
        </button>
      </div>
    </section>
  );
}

function RedeemCodeActionPanel({
  id,
  keyword,
  onGenerateRedeemCode,
  onKeywordChange,
  onStatusChange,
  status,
}: {
  id?: string;
  keyword: string;
  onGenerateRedeemCode: () => void;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: RedeemCodeStatus | "all") => void;
  status: RedeemCodeStatus | "all";
}) {
  return (
    <section
      className="bg-surface border-border flex flex-wrap items-end gap-3 rounded-md border p-4 shadow-sm"
      id={id}
    >
      <label className="flex min-w-44 flex-col gap-2 text-sm font-medium">
        <span className="text-text-secondary">卡密状态</span>
        <select
          className="border-border bg-background h-9 rounded-md border px-3 text-sm"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as RedeemCodeStatus | "all")
          }
        >
          <option value="all">全部状态</option>
          <option value="unused">未使用</option>
          <option value="used">已使用</option>
          <option value="expired">已过期</option>
        </select>
      </label>
      <label className="flex min-w-56 flex-col gap-2 text-sm font-medium">
        <span className="text-text-secondary">卡密搜索</span>
        <input
          className="border-border bg-background h-9 rounded-md border px-3 text-sm"
          placeholder="卡密号或批次关键词"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
        onClick={onGenerateRedeemCode}
      >
        生成卡密
      </button>
      <p className="text-text-muted text-sm">
        筛选变化自动刷新；生成操作需要二次确认。
      </p>
    </section>
  );
}

function SystemOpsPurchaseGuidanceContactConfig() {
  const contactConfig = LOCAL_PURCHASE_GUIDANCE_CONTACT_CONFIG;

  return (
    <section
      className="border-border bg-surface rounded-md border p-4 shadow-sm"
      data-testid="system-ops-purchase-guidance-contact-config"
    >
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <Ticket className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <p className="text-brand-primary text-xs font-medium">
              contact_config
            </p>
            <h2 className="text-text-primary text-base font-semibold">
              {contactConfig.title}
            </h2>
            <p className="text-text-secondary text-sm leading-6">
              {contactConfig.summary}
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {contactConfig.channels.map((channel) => (
              <div
                key={`${channel.channelType}-${channel.value}`}
                className="bg-background ring-border rounded-md p-3 text-sm ring-1"
              >
                <p className="text-text-primary font-medium">{channel.label}</p>
                <p className="text-brand-primary font-medium">
                  {channel.value}
                </p>
                <p className="text-text-secondary mt-1">
                  {channel.serviceHours}
                </p>
                <p className="text-text-muted mt-1">{channel.usage}</p>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-xs leading-5">
            {contactConfig.safetyNotice}
          </p>
        </div>
      </div>
    </section>
  );
}

function useAdminOrgAuthData() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminOrgAuthData>({
    employees: [],
    orgAuths: [],
    organizations: [],
  });

  useEffect(() => {
    let isActive = true;

    async function loadAdminOrgAuthData() {
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

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        const [organizationResponse, orgAuthResponse, employeeResponse] =
          await Promise.all([
            fetchAdminApi<OrganizationListDto>(
              `/api/v1/organizations?${DEFAULT_LIST_QUERY}`,
              sessionToken,
            ),
            fetchAdminApi<OrgAuthListDto>(
              `/api/v1/org-auths?${DEFAULT_LIST_QUERY}`,
              sessionToken,
            ),
            fetchAdminApi<EmployeeListDto>(
              `/api/v1/employees?${DEFAULT_LIST_QUERY}`,
              sessionToken,
            ),
          ]);

        if (!isActive) {
          return;
        }

        if (
          organizationResponse.code !== 0 ||
          organizationResponse.data === null ||
          orgAuthResponse.code !== 0 ||
          orgAuthResponse.data === null ||
          employeeResponse.code !== 0 ||
          employeeResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        const nextData = {
          employees: employeeResponse.data.employees,
          orgAuths: orgAuthResponse.data.orgAuths,
          organizations: organizationResponse.data.organizations,
        };

        setData(nextData);
        setLoadState(
          nextData.organizations.length === 0 &&
            nextData.orgAuths.length === 0 &&
            nextData.employees.length === 0
            ? "empty"
            : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminOrgAuthData();

    return () => {
      isActive = false;
    };
  }, []);

  return { data, loadState, setData, setLoadState };
}

function useAdminRedeemCodeData(listQuery: string) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminRedeemCodeData>({
    redeemCodes: [],
  });

  useEffect(() => {
    let isActive = true;

    async function loadAdminRedeemCodeData() {
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

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        const redeemCodeResponse = await fetchAdminApi<RedeemCodeListDto>(
          `/api/v1/redeem-codes?${listQuery}`,
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (redeemCodeResponse.code !== 0 || redeemCodeResponse.data === null) {
          setLoadState("error");
          return;
        }

        setData(redeemCodeResponse.data);
        setLoadState(
          redeemCodeResponse.data.redeemCodes.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminRedeemCodeData();

    return () => {
      isActive = false;
    };
  }, [listQuery]);

  return { data, loadState, setData, setLoadState };
}

export function AdminOrgAuthPage() {
  const { data, loadState, setData, setLoadState } = useAdminOrgAuthData();
  const [confirmationState, setConfirmationState] =
    useState<OrgAuthConfirmationState>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const totalEmployeeCount = useMemo(
    () =>
      data.organizations.reduce(
        (employeeCount, organization) =>
          employeeCount + organization.employeeCount,
        0,
      ),
    [data.organizations],
  );

  async function handleConfirmOrgAuthAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || confirmationState === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    if (confirmationState.kind === "createOrgAuth") {
      const createResponse = await postAdminApi<OrgAuthResultDto>(
        "/api/v1/org-auths",
        sessionToken,
        createDefaultOrgAuthInput(data.organizations),
      );

      setConfirmationState(null);

      if (createResponse.code !== 0 || createResponse.data === null) {
        setToastMessage({
          message: createResponse.message,
          tone: "error",
        });
        return;
      }

      const createdOrgAuth = createResponse.data.orgAuth;

      setData((currentData) => ({
        ...currentData,
        orgAuths: [
          createdOrgAuth,
          ...currentData.orgAuths.filter(
            (orgAuth) => orgAuth.publicId !== createdOrgAuth.publicId,
          ),
        ],
      }));
      setToastMessage({ message: "企业授权已创建", tone: "success" });
      return;
    }

    const cancelResponse = await postAdminApi<OrgAuthResultDto>(
      `/api/v1/org-auths/${confirmationState.publicId}/cancel`,
      sessionToken,
    );

    setConfirmationState(null);

    if (cancelResponse.code !== 0 || cancelResponse.data === null) {
      setToastMessage({
        message: cancelResponse.message,
        tone: "error",
      });
      return;
    }

    const cancelledOrgAuth = cancelResponse.data.orgAuth;

    setData((currentData) => ({
      ...currentData,
      orgAuths: currentData.orgAuths.map((orgAuth) =>
        orgAuth.publicId === cancelledOrgAuth.publicId
          ? cancelledOrgAuth
          : orgAuth,
      ),
    }));
    setToastMessage({ message: "企业授权已取消", tone: "success" });
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载企业授权运营数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="企业授权运营数据加载失败"
        description="请稍后刷新页面，或重新登录后再查看企业授权运营数据。"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        title="暂无企业授权运营数据"
        description="当前没有可展示的企业、企业授权或员工账号记录。"
      />
    );
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title="企业授权运营"
        description="查看企业组织、企业授权与员工账号的最小运营切片，所有数据均来自受保护的本地 runtime API。"
        icon={<Building2 className="size-5" aria-hidden="true" />}
      />

      <SystemOpsRequiredRoleEntry
        actionHref="#org-auth-create-panel"
        actionLabel="新增企业授权"
        description="企业授权新增入口在本页下方，点击后定位到内联表单；提交前仍由二次确认保护写操作，并继续只提交 publicId。"
        testId="system-ops-org-auth-create-entry"
        title="新增企业授权入口"
      />

      <OrgAuthActionPanel
        disabled={data.organizations.length === 0}
        id="org-auth-create-panel"
        onCreateOrgAuth={() => setConfirmationState({ kind: "createOrgAuth" })}
      />

      <section className="grid gap-4 xl:grid-cols-3" aria-label="企业授权摘要">
        <SummaryTile
          icon={<Building2 className="size-4" aria-hidden="true" />}
          label="企业组织"
          value={`${data.organizations.length}`}
        />
        <SummaryTile
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
          label="企业授权"
          value={`${data.orgAuths.length}`}
        />
        <SummaryTile
          icon={<UsersRound className="size-4" aria-hidden="true" />}
          label="组织员工"
          value={`${totalEmployeeCount}`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <OrganizationList organizations={data.organizations} />
        <OrgAuthList
          orgAuths={data.orgAuths}
          onCancelOrgAuth={(publicId) =>
            setConfirmationState({ kind: "cancelOrgAuth", publicId })
          }
        />
        <EmployeeList employees={data.employees} />
      </section>

      {confirmationState === null ? null : (
        <OrgAuthConfirmationDialog
          confirmationState={confirmationState}
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmOrgAuthAction()}
        />
      )}

      {toastMessage === null ? null : (
        <AdminToast toastMessage={toastMessage} />
      )}
    </main>
  );
}

export function AdminRedeemCodePage() {
  const [redeemCodeStatus, setRedeemCodeStatus] = useState<
    RedeemCodeStatus | "all"
  >("all");
  const [redeemCodeKeyword, setRedeemCodeKeyword] = useState("");
  const redeemCodeListQuery = useMemo(
    () =>
      createRedeemCodeListQuery({
        keyword: redeemCodeKeyword,
        status: redeemCodeStatus,
      }),
    [redeemCodeKeyword, redeemCodeStatus],
  );
  const { data, loadState, setData, setLoadState } =
    useAdminRedeemCodeData(redeemCodeListQuery);
  const [confirmationState, setConfirmationState] =
    useState<RedeemCodeConfirmationState>(null);
  const [generatedRedeemCode, setGeneratedRedeemCode] =
    useState<GeneratedRedeemCode | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const hasUnavailablePlainTextCode = data.redeemCodes.some(
    (redeemCode) =>
      redeemCode.status === "unused" && !redeemCode.canViewPlainText,
  );

  async function handleConfirmRedeemCodeAction() {
    const sessionToken = getStoredSessionToken();

    if (sessionToken === null || confirmationState === null) {
      setConfirmationState(null);
      setLoadState("unauthorized");
      return;
    }

    const createResponse = await postAdminApi<RedeemCodeGenerationDto>(
      "/api/v1/redeem-codes",
      sessionToken,
      createDefaultRedeemCodeInput(),
    );

    setConfirmationState(null);

    if (createResponse.code !== 0 || createResponse.data === null) {
      setToastMessage({
        message: createResponse.message,
        tone: "error",
      });
      return;
    }

    const firstGeneratedRedeemCode = createResponse.data.redeemCodes[0] ?? null;
    const generatedRedeemCodes = createResponse.data.redeemCodes;

    setGeneratedRedeemCode(firstGeneratedRedeemCode);
    setData((currentData) => ({
      redeemCodes: [
        ...generatedRedeemCodes.map((redeemCode) => ({
          canViewPlainText: true,
          codeDisplay: redeemCode.codeDisplay,
          createdAt: redeemCode.createdAt,
          level: redeemCode.level,
          profession: redeemCode.profession,
          publicId: redeemCode.publicId,
          redeemDeadlineAt: redeemCode.redeemDeadlineAt,
          redeemedUserPublicId: null,
          status: redeemCode.status,
        })),
        ...currentData.redeemCodes,
      ],
    }));
    setToastMessage({
      message: "卡密已生成，请仅在本地验证时复制给学员",
      tone: "success",
    });
  }

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载卡密数据" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="卡密数据加载失败"
        description="请稍后刷新页面，或重新登录后再查看卡密列表。"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <AdminEmptyState
        title="暂无卡密数据"
        description="当前没有可展示的卡密记录。"
      />
    );
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title="卡密管理"
        description="查看卡密使用状态和授权范围。页面只展示 API 提供的脱敏卡密，不展示明文或哈希。"
        icon={<Ticket className="size-5" aria-hidden="true" />}
      />

      <SystemOpsRequiredRoleEntry
        actionHref="#redeem-code-generate-panel"
        actionLabel="生成卡密"
        description="卡密生成入口在本页筛选区旁，点击后定位到内联操作；生成前必须经过二次确认，页面仍不会展示卡密哈希。"
        testId="system-ops-redeem-code-generate-entry"
        title="生成卡密入口"
      />

      <RedeemCodeActionPanel
        id="redeem-code-generate-panel"
        keyword={redeemCodeKeyword}
        status={redeemCodeStatus}
        onGenerateRedeemCode={() =>
          setConfirmationState({ kind: "generateRedeemCode" })
        }
        onKeywordChange={setRedeemCodeKeyword}
        onStatusChange={setRedeemCodeStatus}
      />

      <SystemOpsPurchaseGuidanceContactConfig />

      {generatedRedeemCode === null ? null : (
        <section
          aria-label="本地卡密生成结果"
          className="bg-surface border-success/40 rounded-md border p-4 shadow-sm"
        >
          <div className="space-y-2">
            <p className="text-text-primary text-sm font-semibold">
              卡密已生成，请仅在本地验证时复制给学员
            </p>
            <p className="text-text-secondary text-xs">
              明文仅在本次创建响应中展示；提交 evidence 时只记录脱敏摘要。
            </p>
            <p className="text-text-primary font-mono text-base font-semibold tracking-normal">
              {generatedRedeemCode.codePlainText}
            </p>
          </div>
        </section>
      )}

      {hasUnavailablePlainTextCode ? (
        <RedeemCodePlainTextUnavailableNotice />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3" aria-label="卡密摘要">
        <SummaryTile
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          label="卡密总数"
          value={`${data.redeemCodes.length}`}
        />
        <SummaryTile
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          label="未使用"
          value={`${
            data.redeemCodes.filter(
              (redeemCode) => redeemCode.status === "unused",
            ).length
          }`}
        />
        <SummaryTile
          icon={<Clock3 className="size-4" aria-hidden="true" />}
          label="已使用或过期"
          value={`${
            data.redeemCodes.filter(
              (redeemCode) => redeemCode.status !== "unused",
            ).length
          }`}
        />
      </section>

      <RedeemCodeList redeemCodes={data.redeemCodes} />

      {confirmationState === null ? null : (
        <RedeemCodeConfirmationDialog
          onCancel={() => setConfirmationState(null)}
          onConfirm={() => void handleConfirmRedeemCodeAction()}
        />
      )}

      {toastMessage === null ? null : (
        <AdminToast toastMessage={toastMessage} />
      )}
    </main>
  );
}
