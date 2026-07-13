import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminFilterChips } from "@/components/admin/AdminFilterChips";

afterEach(() => {
  cleanup();
});

describe("AdminFilterChips", () => {
  it("renders caller-owned labels and removes one filter at a time", () => {
    const handleRemove = vi.fn();

    render(
      <AdminFilterChips
        filters={[
          { id: "keyword", label: "关键词", value: "物流" },
          { id: "status", label: "状态", value: "已停用" },
        ]}
        onRemove={handleRemove}
      />,
    );

    expect(
      screen.getByRole("region", { name: "已启用筛选" }),
    ).toBeInTheDocument();
    expect(screen.getByText("关键词：物流")).toBeInTheDocument();
    expect(screen.getByText("状态：已停用")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "移除筛选 关键词：物流" }),
    );

    expect(handleRemove).toHaveBeenCalledWith("keyword");
  });

  it("does not add an empty region when no filter is active", () => {
    const { container } = render(
      <AdminFilterChips filters={[]} onRemove={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
