import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { EmployeeImportPreflightDto } from "@/server/contracts/employee-import-command-contract";

import { EmployeeImportPreflightPanel } from "./EmployeeImportPreflightPanel";

const preview: EmployeeImportPreflightDto = {
  previewRevision: "a".repeat(64),
  commandKind: "batch_import",
  organizationPublicId: "organization-public-1",
  rowCount: 1,
  counts: { new: 1, bind: 0, skip: 0, block: 0 },
  canConfirm: true,
  confirmDisabledReason: null,
  rows: [
    {
      rowNumber: 1,
      maskedPhone: "139****0001",
      name: "Employee One",
      outcome: "new",
      redactedReason: null,
      credentialMode: "provided",
      inheritedAuthorizationSummary: {
        status: "available",
        activeScopeCount: 1,
        effectiveEdition: "advanced",
      },
      quotaImpact: {
        status: "available",
        requiredSeatCount: 1,
        availableSeatCount: 2,
      },
    },
  ],
};

describe("EmployeeImportPreflightPanel", () => {
  it("renders only server facts and forwards the raw source unchanged", () => {
    const onContentChange = vi.fn();
    const onInvalidatePreview = vi.fn();
    render(
      <EmployeeImportPreflightPanel
        canConfirm={true}
        content={'phone,name\n13900000001,"Employee\nOne"'}
        isBusy={false}
        message={null}
        organizationPublicId="organization-public-1"
        organizations={[
          {
            authSummary: null,
            employeeCount: 0,
            name: "Org One",
            orgTier: "city",
            parentOrganizationPublicId: null,
            publicId: "organization-public-1",
            revision: 1,
            status: "active",
          },
        ]}
        preview={preview}
        sourceFormat="csv"
        onConfirm={vi.fn()}
        onContentChange={onContentChange}
        onFileChange={vi.fn()}
        onInvalidatePreview={onInvalidatePreview}
        onOrganizationChange={vi.fn()}
        onPreview={vi.fn()}
        onSourceFormatChange={vi.fn()}
        onTemplateDownload={vi.fn()}
      />,
    );

    expect(screen.getByText(/139\*{4}0001/u)).toBeInTheDocument();
    expect(screen.queryByText("13900000001")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认导入员工" })).toBeEnabled();
    expect(screen.getByText(/高级版/u)).toBeInTheDocument();
    expect(screen.getByText(/需要 1.*可用 2/u)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("员工导入内容"), {
      target: { value: "raw\nsource" },
    });
    expect(onContentChange).toHaveBeenCalledWith("raw\nsource");
    expect(onInvalidatePreview).toHaveBeenCalledTimes(1);
  });
});
