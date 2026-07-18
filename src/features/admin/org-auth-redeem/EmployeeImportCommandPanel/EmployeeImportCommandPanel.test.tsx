import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EmployeeImportCommandDto } from "@/server/contracts/employee-import-command-contract";

import type { EmployeeImportCommandUiState } from "../useEmployeeImportCommand";
import { EmployeeImportCommandPanel } from "./EmployeeImportCommandPanel";

afterEach(cleanup);

function command(): EmployeeImportCommandDto {
  return {
    commandKind: "batch_import",
    completedAt: "2026-07-17T12:01:00.000Z",
    counts: { pending: 0, rejected: 1, succeeded: 1 },
    createdAt: "2026-07-17T12:00:00.000Z",
    credentialDistributionStatus: "open",
    credentialRevision: 0,
    currentIssuePublicId: null,
    distributionConfirmedAt: null,
    organizationPublicId: "organization-public-1",
    publicId: "command-public-1",
    rowCount: 2,
    rows: [
      {
        credentialMode: "generated",
        employeePublicId: "employee-public-1",
        outcomeKind: "created",
        publicId: "row-public-1",
        rejectionReason: null,
        rowNumber: 2,
        status: "succeeded",
        warningReason: null,
      },
      {
        credentialMode: null,
        employeePublicId: null,
        outcomeKind: null,
        publicId: "row-public-2",
        rejectionReason: "duplicate_phone",
        rowNumber: 3,
        status: "rejected",
        warningReason: null,
      },
    ],
    status: "completed",
    updatedAt: "2026-07-17T12:01:00.000Z",
  };
}

function state(
  overrides: Partial<EmployeeImportCommandUiState> = {},
): EmployeeImportCommandUiState {
  return {
    command: command(),
    highestCredentialRevision: 0,
    idempotencyKey: null,
    manifest: null,
    message: null,
    status: "open",
    submittedInput: null,
    ...overrides,
  };
}

function renderPanel(
  input: {
    canConfirm?: boolean;
    canIssue?: boolean;
    state?: EmployeeImportCommandUiState;
  } = {},
) {
  const actions = {
    onClearPlaintext: vi.fn(),
    onConfirmDistribution: vi.fn(),
    onIssueCredentials: vi.fn(),
  };
  render(
    <EmployeeImportCommandPanel
      canConfirm={input.canConfirm ?? false}
      canIssue={input.canIssue ?? true}
      state={input.state ?? state()}
      {...actions}
    />,
  );
  return actions;
}

describe("EmployeeImportCommandPanel", () => {
  it("renders aggregate and redacted rejection state without plaintext", () => {
    renderPanel();

    const panel = screen.getByTestId("employee-import-result");
    expect(panel).toHaveTextContent("成功 1");
    expect(panel).toHaveTextContent("拒绝 1");
    expect(panel).toHaveTextContent("第 3 行：手机号重复");
    expect(panel).not.toHaveTextContent("RequestSecret1");
  });

  it("shows the current manifest and delegates copy, issue and confirm", async () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const actions = renderPanel({
      canConfirm: true,
      state: state({
        highestCredentialRevision: 1,
        manifest: {
          credentialRevision: 1,
          issuePublicId: "issue-public-1",
          rows: [
            {
              employeePublicId: "employee-public-1",
              initialPassword: "ManifestSecret1",
              name: "Employee One",
              phone: "139****0001",
              rowNumber: 2,
              rowPublicId: "row-public-1",
            },
          ],
        },
      }),
    });

    expect(screen.getByText("ManifestSecret1")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "复制第 2 行初始密码" }),
    );
    fireEvent.click(screen.getByTestId("employee-import-issue-credentials"));
    fireEvent.click(screen.getByTestId("employee-import-confirm-distribution"));
    expect(writeText).toHaveBeenCalledWith("ManifestSecret1");
    expect(await screen.findByRole("status")).toHaveTextContent("已复制");
    expect(actions.onIssueCredentials).toHaveBeenCalledTimes(1);
    expect(actions.onConfirmDistribution).toHaveBeenCalledTimes(1);
  });

  it("reports clipboard permission failure without leaking the secret", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(() => Promise.reject(new Error("denied"))) },
    });
    renderPanel({
      canConfirm: true,
      state: state({
        highestCredentialRevision: 1,
        manifest: {
          credentialRevision: 1,
          issuePublicId: "issue-public-1",
          rows: [
            {
              employeePublicId: "employee-public-1",
              initialPassword: "ManifestSecret1",
              name: "Employee One",
              phone: "139****0001",
              rowNumber: 2,
              rowPublicId: "row-public-1",
            },
          ],
        },
      }),
    });

    fireEvent.click(
      screen.getByRole("button", { name: "复制第 2 行初始密码" }),
    );

    const feedback = await screen.findByRole("status");
    expect(feedback).toHaveTextContent("复制失败");
    expect(feedback).not.toHaveTextContent("ManifestSecret1");
  });

  it("does not carry copy feedback across credential issues", async () => {
    let resolveCopy!: () => void;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              resolveCopy = resolve;
            }),
        ),
      },
    });
    const actions = {
      onClearPlaintext: vi.fn(),
      onConfirmDistribution: vi.fn(),
      onIssueCredentials: vi.fn(),
    };
    const firstState = state({
      command: {
        ...command(),
        credentialRevision: 1,
        currentIssuePublicId: "issue-public-1",
      },
      highestCredentialRevision: 1,
      manifest: {
        credentialRevision: 1,
        issuePublicId: "issue-public-1",
        rows: [
          {
            employeePublicId: "employee-public-1",
            initialPassword: "ManifestSecret1",
            name: "Employee One",
            phone: "139****0001",
            rowNumber: 2,
            rowPublicId: "row-public-1",
          },
        ],
      },
    });
    const view = render(
      <EmployeeImportCommandPanel
        canConfirm
        canIssue
        state={firstState}
        {...actions}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "复制第 2 行初始密码" }),
    );

    view.rerender(
      <EmployeeImportCommandPanel
        canConfirm
        canIssue
        state={
          {
            ...firstState,
            command: {
              ...firstState.command!,
              credentialRevision: 2,
              currentIssuePublicId: "issue-public-2",
            },
            highestCredentialRevision: 2,
            manifest: {
              ...firstState.manifest!,
              credentialRevision: 2,
              issuePublicId: "issue-public-2",
              rows: firstState.manifest!.rows.map((row) => ({
                ...row,
                initialPassword: "ManifestSecret2",
              })),
            },
          } satisfies EmployeeImportCommandUiState
        }
        {...actions}
      />,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => resolveCopy());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("disables unsafe actions while conflict is active", () => {
    renderPanel({
      canIssue: false,
      state: state({ message: "凭据状态已变化。", status: "conflict" }),
    });

    expect(
      screen.getByTestId("employee-import-issue-credentials"),
    ).toBeDisabled();
    expect(screen.getByText("凭据状态已变化。")).toBeInTheDocument();
  });
});
