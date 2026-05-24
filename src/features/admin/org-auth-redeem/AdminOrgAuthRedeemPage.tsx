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
  RedeemCodeListDto,
} from "@/server/contracts/admin-user-org-auth-ops-contract";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { OrgAuthListDto } from "@/server/contracts/organization-auth-contract";
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
      description="企业授权与卡密运营数据需要有效的管理员会话，请登录后再查看。"
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
            系统运营 staging 必验
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

function OrgAuthList({ orgAuths }: { orgAuths: AdminOrgAuthData["orgAuths"] }) {
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
          </div>
          <span className="bg-success/10 text-success w-fit rounded-lg px-2 py-1 text-xs font-medium">
            {authStatusLabels[orgAuth.status]}
          </span>
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

  return { data, loadState };
}

function useAdminRedeemCodeData() {
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
          `/api/v1/redeem-codes?${DEFAULT_LIST_QUERY}`,
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
  }, []);

  return { data, loadState };
}

export function AdminOrgAuthPage() {
  const { data, loadState } = useAdminOrgAuthData();
  const totalEmployeeCount = useMemo(
    () =>
      data.organizations.reduce(
        (employeeCount, organization) =>
          employeeCount + organization.employeeCount,
        0,
      ),
    [data.organizations],
  );

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
        actionHref="/ops/users"
        actionLabel="新增企业授权"
        description="企业授权新增入口目前集中在运营后台闭环页；从这里跳转后由二次确认保护写操作，并继续只提交 publicId。"
        testId="system-ops-org-auth-create-entry"
        title="新增企业授权入口"
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
        <OrgAuthList orgAuths={data.orgAuths} />
        <EmployeeList employees={data.employees} />
      </section>
    </main>
  );
}

export function AdminRedeemCodePage() {
  const { data, loadState } = useAdminRedeemCodeData();

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
        actionHref="/ops/users"
        actionLabel="生成卡密"
        description="卡密生成入口目前集中在运营后台闭环页；从这里跳转后必须经过二次确认，页面仍不会展示卡密明文或哈希。"
        testId="system-ops-redeem-code-generate-entry"
        title="生成卡密入口"
      />

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
    </main>
  );
}
