import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminCommonInteractionBaseline } from "@/components/admin/CommonInteraction/AdminCommonInteractionBaseline";
import {
  ADMIN_CONFLICT_MESSAGE,
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
  applyAdminListFilter,
  createAdminListQuery,
  toggleAdminListSort,
} from "@/server/contracts/admin-interaction-contract";

afterEach(() => {
  cleanup();
});

describe("admin shell common interaction baseline", () => {
  it("defines the shared list contract for pagination, sorting, filters, and conflicts", () => {
    expect(ADMIN_DEFAULT_PAGE_SIZE).toBe(20);
    expect(ADMIN_PAGE_SIZE_OPTIONS).toEqual([20, 50, 100]);
    expect(ADMIN_CONFLICT_MESSAGE).toBe("数据已被其他操作更新，请刷新后重试");

    const initialQuery = createAdminListQuery({
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
    const ascendingQuery = toggleAdminListSort(initialQuery, "updatedAt");
    const filteredQuery = applyAdminListFilter(ascendingQuery, "status");

    expect(initialQuery).toMatchObject({
      page: 1,
      pageSize: 20,
      sortBy: "updatedAt",
      sortOrder: "desc",
      filterRevision: 0,
    });
    expect(ascendingQuery).toMatchObject({
      sortBy: "updatedAt",
      sortOrder: "asc",
    });
    expect(filteredQuery).toMatchObject({
      page: 1,
      lastChangedFilter: "status",
      filterRevision: 1,
    });
  });

  it("renders loading, empty, error, and ready states without internal numeric ids", () => {
    render(createElement(AdminCommonInteractionBaseline, { state: "loading" }));
    expect(screen.getByText("正在加载后台列表")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminCommonInteractionBaseline, { state: "empty" }));
    expect(screen.getByText("暂无后台数据")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminCommonInteractionBaseline, { state: "error" }));
    expect(screen.getByText("后台列表加载失败")).toBeInTheDocument();

    cleanup();
    render(createElement(AdminCommonInteractionBaseline));

    expect(
      screen.getByRole("heading", { name: "后台通用交互" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("admin-row-admin-user-001")).toHaveAttribute(
      "data-public-id",
      "admin-user-001",
    );
    expect(screen.getByTestId("admin-row-admin-user-001")).not.toHaveAttribute(
      "data-id",
    );
  });

  it("supports page size changes, sortable headers, filter refresh, confirmations, and toast feedback", () => {
    render(createElement(AdminCommonInteractionBaseline));

    const pageSizeSelect = screen.getByLabelText("每页条数");
    expect(pageSizeSelect).toHaveValue("20");
    fireEvent.change(pageSizeSelect, { target: { value: "50" } });
    expect(pageSizeSelect).toHaveValue("50");

    const updatedAtHeader = screen.getByRole("columnheader", {
      name: "更新时间",
    });
    expect(updatedAtHeader).toHaveAttribute("aria-sort", "descending");
    fireEvent.click(screen.getByRole("button", { name: "更新时间" }));
    expect(updatedAtHeader).toHaveAttribute("aria-sort", "ascending");

    expect(screen.getByText("刷新 0 次")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("状态筛选"), {
      target: { value: "disabled" },
    });
    expect(screen.getByText("刷新 1 次")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "批量停用" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "确认批量停用 1 项？",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认批量停用" }));
    expect(screen.getByRole("status")).toHaveTextContent("批量操作已提交");

    fireEvent.click(screen.getByRole("button", { name: "删除所选" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "危险操作需要二次确认",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认危险操作" }));
    expect(screen.getByRole("alert")).toHaveTextContent(ADMIN_CONFLICT_MESSAGE);
  });
});
