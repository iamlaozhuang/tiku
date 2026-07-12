import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PaperDraftDto } from "@/server/contracts/paper-draft-contract";
import type { QuestionDto } from "@/server/contracts/question-contract";

import { AdminPaperComposerPage } from "./AdminPaperComposerPage";
import {
  createPaperComposerValidation,
  createPaperQuestionUpdateInput,
} from "./paper-composer-model";

const paper: PaperDraftDto = {
  publicId: "paper_public_draft",
  name: "营销三级理论模拟卷",
  profession: "marketing",
  level: 3,
  subject: "theory",
  paperStatus: "draft",
  paperType: "mock_paper",
  year: 2026,
  source: null,
  durationMinute: 90,
  totalScore: "10.0",
  publishedAt: null,
  archivedAt: null,
  questionCount: 1,
  paperSections: [
    {
      title: "单项选择题",
      description: null,
      sortOrder: 1,
      totalScore: "5.0",
      paperQuestions: [
        {
          publicId: "paper_question_public_1",
          sourceQuestionPublicId: "question_public_1",
          paperSectionSortOrder: 1,
          questionGroupSortOrder: null,
          score: "5.0",
          sortOrder: 1,
          questionSnapshot: {
            questionPublicId: "question_public_1",
            questionStatus: "available",
            questionType: "single_choice",
            profession: "marketing",
            level: 3,
            subject: "theory",
            stemRichText: "<p>可读题干摘要</p>",
            questionOptions: [
              {
                label: "A",
                contentRichText: "<p>选项内容</p>",
                isCorrect: true,
                sortOrder: 1,
              },
            ],
            standardAnswerRichText: "<p>A</p>",
            analysisRichText: "<p>解析</p>",
            multiChoiceRule: "all_correct_only",
            scoringMethod: "auto_match",
          },
          materialSnapshot: null,
          scoringPoints: [],
          createdAt: "2026-07-11T00:00:00.000Z",
          updatedAt: "2026-07-11T00:00:00.000Z",
        },
      ],
    },
  ],
  questionGroups: [],
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
};

const availableQuestion: QuestionDto = {
  publicId: "question_public_available",
  questionType: "single_choice",
  profession: "marketing",
  level: 3,
  subject: "theory",
  stemRichText: "<p>待加入题目</p>",
  analysisRichText: "<p>解析</p>",
  standardAnswerRichText: "<p>A</p>",
  status: "available",
  isLocked: false,
  lockedAt: null,
  multiChoiceRule: "all_correct_only",
  scoringMethod: "auto_match",
  materialPublicId: null,
  questionOptions: [],
  scoringPoints: [],
  knowledgeNodePublicIds: [],
  tagPublicIds: [],
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
};

const materialQuestion: QuestionDto = {
  ...availableQuestion,
  publicId: "question_public_material",
  stemRichText: "<p>关联材料的题目</p>",
  materialPublicId: "material_public_missing",
};

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
  });
}

function installComposerFetch(
  paperOverride: PaperDraftDto = paper,
  questions: QuestionDto[] = [],
) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === "/api/v1/sessions") {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: {
            user: {
              adminPublicId: "admin_public",
              adminRoles: ["content_admin"],
            },
            session: { expiresAt: "2026-07-12T00:00:00.000Z" },
          },
        });
      }

      if (
        url === `/api/v1/papers/${paperOverride.publicId}` &&
        (init?.method ?? "GET") === "GET"
      ) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { paper: paperOverride },
        });
      }

      if (url.startsWith("/api/v1/questions?")) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: { questions },
          pagination: {
            page: 1,
            pageSize: 20,
            total: questions.length,
            sortBy: "updatedAt",
            sortOrder: "desc",
          },
        });
      }

      if (url === "/api/v1/materials/material_public_missing") {
        return jsonResponse({
          code: 503001,
          message: "unavailable",
          data: null,
        });
      }

      if (
        url === `/api/v1/papers/${paperOverride.publicId}/questions` &&
        init?.method === "POST"
      ) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: {
            paperQuestion: paperOverride.paperSections[0].paperQuestions[0],
          },
        });
      }

      if (
        url ===
          `/api/v1/papers/${paperOverride.publicId}/questions/paper_question_public_1` &&
        init?.method === "PATCH"
      ) {
        return jsonResponse({
          code: 0,
          message: "ok",
          data: {
            paperQuestion: paperOverride.paperSections[0].paperQuestions[0],
          },
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("paper composer model", () => {
  it("separates publish blockers from non-blocking scope warnings", () => {
    const validation = createPaperComposerValidation({
      ...paper,
      totalScore: "10.0",
    });

    expect(validation.blockers.map((item) => item.code)).toEqual([
      "paper_total_score_mismatch",
    ]);
    expect(validation.warnings).toEqual([]);
  });

  it("creates a snapshot-safe draft update payload with a target paper_section", () => {
    expect(
      createPaperQuestionUpdateInput({
        score: "5.0",
        sortOrder: 2,
        scoringPoints: [],
        paperSection: {
          title: "综合应用",
          description: null,
          sortOrder: 2,
        },
      }),
    ).toEqual({
      score: "5.0",
      sortOrder: 2,
      scoringPoints: [],
      paperSection: {
        title: "综合应用",
        description: null,
        sortOrder: 2,
      },
    });
  });

  it("reports paper-scoped scoring blockers and non-blocking source warnings", () => {
    const subjectivePaper: PaperDraftDto = {
      ...paper,
      totalScore: "5.0",
      paperSections: [
        {
          ...paper.paperSections[0],
          totalScore: "5.0",
          paperQuestions: [
            {
              ...paper.paperSections[0].paperQuestions[0],
              score: "5.0",
              questionSnapshot: {
                ...paper.paperSections[0].paperQuestions[0].questionSnapshot,
                questionStatus: "disabled",
                questionType: "short_answer",
                profession: "logistics",
              },
              scoringPoints: [
                { description: "要点", score: "4.0", sortOrder: 1 },
              ],
              materialSnapshot: {
                materialPublicId: "material_public_1",
                title: "案例材料",
                contentRichText: "<p>材料</p>",
                profession: "logistics",
                level: 3,
                subject: "theory",
              },
            },
          ],
        },
      ],
    };

    const validation = createPaperComposerValidation(subjectivePaper);

    expect(validation.blockers.map((item) => item.code)).toContain(
      "scoring_point_total_mismatch",
    );
    expect(validation.warnings.map((item) => item.code)).toEqual([
      "source_reference_unresolved",
      "source_reference_unresolved",
    ]);
  });
});

describe("AdminPaperComposerPage", () => {
  it("renders a dedicated scoped workbench without identifier-entry controls", async () => {
    localStorage.setItem("tiku.localSessionToken", "test-session");
    const fetchMock = installComposerFetch();

    render(<AdminPaperComposerPage paperPublicId={paper.publicId} />);

    expect(screen.getByText("正在加载组卷工作台")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: paper.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "单项选择题" }),
    ).toBeInTheDocument();
    expect(screen.getByText("可读题干摘要")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "从题库选题" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "按材料选题" })).toBeEnabled();
    expect(screen.queryByLabelText("题目业务标识")).toBeNull();
    expect(screen.queryByText(paper.publicId)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "从题库选题" }));
    expect(
      await screen.findByRole("dialog", { name: "选择题目" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) => {
          const url = String(input);
          return (
            url.startsWith("/api/v1/questions?") &&
            url.includes("profession=marketing") &&
            url.includes("level=3") &&
            url.includes("subject=theory") &&
            url.includes("status=available")
          );
        }),
      ).toBe(true);
    });
  });

  it("keeps published paper content read-only", async () => {
    localStorage.setItem("tiku.localSessionToken", "test-session");
    installComposerFetch({
      ...paper,
      paperStatus: "published",
      publishedAt: "2026-07-11T01:00:00.000Z",
    });

    render(<AdminPaperComposerPage paperPublicId={paper.publicId} />);

    expect(
      await screen.findByRole("heading", { name: paper.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(/已发布，只读查看/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "从题库选题" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑题目设置" })).toBeNull();
  });

  it("adds a selected question without asking for a public identifier", async () => {
    localStorage.setItem("tiku.localSessionToken", "test-session");
    const fetchMock = installComposerFetch(paper, [availableQuestion]);

    render(<AdminPaperComposerPage paperPublicId={paper.publicId} />);
    await screen.findByRole("heading", { name: paper.name });
    fireEvent.click(screen.getByRole("button", { name: "从题库选题" }));
    fireEvent.click(await screen.findByRole("button", { name: /待加入题目/ }));
    fireEvent.click(screen.getByRole("button", { name: "加入试卷" }));

    await waitFor(() => {
      const addCall = fetchMock.mock.calls.find(
        ([input, init]) =>
          String(input) === `/api/v1/papers/${paper.publicId}/questions` &&
          init?.method === "POST",
      );
      expect(addCall).toBeDefined();
      expect(JSON.parse(String(addCall?.[1]?.body))).toMatchObject({
        questionPublicId: availableQuestion.publicId,
        score: "5.0",
        paperSection: { title: "单项选择题", sortOrder: 1 },
        questionGroup: null,
      });
    });
    expect(screen.queryByLabelText("题目业务标识")).toBeNull();
  });

  it("updates paper-scoped settings through PATCH with the target paper_section", async () => {
    localStorage.setItem("tiku.localSessionToken", "test-session");
    const fetchMock = installComposerFetch();

    render(<AdminPaperComposerPage paperPublicId={paper.publicId} />);
    await screen.findByRole("heading", { name: paper.name });
    fireEvent.click(screen.getByRole("button", { name: "编辑题目设置" }));
    fireEvent.change(screen.getByLabelText("题目分值"), {
      target: { value: "4.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存设置" }));

    await waitFor(() => {
      const updateCall = fetchMock.mock.calls.find(
        ([input, init]) =>
          String(input).endsWith("/questions/paper_question_public_1") &&
          init?.method === "PATCH",
      );
      expect(updateCall).toBeDefined();
      expect(JSON.parse(String(updateCall?.[1]?.body))).toMatchObject({
        score: "4.5",
        sortOrder: 1,
        paperSection: { title: "单项选择题", sortOrder: 1 },
      });
    });
  });

  it("blocks a material-linked question when its material cannot be resolved", async () => {
    localStorage.setItem("tiku.localSessionToken", "test-session");
    const fetchMock = installComposerFetch(paper, [materialQuestion]);

    render(<AdminPaperComposerPage paperPublicId={paper.publicId} />);
    await screen.findByRole("heading", { name: paper.name });
    fireEvent.click(screen.getByRole("button", { name: "从题库选题" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /关联材料的题目/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "加入试卷" }));

    expect(await screen.findByRole("alert", { name: "" })).toHaveTextContent(
      "关联材料加载失败",
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === `/api/v1/papers/${paper.publicId}/questions` &&
          init?.method === "POST",
      ),
    ).toBe(false);
  });
});
