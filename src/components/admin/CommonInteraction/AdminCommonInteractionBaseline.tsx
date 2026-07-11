"use client";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  adminDataTableClassName,
  adminDataTableContainerClassName,
  adminFilterGridPanelClassName,
  adminListStatePanelClassName,
} from "@/components/admin/admin-layout-primitives";
import {
  ADMIN_CONFLICT_MESSAGE,
  ADMIN_DEFAULT_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
} from "@/server/contracts/admin-interaction-contract";
import { useAdminListInteraction } from "@/hooks/useAdminListInteraction";

type AdminCommonInteractionState = "ready" | "loading" | "empty" | "error";

type AdminCommonInteractionRow = {
  publicId: string;
  displayName: string;
  status: "active" | "disabled";
  updatedAt: string;
};

type ConfirmationKind = "bulkDisable" | "dangerDelete";

type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

const adminCommonRows: AdminCommonInteractionRow[] = [
  {
    publicId: "admin-user-001",
    displayName: "运营管理员 A",
    status: "active",
    updatedAt: "2026-05-20T08:00:00.000Z",
  },
  {
    publicId: "admin-user-002",
    displayName: "内容老师 B",
    status: "disabled",
    updatedAt: "2026-05-19T08:00:00.000Z",
  },
];

const statusLabels: Record<AdminCommonInteractionRow["status"], string> = {
  active: "启用",
  disabled: "停用",
};

export function AdminCommonInteractionBaseline({
  state = "ready",
}: {
  state?: AdminCommonInteractionState;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmationKind, setConfirmationKind] =
    useState<ConfirmationKind | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const {
    handleFilterChange,
    handlePageSizeChange,
    handleSortChange,
    query,
    refreshCount,
  } = useAdminListInteraction({
    initialQuery: {
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
  });

  const visibleRows = useMemo(
    () =>
      adminCommonRows.filter(
        (row) => statusFilter === "all" || row.status === statusFilter,
      ),
    [statusFilter],
  );

  if (state === "loading") {
    return (
      <AdminStatePanel
        icon={
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        }
        title="正在加载后台列表"
      />
    );
  }

  if (state === "empty") {
    return (
      <AdminStatePanel
        icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
        title="暂无后台数据"
      />
    );
  }

  if (state === "error") {
    return (
      <AdminStatePanel
        icon={<AlertCircle aria-hidden="true" className="size-8" />}
        title="后台列表加载失败"
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">Admin Ops</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            后台通用交互
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={visibleRows.length === 0}
            variant="outline"
            onClick={() => setConfirmationKind("bulkDisable")}
          >
            批量停用
          </Button>
          <Button
            className="border-destructive/40"
            disabled={visibleRows.length === 0}
            variant="destructive"
            onClick={() => setConfirmationKind("dangerDelete")}
          >
            删除所选
          </Button>
        </div>
      </header>

      <div className={adminFilterGridPanelClassName}>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">每页条数</span>
          <select
            aria-label="每页条数"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={String(query.pageSize)}
            onChange={(event) => handlePageSizeChange(event.target.value)}
          >
            {ADMIN_PAGE_SIZE_OPTIONS.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          <span className="text-text-secondary">状态筛选</span>
          <select
            aria-label="状态筛选"
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              handleFilterChange("status");
            }}
          >
            <option value="all">全部状态</option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
          </select>
        </label>
        <div className="flex items-end">
          <span className="text-text-muted text-sm">
            刷新 {refreshCount} 次
          </span>
        </div>
      </div>

      <div
        className={adminDataTableContainerClassName}
        data-testid="admin-list-table-container"
      >
        <table className={adminDataTableClassName}>
          <thead className="bg-muted text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                名称
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                状态
              </th>
              <th
                aria-sort={
                  query.sortBy === "updatedAt"
                    ? query.sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-4 py-3 font-medium"
                scope="col"
              >
                <button
                  className="hover:text-text-primary active:translate-y-px"
                  type="button"
                  onClick={() => handleSortChange("updatedAt")}
                >
                  更新时间
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                className="border-border border-t"
                data-public-id={row.publicId}
                data-testid={`admin-row-${row.publicId}`}
                key={row.publicId}
              >
                <td className="text-text-primary px-4 py-3 font-medium">
                  {row.displayName}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
                    {statusLabels[row.status]}
                  </span>
                </td>
                <td className="text-text-secondary px-4 py-3">
                  {formatDateTime(row.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            setToastMessage({ tone: "success", message: "保存成功" })
          }
        >
          模拟成功提示
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setToastMessage({ tone: "error", message: "保存失败" })
          }
        >
          模拟失败提示
        </Button>
      </div>

      {confirmationKind === null ? null : (
        <ConfirmationDialog
          confirmationKind={confirmationKind}
          selectedCount={visibleRows.length}
          onCancel={() => setConfirmationKind(null)}
          onConfirm={() => {
            setConfirmationKind(null);
            if (confirmationKind === "bulkDisable") {
              setToastMessage({
                tone: "success",
                message: "批量操作已提交",
              });
              return;
            }

            setToastMessage({
              tone: "error",
              message: ADMIN_CONFLICT_MESSAGE,
            });
          }}
        />
      )}

      {toastMessage === null ? null : <Toast message={toastMessage} />}

      <p className="sr-only">默认每页 {ADMIN_DEFAULT_PAGE_SIZE} 条</p>
    </div>
  );
}

function AdminStatePanel({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div
      className={adminListStatePanelClassName}
      data-testid="admin-list-state-panel"
    >
      <div className="text-brand-primary mx-auto flex justify-center">
        {icon}
      </div>
      <h1 className="text-text-primary mt-4 text-base font-semibold">
        {title}
      </h1>
    </div>
  );
}

function ConfirmationDialog({
  confirmationKind,
  selectedCount,
  onCancel,
  onConfirm,
}: {
  confirmationKind: ConfirmationKind;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDangerous = confirmationKind === "dangerDelete";
  const title = isDangerous
    ? "危险操作需要二次确认"
    : `确认批量停用 ${selectedCount} 项？`;
  const confirmLabel = isDangerous ? "确认危险操作" : "确认批量停用";

  return (
    <div
      aria-modal="true"
      className="border-border bg-surface fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-md border p-4 shadow-lg"
      role="alertdialog"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          aria-hidden="true"
          className={
            isDangerous
              ? "text-destructive mt-0.5 size-5"
              : "text-warning mt-0.5 size-5"
          }
        />
        <div className="space-y-3">
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant={isDangerous ? "destructive" : "default"}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: ToastMessage }) {
  const role = message.tone === "success" ? "status" : "alert";

  return (
    <div
      className={
        message.tone === "success"
          ? "bg-secondary text-secondary-foreground fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
          : "bg-destructive/10 text-destructive fixed right-6 bottom-6 rounded-md px-4 py-3 text-sm shadow-lg"
      }
      role={role}
    >
      {message.message}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
