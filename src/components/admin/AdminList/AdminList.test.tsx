import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  adminListControlClassName,
  adminListFilterLabelClassName,
  AdminListToolbar,
  AdminPagination,
  AdminTableFrame,
} from "@/components/admin/AdminList";
import { Button } from "@/components/ui/button";
import { useAdminListInteraction } from "@/hooks/useAdminListInteraction";

afterEach(() => {
  cleanup();
});

function AdminListInteractionHarness() {
  const {
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleReset,
    handleSortChange,
    query,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "registeredAt",
      sortOrder: "asc",
    },
  });

  return (
    <div>
      <output aria-label="列表查询状态">{JSON.stringify(query)}</output>
      <button type="button" onClick={() => handlePageChange(3)}>
        转到第三页
      </button>
      <button type="button" onClick={() => handlePageSizeChange("50")}>
        每页五十条
      </button>
      <button type="button" onClick={() => handleSortChange("updatedAt")}>
        更新时间排序
      </button>
      <button type="button" onClick={() => handleFilterChange("status")}>
        状态筛选
      </button>
      <button type="button" onClick={handleReset}>
        重置查询
      </button>
    </div>
  );
}

function AdminListDefaultResetHarness() {
  const { handleReset, query } = useAdminListInteraction({
    initialQuery: {
      page: 3,
      pageSize: 50,
      sortBy: "updatedAt",
      sortOrder: "asc",
    },
    resetQuery: {},
  });

  return (
    <div>
      <output aria-label="默认重置状态">{JSON.stringify(query)}</output>
      <button type="button" onClick={handleReset}>
        恢复列表默认值
      </button>
    </div>
  );
}

describe("admin list pattern v2", () => {
  it("renders a labelled toolbar while preserving caller-owned filter order", () => {
    render(
      <AdminListToolbar
        description="按条件缩小结果范围。"
        primaryAction={<Button>新增用户</Button>}
        resultLabel="共 25 个用户"
        title="用户筛选"
      >
        <label className={adminListFilterLabelClassName}>
          关键词
          <input aria-label="关键词" className={adminListControlClassName} />
        </label>
        <label className={adminListFilterLabelClassName}>
          状态
          <select aria-label="状态" className={adminListControlClassName} />
        </label>
        <button className={adminListControlClassName} type="button">
          排序
        </button>
        <label className={adminListFilterLabelClassName}>
          每页条数
          <select aria-label="每页条数" className={adminListControlClassName} />
        </label>
        <button className={adminListControlClassName} type="button">
          重置筛选
        </button>
      </AdminListToolbar>,
    );

    const toolbar = screen.getByRole("region", { name: "用户筛选" });
    expect(
      within(toolbar).getByText("按条件缩小结果范围。"),
    ).toBeInTheDocument();
    expect(within(toolbar).getByText("共 25 个用户")).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "新增用户" }),
    ).toBeInTheDocument();

    const controls = [
      within(toolbar).getByLabelText("关键词"),
      within(toolbar).getByLabelText("状态"),
      within(toolbar).getByRole("button", { name: "排序" }),
      within(toolbar).getByLabelText("每页条数"),
      within(toolbar).getByRole("button", { name: "重置筛选" }),
    ];

    for (const [index, control] of controls.entries()) {
      expect(control).toHaveClass("h-9");

      if (index > 0) {
        expect(controls[index - 1]?.compareDocumentPosition(control) ?? 0).toBe(
          Node.DOCUMENT_POSITION_FOLLOWING,
        );
      }
    }
  });

  it("provides an accessible horizontally scrollable table frame", () => {
    render(
      <AdminTableFrame ariaLabel="用户列表" minWidthClassName="min-w-[48rem]">
        <table>
          <tbody>
            <tr>
              <td>测试行</td>
            </tr>
          </tbody>
        </table>
      </AdminTableFrame>,
    );

    const tableFrame = screen.getByRole("region", { name: "用户列表" });
    expect(tableFrame).toHaveClass("overflow-x-auto");
    expect(
      within(tableFrame).getByTestId("admin-table-min-width-frame"),
    ).toHaveClass("min-w-[48rem]");
    expect(within(tableFrame).getByRole("table")).toBeInTheDocument();
  });

  it("renders bounded pagination controls and keeps the empty summary visible", () => {
    const handlePageChange = vi.fn();
    const { rerender } = render(
      <AdminPagination
        itemLabel="个用户"
        page={2}
        pageSize={20}
        total={45}
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText("显示 21-40 / 共 45 个用户")).toBeInTheDocument();
    expect(screen.getByText("第 2 / 3 页")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "上一页" }));
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(handlePageChange.mock.calls).toEqual([[1], [3]]);

    rerender(
      <AdminPagination
        itemLabel="条记录"
        page={1}
        pageSize={20}
        total={0}
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText("显示 0-0 / 共 0 条记录")).toBeInTheDocument();
    expect(screen.getByText("第 1 / 1 页")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一页" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "下一页" })).toBeDisabled();

    rerender(
      <AdminPagination
        itemLabel="条记录"
        page={Number.NaN}
        pageSize={Number.NaN}
        total={Number.NaN}
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText("显示 0-0 / 共 0 条记录")).toBeInTheDocument();
    expect(screen.getByText("第 1 / 1 页")).toBeInTheDocument();
  });

  it("resets pagination, page size, sorting, and filter metadata", () => {
    render(<AdminListInteractionHarness />);

    fireEvent.click(screen.getByRole("button", { name: "转到第三页" }));
    fireEvent.click(screen.getByRole("button", { name: "每页五十条" }));
    fireEvent.click(screen.getByRole("button", { name: "更新时间排序" }));
    fireEvent.click(screen.getByRole("button", { name: "状态筛选" }));
    expect(screen.getByLabelText("列表查询状态")).toHaveTextContent(
      '"pageSize":50',
    );
    expect(screen.getByLabelText("列表查询状态")).toHaveTextContent(
      '"lastChangedFilter":"status"',
    );

    fireEvent.click(screen.getByRole("button", { name: "重置查询" }));

    expect(screen.getByLabelText("列表查询状态")).toHaveTextContent(
      JSON.stringify({
        page: 1,
        pageSize: 20,
        sortBy: "registeredAt",
        sortOrder: "asc",
        filterRevision: 0,
        lastChangedFilter: null,
      }),
    );
  });

  it("can reset URL-restored state to the list defaults", () => {
    render(<AdminListDefaultResetHarness />);

    fireEvent.click(screen.getByRole("button", { name: "恢复列表默认值" }));

    expect(screen.getByLabelText("默认重置状态")).toHaveTextContent(
      JSON.stringify({
        page: 1,
        pageSize: 20,
        sortBy: "updatedAt",
        sortOrder: "desc",
        filterRevision: 0,
        lastChangedFilter: null,
      }),
    );
  });
});
