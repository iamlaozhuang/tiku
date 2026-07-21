import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { navigationPush } = vi.hoisted(() => ({ navigationPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigationPush }),
}));

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
    revision: 1,
    paperType: "mock_paper",
    year: 2026,
    totalScore: "100.0",
    questionCount: 50,
    questionTypeDistribution: [],
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
  it("loads complete draft metadata and saves edits through PATCH with revision", async () => {
    const paper = createPaper({
      publicId: "paper-public-edit-metadata",
      name: "区域营销真题",
      revision: 4,
    });
    const mutationRequests: Array<{ method: string; body: unknown }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
            data: { papers: [paper] },
          });
        }
        if (
          url.endsWith(`/api/v1/papers/${paper.publicId}`) &&
          (init?.method ?? "GET") === "GET"
        ) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: {
              paper: {
                ...paper,
                month: 6,
                sourceDescription: "公开资料整理",
                sourceRegion: "华东",
                sourceOrganization: "区域技能鉴定中心",
                questionBasis: "2026 营销职业标准",
                generationMethod: "manual",
                durationMinute: 120,
                archivedAt: null,
                publishedAt: null,
                paperSections: [],
                questionGroups: [],
                createdAt: "2026-07-21T08:00:00.000Z",
              },
            },
          });
        }
        if (
          url.endsWith(`/api/v1/papers/${paper.publicId}`) &&
          init?.method === "PATCH"
        ) {
          const body = JSON.parse(String(init.body)) as unknown;
          mutationRequests.push({ method: init.method, body });
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { paper: { ...(body as object), ...paper, revision: 5 } },
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "unexpected",
          data: null,
        });
      }),
    );

    render(<AdminPaperManagement />);
    const row = within(
      await screen.findByTestId(`paper-row-${paper.publicId}`),
    );
    fireEvent.click(
      row.getByRole("button", { name: `编辑元数据 ${paper.name}` }),
    );

    expect(await screen.findByLabelText("月份")).toHaveValue(6);
    expect(screen.getByLabelText("来源地区")).toHaveValue("华东");
    expect(screen.getByLabelText("来源机构")).toHaveValue("区域技能鉴定中心");
    expect(screen.getByLabelText("出题依据")).toHaveValue("2026 营销职业标准");
    expect(screen.getByLabelText("生成方式")).toHaveValue("manual");

    fireEvent.change(screen.getByLabelText("来源地区"), {
      target: { value: "华南" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存草稿" }));

    await waitFor(() => expect(mutationRequests).toHaveLength(1));
    expect(mutationRequests[0]).toEqual({
      method: "PATCH",
      body: expect.objectContaining({
        expectedRevision: 4,
        month: 6,
        sourceDescription: "公开资料整理",
        sourceRegion: "华南",
        sourceOrganization: "区域技能鉴定中心",
        questionBasis: "2026 营销职业标准",
        generationMethod: "manual",
      }),
    });
  });

  it("names paper actions with business names and keeps opaque identifiers out of operator copy", async () => {
    const paper = createPaper({
      publicId: "paper_internal_marker_001",
      name: "区域营销能力测评",
    });
    mockAdminPaperList([paper]);

    render(<AdminPaperManagement initialPaperPublicId={paper.publicId} />);

    const row = within(
      await screen.findByTestId(`paper-row-${paper.publicId}`),
    );
    expect(
      row.getByRole("link", { name: "查看试卷 区域营销能力测评" }),
    ).toBeInTheDocument();
    expect(
      row.getByRole("link", { name: "组卷 区域营销能力测评" }),
    ).toBeInTheDocument();
    expect(
      row.getByRole("button", { name: "发布 区域营销能力测评" }),
    ).toBeInTheDocument();
    expect(
      row.getByRole("button", { name: "绑定原始文件 区域营销能力测评" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("已定位待审试卷草稿 区域营销能力测评"),
    ).toHaveAttribute("role", "status");
    expect(
      screen.getByPlaceholderText("试卷名称、校验结果或文件名"),
    ).toBeInTheDocument();

    fireEvent.click(row.getByRole("button", { name: "发布 区域营销能力测评" }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("将发布试卷“区域营销能力测评”");
    expect(dialog).not.toHaveTextContent(paper.publicId);
    expect(document.body).not.toHaveTextContent(paper.publicId);
  });

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
        questionTypeDistribution: [
          {
            questionType: "single_choice",
            count: 100,
          },
        ],
      }),
      createPaper({
        publicId: "paper-draft-over-limit",
        name: "Over limit draft paper",
        questionCount: 101,
        questionTypeDistribution: [
          {
            questionType: "single_choice",
            count: 60,
          },
          {
            questionType: "multi_choice",
            count: 25,
          },
          {
            questionType: "short_answer",
            count: 16,
          },
        ],
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
    expect(
      cappedRow.getByText(
        "单选题 100 题；题型建议：当前只有 1 类题型；可补充多选、判断、填空或简答，发布不受此建议阻断。",
      ),
    ).toBeInTheDocument();
    expect(
      cappedRow.getByRole("button", { name: "发布 Capped draft paper" }),
    ).toBeEnabled();

    const overLimitRow = within(
      await screen.findByTestId("paper-row-paper-draft-over-limit"),
    );
    expect(overLimitRow.getByText("题量 101/100")).toBeInTheDocument();
    expect(
      overLimitRow.getByText("发布风险：已超过 100 题上限 1 题"),
    ).toBeInTheDocument();
    expect(
      overLimitRow.getByText(
        "单选题 60 题 / 多选题 25 题 / 简答题 16 题；题型建议：已覆盖 3 类题型；发布仍以题量和分值校验为准。",
      ),
    ).toBeInTheDocument();
  });
});
