import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AdminAsyncState,
  type AdminAsyncStateVariant,
} from "@/components/admin/AdminAsyncState";

afterEach(() => {
  cleanup();
});

describe("AdminAsyncState", () => {
  it.each<{
    variant: AdminAsyncStateVariant;
    busy: boolean;
  }>([
    { variant: "initial-loading", busy: true },
    { variant: "refreshing", busy: true },
    { variant: "empty", busy: false },
    { variant: "filtered-empty", busy: false },
  ])("announces $variant as a polite status", ({ busy, variant }) => {
    render(<AdminAsyncState variant={variant}>当前后台状态</AdminAsyncState>);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("data-admin-async-state", variant);

    if (busy) {
      expect(status).toHaveAttribute("aria-busy", "true");
    } else {
      expect(status).not.toHaveAttribute("aria-busy");
    }
  });

  it.each<AdminAsyncStateVariant>([
    "error",
    "forbidden",
    "unauthorized",
    "edition-unavailable",
    "missing-context",
    "conflict",
  ])("announces %s as an assertive alert", (variant) => {
    render(<AdminAsyncState variant={variant}>当前后台状态</AdminAsyncState>);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("data-admin-async-state", variant);
    expect(alert).not.toHaveAttribute("aria-busy");
  });

  it("preserves caller-owned copy, styling, and compatibility markers", () => {
    render(
      <AdminAsyncState
        className="custom-state-layout"
        data-admin-ux-state="loading"
        variant="initial-loading"
      >
        正在加载题库数据
      </AdminAsyncState>,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveClass("custom-state-layout");
    expect(status).toHaveAttribute("data-admin-ux-state", "loading");
    expect(status).toHaveTextContent("正在加载题库数据");
  });
});
