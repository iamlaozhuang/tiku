import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import {
  adminDataTableContainerClassName,
  adminListPaginationClassName,
  adminListToolbarClassName,
} from "@/components/admin/admin-layout-primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const adminListFilterLabelClassName =
  "text-text-secondary flex min-w-0 flex-col gap-1.5 text-sm font-medium";

export const adminListControlClassName = "h-9";

export function AdminListToolbar({
  children,
  description,
  primaryAction,
  resultLabel,
  title,
}: {
  children: ReactNode;
  description?: string;
  primaryAction?: ReactNode;
  resultLabel: string;
  title: string;
}) {
  return (
    <section
      aria-label={title}
      className={adminListToolbarClassName}
      data-slot="admin-list-toolbar"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          {description === undefined ? null : (
            <p className="text-text-muted text-sm leading-5">{description}</p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-end">
          {children}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
        <p className="text-text-muted text-sm">{resultLabel}</p>
        {primaryAction}
      </div>
    </section>
  );
}

export function AdminTableFrame({
  ariaLabel,
  children,
  className,
  minWidthClassName,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  minWidthClassName: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn(adminDataTableContainerClassName, className)}
      data-slot="admin-table-frame"
    >
      <div
        className={cn("min-w-full", minWidthClassName)}
        data-testid="admin-table-min-width-frame"
      >
        {children}
      </div>
    </section>
  );
}

export function AdminTableEmptyRow({
  colSpan,
  description,
  title,
}: {
  colSpan: number;
  description?: string;
  title: string;
}) {
  return (
    <tr data-slot="admin-table-empty-row">
      <td className="px-4 py-10 text-center" colSpan={colSpan}>
        <div className="space-y-1" role="status">
          <p className="text-text-primary text-sm font-medium">{title}</p>
          {description === undefined ? null : (
            <p className="text-text-muted text-xs leading-5">{description}</p>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AdminPagination({
  itemLabel,
  onPageChange,
  page,
  pageSize,
  total,
}: {
  itemLabel: string;
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  total: number;
}) {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0;
  const safePageSize = Number.isFinite(pageSize)
    ? Math.max(1, Math.trunc(pageSize))
    : 1;
  const pageCount = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const safePage = Math.min(
    pageCount,
    Math.max(1, Number.isFinite(page) ? Math.trunc(page) : 1),
  );
  const visibleStart = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const visibleEnd = Math.min(safeTotal, safePage * safePageSize);

  return (
    <section
      aria-label="列表分页"
      className={adminListPaginationClassName}
      data-slot="admin-list-pagination"
    >
      <p className="text-text-secondary">
        显示 {visibleStart}-{visibleEnd} / 共 {safeTotal} {itemLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          aria-label="上一页"
          disabled={safePage <= 1}
          size="lg"
          variant="outline"
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft aria-hidden="true" />
          上一页
        </Button>
        <span className="text-text-muted min-w-20 text-center text-xs">
          第 {safePage} / {pageCount} 页
        </span>
        <Button
          aria-label="下一页"
          disabled={safePage >= pageCount}
          size="lg"
          variant="outline"
          onClick={() => onPageChange(safePage + 1)}
        >
          下一页
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
