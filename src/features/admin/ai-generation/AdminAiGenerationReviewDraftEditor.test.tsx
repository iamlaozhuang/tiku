import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminAiGenerationReviewDraftEditor } from "./AdminAiGenerationReviewDraftEditor";

const resultPublicId = "admin-ai-generation-result-review-editor-001";
const reviewDraftPath = `/api/v1/content-ai-generation-results/${resultPublicId}/review-drafts`;
const questionDraft = {
  questionType: "single_choice" as const,
  profession: "marketing" as const,
  level: 3,
  subject: "theory" as const,
  difficulty: "medium" as const,
  stemRichText: "原始题干",
  analysisRichText: "原始解析",
  standardAnswerRichText: "A",
  multiChoiceRule: "all_correct_only" as const,
  scoringMethod: "auto_match" as const,
  materialPublicId: null,
  questionOptions: [
    {
      label: "A",
      contentRichText: "正确选项",
      isCorrect: true,
      sortOrder: 1,
    },
  ],
  scoringPoints: [],
  fillBlankAnswers: [],
  knowledgeNodePublicIds: ["knowledge-node-public-001"],
  tagPublicIds: [],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AdminAiGenerationReviewDraftEditor", () => {
  it("loads the server revision and saves structured edits against its exact predecessor", async () => {
    const onRevisionChange = vi.fn();
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        expect(body).toEqual({
          expectedRevision: 1,
          expectedDraftDigest:
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          targetType: "question",
          reviewedDraft: {
            ...questionDraft,
            stemRichText: "修订后的题干",
          },
        });
        expect(body).not.toHaveProperty("ownerPublicId");
        expect(body).not.toHaveProperty("sourceContentDigest");

        return Response.json({
          code: 0,
          message: "ok",
          data: {
            status: "versioned",
            resultPublicId,
            sourceContentDigest:
              "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            targetType: "question",
            currentRevision: 2,
            currentDraftPublicId: "review-draft-public-002",
            currentDraftDigest:
              "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            reviewedDraft: {
              ...questionDraft,
              stemRichText: "修订后的题干",
            },
            citationStatus: "available",
            citationSources: [
              {
                resourceTitle: "营销教材",
                headingPath: ["第三章", "客户分析"],
              },
            ],
            redactionStatus: "redacted",
          },
        });
      }

      return Response.json({
        code: 0,
        message: "ok",
        data: {
          status: "versioned",
          resultPublicId,
          sourceContentDigest:
            "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          targetType: "question",
          currentRevision: 1,
          currentDraftPublicId: "review-draft-public-001",
          currentDraftDigest:
            "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          reviewedDraft: questionDraft,
          citationStatus: "available",
          citationSources: [
            {
              resourceTitle: "营销教材",
              headingPath: ["第三章", "客户分析"],
            },
          ],
          redactionStatus: "redacted",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminAiGenerationReviewDraftEditor
        resultPublicId={resultPublicId}
        targetType="question"
        onRevisionChange={onRevisionChange}
      />,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "打开评审草稿" }));

    const stem = await screen.findByRole("textbox", { name: "题干" });
    expect(stem).toHaveValue("原始题干");
    expect(screen.getByText("当前修订：1")).toBeInTheDocument();
    expect(screen.getByText("营销教材")).toBeInTheDocument();
    expect(screen.getByText("第三章 > 客户分析")).toBeInTheDocument();
    fireEvent.change(stem, { target: { value: "修订后的题干" } });
    expect(onRevisionChange).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "保存新修订" }));

    await waitFor(() =>
      expect(screen.getByText("当前修订：2")).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      reviewDraftPath,
      expect.objectContaining({ method: "PUT" }),
    );
    expect(onRevisionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRevision: 2,
        currentDraftDigest:
          "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      }),
    );
  });

  it("reports legacy citation detail unavailable without inventing a source", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          code: 0,
          message: "ok",
          data: {
            status: "versioned",
            resultPublicId,
            sourceContentDigest:
              "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            targetType: "question",
            currentRevision: 1,
            currentDraftPublicId: "review-draft-public-001",
            currentDraftDigest:
              "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            reviewedDraft: questionDraft,
            citationStatus: "legacy_unavailable",
            citationSources: null,
            redactionStatus: "redacted",
          },
        }),
      ),
    );

    render(
      <AdminAiGenerationReviewDraftEditor
        resultPublicId={resultPublicId}
        targetType="question"
        onRevisionChange={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "打开评审草稿" }));

    expect(
      await screen.findByText("该历史结果没有可验证的引用来源快照。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("营销教材")).not.toBeInTheDocument();
  });

  it("fails closed on a stale revision and requires an explicit reload", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          code: 0,
          message: "ok",
          data: {
            status: "versioned",
            resultPublicId,
            sourceContentDigest:
              "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            targetType: "question",
            currentRevision: 1,
            currentDraftPublicId: "review-draft-public-001",
            currentDraftDigest:
              "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            reviewedDraft: questionDraft,
            redactionStatus: "redacted",
          },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          code: 409018,
          message: "revision conflict",
          data: null,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminAiGenerationReviewDraftEditor
        resultPublicId={resultPublicId}
        targetType="question"
        onRevisionChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开评审草稿" }));
    await screen.findByRole("textbox", { name: "题干" });
    fireEvent.click(screen.getByRole("button", { name: "保存新修订" }));

    expect(
      await screen.findByText("服务器修订已变化，请重新加载后再编辑。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "重新加载评审草稿" }),
    ).toBeEnabled();
  });
});
