import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { adminFilterGridPanelClassName } from "@/components/admin/admin-layout-primitives";
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
  it("keeps common interaction filter layout on the shared admin grid primitive", () => {
    render(createElement(AdminCommonInteractionBaseline));

    expect(getFilterPanelClassName()).toBe(adminFilterGridPanelClassName);
  });

  it("keeps user organization authorization filters on the shared admin grid primitive", () => {
    render(createElement(AdminUserOrgAuthOpsBaseline));

    expect(getFilterPanelClassName()).toBe(adminFilterGridPanelClassName);
  });
});
