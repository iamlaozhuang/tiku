"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  FileText,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import type { AuthContextDto } from "@/server/contracts/auth-contract";
import type { AdminWorkspaceCapabilitySummary } from "@/server/contracts/admin-workspace-role-guard-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
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

type OrganizationPortalSummary = {
  description: string;
  icon: React.ReactNode;
  label: string;
  stateLabel: string;
  testId: string;
};

type OrganizationPortalDestination = OrganizationPortalSummary & {
  href: string;
};

const organizationPortalSummaries: OrganizationPortalSummary[] = [
  {
    description:
      "查看当前组织范围内的员工管理入口状态，不进入运营后台用户列表。",
    icon: <Building2 aria-hidden="true" className="size-4" />,
    label: "员工管理",
    stateLabel: "组织范围内",
    testId: "organization-portal-summary-employees",
  },
  {
    description:
      "查看当前组织授权版本和有效期状态，升级或续期仍按后续人工流程处理。",
    icon: <ShieldCheck aria-hidden="true" className="size-4" />,
    label: "授权状态",
    stateLabel: "标准/高级授权",
    testId: "organization-portal-summary-authorization",
  },
];

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

export function AdminOrganizationPortalPage() {
  const [loadState, setLoadState] =
    useState<AdminOrganizationPortalLoadState>("loading");
  const [capabilitySummary, setCapabilitySummary] =
    useState<AdminWorkspaceCapabilitySummary | null>(null);

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

        setCapabilitySummary(organizationAccess.capabilitySummary);
        setLoadState(
          organizationAccess.loadState === "ready" ? "ready" : "unauthorized",
        );
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
  const organizationPublicId = capabilitySummary?.organizationPublicId ?? null;

  return (
    <section className="space-y-6" data-testid="organization-portal-shell">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">组织后台</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            组织后台
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            管理员工、查看组织授权状态，并按版本进入高级组织能力。
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
              <p className="text-text-secondary text-sm">
                {organizationPublicId ?? "暂未绑定组织范围"}
              </p>
            </div>
          </div>
          <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
            本地组织工作区
          </span>
        </div>
        <p className="text-text-secondary mt-3 text-sm leading-6">
          {hasAdvancedAccess
            ? "高级版组织授权已生效。训练、统计和智能草稿入口已开放。"
            : "当前组织仍可查看员工和授权摘要。高级版开通或升级请联系运营管理员。"}
        </p>
      </section>

      <section aria-label="组织后台摘要" className="grid gap-4 lg:grid-cols-2">
        {organizationPortalSummaries.map((summary) => (
          <PortalSummaryCard key={summary.testId} summary={summary} />
        ))}
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
            当前组织仍可查看员工和授权摘要。高级版开通或升级请联系运营管理员。
          </p>
        </section>
      )}
    </section>
  );
}

function PortalSummaryCard({
  summary,
}: {
  summary: OrganizationPortalSummary;
}) {
  return (
    <article
      className="bg-surface border-border grid gap-4 rounded-md border p-4 shadow-sm"
      data-testid={summary.testId}
    >
      <span className="text-text-primary flex items-center gap-2 text-base font-semibold">
        {summary.icon}
        {summary.label}
      </span>
      <span className="text-text-secondary text-sm leading-6">
        {summary.description}
      </span>
      <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-3 py-1 text-xs font-medium">
        {summary.stateLabel}
      </span>
    </article>
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
