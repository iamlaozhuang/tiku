import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  adminDataTableClassName,
  adminDataTableContainerClassName,
  adminFilterGridPanelClassName,
  adminListPaginationClassName,
  adminListStatePanelClassName,
  adminListToolbarClassName,
} from "@/components/admin/admin-layout-primitives";
import { AdminCommonInteractionBaseline } from "@/components/admin/CommonInteraction/AdminCommonInteractionBaseline";
import { AdminUserOrgAuthOpsBaseline } from "@/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline";

afterEach(() => {
  cleanup();
});

function getFilterPanelClassName() {
  const pageSizeLabel = screen.getByLabelText("每页条数").closest("label");
  const filterPanel = pageSizeLabel?.parentElement;

  expect(filterPanel).not.toBeNull();

  return filterPanel?.getAttribute("class");
}

describe("admin layout primitives", () => {
  it("exposes shared list primitives for toolbar, table, pagination, and state surfaces", () => {
    expect(adminListToolbarClassName).toContain("bg-surface");
    expect(adminListToolbarClassName).toContain("border-border");
    expect(adminDataTableContainerClassName).toContain("w-full");
    expect(adminDataTableContainerClassName).toContain("max-w-full");
    expect(adminDataTableContainerClassName).toContain("min-w-0");
    expect(adminDataTableContainerClassName).toContain("overflow-x-auto");
    expect(adminDataTableClassName).toContain("w-full");
    expect(adminListPaginationClassName).toContain("justify-between");
    expect(adminListStatePanelClassName).toContain("text-center");
  });

  it("keeps common interaction filter layout on the shared admin grid primitive", () => {
    render(createElement(AdminCommonInteractionBaseline));

    expect(getFilterPanelClassName()).toBe(adminFilterGridPanelClassName);
    expect(screen.getByTestId("admin-list-table-container")).toHaveClass(
      adminDataTableContainerClassName,
    );
    expect(screen.getByRole("table")).toHaveClass(adminDataTableClassName);
  });

  it("keeps user organization authorization filters on the shared admin grid primitive", () => {
    render(createElement(AdminUserOrgAuthOpsBaseline));

    expect(getFilterPanelClassName()).toBe(adminFilterGridPanelClassName);
  });

  it("keeps common list states on the shared admin state primitive", () => {
    render(createElement(AdminCommonInteractionBaseline, { state: "loading" }));

    expect(screen.getByTestId("admin-list-state-panel")).toHaveClass(
      adminListStatePanelClassName,
    );
  });
});
