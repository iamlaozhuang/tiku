import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminPaperOpsSummaryDto } from "@/server/contracts/admin-content-knowledge-ops-contract";

import { AdminPaperManagement } from "./AdminPaperManagementClient";

function createJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
    },
  });
}

function createAdminSessionResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      user: {
        publicId: "user_public_admin",
        phone: "13800000000",
        name: "Content Admin",
        userType: null,
        status: "active",
        lockedUntilAt: null,
        employeePublicId: null,
        organizationPublicId: null,
        adminPublicId: "admin_public_content",
        adminRoles: ["content_admin"],
      },
      session: {
        expiresAt: "2026-06-21T10:00:00.000Z",
      },
    },
  };
}

function createPaper(
  overrides: Partial<AdminPaperOpsSummaryDto> = {},
): AdminPaperOpsSummaryDto {
  return {
    publicId: "paper_public_count",
    name: "Question count boundary paper",
    profession: "marketing",
    level: 3,
    subject: "theory",
    paperStatus: "draft",
    paperType: "mock_paper",
    year: 2026,
    totalScore: "100.0",
    questionCount: 50,
    mockExamCount: 0,
    sourceFileName: null,
    publishValidationSummary: null,
    updatedAt: "2026-06-21T08:00:00.000Z",
    ...overrides,
  };
}

function mockAdminPaperList(papers: AdminPaperOpsSummaryDto[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : input.toString();

    if (url.includes("/api/v1/sessions")) {
      return createJsonResponse(createAdminSessionResponse());
    }

    if (url.includes("/api/v1/papers?")) {
      return createJsonResponse({
        code: 0,
        message: "ok",
        data: {
          papers,
        },
      });
    }

    return createJsonResponse({
      code: 404001,
      message: "Unexpected admin test request.",
      data: null,
    });
  });

  vi.stubGlobal("fetch", fetchMock);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("AdminPaperManagement", () => {
  it("shows admin question-count capacity and publish-risk feedback", async () => {
    mockAdminPaperList([
      createPaper({
        publicId: "paper-draft-empty",
        name: "Empty draft paper",
        questionCount: 0,
      }),
      createPaper({
        publicId: "paper-draft-capped",
        name: "Capped draft paper",
        questionCount: 100,
      }),
      createPaper({
        publicId: "paper-draft-over-limit",
        name: "Over limit draft paper",
        questionCount: 101,
      }),
    ]);

    render(<AdminPaperManagement />);

    const emptyRow = within(
      await screen.findByTestId("paper-row-paper-draft-empty"),
    );
    expect(emptyRow.getByText("题量 0/100")).toBeInTheDocument();
    expect(
      emptyRow.getByText("发布风险：发布前至少需要 1 题；还可加入 100 题"),
    ).toBeInTheDocument();

    const cappedRow = within(
      await screen.findByTestId("paper-row-paper-draft-capped"),
    );
    expect(cappedRow.getByText("题量 100/100")).toBeInTheDocument();
    expect(
      cappedRow.getByText("已达到 100 题上限；发布前请复核性能风险"),
    ).toBeInTheDocument();

    const overLimitRow = within(
      await screen.findByTestId("paper-row-paper-draft-over-limit"),
    );
    expect(overLimitRow.getByText("题量 101/100")).toBeInTheDocument();
    expect(
      overLimitRow.getByText("发布风险：已超过 100 题上限 1 题"),
    ).toBeInTheDocument();
  });
});
