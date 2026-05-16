"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 学员端应用布局
 * Mobile-first: 顶部 Header + 底部 3-Tab Bar（首页/错题本/我的）
 * 组件结构遵循 ui-code.md §3.1
 */

const TAB_ITEMS = [
  { href: "/home", label: "首页", icon: "🏠" },
  { href: "/mistake-book", label: "错题本", icon: "📝" },
  { href: "/profile", label: "我的", icon: "👤" },
] as const;

export function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border bg-surface sticky top-0 z-30 flex h-14 items-center border-b px-4 shadow-sm">
        <h1 className="font-heading text-brand-primary text-lg font-semibold">
          题库系统
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom Tab Bar */}
      <nav
        className="border-border bg-surface sticky bottom-0 z-30 flex h-14 items-center justify-around border-t"
        role="tablist"
        aria-label="主导航"
      >
        {TAB_ITEMS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isActive
                  ? "text-brand-primary font-medium"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
