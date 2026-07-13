import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminToast } from "@/components/admin/AdminToast";

afterEach(() => {
  cleanup();
});

describe("AdminToast", () => {
  it("announces success politely and supports explicit dismissal", () => {
    const handleDismiss = vi.fn();

    render(
      <AdminToast
        feedback={{
          message: "题目已保存",
          title: "操作成功",
          tone: "success",
        }}
        onDismiss={handleDismiss}
      />,
    );

    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(toast).toHaveAttribute("data-admin-feedback-tone", "success");

    fireEvent.click(screen.getByRole("button", { name: "关闭操作反馈" }));

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("announces conflicts assertively without exposing diagnostics", () => {
    render(
      <AdminToast
        feedback={{
          message: "内容已被其他操作更新，请刷新确认后重试。",
          title: "保存冲突",
          tone: "conflict",
        }}
      />,
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveAttribute("aria-live", "assertive");
    expect(toast).toHaveAttribute("data-admin-feedback-tone", "conflict");
    expect(toast).toHaveTextContent("保存冲突");
    expect(toast).not.toHaveTextContent("stack");
  });
});
