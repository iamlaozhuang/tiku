"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  BookOpenText,
  BookOpenCheck,
  Boxes,
  Building2,
  FileText,
  FolderOpen,
  KeyRound,
  LoaderCircle,
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

/**
 * 后台管理端布局
 * Desktop-first: 左侧 Sidebar + 顶部 TopBar
 * content/ 和 ops/ 共用此组件，通过 pathname 自动适配菜单
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
}

const CONTENT_MENU: MenuItem[] = [
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
  | "forbidden";
type AdminWorkspace = "ops" | "content" | "organization";
type AdminDashboardAuthState = {
  status: AdminDashboardLayoutStatus;
  workspace: AdminWorkspace | null;
  adminRoles: readonly string[];
  canUseOrganizationAdvancedWorkspace: boolean;
};
type WorkspaceReturnAction = {
  href: string;
  label: string;
};

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";

function getWorkspaceFromPath(pathname: string): AdminWorkspace {
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

function getWorkspaceSwitchItems(
  adminRoles: readonly string[],
): WorkspaceSwitchItem[] {
  if (adminRoles.includes("super_admin")) {
    return [
      {
        href: "/ops/users",
        label: "运营后台",
        workspace: "ops",
        Icon: UserRoundCog,
      },
      {
        href: "/content/papers",
        label: "内容后台",
        workspace: "content",
        Icon: BookOpenText,
      },
      {
        href: "/organization/portal",
        label: "组织后台",
        workspace: "organization",
        Icon: Building2,
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
      href: "/ops/users",
      label: "运营后台",
      workspace: "ops",
      Icon: UserRoundCog,
    });
  }

  if (adminRoles.includes("content_admin")) {
    workspaceItems.push({
      href: "/content/papers",
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
  if (hasOrganizationAdminRole(adminRoles)) {
    return {
      href: "/organization/portal",
      label: "返回组织后台",
    };
  }

  if (adminRoles.includes("content_admin")) {
    return {
      href: "/content/papers",
      label: "返回内容后台",
    };
  }

  if (adminRoles.includes("ops_admin")) {
    return {
      href: "/ops/users",
      label: "返回运营后台",
    };
  }

  return null;
}

function isAdminContext(authContext: AuthContextDto): boolean {
  return (
    authContext.user.adminPublicId !== null &&
    authContext.user.adminPublicId !== undefined &&
    (authContext.user.adminRoles?.length ?? 0) > 0
  );
}

function canAccessWorkspace(
  authContext: AuthContextDto,
  workspace: AdminWorkspace,
): boolean {
  const adminRoles = (authContext.user.adminRoles ?? []) as readonly string[];

  if (adminRoles.includes("super_admin")) {
    return true;
  }

  if (hasOrganizationAdminRole(adminRoles)) {
    return workspace === "organization";
  }

  if (workspace === "ops") {
    return adminRoles.includes("ops_admin");
  }

  if (workspace === "content") {
    return adminRoles.includes("content_admin");
  }

  return false;
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
  returnAction,
  status,
}: {
  returnAction?: WorkspaceReturnAction | null;
  status: Exclude<AdminDashboardLayoutStatus, "authorized">;
}) {
  const isChecking = status === "checking";
  const isForbidden = status === "forbidden";

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6">
      <section
        aria-live={isChecking ? "polite" : "assertive"}
        className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center"
        role={isChecking ? "status" : "alert"}
      >
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
          {isChecking ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <AlertCircle aria-hidden="true" className="size-5" />
          )}
        </div>
        <h1 className="font-heading text-text-primary text-lg font-semibold">
          {isChecking
            ? "正在校验后台权限"
            : isForbidden
              ? "无权访问此后台工作区"
              : "请先登录后台"}
        </h1>
        <p className="text-text-secondary text-sm leading-6">
          {isChecking
            ? "系统正在确认当前管理员会话。"
            : isForbidden
              ? "当前管理员角色不能进入该后台工作区。"
              : "当前页面需要有效管理员会话，正在前往登录页。"}
        </p>
        {isForbidden && returnAction !== null && returnAction !== undefined ? (
          <Link
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
            href={returnAction.href}
          >
            {returnAction.label}
          </Link>
        ) : null}
      </section>
    </main>
  );
}

export function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = getWorkspaceFromPath(pathname);
  const [authState, setAuthState] = useState<AdminDashboardAuthState>({
    status: "checking",
    workspace: null,
    adminRoles: [],
    canUseOrganizationAdvancedWorkspace: false,
  });
  const status =
    authState.workspace === workspace ? authState.status : "checking";
  const adminRoles =
    authState.workspace === workspace ? authState.adminRoles : [];
  const canUseOrganizationAdvancedWorkspace =
    authState.workspace === workspace
      ? authState.canUseOrganizationAdvancedWorkspace
      : false;
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
  const workspaceSwitchItems = getWorkspaceSwitchItems(adminRoles);

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

          setAuthState({
            status: canAccessWorkspace(sessionResponse.data, workspace)
              ? "authorized"
              : "forbidden",
            workspace,
            adminRoles: sessionResponse.data.user.adminRoles ?? [],
            canUseOrganizationAdvancedWorkspace:
              canUseOrganizationAdvancedWorkspaceCapability(capabilitySummary),
          });
          return;
        }

        setAuthState({
          status: "unauthorized",
          workspace,
          adminRoles: [],
          canUseOrganizationAdvancedWorkspace: false,
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
          adminRoles: [],
          canUseOrganizationAdvancedWorkspace: false,
        });
        router.replace("/login");
      });

    return () => {
      isCurrentCheck = false;
    };
  }, [router, workspace]);

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
        adminRoles: [],
        canUseOrganizationAdvancedWorkspace: false,
      });
      router.replace("/login");
    }
  }

  if (status !== "authorized") {
    return (
      <AdminDashboardStatus
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

                return (
                  <li key={item.workspace}>
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
                升级为高级版后可使用企业训练、统计摘要和组织 AI 能力。
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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
