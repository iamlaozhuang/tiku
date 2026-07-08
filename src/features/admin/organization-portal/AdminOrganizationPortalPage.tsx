"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  FileText,
  ShieldCheck,
  UsersRound,
  WandSparkles,
} from "lucide-react";

import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";
import type {
  OrganizationPortalAuthorizationDto,
  OrganizationPortalEmployeeSummaryDto,
  OrganizationPortalOverviewDto,
} from "@/server/contracts/organization-portal-overview-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
  professionLabels,
} from "../content-admin-runtime";
import {
  canUseOrganizationAdvancedWorkspaceCapability,
  resolveOrganizationWorkspacePageAccess,
} from "../organization-workspace/admin-organization-workspace-access";

type AdminOrganizationPortalLoadState =
  | "loading"
  | "ready"
  | "unauthorized"
  | "error";

type OrganizationPortalDestination = {
  description: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  stateLabel: string;
  testId: string;
};

const advancedOrganizationPortalDestinations: OrganizationPortalDestination[] =
  [
    {
      description:
        "创建企业训练草稿、绑定来源元数据，并在组织范围内发布训练版本。",
      href: "/organization/organization-training",
      icon: <BookOpenCheck aria-hidden="true" className="size-4" />,
      label: "企业训练",
      stateLabel: "高级版组织可用",
      testId: "organization-portal-destination-training",
    },
    {
      description: "查看组织训练聚合统计，不展示员工原始作答内容。",
      href: "/organization/organization-analytics",
      icon: <BarChart3 aria-hidden="true" className="size-4" />,
      label: "统计摘要",
      stateLabel: "聚合摘要",
      testId: "organization-portal-destination-analytics",
    },
    {
      description: "准备组织归属的 AI 题目草稿，不写入平台正式题库。",
      href: "/organization/ai-question-generation",
      icon: <WandSparkles aria-hidden="true" className="size-4" />,
      label: "AI出题",
      stateLabel: "组织草稿",
      testId: "organization-portal-destination-ai-question-generation",
    },
    {
      description: "准备组织归属的 AI 组卷草稿，不发布正式试卷记录。",
      href: "/organization/ai-paper-generation",
      icon: <FileText aria-hidden="true" className="size-4" />,
      label: "AI组卷",
      stateLabel: "组织草稿",
      testId: "organization-portal-destination-ai-paper-generation",
    },
  ];

const orgTierLabels = {
  city: "市级",
  district: "区县级",
  province: "省级",
  station: "站点",
} as const;

const organizationStatusLabels = {
  active: "正常",
  disabled: "停用",
} as const;

const userStatusLabels = {
  active: "正常",
  disabled: "停用",
} as const;

const authorizationStatusLabels = {
  active: "生效中",
  cancelled: "已取消",
  expired: "已过期",
} as const;

const editionLabels = {
  advanced: "高级版",
  standard: "标准版",
} as const;

function formatDate(value: string): string {
  return value.slice(0, 10);
}

export function AdminOrganizationPortalPage() {
  const [loadState, setLoadState] =
    useState<AdminOrganizationPortalLoadState>("loading");
  const [capabilitySummary, setCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);
  const [overview, setOverview] =
    useState<OrganizationPortalOverviewDto | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAdminSession() {
      const sessionToken = getStoredSessionToken();

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

        const organizationAccess = resolveOrganizationWorkspacePageAccess(
          sessionResponse.data,
          "/organization/portal",
        );

        if (organizationAccess.loadState !== "ready") {
          setCapabilitySummary(organizationAccess.capabilitySummary);
          setLoadState("unauthorized");
          return;
        }

        const overviewResponse =
          await fetchAdminApi<OrganizationPortalOverviewDto>(
            "/api/v1/organization-portal-overviews",
            sessionToken,
          );

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(overviewResponse) ||
          overviewResponse.code !== 0 ||
          overviewResponse.data === null
        ) {
          setLoadState("error");
          return;
        }

        setCapabilitySummary(organizationAccess.capabilitySummary);
        setOverview(overviewResponse.data);
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (loadState === "loading") {
    return <AdminLoadingState label="正在加载组织后台" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="组织后台加载失败"
        description="请刷新页面，或重新登录后再进入组织后台。"
      />
    );
  }

  const hasAdvancedAccess =
    capabilitySummary !== null &&
    canUseOrganizationAdvancedWorkspaceCapability(capabilitySummary);
  const organizationEditionLabel = hasAdvancedAccess
    ? "高级版组织后台"
    : "标准版组织后台";
  const overviewData = overview;

  if (overviewData === null) {
    return (
      <AdminErrorState
        title="组织后台加载失败"
        description="请刷新页面，或重新登录后再进入组织后台。"
      />
    );
  }

  return (
    <section className="space-y-6" data-testid="organization-portal-shell">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">组织后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            组织后台
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            查看员工名单、员工状态和组织授权状态，并按版本进入高级组织能力。
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted text-text-primary flex size-10 items-center justify-center rounded-md">
              <Building2 aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="text-text-primary text-base font-semibold">
                组织范围
              </h2>
              <p className="text-text-secondary text-sm">当前组织范围</p>
            </div>
          </div>
          <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
            {organizationEditionLabel}
          </span>
        </div>
        <p className="text-text-secondary mt-3 text-sm leading-6">
          <span className="text-text-primary font-medium">
            {overviewData.organization.displayName}
          </span>
          <span className="mx-2">·</span>
          <span>{orgTierLabels[overviewData.organization.orgTier]}</span>
          <span className="mx-2">·</span>
          <span>
            {organizationStatusLabels[overviewData.organization.status]}
          </span>
        </p>
        <p className="text-text-secondary mt-2 text-sm leading-6">
          {hasAdvancedAccess
            ? "高级版组织授权已生效。训练、统计和智能草稿入口已开放。"
            : "当前组织仅开放员工名单、员工状态和授权状态查看。员工新增、导入、调动、解绑及授权调整仍由平台运营管理员处理。"}
        </p>
      </section>

      <section aria-label="组织后台摘要" className="grid gap-4 lg:grid-cols-2">
        <EmployeeOverviewCard
          employeeSummary={overviewData.employeeSummary}
          employees={overviewData.employees}
        />
        <AuthorizationOverviewCard authorization={overviewData.authorization} />
      </section>

      {hasAdvancedAccess ? (
        <nav aria-label="组织后台入口" className="grid gap-4 lg:grid-cols-2">
          {advancedOrganizationPortalDestinations.map((destination) => (
            <PortalDestinationLink
              destination={destination}
              key={destination.href}
            />
          ))}
        </nav>
      ) : (
        <section
          className="bg-surface border-border rounded-md border p-4 shadow-sm"
          data-testid="organization-portal-standard-unavailable"
        >
          <div className="text-text-primary flex items-center gap-2 text-base font-semibold">
            <ShieldCheck aria-hidden="true" className="size-4" />
            <h2>高级版能力</h2>
          </div>
          <p className="text-text-secondary mt-3 text-sm leading-6">
            标准版暂不可用。高级版训练、统计和智能草稿能力需要高级版组织授权。
            高级能力入口保持关闭。当前组织仍可查看员工名单、员工状态和授权状态。
            高级版开通或升级请联系运营管理员。
          </p>
        </section>
      )}
    </section>
  );
}

function EmployeeOverviewCard({
  employees,
  employeeSummary,
}: {
  employees: OrganizationPortalOverviewDto["employees"];
  employeeSummary: OrganizationPortalEmployeeSummaryDto;
}) {
  return (
    <article
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid="organization-portal-summary-employees"
    >
      <span className="text-text-primary flex items-center gap-2 text-base font-semibold">
        <UsersRound aria-hidden="true" className="size-4" />
        员工名单与状态
      </span>
      <div className="grid gap-2 sm:grid-cols-2">
        <MetricBlock label="共" value={`${employeeSummary.total} 人`} />
        <MetricBlock label="正常" value={String(employeeSummary.active)} />
        <MetricBlock label="停用" value={String(employeeSummary.disabled)} />
        <MetricBlock label="锁定" value={String(employeeSummary.locked)} />
      </div>
      {employees.length === 0 ? (
        <p className="text-text-secondary text-sm leading-6">
          当前组织暂无员工记录。员工新增、导入、调动或解绑由平台运营处理。
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {employees.map((employee, index) => (
            <li
              className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3"
              key={`${employee.employeeDisplayName}-${employee.phoneMasked}-${index}`}
            >
              <span className="text-text-primary font-medium">
                {employee.employeeDisplayName}
              </span>
              <span className="text-text-secondary">
                {employee.phoneMasked}
              </span>
              <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-2 py-1 text-xs font-medium">
                {userStatusLabels[employee.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
      <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-3 py-1 text-xs font-medium">
        只读查看
      </span>
    </article>
  );
}

function AuthorizationOverviewCard({
  authorization,
}: {
  authorization: OrganizationPortalAuthorizationDto | null;
}) {
  if (authorization === null) {
    return (
      <article
        className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
        data-testid="organization-portal-summary-authorization"
      >
        <span className="text-text-primary flex items-center gap-2 text-base font-semibold">
          <ShieldCheck aria-hidden="true" className="size-4" />
          授权状态
        </span>
        <p className="text-text-secondary text-sm leading-6">
          当前组织暂无可展示的有效授权。授权开通、续期或调整请联系平台运营。
        </p>
        <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-3 py-1 text-xs font-medium">
          状态查看
        </span>
      </article>
    );
  }

  return (
    <article
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid="organization-portal-summary-authorization"
    >
      <span className="text-text-primary flex items-center gap-2 text-base font-semibold">
        <ShieldCheck aria-hidden="true" className="size-4" />
        授权状态
      </span>
      <div className="space-y-1">
        <h2 className="text-text-primary text-base font-semibold">
          {authorization.packageName}
        </h2>
        <p className="text-text-secondary text-sm">
          {authorizationStatusLabels[authorization.status]}
          <span className="mx-2">·</span>
          {formatDate(authorization.startsAt)} 至{" "}
          {formatDate(authorization.expiresAt)}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <MetricBlock
          label="当前版本"
          value={editionLabels[authorization.effectiveEdition]}
        />
        <MetricBlock
          label="原始版本"
          value={editionLabels[authorization.sourceEdition]}
        />
        <MetricBlock
          label="额度"
          value={`${authorization.usedQuota}/${authorization.accountQuota}`}
        />
        <MetricBlock
          label="剩余"
          value={String(authorization.availableQuota)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {authorization.scopes.map((scope, index) => (
          <span
            className="bg-muted text-text-primary rounded-md px-3 py-1 text-xs font-medium"
            key={`${scope.profession}-${scope.level}-${index}`}
          >
            {professionLabels[scope.profession]} {scope.level}级
          </span>
        ))}
      </div>
      <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-3 py-1 text-xs font-medium">
        状态查看
      </span>
    </article>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <span className="bg-muted grid gap-1 rounded-md px-3 py-2">
      <span className="text-text-primary text-sm font-semibold">
        {label} {value}
      </span>
    </span>
  );
}

function PortalDestinationLink({
  destination,
}: {
  destination: OrganizationPortalDestination;
}) {
  return (
    <Link
      className="bg-surface border-border hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 grid gap-4 rounded-md border p-4 shadow-sm transition-all outline-none focus-visible:ring-3 active:scale-[0.98]"
      data-testid={destination.testId}
      href={destination.href}
    >
      <span className="text-text-primary flex items-center gap-2 text-base font-semibold">
        {destination.icon}
        {destination.label}
      </span>
      <span className="text-text-secondary text-sm leading-6">
        {destination.description}
      </span>
      <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-3 py-1 text-xs font-medium">
        {destination.stateLabel}
      </span>
    </Link>
  );
}
