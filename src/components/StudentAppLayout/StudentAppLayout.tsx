"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, UserRound } from "lucide-react";

import { ProtectedRouteGuard } from "@/components/ProtectedRouteGuard";

/**
 * 学员端应用布局
 * Mobile-first: 顶部 Header + 底部 3-Tab Bar（首页/错题本/我的）
 * 组件结构遵循 ui-code.md §3.1
 */

const TAB_ITEMS = [
  { href: "/home", label: "首页", icon: Home },
  { href: "/mistake-book", label: "错题本", icon: ListChecks },
  { href: "/profile", label: "我的", icon: UserRound },
] as const;

export function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRouteGuard requiredRole="student">
      <div className="bg-background flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-border bg-surface sticky top-0 z-30 border-b shadow-sm">
          <div
            data-testid="student-shell-header-inner"
            className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4"
          >
            <h1 className="font-heading text-brand-primary text-lg font-semibold">
              题库系统
            </h1>
            <span className="bg-secondary text-secondary-foreground rounded-lg px-2.5 py-1 text-xs font-medium">
              学员端
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main
          data-testid="student-shell-main"
          className="flex-1 overflow-y-auto"
        >
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <nav
          className="border-border bg-surface sticky bottom-0 z-30 border-t"
          role="tablist"
          aria-label="主导航"
        >
          <div
            data-testid="student-shell-bottom-nav-inner"
            className="mx-auto grid h-14 w-full max-w-3xl grid-cols-3 px-2 sm:px-4"
          >
            {TAB_ITEMS.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              const TabIcon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                    isActive
                      ? "text-brand-primary font-medium"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <TabIcon className="size-5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </ProtectedRouteGuard>
  );
}
