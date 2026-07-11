"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  BookOpenCheck,
  Boxes,
  Building2,
  FileText,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Network,
  ScrollText,
  WandSparkles,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";
import {
  canUseOrganizationAdvancedWorkspaceCapability,
  getAdminWorkspaceCapabilitySummary,
} from "@/features/admin/organization-workspace/admin-organization-workspace-access";
import {
  AdminStateTemplate,
  AdminWorkspaceContextBand,
} from "@/components/admin/AdminStateTemplate";
import type {
  AdminWorkspace,
  AdminWorkspaceRouteAccessDecision,
} from "@/server/contracts/admin-workspace-role-guard-contract";
import { resolveAdminWorkspaceRouteAccess } from "@/server/services/admin-workspace-role-guard-service";

/**
 * 后台管理端布局
 * Desktop-first: 左侧 Sidebar + 顶部 TopBar
 * 平台、内容、运营和组织工作区共用此组件，通过 pathname 自动适配菜单
 * 组件结构遵循 ui-code.md §3.1
 */

interface MenuItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  advancedOrganizationOnly?: boolean;
}

interface WorkspaceSwitchItem {
  href: string;
  label: string;
  workspace: AdminWorkspace;
  Icon: LucideIcon;
  fallbackHref?: string;
  fallbackLabel?: string;
  requiresOrganizationContext?: boolean;
}

const PLATFORM_MENU: MenuItem[] = [
  { href: "/admin/overview", label: "总览", Icon: LayoutDashboard },
];

const CONTENT_MENU: MenuItem[] = [
  { href: "/content/overview", label: "总览", Icon: LayoutDashboard },
  { href: "/content/papers", label: "试卷管理", Icon: FileText },
  { href: "/content/questions", label: "题库管理", Icon: BookOpenText },
  { href: "/content/materials", label: "材料管理", Icon: Boxes },
  { href: "/content/resources", label: "资源管理", Icon: FolderOpen },
  {
    href: "/content/ai-question-generation",
    label: "AI出题",
    Icon: WandSparkles,
  },
  { href: "/content/ai-paper-generation", label: "AI组卷", Icon: FileText },
  { href: "/content/knowledge-nodes", label: "知识点树", Icon: Network },
];

const OPS_MENU: MenuItem[] = [
  { href: "/ops/overview", label: "总览", Icon: LayoutDashboard },
  { href: "/ops/contact-config", label: "购买联系方式", Icon: UserRoundCog },
  { href: "/ops/users", label: "用户管理", Icon: UserRoundCog },
  { href: "/ops/organizations", label: "企业管理", Icon: Building2 },
  { href: "/ops/redeem-codes", label: "卡密与企业授权", Icon: KeyRound },
  { href: "/ops/ai-audit-logs", label: "审计与AI调用日志", Icon: ScrollText },
];

const ORGANIZATION_MENU: MenuItem[] = [
  { href: "/organization/portal", label: "组织概览", Icon: Building2 },
  {
    href: "/organization/organization-training",
    label: "企业训练",
    Icon: BookOpenCheck,
    advancedOrganizationOnly: true,
  },
  {
    href: "/organization/organization-analytics",
    label: "统计摘要",
    Icon: BarChart3,
    advancedOrganizationOnly: true,
  },
  {
    href: "/organization/ai-question-generation",
    label: "AI出题",
    Icon: WandSparkles,
    advancedOrganizationOnly: true,
  },
  {
    href: "/organization/ai-paper-generation",
    label: "AI组卷",
    Icon: FileText,
    advancedOrganizationOnly: true,
  },
];

type AdminDashboardLayoutStatus =
  | "checking"
  | "authorized"
  | "unauthorized"
  | "forbidden"
  | "missing-organization-context"
  | "standard-unavailable";
type AdminDashboardAuthState = {
  status: AdminDashboardLayoutStatus;
  workspace: AdminWorkspace | null;
  pathname: string | null;
  adminRoles: readonly string[];
  canUseOrganizationAdvancedWorkspace: boolean;
  hasOrganizationWorkspaceContext: boolean;
  accessDecision: AdminWorkspaceRouteAccessDecision | null;
};
type WorkspaceReturnAction = {
  href: string;
  label: string;
};

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";
const ADMIN_ROLE_LABELS: Record<string, string> = {
  content_admin: "内容管理员",
  ops_admin: "运营管理员",
  org_advanced_admin: "高级版组织管理员",
  org_standard_admin: "标准版组织管理员",
  super_admin: "超级管理员",
};

function getWorkspaceFromPath(pathname: string): AdminWorkspace {
  if (pathname.startsWith("/admin")) {
    return "platform";
  }

  if (pathname.startsWith("/content")) {
    return "content";
  }

  if (pathname.startsWith("/organization")) {
    return "organization";
  }

  return "ops";
}

function hasOrganizationAdminRole(adminRoles: readonly string[]) {
  return (
    adminRoles.includes("org_standard_admin") ||
    adminRoles.includes("org_advanced_admin")
  );
}

function getWorkspacePresentation(
  workspace: AdminWorkspace,
  adminRoles: readonly string[],
  canUseOrganizationAdvancedWorkspace: boolean,
) {
  if (workspace === "platform") {
    return {
      menuItems: PLATFORM_MENU,
      portalName: "平台总览",
    };
  }

  if (workspace === "content") {
    return {
      menuItems: CONTENT_MENU,
      portalName: "内容后台",
    };
  }

  if (workspace === "organization") {
    return {
      menuItems: ORGANIZATION_MENU.filter(
        (item) =>
          item.advancedOrganizationOnly !== true ||
          canUseOrganizationAdvancedWorkspace,
      ),
      portalName: "组织后台",
    };
  }

  return {
    menuItems: OPS_MENU,
    portalName: "运营后台",
  };
}

function getWorkspaceScopeLabel(workspace: AdminWorkspace): string {
  if (workspace === "platform") {
    return "平台总览只汇总跨工作区风险与入口，不承接业务明细操作。";
  }

  if (workspace === "content") {
    return "题库、材料、试卷、资源与内容 AI 草稿归属于内容后台。";
  }

  if (workspace === "organization") {
    return "组织后台只处理当前组织上下文内的员工、训练、统计和组织 AI。";
  }

  return "用户、企业、授权、卡密与审计治理归属于运营后台。";
}

function formatAdminRoleLabel(adminRoles: readonly string[]): string {
  const labels = adminRoles
    .map((role) => ADMIN_ROLE_LABELS[role])
    .filter((label): label is string => label !== undefined);

  if (labels.length === 0) {
    return "后台管理员";
  }

  return Array.from(new Set(labels)).join(" / ");
}

function getWorkspaceCapabilityLabel(
  workspace: AdminWorkspace,
  adminRoles: readonly string[],
  canUseOrganizationAdvancedWorkspace: boolean,
): string {
  if (workspace === "platform") {
    return "超级管理员监督视角不绕过运营、内容、组织上下文和脱敏边界。";
  }

  if (workspace === "content") {
    return adminRoles.includes("super_admin")
      ? "当前为超级管理员监督视角，内容草稿、待审、发布闭环仍按内容后台规则执行。"
      : "当前内容能力不绕过草稿、待审、发布闭环。";
  }

  if (workspace === "organization") {
    return canUseOrganizationAdvancedWorkspace
      ? "高级版组织能力已开放：企业训练、统计摘要和组织 AI。"
      : "标准版组织能力仅覆盖员工名单、员工状态和授权状态查看。";
  }

  return adminRoles.includes("super_admin")
    ? "当前为超级管理员监督视角，仍按运营后台的治理边界操作。"
    : "当前运营能力不承接正式内容维护或组织训练执行。";
}

function getWorkspaceSwitchItems(
  adminRoles: readonly string[],
  hasOrganizationWorkspaceContext: boolean,
): WorkspaceSwitchItem[] {
  if (adminRoles.includes("super_admin")) {
    return [
      {
        href: "/admin/overview",
        label: "平台总览",
        workspace: "platform",
        Icon: LayoutDashboard,
      },
      {
        href: "/ops/overview",
        label: "运营后台",
        workspace: "ops",
        Icon: UserRoundCog,
      },
      {
        href: "/content/overview",
        label: "内容后台",
        workspace: "content",
        Icon: BookOpenText,
      },
      {
        href: hasOrganizationWorkspaceContext
          ? "/organization/portal"
          : "/ops/organizations",
        label: "组织后台",
        workspace: "organization",
        Icon: Building2,
        fallbackHref: "/ops/organizations",
        fallbackLabel: "返回运营后台处理组织与授权",
        requiresOrganizationContext: !hasOrganizationWorkspaceContext,
      },
    ];
  }

  if (hasOrganizationAdminRole(adminRoles)) {
    return [
      {
        href: "/organization/portal",
        label: "组织后台",
        workspace: "organization",
        Icon: Building2,
      },
    ];
  }

  const workspaceItems: WorkspaceSwitchItem[] = [];

  if (adminRoles.includes("ops_admin")) {
    workspaceItems.push({
      href: "/ops/overview",
      label: "运营后台",
      workspace: "ops",
      Icon: UserRoundCog,
    });
  }

  if (adminRoles.includes("content_admin")) {
    workspaceItems.push({
      href: "/content/overview",
      label: "内容后台",
      workspace: "content",
      Icon: BookOpenText,
    });
  }

  return workspaceItems;
}

function getForbiddenWorkspaceReturnAction(
  adminRoles: readonly string[],
): WorkspaceReturnAction | null {
  if (adminRoles.includes("super_admin")) {
    return {
      href: "/admin/overview",
      label: "返回平台总览",
    };
  }

  if (hasOrganizationAdminRole(adminRoles)) {
    return {
      href: "/organization/portal",
      label: "返回组织后台",
    };
  }

  if (adminRoles.includes("content_admin")) {
    return {
      href: "/content/overview",
      label: "返回内容后台",
    };
  }

  if (adminRoles.includes("ops_admin")) {
    return {
      href: "/ops/overview",
      label: "返回运营后台",
    };
  }

  return null;
}

function getReturnActionLabel(href: string): string {
  if (href.startsWith("/admin")) {
    return "返回平台总览";
  }

  if (href.startsWith("/organization")) {
    return "返回组织概览";
  }

  if (href.startsWith("/content")) {
    return "返回内容后台";
  }

  if (href.startsWith("/ops")) {
    return "返回运营后台";
  }

  return "前往登录";
}

function mapAccessDecisionToStatus(
  decision: AdminWorkspaceRouteAccessDecision,
): AdminDashboardLayoutStatus {
  if (decision.status === "allowed") {
    return "authorized";
  }

  if (decision.status === "standard_unavailable") {
    return "standard-unavailable";
  }

  if (decision.reason === "organization_context_required") {
    return "missing-organization-context";
  }

  return "forbidden";
}

function isAdminContext(authContext: AuthContextDto): boolean {
  return (
    authContext.user.adminPublicId !== null &&
    authContext.user.adminPublicId !== undefined &&
    (authContext.user.adminRoles?.length ?? 0) > 0
  );
}

async function fetchAdminAuthContext(): Promise<
  ApiResponse<AuthContextDto | null>
> {
  const response = await fetch("/api/v1/sessions", {
    credentials: "same-origin",
  });

  return (await response.json()) as ApiResponse<AuthContextDto | null>;
}

function AdminDashboardStatus({
  accessDecision,
  adminRoles,
  returnAction,
  status,
}: {
  accessDecision?: AdminWorkspaceRouteAccessDecision | null;
  adminRoles: readonly string[];
  returnAction?: WorkspaceReturnAction | null;
  status: Exclude<AdminDashboardLayoutStatus, "authorized">;
}) {
  if (status === "checking") {
    return (
      <AdminStateTemplate
        description="系统正在确认当前管理员会话和后台工作区。"
        title="正在校验后台权限"
        variant="loading"
      />
    );
  }

  if (status === "unauthorized") {
    return (
      <AdminStateTemplate
        action={{ href: "/login", label: "前往登录" }}
        description="当前页面需要有效管理员会话，登录后再进入对应后台。"
        title="请先登录后台"
        variant="unauthorized"
      />
    );
  }

  const fallbackAction = getForbiddenWorkspaceReturnAction(adminRoles);
  const decisionAction =
    accessDecision?.returnPath !== undefined
      ? {
          href: accessDecision.returnPath,
          label: getReturnActionLabel(accessDecision.returnPath),
        }
      : null;
  const action = returnAction ?? decisionAction ?? fallbackAction;

  if (status === "missing-organization-context") {
    return (
      <AdminStateTemplate
        action={action}
        description="当前管理员会话有效，但组织后台需要已绑定或已选择的组织上下文。请先回到允许的工作区确认组织绑定，再进入组织后台。"
        details={[
          "不会把登录失效误报为组织后台权限问题。",
          "不会展示内部组织标识或原始授权记录。",
        ]}
        title="需要选择组织上下文"
        variant="missing-context"
      />
    );
  }

  if (status === "standard-unavailable") {
    return (
      <AdminStateTemplate
        action={action}
        description="当前组织上下文仅具备标准版能力，高级版企业训练、统计摘要和组织 AI 需要由运营管理员维护高级版企业授权。"
        title="标准版暂不可用"
        variant="standard-unavailable"
      />
    );
  }

  return (
    <AdminStateTemplate
      action={action}
      description="当前管理员角色不能进入该后台工作区，请返回已授权的后台入口。"
      title="无权访问此后台工作区"
      variant="forbidden"
    />
  );
}

export function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = getWorkspaceFromPath(pathname);
  const [authState, setAuthState] = useState<AdminDashboardAuthState>({
    status: "checking",
    workspace: null,
    pathname: null,
    adminRoles: [],
    canUseOrganizationAdvancedWorkspace: false,
    hasOrganizationWorkspaceContext: false,
    accessDecision: null,
  });
  const status =
    authState.pathname === pathname ? authState.status : "checking";
  const adminRoles =
    authState.pathname === pathname ? authState.adminRoles : [];
  const canUseOrganizationAdvancedWorkspace =
    authState.pathname === pathname
      ? authState.canUseOrganizationAdvancedWorkspace
      : false;
  const hasOrganizationWorkspaceContext =
    authState.pathname === pathname
      ? authState.hasOrganizationWorkspaceContext
      : false;
  const accessDecision =
    authState.pathname === pathname ? authState.accessDecision : null;
  const { menuItems, portalName } = getWorkspacePresentation(
    workspace,
    adminRoles,
    canUseOrganizationAdvancedWorkspace,
  );
  const primaryMenuItems =
    workspace === "organization"
      ? menuItems.filter((item) => item.advancedOrganizationOnly !== true)
      : menuItems;
  const advancedOrganizationMenuItems =
    workspace === "organization"
      ? menuItems.filter((item) => item.advancedOrganizationOnly === true)
      : [];
  const workspaceSwitchItems = getWorkspaceSwitchItems(
    adminRoles,
    hasOrganizationWorkspaceContext,
  );

  useEffect(() => {
    let isCurrentCheck = true;

    fetchAdminAuthContext()
      .then((sessionResponse) => {
        if (!isCurrentCheck) {
          return;
        }

        if (
          sessionResponse.code === 0 &&
          sessionResponse.data !== null &&
          isAdminContext(sessionResponse.data)
        ) {
          const capabilitySummary = getAdminWorkspaceCapabilitySummary(
            sessionResponse.data,
          );
          const accessDecision = resolveAdminWorkspaceRouteAccess({
            capabilitySummary,
            pathname,
          });

          setAuthState({
            status: mapAccessDecisionToStatus(accessDecision),
            workspace,
            pathname,
            adminRoles: sessionResponse.data.user.adminRoles ?? [],
            canUseOrganizationAdvancedWorkspace:
              canUseOrganizationAdvancedWorkspaceCapability(capabilitySummary),
            hasOrganizationWorkspaceContext:
              capabilitySummary.organizationPublicId !== null,
            accessDecision,
          });
          return;
        }

        setAuthState({
          status: "unauthorized",
          workspace,
          pathname,
          adminRoles: [],
          canUseOrganizationAdvancedWorkspace: false,
          hasOrganizationWorkspaceContext: false,
          accessDecision: null,
        });
        router.replace("/login");
      })
      .catch(() => {
        if (!isCurrentCheck) {
          return;
        }

        setAuthState({
          status: "unauthorized",
          workspace,
          pathname,
          adminRoles: [],
          canUseOrganizationAdvancedWorkspace: false,
          hasOrganizationWorkspaceContext: false,
          accessDecision: null,
        });
        router.replace("/login");
      });

    return () => {
      isCurrentCheck = false;
    };
  }, [pathname, router, workspace]);

  async function handleLogoutClick() {
    try {
      await fetch("/api/v1/sessions", {
        credentials: "same-origin",
        method: "DELETE",
      });
    } finally {
      localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
      setAuthState({
        status: "unauthorized",
        workspace,
        pathname,
        adminRoles: [],
        canUseOrganizationAdvancedWorkspace: false,
        hasOrganizationWorkspaceContext: false,
        accessDecision: null,
      });
      router.replace("/login");
    }
  }

  if (status !== "authorized") {
    return (
      <AdminDashboardStatus
        accessDecision={accessDecision}
        adminRoles={adminRoles}
        returnAction={
          status === "forbidden"
            ? getForbiddenWorkspaceReturnAction(adminRoles)
            : null
        }
        status={status}
      />
    );
  }

  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="border-border bg-surface hidden w-60 flex-shrink-0 border-r lg:flex lg:flex-col"
        role="navigation"
        aria-label="侧边栏导航"
      >
        {/* Brand */}
        <div className="border-border flex h-14 items-center border-b px-4">
          <h1 className="font-heading text-brand-primary text-base font-semibold">
            题库系统
          </h1>
          <span className="rounded-radius-sm bg-secondary text-secondary-foreground ml-2 px-2 py-0.5 text-xs font-medium">
            {portalName}
          </span>
        </div>

        {workspaceSwitchItems.length > 1 ? (
          <nav
            aria-label="后台工作区切换"
            className="border-border border-b p-3"
          >
            <ul className="grid gap-1">
              {workspaceSwitchItems.map((item) => {
                const isActiveWorkspace = item.workspace === workspace;
                const Icon = item.Icon;
                const isContextGated =
                  item.requiresOrganizationContext === true &&
                  !isActiveWorkspace;

                return (
                  <li key={item.workspace}>
                    {isContextGated ? (
                      <div
                        aria-disabled="true"
                        aria-label={`${item.label}需要选择组织上下文`}
                        className="border-border bg-muted/60 rounded-radius-md grid gap-2 border px-3 py-2 text-sm"
                        role="group"
                      >
                        <div className="text-text-muted flex items-center gap-2">
                          <Icon aria-hidden="true" className="size-4" />
                          <span>{item.label}</span>
                        </div>
                        <p className="text-text-secondary text-xs leading-5">
                          需要选择组织上下文
                        </p>
                        {item.fallbackHref !== undefined &&
                        item.fallbackLabel !== undefined ? (
                          <Link
                            className="text-brand-primary text-xs font-medium transition-transform active:scale-[0.98]"
                            href={item.fallbackHref}
                          >
                            {item.fallbackLabel}
                          </Link>
                        ) : null}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={isActiveWorkspace ? "page" : undefined}
                        aria-label={`${
                          isActiveWorkspace ? "当前" : "切换到"
                        }${item.label}`}
                        className={`rounded-radius-md flex items-center gap-2 px-3 py-2 text-sm transition-transform active:scale-[0.98] ${
                          isActiveWorkspace
                            ? "bg-secondary text-brand-primary font-medium"
                            : "text-text-secondary hover:bg-muted hover:text-text-primary"
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3">
          {workspace === "organization" &&
          !canUseOrganizationAdvancedWorkspace ? (
            <div className="border-brand-primary/30 bg-secondary/50 mb-3 rounded-md border p-3">
              <p className="text-brand-primary text-xs font-medium">
                标准版组织后台
              </p>
              <p className="text-text-secondary mt-2 text-xs leading-5">
                标准版仅开放员工名单、员工状态和授权状态查看；升级后可使用企业训练、统计摘要和组织
                AI 能力。
              </p>
              <Link
                className="text-brand-primary mt-3 inline-flex text-xs font-medium transition-transform active:scale-[0.98]"
                href="/organization/portal"
              >
                返回组织概览
              </Link>
            </div>
          ) : null}
          <ul className="space-y-1">
            {primaryMenuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.Icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-radius-md flex items-center gap-3 px-3 py-2 text-sm transition-transform active:scale-[0.98] ${
                      isActive
                        ? "bg-secondary text-brand-primary font-medium"
                        : "text-text-secondary hover:bg-muted hover:text-text-primary"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            {advancedOrganizationMenuItems.length > 0 ? (
              <li className="text-text-muted px-3 pt-4 pb-1 text-xs font-medium">
                高级组织能力
              </li>
            ) : null}
            {advancedOrganizationMenuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.Icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-radius-md flex items-center gap-3 px-3 py-2 text-sm transition-transform active:scale-[0.98] ${
                      isActive
                        ? "bg-secondary text-brand-primary font-medium"
                        : "text-text-secondary hover:bg-muted hover:text-text-primary"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        {/* TopBar */}
        <header className="border-border bg-surface sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 shadow-sm">
          <span className="text-text-muted text-sm">{portalName}</span>
          <button
            aria-label="退出登录"
            className="text-text-secondary hover:bg-muted hover:text-text-primary flex size-9 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
            type="button"
            onClick={handleLogoutClick}
          >
            <LogOut aria-hidden="true" className="size-4" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AdminWorkspaceContextBand
            capabilityLabel={getWorkspaceCapabilityLabel(
              workspace,
              adminRoles,
              canUseOrganizationAdvancedWorkspace,
            )}
            roleLabel={formatAdminRoleLabel(adminRoles)}
            scopeLabel={getWorkspaceScopeLabel(workspace)}
            workspaceLabel={portalName}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
