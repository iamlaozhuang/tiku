import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminPaperDetailPage } from "@/features/admin/paper-management/AdminPaperDetailPage";
import { AdminContentDetailDrawer } from "@/features/admin/question-material-management/AdminContentDetailDrawer";

function createJsonResponse(payload: unknown) {
  return Promise.resolve({
    json: async () => payload,
  }) as Promise<Response>;
}

const question = {
  publicId: "question-detail-001",
  questionType: "short_answer",
  profession: "marketing",
  level: 3,
  subject: "skill",
  stemRichText: "<p>合成题干详情</p>",
  analysisRichText: "<p>合成老师解析</p>",
  standardAnswerRichText: "<p>合成参考答案</p>",
  status: "available",
  isLocked: true,
  lockedAt: "2026-07-01T02:00:00.000Z",
  multiChoiceRule: "all_correct_only",
  scoringMethod: "ai_scoring",
  materialPublicId: "material-detail-001",
  questionOptions: [],
  scoringPoints: [{ description: "说明关键步骤", score: "5.0", sortOrder: 1 }],
  knowledgeNodePublicIds: ["knowledge-node-synthetic"],
  tagPublicIds: ["tag-synthetic"],
  createdAt: "2026-07-01T01:00:00.000Z",
  updatedAt: "2026-07-01T02:00:00.000Z",
};

const material = {
  publicId: "material-detail-001",
  title: "合成材料详情",
  contentRichText: "<p>完整合成材料正文</p>",
  profession: "marketing",
  level: 3,
  subject: "skill",
  status: "available",
  isLocked: true,
  lockedAt: "2026-07-01T02:00:00.000Z",
  references: {
    questions: [
      {
        questionPublicId: "question-detail-001",
        questionType: "short_answer",
        status: "available",
        updatedAt: "2026-07-01T02:00:00.000Z",
      },
    ],
    papers: [
      {
        paperPublicId: "paper-detail-001",
        name: "合成已发布试卷",
        paperStatus: "published",
        updatedAt: "2026-07-01T03:00:00.000Z",
      },
    ],
  },
  createdAt: "2026-07-01T01:00:00.000Z",
  updatedAt: "2026-07-01T02:00:00.000Z",
};

const paper = {
  publicId: "paper-detail-001",
  name: "合成已发布试卷",
  profession: "marketing",
  level: 3,
  subject: "skill",
  paperStatus: "published",
  paperType: "mock_paper",
  year: 2026,
  month: null,
  sourceDescription: "本地合成来源",
  sourceRegion: null,
  sourceOrganization: null,
  questionBasis: null,
  generationMethod: "manual",
  durationMinute: 90,
  totalScore: "5.0",
  publishedAt: "2026-07-01T03:00:00.000Z",
  archivedAt: null,
  questionCount: 1,
  paperSections: [
    {
      title: "第一大题",
      description: "合成大题说明",
      sortOrder: 1,
      totalScore: "5.0",
      paperQuestions: [
        {
          publicId: "paper-question-detail-001",
          sourceQuestionPublicId: question.publicId,
          paperSectionSortOrder: 1,
          questionGroupSortOrder: 1,
          score: "5.0",
          sortOrder: 1,
          questionSnapshot: {
            questionPublicId: question.publicId,
            questionStatus: "available",
            questionType: "short_answer",
            profession: "marketing",
            level: 3,
            subject: "skill",
            stemRichText: question.stemRichText,
            questionOptions: [
              {
                label: "A",
                contentRichText: "合成快照选项",
                isCorrect: true,
                sortOrder: 1,
              },
            ],
            standardAnswerRichText: question.standardAnswerRichText,
            analysisRichText: question.analysisRichText,
            multiChoiceRule: "all_correct_only",
            scoringMethod: "ai_scoring",
          },
          materialSnapshot: {
            materialPublicId: material.publicId,
            title: material.title,
            contentRichText: material.contentRichText,
            profession: "marketing",
            level: 3,
            subject: "skill",
          },
          scoringPoints: [
            { description: "说明关键步骤", score: "5.0", sortOrder: 1 },
          ],
          createdAt: "2026-07-01T02:00:00.000Z",
          updatedAt: "2026-07-01T02:00:00.000Z",
        },
      ],
    },
  ],
  questionGroups: [
    {
      title: "合成材料题组",
      materialPublicId: material.publicId,
      materialSnapshot: {
        materialPublicId: material.publicId,
        title: material.title,
        contentRichText: material.contentRichText,
        profession: "marketing",
        level: 3,
        subject: "skill",
      },
      sortOrder: 1,
    },
  ],
  createdAt: "2026-07-01T01:00:00.000Z",
  updatedAt: "2026-07-01T03:00:00.000Z",
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("content detail entries", () => {
  it("renders a published paper as a GET-only read-only detail", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        const [url] = args;
        const path = String(url);

        if (path === "/api/v1/papers/paper-detail-001") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { paper },
          });
        }

        if (path.startsWith("/api/v1/paper-assets?")) {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: [
              {
                publicId: "paper-asset-detail-001",
                paperPublicId: paper.publicId,
                paperAttachmentUsage: "paper_source",
                fileName: "synthetic-paper.pdf",
                contentType: "application/pdf",
                fileSizeByte: 1024,
                fileHash: "redacted-test-hash",
                createdAt: "2026-07-01T01:00:00.000Z",
              },
            ],
            pagination: {
              page: 1,
              pageSize: 100,
              total: 1,
              sortBy: "createdAt",
              sortOrder: "desc",
            },
          });
        }

        return createJsonResponse({
          code: 404001,
          message: "missing",
          data: null,
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPaperDetailPage publicId="paper-detail-001" />);

    expect(
      await screen.findByRole("heading", { name: "合成已发布试卷" }),
    ).toBeInTheDocument();
    expect(screen.getByText("第一大题")).toBeInTheDocument();
    expect(screen.getByText("合成题干详情")).toBeInTheDocument();
    expect(screen.getByText("合成快照选项")).toBeInTheDocument();
    expect(screen.getByText("合成参考答案")).toBeInTheDocument();
    expect(screen.getByText("说明关键步骤")).toBeInTheDocument();
    expect(screen.getByText("完整合成材料正文")).toBeInTheDocument();
    expect(screen.getByText("synthetic-paper.pdf")).toBeInTheDocument();
    expect(screen.getByText("发布时校验已完成")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "发布" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑" })).toBeNull();
    expect(
      fetchMock.mock.calls.every(
        ([, init]) => (init?.method ?? "GET") === "GET",
      ),
    ).toBe(true);
  });

  it("keeps a locked question viewable in an accessible drawer", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    const handleClose = vi.fn();
    const fetchMock = vi.fn(
      async (...args: [RequestInfo | URL, RequestInit?]) => {
        void args;

        return createJsonResponse({
          code: 0,
          message: "ok",
          data: { question },
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContentDetailDrawer
        target={{ kind: "question", publicId: question.publicId }}
        onClose={handleClose}
      />,
    );

    const drawer = await screen.findByRole("dialog", { name: "题目详情" });
    const closeButton = within(drawer).getByRole("button", {
      name: "关闭题目详情",
    });
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();
    expect(within(drawer).getByText("合成题干详情")).toBeInTheDocument();
    expect(within(drawer).getByText("合成参考答案")).toBeInTheDocument();
    expect(within(drawer).getByText("合成老师解析")).toBeInTheDocument();
    expect(within(drawer).getByText("说明关键步骤")).toBeInTheDocument();
    expect(
      within(drawer).getByText("已锁定，只能查看或复制"),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/questions/question-detail-001",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBeUndefined();
  });

  it("renders complete material content and readable available references", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({
          code: 0,
          message: "ok",
          data: { material },
        }),
      ),
    );

    render(
      <AdminContentDetailDrawer
        target={{ kind: "material", publicId: material.publicId }}
        onClose={() => undefined}
      />,
    );

    const drawer = await screen.findByRole("dialog", { name: "材料详情" });
    expect(within(drawer).getByText("完整合成材料正文")).toBeInTheDocument();
    expect(within(drawer).getByText("合成已发布试卷")).toBeInTheDocument();
    expect(within(drawer).getByText("简答题 / 可用")).toBeInTheDocument();
    expect(within(drawer).queryByText("paper-detail-001")).toBeNull();
  });

  it("distinguishes a missing paper from a generic load error", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({
          code: 404201,
          message: "Paper does not exist.",
          data: null,
        }),
      ),
    );

    render(<AdminPaperDetailPage publicId="missing-paper" />);

    expect(await screen.findByText("试卷不存在")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回试卷管理" })).toHaveAttribute(
      "href",
      "/content/papers",
    );
  });

  it("keeps paper content visible when the attachment summary request fails", async () => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url) === "/api/v1/papers/paper-detail-001") {
          return createJsonResponse({
            code: 0,
            message: "ok",
            data: { paper },
          });
        }

        throw new Error("synthetic attachment failure");
      }),
    );

    render(<AdminPaperDetailPage publicId="paper-detail-001" />);

    expect(
      await screen.findByRole("heading", { name: "合成已发布试卷" }),
    ).toBeInTheDocument();
    expect(screen.getByText("第一大题")).toBeInTheDocument();
    expect(
      screen.getByText("附件摘要暂不可用，试卷正文仍可正常查看。"),
    ).toBeInTheDocument();
  });

  it.each([
    [403621, "无权查看详情"],
    [401001, "请先登录后台"],
    [404202, "未找到内容"],
    [503202, "详情加载失败"],
  ])("renders detail state for response code %s", async (code, title) => {
    localStorage.setItem("tiku.localSessionToken", "unit-test-admin-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createJsonResponse({ code, message: "synthetic state", data: null }),
      ),
    );

    render(
      <AdminContentDetailDrawer
        target={{ kind: "material", publicId: material.publicId }}
        onClose={() => undefined}
      />,
    );

    expect(await screen.findByText(title)).toBeInTheDocument();
  });
});
