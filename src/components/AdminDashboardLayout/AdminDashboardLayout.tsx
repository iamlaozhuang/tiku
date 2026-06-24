"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpenText,
  Boxes,
  Building2,
  FileText,
  FolderOpen,
  KeyRound,
  LoaderCircle,
  LogOut,
  Network,
  ScrollText,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ApiResponse } from "@/server/contracts/api-response";
import type { AuthContextDto } from "@/server/contracts/auth-contract";

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
}

const CONTENT_MENU: MenuItem[] = [
  { href: "/content/papers", label: "试卷管理", Icon: FileText },
  { href: "/content/questions", label: "题库管理", Icon: BookOpenText },
  { href: "/content/materials", label: "材料管理", Icon: Boxes },
  { href: "/content/knowledge-nodes", label: "知识点树", Icon: Network },
];

const OPS_MENU: MenuItem[] = [
  { href: "/ops/contact-config", label: "contact_config", Icon: UserRoundCog },
  { href: "/ops/users", label: "用户管理", Icon: UserRoundCog },
  { href: "/ops/organizations", label: "企业管理", Icon: Building2 },
  { href: "/ops/redeem-codes", label: "卡密管理", Icon: KeyRound },
  { href: "/ops/resources", label: "资源管理", Icon: FolderOpen },
  { href: "/ops/ai-audit-logs", label: "审计日志", Icon: ScrollText },
];

type AdminDashboardLayoutStatus =
  | "checking"
  | "authorized"
  | "unauthorized"
  | "forbidden";
type AdminWorkspace = "ops" | "content";
type AdminDashboardAuthState = {
  status: AdminDashboardLayoutStatus;
  workspace: AdminWorkspace | null;
};

const SESSION_TOKEN_STORAGE_KEY = "tiku.localSessionToken";

function getWorkspaceFromPath(pathname: string): AdminWorkspace {
  return pathname.startsWith("/content") ? "content" : "ops";
}

function getWorkspacePresentation(workspace: AdminWorkspace) {
  if (workspace === "content") {
    return {
      menuItems: CONTENT_MENU,
      portalName: "内容后台",
    };
  }

  return {
    menuItems: OPS_MENU,
    portalName: "运营后台",
  };
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
  const adminRoles = authContext.user.adminRoles ?? [];

  if (adminRoles.includes("super_admin")) {
    return true;
  }

  if (workspace === "ops") {
    return adminRoles.includes("ops_admin");
  }

  return adminRoles.includes("content_admin");
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
  status,
}: {
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
      </section>
    </main>
  );
}

export function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = getWorkspaceFromPath(pathname);
  const { menuItems, portalName } = getWorkspacePresentation(workspace);
  const [authState, setAuthState] = useState<AdminDashboardAuthState>({
    status: "checking",
    workspace: null,
  });
  const status =
    authState.workspace === workspace ? authState.status : "checking";

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
          setAuthState({
            status: canAccessWorkspace(sessionResponse.data, workspace)
              ? "authorized"
              : "forbidden",
            workspace,
          });
          return;
        }

        setAuthState({ status: "unauthorized", workspace });
        router.replace("/login");
      })
      .catch(() => {
        if (!isCurrentCheck) {
          return;
        }

        setAuthState({ status: "unauthorized", workspace });
        router.replace("/login");
      });

    return () => {
      isCurrentCheck = false;
    };
  }, [router, workspace]);

  function handleLogoutClick() {
    localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    setAuthState({ status: "unauthorized", workspace });
    router.replace("/login");
  }

  if (status !== "authorized") {
    return <AdminDashboardStatus status={status} />;
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

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.Icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-radius-md flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-secondary text-brand-primary font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-muted"
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
            className="text-text-secondary hover:text-text-primary hover:bg-muted flex size-9 items-center justify-center rounded-full transition-colors"
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
