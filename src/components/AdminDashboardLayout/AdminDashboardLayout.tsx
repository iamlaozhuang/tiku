"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProtectedRouteGuard } from "@/components/ProtectedRouteGuard";

/**
 * 后台管理端布局
 * Desktop-first: 左侧 Sidebar + 顶部 TopBar
 * content/ 和 ops/ 共用此组件，通过 pathname 自动适配菜单
 * 组件结构遵循 ui-code.md §3.1
 */

interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

const CONTENT_MENU: MenuItem[] = [
  { href: "/content/papers", label: "试卷管理", icon: "📄" },
  { href: "/content/questions", label: "题库管理", icon: "❓" },
  { href: "/content/materials", label: "材料管理", icon: "📦" },
  { href: "/content/knowledge-nodes", label: "知识点树", icon: "🌳" },
];

const OPS_MENU: MenuItem[] = [
  { href: "/ops/contact-config", label: "contact_config", icon: "C" },
  { href: "/ops/users", label: "用户管理", icon: "👥" },
  { href: "/ops/organizations", label: "企业管理", icon: "🏢" },
  { href: "/ops/redeem-codes", label: "卡密管理", icon: "🔑" },
  { href: "/ops/resources", label: "资源管理", icon: "📁" },
  { href: "/ops/ai-audit-logs", label: "审计日志", icon: "📋" },
];

export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOps = pathname.startsWith("/ops");
  const menuItems = isOps ? OPS_MENU : CONTENT_MENU;
  const portalName = isOps ? "运营后台" : "内容后台";

  return (
    <ProtectedRouteGuard requiredRole="admin">
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
            <span className="rounded-radius-sm ml-2 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {portalName}
            </span>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`rounded-radius-md flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "text-brand-primary bg-green-50 font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-green-50/50"
                      }`}
                    >
                      <span>{item.icon}</span>
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
          <header className="border-border bg-surface sticky top-0 z-30 flex h-14 items-center border-b px-6 shadow-sm">
            <span className="text-text-muted text-sm">{portalName}</span>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRouteGuard>
  );
}
