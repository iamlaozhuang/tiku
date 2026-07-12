import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StudentAppLayout } from "@/components/StudentAppLayout/StudentAppLayout";

const pathnameMock = vi.hoisted(() => vi.fn(() => "/home"));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("@/components/ProtectedRouteGuard", () => ({
  ProtectedRouteGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="student-protected-route">{children}</div>
  ),
}));

afterEach(() => {
  cleanup();
  pathnameMock.mockReset();
  pathnameMock.mockReturnValue("/home");
});

describe("StudentAppLayout", () => {
  it("keeps the learner shell mobile-first but desktop-readable", () => {
    render(
      <StudentAppLayout>
        <section aria-label="页面内容">学习内容</section>
      </StudentAppLayout>,
    );

    expect(screen.getByTestId("student-shell")).toHaveClass(
      "min-h-dvh",
      "w-full",
      "max-w-full",
      "overflow-x-clip",
    );
    expect(screen.getByTestId("student-shell-header-inner")).toHaveClass(
      "max-w-5xl",
    );
    expect(screen.getByTestId("student-shell-main")).toHaveClass(
      "flex-1",
      "min-w-0",
      "overflow-x-clip",
    );
    expect(screen.getByRole("tablist", { name: "主导航" })).toHaveClass(
      "pb-[env(safe-area-inset-bottom)]",
    );
    expect(screen.getByTestId("student-shell-bottom-nav-inner")).toHaveClass(
      "h-14",
      "max-w-3xl",
    );
    expect(screen.getByText("学员端")).toBeInTheDocument();
    expect(screen.getByLabelText("页面内容")).toBeInTheDocument();
  });

  it("uses line icons and active tab semantics without decorative emoji labels", () => {
    pathnameMock.mockReturnValue("/mistake-book");

    render(
      <StudentAppLayout>
        <section>错题本内容</section>
      </StudentAppLayout>,
    );

    const nav = screen.getByRole("tablist", { name: "主导航" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "错题本" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("tab", { name: "首页" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(document.body.textContent).not.toContain("🏠");
    expect(document.body.textContent).not.toContain("📝");
    expect(document.body.textContent).not.toContain("👤");
  });
});
