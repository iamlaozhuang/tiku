import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { EmployeeImportPreflightDto } from "@/server/contracts/employee-import-command-contract";

import { EmployeeCreateActionPanel } from "./EmployeeCreateActionPanel";

describe("EmployeeCreateActionPanel", () => {
  it("requires server preview before confirmation and invalidates reviewed fields", () => {
    const onInvalidatePreview = vi.fn();
    const onNameChange = vi.fn();
    render(
      <EmployeeCreateActionPanel
        initialPassword="Secret1"
        canConfirm={false}
        isBusy={false}
        message={null}
        name="Employee One"
        organizationPublicId="organization-public-1"
        organizations={[{ name: "Org One", publicId: "organization-public-1" }]}
        phone="13900000001"
        preview={null}
        onConfirm={vi.fn()}
        onInitialPasswordChange={vi.fn()}
        onInvalidatePreview={onInvalidatePreview}
        onNameChange={onNameChange}
        onOrganizationChange={vi.fn()}
        onPhoneChange={vi.fn()}
        onPreview={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "确认创建员工" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("员工姓名"), {
      target: { value: "Changed Employee" },
    });
    expect(onNameChange).toHaveBeenCalledWith("Changed Employee");
    expect(onInvalidatePreview).toHaveBeenCalledTimes(1);
  });

  it("renders edition, quota impact and localized block reasons", () => {
    const preview: EmployeeImportPreflightDto = {
      previewRevision: "a".repeat(64),
      commandKind: "single_create",
      organizationPublicId: "organization-public-1",
      rowCount: 1,
      counts: { new: 0, bind: 0, skip: 0, block: 1 },
      canConfirm: false,
      confirmDisabledReason: "blocked_rows",
      rows: [
        {
          rowNumber: 1,
          maskedPhone: "139****0001",
          name: "Employee One",
          outcome: "block",
          redactedReason: "quota_insufficient",
          credentialMode: null,
          inheritedAuthorizationSummary: {
            status: "available",
            activeScopeCount: 2,
            effectiveEdition: "advanced",
          },
          quotaImpact: {
            status: "insufficient",
            requiredSeatCount: 1,
            availableSeatCount: 0,
          },
        },
      ],
    };
    render(
      <EmployeeCreateActionPanel
        initialPassword=""
        canConfirm={false}
        isBusy={false}
        message={null}
        name="Employee One"
        organizationPublicId="organization-public-1"
        organizations={[]}
        phone="13900000001"
        preview={preview}
        onConfirm={vi.fn()}
        onInitialPasswordChange={vi.fn()}
        onInvalidatePreview={vi.fn()}
        onNameChange={vi.fn()}
        onOrganizationChange={vi.fn()}
        onPhoneChange={vi.fn()}
        onPreview={vi.fn()}
      />,
    );

    expect(screen.getByText(/高级版/u)).toBeInTheDocument();
    expect(screen.getByText(/需要 1.*可用 0/u)).toBeInTheDocument();
    expect(screen.getAllByText(/额度不足/u)).toHaveLength(2);
  });
});
